import React, { useState, useEffect, useRef, useCallback } from 'react';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShoppingCart, Trash2, CalendarIcon, CheckCircle, FileText, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { ServiceBooking, User, RazorpayConfig, PayPalConfig, TaxConfig, HomepageService, BlockedServiceDate } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { generateInvoicePdf } from '../components/utils/pdfGenerator';
import { calculateTax } from '../components/utils/taxCalculator';
import { format, startOfDay, isSunday, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import servicelists from "../components/BookingServices/servicelists.json";
import { getLoggedInUser } from "../api/auth"; // path-ai check seidhu kollungal

// const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// const IS_LOCAL = false;


const calculateRecurringTotal = (price, bookingType) => {
    if (bookingType === 'monthly') return price * 12;
    if (bookingType === 'yearly') return price * 12;
    return price;
};

const NO_IMAGE_AVAILABLE_URL = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=300&fit=crop';

// LocalStorage key for cart persistence
const USER_CART_STORAGE_KEY = 'madha_tv_user_booking_cart';

export default function UserBookServices() {
    const [user, setUser] = useState(null);
    const [userBookings, setUserBookings] = useState([]);
    
    // Initialize cart from localStorage
    const [bookingItems, setBookingItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem(USER_CART_STORAGE_KEY);
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                // Reconstruct Date objects for form data
                return parsed.map(item => ({
                    ...item,
                    formData: {
                        ...item.formData,
                        booking_date: item.formData.booking_date ? new Date(item.formData.booking_date) : null,
                        birthday_date: item.formData.birthday_date ? new Date(item.formData.birthday_date) : null,
                        marriage_date: item.formData.marriage_date ? new Date(item.formData.marriage_date) : null,
                        ordination_date: item.formData.ordination_date ? new Date(item.formData.ordination_date) : null,
                        vows_date: item.formData.vows_date ? new Date(item.formData.vows_date) : null,
                        jubilee_date: item.formData.jubilee_date ? new Date(item.formData.jubilee_date) : null,
                    }
                }));
            }
            return [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });
    
    const [currency, setCurrency] = useState('INR');
    const [paymentGateway, setPaymentGateway] = useState('razorpay');
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [payPalEnabled, setPayPalEnabled] = useState(false);
    const [razorpayConfig, setRazorpayConfig] = useState(null);
    const [payPalConfig, setPayPalConfig] = useState(null);
    const [taxConfig, setTaxConfig] = useState(null);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [showPayPalModal, setShowPayPalModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [services, setServices] = useState([]);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

    // CRITICAL FIX: Load all blocked dates once at page level
    const [allBlockedDates, setAllBlockedDates] = useState([]);
    const [isLoadingBlockedDates, setIsLoadingBlockedDates] = useState(false);

    const finalBookingsRef = useRef([]);

    const [successModalData, setSuccessModalData] = useState({
        isOpen: false,
        bookings: [],
        paymentRef: '',
        currency: 'INR'
    });

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBookingData, setSelectedBookingData] = useState(null);
    const [showPreviousBookings, setShowPreviousBookings] = useState(false);
    const [previousBookingsForService, setPreviousBookingsForService] = useState([]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(USER_CART_STORAGE_KEY, JSON.stringify(bookingItems));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [bookingItems]);

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };

        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);

        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);

    const getServiceDisplayName = (service) => {
        if (!service) return '';
        return language === 'tamil' && service.title_tamil ? service.title_tamil : service.title;
    };

    const getServiceShortContent = (service) => {
        if (!service) return '';
        return language === 'tamil' && service.short_content_tamil ? service.short_content_tamil : service.short_content;
    };



const createPayment = async (payload) => {
  const res = await fetch(
    "/api/v2/payment.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload)
    }
  );

  return res.json();
};
// const createRazorpayOrder = async (orderId) => {
//   // 1. Get real user from localStorage helper
//   const currentUser = getLoggedInUser();
//   const finalAmount = calculateGrandTotal();

//   if (!currentUser) {
//     toast.error("User session not found. Please login again.");
//     return;
//   }

//   try {
//     // 2. Call the Non-Seamless PHP API
//     const res = await fetch("/api/v2/razorpay/razorpay_nonseamless.php", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       },
//       body: new URLSearchParams({
//         user_id: currentUser.id,           
//         amount: finalAmount, 
//         order_id: orderId, // Temp table ID from payment.php
//         name: currentUser.full_name || "User",
//         email: currentUser.email || ""
//       })
//     });

//     const data = await res.json();
//     console.log("Razorpay Redirect Response:", data);

//     if (!data.error && data.payment_url) {
//       // 3. SUCCESS: Redirect the entire window to Razorpay hosted page
//       toast.info("Redirecting to Razorpay...");
//       window.location.href = data.payment_url;
//     } else {
//       toast.error(data.message || "Failed to generate payment link");
//     }
//   } catch (e) {
//     console.error("Razorpay Error:", e);
//     toast.error("Connection error with payment gateway");
//   }
// };


const createRazorpayOrder = async (orderId) => {
  const currentUser = getLoggedInUser();
  const finalAmount = calculateGrandTotal();

  if (!currentUser) {
    toast.error("User session not found!");
    return;
  }

  try {
    // 1. Razorpay Order Creation (Redirect Flow)
    const res = await fetch("/api/v2/razorpay/razorpay_nonseamless.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        user_id: currentUser.id,           
        amount: finalAmount, 
        order_id: orderId, // Temp table ID
        name: currentUser.full_name || "User",
        email: currentUser.email || ""
      })
    });

    const data = await res.json();

    if (!data.error && data.payment_url) {
      toast.info("Redirecting to Razorpay...");
      // 2. Redirect seiyum munnadi URL-il dharavugal sariyaaga iruppadhai confirm seiyungal
      window.location.href = data.payment_url;
    } else {
      toast.error(data.message || "Payment Link Generation Failed");
    }
  } catch (e) {
    toast.error("Network Error!");
  }
};

/**
 * Processes the final payment step by notifying the server.
 * Used after a successful Razorpay transaction.
 */
const sendPaymentCallback = async (razorpayResponse, orderId) => {
  // 1. Get real user data from your local storage helper
  const currentUser = getLoggedInUser();

  if (!currentUser) {
    console.error("Critical Error: User session lost during payment.");
    toast.error("User session lost. Please contact support with your Payment ID.");
    return;
  }

  try {
    console.log("🚀 Initiating Server Callback for Order:", orderId);

    // 2. Send the data to your fixed payment_callback.php
    const res = await fetch("/api/v2/payment_callback.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        // Essential fields required by your PHP FIX 2
        user_id: currentUser.id,
        order_id: orderId,       // The ID from servicetemp table
        order_status: "success", // Explicitly set to pass the stripos check in PHP

        // Razorpay response fields
        razorpay_payment_id: razorpayResponse.razorpay_payment_id || "",
        razorpay_order_id: razorpayResponse.razorpay_order_id || "",
        razorpay_signature: razorpayResponse.razorpay_signature || ""
      })
    });

    const data = await res.json();
    console.log("✅ Server Response:", data);

    // 3. Handle the server's final verdict
    if (!data.error) {
      // Success: Database updated, invoice created, and email sent
      alert("✅ Payment & Booking Successful!\nAn invoice has been sent to your email.");
      
      // Optional: Redirect to a dedicated success page
      // window.location.href = "/booking-confirmation?order=" + orderId;
    } else {
      // Error: Something went wrong in the PHP logic (e.g., invoice not found)
      console.error("❌ Callback Logical Error:", data.error_msg);
      alert("⚠️ Payment was successful, but there was an issue updating your booking: " + data.error_msg);
    }
  } catch (error) {
    // Network or parsing error
    console.error("🌐 Network Error during callback:", error);
    alert("❌ Connection error. Please do not refresh. Contact support with your Payment ID.");
  }
};


    // CRITICAL FIX: Load all blocked dates once on page load
   const loadAllBlockedDates = useCallback(async () => {
    if (IS_LOCAL) {
        console.log('⚠️ Skipping blocked dates load (LOCAL MODE)');
        setAllBlockedDates([]);
        setIsLoadingBlockedDates(false);
        return;
    }
    
    setIsLoadingBlockedDates(true);
    try {
        console.log('📅 Loading all blocked dates...');
        const blocked = await BlockedServiceDate.filter({ is_active: true });
        console.log(`✅ Loaded ${blocked.length} blocked dates`);
        setAllBlockedDates(blocked);
    } catch (error) {
        console.error('Error loading blocked dates:', error);
        setAllBlockedDates([]);
    } finally {
        setIsLoadingBlockedDates(false);
    }
}, []);

 const loadServices = useCallback(async () => {
  try {
    const transformedServices = servicelists.map(service => ({
      id: service.id,
      key: service.servicetitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_'),
      title: service.servicetitle,
      title_tamil: service.servicetitle,
      short_content: '',
      short_content_tamil: '',
      image_url: service.img,
      priceINR: service.amount,
      priceUSD: Math.round(service.amount / 80),
      timing: "6:00 PM",
      popular: false,
      supportsRecurring: false,
      requiresImage: true,
      yearlyLimit: false,
      recurringOptions: ['one-time'],
      isOrdinationService: false
    }));

    setServices(transformedServices);
    console.log('✅ Services loaded from JSON:', transformedServices);
  } catch (error) {
    console.error('❌ Error loading services from JSON:', error);
    setServices([]);
  }
}, []);

useEffect(() => {
  loadServices();
}, [loadServices]);


    const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            let currentUser;
            
            if (IS_LOCAL) {
                // Mock user for local development
                console.log('⚠️ Using mock user data (LOCAL MODE)');
                currentUser = {
                    id: 'mock_user_123',
                    full_name: 'Test User',
                    email: 'test@example.com',
                    phone: '+919876543210',
                    address: '123 Main Street, Chennai',
                    address_line_1: '123 Main Street, Chennai',
                    state: 'Tamil Nadu',
                    country: 'India',
                    pincode: '600001',
                    pin_code: '600001'
                };
            } else {
                // Production: Get real user
                currentUser = await User.me();
            }
            
            setUser(currentUser);
            
            await Promise.all([
                loadUserBookings(currentUser.id),
                loadServices(),
                loadRazorpayConfig(),
                loadPayPalConfig(),
                loadTaxConfig(),
                loadAllBlockedDates()
            ]);
        } catch (error) {
            console.error("Failed to load user data", error);
            
            // If error in LOCAL MODE, still set mock user
            if (IS_LOCAL) {
                console.warn('⚠️ Error loading data in LOCAL MODE, using mock data anyway');
                setUser({
                    id: 'mock_user_123',
                    full_name: 'Test User',
                    email: 'test@example.com',
                    phone: '+919876543210',
                    address: '123 Main Street, Chennai',
                    state: 'Tamil Nadu',
                    country: 'India',
                    pincode: '600001'
                });
            }
        }
        setIsLoading(false);
    };
    loadInitialData();
}, [loadServices, loadAllBlockedDates]);

   const loadUserBookings = async (userId) => {
    if (IS_LOCAL) {
        console.log('⚠️ Skipping user bookings load (LOCAL MODE)');
        setUserBookings([]);
        return;
    }
    
    try {
        const bookings = await ServiceBooking.filter({ user_id: userId }, '-created_date');
        setUserBookings(bookings || []);
    } catch (error) {
        console.error('Error loading user bookings:', error);
        setUserBookings([]);
    }
};
    
