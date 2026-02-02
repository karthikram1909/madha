import React, { useState, useEffect } from 'react';

import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Heart,
  FileText,
  Tv,
  MessageSquare,
  User as UserIcon,
  ExternalLink,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const mainNavigationItems = [
  {
    title: 'Dashboard',
    url: createPageUrl('UserDashboard'),
    icon: LayoutDashboard,
  },
  {
    title: 'Buy Books',
    url:'https://secure.madhatv.in/index.php/admin-v2/booksindia',
    icon: BookOpen,
  },
  {
    title: 'Book a Service',
    url: createPageUrl('UserBookServices'),
    icon: Calendar,
  },
  {
    title: 'Booking Calendar',
    url: createPageUrl('UserBookingCalendar'),
    icon: Calendar,
  },
  {
    title: 'My Prayer Requests',
    url: createPageUrl('UserPrayerRequests'),
    icon: Heart,
  },
];

const accountSupportItems = [
  {
    title: 'Invoices',
    url: createPageUrl('UserInvoices'),
    icon: FileText,
  },
  {
    title: 'Program Schedule',
    url: createPageUrl('UserProgramSchedule'),
    icon: Tv,
  },
  {
    title: 'Support Tickets',
    url: createPageUrl('UserSupportTickets'),
    icon: MessageSquare,
  },
  {
    title: 'My Profile',
    url: createPageUrl('UserProfileSettings'),
    icon: UserIcon,
  },
];



export default function UserDashboardSidebar({ user, logoUrl, onLogout, isMobile = false }) {
  const location = useLocation();

const [localUser, setLocalUser] = useState(null);
useEffect(() => {
  const syncUser = () => {
    setLocalUser({
      full_name: localStorage.getItem("user_name"),
      email: localStorage.getItem("user_email"),
    });
  };

  syncUser(); // 🔥 initial load
  window.addEventListener("authChanged", syncUser);

  return () => window.removeEventListener("authChanged", syncUser);
}, []);

useEffect(() => {
  if (!user) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      setLocalUser({
        full_name: localStorage.getItem("user_name"),
        email: localStorage.getItem("user_email"),
      });
    }
  }
}, [user]);

const finalUser = {
  full_name:
    user?.full_name ||
    localUser?.full_name ||
    localStorage.getItem("user_name") ||
    "User",

  email:
    user?.email ||
    localUser?.email ||
    localStorage.getItem("user_email") ||
    "",
};




const getInitials = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};


const navigate = useNavigate();

const handleLogout = () => {
  // 🔥 clear auth data
  localStorage.clear();

  // 🔔 notify other components
  window.dispatchEvent(new Event("authChanged"));

  // 🚀 redirect to login
  navigate(createPageUrl("Login"));
};

  

  return (
    <Sidebar className={`border-r border-slate-200 bg-white shadow-xl w-64 ${isMobile ? '' : 'hidden md:block'}`}>
      <SidebarHeader className="border-b border-slate-200 p-4 bg-white">
        <Link to={createPageUrl('Home')} className="flex items-center justify-center">
          {logoUrl ? (
            <img
              src="/logo.png"
              alt="Madha TV"
              className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="text-[#B71C1C] text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity">
              Madha TV
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-md transition-all duration-200 ${
                      location.pathname === item.url
                        ? 'bg-[#B71C1C] text-white hover:bg-[#8B0000]'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account & Support Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-1">
            Account & Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {accountSupportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-md transition-all duration-200 ${
                      location.pathname === item.url
                        ? 'bg-[#B71C1C] text-white hover:bg-[#8B0000]'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-3 bg-white">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-[#B71C1C] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {getInitials(finalUser?.full_name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm truncate">
                {finalUser?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">{finalUser?.email_id ||''}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Link to={createPageUrl('Home')} className="w-full">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-slate-50 text-slate-700 border-slate-300"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start hover:bg-red-50 hover:text-[#B71C1C] hover:border-[#B71C1C] text-slate-700 border-slate-300"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}