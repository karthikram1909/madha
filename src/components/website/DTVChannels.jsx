
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { SatelliteDish } from 'lucide-react';

const channels = [
    { name: 'Airtel', number: '816' },
    { name: 'Dish TV', number: '599' },
    { name: 'Sun Direct', number: '458' },
    { name: 'Tata Sky', number: '1590' },
    { name: 'Videocon', number: '3017' },
];

// Duplicate for seamless scroll
const displayChannels = [...channels, ...channels];

export default function DTVChannels({ language = 'english' }) {
    return (
        <div className="w-full max-w-sm">
            <style>{`
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
                .dtv-badge-shine {
                    position: relative;
                    overflow: hidden;
                }
                .dtv-badge-shine::after {
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
            
            <Card className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-gray-700 overflow-hidden">
                <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <span className="text-xs font-bold text-black bg-amber-400 px-3 py-1 rounded-full shadow-md ">
                            {language === 'tamil' ? 'டிடிஎச்' : 'DTH'}
                        </span>
                    </div>
                    <div className="flex-1 marquee-container overflow-hidden">
                        <div className="flex marquee-wrap">
                            {displayChannels.map((channel, index) => (
                                <div key={index} className="flex-shrink-0 flex items-center gap-2 text-white px-4 py-1">
                                    <SatelliteDish className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-medium">{channel.name}:</span>
                                    <span className="text-sm font-bold">{channel.number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
