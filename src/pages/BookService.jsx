import React, { useState, useEffect, useRef, useCallback } from 'react';
import AIFloatingChat from '../components/website/AIFloatingChat';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceBooking, RazorpayConfig, PayPalConfig, TaxConfig, HomepageService, FailedPayment, PaymentLog } from '@/api/entities';
import { toast } from 'sonner';
import DynamicFooter from '../components/website/DynamicFooter';
import { useNavigate } from 'react-router-dom';
import PageBanner from "../components/website/PageBanner";
import ServiceCardModal from "../components/services/ServiceCardModal"
import { createPageUrl } from "@/utils";


// Imports from UserBookServices page for advanced functionality
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  CalendarIcon,
  Loader2,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { format, startOfDay, isSunday, addDays } from 'date-fns';
import { UploadFile } from '@/api/integrations';
import { base44 } from '@/api/base44Client';
import { calculateTax } from '../components/utils/taxCalculator';
import { generateInvoicePdf } from '../components/utils/pdfGenerator';
import BookingSuccessModal from '../components/booking-flow/BookingSuccessModal';
// import servicelists from '../components/BookingServices/servicelists.json';
import BookingForm from '../components/booking-flow/ServiceSelection';
import StickyNavbar from '@/components/website/StickyNavbar';
const LOCAL_RAZORPAY_CONFIG = {
  key_id: "rzp_test_WMgEKiseJALjR9",
  key_secret: '2BNFdpdk63K29F495B2kq3cZ'
};
;




const NO_IMAGE_AVAILABLE_URL = "https://madhatv.in/images/no-image.png";


const calculateRecurringTotal = (basePrice, bookingType) => {
  if (bookingType === 'monthly') return basePrice * 12;
  if (bookingType === 'yearly') return basePrice * 12;
  return basePrice;
};

const CART_STORAGE_KEY = 'madha_tv_booking_cart';

