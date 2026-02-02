// import React, { useEffect, useRef, useState } from 'react';
// import { AlertTriangle, Loader2 } from 'lucide-react';

// export default function LivePlayer({ primaryStreamUrl, backupStreamUrl }) {
//   const videoRef = useRef(null);
//   const hlsRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//   if (!primaryStreamUrl || !videoRef.current) {
//   return;
// }

//     console.log('🎬 Initializing player with:', {
//       primaryStreamUrl,
//       backupStreamUrl,
//       hasVideo: !!videoRef.current
//     });

//     const initializePlayer = (url, isBackup = false) => {
//       if (!videoRef.current) {
//         console.error('Video element not ready');
//         return;
//       }

//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }

//       console.log('📡 Loading stream:', url);

//       const Hls = window.Hls;

//       if (Hls && Hls.isSupported()) {
//         const hls = new Hls({
//           debug: true,
//           enableWorker: true,
//           lowLatencyMode: false,
//           backBufferLength: 90,
//           manifestLoadingTimeOut: 20000,
//           manifestLoadingMaxRetry: 4,
//           manifestLoadingRetryDelay: 1000,
//           levelLoadingTimeOut: 20000,
//           levelLoadingMaxRetry: 4,
//           levelLoadingRetryDelay: 1000,
//           fragLoadingTimeOut: 30000,
//           fragLoadingMaxRetry: 6,
//           fragLoadingRetryDelay: 1000,
//           xhrSetup: function(xhr, url) {
//             xhr.withCredentials = false;
//           }
//         });
        
//         hlsRef.current = hls;
        
//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           console.log('✅ Stream manifest loaded successfully!');
//           setIsLoading(false);
//           setError(null);
          
//           const playPromise = videoRef.current.play();
//           if (playPromise !== undefined) {
//             playPromise
//               .then(() => console.log('▶️ Video playing'))
//               .catch(e => {
//                 console.log('⚠️ Autoplay blocked, trying muted');
//                 videoRef.current.muted = true;
//                 videoRef.current.play()
//                   .then(() => console.log('▶️ Video playing (muted)'))
//                   .catch(err => console.error('❌ Play failed:', err));
//               });
//           }
//         });

//         hls.on(Hls.Events.ERROR, (event, data) => {
//           if (data.fatal) {
//             switch (data.type) {
//               case Hls.ErrorTypes.NETWORK_ERROR:
//                 if (!isBackup && backupStreamUrl) {
//                   initializePlayer(backupStreamUrl, true);
//                 } else {
//                   setError('Stream temporarily unavailable');
//                   setIsLoading(false);
//                 }
//                 break;
//               case Hls.ErrorTypes.MEDIA_ERROR:
//                 hls.recoverMediaError();
//                 break;
//               default:
//                 if (!isBackup && backupStreamUrl) {
//                   initializePlayer(backupStreamUrl, true);
//                 } else {
//                   setError('Unable to load stream');
//                   setIsLoading(false);
//                 }
//                 break;
//             }
//           }
//         });

//         hls.loadSource(url);
//         hls.attachMedia(videoRef.current);
        
//       } else if (videoRef.current && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
//         console.log('Using native HLS support');
//         videoRef.current.src = url;
//         videoRef.current.addEventListener('loadedmetadata', () => {
//           setIsLoading(false);
//           videoRef.current.play().catch(() => {});
//         });
//       } else {
//         console.error('HLS not supported');
//         setError('Your browser does not support HLS streaming');
//         setIsLoading(false);
//       }
//     };

//     const loadHlsScript = () => {
//       return new Promise((resolve, reject) => {
//         if (window.Hls) {
//           console.log('HLS.js already loaded');
//           resolve();
//           return;
//         }
        
//         const existingScript = document.querySelector('script[src*="hls.js"]');
//         if (existingScript) {
//           console.log('HLS.js script exists, waiting for load');
//           existingScript.onload = resolve;
//           existingScript.onerror = reject;
//           return;
//         }
        
//         console.log('Loading HLS.js library');
//         const script = document.createElement('script');
//         script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js';
//         script.async = false;
//         script.onload = () => {
//           console.log('✅ HLS.js loaded successfully');
//           resolve();
//         };
//         script.onerror = () => {
//           console.error('❌ Failed to load HLS.js');
//           reject();
//         };
//         document.head.appendChild(script);
//       });
//     };
// console.log("🎯 LivePlayer URL:", primaryStreamUrl);
//     console.log('Initializing player with stream URL:', primaryStreamUrl);
    
  

//     return () => {
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//     };
//   }, [primaryStreamUrl, backupStreamUrl]);
// setTimeout(() => {
//   initializePlayer(primaryStreamUrl);
// }, 0);



//   return (
//     <div className="w-full h-full">
//       {isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center text-white bg-black rounded-lg z-10">
//           <div className="text-center">
//             <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto animate-spin mb-2" />
//             <p className="text-sm sm:text-base">Loading Live Stream...</p>
//           </div>
//         </div>
//       )}
      
//       {error && (
//         <div className="absolute inset-0 flex items-center justify-center text-white bg-black rounded-lg z-10">
//           <div className="text-center p-4">
//             <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-red-500 mb-2" />
//             <p className="text-sm sm:text-base">{error}</p>
//           </div>
//         </div>
//       )}

//       <video 
//         ref={videoRef} 
//         controls 
//         className="w-full h-full rounded-lg shadow-2xl object-cover" 
//         muted 
//         autoPlay 
     
//         playsInline
//       />
//     </div>
//   );
// }