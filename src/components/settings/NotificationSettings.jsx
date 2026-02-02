import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Save, Download } from 'lucide-react';

const NOTIFICATION_SETTINGS = [
  { 
    key: 'new_donation_alert_email', 
    title: 'New Donation Alerts Email', 
    description: 'Email address to receive a notification for every new successful donation.',
    type: 'email'
  },
  { 
    key: 'failed_payment_alert_email', 
    title: 'Failed Payment Alerts Email', 
    description: 'Email address to receive alerts for failed payment attempts.',
    type: 'email'
  },
  { 
    key: 'new_support_ticket_email', 
    title: 'New Support Ticket Alerts Email', 
    description: 'Email address for notifications when a new support ticket is created.',
    type: 'email'
  },
  { 
    key: 'contact_form_email', 
    title: 'Contact Form Destination Email', 
    description: 'Email address where contact form submissions will be sent.',
    type: 'email'
  },
  { 
    key: 'contact_form_enabled', 
    title: 'Contact Form Email Alerts', 
    description: 'Enable or disable email notifications for contact form submissions.',
    type: 'boolean'
  }
];

const APP_SETTINGS = [
  {
    key: 'ios_app_url',
    title: 'iOS App Store URL',
    description: 'Link to the iOS app on Apple App Store',
    type: 'url'
  },
  {
    key: 'ios_app_enabled',
    title: 'Show iOS App Link',
    description: 'Display iOS app download link in footer',
    type: 'boolean'
  },
  {
    key: 'android_app_url',
    title: 'Android App Store URL',
    description: 'Link to the Android app on Google Play Store',
    type: 'url'
  },
  {
    key: 'android_app_enabled',
    title: 'Show Android App Link',
    description: 'Display Android app download link in footer',
    type: 'boolean'
  }
];

export default function NotificationSettings({ settings, handleChange, handleSave }) {
  const renderSetting = (setting, section = 'notifications') => {
    const currentValue = settings[setting.key]?.value || '';
    
    if (setting.type === 'boolean') {
      return (
        <div key={setting.key} className="space-y-2 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor={setting.key} className="text-base font-medium">{setting.title}</Label>
              <p className="text-sm text-slate-500 mt-1">{setting.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id={setting.key}
                checked={currentValue === 'true'}
                onCheckedChange={(checked) => handleChange(setting.key, checked ? 'true' : 'false', section)}
              />
              <Button onClick={() => handleSave(setting.key, section)} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={setting.key} className="space-y-2">
        <Label htmlFor={setting.key}>{setting.title}</Label>
        <p className="text-sm text-slate-500">{setting.description}</p>
        <div className="flex gap-2">
          <Input
            id={setting.key}
            type={setting.type === 'email' ? 'email' : setting.type === 'url' ? 'url' : 'text'}
            value={currentValue}
            onChange={(e) => handleChange(setting.key, e.target.value, section)}
            placeholder={
              setting.type === 'email' ? 'admin@madhatv.com' : 
              setting.type === 'url' ? 'https://...' : 
              'Enter value'
            }
          />
          <Button onClick={() => handleSave(setting.key, section)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Newsletter Mail Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-500" /> Newsletter Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">⚠️ Important: Newsletter Email Setup Required</h4>
            <p className="text-sm text-orange-700 mb-3">
              To send newsletters to subscribers, you need to configure email settings. 
              Go to <strong>Settings → Newsletter Settings → Email tab</strong> to set up SMTP configuration.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/Settings'}
              className="border-orange-300 text-orange-800 hover:bg-orange-100"
            >
              Configure Newsletter Email Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-500" /> Email Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {NOTIFICATION_SETTINGS.map(setting => renderSetting(setting, 'notifications'))}
        </CardContent>
      </Card>

      {/* App Download Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-slate-500" /> App Download Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {APP_SETTINGS.map(setting => renderSetting(setting, 'footer'))}
        </CardContent>
      </Card>
    </>
  );
}