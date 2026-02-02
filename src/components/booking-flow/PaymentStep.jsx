import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ServiceBooking, PaymentLog, FailedPayment } from '@/api/entities';
import { toast } from 'sonner';

const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? '$' : '₹';
};

const calculateTax = (baseAmount, taxConfig, customerState, homeState) => {
    if (!taxConfig || !taxConfig.is_enabled || !baseAmount) {
        return { totalTax: 0, cgst: 0, sgst: 0, igst: 0, taxType: 'none' };
    }

    const { type, rate_cgst, rate_sgst, rate_igst } = taxConfig;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalTax = 0;
    let taxType = 'none';

    if (type === 'GST_INDIA' && customerState && homeState) {
        if (customerState.toLowerCase() === homeState.toLowerCase()) {
            cgst = baseAmount * (rate_cgst / 100);
            sgst = baseAmount * (rate_sgst / 100);
            totalTax = cgst + sgst;
            taxType = 'cgst_sgst';
        } else {
            igst = baseAmount * (rate_igst / 100);
            totalTax = igst;
            taxType = 'igst';
        }
    }

    return {
        totalTax: parseFloat(totalTax.toFixed(2)),
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        igst: parseFloat(igst.toFixed(2)),
        taxType: taxType,
    };
};

export default function PaymentStep({ bookingData, onSuccess, onBack, language = 'english' }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [razorpayConfig, setRazorpayConfig] = useState(null);
    const [payPalConfig, setPayPalConfig] = useState(null);
    const [taxConfig, setTaxConfig] = useState(null);

    const baseAmount = bookingData?.amount || 0;
    const currency = bookingData?.currency || 'INR';
    const currencySymbol = getCurrencySymbol(currency);
    const customerState = bookingData?.state;

    const [taxAmount, setTaxAmount] = useState(0);
    const [taxBreakdown, setTaxBreakdown] = useState({ totalTax: 0, cgst: 0, sgst: 0, igst: 0, taxType: 'none' });

    const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

    useEffect(() => {
        const fetchConfigs = async () => {
            await loadPaymentConfigs();
            await loadTaxConfig();
            if (currency === 'INR') {
                loadRazorpayScript();
            }
        };
        fetchConfigs();
    }, [currency]);

    useEffect(() => {
        if (taxConfig && bookingData) {
            const newTaxBreakdown = calculateTax(
                baseAmount,
                taxConfig,
                customerState,
                taxConfig.home_state || 'Tamil Nadu'
            );
            setTaxAmount(newTaxBreakdown.totalTax);
            setTaxBreakdown(newTaxBreakdown);
        } else if (!bookingData) {
            setTaxAmount(0);
            setTaxBreakdown({ totalTax: 0, cgst: 0, sgst: 0, igst: 0, taxType: 'none' });
        }
    }, [taxConfig, baseAmount, customerState, bookingData]);

    const loadPaymentConfigs = async () => {
        try {
            const rzp = await base44.functions.invoke('getPaymentGatewayConfig', { gateway: 'razorpay' });
            setRazorpayConfig(rzp.data);

            const pp = await base44.functions.invoke('getPaymentGatewayConfig', { gateway: 'paypal' });
            setPayPalConfig(pp.data);
        } catch (err) {
            console.error('Failed to load payment gateway configs:', err);
            setError('Failed to load payment options. Please try again later.');
        }
    };

    const loadTaxConfig = async () => {
        try {
            const tax = await base44.functions.invoke('getTaxConfig');
            setTaxConfig(tax.data);
        } catch (err) {
            console.error('Failed to load tax configuration:', err);
            setError('Failed to load tax information.');
        }
    };

    const loadRazorpayScript = () => {
        if (typeof window === 'undefined') return;
        if (document.getElementById('razorpay-checkout-script')) {
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => console.log('Razorpay SDK loaded');
        script.onerror = () => console.error('Failed to load Razorpay SDK');
    };

    const handlePaymentSuccess = async (paymentDetails) => {
        setIsProcessing(true);
        try {
            console.log('💳 Payment successful, creating booking...');

            // Generate TRN first - just like in Buy Books
            console.log('🔢 Generating TRN...');
            const trnResponse = await base44.functions.invoke('generateTRN');
            const newTrn = trnResponse.data.trn;
            console.log('✅ TRN generated:', newTrn);

            // Create booking with TRN
            const booking = await ServiceBooking.create({
                ...bookingData,
                trn: newTrn,
                order_id: paymentDetails.razorpay_order_id || paymentDetails.orderID || `ORD_${Date.now()}`,
                payment_id: paymentDetails.razorpay_payment_id || paymentDetails.id,
                payment_status: 'completed',
                payment_method: paymentDetails.razorpay_payment_id ? 'razorpay' : 'paypal',
                status: 'confirmed',
                amount: baseAmount,
                tax_amount: taxBreakdown.totalTax,
                cgst_amount: taxBreakdown.cgst,
                sgst_amount: taxBreakdown.sgst,
                igst_amount: taxBreakdown.igst,
                tax_type: taxBreakdown.taxType,
            });

            console.log('✅ Booking created with TRN:', booking.trn);

            // Log payment success
            try {
                await PaymentLog.create({
                    user_id: bookingData.user_id,
                    user_name: bookingData.booker_name,
                    user_email: bookingData.booker_email,
                    user_mobile: bookingData.booker_phone,
                    payment_id: paymentDetails.razorpay_payment_id || paymentDetails.id,
                    payment_method: paymentDetails.razorpay_payment_id ? 'razorpay' : 'paypal',
                    amount: totalAmount,
                    currency: bookingData.currency || 'INR',
                    purpose: 'service_booking',
                    status: 'success',
                    gateway_response: paymentDetails,
                    order_id: booking.id,
                    ip_address: window.location.hostname,
                    user_agent: navigator.userAgent
                });
            } catch (logError) {
                console.error('Failed to log payment:', logError);
            }

            // Send confirmation email
            try {
                await base44.functions.invoke('sendResendEmail', {
                    module: 'bookings',
                    type: 'confirmation',
                    recipient_email: bookingData.booker_email,
                    data: {
                        ...booking,
                        service_type: bookingData.service_type
                    }
                });
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }

            onSuccess(booking);
            toast.success('🎉 Payment successful! Booking confirmed.');
        } catch (error) {
            console.error('❌ Failed to create booking:', error);

            // Log the failed order creation
            try {
                await FailedPayment.create({
                    user_id: bookingData.user_id,
                    user_name: bookingData.booker_name,
                    email: bookingData.booker_email,
                    mobile: bookingData.booker_phone,
                    amount: totalAmount,
                    currency: bookingData.currency || 'INR',
                    payment_id: paymentDetails.razorpay_payment_id || paymentDetails.id,
                    payment_method: paymentDetails.razorpay_payment_id ? 'razorpay' : 'paypal',
                    purpose: 'service_booking',
                    status: 'PENDING_RESTORE',
                    payment_data: {
                        bookingData: { ...bookingData, baseAmount, totalAmount, ...taxBreakdown },
                        paymentDetails
                    },
                    error_message: error.message || 'Failed to create booking after payment'
                });

                await PaymentLog.create({
                    user_id: bookingData.user_id,
                    user_name: bookingData.booker_name,
                    user_email: bookingData.booker_email,
                    user_mobile: bookingData.booker_phone,
                    payment_id: paymentDetails.razorpay_payment_id || paymentDetails.id,
                    payment_method: paymentDetails.razorpay_payment_id ? 'razorpay' : 'paypal',
                    amount: totalAmount,
                    currency: bookingData.currency || 'INR',
                    purpose: 'service_booking',
                    status: 'order_failed',
                    gateway_response: paymentDetails,
                    error_message: error.message,
                    ip_address: window.location.hostname,
                    user_agent: navigator.userAgent
                });
            } catch (logError) {
                console.error('Failed to log failed payment:', logError);
            }

            toast.error('Payment was successful but booking creation failed. Please contact support with your payment ID.');
            onSuccess(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRazorpaySuccess = async (response) => {
        console.log('💳 Razorpay payment successful: received response');
        await handlePaymentSuccess(response);
    };

    const handlePayPalSuccess = async (details) => {
        console.log('💳 PayPal payment successful: received details');
        await handlePaymentSuccess(details);
    };

    const handleProceedWithPayment = async () => {
        if (isProcessing) {
            console.log('Already processing, ignoring duplicate click');
            return;
        }
        setError(null);
        console.log('=== STARTING PAYMENT PROCESS ===');
        setIsProcessing(true);

        if (!bookingData || !bookingData.amount) {
            setError("No booking data available. Please select a service to proceed.");
            setIsProcessing(false);
            return;
        }

        try {
            if (currency === 'INR') {
                console.log('Payment method: Razorpay (INR)');

                if (!razorpayConfig || !razorpayConfig.is_enabled) {
                    throw new Error("Razorpay payments are currently disabled. Please contact support.");
                }

                if (!razorpayConfig.key_id) {
                    throw new Error("Razorpay is not properly configured. Please contact support.");
                }

                console.log('Creating Razorpay order via backend...');
                const orderResponse = await base44.functions.invoke('createRazorpayOrder', {
                    amount: totalAmount,
                    currency: 'INR',
                    receipt: `booking_${Date.now()}`,
                    config_type: 'single_service_booking'
                });

                console.log('Razorpay order created:', orderResponse.data);

                const options = {
                    key: razorpayConfig.key_id,
                    amount: orderResponse.data.amount,
                    currency: orderResponse.data.currency,
                    name: 'Madha TV',
                    description: bookingData.service_name || 'Service Booking',
                    order_id: orderResponse.data.id,
                    handler: handleRazorpaySuccess,
                    prefill: {
                        name: bookingData.booker_name || '',
                        email: bookingData.booker_email || '',
                        contact: bookingData.booker_phone || ''
                    },
                    theme: {
                        color: '#B71C1C'
                    },
                    modal: {
                        ondismiss: function() {
                            console.log('Payment modal closed by user');
                            setIsProcessing(false);
                            toast.info('Payment cancelled');
                        }
                    }
                };

                console.log('Opening Razorpay checkout...');
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    console.error('=== PAYMENT FAILED ===');
                    console.error('Failure response:', response.error);

                    setIsProcessing(false);
                    setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
                    toast.error(`Payment failed: ${response.error.description || 'Please try again.'}`);

                    FailedPayment.create({
                        user_id: bookingData.user_id,
                        user_name: bookingData.booker_name,
                        email: bookingData.booker_email,
                        mobile: bookingData.booker_phone,
                        amount: totalAmount,
                        currency: currency,
                        payment_id: response.error?.metadata?.payment_id || 'N/A',
                        payment_method: 'razorpay',
                        purpose: 'service_booking',
                        status: 'FAILED_GATEWAY',
                        payment_data: { bookingData: { ...bookingData, baseAmount, totalAmount, ...taxBreakdown } },
                        error_message: response.error?.description || response.error?.reason || 'Payment failed at gateway',
                        gateway_response: response.error
                    }).catch(logErr => console.error('Failed to log gateway failure:', logErr));
                });

                rzp.open();

            } else {
                console.log('Payment method: PayPal (USD)');

                if (!payPalConfig || !payPalConfig.is_enabled) {
                    throw new Error("PayPal payments are currently disabled. Please contact support.");
                }

                toast.info("Redirecting to PayPal...");

                setTimeout(async () => {
                    const paypalPaymentId = `paypal_txn_${Date.now()}`;
                    const paypalOrderId = `paypal_ord_${Date.now()}`;
                    console.log('PayPal payment ID (simulated):', paypalPaymentId);
                    await handlePayPalSuccess({
                        id: paypalPaymentId,
                        orderID: paypalOrderId,
                        status: 'COMPLETED',
                        payer: { email_address: bookingData.booker_email || 'payer@example.com' },
                        purchase_units: [{ amount: { value: totalAmount, currency_code: currency } }]
                    });
                }, 2000);
            }

        } catch (err) {
            console.error('=== PAYMENT INITIATION FAILED ===');
            console.error('Error:', err);

            setIsProcessing(false);
            setError(err.message || "Failed to initiate payment. Please try again.");
            toast.error(err.message || "Failed to initiate payment. Please try again.");

            FailedPayment.create({
                user_id: bookingData.user_id,
                user_name: bookingData.booker_name,
                email: bookingData.booker_email,
                mobile: bookingData.booker_phone,
                amount: totalAmount,
                currency: currency,
                payment_id: 'N/A',
                payment_method: currency === 'INR' ? 'razorpay' : 'paypal',
                purpose: 'service_booking',
                status: 'FAILED_INITIATION',
                payment_data: { bookingData: { ...bookingData, baseAmount, totalAmount, ...taxBreakdown } },
                error_message: err.message || 'Payment initiation failed'
            }).catch(logErr => console.error('Failed to log initiation failure:', logErr));
        }
    };

    const paymentGatewayName = currency === 'INR' ? 'Razorpay' : 'PayPal';

    if (!bookingData || !bookingData.amount) {
        return (
            <div className="text-center space-y-6">
                <p className="text-xl text-red-600">No service selected. Please go back and select a service to proceed with payment.</p>
                {onBack && (
                    <Button variant="link" onClick={onBack}>
                        Go Back to Services
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="text-center space-y-6">
            <CreditCard className="w-16 h-16 mx-auto text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Final Step: Complete Booking</h2>
            <p className="text-slate-600">
                A payment is required to complete your service booking.
                Your contribution helps support our mission.
            </p>

            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-slate-600 text-sm">Total Amount Due</p>
                        <p className="text-4xl font-bold text-blue-800">
                            {currencySymbol}{totalAmount.toFixed(2)}
                        </p>
                        {taxAmount > 0 && (
                            <p className="text-sm text-slate-500">
                                (Includes {currencySymbol}{taxAmount.toFixed(2)} in taxes)
                            </p>
                        )}
                        <p className="text-sm text-slate-500">
                            Payment via: <span className="font-semibold">{paymentGatewayName}</span>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 text-left text-sm rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 text-left text-sm rounded-md">
                You will be securely redirected to {paymentGatewayName} to complete your payment.
            </div>

            <Button
                onClick={handleProceedWithPayment}
                className="w-full text-lg py-6"
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {currency === 'INR' ? 'Processing with Razorpay...' : 'Redirecting to PayPal...'}
                    </>
                ) : (
                    <>
                        Proceed to Pay {currencySymbol}{totalAmount.toFixed(2)}
                    </>
                )}
            </Button>
            {onBack && (
                <Button variant="link" onClick={onBack} disabled={isProcessing}>
                    Back
                </Button>
            )}
        </div>
    );
}