import React, { useEffect, useState } from 'react';
import { FestiveTheme } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';

// Snowflake component
const Snowflake = ({ delay, duration, left, size }) => (
    <motion.div
        className="fixed text-white pointer-events-none z-[100]"
        style={{ left: `${left}%`, top: -20, fontSize: size }}
        initial={{ y: -20, opacity: 0, rotate: 0 }}
        animate={{ 
            y: '100vh', 
            opacity: [0, 1, 1, 0],
            rotate: 360
        }}
        transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            ease: "linear"
        }}
    >
        ❄
    </motion.div>
);

// Sparkle component
const Sparkle = ({ delay, x, y }) => (
    <motion.div
        className="fixed pointer-events-none z-[100]"
        style={{ left: `${x}%`, top: `${y}%` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0]
        }}
        transition={{
            duration: 1.5,
            delay: delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3
        }}
    >
        ✨
    </motion.div>
);

// Firework component
const Firework = ({ delay, x }) => (
    <motion.div
        className="fixed pointer-events-none z-[100] text-3xl"
        style={{ left: `${x}%`, bottom: '20%' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
            scale: [0, 2, 0],
            opacity: [0, 1, 0],
            y: [0, -150, -200]
        }}
        transition={{
            duration: 2.5,
            delay: delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 5 + 2
        }}
    >
        🎆
    </motion.div>
);

// Light string component
const LightString = () => {
    const colors = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ffffff'];
    return (
        <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-around py-1 bg-gradient-to-b from-black/20 to-transparent">
            {Array.from({ length: 25 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 md:w-3 md:h-3 rounded-full shadow-lg"
                    style={{ 
                        backgroundColor: colors[i % colors.length],
                        boxShadow: `0 0 10px ${colors[i % colors.length]}, 0 0 20px ${colors[i % colors.length]}`
                    }}
                    animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.3, 0.8]
                    }}
                    transition={{
                        duration: 0.8,
                        delay: i * 0.08,
                        repeat: Infinity
                    }}
                />
            ))}
        </div>
    );
};