export default function BookServicePage() {

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [allUserBookings, setAllUserBookings] = useState([]);
  const [currency, setCurrency] = useState('INR');
  const [paymentGateway, setPaymentGateway] = useState('razorpay');
  const [services, setServices] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

  const [razorpayConfig, setRazorpayConfig] = useState(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [payPalConfig, setPayPalConfig] = useState(null);
  const [payPalEnabled, setPayPalEnabled] = useState(false);
  const [taxConfig, setTaxConfig] = useState(null);




  const [selectedService, setSelectedService] = useState(null);
  const [showPreviousBookings, setShowPreviousBookings] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [previousBookingsForService, setPreviousBookingsForService] = useState([]);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [autoOpenForm, setAutoOpenForm] = useState(false);
  const [RazorpayConfig] = useState(LOCAL_RAZORPAY_CONFIG);
  // const [razorpayEnabled] = useState(true);

  // useEffect(() => {
  //   const saved = localStorage.getItem(LOGIN_REDIRECT_KEY);
  //   if (!saved) return;

  //   try {
  //     const data = JSON.parse(saved);

  //     // restore cart + currency
  //     if (data.cart?.length) {
  //       setBookingCart(data.cart);
  //     }
  //     if (data.currency) {
  //       setCurrency(data.currency);
  //     }

  //     // clear after restore
  //     localStorage.removeItem(LOGIN_REDIRECT_KEY);

  //     toast.success(
  //       language === "tamil"
  //         ? "முந்தைய பதிவு மீட்டெடுக்கப்பட்டது"
  //         : "Your booking was restored"
  //     );
  //   } catch (e) {
  //     console.error("Restore failed", e);
  //   }
  // }, []);

  const loadServicesFromApi = async () => {
    try {
      setIsLoading(true);

      // Update the API URL to the correct one
      const res = await fetch("https://secure.madhatv.in/api/v2/services/list.php");
      const json = await res.json();

      // Check if the response is valid
      if (!json?.status || !Array.isArray(json.data)) {
        throw new Error("Invalid services API response");
      }

      const transformedServices = json.data.map((service) => {

        const originalTitle = String(service.services || "").toLowerCase().trim();

        // 🔁 same logic you already had
        const isNeerthaarService =
          originalTitle.includes("neerthaar") ||
          originalTitle.includes("ninaivu") ||
          originalTitle.includes("anjali") ||
          originalTitle.includes("prayer for the dead") ||
          originalTitle.includes("death") ||
          originalTitle.includes("நீர்தார்") ||
          originalTitle.includes("நினைவு") ||
          originalTitle.includes("அஞ்சலி");

        const rawKey = originalTitle
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "");

        const finalKey = isNeerthaarService
          ? "prayer_for_dead"
          : (SERVICE_KEY_ALIASES[rawKey] || rawKey);

        const rules = SERVICE_RULES[finalKey] || {
          supportsRecurring: false,
          recurringOptions: [],
          requiresImage: false,
          yearlyLimit: false,
          isOrdinationService: false,
        };

      return {
  id: service.id,
  key: finalKey,
  rawKey,
  title: service.services,
  title_tamil: service.service_title_tn,
  short_content: service.short_desc_en,
  short_content_tamil: service.short_desc_tn,

  // ✅ NORMALIZED IMAGE (important)
  service_image_url: service.service_image_url
    ? service.service_image_url.startsWith('http')
      ? service.service_image_url
      : `https://secure.madhatv.in/images/${service.service_image_url}`
    : NO_IMAGE_AVAILABLE_URL,

  priceINR: Number(service.rate),
  priceUSD: Number(service.usrate || Math.round(service.rate / 80)),

  supportsRecurring: rules.supportsRecurring,
  recurringOptions: rules.recurringOptions,
  requiresImage: rules.requiresImage,
  yearlyLimit: rules.yearlyLimit,
  isOrdinationService: rules.isOrdinationService,
};

      });

      setServices(transformedServices);

      console.log("SERVICES FROM API:", transformedServices);
    } catch (err) {
      console.error("❌ Failed to load services:", err);
      toast.error(
        language === "tamil"
          ? "சேவைகளை ஏற்ற முடியவில்லை"
          : "Failed to load services"
      );
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };








  const LOGIN_REDIRECT_KEY = "madha_tv_post_login_action";
  const savePendingPaymentIntent = () => {
    const payload = {
      action: "PAY_BOOKING",
      cart: bookingCart,
      currency,
      paymentGateway,
      timestamp: Date.now(),
    };

    localStorage.setItem(LOGIN_REDIRECT_KEY, JSON.stringify(payload));
  };

  // useEffect(() => {
  //   const raw = localStorage.getItem(LOGIN_REDIRECT_KEY);
  //   if (!raw) return;

  //   try {
  //     const data = JSON.parse(raw);

  //     if (data.action === "PAY_BOOKING") {
  //       setBookingCart(data.cart || []);
  //       setCurrency(data.currency || "INR");
  //       setPaymentGateway(data.paymentGateway || "razorpay");

  //       localStorage.removeItem(LOGIN_REDIRECT_KEY);

  //       // 🔥 Auto continue payment
  //       setTimeout(() => {
  //         handlePayment();
  //       }, 800);
  //     }
  //   } catch (e) {
  //     console.error("Failed to restore payment intent", e);
  //     localStorage.removeItem(LOGIN_REDIRECT_KEY);
  //   }
  // }, []);






  const [successModalData, setSuccessModalData] = useState({
    isOpen: false,
    bookings: [],
    paymentRef: '',
    currency: 'INR',
    emailStatus: 'sending'
  });
  const [selectedBookingData, setSelectedBookingData] = useState(null);

  const [bookingCart, setBookingCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const finalBookingsRef = useRef([]);
  const navigate = useNavigate();
  const [hasAttemptedAutoSelect, setHasAttemptedAutoSelect] = useState(false);

  //   const [selectedService, setSelectedService] = useState(null);
  // const [showBookingForm, setShowBookingForm] = useState(false);
  // const [skipPreviousBookings, setSkipPreviousBookings] = useState(false);

  const bookingFormRef = useRef(null);
  const IS_LOCAL = true;
  useEffect(() => {
    if (IS_LOCAL) {
      // 🔐 Local auth only (no base44)

      const localUser = localStorage.getItem("user");
      if (localUser) {
        setUser(JSON.parse(localUser));
      }

      setTaxConfig({
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 18,
        home_state: "Tamil Nadu",
        is_tax_enabled: true
      });

      setRazorpayEnabled(true);
      setRazorpayConfig({
        key_id: LOCAL_RAZORPAY_CONFIG.key_id
      });

      setIsCheckingAuth(false);
      setIsLoading(false);
      return;
    }

  }, []);









  useEffect(() => {
    try {
      const cartForStorage = bookingCart.map(item => ({
        ...item,
        formData: {
          ...item.formData,
          imageFile: null,
          hasImageFile: !!item.formData.imageFile
        }
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartForStorage));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [bookingCart]);

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

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true);

      try {
        const isAuthenticated = await base44.auth.isAuthenticated();

        if (isAuthenticated) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);

          // 🔥 RESUME PENDING PAYMENT IF ANY
          const raw = localStorage.getItem("madha_tv_post_login_action");

          if (raw) {
            try {
              const data = JSON.parse(raw);

              if (data.action === "PAY_BOOKING") {
                setBookingCart(data.cart || []);
                setCurrency(data.currency || "INR");
                setPaymentGateway(data.paymentGateway || "razorpay");

                localStorage.removeItem("madha_tv_post_login_action");

                // Small delay to ensure state sync
                setTimeout(() => {
                  handlePayment();
                }, 800);
              }
            } catch (e) {
              console.error("Failed to resume pending payment", e);
              localStorage.removeItem("madha_tv_post_login_action");
            }
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []); // 👈 IMPORTANT: run only once


  const getServiceDisplayName = useCallback((service) => {
    if (!service) return '';
    return language === 'tamil' && service.title_tamil ? service.title_tamil : service.title;
  }, [language]);

  const getServiceShortContent = useCallback((service) => {
    if (!service) return '';
    return language === 'tamil' && service.short_content_tamil ? service.short_content_tamil : service.short_content;
  }, [language]);

  const safeNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) || !isFinite(num) ? defaultValue : num;
  };

  const SERVICE_RULES = {
    holy_mass: {
      supportsRecurring: true,
      recurringOptions: ["one-time", "monthly"],
      requiresImage: false,
      yearlyLimit: true,
      isOrdinationService: false,
    },

    rosary: {
      supportsRecurring: true,
      recurringOptions: ["one-time", "monthly"],
      requiresImage: false,
      yearlyLimit: true,
      isOrdinationService: false,
    },

    birthday: {
      supportsRecurring: false,
      recurringOptions: ["one-time"],
      requiresImage: true,
      yearlyLimit: false,
      isOrdinationService: false,
    },

    prayer_for_dead: {
      supportsRecurring: false,
      recurringOptions: ["one-time"],
      requiresImage: true,
      yearlyLimit: true,
      isOrdinationService: false,
    },

    marriage_blessing: {
      supportsRecurring: false,
      recurringOptions: ["one-time"],
      requiresImage: true,
      yearlyLimit: false,
      isOrdinationService: false,
    },

    ordination: {
      supportsRecurring: false,
      recurringOptions: [],
      requiresImage: false,
      yearlyLimit: true,
      isOrdinationService: true,
    },
  };

  //  This maps DB titles -> OUR RULE KEY
  const SERVICE_KEY_ALIASES = {
    // Holy Mass
    holy_mass: "holy_mass",
    holy_mass_sponsor: "holy_mass",
    holy_mass_sponsorship: "holy_mass",
    holy_mass_sponsor_service: "holy_mass",

    // Rosary
    holy_rosary: "rosary",
    rosary: "rosary",
    rosary_blessing: "rosary",
    holy_rosary_sponsor: "rosary",
    holy_rosary_sponsorship: "rosary",

    // Birthday
    birthday: "birthday",
    birthday_wishes: "birthday",
    birthday_service: "birthday",
    // marriage
    marriage: "marriage_blessing",
    marriage_blessing: "marriage_blessing",
    wedding_anniversary: "marriage_blessing",
    marriage_anniversary: "marriage_blessing",

    // Deathday
    // Death / Neerthaar Ninaivu Anjali
    prayer_for_the_dead: "prayer_for_dead",
    prayer_for_dead: "prayer_for_dead",
    neerthaar_ninaivu_anjali: "prayer_for_dead",
    neerthaar_ninaivu: "prayer_for_dead",


    // Ordination
    ordination: "ordination",
    ordination_religious_anniversary: "ordination",
    religious_anniversary: "ordination",
  };

  //   const loadServices = useCallback(() => {
  //     try {
  //       const transformedServices = (services || []).map((service) => {

  //         const originalTitle = String(service.servicetitle || "").toLowerCase().trim();

  // // ✅ Force-map Neerthaar / Ninaivu / Anjali / Tamil keywords to prayer_for_dead
  // const isNeerthaarService =
  //   originalTitle.includes("neerthaar") ||
  //   originalTitle.includes("ninaivu") ||
  //   originalTitle.includes("anjali") ||
  //   originalTitle.includes("prayer for the dead") ||
  //   originalTitle.includes("prayer for dead") ||
  //   originalTitle.includes("death") ||
  //   originalTitle.includes("நீர்தார்") ||
  //   originalTitle.includes("நினைவு") ||
  //   originalTitle.includes("அஞ்சலி") ||
  //   originalTitle.includes("இறப்பு");

  // const rawKey = originalTitle
  //   .replace(/[^a-z0-9]+/g, "_")
  //   .replace(/^_|_$/g, "");

  // const finalKey = isNeerthaarService
  //   ? "prayer_for_dead"
  //   : (SERVICE_KEY_ALIASES[rawKey] || rawKey);

  //         const rules = SERVICE_RULES[finalKey] || {
  //           supportsRecurring: false,
  //           recurringOptions: [],
  //           requiresImage: false,
  //           yearlyLimit: false,
  //           isOrdinationService: false,
  //         };

  //         const recurringOptions = (rules.recurringOptions || []).map((opt) =>
  //           String(opt).toLowerCase()
  //         );

  //         return {
  //           id: service.id,
  //           key: finalKey,
  //           rawKey,
  //           title: service.servicetitle,
  //           image_url: service.img,
  //           priceINR: service.amount,
  //           priceUSD: Math.round(service.amount / 80),


  //           supportsRecurring: rules.supportsRecurring === true,
  //           recurringOptions,
  //           requiresImage: rules.requiresImage === true,
  //           yearlyLimit: rules.yearlyLimit === true,
  //           isOrdinationService: rules.isOrdinationService === true,

  //           showBookingType: rules.supportsRecurring === true,
  //           showImageUpload: rules.requiresImage === true,
  //           showOrdinationType: rules.isOrdinationService === true,
  //           showOrdinationDate: rules.isOrdinationService === true,
  //         };
  //       });

  //       setServices(transformedServices);


  //       console.table(
  //         transformedServices.map((s) => ({
  //           title: s.title,
  //           rawKey: s.rawKey,
  //           finalKey: s.key,
  //           recurring: s.supportsRecurring,
  //           image: s.requiresImage,
  //           ordination: s.isOrdinationService,
  //           options: s.recurringOptions.join(","),
  //         }))
  //       );
  //     } catch (error) {
  //       console.error("❌ Error loading services:", error);
  //       setServices([]);
  //     }
  //   }, [services]);

  // useEffect(() => {
  //   loadServices();
  // }, [loadServices]);





  const handleServiceClick = useCallback(
    (service, skipPreviousBookings = false) => {
      console.log(service, "working");

      if (!service) return;

      //  Set selected service
      setSelectedService(service);

      //  Skip previous booking check (optional)
      if (skipPreviousBookings) {
        setSkipPreviousBookings(true);
      }


      setShowBookingForm(true);

      //  Smooth scroll to BookingForm (optional but UX friendly)
      setTimeout(() => {
        bookingFormRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    },
    []
  );







  //   if ((currency === 'INR' && !razorpayEnabled) || (currency === 'USD' && !payPalEnabled)) {
  //     toast.error(language === 'tamil' ? "தேர்ந்தெடுக்கப்பட்ட கட்டண முறை தற்போது முடக்கப்பட்டுள்ளது. ஆதரவைத் தொடர்பு கொள்ளவும்." : "The selected payment method is currently disabled. Please contact support.");
  //     return;
  //   }

  //   if (bookingCart.length >= 5) {
  //     toast.error(language === 'tamil' ? "நீங்கள் ஒரே நேரத்தில் 5 சேவைகளை பதிவு செய்யலாம்." : "You can book up to 5 services at a time.");
  //     return;
  //   }

  //   const previousBookings = user ? allUserBookings.filter(b => b.service_type === service.key) : [];
  //   setSelectedService(service);

  //   if (skipPreviousBookings) {
  //     setSelectedBookingData(null);
  //     setShowBookingForm(true);
  //     return;
  //   }

  //   if (user && previousBookings.length > 0) {
  //     setPreviousBookingsForService(previousBookings);
  //     setShowPreviousBookings(true);
  //   } else {
  //     setSelectedBookingData(null);
  //     setShowBookingForm(true);
  //   }
  // }, [currency, razorpayEnabled, payPalEnabled, bookingCart.length, user, allUserBookings, language]);

  useEffect(() => {
    if (
      !isLoading &&
      services.length > 0 &&
      bookingCart.length === 0 &&
      !hasAttemptedAutoSelect
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      const autoSelect = urlParams.get('auto_select');
      const serviceTitle = urlParams.get('service_title');

      if (autoSelect === 'true' && serviceTitle) {
        const decodedTitle = decodeURIComponent(serviceTitle);

        const foundService = services.find(
          s => s.title.toLowerCase() === decodedTitle.toLowerCase()
        );

        if (foundService) {
          setSelectedService(foundService);
          setSelectedBookingData(null);
          setAutoOpenForm(true);
        }

        setHasAttemptedAutoSelect(true);
      }
    }
  }, [isLoading, services, bookingCart.length, hasAttemptedAutoSelect]);
  useEffect(() => {
    if (autoOpenForm && selectedService) {
      setShowBookingForm(true);
      setAutoOpenForm(false);
    }
  }, [autoOpenForm, selectedService]);



  // useEffect(() => {
  //   if (IS_LOCAL) {
  //     loadServices();
  //     return;
  //   }
  // }, []);

  useEffect(() => {
    loadServicesFromApi();
  }, []);




  const loadRazorpayConfig = async () => {
    try {
      const configs = await RazorpayConfig.filter({ config_type: 'bookings' });
      if (configs && configs.length > 0) {
        const config = configs[0];
        setRazorpayConfig(config);
        setRazorpayEnabled(config.is_enabled && !!config.key_id && !!config.key_secret);
        console.log('✅ Razorpay config loaded:', { enabled: config.is_enabled, hasKey: !!config.key_id });
      } else {
        console.warn('⚠️ No Razorpay config found for "bookings" type.');
        setRazorpayEnabled(false);
      }
    } catch (error) {
      console.error('❌ Failed to load Razorpay config:', error);
      setRazorpayEnabled(false);
    }
  };

  const loadPayPalConfig = async () => {
    try {
      const configs = await PayPalConfig.filter({ config_type: 'bookings' });
      if (configs && configs.length > 0) {
        const config = configs[0];
        setPayPalConfig(config);
        setPayPalEnabled(config.is_enabled && !!config.client_id && !!config.client_secret);
        console.log('✅ PayPal config loaded:', { enabled: config.is_enabled, hasKey: !!config.client_id });
      } else {
        console.warn('⚠️ No PayPal config found for "bookings" type.');
        setPayPalEnabled(false);
      }
    } catch (error) {
      console.error('❌ Failed to load PayPal config:', error);
      setPayPalEnabled(false);
    }

  };

  const loadTaxConfig = async () => {
    try {

      console.log("🚀 Loading tax config...");
      const configs = await TaxConfig.list();
      if (configs && configs.length > 0) {
        setTaxConfig(configs[0]);
        console.log("✅ Tax config loaded", configs[0]);
      } else {
        setTaxConfig(null);
      }
    } catch (error) {
      console.error("❌ Failed to load tax config", error);
      setTaxConfig(null);
    } finally {
      // setIsLoading(false); // ✅ MOVE HERE

      setIsCheckingAuth(false);
      return;


    }
  };


  const formatPrice = (service) => {
    const price = currency === 'INR' ? service.priceINR : service.priceUSD;
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${price.toLocaleString()}`;
  };

  const addToCart = (bookingData) => {
    const cartItem = {
      id: Date.now(),
      service: selectedService,
      formData: bookingData,
      price: currency === 'INR' ? selectedService.priceINR : selectedService.priceUSD
    };
    setBookingCart(prev => [...prev, cartItem]);
    setShowBookingForm(false);
    setShowPreviousBookings(false);
    toast.success(`${getServiceDisplayName(selectedService)} ${language === 'tamil' ? 'உங்கள் வண்டியில் சேர்க்கப்பட்டது.' : 'added to your cart.'}`);
  };

  const removeFromCart = (itemId) => {
    setBookingCart(prev => prev.filter(item => item.id !== itemId));
    toast.info(language === 'tamil' ? "சேவை வண்டியிலிருந்து நீக்கப்பட்டது." : "Service removed from cart.");
  };

  const calculateTotal = () => bookingCart.reduce((total, item) => {
    const itemPrice = calculateRecurringTotal(item.price, item.formData.booking_type || 'one-time');
    return total + itemPrice;
  }, 0);

  const calculateCartTax = () => {
    if (!taxConfig) {
      return {
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
        taxType: 'none'
      };
    }

    const subtotal = calculateTotal();

    const userState =
      user?.state ||
      user?.state_name ||
      user?.province ||
      '';

    const userCountry =
      user?.country ||
      user?.country_name ||
      'India';

    return calculateTax(
      subtotal,
      userState,
      userCountry,
      taxConfig
    );
  };



  const calculateGrandTotal = () => calculateTotal() + calculateCartTax().totalTax;

  const proceedToBook = (bookingToPreFill = null) => {
    setShowPreviousBookings(false);
    setSelectedBookingData(bookingToPreFill);
    setShowBookingForm(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        console.log('⏳ Razorpay script exists, waiting for load...');
        existingScript.onload = () => {
          console.log('✅ Razorpay loaded from existing script');
          resolve(true);
        };
        existingScript.onerror = () => {
          console.error('❌ Razorpay script failed to load');
          resolve(false);
        };
        return;
      }

      console.log('📦 Creating new Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.id = 'razorpay-sdk-script';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
  const ensureAuthenticated = () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return null;

      return JSON.parse(rawUser);
    } catch (e) {
      return null;
    }
  };








  const handlePayment = async () => {
    // =====================================================
    // STEP 0: EMPTY CART CHECK
    // =====================================================
    if (bookingCart.length === 0) {
      toast.error(
        language === "tamil"
          ? "உங்கள் வண்டி காலியாக உள்ளது"
          : "Your cart is empty"
      );
      return;
    }

    // =====================================================
    // STEP 1: LOGIN CHECK (NO BASE44)
    // =====================================================
    // =====================================================
    // STEP 1: AUTH CHECK (REAL-TIME)
    // =====================================================
    const authUser = await ensureAuthenticated();

    if (!authUser) {
      localStorage.setItem(
        LOGIN_REDIRECT_KEY,
        JSON.stringify({
          action: "PAY_BOOKING",
          redirectTo: window.location.pathname + window.location.search,
          cart: bookingCart,
          currency,
          paymentGateway,
          timestamp: Date.now(),
        })
      );

      toast.info(
        language === "tamil"
          ? "பணம் செலுத்த உள்நுழையவும்"
          : "Please login to continue payment"
      );

      window.location.href = "/login";
      return;
    }

    // ✅ ensure local state is also updated
    setUser(authUser);



    // =====================================================
    // STEP 2: VALIDATIONS (UNCHANGED)
    // =====================================================
    for (let i = 0; i < bookingCart.length; i++) {
      const item = bookingCart[i];
      const serviceName = getServiceDisplayName(item.service);
      const itemNumber = i + 1;

      if (!item.formData.booking_date) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) ஒளிபரப்பு தேதி அவசியம்`
            : `(${serviceName} - Item ${itemNumber}) Telecast date is required`
        );
        return;
      }

      if (!item.formData.beneficiary_name?.trim()) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) விருந்தாளியின் பெயர் அவசியம்`
            : `(${serviceName} - Item ${itemNumber}) Beneficiary name is required`
        );
        return;
      }

      if (!item.formData.booker_name?.trim()) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) உங்கள் பெயர் அவசியம்`
            : `(${serviceName} - Item ${itemNumber}) Your name is required`
        );
        return;
      }

      if (!item.formData.booker_email?.trim()) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) மின்னஞ்சல் அவசியம்`
            : `(${serviceName} - Item ${itemNumber}) Email is required`
        );
        return;
      }

      if (!/\S+@\S+\.\S+/.test(item.formData.booker_email)) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்`
            : `(${serviceName} - Item ${itemNumber}) Please enter a valid email address`
        );
        return;
      }

      if (!item.formData.booker_phone?.trim()) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) தொலைபேசி எண் அவசியம்`
            : `(${serviceName} - Item ${itemNumber}) Phone number is required`
        );
        return;
      }

      if (!/^\d{10}$/.test(item.formData.booker_phone.replace(/\D/g, ""))) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்`
            : `(${serviceName} - Item ${itemNumber}) Phone number must be exactly 10 digits`
        );
        return;
      }

      if (
        !item.service.isOrdinationService &&
        !item.formData.intention_text?.trim()
      ) {
        toast.error(
          language === "tamil"
            ? `(${serviceName} - உருப்படி ${itemNumber}) பிரார்த்தனை நோக்கம் அவசியம்`
            : `(${serviceName} - Item ${itemNumber}) Prayer intention is required`
        );
        return;
      }
    }

    // =====================================================
    // STEP 3: PAYMENT GATEWAY CHECK
    // =====================================================
    if (currency === "INR" && !razorpayEnabled) {
      toast.error(
        language === "tamil"
          ? "Razorpay கட்டண முறை தற்போது கிடைக்கவில்லை"
          : "Razorpay payment is not available"
      );
      return;
    }

    if (currency === "USD" && !payPalEnabled) {
      toast.error(
        language === "tamil"
          ? "PayPal கட்டணம் தற்போது கிடைக்கவில்லை"
          : "PayPal payment is not available"
      );
      return;
    }

    // =====================================================
    // STEP 4: TEMP RAZORPAY PAYMENT
    // =====================================================
    setIsPaymentLoading(true);

    try {
      const amountToPay = Math.round(calculateGrandTotal() * 100); // paise

      // load Razorpay script if not loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: RazorpayConfig?.key_id,   // ✅ use existing key
        amount: amountToPay,
        currency: "INR",
        name: "Madha TV (TEST)",
        description: "Temporary Test Payment",
        handler: function (response) {
          console.log("Razorpay TEMP success:", response);

          toast.success(
            language === "tamil"
              ? "கட்டணம் வெற்றிகரமாக முடிந்தது"
              : "Payment successful"
          );

          const paidAmount = calculateGrandTotal();

          const tempBookings = bookingCart.map(item => ({
            id: item.id,
            service_type: item.service.key,
            service_name: getServiceDisplayName(item.service),
            beneficiary_name: item.formData.beneficiary_name,
            booker_name: item.formData.booker_name,
            booker_email: item.formData.booker_email,
            booker_phone: item.formData.booker_phone,
            intention_text: item.formData.intention_text || '',
            booking_date: item.formData.booking_date,
            amount: item.price,
            tax_amount: calculateCartTax().totalTax / bookingCart.length,
            cgst_amount: calculateCartTax().cgst / bookingCart.length,
            sgst_amount: calculateCartTax().sgst / bookingCart.length,
            igst_amount: calculateCartTax().igst / bookingCart.length,
            currency: currency,
            status: "confirmed",
            booking_type: item.formData.booking_type || "one-time",
          }));

          setSuccessModalData({
            isOpen: true,
            bookings: tempBookings,
            paymentRef: response.razorpay_payment_id,
            currency: currency,
            emailStatus: "skipped",
            totalPaid: paidAmount
          });

        },
        prefill: {
          name: user?.full_name || "Test User",
          email: user?.email || "test@example.com",
          contact: user?.phone || "9999999999"
        },
        theme: { color: "#B71C1C" },
        modal: {
          ondismiss: () => {
            toast.info(
              language === "tamil"
                ? "கட்டணம் ரத்து செய்யப்பட்டது"
                : "Payment cancelled"
            );
            setIsPaymentLoading(false);
          }
        }
      };


      new window.Razorpay(options).open();

    } catch (error) {
      console.error("TEMP Razorpay error:", error);
      toast.error(
        language === "tamil"
          ? "Razorpay தோல்வியடைந்தது"
          : "Razorpay failed"
      );
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // const totalPaidAmount = confirmedBookings?.reduce(
  //   (sum, b) => sum + Number(b.amount || 0),
  //   0
  // );



  const handlePaymentSuccess = async (response) => {
    setIsPaymentLoading(true);
    const bookingsToFinalize = finalBookingsRef.current;
    const paymentId = response.razorpay_payment_id || response.paymentID;

    console.log('🔵 PAYMENT SUCCESS RECEIVED');
    console.log('Payment ID:', paymentId);
    console.log('Bookings to finalize:', bookingsToFinalize?.length || 0);

    try {
      if (!bookingsToFinalize || bookingsToFinalize.length === 0) {
        throw new Error("No pending bookings found.");
      }

      console.log('=== FINALIZING BOOKINGS ===');

      // Generate sequential TRN for confirmed bookings
      console.log('🔢 Generating sequential TRN for confirmed bookings...');
      const trnResponse = await base44.functions.invoke('generateTRN');
      const confirmedTrn = trnResponse.data.trn;
      console.log('✅ Sequential TRN generated:', confirmedTrn);

      // Update bookings with payment details and sequential TRN
      const updatePromises = bookingsToFinalize.map(b => ServiceBooking.update(b.id, {
        trn: confirmedTrn,
        payment_status: 'completed',
        payment_id: paymentId,
        status: 'confirmed'
      }));
      await Promise.all(updatePromises);
      console.log('✅ All bookings confirmed with sequential TRN:', confirmedTrn);

      const updatedBookingsRaw = await Promise.all(bookingsToFinalize.map(b => ServiceBooking.get(b.id)));
      const updatedBookings = updatedBookingsRaw.filter(Boolean);

      if (updatedBookings.length === 0) {
        throw new Error("Could not retrieve confirmed bookings.");
      }

      // Log order_created after bookings are confirmed
      const firstBookingForLog = updatedBookings[0];
      await PaymentLog.create({
        user_id: user?.id || null,
        user_name: firstBookingForLog?.booker_name || 'Unknown',
        user_email: firstBookingForLog?.booker_email || 'unknown@email.com',
        user_mobile: firstBookingForLog?.booker_phone || '',
        payment_id: paymentId,
        payment_method: paymentGateway,
        amount: safeNumber(calculateGrandTotal()),
        currency: currency,
        purpose: 'service_booking',
        status: 'order_created',
        order_id: firstBookingForLog?.order_id,
        gateway_response: { ...response, trn: firstBookingForLog?.trn },
        ip_address: window.location.hostname,
        user_agent: navigator.userAgent
      });

      setBookingCart([]);
      finalBookingsRef.current = [];

      setSuccessModalData({
        isOpen: true,
        bookings: [...updatedBookings],
        paymentRef: paymentId,
        currency: currency,
        emailStatus: 'sending'
      });

      // CRITICAL FIX: Helper function to format service name properly
      const formatServiceName = (serviceType) => {
        if (!serviceType) return 'Service';

        // Find the service in the services array for proper display name
        const service = services.find(s => s.key === serviceType);
        if (service) {
          return service.title; // Use the actual service title
        }

        // Fallback: Format the service_type key
        return serviceType
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      // Send confirmation email (same format as UserBookServices)
      console.log('📧 ========== EMAIL INVOICE GENERATION START ==========');
      try {
        const mainBooking = updatedBookings[0];

        const subtotal = updatedBookings.reduce((sum, b) => sum + (safeNumber(b.amount)), 0);
        const totalTax = updatedBookings.reduce((sum, b) => sum + (safeNumber(b.tax_amount)), 0);
        const cgstTotal = updatedBookings.reduce((s, b) => s + (safeNumber(b.cgst_amount)), 0);
        const sgstTotal = updatedBookings.reduce((s, b) => s + (safeNumber(b.sgst_amount)), 0);
        const igstTotal = updatedBookings.reduce((s, b) => s + (safeNumber(b.igst_amount)), 0);

        const trnNumber = mainBooking.trn || '001';

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

          bookings: updatedBookings.map(b => ({
            id: b.id || '',
            service_type: b.service_type || 'service_not_specified',
            service_name: formatServiceName(b.service_type), // Use formatted service name
            description: formatServiceName(b.service_type), // Email template uses 'description' for service name

            beneficiary_name: b.beneficiary_name || 'Beneficiary',
            dedicated_to: b.beneficiary_name || 'Beneficiary',
            booker_name: b.booker_name || 'Customer',
            dedicated_by: b.booker_name || 'Customer',

            intention_text: b.intention_text || '',
            message: b.intention_text || b.description || '',
            prayer_intention: b.intention_text || b.description || '',

            booking_date: b.booking_date || new Date().toISOString().split('T')[0],
            telecast_date: b.booking_date || new Date().toISOString().split('T')[0],
            date: b.booking_date || new Date().toISOString().split('T')[0],
            created_date: b.created_date || new Date().toISOString(),

            amount: safeNumber(b.amount),
            price: safeNumber(b.amount),
            tax_amount: safeNumber(b.tax_amount),
            cgst_amount: safeNumber(b.cgst_amount),
            sgst_amount: safeNumber(b.sgst_amount),
            igst_amount: safeNumber(b.igst_amount),
            currency: b.currency || 'INR',

            status: b.status || 'confirmed',
            booking_type: b.booking_type || 'one-time',

            booker_email: b.booker_email || mainBooking.booker_email || '',
            booker_phone: b.booker_phone || mainBooking.booker_phone || '',

            ordination_date: b.ordination_date || null,
            vows_date: b.vows_date || null,
            jubilee_date: b.jubilee_date || null
          })),

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

          service_count: updatedBookings.length,
          booking_count: updatedBookings.length
        };

        const emailResponse = await base44.functions.invoke('sendResendEmail', {
          module: 'bookings',
          type: 'confirmation',
          data: invoiceData,
          recipient_email: mainBooking.booker_email
        });

        if (emailResponse.data?.success) {
          console.log('✅ Confirmation email sent successfully');
          setSuccessModalData(prev => ({
            ...prev,
            emailStatus: 'sent'
          }));
        } else {
          console.error('❌ Email send failed:', emailResponse.data?.error);
          setSuccessModalData(prev => ({
            ...prev,
            emailStatus: 'failed'
          }));
        }
      } catch (emailError) {
        console.error('❌ Error sending confirmation email:', emailError);
        setSuccessModalData(prev => ({
          ...prev,
          emailStatus: 'failed'
        }));
      }
      console.log('📧 ========== EMAIL INVOICE GENERATION END ==========');

    } catch (error) {
      console.error("❌ ERROR FINALIZING:", error);
      const firstBooking = bookingsToFinalize[0] || {};
      const taxCalc = calculateCartTax(); // Recalculate tax for the failed log

      try {
        await FailedPayment.create({
          user_id: user?.id || null,
          user_name: firstBooking.booker_name || 'Unknown',
          email: firstBooking.booker_email || 'unknown@email.com',
          mobile: firstBooking.booker_phone || '',
          amount: safeNumber(calculateGrandTotal()),
          currency: currency,
          payment_id: paymentId,
          payment_method: paymentGateway,
          purpose: 'service_booking',
          status: 'PENDING_RESTORE',
          payment_data: {
            trn: firstBooking.trn,
            bookings: bookingsToFinalize.map(b => ({
              id: b.id,
              order_id: b.order_id,
              service_type: b.service_type,
              amount: b.amount,
              currency: b.currency,
              booking_type: b.booking_type,
              booker_name: b.booker_name,
              booker_email: b.booker_email
            })),
            tax: taxCalc,
            user_info: {
              name: firstBooking.booker_name || user?.full_name || 'N/A',
              email: firstBooking.booker_email || user?.email || 'N/A',
              phone: firstBooking.booker_phone || user?.phone || 'N/A',
              address: firstBooking.booker_address || user?.address_line_1 || 'N/A',
              state: firstBooking.state || user?.state || 'N/A',
              country: firstBooking.country || user?.country || 'India',
              pincode: firstBooking.booker_pincode || user?.pincode || 'N/A'
            }
          },
          error_message: error.message
        });
      } catch (logError) {
        console.error('❌ Failed to log error:', logError);
      }
      toast.error(
        language === 'tamil'
          ? `முடிவடைதல் தோல்வி. உங்கள் கட்டணம் பதிவு செய்யப்பட்டது. உதவியை தொடர்பு கொள்ளுங்கள்.`
          : `Booking failed. Your payment was recorded. Please contact support.`,
        { duration: 10000 }
      );
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handlePayPalSuccess = (paymentId) => {
    setShowPayPalModal(true);
    handlePaymentSuccess({ paymentID: paymentId });
  };

  const handlePayPalCancel = async () => {
    setShowPayPalModal(true);
    toast.info(language === 'tamil' ? "கட்டணம் ரத்து செய்யப்பட்டது." : "Payment was cancelled.");
    setIsPaymentLoading(false);
    const bookingsToCancel = finalBookingsRef.current;
    try {
      if (bookingsToCancel.length > 0) {
        await Promise.all(bookingsToCancel.map(b => ServiceBooking.update(b.id, { status: 'cancelled', payment_status: 'failed' })));
        finalBookingsRef.current = [];
      }
    } catch (error) { console.error("Error cancelling bookings:", error); }
  };

  const handleInvoiceAction = async (action) => {
    if (!successModalData.isOpen || successModalData.bookings.length === 0) {
      toast.error(language === 'tamil' ? 'விலைப்பட்டியல் உருவாக்க எந்த முன்பதிவு விவரங்களும் இல்லை.' : 'No booking details available for invoice generation.');
      return;
    }

    toast.info(language === 'tamil' ? 'உங்கள் விலைப்பட்டியல் உருவாக்கப்படுகிறது...' : 'Generating your invoice...');
    try {
      const currentBookings = successModalData.bookings;
      const invoiceData = createAccurateInvoiceData(currentBookings);
      const doc = await generateInvoicePdf(invoiceData);

      const orderNumber = currentBookings[0]?.trn || `INV-${Date.now().toString().slice(-8)}`;
      const fileName = `MadhaTV-Invoice-${orderNumber}.pdf`;

      if (action === 'view') {
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);

        const newWindow = window.open(blobUrl, '_blank');
        if (newWindow) {
          newWindow.document.title = fileName;
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }
      } else {
        doc.save(fileName);
      }

      toast.success(language === 'tamil' ? 'விலைப்பட்டியல் வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Invoice generated successfully!');
    } catch (err) {
      console.error(`Error generating invoice:`, err);
      toast.error(language === 'tamil' ? 'விலைப்பட்டியல் உருவாக்கத் தவறிவிட்டது. ஆதரவைத் தொடர்பு கொள்ளவும்.' : 'Failed to generate invoice. Please contact support.');
    }
  };

  const createAccurateInvoiceData = (bookings) => {
    const currentBookings = Array.isArray(bookings) ? bookings : [bookings];

    const subtotal = currentBookings.reduce((sum, b) => sum + safeNumber(b.amount), 0);
    const totalCgst = currentBookings.reduce((sum, b) => sum + safeNumber(b.cgst_amount), 0);
    const totalSgst = currentBookings.reduce((sum, b) => sum + safeNumber(b.sgst_amount), 0);
    const totalIgst = currentBookings.reduce((sum, b) => sum + safeNumber(b.igst_amount), 0);
    const totalTax = totalCgst + totalSgst + totalIgst;
    const grandTotal = subtotal + totalTax;

    const trnNumber = currentBookings[0]?.trn || '001';
    const orderIdNumber = currentBookings[0]?.order_id || 'N/A';

    console.log('🔢 Creating invoice data with TRN:', trnNumber, 'Order ID:', orderIdNumber);

    return {
      bookings: currentBookings.map(b => ({
        id: b.id,
        order_id: b.order_id,
        service_type: b.service_type || 'holy_mass',
        beneficiary_name: b.beneficiary_name || 'N/A',
        booker_name: b.booker_name || 'N/A',
        intention_text: b.intention_text || 'Prayer intention',
        description: b.description || '',
        booking_date: b.booking_date || new Date().toISOString().split('T')[0],
        amount: safeNumber(b.amount),
        tax_amount: safeNumber(b.tax_amount),
        cgst_amount: safeNumber(b.cgst_amount),
        sgst_amount: safeNumber(b.sgst_amount),
        igst_amount: safeNumber(b.igst_amount),
        currency: b.currency || 'INR',
        status: b.status || 'confirmed',
        booking_type: b.booking_type || 'one-time',
        booker_email: b.booker_email || 'N/A',
        booker_phone: b.booker_phone || 'N/A',
        created_date: b.created_date || new Date().toISOString(),
        ordination_date: b.ordination_date || null,
        vows_date: b.vows_date || null,
        jubilee_date: b.jubilee_date || null,
      })),
      totals: {
        subtotal: subtotal,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        total: grandTotal
      },
      meta: {
        booker_info: {
          name: currentBookings[0]?.booker_name || 'N/A',
          email: currentBookings[0]?.booker_email || 'N/A',
          phone: currentBookings[0]?.booker_phone || 'N/A',
          address: currentBookings[0]?.booker_address || 'N/A',
          state: currentBookings[0]?.state || 'N/A',
          country: currentBookings[0]?.country || 'India',
          pincode: currentBookings[0]?.booker_pincode || 'N/A'
        },
        currency: currentBookings[0]?.currency || 'INR',
        trn: trnNumber,
        order_id: orderIdNumber,
        invoice_id: trnNumber,
        invoice_number: trnNumber,
        invoice_date: new Date().toISOString()
      }
    };
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalData({ isOpen: false, bookings: [], paymentRef: '', currency: 'INR', emailStatus: 'sending' });
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B71C1C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StickyNavbar />
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'linear-gradient(135deg, #fff1f2 0%, #eff6ff 100%)',
          backgroundSize: '400% 400%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      <div className="relative z-10">
        <AIFloatingChat />

        <PageBanner
          pageKey="book_service"
          fallbackTitle={language === 'tamil' ? 'ஆன்மீக சேவைகளைப் பதிவு செய்யுங்கள்' : 'Participate in Our Spiritual Services'}
          fallbackDescription={language === 'tamil' ? 'உங்கள் நோக்கங்கள் மற்றும் அன்புக்குரியவர்களுக்காக புனிதத் திருச்சபைகள், ஜெபங்கள் மற்றும் ஆன்மீக சேவைகளைக் கோருங்கள்' : 'Through Madha Television, you may offer your sacrificial gifts for your family’s special occasions, Holy Mass, Rosary, Birthdays, Sacredotal jubiles and blessings. Join thousands of devotees in our sacred celebrations.'}
          fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
        />

        <div className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Service Cards */}
              <div className="flex-1 order-2 lg:order-1">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-[4/5] bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : services.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="group cursor-pointer flex"
                        onClick={() => handleServiceClick(service)}
                      >
                        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full flex flex-col">



                          <div className="aspect-[4/5] relative overflow-hidden">
                            <img
                              src={service.service_image_url}
                              alt={getServiceDisplayName(service)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = NO_IMAGE_AVAILABLE_URL;
                              }}
                            />

                            {service.popular && (
                              <Badge
                                variant="destructive"
                                className="absolute top-2 left-2 text-xs py-1 px-2 rounded-full"
                              >
                                {language === 'tamil' ? 'பிரபலமானது' : 'Popular'}
                              </Badge>
                            )}
                          </div>

                          <div
                            className="service-card-content px-3 py-3 text-center flex flex-col flex-grow"
                            style={{ minHeight: '120px' }}
                          >
                            <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-[#861518] line-clamp-2 min-h-[2.8em]">
                              {getServiceDisplayName(service)}
                            </h3>

                            {getServiceShortContent(service) && (
                              <p className="text-slate-600 text-[10px] sm:text-xs mb-2 sm:mb-3 line-clamp-2 leading-tight">
                                {getServiceShortContent(service)}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-auto">
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
                                {formatPrice(service)}
                              </motion.div>

                              <button
                                onClick={(e) => { e.stopPropagation(); handleServiceClick(service); }}
                                className="bg-[#861518] text-white hover:bg-white hover:text-[#861518] border border-transparent hover:border-[#861518] px-3 py-1 rounded text-[11px] sm:text-[12px] font-medium transition-all duration-300"
                              >
                                {language === 'tamil' ? 'முன்பதிவு செய்ய' : 'Book Now'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 col-span-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">{language === 'tamil' ? 'சேவைகள் இல்லை' : 'No Services Available'}</h3>
                    <p className="text-sm sm:text-base text-gray-500">{language === 'tamil' ? 'சேவைகள் உள்ளமைக்கப்படுகின்றன. பின்னர் சரிபார்க்கவும்.' : 'Services are being configured. Please check back later.'}</p>
                  </div>
                )}
              </div>


              {/* Booking Cart Panel */}
              <div className={`w-full lg:w-96 order-1 lg:order-2 ${bookingCart.length > 0 ? 'fixed bottom-0 left-0 right-0 lg:static z-50' : 'lg:sticky lg:top-24'}`}>
                <div className={`${bookingCart.length > 0 ? 'fixed bottom-0 left-0 right-0 lg:static z-50' : 'lg:sticky lg:top-24'}`}>
                  <BookingCartPanel
                    cart={bookingCart}
                    onRemove={removeFromCart}
                    user={user}
                    currency={currency}
                    setCurrency={setCurrency}
                    paymentGateway={paymentGateway}
                    setPaymentGateway={setPaymentGateway}
                    calculateTotal={calculateTotal}
                    calculateTax={calculateCartTax}
                    calculateGrandTotal={calculateGrandTotal}
                    onPayment={handlePayment}
                    isPaymentLoading={isPaymentLoading}
                    razorpayEnabled={razorpayEnabled}
                    payPalEnabled={payPalEnabled}
                    language={language}
                    getServiceDisplayName={getServiceDisplayName}
                    setBookingCart={setBookingCart}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DynamicFooter />

        {/* Modals */}
        <PreviousBookingsModal
          isOpen={showPreviousBookings}
          onClose={() => setShowPreviousBookings(false)}
          service={selectedService}
          previousBookings={previousBookingsForService}
          onProceedToBook={proceedToBook}
          language={language}
          getServiceDisplayName={getServiceDisplayName}
        />
        <BookingFormModal
          isOpen={showBookingForm}
          onClose={() => { setShowBookingForm(false); setSelectedBookingData(null); }}
          service={selectedService}
          user={user}
          onAddToCart={addToCart}
          currency={currency}
          allUserBookings={allUserBookings}
          selectedBookingData={selectedBookingData}
          language={language}
          getServiceDisplayName={getServiceDisplayName}
        />

        {showPayPalModal && (
          <PayPalPaymentModal
            isOpen={showPayPalModal}
            onClose={handlePayPalCancel}
            onSuccess={handlePayPalSuccess}
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
          emailStatus={successModalData.emailStatus}
          onViewInvoice={() => handleInvoiceAction('view')}
          onDownloadInvoice={() => handleInvoiceAction('download')}
          language={language}
        />
      </div>
    </div>
  );
}

function BookingCartPanel({ cart, onRemove, currency, setCurrency, paymentGateway, setPaymentGateway, calculateTotal, calculateTax, calculateGrandTotal, onPayment, isPaymentLoading, razorpayEnabled, payPalEnabled, language, getServiceDisplayName, setBookingCart }) {
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const subtotal = calculateTotal();
  const taxCalculation = calculateTax();
  const grandTotal = calculateGrandTotal();

  const handleCurrencyToggle = (isUSD) => {
    const newCurrency = isUSD ? 'USD' : 'INR';
    const newGateway = isUSD ? 'paypal' : 'razorpay';
    if (newCurrency === currency) return;

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

      setBookingCart(updatedCart);
      setCurrency(newCurrency);
      setPaymentGateway(newGateway);

      toast.success(
        language === 'tamil'
          ? `விலைகள் ${newCurrency} க்கு புதுப்பிக்கப்பட்டன`
          : `Prices updated to ${newCurrency}`
      );
    } else {
      setCurrency(newCurrency);
      setPaymentGateway(newGateway);
    }
  };

  const paymentDisabled = (currency === 'INR' && !razorpayEnabled) || (currency === 'USD' && !payPalEnabled);

  return (
    <Card className="shadow-xl border-0 bg-white rounded-b-none lg:rounded-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b p-3 sm:p-4">
        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{language === 'tamil' ? 'தேர்ந்தெடுக்கப்பட்டவை ' : 'Booking Cart'}</span>
          </div>
          <Badge variant="secondary" className="text-xs">{cart.length}{language === 'tamil' ? '/5 சேவைகள்' : '/5 services'}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 max-h-[60vh] lg:max-h-none overflow-y-auto">
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-100 mb-3 sm:mb-4">
          <Label htmlFor="currency-toggle" className={`cursor-pointer font-semibold text-xs sm:text-sm ${currency === 'INR' ? 'text-red-600' : 'text-slate-500'}`}>
            {language === 'tamil' ? 'INR (₹)' : 'INR (₹)'}
          </Label>
          <Switch
            id="currency-toggle"
            checked={currency === 'USD'}
            onCheckedChange={(checked) => handleCurrencyToggle(checked)}
            disabled={isPaymentLoading}
          />
          <Label htmlFor="currency-toggle" className={`cursor-pointer font-semibold text-xs sm:text-sm ${currency === 'USD' ? 'text-red-600' : 'text-slate-500'}`}>
            {language === 'tamil' ? 'USD ($)' : 'USD ($)'}
          </Label>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-slate-500">
            <p className="text-sm">{language === 'tamil' ? 'உங்கள் அட்டை  காலியாக உள்ளது.' : 'Your cart is empty.'}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-3 sm:mb-4 max-h-40 sm:max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-2 bg-slate-50 rounded-lg gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm truncate">{getServiceDisplayName(item.service)}</p>
                    <p className="text-xs text-slate-600 truncate">{language === 'tamil' ? 'விருந்துக்கு:' : 'For:'} {item.formData.beneficiary_name}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <p className="font-semibold text-xs sm:text-sm whitespace-nowrap">{currencySymbol}{calculateRecurringTotal(item.price, item.formData.booking_type || 'one-time').toLocaleString()}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" onClick={() => onRemove(item.id)}><Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between"><span>{language === 'tamil' ? 'மொத்த துணைத் தொகை:' : 'Subtotal:'}</span><span>{currencySymbol}{subtotal.toLocaleString()}</span></div>
              {taxCalculation.totalTax > 0 && (
                <>
                  {taxCalculation.taxType === 'cgst_sgst' && (
                    <>
                      <div className="flex justify-between text-slate-600"><span>CGST:</span><span>{currencySymbol}{taxCalculation.cgst.toFixed(2)}</span></div>
                      <div className="flex justify-between text-slate-600"><span>SGST:</span><span>{currencySymbol}{taxCalculation.sgst.toFixed(2)}</span></div>
                    </>
                  )}
                  {taxCalculation.taxType === 'igst' && (
                    <div className="flex justify-between text-slate-600"><span>IGST:</span><span>{currencySymbol}{taxCalculation.igst.toFixed(2)}</span></div>
                  )}
                </>
              )}
              <div className="flex justify-between font-medium"><span>{language === 'tamil' ? 'மொத்த வரி:' : 'Total Tax:'}</span><span>{currencySymbol}{taxCalculation.totalTax.toFixed(2)}</span></div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-base sm:text-lg"><span>{language === 'tamil' ? 'மொத்தம்:' : 'Total:'}</span><span>{currencySymbol}{grandTotal.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500"><span>{language === 'tamil' ? 'வழியாக செலுத்து:' : 'Payment via:'}</span><span className="font-medium capitalize">{paymentGateway}</span></div>
            </div>

            {paymentDisabled && <Alert variant="destructive" className="mt-3 sm:mt-4 text-xs sm:text-sm">{language === 'tamil' ? 'கேட்வே முடக்கப்பட்டது. ஆதரவைத் தொடர்பு கொள்ளவும்.' : 'Gateway disabled. Contact support.'}</Alert>}

            <Button onClick={onPayment} disabled={isPaymentLoading || cart.length === 0 || paymentDisabled} className="w-full mt-3 sm:mt-4 bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3">
              {isPaymentLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{language === 'tamil' ? 'செயலாக்கப்படுகிறது...' : 'Processing...'}</> : `${language === 'tamil' ? 'செலுத்து' : 'Pay'} ${currencySymbol}${grandTotal.toLocaleString()}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}



function PreviousBookingsModal({ isOpen, onClose, service, previousBookings, onProceedToBook, language, getServiceDisplayName }) {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{language === 'tamil' ? 'முந்தைய முன்பதிவுகள்' : 'Previous Bookings'} - {getServiceDisplayName(service)}</DialogTitle></DialogHeader>
        {service.yearlyLimit && <Alert><AlertDescription>{language === 'tamil' ? 'இந்த ஆண்டு நீங்கள் இந்த சேவையை ஏற்கனவே பதிவு செய்துள்ளீர்கள். நீங்கள் இன்னும் ஒரு புதிய முன்பதிவைச் சேர்க்கலாம் அல்லது விவரங்களை மீண்டும் பயன்படுத்தலாம்.' : "You've already booked this service this year. You can still add a new booking or reuse details."}</AlertDescription></Alert>}
        <p className="text-sm text-slate-600">{language === 'tamil' ? 'முந்தைய முன்பதிவிலிருந்து விவரங்களை மீண்டும் பயன்படுத்தவா?' : 'Reuse details from a previous booking?'}</p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {previousBookings.length > 0 ? previousBookings.map((b) => (
            <div key={b.id} className="p-2 border rounded-md cursor-pointer hover:bg-slate-50" onClick={() => onProceedToBook(b)}>
              {language === 'tamil' ? 'விருந்துக்கு:' : 'For:'} {b.beneficiary_name} {language === 'tamil' ? 'அன்று' : 'on'} {new Date(b.booking_date).toLocaleDateString()}
            </div>
          )) : (
            <p className="text-sm text-slate-500 italic">{language === 'tamil' ? 'இந்த சேவைக்கு முந்தைய முன்பதிவுகள் எதுவும் இல்லை.' : 'No previous bookings found for this service.'}</p>
          )}
        </div>
        <Button onClick={() => onProceedToBook(null)} className="bg-[#B71C1C] hover:bg-[#8B0000]">{language === 'tamil' ? 'புதிய முன்பதிவு' : 'New Booking'}</Button>
      </DialogContent>
    </Dialog>
  );
}


function BookingFormModal({ isOpen, onClose, service, user, onAddToCart, currency, allUserBookings, selectedBookingData, language, getServiceDisplayName }) {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const isDeathService = service?.key === 'prayer_for_dead';

  useEffect(() => {
    if (!service || !isOpen) return;
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
      death_date: selectedBookingData?.death_date ? new Date(selectedBookingData.death_date) : null,
      ordination_date: selectedBookingData?.ordination_date ? new Date(selectedBookingData.ordination_date) : null,
      vows_date: selectedBookingData?.vows_date ? new Date(selectedBookingData.vows_date) : null,
      jubilee_date: selectedBookingData?.jubilee_date ? new Date(selectedBookingData.jubilee_date) : null,
      ordination_type: selectedBookingData?.ordination_date ? 'ordination' : selectedBookingData?.vows_date ? 'vows' : selectedBookingData?.jubilee_date ? 'jubilee' : 'ordination',
      booking_type: selectedBookingData?.booking_type || 'one-time',
      imageFile: null,
      reusedPhotoUrl: selectedBookingData?.booker_photo_url || null,
    };
    setFormData(initialData);
    setImagePreview(initialData.reusedPhotoUrl);
    setFormErrors({});
  }, [service, user, isOpen, selectedBookingData]);

  if (!isOpen || !service) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file, reusedPhotoUrl: null }));
      setImagePreview(URL.createObjectURL(file));
      if (formErrors.image) {
        setFormErrors(prev => ({ ...prev, image: null }));
      }
    }
  };

  const isDateDisabled = (date) => {
    const today = startOfDay(new Date());
    const fiveDaysFromNow = addDays(today, 5);
    const selectedDate = startOfDay(date);

    if (selectedDate < fiveDaysFromNow) {
      return true;
    }

    if (service.key === 'holy_mass' && isSunday(selectedDate)) {
      return true;
    }

    return false;
  };


  const validateForm = () => {
    const errors = {};

    if (!formData.beneficiary_name?.trim()) {
      errors.beneficiary_name = language === 'tamil' ? "விருந்து பெயர்தான் அவசியம்" : "Beneficiary name is required";
    }
    if (!formData.booker_name?.trim()) {
      errors.booker_name = language === 'tamil' ? "உங்கள் பெயர்தான் அவசியம்" : "Your name is required";
    }
    if (!formData.booker_email?.trim()) {
      errors.booker_email = language === 'tamil' ? "மின்னஞ்சல் அவசியம்" : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.booker_email)) {
      errors.booker_email = language === 'tamil' ? "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்" : "Please enter a valid email address";
    }
    if (!formData.booker_phone?.trim()) {
      errors.booker_phone = language === 'tamil' ? "தொலைபேசி எண் அவசியம்" : "Phone number is required";
    } else {
      const cleanedPhone = formData.booker_phone.replace(/\D/g, '');
      if (!/^\d{10}$/.test(cleanedPhone)) {
        errors.booker_phone = language === 'tamil' ? "தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்" : "Phone number must be exactly 10 digits";
      }
    }



    const isOrdinationService = service.isOrdinationService || false;
    if (isOrdinationService) {
      if (!formData.description?.trim()) {
        errors.description = language === 'tamil' ? "இந்த சேவைக்கு விளக்கம் அவசியம்" : "Description is required for this service";
      }
    } else {
      if (!formData.intention_text?.trim()) {
        errors.intention_text = language === 'tamil' ? "பிரார்த்தனை நோக்கம் அவசியம்" : "Prayer intention is required";
      }
    }



    if (!formData.booking_date) {
      errors.booking_date = language === 'tamil' ? "தொலைக்காட்சி ஒளிபரப்பு தேதி அவசியம்" : "Telecast date is required";
    } else {
      const today = startOfDay(new Date());
      const selectedDate = startOfDay(new Date(formData.booking_date));
      const minDate = addDays(today, 5);

      if (selectedDate < minDate) {
        errors.booking_date = language === 'tamil' ? "தொலைக்காட்சி ஒளிபரப்பு தேதி இன்று முதல் குறைந்தபட்சம் 5 நாட்கள் முன்பதிவு செய்யப்பட வேண்டும்" : "Telecast date must be at least 5 days from today";
      }

      if (service.key === 'holy_mass' && isSunday(selectedDate)) {
        errors.booking_date = language === 'tamil' ? "புனிதத் திருச்சபையை ஞாயிற்றுக்கிழமைகளில் திட்டமிட முடியாது" : "Holy Mass cannot be scheduled on Sundays";
      }
    }

    // if (service.requiresImage && !isOrdinationService && !formData.imageFile && !formData.reusedPhotoUrl) {
    //   errors.image = language === 'tamil' ? "இந்த சேவைக்கு புகைப்படம் பதிவேற்றுவது கட்டாயமாகும்" : "Photo upload is mandatory for this service";
    // }
    //     if ((service.requiresImage || isDeathService) &&
    //     !formData.imageFile &&
    //     !formData.reusedPhotoUrl) {
    //   errors.image =
    //     language === 'tamil'
    //       ? "இந்த சேவைக்கு புகைப்படம் கட்டாயம்"
    //       : "Photo upload is mandatory for this service";
    // }

    if (
      (service.requiresImage || service.key === 'prayer_for_dead') &&
      !isOrdinationService &&
      !formData.imageFile &&
      !formData.reusedPhotoUrl
    ) {
      errors.image =
        language === 'tamil'
          ? "இந்த சேவைக்கு புகைப்படம் கட்டாயம்"
          : "Photo upload is mandatory for this service";
    }






    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    onAddToCart(formData);
  };

  const getRecurringPrice = () => {
    const basePrice = currency === 'INR' ? service.priceINR : service.priceUSD;
    const bookingType = formData.booking_type || 'one-time';
    return calculateRecurringTotal(basePrice, bookingType);
  };

  const isOrdinationService = service.isOrdinationService || false;
  const needsBirthdayDate = !isOrdinationService && (service.key === 'birthday_service' || service.title.toLowerCase().includes('birthday'));
  const needsMarriageDate = !isOrdinationService && (service.key === 'marriage_blessing' || service.title.toLowerCase().includes('wedding anniversary'));
  const needsDeathDate = !isOrdinationService && (service.title.toLowerCase().includes('death') || service.title.toLowerCase().includes('neerthaar') || service.title.toLowerCase().includes('ninaivu') || service.title_tamil?.toLowerCase().includes('நீர்தார்') || service.title_tamil?.toLowerCase().includes('நினைவு'));
  // const needsDeathDate = !isOrdinationService && service.key === 'prayer_for_dead';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{language === 'tamil' ? '' : 'Book:'} {getServiceDisplayName(service)}</DialogTitle>
          <div className="text-sm text-slate-600">
            {language === 'tamil' ? 'விலை:' : 'Price:'} {currency === 'INR' ? '₹' : '$'}{getRecurringPrice().toLocaleString()}
            {formData.booking_type !== 'one-time' && <span className="ml-2 text-blue-600 font-medium">({formData.booking_type === 'monthly' ? (language === 'tamil' ? 'மாதாந்திரத் திட்டம்' : 'monthly plan') : (language === 'tamil' ? '12 மாதங்கள் (ஆண்டுத் திட்டம்)' : '12 months (yearly plan)')})</span>}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{language === 'tamil' ? 'ஒப்புக்கொடுக்கப்படுபவர்*' : 'Beneficiary Name*'}</Label>
              <Input
                value={formData.beneficiary_name || ''}
                onChange={e => setFormData(p => ({ ...p, beneficiary_name: e.target.value }))}
                className={formErrors.beneficiary_name ? 'border-red-500' : ''}
              />
              {formErrors.beneficiary_name && <p className="text-red-500 text-xs mt-1">{formErrors.beneficiary_name}</p>}
            </div>
            <div>
              <Label>{language === 'tamil' ? 'ஒப்புகொடுப்பவர்*' : 'Your Name*'}</Label>
              <Input
                value={formData.booker_name || ''}
                onChange={e => setFormData(p => ({ ...p, booker_name: e.target.value }))}
                className={formErrors.booker_name ? 'border-red-500' : ''}
              />
              {formErrors.booker_name && <p className="text-red-500 text-xs mt-1">{formErrors.booker_name}</p>}
            </div>
            <div>
              <Label>{language === 'tamil' ? 'உங்கள் மின்னஞ்சல்*' : 'Your Email*'}</Label>
              <Input
                type="email"
                value={formData.booker_email || ''}
                onChange={e => setFormData(p => ({ ...p, booker_email: e.target.value }))}
                className={formErrors.booker_email ? 'border-red-500' : ''}
              />
              {formErrors.booker_email && <p className="text-red-500 text-xs mt-1">{formErrors.booker_email}</p>}
            </div>
            <div>
              <Label>{language === 'tamil' ? 'உங்கள் தொலைபேசி*' : 'Your Phone*'}</Label>
              <Input
                type="tel"
                value={formData.booker_phone || ''}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setFormData(p => ({ ...p, booker_phone: value }));
                  }
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
              <Label>{language === 'tamil' ? 'முன்பதிவு வகை*' : 'Booking Type*'}</Label>
              <Select value={formData.booking_type || 'one-time'} onValueChange={(value) => setFormData(p => ({ ...p, booking_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'tamil' ? 'முன்பதிவு வகையைத் தேர்ந்தெடுக்கவும்' : "Select booking type"} />
                </SelectTrigger>
                <SelectContent>
                  {service.recurringOptions
                    ?.filter(option => option !== 'yearly')
                    .map(option => (
                      <SelectItem key={option} value={option}>
                        {option === 'one-time'
                          ? (language === 'tamil' ? 'ஒருமுறை' : 'One-time')
                          : option === 'monthly'
                            ? (language === 'tamil' ? 'மாதாந்திரம் (12 மாதங்கள்)' : 'Monthly (12 months)')
                            : option}
                      </SelectItem>
                    ))}
                </SelectContent>

              </Select>
              {formData.booking_type !== 'one-time' && (
                <p className="text-xs text-slate-600 mt-1">
                  {formData.booking_type === 'மாதங்கள்' ? (language === 'tamil' ? '12 மாத முன்பதிவுகளை உருவாக்குகிறது' : 'Creates 12 monthly bookings') : (language === 'tamil' ? '12 மாத முன்பதிவுகளை உருவாக்குகிறது (ஆண்டுத் திட்டம்)' : 'Creates 12 monthly bookings (yearly plan)')}
                </p>
              )}
            </div>
          )}

          <div>
            <Label>{language === 'tamil' ? 'தொலைக்காட்சி ஒளிபரப்பு தேதி*' : 'Telecast Date*'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full ${formErrors.booking_date ? 'border-red-500' : ''}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.booking_date ? format(formData.booking_date, 'PPP') : (language === 'tamil' ? "ஒளிபரப்பு தேதியைத் தேர்ந்தெடுக்கவும்" : "Pick telecast date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.booking_date}
                  onSelect={d => {
                    setFormData(p => ({ ...p, booking_date: d }));
                    if (formErrors.booking_date) {
                      setFormErrors(prev => ({ ...prev, booking_date: null }));
                    }
                  }}
                  disabled={isDateDisabled}
                />
              </PopoverContent>
            </Popover>
            {formErrors.booking_date && <p className="text-red-500 text-xs mt-1">{formErrors.booking_date}</p>}
            <p className="text-xs text-slate-500 mt-1">{language === 'tamil' ? 'குறைந்தபட்சம் 5 நாட்கள் முன்கூட்டியே முன்பதிவு செய்யப்பட வேண்டும்' : 'Minimum 5 days advance booking required'}</p>
          </div>

          {needsBirthdayDate && (
            <div>
              <Label>{language === 'tamil' ? 'பிறந்தநாள் தேதி*' : 'Birthday Date*'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthday_date ? format(formData.birthday_date, 'PPP') : (language === 'tamil' ? "பிறந்தநாள் தேதியைத் தேர்ந்தெடுக்கவும்" : "Pick birthday date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.birthday_date}
                    onSelect={d => setFormData(p => ({ ...p, birthday_date: d }))}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {needsMarriageDate && (
            <div>
              <Label>{language === 'tamil' ? 'திருமண தேதி*' : 'Marriage Date*'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.marriage_date ? format(formData.marriage_date, 'PPP') : (language === 'tamil' ? "திருமண தேதியைத் தேர்ந்தெடுக்கவும்" : "Pick marriage date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.marriage_date}
                    onSelect={d => setFormData(p => ({ ...p, marriage_date: d }))}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {needsDeathDate && (
            <div>
              <Label>{language === 'tamil' ? 'இறப்பு தேதி*' : 'Death Date*'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.death_date ? format(formData.death_date, 'PPP') : (language === 'tamil' ? "இறப்பு தேதியைத் தேர்ந்தெடுக்கவும்" : "Pick death date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.death_date}
                    onSelect={d => setFormData(p => ({ ...p, death_date: d }))}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {isOrdinationService && (
            <>
              <div>
                <Label htmlFor="ordination_type">{language === 'tamil' ? 'நினைவுகொள்ளும் வகை*' : 'Anniversary Type*'}</Label>
                <Select
                  value={formData.ordination_type || 'ordination'}
                  onValueChange={v => setFormData(p => ({ ...p, ordination_type: v }))}
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
                        className="w-full justify-start text-left font-normal"
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
                        onSelect={d => setFormData(p => ({ ...p, ordination_date: d }))}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}


              {formData.ordination_type === 'vows' && (
                <div>
                  <Label htmlFor="vows_date">{language === 'tamil' ? 'சத்தியப்பிரமாணம் தேதி*' : 'Vows Date*'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
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
                        onSelect={d => setFormData(p => ({ ...p, vows_date: d }))}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {formData.ordination_type === 'jubilee' && (
                <div>
                  <Label htmlFor="jubilee_date">{language === 'tamil' ? 'பொன்விழா தேதி*' : 'Jubilee Date*'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
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
                        onSelect={d => setFormData(p => ({ ...p, jubilee_date: d }))}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <Label>{language === 'tamil' ? 'விளக்கம்*' : 'Description*'}</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
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
              <Label>{language === 'tamil' ? 'திருப்பலி கருத்துக்கள்*' : 'Prayer Intention*'} <span className="text-xs text-slate-500">({language === 'tamil' ? 'ஆங்கிலத்தில் மட்டும்' : 'English only'})</span></Label>
              <Textarea
                value={formData.intention_text || ''}
                onChange={e => {
                  const englishOnly = e.target.value.replace(/[\u0B80-\u0BFF]/g, '');
                  setFormData(p => ({ ...p, intention_text: englishOnly }));
                }}
                className={formErrors.intention_text ? 'border-red-500' : ''}
                placeholder={language === 'tamil' ? "உங்கள் திருப்பலி கருத்துக்களை  பதிவிடயும் ..." : "Please enter your prayer intention in English..."}
                maxLength={90}
              />
              <p className="text-xs text-slate-500 mt-1">{(formData.intention_text || '').length}/90 {language === 'tamil' ? 'எழுத்துகள்' : 'characters'}</p>
              {formErrors.intention_text && <p className="text-red-500 text-xs mt-1">{formErrors.intention_text}</p>}
            </div>
          )}

          {(service.requiresImage || service.key === 'prayer_for_dead') && !isOrdinationService && (
            <div>
              <Label>
                {language === 'tamil'
                  ? 'புகைப்படத்தைப் பதிவேற்றவும்*'
                  : 'Upload Photo*'}
              </Label>

              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={formErrors.image ? 'border-red-500' : ''}
              />

              {formErrors.image && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.image}
                </p>
              )}

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 mt-2 rounded object-cover"
                />
              )}
            </div>
          )}


        </div>
        <div className="flex-shrink-0 border-t pt-4">
          <Button onClick={handleSubmit} className="w-full bg-[#B71C1C] hover:bg-[#8B0000]">
            {language === 'tamil' ? 'தேர்வு செய்ய ' : 'Add to Cart'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PayPalPaymentModal({ isOpen, onClose, onSuccess, config, totalAmount, currency }) {
  useEffect(() => {
    if (!isOpen || !config?.client_id) return;

    const renderButton = () => {
      const container = document.getElementById('paypal-button-container-modal');
      if (!container) return;
      container.innerHTML = '';

      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: totalAmount.toFixed(2),
                  currency_code: currency
                }
              }]
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
              onSuccess(details.id);
            });
          },
          onCancel: () => {
            onClose();
          },
          onError: (err) => {
            console.error("PayPal Error:", err);
            toast.error("PayPal payment failed. Please try again.");
            onClose();
          }
        }).render('#paypal-button-container-modal');
      }
    };

    if (!document.getElementById('paypal-sdk-script')) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk-script';
      script.src = `https://www.paypal.com/sdk/js?client-id=${config.client_id}&currency=${currency}`;
      script.onload = () => renderButton();
      document.head.appendChild(script);
    } else {
      const existingScript = document.getElementById('paypal-sdk-script');
      const currentClientId = existingScript.src.match(/client-id=([^&]+)/)?.[1];
      const currentCurrency = existingScript.src.match(/currency=([^&]+)/)?.[1];

      if (currentClientId !== config.client_id || currentCurrency !== currency) {
        existingScript.remove();
        const newScript = document.createElement('script');
        newScript.id = 'paypal-sdk-script';
        newScript.src = `https://www.paypal.com/sdk/js?client-id=${config.client_id}&currency=${currency}`;
        newScript.onload = () => renderButton();
        document.head.appendChild(newScript);
      } else {
        renderButton();
      }
    }
  }, [isOpen, config, totalAmount, currency, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with PayPal</DialogTitle>
          <DialogDescription>
            Total Amount: {totalAmount.toFixed(2)} {currency}
          </DialogDescription>
        </DialogHeader>
        <div id="paypal-button-container-modal" className="min-h-[100px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading PayPal...</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}