import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Star, Users, Tv, Clock, Globe, Heart, ExternalLink, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

// Particle component for light background effects
const Particle = ({ delay = 0 }) => (
    <motion.div
        className="absolute w-1 h-1 bg-gradient-to-r from-red-200 to-red-300 rounded-full opacity-40"
        initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 100,
            scale: 0
        }}
        animate={{ 
            y: -100, 
            scale: [0, 1, 0],
            opacity: [0, 0.4, 0]
        }}
        transition={{ 
            duration: Math.random() * 4 + 3,
            delay: delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 6 + 3
        }}
    />
);

// 3D Mobile Phone Frame Component
const MobileFrame = ({ children }) => (
    <motion.div 
        className="relative perspective-1000 transform-gpu"
        initial={{ rotateY: 25, rotateX: 5, scale: 0.8, opacity: 0 }}
        animate={{ 
            rotateY: [25, -5, 25], 
            rotateX: [5, -2, 5], 
            scale: 1, 
            opacity: 1,
            y: [0, -10, 0]
        }}
        transition={{ 
            rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 1, delay: 0.5 },
            opacity: { duration: 1, delay: 0.5 }
        }}
        style={{ 
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 25px 50px rgba(183, 28, 28, 0.3))'
        }}
    >
        {/* Phone Frame */}
        <div className="relative w-64 h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
            {/* Screen bezel */}
            <div className="w-full h-full bg-black rounded-[2.5rem] p-1 relative overflow-hidden">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gray-800 rounded-full z-10"></div>
                
                {/* Screen content */}
                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-50 to-white relative">
                    {/* Screen shine effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        style={{ skewX: '-15deg' }}
                    />
                    {children}
                </div>
            </div>
            
            {/* Home indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full"></div>
        </div>
        
        {/* Phone shadow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-[3rem] transform translate-y-4 blur-xl -z-10"></div>
    </motion.div>
);

// Interactive Feature Table Row Component
const FeatureRow = ({ feature, index, isActive, onHover, language }) => (
    <motion.div
        className={`group p-6 rounded-2xl transition-all duration-500 cursor-pointer border ${
            isActive 
                ? 'bg-gradient-to-r from-[#B71C1C]/10 to-[#D32F2F]/10 border-[#B71C1C]/30 shadow-xl' 
                : 'bg-white/80 border-gray-200/50 hover:bg-gradient-to-r hover:from-[#B71C1C]/5 hover:to-[#D32F2F]/5 hover:border-[#B71C1C]/20 hover:shadow-lg'
        }`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -5 }}
        onHoverStart={() => onHover(index)}
        onHoverEnd={() => onHover(-1)}
    >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Text Content */}
            <div className="space-y-3">
                <motion.div 
                    className="flex items-center gap-3"
                    animate={isActive ? { x: [0, 5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className={`p-2 rounded-xl ${feature.color} shadow-lg`}>
                        <div className="text-white">
                            {feature.icon}
                        </div>
                    </div>
                    <motion.h3 
                        className={`text-xl font-bold transition-colors duration-300 ${
                            isActive ? 'text-[#B71C1C]' : 'text-gray-800 group-hover:text-[#B71C1C]'
                        }`}
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {language === 'tamil' ? feature.title_tamil : feature.title}
                    </motion.h3>
                </motion.div>
                <motion.p 
                    className="text-gray-600 leading-relaxed"
                    animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    {language === 'tamil' ? feature.description_tamil : feature.description}
                </motion.p>
            </div>

            {/* Feature Image/Icon */}
            <div className="flex justify-center">
                <motion.div
                    className="relative"
                    animate={isActive ? { 
                        y: [0, -10, 0],
                        rotate: [0, 2, -2, 0],
                        scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    whileHover={{ 
                        scale: 1.2, 
                        rotate: 5,
                        transition: { duration: 0.3 }
                    }}
                >
                    <div className={`w-20 h-20 rounded-2xl ${feature.color} flex items-center justify-center shadow-2xl relative overflow-hidden`}>
                        <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{ 
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                        <div className="text-white text-3xl relative z-10">
                            {feature.icon}
                        </div>
                    </div>
                    
                    {/* Floating particles around the icon */}
                    {isActive && (
                        <>
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-[#B71C1C] rounded-full"
                                    animate={{
                                        x: [0, Math.cos(i * 2) * 30, 0],
                                        y: [0, Math.sin(i * 2) * 30, 0],
                                        opacity: [0, 1, 0],
                                        scale: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3
                                    }}
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        marginLeft: -4,
                                        marginTop: -4
                                    }}
                                />
                            ))}
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    </motion.div>
);

export default function PlaystoreTVPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [hoveredRow, setHoveredRow] = useState(-1);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % features.length);
        }, 4000);
        
        // Listen for language changes
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };
        
        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);

    const features = [
        {
            icon: <Tv className="w-8 h-8" />,
            title: "Live HD Streaming",
            title_tamil: "நேரலை HD ஸ்ட்ரீமிங்",
            description: "Experience crystal-clear live masses and devotional programs in high definition quality, bringing the sacred directly to your device.",
            description_tamil: "உயர் தெளிவுத்திறன் தரத்தில் நேரலை மாஸ்கள் மற்றும் பக்தி நிகழ்ச்சிகளை அனுபவியுங்கள், புனிதமானதை நேரடியாக உங்கள் சாதனத்திற்கு கொண்டு வருகிறது.",
            color: "bg-gradient-to-br from-blue-500 to-blue-600"
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "24/7 On-Demand Content",
            title_tamil: "24/7 தேவைக்கேற்ப உள்ளடக்கம்",
            description: "Access our extensive library of spiritual content, archived programs, and prayer sessions anytime, anywhere, at your convenience.",
            description_tamil: "ஆன்மீக உள்ளடக்கம், காப்பகப்படுத்தப்பட்ட நிகழ்ச்சிகள் மற்றும் பிரார்த்தனை அமர்வுகளின் விரிவான நூலகத்தை எந்த நேரத்திலும், எங்கிருந்தும், உங்கள் வசதிக்கு ஏற்ப அணுகவும்.",
            color: "bg-gradient-to-br from-purple-500 to-purple-600"
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Multi-Language Support",
            title_tamil: "பல மொழி ஆதரவு",
            description: "Enjoy content in Tamil and English languages, making spiritual connection accessible to a global Tamil Catholic community.",
            description_tamil: "தமிழ் மற்றும் ஆங்கில மொழிகளில் உள்ளடக்கத்தை அனுபவிக்கவும், உலகளாவிய தமிழ் கத்தோலிக்க சமூகத்திற்கு ஆன்மீக இணைப்பை அணுகக்கூடியதாக மாற்றுகிறது.",
            color: "bg-gradient-to-br from-green-500 to-green-600"
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Prayer & Booking Services",
            title_tamil: "பிரார்த்தனை & முன்பதிவு சேவைகள்",
            description: "Book prayer intentions, mass dedications, and spiritual services directly through the app with secure payment integration.",
            description_tamil: "பாதுகாப்பான கட்டண ஒருங்கிணைப்புடன் செயலி மூலம் நேரடியாக பிரார்த்தனை நோக்கங்கள், மாஸ் அர்ப்பணிப்புகள் மற்றும் ஆன்மீக சேவைகளை முன்பதிவு செய்யுங்கள்.",
            color: "bg-gradient-to-br from-red-500 to-red-600"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Secure & Private",
            title_tamil: "பாதுகாப்பான & தனிப்பட்ட",
            description: "Your spiritual journey is protected with enterprise-grade security, ensuring your privacy and data remain safe and secure.",
            description_tamil: "உங்கள் ஆன்மீக பயணம் நிறுவன-தர பாதுகாப்புடன் பாதுகாக்கப்படுகிறது, உங்கள் தனியுரிமை மற்றும் தரவு பாதுகாப்பாகவும் பாதுகாப்பாகவும் இருப்பதை உறுதி செய்கிறது.",
            color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Lightning Fast",
            title_tamil: "மின்னல் வேகம்",
            description: "Optimized for speed and performance, providing instant access to content with minimal loading times and smooth playback.",
            description_tamil: "வேகம் மற்றும் செயல்திறனுக்கு உகந்ததாக, குறைந்த ஏற்றும் நேரங்கள் மற்றும் மென்மையான பிளேபேக்குடன் உள்ளடக்கத்திற்கு உடனடி அணுகலை வழங்குகிறது.",
            color: "bg-gradient-to-br from-orange-500 to-orange-600"
        }
    ];

    const stats = [
        { 
            label: "Downloads", 
            label_tamil: "பதிவிறக்கங்கள்",
            value: "10K+", 
            icon: <Download className="w-5 h-5" /> 
        },
        { 
            label: "Rating", 
            label_tamil: "மதிப்பீடு",
            value: "4.8", 
            icon: <Star className="w-5 h-5" /> 
        },
        { 
            label: "Active Users", 
            label_tamil: "செயலில் உள்ள பயனர்கள்",
            value: "5K+", 
            icon: <Users className="w-5 h-5" /> 
        },
        { 
            label: "Countries", 
            label_tamil: "நாடுகள்",
            value: "15+", 
            icon: <Globe className="w-5 h-5" /> 
        }
    ];

    const translations = {
        page_title: language === 'tamil' ? 'Madha TV செயலி' : 'Madha TV App',
        page_subtitle: language === 'tamil' 
            ? 'எங்கள் அதிநவீன மொபைல் பயன்பாட்டின் மூலம் தெய்வீக இணைப்பை அனுபவியுங்கள். நேரலை மாஸ்களை ஸ்ட்ரீம் செய்யுங்கள், ஆன்மீக உள்ளடக்கத்தை அணுகவும், மேம்பட்ட தொழில்நுட்பத்துடன் உங்கள் நம்பிக்கை பயணத்தை வலுப்படுத்தவும்.'
            : 'Experience divine connection through our cutting-edge mobile application. Stream live masses, access spiritual content, and strengthen your faith journey with advanced technology.',
        download_button: language === 'tamil' ? 'Play Store இலிருந்து பதிவிறக்கவும்' : 'Download from Play Store',
        features_title: language === 'tamil' ? 'சக்திவாய்ந்த அம்சங்கள்' : 'Powerful Features',
        features_subtitle: language === 'tamil' 
            ? 'எங்கள் செயலியை உங்கள் ஆன்மீக பயணத்திற்கான சரியான துணையாக மாற்றும் மேம்பட்ட திறன்களைக் கண்டறியுங்கள்'
            : 'Discover the advanced capabilities that make our app the perfect companion for your spiritual journey',
        cta_title: language === 'tamil' 
            ? 'உங்கள் ஆன்மீக பயணத்தை மாற்ற தயாரா?'
            : 'Ready to Transform Your Spiritual Journey?',
        cta_subtitle: language === 'tamil'
            ? 'உலகெங்கிலும் உள்ள ஆயிரக்கணக்கான பக்தர்கள் தங்கள் தினசரி ஆன்மீக இணைப்புக்காக Madha TV-ஐ நம்புகிறார்கள்.'
            : 'Join thousands of devotees worldwide who trust Madha TV for their daily spiritual connection.',
        get_started: language === 'tamil' ? 'இப்போதே தொடங்குங்கள்' : 'Get Started Now'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/30 text-slate-800 relative overflow-hidden">
            <AIFloatingChat />

            {/* Light Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <Particle key={i} delay={i * 0.8} />
                ))}
                
                {/* Light animated background gradients */}
                <motion.div
                    className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-red-100/30 to-red-200/20 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 180],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1.1, 1, 1.1],
                        rotate: [180, 90, 0],
                        opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{ duration: 30, repeat: Infinity }}
                />
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section with 3D Mobile Frame */}
                <motion.section 
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <div className="relative inline-block mb-6">
                        <motion.h1 
                            className="text-4xl md:text-6xl my-16 font-bold bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] bg-clip-text text-transparent relative z-10"
                            animate={{ 
                                backgroundPosition: ['0%', '100%', '0%']
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                        >
                            {translations.page_title}
                        </motion.h1>
                        <motion.div
                            className="absolute -top-4 -left-8 w-20 h-20 bg-red-200/40 rounded-full blur-2xl -z-10"
                            animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute -bottom-4 -right-8 w-20 h-20 bg-blue-200/40 rounded-full blur-2xl -z-10"
                            animate={{ y: [0, 10, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        />
                    </div>

                    <motion.p 
                        className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {translations.page_subtitle}
                    </motion.p>

                    {/* 3D Mobile Frame with App Screenshot */}
                    <div className="flex justify-center mb-12">
                        <MobileFrame>
                            <motion.img
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b6a4b06fd_app2.jpg"
                                alt="Madha TV App Screenshot"
                                className="w-full h-full object-cover"
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: 1 }}
                            />
                        </MobileFrame>
                    </div>

                    {/* Stats Grid */}
                    <motion.div 
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100/50"
                                whileHover={{ 
                                    scale: 1.05, 
                                    rotate: [0, 1, -1, 0],
                                    transition: { rotate: { duration: 0.5 } }
                                }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                            >
                                <div className="flex items-center justify-center mb-3">
                                    <div className="p-3 bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] rounded-xl shadow-lg">
                                        <div className="text-white">
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                                <motion.div 
                                    className="text-3xl font-bold text-[#B71C1C] mb-2"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-slate-600 font-medium">
                                    {language === 'tamil' ? stat.label_tamil : stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Download Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 1.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.a
                            href="https://play.google.com/store/apps/details?id=com.madhatvapp.onlinetv&hl=en_IN&gl=US"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                            animate={{
                                boxShadow: [
                                    "0 0 0 0 rgba(183, 28, 28, 0.7)",
                                    "0 0 0 10px rgba(183, 28, 28, 0)",
                                    "0 0 0 20px rgba(183, 28, 28, 0)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] hover:from-[#D32F2F] hover:to-[#B71C1C] text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl"
                            >
                                <Download className="w-6 h-6 mr-3" />
                                {translations.download_button}
                                <ExternalLink className="w-5 h-5 ml-3" />
                            </Button>
                        </motion.a>
                    </motion.div>
                </motion.section>

                {/* Interactive Features Table */}
                <motion.section
                    className="mb-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                            {translations.features_title}
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            {translations.features_subtitle}
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <FeatureRow
                                key={index}
                                feature={feature}
                                index={index}
                                isActive={activeFeature === index || hoveredRow === index}
                                onHover={setHoveredRow}
                                language={language}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Call to Action with Light Animated Background */}
                <motion.section
                    className="text-center relative rounded-3xl p-12 shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 245, 245, 0.9) 0%, rgba(254, 242, 242, 0.95) 50%, rgba(255, 237, 237, 0.9) 100%)'
                    }}
                >
                    {/* Light animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-red-200/30 to-red-300/20 rounded-full blur-2xl"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, 50, 0],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-200/20 to-purple-200/15 rounded-full blur-2xl"
                            animate={{
                                x: [0, -80, 0],
                                y: [0, -60, 0],
                                scale: [1.2, 1, 1.2],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/15 rounded-full blur-xl"
                            animate={{
                                rotate: [0, 360],
                                scale: [0.8, 1.1, 0.8],
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    
                    <div className="relative z-10">
                        <motion.h3 
                            className="text-3xl md:text-4xl font-bold text-slate-800 mb-6"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {translations.cta_title}
                        </motion.h3>
                        <motion.p 
                            className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {translations.cta_subtitle}
                        </motion.p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <a
                                href="https://play.google.com/store/apps/details?id=com.madhatvapp.onlinetv&hl=en_IN&gl=US"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] hover:from-[#D32F2F] hover:to-[#B71C1C] text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-xl border-2 border-red-200"
                                >
                                    <Download className="w-6 h-6 mr-3" />
                                    {translations.get_started}
                                    <motion.div
                                        className="ml-3"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        →
                                    </motion.div>
                                </Button>
                            </a>
                        </motion.div>
                    </div>
                </motion.section>
            </main>
            <DynamicFooter />
        </div>
    );
}