import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FloatingAudioPlayer({ settings }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hls, setHls] = useState(null);
    const audioRef = useRef(null);

    const isEnabled = settings?.enable_audio_player === 'true';
    const primaryUrl = settings?.primary_audio_url;
    const backupUrl = settings?.backup_audio_url;

    useEffect(() => {
        if (!isEnabled) return;
        
        if (!window.Hls) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            document.head.appendChild(script);
        }
        
        audioRef.current = document.createElement('audio');
        document.body.appendChild(audioRef.current);

        return () => {
            if (hls) {
                hls.destroy();
            }
            if (audioRef.current) {
                audioRef.current.remove();
                audioRef.current = null;
            }
        };
    }, [isEnabled]);

    const setupHlsPlayer = (url, isBackup = false) => {
        if (window.Hls && window.Hls.isSupported()) {
            const hlsInstance = new window.Hls();
            setHls(hlsInstance);

            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(audioRef.current);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
                audioRef.current.play().catch(e => console.error("Autoplay failed", e));
                setIsPlaying(true);
            });

            hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('HLS.js fatal error:', data);
                    if (!isBackup && backupUrl) {
                        console.log('Primary stream failed, trying backup...');
                        hlsInstance.destroy();
                        setupHlsPlayer(backupUrl, true);
                    }
                }
            });
        } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            audioRef.current.src = url;
            audioRef.current.addEventListener('loadedmetadata', () => {
                 audioRef.current.play().catch(e => console.error("Autoplay failed", e));
                 setIsPlaying(true);
            });
        }
    };

    const handlePlayToggle = () => {
        if (!primaryUrl) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            if (hls) {
                hls.destroy();
                setHls(null);
            }
        } else {
            setupHlsPlayer(primaryUrl);
        }
    };

    if (!isEnabled) {
        return null;
    }

    const floatingButtonVariants = {
        initial: { scale: 0, opacity: 0 },
        animate: { 
          scale: 1, 
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.3 }
        },
        hover: { 
          scale: 1.1, 
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          transition: { type: "spring", stiffness: 400 }
        },
        tap: { scale: 0.95 }
    };
    
    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
            <motion.div
              variants={floatingButtonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              className="group relative"
            >
              <Button
                id="audio_play_button"
                onClick={handlePlayToggle}
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${isPlaying ? 'from-orange-500 to-orange-600' : 'from-purple-500 to-purple-600'} text-white shadow-2xl border-4 border-white/20 backdrop-blur-sm transition-colors duration-300`}
                title={isPlaying ? "Pause Live Audio" : "Play Live Audio"}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
            </motion.div>
        </div>
    );
}