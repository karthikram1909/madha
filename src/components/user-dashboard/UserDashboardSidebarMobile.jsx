import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';

const mainNavigationItems = [
  {
    title: 'Dashboard',
    url: createPageUrl('UserDashboard'),
    icon: LayoutDashboard,
  },
  {
    title: 'Buy Books',
    url: createPageUrl('UserBuyBooks'),
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

export default function UserDashboardSidebarMobile({ user, logoUrl, onLogout }) {
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 bg-white">
        <div className="flex items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Madha TV"
              className="h-12 w-auto"
            />
          ) : (
            <div className="text-[#B71C1C] text-2xl font-bold">
              Madha TV
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1 mb-6">
          {mainNavigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                location.pathname === item.url
                  ? 'bg-[#B71C1C] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          ))}
        </div>

        {/* Account & Support Section */}
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-1">
            Account & Support
          </div>
          <div className="space-y-1">
            {accountSupportItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                  location.pathname === item.url
                    ? 'bg-[#B71C1C] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3 bg-white">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-[#B71C1C] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {getInitials(user?.full_name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
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
              onClick={onLogout}
              variant="outline"
              className="w-full justify-start hover:bg-red-50 hover:text-[#B71C1C] hover:border-[#B71C1C] text-slate-700 border-slate-300"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}