const loadRazorpayConfig = async () => {
  try {
    const res = await fetch(
      '/api/v2/razorpay/config.php?config_type=bookings'
    );

    const config = await res.json();
    console.log("Razorpay config:", config);

    if (config.key_id && config.is_enabled) {
      setRazorpayConfig(config);
      setRazorpayEnabled(true);
    } else {
      setRazorpayEnabled(false);
    }
  } catch (e) {
    console.error("Razorpay config load failed", e);
    setRazorpayEnabled(false);
  }
};



   const loadPayPalConfig = async () => {
    if (IS_LOCAL) {
        console.warn('⚠️ Skipping PayPal config (LOCAL MODE)');
        setPayPalConfig(null);
        setPayPalEnabled(false);
        return;
    }
    
    try {
        const [config] = await PayPalConfig.filter({ config_type: 'bookings' });
        if (config) {
            setPayPalConfig(config);
            setPayPalEnabled(config.is_enabled && !!config.client_id && !!config.client_secret);
        } else { 
            setPayPalEnabled(false); 
        }
    } catch (error) { 
        setPayPalEnabled(false); 
    }
};

  const loadTaxConfig = async () => {
    if (IS_LOCAL) {
        console.warn('⚠️ Using mock tax config (LOCAL MODE)');
        setTaxConfig({
            is_tax_enabled: true,
            home_state: 'Tamil Nadu',  // ✅ FIXED: Added home_state
            cgst_rate: 9,               // ✅ FIXED: Split into CGST
            sgst_rate: 9,               // ✅ FIXED: Split into SGST
            igst_rate: 18,              // ✅ FIXED: Added IGST rate
            tax_type: 'GST'
        });
        return;
    }
    
    try {
        const [config] = await TaxConfig.list();
        setTaxConfig(config);
    } catch (error) { 
        setTaxConfig(null); 
    }
};

    const handleServiceSelect = (service) => {
        console.log("Booking is enabled",service)
        if ((currency === 'INR' && !razorpayEnabled) || (currency === 'USD' && !payPalEnabled)) {
            toast.error("The selected payment method is currently disabled. Please contact support.");
            return;
        }

        if (bookingItems.length >= 5) {
            toast.error("You can book up to 5 services at a time.");
            return;
        }
        
        const previousBookings = user ? userBookings.filter(b => b.service_type === service.key) : [];
        setSelectedService(service);

        if (user && previousBookings.length > 0) {
            setPreviousBookingsForService(previousBookings);
            setShowPreviousBookings(true);
        } else {
            setSelectedBookingData(null); 
            setShowBookingModal(true);
        }
    };
    
    const proceedToBooking = (bookingToPreFill = null) => {
        setShowPreviousBookings(false);
        setSelectedBookingData(bookingToPreFill);
        setShowBookingModal(true);
    };

    const addToCart = (bookingData) => {
        const cartItem = {
            id: Date.now(),
            service: selectedService,
            formData: bookingData,
            price: currency === 'INR' ? selectedService.priceINR : selectedService.priceUSD
        };
        setBookingItems(prev => [...prev, cartItem]);
        setShowBookingModal(false);
        setShowPreviousBookings(false);
        toast.success(`${getServiceDisplayName(selectedService)} added to your cart.`);
    };

    const removeFromCart = (itemId) => {
        setBookingItems(prev => prev.filter(item => item.id !== itemId));
        toast.info("Service removed from cart.");
    };

    const calculateTotal = () => bookingItems.reduce((total, item) => {
        const itemPrice = calculateRecurringTotal(item.price, item.formData.booking_type || 'one-time');
        return total + itemPrice;
    }, 0);

    const calculateCartTax = () => {
        if (!taxConfig || currency !== 'INR') return { cgst: 0, sgst: 0, igst: 0, totalTax: 0, taxType: 'none' };
        const subtotal = calculateTotal();
        const userState = user?.state || '';
        const userCountry = user?.country || 'India';
        return calculateTax(subtotal, userState, userCountry, taxConfig);
    };
    
    const calculateGrandTotal = () => calculateTotal() + calculateCartTax().totalTax;
    
    // const handlePayment = async () => {
    //    console.log('🔵 Payment button clicked!');
    
    //     if (bookingItems.length === 0) {
    //         toast.error('Your cart is empty');
    //         return;
    //     }
        
    //     setIsPaymentLoading(true);
    //    try {
    //         console.log('⏳ Using temporary TRN for pending bookings...');
    //         const tempTrn = `TMP_${Date.now().toString().slice(-10)}`;
    //         console.log('✅ Temporary TRN:', tempTrn);

    //         let nextOrderIdNum = 1;
            
    //         if (!IS_LOCAL) {
    //             const lastBookingResult = await ServiceBooking.list('-order_id', 1);
    //             if (lastBookingResult && lastBookingResult.length > 0 && lastBookingResult[0].order_id) {
    //                 const lastId = parseInt(lastBookingResult[0].order_id, 10);
    //                 if (!isNaN(lastId)) {
    //                     nextOrderIdNum = lastId + 1;
    //                 }
    //             }
    //         }
    //         const formatDateOnly = (date) => {
    //             if (!date) return null;
    //             const d = new Date(date);
    //             const year = d.getFullYear();
    //             const month = String(d.getMonth() + 1).padStart(2, '0');
    //             const day = String(d.getDate()).padStart(2, '0');
    //             return `${year}-${month}-${day}`;
    //         };

    //         const cartWithImages = await Promise.all(bookingItems.map(async (item) => {
    //             let finalPhotoUrl = item.formData.reusedPhotoUrl || null;
    //             if (item.formData.imageFile) {
    //                 const { file_url } = await UploadFile({ file: item.formData.imageFile });
    //                 finalPhotoUrl = file_url;
    //             }
    //             return { ...item, photoUrl: finalPhotoUrl };
    //         }));

    //         const allBookingPayloads = [];
            
    //         for (const item of cartWithImages) {
    //             const bookingType = item.formData.booking_type || 'one-time';
    //             const basePrice = item.price;
    //             const itemTax = (currency === 'INR' && taxConfig) ? calculateTax(basePrice, user?.state || '', user?.country || 'India', taxConfig) : { totalTax: 0, cgst: 0, sgst: 0, igst: 0, taxType: 'none' };

    //             if (bookingType === 'one-time') {
    //               allBookingPayloads.push({
    //                 trn: tempTrn,
    //                 order_id: String(nextOrderIdNum++).padStart(3, '0'),
    //                     user_id: user?.id, 
    //                     service_type: item.service.key,
    //                     booking_date: formatDateOnly(item.formData.booking_date),
    //                     intention_text: item.formData.intention_text || item.formData.description, 
    //                     description: item.formData.description,
    //                     beneficiary_name: item.formData.beneficiary_name,
    //                     booker_name: item.formData.booker_name, 
    //                     booker_email: item.formData.booker_email,
    //                     booker_phone: item.formData.booker_phone, 
    //                     booker_address: user?.address || user?.address_line_1 || '',
    //                     booker_pincode: user?.pincode || user?.pin_code || '',
    //                     booker_photo_url: item.photoUrl,
    //                     country: currency === 'INR' ? (user?.country || 'India') : 'International',
    //                     state: currency === 'INR' ? (user?.state || '') : '', 
    //                     currency: currency, 
    //                     amount: basePrice,
    //                     tax_amount: itemTax.totalTax, 
    //                     cgst_amount: itemTax.cgst, 
    //                     sgst_amount: itemTax.sgst, 
    //                     igst_amount: itemTax.igst,
    //                     tax_type: itemTax.taxType, 
    //                     payment_method: paymentGateway, 
    //                     payment_status: 'pending', 
    //                     status: 'pending',
    //                     booking_type: 'one-time',
    //                     birthday_date: formatDateOnly(item.formData.birthday_date),
    //                     marriage_date: formatDateOnly(item.formData.marriage_date),
    //                     ordination_date: formatDateOnly(item.formData.ordination_date),
    //                     vows_date: formatDateOnly(item.formData.vows_date),
    //                     jubilee_date: formatDateOnly(item.formData.jubilee_date),
    //                 });
    //             } else {
    //                 const startDate = new Date(item.formData.booking_date);
    //                 const monthsToCreate = 12;
    //                 const parentId = `parent_${Date.now()}_${Math.random()}`;
    //                 for (let i = 0; i < monthsToCreate; i++) {
    //                     const bookingDate = new Date(startDate);
    //                     bookingDate.setMonth(startDate.getMonth() + i);
    //                     if (item.service.key === 'holy_mass' && isSunday(bookingDate)) {
    //                         bookingDate.setDate(bookingDate.getDate() + 1);
    //                     }
    //                     allBookingPayloads.push({
    //                       trn: tempTrn,
    //                       order_id: String(nextOrderIdNum++).padStart(3, '0'),
    //                         user_id: user?.id, 
    //                         service_type: item.service.key,
    //                         booking_date: formatDateOnly(bookingDate),
    //                         intention_text: item.formData.intention_text || item.formData.description, 
    //                         description: item.formData.description,
    //                         beneficiary_name: item.formData.beneficiary_name,
    //                         booker_name: item.formData.booker_name, 
    //                         booker_email: item.formData.booker_email,
    //                         booker_phone: item.formData.booker_phone, 
    //                         booker_address: user?.address || user?.address_line_1 || '',
    //                         booker_pincode: user?.pincode || user?.pin_code || '',
    //                         booker_photo_url: item.photoUrl,
    //                         country: currency === 'INR' ? (user?.country || 'India') : 'International',
    //                         state: currency === 'INR' ? (user?.state || '') : '', 
    //                         currency: currency, 
    //                         amount: basePrice,
    //                         tax_amount: itemTax.totalTax, 
    //                         cgst_amount: itemTax.cgst, 
    //                         sgst_amount: itemTax.sgst, 
    //                         igst_amount: itemTax.igst,
    //                         tax_type: itemTax.taxType, 
    //                         payment_method: paymentGateway, 
    //                         payment_status: 'pending', 
    //                         status: 'pending',
    //                         booking_type: bookingType, 
    //                         parent_booking_id: i === 0 ? null : parentId,
    //                         birthday_date: formatDateOnly(item.formData.birthday_date),
    //                         marriage_date: formatDateOnly(item.formData.marriage_date),
    //                         ordination_date: formatDateOnly(item.formData.ordination_date),
    //                         vows_date: formatDateOnly(item.formData.vows_date),
    //                         jubilee_date: formatDateOnly(item.formData.jubilee_date),
    //                     });
    //                 }
    //             }
    //         }
            
    //         // Create bookings based on environment
    //         let tempBookings;

    //         if (IS_LOCAL) {
    //             // In LOCAL MODE, store bookings in memory instead of database
    //             console.log('⚠️ Skipping database save (LOCAL MODE)');
    //             console.log('📦 Mock bookings:', allBookingPayloads);
                
    //             // Create mock booking objects with IDs
    //             tempBookings = allBookingPayloads.map((payload, index) => ({
    //                 ...payload,
    //                 id: `mock_booking_${Date.now()}_${index}`,
    //                 created_date: new Date().toISOString()
    //             }));
                
    //             console.log('✅ Created', tempBookings.length, 'mock bookings');
    //         } else {
    //             // Production: Save to database
    //             tempBookings = await ServiceBooking.bulkCreate(allBookingPayloads);
    //             console.log('✅ Created', tempBookings.length, 'pending bookings with temporary TRN:', tempTrn);
    //         }

    //         finalBookingsRef.current = tempBookings;

    //         // ✅ LOCAL MODE: Simulate payment immediately
    //         if (IS_LOCAL) {
    //             console.log('💳 Simulating payment in LOCAL MODE...');
    //             toast.info('Simulating payment in local mode...', { duration: 2000 });
                
    //             await new Promise(resolve => setTimeout(resolve, 2000));
                
    //             const mockPaymentId = `pay_local_${Date.now()}`;
    //             await handlePaymentSuccess({ razorpay_payment_id: mockPaymentId });
                
    //             setIsPaymentLoading(false);
    //             return; // Stop here, don't load Razorpay/PayPal
    //         }
    //             if (paymentGateway === 'paypal') {
    //                     setShowPayPalModal(true);
    //                     setIsPaymentLoading(false);
    //             }else{
    //                 const totalAmount = calculateGrandTotal();
    //                 const receiptId = `BK-U${user.id.slice(-4)}-${Date.now().toString().slice(-6)}`;
    //                 const script = document.createElement('script');
    //                 script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    //                 script.async = true;
    //                 document.head.appendChild(script);
    //                 script.onload = () => {
    //                     const options = {
    //                         key: razorpayConfig.key_id, 
    //                         amount: Math.round(totalAmount * 100), 
    //                         currency: 'INR',
    //                         name: 'Madha TV Connect', 
    //                         description: `Booking Services (${bookingItems.length} items)`,
    //                         receipt: receiptId,
    //                         prefill: { name: user.full_name, email: user.email, contact: user.phone },
    //                         theme: { color: '#B71C1C' },
    //                         handler: (response) => handlePaymentSuccess({ razorpay_payment_id: response.razorpay_payment_id }),
    //                         modal: {
    //                             ondismiss: () => {
    //                                 setIsPaymentLoading(false);
    //                                 toast.info("Payment cancelled.");
    //                                 const bookingsToCancel = finalBookingsRef.current;
    //                                 if (bookingsToCancel.length > 0) {
    //                                     Promise.all(bookingsToCancel.map(b => ServiceBooking.update(b.id, { status: 'cancelled' })));
    //                                     finalBookingsRef.current = [];
    //                                 }
    //                             }
    //                         }
    //                     };
    //                     new window.Razorpay(options).open();
    //                 };
    //             }
    //         } catch (error) {
    //         console.error('Payment error:', error);
    //         toast.error("Payment failed. Please try again.");
    //         setIsPaymentLoading(false);
    //     }
    // };

    // Auth file-la idhai add pannunga


