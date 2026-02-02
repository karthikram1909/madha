
import React, { useState, useEffect } from 'react';
import { Donation, RazorpayConfig, PayPalConfig } from '@/api/entities';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle, Loader2, FileText, Gift, History, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { createRazorpayOrder } from '@/api/functions';
import { generateDonationDocument } from '@/api/functions';
import { sendTransactionalEmail } from '@/api/functions';
import { toast } from 'sonner';
import { createRazorpaySubscription } from '@/api/functions';
// This import remains as per the original file, even if its usage in PayPalButton is altered.
import { sendOTP } from '@/api/functions';
import { verifyOTP } from '@/api/functions';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label'; // Added Label import
import { base44 } from '@/api/base44Client'; // Added base44 import

const amountPresets = {
    INR: [500, 1000, 2500, 5000],
    USD: [10, 25, 50, 100],
};

const detectCurrencyFromPhone = (phoneNumber) => {
    if (!phoneNumber) return { currency: 'INR', country: 'IN', gateway: 'razorpay' };
    const phone = phoneNumber.toString().replace(/\s+/g, '');
    if (phone.startsWith('+91') || (phone.length === 10 && /^[9876]/.test(phone)) || (phone.startsWith('91') && phone.length === 12)) {
        return { currency: 'INR', country: 'IN', gateway: 'razorpay' };
    }
    return { currency: 'USD', country: 'International', gateway: 'paypal' };
};

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-checkout-js')) return resolve(true);
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-js';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PayPalButton = ({ amount, currency, config, onPaymentSuccess, donationId }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const scriptId = 'paypal-sdk-script';
        if (document.getElementById(scriptId) && window.paypal) {
            renderButton();
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${config.client_id}&currency=${currency}`;
        script.onload = () => renderButton();
        script.onerror = () => {
            setIsLoading(false);
            toast.error('Failed to load PayPal SDK.');
        };
        document.body.appendChild(script);

        return () => {
            const paypalButtonContainer = document.getElementById('paypal-button-container');
            if (paypalButtonContainer) {
                paypalButtonContainer.innerHTML = '';
            }
        };
    }, [config, amount, currency, onPaymentSuccess]);

    const renderButton = () => {
        setIsLoading(false);
        if (window.paypal) {
            const paypalButtonContainer = document.getElementById('paypal-button-container');
            if (paypalButtonContainer) {
                paypalButtonContainer.innerHTML = '';
            }

            window.paypal.Buttons({
                createOrder: async (data, actions) => {
                    try {
                        // Use the PayPal SDK's built-in order creation instead of our backend function
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    currency_code: currency,
                                    value: amount.toFixed(2)
                                }
                            }]
                        });
                    } catch (error) {
                        toast.error('Failed to create PayPal order.');
                        console.error('PayPal createOrder error:', error);
                        return Promise.reject(error);
                    }
                },
                onApprove: async (data, actions) => {
                    try {
                        // Capture the payment
                        const details = await actions.order.capture();
                        
                        if (details.status === 'COMPLETED') {
                            const paymentId = details.purchase_units[0].payments.captures[0].id;
                            onPaymentSuccess(paymentId);
                        } else {
                            toast.error('PayPal payment not completed.');
                        }
                    } catch (error) {
                        toast.error('Failed to capture PayPal payment.');
                        console.error('PayPal onApprove error:', error);
                    }
                },
                onError: (err) => {
                    toast.error('An error occurred with the PayPal payment.');
                    console.error('PayPal Error:', err);
                },
                onCancel: () => {
                    toast.info('PayPal payment was cancelled.');
                }
            }).render('#paypal-button-container');
        } else {
            toast.error('PayPal SDK not available.');
        }
    };

    return (
        <div className="relative min-h-[50px]">
            {isLoading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                </div>
            )}
            <div id="paypal-button-container"></div>
        </div>
    );
};

const DonationForm = ({ user, onDonationSuccess }) => {
    const [amount, setAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [donationType, setDonationType] = useState('one_time');
    const [currency, setCurrency] = useState('INR');
    const [paymentGateway, setPaymentGateway] = useState('razorpay');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', pan: '', intention: 'General Donation' });
    const [isLoading, setIsLoading] = useState(false);
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');

    const [razorpayConfig, setRazorpayConfig] = useState(null);
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [isConfigLoading, setIsConfigLoading] = useState(true);

    const [payPalConfig, setPayPalConfig] = useState(null);
    const [payPalEnabled, setPayPalEnabled] = useState(false);
    const [showPayPal, setShowPayPal] = useState(false);
    const [pendingDonation, setPendingDonation] = useState(null);

    // New state for OTP verification
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                pan: '',
                intention: 'General Donation'
            });
            const detection = detectCurrencyFromPhone(user.phone);
            setCurrency(detection.currency);
            setPaymentGateway(detection.gateway);
            setAmount(detection.currency === 'INR' ? 1000 : 25);
            // If user's phone is already verified from their profile, bypass OTP step
            if (user.sms_verified) {
                setIsPhoneVerified(true);
            }
        }
        loadRazorpayConfig();
        loadPayPalConfig();
        loadRazorpayScript();
    }, [user]);

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
            setRazorpayEnabled(false);
            console.error("Failed to load Razorpay config", error);
        }
        setIsConfigLoading(false);
    };

    const loadPayPalConfig = async () => {
        try {
            const configs = await PayPalConfig.filter({ config_type: 'donations' });
            if (configs.length > 0) {
                setPayPalConfig(configs[0]);
                setPayPalEnabled(configs[0].is_enabled && configs[0].client_id);
            } else {
                setPayPalEnabled(false);
            }
        } catch (error) {
            setPayPalEnabled(false);
            console.error("Failed to load PayPal config", error);
        }
    };

    const handleAmountSelect = (selectedAmount) => {
        setAmount(selectedAmount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        if (value && !isNaN(value) && parseFloat(value) > 0) {
            setAmount(parseFloat(value));
        } else if (value === '') {
            setAmount(0);
        }
    };

    const generateAndSendDocuments = async (donationId, donationData) => {
        try {
            const response = await sendTransactionalEmail({ type: 'donation_receipt', data: { id: donationId, ...donationData } });

            if (response.data && !response.data.email_sent) {
                toast.info('Donation completed! Email will be sent once server is available. You can download receipts from your dashboard.');
            } else {
                toast.success('Donation completed! Receipt email sent successfully.');
            }
        } catch (error) {
            console.error('Failed to send documents email:', error);
            toast.info('Donation completed! You can download receipts from your dashboard.');
        }
    };

    const handlePayPalSuccess = async (paymentId) => {
        if (!pendingDonation) {
            toast.error('Payment successful but no pending donation found. Please contact support.');
            setIsLoading(false);
            setDonationSuccess(false);
            setShowPayPal(false);
            return;
        }
        try {
            await Donation.update(pendingDonation.id, { 
                payment_status: 'completed', 
                payment_id: paymentId 
            });
            setPaymentReference(paymentId);
            setDonationSuccess(true);
            await generateAndSendDocuments(pendingDonation.id, { 
                ...pendingDonation, 
                payment_id: paymentId, 
                payment_status: 'completed' 
            });
            onDonationSuccess();
            toast.success('Thank you for your generous donation!');
            setShowPayPal(false);
            setIsLoading(false);
        } catch (error) {
            toast.error('Failed to update donation record after PayPal payment. Please contact support.');
            console.error('PayPal post-payment update error:', error);
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            toast.error("Please enter a valid 10-digit phone number.");
            return;
        }
        setIsSendingOtp(true);
        try {
            const { data } = await sendOTP({ phone_number: formData.phone });
            if (data.success) {
                toast.success(data.message);
                setShowOtpInput(true);
            } else {
                toast.error(data.message || "Failed to send OTP.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while sending OTP.");
        }
        setIsSendingOtp(false);
    };

    const handleVerifyOtp = async () => {
        if (!otpValue || otpValue.length !== 4) {
            toast.error("Please enter the 4-digit OTP.");
            return;
        }
        setIsVerifyingOtp(true);
        try {
            const { data } = await verifyOTP({ phone_number: formData.phone, otp_code: otpValue });
            if (data.success) {
                toast.success("Phone number verified successfully!");
                setIsPhoneVerified(true);
                setShowOtpInput(false);
                // If existing user, you can pre-fill more data here if needed
                if (data.is_existing_user && data.donor_profile) {
                    setFormData(prev => ({ ...prev, ...data.donor_profile }));
                }
            } else {
                toast.error(data.message || "Invalid OTP.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during verification.");
        }
        setIsVerifyingOtp(false);
    };

    const handleDonation = async () => {
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid donation amount');
            return;
        }
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Please fill in your name, email, and phone number.');
            return;
        }
        if (!isPhoneVerified) {
            toast.error("Please verify your phone number before donating.");
            return;
        }
        setIsLoading(true);
        setShowPayPal(false);

        try {
            const donationData = {
                user_id: user.id,
                donor_name: formData.name,
                donor_email: formData.email,
                donor_phone: formData.phone,
                amount: amount,
                currency: currency,
                donation_type: donationType,
                pan_number: formData.pan,
                payment_method: paymentGateway,
                payment_status: 'pending',
                country: currency === 'INR' ? 'IN' : 'International',
                terms_accepted: true,
                subscription_status: donationType === 'monthly' ? 'pending' : null,
                intention: formData.intention
            };

            const donation = await Donation.create(donationData);
            setPendingDonation(donation);

            if (paymentGateway === 'paypal') {
                if (!payPalEnabled) {
                    toast.error("Online payments via PayPal are currently unavailable. Please contact support.");
                    setIsLoading(false);
                    return;
                }
                setShowPayPal(true);
                setIsLoading(false);
            } else if (paymentGateway === 'razorpay' && currency === 'INR') {
                if (!razorpayEnabled) {
                    toast.error("Online payments via Razorpay are currently unavailable. Please contact support.");
                    setIsLoading(false);
                    return;
                }

                if (donationType === 'monthly') {
                    const { data: subData } = await createRazorpaySubscription({ planType: 'monthly', totalAmount: amount, config_type: 'donations' });

                    const options = {
                        key: razorpayConfig.key_id,
                        subscription_id: subData.subscription_id,
                        name: "Madha TV Monthly Donation",
                        description: `Monthly contribution of ${currencySymbol}${amount}`,
                        handler: async (response) => {
                            await Donation.update(donation.id, {
                                payment_status: 'completed',
                                payment_id: response.razorpay_payment_id,
                                subscription_id: subData.subscription_id,
                                plan_id: subData.plan_id,
                                subscription_status: 'active'
                            });
                            setPaymentReference(subData.subscription_id);
                            setDonationSuccess(true);
                            await generateAndSendDocuments(donation.id, { ...donationData, payment_id: response.razorpay_payment_id, subscription_id: subData.subscription_id, payment_status: 'completed' });
                            onDonationSuccess();
                            toast.success('Thank you for your monthly support!');
                            setIsLoading(false);
                        },
                        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
                        theme: { color: "#B71C1C" },
                        modal: {
                            ondismiss: () => {
                                setIsLoading(false);
                                toast.info('Payment cancelled by user.');
                            }
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();

                } else { // One-time Razorpay
                    const timestamp = Date.now().toString().slice(-8);
                    const donationIdPart = donation.id.slice(-8);
                    const receiptId = `DN${donationIdPart}${timestamp}`;

                    const { data: orderData } = await createRazorpayOrder({ amount, currency, receipt: receiptId, config_type: 'donations' });

                    const options = {
                        key: razorpayConfig.key_id,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: "Madha TV Donation",
                        description: formData.intention,
                        order_id: orderData.id,
                        handler: async (response) => {
                            await Donation.update(donation.id, { payment_status: 'completed', payment_id: response.razorpay_payment_id });
                            setPaymentReference(response.razorpay_payment_id);
                            setDonationSuccess(true);
                            await generateAndSendDocuments(donation.id, { ...donationData, payment_id: response.razorpay_payment_id, payment_status: 'completed' });
                            onDonationSuccess();
                            toast.success('Thank you for your generous donation!');
                            setIsLoading(false);
                        },
                        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
                        theme: { color: "#B71C1C" },
                        modal: {
                            ondismiss: () => {
                                setIsLoading(false);
                                toast.info('Payment cancelled by user.');
                            }
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }
            } else {
                toast.error("Unsupported payment method for the selected currency. Please contact support.");
                setIsLoading(false);
            }

        } catch (error) {
            console.error('Donation initiation error:', error);
            toast.error(error.response?.data?.error || "Donation failed. Please try again.");
            setIsLoading(false);
        }
    };

    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const currentPresets = amountPresets[currency];

    if (donationSuccess) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 bg-green-50 rounded-lg">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800">Thank You!</h3>
                <p className="text-slate-600 mt-2">Your generous donation has been received.</p>
                <p className="text-sm text-slate-500 mt-1">Ref: {paymentReference}</p>
                <Button onClick={() => { setDonationSuccess(false); setPendingDonation(null); }} className="mt-6">Make Another Donation</Button>
            </motion.div>
        );
    }

    if (showPayPal) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Complete with PayPal</CardTitle>
                    <CardDescription>Click the button below to finalize your donation of {currencySymbol}{amount}.</CardDescription>
                </CardHeader>
                <CardContent>
                    {payPalEnabled && payPalConfig && pendingDonation ? (
                        <PayPalButton
                            amount={amount}
                            currency={currency}
                            config={payPalConfig}
                            onPaymentSuccess={handlePayPalSuccess}
                            donationId={pendingDonation.id}
                        />
                    ) : (
                        <p className="text-red-500 text-center">PayPal is not available at the moment. Please try again later or choose another method.</p>
                    )}
                    <Button onClick={() => { setShowPayPal(false); setIsLoading(false); }} variant="outline" className="mt-4 w-full">Go Back</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Your Generosity Matters</CardTitle>
                    <CardDescription>Every contribution helps us spread faith and hope.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label htmlFor="donorName" className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                        <Input id="donorName" placeholder="Your full name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label htmlFor="donorEmail" className="block text-sm font-medium text-slate-700 mb-2">Your Email</label>
                        <Input id="donorEmail" type="email" placeholder="your.email@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    
                    {/* Phone & OTP Section */}
                    <div>
                        <Label htmlFor="donorPhone" className="block text-sm font-medium text-slate-700 mb-2">
                          Your Phone Number *
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="donorPhone"
                            type="tel"
                            placeholder="+91 XXXXXXXXXX"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            disabled={isPhoneVerified || showOtpInput}
                            className={isPhoneVerified ? 'border-green-500' : ''}
                          />
                          {!isPhoneVerified && (
                            <Button 
                                onClick={handleSendOtp} 
                                disabled={isSendingOtp || showOtpInput} 
                                className="whitespace-nowrap"
                                variant="outline"
                            >
                              {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                            </Button>
                          )}
                        </div>
                        {isPhoneVerified && <p className="text-xs text-green-600 mt-1">✓ Phone number verified.</p>}
                    </div>

                    {showOtpInput && !isPhoneVerified && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                           <Label htmlFor="otpInput">Enter OTP</Label>
                           <div className="flex gap-2 items-center">
                                <Input
                                    id="otpInput"
                                    type="text"
                                    maxLength={4}
                                    placeholder="4-digit code"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                />
                                <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp}>
                                    {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                                </Button>
                           </div>
                        </motion.div>
                    )}


                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Donation Type</label>
                        <Select value={donationType} onValueChange={setDonationType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="one_time">One-Time</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select an Amount ({currencySymbol})</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {currentPresets.map(val => (
                                <Button key={val} variant={amount === val && customAmount === '' ? 'default' : 'outline'} onClick={() => handleAmountSelect(val)}>
                                    {currencySymbol}{val}
                                </Button>
                            ))}
                        </div>
                        <Input
                            type="number"
                            placeholder={`Or enter a custom amount in ${currency}`}
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Intention</label>
                        <Textarea placeholder="e.g., For the well-being of my family" value={formData.intention} onChange={(e) => setFormData({...formData, intention: e.target.value})} />
                    </div>

                    {currency === 'INR' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">PAN Number (Optional, for 80G)</label>
                            <Input placeholder="Enter your PAN" value={formData.pan} onChange={(e) => setFormData({...formData, pan: e.target.value})} />
                        </div>
                    )}

                    <Button
                        onClick={handleDonation}
                        disabled={
                            isLoading ||
                            !isPhoneVerified || // Disable if phone not verified
                            isConfigLoading ||
                            (paymentGateway === 'razorpay' && !razorpayEnabled && currency === 'INR') ||
                            (paymentGateway === 'paypal' && !payPalEnabled && currency !== 'INR') ||
                            amount <= 0 ||
                            !formData.name || !formData.email || !formData.phone
                        }
                        className="w-full bg-[#B71C1C] hover:bg-[#D32F2F] text-white text-lg py-6 shadow-lg"
                    >
                        {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : !isPhoneVerified ? 'Verify Phone to Donate' : <><Heart className="w-5 h-5 mr-2" /> Donate {currencySymbol}{amount}</>}
                    </Button>

                    {!isConfigLoading && (
                        (paymentGateway === 'razorpay' && !razorpayEnabled && currency === 'INR') ||
                        (paymentGateway === 'paypal' && !payPalEnabled && currency !== 'INR')
                    ) && (
                            <p className="text-xs text-red-600 text-center">
                                Online payments via {paymentGateway.charAt(0).toUpperCase() + paymentGateway.slice(1)} are temporarily unavailable. Please try again later.
                            </p>
                        )}
                </CardContent>
            </Card>

            <div className="bg-slate-100/50 rounded-lg p-8 flex flex-col justify-center items-center text-center">
                <Gift className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">A Blessing for Your Kindness</h3>
                <p className="text-slate-600 mt-2 max-w-sm">"The liberal soul shall be made fat: and he that watereth shall be watered also himself." (Proverbs 11:25)</p>
                <p className="text-slate-600 mt-4">May God bless you abundantly for your generosity and support of our mission.</p>
            </div>
        </div>
    );
};

const DonationHistory = ({ user, refreshTrigger }) => {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        const fetchDonations = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const userDonations = await Donation.filter({ user_id: user.id }, '-created_date');
                setDonations(userDonations);
            } catch (error) {
                console.error("Failed to fetch donation history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDonations();
    }, [user, refreshTrigger]);

    const handleDownload = async (donation, documentType) => {
        setDownloading(`${donation.id}-${documentType}`);
        try {
            const response = await generateDonationDocument({ donationId: donation.id, documentType });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const donorName = (donation.donor_name || 'donor').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/gi, '');
            const filename = documentType === 'receipt'
                ? `SCC_Receipt_${donation.id.slice(-5)}_${donorName}.pdf`
                : `madhatv-certificate-${donation.id.slice(-6)}.pdf`;
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Download failed', error);
            const errorMessage = error.response?.data?.error || 'Failed to download document.';
            toast.error(errorMessage);
        } finally {
            setDownloading(null);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center p-10"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    if (donations.length === 0) return <p className="text-center text-slate-500 p-10">You have not made any donations yet.</p>;

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle>Your Donation History</CardTitle>
                <CardDescription>View your past contributions and download documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {donations.map(donation => (
                            <TableRow key={donation.id}>
                                <TableCell>{format(new Date(donation.created_date), 'PPP')}</TableCell>
                                <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: donation.currency }).format(donation.amount)}</TableCell>
                                <TableCell className="capitalize">{donation.donation_type.replace('_', ' ')}</TableCell>
                                <TableCell><Badge variant={donation.payment_status === 'completed' ? 'success' : 'destructive'}>{donation.payment_status}</Badge></TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownload(donation, 'receipt')}
                                            disabled={downloading === `${donation.id}-receipt`}
                                            className="flex items-center gap-1"
                                        >
                                            {downloading === `${donation.id}-receipt` ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                            Receipt
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownload(donation, 'certificate')}
                                            disabled={downloading === `${donation.id}-certificate`}
                                            className="flex items-center gap-1"
                                        >
                                            {downloading === `${donation.id}-certificate` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                            Certificate
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default function UserDonationsPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                console.error("User not found, redirecting");
                base44.auth.redirectToLogin(window.location.pathname);
            }
            setIsLoading(false);
        };
        fetchUser();
    }, []);

    const handleDonationSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <UserDashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </UserDashboardLayout>
        );
    }

    return (
        <UserDashboardLayout>
            <div className="p-4 md:p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Make a Donation</h1>
                <Tabs defaultValue="donate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="donate"><Heart className="w-4 h-4 mr-2" />New Donation</TabsTrigger>
                        <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />Donation History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="donate" className="mt-6">
                        <DonationForm user={user} onDonationSuccess={handleDonationSuccess} />
                    </TabsContent>
                    <TabsContent value="history" className="mt-6">
                        <DonationHistory user={user} refreshTrigger={refreshTrigger} />
                    </TabsContent>
                </Tabs>
            </div>
        </UserDashboardLayout>
    );
}
