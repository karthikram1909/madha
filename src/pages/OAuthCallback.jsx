import React, { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuthCallback() {
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Processing login...');
    const navigate = useNavigate();

    useEffect(() => {
        handleOAuthCallback();
    }, []);

    const handleOAuthCallback = async () => {
        try {
            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');

            if (error) {
                setStatus('error');
                setMessage(`Authentication failed: ${error}`);
                setTimeout(() => {
                    navigate(createPageUrl('Home'));
                }, 3000);
                return;
            }

            if (!code) {
                setStatus('error');
                setMessage('No authorization code received');
                setTimeout(() => {
                    navigate(createPageUrl('Home'));
                }, 3000);
                return;
            }

            setMessage('Completing authentication...');

            // Check if user is now authenticated
            const user = await User.me();
            
            if (user) {
                setStatus('success');
                setMessage(`Welcome, ${user.full_name}! Redirecting to your dashboard...`);
                
                // Determine redirect URL based on user role
                const redirectUrl = user.role === 'admin' 
                    ? createPageUrl('Dashboard')
                    : createPageUrl('UserDashboard');
                
                setTimeout(() => {
                    navigate(redirectUrl);
                }, 2000);
            } else {
                throw new Error('Authentication successful but user data not available');
            }

        } catch (error) {
            console.error('OAuth callback error:', error);
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            setTimeout(() => {
                navigate(createPageUrl('Home'));
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    {status === 'processing' && (
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">
                    {status === 'processing' && 'Authenticating...'}
                    {status === 'success' && 'Login Successful!'}
                    {status === 'error' && 'Authentication Error'}
                </h1>

                <p className="text-slate-600 mb-6">{message}</p>

                {status === 'processing' && (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                )}

                {status === 'error' && (
                    <button
                        onClick={() => navigate(createPageUrl('Home'))}
                        className="bg-[#B71C1C] hover:bg-[#8B0000] text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Return to Home
                    </button>
                )}
            </div>
        </div>
    );
}