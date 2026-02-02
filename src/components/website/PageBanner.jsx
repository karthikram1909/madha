import React, { useEffect, useState } from 'react';
import { useGlobalData } from '@/components/GlobalDataProvider';

export default function PageBanner({ pageKey, fallbackTitle, fallbackDescription, fallbackImage }) {
  // Retrieve contentMap and ensure it's not null
  const { contentMap } = useGlobalData() || {}; // Using fallback if useGlobalData returns null
  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

  // Listen for language changes
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

  // Check if contentMap and page_banners exist before proceeding
  const pageBanners = contentMap?.page_banners || {}; // Safely access page_banners
  const titleData = pageBanners[`${pageKey}_title`];
  const descriptionData = pageBanners[`${pageKey}_description`];
  const imageData = pageBanners[`${pageKey}_image`];

  // Determine display values based on language
  const displayTitle = language === 'tamil' && titleData?.tamil
    ? titleData.tamil
    : titleData?.value || fallbackTitle;

  const displayDescription = language === 'tamil' && descriptionData?.tamil
    ? descriptionData.tamil
    : descriptionData?.value || fallbackDescription;

  const displayImage = imageData?.value || fallbackImage;

  // Split description into paragraphs for multi-paragraph support
  const descriptionParagraphs = displayDescription ? displayDescription.split('\n').filter(p => p.trim()) : [];

  return (
    <div 
      className="relative bg-cover bg-center min-h-48 sm:min-h-52 md:min-h-60 my-6 sm:my-8 md:my-12" 
      style={{ backgroundImage: `url('${displayImage}')` }}
    >
     <div className="absolute inset-0 bg-gradient-to-t from-[#02305C]/90 via-[#022145]/70 to-[#022145]/40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-full flex flex-col justify-center py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-5 mb-2 sm:mb-3 leading-tight">
          {displayTitle}
        </h1>
        <div className="text-red-100 w-full text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-7xl space-y-2">
          {descriptionParagraphs.length > 0 ? (
            descriptionParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p>{displayDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}
