
import React, { useState, useEffect } from 'react';
import { Donation, User, RazorpayConfig, DonorProfile, PayPalConfig } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, CreditCard, CheckCircle, Loader2, AlertTriangle, Award, KeyRound, Download, ExternalLink, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { createRazorpayOrder } from '@/api/functions';
import { generateDonationDocument } from '@/api/functions';
import { sendTransactionalEmail } from '@/api/functions';
import { toast } from 'sonner';
import { sendOTP } from '@/api/functions';
import { verifyOTP } from '@/api/functions';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';
import DTVChannels from '../components/website/DTVChannels';
import PageBanner from "../components/website/PageBanner";

// Helper functions
const amountPresets = {
    INR: [100, 500, 1000, 2500, 5000, 10000],
    USD: [10, 25, 50, 100, 250, 500],
};

const detectCurrencyFromPhone = (phone) => {
    if (!phone) return { currency: 'INR', gateway: 'razorpay' };
    const normalizedPhone = phone.replace(/\D/g, '');
    
    if (normalizedPhone.startsWith('91') || (normalizedPhone.length === 10 && normalizedPhone.match(/^[6-9]\d{9}$/))) {
        return { currency: 'INR', gateway: 'razorpay' };
    }
    if (normalizedPhone.startsWith('1') || (normalizedPhone.length === 10 && normalizedPhone.match(/^[2-9]\d{9}$/))) {
        return { currency: 'USD', gateway: 'paypal' };
    }
    return { currency: 'USD', gateway: 'paypal' };
};

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-sdk')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-sdk';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error('Failed to load Razorpay SDK');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const PayPalButton = ({ amount, currency, config, onPaymentSuccess, onPaymentCancel }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        const loadScript = async () => {
            const scriptId = 'paypal-sdk-script-public';
            
            // Remove existing script if currency changed
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                const existingCurrency = new URLSearchParams(existingScript.src.split('?')[1]).get('currency');
                if (existingCurrency !== currency) {
                    existingScript.remove();
                    setIsScriptLoaded(false); // Reset script loaded state
                }
            }
            
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = `https://www.paypal.com/sdk/js?client-id=${config.client_id}&currency=${currency}`;
                script.onload = () => setIsScriptLoaded(true);
                script.onerror = (e) => {
                    console.error("Failed to load PayPal SDK", e);
                    setIsLoading(false);
                    toast.error("Failed to load PayPal payment interface.");
                };
                document.body.appendChild(script);
            } else {
                setIsScriptLoaded(true);
            }
        };

        loadScript();
    }, [config, currency]);

    useEffect(() => {
        if (!isScriptLoaded || !window.paypal) return;

        const timer = setTimeout(() => {
            setIsLoading(false);
            const buttonContainer = document.getElementById('paypal-button-container-public');
            if (!buttonContainer) {
                console.error('PayPal container not found');
                return;
            }

            buttonContainer.innerHTML = '';

            try {
                window.paypal.Buttons({
                    createOrder: async (data, actions) => {
                        try {
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        currency_code: currency,
                                        value: amount.toFixed(2)
                                    }
                                }]
                            });
                        } catch (error) {
                            console.error('PayPal createOrder error:', error);
                            toast.error('Could not initiate PayPal payment. Please try again.');
                            onPaymentCancel();
                            return Promise.reject(error);
                        }
                    },
                    onApprove: async (data, actions) => {
                        try {
                            const details = await actions.order.capture();
                            if (details.status === 'COMPLETED') {
                                const paymentId = details.purchase_units[0].payments.captures[0].id;
                                onPaymentSuccess(paymentId);
                            } else {
                                toast.error('PayPal payment not completed. Status: ' + details.status);
                                onPaymentCancel();
                            }
                        } catch (error) {
                            console.error('PayPal onApprove error:', error);
                            toast.error('An error occurred during PayPal payment processing.');
                            onPaymentCancel();
                        }
                    },
                    onCancel: function (data) {
                        console.log('PayPal: User cancelled the payment.');
                        onPaymentCancel();
                    },
                    onError: (err) => {
                        console.error('PayPal onError:', err);
                        toast.error('An error occurred with the PayPal payment.');
                        setIsLoading(false);
                    },
                }).render('#paypal-button-container-public').catch(error => {
                    console.error('PayPal render error:', error);
                    toast.error('Failed to render PayPal buttons.');
                    setIsLoading(false);
                });
            } catch (error) {
                console.error('PayPal initialization error:', error);
                toast.error('Failed to initialize PayPal.');
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [isScriptLoaded, amount, currency, onPaymentSuccess, onPaymentCancel]);

    return (
        <div className="relative min-h-[100px] flex justify-center items-center">
            {isLoading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
                    <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                </div>
            )}
            <div id="paypal-button-container-public" className="w-full"></div>
        </div>
    );
};

