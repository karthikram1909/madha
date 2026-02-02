import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialMediaSettings({ floatingUIItems, loadContent }) {
    const [isSaving, setIsSaving] = useState(false);
    
    // Initialize state from props
    const [formData, setFormData] = useState({
        instagram_url: '',
        instagram_enabled: true,
        facebook_url: '',
        facebook_enabled: true
    });

    useEffect(() => {
        const instagramUrlItem = floatingUIItems.find(item => item.content_key === 'instagram_url');
        const instagramEnabledItem = floatingUIItems.find(item => item.content_key === 'instagram_enabled');
        const facebookUrlItem = floatingUIItems.find(item => item.content_key === 'facebook_url');
        const facebookEnabledItem = floatingUIItems.find(item => item.content_key === 'facebook_enabled');

        setFormData({
            instagram_url: instagramUrlItem?.content_value || '',
            instagram_enabled: instagramEnabledItem?.content_value !== 'false',
            facebook_url: facebookUrlItem?.content_value || '',
            facebook_enabled: facebookEnabledItem?.content_value !== 'false',
            instagramUrlItem,
            instagramEnabledItem,
            facebookUrlItem,
            facebookEnabledItem
        });
    }, [floatingUIItems]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Instagram URL
            if (formData.instagramUrlItem) {
                await WebsiteContent.update(formData.instagramUrlItem.id, {
                    content_value: formData.instagram_url
                });
            } else if (formData.instagram_url) {
                await WebsiteContent.create({
                    section: 'floating_ui',
                    content_key: 'instagram_url',
                    content_type: 'link',
                    title: 'Instagram URL',
                    content_value: formData.instagram_url,
                    is_active: true,
                    display_order: 0
                });
            }

            // Save Instagram enabled status
            if (formData.instagramEnabledItem) {
                await WebsiteContent.update(formData.instagramEnabledItem.id, {
                    content_value: String(formData.instagram_enabled)
                });
            } else {
                await WebsiteContent.create({
                    section: 'floating_ui',
                    content_key: 'instagram_enabled',
                    content_type: 'text',
                    title: 'Instagram Enabled',
                    content_value: String(formData.instagram_enabled),
                    is_active: true,
                    display_order: 0
                });
            }

            // Save Facebook URL
            if (formData.facebookUrlItem) {
                await WebsiteContent.update(formData.facebookUrlItem.id, {
                    content_value: formData.facebook_url
                });
            } else if (formData.facebook_url) {
                await WebsiteContent.create({
                    section: 'floating_ui',
                    content_key: 'facebook_url',
                    content_type: 'link',
                    title: 'Facebook URL',
                    content_value: formData.facebook_url,
                    is_active: true,
                    display_order: 0
                });
            }

            // Save Facebook enabled status
            if (formData.facebookEnabledItem) {
                await WebsiteContent.update(formData.facebookEnabledItem.id, {
                    content_value: String(formData.facebook_enabled)
                });
            } else {
                await WebsiteContent.create({
                    section: 'floating_ui',
                    content_key: 'facebook_enabled',
                    content_type: 'text',
                    title: 'Facebook Enabled',
                    content_value: String(formData.facebook_enabled),
                    is_active: true,
                    display_order: 0
                });
            }

            toast.success('Social media settings saved successfully!');
            loadContent();
        } catch (error) {
            console.error('Error saving social media settings:', error);
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Social Media Icons</CardTitle>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#B71C1C] hover:bg-[#D32F2F]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Floating Social Icons</h4>
                            <p className="text-sm text-blue-800">
                                Configure the Instagram and Facebook icons that appear in the floating UI on the home page.
                                You can set the URLs and toggle their visibility.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Instagram Settings */}
                <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Instagram</h3>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="instagram-enabled" className="text-sm">
                                {formData.instagram_enabled ? 'Visible' : 'Hidden'}
                            </Label>
                            <Switch
                                id="instagram-enabled"
                                checked={formData.instagram_enabled}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, instagram_enabled: checked }))}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="instagram-url" className="text-sm font-medium text-slate-700">
                            Instagram Profile URL
                        </Label>
                        <Input
                            id="instagram-url"
                            value={formData.instagram_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                            placeholder="https://instagram.com/madhatv"
                            className="mt-2"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Enter your Instagram profile or page URL
                        </p>
                    </div>
                </div>

                {/* Facebook Settings */}
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Facebook</h3>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="facebook-enabled" className="text-sm">
                                {formData.facebook_enabled ? 'Visible' : 'Hidden'}
                            </Label>
                            <Switch
                                id="facebook-enabled"
                                checked={formData.facebook_enabled}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, facebook_enabled: checked }))}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="facebook-url" className="text-sm font-medium text-slate-700">
                            Facebook Page URL
                        </Label>
                        <Input
                            id="facebook-url"
                            value={formData.facebook_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                            placeholder="https://facebook.com/madhatv"
                            className="mt-2"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Enter your Facebook page or profile URL
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}