const handlePayment = async () => {
    // 1. localStorage-il irundhu user details-ai edukka helper function-ai call pannunga
    const currentUser = getLoggedInUser();

    // 2. User login panni irukkaara-nu validation seiyungal
    if (!currentUser || !currentUser.id) {
        toast.error('User not logged in or session expired');
        return;
    }

    if (bookingItems.length === 0) {
        toast.error('Your cart is empty');
        return;
    }

    setIsPaymentLoading(true);
    
    try {
        const orderedServices = bookingItems.map(item => {
            const formattedDate = format(new Date(item.formData.booking_date), 'dd/MM/yyyy');
            
            return {
                service_id: item.service.id,
                telecast_date: formattedDate,
                amount: item.price,
                beneficiary_name: item.formData.beneficiary_name || '',
                intention: item.formData.intention_text || '',
            };
        });

        const payload = {
            // 3. Helper function-il irundhu vandha REAL ID-ai pass pannunga
            user_id: parseInt(currentUser.id), 
            payment_type: paymentGateway === 'razorpay' ? 2 : 1,
            ordered_services: orderedServices
        };

        const response = await fetch("/api/v2/payment.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.error) {
            console.log("Success! Order ID:", result.order_id);
            if (paymentGateway === 'razorpay') {
                createRazorpayOrder(result.order_id);
            }
        } else {
            // PHP-la 'User not exists' endra error ippo varaadhu
            toast.error(result.error_msg); 
        }

    } catch (error) {
        console.error('Payment API error:', error);
        toast.error("Internal Server Error");
    } finally {
        setIsPaymentLoading(false);
    }
};

   const handlePaymentSuccess = async (response) => {
    setIsPaymentLoading(true);
    const bookingsToFinalize = finalBookingsRef.current;

    try {
        if (!bookingsToFinalize || bookingsToFinalize.length === 0) {
            throw new Error("No pending bookings were found to finalize.");
        }

        console.log('💳 Processing', bookingsToFinalize.length, 'bookings for payment:', response.razorpay_payment_id || response.paymentID);
        
        let confirmedTrn;
        
        if (IS_LOCAL) {
            // Generate mock TRN for local mode
            confirmedTrn = `TRN${Date.now().toString().slice(-6)}`;
            console.log('⚠️ Using mock TRN (LOCAL MODE):', confirmedTrn);
        } else {
            // Production: Call real function
            const trnResponse = await base44.functions.invoke('generateTRN');
            confirmedTrn = trnResponse.data.trn;
            console.log('✅ Sequential TRN generated:', confirmedTrn);
        }
        
        let updatedBookings;
        
        if (IS_LOCAL) {
            // In LOCAL MODE: Update bookings in memory
            console.log('⚠️ Updating bookings in memory (LOCAL MODE)');
            
            updatedBookings = bookingsToFinalize.map(b => ({
                ...b,
                trn: confirmedTrn,
                payment_status: 'completed',
                payment_id: response.razorpay_payment_id || response.paymentID,
                status: 'confirmed'
            }));
            
            console.log('✅ Updated', updatedBookings.length, 'mock bookings');
        } else {
            // Production: Update in database
            const updatePromises = bookingsToFinalize.map(b => ServiceBooking.update(b.id, {
                trn: confirmedTrn,
                payment_status: 'completed',
                payment_id: response.razorpay_payment_id || response.paymentID,
                status: 'confirmed'
            }));
            await Promise.all(updatePromises);

            const updatedBookingsRaw = await Promise.all(bookingsToFinalize.map(b => ServiceBooking.get(b.id)));
            updatedBookings = updatedBookingsRaw.filter(Boolean);

            if (updatedBookings.length === 0) {
                throw new Error("Could not retrieve confirmed booking details after update.");
            }

            console.log('✅ Retrieved', updatedBookings.length, 'confirmed bookings');
        }
        
        updatedBookings.forEach((booking, index) => {
            console.log(`📋 Booking ${index + 1} verification:`, {
                id: booking.id,
                service_type: booking.service_type,
                beneficiary_name: booking.beneficiary_name,
                booker_name: booking.booker_name,
                booking_date: booking.booking_date,
                amount: booking.amount,
                intention_text: booking.intention_text,
                has_all_required_fields: !!(booking.service_type && booking.beneficiary_name && booking.booker_name && booking.booking_date && booking.amount)
            });
        });
        
        const missingDataBookings = updatedBookings.filter(b => 
            !b.service_type || !b.beneficiary_name || !b.booker_name || !b.booking_date || !b.amount
        );
        
        if (missingDataBookings.length > 0) {
            console.error('⚠️ WARNING: Some bookings are missing critical data:', missingDataBookings.map(b => b.id));
        }
        
        setBookingItems([]);
        finalBookingsRef.current = [];

        setSuccessModalData({
            isOpen: true,
            bookings: [...updatedBookings],
            paymentRef: response.razorpay_payment_id || response.paymentID || '',
            currency: currency
        });

        // Skip email in LOCAL MODE
        if (!IS_LOCAL) {
            generateAndSendConfirmation(updatedBookings, response.razorpay_payment_id || response.paymentID);
        } else {
            console.log('⚠️ Skipping email send (LOCAL MODE)');
        }
        
        // Only reload bookings in production
        if (!IS_LOCAL) {
            loadUserBookings(user.id);
        }

    } catch (error) {
        console.error("❌ Error finalizing payment:", error);
        toast.error(`Payment successful but finalization failed: ${error.message}. Please contact support.`);
        finalBookingsRef.current = [];
    } finally {
        setIsPaymentLoading(false);
    }
};

    const handlePayPalCancel = async () => {
        setShowPayPalModal(false);
        toast.info("Payment was cancelled.");
        setIsPaymentLoading(false);
        const bookingsToCancel = finalBookingsRef.current;
        try {
            if (bookingsToCancel.length > 0) {
                await Promise.all(bookingsToCancel.map(b => ServiceBooking.update(b.id, { status: 'cancelled' })));
                finalBookingsRef.current = [];
            }
        } catch (error) { console.error("Error cancelling bookings:", error); }
    };

    const generateAndSendConfirmation = async (bookings, paymentId) => {
        console.log('📧 ========== EMAIL INVOICE GENERATION START ==========');
        console.log('📧 Processing', bookings.length, 'booking(s) for invoice');
        
        try {
            const mainBooking = bookings[0];
            
            console.log('📧 Main booking complete data:', {
                id: mainBooking.id,
                trn: mainBooking.trn,
                order_id: mainBooking.order_id,
                service_type: mainBooking.service_type,
                beneficiary_name: mainBooking.beneficiary_name,
                booker_name: mainBooking.booker_name,
                booker_email: mainBooking.booker_email,
                booker_phone: mainBooking.booker_phone,
                booker_address: mainBooking.booker_address,
                booking_date: mainBooking.booking_date,
                intention_text: mainBooking.intention_text,
                description: mainBooking.description,
                amount: mainBooking.amount,
                currency: mainBooking.currency,
                state: mainBooking.state,
                country: mainBooking.country,
                booker_pincode: mainBooking.booker_pincode
            });
            
            const subtotal = bookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
            const totalTax = bookings.reduce((sum, b) => sum + (parseFloat(b.tax_amount) || 0), 0);
            const cgstTotal = bookings.reduce((s, b) => s + (parseFloat(b.cgst_amount) || 0), 0);
            const sgstTotal = bookings.reduce((s, b) => s + (parseFloat(b.sgst_amount) || 0), 0);
            const igstTotal = bookings.reduce((s, b) => s + (parseFloat(b.igst_amount) || 0), 0);
            
            // CRITICAL FIX: Use TRN for invoice number in email
            const trnNumber = mainBooking.trn || '001';
            console.log('📧 Using TRN for email invoice number:', trnNumber);
            
            const invoiceData = {
                name: mainBooking.booker_name || 'Customer',
                email: mainBooking.booker_email || 'noemail@example.com',
                phone: mainBooking.booker_phone || '0000000000',
                address: mainBooking.booker_address || 'No Address',
                state: mainBooking.state || '',
                country: mainBooking.country || 'India',
                pincode: mainBooking.booker_pincode || '',
                
                booker_name: mainBooking.booker_name || 'Customer',
                booker_email: mainBooking.booker_email || 'noemail@example.com',
                booker_phone: mainBooking.booker_phone || '0000000000',
                booker_address: mainBooking.booker_address || 'No Address',
                booker_state: mainBooking.state || '',
                booker_country: mainBooking.country || 'India',
                booker_pincode: mainBooking.booker_pincode || '',
                
                // CRITICAL FIX: Use TRN consistently for invoice number
                trn: trnNumber,
                invoice_id: trnNumber,
                invoice_number: trnNumber,
                invoice_date: new Date().toISOString(),
                currency: mainBooking.currency || 'INR',
                
                subtotal: subtotal,
                sub_total: subtotal,
                cgst: cgstTotal,
                cgst_amount: cgstTotal,
                sgst: sgstTotal,
                sgst_amount: sgstTotal,
                igst: igstTotal,
                igst_amount: igstTotal,
                tax_amount: totalTax,
                total_tax: totalTax,
                total: subtotal + totalTax,
                total_amount: subtotal + totalTax,
                grand_total: subtotal + totalTax,
                
                bookings: bookings.map((b, idx) => {
                    const bookingData = {
                        id: b.id || '',
                        service_type: b.service_type || 'service_not_specified',
                        service_name: b.service_type || 'Service',
                        
                        beneficiary_name: b.beneficiary_name || 'Beneficiary',
                        dedicated_to: b.beneficiary_name || 'Beneficiary',
                        booker_name: b.booker_name || 'Customer',
                        dedicated_by: b.booker_name || 'Customer',
                        
                        intention_text: b.intention_text || '',
                        message: b.intention_text || b.description || '',
                        description: b.description || '',
                        
                        booking_date: b.booking_date || new Date().toISOString().split('T')[0],
                        telecast_date: b.booking_date || new Date().toISOString().split('T')[0],
                        date: b.booking_date || new Date().toISOString().split('T')[0],
                        created_date: b.created_date || new Date().toISOString(),
                        
                        amount: parseFloat(b.amount) || 0,
                        price: parseFloat(b.amount) || 0,
                        tax_amount: parseFloat(b.tax_amount) || 0,
                        cgst_amount: parseFloat(b.cgst_amount) || 0,
                        sgst_amount: parseFloat(b.sgst_amount) || 0,
                        igst_amount: parseFloat(b.igst_amount) || 0,
                        currency: b.currency || 'INR',
                        
                        status: b.status || 'confirmed',
                        booking_type: b.booking_type || 'one-time',
                        
                        booker_email: b.booker_email || mainBooking.booker_email || '',
                        booker_phone: b.booker_phone || mainBooking.booker_phone || '',
                        
                        ordination_date: b.ordination_date || null,
                        vows_date: b.vows_date || null,
                        jubilee_date: b.jubilee_date || null
                    };
                    
                    console.log(`📧 Booking ${idx + 1} in invoice:`, {
                        service_type: bookingData.service_type,
                        beneficiary_name: bookingData.beneficiary_name,
                        booker_name: bookingData.booker_name,
                        booking_date: bookingData.booking_date,
                        amount: bookingData.amount,
                        intention_text: bookingData.intention_text
                    });
                    
                    return bookingData;
                }),
                
                meta: {
                    booker_info: {
                        name: mainBooking.booker_name || 'Customer',
                        email: mainBooking.booker_email || 'noemail@example.com',
                        phone: mainBooking.booker_phone || '0000000000',
                        address: mainBooking.booker_address || 'No Address',
                        state: mainBooking.state || '',
                        country: mainBooking.country || 'India',
                        pincode: mainBooking.booker_pincode || ''
                    },
                    currency: mainBooking.currency || 'INR',
                    // CRITICAL FIX: Use TRN for invoice fields, order_id separately
                    trn: trnNumber,
                    order_id: mainBooking.order_id || 'N/A',
                    invoice_id: trnNumber,
                    invoice_number: trnNumber,
                    invoice_date: new Date().toISOString()
                },
                totals: {
                    subtotal: subtotal,
                    cgst: cgstTotal,
                    sgst: sgstTotal,
                    igst: igstTotal,
                    total: subtotal + totalTax
                },
                
                service_count: bookings.length,
                booking_count: bookings.length
            };
            
            console.log('📧 ========== FINAL INVOICE DATA VERIFICATION ==========');
            console.log('📧 Invoice Number (TRN):', trnNumber);
            console.log('📧 Customer:', invoiceData.name, invoiceData.email);
            console.log('📧 Address:', invoiceData.address, invoiceData.state, invoiceData.pincode);
            console.log('📧 Total:', invoiceData.total, invoiceData.currency);
            console.log('📧 Number of bookings:', invoiceData.bookings.length);
            console.log('📧 First booking service:', invoiceData.bookings[0]?.service_type);
            console.log('📧 First booking beneficiary:', invoiceData.bookings[0]?.beneficiary_name);
            console.log('📧 First booking date:', invoiceData.bookings[0]?.booking_date);
            console.log('📧 First booking amount:', invoiceData.bookings[0]?.amount);
            console.log('📧 ========== SENDING TO EMAIL FUNCTION ==========');
            
            const emailResponse = await base44.functions.invoke('sendResendEmail', {
                module: 'bookings',
                type: 'confirmation',
                data: invoiceData,
                recipient_email: mainBooking.booker_email
            });

            console.log('📧 Email function response:', JSON.stringify(emailResponse.data, null, 2));

            if (emailResponse.data?.success) {
                console.log('✅ Confirmation email sent successfully');
            } else {
                console.error('❌ Email send failed:', emailResponse.data?.error);
            }
        } catch (error) {
            console.error('❌ Error in email confirmation:', error.message);
            console.error('❌ Error stack:', error.stack);
        }
        
        console.log('📧 ========== EMAIL INVOICE GENERATION END ==========');
    };
    
    const createUserInvoiceData = (bookings) => {
        const currentBookings = Array.isArray(bookings) ? bookings : [bookings];
        const subtotal = currentBookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
        const totalTax = currentBookings.reduce((sum, b) => sum + (parseFloat(b.tax_amount) || 0), 0);
        
        const firstBooking = currentBookings[0];
        
        console.log('📄 Creating invoice data for', currentBookings.length, 'booking(s)');
        console.log('📄 First booking raw data:', JSON.stringify(firstBooking, null, 2));
        
        const bookerInfo = {
            name: firstBooking.booker_name || '',
            email: firstBooking.booker_email || '',
            phone: firstBooking.booker_phone || '',
            address: firstBooking.booker_address || '',
            state: firstBooking.state || '',
            country: firstBooking.country || 'India',
            pincode: firstBooking.booker_pincode || ''
        };
        
        console.log('📄 Extracted booker info:', JSON.stringify(bookerInfo, null, 2));
        
        const trnNumber = firstBooking.trn || '001';
        const orderIdNumber = firstBooking.order_id || 'N/A';
        
        console.log('🔢 Creating invoice with TRN:', trnNumber, 'Order ID:', orderIdNumber);
        
        const invoiceData = {
            bookings: currentBookings.map(b => ({
                id: b.id, 
                service_type: b.service_type || '', 
                beneficiary_name: b.beneficiary_name || '', 
                booker_name: b.booker_name || '',
                intention_text: b.intention_text || '', 
                description: b.description || '', 
                booking_date: b.booking_date || '',
                amount: parseFloat(b.amount) || 0,
                tax_amount: parseFloat(b.tax_amount) || 0, 
                cgst_amount: parseFloat(b.cgst_amount) || 0,
                sgst_amount: parseFloat(b.sgst_amount) || 0, 
                igst_amount: parseFloat(b.igst_amount) || 0,
                currency: b.currency || 'INR', 
                status: b.status || 'confirmed', 
                booking_type: b.booking_type || 'one-time',
                booker_email: b.booker_email || '', 
                booker_phone: b.booker_phone || '', 
                created_date: b.created_date || new Date().toISOString(),
                ordination_date: b.ordination_date || null, 
                vows_date: b.vows_date || null, 
                jubilee_date: b.jubilee_date || null,
                order_id: b.order_id || 'N/A',
            })),
            totals: {
                subtotal: subtotal, 
                cgst: currentBookings.reduce((s, b) => s + (parseFloat(b.cgst_amount) || 0), 0),
                sgst: currentBookings.reduce((s, b) => s + (parseFloat(b.sgst_amount) || 0), 0),
                igst: currentBookings.reduce((s, b) => s + (parseFloat(b.igst_amount) || 0), 0),
                total: subtotal + totalTax
            },
            meta: {
                booker_info: bookerInfo,
                currency: firstBooking.currency || 'INR',
                trn: trnNumber,
                order_id: orderIdNumber,
                invoice_id: trnNumber,
                invoice_number: trnNumber,
                invoice_date: new Date().toISOString()
            }
        };
        
        console.log('📄 Final invoice data structure:', JSON.stringify(invoiceData, null, 2));
        
        return invoiceData;
    };
    
    const handleInvoiceAction = async (action) => {
        if (!successModalData.isOpen || successModalData.bookings.length === 0) return;
        toast.info('Generating invoice...');
        try {
            const invoiceData = createUserInvoiceData(successModalData.bookings);
            const doc = await generateInvoicePdf(invoiceData);
            if (action === 'view') doc.output('dataurlnewwindow');
            else doc.save(`MadhaTV-Invoice-${invoiceData.meta.invoice_id}.pdf`);
            toast.success('Invoice generated!');
        } catch (err) {
            toast.error('Failed to generate invoice.');
        }
    };
    
    const handleCloseSuccessModal = () => {
        setSuccessModalData({ isOpen: false, bookings: [], paymentRef: '', currency: 'INR' });
    };

    return (
        <UserDashboardLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {language === 'tamil' ? 'சேவைகளை பதிவு செய்க' : 'Book a Service'}
                        </h1>
                        <p className="text-slate-600 mt-1">
                            {language === 'tamil' 
                                ? 'எங்கள் ஆன்மீக சேவைகளில் இருந்து தேர்ந்தெடுக்கவும்' 
                                : 'Choose from our spiritual services'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="aspect-[4/5] bg-gray-200 animate-pulse rounded-lg"></div>
                                ))}
                            </div>
                        ) : services.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {services.map((service, index) => {
                                    const currentPrice = currency === 'INR' ? service.priceINR : service.priceUSD;
                                    const currencySymbol = currency === 'INR' ? '₹' : '$';
                                    const formattedAmount = `${currencySymbol}${currentPrice.toLocaleString()}`;

                                    return (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            className="group cursor-pointer flex"
                                            onClick={() => handleServiceSelect(service)}
                                        >
                                            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full flex flex-col">
                                                <div className="aspect-[4/5] relative overflow-hidden">
                                                    <img
                                                        src={service.image_url || NO_IMAGE_AVAILABLE_URL}
                                                        alt={getServiceDisplayName(service)}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.src=NO_IMAGE_AVAILABLE_URL; }}
                                                    />
                                                </div>

                                                <div
                                                    className="service-card-content px-3 py-3 text-center flex flex-col flex-grow"
                                                    style={{ backgroundColor: 'white', minHeight: '120px' }}
                                                >
                                                    <h3 className="service-title font-bold text-lg mb-3 text-[#861518]">
                                                        {getServiceDisplayName(service)}
                                                    </h3>

                                                    {service.short_content || service.short_content_tamil ? (
                                                        <p className="text-slate-600 text-[10px] md:text-xs mb-3 line-clamp-2 leading-tight">
                                                            {getServiceShortContent(service)}
                                                        </p>
                                                    ) : null}

                                                    <div className="flex items-center justify-between mt-auto">
                                                        {formattedAmount && (
                                                            <motion.div
                                                                className="inline-block text-[#B71C1C] px-2 py-1 rounded text-sm font-bold"
                                                                whileHover={{ scale: 1.05 }}
                                                                animate={{
                                                                    textShadow: [
                                                                        "0 0 5px rgba(183, 28, 28, 0.3)",
                                                                        "0 0 10px rgba(183, 28, 28, 0.5)",
                                                                        "0 0 5px rgba(183, 28, 28, 0.3)"
                                                                    ]
                                                                }}
                                                                transition={{
                                                                    textShadow: { duration: 2, repeat: Infinity },
                                                                    scale: { duration: 0.2 }
                                                                }}
                                                            >
                                                                {formattedAmount}
                                                            </motion.div>
                                                        )}

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleServiceSelect(service); }}
                                                            className="bg-[#861518] text-white hover:bg-white hover:text-[#861518] border border-transparent hover:border-[#861518] px-3 py-1 rounded text-[12px] font-medium transition-all duration-300"
                                                        >
                                                            {language === 'tamil' ? 'முன்பதிவு செய்ய' : 'Book Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    {language === 'tamil' ? 'சேவைகள் இல்லை' : 'No Services Availables'}
                                </h3>
                                <p className="text-gray-500">
                                    {language === 'tamil' ? 'சேவைகள் தற்போது கட்டமைக்கப்படுகின்றன. பின்னர் சரிபார்க்கவும்.' : 'Services are being configured. Please check back later.'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lg:sticky top-24 self-start">
                        <BookingCartPanel
                            cart={bookingItems} onRemove={removeFromCart} currency={currency} setCurrency={setCurrency}
                            paymentGateway={paymentGateway} setPaymentGateway={setPaymentGateway}
                            calculateTotal={calculateTotal} calculateTax={calculateCartTax} calculateGrandTotal={calculateGrandTotal}
                            onPayment={handlePayment} isPaymentLoading={isPaymentLoading}
                            razorpayEnabled={razorpayEnabled} payPalEnabled={payPalEnabled}
                            setCart={setBookingItems} // Changed from clearCart to setCart
                        />
                    </div>
                </div>
            </div>

            <BookingFormModal
                isOpen={showBookingModal} onClose={() => { setShowBookingModal(false); setSelectedBookingData(null); }}
                service={selectedService} user={user} onAddToCart={addToCart} currency={currency}
                allUserBookings={userBookings} selectedBookingData={selectedBookingData}
                language={language} getServiceDisplayName={getServiceDisplayName}
                allBlockedDates={allBlockedDates}
                isLoadingBlockedDates={isLoadingBlockedDates}
            />
             <PreviousBookingsModal
                isOpen={showPreviousBookings} onClose={() => setShowPreviousBookings(false)}
                service={selectedService} previousBookings={previousBookingsForService}
                onProceedToBook={proceedToBooking}
                language={language}
            />
            {showPayPalModal && (
                <PayPalPaymentModal
                    isOpen={showPayPalModal}
                    onClose={handlePayPalCancel}
                    onSuccess={(id) => handlePaymentSuccess({ paymentID: id })}
                    config={payPalConfig}
                    totalAmount={calculateGrandTotal()}
                    currency={currency}
                />
            )}
             <BookingSuccessModal
                isOpen={successModalData.isOpen}
                onClose={handleCloseSuccessModal}
                confirmedBookings={successModalData.bookings}
                paymentRef={successModalData.paymentRef}
                paymentCurrency={successModalData.currency}
                onViewInvoice={() => handleInvoiceAction('view')}
                onDownloadInvoice={() => handleInvoiceAction('download')}
                language={language}
            />
            <style>{`
                .service-card {
                    height: 320px;
                    width: 100%;
                }
                .service-card-content {
                    min-height: 120px;
                }
                .service-title {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.4;
                    min-height: 2.8em;
                    text-overflow: ellipsis;
                }
            `}</style>
        </UserDashboardLayout>
    );
}

   // ============ FIXED BOOKING CART PANEL ============
