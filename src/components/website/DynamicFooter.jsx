import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { MapPin, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { WebsiteContent } from '@/api/entities';

export default function DynamicFooter() {
    const [footerData, setFooterData] = useState({
        basic: {},
        quickLinks: []
    });
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

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const footerContentItems = await WebsiteContent.filter({ section: 'footer'});

                const basic = {};
                const quickLinks = [];

                footerContentItems.forEach(item => {
                    if (item.content_key.startsWith('quick_link_')) {
                        try {
                            const linkData = JSON.parse(item.content_value);
                            const linkDataTamil = item.content_value_tamil ? JSON.parse(item.content_value_tamil) : null;
                            quickLinks.push({
                                ...linkData,
                                label_tamil: linkDataTamil?.label_tamil,
                                order: item.display_order || 0
                            });
                        } catch (e) {
                            console.warn('Invalid quick link JSON:', item.content_value, e);
                        }
                    } else {
                        basic[item.content_key] = {
                            value: item.content_value,
                            tamil: item.content_value_tamil
                        };
                    }
                });

                setFooterData({
                    basic,
                    quickLinks: quickLinks.sort((a, b) => a.order - b.order)
                });
            } catch (error) {
                console.error('Failed to fetch footer data:', error);
            }
        };

        fetchFooterData();
    }, []);

    const getText = (key, fallback) => {
        const item = footerData.basic[key];
        if (!item) return fallback;
        return language === 'tamil' && item.tamil ? item.tamil : item.value;
    };

    const getCopyrightText = () => {
        const text = getText('copyright_text', 'Copyrights © 2025 MadhaTV.');
        return text
            .replace(/\s*Powered by Cherri Technologies\.?$/i, '')
            .replace(/\s*Cherri Technologies\.?$/i, '')
            .replace(/\s*Powered by\.?$/i, '')
            .trim();
    };

    const { basic, quickLinks } = footerData;

    const footerDecorationEnabled = footerData.basic['footer_decoration_enabled']?.value === 'true';
    const footerDecorationImage = footerData.basic['footer_decoration_image']?.value;

    return (
        <>
            {/* Footer Decoration - Above Footer */}
            {footerDecorationEnabled && footerDecorationImage && (
                <div className="relative bg-transparent">
                    <img
                        src={footerDecorationImage}
                        alt="Footer Decoration"
                        className="absolute left-0 mb-24 bottom-0 w-20 sm:w-32 md:w-40 z-10 pointer-events-none translate-y-1/2"
                    />
                </div>
            )}
            <footer className="bg-[#1e2a47] text-white py-6 sm:py-8 relative overflow-hidden" >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative ">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-start">


                        {/* Left Section: Logo + Download App */}
                        <div className="lg:col-span-1 flex flex-col items-center sm:items-start lg:items-start">
                            <div className="">
                             
                                    <img
                                        src="/logo.png"
                                        alt="Madha TV"
                                        className="h-8 sm:h-10 w-auto"
                                    />
                                
                            </div>
                            <div>
                                <p className="space-y-2 text-xs sm:text-sm text-gray-300 mb-4 mt-5">Madha TV is a live broadcasting Christian television channel. Our programmes are available on online streaming, mobile apps, and digital platforms.</p>
                            </div>

                            <div className="w-full">
                                <h4 className="text-[#ffd700] font-semibold text-sm sm:text-base mb-3 text-center sm:text-left lg:text-left">
                                    {getText('download_app_title', 'Download App')}
                                </h4>
                                <div className="flex flex-col gap-2 items-center sm:items-start lg:items-start">
                                    {getText('google_play_url') && (
                                        <a
                                            href={getText('google_play_url')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-32 sm:w-36 hover:opacity-90 transition-opacity duration-200 touch-manipulation"
                                        >
                                            <img
                                                src={getText('google_play_image', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/006e83196_Layer3.png')}
                                                alt="Get it on Google Play"
                                                className="w-full h-auto"
                                            />
                                        </a>
                                    )}

                                    {getText('app_store_url') && (
                                        <a
                                            href={getText('app_store_url')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-32 sm:w-36 hover:opacity-90 transition-opacity duration-200 touch-manipulation"
                                        >
                                            <img
                                                src={getText('app_store_image', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2c549b5a2_Layer42x.png')}
                                                alt="Download on the App Store"
                                                className="w-full h-auto"
                                            />
                                        </a>
                                    )}
                                </div>
                            </div>


                        </div>

                        {/* Center Section: Address, Quick Links */}
                        <div className="sm:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            <div>
                                <h4 className="text-[#ffd700] font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-center sm:text-left lg:text-left">
                                    {getText('follow_us_title', 'Follow Us')}
                                </h4>

                                {/* Social Media Icons Row */}
                                <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
                                    {/* YouTube */}
                                    <a
                                        href={getText('youtube_url') || 'https://youtube.com/@madhatv'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
                                        title="YouTube"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </a>
                                    {/* Instagram */}
                                    <a
                                        href={getText('instagram_url') || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
                                        title="Instagram"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                    {/* Facebook */}
                                    <a
                                        href={getText('facebook_url') || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-[#1877F2] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
                                        title="Facebook"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>
                                </div>

                                {/* Watch on Platforms Section */}
                                <div className="w-full mt-4">
                                    <h4 className="text-[#ffd700] font-semibold text-xs sm:text-sm mb-3 text-center sm:text-left">
                                        {getText('watch_on_platforms_title', 'Watch on Platforms')}
                                    </h4>
                                    <div className="flex gap-3 justify-center sm:justify-start items-center">
                                        <a
                                            href={getText('yupp_tv_url') || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden bg-white"
                                            title="YuppTV"
                                        >
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/ec34a6351_021.png" alt="YuppTV" className="w-full h-full object-contain p-0.5" />
                                        </a>
                                        <a
                                            href={getText('roku_tv_url') || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden"
                                            title="Roku"
                                        >

                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/a6c6a0b2b_011.png" alt="Jio" className="w-full h-full object-contain p-0.5" />
                                        </a>
                                        <a
                                            href={getText('jio_app_url') || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden bg-white"
                                            title="Jio"
                                        >
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/e0be7a25a_031.png" alt="Roku" className="w-full h-full object-contain" />
                                        </a>
                                    </div>
                                </div>

                                {/* Podcasts Section */}
                                <div className="w-full mb-4">
                                    <h4 className="text-[#ffd700] font-semibold text-xs sm:text-sm mb-2 text-center sm:text-left">
                                        {language === 'tamil' ? 'Podcasts' : 'Podcasts'}
                                    </h4>
                                    <div className="flex gap-3 justify-center sm:justify-start">
                                        <a href={getText('spotify_podcast_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200" title="Spotify Podcast">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                            </svg>
                                        </a>
                                        <a href={getText('jiosaavn_podcast_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden" title="JioSaavn Podcast">
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/84242975d_image.png" alt="JioSaavn" className="w-full h-full object-cover rounded-full" />
                                        </a>
                                        <a href={getText('amazon_podcast_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden p-0.5" title="Amazon Music Podcast">
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/f8ba91d69_image.png" alt="Amazon Music" className="w-full h-full object-contain" />
                                        </a>
                                        <a href={getText('apple_podcast_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden" title="Apple Podcast">
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/fb7a4f8be_image.png" alt="Apple Music" className="w-full h-full object-cover rounded-full" />
                                        </a>
                                    </div>
                                </div>

                                {/* Music Section */}
                                <div className="w-full">
                                    <h4 className="text-[#ffd700] font-semibold text-xs sm:text-sm mb-2 text-center sm:text-left">
                                        {language === 'tamil' ? 'Music' : 'Music'}
                                    </h4>
                                    <div className="flex gap-3 justify-center sm:justify-start">
                                        <a href={getText('spotify_music_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200" title="Spotify Music">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                            </svg>
                                        </a>
                                        <a href={getText('jiosaavn_music_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden" title="JioSaavn Music">
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/84242975d_image.png" alt="JioSaavn" className="w-full h-full object-cover rounded-full" />
                                        </a>
                                        <a href={getText('amazon_music_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden p-0.5" title="Amazon Music">
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/f8ba91d69_image.png" alt="Amazon Music" className="w-full h-full object-contain" />
                                        </a>
                                        <a href={getText('apple_music_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden" title="Apple Music">
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/fb7a4f8be_image.png" alt="Apple Music" className="w-full h-full object-cover rounded-full" />
                                        </a>
                                        <a href={getText('gaana_music_url') || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden" title="Gaana Music">
                                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/9fa6d2e7c_icons8-gaana-48.png" alt="Gaana Music" className="w-full h-full object-cover rounded-full" />
                                        </a>
                                    </div>
                                </div>
                            </div>


                            <div>
                                <h4 className="text-[#ffd700] font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-center sm:text-left">
                                    {getText('quick_links_title', 'Quick Links')}
                                </h4>
                                <div className="space-y-2">
                                    {quickLinks.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 text-center sm:text-left">
                                            {quickLinks.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    className="text-gray-300 text-xs sm:text-sm hover:text-white transition-colors duration-200 flex items-center touch-manipulation min-h-[36px]"
                                                    target={link.url?.startsWith('http') || link.url?.startsWith('#') ? '_blank' : '_self'}
                                                    rel={link.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                >
                                                    {/* <svg className="w-3 h-3 mr-2 text-[#ffd700] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                    <span className="leading-tight">{language === 'tamil' && link.label_tamil ? link.label_tamil : link.label}</span> */}

                                                    <img src="/linkicon.jpg" width="10px" height="20px"/>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-4">
                                            <span><a href="/Home">Home</a></span>
                                            <span><a href="/About">About Us</a></span>
                                            <span><a href="/LiveTV">Watch Live</a></span>
                                            <span><a href="/Shows">Shows</a></span>
                                            <span><a href="/Schedule">Schedule</a></span>
                                            <span><a href="/FireTV">Fire Tv</a></span>
                                            <span><a href="/BuyBooks">Madha Mart</a></span>
                                            <span><a href="/BookService">Services</a></span>
                                            <span><a href="/Reach">Reach Us</a></span>
                                            <span><a href="/Contact">Contact</a></span>
                                            <span><a href="/PlaystoreTV">Playstore TV</a></span>
                                            <span><a href="/Gallery">Gallery</a></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Right Section: Location Map and YouTube Channels */}
                        <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center sm:items-start lg:items-end">
                            <div className="w-full">
                                <h4 className="text-[#ffd700] font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-center sm:text-left lg:text-left">
                                    {getText('address_title', 'Address')}
                                </h4>
                                <div className="space-y-2 text-xs sm:text-sm text-gray-300 text-center sm:text-left lg:text-right">
                                    {getText('address_line') && (
                                        <div className="flex items-start justify-center sm:justify-start lg:justify-start">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 text-white animate-pulse flex-shrink-0" />
                                            <div className="leading-relaxed whitespace-pre-line text-left">
                                                {getText('address_line', 'Santhome Communication Centre, J-9, Luz Church Road, Mylapore Chennai - 600 004.')}
                                            </div>
                                        </div>
                                    )}

                                    {getText('email_address') && (
                                        <div className="flex items-center justify-center sm:justify-start lg:justify-start">
                                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-white animate-pulse flex-shrink-0" />
                                            <a
                                                href={`mailto:${getText('email_address', 'info@madhatv.in')}`}
                                                className="hover:text-yellow-400 transition-colors duration-200 break-all"
                                            >
                                                {getText('email_address', 'info@madhatv.in')}
                                            </a>
                                        </div>
                                    )}

                                    {getText('phone_1') && getText('phone_1') !== 'N/A' && (
                                        <div className="flex items-center justify-center sm:justify-start lg:justify-start">
                                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-white animate-pulse flex-shrink-0" />
                                            <a
                                                href={`tel:${getText('phone_1', '+044 24991244').replace(/\s+/g, '')}`}
                                                className="hover:text-yellow-400 transition-colors duration-200"
                                            >
                                                {getText('phone_1', '+044 24991244')}
                                            </a>
                                        </div>
                                    )}

                                    {getText('phone_2') && getText('phone_2') !== 'N/A' && (
                                        <div className="flex items-center justify-center sm:justify-start lg:justify-start">
                                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-white animate-pulse flex-shrink-0" />
                                            <a
                                                href={`tel:${getText('phone_2', '+044 24993314').replace(/\s+/g, '')}`}
                                                className="hover:text-yellow-400 transition-colors duration-200"
                                            >
                                                {getText('phone_2', '+044 24993314')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4 my-5 sm:mb-6 w-full max-w-[300px] mx-auto sm:mx-0 lg:ml-auto lg:mr-0">
                                <div> 
                                    <span>Santhome Communication Centre,<br/>
                                    150, Luz Church Road, Mylapore,
                                    Chennai 600 004, Tamilnadu, India.</span>
                                    <br/>
                                    <span><a>info@madhatv.in</a></span><br/>
                                    <span><a>+9144 24991344</a></span>
                                    
                                    
                                    
                                    </div>
                                <iframe
                                    src={getText('google_maps_embed_url', "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3870.676398853026!2d80.25964831478274!3d13.03743111193756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52662d40a040d9%3A0xfd36dc3a51c29d6e!2sSanthome%20Communication%20Centre%20and%20Santhome%20Studios!5e1!3m2!1sen!2sin!4v1762579540295!5m2!1sen!2sin")}
                                    width="100%"
                                    height="120"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="rounded-lg shadow-md mt-5"
                                ></iframe>
                            </div>



                        </div>
                    </div>

                    {/* Bottom Strip */}
                    <div className="border-t border-gray-600 mt-6 pt-4 sm:pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
                            <div className="text-center md:text-left">
                                <span>
                                    {getCopyrightText()}{' '}
                                    <a
                                        href={getText('powered_by_url', 'https://cherritech.com')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-gray-200 transition-colors duration-200"
                                    >
                                        Powered by Cherri Technologies.
                                    </a>
                                </span>
                            </div>
                            <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
                                {getText('privacy_policy_url') ? (
                                    <a
                                        href={getText('privacy_policy_url')}
                                        className="hover:text-white transition-colors duration-200 touch-manipulation min-h-[36px] flex items-center"
                                        target={getText('privacy_policy_url').startsWith('http') ? '_blank' : '_self'}
                                        rel={getText('privacy_policy_url').startsWith('http') ? 'noopener noreferrer' : undefined}
                                    >
                                        {getText('privacy_policy_label', 'Privacy Policy')}
                                    </a>
                                ) : (
                                    <a
                                        href={createPageUrl('PrivacyPolicy')}
                                        className="hover:text-white transition-colors duration-200 touch-manipulation min-h-[36px] flex items-center"
                                    >
                                        {getText('privacy_policy_label', 'Privacy Policy')}
                                    </a>
                                )}
                                <a
                                    href={createPageUrl('TermsAndConditions')}
                                    className="hover:text-white transition-colors duration-200 touch-manipulation min-h-[36px] flex items-center"
                                >
                                    {getText('terms_and_conditions_label', 'Terms and Conditions')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}