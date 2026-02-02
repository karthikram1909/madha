import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Feedback, UserActivityLog, User } from '@/api/entities';
import { Star, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        rating: 5,
        comment: '',
        category: 'general',
        subject: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }
        
        if (!formData.comment.trim()) {
            newErrors.comment = 'Message is required';
        }
        
        if (formData.rating < 1 || formData.rating > 5) {
            newErrors.rating = 'Please select a rating';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const currentUser = await User.me();
            
            const feedbackData = {
                user_id: currentUser.id,
                ...formData,
                status: 'new'
            };
            
            await Feedback.create(feedbackData);
            
            // Log user activity
            await UserActivityLog.create({
                user_email: currentUser.email,
                action: 'Submitted Feedback',
                details: `Subject: ${formData.subject}, Rating: ${formData.rating} stars`
            });
            
            toast.success('Thank you for your feedback! We appreciate your input.');
            
            // Reset form
            setFormData({
                rating: 5,
                comment: '',
                category: 'general',
                subject: ''
            });
            
            if (onSuccess) {
                onSuccess();
            }
            
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback. Please try again.');
        }
        
        setIsSubmitting(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const StarRating = ({ rating, onChange }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`text-2xl transition-colors ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                    >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Card className="bg-white shadow-lg border-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[#B71C1C]" />
                    Share Your Feedback
                </CardTitle>
                <p className="text-sm text-slate-600">
                    Help us improve our services by sharing your thoughts and experiences.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            placeholder="What is your feedback about?"
                            className={errors.subject ? 'border-red-500' : ''}
                        />
                        {errors.subject && (
                            <p className="text-sm text-red-500">{errors.subject}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                            value={formData.category} 
                            onValueChange={(value) => handleInputChange('category', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="live_stream">Live Stream</SelectItem>
                                <SelectItem value="mass_service">Mass Service</SelectItem>
                                <SelectItem value="donation_experience">Donation Experience</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Rating *</Label>
                        <div className="flex items-center gap-4">
                            <StarRating 
                                rating={formData.rating} 
                                onChange={(rating) => handleInputChange('rating', rating)} 
                            />
                            <span className="text-sm text-slate-600">
                                {formData.rating} out of 5 stars
                            </span>
                        </div>
                        {errors.rating && (
                            <p className="text-sm text-red-500">{errors.rating}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Message *</Label>
                        <Textarea
                            id="comment"
                            value={formData.comment}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                            placeholder="Please share your detailed feedback..."
                            className={`min-h-[120px] ${errors.comment ? 'border-red-500' : ''}`}
                        />
                        {errors.comment && (
                            <p className="text-sm text-red-500">{errors.comment}</p>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#B71C1C] hover:bg-[#8B0000]"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}