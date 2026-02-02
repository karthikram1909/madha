import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Heart, 
  CreditCard,
  Gift,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Donation } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';

const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

export default function DonationForm({ isOpen, onClose, onSuccess, user }) {
  const [step, setStep] = useState(1);
  const [donationType, setDonationType] = useState('one_time');
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    donor_name: user?.full_name || '',
    donor_email: user?.email || '',
    donor_phone: user?.phone || '',
    donor_address: user?.address_line_1 || '',
    pan_number: '',
    terms_accepted: false
  });

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setAmount(parseInt(value) || 0);
  };

  const handleNext = () => {
    if (step === 1 && amount < 100) {
      alert('Minimum donation amount is ₹100');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms_accepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    setIsProcessing(true);
    try {
      const donationData = {
        ...formData,
        user_id: user?.id,
        amount,
        donation_type: donationType,
        currency: 'INR',
        payment_method: 'razorpay',
        payment_status: 'pending'
      };

      await Donation.create(donationData);
      
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }, 2000);
      
    } catch (error) {
      console.error('Donation failed:', error);
      setIsProcessing(false);
      alert('Donation failed. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Make a Donation
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
              <p className="text-slate-600">Your donation has been processed successfully.</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  {/* Donation Type */}
                  <Tabs value={donationType} onValueChange={setDonationType}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="one_time">One-Time</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Amount Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select Amount</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {predefinedAmounts.map((presetAmount) => (
                        <Card
                          key={presetAmount}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            amount === presetAmount && !customAmount ? 'ring-2 ring-[#B71C1C] bg-red-50' : ''
                          }`}
                          onClick={() => handleAmountSelect(presetAmount)}
                        >
                          <CardContent className="p-4 text-center">
                            <p className="text-xl font-bold">₹{presetAmount.toLocaleString()}</p>
                            {donationType !== 'one_time' && (
                              <p className="text-sm text-slate-500">/{donationType.replace('_', ' ')}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Custom amount"
                        type="number"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-slate-500">₹</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNext} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Donation Summary */}
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-red-600" />
                          <span className="font-semibold">
                            {donationType === 'one_time' ? 'One-Time' : 
                             donationType === 'monthly' ? 'Monthly' : 'Yearly'} Donation
                          </span>
                        </div>
                        <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                          ₹{amount.toLocaleString()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Donor Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={formData.donor_name}
                      onChange={(e) => setFormData({...formData, donor_name: e.target.value})}
                      required
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={formData.donor_email}
                      onChange={(e) => setFormData({...formData, donor_email: e.target.value})}
                      required
                    />
                    <Input
                      placeholder="Phone Number"
                      value={formData.donor_phone}
                      onChange={(e) => setFormData({...formData, donor_phone: e.target.value})}
                      required
                    />
                    <Input
                      placeholder="PAN Number (Optional)"
                      value={formData.pan_number}
                      onChange={(e) => setFormData({...formData, pan_number: e.target.value})}
                    />
                  </div>

                  <Textarea
                    placeholder="Address"
                    value={formData.donor_address}
                    onChange={(e) => setFormData({...formData, donor_address: e.target.value})}
                    required
                  />

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.terms_accepted}
                      onCheckedChange={(checked) => setFormData({...formData, terms_accepted: checked})}
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600">
                      I accept the terms and conditions and agree to receive receipts via email
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isProcessing}
                      className="bg-[#B71C1C] hover:bg-[#D32F2F]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Donate ₹{amount.toLocaleString()}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}