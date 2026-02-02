import React, { useState, useEffect } from 'react';
import { PayPalConfig } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PayPalSettings({ configType }) {
    const [config, setConfig] = useState({
        id: null,
        client_id: '',
        client_secret: '',
        is_enabled: false,
        mode: 'sandbox',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [configType]);

    const loadConfig = async () => {
        setIsLoading(true);
        try {
            const configs = await PayPalConfig.filter({ config_type: configType });
            if (configs.length > 0) {
                setConfig(configs[0]);
            }
        } catch (error) {
            toast.error("Failed to load PayPal settings.");
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = { ...config, config_type: configType };
            if (config.id) {
                await PayPalConfig.update(config.id, payload);
            } else {
                const newConfig = await PayPalConfig.create(payload);
                setConfig(newConfig);
            }
            toast.success(`PayPal settings for ${configType} saved successfully.`);
        } catch (error) {
            toast.error("Failed to save PayPal settings.");
        }
        setIsLoading(false);
    };

    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Card className="bg-white shadow-lg border-0">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Wallet className="w-8 h-8 text-blue-600" />
                    <div>
                        <CardTitle>PayPal Settings ({configType})</CardTitle>
                        <CardDescription>Manage PayPal credentials and status for international payments.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="mode">Mode</Label>
                    <Select value={config.mode} onValueChange={(value) => handleChange('mode', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                            <SelectItem value="live">Live (Production)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="client_id">Client ID</Label>
                    <Input id="client_id" value={config.client_id} onChange={(e) => handleChange('client_id', e.target.value)} placeholder="Enter PayPal Client ID" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="client_secret">Client Secret</Label>
                    <Input id="client_secret" type="password" value={config.client_secret} onChange={(e) => handleChange('client_secret', e.target.value)} placeholder="Enter PayPal Client Secret" />
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                    <div>
                        <Label className="text-base font-medium">Enable PayPal</Label>
                        <p className="text-sm text-slate-500">Enable or disable PayPal for this module.</p>
                    </div>
                    <Switch checked={config.is_enabled} onCheckedChange={(checked) => handleChange('is_enabled', checked)} />
                </div>
                <Button onClick={handleSave} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save PayPal Settings
                </Button>
            </CardContent>
        </Card>
    );
}