import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Music, Info } from 'lucide-react';
import { toast } from 'sonner';

const LIVE_AUDIO_SETTINGS = [
  {
    key: 'enable_audio_player',
    title: 'Enable Floating Audio Player',
    description: 'Show the floating live audio player icon on the website.',
    type: 'boolean'
  },
  {
    key: 'primary_audio_url',
    title: 'Primary Audio Stream URL (HLS/M3U8)',
    description: 'The main audio stream URL for the live radio.',
    type: 'url',
    required: true,
  },
  {
    key: 'backup_audio_url',
    title: 'Backup Audio Stream URL (HLS/M3U8)',
    description: 'A fallback audio stream URL in case the primary one fails.',
    type: 'url',
  },
];

export default function LiveAudioSettings({ settings, handleChange, handleSave }) {

  const handleSaveWithValidation = (key, section) => {
    const settingConfig = LIVE_AUDIO_SETTINGS.find(s => s.key === key);
    if (settingConfig.required && !settings[key]?.value) {
        toast.error(`"${settingConfig.title}" is a required field and cannot be empty.`);
        return;
    }
    handleSave(key, section);
  };

  const renderSetting = (setting) => {
    const currentValue = settings[setting.key]?.value || (setting.type === 'boolean' ? 'false' : '');
    const section = 'live_audio';

    if (setting.type === 'boolean') {
      return (
        <div key={setting.key} className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex-1 pr-4">
              <Label htmlFor={setting.key} className="font-medium text-slate-800">{setting.title}</Label>
              <p className="text-sm text-slate-500 mt-1">{setting.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id={setting.key}
                checked={currentValue === 'true'}
                onCheckedChange={(checked) => handleChange(setting.key, checked ? 'true' : 'false', section)}
              />
              <Button onClick={() => handleSave(setting.key, section)} size="sm">
                <Save className="w-4 h-4" />
              </Button>
            </div>
        </div>
      );
    }

    return (
      <div key={setting.key} className="space-y-2">
        <Label htmlFor={setting.key}>
          {setting.title}
          {setting.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <p className="text-sm text-slate-500">{setting.description}</p>
        <div className="flex gap-2">
          <Input
            id={setting.key}
            type="url"
            value={currentValue}
            onChange={(e) => handleChange(setting.key, e.target.value, section)}
            placeholder="https://your-stream-provider/live.m3u8"
            required={setting.required}
          />
          <Button onClick={() => handleSaveWithValidation(setting.key, section)}>
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5 text-slate-500" /> Live Audio Player Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-semibold text-blue-800">How it works</h4>
                <p className="text-sm text-blue-700">
                    Enable the player to show a floating audio icon on your website. Users can click this to listen to your live audio stream. A backup URL is recommended for uninterrupted service.
                </p>
            </div>
        </div>
        {LIVE_AUDIO_SETTINGS.map(setting => renderSetting(setting))}
      </CardContent>
    </Card>
  );
}