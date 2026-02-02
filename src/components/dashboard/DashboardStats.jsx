import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  HeadphonesIcon, 
  Tv, 
  Clock,
  TrendingUp 
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, index, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-slate-900 group-hover:text-[#B71C1C] transition-colors">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
          </div>
          <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardStats({ stats, isLoading }) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    // DONATIONS STATS HIDDEN
    // {
    //   title: "Total Donations",
    //   value: stats.totalDonations,
    //   icon: DollarSign,
    //   color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    // },
    // {
    //   title: "Active Subscriptions",
    //   value: stats.activeSubscriptions,
    //   icon: Heart,
    //   color: "bg-gradient-to-br from-pink-500 to-pink-600"
    // },
    {
      title: "Pending Tickets",
      value: stats.pendingTickets,
      icon: HeadphonesIcon,
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      title: "Live Programs",
      value: stats.livePrograms,
      icon: Tv,
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Pending Prayers",
      value: stats.pendingPrayers,
      icon: Clock,
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue?.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-gradient-to-br from-red-500 to-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <StatCard 
          key={stat.title} 
          {...stat} 
          index={index} 
          isLoading={isLoading} 
        />
      ))}
    </div>
  );
}