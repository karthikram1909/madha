import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import UserDashboardSidebar from './UserDashboardSidebar';
import UserDashboardSidebarMobile from './UserDashboardSidebarMobile';
import ProfileCompletionReminder from './ProfileCompletionReminder';
import { Button } from '@/components/ui/button';
import { Menu, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useGlobalData } from '@/components/GlobalDataProvider';
import { base44 } from '@/api/base44Client';


export default function UserDashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user } = useGlobalData();
  const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/b8cacc3d3_nlogo.png';
  const [isLinking, setIsLinking] = useState(true); 

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const linkUserToAppUser = async () => {
      try {
        if (!user) {
          setIsLinking(false);
          return;
        }

        console.log('🔗 Auto-linking legacy user data...');

        // Call backend function to handle all linking logic
        const response = await base44.functions.invoke('linkLegacyUser');
        
        if (response.data.success && response.data.linked && !response.data.already_linked) {
          console.log('✅ Legacy profile linked successfully');
          console.log('🔄 Reloading to reflect changes...');
          
          // Reload page to show updated data
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else if (response.data.already_linked) {
          console.log('✅ Profile already linked');
        } else {
          console.log('ℹ️ No legacy profile found to link');
        }
      } catch (error) {
        console.error('❌ Error linking legacy user:', error);
      }
      setIsLinking(false);
    };

    linkUserToAppUser();
  }, [user]);

  if (isLinking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <UserDashboardSidebar 
            user={user} 
            logoUrl={logoUrl} 
            onLogout={handleLogout} 
          />
        </div>

        <main className="flex-1 flex flex-col w-full md:w-auto">
          {/* Mobile Header - Only visible on mobile */}
          <header className="bg-white border-b border-slate-200 px-4 py-3 md:hidden shadow-sm sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-white overflow-y-auto">
                  <UserDashboardSidebarMobile
                    user={user}
                    logoUrl={logoUrl}
                    onLogout={handleLogout}
                  />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-2">
                {logoUrl && (
                  <img src={logoUrl} alt="Madha TV" className="h-8 w-auto" />
                )}
                <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
              </div>
              
              <div className="w-10"></div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <ProfileCompletionReminder user={user} />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}