// function BookingCartPanel({ cart, onRemove, currency, setCurrency, paymentGateway, setPaymentGateway, calculateTotal, calculateTax, calculateGrandTotal, onPayment, isPaymentLoading, razorpayEnabled, payPalEnabled, setCart }) {
//     const language = localStorage.getItem('madha_tv_language') || 'english';

//     const currencySymbol = currency === 'INR' ? '₹' : '$';
//     const subtotal = calculateTotal();
//     const taxCalculation = calculateTax();
//     const grandTotal = calculateGrandTotal();

//     const handleCurrencyToggle = (isUSD) => {
//         const newCurrency = isUSD ? 'USD' : 'INR';
//         if (cart.length > 0) {
//             toast.info(
//                 language === 'tamil'
//                     ? `நாணயம் ${newCurrency} ஆக மாற்றப்படுகிறது. விலைகள் புதுப்பிக்கப்படுகின்றன...`
//                     : `Switching currency to ${newCurrency}. Updating prices...`
//             );
            
//             const updatedCart = cart.map(item => {
//                 const newPrice = newCurrency === 'INR' ? item.service.priceINR : item.service.priceUSD;
//                 return { ...item, price: newPrice };
//             });
            
//             setCart(updatedCart);
//             setCurrency(newCurrency);
//             setPaymentGateway(newCurrency === 'INR' ? 'razorpay' : 'paypal');
            
