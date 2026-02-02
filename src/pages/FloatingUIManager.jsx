import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Youtube, MessageCircle, Music2, Instagram, Facebook } from 'lucide-react';
import { toast } from 'sonner';

export default function FloatingUIManager() {
    const [settings, setSettings] = useState({
        youtube_channel_1_name: 'Madha TV',
        youtube_channel_1_url: 'https://youtube.com/@madhatv',
        youtube_channel_2_name: 'Madha TV Music',
        youtube_channel_2_url: 'https://youtube.com/@madhatvmusic',
        youtube_channel_3_name: 'Madha TV Live',
        youtube_channel_3_url: 'https://youtube.com/@madhatvlive',
        youtube_channel_4_name: 'Madha TV Kids',
        youtube_channel_4_url: 'https://youtube.com/@madhatvkids',
        whatsapp_url: 'https://wa.me/919876543210',
        spotify_url: '',
        instagram_url: '',
        instagram_enabled: true,
        facebook_url: '',
        facebook_enabled: true
    });
    const [existingRecords, setExistingRecords] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const content = await WebsiteContent.filter({ section: 'floating_ui' });
            const recordsMap = {};
            const settingsMap = { ...settings };

            content.forEach(item => {
                recordsMap[item.content_key] = item;
                if (item.content_key === 'instagram_enabled' || item.content_key === 'facebook_enabled') {
                    settingsMap[item.content_key] = item.content_value !== 'false';
                } else {
                    settingsMap[item.content_key] = item.content_value || '';
                }
            });

            setExistingRecords(recordsMap);
            setSettings(settingsMap);
        } catch (error) {
            console.error('Error loading floating UI settings:', error);
            toast.error('Failed to load settings');
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const savePromises = Object.entries(settings).map(async ([key, value]) => {
                const payload = {
                    section: 'floating_ui',
                    content_key: key,
                    content_type: 'text',
                    title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    content_value: typeof value === 'boolean' ? String(value) : value,
                    is_active: true
                };

                if (existingRecords[key]) {
                    return WebsiteContent.update(existingRecords[key].id, payload);
                } else {
                    return WebsiteContent.create(payload);
                }
            });

            await Promise.all(savePromises);
            toast.success('Floating UI settings saved successfully!');
            loadSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        }
        setIsSaving(false);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C]"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
                className="relative bg-cover bg-center h-52" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=2940&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
                <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                    <h1 className="text-4xl font-bold text-white mb-2">Floating UI Manager</h1>
                    <p className="text-red-100 max-w-2xl text-lg">Manage the floating social icons displayed on the website.</p>
                </div>
            </div>

            <div className="p-6 md:p-8 max-w-4xl mx-auto -mt-16 relative z-10 space-y-6">
                {/* YouTube Channels */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Youtube className="w-6 h-6 text-red-600" />
                            YouTube Channels
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4].map(num => (
                            <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <Label className="text-sm font-medium">Channel {num} Name</Label>
                                    <Input
                                        value={settings[`youtube_channel_${num}_name`] || ''}
                                        onChange={(e) => updateSetting(`youtube_channel_${num}_name`, e.target.value)}
                                        placeholder={`Channel ${num} Name`}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Channel {num} URL</Label>
                                    <Input
                                        value={settings[`youtube_channel_${num}_url`] || ''}
                                        onChange={(e) => updateSetting(`youtube_channel_${num}_url`, e.target.value)}
                                        placeholder="https://youtube.com/@channel"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* WhatsApp */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                            WhatsApp
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label className="text-sm font-medium">WhatsApp URL</Label>
                            <Input
                                value={settings.whatsapp_url || ''}
                                onChange={(e) => updateSetting('whatsapp_url', e.target.value)}
                                placeholder="https://wa.me/919876543210"
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: https://wa.me/[country code][phone number]</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Spotify */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Music2 className="w-6 h-6 text-green-500" />
                            Spotify
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label className="text-sm font-medium">Spotify URL</Label>
                            <Input
                                value={settings.spotify_url || ''}
                                onChange={(e) => updateSetting('spotify_url', e.target.value)}
                                placeholder="https://open.spotify.com/show/..."
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Instagram */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Instagram className="w-6 h-6 text-pink-600" />
                            Instagram
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Show Instagram Icon</Label>
                            <Switch
                                checked={settings.instagram_enabled}
                                onCheckedChange={(checked) => updateSetting('instagram_enabled', checked)}
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Instagram URL</Label>
                            <Input
                                value={settings.instagram_url || ''}
                                onChange={(e) => updateSetting('instagram_url', e.target.value)}
                                placeholder="https://instagram.com/madhatv"
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Facebook */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Facebook className="w-6 h-6 text-blue-600" />
                            Facebook
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Show Facebook Icon</Label>
                            <Switch
                                checked={settings.facebook_enabled}
                                onCheckedChange={(checked) => updateSetting('facebook_enabled', checked)}
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Facebook URL</Label>
                            <Input
                                value={settings.facebook_url || ''}
                                onChange={(e) => updateSetting('facebook_url', e.target.value)}
                                placeholder="https://facebook.com/madhatv"
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#B71C1C] hover:bg-[#8B0000]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>
        </div>
    );
}