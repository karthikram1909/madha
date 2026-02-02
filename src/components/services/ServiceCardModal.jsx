import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import ServiceSelection from '../booking-flow/ServiceSelection';
import BookingForm from '../booking-flow/BookingForm';
import PreviousBookingSelector from '../booking-flow/PreviousBookingSelector';
import PaymentStep from '../booking-flow/PaymentStep';
import SuccessScreen from '../booking-flow/SuccessScreen';

export default function ServiceCardModal({
    service,
    user,
    allUserBookings,
    currency,
    paymentGateway,
    razorpayConfig,
    razorpayEnabled,
    payPalConfig,
    payPalEnabled,
    taxConfig,
    bookingCart,
    isPaymentLoading,
    showPreviousBookings,
    showBookingForm,
    previousBookingsForService,
    selectedBookingData,
    successModalData,
    onClose,
    onUsePreviousBooking,
    onCreateNewBooking,
    onAddToCart,
    onRemoveFromCart,
    onPaymentComplete,
    setIsPaymentLoading,
    language
}) {
    const [currentStep, setCurrentStep] = useState('selection');
    const [localBookingData, setLocalBookingData] = useState(null);

    useEffect(() => {
        if (service) {
            if (showPreviousBookings) {
                setCurrentStep('previousBookings');
            } else if (showBookingForm) {
                setCurrentStep('form');
            } else {
                setCurrentStep('selection');
            }
        }
    }, [service, showPreviousBookings, showBookingForm]);

    useEffect(() => {
        if (successModalData.isOpen) {
            setCurrentStep('success');
        }
    }, [successModalData]);

    if (!service) return null;

    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const cartTotal = bookingCart.reduce((sum, booking) => 
        sum + (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0), 0
    );

    const handleBackToSelection = () => {
        setCurrentStep('selection');
        setLocalBookingData(null);
    };

    const handleProceedToForm = () => {
        setCurrentStep('form');
    };

    const handleFormSubmit = (bookingData) => {
        setLocalBookingData(bookingData);
        onAddToCart(bookingData);
    };

    const handleProceedToPayment = () => {
        setCurrentStep('payment');
    };

    const renderContent = () => {
        switch (currentStep) {
            case 'previousBookings':
                return (
                    <PreviousBookingSelector
                        previousBookings={previousBookingsForService}
                        onSelect={onUsePreviousBooking}
                        onCreateNew={onCreateNewBooking}
                        onBack={handleBackToSelection}
                        language={language}
                    />
                );

            case 'form':
                return (
                    <BookingForm
                        service={service}
                        user={user}
                        currency={currency}
                        taxConfig={taxConfig}
                        selectedBookingData={selectedBookingData}
                        onSubmit={handleFormSubmit}
                        onBack={handleBackToSelection}
                        language={language}
                    />
                );

            case 'payment':
                return (
                    <PaymentStep
                        service={service}
                        user={user}
                        bookingCart={bookingCart}
                        currency={currency}
                        paymentGateway={paymentGateway}
                        razorpayConfig={razorpayConfig}
                        razorpayEnabled={razorpayEnabled}
                        payPalConfig={payPalConfig}
                        payPalEnabled={payPalEnabled}
                        taxConfig={taxConfig}
                        isPaymentLoading={isPaymentLoading}
                        onPaymentComplete={onPaymentComplete}
                        onBack={handleBackToSelection}
                        setIsPaymentLoading={setIsPaymentLoading}
                        language={language}
                    />
                );

            case 'success':
                return (
                    <SuccessScreen
                        successModalData={successModalData}
                        onClose={onClose}
                        language={language}
                    />
                );

            default:
                return (
                    <ServiceSelection
                        service={service}
                        currency={currency}
                        bookingCart={bookingCart}
                        cartTotal={cartTotal}
                        onProceedToForm={handleProceedToForm}
                        onProceedToPayment={handleProceedToPayment}
                        onRemoveFromCart={onRemoveFromCart}
                        language={language}
                    />
                );
        }
    };

    return (
        <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-[#B71C1C]">
                        {language === 'tamil' && service.title_tamil ? service.title_tamil : service.title}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-100px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}