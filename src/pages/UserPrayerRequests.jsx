import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import { toast } from 'sonner';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';

// API configuration - Use Vite proxy to avoid CORS
const API_BASE_URL = '/api/v2';

// IST Date Formatting Helper - Converts UTC to IST properly
const formatISTDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        // Create formatter with Asia/Kolkata timezone
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

// Helper function to make authenticated API calls
const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Include cookies for session auth
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
};

export default function UserPrayerRequests() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get user object from localStorage
                const userString = localStorage.getItem('user');
                let userEmail = null;
                let userId = null;
                
                // Parse user object if it exists
                if (userString && userString !== 'undefined') {
                    try {
                        const userObj = JSON.parse(userString);
                        console.log('Parsed user object:', userObj);
                        userEmail = userObj.email_id || userObj.email || userObj.user_email;
                        userId = userObj.id || userObj.user_id || userObj.userId;
                    } catch (e) {
                        console.error('Failed to parse user object:', e);
                    }
                }

                // Use user_id for the request (preferred method)
                if (!userId) {
                    console.error('No user_id found');
                    throw new Error('User not authenticated - please log in again');
                }

                const requestBody = { user_id: parseInt(userId) };

                // Fetch prayer requests from API
                const data = await apiCall('/prayer/my.php', {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                });

                // Set user info
                if (userEmail || userId) {
                    setUser({ email: userEmail, id: userId });
                }

                // Set requests - adjust based on your API response structure
                setRequests(Array.isArray(data) ? data : data.requests || data.data || []);
            } catch (error) {
                toast.error(error.message || "You need to be logged in to view your prayer requests.");
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const PrayerRequestCard = ({ request, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-red-100 rounded-full flex-shrink-0">
                            <Send className="w-5 h-5 md:w-6 md:h-6 text-red-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-slate-500 mb-2">
                                Requested on {formatISTDate(request.created_date)}
                            </p>
                            <p className="text-sm md:text-base text-slate-700 break-words">
                                {request.message}
                            </p>
                        </div>
                    </div>
                    {request.status === 'replied' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-4 pl-6 md:pl-8"
                        >
                            <div className="p-3 md:p-4 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl border-l-4 border-amber-400 relative">
                                <CornerDownRight className="absolute left-[-1rem] md:left-[-1.2rem] top-3 md:top-4 w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                                <div className="flex items-start gap-2 md:gap-3">
                                    <div className="p-1.5 md:p-2 bg-amber-400/20 rounded-full flex-shrink-0">
                                        <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-amber-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm md:text-base text-amber-800">
                                            Reply from Madha TV
                                        </p>
                                        <p className="text-xs md:text-sm text-slate-500 mb-2">
                                            Replied on {formatISTDate(request.replied_at)}
                                        </p>
                                        <p className="text-sm md:text-base text-slate-700 break-words">
                                            {request.reply_message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <UserDashboardLayout>
            <div className="p-4 md:p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 md:mb-6">
                    My Prayer Requests
                </h1>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="w-10 h-10 md:w-12 md:h-12 animate-spin text-red-600" />
                    </div>
                ) : requests.length > 0 ? (
                    <div className="space-y-4 md:space-y-6">
                        {requests.map((req, index) => (
                            <PrayerRequestCard key={req.id} request={req} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 md:py-16 px-4">
                        <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-3 md:mb-4" />
                        <h2 className="text-lg md:text-xl font-semibold text-slate-600">
                            No prayer requests found.
                        </h2>
                        <p className="text-sm md:text-base text-slate-500 mt-2">
                            You haven't submitted any prayer requests yet.
                        </p>
                    </div>
                )}
            </div>
        </UserDashboardLayout>
    );
}
