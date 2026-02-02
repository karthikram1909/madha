import React, { useState, useEffect, useRef } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';
import { motion, useInView } from "framer-motion";
import { ExternalLink, Heart } from 'lucide-react';
import PageBanner from "../components/website/PageBanner";

const images = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/341b211c9_madha1-removebg-preview.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/047146285_ChatGPT_Image_Aug_4__2025__04_48_41_PM-removebg-preview1.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c2505ae97_madhat2-removebg-preview.png'
];

const RotatingImages = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-96 flex items-center justify-center">
            {images.map((src, index) => (
                <motion.img
                    key={src}
                    src={src}
                    alt="Our Mission"
                    className="absolute w-auto h-full object-contain"
                    initial={{ opacity: 0, scale: 0.8, rotate: (Math.random() - 0.5) * 20 }}
                    animate={{
                        opacity: index === currentImageIndex ? 1 : 0,
                        scale: index === currentImageIndex ? 1 : 0.8,
                        rotate: index === currentImageIndex ? 0 : (Math.random() - 0.5) * 20,
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
            ))}
        </div>
    );
};

// Particle Glow Component
const ParticleGlow = ({ particleCount = 30 }) => {
    const particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 8 + 12,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.2,
        color: Math.random() > 0.5 ? '#B71C1C' : '#D32F2F'
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full filter blur-sm"
                    style={{
                        left: `${particle.x}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        opacity: particle.opacity
                    }}
                    initial={{
                        y: '100vh',
                        x: `${Math.random() * 100 - 50}px`
                    }}
                    animate={{
                        y: ['-20vh', '120vh'],
                        x: [
                            `${Math.random() * 50 - 25}px`,
                            `${Math.random() * 50 - 25}px`,
                            `${Math.random() * 50 - 25}px`
                        ],
                        opacity: [0, particle.opacity, particle.opacity, 0],
                        scale: [0.5, 1, 0.8, 0.5]
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
            
            {/* Additional floating particles for variety */}
            {Array.from({ length: Math.floor(particleCount / 2) }, (_, i) => (
                <motion.div
                    key={`float-${i}`}
                    className="absolute rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        backgroundColor: Math.random() > 0.5 ? '#B71C1C' : '#D32F2F',
                        opacity: Math.random() * 0.3 + 0.1,
                        filter: 'blur(1px)'
                    }}
                    animate={{
                        x: [
                            `${Math.random() * 30 - 15}px`,
                            `${Math.random() * 30 - 15}px`,
                            `${Math.random() * 30 - 15}px`
                        ],
                        y: [
                            `${Math.random() * 30 - 15}px`,
                            `${Math.random() * 30 - 15}px`,
                            `${Math.random() * 30 - 15}px`
                        ],
                        opacity: [0.1, 0.4, 0.1],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: Math.random() * 6 + 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

// Enhanced Particle Glow Component with upward movement for Founder section
const UpwardParticleGlow = ({ particleCount = 25 }) => {
    const particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 8,
        opacity: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.6 ? '#B71C1C' : '#D32F2F'
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        filter: 'blur(0.5px)',
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`
                    }}
                    initial={{
                        y: '110vh',
                        opacity: 0,
                        scale: 0.5
                    }}
                    animate={{
                        y: ['-10vh'],
                        opacity: [0, particle.opacity, particle.opacity * 0.8, 0],
                        scale: [0.5, 1, 0.8, 0.3],
                        x: [
                            0,
                            `${(Math.random() - 0.5) * 20}px`,
                            `${(Math.random() - 0.5) * 15}px`,
                            0
                        ]
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

// Animated blobs for testimonials background
const AnimatedBlobs = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Left side blobs */}
            <motion.div
                className="absolute -left-20 top-1/4 w-40 h-40 rounded-full opacity-20"
                style={{
                    background: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)',
                    filter: 'blur(2px)'
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    x: [-20, -10, -20],
                    y: [0, -20, 0],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute -left-10 bottom-1/4 w-28 h-28 rounded-full opacity-15"
                style={{
                    background: 'linear-gradient(225deg, #D32F2F 0%, #B71C1C 100%)',
                    filter: 'blur(1px)'
                }}
                animate={{
                    scale: [1.1, 0.9, 1.1],
                    x: [-10, 5, -10],
                    y: [0, 15, 0],
                    rotate: [360, 180, 0]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            
            {/* Right side blobs */}
            <motion.div
                className="absolute -right-16 top-1/3 w-36 h-36 rounded-full opacity-18"
                style={{
                    background: 'linear-gradient(45deg, #B71C1C 0%, #D32F2F 100%)',
                    filter: 'blur(2px)'
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    x: [20, 10, 20],
                    y: [0, 25, 0],
                    rotate: [0, -180, -360]
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute -right-8 bottom-1/3 w-24 h-24 rounded-full opacity-12"
                style={{
                    background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                    filter: 'blur(1.5px)'
                }}
                animate={{
                    scale: [0.8, 1.2, 0.8],
                    x: [15, -5, 15],
                    y: [0, -18, 0],
                    rotate: [-360, -180, 0]
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

const WhatWeAreSection = ({ language }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.7,
                ease: "easeOut"
            }
        }
    };
    
    const translations = {
        title: language === 'tamil' ? 'நாங்கள் யார்' : 'WHAT WE ARE',
        content: language === 'tamil' ? [
            'தமிழ்நாடு பிஷப்ஸ் கவுன்சில், இரண்டாம் வாடிகன் கவுன்சிலின் அழைப்பிற்கு பதிலளிக்கும் விதமாக, சுவிசேஷ பிரச்சாரம் மற்றும் மனித முன்னேற்றத்திற்கான முக்கிய கருவியாக வெகுஜன தகவல் தொடர்புக்கு அதிக முன்னுரிமை அளிக்க, சமூக தகவல் தொடர்பு சங்கத்திற்கான ஆணையத்தை நிறுவியது. 1974 இல் தமிழ்நாடு பிஷப்ஸ் எடுத்த முடிவு, 1976 ஆம் ஆண்டு ஆகஸ்ட் 6 அன்று மைலாப்பூர், சென்னையில் உள்ள லூஸ் சர்ச் ரோடில் பிராந்திய தகவல் தொடர்பு மையமான சான்தோம் கம்யூனிகேஷன் சென்டர் திறக்கப்பட்டபோது பலன் தந்தது.',
            'சான்தோம் கம்யூனிகேஷன் சென்டர் தமிழ்நாடு மற்றும் உலகம் முழுவதும் தமிழ் பேசும் கத்தோலிக்க மக்களுக்கான கத்தோலிக்க ஊடகங்களின் மையமாக மாறியது, கிறிஸ்துவின் நற்செய்தியில் வேரூன்றிய ஒழுக்க, சமூக மற்றும் நெறிமுறை மதிப்புகளை ஊடகம் மற்றும் ஊடக கல்வியின் மூலம் ஊக்குவிக்கிறது. இது ரேடியோ வெரிடாஸ், ரேடியோ வாடிகன் மற்றும் அகில இந்திய வானொலிக்கான வழக்கமான நிகழ்ச்சிகளை தயாரித்தது, உலகம் முழுவதும் தமிழ் பேசும் மக்களை சென்றடைந்தது. இந்த முயற்சிகள் மூலம், மையம் மறைக்கல்வி, சுவிசேஷப் பிரச்சாரம் மற்றும் சமூக மேம்பாட்டிற்கு பெரும் பங்களிப்பை வழங்கியது, அதே நேரத்தில் உண்மை, நீதி, சமாதானம், மனித விடுதலை, உரையாடல் மற்றும் சகவாழ்விற்கான ஒரு தீர்க்கதரிசன குரலாகவும் செயல்பட்டது.',
            '27 ஜனவரி 2012 அன்று, தமிழ்நாடு பிஷப்ஸ் கவுன்சில் ஒரு கத்தோலிக்க செயற்கைக்கோள் தொலைக்காட்சி சேனலை தொடங்குவதற்கான வரலாற்று முடிவை எடுத்தது, அதற்கு Madha TV (Madha என்றால் பாக்கியவதி கன்னி மேரி) என்று பெயரிடப்பட்டது, அதை பாக்கியவதி கன்னி மேரிக்கு அர்ப்பணித்தது. இந்த பார்வையை சாத்தியமாக்க, மற்றும் தகவல் மற்றும் ஒளிபரப்பு அமைச்சகத்தின் தேவைகளுக்கு இணங்க, Madha Media Renaissance ஒரு தனியார் லிமிடெட் நிறுவனமாக நிறுவப்பட்டது. பிஷப்ஸ் மற்றும் தமிழ்நாடு முழுவதும் உள்ள குருக்கள், மதத்தினர் மற்றும் விசுவாசிகள் ஆகியோரின் ஒருங்கிணைந்த முயற்சிகள் மற்றும் அர்ப்பணிப்புடன், Madha TV 11 பிப்ரவரி 2014 அன்று அதிகாரப்பூர்வமாக தொடங்கப்பட்டது - இது இந்தியாவில் முதல் கத்தோலிக்க சேனலாகும்.',
            'பேராயர் மாண்புமிகு டாக்டர் ஜார்ஜ் அந்தோனிசாமி Madha TV-யின் தலைவராக பணியாற்றுகிறார், மேலும் நிதி விஷயங்களில் பிஷப் மாண்புமிகு டாக்டர் ஏ. சிங்காரோயன் ஆதரவு அளிக்கிறார். அருட்தந்தை டாக்டர் டேவிட் அரோக்கியம், தலைமை நிர்வாக அதிகாரி, Madha TV-யின் தொடக்கத்திலிருந்தே அதன் அடித்தளமான மற்றும் வழிகாட்டும் சக்தியாக இருந்து வருகிறார்.',
            'தயாரிப்பு, பின் தயாரிப்பு, தொழில்நுட்ப செயல்பாடுகள், நிதி, நிர்வாகம், விளம்பரம் மற்றும் சமூக ஊடகங்களுக்கான பிரத்யேக துறைகளுடன் - தமிழ்நாட்டின் வெவ்வேறு மறைமாவட்டங்களைச் சேர்ந்த நான்கு குருக்களால் ஒருங்கிணைக்கப்பட்டு - Madha TV சர்ச்சின் கூட்டு பணியாக செயல்படுகிறது. கூடுதலாக, மூன்று சகோதரிகள் பல்வேறு துறைகளில் தங்கள் சேவையை வழங்குகின்றனர், மேலும் சுமார் 75 அர்ப்பணிப்புள்ள ஊழியர்கள் தலைமை அலுவலகத்தில் மட்டும் பணிபுரிகின்றனர், அர்ப்பணிப்புடன் பணியை முன்னெடுத்துச் செல்கின்றனர்.',
            'Madha TV உண்மையில் சர்ச்சின் ஒரு கூட்டு பணி. தமிழ்நாட்டின் ஒவ்வொரு மறைமாவட்டத்திலும் இது மையங்களைக் கொண்டுள்ளது, ஒவ்வொன்றும் ஒரு மறைமாவட்ட ஒருங்கிணைப்பாளருடன். இந்த மையங்களில் உள்ளூர் நிகழ்ச்சிகள் தயாரிக்கப்பட்டு தொலைக்காட்சிக்காக தலைமை அலுவலகத்திற்கு அனுப்பப்படுகின்றன. இந்த தனித்துவமான மாதிரி Madha TV-ஐ ஒரு ஒருங்கிணைக்கும் தளமாக மாற்றுகிறது, தமிழ்நாட்டின் அனைத்து கத்தோலிக்க மறைமாவட்டங்களையும் ஒன்றிணைத்து உலகம் முழுவதும் உள்ள தமிழ் பேசும் கத்தோலிக்கர்களை இணைக்கிறது.',
            'Madha TV-யின் ஊடக பணியில் கைகோர்த்து, ஒவ்வொரு வீட்டிலும் கடவுளின் அன்பு மற்றும் சமாதானத்தின் ஆட்சியை கொண்டு வர உதவுவோம்.'
        ] : [
            'The Tamil Nadu Bishops\' Council, responding to the call of the Second Vatican Council to give high priority to Mass Communication as a vital instrument of evangelization and human promotion, established the Commission for Social Communications Society. The decision taken by the Tamil Nadu Bishops in 1974 bore fruit on August 6, 1976, when the Santhome Communication Centre, the Regional Communications Centre, was inaugurated at Luz Church Road, Mylapore, Chennai.',
            'The Santhome Communication Centre became the hub for Catholic media in Tamil Nadu and Tamil-speaking Catholic people over the globe, promoting moral, social, and ethical values through media and media education, rooted in the Gospel of Christ. It produced regular programs for Radio Veritas, Radio Vatican, and All India Radio, reaching Tamil-speaking populations worldwide. Through these efforts, the Centre contributed greatly to catechesis, evangelization, and social development, while also serving as a prophetic voice for truth, justice, peace, human liberation, dialogue, and co-existence.',
            'On 27th January 2012, the Tamil Nadu Bishops\' Council made a historic decision to launch a Catholic satellite television channel, christened Madha TV (Madha means Blessed Virgin Mother), dedicating it to the Blessed Virgin Mary. To make this vision possible, and in line with the requirements of the Ministry of Information and Broadcasting, Madha Media Renaissance was established as a private limited company. With the united efforts of the Bishops and the dedicated support of priests, religious, and faithful across Tamil Nadu, Madha TV was officially launched on 11th February 2014—a first-of-its-kind Catholic channel in India.',
            'Archbishop Most Rev. Dr. George Antonysamy serves as the Chairman of Madha TV and is supported by Bishop Most Rev. Dr. A. Singaroyan in financial matters. Rev. Dr. David Arockiam, the CEO, has been the foundational force and the guiding force of Madha TV since its inception.',
            'With dedicated departments for production, post-production, technical operations, finance, administration, promotion, and social media—coordinated by four priests from different dioceses of Tamil Nadu—Madha TV runs as a collaborative mission of the Church. In addition, three sisters contribute their service in various departments, and nearly 75 committed staff members work at the head office alone, carrying the mission forward with dedication.',
            'Madha TV is truly a collaborative mission of the Church. It has centres in every diocese of Tamil Nadu, each with a diocesan coordinator. Local programmes are produced in these centres and sent to the head office for telecast. This unique model makes Madha TV a unifying platform, bringing together all the Catholic dioceses of Tamil Nadu and connecting Tamil-speaking Catholics across the globe.',
            'Let us join hands in the Media Mission of Madha TV and help bring God\'s reign of love and peace into every home.'
        ]
    };

    return (
        <motion.section
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="py-8 md:py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 relative"
        >
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <motion.div variants={itemVariants} className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">{translations.title}</h2>
                    <div className="w-24 h-1 bg-red-600 mx-auto"></div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="prose prose-sm md:prose-lg max-w-none text-slate-700 space-y-4 md:space-y-6 text-justify">
                    {translations.content.slice(0, -1).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                    <p className="font-semibold text-center text-base md:text-lg text-red-700 italic">
                        {translations.content[translations.content.length - 1]}
                    </p>
                </motion.div>
            </div>
        </motion.section>
    );
};

const FellowshipSection = ({ language }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    const translations = {
        title: language === 'tamil' ? 'உலகளாவிய கூட்டுறவு' : 'Global Fellowship',
        subtitle: language === 'tamil' 
            ? 'உலகம் முழுவதும் எங்கள் பதிவு செய்யப்பட்ட கூட்டுறவு அமைப்புகள் மூலம் எங்கள் சர்வதேச ஊடக பணியை ஆதரிக்கவும்.'
            : 'Support our international media mission through our registered fellowship bodies worldwide.',
        donateButton: language === 'tamil' ? 'நன்கொடை' : 'Donate'
    };

    const fellowshipCards = [
        {
            title: "Madha Media Fellowship Switzerland",
            title_tamil: "Madha Media Fellowship சுவிட்சர்லாந்து",
            content: "Madha TV is an international family. We have viewers and supporters from across the globe. We have registered bodies in different countries to participate in this official media mission of the Tamil Catholic Church.",
            content_tamil: "Madha TV ஒரு சர்வதேச குடும்பம். உலகம் முழுவதும் இருந்து எங்களுக்கு பார்வையாளர்கள் மற்றும் ஆதரவாளர்கள் உள்ளனர். தமிழ் கத்தோலிக்க சர்ச்சின் இந்த அதிகாரப்பூர்வ ஊடக பணியில் பங்கேற்க பல்வேறு நாடுகளில் பதிவு செய்யப்பட்ட அமைப்புகள் உள்ளன.",
            link: "https://madhamediafellowship.com/donate-switzerland/"
        },
        {
            title: "Madha Media Fellowship Canada", 
            title_tamil: "Madha Media Fellowship கனடா",
            content: "Madha TV is an international family. We have viewers and supporters from across the globe. We have registered bodies in different countries to participate in this official media mission of the Tamil Catholic Church.",
            content_tamil: "Madha TV ஒரு சர்வதேச குடும்பம். உலகம் முழுவதும் இருந்து எங்களுக்கு பார்வையாளர்கள் மற்றும் ஆதரவாளர்கள் உள்ளனர். தமிழ் கத்தோலிக்க சர்ச்சின் இந்த அதிகாரப்பூர்வ ஊடக பணியில் பங்கேற்க பல்வேறு நாடுகளில் பதிவு செய்யப்பட்ட அமைப்புகள் உள்ளன.",
            link: "https://madhamediafellowship.com/donate-canada/"
        },
        {
            title: "Madha Media Fellowship USA",
            title_tamil: "Madha Media Fellowship அமெரிக்கா",
            content: "Madha TV is an international family. We have viewers and supporters from across the globe. We have registered bodies in different countries to participate in this official media mission of the Tamil Catholic Church.",
            content_tamil: "Madha TV ஒரு சர்வதேச குடும்பம். உலகம் முழுவதும் இருந்து எங்களுக்கு பார்வையாளர்கள் மற்றும் ஆதரவாளர்கள் உள்ளனர். தமிழ் கத்தோலிக்க சர்ச்சின் இந்த அதிகாரப்பூர்வ ஊடக பணியில் பங்கேற்க பல்வேறு நாடுகளில் பதிவு செய்யப்பட்ட அமைப்புகள் உள்ளன.",
            link: "https://madhamediafellowship.com/donate/"
        },
        {
            title: "Madha Media Fellowship Norway",
            title_tamil: "Madha Media Fellowship நார்வே",
            content: "Madha TV is an international family. We have viewers and supporters from across the globe. We have registered bodies in different countries to participate in this official media mission of the Tamil Catholic Church.",
            content_tamil: "Madha TV ஒரு சர்வதேச குடும்பம். உலகம் முழுவதும் இருந்து எங்களுக்கு பார்வையாளர்கள் மற்றும் ஆதரவாளர்கள் உள்ளனர். தமிழ் கத்தோலிக்க சர்ச்சின் இந்த அதிகாரப்பூர்வ ஊடக பணியில் பங்கேற்க பல்வேறு நாடுகளில் பதிவு செய்யப்பட்ட அமைப்புகள் உள்ளன.",
            link: "https://madhamediafellowship.com/donate-norway/"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 100 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.6, -0.05, 0.01, 0.99]
            }
        }
    };

    return (
        <section
            ref={ref}
            className="py-12 md:py-20 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/50 relative overflow-hidden"
        >
            {/* Particle Glow Animation Background */}
            <ParticleGlow particleCount={35} />
            
            {/* Animated background elements */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#B71C1C]/10 to-[#D32F2F]/5 rounded-full blur-3xl"
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-400/10 to-purple-400/5 rounded-full blur-3xl"
                animate={{ 
                    scale: [1.1, 0.9, 1.1],
                    rotate: [0, -90, 0]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <motion.div 
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">{translations.title}</h2>
                    <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        {translations.subtitle}
                    </p>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {fellowshipCards.map((card, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                        >
                            <motion.div
                                className="h-full group"
                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            >
                                <Card className="h-full bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-2xl transition-all duration-300 border border-white/50 relative overflow-hidden">
                                    <motion.div 
                                        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#B71C1C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        animate={{
                                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    />
                                    <CardContent className="p-6 md:p-8 h-full flex flex-col relative z-10">
                                        <div className="flex items-center gap-4 mb-4 md:mb-6">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                                <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 line-clamp-2 group-hover:text-[#B71C1C] transition-colors">
                                            {language === 'tamil' ? card.title_tamil : card.title}
                                        </h3>
                                        
                                        <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4 md:mb-6 flex-grow">
                                            {language === 'tamil' ? card.content_tamil : card.content}
                                        </p>
                                      
                                        <motion.a
                                            href={card.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/btn mt-auto"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button className="w-full bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] hover:from-[#D32F2F] hover:to-[#B71C1C] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                                                <span>{translations.donateButton}</span>
                                                <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </motion.a>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default function Aboutformobileview() {
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

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

  const loadContent = async () => {
    try {
      const allContent = await WebsiteContent.filter({ 
        section: 'about', 
        is_active: true 
      });
      
      const contentMap = allContent.reduce((acc, item) => {
        acc[item.content_key] = item.content_value;
        return acc;
      }, {});
      
      setContent(contentMap);
    } catch (error) {
      console.error("Error loading about content:", error);
    }
    setIsLoading(false);
  };

  const translations = {
    missionTitle: language === 'tamil' ? 'நாங்கள் என்ன செய்கிறோம்' : 'What We Do',
    missionSubtitle: language === 'tamil' ? 'எங்கள் பணி' : 'Our Mission',
    missionText: language === 'tamil'
      ? '"இந்தியா மற்றும் உலகம் முழுவதும் உள்ள ஒவ்வொரு குடும்பத்திலும் ஊடக பணி மூலம் கடவுளின் இராஜ்யத்தின் செய்தியை தொடர்புகொள்வது."'
      : '"To communicate the message of the Kingdom of God in every family in India and all over the world through media mission."'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* <AIFloatingChat /> */}
      
       <PageBanner 
        pageKey="about"
        fallbackTitle="About Madha TV"
        fallbackDescription="Learn about our mission to spread faith and bring spiritual content to families worldwide"
        fallbackImage="https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=2940&auto=format&fit=crop"
      /> 
      
      {/* What We Do Section - Mobile Responsive FIXED */}
      <div 
        className="bg-cover bg-center py-8 md:py-16"
        style={{ backgroundImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a59035a26_ChatGPTImageAug8202512_52_29PM.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              {/* Image Container - Proper height on mobile */}
              <div className="order-1 h-80 md:h-96 lg:h-full lg:min-h-[400px] flex items-center justify-center">
                <RotatingImages />
              </div>
              {/* Text Container - Appears below image on mobile */}
              <div className="order-2 p-6 md:p-8 lg:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">{translations.missionTitle}</h2>
                <h3 className="text-lg md:text-xl font-semibold text-[#B71C1C] mb-3 md:mb-4">{translations.missionSubtitle}</h3>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-4xl">
                  {translations.missionText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What We Are Section */}
      <WhatWeAreSection language={language} />

      {/* Fellowship Section */}
      <FellowshipSection language={language} />
      <DynamicFooter />
    </div>
  );
}