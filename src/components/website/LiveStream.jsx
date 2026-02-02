// import React, { useState, useRef, useEffect } from 'react';
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { 
//   Play, 
//   Pause, 
//   Volume2, 
//   VolumeX, 
//   Maximize, 
//   Minimize,
//   Settings,
//   AlertTriangle,
//   Loader2
// } from 'lucide-react';
// import { motion } from 'framer-motion';

// export default function LiveStream({ currentProgram, streamStatus, viewerCount }) {
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [volume, setVolume] = useState(0.8);
//   const [isLoading, setIsLoading] = useState(true);
//   const videoRef = useRef(null);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     // Simulate loading delay
//     const timer = setTimeout(() => setIsLoading(false), 2000);
//     return () => clearTimeout(timer);
//   }, []);

//   const togglePlayPause = () => {
//     setIsPlaying(!isPlaying);
//     // In a real implementation, this would control the video/stream
//   };

//   const toggleMute = () => {
//     setIsMuted(!isMuted);
//     // In a real implementation, this would control audio
//   };

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       containerRef.current?.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   const handleVolumeChange = (e) => {
//     const newVolume = parseFloat(e.target.value);
//     setVolume(newVolume);
//     setIsMuted(newVolume === 0);
//   };

//   const renderStreamContent = () => {
//     if (streamStatus === 'offline') {
//       return (
//         <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white">
//           <AlertTriangle className="w-16 h-16 text-yellow-400 mb-4" />
//           <h3 className="text-xl font-semibold mb-2">Stream Currently Offline</h3>
//           <p className="text-slate-400 text-center">
//             We're experiencing technical difficulties. Please check back shortly.
//           </p>
//         </div>
//       );
//     }

//     if (streamStatus === 'error') {
//       return (
//         <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white">
//           <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
//           <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
//           <p className="text-slate-400 text-center mb-4">
//             Unable to connect to the stream. Attempting to reconnect...
//           </p>
//           <Button onClick={() => window.location.reload()} variant="outline">
//             Refresh Stream
//           </Button>
//         </div>
//       );
//     }

//     return (
//       <div className="relative h-full bg-slate-900">
//         {isLoading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
//             <div className="text-center text-white">
//               <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
//               <p>Connecting to live stream...</p>
//             </div>
//           </div>
//         )}
        
//         {/* Simulated Video Player */}
//         <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
//           <div className="text-center text-white">
//             <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
//               <Play className="w-12 h-12 ml-1" />
//             </div>
//             <h3 className="text-xl font-semibold mb-2">
//               {currentProgram?.title || 'Madha TV Live Stream'}
//             </h3>
//             <p className="text-slate-300">
//               {viewerCount.toLocaleString()} viewers watching
//             </p>
//           </div>
//         </div>

//         {/* YouTube/RTMP Embed would go here in real implementation */}
//         {currentProgram?.youtube_link && (
//           <iframe
//             className="w-full h-full"
//             src={currentProgram.youtube_link.replace('watch?v=', 'embed/')}
//             title="Live Stream"
//             frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//           />
//         )}
//       </div>
//     );
//   };

//   return (
//     <Card className="bg-black border-slate-700 overflow-hidden">
//       <div 
//         ref={containerRef}
//         className="relative aspect-video bg-black group"
//       >
//         {renderStreamContent()}
        
//         {/* Video Controls Overlay */}
//         <motion.div 
//           initial={{ opacity: 0 }}
//           whileHover={{ opacity: 1 }}
//           className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//         >
//           <div className="absolute bottom-0 left-0 right-0 p-4">
//             <div className="flex items-center gap-4">
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 className="text-white hover:bg-white/20"
//                 onClick={togglePlayPause}
//               >
//                 {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
//               </Button>
              
//               <div className="flex items-center gap-2">
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   className="text-white hover:bg-white/20"
//                   onClick={toggleMute}
//                 >
//                   {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
//                 </Button>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   value={isMuted ? 0 : volume}
//                   onChange={handleVolumeChange}
//                   className="w-20 accent-red-600"
//                 />
//               </div>
              
//               <div className="flex-1" />
              
//               <div className="flex items-center gap-2">
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   className="text-white hover:bg-white/20"
//                 >
//                   <Settings className="w-5 h-5" />
//                 </Button>
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   className="text-white hover:bg-white/20"
//                   onClick={toggleFullscreen}
//                 >
//                   {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Live Indicator */}
//         {streamStatus === 'live' && (
//           <div className="absolute top-4 left-4">
//             <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
//               <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
//               LIVE
//             </div>
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// }