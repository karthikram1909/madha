import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Upload } from 'lucide-react';
import { format, startOfDay, addDays, isSunday } from 'date-fns';
import { toast } from 'sonner';

const countries = [
    { code: 'IN', name: 'India', prefix: '+91' },
    { code: 'US', name: 'United States', prefix: '+1' },
    { code: 'GB', name: 'United Kingdom', prefix: '+44' },
    { code: 'CA', name: 'Canada', prefix: '+1' },
    { code: 'AU', name: 'Australia', prefix: '+61' },
];

export default function BookingForm({ formData, setFormData, service, lastIntention, onValidationChange, language = 'english' }) {
    const [imagePreview, setImagePreview] = useState(null);

    // Ensure formData has default values
    const safeFormData = formData || {
        beneficiary_name: '',
        booker_name: '',
        booker_email: '',
        booker_phone: '+91',
        country: 'India',
        currency: 'INR',
        booking_date: null,
        intention_text: '',
        booking_type: 'one-time',
        imageFile: null
    };

    const isImageRequired = service?.key && ['birthday_service', 'marriage_blessing', 'deathday_service'].includes(service.key);

    useEffect(() => {
        if (lastIntention && setFormData) {
            setFormData(prev => ({ ...prev, intention_text: lastIntention }));
        }
    }, [lastIntention, setFormData]);

    useEffect(() => {
        if (!setFormData) return;
        
        const isCountryIndia = safeFormData.country === 'India';
        const newCurrency = isCountryIndia ? 'INR' : 'USD';
        if (safeFormData.currency !== newCurrency) {
            setFormData(prev => ({ ...prev, currency: newCurrency }));
        }
    }, [safeFormData.country, setFormData]);
    
    useEffect(() => {
        if (!onValidationChange) return;
        
        // Validate form whenever formData changes
        const isValid = validateForm(false);
        onValidationChange(isValid);
    }, [safeFormData, service, onValidationChange]);

    const handleFileChange = (e) => {
        if (!setFormData) return;
        
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setFormData(prev => ({ ...prev, imageFile: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCountryChange = (countryName) => {
        if (!setFormData) return;
        
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
        if (!setFormData) return;
        
        const phone = e.target.value;
        setFormData(prev => ({ ...prev, booker_phone: phone }));

        if (phone.startsWith('+91')) {
            setFormData(prev => ({ ...prev, country: 'India', currency: 'INR' }));
        } else if (phone.startsWith('+')) {
            const otherCountry = countries.find(c => phone.startsWith(c.prefix)) || { name: 'United States' };
            setFormData(prev => ({ ...prev, country: otherCountry.name, currency: 'USD' }));
        }
    };

    const validateForm = (showToast = true) => {
        const requiredFields = ['beneficiary_name', 'booker_name', 'booker_email', 'booker_phone', 'intention_text'];
        
        for (const field of requiredFields) {
            if (!safeFormData[field] || String(safeFormData[field]).trim().length < 2) {
                if (showToast) toast.error(`Please fill the ${field.replace('_', ' ')} field (minimum 2 characters).`);
                return false;
            }
        }
        
        if (!safeFormData.booking_date) {
            if (showToast) toast.error("Please select a booking date.");
            return false;
        }
        
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeFormData.booker_email)) {
            if (showToast) toast.error("Please enter a valid email address.");
            return false;
        }

        // Validate phone format
        if (!/^\+?[0-9\s-()]{7,20}$/.test(safeFormData.booker_phone)) {
            if (showToast) toast.error("Please enter a valid phone number.");
            return false;
        }
        
        if (isImageRequired && !safeFormData.imageFile) {
            if (showToast) toast.error("An image upload is required for this service.");
            return false;
        }
        
        return true;
    };
    
    const paymentGateway = safeFormData.currency === 'INR' ? 'Razorpay' : 'PayPal';

    // Enhanced Date restrictions with validation messages
    const isDateDisabled = (date) => {
        const today = startOfDay(new Date());
        const targetDate = startOfDay(date);
    
        // Rule 1: Block all past dates
        if (targetDate < today) {
          return true;
        }
    
        // Rule 2: Block today + next 4 days (5 days total)
        const fiveDaysFromNow = addDays(today, 4);
        if (targetDate <= fiveDaysFromNow) {
            return true;
        }
    
        // Rule 3: If service is Holy Mass, also block all Sundays
        if (service?.key === 'holy_mass' && isSunday(targetDate)) {
          return true;
        }
    
        return false;
    };

    const getServiceDisplayName = () => {
        if (!service) return '';
        return language === 'tamil' && service.title_tamil 
            ? service.title_tamil 
            : service.title;
    };

    if (!setFormData) {
        return <div className="p-6 text-center text-red-500">Form configuration error</div>;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Service Type Display */}
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">
                    {language === 'tamil' ? 'தேர்ந்தெடுக்கப்பட்ட சேவை' : 'Selected Service'}
                </p>
                <p className="text-lg font-bold text-[#861518]">{getServiceDisplayName()}</p>
            </div>

            <div>
                <Label htmlFor="beneficiary_name">Beneficiary Name *</Label>
                <Input 
                    id="beneficiary_name" 
                    value={safeFormData.beneficiary_name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_name: e.target.value }))} 
                    placeholder="Name of person this service is for"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="booker_name">Your Name *</Label>
                    <Input 
                        id="booker_name" 
                        value={safeFormData.booker_name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, booker_name: e.target.value }))} 
                        placeholder="Your full name"
                    />
                </div>
                <div>
                    <Label htmlFor="booker_email">Your Email *</Label>
                    <Input 
                        id="booker_email" 
                        type="email"
                        value={safeFormData.booker_email} 
                        onChange={(e) => setFormData(prev => ({ ...prev, booker_email: e.target.value }))} 
                        placeholder="your.email@example.com"
                    />
                </div>
            </div>

            {(service?.key === 'holy_mass' || service?.key === 'rosary_blessing') && (
                <div>
                    <Label htmlFor="booking_type">Booking Type</Label>
                    <Select value={safeFormData.booking_type || 'one-time'} onValueChange={value => setFormData(prev => ({ ...prev, booking_type: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="one-time">One-time</SelectItem>
                            <SelectItem value="monthly">Monthly (Recurring)</SelectItem>
                            <SelectItem value="yearly">Yearly (Recurring)</SelectItem>
                        </SelectContent>
                    </Select>
                    {safeFormData.booking_type !== 'one-time' && (
                        <p className="text-sm text-blue-600 mt-1">
                            📅 Recurring bookings will generate automatic future services
                        </p>
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label>Country *</Label>
                    <Select value={safeFormData.country} onValueChange={handleCountryChange}>
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
                        value={safeFormData.booker_phone} 
                        onChange={handlePhoneChange} 
                        placeholder="+91 9876543210"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label>Currency</Label>
                    <Select value={safeFormData.currency} onValueChange={value => setFormData(prev => ({...prev, currency: value}))}>
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
                <Label htmlFor="booking_date">Booking Date *</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start text-left font-normal mt-2"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {safeFormData.booking_date ? format(safeFormData.booking_date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={safeFormData.booking_date}
                            onSelect={(selectedDate) => {
                                if (selectedDate && isDateDisabled(selectedDate)) {
                                    toast.error("This date is not available for booking. Please select a valid date.");
                                    return;
                                }
                                setFormData(prev => ({ ...prev, booking_date: selectedDate }));
                            }}
                            disabled={isDateDisabled}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-slate-500 mt-1">
                    {service?.key === 'holy_mass' 
                        ? "Note: First 5 days and Sundays are not available for Holy Mass bookings."
                        : "Note: First 5 days from today are not available for booking."
                    }
                </p>
            </div>

            <div>
                <Label htmlFor="intention_text">Prayer Intention *</Label>
                <Textarea 
                    id="intention_text" 
                    value={safeFormData.intention_text} 
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
                        {!imagePreview && safeFormData.imageFile && (
                            <span className="text-sm text-slate-500">{safeFormData.imageFile.name}</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">
                        Please upload a clear photo related to this service (max 5MB)
                    </p>
                </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-blue-800">
                            <strong>Service Amount:</strong> {safeFormData.currency === 'INR' ? '₹' : '$'}{
                                service?.key === 'holy_mass' ? (safeFormData.currency === 'INR' ? '5000' : '100') : 
                                service?.key === 'rosary_blessing' ? (safeFormData.currency === 'INR' ? '1000' : '20') : 
                                (safeFormData.currency === 'INR' ? '500' : '10')
                            }
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