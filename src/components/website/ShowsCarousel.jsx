import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tv } from 'lucide-react';

export default function ShowsCarousel({ shows = [], language = 'english' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (shows.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % shows.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [shows]);

  if (!shows.length) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          <Tv className="w-4 h-4 text-[#FFD700]" />
          <h3 className="text-xs font-bold text-[#FFD700]">
            {language === 'tamil' ? 'நிகழ்ச்சிகள்' : 'SHOWS'}
          </h3>
        </div>

        <Card className="p-4 text-center text-slate-500">
          No shows available
        </Card>
      </div>
    );
  }

  const currentShow = shows[currentIndex];

  const title =
    language === 'tamil' && currentShow.title_tamil
      ? currentShow.title_tamil
      : currentShow.title_en;

  const imageUrl =
    currentShow.image ||
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Tv className="w-4 h-4 text-[#FFD700]" />
        <h3 className="text-xs font-bold text-[#FFD700]">
          {language === 'tamil' ? 'நிகழ்ச்சிகள்' : 'SHOWS'}
        </h3>
      </div>

      {/* Card */}
      <Card
        className="relative cursor-pointer overflow-hidden rounded-xl"
        onClick={() =>
          currentShow.playlist_url &&
          window.open(currentShow.playlist_url, "_blank")
        }
      >
        {/* Image */}
        <div className="relative aspect-video w-full">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* TITLE INSIDE IMAGE (NO BG) */}
          <div className="absolute bottom-2 left-0 right-0 px-2">
            <p
              className="text-xs font-bold text-[#FFD700] text-center line-clamp-2"
              style={{
                textShadow: "0 2px 6px rgba(0,0,0,0.8)"
              }}
            >
              {title}
            </p>
          </div>
        </div>
      </Card>

      {/* Pagination dots */}
      {shows.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {shows.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#FFD700] w-4'
                  : 'bg-white/40 w-1.5 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
