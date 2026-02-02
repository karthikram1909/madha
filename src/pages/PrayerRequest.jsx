import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Phone, Mail, MessageSquare, CheckCircle, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPrayerRequestApi } from "../api/Prayer";  
import { WebsiteContent } from '@/api/entities';
import { toast } from 'sonner';
import DynamicFooter from '../components/website/DynamicFooter';
import AIFloatingChat from '../components/website/AIFloatingChat';
import PageBanner from "../components/website/PageBanner";
import StickyNavbar from '@/components/website/StickyNavbar';

export default function PrayerRequest() {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [recaptchaSiteKey, setRecaptchaSiteKey] = useState(null);
    const [isCaptchaEnabled, setIsCaptchaEnabled] = useState(false);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');
    const [devotionalImage, setDevotionalImage] = useState("https://base44.app/api/apps/68f9beb680650e7849f02a09/files/public/68f9beb680650e7849f02a09/7ae338e89_WhatsAppImage2025-12-15at62519PM.jpeg");

    useEffect(() => {
        loadRecaptchaConfig();
        loadPrayerImage();
    }, []);

    const loadPrayerImage = async () => {
        try {
            const imageConfig = await WebsiteContent.filter({ section: 'prayer_request', content_key: 'prayer_image' });
            if (imageConfig && imageConfig.length > 0 && imageConfig[0].content_value) {
                setDevotionalImage(imageConfig[0].content_value);
            }
        } catch (error) {
            console.error('Failed to load prayer image:', error);
        }
    };

    const loadRecaptchaConfig = async () => {
        try {
            const configs = await WebsiteContent.filter({ section: 'security', content_key: 'google_recaptcha_site_key' });
            if (configs && configs.length > 0 && configs[0].content_value) {
                const siteKey = configs[0].content_value;
                setRecaptchaSiteKey(siteKey);
                setIsCaptchaEnabled(true);
                
                // Load Google reCAPTCHA script
                const script = document.createElement('script');
                script.src = 'https://www.google.com/recaptcha/api.js';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
                
                console.log('✅ reCAPTCHA enabled with site key');
            } else {
                console.log('ℹ️ reCAPTCHA not configured, form will work without it');
                setIsCaptchaEnabled(false);
            }
        } catch (error) {
            console.error('Failed to load reCAPTCHA config:', error);
            setIsCaptchaEnabled(false);
        }
    };

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };
        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);

        // Set up global callback for reCAPTCHA only if enabled
        if (isCaptchaEnabled) {
            window.onCaptchaSuccess = (token) => {
                setCaptchaToken(token);
            };

            window.onCaptchaExpired = () => {
                setCaptchaToken(null);
            };
        }

        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
            if (isCaptchaEnabled) {
                delete window.onCaptchaSuccess;
                delete window.onCaptchaExpired;
            }
        };
    }, [isCaptchaEnabled]);

    const getText = (english, tamil) => {
        return language === 'tamil' ? tamil : english;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error(getText("Please fill in all required fields.", "தேவையான அனைத்து புலங்களையும் நிரப்பவும்."));
            return;
        }
        
        // Only check CAPTCHA if it's enabled
        if (isCaptchaEnabled && !captchaToken) {
            toast.error(getText("Please complete the CAPTCHA verification.", "கேப்ட்சா சரிபார்ப்பை முடிக்கவும்."));
            return;
        }

        setIsLoading(true);
     try {
 const payload = {
  name: formData.name,
  mobile: formData.phone,
  email: formData.email,
  message: formData.message,
};

  console.log("🟡 Prayer Submit Payload:", payload);

  const response = await createPrayerRequestApi(payload);

  console.log("🟢 Prayer API Response:", response);

  toast.success(
    getText(
      "Your prayer request has been sent successfully!",
      "உங்கள் ஜெபக் கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது!"
    )
  );

  setIsSubmitted(true);

  // Reset form
  setFormData({ name: '', phone: '', email: '', message: '' });
  setCaptchaToken(null);

  if (isCaptchaEnabled && window.grecaptcha) {
    window.grecaptcha.reset();
  }

} catch (error) {
  console.error("🔴 Prayer Submit Error:", error);

  toast.error(
    getText(
      "Failed to send your request. Please try again later.",
      "உங்கள் கோரிக்கையை அனுப்ப முடியவில்லை. பிறகு முயற்சிக்கவும்."
    )
  );
}
    }


    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
            <StickyNavbar/>
            {/* <AIFloatingChat /> */}

            <PageBanner 
                pageKey="prayer_request"
                fallbackTitle="Submit Prayer Request"
                fallbackDescription="Share your prayer intentions with us. The Madha TV Prayer Team will pray for your intentions in the Holy Eucharistic Presence."
                fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
            />
            
            <main className="relative z-10 py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Animated Image Section (Left) */}
                        <motion.div
                          className="flex justify-center items-center"
                          initial={{ opacity: 0, x: -100 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
                        >
                          <motion.div
                            className="relative"
                            animate={{ y: [-5, 5, -5] }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          >
                            <motion.div
                              className="absolute -inset-4 bg-pink-400/50 rounded-full blur-3xl"
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.8, 0.5],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                            <motion.img
                              src={devotionalImage}
                              alt="Devotional Image"
                              className="relative rounded-full shadow-2xl w-full max-w-md object-cover border-4 border-white"
                              whileHover={{ scale: 1.05, rotate: 2 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            />
                          </motion.div>
                        </motion.div>
                        
                        {/* Form Section (Right) */}
                        <motion.div
                             initial={{ opacity: 0, x: 100 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.8, delay: 0.4 }}
                             className="w-full"
                        >
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        '0 0 0 0 rgba(225, 29, 72, 0)', 
                                        '0 0 0 10px rgba(225, 29, 72, 0.3)', 
                                        '0 0 0 0 rgba(225, 29, 72, 0)'
                                    ]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 1.5
                                }}
                                className="rounded-2xl"
                            >
                                <Card className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border-2 border-red-100">
                                    <CardContent className="p-8">
                                        {isSubmitted ? (
                                            <div className="text-center py-12">
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                                                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{getText('Thank You!', 'நன்றி!')}</h3>
                                                    <p className="text-slate-600">{getText('Your prayer request has been received. We will be praying for you.', 'உங்கள் ஜெபக் கோரிக்கை பெறப்பட்டது. நாங்கள் உங்களுக்காக ஜெபிப்போம்.')}</p>
                                                    <Button onClick={() => setIsSubmitted(false)} className="mt-8">{getText('Submit another request', 'மற்றொரு கோரிக்கையைச் சமர்ப்பிக்கவும்')}</Button>
                                                </motion.div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <Input name="name" placeholder={getText('Your Name', 'உங்கள் பெயர்')} value={formData.name} onChange={handleInputChange} className="pl-10 transition-all focus:shadow-lg focus:border-red-400 focus:ring-2 focus:ring-red-300" required />
                                                </div>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <Input name="phone" type="tel" placeholder={getText('Mobile Number', 'அலைபேசி எண்')} value={formData.phone} onChange={handleInputChange} className="pl-10 transition-all focus:shadow-lg focus:border-red-400 focus:ring-2 focus:ring-red-300" />
                                                </div>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <Input name="email" type="email" placeholder={getText('Email ID', 'மின்னஞ்சல் முகவரி')} value={formData.email} onChange={handleInputChange} className="pl-10 transition-all focus:shadow-lg focus:border-red-400 focus:ring-2 focus:ring-300" required />
                                                </div>
                                                <div className="relative">
                                                    <MessageSquare className="absolute left-3 top-3 text-slate-400" />
                                                    <Textarea name="message" placeholder={getText('Your Prayer Intentions...', 'உங்களின் செப கருத்துக்களை பதிவுசெய்ய..')} value={formData.message} onChange={handleInputChange} className="pl-10 transition-all h-36 focus:shadow-lg focus:border-red-400 focus:ring-2 focus:ring-red-300" required />
                                                </div>
                                                
                                                {/* CAPTCHA - Only show if enabled */}
                                                {isCaptchaEnabled && recaptchaSiteKey && (
                                                    <div className="flex justify-center">
                                                        <div 
                                                            className="g-recaptcha" 
                                                            data-sitekey={recaptchaSiteKey}
                                                            data-callback="onCaptchaSuccess"
                                                            data-expired-callback="onCaptchaExpired"
                                                        ></div>
                                                    </div>
                                                )}
                                                
                                                <Button 
                                                    type="submit" 
                                                    className="w-full text-lg py-6 bg-red-700 hover:bg-red-800 transition-all shadow-lg hover:shadow-red-500/50" 
                                                    disabled={isLoading || (isCaptchaEnabled && !captchaToken)}
                                                >
                                                    {isLoading ? (
                                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                                            <Loader className="mr-2 h-5 w-5" />
                                                        </motion.div>
                                                    ) : (
                                                        <Send className="mr-2 h-5 w-5" />
                                                    )}
                                                    {getText('Submit Prayer', 'செப கருத்துக்களை சமர்ப்பிக்கவும்')}
                                                </Button>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <DynamicFooter />
        </div>
    );
}