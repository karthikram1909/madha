import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function UserBookingHistory() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                loadBookings(currentUser.email);
            } catch (error) {
                base44.auth.redirectToLogin(window.location.pathname);
            }
        };
        checkUser();
    }, []);

    const loadBookings = async (email) => {
        setIsLoading(true);
        try {
            const userBookings = await base44.entities.ServiceBooking.filter({ booker_email: email }, '-created_date');
            setBookings(userBookings);
        } catch (error) {
            console.error("Failed to load booking history:", error);
        }
        setIsLoading(false);
    };
    
    const getStatusVariant = (status) => {
        switch(status) {
            case 'completed': return 'success';
            case 'confirmed': return 'default';
            case 'pending': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusBadgeStyle = (status) => {
        const styles = {
            pending: 'bg-gray-100 text-gray-800',
            processing: 'bg-blue-100 text-blue-800 font-semibold',
            shipped: 'bg-purple-100 text-purple-800 font-semibold',
            delivered: 'bg-green-100 text-green-800 font-semibold',
            cancelled: 'bg-red-100 text-red-800 font-semibold'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentBadgeStyle = (paymentStatus) => {
        const styles = {
            completed: 'bg-emerald-100 text-emerald-800 font-semibold',
            pending: 'bg-orange-100 text-orange-800 font-semibold',
            failed: 'bg-red-100 text-red-800 font-semibold'
        };
        return styles[paymentStatus] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading || !user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <UserDashboardLayout user={user}>
            <Card>
                <CardHeader>
                    <CardTitle>My Booking History</CardTitle>
                </CardHeader>
                <CardContent>
                     {isLoading ? <p>Loading history...</p> : (
                        <div className="space-y-4">
                            {bookings.map(booking => (
                                <Card key={booking.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <div className="flex items-center gap-4 mb-1">
                                            <p className="font-bold capitalize">{booking.service_type.replace(/_/g, ' ')}</p>
                                            {booking.order_id && <Badge variant="secondary">Order #{booking.order_id}</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-600">For: {booking.beneficiary_name}</p>
                                        <p className="text-sm text-slate-500">
                                            Booked on: {format(new Date(booking.created_date), 'PPP')}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Telecast on: {format(new Date(booking.booking_date), 'PPP')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                                        {booking.invoice_id && (
                                            <Link to={createPageUrl(`Invoice?id=${booking.invoice_id}`)} target="_blank">
                                                <Button variant="outline" size="sm">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Invoice
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {bookings.length === 0 && <p className="text-center py-8 text-slate-500">You have no booking history.</p>}
                        </div>
                     )}
                </CardContent>
            </Card>
        </UserDashboardLayout>
    );
}