
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Tv,
  HeadphonesIcon,
  Settings,
  Shield,
  Image as ImageIcon,
  CalendarDays,
  Globe,
  Newspaper,
  MessageSquare,
  History,
  BarChart3,
  Terminal,
  Edit,
  Book as BookIcon,
  Bot,
  Home,
  ListChecks,
  Mail as MailIcon,
  HeartHandshake,
  Video,
  CreditCard,
  ExternalLink,
  LogOut,
  Receipt,
  Sparkles,
  Database,
} from "lucide-react";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import FloatingUI from "../components/website/FloatingUI";
import StickyNavbar from "../components/website/StickyNavbar";
import { GlobalDataProvider, useGlobalData } from '@/components/GlobalDataProvider';
import { base44 } from '@/api/base44Client';

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    group: "main",
    roles: ["admin"]
  },
  {
    title: "Service Bookings",
    url: createPageUrl("ServiceBookings"),
    icon: Calendar,
    group: "main",
    roles: ["admin", "moderator"]
  },
  {
    title: "Fix TRN Numbers",
    url: createPageUrl("FixTRNNumbers"),
    icon: Terminal,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "SQL File Migration",
    url: createPageUrl("SQLFileMigration"),
    icon: Terminal,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "Booking Calendar",
    url: createPageUrl("BookingCalendar"),
    icon: CalendarDays,
    group: "main",
    roles: ["admin", "user"]
  },
  {
    title: "Blocked Service Dates",
    url: createPageUrl("BlockedServiceDates"),
    icon: CalendarDays,
    group: "content",
    roles: ["admin"]
  },
  {
    title: "Prayer Requests",
    url: createPageUrl("PrayerRequestsAdmin"),
    icon: HeartHandshake,
    group: "main",
    roles: ["admin", "moderator"]
  },
  {
    title: "User Management",
    url: createPageUrl("UserManagement"),
    icon: Users,
    group: "content",
    roles: ["admin", "superadmin"]
  },
  {
    title: "User Migration Panel",
    url: createPageUrl("UserMigrationPanel"),
    icon: Users,
    group: "main",
    roles: ["admin"]
  },
  {
    title: "MySQL User Migration",
    url: createPageUrl("MySQLUserMigration"),
    icon: Database,
    group: "main",
    roles: ["admin"]
  },
  {
    title: "Batch User Linking",
    url: createPageUrl("BatchUserLinker"),
    icon: Users,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "User Data Verification",
    url: createPageUrl("UserDataVerification"),
    icon: Shield,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "Support Tickets",
    url: createPageUrl("SupportTickets"),
    icon: HeadphonesIcon,
    group: "content",
    roles: ["admin", "moderator"]
  },
  {
    title: "Invoice List",
    url: createPageUrl("AdminInvoiceList"),
    icon: Receipt,
    group: "billing",
    roles: ["admin"]
  },
  {
    title: "Missed Payments",
    url: createPageUrl("MissedPayments"),
    icon: CreditCard,
    group: "payments",
    roles: ["admin"]
  },
  {
    title: "Payment Logs",
    url: createPageUrl("PaymentLogs"),
    icon: FileText,
    group: "payments",
    roles: ["admin"]
  },
  {
    title: "Recovery History",
    url: createPageUrl("RecoveryHistory"),
    icon: History,
    group: "payments",
    roles: ["admin"]
  },
  {
    title: "Program Schedule",
    url: createPageUrl("ProgramSchedule"),
    icon: Tv,
    group: "main",
    roles: ["admin"]
  },
  {
    title: "Upload Program Images",
    url: createPageUrl("ProgramImageUpload"),
    icon: ImageIcon,
    group: "main",
    roles: ["admin"]
  },
  {
    title: "Books Management",
    url: createPageUrl("AdminBooks"),
    icon: BookIcon,
    group: "main",
    roles: ["admin"]
  },
  {
    title: "Book Orders",
    url: createPageUrl("BookOrders"),
    icon: BookIcon,
    group: "main",
    roles: ["admin"]
  },
  {
    title: "Homepage Hero",
    url: createPageUrl("HomepageHeroManager"),
    icon: Home,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Our Services",
    url: createPageUrl("HomepageServicesManager"),
    icon: ListChecks,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Shows by Category",
    url: createPageUrl("ShowCategoriesManager"),
    icon: Tv,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Testimonials",
    url: createPageUrl("TestimonialsManager"),
    icon: MessageSquare,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Video Testimonials",
    url: createPageUrl("VideoTestimonialsManager"),
    icon: Video,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Testimonial Promo",
    url: createPageUrl("TestimonialPromoVideo"),
    icon: Video,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Gallery Manager",
    url: createPageUrl("GalleryManager"),
    icon: ImageIcon,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Newsletter",
    url: createPageUrl("Newsletter"),
    icon: Newspaper,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Feedback",
    url: createPageUrl("Feedback"),
    icon: MessageSquare,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Footer Manager",
    url: createPageUrl("FooterManager"),
    icon: Edit,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Festive Theme",
    url: createPageUrl("FestiveThemeManager"),
    icon: Sparkles,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Floating Icons",
    url: createPageUrl("FloatingUIManager"),
    icon: MessageSquare,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "Public Website",
    url: createPageUrl("Home"),
    icon: Globe,
    group: "website",
    roles: ["admin"]
  },
  {
    title: "AI Chatbot",
    url: createPageUrl("ChatbotManager"),
    icon: Bot,
    group: "system",
    roles: ["admin"]
  },
  {
    title: "Audit Log",
    url: createPageUrl("AuditLog"),
    icon: History,
    group: "system",
    roles: ["admin"]
  },
  {
    title: "Email Logs",
    url: createPageUrl("EmailLogs"),
    icon: MailIcon,
    group: "system",
    roles: ["admin"]
  },
  {
    title: "Website Content",
    url: createPageUrl("WebsiteContentManager"),
    icon: Edit,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "Content Templates",
    url: createPageUrl("ContentTemplates"),
    icon: FileText,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "API Generator",
    url: createPageUrl("ApiGenerator"),
    icon: Terminal,
    group: "advanced",
    roles: ["admin"]
  },
  {
    title: "Analytics",
    url: createPageUrl("AnalyticsDashboard"),
    icon: BarChart3,
    group: "system",
    roles: ["admin"]
  }
];

