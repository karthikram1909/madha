
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, UserCheck, DollarSign, XCircle, CheckCircle, AlertTriangle, Info, Scale, Lock, Eye } from 'lucide-react';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

const TermSection = ({ icon: Icon, title, children, index }) => (
  <motion.div
    className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 relative overflow-hidden group"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(185,28,28,0.15)',
      backgroundColor: 'rgba(255,255,255,0.85)'
    }}
  >
    {/* Animated background decoration */}
    <motion.div
      className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-red-100/30 to-red-200/20 rounded-full blur-2xl"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 180, 270, 360]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />

    <div className="flex items-center gap-4 mb-6 pb-3 border-b border-slate-200 relative z-10">
      <motion.div
        className="p-3 rounded-full bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] shadow-lg"
        whileHover={{
          scale: 1.1,
          rotate: 360,
          boxShadow: '0 0 30px rgba(185,28,28,0.5)'
        }}
        transition={{ duration: 0.5 }}
      >
        {Icon && <Icon className="text-white w-6 h-6" />}
      </motion.div>
      <motion.h2
        className="text-2xl font-bold text-slate-900"
        whileHover={{ color: '#B71C1C' }}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.h2>
    </div>
    <div className="space-y-4 relative z-10">
      {children}
    </div>
  </motion.div>
);

