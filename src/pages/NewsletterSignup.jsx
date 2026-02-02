
import React, { useState } from 'react';
import { NewsletterSubscriber } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from 'lucide-react';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        setStatus({ message: '', type: '' });

        try {
            // Check for duplicates
            const existing = await NewsletterSubscriber.filter({ email: email });
            if (existing.length > 0) {
                setStatus({ message: "You are already subscribed to our newsletter. Thank you!", type: 'info' });
                setEmail('');
                setIsSubmitting(false);
                return;
            }

            await NewsletterSubscriber.create({
                email: email,
                source: 'website_page',
            });
            setStatus({ message: 'Thank you for subscribing! Stay tuned for updates.', type: 'success' });
            setEmail('');
        } catch (error) {
            console.error("Subscription error:", error);
            setStatus({ message: 'An error occurred. Please try again later.', type: 'error' });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
            <AIFloatingChat />
            
            <main className="flex-grow pt-16">
                <div className="relative bg-cover bg-center h-52" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2940&auto=format&fit=crop')" }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
                    <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                        <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Join Our Newsletter</h1>
                        <p className="text-red-100 max-w-2xl text-lg shadow-lg">Receive updates on our programs, special events, and spiritual messages.</p>
                    </div>
                </div>

                <div className="max-w-lg mx-auto px-6 py-12 -mt-16 relative z-10">
                    <Card className="shadow-2xl border-0">
                        <CardHeader>
                            <CardTitle>Stay Connected</CardTitle>
                            <CardDescription>Enter your email to subscribe</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input 
                                    type="email" 
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                                <Button type="submit" className="bg-[#B71C1C] hover:bg-[#D32F2F]" disabled={isSubmitting}>
                                    <Mail className="w-4 h-4 mr-2"/> {isSubmitting ? '...' : 'Subscribe'}
                                </Button>
                            </form>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            {status.message && (
                                <p className={`text-center text-sm mt-4 ${
                                    status.type === 'success' ? 'text-green-600' : 
                                    status.type === 'error' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {status.message}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            
            <DynamicFooter />
        </div>
    );
}
