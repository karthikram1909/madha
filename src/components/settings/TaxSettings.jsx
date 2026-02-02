import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaxConfig } from '@/api/entities';
import { toast } from 'sonner';
import { Save, Calculator } from 'lucide-react';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function TaxSettings() {
    const [config, setConfig] = useState({
        home_state: "Tamil Nadu",
        gst_rate: 18,
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 18,
        is_tax_enabled: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTaxConfig();
    }, []);

    const loadTaxConfig = async () => {
        setIsLoading(true);
        try {
            const configs = await TaxConfig.list();
            if (configs.length > 0) {
                setConfig(configs[0]);
            }
        } catch (error) {
            console.error('Failed to load tax config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const configs = await TaxConfig.list();
            if (configs.length > 0) {
                await TaxConfig.update(configs[0].id, config);
            } else {
                await TaxConfig.create(config);
            }
            toast.success('Tax settings updated successfully!');
        } catch (error) {
            console.error('Failed to save tax config:', error);
            toast.error('Failed to save tax settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading tax settings...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        GST/IGST Tax Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Enable Tax Calculation</Label>
                            <p className="text-sm text-slate-500">Apply GST/IGST to service bookings</p>
                        </div>
                        <Switch
                            checked={config.is_tax_enabled}
                            onCheckedChange={(checked) => handleChange('is_tax_enabled', checked)}
                        />
                    </div>

                    {config.is_tax_enabled && (
                        <>
                            <div>
                                <Label htmlFor="home_state">Organization's Home State</Label>
                                <Select value={config.home_state} onValueChange={(value) => handleChange('home_state', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select home state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDIAN_STATES.map(state => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-slate-500 mt-1">
                                    CGST+SGST applies when user's state matches this. IGST applies for other states.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cgst_rate">CGST Rate (%)</Label>
                                    <Input
                                        id="cgst_rate"
                                        type="number"
                                        value={config.cgst_rate}
                                        onChange={(e) => handleChange('cgst_rate', parseFloat(e.target.value) || 0)}
                                        placeholder="9"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sgst_rate">SGST Rate (%)</Label>
                                    <Input
                                        id="sgst_rate"
                                        type="number"
                                        value={config.sgst_rate}
                                        onChange={(e) => handleChange('sgst_rate', parseFloat(e.target.value) || 0)}
                                        placeholder="9"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="igst_rate">IGST Rate (%)</Label>
                                <Input
                                    id="igst_rate"
                                    type="number"
                                    value={config.igst_rate}
                                    onChange={(e) => handleChange('igst_rate', parseFloat(e.target.value) || 0)}
                                    placeholder="18"
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                    Applied for inter-state transactions within India
                                </p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Tax Calculation Preview:</h4>
                                <div className="space-y-1 text-sm">
                                    <div>✅ <strong>Same State ({config.home_state}):</strong> CGST {config.cgst_rate}% + SGST {config.sgst_rate}% = {config.cgst_rate + config.sgst_rate}%</div>
                                    <div>✅ <strong>Other Indian States:</strong> IGST {config.igst_rate}%</div>
                                    <div>✅ <strong>International:</strong> No tax (0%)</div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Tax Settings
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}