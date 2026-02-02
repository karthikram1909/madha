
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Existing service names and emojis remain for fallback and consistency
const serviceNames = {
    holy_mass: 'Holy Mass',
    rosary_blessing: 'Rosary Blessing',
    birthday_service: 'Birthday Blessings',
    deathday_service: 'Memorial Prayer',
    marriage_blessing: 'Anniversary Blessing',
};

const serviceEmojis = {
    holy_mass: '⛪',
    rosary_blessing: '📿',
    birthday_service: '🎂',
    deathday_service: '🕊️',
    marriage_blessing: '💒',
};

export default function BookingDetailsModal({ booking, onClose, language = 'english', onRebook }) {
    if (!booking) return null;

    // Helper to get service display name based on language and available titles
    const getServiceDisplayName = () => {
        // If Tamil title is available and language is Tamil
        if (booking.service_title_tamil && language === 'tamil') {
            return booking.service_title_tamil;
        }

        // Otherwise, use English title if available, or predefined English name, or raw service_type
        return booking.service_title || serviceNames[booking.service_type] || booking.service_type;
    };

    // Helper to determine status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'confirmed': return 'default';
            case 'pending': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header Section */}
                <div className="p-6 pb-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {language === 'tamil' ? 'பதிவு விவரங்கள்' : 'Booking Details'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Service Information */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 mb-2">
                            {language === 'tamil' ? 'சேவை விவரங்கள்' : 'Service Details'}
                        </h3>
                        <p className="text-lg font-bold text-[#861518] flex items-center gap-2">
                            <span>{serviceEmojis[booking.service_type] || '🙏'}</span>
                            {getServiceDisplayName()}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                            {language === 'tamil' ? 'பயனாளி' : 'For'}: {booking.beneficiary_name}
                        </p>
                    </div>

                    {/* Status and Recurring Information */}
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(booking.status)}>
                            {booking.status}
                        </Badge>
                        {booking.isRecurring && (
                            <Badge variant="secondary" className="bg-sky-100 text-sky-800">
                                {language === 'tamil' ? 'தொடர்ச்சியான' : 'Recurring'}
                            </Badge>
                        )}
                    </div>

                    {/* Action Buttons (Rebook and Close) */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        {/* Rebook This Service Button */}
                        {onRebook && ( // Only show rebook button if onRebook prop is provided
                            <Button size="sm" variant="outline" onClick={() => onRebook(booking)}>
                                {language === 'tamil' ? 'இந்த சேவையை மீண்டும் பதிவு செய்யவும்' : 'Rebook This Service'}
                            </Button>
                        )}
                        {/* Close Button */}
                        <Button onClick={onClose} variant="secondary">
                            {language === 'tamil' ? 'மூடு' : 'Close'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
