
import React, { useState, useEffect } from 'react';
import { ServiceBooking } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Church, HandHeart, Cake, Heart, Flame, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const serviceIcons = {
    holy_mass: <Church className="w-4 h-4 text-blue-500" />,
    rosary_blessing: <HandHeart className="w-4 h-4 text-purple-500" />,
    birthday_service: <Cake className="w-4 h-4 text-pink-500" />,
    marriage_blessing: <Heart className="w-4 h-4 text-red-500" />,
    deathday_service: <Flame className="w-4 h-4 text-gray-500" />
};

const serviceColors = {
    holy_mass: 'bg-blue-100 text-blue-800 border-blue-200',
    rosary_blessing: 'bg-purple-100 text-purple-800 border-purple-200',
    birthday_service: 'bg-pink-100 text-pink-800 border-pink-200',
    marriage_blessing: 'bg-red-100 text-red-800 border-red-200',
    deathday_service: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function UserBookingCalendar() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            setIsLoading(true);
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                loadBookings(currentUser.id);
            } catch (error) {
                base44.auth.redirectToLogin(window.location.pathname);
            }
            setIsLoading(false);
        };
        checkUser();
    }, [navigate]);

    const loadBookings = async (userId) => {
        try {
            const userBookings = await ServiceBooking.filter({ user_id: userId }, '-booking_date');
            setBookings(userBookings);
        } catch (error) {
            console.error("Failed to load bookings:", error);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        const now = new Date();
        
        switch (filterType) {
            case 'upcoming':
                return bookingDate >= now;
            case 'past':
                return bookingDate < now;
            case 'this_month':
                return isSameMonth(bookingDate, currentDate);
            default:
                return true;
        }
    });

    const getBookingsForDate = (date) => {
        return filteredBookings.filter(booking => 
            isSameDay(new Date(booking.booking_date), date)
        );
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const previousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading || !user) {
        return (
            <UserDashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C]"></div>
                </div>
            </UserDashboardLayout>
        );
    }

    return (
        <UserDashboardLayout>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Header - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Booking Calendar 📅</h1>
                        <p className="text-sm md:text-base text-slate-600 mt-1">View all your spiritual service bookings in calendar format</p>
                    </div>
                    <div className="w-full sm:w-auto flex items-center gap-3 md:gap-4">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full sm:w-36 md:w-40 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bookings</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="past">Past</SelectItem>
                                <SelectItem value="this_month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Calendar - Mobile Responsive */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="border-b border-slate-100 p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base md:text-xl font-bold text-slate-900">
                                {format(currentDate, 'MMMM yyyy')}
                            </CardTitle>
                            <div className="flex items-center gap-1 md:gap-2">
                                <Button variant="outline" size="icon" onClick={previousMonth} className="h-8 w-8 md:h-10 md:w-10">
                                    <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 md:h-10 md:w-10">
                                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2 md:p-6">
                        {/* Calendar Grid Headers - Mobile Responsive */}
                        <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-2 md:mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-1 md:p-3 text-center text-[10px] md:text-sm font-medium text-slate-500">
                                    <span className="hidden sm:inline">{day}</span>
                                    <span className="sm:hidden">{day.substring(0, 1)}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Calendar Days Grid - Mobile Responsive */}
                        <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                            {calendarDays.map((day) => {
                                const dayBookings = getBookingsForDate(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isCurrentDay = isToday(day);
                                
                                return (
                                    <motion.div
                                        key={day.toString()}
                                        whileHover={{ scale: 1.02 }}
                                        className={`
                                            min-h-16 sm:min-h-20 md:min-h-24 p-1 md:p-2 border border-slate-100 cursor-pointer transition-all duration-200
                                            ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}
                                            ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
                                            ${dayBookings.length > 0 ? 'hover:bg-slate-50' : ''}
                                        `}
                                        onClick={() => setSelectedDate(day)}
                                    >
                                        <div className={`
                                            text-[10px] sm:text-xs md:text-sm font-medium mb-0.5 md:mb-1
                                            ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}
                                            ${isCurrentDay ? 'text-blue-600 font-bold' : ''}
                                        `}>
                                            {format(day, 'd')}
                                        </div>
                                        
                                        <div className="space-y-0.5 md:space-y-1">
                                            {dayBookings.slice(0, 2).map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className={`
                                                        text-[8px] sm:text-[10px] md:text-xs p-0.5 md:p-1 rounded border flex items-center gap-0.5 md:gap-1
                                                        ${serviceColors[booking.service_type] || 'bg-gray-100 text-gray-800'}
                                                    `}
                                                >
                                                    <span className="hidden sm:inline">{serviceIcons[booking.service_type]}</span>
                                                    <span className="truncate leading-tight">
                                                        {booking.service_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                            {dayBookings.length > 2 && (
                                                <div className="text-[8px] sm:text-[10px] md:text-xs text-slate-500 font-medium">
                                                    +{dayBookings.length - 2} more
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Date Details - Mobile Responsive */}
                {selectedDate && (
                    <Card className="bg-white shadow-lg border-0">
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#B71C1C] flex-shrink-0" />
                                <span className="truncate">Bookings for {format(selectedDate, 'MMMM d, yyyy')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            {getBookingsForDate(selectedDate).length === 0 ? (
                                <p className="text-slate-500 text-center py-6 md:py-8 text-sm md:text-base">No bookings for this date</p>
                            ) : (
                                <div className="space-y-3 md:space-y-4">
                                    {getBookingsForDate(selectedDate).map((booking) => (
                                        <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg gap-3">
                                            <div className="flex items-start gap-2 md:gap-3 w-full sm:w-auto">
                                                <div className="flex-shrink-0 mt-1">{serviceIcons[booking.service_type]}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm md:text-base text-slate-900 capitalize truncate">
                                                        {booking.service_type.replace('_', ' ')}
                                                    </h4>
                                                    <p className="text-xs md:text-sm text-slate-600 truncate">
                                                        For: {booking.beneficiary_name}
                                                    </p>
                                                    <p className="text-xs md:text-sm text-slate-500">
                                                        Amount: {booking.currency === 'USD' ? '$' : '₹'}{booking.amount}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                                <Badge className={`${getStatusColor(booking.status)} text-xs`}>
                                                    {booking.status}
                                                </Badge>
                                                {booking.invoice_id && (
                                                    <Button variant="outline" size="sm" className="text-xs h-8">
                                                        <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                                        <span className="hidden sm:inline">Invoice</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Summary Stats - Mobile Responsive */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 md:p-6 text-center">
                            <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">
                                {filteredBookings.length}
                            </div>
                            <div className="text-xs md:text-sm text-blue-700">Total Bookings</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 md:p-6 text-center">
                            <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">
                                {filteredBookings.filter(b => b.status === 'confirmed').length}
                            </div>
                            <div className="text-xs md:text-sm text-green-700">Confirmed</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4 md:p-6 text-center">
                            <div className="text-xl md:text-2xl font-bold text-yellow-600 mb-1">
                                {filteredBookings.filter(b => b.status === 'pending').length}
                            </div>
                            <div className="text-xs md:text-sm text-yellow-700">Pending</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 md:p-6 text-center">
                            <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1">
                                {filteredBookings.filter(b => new Date(b.booking_date) >= new Date()).length}
                            </div>
                            <div className="text-xs md:text-sm text-purple-700">Upcoming</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </UserDashboardLayout>
    );
}
