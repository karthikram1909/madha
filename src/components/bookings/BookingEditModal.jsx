import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadFile } from "@/api/integrations";
import { toast } from 'sonner';

export default function BookingEditModal({ isOpen, onClose, booking, onSave }) {
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (booking) {
            setFormData({
                beneficiary_name: booking.beneficiary_name || '',
                intention_text: booking.intention_text || '',
                booking_date: booking.booking_date ? booking.booking_date.split('T')[0] : '',
                booking_time: booking.booking_time || '',
                booker_name: booking.booker_name || '',
                booker_email: booking.booker_email || '',
                booker_phone: booking.booker_phone || '',
                amount: booking.amount || 0,
                admin_notes: booking.admin_notes || '',
                booker_photo_url: booking.booker_photo_url || ''
            });
            setImagePreview(booking.booker_photo_url || '');
            setImageFile(null);
        }
    }, [booking]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        let updateData = { ...formData };

        if (imageFile) {
            try {
                const { file_url } = await UploadFile({ file: imageFile });
                updateData.booker_photo_url = file_url;
            } catch (error) {
                toast.error("Failed to upload image. Please try again.");
                console.error("Image upload error:", error);
                setIsLoading(false);
                return;
            }
        }

        await onSave(booking.id, updateData);
        setIsLoading(false);
    };
    
    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                    <DialogDescription>Update details for booking ID: {booking.id}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="beneficiary_name">Beneficiary Name</Label>
                            <Input id="beneficiary_name" value={formData.beneficiary_name} onChange={(e) => handleInputChange('beneficiary_name', e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="booker_name">Booker Name</Label>
                            <Input id="booker_name" value={formData.booker_name} onChange={(e) => handleInputChange('booker_name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="booker_email">Booker Email</Label>
                            <Input id="booker_email" type="email" value={formData.booker_email} onChange={(e) => handleInputChange('booker_email', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="booker_phone">Booker Phone</Label>
                            <Input id="booker_phone" value={formData.booker_phone} onChange={(e) => handleInputChange('booker_phone', e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="booking_date">Booking Date</Label>
                            <Input id="booking_date" type="date" value={formData.booking_date} onChange={(e) => handleInputChange('booking_date', e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="booking_time">Booking Time</Label>
                            <Input id="booking_time" type="time" value={formData.booking_time} onChange={(e) => handleInputChange('booking_time', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', Number(e.target.value))} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="booker_photo">Service Photo (for Birthday, etc.)</Label>
                        <Input id="booker_photo" type="file" onChange={handleImageChange} accept="image/*" />
                        {imagePreview && (
                            <div className="mt-2">
                                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md shadow-sm" />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="intention_text">Intention</Label>
                        <Textarea id="intention_text" value={formData.intention_text} onChange={(e) => handleInputChange('intention_text', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="admin_notes">Admin Notes</Label>
                        <Textarea id="admin_notes" value={formData.admin_notes} onChange={(e) => handleInputChange('admin_notes', e.target.value)} placeholder="Internal notes about this booking..."/>
                    </div>
                </form>
                 <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}