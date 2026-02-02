import React, { useState, useEffect } from 'react';
import { RazorpayConfig } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function RazorpaySettings({ configType }) {
  const [config, setConfig] = useState({
    config_type: configType,
    key_id: '',
    key_secret: '',
    webhook_secret: '',
    is_enabled: true
  });
  const [dbId, setDbId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [configType]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await RazorpayConfig.filter({ config_type: configType });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setDbId(configs[0].id);
      } else {
        setConfig({
            config_type: configType,
            key_id: '',
            key_secret: '',
            webhook_secret: '',
            is_enabled: true
        });
        setDbId(null);
      }
    } catch (error) {
      console.error(`Error loading Razorpay config for ${configType}:`, error);
      toast.error(`Failed to load Razorpay config.`);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = { ...config, config_type: configType };
      if (dbId) {
        await RazorpayConfig.update(dbId, payload);
      } else {
        const newConfig = await RazorpayConfig.create(payload);
        setDbId(newConfig.id);
      }
      toast.success('Razorpay settings saved successfully!');
    } catch (error) {
      console.error("Error saving Razorpay config:", error);
      toast.error('Failed to save settings.');
    }
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 capitalize">
          <Wallet className="w-5 h-5 text-sky-600" />
          Razorpay Settings for {configType}
        </CardTitle>
        <CardDescription>
          Configure Razorpay API keys for processing payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="key_id">Razorpay Key ID</Label>
            <Input
              id="key_id"
              value={config.key_id}
              onChange={(e) => handleChange('key_id', e.target.value)}
              placeholder="e.g., rzp_live_xxxxxxxxxxxxxx"
            />
          </div>
          <div>
            <Label htmlFor="key_secret">Razorpay Key Secret</Label>
            <Input
              id="key_secret"
              type="password"
              value={config.key_secret}
              onChange={(e) => handleChange('key_secret', e.target.value)}
              placeholder="Enter your Razorpay key secret"
            />
          </div>
           <div>
            <Label htmlFor="webhook_secret">Webhook Secret</Label>
            <Input
              id="webhook_secret"
              type="password"
              value={config.webhook_secret}
              onChange={(e) => handleChange('webhook_secret', e.target.value)}
              placeholder="Enter your Razorpay webhook secret"
            />
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label className="text-base font-medium">Enable Razorpay</Label>
            <p className="text-sm text-slate-500">
              Allow payments through Razorpay checkout.
            </p>
          </div>
          <Switch
            checked={config.is_enabled}
            onCheckedChange={(checked) => handleChange('is_enabled', checked)}
          />
        </div>
        <Button 
          onClick={handleSave}
          disabled={isLoading || !config.key_id || !config.key_secret}
          className="w-full bg-[#B71C1C] hover:bg-[#D32F2F]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Razorpay Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}