import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { WebsiteContent } from '@/api/entities';
import { toast } from 'sonner';
import { Save, Calculator } from 'lucide-react';

export default function BookTaxSettings() {
    const [config, setConfig] = useState({
        tax_rate: 5,
        is_tax_enabled: true,
        packaging_charge: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTaxConfig();
    }, []);

    const loadTaxConfig = async () => {
        setIsLoading(true);
        try {
            const content = await WebsiteContent.filter({ section: 'book_tax_config' });
            const configMap = content.reduce((acc, item) => {
                acc[item.content_key] = item.content_value;
                return acc;
            }, {});

            setConfig({
                tax_rate: parseFloat(configMap.book_tax_rate || 5),
                is_tax_enabled: configMap.book_tax_enabled === 'true',
                packaging_charge: parseFloat(configMap.book_packaging_charge || 0)
            });
        } catch (error) {
            console.error('Failed to load book tax config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save or update tax rate
            const existingTaxRate = await WebsiteContent.filter({ section: 'book_tax_config', content_key: 'book_tax_rate' });
            if (existingTaxRate.length > 0) {
                await WebsiteContent.update(existingTaxRate[0].id, { content_value: config.tax_rate.toString() });
            } else {
                await WebsiteContent.create({
                    section: 'book_tax_config',
                    content_key: 'book_tax_rate',
                    content_type: 'text',
                    title: 'Book Tax Rate',
                    content_value: config.tax_rate.toString(),
                    is_active: true
                });
            }

            // Save or update tax enabled
            const existingTaxEnabled = await WebsiteContent.filter({ section: 'book_tax_config', content_key: 'book_tax_enabled' });
            if (existingTaxEnabled.length > 0) {
                await WebsiteContent.update(existingTaxEnabled[0].id, { content_value: config.is_tax_enabled.toString() });
            } else {
                await WebsiteContent.create({
                    section: 'book_tax_config',
                    content_key: 'book_tax_enabled',
                    content_type: 'text',
                    title: 'Book Tax Enabled',
                    content_value: config.is_tax_enabled.toString(),
                    is_active: true
                });
            }

            // Save or update packaging charge
            const existingPackaging = await WebsiteContent.filter({ section: 'book_tax_config', content_key: 'book_packaging_charge' });
            if (existingPackaging.length > 0) {
                await WebsiteContent.update(existingPackaging[0].id, { content_value: config.packaging_charge.toString() });
            } else {
                await WebsiteContent.create({
                    section: 'book_tax_config',
                    content_key: 'book_packaging_charge',
                    content_type: 'text',
                    title: 'Book Packaging Charge',
                    content_value: config.packaging_charge.toString(),
                    is_active: true
                });
            }

            toast.success('Book tax settings updated successfully!');
        } catch (error) {
            console.error('Failed to save book tax config:', error);
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
                        Book Purchase Tax Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Enable Tax Calculation</Label>
                            <p className="text-sm text-slate-500">Apply tax to book purchases</p>
                        </div>
                        <Switch
                            checked={config.is_tax_enabled}
                            onCheckedChange={(checked) => handleChange('is_tax_enabled', checked)}
                        />
                    </div>

                    {config.is_tax_enabled && (
                        <>
                            <div>
                                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                <Input
                                    id="tax_rate"
                                    type="number"
                                    value={config.tax_rate}
                                    onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
                                    placeholder="5"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                    Tax percentage to apply on book purchases
                                </p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Tax Calculation Preview:</h4>
                                <div className="space-y-1 text-sm">
                                    <div>✅ Book Price: ₹1000</div>
                                    <div>✅ Tax ({config.tax_rate}%): ₹{(1000 * config.tax_rate / 100).toFixed(2)}</div>
                                    <div>✅ Total: ₹{(1000 + (1000 * config.tax_rate / 100)).toFixed(2)}</div>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <Label htmlFor="packaging_charge">Packaging Charge (₹)</Label>
                        <Input
                            id="packaging_charge"
                            type="number"
                            value={config.packaging_charge}
                            onChange={(e) => handleChange('packaging_charge', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            step="1"
                            min="0"
                        />
                        <p className="text-sm text-slate-500 mt-1">
                            Packaging and handling charge per order (Set to 0 for free packaging)
                        </p>
                    </div>

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