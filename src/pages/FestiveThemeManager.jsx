import React, { useState, useEffect } from 'react';
import { FestiveTheme } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from 'sonner';
import { Sparkles, TreePine, PartyPopper, Save, Upload, Move, Palette } from 'lucide-react';
import PageBanner from '@/components/website/PageBanner';
import { base44 } from '@/api/base44Client';

export default function FestiveThemeManager() {
    const [settings, setSettings] = useState({
        theme_type: 'none',
        is_active: false,
        show_santa_cap: true,
        santa_cap_offset_x: -10,
        santa_cap_offset_y: -15,
        show_santa_sleigh: true,
        show_christmas_tree: true,
        christmas_tree_position: 'bottom-left',
        show_christmas_toys: true,
        show_cake: true,
        cake_position: 'bottom-right',
        show_gift_box: true,
        gift_position: 'top-right',
        show_snowfall: true,
        snowfall_intensity: 'medium',
        show_sparkles: true,
        sparkle_count: 15,
        show_lights: true,
        show_fireworks: true,
        custom_santa_cap_url: '',
        custom_sleigh_gif_url: '',
        // Color palette
        primary_color: '#B71C1C',
        secondary_color: '#1B5E20',
        accent_color: '#FFD700',
        text_color: '#FFFFFF'
    });
    const [existingId, setExistingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const themes = await FestiveTheme.list();
            if (themes && themes.length > 0) {
                setSettings({ ...settings, ...themes[0] });
                setExistingId(themes[0].id);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (existingId) {
                await FestiveTheme.update(existingId, settings);
            } else {
                const created = await FestiveTheme.create(settings);
                setExistingId(created.id);
            }
            toast.success('Festive theme settings saved! Changes will appear on the website shortly.');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        }
        setIsSaving(false);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleImageUpload = async (e, settingKey) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            updateSetting(settingKey, file_url);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B71C1C]"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <PageBanner 
                pageKey="festive_theme"
                fallbackTitle="Festive Theme Manager"
                fallbackDescription="Add festive decorations and effects to your website"
                fallbackImage="https://images.unsplash.com/photo-1482517967863-00e15c9b44be?q=80&w=2940&auto=format&fit=crop"
            />

            <div className="p-6 md:p-8 max-w-5xl mx-auto -mt-8 relative z-10 space-y-6">
                {/* Main Toggle Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Festive Theme Settings
                        </CardTitle>
                        <CardDescription>
                            Enable festive decorations on your website for special occasions. All elements are customizable and toggleable.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Master Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-green-50 rounded-lg border border-red-100">
                            <div>
                                <Label className="text-base font-medium">Enable Festive Theme</Label>
                                <p className="text-sm text-slate-500">Turn on festive decorations site-wide</p>
                            </div>
                            <Switch
                                checked={settings.is_active}
                                onCheckedChange={(checked) => updateSetting('is_active', checked)}
                            />
                        </div>

                        {/* Theme Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Select Theme</Label>
                            <RadioGroup
                                value={settings.theme_type}
                                onValueChange={(value) => updateSetting('theme_type', value)}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.theme_type === 'none' ? 'border-[#B71C1C] bg-red-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <RadioGroupItem value="none" id="none" className="sr-only" />
                                    <Label htmlFor="none" className="cursor-pointer flex flex-col items-center gap-2">
                                        <span className="text-4xl">🚫</span>
                                        <span className="font-medium">No Theme</span>
                                        <span className="text-xs text-slate-500">Default website</span>
                                    </Label>
                                </div>
                                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.theme_type === 'christmas' ? 'border-[#B71C1C] bg-red-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <RadioGroupItem value="christmas" id="christmas" className="sr-only" />
                                    <Label htmlFor="christmas" className="cursor-pointer flex flex-col items-center gap-2">
                                        <span className="text-4xl">🎄</span>
                                        <span className="font-medium">Christmas</span>
                                        <span className="text-xs text-slate-500">Santa, tree, gifts & more</span>
                                    </Label>
                                </div>
                                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.theme_type === 'newyear' ? 'border-[#B71C1C] bg-red-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <RadioGroupItem value="newyear" id="newyear" className="sr-only" />
                                    <Label htmlFor="newyear" className="cursor-pointer flex flex-col items-center gap-2">
                                        <span className="text-4xl">🎆</span>
                                        <span className="font-medium">New Year</span>
                                        <span className="text-xs text-slate-500">Fireworks & lights</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>

                {/* Christmas Elements */}
                {settings.theme_type === 'christmas' && (
                    <>
                        {/* Color Palette Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-purple-600" />
                                    Christmas Color Palette
                                </CardTitle>
                                <CardDescription>
                                    Customize the website color theme for Christmas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Primary Color</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.primary_color || '#B71C1C'}
                                                onChange={(e) => updateSetting('primary_color', e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer border-2 border-slate-200"
                                            />
                                            <Input
                                                value={settings.primary_color || '#B71C1C'}
                                                onChange={(e) => updateSetting('primary_color', e.target.value)}
                                                className="flex-1 text-sm"
                                                placeholder="#B71C1C"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Red (Christmas Red)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Secondary Color</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.secondary_color || '#1B5E20'}
                                                onChange={(e) => updateSetting('secondary_color', e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer border-2 border-slate-200"
                                            />
                                            <Input
                                                value={settings.secondary_color || '#1B5E20'}
                                                onChange={(e) => updateSetting('secondary_color', e.target.value)}
                                                className="flex-1 text-sm"
                                                placeholder="#1B5E20"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Green (Christmas Green)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Accent Color</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.accent_color || '#FFD700'}
                                                onChange={(e) => updateSetting('accent_color', e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer border-2 border-slate-200"
                                            />
                                            <Input
                                                value={settings.accent_color || '#FFD700'}
                                                onChange={(e) => updateSetting('accent_color', e.target.value)}
                                                className="flex-1 text-sm"
                                                placeholder="#FFD700"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Gold (Star/Highlights)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Text Color</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.text_color || '#FFFFFF'}
                                                onChange={(e) => updateSetting('text_color', e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer border-2 border-slate-200"
                                            />
                                            <Input
                                                value={settings.text_color || '#FFFFFF'}
                                                onChange={(e) => updateSetting('text_color', e.target.value)}
                                                className="flex-1 text-sm"
                                                placeholder="#FFFFFF"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">White (Snow/Text)</p>
                                    </div>
                                </div>
                                {/* Color Preview */}
                                <div className="mt-4 p-4 rounded-lg" style={{ 
                                    background: `linear-gradient(135deg, ${settings.primary_color || '#B71C1C'} 0%, ${settings.secondary_color || '#1B5E20'} 100%)` 
                                }}>
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-bold" style={{ color: settings.accent_color || '#FFD700' }}>
                                            ✨ Christmas Theme Preview ✨
                                        </p>
                                        <p className="text-xs" style={{ color: settings.text_color || '#FFFFFF' }}>
                                            This is how your color palette will look
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Santa Cap Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🎅 Santa Cap on Logo
                                </CardTitle>
                                <CardDescription>
                                    Add a Santa cap overlay on your website logo
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎅</span>
                                        <Label>Show Santa Cap</Label>
                                    </div>
                                    <Switch
                                        checked={settings.show_santa_cap}
                                        onCheckedChange={(checked) => updateSetting('show_santa_cap', checked)}
                                    />
                                </div>
                                
                                {settings.show_santa_cap && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Move className="w-4 h-4" />
                                                Horizontal Offset: {settings.santa_cap_offset_x}px
                                            </Label>
                                            <Slider
                                                value={[settings.santa_cap_offset_x]}
                                                onValueChange={([val]) => updateSetting('santa_cap_offset_x', val)}
                                                min={-50}
                                                max={50}
                                                step={1}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Move className="w-4 h-4" />
                                                Vertical Offset: {settings.santa_cap_offset_y}px
                                            </Label>
                                            <Slider
                                                value={[settings.santa_cap_offset_y]}
                                                onValueChange={([val]) => updateSetting('santa_cap_offset_y', val)}
                                                min={-50}
                                                max={50}
                                                step={1}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Custom Santa Cap Image (optional)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={settings.custom_santa_cap_url || ''}
                                                    onChange={(e) => updateSetting('custom_santa_cap_url', e.target.value)}
                                                    placeholder="Enter image URL or upload"
                                                />
                                                <Label className="cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(e, 'custom_santa_cap_url')}
                                                    />
                                                    <Button type="button" variant="outline" size="icon" asChild>
                                                        <span><Upload className="w-4 h-4" /></span>
                                                    </Button>
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Santa Sleigh Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🛷 Santa Sleigh Animation
                                </CardTitle>
                                <CardDescription>
                                    Animated Santa sleigh flying across the screen on page load
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🛷</span>
                                        <Label>Show Santa Sleigh</Label>
                                    </div>
                                    <Switch
                                        checked={settings.show_santa_sleigh}
                                        onCheckedChange={(checked) => updateSetting('show_santa_sleigh', checked)}
                                    />
                                </div>
                                
                                {settings.show_santa_sleigh && (
                                    <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                                        <Label>Custom Sleigh GIF (optional)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={settings.custom_sleigh_gif_url || ''}
                                                onChange={(e) => updateSetting('custom_sleigh_gif_url', e.target.value)}
                                                placeholder="Enter GIF URL or upload"
                                            />
                                            <Label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/gif"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(e, 'custom_sleigh_gif_url')}
                                                />
                                                <Button type="button" variant="outline" size="icon" asChild>
                                                    <span><Upload className="w-4 h-4" /></span>
                                                </Button>
                                            </Label>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Decorations Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TreePine className="w-5 h-5 text-green-600" />
                                    Christmas Decorations
                                </CardTitle>
                                <CardDescription>
                                    Toggle and position Christmas decorations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Christmas Tree */}
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🎄</span>
                                                <Label>Christmas Tree</Label>
                                            </div>
                                            <Switch
                                                checked={settings.show_christmas_tree}
                                                onCheckedChange={(checked) => updateSetting('show_christmas_tree', checked)}
                                            />
                                        </div>
                                        {settings.show_christmas_tree && (
                                            <Select
                                                value={settings.christmas_tree_position}
                                                onValueChange={(val) => updateSetting('christmas_tree_position', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Gift Box */}
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🎁</span>
                                                <Label>Gift Box</Label>
                                            </div>
                                            <Switch
                                                checked={settings.show_gift_box}
                                                onCheckedChange={(checked) => updateSetting('show_gift_box', checked)}
                                            />
                                        </div>
                                        {settings.show_gift_box && (
                                            <Select
                                                value={settings.gift_position}
                                                onValueChange={(val) => updateSetting('gift_position', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="top-left">Top Left</SelectItem>
                                                    <SelectItem value="top-right">Top Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Cake */}
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🎂</span>
                                                <Label>Christmas Cake</Label>
                                            </div>
                                            <Switch
                                                checked={settings.show_cake}
                                                onCheckedChange={(checked) => updateSetting('show_cake', checked)}
                                            />
                                        </div>
                                        {settings.show_cake && (
                                            <Select
                                                value={settings.cake_position}
                                                onValueChange={(val) => updateSetting('cake_position', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Toys */}
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🔔</span>
                                                <Label>Christmas Toys & Ornaments</Label>
                                            </div>
                                            <Switch
                                                checked={settings.show_christmas_toys}
                                                onCheckedChange={(checked) => updateSetting('show_christmas_toys', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Effects Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    ❄️ Effects
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Snowfall */}
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">❄️</span>
                                                <Label>Snowfall Effect</Label>
                                            </div>
                                            <Switch
                                                checked={settings.show_snowfall}
                                                onCheckedChange={(checked) => updateSetting('show_snowfall', checked)}
                                            />
                                        </div>
                                        {settings.show_snowfall && (
                                            <Select
                                                value={settings.snowfall_intensity}
                                                onValueChange={(val) => updateSetting('snowfall_intensity', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="heavy">Heavy</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Sparkles */}
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">✨</span>
                                                <Label>Sparkle Effects</Label>
                                            </div>
                                            <Switch
                                                checked={settings.show_sparkles}
                                                onCheckedChange={(checked) => updateSetting('show_sparkles', checked)}
                                            />
                                        </div>
                                        {settings.show_sparkles && (
                                            <div className="space-y-2">
                                                <Label className="text-sm">Count: {settings.sparkle_count}</Label>
                                                <Slider
                                                    value={[settings.sparkle_count]}
                                                    onValueChange={([val]) => updateSetting('sparkle_count', val)}
                                                    min={5}
                                                    max={30}
                                                    step={1}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* New Year Elements */}
                {settings.theme_type === 'newyear' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PartyPopper className="w-5 h-5 text-purple-600" />
                                New Year Decorations
                            </CardTitle>
                            <CardDescription>
                                Choose which New Year elements to display
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✨</span>
                                        <Label>Sparkle Effects</Label>
                                    </div>
                                    <Switch
                                        checked={settings.show_sparkles}
                                        onCheckedChange={(checked) => updateSetting('show_sparkles', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💡</span>
                                        <Label>Light String</Label>
                                    </div>
                                    <Switch
                                        checked={settings.show_lights}
                                        onCheckedChange={(checked) => updateSetting('show_lights', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎆</span>
                                        <Label>Fireworks</Label>
                                    </div>
                                    <Switch
                                        checked={settings.show_fireworks}
                                        onCheckedChange={(checked) => updateSetting('show_fireworks', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">❄️</span>
                                        <Label>Snowfall Effect</Label>
                                    </div>
                                    <Switch
                                        checked={settings.show_snowfall}
                                        onCheckedChange={(checked) => updateSetting('show_snowfall', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={loadSettings}>
                        Reset
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-[#B71C1C] hover:bg-[#8B0000]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>

                {/* Live Preview Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>
                            This preview shows how festive elements will appear. Save to apply changes to the website.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl h-80 overflow-hidden">
                            {/* Mock navbar */}
                            <div className="absolute top-0 left-0 right-0 bg-black/50 p-2 flex items-center">
                                <div className="relative">
                                    <div className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">madha</div>
                                    {settings.is_active && settings.theme_type === 'christmas' && settings.show_santa_cap && (
                                        <span className="absolute -top-2 -left-1 text-lg" style={{ transform: 'rotate(-25deg)' }}>🎅</span>
                                    )}
                                </div>
                            </div>
                            
                            {settings.is_active && settings.theme_type !== 'none' && (
                                <>
                                    {/* Preview snowfall */}
                                    {settings.show_snowfall && (
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            {Array.from({ length: 15 }).map((_, i) => (
                                                <span 
                                                    key={i} 
                                                    className="absolute text-white animate-bounce"
                                                    style={{ 
                                                        left: `${i * 7}%`, 
                                                        top: `${Math.random() * 60}%`,
                                                        animationDelay: `${i * 0.15}s`,
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    ❄
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Preview sparkles */}
                                    {settings.show_sparkles && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <span 
                                                    key={i} 
                                                    className="absolute animate-pulse"
                                                    style={{ 
                                                        left: `${15 + i * 10}%`, 
                                                        top: `${20 + i * 8}%`
                                                    }}
                                                >
                                                    ✨
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Christmas preview */}
                                    {settings.theme_type === 'christmas' && (
                                        <>
                                            {settings.show_christmas_tree && (
                                                <span className={`absolute bottom-4 ${settings.christmas_tree_position === 'bottom-right' ? 'right-4' : 'left-4'} text-4xl`}>🎄</span>
                                            )}
                                            {settings.show_gift_box && (
                                                <span className={`absolute ${settings.gift_position === 'top-left' ? 'top-12 left-4' : 'top-12 right-4'} text-2xl animate-bounce`}>🎁</span>
                                            )}
                                            {settings.show_christmas_toys && (
                                                <>
                                                    <span className="absolute top-16 right-12 text-xl animate-pulse">🔔</span>
                                                    <span className="absolute bottom-16 left-8 text-xl">🎅</span>
                                                </>
                                            )}
                                            {settings.show_cake && (
                                                <span className={`absolute bottom-4 ${settings.cake_position === 'bottom-left' ? 'left-16' : 'right-4'} text-3xl`}>🎂</span>
                                            )}
                                            {settings.show_santa_sleigh && (
                                                <span className="absolute top-8 left-1/4 text-2xl animate-pulse">🛷</span>
                                            )}
                                        </>
                                    )}

                                    {/* New Year preview */}
                                    {settings.theme_type === 'newyear' && (
                                        <>
                                            {settings.show_lights && (
                                                <div className="absolute top-0 left-0 right-0 flex justify-around p-1">
                                                    {['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff8800'].map((color, i) => (
                                                        <div 
                                                            key={i}
                                                            className="w-2 h-2 rounded-full animate-pulse"
                                                            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            {settings.show_fireworks && (
                                                <>
                                                    <span className="absolute top-1/4 left-1/4 text-3xl animate-ping">🎆</span>
                                                    <span className="absolute top-1/3 right-1/4 text-3xl animate-ping" style={{ animationDelay: '0.5s' }}>🎇</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                            
                            {(!settings.is_active || settings.theme_type === 'none') && (
                                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                    <p>Enable a theme to see preview</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}