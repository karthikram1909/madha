import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function AutoLocationDetector({ user, onLocationSaved, onDismiss }) {
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };

        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);

        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);

    // Check if user needs location detection
    const needsLocation = !user?.country || !user?.state;

    // Don't show if user already has location info
    if (!needsLocation) {
        return null;
    }

    const detectLocation = async () => {
        setIsDetecting(true);
        setError(null);

        try {
            console.log('🌍 Detecting user location via IP...');

            // Use ipapi.co for IP-based geolocation (free, no API key needed)
            const response = await fetch('https://ipapi.co/json/');
            
            if (!response.ok) {
                throw new Error('Failed to detect location');
            }

            const data = await response.json();
            
            console.log('📍 Location detected:', {
                country: data.country_name,
                state: data.region,
                city: data.city,
                postal: data.postal
            });

            // Map to our data structure
            const location = {
                country: data.country_name || 'India',
                state: data.region || '',
                city: data.city || '',
                pincode: data.postal || '',
                latitude: data.latitude,
                longitude: data.longitude
            };

            setDetectedLocation(location);
            toast.success(
                language === 'tamil' 
                    ? 'இருப்பிடம் வெற்றிகரமாகக் கண்டறியப்பட்டது!' 
                    : 'Location detected successfully!'
            );

        } catch (error) {
            console.error('❌ Location detection failed:', error);
            setError(error.message);
            toast.error(
                language === 'tamil'
                    ? 'இருப்பிடத்தைக் கண்டறிய முடியவில்லை. தயவுசெய்து கைமுறையாக உள்ளிடவும்.'
                    : 'Failed to detect location. Please enter manually.'
            );
        } finally {
            setIsDetecting(false);
        }
    };

    const saveLocation = async () => {
        if (!detectedLocation) return;

        setIsSaving(true);
        try {
            console.log('💾 Saving detected location to user profile...');

            await base44.auth.updateMe({
                country: detectedLocation.country,
                state: detectedLocation.state,
                city: detectedLocation.city || user?.city,
                pincode: detectedLocation.pincode || user?.pincode
            });

            console.log('✅ Location saved successfully');
            
            toast.success(
                language === 'tamil'
                    ? 'இருப்பிடம் சேமிக்கப்பட்டது!'
                    : 'Location saved successfully!'
            );

            if (onLocationSaved) {
                onLocationSaved(detectedLocation);
            }

        } catch (error) {
            console.error('❌ Failed to save location:', error);
            toast.error(
                language === 'tamil'
                    ? 'இருப்பிடத்தைச் சேமிக்க முடியவில்லை'
                    : 'Failed to save location'
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>
                            {language === 'tamil' 
                                ? 'உங்கள் இருப்பிடத்தை அமைக்கவும்' 
                                : 'Set Your Location'}
                        </span>
                    </CardTitle>
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDismiss}
                            className="h-8 w-8"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {!detectedLocation ? (
                    <>
                        <Alert className="mb-4">
                            <AlertDescription className="text-sm">
                                {language === 'tamil'
                                    ? 'உங்கள் இருப்பிடத்தைக் கண்டறிய, வரி கணக்கீடு மற்றும் சேவை கிடைக்குமா என்பதற்கு இது உதவுகிறது.'
                                    : 'We need your location for accurate tax calculation and service availability.'}
                            </AlertDescription>
                        </Alert>

                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription className="text-sm">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={detectLocation}
                            disabled={isDetecting}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isDetecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {language === 'tamil' ? 'கண்டறிகிறது...' : 'Detecting...'}
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {language === 'tamil' 
                                        ? 'தானாக இருப்பிடத்தைக் கண்டறியவும்' 
                                        : 'Auto-Detect My Location'}
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-slate-500 mt-2 text-center">
                            {language === 'tamil'
                                ? 'அல்லது உங்கள் சுயவிவரத்தில் கைமுறையாக உள்ளிடலாம்'
                                : 'Or enter manually in your profile settings'}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="bg-white rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm mb-2">
                                        {language === 'tamil' 
                                            ? 'கண்டறியப்பட்ட இருப்பிடம்:' 
                                            : 'Detected Location:'}
                                    </p>
                                    <div className="space-y-1 text-sm text-slate-700">
                                        <p><strong>{language === 'tamil' ? 'நாடு:' : 'Country:'}</strong> {detectedLocation.country}</p>
                                        <p><strong>{language === 'tamil' ? 'மாநிலம்:' : 'State:'}</strong> {detectedLocation.state}</p>
                                        {detectedLocation.city && (
                                            <p><strong>{language === 'tamil' ? 'நகரம்:' : 'City:'}</strong> {detectedLocation.city}</p>
                                        )}
                                        {detectedLocation.pincode && (
                                            <p><strong>{language === 'tamil' ? 'அஞ்சல் குறியீடு:' : 'Postal Code:'}</strong> {detectedLocation.pincode}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={saveLocation}
                                disabled={isSaving}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {language === 'tamil' ? 'சேமிக்கிறது...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {language === 'tamil' ? 'சேமிக்கவும்' : 'Save Location'}
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => setDetectedLocation(null)}
                                variant="outline"
                                disabled={isSaving}
                            >
                                {language === 'tamil' ? 'மீண்டும் கண்டறியவும்' : 'Detect Again'}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}