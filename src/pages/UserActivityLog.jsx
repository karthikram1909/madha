import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar, Heart, LogIn, LogOut } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function UserActivityLog() {
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                loadActivities(currentUser.email);
            } catch (error) {
                base44.auth.redirectToLogin(window.location.pathname);
            }
        };
        checkUser();
    }, [navigate]);

    const loadActivities = async (email) => {
        setIsLoading(true);
        try {
            const userActivities = await base44.entities.UserActivityLog.filter({ user_email: email }, '-created_date', 50);
            setActivities(userActivities);
        } catch (error) {
            console.error("Failed to load activities:", error);
        }
        setIsLoading(false);
    };

    const getActionIcon = (action) => {
        if (action.toLowerCase().includes('booking')) return <Calendar className="w-5 h-5 text-blue-500" />;
        if (action.toLowerCase().includes('donation')) return <Heart className="w-5 h-5 text-pink-500" />;
        if (action.toLowerCase().includes('login')) return <LogIn className="w-5 h-5 text-green-500" />;
        if (action.toLowerCase().includes('logout')) return <LogOut className="w-5 h-5 text-red-500" />;
        return <History className="w-5 h-5 text-gray-500" />;
    };

    if (isLoading || !user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <UserDashboardLayout user={user}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-800">My Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Loading activities...</p> : (
                        <div className="space-y-6">
                            {activities.map(log => (
                                <div key={log.id} className="flex items-start gap-4">
                                    <div className="bg-slate-100 p-3 rounded-full mt-1">
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">{log.action}</p>
                                        <p className="text-sm text-slate-600">{log.details}</p>
                                    </div>
                                    <div className="text-right text-sm text-slate-500">
                                        <p>{format(new Date(log.created_date), "MMM d, yyyy, h:mm a")}</p>
                                        <p>{formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                             {activities.length === 0 && <p className="text-center text-slate-500 py-10">No activities recorded yet.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </UserDashboardLayout>
    );
}