// Thank You Modal Component
const ThankYouModal = ({ isOpen, onClose, donationData, paymentReference }) => {
    const [downloading, setDownloading] = useState(null);

    const handleDownload = async (documentType) => {
        setDownloading(documentType);
        try {
            const response = await generateDonationDocument({ donationId: donationData.id, documentType });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `madhatv-${documentType}-${donationData.id.slice(-6)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Download failed', error);
            toast.error('Failed to download document.');
        } finally {
            setDownloading(null);
        }
    };

    const handleView = async (documentType) => {
        try {
            const response = await generateDonationDocument({ donationId: donationData.id, documentType });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('View failed', error);
            toast.error('Failed to open document.');
        }
    };

    const currencySymbol = donationData?.currency === 'INR' ? '₹' : '$';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-3">
                            <CheckCircle className="w-8 h-8" />
                            Thank You for Your Donation!
                        </DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-800 mb-2">
                            {currencySymbol}{donationData?.amount?.toLocaleString()}
                        </div>
                        <p className="text-lg text-slate-600">
                            Your generous contribution has been received successfully.
                        </p>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Payment Reference:</strong> {paymentReference}
                            </p>
                        </div>
                    </div>

                    <Alert className="bg-green-50 border-green-200 text-green-700">
                        <Award className="h-4 w-4" />
                        <AlertDescription>
                            A receipt and certificate have been sent to your email address ({donationData?.donor_email}).
                        </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    Donation Receipt
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-slate-600">Official receipt for your donation with payment details.</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleView('receipt')}
                                        className="flex-1"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload('receipt')}
                                        disabled={downloading === 'receipt'}
                                        className="flex-1"
                                    >
                                        {downloading === 'receipt' ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downloading...</>
                                        ) : (
                                            <><Download className="w-4 h-4 mr-2" />Download</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    Certificate of Appreciation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-slate-600">Beautiful certificate recognizing your generous contribution.</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleView('certificate')}
                                        className="flex-1"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload('certificate')}
                                        disabled={downloading === 'certificate'}
                                        className="flex-1"
                                    >
                                        {downloading === 'certificate' ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downloading...</>
                                        ) : (
                                            <><Download className="w-4 h-4 mr-2" />Download</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center pt-4 border-t">
                        <p className="text-slate-600 mb-4">
                            "The liberal soul shall be made fat: and he that watereth shall be watered also himself." - Proverbs 11:25
                        </p>
                        <Button 
                            onClick={onClose}
                            className="bg-[#B71C1C] hover:bg-[#D32F2F] text-white px-8"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function DonatePage() {
    const [amount, setAmount] = useState(1000); // Amount in actual currency units (no conversion)
    const [customAmount, setCustomAmount] = useState('');
    const [donationType, setDonationType] = useState('one_time');
    const [currency, setCurrency] = useState('INR');
    const [paymentGateway, setPaymentGateway] = useState('razorpay');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', pan: '', intention: 'General Donation' });
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');
    const [completedDonation, setCompletedDonation] = useState(null);
    const [razorpayConfig, setRazorpayConfig] = useState(null);
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const [otpState, setOtpState] = useState({ step: 'initial', otp: '', error: '' });

    const [payPalConfig, setPayPalConfig] = useState(null);
    const [payPalEnabled, setPayPalEnabled] = useState(false);
    const [showPayPal, setShowPayPal] = useState(false);
    const [pendingDonation, setPendingDonation] = useState(null);

    useEffect(() => {
        const init = async () => {
            await checkUser();
            await loadRazorpayConfig();
            await loadPayPalConfig();
            await loadRazorpayScript();
        };
        init();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            if (currentUser) {
                setFormData(prev => ({ 
                    ...prev, 
                    name: currentUser.full_name || '', 
                    email: currentUser.email || '', 
                    phone: currentUser.phone || '' 
                }));
                const detection = detectCurrencyFromPhone(currentUser.phone);
                setCurrency(detection.currency);
                setPaymentGateway(detection.gateway);
                setAmount(detection.currency === 'INR' ? 1000 : 25); // No conversion needed
            } else {
                setCurrency('INR');
                setPaymentGateway('razorpay');
                setAmount(1000); // No conversion needed
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
              console.error("An unexpected error occurred while checking user status:", error);
            }
            setUser(null);
            setCurrency('INR');
            setPaymentGateway('razorpay');
            setAmount(1000); // No conversion needed
        }
    };
    
    const loadRazorpayConfig = async () => {
        setIsConfigLoading(true);
        try {
            const configs = await RazorpayConfig.filter({ config_type: 'donations' });
            if (configs.length > 0) {
                const config = configs[0];
                setRazorpayConfig(config);
                setRazorpayEnabled(config.is_enabled && config.key_id && config.key_secret);
            } else { 
                setRazorpayEnabled(false); 
            }
        } catch (error) {
            console.error("Failed to load Razorpay config", error);
            setRazorpayEnabled(false);
        }
        setIsConfigLoading(false);
    };

    const loadPayPalConfig = async () => {
        setIsConfigLoading(true);
        try {
            const configs = await PayPalConfig.filter({ config_type: 'donations' });
            if (configs.length > 0) {
                setPayPalConfig(configs[0]);
                setPayPalEnabled(configs[0].is_enabled && configs[0].client_id);
            } else {
                setPayPalEnabled(false);
            }
        } catch (error) {
            console.error("Failed to load PayPal config", error);
            setPayPalEnabled(false);
        } finally {
            setIsConfigLoading(false);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'phone' && value) {
            const detection = detectCurrencyFromPhone(value);
            setCurrency(detection.currency);
            setPaymentGateway(detection.gateway);
            setAmount(detection.currency === 'INR' ? 1000 : 25); // No conversion needed
        }
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Please fill in Name, Email, and Phone Number.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return false;
        }
        if (formData.phone.replace(/\D/g, '').length < 7) {
            toast.error('Please enter a valid phone number.');
            return false;
        }
        if (amount <= 0) {
            toast.error('Donation amount must be greater than zero.');
            return false;
        }
        return true;
    };

    const checkExistingDonor = async () => {
        try {
            // Check if donor exists by phone OR email
            const phoneProfiles = await DonorProfile.filter({ phone_number: formData.phone });
            const emailProfiles = await DonorProfile.filter({ email: formData.email });
            
            return phoneProfiles.length > 0 || emailProfiles.length > 0;
        } catch (error) {
            console.error('Error checking existing donor:', error);
            return false;
        }
    };

    const initiateDonationProcess = async () => {
        if (!validateForm()) return;
        setIsLoading(true);

        if (user) {
            // User is logged in, proceed directly to payment
            await processPayment();
            return;
        }

        try {
            // Check if donor exists
            const donorExists = await checkExistingDonor();
            
            if (donorExists) {
                toast.info('Welcome back! Proceeding to payment.');
                await processPayment();
            } else {
                // New donor, send OTP
                const { data } = await sendOTP({ phone_number: formData.phone });
                if (data.success) {
                    toast.success('OTP sent to your phone for verification.');
                    setOtpState({ step: 'input', otp: '', error: '' });
                } else {
                    toast.error(data.message || 'Failed to send OTP. Please check your phone number.');
                }
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error in donation process:", error);
            toast.error("Could not process your request. Please try again.");
            setIsLoading(false);
        }
    };
    
    const handleVerifyAndPay = async () => {
        if (otpState.otp.length !== 4) {
            setOtpState(prev => ({ ...prev, error: 'OTP must be 4 digits.' }));
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await verifyOTP({ phone_number: formData.phone, otp_code: otpState.otp });
            if (data.success) {
                toast.success('Phone verified successfully!');
                // Create donor profile for future reference
                await DonorProfile.create({ 
                    phone_number: formData.phone, 
                    full_name: formData.name, 
                    email: formData.email,
                    address: '', 
                    city: '', 
                    state: '', 
                    pin_code: ''
                });
                setOtpState({ step: 'verified', otp: '', error: '' });
                await processPayment();
            } else {
                setOtpState(prev => ({ ...prev, error: data.message || "Invalid OTP" }));
                toast.error(data.message || 'Invalid OTP. Please try again.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error("OTP verification failed:", error);
            toast.error("OTP verification failed. Please try again.");
            setIsLoading(false);
        }
    };

    const processPayment = async () => {
        setIsLoading(true);

        const donationDataPayload = {
            amount: amount, // No conversion - pass amount as-is
            currency: currency,
            donation_type: donationType,
            donor_name: formData.name,
            donor_email: formData.email,
            donor_phone: formData.phone,
            pan_number: formData.pan,
            intention: formData.intention,
            payment_method: paymentGateway,
            payment_status: 'pending',
            user_id: user?.id || null
        };

        let donation;
        try {
            donation = await Donation.create(donationDataPayload);
            setPendingDonation(donation);
        } catch (error) {
            console.error('Error creating donation record:', error);
            toast.error('Failed to create donation record. Please try again.');
            setIsLoading(false);
            return;
        }
        
        if (paymentGateway === 'paypal') {
            if (!payPalEnabled) {
                toast.error('PayPal is not enabled.');
                setIsLoading(false);
                await Donation.update(donation.id, { payment_status: 'failed' });
                return;
            }
            setShowPayPal(true);
            setIsLoading(false);
        } else if (paymentGateway === 'razorpay' && currency === 'INR') {
            if (!razorpayEnabled) {
                toast.error('Razorpay is not enabled.');
                setIsLoading(false);
                await Donation.update(donation.id, { payment_status: 'failed' });
                return;
            }
            
            try {
                const { data: order } = await createRazorpayOrder({ 
                    amount: amount, // No conversion - Razorpay backend will handle paisa conversion
                    currency: currency, 
                    receipt: `DN${Date.now()}`,
                    config_type: 'donations'
                });
                
                if (order && order.id) {
                    const options = {
                        key: razorpayConfig.key_id,
                        name: 'Madha TV',
                        description: 'Donation',
                        order_id: order.id,
                        handler: async function (response) {
                            if (response.razorpay_payment_id) {
                                const updatedDonation = await Donation.update(donation.id, {
                                    payment_status: 'completed',
                                    payment_id: response.razorpay_payment_id,
                                    order_id: response.razorpay_order_id,
                                    signature: response.razorpay_signature
                                });
                                setPaymentReference(response.razorpay_payment_id);
                                setCompletedDonation({ ...donationDataPayload, id: donation.id, payment_id: response.razorpay_payment_id });
                                setDonationSuccess(true);
                                await generateAndSendDocuments(donation.id, { 
                                    ...donationDataPayload, 
                                    payment_id: response.razorpay_payment_id 
                                });
                                toast.success('Thank you for your generous donation!');
                            } else {
                                toast.error('Payment failed or cancelled.');
                                await Donation.update(donation.id, { payment_status: 'failed' });
                            }
                            setIsLoading(false);
                        },
                        modal: {
                            ondismiss: async function() {
                                // Handle Razorpay popup cancellation
                                console.log('Razorpay payment popup was dismissed/cancelled');
                                
                                // Update donation status to cancelled
                                if (donation?.id) {
                                    await Donation.update(donation.id, { payment_status: 'cancelled' });
                                }
                                
                                // Reset UI state
                                setIsLoading(false);
                                setPendingDonation(null);
                                
                                // Show clear cancellation message
                                toast.info('❗ Payment was cancelled. No amount has been charged.\nYou can try again when you\'re ready.', {
                                    duration: 5000,
                                });
                                
                                // Reset OTP state if applicable
                                if (otpState.step !== 'initial') {
                                    setOtpState({ step: 'initial', otp: '', error: '' });
                                }
                            }
                        },
                        prefill: {
                            name: formData.name,
                            email: formData.email,
                            contact: formData.phone,
                        },
                        theme: {
                            color: '#B71C1C',
                        },
                    };
                    const rzp1 = new window.Razorpay(options);
                    rzp1.open();
                } else {
                    toast.error('Failed to create payment order.');
                    await Donation.update(donation.id, { payment_status: 'failed' });
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Payment processing error:', error);
                toast.error('Failed to process payment. Please try again.');
                await Donation.update(donation.id, { payment_status: 'failed' });
                setIsLoading(false);
            }
        } else {
            toast.error(`Selected payment method (${paymentGateway}) or currency (${currency}) is not supported.`);
            await Donation.update(donation.id, { payment_status: 'failed' });
            setIsLoading(false);
        }
    };

    const handlePayPalSuccess = async (paymentId) => {
        if (pendingDonation) {
            const updatedDonation = await Donation.update(pendingDonation.id, { 
                payment_status: 'completed', 
                payment_id: paymentId 
            });
            setPaymentReference(paymentId);
            setCompletedDonation({ ...pendingDonation, payment_id: paymentId });
            setDonationSuccess(true);
            await generateAndSendDocuments(pendingDonation.id, { 
                ...pendingDonation, 
                payment_id: paymentId 
            });
            toast.success('Thank you for your generous donation!');
            setShowPayPal(false);
            setIsLoading(false);
            setPendingDonation(null); // Clear pending donation
        } else {
            toast.error('Donation record not found. Please contact support.');
            setIsLoading(false);
        }
    };

    const handlePayPalCancel = async () => {
        console.log('PayPal payment was cancelled by user or encountered an error.');
        
        // Update donation status to cancelled
        if (pendingDonation?.id) {
            await Donation.update(pendingDonation.id, { payment_status: 'cancelled' });
        }
        
        // Reset UI state
        setShowPayPal(false);
        setIsLoading(false);
        setPendingDonation(null); // Clear pending donation
        
        // Show clear cancellation message
        toast.info('❗ Payment was cancelled. No amount has been charged.\nYou can try again when you\'re ready.', {
            duration: 5000,
        });
        
        // Reset OTP state if applicable
        if (otpState.step !== 'initial') {
            setOtpState({ step: 'initial', otp: '', error: '' });
        }
    };

    const generateAndSendDocuments = async (donationId, donationData) => {
        try {
            await sendTransactionalEmail({ 
                type: 'donation_receipt', 
                data: { id: donationId, ...donationData } 
            });
            console.log('✅ Email with attachments sent successfully.');
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            // Don't show error to user as donation was successful
        }
    };

    const handleAmountSelect = (selectedAmount) => {
        setAmount(selectedAmount); // No conversion needed
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        if (value && !isNaN(value) && parseFloat(value) > 0) {
            setAmount(parseFloat(value)); // No conversion needed
        } else if (value === '') {
            setAmount(0);
        }
    };

    const renderDonateButton = () => {
        if (otpState.step === 'input') {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-blue-500" />
                        <Input
                            placeholder="Enter 4-digit OTP"
                            value={otpState.otp}
                            onChange={(e) => setOtpState({...otpState, otp: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                            maxLength={4}
                            inputMode="numeric"
                        />
                    </div>
                    <Button onClick={handleVerifyAndPay} disabled={isLoading || otpState.otp.length !== 4} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</> : 'Verify & Donate'}
                    </Button>
                    {otpState.error && <p className="text-red-500 text-sm text-center">{otpState.error}</p>}
                </div>
            );
        }

        const isButtonDisabled = isLoading || isConfigLoading ||
                               (paymentGateway === 'razorpay' && !razorpayEnabled && currency === 'INR') ||
                               (paymentGateway === 'paypal' && !payPalEnabled && currency !== 'INR');

        return (
            <Button
                onClick={initiateDonationProcess}
                disabled={isButtonDisabled}
                className="w-full bg-[#B71C1C] hover:bg-[#D32F2F] text-white text-lg py-6 shadow-lg"
            >
                {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : <><Heart className="w-5 h-5 mr-2" /> Donate Now</>}
            </Button>
        );
    };

    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const currentPresets = amountPresets[currency];

    if (showPayPal) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-800">Complete Payment with PayPal</CardTitle>
                        <p className="text-gray-600">Complete your donation of {currencySymbol}{amount.toFixed(2)}</p>
                    </CardHeader>
                    <CardContent>
                        {payPalEnabled && payPalConfig && pendingDonation ? (
                            <>
                                <PayPalButton
                                    amount={amount}
                                    currency={currency}
                                    config={payPalConfig}
                                    onPaymentSuccess={handlePayPalSuccess}
                                    onPaymentCancel={handlePayPalCancel}
                                />
                                <Button
                                    onClick={handlePayPalCancel}
                                    variant="outline"
                                    className="w-full mt-4"
                                >
                                    Cancel Payment
                                </Button>
                            </>
                        ) : (
                            <p className="text-red-500 text-center">PayPal is not available or configuration is missing. Please try again later or choose another method.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AIFloatingChat />
            <PageBanner 
                pageKey="donate"
                fallbackTitle="Support Our Mission"
                fallbackDescription="Your generous donations help us spread faith and bring spiritual content to families worldwide"
                fallbackImage="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2940&auto=format&fit=crop"
            />
            
            <div className="pt-16">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="container mx-auto px-4 py-16"
                >
                    <Card className="max-w-3xl mx-auto shadow-lg">
                        <CardHeader className="text-center bg-[#B71C1C] text-white rounded-t-lg py-6">
                            <CardTitle className="text-4xl font-extrabold flex items-center justify-center">
                                <Heart className="w-10 h-10 mr-4" /> Make a Donation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Your Details</h3>
                                    <div className="space-y-4">
                                        <Input placeholder="Full Name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} required />
                                        <Input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} required />
                                        <Input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} required />
                                        <Input placeholder="PAN Number (Optional, for tax benefits)" value={formData.pan} onChange={(e) => handleFormChange('pan', e.target.value)} />
                                        <Textarea placeholder="Intention (e.g., For education, healthcare, general fund)" value={formData.intention} onChange={(e) => handleFormChange('intention', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Donation Amount & Type</h3>
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {currentPresets?.map((preset) => (
                                                <Button
                                                    key={preset}
                                                    variant={amount === preset ? "default" : "outline"}
                                                    onClick={() => handleAmountSelect(preset)}
                                                    className={amount === preset ? "bg-[#B71C1C] hover:bg-[#D32F2F] text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100"}
                                                >
                                                    {currencySymbol}{preset}
                                                </Button>
                                            ))}
                                        </div>
                                        <Input
                                            type="number"
                                            placeholder={`Other Amount (${currency})`}
                                            value={customAmount !== '' ? customAmount : amount.toFixed(2)}
                                            onChange={handleCustomAmountChange}
                                            min="1"
                                            className="text-lg py-6"
                                        />

                                        <Select value={donationType} onValueChange={setDonationType}>
                                            <SelectTrigger className="w-full text-lg py-6">
                                                <SelectValue placeholder="Select Donation Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="one_time">One-Time Donation</SelectItem>
                                                <SelectItem value="monthly">Monthly Donation</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={paymentGateway} onValueChange={setPaymentGateway}>
                                            <SelectTrigger className="w-full text-lg py-6">
                                                <SelectValue placeholder="Select Payment Method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currency === 'INR' && (
                                                    <SelectItem value="razorpay" disabled={!razorpayEnabled}>
                                                        <div className="flex items-center">
                                                            <CreditCard className="mr-2 h-4 w-4" /> Razorpay (Cards, UPI, Netbanking)
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                {currency !== 'INR' && (
                                                    <SelectItem value="paypal" disabled={!payPalEnabled}>
                                                        <div className="flex items-center">
                                                            <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-mark-color.svg" alt="PayPal" className="h-4 w-4 mr-2" /> PayPal
                                                        </div>
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>

                                        {!isConfigLoading && paymentGateway === 'razorpay' && !razorpayEnabled && currency === 'INR' && (
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Razorpay is currently not enabled for donations.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        {!isConfigLoading && paymentGateway === 'paypal' && !payPalEnabled && currency !== 'INR' && (
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    PayPal is currently not enabled for donations.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                {renderDonateButton()}
                                <p className="text-sm text-center text-gray-500">
                                    By clicking "Donate Now", you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Thank You Modal */}
            <ThankYouModal
                isOpen={donationSuccess}
                onClose={() => {
                    setDonationSuccess(false);
                    setCompletedDonation(null);
                    setPaymentReference('');
                    // Reset form for new donation
                    setAmount(currency === 'INR' ? 1000 : 25);
                    setCustomAmount('');
                    setOtpState({ step: 'initial', otp: '', error: '' });
                }}
                donationData={completedDonation}
                paymentReference={paymentReference}
            />
            <DTVChannels />
            <DynamicFooter />
        </div>
    );
}
