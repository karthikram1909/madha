import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CornerDownRight, Calendar, MessageSquare, User, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ServiceBooking } from '@/api/entities';
import { motion } from 'framer-motion';

export default function PreviousBookingSelector({ user, selectedService, onSelect, onSkip }) {
    const [previousBookings, setPreviousBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPreviousBookings = async () => {
            if (!user || !selectedService) return;
            
            setIsLoading(true);
            try {
                const bookings = await ServiceBooking.filter({
                    user_id: user.id,
                    service_type: selectedService.key
                }, '-created_date', 2);
                
                setPreviousBookings(bookings || []);
            } catch (error) {
                console.error("Error loading previous bookings:", error);
                setPreviousBookings([]);
            }
            setIsLoading(false);
        };

        loadPreviousBookings();
    }, [user, selectedService]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (previousBookings.length === 0) {
        // Auto-skip if no previous bookings
        onSkip();
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your Previous Bookings</h3>
                <p className="text-slate-600">Would you like to reuse details from a previous booking?</p>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {previousBookings.map((booking, index) => (
                    <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card 
                            className="hover:shadow-md cursor-pointer transition-all duration-200 hover:bg-red-50 border-l-4 border-l-red-500 group"
                            onClick={() => onSelect(booking)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {format(parseISO(booking.booking_date), 'dd MMMM yyyy')}
                                                </span>
                                            </div>
                                            <Badge 
                                                variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {booking.payment_status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-start gap-2 mb-2">
                                            <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                            <span className="font-medium text-slate-800">
                                                For: {booking.beneficiary_name}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-slate-600 line-clamp-2">
                                                "{booking.intention_text}"
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4 group-hover:bg-red-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(booking);
                                        }}
                                    >
                                        Use This
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center pt-4 border-t">
                <Button 
                    onClick={onSkip} 
                    variant="outline" 
                    className="w-full max-w-xs hover:bg-slate-50"
                >
                    <CornerDownRight className="w-4 h-4 mr-2" />
                    Start a New Booking
                </Button>
            </div>
        </div>
    );
}