const navigationGroups = {
  main: "MAIN",
  billing: "BILLING",
  payments: "PAYMENT MONITORING",
  content: "CONTENT MANAGEMENT",
  website: "WEBSITE MANAGEMENT",
  system: "SYSTEM & LOGS",
  advanced: "ADVANCED SETTINGS"
};

const InnerLayout = ({ children, currentPageName }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { contentMap, user } = useGlobalData();

  const websiteTheme = {
    primaryColor: contentMap.theme?.primary_color?.value || "#B71C1C",
    secondaryColor: contentMap.theme?.secondary_color?.value || "#D32F2F"
  };
  const logoUrl = contentMap.navigation?.logo_url?.value || '';

  const rawFloatingUIContent = contentMap.floating_ui || {};
  const floatingUIContent = Object.keys(rawFloatingUIContent).reduce((acc, key) => {
    if (rawFloatingUIContent[key] && rawFloatingUIContent[key].is_active) {
      acc[key] = rawFloatingUIContent[key].value;
    }
    return acc;
  }, {});

  const isUserPanelPage = [
    'UserDashboard',
    'UserBuyBooks',
    'UserBookServices',
    'UserBookService',
    'UserBookingHistory',
    'UserBookingCalendar',
    'UserActivityLog',
    'Invoice',
    'UserProgramSchedule',
    'UserSupportTickets',
    'UserProfileSettings',
    'UserInvoices',
    'UserPrayerRequests'
  ].includes(currentPageName);

  if (isUserPanelPage) {
    return <>{children}</>;
  }

  if (currentPageName === 'Home') {
    return (
      <>
        {children}
        <FloatingUI content={floatingUIContent} />
      </>
    );
  }
const isPublicPage = [
  'Home',
  'LiveTV',
  'BuyBooks',
  'BookService',
  'Donate',
  'Gallery',
  'NewsletterSignup',
  'FeedbackForm',
  'About',
  'Contact',
  'Reach',
  'Schedule',
  'Shows',
  'TermsAndConditions',
  'PrivacyPolicy',
  'FireTV',
  'PlaystoreTV',
  'OAuthCallback',
  'PrayerRequest'
].includes(currentPageName);


  

  if (isPublicPage) {
    return (
      <div style={{
        '--primary-color': websiteTheme.primaryColor,
        '--secondary-color': websiteTheme.secondaryColor
      }}>
        <style>{`
          :root {
            --primary-color: ${websiteTheme.primaryColor};
            --secondary-color: ${websiteTheme.secondaryColor};
          }
        `}</style>
        <div className="min-h-screen bg-slate-50">
          <StickyNavbar />
          {children}
        </div>
        <FloatingUI content={floatingUIContent} />
      </div>
    );
  }

  const getFilteredNavigationItems = () => {
    if (!user) return navigationItems;
    return navigationItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  };

  const filteredNavigationItems = getFilteredNavigationItems();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <style>{`
          :root {
            --primary-color: ${websiteTheme.primaryColor};
            --secondary-color: ${websiteTheme.primaryColor};
          }
        `}</style>

        <Sidebar className="border-r border-slate-200 bg-white shadow-xl hidden md:block w-64" >
          <SidebarHeader className="border-b border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Madha TV Admin"
                  className="h-12 w-auto"
                />
              ) : (
                <div className="text-[#B71C1C] text-2xl font-bold">
                  Madha TV
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            {Object.entries(navigationGroups).map(([groupKey, groupLabel]) => {
              const groupItems = filteredNavigationItems.filter(item => item.group === groupKey);
              if (groupItems.length === 0) return null;

              return (
                <SidebarGroup key={groupKey} className="mb-6">
                  <SidebarGroupLabel className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-1">
                    {groupLabel}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {groupItems.map((item) => (
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
              );
            })}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-3 bg-white">
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
                    {user?.full_name || 'Admin User'}
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

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-slate-900">Madha TV Admin Panel</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default function Layout({ children, currentPageName }) {
  return (
    <GlobalDataProvider>
      <InnerLayout currentPageName={currentPageName}>
        {children}
      </InnerLayout>
    </GlobalDataProvider>
  );
}
