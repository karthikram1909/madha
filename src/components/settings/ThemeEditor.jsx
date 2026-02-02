import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette, Save } from 'lucide-react';

const THEME_SETTINGS = [
    { key: 'primary_color', title: 'Primary Color', type: 'color', defaultValue: '#B71C1C' },
    { key: 'secondary_color', title: 'Secondary Color', type: 'color', defaultValue: '#D32F2F' }
];

export default function ThemeEditor() {
    const [theme, setTheme] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        setIsLoading(true);
        try {
            const content = await WebsiteContent.filter({ section: 'theme' });
            const settings = content.reduce((acc, item) => {
                acc[item.content_key] = { id: item.id, value: item.content_value };
                return acc;
            }, {});
            
            // Set defaults if not present
            THEME_SETTINGS.forEach(setting => {
                if (!settings[setting.key]) {
                    settings[setting.key] = { value: setting.defaultValue };
                }
            });

            setTheme(settings);
        } catch (error) {
            console.error("Failed to load theme:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async (key) => {
        setIsLoading(true);
        try {
            const setting = theme[key];
            const settingInfo = THEME_SETTINGS.find(s => s.key === key);
            const payload = {
                section: 'theme',
                content_key: key,
                content_type: settingInfo.type,
                title: settingInfo.title,
                content_value: setting.value,
                is_active: true
            };

            if (setting.id) {
                await WebsiteContent.update(setting.id, payload);
            } else {
                await WebsiteContent.create(payload);
            }
            await loadTheme();
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
        }
        setIsLoading(false);
    };

    const handleChange = (key, value) => {
        setTheme(prev => ({
            ...prev,
            [key]: { ...prev[key], value }
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-slate-500" /> Website Theme
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {THEME_SETTINGS.map(setting => (
                    <div key={setting.key}>
                        <Label htmlFor={setting.key}>{setting.title}</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <input
                                id={setting.key}
                                type={setting.type}
                                value={theme[setting.key]?.value || setting.defaultValue}
                                onChange={(e) => handleChange(setting.key, e.target.value)}
                                className="h-10 w-16 p-1 border border-slate-300 rounded-md"
                            />
                            <span className="font-mono text-slate-500">{theme[setting.key]?.value || setting.defaultValue}</span>
                        </div>
                    </div>
                ))}
                <div className="flex justify-end">
                    <Button onClick={() => THEME_SETTINGS.forEach(s => handleSave(s.key))} disabled={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving All...' : 'Save All Changes'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}