//             toast.success(
//                 language === 'tamil'
//                     ? `விலைகள் ${newCurrency} க்கு புதுப்பிக்கப்பட்டன`
//                     : `Prices updated to ${newCurrency}`
//             );
//         } else {
//             setCurrency(newCurrency);
//             setPaymentGateway(newCurrency === 'INR' ? 'razorpay' : 'paypal');
//         }
//     };

//     return (
//         <Card className="shadow-lg border-0 bg-white sticky top-24">
//             <CardHeader className="border-b pb-4">
//                 <CardTitle className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                         <ShoppingCart className="w-5 h-5 text-red-700" />
//                         <span className="text-lg font-bold">
//                             {language === 'tamil' ? 'புக்கிங் கார்ட்' : 'Booking Cart'}
//                         </span>
//                     </div>
//                     <Badge variant="secondary" className="text-sm">{cart.length}/5</Badge>
//                 </CardTitle>
//             </CardHeader>
            
//             <CardContent className="p-4">
//                 {/* Currency Toggle */}
//                 <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-slate-50 mb-4">
//                     <Label 
//                         htmlFor="currency-toggle-user" 
//                         className={`cursor-pointer font-semibold text-sm transition-colors ${
//                             currency === 'INR' ? 'text-red-600' : 'text-slate-400'
//                         }`}
//                     >
//                         INR (₹)
//                     </Label>
//                     <Switch 
//                         id="currency-toggle-user" 
//                         checked={currency === 'USD'} 
//                         onCheckedChange={handleCurrencyToggle}
//                         className="data-[state=checked]:bg-red-600"
//                     />
//                     <Label 
//                         htmlFor="currency-toggle-user" 
//                         className={`cursor-pointer font-semibold text-sm transition-colors ${
//                             currency === 'USD' ? 'text-red-600' : 'text-slate-400'
//                         }`}
//                     >
//                         USD ($)
//                     </Label>
//                 </div>

//                 {cart.length === 0 ? (
//                     <div className="text-center py-12 text-slate-500">
//                         <ShoppingCart className="w-16 h-16 mx-auto mb-3 text-slate-300" />
//                         <p className="text-sm">
//                             {language === 'tamil' ? 'உங்கள் கார்ட் காலியாக உள்ளது' : 'Your cart is empty'}
//                         </p>
//                     </div>
//                 ) : (
//                     <>
//                         {/* Cart Items */}
//                         <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
//                             {cart.map((item) => {
//                                 const itemTotal = calculateRecurringTotal(item.price, item.formData.booking_type || 'one-time');
//                                 return (
//                                     <div 
//                                         key={item.id} 
//                                         className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
//                                     >
//                                         <div className="flex-1 min-w-0">
//                                             <p className="font-semibold text-sm text-slate-900 truncate">
//                                                 {language === 'tamil' && item.service.title_tamil 
//                                                     ? item.service.title_tamil 
//                                                     : item.service.title}
//                                             </p>
//                                             <p className="text-xs text-slate-600 mt-1">
//                                                 {language === 'tamil' ? 'யாருக்காக:' : 'For:'} {item.formData.beneficiary_name}
//                                             </p>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <p className="font-bold text-sm text-red-700 whitespace-nowrap">
//                                                 {currencySymbol}{itemTotal.toLocaleString()}
//                                             </p>
//                                             <Button 
//                                                 variant="ghost" 
//                                                 size="icon" 
//                                                 className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" 
//                                                 onClick={() => onRemove(item.id)}
//                                             >
//                                                 <Trash2 className="w-4 h-4" />
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         {/* Price Breakdown */}
//                         <div className="space-y-2 text-sm border-t pt-4">
//                             <div className="flex justify-between text-slate-700">
//                                 <span>{language === 'tamil' ? 'மொத்த துணைத் தொகை:' : 'Subtotal:'}</span>
//                                 <span className="font-semibold">{currencySymbol}{subtotal.toLocaleString()}</span>
//                             </div>
                            
//                             {taxCalculation.totalTax > 0 && (
//                                 <>
//                                     {taxCalculation.taxType === 'cgst_sgst' && (
//                                         <>
//                                             <div className="flex justify-between text-slate-600 text-xs">
//                                                 <span>CGST:</span>
//                                                 <span>{currencySymbol}{taxCalculation.cgst.toFixed(2)}</span>
//                                             </div>
//                                             <div className="flex justify-between text-slate-600 text-xs">
//                                                 <span>SGST:</span>
//                                                 <span>{currencySymbol}{taxCalculation.sgst.toFixed(2)}</span>
//                                             </div>
//                                         </>
//                                     )}
//                                     {taxCalculation.taxType === 'igst' && (
//                                         <div className="flex justify-between text-slate-600 text-xs">
//                                             <span>IGST:</span>
//                                             <span>{currencySymbol}{taxCalculation.igst.toFixed(2)}</span>
//                                         </div>
//                                     )}
//                                     <div className="flex justify-between text-slate-700">
//                                         <span>{language === 'tamil' ? 'மொத்த வரி:' : 'Total Tax:'}</span>
//                                         <span className="font-semibold">{currencySymbol}{taxCalculation.totalTax.toFixed(2)}</span>
//                                     </div>
//                                 </>
//                             )}
                            
