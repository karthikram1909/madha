import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function LiveVideoPlayer({ primaryStreamUrl, backupStreamUrl }) {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("🎥 LiveVideoPlayer mounted:", primaryStreamUrl);

    if (!primaryStreamUrl || !videoRef.current) return;

    let hls;

    const video = videoRef.current;
    video.muted = true;          // REQUIRED
    video.playsInline = true;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(primaryStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ Manifest loaded");
        video.play().catch(() => {
          console.warn("Autoplay blocked");
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error", data);
        if (data.fatal && backupStreamUrl) {
          hls.loadSource(backupStreamUrl);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = primaryStreamUrl;
      video.play();
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [primaryStreamUrl, backupStreamUrl]);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        controls
        muted
        playsInline
        className="w-full h-full"
      />
    </div>
  );
}
