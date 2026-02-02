import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, HeartHandshake } from 'lucide-react';

const formatISTDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const formatter = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        return formatter.format(date);
    } catch {
        return 'Invalid Date';
    }
};

export default function RecentActivity() {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRecentActivity();
    }, []);

    const loadRecentActivity = async () => {
        setIsLoading(true);
        try {
            const [recentBookings, recentPrayerRequests] = await Promise.all([
                base44.entities.ServiceBooking.list('-created_date', 5),
                base44.entities.PrayerRequest.list('-created_date', 5)
            ]);

            const combinedActivities = [
                ...recentBookings.map(booking => ({
                    type: 'booking',
                    id: booking.id,
                    title: `New ${(booking.service_type || 'Service').replace(/_/g, ' ')} Booking`,
                    description: `${booking.booker_name} booked ${booking.service_type?.replace(/_/g, ' ')}`,
                    timestamp: booking.created_date,
                    status: booking.status,
                    icon: Calendar
                })),
                ...recentPrayerRequests.map(request => ({
                    type: 'prayer',
                    id: request.id,
                    title: 'New Prayer Request',
                    description: `${request.requester_name} submitted a prayer request`,
                    timestamp: request.created_date,
                    status: request.status,
                    icon: HeartHandshake
                }))
            ];

            combinedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setActivities(combinedActivities.slice(0, 10));
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
        setIsLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'replied': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p>No recent activity</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {activities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div key={`${activity.type}-${activity.id}`} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Icon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{activity.title}</p>
                                                    <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                                                </div>
                                                <Badge className={getStatusColor(activity.status)}>
                                                    {activity.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatISTDate(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}