import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from 'lucide-react';

const SECURITY_SETTINGS = [
  { key: 'enable_admin_2fa', title: 'Enable Two-Factor Authentication for Admins', description: 'Admins will be required to verify their login with a code sent to their email or phone.' },
  { key: 'enable_recaptcha', title: 'Enable Google reCAPTCHA on Public Forms', description: 'Protects donation, booking, and feedback forms from spam and bots.' }
];

export default function SecuritySettings() {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const content = await WebsiteContent.filter({ section: 'security' });
      const currentSettings = content.reduce((acc, item) => {
        acc[item.content_key] = { id: item.id, value: item.content_value === 'true' };
        return acc;
      }, {});
      setSettings(currentSettings);
    } catch (error) {
      console.error("Failed to load security settings:", error);
    }
    setIsLoading(false);
  };

  const handleToggle = async (key) => {
    const newValue = !settings[key]?.value;
    
    // Optimistic update
    setSettings(prev => ({ ...prev, [key]: { ...prev[key], value: newValue }}));

    try {
      const existingSetting = settings[key];
      const settingInfo = SECURITY_SETTINGS.find(s => s.key === key);
      const payload = {
        section: 'security',
        content_key: key,
        content_type: 'text',
        title: settingInfo.title,
        content_value: String(newValue),
        is_active: true
      };

      if (existingSetting?.id) {
        await WebsiteContent.update(existingSetting.id, payload);
      } else {
        await WebsiteContent.create(payload);
      }
      await loadSettings();
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      // Revert optimistic update
      setSettings(prev => ({ ...prev, [key]: { ...prev[key], value: !newValue }}));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-500" /> Security Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {SECURITY_SETTINGS.map(setting => (
          <div key={setting.key} className="flex items-start justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor={setting.key} className="text-base font-medium">{setting.title}</Label>
              <p className="text-sm text-slate-500 mt-1">{setting.description}</p>
            </div>
            <Switch
              id={setting.key}
              checked={settings[setting.key]?.value || false}
              onCheckedChange={() => handleToggle(setting.key)}
              disabled={isLoading}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}