const AnimatedPoint = ({ children, index }) => (
  <motion.div
    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 transition-all duration-300 group cursor-pointer"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{
      scale: 1.02,
      backgroundColor: 'rgba(185,28,28,0.05)',
      boxShadow: '0 5px 15px rgba(185,28,28,0.1)'
    }}
  >
    <motion.div
      className="w-3 h-3 bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] rounded-full mt-2 flex-shrink-0"
      whileHover={{
        scale: 1.5,
        boxShadow: '0 0 20px rgba(185,28,28,0.6)'
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: index * 0.2
      }}
    />
    <motion.p
      className="text-slate-700 leading-relaxed group-hover:text-slate-900"
      whileHover={{ x: 5 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.p>
  </motion.div>
);

export default function TermsAndConditionsPage() {
  const termsData = [
    {
      title: "Acceptance of Terms",
      icon: UserCheck,
      points: [
        "By accessing and using the MadhaTV website and services, you accept and agree to be bound by the terms and provision of this agreement.",
        "These terms apply to all visitors, users, and others who access or use the service.",
        "If you do not agree to abide by the above, please do not use this service."
      ]
    },
    {
      title: "Use License",
      icon: FileText,
      points: [
        "Permission is granted to temporarily download one copy of the materials on MadhaTV's website for personal, non-commercial transitory viewing only.",
        "This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials.",
        "Use the materials for any commercial purpose or for any public display (commercial or non-commercial).",
        "Attempt to decompile or reverse engineer any software contained on MadhaTV's website.",
        "This license shall automatically terminate if you violate any of these restrictions and may be terminated by MadhaTV at any time."
      ]
    },
    {
      title: "Privacy Policy",
      icon: Eye,
      points: [
        "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.",
        "We collect information you provide directly to us, such as when you create an account, make a donation, or contact us.",
        "We may use your information to provide, maintain, and improve our services.",
        "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent."
      ]
    },
    {
      title: "Donations and Payments",
      icon: DollarSign,
      points: [
        "All donations made through our platform are voluntary and non-refundable unless otherwise specified.",
        "We use secure payment processors to handle all financial transactions.",
        "Donation receipts will be provided for tax purposes where applicable.",
        "We reserve the right to refuse or return any donation at our sole discretion."
      ]
    },
    {
      title: "Service Bookings",
      icon: CheckCircle,
      points: [
        "Service bookings are subject to availability and confirmation by our team.",
        "Booking fees are non-refundable unless the service is cancelled by MadhaTV.",
        "We reserve the right to reschedule services due to unforeseen circumstances.",
        "Special requests for services should be communicated at the time of booking."
      ]
    },
    {
      title: "Content and Intellectual Property",
      icon: Lock,
      points: [
        "All content on this website, including text, graphics, logos, images, and software, is the property of MadhaTV or its content suppliers.",
        "You may not reproduce, distribute, or create derivative works from our content without express written permission.",
        "User-generated content remains the property of the user but grants MadhaTV a license to use such content.",
        "We respect intellectual property rights and expect our users to do the same."
      ]
    },
    {
      title: "Disclaimer",
      icon: AlertTriangle,
      points: [
        "The materials on MadhaTV's website are provided on an 'as is' basis. MadhaTV makes no warranties, expressed or implied.",
        "MadhaTV does not warrant that the functions contained in the materials will be uninterrupted or error-free.",
        "The accuracy or reliability of any information obtained through our service is not guaranteed.",
        "We are not responsible for any damages arising from the use of our service."
      ]
    },
    {
      title: "Limitations",
      icon: XCircle,
      points: [
        "In no event shall MadhaTV or its suppliers be liable for any damages arising out of the use or inability to use the materials on MadhaTV's website.",
        "This limitation applies to all damages of any kind, including without limitation direct, indirect, incidental, punitive, and consequential damages.",
        "Some jurisdictions do not allow limitations on implied warranties, so these limitations may not apply to you."
      ]
    },
    {
      title: "Governing Law",
      icon: Scale,
      points: [
        "These terms and conditions are governed by and construed in accordance with the laws of India.",
        "Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu.",
        "If any provision of these terms is found to be invalid, the remaining provisions will remain in full force and effect."
      ]
    },
    {
      title: "Contact Information",
      icon: Info,
      points: [
        "If you have any questions about these Terms and Conditions, please contact us at info[at]madhatv[dot]com.",
        "For technical support, reach out to our support team through the contact form on our website.",
        "Our office address: Santhome Communication Centre, J-9, Luz Church Road, Mylapore Chennai - 600 004.",
        "Phone: +91 44 2499 1244"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <AIFloatingChat />

      {/* Interactive Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundImage: 'linear-gradient(45deg, #fef2f2 10%, #fef7ff 35%, #f0f9ff 60%, #fef2f2 85%, #fef2f2 100%)',
              backgroundSize: '400% 400%'
            }}
          />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-red-200/50 to-transparent"
            style={{
              left: `${5 + i * 5}%`,
            }}
            animate={{
              scaleY: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
         {[...Array(30)].map((_, i) => (
            <motion.div
                key={`particle-term-${i}`}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  backgroundColor: i % 2 === 0 ? 'rgba(183, 28, 28, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                  borderRadius: '50%',
                }}
                animate={{
                    x: [0, Math.random() * 100 - 50, 0],
                    y: [0, Math.random() * 100 - 50, 0],
                    scale: [1, 1.5, 1],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 5,
                }}
            />
        ))}
      </div>

      <main className=" relative z-10">
        {/* Hero Section */}
        <div
          className="relative bg-cover bg-center h-64"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=2940&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(1,1,25,0.8)] to-[rgba(93,6,6,0.3)]" />
          <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
            <motion.h1
              className="text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Terms and Conditions
            </motion.h1>
            <motion.p
              className="text-xl text-red-100 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Please read these terms and conditions carefully before using our services.
            </motion.p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 pb-16 pt-12">
           <motion.div
              className="mt-6 text-sm text-slate-500 mb-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Last updated: January 2025
            </motion.div>
          <div className="space-y-12">
            {termsData.map((section, sectionIndex) => (
              <TermSection
                key={sectionIndex}
                icon={section.icon}
                title={`${sectionIndex + 1}. ${section.title}`}
                index={sectionIndex}
              >
                {section.points.map((point, pointIndex) => (
                  <AnimatedPoint key={pointIndex} index={pointIndex}>
                    {point}
                  </AnimatedPoint>
                ))}
              </TermSection>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            className="mt-12 bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] rounded-2xl p-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
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
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
              Thank You for Choosing MadhaTV
            </h3>
            <p className="text-red-100 leading-relaxed max-w-2xl mx-auto relative z-10">
              By using our services, you help us continue our mission of spreading faith and providing spiritual guidance to communities worldwide. God bless you.
            </p>
          </motion.div>
        </div>
      </main>

      <DynamicFooter />
    </div>
  );
}