//                             <div className="border-t pt-3 mt-3">
//                                 <div className="flex justify-between font-bold text-lg">
//                                     <span className="text-slate-900">
//                                         {language === 'tamil' ? 'மொத்தம்:' : 'Total:'}
//                                     </span>
//                                     <span className="text-red-700">
//                                         {currencySymbol}{grandTotal.toLocaleString()}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Payment Button */}
//                         <Button 
//                             onClick={onPayment} 
//                             disabled={isPaymentLoading || cart.length === 0} 
//                             className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
//                         >
//                             {isPaymentLoading ? (
//                                 <>
//                                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                                     {language === 'tamil' ? 'செயலாக்கம்...' : 'Processing...'}
//                                 </>
//                             ) : (
//                                 <>
//                                     {language === 'tamil' ? 'செலுத்துங்கள்' : 'Pay'} {currencySymbol}{grandTotal.toLocaleString()}
//                                 </>
//                             )}
//                         </Button>
//                     </>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }
function BookingCartPanel({ cart, onRemove, currency, setCurrency, paymentGateway, setPaymentGateway, calculateTotal, calculateTax, calculateGrandTotal, onPayment, isPaymentLoading, razorpayEnabled, payPalEnabled, setCart }) {
    const language = localStorage.getItem('madha_tv_language') || 'english';

    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const subtotal = calculateTotal() || 0;
    const taxCalculation = calculateTax() || { cgst: 0, sgst: 0, igst: 0, totalTax: 0, taxType: 'none' };
    const grandTotal = calculateGrandTotal() || 0;
    
    // Debug logging
    console.log('💰 Cart Calculation:', {
        cartItems: cart.length,
        subtotal,
        taxCalculation,
        grandTotal,
        currency
    });

    const handleCurrencyToggle = (isUSD) => {
        const newCurrency = isUSD ? 'USD' : 'INR';
        if (cart.length > 0) {
            toast.info(
                language === 'tamil'
                    ? `நாணயம் ${newCurrency} ஆக மாற்றப்படுகிறது. விலைகள் புதுப்பிக்கப்படுகின்றன...`
                    : `Switching currency to ${newCurrency}. Updating prices...`
            );
            
            const updatedCart = cart.map(item => {
                const newPrice = newCurrency === 'INR' ? item.service.priceINR : item.service.priceUSD;
                return { ...item, price: newPrice };
            });
            
            setCart(updatedCart);
            setCurrency(newCurrency);
            setPaymentGateway(newCurrency === 'INR' ? 'razorpay' : 'paypal');
            
            toast.success(
                language === 'tamil'
                    ? `விலைகள் ${newCurrency} க்கு புதுப்பிக்கப்பட்டன`
                    : `Prices updated to ${newCurrency}`
            );
        } else {
            setCurrency(newCurrency);
            setPaymentGateway(newCurrency === 'INR' ? 'razorpay' : 'paypal');
        }
    };

    return (
        <Card className="shadow-lg border-0 bg-white sticky top-24">
            <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-red-700" />
                        <span className="text-lg font-bold">
                            {language === 'tamil' ? 'புக்கிங் கார்ட்' : 'Booking Cart'}
                        </span>
                    </div>
                    <Badge variant="secondary" className="text-sm">{cart.length}/5</Badge>
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
                {/* Currency Toggle */}
                <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-slate-50 mb-4">
                    <Label 
                        htmlFor="currency-toggle-user" 
                        className={`cursor-pointer font-semibold text-sm transition-colors ${
                            currency === 'INR' ? 'text-red-600' : 'text-slate-400'
                        }`}
                    >
                        INR (₹)
                    </Label>
                    <Switch 
                        id="currency-toggle-user" 
                        checked={currency === 'USD'} 
                        onCheckedChange={handleCurrencyToggle}
                        className="data-[state=checked]:bg-red-600"
                    />
                    <Label 
                        htmlFor="currency-toggle-user" 
                        className={`cursor-pointer font-semibold text-sm transition-colors ${
                            currency === 'USD' ? 'text-red-600' : 'text-slate-400'
                        }`}
                    >
                        USD ($)
                    </Label>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">
                            {language === 'tamil' ? 'உங்கள் கார்ட் காலியாக உள்ளது' : 'Your cart is empty'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                            {cart.map((item) => {
                                const itemTotal = calculateRecurringTotal(item.price, item.formData.booking_type || 'one-time');
                                return (
                                    <div 
                                        key={item.id} 
                                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 truncate">
                                                {language === 'tamil' && item.service.title_tamil 
                                                    ? item.service.title_tamil 
                                                    : item.service.title}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                {language === 'tamil' ? 'யாருக்காக:' : 'For:'} {item.formData.beneficiary_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-red-700 whitespace-nowrap">
                                                {currencySymbol}{itemTotal.toLocaleString()}
                                            </p>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" 
                                                onClick={() => onRemove(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex justify-between text-slate-700">
                                <span>{language === 'tamil' ? 'மொத்த துணைத் தொகை:' : 'Subtotal:'}</span>
                                <span className="font-semibold">{currencySymbol}{Number(subtotal || 0).toFixed(0)}</span>
                            </div>
                            
                            {currency === 'INR' && taxCalculation && taxCalculation.totalTax > 0 && (
                                <>
                                    {(taxCalculation.cgst > 0 || taxCalculation.sgst > 0) && (
                                        <>
                                            <div className="flex justify-between text-slate-600">
                                                <span>CGST:</span>
                                                <span>{currencySymbol}{Number(taxCalculation.cgst || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>SGST:</span>
                                                <span>{currencySymbol}{Number(taxCalculation.sgst || 0).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    {taxCalculation.igst > 0 && (
                                        <div className="flex justify-between text-slate-600">
                                            <span>IGST:</span>
                                            <span>{currencySymbol}{Number(taxCalculation.igst || 0).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-700 font-medium">
                                        <span>{language === 'tamil' ? 'மொத்த வரி:' : 'Total Tax:'}</span>
                                        <span>{currencySymbol}{Number(taxCalculation.totalTax || 0).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span className="text-slate-900">
                                        {language === 'tamil' ? 'மொத்தம்:' : 'Total:'}
                                    </span>
                                    <span className="text-red-700">
                                        {currencySymbol}{Number(grandTotal || 0).toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Button */}
                        
                        <Button 
                            onClick={onPayment} 
                            disabled={isPaymentLoading || cart.length === 0 || !grandTotal || grandTotal <= 0} 
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isPaymentLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {language === 'tamil' ? 'செயலாக்கம்...' : 'Processing...'}
                                </>
                            ) : (
                                <>
                                    {language === 'tamil' ? 'செலுத்துங்கள்' : 'Pay'} {currencySymbol}{Number(grandTotal || 0).toFixed(0)}
                                </>
                            )}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
const onPayment = async () => {
  try {
    console.log("Payment button clicked!");

    // 1️⃣ Call payment.php (same as Postman)
    const paymentRes = await fetch("/api/v2/payment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        user_id: user.id, // example: 4655
        ordered_services: JSON.stringify(cart),
        payment_type: 2
      })
    }).then(res => res.json());

    console.log("payment.php response:", paymentRes);

    if (paymentRes.error) {
      alert("Payment init failed");
      return;
    }

    // paymentRes.order_id = 91076 (like Postman)
    await createRazorpayOrder(paymentRes.order_id);

  } catch (err) {
    console.error("Payment error", err);
  }
};


const BookingFormModal = ({ isOpen, onClose, service, user, onAddToCart, currency, allUserBookings, selectedBookingData, language, getServiceDisplayName, allBlockedDates, isLoadingBlockedDates }) => {
    const [formData, setFormData] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (!service || !isOpen) return;

        let initialOrdinationType = 'ordination';
        if (selectedBookingData?.vows_date) {
            initialOrdinationType = 'vows';
        } else if (selectedBookingData?.jubilee_date) {
            initialOrdinationType = 'jubilee';
        } else if (selectedBookingData?.ordination_date) {
            initialOrdinationType = 'ordination';
        }


        const initialData = {
            beneficiary_name: selectedBookingData?.beneficiary_name || '',
            booker_name: selectedBookingData?.booker_name || user?.full_name || '',
            booker_email: selectedBookingData?.booker_email || user?.email || '',
            booker_phone: selectedBookingData?.booker_phone || user?.phone || '',
            intention_text: selectedBookingData?.intention_text || '',
            description: selectedBookingData?.description || '',
            booking_date: selectedBookingData?.booking_date ? new Date(selectedBookingData.booking_date) : null,
            birthday_date: selectedBookingData?.birthday_date ? new Date(selectedBookingData.birthday_date) : null,
            marriage_date: selectedBookingData?.marriage_date ? new Date(selectedBookingData.marriage_date) : null,
            ordination_date: selectedBookingData?.ordination_date ? new Date(selectedBookingData.ordination_date) : null,
            vows_date: selectedBookingData?.vows_date ? new Date(selectedBookingData.vows_date) : null,
            jubilee_date: selectedBookingData?.jubilee_date ? new Date(selectedBookingData.jubilee_date) : null,
            ordination_type: initialOrdinationType,
            booking_type: selectedBookingData?.booking_type || 'one-time',
            imageFile: null,
            reusedPhotoUrl: selectedBookingData?.booker_photo_url || null,
        };
        setFormData(initialData);
        setImagePreview(initialData.reusedPhotoUrl);
        setFormErrors({});
    }, [service, user, isOpen, selectedBookingData]);

    if (!isOpen || !service) return null;

    const basePrice = currency === 'INR' ? service.priceINR : service.priceUSD;
    const bookingType = formData.booking_type || 'one-time';
    const totalPrice = calculateRecurringTotal(basePrice, bookingType);
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    
    const getBookingTypeText = () => {
        if (bookingType === 'one-time') return '';
        if (bookingType === 'monthly') return language === 'tamil' ? ' (மாதாந்திரத் திட்டம்)' : ' (monthly plan)';
        if (bookingType === 'yearly') return language === 'tamil' ? ' (வருடாந்திரத் திட்டம்)' : ' (yearly plan)';
        return '';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(p => ({ ...p, imageFile: file, reusedPhotoUrl: null }));
            setImagePreview(URL.createObjectURL(file));
            setFormErrors(prev => ({ ...prev, image: null }));
        }
    };

    // CRITICAL FIX: Filter blocked dates by service type
    const serviceBlockedDates = allBlockedDates
        .filter(bd => bd.service_type === service.key)
        .map(bd => bd.blocked_date);

    const isDateDisabled = (date) => {
        const today = startOfDay(new Date());
        const selectedDate = startOfDay(date);
        const minDate = addDays(today, 5);
        
        if (selectedDate < minDate) {
            return true;
        }
        
        if (service.key === 'holy_mass' && isSunday(selectedDate)) {
            return true;
        }
        
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        if (serviceBlockedDates.includes(dateString)) {
            return true;
        }
        
        return false;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.beneficiary_name) errors.beneficiary_name = language === 'tamil' ? "பயனாளி பெயர் அவசியம்" : "Beneficiary Name is required";
        if (!formData.booker_name) errors.booker_name = language === 'tamil' ? "உங்கள் பெயர் அவசியம்" : "Your Name is required";
        
        if (!formData.booker_email) errors.booker_email = language === 'tamil' ? "உங்கள் மின்னஞ்சல் முகவரி அவசியம்" : "Your Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.booker_email)) errors.booker_email = language === 'tamil' ? "தவறான மின்னஞ்சல் வடிவம்" : "Invalid Email format";
        
        if (!formData.booker_phone) {
            errors.booker_phone = language === 'tamil' ? "உங்கள் தொலைபேசி எண் அவசியம்" : "Your Phone is required";
        } else {
            const cleanedPhone = String(formData.booker_phone).replace(/\D/g, ''); // Remove non-digits
            if (cleanedPhone.length !== 10) {
                errors.booker_phone = language === 'tamil' ? "தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்" : "Phone number must be exactly 10 digits";
            }
        }
        
        const isOrdinationService = service.isOrdinationService || service.key === 'ordination_service' || service.title.toLowerCase().includes('ordination') || service.title.toLowerCase().includes('religious anniversary');
        
        if (isOrdinationService) {
            if (!formData.description) errors.description = language === 'tamil' ? "இந்த சேவைக்கு விளக்கம் அவசியம்" : "Description is required for this service";
            
            // Validate specific date based on ordination_type
            if (formData.ordination_type === 'ordination' && !formData.ordination_date) {
                errors.ordination_date = language === 'tamil' ? "குருப்பட்டம் பெற்ற தேதி அவசியம்" : "Ordination Date is required";
            }
            if (formData.ordination_type === 'vows' && !formData.vows_date) {
                errors.vows_date = language === 'tamil' ? "சத்தியப்பிரமாணம் தேதி அவசியம்" : "Vows Date is required";
            }
            if (formData.ordination_type === 'jubilee' && !formData.jubilee_date) {
                errors.jubilee_date = language === 'tamil' ? "பொன்விழா தேதி அவசியம்" : "Jubilee Date is required";
            }

        } else {
            if (!formData.intention_text) errors.intention_text = language === 'tamil' ? "பிரார்த்தனை நோக்கம் அவசியம்" : "Prayer Intention is required";
        }

        if (!formData.booking_date) {
            errors.booking_date = language === 'tamil' ? "ஒளிபரப்பு தேதி அவசியம்" : "Telecast date is required";
        } else {
            const today = startOfDay(new Date());
            const selectedDate = startOfDay(new Date(formData.booking_date));
            const minDate = addDays(today, 5);

            if (selectedDate < minDate) {
                errors.booking_date = language === 'tamil' ? "ஒளிபரப்பு தேதி இன்று முதல் குறைந்தது 5 நாட்களுக்குப் பிறகு இருக்க வேண்டும்" : "Telecast date must be at least 5 days from today";
            }

            if (service.key === 'holy_mass' && isSunday(selectedDate)) {
                errors.booking_date = language === 'tamil' ? "ஞாயிற்றுக்கிழமைகளில் திருப்பலியை திட்டமிட முடியாது" : "Holy Mass cannot be scheduled on Sundays";
            }

            const dateString = format(selectedDate, 'yyyy-MM-dd');
            if (serviceBlockedDates.includes(dateString)) {
                errors.booking_date = language === 'tamil' ? "இந்த தேதி இப்போது முன்பதிவு செய்ய கிடைக்கவில்லை" : "This date is not available for booking";
            }
        }

        if (service.requiresImage && !isOrdinationService && !formData.imageFile && !formData.reusedPhotoUrl) {
            errors.image = language === 'tamil' ? "இந்த சேவைக்கு புகைப்படம் அவசியம்" : "Photo is required for this service";
        }

        if (service.key === 'birthday_service' && !formData.birthday_date) {
            errors.birthday_date = language === 'tamil' ? "பிறந்தநாள் தேதி அவசியம்" : "Birthday Date is required";
        }
        
        if (!isOrdinationService && service.key === 'marriage_blessing' && !formData.marriage_date) {
            errors.marriage_date = language === 'tamil' ? "திருமண தேதி அவசியம்" : "Marriage Date is required";
        }
        
        return errors;
    };

    const handleSubmit = () => {
        const errors = validateForm();
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            toast.error(errors[firstErrorKey]);
            return;
        }

        onAddToCart(formData);
    };

    const isOrdinationService = service.isOrdinationService || service.key === 'ordination_service' || service.title.toLowerCase().includes('ordination') || service.title.toLowerCase().includes('religious anniversary');
    const needsBirthdayDate = !isOrdinationService && service.key === 'birthday_service';
    const needsMarriageDate = !isOrdinationService && service.key === 'marriage_blessing';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{language === 'tamil' ? 'புத்தக:' : 'Book:'} {getServiceDisplayName(service)}</DialogTitle>
                    <DialogDescription className="text-base font-semibold text-blue-600">
                        {language === 'tamil' ? 'விலை:' : 'Price:'} {currencySymbol}{totalPrice.toLocaleString()}{getBookingTypeText()}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="beneficiary_name">{language === 'tamil' ? 'பயனாளி பெயர்*' : 'Beneficiary Name*'}</Label>
                            <Input
                                id="beneficiary_name"
                                value={formData.beneficiary_name || ''}
                                onChange={e => {
                                    setFormData(p => ({ ...p, beneficiary_name: e.target.value }));
                                    setFormErrors(prev => ({ ...prev, beneficiary_name: null }));
                                }}
                                className={formErrors.beneficiary_name ? 'border-red-500' : ''}
                            />
                            {formErrors.beneficiary_name && <p className="text-red-500 text-xs mt-1">{formErrors.beneficiary_name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="booker_name">{language === 'tamil' ? 'உங்கள் பெயர்*' : 'Your Name*'}</Label>
                            <Input
                                id="booker_name"
                                value={formData.booker_name || ''}
                                onChange={e => {
                                    setFormData(p => ({ ...p, booker_name: e.target.value }));
                                    setFormErrors(prev => ({ ...prev, booker_name: null }));
                                }}
                                className={formErrors.booker_name ? 'border-red-500' : ''}
                            />
                            {formErrors.booker_name && <p className="text-red-500 text-xs mt-1">{formErrors.booker_name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="booker_email">{language === 'tamil' ? 'உங்கள் மின்னஞ்சல்*' : 'Your Email*'}</Label>
                            <Input
                                id="booker_email"
                                type="email"
                                value={formData.booker_email || ''}
                                onChange={e => {
                                    setFormData(p => ({ ...p, booker_email: e.target.value }));
                                    setFormErrors(prev => ({ ...prev, booker_email: null }));
                                }}
                                className={formErrors.booker_email ? 'border-red-500' : ''}
                            />
                            {formErrors.booker_email && <p className="text-red-500 text-xs mt-1">{formErrors.booker_email}</p>}
                        </div>
                        <div>
                            <Label htmlFor="booker_phone">{language === 'tamil' ? 'உங்கள் தொலைபேசி*' : 'Your Phone*'}</Label>
                            <Input
                                id="booker_phone"
                                type="tel"
                                value={formData.booker_phone || ''}
                                onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) {
                                        setFormData(p => ({ ...p, booker_phone: value }));
                                    }
                                    setFormErrors(prev => ({ ...prev, booker_phone: null }));
                                }}
                                className={formErrors.booker_phone ? 'border-red-500' : ''}
                                placeholder={language === 'tamil' ? '10 இலக்கங்கள்' : '10 digits'}
                                maxLength={10}
                            />
                            {formErrors.booker_phone && <p className="text-red-500 text-xs mt-1">{formErrors.booker_phone}</p>}
                        </div>
                    </div>

                    {service.supportsRecurring && (
                        <div>
                            <Label htmlFor="booking_type">{language === 'tamil' ? 'புக்கிங் வகை*' : 'Booking Type*'}</Label>
                            <Select
                                value={formData.booking_type}
                                onValueChange={v => setFormData(p => ({...p, booking_type: v}))}
                            >
                                <SelectTrigger id="booking_type">
                                    <SelectValue placeholder={language === 'tamil' ? 'புக்கிங் வகையைத் தேர்ந்தெடுக்கவும்' : 'Select a booking type'}/>
                                </SelectTrigger>
                                <SelectContent>
                                    {service.recurringOptions?.map(o => {
                                        const displayText = o === 'one-time' 
                                            ? (language === 'tamil' ? 'ஒரு முறை' : 'One time')
                                            : o === 'monthly'
                                            ? (language === 'tamil' ? 'மாதாந்திரம் (12 மாதங்கள்)' : 'Monthly (12 months)')
                                            : (language === 'tamil' ? 'வருடாந்திரம் (12 மாதங்கள்)' : 'Yearly (12 months)');
                                        
                                        return <SelectItem key={o} value={o}>{displayText}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>
                            {formData.booking_type !== 'one-time' && (
                                <p className="text-xs text-slate-600 mt-1">
                                    {language === 'tamil' ? '12 மாதாந்திர முன்பதிவுகளை உருவாக்குகிறது' : 'Creates 12 monthly bookings'}
                                </p>
                            )}
                        </div>
                    )}
                    <div>
                        <Label htmlFor="booking_date">{language === 'tamil' ? 'ஒளிபரப்பு தேதி*' : 'Telecast Date*'}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${formErrors.booking_date ? 'border-red-500' : ''}`}
                                    id="booking_date"
                                    disabled={isLoadingBlockedDates}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {isLoadingBlockedDates ? (language === 'tamil' ? 'தேதிகள் ஏற்றப்படுகின்றன...' : 'Loading dates...') : (formData.booking_date ? format(formData.booking_date, 'PPP') : (language === 'tamil' ? 'ஒளிபரப்பு தேதியைத் தேர்ந்தெடுக்கவும்' : 'Pick telecast date'))}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.booking_date}
                                    onSelect={d => {
                                        setFormData(p => ({ ...p, booking_date: d }));
                                        setFormErrors(prev => ({ ...prev, booking_date: null }));
                                    }}
                                    disabled={isDateDisabled}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {formErrors.booking_date && <p className="text-red-500 text-xs mt-1">{formErrors.booking_date}</p>}
                        <p className="text-xs text-slate-500 mt-1">
                            {language === 'tamil' ? 'குறைந்தது 5 நாட்களுக்கு முன் பதிவு செய்ய வேண்டும்.' : 'Minimum 5 days advance booking required.'}
                            {serviceBlockedDates.length > 0 && (language === 'tamil' ? ' • சில தேதிகள் தடுக்கப்பட்டுள்ளன' : ' • Some dates are blocked')}
                        </p>
                    </div>
                    
                    {needsBirthdayDate && (
                        <div>
                            <Label htmlFor="birthday_date">{language === 'tamil' ? 'பிறந்தநாள் தேதி*' : 'Birthday Date*'}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${formErrors.birthday_date ? 'border-red-500' : ''}`}
                                        id="birthday_date"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.birthday_date ? format(formData.birthday_date, 'PPP') : (language === 'tamil' ? 'தேதியைத் தேர்ந்தெடுக்கவும்' : 'Pick date')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.birthday_date}
                                        onSelect={d => {
                                            setFormData(p => ({ ...p, birthday_date: d }));
                                            setFormErrors(prev => ({ ...prev, birthday_date: null }));
                                        }}
                                        captionLayout="dropdown-buttons"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {formErrors.birthday_date && <p className="text-red-500 text-xs mt-1">{formErrors.birthday_date}</p>}
                        </div>
                    )}

                    {needsMarriageDate && (
                        <div>
                            <Label htmlFor="marriage_date">{language === 'tamil' ? 'திருமண தேதி*' : 'Marriage Date*'}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${formErrors.marriage_date ? 'border-red-500' : ''}`}
                                        id="marriage_date"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.marriage_date ? format(formData.marriage_date, 'PPP') : (language === 'tamil' ? 'தேதியைத் தேர்ந்தெடுக்கவும்' : 'Pick date')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.marriage_date}
                                        onSelect={d => {
                                            setFormData(p => ({ ...p, marriage_date: d }));
                                            setFormErrors(prev => ({ ...prev, marriage_date: null }));
                                        }}
                                        captionLayout="dropdown-buttons"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {formErrors.marriage_date && <p className="text-red-500 text-xs mt-1">{formErrors.marriage_date}</p>}
                        </div>
                    )}

                    {isOrdinationService && (
                        <>
                            <div>
                                <Label htmlFor="ordination_type">{language === 'tamil' ? 'நினைவுகொள்ளும் வகை*' : 'Anniversary Type*'}</Label>
                                <Select
                                    value={formData.ordination_type || 'ordination'}
                                    onValueChange={v => {
                                        setFormData(p => ({...p, ordination_type: v}));
                                        setFormErrors(prev => ({ ...prev, ordination_date: null, vows_date: null, jubilee_date: null }));
                                    }}
                                >
                                    <SelectTrigger id="ordination_type">
                                        <SelectValue placeholder={language === 'tamil' ? 'வகையைத் தேர்ந்தெடுக்கவும்' : 'Select type'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ordination">{language === 'tamil' ? 'குருத்துவம்' : 'Ordination'}</SelectItem>
                                        <SelectItem value="vows">{language === 'tamil' ? 'சபதம்' : 'Religious Vows'}</SelectItem>
                                        <SelectItem value="jubilee">{language === 'tamil' ? 'பொன்விழா' : 'Jubilee'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.ordination_type === 'ordination' && (
                                <div>
                                    <Label htmlFor="ordination_date">{language === 'tamil' ? 'குருப்பட்டம் பெற்ற தேதி*' : 'Ordination Date*'}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${formErrors.ordination_date ? 'border-red-500' : ''}`}
                                                id="ordination_date"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.ordination_date ? format(formData.ordination_date, 'PPP') : (language === 'tamil' ? 'குருப்பட்டம் பெற்ற தேதியைத் தேர்ந்தெடுக்கவும்' : 'Pick ordination date')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.ordination_date}
                                                onSelect={d => {
                                                    setFormData(p => ({ ...p, ordination_date: d }));
                                                    setFormErrors(prev => ({ ...prev, ordination_date: null }));
                                                }}
                                                captionLayout="dropdown-buttons"
                                                fromYear={1900}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {formErrors.ordination_date && <p className="text-red-500 text-xs mt-1">{formErrors.ordination_date}</p>}
                                </div>
                            )}

                            {formData.ordination_type === 'vows' && (
                                <div>
                                    <Label htmlFor="vows_date">{language === 'tamil' ? 'சத்தியப்பிரமாணம் தேதி*' : 'Vows Date*'}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${formErrors.vows_date ? 'border-red-500' : ''}`}
                                                id="vows_date"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.vows_date ? format(formData.vows_date, 'PPP') : (language === 'tamil' ? 'சத்தியப்பிரமாணம் தேதியைத் தேர்ந்தெடுக்கவும்' : 'Pick vows date')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.vows_date}
                                                onSelect={d => {
                                                    setFormData(p => ({ ...p, vows_date: d }));
                                                    setFormErrors(prev => ({ ...prev, vows_date: null }));
                                                }}
                                                captionLayout="dropdown-buttons"
                                                fromYear={1900}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {formErrors.vows_date && <p className="text-red-500 text-xs mt-1">{formErrors.vows_date}</p>}
                                </div>
                            )}

                            {formData.ordination_type === 'jubilee' && (
                                <div>
                                    <Label htmlFor="jubilee_date">{language === 'tamil' ? 'பொன்விழா தேதி*' : 'Jubilee Date*'}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${formErrors.jubilee_date ? 'border-red-500' : ''}`}
                                                id="jubilee_date"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.jubilee_date ? format(formData.jubilee_date, 'PPP') : (language === 'tamil' ? 'பொன்விழா தேதியைத் தேர்ந்தெடுக்கவும்' : 'Pick jubilee date')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.jubilee_date}
                                                onSelect={d => {
                                                    setFormData(p => ({ ...p, jubilee_date: d }));
                                                    setFormErrors(prev => ({ ...prev, jubilee_date: null }));
                                                }}
                                                captionLayout="dropdown-buttons"
                                                fromYear={1900}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {formErrors.jubilee_date && <p className="text-red-500 text-xs mt-1">{formErrors.jubilee_date}</p>}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="description">{language === 'tamil' ? 'விளக்கம்*' : 'Description*'}</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={e => {
                                        setFormData(p => ({...p, description: e.target.value}));
                                        setFormErrors(prev => ({ ...prev, description: null }));
                                    }}
                                    className={formErrors.description ? 'border-red-500' : ''}
                                    placeholder={language === 'tamil' ? "இந்த சேவைக்கான விரிவான விளக்கத்தை வழங்கவும்..." : "Provide a detailed description for this service..."}
                                    rows={4}
                                />
                                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                            </div>
                        </>
                    )}

                    {!isOrdinationService && (
                        <div>
                            <Label htmlFor="intention_text">{language === 'tamil' ? 'பிரார்த்தனை நோக்கம்*' : 'Prayer Intention*'} <span className="text-xs text-slate-500">({language === 'tamil' ? 'ஆங்கிலத்தில் மட்டும்' : 'English only'})</span></Label>
                            <Textarea
                                id="intention_text"
                                value={formData.intention_text || ''}
                                onChange={e => {
                                    // Filter out Tamil characters (Unicode range U+0B80 to U+0BFF)
                                    const englishOnly = e.target.value.replace(/[\u0B80-\u0BFF]/g, '');
                                    setFormData(p => ({...p, intention_text: englishOnly}));
                                    setFormErrors(prev => ({ ...prev, intention_text: null }));
                                }}
                                className={formErrors.intention_text ? 'border-red-500' : ''}
                                placeholder={language === 'tamil' ? "உங்கள் பிரார்த்தனை நோக்கத்தை ஆங்கிலத்தில் உள்ளிடவும்..." : "Please enter your prayer intention in English..."}
                                maxLength={90}
                            />
                            <p className="text-xs text-slate-500 mt-1">{(formData.intention_text || '').length}/90 {language === 'tamil' ? 'எழுத்துகள்' : 'characters'}</p>
                            {formErrors.intention_text && <p className="text-red-500 text-xs mt-1">{formErrors.intention_text}</p>}
                        </div>
                    )}

                    {service.requiresImage && !isOrdinationService && (
                        <div>
                            <Label htmlFor="image_file">{language === 'tamil' ? 'புகைப்படத்தைப் பதிவேற்றவும்*' : 'Upload Photo*'}</Label>
                            <Input
                                id="image_file"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className={formErrors.image ? 'border-red-500' : ''}
                            />
                            {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
                            {imagePreview && <img src={imagePreview} className="w-16 h-16 mt-2 rounded" alt="Preview"/>}
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 border-t pt-4">
                    <Button onClick={handleSubmit} className="w-full bg-[#B71C1C] hover:bg-[#8B0000]">
                        {language === 'tamil' ? 'வண்டியில் சேர்' : 'Add to Cart'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const PreviousBookingsModal = ({ isOpen, onClose, service, previousBookings, onProceedToBook, language }) => {
    if (!isOpen) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{language === 'tamil' ? 'முந்தைய புக்கிங்கை மீண்டும் பயன்படுத்தலாமா?' : 'Reuse Previous Booking?'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {previousBookings.map((b) => (
                        <div key={b.id} className="p-2 border rounded-md cursor-pointer hover:bg-slate-50" onClick={() => onProceedToBook(b)}>
                            {language === 'tamil' ? 'யாருக்காக:' : 'For:'} {b.beneficiary_name} {language === 'tamil' ? 'அன்று' : 'on'} {new Date(b.booking_date).toLocaleDateString()}
                        </div>
                    ))}
                </div>
                <Button onClick={() => onProceedToBook(null)}>{language === 'tamil' ? 'புதிய புக்கிங்' : 'New Booking'}</Button>
            </DialogContent>
        </Dialog>
    );
};
const PayPalPaymentModal = ({ isOpen, onClose, onSuccess, config, totalAmount, currency }) => {
    const language = localStorage.getItem('madha_tv_language') || 'english';
    useEffect(() => {
        if (!isOpen || !config?.client_id || window.paypal) return;
        const script = document.createElement('script'); script.src = `https://www.paypal.com/sdk/js?client-id=${config.client_id}&currency=${currency}`;
        script.onload = () => { if (window.paypal) { window.paypal.Buttons({ createOrder: (d, a) => a.order.create({ purchase_units: [{ amount: { value: totalAmount.toFixed(2), currency_code: currency } }] }), onApprove: (d, a) => a.order.capture().then(det => onSuccess(det.id)), onCancel: onClose, onError: onClose }).render('#paypal-button-container-modal-user'); } };
        document.head.appendChild(script);
    }, [isOpen, config, totalAmount, currency, onSuccess, onClose]);
    if (!isOpen) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{language === 'tamil' ? 'PayPal மூலம் பணம் செலுத்துங்கள்' : 'Pay with PayPal'}</DialogTitle>
                </DialogHeader>
                <div id="paypal-button-container-modal-user" className="min-h-[100px]"></div>
            </DialogContent>
        </Dialog>
    );
};
const BookingSuccessModal = ({ isOpen, onClose, confirmedBookings, paymentRef, paymentCurrency, onViewInvoice, onDownloadInvoice, language }) => {
    if (!isOpen || !confirmedBookings || confirmedBookings.length === 0) return null;
    const subtotal = confirmedBookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const totalTax = confirmedBookings.reduce((sum, b) => sum + (parseFloat(b.tax_amount) || 0), 0);
    const grandTotal = subtotal + totalTax;
    const currencySymbol = paymentCurrency === 'INR' ? '₹' : '$';
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <DialogTitle className="2xl">{language === 'tamil' ? 'புக்கிங் உறுதிசெய்யப்பட்டது!' : 'Booking Confirmed!'}</DialogTitle>
                </DialogHeader>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between font-bold text-lg">
                        <span>{language === 'tamil' ? 'செலுத்தப்பட்ட மொத்தம்:' : 'Total Paid:'}</span>
                        <span className="text-green-600">{currencySymbol}{grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span>{language === 'tamil' ? 'பணம் செலுத்தும் குறிப்பு:' : 'Payment Ref:'}</span>
                        <span>{paymentRef}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span>{language === 'tamil' ? 'சேவைகள்:' : 'Services:'}</span>
                        <span>{confirmedBookings.length}</span>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={onViewInvoice}>
                        <FileText className="w-4 h-4 mr-2" />{language === 'tamil' ? 'பார்வையிடு' : 'View'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={onDownloadInvoice}>
                        <Download className="w-4 h-4 mr-2" />{language === 'tamil' ? 'பதிவிறக்கு' : 'Download'}
                    </Button>
                </div>
                <Button onClick={onClose} className="w-full mt-2">{language === 'tamil' ? 'மூடு' : 'Close'}</Button>
            </DialogContent>
        </Dialog>
    );
};