// Santa Sleigh Animation
const SantaSleigh = ({ customUrl }) => {
    const [hasAnimated, setHasAnimated] = useState(false);
    
    useEffect(() => {
        // Show sleigh animation on first load
        const timer = setTimeout(() => setHasAnimated(true), 8000);
        return () => clearTimeout(timer);
    }, []);

    const sleighUrl = customUrl || 'https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif';

    return (
        <AnimatePresence>
            {!hasAnimated && (
                <motion.div
                    className="fixed z-[200] pointer-events-none"
                    initial={{ x: '-100%', y: '10%' }}
                    animate={{ x: '120vw', y: ['10%', '5%', '15%', '8%', '12%'] }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        duration: 7,
                        ease: "easeInOut",
                        y: { duration: 7, repeat: 0 }
                    }}
                    style={{ top: '5%' }}
                >
                    <img 
                        src={sleighUrl}
                        alt="Santa Sleigh"
                        className="w-32 h-auto md:w-48 lg:w-64"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Santa Cap on Logo
const SantaCap = ({ offsetX = -10, offsetY = -15, customUrl }) => {
    const capUrl = customUrl || 'https://www.pngall.com/wp-content/uploads/2016/05/Santa-Claus-Hat-Free-Download-PNG.png';
    
    return (
        <motion.div
            className="fixed z-[150] pointer-events-none"
            style={{ 
                top: 8 + offsetY,
                left: 16 + offsetX,
            }}
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: [-15, -10, -15], scale: 1 }}
            transition={{ 
                rotate: { duration: 2, repeat: Infinity },
                scale: { duration: 0.5, type: "spring" }
            }}
        >
            <img 
                src={capUrl}
                alt="Santa Cap"
                className="w-10 h-10 md:w-12 md:h-12"
                style={{ 
                    filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
                    transform: 'rotate(-25deg)'
                }}
            />
        </motion.div>
    );
};

// Christmas Tree
const ChristmasTree = ({ position }) => (
    <motion.div
        className={`fixed z-[90] pointer-events-none text-5xl md:text-6xl ${
            position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'
        }`}
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
    >
        <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            🎄
        </motion.div>
    </motion.div>
);

// Gift Box
const GiftBox = ({ position }) => (
    <motion.div
        className={`fixed z-[90] pointer-events-none text-3xl md:text-4xl ${
            position === 'top-left' ? 'top-16 left-4' : 'top-16 right-4'
        }`}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
    >
        <motion.div
            animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            🎁
        </motion.div>
    </motion.div>
);

// Christmas Toys/Ornaments
const ChristmasToys = () => (
    <>
        <motion.div
            className="fixed top-24 right-8 z-[90] pointer-events-none text-3xl md:text-4xl"
            animate={{ rotate: [0, 15, -15, 0], y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
        >
            🔔
        </motion.div>
        <motion.div
            className="fixed top-40 left-4 z-[90] pointer-events-none text-2xl md:text-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
        >
            🎅
        </motion.div>
        <motion.div
            className="fixed bottom-24 left-16 z-[90] pointer-events-none text-2xl md:text-3xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
        >
            ⭐
        </motion.div>
        <motion.div
            className="fixed top-1/3 right-4 z-[90] pointer-events-none text-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
            🎀
        </motion.div>
    </>
);

// Christmas Cake
const ChristmasCake = ({ position }) => (
    <motion.div
        className={`fixed z-[90] pointer-events-none text-4xl md:text-5xl ${
            position === 'bottom-left' ? 'bottom-4 left-20' : 'bottom-4 right-4'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
    >
        <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
        >
            🎂
        </motion.div>
    </motion.div>
);

export default function FestiveOverlay() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const themes = await FestiveTheme.list();
                if (themes && themes.length > 0) {
                    setSettings(themes[0]);
                }
            } catch (error) {
                console.error('Failed to load festive theme:', error);
            }
        };
        loadSettings();
        
        // Refresh settings every 30 seconds for live updates
        const interval = setInterval(loadSettings, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!settings || !settings.is_active || settings.theme_type === 'none') {
        return null;
    }

    const isChristmas = settings.theme_type === 'christmas';
    const isNewYear = settings.theme_type === 'newyear';

    // Generate snowflakes based on intensity
    const snowflakeCount = settings.show_snowfall ? 
        (settings.snowfall_intensity === 'light' ? 15 : settings.snowfall_intensity === 'heavy' ? 50 : 30) : 0;
    
    const snowflakes = Array.from({ length: snowflakeCount }).map((_, i) => ({
        id: i,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 6,
        left: Math.random() * 100,
        size: `${12 + Math.random() * 12}px`
    }));

    // Generate sparkles
    const sparkleCount = settings.show_sparkles ? (settings.sparkle_count || 15) : 0;
    const sparkles = Array.from({ length: sparkleCount }).map((_, i) => ({
        id: i,
        delay: Math.random() * 3,
        x: Math.random() * 100,
        y: Math.random() * 100
    }));

    // Generate fireworks
    const fireworks = settings.show_fireworks && isNewYear ? Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 4,
        x: 10 + Math.random() * 80
    })) : [];

    // Inject CSS custom properties for the festive color palette
    // These override the primary theme colors across the website
    const primaryColor = settings.primary_color || '#B71C1C';
    const secondaryColor = settings.secondary_color || '#1B5E20';
    const accentColor = settings.accent_color || '#FFD700';
    const textColor = settings.text_color || '#FFFFFF';
    
    const colorStyles = isChristmas ? `
        :root {
            --festive-primary: ${primaryColor};
            --festive-secondary: ${secondaryColor};
            --festive-accent: ${accentColor};
            --festive-text: ${textColor};
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
        }
        
        /* Section titles - golden accent */
        .section-title,
        h2.section-title {
            color: ${accentColor} !important;
        }
        
        /* Service card titles */
        .service-title,
        .service-card h3 {
            color: ${primaryColor} !important;
        }
        
        /* Yellow/gold elements */
        [class*="text-yellow"],
        [class*="text-\\[\\#FFD700\\]"],
        .text-\\[\\#faf188\\] {
            color: ${accentColor} !important;
        }
        
        /* Yellow background dividers */
        [class*="bg-yellow"] {
            background-color: ${accentColor} !important;
        }
        
        /* Primary red backgrounds */
        [class*="bg-\\[\\#B71C1C\\]"],
        [class*="bg-\\[\\#861518\\]"],
        [class*="bg-\\[\\#8B0000\\]"],
        [class*="bg-red-"] {
            background-color: ${primaryColor} !important;
        }
        
        /* Primary red text */
        [class*="text-\\[\\#B71C1C\\]"],
        [class*="text-\\[\\#861518\\]"],
        [class*="text-red-"] {
            color: ${primaryColor} !important;
        }
        
        /* Navbar and fixed elements */
        nav[class*="bg-black"] {
            background: linear-gradient(to right, ${primaryColor}dd, ${secondaryColor}dd) !important;
        }
        
        /* Book Now buttons in services */
        .service-card button {
            background-color: ${primaryColor} !important;
        }
        
        .service-card button:hover {
            background-color: ${secondaryColor} !important;
            color: ${textColor} !important;
        }
        
        /* Schedule and Shows section headers */
        [class*="SCHEDULE"],
        [class*="SHOWS"] {
            color: ${accentColor} !important;
        }
    ` : '';

    return (
        <div className="festive-overlay">
            {/* Inject festive color palette CSS */}
            {isChristmas && <style>{colorStyles}</style>}
            
            {/* Santa Cap on Logo - Christmas only */}
            {isChristmas && settings.show_santa_cap && (
                <SantaCap 
                    offsetX={settings.santa_cap_offset_x || -10}
                    offsetY={settings.santa_cap_offset_y || -15}
                    customUrl={settings.custom_santa_cap_url}
                />
            )}

            {/* Santa Sleigh Animation - Christmas only */}
            {isChristmas && settings.show_santa_sleigh && (
                <SantaSleigh customUrl={settings.custom_sleigh_gif_url} />
            )}

            {/* Snowfall */}
            {snowflakes.map(s => (
                <Snowflake key={s.id} {...s} />
            ))}

            {/* Sparkles */}
            {sparkles.map(s => (
                <Sparkle key={s.id} {...s} />
            ))}

            {/* Christmas specific elements */}
            {isChristmas && (
                <>
                    {settings.show_christmas_tree && (
                        <ChristmasTree position={settings.christmas_tree_position || 'bottom-left'} />
                    )}
                    {settings.show_christmas_toys && <ChristmasToys />}
                    {settings.show_cake && (
                        <ChristmasCake position={settings.cake_position || 'bottom-right'} />
                    )}
                    {settings.show_gift_box && (
                        <GiftBox position={settings.gift_position || 'top-right'} />
                    )}
                </>
            )}

            {/* New Year specific elements */}
            {isNewYear && (
                <>
                    {settings.show_lights && <LightString />}
                    {fireworks.map(f => (
                        <Firework key={f.id} {...f} />
                    ))}
                </>
            )}
        </div>
    );
}