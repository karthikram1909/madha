import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingSuccessModal({ 
    isOpen, 
    onClose, 
    confirmedBookings,
    paymentRef,
    paymentCurrency,
    emailStatus,
    onViewInvoice,
    onDownloadInvoice,
    language
}) {
    if (!isOpen) return null;

    // Calculate total paid
    const totalPaid = confirmedBookings?.reduce((sum, booking) => {
        return sum + (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0);
    }, 0) || 0;

    const currencySymbol = paymentCurrency === 'INR' ? '₹' : '$';
    const serviceCount = confirmedBookings?.length || 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {language === 'tamil' ? 'முன்பதிவு உறுதிப்படுத்தப்பட்டது!' : 'Booking Confirmed!'}
                    </h2>

                    {/* Payment Details Card */}
                    <div className="bg-green-50 rounded-lg p-6 mb-6 text-left">
                        {/* Total Paid */}
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-green-200">
                            <span className="text-gray-700 font-medium">
                                {language === 'tamil' ? 'மொத்த செலுத்தப்பட்டது:' : 'Total Paid:'}
                            </span>
                            <span className="text-2xl font-bold text-green-700">
                                {currencySymbol}{totalPaid.toFixed(2)}
                            </span>
                        </div>

                        {/* Payment Reference */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-600">
                                {language === 'tamil' ? 'கட்டண குறிப்பு:' : 'Payment Ref:'}
                            </span>
                            <span className="text-sm font-mono text-gray-900">
                                {paymentRef || 'N/A'}
                            </span>
                        </div>

                        {/* Services Count */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {language === 'tamil' ? 'சேவைகள்:' : 'Services:'}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                {serviceCount}
                            </span>
                        </div>
                    </div>

                    {/* Invoice Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <Button 
                            variant="outline" 
                            onClick={onViewInvoice}
                            className="flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            {language === 'tamil' ? 'பார்வை' : 'View'}
                        </Button>
                        <Button 
                            onClick={onDownloadInvoice}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                            <Download className="w-4 h-4" />
                            {language === 'tamil' ? 'பதிவிறக்கு' : 'Download'}
                        </Button>
                    </div>

                    {/* Close Button */}
                    <Button 
                        onClick={onClose}
                        className="w-full bg-gray-900 hover:bg-gray-800"
                    >
                        {language === 'tamil' ? 'மூடு' : 'Close'}
                    </Button>

                    {/* Email Status */}
                    {emailStatus && (
                        <p className="text-xs text-gray-500 mt-4">
                            {emailStatus === 'sending' && (language === 'tamil' ? 'உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பப்படுகிறது...' : 'Sending confirmation email...')}
                            {emailStatus === 'sent' && (language === 'tamil' ? '✓ உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பப்பட்டது' : '✓ Confirmation email sent')}
                            {emailStatus === 'failed' && (language === 'tamil' ? '⚠ மின்னஞ்சல் அனுப்ப முடியவில்லை' : '⚠ Could not send email')}
                        </p>
                    )}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}