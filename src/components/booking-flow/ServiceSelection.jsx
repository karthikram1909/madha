import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const countries = [
    { code: 'IN', name: 'India', prefix: '+91' },
    { code: 'US', name: 'United States', prefix: '+1' },
    { code: 'GB', name: 'United Kingdom', prefix: '+44' },
    { code: 'CA', name: 'Canada', prefix: '+1' },
    { code: 'AU', name: 'Australia', prefix: '+61' },
];




export default function BookingForm({ formData, setFormData, service, lastIntention, onValidationChange }) {
    const [imagePreview, setImagePreview] = useState(null);

    const isImageRequired = ['birthday_service', 'marriage_blessing', 'deathday_service'].includes(service.key);

    useEffect(() => {
        if (lastIntention) {
            setFormData(prev => ({ ...prev, intention_text: lastIntention }));
        }
    }, [lastIntention, setFormData]);

    useEffect(() => {
        const isCountryIndia = formData.country === 'India';
        const newCurrency = isCountryIndia ? 'INR' : 'USD';
        setFormData(prev => ({ ...prev, currency: newCurrency }));
    }, [formData.country, setFormData]);
    
    useEffect(() => {
        // Validate form whenever formData changes
        const isValid = validateForm(false); // don't show toast on every change
        onValidationChange(isValid);
    }, [formData, service.key]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCountryChange = (countryName) => {
        const country = countries.find(c => c.name === countryName);
        if (country) {
            setFormData(prev => ({
                ...prev,
                country: country.name,
                booker_phone: country.prefix
            }));
        }
    };
    
    const handlePhoneChange = (e) => {
        const phone = e.target.value;
        setFormData(prev => ({ ...prev, booker_phone: phone }));

        if (phone.startsWith('+91')) {
            setFormData(prev => ({ ...prev, country: 'India', currency: 'INR' }));
        } else if (phone.startsWith('+')) {
            // For other international numbers, default to US/USD
            const otherCountry = countries.find(c => phone.startsWith(c.prefix)) || { name: 'United States' };
            setFormData(prev => ({ ...prev, country: otherCountry.name, currency: 'USD' }));
        }
    };

    const validateForm = (showToast = true) => {
        if (!formData.beneficiary_name || !formData.booker_name || !formData.booker_email || !formData.booker_phone || !formData.intention_text || !formData.booking_date) {
            if (showToast) toast.error("Please fill all required fields.");
            return false;
        }
        if (isImageRequired && !formData.imageFile) {
            if (showToast) toast.error("An image upload is required for this service.");
            return false;
        }
        return true;
    };
    
    const paymentGateway = formData.currency === 'INR' ? 'Razorpay' : 'PayPal';

    // Date restrictions
    const isDateDisabled = (date) => {
        const day = date.getDate();
        const dayOfWeek = date.getDay();
        
        // Disable 1st to 5th of every month
        if (day >= 1 && day <= 5) return true;
        
        // Disable Sundays for Holy Mass only
        if (service.key === 'holy_mass' && dayOfWeek === 0) return true;
        
        // For most services, disable past dates
        const canSelectPastDate = ['birthday_service', 'marriage_blessing', 'deathday_service'].includes(service.key);
        if (!canSelectPastDate && date < new Date().setHours(0, 0, 0, 0)) return true;
        
        return false;
    };

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="beneficiary_name">Beneficiary Name *</Label>
                <Input 
                    id="beneficiary_name" 
                    value={formData.beneficiary_name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_name: e.target.value }))} 
                    placeholder="Name of person this service is for"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="booker_name">Your Name *</Label>
                    <Input 
                        id="booker_name" 
                        value={formData.booker_name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, booker_name: e.target.value }))} 
                        placeholder="Your full name"
                    />
                </div>
                <div>
                    <Label htmlFor="booker_email">Your Email *</Label>
                    <Input 
                        id="booker_email" 
                        type="email"
                        value={formData.booker_email} 
                        onChange={(e) => setFormData(prev => ({ ...prev, booker_email: e.target.value }))} 
                        placeholder="your.email@example.com"
                    />
                </div>
            </div>

            {service.key === 'holy_mass' && (
                <div>
                    <Label htmlFor="booking_type">Booking Type</Label>
                    <Select value={formData.booking_type || 'one-time'} onValueChange={value => setFormData(prev => ({ ...prev, booking_type: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="one-time">One-time</SelectItem>
                            <SelectItem value="monthly">Monthly (Recurring)</SelectItem>
                            <SelectItem value="yearly">Yearly (Recurring)</SelectItem>
                        </SelectContent>
                    </Select>
                    {formData.booking_type !== 'one-time' && (
                        <p className="text-sm text-blue-600 mt-1">
                            📅 Recurring bookings will generate automatic future services
                        </p>
                    )}
                </div>
            )}
            
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label>Country *</Label>
                    <Select value={formData.country} onValueChange={handleCountryChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="booker_phone">Phone Number *</Label>
                    <Input 
                        id="booker_phone" 
                        value={formData.booker_phone} 
                        onChange={handlePhoneChange} 
                        placeholder="+91 9876543210"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label>Currency</Label>
                    <Select value={formData.currency} onValueChange={value => setFormData(prev => ({...prev, currency: value}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="p-3 bg-slate-100 rounded-md">
                    <Label className="text-slate-500 text-sm">Payment Gateway</Label>
                    <p className="font-semibold text-slate-800">{paymentGateway}</p>
                    <p className="text-xs text-slate-500 mt-1">Auto-selected based on currency</p>
                </div>
            </div>

            <div>
                <Label>Booking Date *</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.booking_date ? format(formData.booking_date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={formData.booking_date}
                            onSelect={(date) => setFormData(prev => ({ ...prev, booking_date: date }))}
                            disabled={isDateDisabled}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-slate-500 mt-1">
                    Note: 1st-5th of each month are unavailable
                    {service.key === 'holy_mass' && ', Sundays are also unavailable for Holy Mass'}
                </p>
            </div>

            <div>
                <Label htmlFor="intention_text">Prayer Intention *</Label>
                <Textarea 
                    id="intention_text" 
                    value={formData.intention_text} 
                    onChange={(e) => setFormData(prev => ({ ...prev, intention_text: e.target.value }))} 
                    placeholder="Please share your prayer intention or special request..."
                    rows={3}
                />
                {lastIntention && (
                    <p className="text-sm text-blue-600 mt-1">
                        💡 We've pre-filled your last intention. Feel free to edit it.
                    </p>
                )}
            </div>
            
            {isImageRequired && (
                <div className="space-y-2">
                    <Label htmlFor="imageFile">Upload Photo * (Required for this service)</Label>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline">
                            <label className="cursor-pointer flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Choose File
                                <Input id="imageFile" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </Button>
                        {imagePreview && (
                            <div className="flex items-center gap-2">
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                                <span className="text-sm text-green-600">✓ Image uploaded</span>
                            </div>
                        )}
                        {!imagePreview && formData.imageFile && (
                            <span className="text-sm text-slate-500">{formData.imageFile.name}</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">
                        Please upload a clear photo related to this service (person's photo, wedding photo, etc.)
                    </p>
                </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-blue-800">
                            <strong>Service Amount:</strong> {formData.currency === 'INR' ? '₹' : '$'}{service.key === 'holy_mass' ? '5000' : service.key === 'rosary_blessing' ? '1000' : '500'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            This contribution helps support our spiritual services and broadcasts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}