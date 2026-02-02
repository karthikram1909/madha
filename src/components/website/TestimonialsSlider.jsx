import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, X, Play, Sparkles } from 'lucide-react';
import { useGlobalData } from '@/components/GlobalDataProvider';

// Fallback testimonials if no data from admin
const fallbackTestimonials = [
  {
    id: 1,
    name: "John Doe",
    name_tamil: "ஜான் டோ",
    text: "Madha TV has been a blessing for my family. The programs are spiritually uplifting and bring us closer to God.",
    text_tamil: "மாதா டிவி என் குடும்பத்திற்கு ஒரு ஆசீர்வாதம். நிகழ்ச்சிகள் ஆன்மீக ரீதியில் எழுச்சியூட்டுகின்றன, எங்களை கடவுளிடம் நெருக்கமாகக் கொண்டுவருகின்றன.",
    rating: 5,
    image_url: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Maria Selvam",
    name_tamil: "மரியா செல்வம்",
    text: "I start my day with the Holy Mass on Madha TV. It gives me peace and strength for the entire day. Thank you!",
    text_tamil: "நான் என் நாளை மாதா டிவியில் புனித திருப்பலியுடன் தொடங்குகிறேன். அது எனக்கு நாள் முழுவதும் அமைதியையும் வலிமையையும் தருகிறது. நன்றி!",
    rating: 5,
    image_url: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "David Raj",
    name_tamil: "டேவிட் ராஜ்",
    text: "The Rosary programs are very powerful. I feel a deep connection during the prayers. Highly recommend to everyone.",
    text_tamil: "ஜெபமாலை நிகழ்ச்சிகள் மிகவும் சக்தி வாய்ந்தவை. ஜெபத்தின் போது நான் ஒரு ஆழ்ந்த தொடர்பை உணர்கிறேன். அனைவருக்கும் மிகவும் பரிந்துரைக்கிறேன்.",
    rating: 4,
    image_url: "https://randomuser.me/api/portraits/men/36.jpg"
  }
];

