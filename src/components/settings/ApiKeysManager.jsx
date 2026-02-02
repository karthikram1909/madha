
import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Save } from 'lucide-react';

const API_SERVICES = [
  { key: 'razorpay_key_id', title: 'Razorpay Key ID', category: 'Payment Gateways' },
  { key: 'razorpay_key_secret', title: 'Razorpay Key Secret', category: 'Payment Gateways' },
  { key: 'paypal_client_id', title: 'PayPal Client ID', category: 'Payment Gateways' },
  { key: 'msg91_api_key', title: 'MSG91 API Key', category: 'SMS Gateways' },
  { key: 'google_recaptcha_site_key', title: 'Google reCAPTCHA Site Key', category: 'Security' },
];

const groupByCategory = (services) => {
  return services.reduce((acc, service) => {
    (acc[service.category] = acc[service.category] || []).push(service);
    return acc;
  }, {});
};

export default function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      const content = await WebsiteContent.filter({ section: 'api_keys' });
      const keys = content.reduce((acc, item) => {
        acc[item.content_key] = { id: item.id, value: item.content_value };
        return acc;
      }, {});
      setApiKeys(keys);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async (key) => {
    setIsLoading(true);
    try {
      const existingKey = apiKeys[key];
      const service = API_SERVICES.find(s => s.key === key);
      const payload = {
        section: 'api_keys',
        content_key: key,
        content_type: 'text',
        title: service.title,
        content_value: existingKey?.value || '',
        is_active: true
      };

      if (existingKey?.id) {
        await WebsiteContent.update(existingKey.id, payload);
      } else {
        await WebsiteContent.create(payload);
      }
      await loadApiKeys();
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
    setIsLoading(false);
  };

  const handleChange = (key, value) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };
  
  const groupedServices = groupByCategory(API_SERVICES);

  return (
    <div className="space-y-6">
      {Object.entries(groupedServices).map(([category, services]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <KeyRound className="w-5 h-5 text-slate-500" /> {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {services.map(service => (
              <div key={service.key} className="space-y-2">
                <Label htmlFor={service.key}>{service.title}</Label>
                <div className="flex gap-2">
                  <Input
                    id={service.key}
                    type="password"
                    value={apiKeys[service.key]?.value || ''}
                    onChange={(e) => handleChange(service.key, e.target.value)}
                    placeholder={`Enter ${service.title}`}
                  />
                  <Button onClick={() => handleSave(service.key)} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
