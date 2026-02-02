import React, { useState, useEffect, useCallback } from 'react';
import { Book, User, BookOrder, BookOrderItem, RazorpayConfig, PayPalConfig, WebsiteContent, FailedPayment, PaymentLog } from '@/api/entities';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, IndianRupee, DollarSign, Loader2, CheckCircle, FileText, Download, Package, History, Minus, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import Bookslist from '../components/BookingServices/Bookslist.json';


const IS_LOCAL = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
// Helper functions
const isIndianUser = (user) => {
    return user?.phone?.startsWith('+91') || user?.country === 'India';
};

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const loadPayPalScript = (clientId) => {
    return new Promise((resolve) => {
        if (window.paypal) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons,marks`;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// LocalStorage key for cart persistence
const USER_BOOK_CART_STORAGE_KEY = 'madha_tv_user_buy_books_cart';

// Book Shopping Interface
const BookShopping = ({ user, onOrderSuccess, onViewInvoice, onDownloadInvoice }) => {
    
    const [books, setBooks] = useState([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);

    // Initialize cart from localStorage
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(USER_BOOK_CART_STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });

    const [currency] = useState('INR'); // Fixed to INR only
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [razorpayConfig, setRazorpayConfig] = useState(null);
    const [payPalConfig, setPayPalConfig] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [taxConfig, setTaxConfig] = useState({ tax_rate: 5, is_tax_enabled: true, packaging_charge: 50 });
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        pincode: '',
    });
    const [configStatus, setConfigStatus] = useState(null);
    // Added language state to support dynamic placeholder as per request
    const [language, setLanguage] = useState('english'); // Default to 'english', can be made dynamic based on user settings if available

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(USER_BOOK_CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart]);

    // Generate TRN for book orders
    const generateTRN = async () => {
        try {
            // Fetch the most recent order to determine the next sequential TRN
            const recentOrders = await BookOrder.list('-created_date', 1);
            let nextNumber = 1;
            if (recentOrders.length > 0 && recentOrders[0].trn) {
                // Assuming TRN is a simple number string like "001", "002", etc.
                // It's safer to parse the numeric part only if TRN has a prefix, or assume it's purely numeric.
                // For simplicity, let's assume it's purely numeric for now or extract numbers after a prefix like "TRN"
                const lastTRN = parseInt(recentOrders[0].trn.replace(/\D/g, ''), 10); // Extract numbers
                if (!isNaN(lastTRN)) {
                    nextNumber = lastTRN + 1;
                }
            }
            // Pad the number with leading zeros to ensure a consistent length (e.g., 001, 010, 100)
            return String(nextNumber).padStart(3, '0');
        } catch (error) {
            console.error('Error generating TRN:', error);
            // Fallback TRN in case of error
            return `TMP${Date.now().toString().slice(-6)}`;
        }
    };

    useEffect(() => {
        if (user) {
            // Currency is always INR
            setCustomerDetails({
                name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address_line_1 || '',
                pincode: user.pincode || '', // Initialize with user's pincode
            });
            // Assuming user object might have a language preference
            // if (user.preferred_language) {
            //     setLanguage(user.preferred_language);
            // }
        }
        loadBooks();
        loadPaymentConfigs();
        loadTaxConfig();
        checkConfiguration();
    }, [user]);

    // const checkConfiguration = async () => {
    //     try {
    //         console.log('🔍 Checking payment configuration...');

    //        const razorpayConfigs = await RazorpayConfig.list({ config_type: 'books' });
    //        const paypalConfigs = await PayPalConfig.list({ config_type: 'books' });
    //         const status = {
    //             razorpay: {
    //                 exists: razorpayConfigs.length > 0,
    //                 enabled: razorpayConfigs.length > 0 && razorpayConfigs[0].is_enabled,
    //                 hasKeyId: razorpayConfigs.length > 0 && !!razorpayConfigs[0].key_id,
    //                 hasKeySecret: razorpayConfigs.length > 0 && !!razorpayConfigs[0].key_secret,
    //             },
    //             paypal: {
    //                 exists: paypalConfigs.length > 0,
    //                 enabled: paypalConfigs.length > 0 && paypalConfigs[0].is_enabled,
    //                 hasClientId: paypalConfigs.length > 0 && !!paypalConfigs[0].client_id,
    //                 hasClientSecret: paypalConfigs.length > 0 && !!paypalConfigs[0].client_secret,
    //             }
    //         };

    //         console.log('Configuration status:', status);
    //         setConfigStatus(status);

    //         // Show warnings if configuration is incomplete
    //         if (!status.razorpay.exists) {
    //             toast.error('Razorpay configuration not found. Please set up payment settings in Admin Dashboard → Settings → Book Purchase Settings.');
    //         } else if (!status.razorpay.enabled && currency === 'INR') {
    //             toast.warning('Razorpay payments are disabled. Please enable in Admin Dashboard.');
    //         } else if ((!status.razorpay.hasKeyId || !status.razorpay.hasKeySecret) && currency === 'INR') {
    //             toast.error('Razorpay credentials are incomplete. Please update in Admin Dashboard.');
    //         }
    //         if (!status.paypal.exists && currency === 'USD') {
    //             toast.error('PayPal configuration not found. Please set up payment settings in Admin Dashboard.');
    //         } else if (!status.paypal.enabled && currency === 'USD') {
    //             toast.warning('PayPal payments are disabled. Please enable in Admin Dashboard.');
    //         } else if ((!status.paypal.hasClientId || !status.paypal.hasClientSecret) && currency === 'USD') {
    //             toast.error('PayPal credentials are incomplete. Please update in Admin Dashboard.');
    //         }

    //     } catch (error) {
    //         console.error('Failed to check configuration:', error);
    //         toast.error('Failed to load payment configuration. Please contact support.');
    //     }
    // };
const checkConfiguration = async () => {
     if (IS_LOCAL) {
        console.log('ℹ️ Configuration check skipped (LOCAL MODE)');
        return; // Skip in local mode
    }
    try {
        console.log('🔍 Checking payment configuration...');

        const razorpayConfigs = await RazorpayConfig.list({ config_type: 'books' });
        const paypalConfigs = await PayPalConfig.list({ config_type: 'books' });

        const status = {
            razorpay: {
                exists: razorpayConfigs.length > 0,
                enabled: razorpayConfigs.length > 0 && razorpayConfigs[0].is_enabled,
                hasKeyId: razorpayConfigs.length > 0 && !!razorpayConfigs[0].key_id,
                hasKeySecret: razorpayConfigs.length > 0 && !!razorpayConfigs[0].key_secret,
            },
            paypal: {
                exists: paypalConfigs.length > 0,
                enabled: paypalConfigs.length > 0 && paypalConfigs[0].is_enabled,
                hasClientId: paypalConfigs.length > 0 && !!paypalConfigs[0].client_id,
                hasClientSecret: paypalConfigs.length > 0 && !!paypalConfigs[0].client_secret,
            }
        };

        console.log('Configuration status:', status);
        setConfigStatus(status);

        // Razorpay warnings (INR)
        if (!status.razorpay.exists && currency === 'INR') {
            toast.error(
                'Razorpay configuration not found. Please set up payment settings in Admin Dashboard → Settings → Book Purchase Settings.'
            );
        } else if (!status.razorpay.enabled && currency === 'INR') {
            toast.warning('Razorpay payments are disabled. Please enable in Admin Dashboard.');
        } else if (
            (!status.razorpay.hasKeyId || !status.razorpay.hasKeySecret) &&
            currency === 'INR'
        ) {
            toast.error('Razorpay credentials are incomplete. Please update in Admin Dashboard.');
        }

        // PayPal warnings (USD)
        if (!status.paypal.exists && currency === 'USD') {
            toast.error(
                'PayPal configuration not found. Please set up payment settings in Admin Dashboard.'
            );
        } else if (!status.paypal.enabled && currency === 'USD') {
            toast.warning('PayPal payments are disabled. Please enable in Admin Dashboard.');
        } else if (
            (!status.paypal.hasClientId || !status.paypal.hasClientSecret) &&
            currency === 'USD'
        ) {
            toast.error('PayPal credentials are incomplete. Please update in Admin Dashboard.');
        }

    } catch (error) {
        console.error('Failed to check configuration:', error);
        toast.error('Failed to load payment configuration. Please contact support.');
    }
};



    const loadBooks = async () => {
        setIsLoadingBooks(true);
        try {
           const activeBooks = [];
setBooks(activeBooks);

            setBooks(activeBooks);
        } catch (error) {
            console.error("Failed to load books:", error);
            toast.error("Failed to load books.");
        } finally {
            setIsLoadingBooks(false);
        }
    };

    // const loadPaymentConfigs = async () => {
    //     try {
    //         const [rzpConf, ppConf] = await Promise.all([
    //             RazorpayConfig.list({ config_type: 'books', is_enabled: true }),
    //             PayPalConfig.list({ config_type: 'books', is_enabled: true }),
    //         ]);

    //         if (rzpConf.length > 0) {
    //             console.log('Razorpay config loaded:', { ...rzpConf[0], key_secret: '[HIDDEN]' });
    //             setRazorpayConfig(rzpConf[0]);
    //         } else {
    //             console.warn('No enabled Razorpay config found for books');
    //         }

    //         if (ppConf.length > 0) {
    //             console.log('PayPal config loaded');
    //             setPayPalConfig(ppConf[0]);
    //         } else {
    //             console.warn('No enabled PayPal config found for books');
    //         }
    //     } catch (error) {
    //         console.error("Failed to load payment configs:", error);
    //         toast.error("Failed to load payment settings.");
    //     }
    // };

    // Mock Razorpay configuration for local testing
const MOCK_RAZORPAY_CONFIG = {
    key_id: 'rzp_test_WMgEKiseJALjR9', // Use your test key
    key_secret: '2BNFdpdk63K29F495B2kq3cZ', // This is only for reference, never use in production frontend
    is_enabled: true,
    config_type: 'books'
};


// const loadPaymentConfigs = async () => {
//     if (IS_LOCAL) {
//         console.warn('⚠️ LOCAL MODE: Using mock Razorpay config');
        
//         // Mock Razorpay config for local testing
//         setRazorpayConfig({
//             key_id: 'rzp_test_WMgEKiseJALjR9', // This won't work for real payments
//             key_secret: '2BNFdpdk63K29F495B2kq3cZ',
//             is_enabled: true,
//             config_type: 'books'
//         });

//         setPayPalConfig(null);

//         // Set config status to true so payment flow continues
//         setConfigStatus({
//             razorpay: {
//                 exists: true,
//                 enabled: true,
//                 hasKeyId: true,
//                 hasKeySecret: true,
//             },
//             paypal: {
//                 exists: false,
//                 enabled: false,
//                 hasClientId: false,
//                 hasClientSecret: false,
//             }
//         });

//         console.log('✅ Mock Razorpay config loaded');
//         return;
//     }

//     // Production code (when not local)
//     try {
//         const [rzpConf, ppConf] = await Promise.all([
//             RazorpayConfig.list({ config_type: 'books', is_enabled: true }),
//             PayPalConfig.list({ config_type: 'books', is_enabled: true }),
//         ]);

//         if (rzpConf.length > 0) {
//             console.log('Razorpay config loaded:', { ...rzpConf[0], key_secret: '[HIDDEN]' });
//             setRazorpayConfig(rzpConf[0]);
//         } else {
//             console.warn('No enabled Razorpay config found for books');
//         }

//         if (ppConf.length > 0) {
//             console.log('PayPal config loaded');
//             setPayPalConfig(ppConf[0]);
//         } else {
//             console.warn('No enabled PayPal config found for books');
//         }
//     } catch (error) {
//         console.error("Failed to load payment configs:", error);
//         toast.error("Failed to load payment settings.");
//     }
// };
const loadPaymentConfigs = async () => {
    if (IS_LOCAL) {
        console.warn('⚠️ LOCAL MODE: Using mock Razorpay config');
        
        setRazorpayConfig(MOCK_RAZORPAY_CONFIG);
        setPayPalConfig(null);

        setConfigStatus({
            razorpay: {
                exists: true,
                enabled: true,
                hasKeyId: true,
                hasKeySecret: true,
            },
            paypal: {
                exists: false,
                enabled: false,
                hasClientId: false,
                hasClientSecret: false,
            }
        });

        console.log('✅ Mock Razorpay config loaded');
        toast.success('Local mode: Using test Razorpay credentials');
        return;
    }

    // Production code (when not local)
    try {
        const [rzpConf, ppConf] = await Promise.all([
            RazorpayConfig.list({ config_type: 'books', is_enabled: true }),
            PayPalConfig.list({ config_type: 'books', is_enabled: true }),
        ]);

        if (rzpConf.length > 0) {
            console.log('Razorpay config loaded:', { ...rzpConf[0], key_secret: '[HIDDEN]' });
            setRazorpayConfig(rzpConf[0]);
        } else {
            console.warn('No enabled Razorpay config found for books');
        }

        if (ppConf.length > 0) {
            console.log('PayPal config loaded');
            setPayPalConfig(ppConf[0]);
        } else {
            console.warn('No enabled PayPal config found for books');
        }
    } catch (error) {
        console.error("Failed to load payment configs:", error);
        toast.error("Failed to load payment settings.");
    }
};


    const loadTaxConfig = async () => {
        try {
            const content = await WebsiteContent.list({ section: 'book_tax_config' });
            const configMap = content.reduce((acc, item) => {
                acc[item.content_key] = item.content_value;
                return acc;
            }, {});

            setTaxConfig({
                tax_rate: parseFloat(configMap.book_tax_rate || 5),
                is_tax_enabled: configMap.book_tax_enabled === 'true',
                packaging_charge: 50 // Fixed packaging charge of ₹50
            });
        } catch (error) {
            console.error('Failed to load tax config:', error);
            toast.error('Failed to load tax configuration.');
        }
    };

    // Currency is fixed to INR only

    const handleAddToCart = (book) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.book.id === book.id);

            if (existingItem) {
                return prevCart.map(item =>
                    item.book.id === book.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevCart, { book, quantity: 1 }];
        });

        toast.success(`${book.BookTitle} added to cart`);
    };


   const handleUpdateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) {
        handleRemoveFromCart(bookId);
        return;
    }

    const cartItem = cart.find(item => item.book.id === bookId);
    if (!cartItem) return;

    // 🔴 If stock is not present in JSON, allow max 10
    const availableStock = cartItem.book.stock_quantity ?? 10;

    if (newQuantity > availableStock) {
        toast.error(`Only ${availableStock} items available`);
        return;
    }

    if (newQuantity > 10) {
        toast.error("Maximum 10 items per book allowed.");
        return;
    }

    setCart(prevCart =>
        prevCart.map(item =>
            item.book.id === bookId
                ? { ...item, quantity: newQuantity }
                : item
        )
    );
};


    const handleRemoveFromCart = (bookId) => {
        setCart(prevCart => prevCart.filter(item => item.book.id !== bookId));
        toast.info("Item removed from cart.");
    };

    // Calculate subtotal dynamically based on selected currency
    const subtotal = cart.reduce((acc, cartItem) => acc + (currency === 'INR' ? cartItem.book.amount : cartItem.book.price_usd) * cartItem.quantity, 0);
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const packagingCharge = totalQuantity * (taxConfig.packaging_charge || 50);

    // Determine if same state for GST calculation
    const isSameState = customerDetails.address && customerDetails.address.toLowerCase().includes('tamil nadu');

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let totalTaxAmount = 0; // Total GST

    if (taxConfig.is_tax_enabled && currency === 'INR') { // GST only applies for INR
        const baseTaxRate = taxConfig.tax_rate / 100; // e.g., 5 / 100 = 0.05
        if (isSameState) {
            cgstAmount = subtotal * (baseTaxRate / 2);
            sgstAmount = subtotal * (baseTaxRate / 2);
        } else {
            igstAmount = subtotal * baseTaxRate;
        }
        totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
    }

    const total = subtotal + packagingCharge + totalTaxAmount;
    const currencySymbol = currency === 'INR' ? '₹' : '$';

const handleCheckout = (e) => {
    e?.preventDefault();
    console.log('🟢 Proceed to Payment clicked');
    
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || 
        !customerDetails.address || !customerDetails.pincode) {
        alert("Please fill all customer details.");
        return;
    }

    console.log('🟢 Setting isCheckoutVisible to TRUE');
    console.log('Current isCheckoutVisible:', isCheckoutVisible);
    setIsCheckoutVisible(true);
    
    // Force check after state update
    setTimeout(() => {
        console.log('After setState - isCheckoutVisible:', isCheckoutVisible);
    }, 100);
};

    const finalizeOrder = async (paymentId, paymentMethod, paymentDetails = {}) => {
        console.log('🔵 STARTING ORDER FINALIZATION');
        console.log('Payment ID:', paymentId);
        console.log('Payment Method:', paymentMethod);

        // Generate TRN
        let trn = null;
        try {
            console.log('📝 Generating unique TRN...');
            trn = await generateTRN();
            console.log('✅ TRN generated:', trn);
        } catch (trnError) {
            console.error('❌ Failed to generate TRN:', trnError);
            trn = `TMP${Date.now().toString().slice(-6)}`;
        }

        // CRITICAL: Log payment success FIRST
        try {
            console.log('📝 Logging payment success to PaymentLog...');
            const paymentLogData = {
                user_id: user?.id || null,
                user_name: customerDetails.name,
                user_email: customerDetails.email,
                user_mobile: customerDetails.phone,
                payment_id: paymentId,
                payment_method: paymentMethod,
                amount: total,
                currency: currency,
                purpose: 'buy_books',
                status: 'payment_successful',
                gateway_response: { ...paymentDetails, trn: trn },
                ip_address: window.location.hostname,
                user_agent: navigator.userAgent
            };

            console.log('Payment log data:', paymentLogData);
            await PaymentLog.create(paymentLogData);
            console.log('✅ Payment success logged');
        } catch (logError) {
            console.error('❌ CRITICAL: Failed to log payment success:', logError);
            console.error('Log error details:', logError.message, logError.stack);
            // Continue anyway
        }

        try {
            // Create the order with all required fields
            console.log('Step 1: Creating order record...');

            // Safe number conversion helper
            const safeNumber = (val) => {
                const num = parseFloat(val);
                return isNaN(num) ? 0 : num;
            };

            // Recalculate amounts based on current state (cart, taxConfig, customerDetails)
            const calculatedSubtotal = safeNumber(cart.reduce((acc, cartItem) => acc + (currency === 'INR' ? cartItem.book.price_inr : cartItem.book.price_usd) * cartItem.quantity, 0));
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            const calculatedPackagingCharge = safeNumber(totalQuantity * (taxConfig?.packaging_charge || 50));

            const isOrderSameState = customerDetails.address && customerDetails.address.toLowerCase().includes('tamil nadu');

            let calculatedCgst = 0;
            let calculatedSgst = 0;
            let calculatedIgst = 0;
            let calculatedTotalTax = 0;

            if (taxConfig?.is_tax_enabled && currency === 'INR') { // GST only applies for INR
                const baseTaxRate = taxConfig.tax_rate / 100;
                if (isOrderSameState) {
                    calculatedCgst = calculatedSubtotal * (baseTaxRate / 2);
                    calculatedSgst = calculatedSubtotal * (baseTaxRate / 2);
                } else {
                    calculatedIgst = calculatedSubtotal * baseTaxRate;
                }
                calculatedTotalTax = calculatedCgst + calculatedSgst + calculatedIgst;
            }

            const grandTotal = calculatedSubtotal + calculatedPackagingCharge + calculatedTotalTax;

            const orderData = {
                trn: trn,
                user_id: user?.id || null,
                customer_name: String(customerDetails.name || ''),
                customer_email: String(customerDetails.email || ''),
                customer_phone: String(customerDetails.phone || ''),
                shipping_address: String(customerDetails.address || ''),
                state: isOrderSameState ? 'Tamil Nadu' : 'Other', // Storing the determined state
                country: currency === 'INR' ? 'India' : 'USA', // Storing the country
                booker_pincode: String(customerDetails.pincode || ''), // Storing the pincode
                subtotal_amount: safeNumber(calculatedSubtotal),
                packaging_charge: safeNumber(calculatedPackagingCharge),
                tax_amount: safeNumber(calculatedTotalTax), // Total GST amount
                cgst_amount: safeNumber(calculatedCgst),
                sgst_amount: safeNumber(calculatedSgst),
                igst_amount: safeNumber(calculatedIgst),
                total_amount: safeNumber(grandTotal),
                currency: currency,
                payment_method: paymentMethod,
                payment_id: paymentId,
                payment_status: 'completed',
                order_status: 'processing' // Changed from 'pending' to 'processing'
            };

            console.log('Order data:', JSON.stringify(orderData, null, 2));
            const newOrder = await BookOrder.create(orderData);
            console.log('✅ Order created:', newOrder.id);

            // Log successful order creation
            try {
                await PaymentLog.create({
                    user_id: user?.id || null,
                    user_name: customerDetails.name,
                    user_email: customerDetails.email,
                    user_mobile: customerDetails.phone,
                    payment_id: paymentId,
                    payment_method: paymentMethod,
                    amount: grandTotal, // Use grandTotal for logging
                    currency: currency,
                    purpose: 'buy_books',
                    status: 'order_created',
                    order_id: newOrder.id,
                    gateway_response: { ...paymentDetails, trn: trn },
                    ip_address: window.location.hostname,
                    user_agent: navigator.userAgent
                });
                console.log('✅ Order creation logged');
            } catch (logError) {
                console.error('❌ Failed to log order creation:', logError);
            }

            // Create order items
console.log('Step 2: Creating order items...');

for (const item of cart) {
    try {
        const orderItemData = {
            order_id: newOrder.id,
            book_id: item.book.id,
            quantity: item.quantity,
            price_at_purchase: safeNumber(currency === 'INR' ? item.book.amount : item.book.price_usd),
            book_title: String(item.book.BookTitle || 'Unknown Book'),
        };
        
        console.log('Creating order item:', JSON.stringify(orderItemData, null, 2));
        await BookOrderItem.create(orderItemData);
        console.log('✅ Order item created for:', item.book.BookTitle);
    } catch (itemError) {
        console.error('❌ Failed to create order item for book:', item.book.id, itemError);
        throw new Error(`Failed to create order item: ${itemError.message}`);
    }
}

console.log('✅ All order items created successfully');
            // Update stock
            console.log('Step 3: Updating book stock...');
            for (const item of cart) {
                try {
                    const currentBook = books.find(b => b.id === item.book.id);
                    if (currentBook) {
                        const newStock = Math.max(0, currentBook.stock_quantity - item.quantity);
                        console.log(`Updating stock for ${item.book.title}: original stock -> ${currentBook.stock_quantity}, new stock -> ${newStock}`);
                        await Book.update(item.book.id, { stock_quantity: newStock });
                    } else {
                        console.warn(`Book with ID ${item.book.id} not found in available books. Stock not updated.`);
                    }
                } catch (stockError) {
                    console.warn(`Failed to update stock for book ${item.book.id} (${item.book.title}):`, stockError);
                }
            }
            console.log('✅ Stock updated');

            // Send order confirmation email
            console.log('Step 4: Sending order confirmation email...');
            try {
                await base44.functions.invoke('sendBookOrderEmail', {
                    orderId: newOrder.id,
                    emailType: 'order_placed'
                });
                console.log('✅ Order confirmation email sent');
            } catch (emailError) {
                console.warn('⚠️ Failed to send order confirmation email:', emailError.message);
            }

            // Step 5: Clear cart and show success
            console.log('Step 5: Finalizing UI...');
            setCart([]);
            setIsCheckoutVisible(false);
            setShowSuccessModal(true);
            setOrderDetails({
                orderId: newOrder.id,
                trn: trn,
                paymentId: paymentId,
                total: grandTotal, // Use grandTotal here
                currency: currency,
                items: cart.map(item => ({
                    ...item.book,
                    quantity: item.quantity,
                    price: (currency === 'INR' ? item.book.price_inr : item.book.price_usd)
                })),
                customer: customerDetails,
                shippingAddress: customerDetails.address
            });

            console.log('✅ ORDER FINALIZATION COMPLETE');
            toast.success("🎉 Order placed successfully! Check your email for confirmation.");

            // Trigger parent callback (to refresh order history)
            if (onOrderSuccess) {
                onOrderSuccess();
            }

        } catch (error) {
            console.error('❌ ERROR FINALIZING ORDER:', error);
            console.error('Error details:', error.message, error.stack);
            console.error('Error response:', error.response);

            // CRITICAL: Log order creation failure
            try {
                console.log('📝 Logging order failure to PaymentLog...');
                await PaymentLog.create({
                    user_id: user?.id || null,
                    user_name: customerDetails.name,
                    user_email: customerDetails.email,
                    user_mobile: customerDetails.phone,
                    payment_id: paymentId,
                    payment_method: paymentMethod,
                    amount: total, // Use 'total' here as we might not have a grandTotal from failed order
                    currency: currency,
                    purpose: 'buy_books',
                    status: 'order_failed',
                    error_message: error.message,
                    gateway_response: { ...paymentDetails, trn: trn },
                    ip_address: window.location.hostname,
                    user_agent: navigator.userAgent
                });
                console.log('✅ Order failure logged');
            } catch (logError) {
                console.error('❌ CRITICAL: Failed to log order failure:', logError);
            }

            // CRITICAL: Log to failed payments for recovery
            try {
                console.log('📝 Logging to FailedPayment for recovery...');

                const failedPaymentData = {
                    user_id: user?.id || null,
                    user_name: customerDetails.name,
                    email: customerDetails.email,
                    mobile: customerDetails.phone,
                    amount: total,
                    currency: currency,
                    payment_id: paymentId,
                    payment_method: paymentMethod,
                    purpose: 'buy_books',
                    status: 'PENDING_RESTORE',
                    payment_data: {
                        trn: trn,
                        cart: cart.map(item => ({
                            id: item.book.id,
                            title: item.book.title,
                            quantity: item.quantity,
                            price: (currency === 'INR' ? item.book.price_inr : item.book.price_usd),
                            image_url: item.book.image_url
                        })),
                        customer_details: customerDetails,
                        total_amount: total,
                        subtotal_amount: subtotal,
                        tax_amount: totalTaxAmount, // Use totalTaxAmount
                        packaging_charge: packagingCharge
                    },
                    error_message: error.message
                };

                console.log('Failed payment data:', failedPaymentData);
                await FailedPayment.create(failedPaymentData);
                console.log('✅ Failed payment logged for recovery');
            } catch (logError) {
                console.error('❌ CRITICAL: Failed to log to FailedPayment:', logError);
                console.error('FailedPayment log error details:', logError.message, logError.stack);
            }

            toast.error(`Failed to save your order: ${error.message}. Your payment has been recorded. Please contact support.`, {
                duration: 10000
            });

        } finally {
            setIsProcessing(false);
        }
    };

    


//     const handlePlaceOrder = async () => {
//     if (isProcessing) {
//         console.log('Already processing, ignoring duplicate click');
//         return;
//     }

//     console.log('=== STARTING PAYMENT PROCESS ===');
//     console.log('Configuration status:', configStatus);

//     setIsProcessing(true);

//     try {
//         // Validate total amount
//         if (!total || total <= 0) {
//             throw new Error("Invalid order amount. Please refresh and try again.");
//         }

//         // Validate customer details
//         if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || 
//             !customerDetails.address || !customerDetails.pincode) {
//             throw new Error("Please fill in all customer details (Name, Email, Phone, Address, Pincode).");
//         }

//         // FOR LOCAL MODE: Mock payment success
//         if (IS_LOCAL) {
//             console.log('🧪 LOCAL MODE: Simulating Razorpay payment...');
            
//             toast.info('Simulating payment in local mode...', { duration: 2000 });
            
//             // Simulate payment processing delay
//             await new Promise(resolve => setTimeout(resolve, 2000));
            
//             // Generate mock payment details
//             const mockPaymentId = `pay_local_${Date.now()}`;
//             const mockOrderId = `order_local_${Date.now()}`;
//             const mockSignature = 'mock_razorpay_signature';
            
//             console.log('✅ Mock payment successful!');
//             console.log('Mock Payment ID:', mockPaymentId);
//             console.log('Mock Order ID:', mockOrderId);
            
//             // Close modal before finalizing
//             setIsCheckoutVisible(false);
            
//             // Finalize order with mock payment details
//             await finalizeOrder(mockPaymentId, 'razorpay', {
//                 order_id: mockOrderId,
//                 signature: mockSignature,
//                 mock: true
//             });
            
//             return;
//         }

//         // PRODUCTION MODE: Real Razorpay integration
//         console.log('💳 PRODUCTION MODE: Initiating real Razorpay payment');

//         // Pre-flight checks
//         if (!configStatus) {
//             throw new Error('Payment system is still loading. Please wait and try again.');
//         }

//         if (!configStatus.razorpay.exists) {
//             throw new Error('Razorpay is not configured for books. Please contact administrator.');
//         }

//         if (!configStatus.razorpay.enabled) {
//             throw new Error('Razorpay payments for books are currently disabled. Please contact administrator.');
//         }

//         if (!configStatus.razorpay.hasKeyId || !configStatus.razorpay.hasKeySecret) {
//             throw new Error('Razorpay credentials are incomplete for books. Please contact administrator.');
//         }

//         // Ensure amount is valid
//         const amountInRupees = parseFloat(total.toFixed(2));
//         if (amountInRupees < 1) {
//             throw new Error("Minimum order amount for INR is ₹1.00");
//         }

//         console.log('🔄 Calling backend function: createRazorpayOrder');
//         console.log('Request payload:', {
//             amount: amountInRupees,
//             currency: 'INR',
//             receipt: `book_order_${Date.now()}`,
//             config_type: 'books'
//         });

//         let orderResponse;
//         try {
//             orderResponse = await base44.functions.invoke('createRazorpayOrder', {
//                 amount: amountInRupees,
//                 currency: 'INR',
//                 receipt: `book_order_${Date.now()}`,
//                 config_type: 'books'
//             });

//             console.log('✅ Backend response received:', orderResponse);
//         } catch (backendError) {
//             console.error('❌ Backend function failed:', backendError);
//             throw new Error(backendError.response?.data?.error || 'Failed to initialize payment');
//         }

//         if (!orderResponse || !orderResponse.data || !orderResponse.data.id) {
//             console.error('Invalid order response structure:', orderResponse);
//             throw new Error("Invalid response from payment gateway. Please try again.");
//         }

//         console.log('✅ Razorpay order created:', orderResponse.data.id);

//         // Load Razorpay script
//         const scriptLoaded = await loadRazorpayScript();
//         if (!scriptLoaded) {
//             throw new Error("Failed to load payment gateway script. Please refresh and try again.");
//         }

//         const options = {
//             key: razorpayConfig.key_id,
//             amount: orderResponse.data.amount,
//             currency: orderResponse.data.currency,
//             name: 'Madha TV Books',
//             description: `Purchase of ${cart.length} book(s)`,
//             order_id: orderResponse.data.id,
//             handler: async function (response) {
//                 console.log('=== PAYMENT SUCCESSFUL ===');
//                 console.log('Razorpay response:', response);

//                 await finalizeOrder(
//                     response.razorpay_payment_id,
//                     'razorpay',
//                     {
//                         order_id: response.razorpay_order_id,
//                         signature: response.razorpay_signature
//                     }
//                 );
//             },
//             prefill: {
//                 name: customerDetails.name,
//                 email: customerDetails.email,
//                 contact: customerDetails.phone
//             },
//             theme: {
//                 color: '#B71C1C'
//             },
//             modal: {
//                 ondismiss: function () {
//                     console.log('Payment modal closed by user');
//                     setIsProcessing(false);
//                     setIsCheckoutVisible(false);
//                     toast.info('Payment cancelled');
//                 }
//             }
//         };

//         console.log('Opening Razorpay checkout...');
//         const rzp = new window.Razorpay(options);

//         rzp.on('payment.failed', function (response) {
//             console.error('=== PAYMENT FAILED ===');
//             console.error('Failure response:', response.error);

//             setIsProcessing(false);
//             setIsCheckoutVisible(false);
//             toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
//         });

//         rzp.open();

//     } catch (error) {
//         console.error('=== PAYMENT INITIATION FAILED ===');
//         console.error('Error:', error);
//         console.error('Error stack:', error.stack);

//         setIsProcessing(false);
//         setIsCheckoutVisible(false);

//         toast.error(error.message || "Failed to initiate payment. Please try again.", {
//             duration: 10000
//         });
//     }
// };

const handlePlaceOrder = async () => {
    if (isProcessing) {
        console.log('⚠️ Already processing, ignoring duplicate click');
        return;
    }

    console.log('=== 🚀 STARTING PAYMENT PROCESS ===');
    setIsProcessing(true);

    try {
        // Validation
        if (!total || total <= 0) {
            throw new Error("Invalid order amount");
        }

        if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || 
            !customerDetails.address || !customerDetails.pincode) {
            throw new Error("Please fill all customer details");
        }

        const amountInRupees = parseFloat(total.toFixed(2));
        
        if (amountInRupees < 1) {
            throw new Error("Minimum order amount is ₹1.00");
        }

        // Check Razorpay config
        if (!razorpayConfig || !razorpayConfig.key_id) {
            throw new Error('Razorpay configuration not loaded');
        }

        console.log('💳 Creating Razorpay order via backend...');
        console.log('Amount:', amountInRupees);

        // ✅ CALL YOUR BACKEND API HERE
     // ✅ CREATE ORDER (Local vs Production)
let orderResponse;

if (IS_LOCAL) {
    console.log('🧪 LOCAL MODE: Creating mock Razorpay order...');
    
    // Mock order response for local testing
    const amountInPaisa = Math.round(amountInRupees * 100);
    
    orderResponse = {
        data: {
            id: `order_${Date.now()}`,
            entity: 'order',
            amount: amountInPaisa,
            amount_paid: 0,
            amount_due: amountInPaisa,
            currency: 'INR',
            receipt: `book_order_${Date.now()}`,
            status: 'created',
            attempts: 0,
            created_at: Math.floor(Date.now() / 1000)
        }
    };
    
    console.log('✅ Mock order created:', orderResponse.data.id);
    console.log('Amount:', `₹${amountInRupees} (${amountInPaisa} paisa)`);
    
} else {
    console.log('💳 PRODUCTION MODE: Calling PHP CodeIgniter API...');
    
    try {
        const apiUrl = 'https://your-backend-domain.com/api/razorpay/create-order'; // Change this to your API URL
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Add authentication header if needed
                // 'Authorization': 'Bearer YOUR_TOKEN',
            },
            body: JSON.stringify({
                amount: amountInRupees,
                currency: 'INR',
                receipt: `book_order_${Date.now()}`,
                config_type: 'books',
                customer: {
                    name: customerDetails.name,
                    email: customerDetails.email,
                    phone: customerDetails.phone
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('✅ Backend response:', responseData);
        
        // Structure the response to match expected format
        orderResponse = {
            data: responseData.data || responseData.order
        };
        
    } catch (backendError) {
        console.error('❌ Backend error:', backendError);
        throw new Error(backendError.message || 'Failed to create order');
    }
}

        if (!orderResponse || !orderResponse.data || !orderResponse.data.id) {
            throw new Error("Invalid response from payment gateway");
        }

        console.log('✅ Razorpay order created:', orderResponse.data.id);

        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            throw new Error("Failed to load Razorpay script");
        }

        // Close confirmation modal
        setIsCheckoutVisible(false);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Configure Razorpay
        const razorpayOptions = {
            key: razorpayConfig.key_id,
            amount: orderResponse.data.amount,
            currency: orderResponse.data.currency,
            name: 'Madha TV Books',
            description: `Purchase of ${cart.length} book(s)`,
            order_id: orderResponse.data.id,
            
            // Success handler
            handler: async function (response) {
                console.log('=== ✅ PAYMENT SUCCESSFUL ===');
                console.log('Payment ID:', response.razorpay_payment_id);
                
                try {
                    toast.success('Payment successful! Creating order...');
                    
                    await finalizeOrder(
                        response.razorpay_payment_id,
                        'razorpay',
                        {
                            order_id: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            amount: amountInRupees,
                            currency: 'INR'
                        }
                    );
                    
                } catch (finalizeError) {
                    console.error('❌ Finalize error:', finalizeError);
                    setIsProcessing(false);
                    
                    toast.error(
                        'Payment received but order creation failed. ' +
                        'Payment ID: ' + response.razorpay_payment_id,
                        { duration: 10000 }
                    );
                }
            },
            
            prefill: {
                name: customerDetails.name,
                email: customerDetails.email,
                contact: customerDetails.phone
            },
            
            notes: {
                address: customerDetails.address,
                pincode: customerDetails.pincode
            },
            
            theme: {
                color: '#B71C1C'
            },
            
            modal: {
                ondismiss: function () {
                    console.log('⚠️ Payment cancelled');
                    setIsProcessing(false);
                    toast.info('Payment cancelled');
                },
                confirm_close: true
            }
        };

        console.log('🚀 Opening Razorpay checkout...');
        const rzp = new window.Razorpay(razorpayOptions);

        // Payment failed handler
        rzp.on('payment.failed', function (response) {
            console.error('=== ❌ PAYMENT FAILED ===');
            console.error('Error:', response.error);
            
            setIsProcessing(false);
            
            toast.error(
                response.error.description || 'Payment failed',
                { duration: 5000 }
            );
        });

        rzp.open();

    } catch (error) {
        console.error('=== ❌ PAYMENT INITIATION FAILED ===');
        console.error(error);

        setIsProcessing(false);
        setIsCheckoutVisible(false);

        toast.error(error.message || "Failed to initiate payment", {
            duration: 8000
        });
    }
};
const showTestCardInfo = () => {
    if (IS_LOCAL) {
        console.log(`
╔════════════════════════════════════════╗
║     RAZORPAY TEST CARDS (LOCAL)        ║
╠════════════════════════════════════════╣
║ 💳 Success Card:                       ║
║    4111 1111 1111 1111                 ║
║                                        ║
║ ❌ Failure Card:                       ║
║    4000 0000 0000 0002                 ║
║                                        ║
║ 📅 Expiry: Any future date             ║
║ 🔐 CVV: Any 3 digits                   ║
║ 📱 OTP: Any 6 digits                   ║
╚════════════════════════════════════════╝
        `);
    }
};
// useEffect(() => {
//     if (IS_LOCAL) {
//         showTestCardInfo();
//     }
// }, []);

    if (isLoadingBooks) {
        return <div className="flex justify-center items-center p-10"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

  

   return (
    <>
    {console.log('🔍 RENDER - isCheckoutVisible:', isCheckoutVisible)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Books Grid */}
            <div className="lg:col-span-2 order-2 lg:order-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 px-2 md:px-0">Available Books</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 px-2 md:px-0">
                    <AnimatePresence>
                        {Bookslist.map(book => {
                            const price = currency === 'INR' ? book.amount : book.price_usd;
                            const symbol = currency === 'INR' ? <IndianRupee className="w-3 h-3 md:w-4 md:h-4" /> : <DollarSign className="w-3 h-3 md:w-4 md:h-4" />;

                            return (
                                <motion.div
                                    key={book.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                                            <img
                                                src={book.Bookimg || 'https://via.placeholder.com/300x400.png?text=No+Image'}
                                                alt={book.BookTitle}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <CardContent className="p-3 md:p-4">
                                            <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-2">{book.BookTitle}</h3>
                                            <p className="text-xs md:text-sm text-slate-600 mb-2">{book.Author}</p>
                                            <p className="text-[10px] md:text-xs text-slate-500 mb-3 md:mb-4 line-clamp-2">{book.BookDescription}</p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center text-lg md:text-xl font-bold text-red-700">
                                                    {symbol}{price.toFixed(2)}
                                                </div>
                                                <Button
                                                    onClick={() => handleAddToCart(book)}
                                                    size="sm"
                                                    className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                                                >
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1 order-1 lg:order-2">
                <Card className="lg:sticky lg:top-4">
                    <CardHeader className="p-3 md:p-6">
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                            Shopping Cart
                            {cart.length > 0 && (
                                <Badge variant="secondary" className="text-xs">{cart.reduce((acc, item) => acc + item.quantity, 0)} {cart.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'item' : 'items'}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6">
                        {/* Currency - INR Only */}
                        <div className="flex items-center justify-center gap-2 md:gap-3 py-2">
                            <span className="text-xs md:text-sm font-medium text-[#B71C1C]">
                                INR (₹)
                            </span>
                        </div>
                        {/* Customer Details */}
                        <div className="space-y-2 md:space-y-3">
                            <h4 className="font-semibold text-sm md:text-base">Customer Details</h4>
                            <Input
                                placeholder="Full Name"
                                value={customerDetails.name}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                required
                                className="text-xs md:text-sm h-9 md:h-10"
                            />
                            <Input
                                placeholder="Email"
                                type="email"
                                value={customerDetails.email}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                required
                                className="text-xs md:text-sm h-9 md:h-10"
                            />
                            <Input
                                placeholder={language === 'tamil' ? 'தொலைபேசி (10 இலக்கங்கள்)' : 'Phone (10 digits)'}
                                type="tel"
                                value={customerDetails.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) {
                                        setCustomerDetails({ ...customerDetails, phone: value });
                                    }
                                }}
                                maxLength={10}
                                required
                                className="text-xs md:text-sm h-9 md:h-10"
                            />
                            <Textarea
                                placeholder="Shipping Address"
                                value={customerDetails.address}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                                className="h-16 md:h-20 text-xs md:text-sm resize-none"
                                required
                            />
                            <Input
                                placeholder="Pincode"
                                value={customerDetails.pincode}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, pincode: e.target.value })}
                                required
                                className="text-xs md:text-sm h-9 md:h-10"
                            />
                        </div>

                        {/* Cart Items */}
                        {cart.length === 0 ? (
                            <p className="text-slate-500 text-center py-6 md:py-4 text-xs md:text-sm">Your cart is empty</p>
                        ) : (
                            <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.book.id} className="flex items-center gap-2 p-2 border rounded">
                                        <img
                                            src={item.book.Bookimg || 'https://via.placeholder.com/80x120'}
                                            alt={item.book.BookTitle}
                                            className="w-10 h-14 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-xs">
                                                {item.book.BookTitle}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                ₹{item.book.amount}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={item.quantity <= 1}
                                                onClick={() =>
                                                    handleUpdateQuantity(item.book.id, item.quantity - 1)
                                                }
                                            >
                                                −
                                            </Button>
                                            <span className="min-w-[20px] text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={item.quantity >= 10}
                                                onClick={() =>
                                                    handleUpdateQuantity(item.book.id, item.quantity + 1)
                                                }
                                            >
                                                +
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveFromCart(item.book.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Cart Summary */}
                        {cart.length > 0 && (
                            <div className="space-y-1.5 md:space-y-2 pt-3 md:pt-4 border-t">
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span>Subtotal</span>
                                    <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span>Packaging Charge ({totalQuantity} × {currencySymbol}{taxConfig.packaging_charge || 50})</span>
                                    <span className="text-green-600 font-medium">{packagingCharge === 0 ? 'Free' : `${currencySymbol}${packagingCharge.toFixed(2)}`}</span>
                                </div>
                                {taxConfig.is_tax_enabled && currency === 'INR' && (
                                    <>
                                        <div className="flex justify-between text-xs md:text-sm">
                                            <span>GST ({taxConfig.tax_rate}%)</span>
                                            <span>{currencySymbol}{totalTaxAmount.toFixed(2)}</span>
                                        </div>
                                        {cgstAmount > 0 && (
                                            <div className="flex justify-between text-[10px] md:text-xs text-slate-600 pl-3 md:pl-4">
                                                <span>CGST ({taxConfig.tax_rate / 2}%)</span>
                                                <span>{currencySymbol}{cgstAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {sgstAmount > 0 && (
                                            <div className="flex justify-between text-[10px] md:text-xs text-slate-600 pl-3 md:pl-4">
                                                <span>SGST ({taxConfig.tax_rate / 2}%)</span>
                                                <span>{currencySymbol}{sgstAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {igstAmount > 0 && (
                                            <div className="flex justify-between text-[10px] md:text-xs text-slate-600 pl-3 md:pl-4">
                                                <span>IGST ({taxConfig.tax_rate}%)</span>
                                                <span>{currencySymbol}{igstAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="flex justify-between font-bold text-sm md:text-base pt-2 border-t">
                                    <span>Total</span>
                                    <span>{currencySymbol}{total.toFixed(2)}</span>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="w-full text-xs md:text-sm h-9 md:h-10 mt-2"
                                    disabled={isProcessing || total <= 0}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>Proceed to Payment</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* MODAL - MUST BE OUTSIDE THE GRID */}
        {/* Checkout Confirmation Modal */}
{isCheckoutVisible && (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4"
        style={{ zIndex: 99999 }}
        onClick={() => !isProcessing && setIsCheckoutVisible(false)}
    >
        <div
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Confirm Your Order</h3>
            
            {/* Description */}
            <p className="text-gray-600 mb-6 text-sm">
                You are about to place an order for <strong className="text-gray-900">₹{total.toFixed(2)}</strong>. Click below to proceed with payment.
            </p>
            
            {/* Order Summary Box */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {/* Packaging Charge */}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Packaging ({totalQuantity} × ₹{taxConfig.packaging_charge || 50}):</span>
                    <span className="text-green-600 font-semibold">₹{packagingCharge.toFixed(2)}</span>
                </div>
                
                {/* GST */}
                {taxConfig.is_tax_enabled && currency === 'INR' && (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700">GST ({taxConfig.tax_rate}%):</span>
                            <span className="text-gray-900 font-medium">₹{totalTaxAmount.toFixed(2)}</span>
                        </div>
                        
                        {/* IGST/CGST/SGST Breakdown */}
                        {igstAmount > 0 && (
                            <div className="flex justify-between text-xs text-gray-500 pl-4">
                                <span>IGST ({taxConfig.tax_rate}%):</span>
                                <span>₹{igstAmount.toFixed(2)}</span>
                            </div>
                        )}
                        {cgstAmount > 0 && (
                            <div className="flex justify-between text-xs text-gray-500 pl-4">
                                <span>CGST ({taxConfig.tax_rate / 2}%):</span>
                                <span>₹{cgstAmount.toFixed(2)}</span>
                            </div>
                        )}
                        {sgstAmount > 0 && (
                            <div className="flex justify-between text-xs text-gray-500 pl-4">
                                <span>SGST ({taxConfig.tax_rate / 2}%):</span>
                                <span>₹{sgstAmount.toFixed(2)}</span>
                            </div>
                        )}
                    </>
                )}
                
                {/* Total */}
                <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                
                {/* Additional Info */}
                <div className="pt-3 border-t border-gray-200 space-y-1">
                    <p className="text-xs text-gray-500">
                        <strong className="text-gray-600">Items:</strong> {cart.length}
                    </p>
                    <p className="text-xs text-gray-500">
                        <strong className="text-gray-600">Total Quantity:</strong> {totalQuantity}
                    </p>
                    <p className="text-xs text-gray-500">
                        <strong className="text-gray-600">Payment Method:</strong> {currency === 'INR' ? 'Razorpay' : 'PayPal'}
                    </p>
                </div>
            </div>
            
            {/* Proceed Button */}
            <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || total <= 0}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </span>
                ) : (
                    'Proceed to Pay'
                )}
            </button>
        </div>
    </div>
)}

        {/* Success Modal */}
        {showSuccessModal && orderDetails && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-center">Order Placed Successfully!</h3>
                    <p className="text-sm text-slate-600 text-center mt-2">
                        TRN: {orderDetails.trn}
                    </p>
                    <div className="flex flex-col gap-3 mt-6">
                        <Button onClick={() => onViewInvoice(orderDetails.orderId)}>
                            View Invoice
                        </Button>
                        <Button onClick={() => onDownloadInvoice(orderDetails.orderId)}>
                            Download Invoice
                        </Button>
                        <Button
                            onClick={() => {
                                setShowSuccessModal(false);
                                onOrderSuccess();
                            }}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
    </>
);
};

// Order History Component
const OrderHistory = ({ user, onViewInvoice, onDownloadInvoice }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const userOrders = await BookOrder.filter({ user_id: user.id }, '-created_date');
            setOrders(userOrders);
        } catch (error) {
            console.error("Failed to load orders:", error);
            toast.error("Failed to load order history.");
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced status badge styling
    const getStatusBadgeStyle = (status) => {
        const styles = {
            pending: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md',
            processing: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md',
            shipped: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-md',
            delivered: 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md',
            cancelled: 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-md'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    // Enhanced payment badge styling
    const getPaymentBadgeStyle = (paymentStatus) => {
        const styles = {
            completed: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md border-2 border-emerald-300',
            pending: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md border-2 border-orange-300',
            failed: 'bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-md border-2 border-rose-300'
        };
        return styles[paymentStatus] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-10"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-8 md:py-10 px-4">
                    <Package className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2">No Orders Yet</h3>
                    <p className="text-xs md:text-sm text-slate-500">You haven't placed any book orders yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">My Book Orders</CardTitle>
                    <CardDescription className="text-xs md:text-sm">View your past book purchases and order details.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs md:text-sm">TRN</TableHead>
                                    <TableHead className="text-xs md:text-sm">Order ID</TableHead>
                                    <TableHead className="text-xs md:text-sm">Date</TableHead>
                                    <TableHead className="text-xs md:text-sm">Amount</TableHead>
                                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                                    <TableHead className="text-xs md:text-sm">Payment</TableHead>
                                    <TableHead className="text-xs md:text-sm">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-[10px] md:text-sm">{order.trn}</TableCell>
                                        <TableCell className="font-mono text-[10px] md:text-sm">{order.id.slice(-8).toUpperCase()}</TableCell>
                                        <TableCell className="text-[10px] md:text-sm">{format(new Date(order.created_date), 'PP')}</TableCell>
                                        <TableCell className="text-[10px] md:text-sm">
                                            {order.currency === 'INR' ? '₹' : '$'}{order.total_amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusBadgeStyle(order.order_status)} font-semibold uppercase text-[9px] md:text-xs px-2 md:px-3 py-0.5 md:py-1`}>
                                                {order.order_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${getPaymentBadgeStyle(order.payment_status)} font-semibold uppercase text-[9px] md:text-xs px-2 md:px-3 py-0.5 md:py-1`}>
                                                {order.payment_status === 'completed' ? 'PAID' :
                                                    order.payment_status === 'failed' ? 'FAILED' : 'PENDING'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                                <Button size="sm" variant="outline" onClick={() => onViewInvoice(order.id)} className="text-[10px] md:text-xs h-7 md:h-8 px-2">
                                                    <FileText className="w-3 h-3 mr-1" />View
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => onDownloadInvoice(order.id)} className="text-[10px] md:text-xs h-7 md:h-8 px-2">
                                                    <Download className="w-3 h-3 mr-1" />Download
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Main Component
export default function UserBuyBooks() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // useEffect(() => {
    //     const fetchUser = async () => {
    //         setIsLoading(true);
    //         try {
    //             const currentUser = await User.me();
    //             setUser(currentUser);
    //         } catch (error) {
    //             console.error("User not found or failed to fetch:", error);
    //             // Optionally handle case where user is not logged in or fetch fails
    //         }
    //         setIsLoading(false);
    //     };
    //     fetchUser();
    // }, []);

useEffect(() => {
    console.log('ℹ️ User fetch skipped (LOCAL MODE)');
    setUser(null);
    setIsLoading(false);
}, []);

    const handleOrderSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDownloadInvoice = useCallback(async (orderId) => {
        try {
            toast.info('Generating invoice...');

            const order = await BookOrder.get(orderId);
            const orderItems = await BookOrderItem.filter({ order_id: orderId });

            if (!order || orderItems.length === 0) {
                toast.error('Order details not found');
                return;
            }

            // Use the values stored in the order object directly
            const invoiceData = {
                order: {
                    ...order,
                    // No need to recalculate subtotal, packaging, tax amounts here
                    // They are already stored in the `order` object from the database
                    // Ensure the order object from the DB contains these fields:
                    // subtotal_amount, packaging_charge, tax_amount, cgst_amount, sgst_amount, igst_amount, total_amount, state, country, booker_pincode
                },
                items: orderItems,
                customer: {
                    name: order.customer_name,
                    email: order.customer_email,
                    phone: order.customer_phone,
                    address: order.shipping_address,
                    pincode: order.booker_pincode // Pass pincode from order
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
    }, []);

    const handleViewInvoice = useCallback(async (orderId) => {
        try {
            toast.info('Generating invoice...');

            const order = await BookOrder.get(orderId);
            const orderItems = await BookOrderItem.filter({ order_id: orderId });

            if (!order || orderItems.length === 0) {
                toast.error('Order details not found');
                return;
            }

            // Use the values stored in the order object directly
            const invoiceData = {
                order: {
                    ...order,
                    // No need to recalculate subtotal, packaging, tax amounts here
                    // They are already stored in the `order` object from the database
                },
                items: orderItems,
                customer: {
                    name: order.customer_name,
                    email: order.customer_email,
                    phone: order.customer_phone,
                    address: order.shipping_address,
                    pincode: order.booker_pincode // Pass pincode from order
                }
            };

            const { generateBookInvoicePdf } = await import('../components/utils/bookInvoiceGenerator');
            const doc = await generateBookInvoicePdf(invoiceData);

            const orderNumber = order.trn || order.id.slice(-8).toUpperCase();
            const fileName = `MadhaTV-BookOrder-${orderNumber}.pdf`;

            const pdfDataUri = doc.output('dataurlstring');

            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${fileName}</title>
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
    }, []);

    if (isLoading) {
        return (
            <UserDashboardLayout>
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </UserDashboardLayout>
        );
    }

    return (
        <UserDashboardLayout>
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-[#B71C1C] mb-6">📚 Buy Books</h1>
                <Tabs defaultValue="shop" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="shop"><ShoppingCart className="w-4 h-4 mr-2" />Shop Books</TabsTrigger>
                        <TabsTrigger value="orders"><History className="w-4 h-4 mr-2" />My Orders</TabsTrigger>
                    </TabsList>
                    <TabsContent value="shop" className="mt-6">
                        <BookShopping
                            user={user}
                            onOrderSuccess={handleOrderSuccess}
                            onViewInvoice={handleViewInvoice}
                            onDownloadInvoice={handleDownloadInvoice}
                        />
                    </TabsContent>
                    <TabsContent value="orders" className="mt-6">
                        <OrderHistory
                            user={user}
                            key={refreshTrigger}
                            onViewInvoice={handleViewInvoice}
                            onDownloadInvoice={handleDownloadInvoice}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </UserDashboardLayout>
    );
}