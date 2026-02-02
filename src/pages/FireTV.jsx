
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tv, Monitor, Zap, Shield } from 'lucide-react';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

export default function FireTVPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Listen for language changes
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('madha_tv_language') || 'english');
    };
    
    window.addEventListener('storage', handleLanguageChange);
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const translations = {
    pageTitle: language === 'tamil' ? 'Fire TV இல் Madha TV' : 'Madha TV on Fire TV',
    pageSubtitle: language === 'tamil'
      ? 'உங்கள் Fire TV சாதனத்தில் தெளிவான ஸ்ட்ரீமிங்குடன் தெய்வீக நிகழ்ச்சிகளை அனுபவியுங்கள்'
      : 'Experience divine programming on your Fire TV device with crystal clear streaming',
    installationGuide: language === 'tamil' ? 'நிறுவல் வழிகாட்டி' : 'Installation Guide',
    installationIntro: language === 'tamil'
      ? 'தயவுசெய்து பொறுமையுடன் பின்வரும் தகவல்களை படிக்கவும். Fire TV இலிருந்து MadhaTV செயலியை நிறுவுவது எப்படி:'
      : 'Please kindly read the following information with patience. Here\'s how to install MadhaTV App from Fire TV:',
    installationNote: language === 'tamil'
      ? 'உங்களிடம் குரல் ரிமோட் இல்லை என்றால், MadhaTV செயலியை பதிவிறக்க எளிதான வழி முகப்பு பக்கத்தில் உள்ள Find பட்டனுக்கு செல்வது. பின்னர் தேடல் ஐகானைத் தேர்ந்தெடுத்து உங்கள் ரிமோட் மூலம் செயலியின் பெயரை தட்டச்சு செய்யவும். இறுதியாக, முடிவைத் தேர்ந்தெடுத்து பதிவிறக்கு என்பதை கிளிக் செய்யவும்.'
      : 'If you don\'t have a voice remote, the easiest way to download MadhaTV app is by navigating to the Find button on the home page. Then select the search icon and type the name of the app with your remote. Finally, select the result and then click Download.',
    whyFireTV: language === 'tamil' ? 'Fire TV ஏன் தேர்வு செய்ய வேண்டும்?' : 'Why Choose Fire TV?',
  };

  const installationSteps = [
    {
      number: 1,
      title: language === 'tamil' ? 'Find பட்டனை தேர்ந்தெடுக்கவும்' : 'Select the Find button',
      description: language === 'tamil'
        ? 'உங்கள் Fire TV முகப்பு திரையில் Find பட்டனை தேர்ந்தெடுக்கவும். இதை நீங்கள் உங்கள் ரிமோட்டில் வலது திசை பட்டனை அழுத்தி அது முன்னிலைப்படுத்தப்படும் வரை செய்யலாம். பின்னர் மெனுவை வெளிப்படுத்த உங்கள் ரிமோட்டில் கீழ் பட்டனை கிளிக் செய்யவும்.'
        : 'Select the Find button on your Fire TV home screen. You can do this by pressing the right directional button on your remote until it is highlighted. Then click the down button on your remote to reveal the menu.',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694adbb74_fire1.jpg'
    },
    {
      number: 2,
      title: language === 'tamil' ? 'பின்னர் Search தேர்ந்தெடுக்கவும்' : 'Then select Search',
      description: language === 'tamil'
        ? 'Search விருப்பத்திற்கு செல்லவும் மற்றும் MadhaTV செயலியைத் தேட அதைத் தேர்ந்தெடுக்கவும்.'
        : 'Navigate to the Search option and select it to begin searching for the MadhaTV app.',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5c3c8399f_fire2.jpg'
    },
    {
      number: 3,
      title: language === 'tamil' ? 'செயலி பெயரை தட்டச்சு செய்யவும்' : 'Type the app name',
      description: language === 'tamil'
        ? 'அடுத்து, நீங்கள் பதிவிறக்க விரும்பும் செயலியின் பெயரை தட்டச்சு செய்யவும். உங்கள் ரிமோட்டைப் பயன்படுத்தி இதை எழுத்து-எழுத்தாக செய்ய வேண்டும். ஒவ்வொரு எழுத்தையும் தேர்ந்தெடுக்க திசை பட்டன்களையும், ஒவ்வொரு எழுத்தையும் உள்ளிட Select பட்டனையும் பயன்படுத்தவும்.'
        : 'Next, type the name of the app you want to download. You have to do this letter-by-letter using your remote. Use the directional buttons to select each letter and the Select button to enter each letter.'
    },
    {
      number: 4,
      title: language === 'tamil' ? 'செல்லவும் மற்றும் செயலி பெயரை தேர்ந்தெடுக்கவும்' : 'Navigate and select app name',
      description: language === 'tamil'
        ? 'பின்னர் கீழே செல்லவும் மற்றும் செயலியின் பெயரைத் தேர்ந்தெடுக்கவும். முழு பெயரையும் தட்டச்சு செய்ய வேண்டிய அவசியமில்லை.'
        : 'Then navigate down and select the app\'s name. You don\'t have to type the entire name to see it appear.',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/209ed6149_fire3.jpg'
    },
    {
      number: 5,
      title: language === 'tamil' ? 'செயலி ஐகானை தேர்ந்தெடுக்கவும்' : 'Select the app icon',
      description: language === 'tamil'
        ? 'அடுத்து, செயலி ஐகானைத் தேர்ந்தெடுக்கவும். நீங்கள் பதிவிறக்க விரும்பும் செயலியைக் காணவில்லை என்றால், வலதுபுறம் அல்லது கீழே ஸ்க்ரோல் செய்து அதைக் கண்டறியலாம்.'
        : 'Next, select the app icon. If you don\'t see the app you want to download, you can scroll to the right or scroll down to find it.'
    },
    {
      number: 6,
      title: language === 'tamil' ? 'இறுதியாக, Download தேர்ந்தெடுக்கவும்' : 'Finally, select Download',
      description: language === 'tamil'
        ? 'இறுதியாக, உங்கள் Fire TV சாதனத்தில் MadhaTV செயலியை நிறுவ Download தேர்ந்தெடுக்கவும்.'
        : 'Finally, select Download to install the MadhaTV app on your Fire TV device.',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/fab19c794_fire4.jpg'
    }
  ];

  const features = [
    { 
      icon: <Tv className="w-8 h-8" />, 
      title: language === 'tamil' ? 'பெரிய திரை' : 'Big Screen', 
      desc: language === 'tamil' ? 'உங்கள் TV இல் அனுபவிக்கவும்' : 'Enjoy on your TV',
      backTitle: language === 'tamil' ? 'பெரிய காட்சி' : 'Large Display',
      backDesc: language === 'tamil' 
        ? 'குடும்பம் மற்றும் நண்பர்களுடன் பகிரப்பட்ட அனுபவத்திற்காக உங்கள் தொலைக்காட்சியில் ஆன்மீக உள்ளடக்கத்தைப் பார்க்கவும்'
        : 'Watch spiritual content on your television with family and friends for a shared experience'
    },
    { 
      icon: <Monitor className="w-8 h-8" />, 
      title: language === 'tamil' ? 'HD தரம்' : 'HD Quality', 
      desc: language === 'tamil' ? 'தெளிவான வீடியோ' : 'Crystal clear video',
      backTitle: language === 'tamil' ? 'உயர் தர வீடியோ' : 'Premium Video',
      backDesc: language === 'tamil'
        ? 'தெளிவான ஆடியோ தரத்துடன் அதிநவீன உயர் தெளிவுத்திறனில் தெய்வீக நிகழ்ச்சிகளை அனுபவிக்கவும்'
        : 'Experience divine programming in stunning high definition with crisp audio quality'
    },
    { 
      icon: <Zap className="w-8 h-8" />, 
      title: language === 'tamil' ? 'வேகமான ஸ்ட்ரீமிங்' : 'Fast Streaming', 
      desc: language === 'tamil' ? 'இடையூறுகள் இல்லை' : 'No buffering',
      backTitle: language === 'tamil' ? 'விரைவான அணுகல்' : 'Quick Access',
      backDesc: language === 'tamil'
        ? 'இடையூறுகள் இல்லாமல் நேரலை மாஸ்கள் மற்றும் பக்தி நிகழ்ச்சிகளின் உடனடி ஸ்ட்ரீமிங்'
        : 'Instant streaming of live masses and devotional programs without interruptions'
    },
    { 
      icon: <Shield className="w-8 h-8" />, 
      title: language === 'tamil' ? 'உயர்தர உள்ளடக்கம்' : 'Premium Content', 
      desc: language === 'tamil' ? 'சிறப்பு நிகழ்ச்சிகள்' : 'Exclusive shows',
      backTitle: language === 'tamil' ? 'புனித நிகழ்ச்சிகள்' : 'Sacred Programs',
      backDesc: language === 'tamil'
        ? 'பிரத்யேக ஆன்மீக உள்ளடக்கம், நேரலை நிகழ்வுகள் மற்றும் சிறப்பு மத கொண்டாட்டங்களை அணுகவும்'
        : 'Access exclusive spiritual content, live events, and special religious celebrations'
    }
  ];

  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        staggerChildren: 0.04,
      },
    },
  };

  const letter = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/30 text-slate-800 relative overflow-hidden">
      <AIFloatingChat />
      
      {/* More Active Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Multiple moving gradient waves */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: 'linear-gradient(45deg, #fef2f2 0%, #fef7ff 25%, #f0f9ff 50%, #fef2f2 75%, #fef2f2 100%)',
            backgroundSize: '400% 400%'
          }}
        />
        
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["100% 0%", "0% 100%", "100% 0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: 'linear-gradient(-45deg, transparent 0%, rgba(185,28,28,0.05) 25%, transparent 50%, rgba(59,130,246,0.05) 75%, transparent 100%)',
            backgroundSize: '300% 300%'
          }}
        />

        {/* Active floating particles with trails */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? 'linear-gradient(45deg, #ef4444, #f97316)' : 
                         i % 3 === 1 ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' : 
                         'linear-gradient(45deg, #10b981, #06b6d4)'
            }}
            animate={{
              scale: [0, 1, 0.5, 1, 0],
              opacity: [0, 0.8, 0.4, 0.8, 0],
              y: [0, -150, -300],
              x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
              rotate: [0, 360, 720],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Large dynamic orbs with more movement */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(185,28,28,0.15) 0%, rgba(185,28,28,0.05) 50%, transparent 100%)'
          }}
          animate={{ 
            scale: [1, 1.5, 0.8, 1.3, 1],
            x: [0, 150, -100, 200, 0],
            y: [0, 100, -50, 150, 0],
            opacity: [0.3, 0.6, 0.2, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 50%, transparent 100%)'
          }}
          animate={{ 
            scale: [1.2, 0.8, 1.4, 1, 1.2],
            x: [0, -120, 80, -150, 0],
            y: [0, -80, 60, -120, 0],
            opacity: [0.4, 0.2, 0.6, 0.3, 0.4]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Energy lines moving across screen */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-red-300/40 to-transparent"
            style={{
              top: `${10 + i * 12}%`,
            }}
            animate={{
              x: ['-100%', '200%'],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "linear"
            }}
          />
        ))}
        
        {/* More active sparkle effects */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        {/* Hero Banner Section */}
        <div 
          className="relative bg-cover bg-center h-80 overflow-hidden"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=2940&auto=format&fit=crop')" }}
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=2940&auto=format&fit=crop')" }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-[rgba(1,1,25,0.8)] to-[rgba(93,6,6,0.3)]"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "mirror" }}
          />
          <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center items-center text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              variants={sentence}
              initial="hidden"
              animate="visible"
            >
              {translations.pageTitle.split("").map((char, index) => (
                <motion.span key={char + "-" + index} variants={letter} className="inline-block">
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p 
              className="text-xl text-red-100 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: 2, delay: 2.5, repeatType: "mirror" }}
              >
                {translations.pageSubtitle}
              </motion.span>
            </motion.p>
          </div>
        </div>

        {/* Installation Instructions Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              {translations.installationGuide}
            </h2>
            <p className="text-xl text-slate-600 my-5 mb-8 max-w-4xl mx-auto leading-relaxed">
              {translations.installationIntro}
            </p>
            <div className="bg-gradient-to-r from-red-50 to-red-100 backdrop-blur-sm p-6 rounded-2xl border border-red-200 max-w-4xl mx-auto">
              <p className="text-slate-700 text-lg leading-relaxed">
                {translations.installationNote}
              </p>
            </div>
          </motion.div>

          {/* Installation Steps */}
          <div className="space-y-12">
            {installationSteps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-12`}>
                  {/* Step Content */}
                  <div className="flex-1 space-y-6">
                    <div className="bg-gradient-to-br from-white to-red-50 backdrop-blur-sm p-8 rounded-2xl border border-red-200 shadow-lg relative overflow-hidden">
                      {/* Step Heading with Number */}
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                          animate={{
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              '0 0 20px rgba(185,28,28,0.4)',
                              '0 0 40px rgba(185,28,28,0.8)',
                              '0 0 20px rgba(185,28,28,0.4)'
                            ]
                          }}
                          transition={{ 
                            scale: { duration: 2, repeat: Infinity },
                            boxShadow: { duration: 3, repeat: Infinity }
                          }}
                        >
                          {step.number}
                        </motion.div>
                        <h3 className="text-2xl font-bold text-red-700">
                          {step.title}
                        </h3>
                      </div>
                      
                      <p className="text-slate-700 text-lg leading-relaxed">
                        {step.description}
                      </p>
                      
                      {/* Background decoration */}
                      <motion.div
                        className="absolute -bottom-4 -left-4 w-20 h-20 bg-red-100/50 rounded-full blur-xl"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Step Image */}
                  {step.image && (
                    <div className="flex-1 max-w-lg">
                      <motion.div
                        className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-red-200"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={step.image}
                          alt={`Step ${step.number}`}
                          className="w-full h-auto rounded-xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent"></div>
                        <motion.div
                          className="absolute top-4 left-4 bg-white/90 text-red-600 px-4 py-2 rounded-full font-bold shadow-lg"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.9, 1, 0.9]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {language === 'tamil' ? `படி ${step.number}` : `Step ${step.number}`}
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhanced Features Section with Light Animated Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
          {/* Light Animated Background for Features Section */}
          <div className="absolute inset-0">
            {/* Moving light waves */}
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(239,246,255,0.8) 0%, rgba(254,242,242,0.8) 25%, rgba(240,249,255,0.8) 50%, rgba(239,246,255,0.8) 75%)',
                backgroundSize: '200% 200%'
              }}
            />
            
            {/* Floating light particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`light-particle-${i}`}
                className="absolute w-1 h-1 bg-blue-300/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                  y: [0, -50, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
            
            {/* Decorative light shapes */}
            <motion.div
              className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/20 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 15, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-red-100/30 to-pink-100/20 rounded-full blur-2xl"
              animate={{ 
                scale: [1.1, 0.9, 1.1],
                rotate: [360, 180, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 18, repeat: Infinity }}
            />
          </div>
          
          <motion.div 
            className="relative mt-16 text-center max-w-7xl mx-auto px-6 py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.h2 
              className="text-4xl font-bold mb-8 text-slate-800"
              animate={{
                textShadow: [
                  '0 0 20px rgba(59,130,246,0.3)', 
                  '0 0 40px rgba(59,130,246,0.6)', 
                  '0 0 20px rgba(59,130,246,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              {translations.whyFireTV}
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="relative h-48"
                  style={{ perspective: '1000px' }} // Added perspective for 3D effect
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }} // Added hover scale for parent
                >
                  <motion.div 
                    className="relative w-full h-full transition-transform duration-700" 
                    style={{ transformStyle: 'preserve-3d' }} // preserve-3d
                    whileHover={{ rotateY: 180 }} 
                    transition={{ duration: 0.7 }} 
                  >
                    {/* Front Side */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-lg flex flex-col items-center justify-center text-center"
                      style={{ backfaceVisibility: 'hidden' }} // backface-hidden
                    >
                      <motion.div 
                        className="text-slate-700 mb-4 flex justify-center" 
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: index * 0.5 
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3> 
                      <p className="text-slate-600">{feature.desc}</p> 
                    </div>
                    
                    {/* Back Side */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center text-white"
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }} // backface-hidden
                    >
                      <motion.div 
                        className="text-white mb-4 flex justify-center"
                        animate={{ 
                          rotate: [0, 360],
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "linear",
                          delay: index * 0.5 
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2">{feature.backTitle}</h3>
                      <p className="text-red-100 text-sm">{feature.backDesc}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      <DynamicFooter />
    </div>
  );
}