export default function TestimonialsSlider({ language = 'english',
  textTestimonials = [],
  videoTestimonials = [] }) {
  const [allTestimonials, setAllTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [[currentVideoIndex, direction], setCurrentVideoIndex] = useState([0, 0]);


  const promoVideoRef = useRef(null);
  const modalRef = useRef(null);
  const { contentMap } = useGlobalData();

  useEffect(() => {
    const combined = [
      ...(textTestimonials || []).map(t => ({
        ...t,
        type: 'text'
      })),

      ...(videoTestimonials || []).map(v => {
        let videoUrl = "";

        if (typeof v.video === "string" && v.video.trim() !== "") {
          // Ensure absolute URL
          videoUrl = v.video.startsWith("http")
            ? v.video
            : `https://secure.madhatv.in${v.video}`;
        }

        return {
          ...v,
          type: "video",
          video_url: videoUrl
        };
      })
    ];

    combined.sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );

    setAllTestimonials(
      combined.length > 0
        ? combined
        : fallbackTestimonials.map(t => ({ ...t, type: 'text' }))
    );
  }, [textTestimonials, videoTestimonials]);



  useEffect(() => {
    console.log("TEXT:", textTestimonials);
    console.log("VIDEO:", videoTestimonials);
    console.log("ALL:", allTestimonials);
  }, [textTestimonials, videoTestimonials, allTestimonials]);

  const allVideos = allTestimonials.filter(
    t => t.type === 'video' && typeof t.video_url === 'string' && t.video_url.length > 5
  );


  // ✅ FIXED: Always prioritize local promo video file
  const promoVideoUrl = '/Testimonial-promo.mp4';

  // Get testimonials section settings
  const backgroundImageUrl = contentMap.testimonials?.background_url?.value || '/testimonialBG.png';

  const sectionTitle = language === 'tamil' && contentMap.testimonials?.section_title?.tamil
    ? contentMap.testimonials.section_title.tamil
    : contentMap.testimonials?.section_title?.value || 'What Our Viewers Say';
  const sectionDescription = language === 'tamil' && contentMap.testimonials?.section_description?.tamil
    ? contentMap.testimonials.section_description.tamil
    : contentMap.testimonials?.section_description?.value || 'Hear from our faithful community about how Madha TV has touched their lives and strengthened their spiritual journey.';

  const openModal = useCallback(() => {
    setCurrentVideoIndex([0, 0]); // Reset to first video on open
    setIsModalOpen(true);
    if (promoVideoRef.current) {
      promoVideoRef.current.pause();
      promoVideoRef.current.muted = true;
    }
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';

    // Resume promo video
    if (promoVideoRef.current) {
     promoVideoRef.current.muted = true;
      promoVideoRef.current.play();
    }
  }, []);

  const paginate = useCallback((newDirection) => {
    if (allVideos.length <= 1) return;
    setCurrentVideoIndex(([prevIndex, _]) => { // Use functional update to avoid currentVideoIndex dependency
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) {
        nextIndex = allVideos.length - 1;
      } else if (nextIndex >= allVideos.length) {
        nextIndex = 0;
      }
      return [nextIndex, newDirection];
    });
  }, [allVideos.length]);


  useEffect(() => {
    if (isModalOpen) {
      const video = document.querySelector('.slider-video');
      if (video) {
        video.load();
      }
    }
  }, [isModalOpen, currentVideoIndex]);


  useEffect(() => {
    if (promoVideoRef.current && promoVideoUrl) {
      promoVideoRef.current.load();
    }
  }, [promoVideoUrl]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, paginate]);

  if (allTestimonials.length === 0) {
    return null;
  }

  const videoVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <>
      <section className="testimonials-section py-6 sm:py-10 relative overflow-hidden">
        <style>{`
          .testimonials-section {
            position: relative;
            min-height: 450px;
            margin-top: 420px;
            background-image: url('${backgroundImageUrl}');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            animation: backgroundShift 20s ease-in-out infinite;
          }
          
          @media (min-width: 768px) {
            .testimonials-section {
              min-height: 650px;
            }
          }
          
          @keyframes backgroundShift {
            0%, 100% {
              background-position: center center;
              transform: scale(1);
            }
            25% {
              background-position: center top;
              transform: scale(1.02);
            }
            50% {
              background-position: center bottom;
              transform: scale(1.01);
            }
            75% {
              background-position: center center;
              transform: scale(1.02);
            }
          }

          .content-wrapper {
            position: relative;
            z-index: 2;
          }

          .promo-video {
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
            overflow: hidden;
            background: #000;
            position: relative;
          }
          
          .cta-button {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 80px;
            height: 80px;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(139, 0, 0, 0.9), rgba(183, 28, 28, 0.8));
            backdrop-filter: blur(8px);
            border: 2px solid rgba(255, 215, 0, 0.4);
            border-radius: 50%;
            color: #FFD700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
            transition: all 0.3s ease;
            animation: buttonPulse 2.5s ease-in-out infinite;
          }
          
          @media (min-width: 640px) {
            .cta-button {
              width: 100px;
              height: 100px;
            }
          }
          
          @keyframes buttonPulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.05);
            }
          }

          .cta-button:hover {
            background: linear-gradient(135deg, rgba(183, 28, 28, 0.95), rgba(211, 47, 47, 0.85));
            border-color: rgba(255, 215, 0, 0.6);
            transform: translate(-50%, -50%) scale(1.1);
            color: #FFF;
            animation-play-state: paused;
          }

          .floating-particles {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1;
          }
          
          .particle {
            position: absolute;
            width: 6px;
            height: 6px;
            background: linear-gradient(45deg, rgba(183, 28, 28, 0.8), rgba(211, 47, 47, 0.4));
            border-radius: 50%;
            animation: float 12s ease-in-out infinite;
            box-shadow: 0 0 10px rgba(183, 28, 28, 0.5);
          }
          
          .particle:nth-child(odd) {
            background: linear-gradient(45deg, rgba(255, 255, 255, 0.6), rgba(183, 28, 28, 0.3));
          }
          
          .particle:nth-child(1) { left: 5%; animation-delay: 0s; animation-duration: 15s; }
          .particle:nth-child(2) { left: 15%; animation-delay: 2s; animation-duration: 12s; }
          .particle:nth-child(3) { left: 25%; animation-delay: 4s; animation-duration: 18s; }
          .particle:nth-child(4) { left: 35%; animation-delay: 6s; animation-duration: 14s; }
          .particle:nth-child(5) { left: 45%; animation-delay: 8s; animation-duration: 16s; }
          .particle:nth-child(6) { left: 55%; animation-delay: 10s; animation-duration: 13s; }
          .particle:nth-child(7) { left: 65%; animation-delay: 12s; animation-duration: 17s; }
          .particle:nth-child(8) { left: 75%; animation-delay: 14s; animation-duration: 15s; }
          .particle:nth-child(9) { left: 85%; animation-delay: 16s; animation-duration: 11s; }
          .particle:nth-child(10) { left: 95%; animation-delay: 18s; animation-duration: 19s; }
          
          @keyframes float {
            0% { 
              transform: translateY(100vh) scale(0) rotate(0deg);
              opacity: 0;
            }
            5% {
              opacity: 1;
              transform: translateY(95vh) scale(0.5) rotate(90deg);
            }
            15% {
              transform: translateY(85vh) scale(1) rotate(180deg);
            }
            85% {
              opacity: 1;
              transform: translateY(-5vh) scale(1.2) rotate(720deg);
            }
            95% {
              opacity: 0.5;
              transform: translateY(-15vh) scale(0.8) rotate(810deg);
            }
            100% {
              opacity: 0;
              transform: translateY(-25vh) scale(0) rotate(900deg);
            }
          }
          
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 9998;
            backdrop-filter: blur(15px);
            animation: backdropFade 0.3s ease-out;
          }
          
          @keyframes backdropFade {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(15px); }
          }
          
          .modal-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .modal-content {
            background: #0f1419;
            border-radius: 24px;
            width: 100%;
            height: 90vh;
            max-width: 90vw;
            position: relative;
            border: none;
            overflow: hidden;
            box-shadow: 0 0 80px rgba(183, 28, 28, 0.2);
            padding: 2px;
          }

          .modal-content::before {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(
              transparent,
              rgba(183, 28, 28, 0.8),
              transparent 30%
            );
            animation: rotateBorder 6s linear infinite;
            z-index: 0;
          }

          .modal-inner-content {
            background-color: #0f1419;
            border-radius: 22px;
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            overflow: hidden;
          }
          
          .modal-active-bg {
             position: absolute;
             top: 0; left: 0; right: 0; bottom: 0;
             background: 
               radial-gradient(ellipse at top left, rgba(183, 28, 28, 0.15), transparent 50%),
               radial-gradient(ellipse at bottom right, rgba(211, 47, 47, 0.15), transparent 50%);
             animation: bgPulse 8s ease-in-out infinite;
             z-index: 0;
          }
          
          @keyframes rotateBorder {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes bgPulse {
             0%, 100% { opacity: 0.7; transform: scale(1); }
             50% { opacity: 1; transform: scale(1.05); }
          }
          
          .modal-header {
            position: relative;
            z-index: 10;
            padding: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
          }
          
          .modal-title {
            font-size: 2rem;
            font-weight: bold;
            color: white;
            text-shadow: 0 0 15px rgba(183, 28, 28, 0.8);
            background: linear-gradient(45deg, #ffffff, #f8f9fa, #ffffff);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: titleGlow 4s ease-in-out infinite;
          }

          @keyframes titleGlow {
            0%, 100% {
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(183, 28, 28, 0.5);
            }
            50% {
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(183, 28, 28, 0.8);
            }
          }
          
          .close-button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 11;
          }
          
          .close-button:hover {
            background: rgba(183, 28, 28, 0.8);
            border-color: rgba(255, 255, 255, 0.5);
            transform: scale(1.1) rotate(90deg);
          }
          
          .video-slider-container {
            position: relative;
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            padding: 1rem;
          }
          
          @media (min-width: 640px) {
            .video-slider-container {
              padding: 2rem;
            }
          }
          
          .slider-video-wrapper {
            width: 100%;
            height: 100%;
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .slider-video {
            max-width: 85%;
            max-height: 85%;
            object-fit: contain;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          }

          .slider-nav-button {
            top: 50%;
            position: absolute;
            background: rgba(0, 0, 0, 0.3);
            color: white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            user-select: none;
            cursor: pointer;
            font-weight: bold;
            font-size: 20px;
            z-index: 20;
            transition: all 0.2s ease-in-out;
            transform: translateY(-50%);
            backdrop-filter: blur(5px);
          }
          .slider-nav-button:hover {
            background: rgba(0, 0, 0, 0.6);
            transform: translateY(-50%) scale(1.1);
          }
          .next { right: 20px; }
          .prev { left: 20px; }
          
          .section-title {
            font-size: 1.875rem;
            line-height: 2.25rem;
            font-weight: 700;
            color: #FFD700;
          }

          @media (min-width: 768px) {
            .section-title {
              font-size: 2.25rem;
              line-height: 2.5rem;
            }
          }

          @media (max-width: 768px) {
            .modal-content {
              margin: 10px;
              border-radius: 16px;
              width: 95vw;
              height: 70vh;
              max-width: 95vw;
            }
            .modal-title { font-size: 1.5rem; }
            .slider-nav-button { width: 40px; height: 40px; }
            .next { right: 10px; }
            .prev { left: 10px; }
            .particle { width: 4px; height: 4px; }
          }
          
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>

        {/* Enhanced Light Beam Effect */}
        <div className="light-beam"></div>

        {/* Enhanced Floating Particles */}
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div className="content-wrapper max-w-5xl mx-auto px-4 sm:px-6">
          {/* Section Header with Enhanced Animations */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD700]" />
              <h2
                className="section-title"
              >
                {sectionTitle}
              </h2>
            </div>
            <div className="w-16 sm:w-20 h-1 bg-yellow-400 mx-auto mb-3 sm:mb-4"></div>
            <p
              className="text-base sm:text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed"
            >
              {sectionDescription}
            </p>
          </div>

          {/* Promo Video Card with Enhanced Animations */}
          {promoVideoUrl && (
            <motion.div
              className="video-container relative max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="promo-video relative">
                <video
                  ref={promoVideoRef}
                  className="w-full aspect-video object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={promoVideoUrl} type="video/mp4" />
                </video>

                <button onClick={openModal} className="cta-button">
                  <Play className="w-12 h-12 text-white" />
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* Enhanced Modal with More Animations */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Animated Backdrop */}
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            {/* Modal Container */}
            <div className="modal-container" onClick={closeModal}>
              <motion.div
                ref={modalRef}
                className="modal-content"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
                onClick={(e) => e.stopPropagation()} /* Prevents modal close when clicking inside */
              >
                <div className="modal-inner-content">
                  <div className="modal-active-bg"></div> {/* For the animated background glow */}

                  <div className="modal-header">
                    <motion.h2
                      className="modal-title"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {language === 'tamil' ? 'எங்கள் பார்வையாளர்கள்' : 'Our Viewers Say'}
                    </motion.h2>
                    <button
                      onClick={closeModal}
                      className="close-button"
                      aria-label="Close reviews modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {allVideos.length > 0 ? (
                    <div className="video-slider-container">
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                          key={currentVideoIndex}
                          className="slider-video-wrapper"
                          custom={direction}
                          variants={videoVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                          }}
                        >
                          <motion.div
                            key={allVideos[currentVideoIndex].video_url}
                            className="slider-video-wrapper"
                            custom={direction}
                            variants={videoVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                              x: { type: "spring", stiffness: 300, damping: 30 },
                              opacity: { duration: 0.2 }
                            }}
                          >
                            <video
                              key={allVideos[currentVideoIndex].video_url}
                              className="slider-video"
                              controls
                              playsInline
                              preload="metadata"
                              autoPlay
                            >
                              <source
                                src={allVideos[currentVideoIndex].video_url}
                                type="video/mp4"
                              />
                            </video>
                          </motion.div>


                        </motion.div>
                      </AnimatePresence>
                      {allVideos.length > 1 && (
                        <>
                          <div className="slider-nav-button prev" onClick={() => paginate(-1)}>
                            <ChevronLeft size={24} />
                          </div>
                          <div className="slider-nav-button next" onClick={() => paginate(1)}>
                            <ChevronRight size={24} />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 flex flex-col items-center justify-center flex-1">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <Sparkles className="w-20 h-20 mx-auto mb-6 text-red-400" />
                        <h4 className="text-2xl font-semibold text-white mb-4">
                          {language === 'tamil' ? (contentMap.testimonials?.no_video_title?.tamil || "இன்னும் வீடியோ சான்றுகள் இல்லை") : (contentMap.testimonials?.no_video_title?.value || "No Video Testimonials Yet")}
                        </h4>
                        <p className="text-gray-300 text-lg">
                          {language === 'tamil' ? (contentMap.testimonials?.no_video_description?.tamil || "எங்கள் பார்வையாளர்களிடமிருந்து ஊக்கமளிக்கும் கதைகளுக்கு விரைவில் மீண்டும் பார்க்கவும்.") : (contentMap.testimonials?.no_video_description?.value || "Check back soon for inspiring stories from our viewers.")}
                        </p>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
