import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus, Minus, Trash2, BookOpen, Loader2, CheckCircle, Download, FileText, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PageBanner from '../components/website/PageBanner';
import DynamicFooter from '../components/website/DynamicFooter';
import Bookslist from '../components/BookingServices/Bookslist.json';

import { useNavigate } from 'react-router-dom';

// LocalStorage key for cart persistence
const BOOK_CART_STORAGE_KEY = 'madha_tv_buy_books_cart';

export default function BuyBooksformobile() {
    const [books, setBooks] = useState([]);

    // Initialize cart from localStorage
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(BOOK_CART_STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [currency, setCurrency] = useState('INR');
    const [razorpayConfig, setRazorpayConfig] = useState(null);
    const [paypalConfig, setPaypalConfig] = useState(null);
    const [bookTaxRate, setBookTaxRate] = useState(0);
    const [bookTaxEnabled, setBookTaxEnabled] = useState(false);
    const [packagingCharge, setPackagingCharge] = useState(50);
    const [language, setLanguage] = useState('english');
    const navigate = useNavigate();

    // Customer details
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

    // Form validation errors
    const [formErrors, setFormErrors] = useState({});

    // Confirm order modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Success modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);








    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(BOOK_CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart]);

    useEffect(() => {
        checkAuthAndLoadData();
        const storedLanguage = localStorage.getItem('madha_tv_language') || 'english';
        setLanguage(storedLanguage);
    }, []);

    const checkAuthAndLoadData = async () => {
        setIsCheckingAuth(true);
        try {
            const isAuthenticated = await base44.auth.isAuthenticated();

            if (isAuthenticated) {
                const currentUser = await base44.auth.me();
                setUser(currentUser);

                if (currentUser) {
                    setCustomerDetails(prevDetails => ({
                        name: currentUser.full_name || prevDetails.name,
                        email: currentUser.email || prevDetails.email,
                        phone: currentUser.phone || prevDetails.phone,
                        address: currentUser.address_line_1 || prevDetails.address,
                        city: currentUser.city || prevDetails.city,
                        state: currentUser.state || prevDetails.state,
                        country: currentUser.country || prevDetails.country,
                        pincode: currentUser.pincode || prevDetails.pincode
                    }));
                }
            }

            await loadData();

        } catch (error) {
            console.error("Error loading data:", error);
            await loadData();
        } finally {
            setIsCheckingAuth(false);
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const normalizedBooks = Bookslist.map(book => ({
                id: book.id,
                title: book.BookTitle || book.title,
                title_tamil: book.BookTitleTamil || book.title_tamil,
                author: book.Author || '',
                author_tamil: book.AuthorTamil || '',
                price_inr: Number(book.amount || book.BookPrice || 0),
                price_usd: Number(book.PriceUSD || 0),
                stock_quantity: Number(book.Stock || 10), // ✅ ADD THIS
                image_url: book.Bookimg || book.image_url || '',
            }));


            setBooks(normalizedBooks);

        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setIsLoading(false);
        }
    };


    // CRITICAL FIX: Update cart prices when currency changes
    const handleCurrencyChange = (newCurrency) => {
        if (newCurrency === currency) return;

        if (cart.length > 0) {
            // Update all cart items with new currency prices
            const updatedCart = cart.map(item => {
                const book = books.find(b => b.id === item.id);
                if (book) {
                    const newPrice = newCurrency === 'INR' ? book.price_inr : book.price_usd;
                    return { ...item, price: newPrice };
                }
                return item;
            });
            setCart(updatedCart);
            toast.success(
                language === 'tamil'
                    ? `நாணயம் ${newCurrency} ஆக மாற்றப்பட்டது. விலைகள் புதுப்பிக்கப்பட்டன.`
                    : `Currency changed to ${newCurrency}. Prices updated.`
            );
        }

        setCurrency(newCurrency);
    };

    const addToCart = (book) => {
        const price = currency === 'INR' ? book.price_inr : book.price_usd;
        const existingItem = cart.find(item => item.id === book.id);

        if (existingItem) {
            if (existingItem.quantity < book.stock_quantity) {
                setCart(cart.map(item =>
                    item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
                const displayTitle = language === 'tamil' && book.title_tamil ? book.title_tamil : book.title;
                toast.success(`${displayTitle} quantity updated`);
            } else {
                toast.error('Maximum stock reached');
            }
        } else {
            setCart([...cart, { ...book, quantity: 1, price }]);
            const displayTitle = language === 'tamil' && book.title_tamil ? book.title_tamil : book.title;
            toast.success(`${displayTitle} added to cart`);
        }
    };

    const updateQuantity = (bookId, delta) => {
        setCart(cart.map(item => {
            if (item.id === bookId) {
                const newQuantity = item.quantity + delta;
                const book = books.find(b => b.id === bookId);
                if (newQuantity > 0 && book && newQuantity <= book.stock_quantity) {
                    return { ...item, quantity: newQuantity };
                }
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (bookId) => {
        setCart(cart.filter(item => item.id !== bookId));
        toast.success('Item removed from cart');
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        if (!bookTaxEnabled) return 0;
        const subtotal = calculateSubtotal();
        return (subtotal * bookTaxRate) / 100;
    };

    const calculateTotal = () => {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        const dynamicPackagingCharge = totalQuantity * packagingCharge;
        return calculateSubtotal() + dynamicPackagingCharge + calculateTax();
    };

    // CRITICAL FIX: Validate customer details with 10-digit phone validation
    const validateCustomerDetails = () => {
        const errors = {};

        if (!customerDetails.name?.trim()) {
            errors.name = language === 'tamil' ? 'பெயர் அவசியம்' : 'Name is required';
        }

        if (!customerDetails.email?.trim()) {
            errors.email = language === 'tamil' ? 'மின்னஞ்சல் அவசியம்' : 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
            errors.email = language === 'tamil' ? 'சரியான மின்னஞ்சல் முகவரி' : 'Valid email required';
        }

        if (!customerDetails.phone?.trim()) {
            errors.phone = language === 'tamil' ? 'தொலைபேசி எண் அவசியம்' : 'Phone number is required';
        } else {
            const cleanedPhone = customerDetails.phone.replace(/\D/g, '');
            if (cleanedPhone.length !== 10) {
                errors.phone = language === 'tamil'
                    ? 'தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்'
                    : 'Phone number must be exactly 10 digits';
            }
        }

        if (!customerDetails.address?.trim()) {
            errors.address = language === 'tamil' ? 'முகவரி அவசியம்' : 'Address is required';
        }

        if (!customerDetails.pincode?.trim()) {
            errors.pincode = language === 'tamil' ? 'அஞ்சல் குறியீடு அவசியம்' : 'Pincode is required';
        }

        return errors;
    };

    const handleProceedToPayment = async () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // validate form
        const errors = validateCustomerDetails();
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error(Object.values(errors)[0]);
            return;
        }

        // 🔐 LOGIN CHECK
        if (!user) {
            // save redirect path
            localStorage.setItem(
                "post_login_redirect",
                window.location.pathname
            );

            toast.info(
                language === 'tamil'
                    ? 'பணம் செலுத்த உள்நுழையவும்'
                    : 'Please login to continue payment'
            );

            navigate("/Login");
            return;
        }

        // user logged in → continue
        setShowConfirmModal(true);
    };


    const handleProceedToPay = async () => {
        setIsProcessing(true);

        try {
            const { data: trnData } = await base44.functions.invoke('generateTRN');
            const trn = trnData.trn;

            if (currency === 'INR' && razorpayConfig?.is_enabled) {
                await handleRazorpayPayment(trn);
            } else if (currency === 'USD' && paypalConfig?.is_enabled) {
                await handlePayPalPayment(trn);
            } else {
                toast.error('Payment method not configured or enabled for selected currency.');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error('Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    const handleRazorpayPayment = async (trn) => {
        try {
            const total = calculateTotal();

            const { data: razorpayOrder } = await base44.functions.invoke('createRazorpayOrder', {
                amount: total,
                currency: 'INR',
                receipt: `book_order_${Date.now()}`,
                config_type: 'books'
            });

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
                    theme: { color: '#B71C1C' },
                    modal: {
                        ondismiss: () => {
                            setIsProcessing(false);
                            setShowConfirmModal(false);
                            toast.error('Payment cancelled');
                        }
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            };
        } catch (error) {
            console.error('Razorpay error:', error);
            setIsProcessing(false);
            throw error;
        }
    };

    const handlePayPalPayment = async (trn) => {
        try {
            const total = calculateTotal();

            // Load PayPal SDK
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${paypalConfig.client_id}&currency=USD&components=buttons`;
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                setShowConfirmModal(false);

                // Create PayPal modal container
                const paypalModalContainer = document.createElement('div');
                paypalModalContainer.id = 'paypal-payment-modal';
                paypalModalContainer.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

                const paypalContent = document.createElement('div');
                paypalContent.style.cssText = 'background:white;border-radius:8px;padding:24px;max-width:500px;width:100%;position:relative;';

                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;background:none;border:none;font-size:28px;cursor:pointer;color:#666;line-height:1;padding:4px 8px;';
                closeBtn.onclick = () => {
                    document.body.removeChild(paypalModalContainer);
                    setIsProcessing(false);
                    toast.info('Payment cancelled');
                };

                const title = document.createElement('h3');
                title.textContent = 'Pay with PayPal';
                title.style.cssText = 'margin:0 0 8px 0;font-size:18px;font-weight:600;';

                const subtitle = document.createElement('p');
                subtitle.textContent = `Total Amount: ${total.toFixed(2)} USD`;
                subtitle.style.cssText = 'margin:0 0 20px 0;color:#666;font-size:14px;';

                const paypalButtonsDiv = document.createElement('div');
                paypalButtonsDiv.id = 'paypal-buttons-container';

                paypalContent.appendChild(closeBtn);
                paypalContent.appendChild(title);
                paypalContent.appendChild(subtitle);
                paypalContent.appendChild(paypalButtonsDiv);
                paypalModalContainer.appendChild(paypalContent);
                document.body.appendChild(paypalModalContainer);

                // Render PayPal buttons
                window.paypal.Buttons({
                    createOrder: async () => {
                        const { data: paypalOrder } = await base44.functions.invoke('handlePayPalPayment', {
                            action: 'create',
                            config_type: 'books',
                            amount: total,
                            currency: 'USD'
                        });
                        return paypalOrder.id;
                    },
                    onApprove: async (data) => {
                        try {
                            const { data: captureData } = await base44.functions.invoke('handlePayPalPayment', {
                                action: 'capture',
                                config_type: 'books',
                                orderID: data.orderID
                            });

                            const paymentId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || data.orderID;

                            document.body.removeChild(paypalModalContainer);

                            await createOrder(paymentId, 'paypal', trn);
                        } catch (error) {
                            console.error('PayPal capture error:', error);
                            document.body.removeChild(paypalModalContainer);
                            setIsProcessing(false);
                            toast.error('Payment capture failed');
                        }
                    },
                    onCancel: () => {
                        document.body.removeChild(paypalModalContainer);
                        setIsProcessing(false);
                        toast.info('Payment cancelled');
                    },
                    onError: (err) => {
                        console.error('PayPal error:', err);
                        document.body.removeChild(paypalModalContainer);
                        setIsProcessing(false);
                        toast.error('PayPal payment failed');
                    }
                }).render('#paypal-buttons-container');
            };

            script.onerror = () => {
                setIsProcessing(false);
                toast.error('Failed to load PayPal. Please try again.');
            };

        } catch (error) {
            console.error('PayPal error:', error);
            setIsProcessing(false);
            toast.error('Failed to initiate PayPal payment.');
            throw error;
        }
    };

    const createOrder = async (paymentId, paymentMethod, trn) => {
        try {
            const subtotal = calculateSubtotal();
            const taxAmount = calculateTax();
            const total = calculateTotal();

            // CRITICAL FIX: Calculate CGST/SGST/IGST split based on state
            const isSameState = customerDetails.state?.toLowerCase().includes('tamil nadu');
            let cgstAmount = 0;
            let sgstAmount = 0;
            let igstAmount = 0;

            if (bookTaxEnabled && currency === 'INR') {
                if (isSameState) {
                    // Same state: Split tax into CGST and SGST (assuming equal split for now)
                    // This often means 2.5% each for a 5% total, if bookTaxRate is 5%.
                    // If bookTaxRate is not 5%, this will simply split the calculated taxAmount.
                    cgstAmount = taxAmount / 2;
                    sgstAmount = taxAmount / 2;
                } else {
                    // Different state: All tax is IGST
                    igstAmount = taxAmount;
                }
            }

            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            const dynamicPackagingCharge = totalQuantity * packagingCharge;

            const order = await base44.entities.BookOrder.create({
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
                packaging_charge: dynamicPackagingCharge,
                tax_amount: taxAmount,
                cgst_amount: cgstAmount,
                sgst_amount: sgstAmount,
                igst_amount: igstAmount,
                total_amount: total,
                currency: currency,
                payment_method: paymentMethod,
                payment_id: paymentId,
                payment_status: 'completed',
                order_status: 'processing'
            });

            for (const item of cart) {
                await base44.entities.BookOrderItem.create({
                    order_id: order.id,
                    book_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: item.price,
                    book_title: item.title
                });
            }

            try {
                await base44.functions.invoke('generateBookInvoice', { orderId: order.id });
            } catch (invoiceError) {
                console.error('Invoice generation failed:', invoiceError);
            }

            try {
                await base44.functions.invoke('sendBookOrderEmail', {
                    orderId: order.id,
                    emailType: 'order_placed'
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }

            setOrderDetails({
                trn: order.trn,
                orderId: order.id,
                paymentId: paymentId,
                total: total,
                items: cart
            });

            setShowConfirmModal(false);
            setShowSuccessModal(true);
            setCart([]);

            toast.success('Order placed successfully! Check your email for confirmation.');
        } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Failed to create order');
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewInvoice = async () => {
        try {
            toast.info('Generating invoice...');

            const order = await base44.entities.BookOrder.get(orderDetails.orderId);
            const orderItems = await base44.entities.BookOrderItem.filter({ order_id: orderDetails.orderId });

            if (!order || orderItems.length === 0) {
                toast.error('Order details not found');
                return;
            }

            const invoiceData = {
                order: order,
                items: orderItems,
                customer: {
                    name: order.customer_name,
                    email: order.customer_email,
                    phone: order.customer_phone,
                    address: order.shipping_address,
                    pincode: order.booker_pincode
                }
            };

            const { generateBookInvoicePdf } = await import('../components/utils/bookInvoiceGenerator');
            const doc = await generateBookInvoicePdf(invoiceData);

            const orderNumber = order.trn || order.id.slice(-8).toUpperCase();
            const pdfDataUri = doc.output('dataurlstring');

            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Invoice-${orderNumber}</title>
                        <style>
                            body { margin: 0; padding: 0; }
                            iframe { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${pdfDataUri}" type="application/pdf"></iframe>
                    </body>
                    </html>
                `);
                newWindow.document.close();
            }

            toast.success('Invoice opened successfully!');
        } catch (error) {
            console.error('Failed to generate invoice:', error);
            toast.error('Failed to generate invoice');
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            toast.info('Generating invoice...');

            const order = await base44.entities.BookOrder.get(orderDetails.orderId);
            const orderItems = await base44.entities.BookOrderItem.filter({ order_id: orderDetails.orderId });

            if (!order || orderItems.length === 0) {
                toast.error('Order details not found');
                return;
            }

            const invoiceData = {
                order: order,
                items: orderItems,
                customer: {
                    name: order.customer_name,
                    email: order.customer_email,
                    phone: order.customer_phone,
                    address: order.shipping_address,
                    pincode: order.booker_pincode
                }
            };

            const { generateBookInvoicePdf } = await import('../components/utils/bookInvoiceGenerator');
            const doc = await generateBookInvoicePdf(invoiceData);

            const orderNumber = order.trn || order.id.slice(-8).toUpperCase();
            const fileName = `MadhaTV-BookOrder-${orderNumber}.pdf`;
            doc.save(fileName);

            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            console.error('Failed to download invoice:', error);
            toast.error('Failed to download invoice');
        }
    };

    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax();
    const total = calculateTotal();

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#B71C1C]" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#B71C1C]" />
            </div>
        );
    }


    const handleLogin = () => {
        navigate("/Login");
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* <PageBanner
                pageKey="buy_books"
                fallbackTitle={language === 'tamil' ? 'மாதா நினைவு பரிசகம்' : 'Welcome to Madha Mart, a Souvenir Shop'}
                fallbackDescription={language === 'tamil'
                    ? 'எங்கள் ஆன்மீக புத்தகங்களின் தொகுப்பை உலாவவும்'
                    : 'Souvenir is a way to share faith, celebrate love, and support the mission of Madha TV. Discover our collection of spiritual and inspirational books, Madha TV printed cups, T-shirts, keychains, silver coins, eco-friendly shopping bags, and more. By choosing these devotional gifts for your loved ones on their special days, you also become a part of the Media Mission of Madha TV.'}
                fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
            /> */}
            {/* MOBILE HEADER */}
            <div className="bg-[#B71C1C] text-white px-4 py-3 text-center">
                <h1 className="text-base font-bold">
                    {language === 'tamil'
                        ? 'மாதா நினைவு பரிசகம்'
                        : 'Madha Mart'}
                </h1>
                <p className="text-xs opacity-90">
                    {language === 'tamil'
                        ? 'ஆன்மீக புத்தகங்கள்'
                        : 'Spiritual Books & Souvenirs'}
                </p>
            </div>



            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                {!user && (
                    <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium text-blue-900">
                                {language === 'tamil'
                                    ? 'வேகமாக செக்அவுட் செய்ய உள்நுழையவும்'
                                    : 'Login for faster checkout'}
                            </p>
                            <p className="text-[10px] sm:text-xs text-blue-700 mt-1">
                                {language === 'tamil'
                                    ? 'உள்நுழைந்த பிறகு உங்கள் தகவல் தானாக நிரப்பப்படும்'
                                    : 'Your details will be auto-filled after login'}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogin}
                            className="bg-white hover:bg-blue-50 text-blue-600 border-blue-300 w-full sm:w-auto text-xs sm:text-sm"
                        >
                            {language === 'tamil' ? 'உள்நுழை' : 'Login'}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Books Grid */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                            {language === 'tamil' ? 'கிடைக்கக்கூடிய புத்தகங்கள்' : 'Available Books'}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {books.map(book => (
                                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-[3/4] overflow-hidden bg-slate-200">
                                        {book.image_url ? (
                                            <img
                                                src={book.image_url}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-3 sm:p-4">
                                        <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2">
                                            {language === 'tamil' && book.title_tamil ? book.title_tamil : book.title}
                                        </h3>
                                        {book.author && (
                                            <p className="text-xs sm:text-sm text-slate-600 mb-2">
                                                {language === 'tamil' && book.author_tamil ? book.author_tamil : book.author}
                                            </p>
                                        )}
                                        <p className="text-xl sm:text-2xl font-bold text-[#B71C1C] mb-3">
                                            {currencySymbol}{currency === 'INR' ? book.price_inr : book.price_usd}
                                        </p>


                                        <Button
                                            onClick={() => addToCart(book)}
                                            disabled={book.stock_quantity === 0}
                                            className="w-full bg-black hover:bg-slate-800 text-xs sm:text-sm"
                                        >
                                            {book.stock_quantity === 0
                                                ? (language === 'tamil' ? 'பங்கு இல்லை' : 'Out of Stock')
                                                : (language === 'tamil' ? 'தேர்வு செய்ய' : 'Add to Cart')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Shopping Cart */}
                    <div className="lg:col-span-1 order-1 lg:order-2">
                        <Card className="sticky top-4">
                            <CardHeader className="border-b bg-white p-3 sm:p-4">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {language === 'tamil' ? 'தேர்ந்தெடுக்கப்பட்டவை' : ' Shopping Cart'}
                                    {cart.length > 0 && (
                                        <span className="ml-auto bg-[#B71C1C] text-white text-xs px-2 py-1 rounded-full">
                                            {cart.length}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                                <div className='flex items-center justify-center gap-3 py-2'>
                                    {/* INR label */}
                                    <span
                                        className={`text-xs sm:text-sm font-medium ${currency === 'INR' ? 'text-red-600' : 'text-gray-400'
                                            }`}
                                    >
                                        INR (₹)
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => handleCurrencyChange(currency === 'INR' ? 'USD' : 'INR')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${currency === 'USD' ? 'bg-black' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currency === 'USD' ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>

                                    {/* USD label */}
                                    <span
                                        className={`text-xs sm:text-sm font-medium ${currency === 'USD' ? 'text-green-600' : 'text-gray-400'
                                            }`}
                                    >
                                        USD ($)
                                    </span>
                                </div>

                                {/* Customer Details */}
                                {/* <div className="space-y-2 sm:space-y-3">
                                    <h4 className="font-semibold text-xs sm:text-sm">
                                      {language === 'tamil' ? 'பயனர் விவரங்கள்' : ' Customer Details'}
                                    </h4>
                                    <div>
                                        <Input
                                            placeholder={language === 'tamil' ? 'உங்கள் பெயர்*' : 'Full Name'}
                                            value={customerDetails.name}
                                            onChange={(e) => {
                                                setCustomerDetails({...customerDetails, name: e.target.value});
                                                if (formErrors.name) setFormErrors({...formErrors, name: null});
                                            }}
                                            className={`text-xs sm:text-sm h-9 sm:h-10 ${formErrors.name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <Input
                                            type="email"
                                            placeholder={language === 'tamil' ? 'உங்கள் மின்னஞ்சல்*' : 'Your Email*'}
                                            value={customerDetails.email}
                                            onChange={(e) => {
                                                setCustomerDetails({...customerDetails, email: e.target.value});
                                                if (formErrors.email) setFormErrors({...formErrors, email: null});
                                            }}
                                            className={`text-xs sm:text-sm h-9 sm:h-10 ${formErrors.email ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                                    </div>
                                    <div>
                                        <Input
                                            type="tel"
                                            placeholder={language === 'tamil' ? 'தொலைபேசி (10 இலக்கங்கள்)' : 'Phone (10 digits)'}
                                            value={customerDetails.phone}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 10) {
                                                    setCustomerDetails({...customerDetails, phone: value});
                                                }
                                                if (formErrors.phone) setFormErrors({...formErrors, phone: null});
                                            }}
                                            className={`text-xs sm:text-sm h-9 sm:h-10 ${formErrors.phone ? 'border-red-500' : ''}`}
                                            maxLength={10}
                                        />
                                        {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                    </div>
                                    <div>
                                        <Textarea
                                            placeholder={language === 'tamil' ? 'முகவரி*' : 'Address'}
                                            value={customerDetails.address}
                                            onChange={(e) => {
                                                setCustomerDetails({...customerDetails, address: e.target.value});
                                                if (formErrors.address) setFormErrors({...formErrors, address: null});
                                            }}
                                            className={`text-xs sm:text-sm resize-none ${formErrors.address ? 'border-red-500' : ''}`}
                                            rows={3}
                                        />
                                        {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                                    </div>
                                    <div>
                                        <Input
                                            placeholder={language === 'tamil' ? 'அஞ்சல் குறியீடு*' : 'Pincode'}
                                            value={customerDetails.pincode}
                                            onChange={(e) => {
                                                setCustomerDetails({...customerDetails, pincode: e.target.value});
                                                if (formErrors.pincode) setFormErrors({...formErrors, pincode: null});
                                            }}
                                            className={`text-xs sm:text-sm h-9 sm:h-10 ${formErrors.pincode ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                                    </div>
                                </div> */}

                                {/* Cart Items or Empty State */}
                                {cart.length === 0 ? (
                                    <div className="text-center py-6 sm:py-8 text-slate-500">
                                        <p className="text-xs sm:text-sm">
                                            {language === 'tamil' ? 'உங்கள் அட்டை காலியாக உள்ளது' : ' Your cart is empty'}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex gap-2 sm:gap-3 p-2 border rounded-lg bg-white">
                                                    <img
                                                        src={item.Bookimg}
                                                        alt={item.title}
                                                        className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-xs sm:text-sm line-clamp-2">
                                                            {language === 'tamil' && item.title_tamil ? item.title_tamil : item.title}
                                                        </p>
                                                        <p className="text-xs sm:text-sm font-bold text-[#B71C1C]">
                                                            {currencySymbol}{item.price.toFixed(2)}
                                                        </p>
                                                        <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-5 w-5 sm:h-6 sm:w-6"
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                            >
                                                                <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
                                                            </Button>
                                                            <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-center">{item.quantity}</span>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-5 w-5 sm:h-6 sm:w-6"
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                            >
                                                                <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-5 w-5 sm:h-6 sm:w-6 ml-auto text-red-500"
                                                                onClick={() => removeFromCart(item.id)}
                                                            >
                                                                <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t pt-2 sm:pt-3 space-y-1 sm:space-y-2">
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span>
                                                    {language === 'tamil' ? 'துணைமொத்தம்:' : 'Subtotal:'}</span>
                                                <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span>{language === 'tamil' ? 'பேக்கிங் கட்டணம்' : 'Packaging Charge'}
                                                    ({cart.reduce((sum, item) => sum + item.quantity, 0)} × {currencySymbol}{packagingCharge}):</span>
                                                <span className="font-semibold">
                                                    {currencySymbol}{(cart.reduce((sum, item) => sum + item.quantity, 0) * packagingCharge).toFixed(2)}
                                                </span>
                                            </div>
                                            {bookTaxEnabled && taxAmount > 0 && (
                                                <div className="flex justify-between text-xs sm:text-sm">
                                                    <span>{language === 'tamil' ? 'வரி' : 'Tax'}
                                                        ({bookTaxRate}%):</span>
                                                    <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
                                                <span>{language === 'tamil' ? 'மொத்தம்' : 'Total'}
                                                </span>
                                                <span className="text-[#B71C1C]">{currencySymbol}{total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleProceedToPayment}
                                            disabled={cart.length === 0}
                                            className="w-full bg-black hover:bg-slate-800 text-xs sm:text-sm h-9 sm:h-10"
                                        >
                                            {language === 'tamil' ? 'பணம் செலுத்த தொடரவும்' : 'proceed to payment'}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Order Modal */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">{language === 'tamil' ? 'உங்கள் ஆர்டரை உறுதிப்படுத்தவும்' : 'Confirm Your Order'}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {language === 'tamil' ? 'நீங்கள் ஒரு ஆர்டரை வைக்கப் போகிறீர்கள்' : 'You are about to place an order for '} {currencySymbol}{total.toFixed(2)}.
                            {language === 'tamil' ? 'பணம் செலுத்துவதைத் தொடர கீழே கிளிக் செய்யவும்.' : 'Click below to proceed with payment'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 sm:space-y-3 py-3 sm:py-4">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span>{language === 'tamil' ? 'துணைமொத்தம்: ' : 'Subtotal:'}
                            </span>
                            <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span>{language === 'tamil' ? 'பேக்கேஜிங்' : 'Packaging'}
                                ({cart.reduce((sum, item) => sum + item.quantity, 0)} × {currencySymbol}{packagingCharge}):</span>
                            <span className="font-semibold">
                                {currencySymbol}{(cart.reduce((sum, item) => sum + item.quantity, 0) * packagingCharge).toFixed(2)}
                            </span>
                        </div>
                        {bookTaxEnabled && taxAmount > 0 && (
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span>{language === 'tamil' ? 'வரி' : 'Tax'}
                                    ({bookTaxRate}%):</span>
                                <span className="font-semibold">{currencySymbol}{taxAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-sm sm:text-base pt-2 border-t">
                            <span>{language === 'tamil' ? 'மொத்தம்:' : 'Total:'}
                            </span>
                            <span className="text-[#B71C1C]">{currencySymbol}{total.toFixed(2)}</span>
                        </div>

                        <div className="pt-2 text-[10px] sm:text-xs text-slate-600 space-y-1">
                            <p>{language === 'tamil' ? 'பொருள்:' : 'Items:'}
                                {cart.length}</p>
                            <p>{language === 'tamil' ? 'மொத்த அளவு:' : 'Total Quantity:'}
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                            <p>{language === 'tamil' ? 'கட்டண முறை:' : 'Payment Method:'}
                                {currency === 'INR' ? 'Razorpay' : 'PayPal'}</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleProceedToPay}
                        disabled={isProcessing}
                        className="w-full bg-black hover:bg-slate-800 text-xs sm:text-sm h-9 sm:h-10"
                    >
                        {isProcessing ? (
                            <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" /> {language === 'tamil' ? 'செயலாக்கம்...' : 'Processing...'}
                            </>
                        ) : (
                            language === 'tamil' ? 'பணம் செலுத்த தொடரவும்' : 'Proceed to Pay'
                        )}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <div className="text-center py-3 sm:py-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-green-600" />
                        </div>
                        <DialogTitle className="text-lg sm:text-2xl mb-2">
                            Order Placed Successfully!
                        </DialogTitle>
                        <DialogDescription className="mb-3 sm:mb-4 text-xs sm:text-sm">
                            Your book order has been confirmed and will be shipped soon.
                        </DialogDescription>

                        {orderDetails && (
                            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-left">
                                <p className="text-xs sm:text-sm text-slate-600 mb-1">TRN: <span className="font-bold">{orderDetails.trn}</span></p>
                                <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">
                                    Order ID: <span className="font-bold">{orderDetails.orderId}</span>
                                </p>

                                <h4 className="font-semibold mb-2 text-xs sm:text-sm">Order Summary</h4>
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-1">
                                    Payment ID: {orderDetails.paymentId}
                                </p>
                                <p className="text-sm sm:text-base font-bold text-[#B71C1C] mb-2">
                                    Total Amount: {currencySymbol}{orderDetails.total.toFixed(2)}
                                </p>

                                <div className="text-[10px] sm:text-xs">
                                    <p className="font-semibold mb-1">Items:</p>
                                    {orderDetails.items.map((item, idx) => (
                                        <p key={idx} className="text-slate-600 flex justify-between">
                                            <span>
                                                {language === 'tamil' && item.title_tamil ? item.title_tamil : item.title} (x{item.quantity})
                                            </span>
                                            <span>{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full text-xs sm:text-sm h-9 sm:h-10"
                                onClick={handleViewInvoice}
                            >
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                View Invoice
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full text-xs sm:text-sm h-9 sm:h-10"
                                onClick={handleDownloadInvoice}
                            >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                Download Invoice
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setOrderDetails(null);
                                }}
                                className="w-full bg-black hover:bg-slate-800 text-xs sm:text-sm h-9 sm:h-10"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <DynamicFooter />
        </div >
    );
}