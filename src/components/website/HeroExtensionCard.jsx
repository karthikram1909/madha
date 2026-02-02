import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MousePointerClick, SatelliteDish } from "lucide-react";
import "../assets/Home.css"
const channels = [
    { name: 'Airtel', number: '816' },
    { name: 'Dish TV', number: '599' },
    { name: 'Sun Direct', number: '458' },
    { name: 'Tata Sky', number: '1590' },
    { name: 'Videocon', number: '3017' },
];

// Duplicate for seamless scroll
const displayChannels = [...channels, ...channels];

export default function HeroExtensionCard({ language }) {
  return (
    <>
      <style>{`
        @keyframes pulse-hand { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .animate-pulse-hand { animation: pulse-hand 2s ease-in-out infinite; }
        @keyframes button-glow { 0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.4), 0 0 20px rgba(183, 28, 28, 0.2); } 50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.7), 0 0 40px rgba(183, 28, 28, 0.4); } }
        .prayer-button-animated { animation: button-glow 3s ease-in-out infinite; }
        
        .marquee-container {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .marquee-wrap {
          animation: scroll-horizontal 25s linear infinite;
        }
        .marquee-wrap:hover {
          animation-play-state: paused;
        }
        @keyframes scroll-horizontal {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        .dth-badge-shine {
          position: relative;
          overflow: hidden;
        }
        .dth-badge-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shine 3s infinite;
        }
      `}</style>
      
      <div className="w-full bg-black/40 backdrop-blur-sm border border-slate-700 rounded-xl p-3 sm:p-4 shadow-lg mt-4" >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Left Part: DTH Info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 bg-amber-600/60 hover:bg-amber-500/80 rounded-full flex items-center justify-center text-white transition-all duration-300">
              <SatelliteDish className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1" id="DTH">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                {language === 'tamil' ? 'டிடிஎச் சேனல்கள்' : 'DTH Channels'}
              </h4>
              <div className="marquee-container overflow-hidden">
                <div className="flex marquee-wrap">
                  {displayChannels.map((channel, index) => (
                    <div key={index} className="flex-shrink-0 flex items-center gap-1 text-white px-1.5 sm:px-2 py-0.5">
                      <span className="text-[10px] sm:text-xs font-medium">{channel.name}:</span>
                      <span className="text-[10px] sm:text-xs font-bold text-amber-400">{channel.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Part: Prayer Request Button */}
          <Link
            to={createPageUrl('PrayerRequest')}
            className="prayer-button-animated flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-transform duration-300 hover:scale-105 flex-shrink-0 w-full sm:w-auto"
          >
            <MousePointerClick className="animate-pulse-hand w-4 h-4" />
            <span className="whitespace-nowrap text-center">
              {language === 'tamil' ? 'செப உதவிக்கு இங்கே கிளிக் செய்யவும்' : 'Click Here for Prayer Request'}
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}