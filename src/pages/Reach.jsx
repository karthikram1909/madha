import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
    Smartphone, Calendar, Download, Globe, Users, Shield, Tv2, 
    SatelliteDish, GitBranchPlus, Layers, Terminal, Apple, User, Star,
    Satellite, Radio, Signal, Zap, Target, PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

const StatItem = ({ icon, label, value, delay = 0 }) => (
    <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5, delay }}
    >
        <motion.div 
            className="flex-shrink-0 text-[#B71C1C]"
            whileHover={{ scale: 1.2, rotate: 15 }}
        >
            {icon}
        </motion.div>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-base font-semibold text-slate-800">{value}</p>
        </div>
    </motion.div>
);

const DthChannelCard = ({ name, number, index }) => (
    <motion.div
        className="bg-white rounded-2xl p-3 md:p-4 text-center shadow-lg transform transition-all duration-300 border border-slate-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            borderColor: '#B71C1C'
        }}
    >
        <p className="font-bold text-slate-700 text-base md:text-lg">{name}</p>
        <motion.p 
            className="font-mono text-2xl md:text-3xl text-[#B71C1C] font-bold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                delay: index * 0.2,
                ease: "easeInOut"
            }}
        >
            {number}
        </motion.p>
    </motion.div>
);

const AccessCode = ({ code, label }) => (
    <div>
        <h4 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">{label}</h4>
        <motion.div 
            className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl px-4 md:px-6 py-3 md:py-4 text-center shadow-2xl"
            animate={{ 
                boxShadow: [
                    "0 4px 15px rgba(0, 0, 0, 0.1)",
                    "0 8px 25px rgba(0, 0, 0, 0.3)",
                    "0 4px 15px rgba(0, 0, 0, 0.1)"
                ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
        >
            <span className="font-mono text-xl md:text-2xl lg:text-3xl tracking-widest font-bold text-yellow-400">{code}</span>
        </motion.div>
    </div>
);


export default function Reach() {
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

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

    const getText = (english, tamil) => {
        return language === 'tamil' ? tamil : english;
    };

    const handleAndroidDownload = () => {
      window.open('https://play.google.com/store/apps/details?id=com.madhatvapp.onlinetv&hl=en_IN&gl=US', '_blank');
    };
  
    const handleiOSDownload = () => {
      window.open('https://apps.apple.com/in/app/madha-tv/id879458299', '_blank');
    };

    const satelliteParams = [
        { 
          icon: Radio, 
          label: getText('Frequency', 'அதிர்வெண்'), 
          value: '4015', 
          unit: 'MHz',
          color: 'from-blue-500 to-cyan-500' // This color property will now be used
        },
        { 
          icon: Signal, 
          label: getText('Polarity', 'துருவமுனைப்பு'), 
          value: getText('Vertical', 'செங்குத்து'), 
          unit: '',
          color: 'from-green-500 to-emerald-500'
        },
        { 
          icon: Zap, 
          label: 'FEC', 
          value: '3/4', 
          unit: '',
          color: 'from-yellow-500 to-orange-500'
        },
        { 
          icon: Target, 
          label: getText('Symbol Rate', 'சிம்பல் வீதம்'), 
          value: '30000', 
          unit: 'Ksps',
          color: 'from-purple-500 to-pink-500'
        },
        { 
          icon: Globe, 
          label: getText('Position', 'நிலை'), 
          value: '66', 
          unit: getText('East', 'கிழக்கு'),
          color: 'from-red-500 to-rose-500'
        },
        { 
          icon: Satellite, 
          label: getText('Satellite', 'செயற்கைக்கோள்'), 
          value: 'Intelsat 17', 
          unit: '',
          color: 'from-indigo-500 to-blue-500'
        }
      ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <AIFloatingChat />
            
            {/* Hero Section - Mobile Responsive */}
            <div 
              className="relative bg-cover bg-center h-48 md:h-64" 
              style={{ backgroundImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/686069941b06c607ade1b1ab/54bc51c4a_photo-1519491050282-cf00c82424b4.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(1,1,25,0.8)] to-[rgba(93,6,6,0.3)]" />
              <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
                <motion.h1 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {getText('How to Reach Us', 'எங்களை எப்படி தொடர்பு கொள்வது')}
                </motion.h1>
                <motion.p 
                  className="text-base md:text-lg lg:text-xl text-red-100 max-w-2xl px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                   {getText('Connect with Madha TV through multiple channels', 'பல்வேறு வழிகளில் மத்தா டிவியுடன் தொடர்பு கொள்ளுங்கள்')}
                </motion.p>
              </div>
            </div>

            {/* Main Content Section - Mobile Responsive */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 -mt-12 md:-mt-16 relative z-10">

                {/* Mobile Apps Section - Mobile Responsive */}
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
                    {/* Android Card */}
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8"
                        initial={{ opacity: 0, y: 50, rotateX: -10 }}
                        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                            <div className="p-3 md:p-4 bg-green-100 rounded-xl md:rounded-2xl"><Smartphone className="w-6 h-6 md:w-8 md:h-8 text-green-600" /></div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{getText('Android App', 'ஆண்ட்ராய்டு பயன்பாடு')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-8 mb-6 md:mb-8">
                            <StatItem icon={<Calendar className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Updated', 'புதுப்பித்த')} value={getText('June 16, 2018', 'ஜூன் 16, 2018')} delay={0.1} />
                            <StatItem icon={<Layers className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Size', 'அளவு')} value="3.8 MB" delay={0.2} />
                            <StatItem icon={<Users className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Installs', 'நிறுவல்கள்')} value="50,000+" delay={0.3} />
                            <StatItem icon={<GitBranchPlus className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Version', 'பதிப்பு')} value="1.7.0" delay={0.4} />
                            <StatItem icon={<Shield className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Requires', 'தேவை')} value="Android 4.1+" delay={0.5} />
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={handleAndroidDownload} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 md:py-7 text-base md:text-lg rounded-xl md:rounded-2xl shadow-lg">
                                <Download className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3"/> {getText('Get in Android', 'Android இல் பெறவும்')}
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* iOS Card */}
                     <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8"
                        initial={{ opacity: 0, y: 50, rotateX: -10 }}
                        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                            <div className="p-3 md:p-4 bg-slate-200 rounded-xl md:rounded-2xl"><Apple className="w-6 h-6 md:w-8 md:h-8 text-slate-800" /></div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{getText('iOS App', 'iOS பயன்பாடு')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-8 mb-6 md:mb-8">
                            <StatItem icon={<Star className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Price', 'விலை')} value={getText('Free', 'இலவசம்')} delay={0.1} />
                            <StatItem icon={<Layers className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Category', 'வகை')} value={getText('Photo & Video', 'புகைப்பட & வீடியோ')} delay={0.2} />
                            <StatItem icon={<Calendar className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Updated', 'புதுப்பித்த')} value={getText('03 Jan 2015', 'ஜன 03 2015')} delay={0.3} />
                            <StatItem icon={<GitBranchPlus className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Version', 'பதிப்பு')} value="1.2" delay={0.4} />
                            <StatItem icon={<Download className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Size', 'அளவு')} value="12.4 MB" delay={0.5} />
                            <StatItem icon={<Globe className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Language', 'மொழி')} value={getText('English', 'ஆங்கிலம்')} delay={0.6} />
                            <StatItem icon={<User className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Developer', 'உருவாக்குபவர்')} value="Alfred Kumar" delay={0.7} />
                            <StatItem icon={<Terminal className="w-5 h-5 md:w-6 md:h-6"/>} label={getText('Compatibility', 'இணக்கம்')} value="iOS 6.0+" delay={0.8} />
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={handleiOSDownload} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-5 md:py-7 text-base md:text-lg rounded-xl md:rounded-2xl shadow-lg">
                                <Apple className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3"/> {getText('Get in IOS', 'IOS இல் பெறவும்')}
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
                
                

                {/* IPTV Section - Mobile Responsive */}
                <motion.div
                    className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 lg:p-12 mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center">
                        <div>
                            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                <div className="p-3 md:p-4 bg-red-100 rounded-xl md:rounded-2xl"><Tv2 className="w-6 h-6 md:w-8 md:h-8 text-red-600" /></div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{getText('IPTV - ROKU CHANNEL', 'IPTV - ரோகு சேனல்')}</h2>
                            </div>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl">{getText('The word of God to be made available to each and every home to have a direct communion with God day and night, to meditate the Word of God whenever they want, to worship God seated in their drawing room.', 'கடவுளின் வார்த்தை ஒவ்வொரு வீட்டிலும் கிடைக்க வேண்டும், இரவும் பகலும் கடவுளுடன் நேரடி தொடர்பு கொள்ள, அவர்கள் விரும்பும் போதெல்லாம் கடவுளின் வார்த்தையை தியானிக்க, அவர்களின் வரவேற்பறையில் அமர்ந்து கடவுளை வழிபட வேண்டும்.')}</p>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mt-3 md:mt-4">{getText('With Madha Tv Channel you can watch your local television stations through your Roku. Madha Tv Channel is what you have been looking for.', 'மாதா டிவி சேனல் மூலம் நீங்கள் உங்கள் ரோகு மூலம் உங்கள் உள்ளூர் தொலைக்காட்சி நிலையங்களைப் பார்க்கலாம். மாதா டிவி சேனல் நீங்கள் தேடிக்கொண்டிருந்தது.')}</p>
                        </div>
                        <div className="space-y-4 md:space-y-6">
                            <AccessCode code="S5N7YR" label={getText('Worldwide Access Code:', 'உலகளாவிய அணுகல் குறியீடு:')} />
                            <AccessCode code="6Q5EF" label={getText('USA & Canada Private Channel:', 'அமெரிக்கா & கனடா தனியார் சேனல்:')} />
                        </div>
                    </div>
                </motion.div>

                {/* DTH Section - Mobile Responsive */}
                <motion.div style={{width:"300px", position:"absolu"}}
                   className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 lg:p-12 mb-12 md:mb-16"
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, amount: 0.2 }}
                   transition={{ duration: 0.8 }}
                >
                   <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                       <div className="p-3 md:p-4 bg-blue-100 rounded-xl md:rounded-2xl"><SatelliteDish className="w-6 h-6 md:w-8 md:h-8 text-blue-600" /></div>
                       <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{getText('DTH Channels', 'DTH சேனல்கள்')}</h2>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                      <DthChannelCard name="AIRTEL" number="816" index={0} />
                      <DthChannelCard name="DISH TV" number="599" index={1} />
                      <DthChannelCard name="SUN DIRECT" number="458" index={2} />
                      <DthChannelCard name="TATA SKY" number="1590" index={3} />
                      <DthChannelCard name="VIDEOCON" number="3017" index={4} />
                   </div>
                </motion.div>

                {/* DTH Customer Care Section - Mobile Responsive */}
                <motion.div
                   className="bg-gradient-to-br from-white via-blue-50 to-purple-50 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-12 mb-12 md:mb-16 border border-slate-200"
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, amount: 0.2 }}
                   transition={{ duration: 0.8 }}
                >
                   <div className="text-center mb-8 md:mb-10">
                       <motion.div
                           className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] rounded-2xl md:rounded-3xl shadow-xl mb-4"
                           initial={{ scale: 0, rotate: -180 }}
                           whileInView={{ scale: 1, rotate: 0 }}
                           viewport={{ once: true }}
                           transition={{ duration: 0.6, type: "spring" }}
                       >
                           <PhoneCall className="w-8 h-8 md:w-10 md:h-10 text-white" />
                       </motion.div>
                       <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                           {getText('DTH Customer Care', 'DTH வாடிக்கையாளர் சேவை')}
                       </h2>
                       <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
                           {getText('Contact your DTH provider for support and assistance', 'ஆதரவு மற்றும் உதவிக்காக உங்கள் DTH வழங்குநரைத் தொடர்பு கொள்ளுங்கள்')}
                       </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                       {[
                           { name: 'SUNDIRECT DTH', number: '18001237575', gradient: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50' },
                           { name: 'AIRTEL DTH', number: '4444448080', gradient: 'from-red-500 to-pink-500', bg: 'from-red-50 to-pink-50' },
                           { name: 'TATA PLAY DTH', number: '18002086633', gradient: 'from-blue-500 to-indigo-500', bg: 'from-blue-50 to-indigo-50' },
                           { name: 'VIDEOCON DTH', number: '18002122212', gradient: 'from-purple-500 to-violet-500', bg: 'from-purple-50 to-violet-50' }
                       ].map((provider, index) => (
                           <motion.div
                               key={provider.name}
                               className={`relative bg-gradient-to-br ${provider.bg} rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 overflow-hidden group`}
                               initial={{ opacity: 0, y: 30 }}
                               whileInView={{ opacity: 1, y: 0 }}
                               viewport={{ once: true, amount: 0.8 }}
                               transition={{ duration: 0.5, delay: index * 0.1 }}
                               whileHover={{ scale: 1.03, y: -5 }}
                           >
                               <div className={`absolute inset-0 bg-gradient-to-br ${provider.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                               <div className="relative z-10">
                                   <div className="flex items-center gap-3 mb-4">
                                       <div className={`p-2 md:p-3 bg-gradient-to-br ${provider.gradient} rounded-lg shadow-md`}>
                                           <SatelliteDish className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                       </div>
                                       <h3 className="font-bold text-slate-800 text-base md:text-lg">{provider.name}</h3>
                                   </div>

                                   <a 
                                       href={`tel:${provider.number}`}
                                       className="flex items-center gap-3 p-3 md:p-4 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-300 shadow-sm group/link"
                                   >
                                       <div className={`p-2 bg-gradient-to-br ${provider.gradient} rounded-lg shadow-md group-hover/link:scale-110 transition-transform duration-300`}>
                                           <PhoneCall className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                       </div>
                                       <div className="flex-1">
                                           <p className="text-xs text-slate-500 mb-1">{getText('Call Now', 'இப்போது அழைக்கவும்')}</p>
                                           <p className="font-mono text-lg md:text-xl font-bold text-slate-800 tracking-wide">
                                               {provider.number}
                                           </p>
                                       </div>
                                       <motion.div
                                           animate={{ x: [0, 5, 0] }}
                                           transition={{ duration: 1.5, repeat: Infinity }}
                                           className="opacity-0 group-hover/link:opacity-100 transition-opacity"
                                       >
                                           <PhoneCall className="w-5 h-5 text-slate-400" />
                                       </motion.div>
                                   </a>
                               </div>
                           </motion.div>
                       ))}
                   </div>
                </motion.div>

                 {/* Satellite Frequency Section - Mobile Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8 }}
                >
                    <Card 
                        className="relative bg-cover bg-center text-white overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8"
                        style={{ backgroundImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/686069941b06c607ade1b1ab/f37fc2665_sat.jpg')" }}
                    >
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        
                        <div className="relative z-10">
                             <CardHeader className="text-center pb-6 md:pb-8">
                                <motion.div
                                    className="flex justify-center mb-4 md:mb-6"
                                    initial={{ scale: 0, rotate: -180 }}
                                    whileInView={{ scale: 1, rotate: 0 }}
                                    viewport={{ once: true, amount: 0.8 }}
                                    transition={{ duration: 1, type: "spring" }}
                                >
                                    <div className="relative">
                                        <Satellite className="w-12 h-12 md:w-16 md:h-16 text-cyan-400" />
                                        <motion.div
                                            className="absolute inset-0"
                                            animate={{
                                            boxShadow: [
                                                '0 0 0 0 rgba(6, 182, 212, 0.4)',
                                                '0 0 0 20px rgba(6, 182, 212, 0)',
                                            ],
                                            }}
                                            transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            }}
                                        />
                                    </div>
                                </motion.div>
                                
                                <motion.h2
                                    className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
                                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                                    viewport={{ once: true, amount: 0.8 }} transition={{ delay: 0.5 }}
                                >
                                    {getText('Satellite Frequency', 'செயற்கைக்கோள் அதிர்வெண்')}
                                </motion.h2>
                                
                                <motion.p
                                    className="text-base md:text-lg lg:text-xl text-gray-200"
                                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                                    viewport={{ once: true, amount: 0.8 }} transition={{ delay: 0.7 }}
                                >
                                    {getText('Madha Television Satellite Frequency', 'மத்தா தொலைக்காட்சி செயற்கைக்கோள் அதிர்வெண்')}
                                </motion.p>
                                
                                <motion.p
                                    className="text-sm md:text-base lg:text-lg text-gray-300 mt-3 md:mt-4"
                                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                                    viewport={{ once: true, amount: 0.8 }} transition={{ delay: 0.9 }}
                                >
                                    {getText('Downlink Parameters are as follows:', 'டவுன்லிங்க் அளவுருக்கள் பின்வருமாறு:')}
                                </motion.p>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {satelliteParams.map((param, index) => (
                                        <motion.div
                                            key={param.label}
                                            className="h-full"
                                            initial={{ opacity: 0, y: 50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.8 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                        >
                                            <Card className="bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300 h-full transform hover:-translate-y-2">
                                                <CardContent className="p-4 md:p-6 text-center flex flex-col justify-center items-center h-full">
                                                    <motion.div
                                                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 md:mb-4 bg-gradient-to-br ${param.color}`}
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
                                                    >
                                                        <param.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                                    </motion.div>
                                                    <h3 className="text-lg md:text-xl font-bold mb-2 text-white">
                                                        {param.label}
                                                    </h3>
                                                    <div className="text-base md:text-lg font-medium text-gray-200">
                                                        {param.value} <span className="text-xs md:text-sm font-normal text-gray-300">{param.unit}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                </motion.div>
            </div>
            
            <DynamicFooter />
        </div>
    );
}