import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import AutoLocationDetector from '../components/user-dashboard/AutoLocationDetector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceBooking, UserActivityLog } from '@/api/entities';
import { base44 } from '@/api/base44Client';
import {
    Calendar,
    Clock,
    BookOpen,
    History,
    User as UserIcon,
    Loader2,
    ArrowRight,
    CheckCircle,
    Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isAfter, parseISO } from 'date-fns';

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [stats, setStats] = useState({
        totalBookings: 0,
        upcomingServices: 0,
        completedBookings: 0
    });
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');
    const [showLocationDetector, setShowLocationDetector] = useState(false);
   const [userName, setUserName] = useState("User");

 useEffect(() => {
  const storedName = localStorage.getItem("user_name");
  if (storedName) {
    setUserName(storedName);
  }
}, []);



    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };

        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);

        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        setIsLoading(true);
        try {
            const isAuthenticated = await base44.auth.isAuthenticated();
            if (!isAuthenticated) {
                base44.auth.redirectToLogin(window.location.pathname);
                return;
            }

            const currentUser = await base44.auth.me();
            setUser(currentUser);

            // Check if user needs location detection
            const needsLocation = !currentUser?.country || !currentUser?.state;
            setShowLocationDetector(needsLocation);

            await loadDashboardData(currentUser);
        } catch (error) {
            console.error('Authentication failed:', error);
            base44.auth.redirectToLogin(window.location.pathname);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDashboardData = async (currentUser) => {
        try {
            const [bookings, activityLogs] = await Promise.all([
                ServiceBooking.filter({ user_id: currentUser.id }, '-created_date', 5),
                UserActivityLog.filter({ user_email: currentUser.email }, '-created_date', 5)
            ]);

            setRecentBookings(bookings || []);
            setRecentActivity(activityLogs || []);

            const allBookings = await ServiceBooking.filter({ user_id: currentUser.id });
            const completed = allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
            const upcoming = allBookings.filter(b => {
                if (!b.booking_date) return false;
                const bookingDate = parseISO(b.booking_date);
                return isAfter(bookingDate, new Date()) && (b.status === 'confirmed' || b.status === 'pending');
            }).length;

            setStats({
                totalBookings: allBookings.length,
                upcomingServices: upcoming,
                completedBookings: completed
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    const handleLocationSaved = async (location) => {
        console.log('📍 Location saved, refreshing user data...');
        try {
            const updatedUser = await base44.auth.me();
            setUser(updatedUser);
            setShowLocationDetector(false);

            // Reload dashboard data with updated user
            await loadDashboardData(updatedUser);
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const handleDismissLocationDetector = () => {
        setShowLocationDetector(false);
        // Store dismissal in localStorage to not show again this session
        localStorage.setItem('location_detector_dismissed', 'true');
    };

    const quickActions = [
        {
            title: language === 'tamil' ? 'சேவையை முன்பதிவு செய்க' : 'Book a Service',
            description: language === 'tamil' ? 'புதிய ஆன்மீக சேவையை முன்பதிவு செய்க' : 'Book a new spiritual service',
            icon: Calendar,
            color: 'bg-blue-500',
            link: createPageUrl('UserBookServices')
        },
        {
            title: language === 'tamil' ? 'புத்தகங்களை வாங்கவும்' : 'Buy Books',
            description: language === 'tamil' ? 'ஆன்மீக புத்தகங்களை உலாவவும்' : 'Browse spiritual books',
            icon: BookOpen,
            color: 'bg-purple-500',
            link: createPageUrl('UserBuyBooks')
        },
        {
            title: language === 'tamil' ? 'என் முன்பதிவுகள்' : 'My Bookings',
            description: language === 'tamil' ? 'முன்பதிவு வரலாற்றைக் காண்க' : 'View booking history',
            icon: History,
            color: 'bg-green-500',
            link: createPageUrl('UserBookingHistory')
        },
        {
            title: language === 'tamil' ? 'சுயவிவரம்' : 'Profile',
            description: language === 'tamil' ? 'உங்கள் சுயவிவரத்தைப் புதுப்பிக்கவும்' : 'Update your profile',
            icon: UserIcon,
            color: 'bg-orange-500',
            link: createPageUrl('UserProfileSettings')
        }
    ];

    if (isLoading) {
        return (
            <UserDashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#B71C1C]" />
                </div>
            </UserDashboardLayout>
        );
    }

    return (
        <UserDashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Auto Location Detector - Shows for new users without location */}
                {showLocationDetector && (
                    <div className="mb-6">
                        <AutoLocationDetector
                            user={user}
                            onLocationSaved={handleLocationSaved}
                            onDismiss={handleDismissLocationDetector}
                        />
                    </div>
                )}

                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-[#B71C1C] to-[#8B0000] rounded-xl p-6 mb-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">
                        {language === 'tamil' ? 'வணக்கம்,' : 'Welcome,'} {userName} 👋
                    </h1>

                    <p className="text-white/90">
                        {language === 'tamil'
                            ? 'உங்கள் டாஷ்போர்டுக்கு மீண்டும் வருக'
                            : 'Welcome back to your dashboard'}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">
                                        {language === 'tamil' ? 'மொத்த முன்பதிவுகள்' : 'Total Bookings'}
                                    </p>
                                    <p className="text-2xl font-bold text-[#B71C1C]">{stats.totalBookings}</p>
                                </div>
                                <Calendar className="w-10 h-10 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">
                                        {language === 'tamil' ? 'வரவிருக்கும் சேவைகள்' : 'Upcoming Services'}
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">{stats.upcomingServices}</p>
                                </div>
                                <Clock className="w-10 h-10 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">
                                        {language === 'tamil' ? 'முடிந்த முன்பதிவுகள்' : 'Completed'}
                                    </p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.completedBookings}</p>
                                </div>
                                <CheckCircle className="w-10 h-10 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {language === 'tamil' ? 'விரைவு செயல்கள்' : 'Quick Actions'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={index} to={action.link}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <CardContent className="pt-6">
                                        <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                                            <action.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold mb-1">{action.title}</h3>
                                        <p className="text-sm text-slate-600">{action.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Bookings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{language === 'tamil' ? 'சமீபத்திய முன்பதிவுகள்' : 'Recent Bookings'}</span>
                                <Link to={createPageUrl('UserBookingHistory')}>
                                    <Button variant="ghost" size="sm">
                                        {language === 'tamil' ? 'அனைத்தையும் காண்க' : 'View All'}
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentBookings.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">
                                    {language === 'tamil' ? 'முன்பதிவுகள் இல்லை' : 'No bookings yet'}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentBookings.map(booking => (
                                        <div key={booking.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm capitalize">
                                                    {booking.service_type?.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {language === 'tamil' ? 'யாருக்காக:' : 'For:'} {booking.beneficiary_name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                <span>{language === 'tamil' ? 'சமீபத்திய செயல்பாடு' : 'Recent Activity'}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">
                                    {language === 'tamil' ? 'செயல்பாடு இல்லை' : 'No recent activity'}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivity.map(activity => (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{activity.action}</p>
                                                {activity.details && (
                                                    <p className="text-xs text-slate-600 mt-1">{activity.details}</p>
                                                )}
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {format(new Date(activity.created_date), 'MMM dd, yyyy h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </UserDashboardLayout>
    );
}