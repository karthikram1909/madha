import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { BookOrder, BookOrderItem, TaxConfig, WebsiteContent } from '@/api/entities';
import { calculateTax } from '@/components/utils/taxCalculator';

export default function CheckoutModal({ 
    cart, 
    currency, 
    user, 
    razorpayConfig, 
    paypalConfig, 
    onClose, 
    onSuccess, 
    language = 'english' 
}) {
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'payment', 'success'
    const [orderId, setOrderId] = useState(null);
    const [taxConfig, setTaxConfig] = useState(null);
    const [packagingCharge, setPackagingCharge] = useState(50);
    const [taxCalculation, setTaxCalculation] = useState({
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
        taxType: 'none',
        taxLabel: 'No Tax'
    });

    const translations = {
        title: language === 'tamil' ? 'உங்கள் ஆர்டரை உறுதிப்படுத்தவும்' : 'Confirm Your Order',
        description: language === 'tamil' 
            ? 'உங்கள் ஆர்டரை மதிப்பாய்வு செய்து, உங்கள் ஷிப்பிங் விவரங்களை வழங்கவும்.' 
            : 'Please review your order and provide your shipping details.',
        order_summary: language === 'tamil' ? 'ஆர்டர் சுருக்கம்' : 'Order Summary',
        shipping_details: language === 'tamil' ? 'ஷிப்பிங் விவரங்கள்' : 'Shipping Details',
        full_name: language === 'tamil' ? 'முழு பெயர்' : 'Full Name',
        email: language === 'tamil' ? 'மின்னஞ்சல்' : 'Email',
        phone: language === 'tamil' ? 'தொலைபேசி' : 'Phone',
        address: language === 'tamil' ? 'முழு ஷிப்பிங் முகவரி' : 'Full Shipping Address',
        city: language === 'tamil' ? 'நகரம்' : 'City',
        state: language === 'tamil' ? 'மாநிலம்' : 'State',
        country: language === 'tamil' ? 'நாடு' : 'Country',
        pincode: language === 'tamil' ? 'பின்கோடு' : 'Pincode',
        subtotal: language === 'tamil' ? 'துணை மொத்தம்' : 'Subtotal',
        packaging_charge: language === 'tamil' ? 'பேக்கேஜிங் கட்டணம்' : 'Packaging Charge',
        total: language === 'tamil' ? 'மொத்தம்' : 'Total',
        placing_order: language === 'tamil' ? 'ஆர்டர் செய்யப்படுகிறது...' : 'Placing Order...',
        continue_to_payment: language === 'tamil' ? 'கட்டணத்திற்கு தொடரவும்' : 'Continue to Payment',
        pay_with_razorpay: language === 'tamil' ? 'Razorpay மூலம் செலுத்தவும்' : 'Pay with Razorpay',
        pay_with_paypal: language === 'tamil' ? 'PayPal மூலம் செலுத்தவும்' : 'Pay with PayPal',
        order_success: language === 'tamil' ? 'ஆர்டர் வெற்றிகரமாக முடிந்தது!' : 'Order Placed Successfully!',
        order_success_message: language === 'tamil' 
            ? 'உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது. விரைவில் உங்களுக்கு உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பப்படும்.'
            : 'Your order has been placed successfully. You will receive a confirmation email shortly.',
        order_number: language === 'tamil' ? 'ஆர்டர் எண்' : 'Order Number',
        close: language === 'tamil' ? 'மூடு' : 'Close'
    };

    useEffect(() => {
        if (user) {
            setCustomerDetails({
                name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address_line_1 || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || 'India',
                pincode: user.pincode || ''
            });
        }
    }, [user]);

    useEffect(() => {
        loadTaxConfig();
        loadPackagingCharge();
    }, []);

    useEffect(() => {
        if (taxConfig) {
            calculateOrderTax();
        }
    }, [customerDetails.state, customerDetails.country, taxConfig, cart]);

    const loadTaxConfig = async () => {
        try {
            const configs = await TaxConfig.list();
            if (configs.length > 0) {
                setTaxConfig(configs[0]);
            }
        } catch (error) {
            console.error('Failed to load tax config:', error);
        }
    };

    const loadPackagingCharge = async () => {
        try {
            const content = await WebsiteContent.filter({ section: 'book_tax_config', content_key: 'book_packaging_charge' });
            if (content.length > 0) {
                setPackagingCharge(parseFloat(content[0].content_value) || 50);
            } else {
                // Default packaging charge of ₹50
                setPackagingCharge(50);
            }
        } catch (error) {
            console.error('Failed to load packaging charge:', error);
            setPackagingCharge(50); // Default to ₹50 on error
        }
    };

    const calculateOrderTax = () => {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const taxCalc = calculateTax(subtotal, customerDetails.state, customerDetails.country, taxConfig);
        setTaxCalculation(taxCalc);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        return customerDetails.name && customerDetails.email && customerDetails.phone && 
               customerDetails.address && customerDetails.city && customerDetails.state && 
               customerDetails.country && customerDetails.pincode;
    };

    const handleContinueToPayment = () => {
        if (validateForm()) {
            setPaymentStep('payment');
        } else {
            toast.error(language === 'tamil' 
                ? "அனைத்து வாடிக்கையாளர் விவரங்களையும் நிரப்பவும்." 
                : "Please fill in all customer details.");
        }
    };

    const handleRazorpayPayment = async () => {
        if (!razorpayConfig || !razorpayConfig.is_enabled) {
            toast.error('Razorpay is not configured');
            return;
        }

        setIsProcessing(true);
        try {
            const total = calculateGrandTotal();
            
            // Generate Book TRN
            const { data: trnData } = await base44.functions.invoke('generateBookTRN');
            const trn = trnData.trn;

            // Create Razorpay order
            const { data: razorpayOrder } = await base44.functions.invoke('createRazorpayOrder', {
                amount: total,
                currency: 'INR',
                receipt: `book_order_${Date.now()}`,
                config_type: 'books'
            });

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: razorpayConfig.key_id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: 'Madha TV - Books',
                    description: 'Book Purchase',
                    order_id: razorpayOrder.id,
                    handler: async (response) => {
                        await createOrder(response.razorpay_payment_id, 'razorpay', trn);
                    },
                    prefill: {
                        name: customerDetails.name,
                        email: customerDetails.email,
                        contact: customerDetails.phone
                    },
                    theme: {
                        color: '#B71C1C'
                    },
                    modal: {
                        ondismiss: () => {
                            setIsProcessing(false);
                            toast.error('Payment cancelled');
                        }
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            };
        } catch (error) {
            console.error('Razorpay payment error:', error);
            toast.error('Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    const handlePayPalPayment = async () => {
        if (!paypalConfig || !paypalConfig.is_enabled) {
            toast.error('PayPal is not configured');
            return;
        }

        setIsProcessing(true);
        try {
            const total = calculateGrandTotal();
            
            // Generate Book TRN
            const { data: trnData } = await base44.functions.invoke('generateBookTRN');
            const trn = trnData.trn;

            // Create PayPal order
            const { data: paypalOrder } = await base44.functions.invoke('handlePayPalPayment', {
                action: 'create',
                config_type: 'books',
                amount: total,
                currency: 'USD'
            });

            // Redirect to PayPal approval URL
            const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;
            if (approvalUrl) {
                // Store order details in sessionStorage for after redirect
                sessionStorage.setItem('pendingBookOrder', JSON.stringify({
                    cart,
                    customerDetails,
                    trn,
                    paypalOrderId: paypalOrder.id,
                    total,
                    currency: 'USD',
                    taxCalculation,
                    packagingCharge
                }));
                
                window.location.href = approvalUrl;
            }
        } catch (error) {
            console.error('PayPal payment error:', error);
            toast.error('Failed to initiate PayPal payment');
            setIsProcessing(false);
        }
    };

    const createOrder = async (paymentId, paymentMethod, trn) => {
        try {
            const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            const grandTotal = calculateGrandTotal();

            // Create order
            const order = await BookOrder.create({
                trn: trn,
                user_id: user?.id || null,
                customer_name: customerDetails.name,
                customer_email: customerDetails.email,
                customer_phone: customerDetails.phone,
                shipping_address: customerDetails.address,
                state: customerDetails.state,
                country: customerDetails.country,
                booker_pincode: customerDetails.pincode,
                subtotal_amount: subtotal,
                packaging_charge: packagingCharge,
                tax_amount: taxCalculation.totalTax,
                cgst_amount: taxCalculation.cgst,
                sgst_amount: taxCalculation.sgst,
                igst_amount: taxCalculation.igst,
                total_amount: grandTotal,
                currency: currency,
                payment_method: paymentMethod,
                payment_status: 'completed',
                payment_id: paymentId,
                order_status: 'processing'
            });

            // Create order items
            for (const item of cart) {
                await BookOrderItem.create({
                    order_id: order.id,
                    book_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: item.price,
                    book_title: item.title
                });
            }

            // Generate invoice
            try {
                await base44.functions.invoke('generateBookInvoice', { orderId: order.id });
            } catch (invoiceError) {
                console.error('Invoice generation failed:', invoiceError);
            }

            // Send order confirmation email
            try {
                await base44.functions.invoke('sendBookOrderEmail', {
                    orderId: order.id,
                    emailType: 'order_placed'
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }

            setOrderId(order.trn || order.id);
            setPaymentStep('success');
            setIsProcessing(false);
        } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Failed to create order');
            setIsProcessing(false);
        }
    };

    const calculateGrandTotal = () => {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        return subtotal + packagingCharge + taxCalculation.totalTax;
    };

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const grandTotal = calculateGrandTotal();
    const currencySymbol = currency === 'INR' ? '₹' : '$';

    if (paymentStep === 'success') {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">{translations.order_success}</DialogTitle>
                        <DialogDescription className="text-center">
                            {translations.order_success_message}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">{translations.order_number}</p>
                        <p className="text-lg font-bold text-slate-900">{orderId}</p>
                    </div>
                    <Button onClick={() => {
                        onSuccess();
                        onClose();
                    }} className="w-full bg-[#B71C1C] hover:bg-[#D32F2F]">
                        {translations.close}
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{translations.title}</DialogTitle>
                    <DialogDescription>{translations.description}</DialogDescription>
                </DialogHeader>

                {paymentStep === 'details' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                {translations.order_summary}
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <p>{translations.subtotal}</p>
                                    <p>{currencySymbol}{subtotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <p>{translations.packaging_charge}:</p>
                                    <p>{currencySymbol}{packagingCharge.toFixed(2)}</p>
                                </div>
                                {taxCalculation.totalTax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <p>{taxCalculation.taxLabel}</p>
                                        <p>{currencySymbol}{taxCalculation.totalTax.toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-base pt-2 border-t">
                                    <p>{translations.total}</p>
                                    <p className="text-[#B71C1C]">{currencySymbol}{grandTotal.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold">{translations.shipping_details}</h4>
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="name">{translations.full_name}</Label>
                                    <Input id="name" name="name" value={customerDetails.name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="email">{translations.email}</Label>
                                    <Input id="email" name="email" type="email" value={customerDetails.email} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="phone">{translations.phone}</Label>
                                    <Input id="phone" name="phone" value={customerDetails.phone} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="address">{translations.address}</Label>
                                    <Textarea id="address" name="address" value={customerDetails.address} onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="city">{translations.city}</Label>
                                        <Input id="city" name="city" value={customerDetails.city} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">{translations.state}</Label>
                                        <Input id="state" name="state" value={customerDetails.state} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="country">{translations.country}</Label>
                                        <Input id="country" name="country" value={customerDetails.country} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="pincode">{translations.pincode}</Label>
                                        <Input id="pincode" name="pincode" value={customerDetails.pincode} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {paymentStep === 'payment' && (
                    <div className="mt-6 space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Select Payment Method
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {razorpayConfig && razorpayConfig.is_enabled && currency === 'INR' && (
                                <Button 
                                    onClick={handleRazorpayPayment} 
                                    disabled={isProcessing}
                                    className="w-full bg-[#3395ff] hover:bg-[#2b7fd9]"
                                >
                                    {translations.pay_with_razorpay}
                                </Button>
                            )}
                            {paypalConfig && paypalConfig.is_enabled && currency === 'USD' && (
                                <Button 
                                    onClick={handlePayPalPayment} 
                                    disabled={isProcessing}
                                    className="w-full bg-[#0070ba] hover:bg-[#005ea6]"
                                >
                                    {translations.pay_with_paypal}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {paymentStep === 'details' && (
                    <div className="mt-6 flex justify-end">
                        <Button 
                            onClick={handleContinueToPayment} 
                            disabled={!validateForm() || isProcessing}
                            className="bg-[#B71C1C] hover:bg-[#D32F2F]"
                        >
                            {isProcessing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {translations.placing_order}</>
                            ) : (
                                translations.continue_to_payment
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}