
import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import {  useRef } from "react";

import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';
import PageBanner from "../components/website/PageBanner";
const CONTACT_API_URL = "https://secure.madhatv.in/api/v2/contactus_app.php";

export default function ContactPage() {
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
//   const [captchaToken, setCaptchaToken] = useState(null);
//  const captchaRendered = useRef(false);

// useEffect(() => {
//   const scriptId = "recaptcha-script";

//   window.onRecaptchaLoadCallback = () => {
//     if (captchaRendered.current) return;

//     if (window.grecaptcha && document.getElementById("recaptcha-box")) {
//       window.grecaptcha.render("recaptcha-box", {
//         sitekey: "6Lf77nwrAAAAAPEkqvAv21qypuez1QS-rAQOL5ry",
//         callback: (token) => {
//           console.log("CAPTCHA TOKEN 👉", token);
//           setCaptchaToken(token);
//         },
//         "expired-callback": () => {
//           setCaptchaToken(null);
//         },
//       });

//       captchaRendered.current = true;
//     }
//   };

//   if (!document.getElementById(scriptId)) {
//     const script = document.createElement("script");
//     script.id = scriptId;
//     script.src =
//       "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoadCallback&render=explicit";
//     script.async = true;
//     script.defer = true;
//     document.body.appendChild(script);
//   } else {
//     // script already loaded
//     if (window.grecaptcha) {
//       window.onRecaptchaLoadCallback();
//     }
//   }

//   return () => {
//     delete window.onRecaptchaLoadCallback;
//   };
// }, []);



  useEffect(() => {
    loadContent();
    
    // Listen for language changes
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

//  useEffect(() => {
//   const script = document.createElement("script");
//   script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
//   script.async = true;
//   script.defer = true;
//   document.body.appendChild(script);

//   script.onload = () => {
//     if (window.grecaptcha) {
//       window.grecaptcha.render("recaptcha-box", {
//         sitekey: "6Lf77nwrAAAAAPEkqvAv21qypuez1QS-rAQOL5ry",
//         callback: (token) => {
//           setCaptchaToken(token);
//         },
//         "expired-callback": () => {
//           setCaptchaToken(null);
//         },
//       });
//     }
//   };

//   return () => {
//     document.body.removeChild(script);
//   };
// }, []);


  // useEffect(() => {
  //   window.onCaptchaSuccess = (token) => {
  //     setCaptchaToken(token);
  //   };

  //   window.onCaptchaExpired = () => {
  //     setCaptchaToken(null);
  //   };

  //   return () => {
  //     delete window.onCaptchaSuccess;
  //     delete window.onCaptchaExpired;
  //   };
  // }, []);

  const loadContent = async () => {
    try {
      const allContent = await WebsiteContent.filter({ is_active: true });
      const contactContent = allContent.filter(item => item.section === 'contact');
      const contentMap = contactContent.reduce((acc, item) => {
        acc[item.content_key] = item.content_value;
        return acc;
      }, {});
      
      setContent(contentMap);
    } catch (error) {
      console.error("Error loading contact content:", error);
    }
    setIsLoading(false);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.email || !formData.message) {
    setSubmitStatus("error");
    return;
  }

  setIsSubmitting(true);

  try {
    const payload = {
      user_id: localStorage.getItem("user_id") || "",
      name: formData.name,
      email_id: formData.email,
      message: formData.message,
      mobile_number: formData.phone || "",
    };

    const response = await fetch(CONTACT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("CONTACT API RESPONSE 👉", result);

    if (result?.error === false) {
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } else {
      setSubmitStatus("error");
    }
  } catch (err) {
    console.error("CONTACT API ERROR 👉", err);
    setSubmitStatus("error");
  }

  setIsSubmitting(false);
};



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const translations = {
    getInTouch: language === 'tamil' ? 'தொடர்பு கொள்ளுங்கள்' : 'Get in Touch',
    sendMessage: language === 'tamil' ? 'எங்களுக்கு செய்தி அனுப்புங்கள்' : 'Send us a Message',
    name: language === 'tamil' ? 'பெயர்' : 'Name',
    email: language === 'tamil' ? 'மின்னஞ்சல்' : 'Email',
    phone: language === 'tamil' ? 'தொலைபேசி' : 'Phone',
    // subject: language === 'tamil' ? 'பொருள்' : 'Subject',
    message: language === 'tamil' ? 'செய்தி' : 'Message',
    messagePlaceholder: language === 'tamil' 
      ? 'தயவுசெய்து உங்கள் செய்தி, பிரார்த்தனை கோரிக்கை அல்லது விசாரணையை பகிரவும்...'
      : 'Please share your message, prayer request, or inquiry...',
    sendButton: language === 'tamil' ? 'செய்தி அனுப்பு' : 'Send Message',
    sending: language === 'tamil' ? 'அனுப்புகிறது...' : 'Sending...',
    successMessage: language === 'tamil' 
      ? 'உங்கள் செய்திக்கு நன்றி! நாங்கள் விரைவில் உங்களை தொடர்பு கொள்வோம்.'
      : 'Thank you for your message! We\'ll get back to you soon.',
    errorMessage: language === 'tamil'
      ? 'மன்னிக்கவும், உங்கள் செய்தியை அனுப்புவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
      : 'Sorry, there was an error sending your message. Please try again.',
    // captchaError: language === 'tamil'
    //   ? 'தயவுசெய்து CAPTCHA சரிபார்ப்பை முடிக்கவும்.'
    //   : 'Please complete the CAPTCHA verification.',
    required: language === 'tamil' ? '*' : '*'
  };

  const contactDetails = [
    {
      icon: MapPin,
      title: language === 'tamil' ? 'முகவரி' : 'Address',
      content: language === 'tamil'
        ? "Madha TV\nSt. Thomas Building, 150 Luz Church Road\nMylapore, Chennai 600 004\nTamilnadu, India"
        : "Madha TV\nSt. Thomas Building, 150 Luz Church Road\nMylapore, Chennai 600 004\nTamilnadu, India",
      delay: 0.1
    },
    {
      icon: Phone,
      title: language === 'tamil' ? 'தொலைபேசி' : 'Phone',
      content: "+91 44 24991344\n+91 44 24993314",
      delay: 0.2,
      isPhone: true
    },
    {
      icon: Mail,
      title: language === 'tamil' ? 'மின்னஞ்சல்' : 'Email',
      content: "Info@madhatv.in\nsupport2@madhatv.in",
      delay: 0.3
    },
    {
      icon: Clock,
      title: language === 'tamil' ? 'அலுவலக நேரங்கள்' : 'Office Hours',
      content: language === 'tamil'
        ? "திங்கள் – சனி\nகாலை 9.30 – மாலை 5.30"
        : "Monday – Saturday\n9.30 am – 5.30 Pm.",
      delay: 0.4
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AIFloatingChat />
      
      <PageBanner 
        pageKey="contact"
        fallbackTitle="Contact Us"
        fallbackDescription="Get in touch with us for any questions, support, or spiritual guidance"
        fallbackImage="https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=2940&auto=format&fit=crop"
      />
        
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Get in Touch Section */}
            <div>
              <motion.h2 
                className="text-3xl font-bold text-slate-900 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {translations.getInTouch}
              </motion.h2>
              
              <div className="grid gap-6">
                {contactDetails.map((detail, index) => (
                  <motion.div
                    key={detail.title}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: detail.delay }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <motion.div
                            className="w-12 h-12 bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] rounded-full flex items-center justify-center flex-shrink-0"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <detail.icon className="w-6 h-6 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-2 text-lg">{detail.title}</h3>
                            <div className="text-slate-700 leading-relaxed">
                              {detail.title === (language === 'tamil' ? 'மின்னஞ்சல்' : 'Email') ? (
                                <div className="space-y-1">
                                  {detail.content.split('\n').map((line, idx) => (
                                    <div key={idx}>
                                      <a href={`mailto:${line}`} className="break-all hover:underline hover:text-[#B71C1C] transition-colors">{line}</a>
                                    </div>
                                  ))}
                                </div>
                              ) : detail.isPhone ? (
                                <div className="space-y-1">
                                  {detail.content.split('\n').map((line, idx) => (
                                    <div key={idx}>
                                      <a 
                                        href={`tel:${line.replace(/\s+/g, '')}`}
                                        className="hover:underline hover:text-[#B71C1C] transition-colors"
                                      >
                                        {line}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {detail.content.split('\n').map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900">{translations.sendMessage}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{translations.name} {translations.required}</label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{translations.email} {translations.required}</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full "
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{translations.phone}</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{translations.subject} {translations.required}</label>
                        <Input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full"
                        />
                      </div> */}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{translations.message} {translations.required}</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full"
                        placeholder={translations.messagePlaceholder}
                      />
                    </div>
                    
                    {/* CAPTCHA */}
                    {/* <div className="flex justify-center"> 
                                        <div 
                       id="recaptcha-box" 
                        data-sitekey="6Lf77nwrAAAAAPEkqvAv21qypuez1QS-rAQOL5ry"
                        data-callback="onCaptchaSuccess"
                        data-expired-callback="onCaptchaExpired"
                      ></div> 
     </div> */}
                       
                
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting  }
                          //  disabled={isSubmitting  || !captchaToken}
                      className="w-full bg-[#B71C1C] hover:bg-[#D32F2F] text-white py-3 text-lg"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {isSubmitting ? translations.sending : translations.sendButton}
                    </Button>
                    
                    {submitStatus === 'success' && (
                      <p className="text-green-600 text-center">
                        {translations.successMessage}
                      </p>
                    )}
                    
                    {submitStatus === 'error' && (
                      <p className="text-red-600 text-center">
                        {translations.errorMessage}
                      </p>
                    )}
                    
                  
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      
      <DynamicFooter />
    </div>
  );
}
