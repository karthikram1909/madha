import React, { useState, useEffect, lazy, Suspense } from "react";
import { base44 } from '@/api/base44Client';
import { subDays, format, isAfter } from 'date-fns';

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";

// Lazy load non-critical components for better performance
const RecentActivity = lazy(() => import("../components/dashboard/RecentActivity"));
const QuickActions = lazy(() => import("../components/dashboard/QuickActions"));
const RevenueChart = lazy(() => import("../components/dashboard/RevenueChart"));

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    activeSubscriptions: 0,
    pendingTickets: 0,
    livePrograms: 0,
    pendingPrayers: 0,
    todayRevenue: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      if (!currentUser) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      
      setUser(currentUser);
      
      if (!['admin', 'superadmin'].includes(currentUser.role)) {
        setIsLoading(false);
        return;
      }
      
      await loadDashboardData();
    } catch (error) {
      console.error("Dashboard authentication error:", error);
      base44.auth.redirectToLogin(window.location.pathname);
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = (bookings) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));
    const data = last7Days.map(date => {
      const dateString = format(date, 'MMM d');
      
      const dailyBookings = bookings
        .filter(b => b.created_date?.startsWith(format(date, 'yyyy-MM-dd')) && b.payment_status === 'completed')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
        
      return {
        name: dateString,
        Bookings: dailyBookings,
        Total: dailyBookings
      };
    }).reverse();
    
    setChartData(data);
  };
  
  const loadDashboardData = async () => {
    try {
      const sevenDaysAgo = subDays(new Date(), 7);
      const today = new Date().toISOString().split('T')[0];
      
      // Use base44 SDK to fetch all entities to avoid any entity import issues
      const [bookings, tickets, programs, prayers, auditLogs] = await Promise.all([
        base44.entities.ServiceBooking.list('-created_date').catch(e => { console.error('Bookings error:', e); return []; }),
        base44.entities.SupportTicket.list('-created_date').catch(e => { console.error('Tickets error:', e); return []; }),
        base44.entities.Program.list('-created_date').catch(e => { console.error('Programs error:', e); return []; }),
        base44.entities.PrayerRequest.list('-created_date').catch(e => { console.error('Prayers error:', e); return []; }),
        base44.entities.AuditLog.list('-created_date', 10).catch(e => { console.error('Audit logs error:', e); return []; })
      ]);

      const todayRevenue = bookings
        .filter(b => b.created_date?.startsWith(today) && b.payment_status === 'completed')
        .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

      const uniqueUsers = new Set(bookings.map(b => b.user_id).filter(Boolean));

      setStats({
        totalUsers: uniqueUsers.size,
        totalBookings: bookings.length,
        activeSubscriptions: 0,
        pendingTickets: tickets.filter(t => t.status === 'open').length,
        livePrograms: programs.filter(p => p.status === 'live').length,
        pendingPrayers: prayers.filter(p => p.status === 'pending').length,
        todayRevenue
      });

      const recentBookings = bookings.filter(b => 
        b.created_date && isAfter(new Date(b.created_date), sevenDaysAgo)
      );
      processChartData(recentBookings);

      const activities = [
        ...bookings.slice(0, 5).map(b => ({
          type: 'booking',
          title: `New ${(b.service_type || 'service').replace('_', ' ')} booking`,
          subtitle: `by ${b.beneficiary_name || 'Unknown'}`,
          time: b.created_date,
          status: b.status || 'pending',
          amount: b.amount
        })),
        ...tickets.slice(0, 3).map(t => ({
          type: 'ticket',
          title: `Support ticket: ${t.subject || 'No subject'}`,
          subtitle: `from user`,
          time: t.created_date,
          status: t.status || 'open'
        })),
        ...auditLogs.slice(0, 4).map(log => ({
          type: 'audit',
          title: log.action || 'Action',
          subtitle: `by ${log.admin_user_email || 'Admin'}`,
          time: log.created_date
        }))
      ]
      .filter(a => a.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error in loadDashboardData:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h2>
          <p className="text-slate-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <DashboardHeader />
      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-24 relative z-10">
        <DashboardStats stats={stats} isLoading={false} />

        <Suspense fallback={<div className="grid lg:grid-cols-3 gap-6 mb-8 mt-8"><div className="lg:col-span-2 h-96 bg-white rounded-lg animate-pulse"></div><div className="h-96 bg-white rounded-lg animate-pulse"></div></div>}>
          <div className="grid lg:grid-cols-3 gap-6 mb-8 mt-8">
            <div className="lg:col-span-2">
              <RevenueChart data={chartData} isLoading={false} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="mb-8 h-96 bg-white rounded-lg animate-pulse"></div>}>
          <div className="mb-8">
            <RecentActivity activities={recentActivity} isLoading={false} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}