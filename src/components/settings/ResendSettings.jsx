import React, { useState, useEffect } from 'react';
import { ResendConfig } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Save, CheckCircle, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';

const CONFIG_TYPES = [
  { id: 'donations', label: 'Donations Module', description: 'Email configuration for donation receipts and confirmations' },
  { id: 'bookings', label: 'Service Bookings Module', description: 'Email configuration for booking confirmations and updates' },
  { id: 'books', label: 'Buy Books Module', description: 'Email configuration for book purchase confirmations and invoices' },
  { id: 'general', label: 'General/Fallback', description: 'Default email configuration for other system emails' }
];

export default function ResendSettings({ configType }) {
  const [config, setConfig] = useState({
    config_type: configType,
    api_key: '',
    sender_name: '',
    from_email: '',
    reply_to_email: '',
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
      const configs = await ResendConfig.filter({ config_type: configType });
      if (configs.length > 0) {
        setConfig(prev => ({ ...prev, ...configs[0] }));
        setDbId(configs[0].id);
      } else {
        setConfig({
          config_type: configType,
          api_key: '',
          sender_name: '',
          from_email: '',
          reply_to_email: '',
          is_enabled: true
        });
        setDbId(null);
      }
    } catch (error) {
      console.error("Error loading Resend config:", error);
      toast.error("Failed to load Resend settings.");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!config.api_key || !config.from_email) {
      toast.error("API Key and From Email are required.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...config, config_type: configType };
      if (dbId) {
        await ResendConfig.update(dbId, payload);
      } else {
        const newConfig = await ResendConfig.create(payload);
        setDbId(newConfig.id);
      }
      toast.success(`Resend settings for ${configType} saved successfully!`);
    } catch (error) {
      console.error("Error saving Resend config:", error);
      toast.error('Failed to save Resend settings.');
    }
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const currentConfigInfo = CONFIG_TYPES.find(c => c.id === configType);

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Resend Email Configuration - {currentConfigInfo?.label}
        </CardTitle>
        <p className="text-sm text-slate-600">{currentConfigInfo?.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Alert className="bg-blue-50 border-blue-200 text-blue-900">
          <Mail className="h-5 w-5 !text-blue-600" />
          <AlertDescription>
            <strong>Resend.com Setup Required:</strong> You need a Resend.com account and verified domain. 
            <br />
            1. Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Resend API Keys <ExternalLink className="inline w-3 h-3" /></a>
            <br />
            2. Add and verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Resend Domains <ExternalLink className="inline w-3 h-3" /></a>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="api_key">Resend API Key *</Label>
            <Input
              id="api_key"
              type="password"
              value={config.api_key}
              onChange={(e) => handleChange('api_key', e.target.value)}
              placeholder="re_xxxxxxxxxxxx"
            />
            <p className="text-xs text-slate-500 mt-1">Your Resend API key (starts with 're_')</p>
          </div>
          
          <div>
            <Label htmlFor="from_email">From Email *</Label>
            <Input
              id="from_email"
              type="email"
              value={config.from_email}
              onChange={(e) => handleChange('from_email', e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
            <p className="text-xs text-slate-500 mt-1">Must be from a verified domain in Resend</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sender_name">Sender Name</Label>
            <Input
              id="sender_name"
              value={config.sender_name}
              onChange={(e) => handleChange('sender_name', e.target.value)}
              placeholder="Madha TV"
            />
          </div>
          
          <div>
            <Label htmlFor="reply_to_email">Reply-To Email</Label>
            <Input
              id="reply_to_email"
              type="email"
              value={config.reply_to_email}
              onChange={(e) => handleChange('reply_to_email', e.target.value)}
              placeholder="support@yourdomain.com"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label className="text-base font-medium">Enable Resend for {currentConfigInfo?.label}</Label>
            <p className="text-sm text-slate-500">
              Turn on or off email sending for this module.
            </p>
          </div>
          <Switch
            checked={config.is_enabled}
            onCheckedChange={(checked) => handleChange('is_enabled', checked)}
          />
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full bg-[#B71C1C] hover:bg-[#D32F2F]">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </Button>

        {/* Testing Instructions */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-5 w-5 !text-amber-600" />
          <AlertTitle className="text-amber-900 font-semibold">How to Test Email Configuration</AlertTitle>
          <AlertDescription className="text-amber-800 text-sm mt-2">
            After saving your configuration, test it by performing an actual action:
            <ul className="list-disc list-inside mt-2 space-y-1">
              {configType === 'bookings' && (
                <>
                  <li>Create a test service booking</li>
                  <li>Confirm or publish a booking to trigger confirmation email</li>
                  <li>Check the recipient's inbox for the email</li>
                </>
              )}
              {configType === 'books' && (
                <>
                  <li>Place a test book order</li>
                  <li>Confirm the order to trigger confirmation email</li>
                  <li>Check the recipient's inbox for the email</li>
                </>
              )}
              {configType === 'general' && (
                <>
                  <li>Trigger any system action that sends emails</li>
                  <li>Check the Email Logs page (Settings → Email Logs) for status</li>
                </>
              )}
            </ul>
            <p className="mt-3 text-xs">
              <strong>Note:</strong> Make sure your domain is verified in Resend.com, otherwise emails will fail to send.
            </p>
          </AlertDescription>
        </Alert>

        {/* Email Logs Link */}
        <Alert className="bg-slate-50 border-slate-200">
          <CheckCircle className="h-5 w-5 !text-slate-600" />
          <AlertDescription className="text-slate-700">
            <strong>Monitor Email Activity:</strong> Check the <a href="/EmailLogs" className="text-blue-600 hover:underline font-medium">Email Logs Page</a> to see all sent and failed emails, including error messages.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}