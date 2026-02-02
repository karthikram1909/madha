
import React, { useState } from 'react';
import { Feedback } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

const StarRating = ({ rating, setRating, isProcessing }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <motion.button
            key={starValue}
            type="button"
            className="focus:outline-none"
            onClick={() => !isProcessing && setRating(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isProcessing}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Star
              className={`h-6 w-6 transition-colors duration-200 ${
                (hoverRating || rating) >= starValue
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              fill={(hoverRating || rating) >= starValue ? 'currentColor' : 'none'}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default function FeedbackForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [rating, setRating] = useState(5); // Default rating to 5
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'A valid email is required.';
    if (!formData.message || formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters long.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatus({ message: '', type: '' });

    try {
      await Feedback.create({
        rating: rating, // Use the selected rating
        comment: `${formData.message}\n\nFrom: ${formData.name} (${formData.email})`,
        category: 'general',
        user_id: formData.email, // Use email as identifier
      });
      setStatus({ message: "Thank you for your feedback! We appreciate you taking the time to share your thoughts.", type: 'success' });
      setFormData({ name: '', email: '', message: '' });
      setRating(5); // Reset rating after successful submission
    } catch (error) {
      console.error("Feedback submission error:", error);
      setStatus({ message: 'Sorry, there was an error submitting your feedback. Please try again later.', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/50 flex flex-col">
      <AIFloatingChat />
      
      <main className="flex-grow pt-16">
        <div className="relative bg-cover bg-center h-52" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
          <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Share Your Feedback</h1>
            <p className="text-red-100 max-w-2xl text-lg shadow-lg">We value your opinion. Help us improve our services and programs.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12 -mt-16 relative z-10">
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle>Feedback Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="rating">Overall Rating</Label>
                  <StarRating rating={rating} setRating={setRating} isProcessing={isSubmitting} />
                </div>
                <div>
                  <Label htmlFor="message">Your Feedback</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required minLength="10" rows={5} />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-[#B71C1C] hover:bg-[#D32F2F]" disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" /> {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                {status.message && (
                  <p className={`text-center text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{status.message}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <DynamicFooter />
    </div>
  );
}
