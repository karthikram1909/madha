
import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { toast } from 'sonner';
import { Palette, Key, Bell, Tv, Calendar, Mail, BookOpen, Calculator, Music } from 'lucide-react';

import ApiKeysManager from '../components/settings/ApiKeysManager';
import ThemeEditor from '../components/settings/ThemeEditor';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
// import LiveTvSettings from '../components/settings/LiveTvSettings';
import LiveAudioSettings from '../components/settings/LiveAudioSettings';
// DONATION SETTINGS HIDDEN
// import DonationSettings from '../components/settings/DonationSettings';
import ServiceBookingSettings from '../components/settings/ServiceBookingSettings';
import BookPurchaseSettings from '../components/settings/BookPurchaseSettings';
import MailSettings from '../components/settings/MailSettings';
import TaxSettings from '../components/settings/TaxSettings';
import BookTaxSettings from '../components/settings/BookTaxSettings'; // Added BookTaxSettings import
import ResendSettings from '../components/settings/ResendSettings';

const TABS = [
    { id: 'theme', label: 'Theme & Appearance', icon: Palette },
    { id: 'notifications', label: 'SMS Notifications (OTP)', icon: Bell },
    { id: 'mail_settings', label: 'Mail Settings (General)', icon: Mail },
    { id: 'booking_mail_settings', label: 'Mail Settings (Bookings)', icon: Mail },
    // DONATION EMAIL SETTINGS HIDDEN
    // { id: 'resend_donations', label: 'Resend Email (Donations)', icon: Mail },
    { id: 'resend_bookings', label: 'Resend Email (Bookings)', icon: Mail },
    { id: 'resend_books', label: 'Resend Email (Books)', icon: Mail },
    { id: 'livetv', label: 'Live Stream', icon: Tv },
    { id: 'live_audio', label: 'Live Audio', icon: Music },
    // DONATION PAYMENT SETTINGS HIDDEN
    // { id: 'donation_settings', label: 'Donation Payments', icon: DollarSign },
    { id: 'booking_settings', label: 'Booking Payments', icon: Calendar },
    { id: 'books_settings', label: 'Book Purchase Payments', icon: BookOpen },
    { id: 'book_tax_settings', label: 'Book Purchase Tax', icon: Calculator }, // Added new tab for Book Tax
    { id: 'tax_settings', label: 'Service Booking Tax', icon: Calculator }, // Updated label for existing Tax
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Security', icon: Key },
];

export default function Settings() {
    const [activeTab, setActiveTab] = useState('theme');
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const content = await WebsiteContent.list();
            const currentSettings = content.reduce((acc, item) => {
                acc[item.content_key] = {
                    id: item.id,
                    value: item.content_value,
                    section: item.section,
                    type: item.content_type,
                    title: item.title,
                };
                return acc;
            }, {});
            setSettings(currentSettings);
        } catch (error) {
            console.error("Failed to load settings:", error);
            toast.error("Failed to load settings.");
        }
        setIsLoading(false);
    };

    const handleSave = async (key, section) => {
        setIsLoading(true);
        try {
            const setting = settings[key];
            if (!setting) {
                toast.error(`Setting with key "${key}" not found.`);
                setIsLoading(false);
                return;
            }

            const settingInfo = settings[key];

            const payload = {
                section: section,
                content_key: key,
                content_type: settingInfo.type || 'text',
                title: settingInfo.title || key.replace(/_/g, ' ').toUpperCase(),
                content_value: setting.value,
                is_active: true
            };

            if (setting.id) {
                await WebsiteContent.update(setting.id, payload);
            } else {
                await WebsiteContent.create(payload);
            }
            toast.success(`Setting "${key}" saved successfully.`);
            await loadSettings();
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
            toast.error(`Failed to save setting "${key}".`);
        }
        setIsLoading(false);
    };

    const handleChange = (key, value, section) => {
        setSettings(prev => ({
            ...prev,
            [key]: { ...(prev[key] || {}), value, section }
        }));
    };
    
    return (
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="relative bg-cover bg-center h-52" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=2940&auto=format&fit=crop')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
            <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">System Settings</h1>
              <p className="text-red-100 max-w-2xl text-lg shadow-lg">Manage global configurations for themes, integrations, and security.</p>
            </div>
          </div>
            
          <div className="p-4 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
              <div className="grid lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1">
                      <div className="p-4 bg-white rounded-lg shadow-lg border-0 sticky top-6">
                          <h3 className="font-semibold mb-4 text-slate-800">Settings Menu</h3>
                          <div className="space-y-2">
                              {TABS.map(tab => (
                                  <button
                                      key={tab.id}
                                      onClick={() => setActiveTab(tab.id)}
                                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[#B71C1C] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                                  >
                                      <tab.icon className="w-5 h-5" />
                                      {tab.label}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="lg:col-span-3 space-y-8">
                      {activeTab === 'theme' && <ThemeEditor settings={settings} handleChange={handleChange} handleSave={handleSave} />}
                      {activeTab === 'notifications' && <NotificationSettings settings={settings} handleChange={handleChange} handleSave={handleSave} />}
                      {activeTab === 'mail_settings' && <MailSettings configType="general" />}
                      {activeTab === 'booking_mail_settings' && <MailSettings configType="bookings" />}
                      {/* DONATION EMAIL SETTINGS HIDDEN */}
                      {/* {activeTab === 'resend_donations' && <ResendSettings configType="donations" settings={settings} handleChange={handleChange} handleSave={handleSave} />} */}
                      {activeTab === 'resend_bookings' && <ResendSettings configType="bookings" settings={settings} handleChange={handleChange} handleSave={handleSave} />}
                      {activeTab === 'resend_books' && <ResendSettings configType="books" settings={settings} handleChange={handleChange} handleSave={handleSave} />}
                      {activeTab === 'livetv' && <LiveTvSettings settings={settings} handleChange={handleChange} handleSave={handleSave} />}
                      {activeTab === 'live_audio' && <LiveAudioSettings settings={settings} handleChange={handleChange} handleSave={handleSave} />}
                      {/* DONATION PAYMENT SETTINGS HIDDEN */}
                      {/* {activeTab === 'donation_settings' && <DonationSettings />} */}
                      {activeTab === 'booking_settings' && <ServiceBookingSettings />}
                      {activeTab === 'books_settings' && <BookPurchaseSettings />}
                      {activeTab === 'book_tax_settings' && <BookTaxSettings />} {/* Render BookTaxSettings */}
                      {activeTab === 'tax_settings' && <TaxSettings />}
                      {activeTab === 'apikeys' && <ApiKeysManager />}
                      {activeTab === 'security' && <SecuritySettings />}
                  </div>
              </div>
          </div>
        </div>
    );
}
