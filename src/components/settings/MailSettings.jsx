
import React, { useState, useEffect } from 'react';
import { MailConfig } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Save, Mail, TestTube2, CloudCog } from 'lucide-react';
import { toast } from 'sonner';
import { testSmtpConnection } from '@/api/functions';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Helper component to render suggestions with bolding
const SuggestionItem = ({ text }) => {
    // Simple parser for **bold** text
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return (
        <li className="text-sm">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="font-semibold text-red-900">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </li>
    );
};

export default function MailSettings({ configType }) {
  const [config, setConfig] = useState({
    config_type: configType,
    service_provider: 'sendgrid', // Default to SendGrid
    api_key: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    sender_name: '',
    from_email: '',
    is_enabled: true
  });
  const [dbId, setDbId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [title, setTitle] = useState("Mail Settings"); // New state for title

  useEffect(() => {
    loadConfig();
    if (configType === 'general') {
        setTitle("Global Transactional Mail Settings");
    } else {
        setTitle(`Mail Settings for ${configType}`);
    }
  }, [configType]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await MailConfig.filter({ config_type: configType });
      if (configs.length > 0) {
        // Ensure service_provider defaults to 'sendgrid' if not set
        const loadedConfig = { ...configs[0], service_provider: configs[0].service_provider || 'sendgrid' };
        setConfig(prev => ({ ...prev, ...loadedConfig }));
        setDbId(configs[0].id);
      } else {
        // Reset to default state for new configurations
        setConfig({
            config_type: configType,
            service_provider: 'sendgrid', // Default provider
            api_key: '',
            smtp_host: '',
            smtp_port: 587,
            smtp_user: '',
            smtp_pass: '',
            sender_name: '',
            from_email: '',
            is_enabled: true
        });
        setDbId(null);
      }
    } catch (error) {
      console.error("Error loading mail config:", error);
      toast.error("Failed to load Mail settings.");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = { ...config, config_type: configType };
      if (dbId) {
        await MailConfig.update(dbId, payload);
      } else {
        const newConfig = await MailConfig.create(payload);
        setDbId(newConfig.id);
      }
      toast.success(`Mail settings for ${configType} saved successfully!`);
    } catch (error) {
      console.error("Error saving mail config:", error);
      toast.error('Failed to save mail settings.');
    }
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    toast.info("Testing SMTP connection...");
    
    try {
        const { data } = await testSmtpConnection({
            host: config.smtp_host,
            port: config.smtp_port,
            user: config.smtp_user,
            pass: config.smtp_pass
        });
        
        if (data.success) {
            toast.success(data.message);
            setTestResult({ success: true, message: data.message, details: data.details });
        } else {
            toast.error(data.message);
            setTestResult({ 
                success: false, 
                message: data.message, 
                suggestions: data.suggestions,
                errorCode: data.errorCode 
            });
        }
    } catch (error) {
        const errorData = error.response?.data;
        if (errorData) {
            toast.error("Connection test failed. Check details below.");
            setTestResult({ 
                success: false, 
                message: errorData.message,
                suggestions: errorData.suggestions,
                errorCode: errorData.errorCode 
            });
        } else {
            toast.error("Connection test failed.");
            setTestResult({ success: false, message: "Unknown error occurred during testing." });
        }
    }
    setIsTesting(false);
  };

  const isGmailUser = (config.smtp_user || '').includes('@gmail.com') || (config.smtp_host || '').includes('smtp.gmail.com');

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 capitalize">
          <Mail className="w-5 h-5 text-amber-600" />
          {title} {/* Dynamically set title */}
        </CardTitle>
        <CardDescription>
          Configure the service for sending all automated emails. <strong>SendGrid is the required method for this platform.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <div>
            <Label className="font-semibold">Email Provider</Label>
            <RadioGroup
              value={config.service_provider}
              onValueChange={(value) => handleChange('service_provider', value)}
              className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Label htmlFor="provider-sendgrid" className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="sendgrid" id="provider-sendgrid" />
                <span>SendGrid API (Required)</span>
              </Label>
              <Label htmlFor="provider-smtp" className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="smtp" id="provider-smtp" />
                <span>Direct SMTP (Will Fail)</span>
              </Label>
            </RadioGroup>
        </div>
        
        {config.service_provider === 'sendgrid' && (
            <div>
                <Label htmlFor="api_key">SendGrid API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={config.api_key}
                  onChange={(e) => handleChange('api_key', e.target.value)}
                  placeholder="Enter your SendGrid API key"
                />
                 <p className="text-xs text-slate-500 mt-1">Get your API key from your <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SendGrid Dashboard</a>.</p>
            </div>
        )}

        {config.service_provider === 'smtp' && (
          <>
            <Alert variant="destructive" className="bg-red-50 border-red-300 text-red-900">
                <CloudCog className="h-5 w-5 !text-red-700" />
                <AlertTitle className="font-bold">Platform Limitation: Direct SMTP Will Not Work</AlertTitle>
                <AlertDescription>
                    Our hosting environment <strong>blocks all direct SMTP connections</strong> for security reasons. Any attempt to use this method will result in a "Connection Refused" error.
                    <br />
                    <strong>For reliable email delivery, you must select and configure the SendGrid API option.</strong>
                </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={config.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  placeholder="e.g., smtp.example.com"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={config.smtp_port}
                  onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                  placeholder="e.g., 587"
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_user">SMTP Username</Label>
                <Input
                  id="smtp_user"
                  value={config.smtp_user}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  placeholder="Your SMTP username"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="smtp_pass">SMTP Password</Label>
                <Input
                  id="smtp_pass"
                  type="password"
                  value={config.smtp_pass}
                  onChange={(e) => handleChange('smtp_pass', e.target.value)}
                  placeholder="Your SMTP password"
                  disabled
                />
              </div>
            </div>
          </>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <Label htmlFor="sender_name">Sender Name</Label>
            <Input
              id="sender_name"
              value={config.sender_name}
              onChange={(e) => handleChange('sender_name', e.target.value)}
              placeholder="e.g., Madha TV"
            />
          </div>
          <div>
            <Label htmlFor="from_email">From Email</Label>
            <Input
              id="from_email"
              type="email"
              value={config.from_email}
              onChange={(e) => handleChange('from_email', e.target.value)}
              placeholder="e.g., noreply@madhatv.com"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label className="text-base font-medium">Enable Email Sending</Label>
            <p className="text-sm text-slate-500">
              Turn on or off emails for this module.
            </p>
          </div>
          <Switch
            checked={config.is_enabled}
            onCheckedChange={(checked) => handleChange('is_enabled', checked)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-4">
            <Button onClick={handleSave} disabled={isLoading} className="flex-1 bg-[#B71C1C] hover:bg-[#D32F2F]">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Mail Settings'}
            </Button>
            {config.service_provider === 'smtp' && (
              <Button onClick={handleTestConnection} disabled={isTesting || !config.smtp_host || !config.smtp_port} variant="outline" className="flex-1">
                <TestTube2 className="w-4 h-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test SMTP Connection'}
              </Button>
            )}
        </div>

        {config.service_provider === 'smtp' && testResult && (
          <div className={`mt-4 p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              Connection Test Results
            </div>
            <div className={`mt-2 text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'} whitespace-pre-wrap`}>
              {testResult.message}
            </div>
            
            {testResult.details && (
              <div className="mt-3 text-xs text-green-600">
                <strong>Connection Details:</strong><br />
                Host: {testResult.details.host}<br />
                IP: {testResult.details.resolvedIP}<br />
                Port: {testResult.details.port}<br />
                Secure: {testResult.details.secure ? 'Yes (SSL/TLS)' : 'No (STARTTLS/Plain)'}
              </div>
            )}
            
            {testResult.suggestions && testResult.suggestions.length > 0 && (
              <div className="mt-4 text-red-700">
                <strong className="font-bold text-base text-red-800">Troubleshooting Suggestions:</strong>
                <ul className="mt-2 list-disc list-inside space-y-1.5">
                    {testResult.suggestions.map((suggestion, index) => (
                        <SuggestionItem key={index} text={suggestion} />
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
