
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DualImageInput from '@/components/ui/dual-image-input';
import { toast } from 'sonner';

export default function ServiceFormModal({ service, onSave, onClose }) {
    const getInitialFormData = () => {
        if (service) {
            return {
                title: service.title || '',
                title_tamil: service.title_tamil || '',
                short_content: service.short_content || '',
                short_content_tamil: service.short_content_tamil || '',
                amount: service.amount || '',
                price_inr: service.price_inr || 0,
                price_usd: service.price_usd || 0,
                button_click_url: service.button_click_url || '',
                image_url: service.image_url || '',
                redirect_url: service.redirect_url || '',
                display_order: service.display_order || 0,
                is_active: service.is_active !== undefined ? service.is_active : true,
                is_popular: service.is_popular || false
            };
        }
        return {
            title: '',
            title_tamil: '',
            short_content: '',
            short_content_tamil: '',
            amount: '',
            price_inr: 0,
            price_usd: 0,
            button_click_url: '',
            image_url: '',
            redirect_url: '',
            display_order: 0,
            is_active: true,
            is_popular: false
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(getInitialFormData());
    }, [service]); // Dependency on `service` ensures reset when `service` prop changes (e.g., editing a different service)

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title) {
            toast.error("Please enter a service title");
            return;
        }
        
        if (!formData.image_url) {
            toast.error("Please provide an image URL");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("Failed to save service");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-[#B71C1C]">
                        {service ? 'Edit Service Card' : 'Add New Service Card'}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Title Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Service Title (English) *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g., Holy Mass Sponsor"
                                required
                            />
                        </div>
                        <div>
                            <Label>Service Title (Tamil)</Label>
                            <Input
                                value={formData.title_tamil}
                                onChange={(e) => setFormData({...formData, title_tamil: e.target.value})}
                                placeholder="e.g., திருப்பலி தயுக்கொடுத்தல்"
                            />
                        </div>
                    </div>

                    {/* Short Content Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Short Description (English)</Label>
                            <Textarea
                                value={formData.short_content}
                                onChange={(e) => setFormData({...formData, short_content: e.target.value})}
                                placeholder="Brief description"
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label>Short Description (Tamil)</Label>
                            <Textarea
                                value={formData.short_content_tamil}
                                onChange={(e) => setFormData({...formData, short_content_tamil: e.target.value})}
                                placeholder="சுருக்கமான விளக்கம்"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Pricing Fields */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <Label>Display Amount</Label>
                            <Input
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                placeholder="e.g., ₹5000"
                            />
                        </div>
                        <div>
                            <Label>Price (INR)</Label>
                            <Input
                                type="number"
                                value={formData.price_inr}
                                onChange={(e) => setFormData({...formData, price_inr: parseFloat(e.target.value) || 0})}
                                placeholder="5000"
                            />
                        </div>
                        <div>
                            <Label>Price (USD)</Label>
                            <Input
                                type="number"
                                value={formData.price_usd}
                                onChange={(e) => setFormData({...formData, price_usd: parseFloat(e.target.value) || 0})}
                                placeholder="60"
                            />
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <DualImageInput
                            label="Service Card Image *"
                            value={formData.image_url}
                            onChange={(url) => setFormData({...formData, image_url: url})}
                            placeholder="Enter image URL or upload"
                        />
                    </div>

                    {/* URLs */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Book Now Button URL</Label>
                            <Input
                                value={formData.button_click_url}
                                onChange={(e) => setFormData({...formData, button_click_url: e.target.value})}
                                placeholder="Leave empty to hide button"
                            />
                            <p className="text-xs text-slate-500 mt-1">URL to redirect when "Book Now" is clicked</p>
                        </div>
                        <div>
                            <Label>Card Click Redirect URL</Label>
                            <Input
                                value={formData.redirect_url}
                                onChange={(e) => setFormData({...formData, redirect_url: e.target.value})}
                                placeholder="Optional external URL"
                            />
                            <p className="text-xs text-slate-500 mt-1">Redirect when card is clicked (if no button)</p>
                        </div>
                    </div>

                    {/* Display Order and Status */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <Label>Display Order</Label>
                            <Input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="is_popular"
                                checked={formData.is_popular}
                                onChange={(e) => setFormData({...formData, is_popular: e.target.checked})}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="is_popular" className="cursor-pointer">Popular</Label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#B71C1C] hover:bg-[#D32F2F]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (service ? 'Update Service' : 'Create Service')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
