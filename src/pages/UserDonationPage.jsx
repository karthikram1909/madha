import React, { useState, useEffect } from 'react';
import { Donation, User, RazorpayConfig } from '@/api/entities';
// Assuming this exists for image uploads
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, IndianRupee, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const amountPresets = [500, 1000, 2500, 5000];
const loadRazorpayScript = () => new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    document.body.appendChild(script);
});

export default function UserDonationPage() {
    const [user, setUser] = useState(null);
    const [amount, setAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [donationType, setDonationType] = useState('one_time');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        pan: '',
        intention: 'General Donation'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('form'); // 'form', 'success', 'failure'
    
    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setFormData(prev => ({
                    ...prev,
                    name: currentUser.full_name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || ''
                }));
                await loadRazorpayScript();
            } catch (err) {
                // Not logged in, redirect? For now, we assume they are.
            }
        };
        loadUser();
    }, []);

    const handleAmountSelect = (value) => {
        setAmount(value);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setCustomAmount(value);
        if (value) {
            setAmount(parseInt(value, 10));
        }
    };

    const handlePayment = async () => {
        if (!formData.name || !formData.phone || !formData.email || amount < 1) {
            setError('Please fill all required fields and enter a valid amount.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const [razorpayConfig] = await RazorpayConfig.filter({ is_enabled: true });
            if (!razorpayConfig || !razorpayConfig.key_id) {
                throw new Error("Payment gateway is not configured.");
            }

            const newDonation = await Donation.create({
                user_id: user.id,
                donor_name: formData.name,
                donor_email: formData.email,
                donor_phone: formData.phone,
                amount: amount,
                pan_number: formData.pan,
                donation_type: donationType,
                payment_status: 'pending'
            });

            const options = {
                key: razorpayConfig.key_id,
                amount: amount * 100,
                currency: "INR",
                name: "Madha TV",
                description: `Donation: ${formData.intention}`,
                order_id: newDonation.payment_id,
                handler: async function (response) {
                    await Donation.update(newDonation.id, {
                        payment_id: response.razorpay_payment_id,
                        payment_status: 'completed'
                    });
                    // Here you would trigger invoice generation/email
                    setStep('success');
                    setIsLoading(false);
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: { color: "#B71C1C" },
                 modal: {
                    ondismiss: async function() {
                        await Donation.update(newDonation.id, { payment_status: 'failed' });
                        setIsLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', async function (response) {
                await Donation.update(newDonation.id, {
                    payment_status: 'failed',
                    payment_id: response.error.metadata.payment_id
                });
                setError(`Payment failed: ${response.error.description}`);
                setStep('failure');
                setIsLoading(false);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
            setStep('failure');
            setIsLoading(false);
        }
    };

    const renderForm = () => (
        <Card className="shadow-xl border-0">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-slate-800">Support Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Choose Donation Amount (INR)</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {amountPresets.map(preset => (
                                <Button
                                    key={preset}
                                    variant={amount === preset && !customAmount ? 'default' : 'outline'}
                                    onClick={() => handleAmountSelect(preset)}
                                    className={`h-12 text-lg ${amount === preset && !customAmount ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                >
                                    <IndianRupee className="w-5 h-5 mr-2" /> {preset}
                                </Button>
                            ))}
                        </div>
                        <Input
                            type="text"
                            placeholder="Enter Custom Amount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className="mt-3 h-12 text-lg"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Donation Frequency</h3>
                        <div className="flex gap-3">
                            {['one_time', 'monthly', 'yearly'].map(type => (
                                <Button
                                    key={type}
                                    variant={donationType === type ? 'default' : 'outline'}
                                    onClick={() => setDonationType(type)}
                                    className={`flex-1 capitalize ${donationType === type ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                >
                                    {type.replace('_', ' ')}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Information</h3>
                    <div>
                        <label className="text-sm font-medium">Full Name*</label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                     <div>
                        <label className="text-sm font-medium">Email Address*</label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Phone Number*</label>
                        <Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                        <div className="flex gap-3">
                           <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handlePayment} disabled={isLoading}>
                               {isLoading ? (
                                   <Loader2 className="w-6 h-6 animate-spin" />
                               ) : (
                                   <>
                                       <Heart className="w-5 h-5 mr-2" /> Donate ₹{amount} with Razorpay
                                   </>
                               )}
                           </Button>
                           <Button className="w-full" disabled={true} variant="outline">Donate with PayPal</Button>
                        </div>
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
    
    const renderSuccess = () => (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-lg mx-auto">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h1>
            <p className="text-slate-600 mb-8">Your generous donation has been received. A receipt will be sent to your email shortly.</p>
            <Button onClick={() => setStep('form')}>Make Another Donation</Button>
        </motion.div>
    );

    const renderFailure = () => (
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-lg mx-auto">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Failed</h1>
            <p className="text-slate-600 mb-8">{error || "An unexpected error occurred. Please try again."}</p>
            <Button onClick={() => setStep('form')}>Try Again</Button>
        </motion.div>
    );

    return (
        <UserDashboardLayout>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {step === 'form' && renderForm()}
                    {step === 'success' && renderSuccess()}
                    {step === 'failure' && renderFailure()}
                </motion.div>
            </AnimatePresence>
        </UserDashboardLayout>
    );
}