import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays, getDay } from 'date-fns';
import { ServiceBooking } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

const services = [
    { id: 'rosary', name: 'Rosary', price: 1000, image: 'optional' },
    { id: 'holymass', name: 'Holymass', price: 5000, image: 'optional' },
    { id: 'birthday', name: 'Birthday', price: 500, image: 'mandatory' },
    { id: 'marriage_day', name: 'Marriage Day', price: 500, image: 'mandatory' },
    { id: 'prayer_for_dead', name: 'Prayer for Dead', price: 500, image: 'mandatory' },


];

export default function BookingForm({ user, onBookingSuccess }) {
    const [selectedServices, setSelectedServices] = useState([]);
    const [bookingDetails, setBookingDetails] = useState({
        dedicatedTo: '',
        dedicatedBy: user?.full_name || '',
        message: '',
        telecastDate: null,
        imageFile: null,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState({ message: '', type: '' });

  





    const handleServiceChange = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        const isSelected = selectedServices.some(s => s.id === serviceId);
        if (isSelected) {
            setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
        } else {
            if (selectedServices.length < 5) {
                setSelectedServices([...selectedServices, service]);
            } else {
                alert("You can select up to 5 services only.");
            }
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setBookingDetails(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        setBookingDetails(prev => ({ ...prev, imageFile: e.target.files[0] }));
    };

    const isImageMandatory = () => {
        return selectedServices.some(s => s.image === 'mandatory');
    };

    const validateForm = () => {
        const newErrors = {};
        if (selectedServices.length === 0) newErrors.services = "Please select at least one service.";
        if (bookingDetails.dedicatedTo.length < 3) newErrors.dedicatedTo = "This field is required (min 3 characters).";
        if (bookingDetails.dedicatedBy.length < 3) newErrors.dedicatedBy = "This field is required (min 3 characters).";
        if (!bookingDetails.telecastDate) newErrors.telecastDate = "Please select a telecast date.";
        if (isImageMandatory() && !bookingDetails.imageFile) newErrors.imageFile = "Image upload is mandatory for the selected service(s).";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormStatus({ message: '', type: '' });

        try {
            let imageUrl = null;
            if (bookingDetails.imageFile) {
                const uploadResult = await UploadFile({ file: bookingDetails.imageFile });
                imageUrl = uploadResult.file_url;
            }

            // Here you would integrate with Razorpay/PayPal.
            // For now, we'll simulate a successful payment.
            const paymentGateway = 'razorpay'; // Assume Indian user for now
            const paymentId = `sim_pay_${Date.now()}`;

            const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

            const bookingPromises = selectedServices.map(service => {
                const bookingData = {
                    user_id: user.id,
                    service_type: service.id,
                    booking_date: format(bookingDetails.telecastDate, 'yyyy-MM-dd'),
                    intention_text: bookingDetails.message,
                    beneficiary_name: bookingDetails.dedicatedTo,
                    booker_name: bookingDetails.dedicatedBy,
                    booker_email: user.email,
                    booker_phone: user.phone || '',
                    booker_photo_url: imageUrl,
                    amount: service.price,
                    currency: paymentGateway === 'razorpay' ? 'INR' : 'USD',
                    payment_status: 'completed',
                    payment_id: paymentId,
                    status: 'pending' // Admin needs to confirm
                };
                return ServiceBooking.create(bookingData);
            });

            const createdBookings = await Promise.all(bookingPromises);

            setFormStatus({ message: 'Booking successful! Confirmation has been sent.', type: 'success' });
            if (onBookingSuccess) {
                // Pass a representative booking for email confirmation
                onBookingSuccess({
                    ...createdBookings[0],
                    service_type: createdBookings.map(b => b.service_type).join(', '),
                    amount: totalAmount,
                });
            }

            // Reset form
            setSelectedServices([]);
            setBookingDetails({
                dedicatedTo: '',
                dedicatedBy: user?.full_name || '',
                message: '',
                telecastDate: null,
                imageFile: null,
            });

        } catch (error) {
            console.error("Booking failed:", error);
            setFormStatus({ message: 'An error occurred during booking. Please try again.', type: 'error' });
        }
        setIsSubmitting(false);
    };

    const isDayDisabled = (day) => {
        // Disable first 5 days from today
        if (day < addDays(new Date(), 5)) return true;
        // For Holymass, disable Sundays (Sunday is 0)
        if (selectedServices.some(s => s.id === 'holymass') && getDay(day) === 0) return true;
        return false;
    };

    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create a New Service Booking</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label>Select Service(s) (up to 5)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => handleServiceChange(service.id)}
                                    className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${selectedServices.some(s => s.id === service.id) ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-slate-50'}`}
                                >
                                    <p className="font-semibold capitalize">{service.name}</p>
                                    <p className="text-sm text-slate-600">₹{service.price}</p>
                                </div>
                            ))}
                        </div>
                        {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="dedicatedTo">Dedicated To</Label>
                            <Input id="dedicatedTo" value={bookingDetails.dedicatedTo} onChange={handleInputChange} placeholder="Name of the person" />
                            {errors.dedicatedTo && <p className="text-red-500 text-sm">{errors.dedicatedTo}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dedicatedBy">Dedicated By</Label>
                            <Input id="dedicatedBy" value={bookingDetails.dedicatedBy} onChange={handleInputChange} placeholder="Your name" />
                            {errors.dedicatedBy && <p className="text-red-500 text-sm">{errors.dedicatedBy}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" value={bookingDetails.message} onChange={handleInputChange} placeholder="Your prayer intention or message" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                            <Label>Telecast Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {bookingDetails.telecastDate ? format(bookingDetails.telecastDate, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={bookingDetails.telecastDate}
                                        onSelect={(date) => setBookingDetails(prev => ({ ...prev, telecastDate: date }))}
                                        disabled={isDayDisabled}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.telecastDate && <p className="text-red-500 text-sm">{errors.telecastDate}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageFile">Upload Image {isImageMandatory() ? '(Mandatory)' : '(Optional)'}</Label>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="imageFile" className="flex-1">
                                    <Input id="imageFile" type="file" onChange={handleFileChange} className="hidden" />
                                    <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('imageFile').click()}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {bookingDetails.imageFile ? bookingDetails.imageFile.name : 'Choose File'}
                                    </Button>
                                </label>
                            </div>
                            {errors.imageFile && <p className="text-red-500 text-sm">{errors.imageFile}</p>}
                        </div>
                    </div>

                    <Card className="bg-slate-50 mt-4">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-semibold">Total Amount</p>
                                <p className="text-2xl font-bold text-red-600">₹{totalAmount}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {formStatus.message && (
                        <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${formStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {formStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {formStatus.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-[#B71C1C] hover:bg-[#D32F2F] h-12 text-lg" disabled={isSubmitting || totalAmount === 0}>
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}