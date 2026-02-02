import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, MapPin, Link as LinkIcon, Calendar, Users, Sparkles, Image as ImageIcon, Upload, Tv, Radio, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FooterManager() {
    const [footerContent, setFooterContent] = useState({});
    const [quickLinks, setQuickLinks] = useState([]);
    const [liveEvents, setLiveEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [heroCornerLottieEnabled, setHeroCornerLottieEnabled] = useState(false);
    const [heroCornerLottieId, setHeroCornerLottieId] = useState(null);
    const [heroCornerLottieUrl, setHeroCornerLottieUrl] = useState('');
    const [heroVideoLottieEnabled, setHeroVideoLottieEnabled] = useState(false);
    const [heroVideoLottieId, setHeroVideoLottieId] = useState(null);
    const [heroVideoLottieUrl, setHeroVideoLottieUrl] = useState('');
    const [footerDecorationEnabled, setFooterDecorationEnabled] = useState(false);
    const [footerDecorationImage, setFooterDecorationImage] = useState('');

    useEffect(() => {
        loadFooterContent();
        loadLottieSettings();
        loadFooterDecorationSettings();
        
        // Load Lottie script for preview
        if (!document.querySelector('script[src*="dotlottie-wc"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js';
            script.type = 'module';
            document.head.appendChild(script);
        }
    }, []);

    const loadLottieSettings = async () => {
            try {
                const settings = await WebsiteContent.filter({ section: 'lottie_animation' });
                settings.forEach(setting => {
                    if (setting.content_key === 'hero_corner_lottie_enabled') {
                        setHeroCornerLottieEnabled(setting.content_value === 'true' && setting.is_active);
                        setHeroCornerLottieId(setting.id);
                    } else if (setting.content_key === 'hero_video_lottie_enabled') {
                        setHeroVideoLottieEnabled(setting.content_value === 'true' && setting.is_active);
                        setHeroVideoLottieId(setting.id);
                    } else if (setting.content_key === 'hero_corner_lottie_url') {
                        setHeroCornerLottieUrl(setting.content_value || '');
                    } else if (setting.content_key === 'hero_video_lottie_url') {
                        setHeroVideoLottieUrl(setting.content_value || '');
                    }
                });
            } catch (error) {
                console.error('Error loading lottie settings:', error);
            }
        };

    const loadFooterDecorationSettings = async () => {
        try {
            const settings = await WebsiteContent.filter({ section: 'footer' });
            settings.forEach(setting => {
                if (setting.content_key === 'footer_decoration_enabled') {
                    setFooterDecorationEnabled(setting.content_value === 'true');
                } else if (setting.content_key === 'footer_decoration_image') {
                    setFooterDecorationImage(setting.content_value || '');
                }
            });
        } catch (error) {
            console.error('Error loading footer decoration settings:', error);
        }
    };

    const saveLottieSetting = async (key, enabled, currentId, setEnabled, setId, title) => {
        setIsLoading(true);
        try {
            const payload = {
                section: 'lottie_animation',
                content_key: key,
                content_type: 'text',
                title: title,
                content_value: enabled ? 'true' : 'false',
                is_active: enabled
            };

            if (currentId) {
                await WebsiteContent.update(currentId, payload);
            } else {
                const created = await WebsiteContent.create(payload);
                setId(created.id);
            }
            
            setEnabled(enabled);
            toast.success(`${title} ${enabled ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error(`Failed to save ${title}:`, error);
            toast.error(`Failed to save ${title}`);
        }
        setIsLoading(false);
    };

    const loadFooterContent = async () => {
        setIsLoading(true);
        try {
            const content = await WebsiteContent.filter({ section: 'footer' });
            const contentMap = {};
            const linksArray = [];
            const eventsArray = [];

            content.forEach(item => {
                if (item.content_key.startsWith('quick_link_')) {
                    const linkData = JSON.parse(item.content_value || '{}');
                    linksArray.push({ 
                        id: item.id, 
                        ...linkData, 
                        label_tamil: item.content_value_tamil ? JSON.parse(item.content_value_tamil).label_tamil : '',
                        order: item.display_order || 0 
                    });
                } else if (item.content_key.startsWith('live_event_')) {
                    const eventData = JSON.parse(item.content_value || '{}');
                    eventsArray.push({ 
                        id: item.id, 
                        ...eventData, 
                        name_tamil: item.content_value_tamil ? JSON.parse(item.content_value_tamil).name_tamil : '',
                        order: item.display_order || 0 
                    });
                } else {
                    contentMap[item.content_key] = { id: item.id, value: item.content_value, value_tamil: item.content_value_tamil };
                }
            });

            setFooterContent(contentMap);
            setQuickLinks(linksArray.sort((a, b) => a.order - b.order));
            setLiveEvents(eventsArray.sort((a, b) => a.order - b.order));
        } catch (error) {
            console.error("Failed to load footer content:", error);
            toast.error("Failed to load footer content");
        }
        setIsLoading(false);
    };

    const saveFooterSetting = async (key, value, value_tamil, title) => {
        setIsLoading(true);
        try {
            const existing = footerContent[key];
            const payload = {
                section: 'footer',
                content_key: key,
                content_type: 'text',
                title: title,
                content_value: value,
                content_value_tamil: value_tamil,
                is_active: true
            };

            if (existing?.id) {
                await WebsiteContent.update(existing.id, payload);
            } else {
                await WebsiteContent.create(payload);
            }
            
            toast.success(`${title} saved successfully`);
            await loadFooterContent();
        } catch (error) {
            console.error(`Failed to save ${title}:`, error);
            toast.error(`Failed to save ${title}`);
        }
        setIsLoading(false);
    };

    const saveQuickLink = async (link, index) => {
        setIsLoading(true);
        try {
            const englishPayload = { label: link.label, url: link.url };
            const tamilPayload = { label_tamil: link.label_tamil };

            const payload = {
                section: 'footer',
                content_key: `quick_link_${index}`,
                content_type: 'json',
                title: `Quick Link ${index + 1}`,
                content_value: JSON.stringify(englishPayload),
                content_value_tamil: JSON.stringify(tamilPayload),
                display_order: index,
                is_active: true
            };

            if (link.id) {
                await WebsiteContent.update(link.id, payload);
            } else {
                await WebsiteContent.create(payload);
            }
            
            toast.success("Quick link saved successfully");
            await loadFooterContent();
        } catch (error) {
            console.error("Failed to save quick link:", error);
            toast.error("Failed to save quick link");
        }
        setIsLoading(false);
    };

    const saveLiveEvent = async (event, index) => {
        setIsLoading(true);
        try {
            const englishPayload = { name: event.name, redirect_url: event.redirect_url };
            const tamilPayload = { name_tamil: event.name_tamil };

            const payload = {
                section: 'footer',
                content_key: `live_event_${index}`,
                content_type: 'json',
                title: `Live Event ${index + 1}`,
                content_value: JSON.stringify(englishPayload),
                content_value_tamil: JSON.stringify(tamilPayload),
                display_order: index,
                is_active: true
            };

            if (event.id) {
                await WebsiteContent.update(event.id, payload);
            } else {
                await WebsiteContent.create(payload);
            }
            
            toast.success("Live event saved successfully");
            await loadFooterContent();
        } catch (error) {
            console.error("Failed to save live event:", error);
            toast.error("Failed to save live event");
        }
        setIsLoading(false);
    };

    const deleteItem = async (id, type) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                await WebsiteContent.delete(id);
                toast.success(`${type} deleted successfully`);
                await loadFooterContent();
            } catch (error) {
                console.error(`Failed to delete ${type}:`, error);
                toast.error(`Failed to delete ${type}`);
            }
        }
    };

    const addQuickLink = () => {
        setQuickLinks([...quickLinks, { label: '', url: '', label_tamil: '', order: quickLinks.length }]);
    };

    const addLiveEvent = () => {
        setLiveEvents([...liveEvents, { name: '', redirect_url: '', name_tamil: '', order: liveEvents.length }]);
    };

    const updateQuickLink = (index, field, value) => {
        const updated = [...quickLinks];
        updated[index][field] = value;
        setQuickLinks(updated);
    };

    const updateLiveEvent = (index, field, value) => {
        const updated = [...liveEvents];
        updated[index][field] = value;
        setLiveEvents(updated);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div 
                className="relative bg-cover bg-center h-52" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
                <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                    <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Footer Management</h1>
                    <p className="text-red-100 max-w-2xl text-lg shadow-lg">Configure all footer content, links, and contact information</p>
                </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="address">Address</TabsTrigger>
                        <TabsTrigger value="links">Quick Links</TabsTrigger>
                        <TabsTrigger value="events">Live Events</TabsTrigger>
                        <TabsTrigger value="social">Social Media</TabsTrigger>
                        <TabsTrigger value="lottie">Lottie Animation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="w-5 h-5" />
                                    Logo & App Downloads
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Footer Logo URL (English)</Label>
                                        <Input 
                                            placeholder="https://example.com/logo_en.png"
                                            value={footerContent.logo_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, logo_url: { ...prev.logo_url, value: e.target.value } }))}
                                        />
                                    </div>
                                     <div>
                                        <Label>Footer Logo URL (Tamil)</Label>
                                        <Input 
                                            placeholder="https://example.com/logo_ta.png"
                                            value={footerContent.logo_url?.value_tamil || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, logo_url: { ...prev.logo_url, value_tamil: e.target.value } }))}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => saveFooterSetting('logo_url', footerContent.logo_url?.value || '', footerContent.logo_url?.value_tamil || '', 'Logo URL')}
                                    className="mt-2"
                                    disabled={isLoading}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Logos
                                </Button>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Google Play Store URL</Label>
                                        <Input 
                                            placeholder="https://play.google.com/store/apps/..."
                                            value={footerContent.google_play_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, google_play_url: { ...prev.google_play_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('google_play_url', footerContent.google_play_url?.value || '', '', 'Google Play URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                    <div>
                                        <Label>App Store URL</Label>
                                        <Input 
                                            placeholder="https://apps.apple.com/app/..."
                                            value={footerContent.app_store_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, app_store_url: { ...prev.app_store_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('app_store_url', footerContent.app_store_url?.value || '', '', 'App Store URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Copyright Text (English)</Label>
                                        <Input 
                                            placeholder="Copyright © 2024 MadhaTV. Designed by Powered by Chem Technologies"
                                            value={footerContent.copyright_text?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, copyright_text: { ...prev.copyright_text, value: e.target.value } }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Copyright Text (Tamil)</Label>
                                        <Input 
                                            placeholder="பதிப்புரிமை © 2024 மாதா டிவி. செம் டெக்னாலஜிஸ் மூலம் வடிவமைக்கப்பட்டது."
                                            value={footerContent.copyright_text?.value_tamil || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, copyright_text: { ...prev.copyright_text, value_tamil: e.target.value } }))}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => saveFooterSetting('copyright_text', footerContent.copyright_text?.value || '', footerContent.copyright_text?.value_tamil || '', 'Copyright Text')}
                                    className="mt-2"
                                    disabled={isLoading}
                                >
                                    Save Copyright
                                </Button>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Privacy Policy URL</Label>
                                        <Input 
                                            placeholder="/privacy-policy"
                                            value={footerContent.privacy_policy_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, privacy_policy_url: { ...prev.privacy_policy_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('privacy_policy_url', footerContent.privacy_policy_url?.value || '', '', 'Privacy Policy URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                    <div>
                                        <Label>Terms & Conditions URL</Label>
                                        <Input 
                                            placeholder="/terms-and-conditions"
                                            value={footerContent.terms_conditions_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, terms_conditions_url: { ...prev.terms_conditions_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('terms_conditions_url', footerContent.terms_conditions_url?.value || '', '', 'Terms & Conditions URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="address" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Address Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Address Line (English)</Label>
                                        <Textarea 
                                            placeholder="Santhome Communication Centre, J-9, Luz Church Road, Mylapore Chennai - 600 004."
                                            value={footerContent.address_line?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, address_line: { ...prev.address_line, value: e.target.value } }))}
                                            rows={3}
                                        />
                                    </div>
                                     <div>
                                        <Label>Address Line (Tamil)</Label>
                                        <Textarea 
                                            placeholder="சாந்தோம் கம்யூனிகேஷன் சென்டர், J-9, லஸ் சர்ச் சாலை, மயிலாப்பூர் சென்னை - 600 004."
                                            value={footerContent.address_line?.value_tamil || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, address_line: { ...prev.address_line, value_tamil: e.target.value } }))}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => saveFooterSetting('address_line', footerContent.address_line?.value || '', footerContent.address_line?.value_tamil || '', 'Address Line')}
                                    className="mt-2"
                                    disabled={isLoading}
                                >
                                    Save Address
                                </Button>

                                <div>
                                    <Label>Email Address</Label>
                                    <Input 
                                        placeholder="info@madhatv.com"
                                        value={footerContent.email_address?.value || ''} 
                                        onChange={e => setFooterContent(prev => ({ ...prev, email_address: { ...prev.email_address, value: e.target.value } }))}
                                    />
                                    <Button 
                                        onClick={() => saveFooterSetting('email_address', footerContent.email_address?.value || '', '', 'Email Address')}
                                        className="mt-2"
                                        disabled={isLoading}
                                    >
                                        Save Email
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Phone Number 1</Label>
                                        <Input 
                                            placeholder="+044 24991244"
                                            value={footerContent.phone_1?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, phone_1: { ...prev.phone_1, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('phone_1', footerContent.phone_1?.value || '', '', 'Phone Number 1')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                    <div>
                                        <Label>Phone Number 2</Label>
                                        <Input 
                                            placeholder="+044 24993314"
                                            value={footerContent.phone_2?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, phone_2: { ...prev.phone_2, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('phone_2', footerContent.phone_2?.value || '', '', 'Phone Number 2')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="links" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5" />
                                        Quick Links
                                    </CardTitle>
                                    <Button onClick={addQuickLink}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Link
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quickLinks.map((link, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-3">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Link Label (English)</Label>
                                                <Input 
                                                    placeholder="Home"
                                                    value={link.label || ''} 
                                                    onChange={e => updateQuickLink(index, 'label', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Link Label (Tamil)</Label>
                                                <Input 
                                                    placeholder="முகப்பு"
                                                    value={link.label_tamil || ''} 
                                                    onChange={e => updateQuickLink(index, 'label_tamil', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Link URL</Label>
                                            <Input 
                                                placeholder="/"
                                                value={link.url || ''} 
                                                onChange={e => updateQuickLink(index, 'url', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => saveQuickLink(link, index)}
                                                disabled={isLoading}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </Button>
                                            {link.id && (
                                                <Button 
                                                    variant="destructive"
                                                    onClick={() => deleteItem(link.id, 'quick link')}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Live Events
                                    </CardTitle>
                                    <Button onClick={addLiveEvent}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Event
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {liveEvents.map((event, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-3">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Event/Location Name (English)</Label>
                                                <Input 
                                                    placeholder="SCC Chapel"
                                                    value={event.name || ''} 
                                                    onChange={e => updateLiveEvent(index, 'name', e.target.value)}
                                                />
                                            </div>
                                             <div>
                                                <Label>Event/Location Name (Tamil)</Label>
                                                <Input 
                                                    placeholder="எஸ்.சி.சி சேப்பல்"
                                                    value={event.name_tamil || ''} 
                                                    onChange={e => updateLiveEvent(index, 'name_tamil', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Redirect URL (Optional)</Label>
                                            <Input 
                                                placeholder="https://example.com/live-stream"
                                                value={event.redirect_url || ''} 
                                                onChange={e => updateLiveEvent(index, 'redirect_url', e.target.value)}
                                                />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => saveLiveEvent(event, index)}
                                                disabled={isLoading}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </Button>
                                            {event.id && (
                                                <Button 
                                                    variant="destructive"
                                                    onClick={() => deleteItem(event.id, 'live event')}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Social Media Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Instagram URL</Label>
                                        <Input 
                                            placeholder="https://instagram.com/madhatv"
                                            value={footerContent.instagram_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, instagram_url: { ...prev.instagram_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('instagram_url', footerContent.instagram_url?.value || '', '', 'Instagram URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                    <div>
                                        <Label>Facebook URL</Label>
                                        <Input 
                                            placeholder="https://facebook.com/madhatv"
                                            value={footerContent.facebook_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, facebook_url: { ...prev.facebook_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('facebook_url', footerContent.facebook_url?.value || '', '', 'Facebook URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>X (Twitter) URL</Label>
                                        <Input 
                                            placeholder="https://x.com/madhatv"
                                            value={footerContent.twitter_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, twitter_url: { ...prev.twitter_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('twitter_url', footerContent.twitter_url?.value || '', '', 'X (Twitter) URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                    <div>
                                        <Label>YouTube URL</Label>
                                        <Input 
                                            placeholder="https://youtube.com/@madhatv"
                                            value={footerContent.youtube_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, youtube_url: { ...prev.youtube_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('youtube_url', footerContent.youtube_url?.value || '', '', 'YouTube URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>

                                {/* YouTube Channels Section */}
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-medium text-sm text-slate-700 mb-3">YouTube Channel Links (Displayed next to YouTube icon)</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Channel 1 Name</Label>
                                            <Input 
                                                placeholder="Madha TV"
                                                value={footerContent.youtube_channel_1_name?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_1_name: { ...prev.youtube_channel_1_name, value: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Channel 1 URL</Label>
                                            <Input 
                                                placeholder="https://youtube.com/@madhatv"
                                                value={footerContent.youtube_channel_1_url?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_1_url: { ...prev.youtube_channel_1_url, value: e.target.value } }))}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            saveFooterSetting('youtube_channel_1_name', footerContent.youtube_channel_1_name?.value || '', '', 'YouTube Channel 1 Name');
                                            saveFooterSetting('youtube_channel_1_url', footerContent.youtube_channel_1_url?.value || '', '', 'YouTube Channel 1 URL');
                                        }}
                                        className="mt-2"
                                        disabled={isLoading}
                                    >
                                        Save Channel 1
                                    </Button>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <Label>Channel 2 Name</Label>
                                            <Input 
                                                placeholder="Madha TV Music"
                                                value={footerContent.youtube_channel_2_name?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_2_name: { ...prev.youtube_channel_2_name, value: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Channel 2 URL</Label>
                                            <Input 
                                                placeholder="https://youtube.com/@madhatvmusic"
                                                value={footerContent.youtube_channel_2_url?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_2_url: { ...prev.youtube_channel_2_url, value: e.target.value } }))}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            saveFooterSetting('youtube_channel_2_name', footerContent.youtube_channel_2_name?.value || '', '', 'YouTube Channel 2 Name');
                                            saveFooterSetting('youtube_channel_2_url', footerContent.youtube_channel_2_url?.value || '', '', 'YouTube Channel 2 URL');
                                        }}
                                        className="mt-2"
                                        disabled={isLoading}
                                    >
                                        Save Channel 2
                                    </Button>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <Label>Channel 3 Name</Label>
                                            <Input 
                                                placeholder="Madha TV Live"
                                                value={footerContent.youtube_channel_3_name?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_3_name: { ...prev.youtube_channel_3_name, value: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Channel 3 URL</Label>
                                            <Input 
                                                placeholder="https://youtube.com/@madhatvlive"
                                                value={footerContent.youtube_channel_3_url?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_3_url: { ...prev.youtube_channel_3_url, value: e.target.value } }))}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            saveFooterSetting('youtube_channel_3_name', footerContent.youtube_channel_3_name?.value || '', '', 'YouTube Channel 3 Name');
                                            saveFooterSetting('youtube_channel_3_url', footerContent.youtube_channel_3_url?.value || '', '', 'YouTube Channel 3 URL');
                                        }}
                                        className="mt-2"
                                        disabled={isLoading}
                                    >
                                        Save Channel 3
                                    </Button>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <Label>Channel 4 Name</Label>
                                            <Input 
                                                placeholder="Madha TV Kids"
                                                value={footerContent.youtube_channel_4_name?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_4_name: { ...prev.youtube_channel_4_name, value: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Channel 4 URL</Label>
                                            <Input 
                                                placeholder="https://youtube.com/@madhatvkids"
                                                value={footerContent.youtube_channel_4_url?.value || ''} 
                                                onChange={e => setFooterContent(prev => ({ ...prev, youtube_channel_4_url: { ...prev.youtube_channel_4_url, value: e.target.value } }))}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            saveFooterSetting('youtube_channel_4_name', footerContent.youtube_channel_4_name?.value || '', '', 'YouTube Channel 4 Name');
                                            saveFooterSetting('youtube_channel_4_url', footerContent.youtube_channel_4_url?.value || '', '', 'YouTube Channel 4 URL');
                                        }}
                                        className="mt-2"
                                        disabled={isLoading}
                                    >
                                        Save Channel 4
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Spotify URL</Label>
                                        <Input 
                                            placeholder="https://open.spotify.com/show/madhatv"
                                            value={footerContent.spotify_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, spotify_url: { ...prev.spotify_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('spotify_url', footerContent.spotify_url?.value || '', '', 'Spotify URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                    <div>
                                        <Label>Gaana URL</Label>
                                        <Input 
                                            placeholder="https://gaana.com/..."
                                            value={footerContent.gaana_url?.value || ''} 
                                            onChange={e => setFooterContent(prev => ({ ...prev, gaana_url: { ...prev.gaana_url, value: e.target.value } }))}
                                        />
                                        <Button 
                                            onClick={() => saveFooterSetting('gaana_url', footerContent.gaana_url?.value || '', '', 'Gaana URL')}
                                            className="mt-2"
                                            disabled={isLoading}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LinkIcon className="w-5 h-5" />
                                    Platform Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Watch on Platforms */}
                                <div className="border-b pb-4">
                                    <h4 className="font-semibold text-base text-slate-800 mb-4 flex items-center gap-2">
                                        <Tv className="w-5 h-5 text-[#B71C1C]" />
                                        Watch on Platforms
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Yupp TV URL</Label>
                                                <Input 
                                                    placeholder="https://yupptv.com/..."
                                                    value={footerContent.yupp_tv_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, yupp_tv_url: { ...prev.yupp_tv_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('yupp_tv_url', footerContent.yupp_tv_url?.value || '', '', 'Yupp TV URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                            <div>
                                                <Label>Roku TV URL</Label>
                                                <Input 
                                                    placeholder="https://roku.com/..."
                                                    value={footerContent.roku_tv_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, roku_tv_url: { ...prev.roku_tv_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('roku_tv_url', footerContent.roku_tv_url?.value || '', '', 'Roku TV URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Jio App URL</Label>
                                                <Input 
                                                    placeholder="https://jio.com/..."
                                                    value={footerContent.jio_app_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, jio_app_url: { ...prev.jio_app_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('jio_app_url', footerContent.jio_app_url?.value || '', '', 'Jio App URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                            <div>
                                                <Label>Live Radio URL</Label>
                                                <Input 
                                                    placeholder="https://liveradio.com/..."
                                                    value={footerContent.live_radio_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, live_radio_url: { ...prev.live_radio_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('live_radio_url', footerContent.live_radio_url?.value || '', '', 'Live Radio URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Podcasts */}
                                <div className="border-b pb-4">
                                    <h4 className="font-semibold text-base text-slate-800 mb-4 flex items-center gap-2">
                                        <Radio className="w-5 h-5 text-[#B71C1C]" />
                                        Podcasts
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Spotify Podcast URL</Label>
                                                <Input 
                                                    placeholder="https://open.spotify.com/show/..."
                                                    value={footerContent.spotify_podcast_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, spotify_podcast_url: { ...prev.spotify_podcast_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('spotify_podcast_url', footerContent.spotify_podcast_url?.value || '', '', 'Spotify Podcast URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                            <div>
                                                <Label>JioSaavn Podcast URL</Label>
                                                <Input 
                                                    placeholder="https://jiosaavn.com/..."
                                                    value={footerContent.jiosaavn_podcast_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, jiosaavn_podcast_url: { ...prev.jiosaavn_podcast_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('jiosaavn_podcast_url', footerContent.jiosaavn_podcast_url?.value || '', '', 'JioSaavn Podcast URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Amazon Music Podcast URL</Label>
                                                <Input 
                                                    placeholder="https://music.amazon.com/podcasts/..."
                                                    value={footerContent.amazon_podcast_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, amazon_podcast_url: { ...prev.amazon_podcast_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('amazon_podcast_url', footerContent.amazon_podcast_url?.value || '', '', 'Amazon Music Podcast URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                            <div>
                                                <Label>Apple Podcast URL</Label>
                                                <Input 
                                                    placeholder="https://podcasts.apple.com/..."
                                                    value={footerContent.apple_podcast_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, apple_podcast_url: { ...prev.apple_podcast_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('apple_podcast_url', footerContent.apple_podcast_url?.value || '', '', 'Apple Podcast URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Music */}
                                <div>
                                    <h4 className="font-semibold text-base text-slate-800 mb-4 flex items-center gap-2">
                                        <Music className="w-5 h-5 text-[#B71C1C]" />
                                        Music
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Spotify Music URL</Label>
                                                <Input 
                                                    placeholder="https://open.spotify.com/artist/..."
                                                    value={footerContent.spotify_music_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, spotify_music_url: { ...prev.spotify_music_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('spotify_music_url', footerContent.spotify_music_url?.value || '', '', 'Spotify Music URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                            <div>
                                                <Label>JioSaavn Music URL</Label>
                                                <Input 
                                                    placeholder="https://jiosaavn.com/..."
                                                    value={footerContent.jiosaavn_music_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, jiosaavn_music_url: { ...prev.jiosaavn_music_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('jiosaavn_music_url', footerContent.jiosaavn_music_url?.value || '', '', 'JioSaavn Music URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Amazon Music URL</Label>
                                                <Input 
                                                    placeholder="https://music.amazon.com/..."
                                                    value={footerContent.amazon_music_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, amazon_music_url: { ...prev.amazon_music_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('amazon_music_url', footerContent.amazon_music_url?.value || '', '', 'Amazon Music URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                            <div>
                                                <Label>Apple Music URL</Label>
                                                <Input 
                                                    placeholder="https://music.apple.com/..."
                                                    value={footerContent.apple_music_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, apple_music_url: { ...prev.apple_music_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('apple_music_url', footerContent.apple_music_url?.value || '', '', 'Apple Music URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Gaana Music URL</Label>
                                                <Input 
                                                    placeholder="https://gaana.com/..."
                                                    value={footerContent.gaana_music_url?.value || ''} 
                                                    onChange={e => setFooterContent(prev => ({ ...prev, gaana_music_url: { ...prev.gaana_music_url, value: e.target.value } }))}
                                                />
                                                <Button 
                                                    onClick={() => saveFooterSetting('gaana_music_url', footerContent.gaana_music_url?.value || '', '', 'Gaana Music URL')}
                                                    className="mt-2"
                                                    disabled={isLoading}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="lottie" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Lottie Animation Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Hero Corner Lottie */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label className="text-base font-medium">Hero Corner Animation</Label>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Show animated Lottie at the top corner of hero section
                                        </p>
                                    </div>
                                    <Switch
                                        checked={heroCornerLottieEnabled}
                                        onCheckedChange={(checked) => saveLottieSetting('hero_corner_lottie_enabled', checked, heroCornerLottieId, setHeroCornerLottieEnabled, setHeroCornerLottieId, 'Hero Corner Animation')}
                                        disabled={isLoading}
                                    />
                                </div>

                                {heroCornerLottieEnabled && (
                                    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                                        <div>
                                            <Label>Lottie Animation URL</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input 
                                                    placeholder="https://lottie.host/..."
                                                    value={heroCornerLottieUrl} 
                                                    onChange={e => setHeroCornerLottieUrl(e.target.value)}
                                                />
                                                <label className="cursor-pointer">
                                                    <input 
                                                        type="file" 
                                                        accept=".lottie,.json" 
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                                                    setHeroCornerLottieUrl(file_url);
                                                                    toast.success('Lottie file uploaded successfully');
                                                                } catch (error) {
                                                                    toast.error('Failed to upload file');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" variant="outline" asChild>
                                                        <span><Upload className="w-4 h-4 mr-2" />Upload</span>
                                                    </Button>
                                                </label>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => saveFooterSetting('hero_corner_lottie_url', heroCornerLottieUrl, '', 'Hero Corner Lottie URL')}
                                            disabled={isLoading}
                                            size="sm"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Lottie URL
                                        </Button>

                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Hero Corner Preview</Label>
                                            <div className="flex justify-center items-center py-4 bg-white rounded-lg">
                                                <dotlottie-wc 
                                                    src={heroCornerLottieUrl || "https://lottie.host/53d4239b-acc6-4489-85c6-99654726f5b7/KuxxWlFBwi.lottie"} 
                                                    style={{ width: '150px', height: '150px' }}
                                                    autoplay 
                                                    loop
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Hero Video Lottie */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label className="text-base font-medium">Hero Video Animation</Label>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Show animated Lottie above the live video area
                                        </p>
                                    </div>
                                    <Switch
                                        checked={heroVideoLottieEnabled}
                                        onCheckedChange={(checked) => saveLottieSetting('hero_video_lottie_enabled', checked, heroVideoLottieId, setHeroVideoLottieEnabled, setHeroVideoLottieId, 'Hero Video Animation')}
                                        disabled={isLoading}
                                    />
                                </div>

                                {heroVideoLottieEnabled && (
                                    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                                        <div>
                                            <Label>Lottie Animation URL</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input 
                                                    placeholder="https://lottie.host/..."
                                                    value={heroVideoLottieUrl} 
                                                    onChange={e => setHeroVideoLottieUrl(e.target.value)}
                                                />
                                                <label className="cursor-pointer">
                                                    <input 
                                                        type="file" 
                                                        accept=".lottie,.json" 
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                                                    setHeroVideoLottieUrl(file_url);
                                                                    toast.success('Lottie file uploaded successfully');
                                                                } catch (error) {
                                                                    toast.error('Failed to upload file');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" variant="outline" asChild>
                                                        <span><Upload className="w-4 h-4 mr-2" />Upload</span>
                                                    </Button>
                                                </label>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => saveFooterSetting('hero_video_lottie_url', heroVideoLottieUrl, '', 'Hero Video Lottie URL')}
                                            disabled={isLoading}
                                            size="sm"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Lottie URL
                                        </Button>

                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Hero Video Preview</Label>
                                            <div className="flex justify-center items-center py-4 bg-white rounded-lg">
                                                <dotlottie-wc 
                                                    src={heroVideoLottieUrl || "https://lottie.host/b883e645-089b-4c82-a2a7-dbb0cc90501d/E9T9D5ZDbo.lottie"} 
                                                    style={{ width: '150px', height: '150px' }}
                                                    autoplay 
                                                    loop
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer Decoration */}
                                <div className="border-t pt-6 mt-6">
                                    <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                        Footer Decoration Image
                                    </h4>
                                    
                                    <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                                        <div>
                                            <Label className="text-base font-medium">Enable Footer Decoration</Label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Show decorative image at the top-left corner of the footer
                                            </p>
                                        </div>
                                        <Switch
                                            checked={footerDecorationEnabled}
                                            onCheckedChange={(checked) => {
                                                setFooterDecorationEnabled(checked);
                                                saveFooterSetting('footer_decoration_enabled', checked ? 'true' : 'false', '', 'Footer Decoration Enabled');
                                            }}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Decoration Image URL</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input 
                                                    placeholder="https://example.com/decoration.png"
                                                    value={footerDecorationImage} 
                                                    onChange={e => setFooterDecorationImage(e.target.value)}
                                                />
                                                <label className="cursor-pointer">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                                                    setFooterDecorationImage(file_url);
                                                                    toast.success('Image uploaded successfully');
                                                                } catch (error) {
                                                                    toast.error('Failed to upload image');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" variant="outline" asChild>
                                                        <span><Upload className="w-4 h-4 mr-2" />Upload</span>
                                                    </Button>
                                                </label>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => saveFooterSetting('footer_decoration_image', footerDecorationImage, '', 'Footer Decoration Image')}
                                            disabled={isLoading}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Decoration Image
                                        </Button>

                                        {footerDecorationImage && (
                                            <div className="border rounded-lg p-4 bg-gray-50">
                                                <Label className="text-sm font-medium mb-3 block">Preview</Label>
                                                <div className="flex justify-center items-center py-4 bg-[#1e2a47] rounded-lg">
                                                    <img 
                                                        src={footerDecorationImage} 
                                                        alt="Footer Decoration Preview" 
                                                        className="max-h-32 object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
    
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}