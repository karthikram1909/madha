import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Shield, 
    Database, 
    Cookie, 
    Users, 
    Lock, 
    ExternalLink, 
    Baby, 
    RefreshCw, 
    Phone,
    FileText,
    Eye,
    CheckCircle
} from 'lucide-react';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

const PolicySection = ({ children, icon: Icon, title, index }) => (
    <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }}
        whileHover={{ scale: 1.02 }}
    >
        <motion.div 
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 relative overflow-hidden"
            whileHover={{ 
                y: -5,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                borderColor: 'rgba(185,28,28,0.3)'
            }}
            transition={{ duration: 0.3 }}
        >
            {/* Animated background highlight */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-blue-50/50 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
            
            <div className="p-8 relative z-10">
                <motion.div 
                    className="flex items-center gap-4 mb-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                   <motion.div 
    className="p-3 bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] rounded-xl text-white shadow-lg"
    whileHover={{ 
        rotate: 360,
        scale: 1.1,
        boxShadow: '0 0 30px rgba(185,28,28,0.5)'
    }}
    animate={{
        boxShadow: [
            '0 4px 15px rgba(185,28,28,0.3)',
            '0 8px 25px rgba(185,28,28,0.5)',
            '0 4px 15px rgba(185,28,28,0.3)'
        ]
    }}
    transition={{ 
        duration: 0.5,
        boxShadow: { duration: 2, repeat: Infinity },
        hover: { duration: 0.5 }
    }}
>
    <Icon className="w-6 h-6" />
</motion.div>

                    <motion.h2
                        className="text-2xl font-bold text-[#B71C1C]"
                        whileHover={{ 
                            color: '#D32F2F',
                            textShadow: '0 2px 10px rgba(185,28,28,0.3)'
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {title}
                    </motion.h2>
                </motion.div>
                <motion.div 
                    className="prose prose-lg max-w-none text-slate-600 space-y-4"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </div>
        </motion.div>
    </motion.div>
);

const HighlightedText = ({ children, type = "link" }) => {
    const styles = {
        link: "text-[#B71C1C] hover:text-[#D32F2F] font-semibold underline cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-red-50 px-1 py-0.5 rounded",
        important: "bg-gradient-to-r from-red-100 to-red-200 px-2 py-1 rounded-lg font-semibold text-red-800 border border-red-300"
    };

    return (
        <motion.span
            className={styles[type]}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.span>
    );
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            <AIFloatingChat />

            {/* Interactive Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Dynamic gradient background */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 50%, rgba(185,28,28,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.08) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 30%, rgba(185,28,28,0.08) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(139,92,246,0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 50% 80%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(circle at 50% 20%, rgba(185,28,28,0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 50%, rgba(185,28,28,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.08) 0%, transparent 50%)'
                        ]
                    }}
                    transition={{
                        duration: 15,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />

                {/* Floating geometric shapes */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={`shape-${i}`}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 60 + 20}px`,
                            height: `${Math.random() * 60 + 20}px`,
                        }}
                    >
                        <motion.div
                            className={`w-full h-full ${i % 3 === 0 ? 'rounded-full bg-red-200/30' : i % 3 === 1 ? 'rounded-lg bg-blue-200/30' : 'rounded-full bg-purple-200/30'} backdrop-blur-sm`}
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                                x: [0, Math.random() * 100 - 50, 0],
                                y: [0, Math.random() * 100 - 50, 0],
                            }}
                            transition={{
                                duration: 8 + Math.random() * 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.5,
                            }}
                        />
                    </motion.div>
                ))}

                {/* Ascending privacy-themed particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`privacy-particle-${i}`}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                        }}
                        initial={{
                            y: '100vh',
                            opacity: 0,
                            scale: 0
                        }}
                        animate={{
                            y: '-10vh',
                            opacity: [0, 0.7, 0],
                            scale: [0, 1, 0],
                            rotate: [0, 360]
                        }}
                        transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 6,
                            ease: "easeOut"
                        }}
                    >
                        <Shield className={`w-4 h-4 text-red-400/60`} />
                    </motion.div>
                ))}
            </div>
            
            <main className="relative z-10">
                {/* Enhanced Hero Section */}
                <div 
                  className="relative bg-cover bg-center h-80 overflow-hidden" 
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=2940&auto=format&fit=crop')" }}
                >
                  <motion.div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=2940&auto=format&fit=crop')" }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(1,1,25,0.8)] to-[rgba(93,6,6,0.3)]" />
                  <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div 
                            className="flex items-center gap-4 mb-4"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                             <motion.div 
                                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white"
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <FileText className="w-8 h-8" />
                            </motion.div>
                            <motion.h1 
                                className="text-5xl font-bold text-white shadow-text"
                                animate={{
                                    textShadow: [
                                        '0 2px 10px rgba(0,0,0,0.5)',
                                        '0 4px 20px rgba(0,0,0,0.8)',
                                        '0 2px 10px rgba(0,0,0,0.5)'
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                Privacy Policy
                            </motion.h1>
                        </motion.div>
                        <motion.p 
                            className="text-xl text-red-100 max-w-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >
                            Your privacy is our priority. This policy outlines how we handle your information.
                        </motion.p>
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced Content */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <motion.div
                            className="inline-block bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] text-white px-6 py-3 rounded-full shadow-lg"
                            animate={{ 
                                boxShadow: [
                                    "0 4px 20px rgba(183, 28, 28, 0.3)",
                                    "0 8px 30px rgba(183, 28, 28, 0.5)",
                                    "0 4px 20px rgba(183, 28, 28, 0.3)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <p className="text-sm font-semibold">Last updated: April 15, 2016</p>
                        </motion.div>
                    </motion.div>
                    
                    <PolicySection title="Introduction" icon={Shield} index={0}>
                        <p>
                            Madhatv ("us", "we", or "our") operates the <HighlightedText>http://www.madha.tv/</HighlightedText> website (the "Service").
                        </p>
                        <p>
                            <HighlightedText type="important">This page informs you of our policies regarding the collection, use and disclosure of Personal Information when you use our Service.</HighlightedText>
                        </p>
                        <p>
                            We will not use or share your information with anyone except as described in this Privacy Policy.
                        </p>
                        <p>
                            We use your Personal Information for providing and improving the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our <Link to={createPageUrl('TermsAndConditions')}><HighlightedText>Terms and Conditions</HighlightedText></Link>, accessible at http://madha.tv/
                        </p>
                    </PolicySection>

                    <PolicySection title="Information Collection And Use" icon={Database} index={1}>
                        <p>
                            While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. <HighlightedText type="important">Personally identifiable information may include, but is not limited to, your name, phone number, postal address ("Personal Information").</HighlightedText>
                        </p>
                    </PolicySection>

                    <PolicySection title="Log Data" icon={Eye} index={2}>
                        <p>
                            We collect information that your browser sends whenever you visit our Service ("Log Data"). This Log Data may include information such as <HighlightedText type="important">your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages and other statistics.</HighlightedText>
                        </p>
                    </PolicySection>

                    <PolicySection title="Cookies" icon={Cookie} index={3}>
                        <p>
                            Cookies are files with small amount of data, which may include an anonymous unique identifier. <HighlightedText type="important">Cookies are sent to your browser from a web site and stored on your computer's hard drive.</HighlightedText>
                        </p>
                        <p>
                            We use "cookies" to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                        </p>
                    </PolicySection>

                    <PolicySection title="Service Providers" icon={Users} index={4}>
                        <p>
                            We may employ third party companies and individuals to facilitate our Service, to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
                        </p>
                        <p>
                            <HighlightedText type="important">These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</HighlightedText>
                        </p>
                    </PolicySection>

                    <PolicySection title="Security" icon={Lock} index={5}>
                        <p>
                            <HighlightedText type="important">The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.</HighlightedText> While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                        </p>
                    </PolicySection>

                    <PolicySection title="Links To Other Sites" icon={ExternalLink} index={6}>
                        <p>
                            Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                        </p>
                        <p>
                            <HighlightedText type="important">We have no control over, and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</HighlightedText>
                        </p>
                    </PolicySection>

                    <PolicySection title="Children's Privacy" icon={Baby} index={7}>
                        <p>
                            <HighlightedText type="important">Our Service does not address anyone under the age of 13 ("Children").</HighlightedText>
                        </p>
                        <p>
                            We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your Children has provided us with Personal Information, please contact us. If we discover that a Children under 13 has provided us with Personal Information, we will delete such information from our servers immediately.
                        </p>
                    </PolicySection>

                    <PolicySection title="Changes To This Privacy Policy" icon={RefreshCw} index={8}>
                        <p>
                            We may update our Privacy Policy from time to time. <HighlightedText type="important">We will notify you of any changes by posting the new Privacy Policy on this page.</HighlightedText>
                        </p>
                        <p>
                            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                        </p>
                    </PolicySection>

                    <PolicySection title="Contact Us" icon={Phone} index={9}>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us.
                        </p>
                    </PolicySection>

                    {/* Enhanced Footer */}
                    <motion.div
                        className="mt-16 p-8 bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] rounded-2xl text-center relative overflow-hidden"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-white/10"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0, 0.1, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                        <motion.div className="relative z-10">
                            <div className="flex justify-center mb-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <CheckCircle className="w-12 h-12 text-white" />
                                </motion.div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Your Privacy Matters
                            </h3>
                            <p className="text-red-100 leading-relaxed max-w-2xl mx-auto">
                                We are committed to protecting your personal information and maintaining transparency in how we handle your data. Your trust is sacred to us.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
            
            <DynamicFooter />
        </div>
    );
}