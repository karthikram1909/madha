import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ArrowButton = ({ direction, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`absolute top-1/2 -translate-y-1/2 z-20 bg-white/60 text-red-700 rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed ${
            direction === 'left' ? 'left-[-16px]' : 'right-[-16px]'
        }`}
    >
        {direction === 'left' ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
    </button>
);

export default function ShowCarousel({ shows }) {
    const [index, setIndex] = useState(0);
    const cardsPerView = 3;

    if (!shows || shows.length === 0) {
        return null;
    }

    const slideNext = () => {
        if (index < shows.length - cardsPerView) {
            setIndex(prev => prev + 1);
        }
    };

    const slidePrev = () => {
         if (index > 0) {
            setIndex(prev => prev - 1);
        }
    };
    
    // Handle responsiveness for cardsPerView if needed in future
    // For now, focusing on the 3-card desktop layout as requested.
    // CSS will handle collapsing, but JS logic assumes 3.

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            <div className="overflow-hidden">
                <motion.div
                    className="flex"
                    animate={{ x: `calc(-${index * (100 / cardsPerView)}% - ${index * (16 / cardsPerView)}px)` }} // Adjust for gap
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {shows.map((show) => (
                         <div key={show.id} className="flex-shrink-0 w-full p-2" style={{ flexBasis: `calc(100% / ${cardsPerView})` }}>
                            <a
                                href={show.redirect_url}
                                target={show.open_in_new_tab ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="block group"
                            >
                                <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-yellow-400/20 transition-all duration-300 transform group-hover:-translate-y-1">
                                    <img
                                        src={show.poster_image_url}
                                        alt={show.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwTDEwMCAxMjBaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                                        }}
                                    />
                                </div>
                            </a>
                        </div>
                    ))}
                </motion.div>
            </div>
            
            {shows.length > cardsPerView && (
                <>
                    <ArrowButton direction="left" onClick={slidePrev} disabled={index === 0} />
                    <ArrowButton direction="right" onClick={slideNext} disabled={index >= shows.length - cardsPerView} />
                </>
            )}
        </div>
    );
}