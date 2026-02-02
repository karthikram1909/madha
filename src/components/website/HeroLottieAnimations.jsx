import React, { useEffect, useState } from 'react';
import { WebsiteContent } from '@/api/entities';

export default function HeroLottieAnimations() {
  const [cornerEnabled, setCornerEnabled] = useState(false);
  const [cornerImageUrl, setCornerImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await WebsiteContent.filter({ section: 'lottie_animation' });
        settings.forEach(setting => {
          if (setting.content_key === 'hero_corner_lottie_enabled') {
            setCornerEnabled(setting.content_value === 'true' && setting.is_active);
          } else if (setting.content_key === 'hero_corner_lottie_url') {
            setCornerImageUrl(setting.content_value || '');
          }
        });
      } catch (error) {
        console.error('Error loading hero lottie settings:', error);
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  if (isLoading) return null;

  const imageUrl = cornerImageUrl || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f9beb680650e7849f02a09/58e3c97e0_pngegg53.png';

  return (
    <>
      {/* Corner Image - Top right corner of hero */}
      {cornerEnabled && (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
          <img 
            src={imageUrl} 
            alt="Decoration"
            className="w-[100px] h-auto md:w-[200px]"
          />
        </div>
      )}
    </>
  );
}