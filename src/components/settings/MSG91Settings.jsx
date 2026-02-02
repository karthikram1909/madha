import React, { useState, useEffect } from 'react';
import { MSG91Config } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, TestTube } from 'lucide-react';

export default function MSG91Settings() {
  const [config, setConfig] = useState({
    auth_key: '',
    sender_id: '',
    template_id: '',
    is_enabled: false,
    test_mode: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await MSG91Config.list();
      if (configs.length > 0) {
        setConfig(configs[0]);
      }
    } catch (error) {
      console.error("Error loading MSG91 config:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configs = await MSG91Config.list();
      
      if (configs.length > 0) {
        await MSG91Config.update(configs[0].id, config);
      } else {
        await MSG91Config.create(config);
      }
      
      await loadConfig();
    } catch (error) {
      console.error("Error saving MSG91 config:", error);
    }
    setIsSaving(false);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          MSG91 OTP Configuration
        </CardTitle>
        <p className="text-sm text-slate-600">
          Configure MSG91 SMS gateway for OTP verification in donations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Indicators */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Badge variant={config.is_enabled ? "default" : "secondary"}>
              {config.is_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={config.test_mode ? "destructive" : "default"}>
              {config.test_mode ? "Test Mode (OTP: 1234)" : "Production Mode"}
            </Badge>
          </div>
        </div>

        {/* Configuration Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="auth_key">MSG91 Auth Key *</Label>
            <Input
              id="auth_key"
              type="password"
              value={config.auth_key}
              onChange={(e) => handleChange('auth_key', e.target.value)}
              placeholder="Enter MSG91 Authentication Key"
            />
            <p className="text-xs text-slate-500 mt-1">
              Get your auth key from MSG91 dashboard
            </p>
          </div>

          <div>
            <Label htmlFor="sender_id">Sender ID *</Label>
            <Input
              id="sender_id"
              value={config.sender_id}
              onChange={(e) => handleChange('sender_id', e.target.value)}
              placeholder="e.g., MADHTV"
              maxLength={6}
            />
            <p className="text-xs text-slate-500 mt-1">
              6-character sender ID (approved by MSG91)
            </p>
          </div>

          <div>
            <Label htmlFor="template_id">Template ID</Label>
            <Input
              id="template_id"
              value={config.template_id}
              onChange={(e) => handleChange('template_id', e.target.value)}
              placeholder="MSG91 Template ID (optional)"
            />
            <p className="text-xs text-slate-500 mt-1">
              Pre-approved template ID for OTP messages
            </p>
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable MSG91 OTP</Label>
              <p className="text-sm text-slate-500">
                Enable SMS OTP verification for donations
              </p>
            </div>
            <Switch
              checked={config.is_enabled}
              onCheckedChange={(checked) => handleChange('is_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Test Mode</Label>
              <p className="text-sm text-slate-500">
                Use dummy OTP (1234) instead of real SMS
              </p>
            </div>
            <Switch
              checked={config.test_mode}
              onCheckedChange={(checked) => handleChange('test_mode', checked)}
            />
          </div>
        </div>

        {/* Important Notes */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <TestTube className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-2">Development Notes:</p>
                <ul className="space-y-1">
                  <li>• Test mode uses dummy OTP "1234" for development</li>
                  <li>• Production mode requires valid MSG91 credentials</li>
                  <li>• Template ID is optional but recommended for better delivery</li>
                  <li>• Sender ID must be approved by MSG91</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          disabled={isSaving || !config.auth_key || !config.sender_id}
          className="w-full bg-[#B71C1C] hover:bg-[#D32F2F]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving Configuration...' : 'Save MSG91 Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}