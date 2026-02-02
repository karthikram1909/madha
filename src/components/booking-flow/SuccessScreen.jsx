
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function SuccessScreen({ booking, onClose, language = 'english' }) {
    const [isDownloading, setIsDownloading] = useState(false);

    // The logic for sending confirmation email directly from this component has been removed.
    // It's assumed that the email sending is handled by the upstream booking process
    // before the SuccessScreen is displayed.

    React.useEffect(() => {
        // Double check email was sent when component mounts
        if (booking && booking.booker_email) {
            console.log('🔍 Success screen loaded, checking email status...');
            
            // Optional: Log to verify booking was created
            console.log('✅ Booking details:', {
                id: booking.id,
                trn: booking.trn,
                email: booking.booker_email,
                status: booking.status,
                payment_status: booking.payment_status
            });
        }
    }, [booking]);

    const handleDownloadInvoice = () => {
        setIsDownloading(true);

        // Simulate API call or complex PDF generation
        setTimeout(() => {
            const invoiceContent = `
Invoice for Spiritual Service
---------------------------
Booking ID: ${booking.id}
Service: ${booking.service_type.replace(/_/g, ' ')}
Beneficiary: ${booking.beneficiary_name}
Date: ${format(new Date(booking.booking_date), 'PPP')}
Amount: [Assuming a fixed amount or dynamic value, not provided in booking object]

Thank you for your booking!
            `;

            const blob = new Blob([invoiceContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${booking.id}.txt`; // You could generate a PDF if a library like jsPDF is used
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setIsDownloading(false);
        }, 1500); // Simulate network delay
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {language === 'tamil' ? 'வெற்றி!' : 'Success!'}
                    </h2>
                    <p className="text-gray-600">
                        {language === 'tamil'
                            ? 'உங்கள் பதிவு உறுதிப்படுத்தப்பட்டது'
                            : 'Your booking has been confirmed'}
                    </p>
                </div>

                {booking && (
                     <Card className="w-full text-left bg-slate-50 mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {language === 'tamil' ? 'பதிவுச் சுருக்கம்' : 'Booking Summary'}
                            </CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-2 text-sm">
                             <p><strong>{language === 'tamil' ? 'சேவை:' : 'Service:'}</strong> {booking.service_type.replace(/_/g, ' ')}</p>
                             <p><strong>{language === 'tamil' ? 'யாருக்காக:' : 'For:'}</strong> {booking.beneficiary_name}</p>
                             <p><strong>{language === 'tamil' ? 'தேதி:' : 'Date:'}</strong> {format(new Date(booking.booking_date), 'PPP')}</p>
                             <p><strong>{language === 'tamil' ? 'பதிவு ID:' : 'Booking ID:'}</strong> {booking.id}</p>
                         </CardContent>
                     </Card>
                )}

                <div className="flex gap-3">
                    <Button
                        onClick={handleDownloadInvoice}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        disabled={isDownloading}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        {isDownloading
                            ? (language === 'tamil' ? 'பதிவிறக்கம்...' : 'Downloading...')
                            : (language === 'tamil' ? 'விலைப்பட்டியல்' : 'Download Invoice')}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                    >
                        {language === 'tamil' ? 'மூடு' : 'Close'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
