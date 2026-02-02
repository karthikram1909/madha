import React, { useState, useEffect, useCallback } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Play, Pause, Youtube as YoutubeIcon, Instagram, Facebook } from 'lucide-react';

const SocialIcon = ({ Icon, href, className, title }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200 ${className}`}
        title={title}
    >
        <Icon className="w-5 h-5"/>
    </a>
);

export default function FloatingUI() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isYoutubePopupOpen, setIsYoutubePopupOpen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [socialLinks, setSocialLinks] = useState({});
  const [audioSettings, setLiveAudioSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);



  const loadAudioFromAPI = async () => {
  try {
    const res = await fetch(
      'https://secure.madhatv.in/api/v2/menu_contents.php?action=audio&flag=0'
    );
    const data = await res.json();

    const audioUrl =
      data?.AudioUrl?.[0]?.audio_url || '';

    window.audioSettings = {
      primary_audio_url: audioUrl,
      backup_audio_url: '',
      enabled: true,
    };
  } catch (err) {
    console.error('Audio API load failed', err);
  }
};


  useEffect(() => {

    loadStickyData();
      loadAudioFromAPI(); 
  }, []);

  const loadStickyData = async () => {
    setIsLoading(true);
    try {
        const allWebsiteContentData = await WebsiteContent.filter({is_active: true});
        const headerContentMap = {};
        const liveAudioSettingsMap = {};
        const footerContentMap = {};
        const floatingUIContentMap = {};

        allWebsiteContentData.forEach(item => {
            if (item.section === 'homepage_header') {
                headerContentMap[item.content_key] = item.content_value;
            }
            if (item.section === 'live_audio') {
                liveAudioSettingsMap[item.content_key] = item.content_value;
            }
            if (item.section === 'footer') {
                footerContentMap[item.content_key] = item.content_value;
            }
            if (item.section === 'floating_ui') {
                floatingUIContentMap[item.content_key] = item.content_value;
            }
        });

        setSocialLinks({
            youtube: headerContentMap.social_youtube_url || 'https://www.youtube.com/@madhatv',
            youtube_channel_1_name: floatingUIContentMap.youtube_channel_1_name || footerContentMap.youtube_channel_1_name || 'Madha TV',
            youtube_channel_1_url: floatingUIContentMap.youtube_channel_1_url || footerContentMap.youtube_channel_1_url || 'https://youtube.com/@madhatv',
            youtube_channel_2_name: floatingUIContentMap.youtube_channel_2_name || footerContentMap.youtube_channel_2_name || 'Madha TV Music',
            youtube_channel_2_url: floatingUIContentMap.youtube_channel_2_url || footerContentMap.youtube_channel_2_url || 'https://youtube.com/@madhatvmusic',
            youtube_channel_3_name: floatingUIContentMap.youtube_channel_3_name || footerContentMap.youtube_channel_3_name || 'Madha TV Live',
            youtube_channel_3_url: floatingUIContentMap.youtube_channel_3_url || footerContentMap.youtube_channel_3_url || 'https://youtube.com/@madhatvlive',
            youtube_channel_4_name: floatingUIContentMap.youtube_channel_4_name || footerContentMap.youtube_channel_4_name || 'Madha TV Kids',
            youtube_channel_4_url: floatingUIContentMap.youtube_channel_4_url || footerContentMap.youtube_channel_4_url || 'https://youtube.com/@madhatvkids',
            whatsapp: headerContentMap.social_whatsapp_url || 'https://www.whatsapp.com/channel/0029Va9y2vV6GcG5EWQVBT0N?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnSjtWZAY6iPsOHTVEKkMWLRCSADjeztvOUWWk-w70e_6WLs-Fbg_V6ShMF50_aem_BQpWuxyvlPM4gEvnbxagUA',
            instagram: floatingUIContentMap.instagram_url || footerContentMap.instagram_url || 'https://instagram.com/madhatv',
            facebook: floatingUIContentMap.facebook_url || footerContentMap.facebook_url || 'https://facebook.com/madhatv',
            spotify: floatingUIContentMap.spotify_url || footerContentMap.spotify_url || 'https://open.spotify.com/user/3165nbzqmb7zweixrcw4ixnqpb6i',
            instagram_enabled: floatingUIContentMap.instagram_enabled !== 'false',
            facebook_enabled: floatingUIContentMap.facebook_enabled !== 'false'
        });
        
        setLiveAudioSettings(liveAudioSettingsMap);

        window.audioSettings = {
            primary_audio_url: liveAudioSettingsMap.primary_audio_url || 'https://60e66735799ea.streamlock.net:55//madhatv//audio//playlist.m3u8',
            backup_audio_url: liveAudioSettingsMap.backup_audio_url || '',
            enabled: liveAudioSettingsMap.enable_audio_player === 'true'
        };
    } catch(e) {
        console.error("Failed to load data for sticky icons", e);
        setSocialLinks({
            youtube: 'https://www.youtube.com/@madhatv',
            youtube_channel_1_name: 'Madha TV',
            youtube_channel_1_url: 'https://youtube.com/@madhatv',
            youtube_channel_2_name: 'Madha TV Music',
            youtube_channel_2_url: 'https://youtube.com/@madhatvmusic',
            youtube_channel_3_name: 'Madha TV Live',
            youtube_channel_3_url: 'https://youtube.com/@madhatvlive',
            youtube_channel_4_name: 'Madha TV Kids',
            youtube_channel_4_url: 'https://youtube.com/@madhatvkids',
            whatsapp: 'https://www.whatsapp.com/channel/0029Va9y2vV6GcG5EWQVBT0N?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnSjtWZAY6iPsOHTVEKkMWLRCSADjeztvOUWWk-w70e_6WLs-Fbg_V6ShMF50_aem_BQpWuxyvlPM4gEvnbxagUA',
            instagram: 'https://instagram.com/madhatv',
            facebook: 'https://facebook.com/madhatv',
            spotify: 'https://open.spotify.com/user/3165nbzqmb7zweixrcw4ixnqpb6i',
            instagram_enabled: true,
            facebook_enabled: true
        });
    }
    setIsLoading(false);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (window.audioPlayer) {
        window.audioPlayer.volume = newVolume;
    }
  };

  const handleAudioPlay = useCallback(() => {
    const { primary_audio_url, backup_audio_url } = window.audioSettings || {};

    if (!window.audioPlayer) {
      window.audioPlayer = document.createElement("audio");
      window.audioPlayer.volume = volume;
      document.body.appendChild(window.audioPlayer);
    }

    const audio = window.audioPlayer;

    if (audio.paused) {
      if (!primary_audio_url) return;
      if (window.Hls && window.Hls.isSupported()) {
        if (!window.hls) {
            window.hls = new window.Hls();
            window.hls.attachMedia(audio);
            window.hls.on(window.Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    if(backup_audio_url && window.hls.url !== backup_audio_url) {
                        window.hls.loadSource(backup_audio_url);
                    }
                }
            });
        }
        window.hls.loadSource(primary_audio_url);
        window.hls.on(window.Hls.Events.MANIFEST_PARSED, () => audio.play().catch(e => console.warn("Autoplay prevented.")));
      } else {
        audio.src = primary_audio_url;
        audio.play().catch(e => console.warn("Autoplay prevented."));
        audio.onerror = () => {
          if (backup_audio_url) audio.src = backup_audio_url;
        };
      }
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, [volume]);

  const handleAudioIconClick = () => {
    handleAudioPlay();
    setIsTooltipOpen(true);
  };
  
  useEffect(() => {
    if (!window.Hls) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <>
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 mt-12">
        {/* YouTube Icon with Box Popup on Hover */}
        <div 
          className="relative"
          onMouseEnter={() => setIsYoutubePopupOpen(true)}
          onMouseLeave={() => setIsYoutubePopupOpen(false)}
        >
          <button
            onClick={() => setIsYoutubePopupOpen(!isYoutubePopupOpen)}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200"
            title="YouTube Channels"
          >
            <YoutubeIcon className="w-5 h-5" />
          </button>
          
          {isYoutubePopupOpen && (
            <>
              <div className="absolute right-9 top-0 w-4 h-full" />
              <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-2 w-40 z-50 text-gray-800 border border-gray-100">
                <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <YoutubeIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                    <p className="font-semibold text-[10px] text-gray-900">YouTube Channels</p>
                  </div>
                </div>
              <div className="grid grid-cols-2 gap-1">
                <a 
                  href={socialLinks.youtube_channel_1_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-1 rounded-md bg-red-50 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mb-0.5">
                    <YoutubeIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[9px] text-gray-700 text-center line-clamp-1 font-medium">{socialLinks.youtube_channel_1_name}</span>
                </a>
                <a 
                  href={socialLinks.youtube_channel_2_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-1 rounded-md bg-red-50 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mb-0.5">
                    <YoutubeIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[9px] text-gray-700 text-center line-clamp-1 font-medium">{socialLinks.youtube_channel_2_name}</span>
                </a>
                <a 
                  href={socialLinks.youtube_channel_3_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-1 rounded-md bg-red-50 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mb-0.5">
                    <YoutubeIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[9px] text-gray-700 text-center line-clamp-1 font-medium">{socialLinks.youtube_channel_3_name}</span>
                </a>
                <a 
                  href={socialLinks.youtube_channel_4_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-1 rounded-md bg-red-50 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mb-0.5">
                    <YoutubeIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[9px] text-gray-700 text-center line-clamp-1 font-medium">{socialLinks.youtube_channel_4_name}</span>
                </a>
              </div>
              </div>
            </>
          )}
        </div>
        
        {/* Audio Player */}
        <div 
          className="relative"
          onMouseEnter={() => setIsTooltipOpen(true)}
          onMouseLeave={() => setIsTooltipOpen(false)}
        >
          <button
            id="audio_play_global"
            onClick={handleAudioIconClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200 ${isAudioPlaying ? 'audio-active' : 'inactive'}`}
            title={isAudioPlaying ? "Click to Pause" : "Click to Play"}
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/875e3d700_microphone.png" 
              alt="Radio" 
              className="w-5 h-5"
            />
          </button>
          {isAudioPlaying && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2">
              <span className="live-badge">LIVE</span>
            </div>
          )}
          
          {isTooltipOpen && (
            <>
              <div className="absolute right-9 top-0 w-4 h-full" />
              <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-2 w-44 z-50 text-gray-800 border border-gray-100">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[10px] text-gray-900">Madha Radio</p>
                      <p className="text-[8px] text-gray-500">Live Stream</p>
                    </div>
                  </div>
                </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isAudioPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-[9px] text-gray-600">{isAudioPlaying ? 'Now Playing' : 'Radio Stopped'}</span>
              </div>
              <div className="flex items-center justify-center mb-2">
                <button onClick={handleAudioPlay} className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${isAudioPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                  {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 text-xs">🔊</span>
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800" />
                  <span className="text-[9px] text-gray-600 w-7 text-center">{Math.round(volume * 100)}%</span>
              </div>
              </div>
            </>
          )}
        </div>

        {/* WhatsApp Icon */}
        <a
          href={socialLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200 p-1.5"
          title="WhatsApp"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full text-white">
            <path d="M19.05 4.94A10 10 0 0012 2C6.48 2 2 6.48 2 12c0 1.77.46 3.45 1.25 4.95L2 22l5.05-1.25c1.5.79 3.18 1.25 4.95 1.25h.01c5.52 0 10-4.48 10-10 0-2.76-1.12-5.26-2.96-7.06zM12 20.01c-1.63 0-3.19-.48-4.54-1.34l-.32-.19-3.38.84.86-3.3l-.22-.34A8.01 8.01 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8.01zm4.49-6.18c-.27-.14-1.59-.78-1.84-.88-.25-.09-.43-.14-.62.14-.19.28-.7.88-.86 1.06-.16.19-.32.21-.59.07s-1.16-.43-2.2-1.36c-.81-.72-1.36-1.61-1.52-1.88-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.19-.28.28-.46.09-.19.04-.37-.02-.51-.07-.14-.62-1.49-.84-2.04-.23-.55-.46-.48-.62-.48-.16 0-.34-.02-.51-.02s-.43.07-.66.34c-.23.27-.86.83-1.06 2.04-.2 1.21.33 2.36.93 3.3.6 1 1.72 2.37 3.96 3.32.55.23 1.04.37 1.45.48.65.18 1.23.16 1.69.1.5-.07 1.59-.65 1.81-1.27.22-.62.22-1.15.16-1.27-.07-.12-.24-.19-.51-.33z"/>
          </svg>
        </a>
        
        {/* Spotify Icon */}
        <a
          href={socialLinks.spotify || 'https://open.spotify.com/show/madhatv'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-[#1DB954] hover:bg-[#1ed760] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200"
          title="Spotify"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-white">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </a>

        {/* Instagram Icon */}
        {socialLinks.instagram_enabled !== false && (
          <a
            href={socialLinks.instagram || 'https://instagram.com/madhatv'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200"
            title="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
        )}

        {/* Facebook Icon */}
        {socialLinks.facebook_enabled !== false && (
          <a
            href={socialLinks.facebook || 'https://facebook.com/madhatv'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#166FE5] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200"
            title="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
        )}
      </div>

      <style>{`
        @keyframes pulse-audio {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,215,0,0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255,215,0,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,215,0,0); }
        }
        .audio-active { 
          animation: pulse-audio 1.5s infinite; 
          background-color: #f59e0b !important; 
          overflow: hidden;
          position: relative;
        }
        .audio-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: shine 2.5s infinite linear;
        }

        @keyframes shine {
          0% { left: -100%; }
          60% { left: 100%; }
          100% { left: 100%; }
        }

        .live-badge {
          background-color: #ef4444;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: bold;
          animation: pulse-badge 1.5s infinite ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        @keyframes pulse-badge {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }

        #audio_play_global.inactive { background-color: #0096FF; }
        input[type=range].accent-gray-800::-webkit-slider-thumb { background-color: rgb(31 41 55); }
        input[type=range].accent-gray-800::-moz-range-thumb { background-color: rgb(31 41 55); }
      `}</style>
    </>
  );
}