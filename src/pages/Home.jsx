import React, { useState, useEffect, useCallback, useRef } from "react";
import { WebsiteContent, User, HomepageHero, HomepageService, ShowCategory, CategoryShow, Program, Testimonial, VideoTestimonial } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Tv,
  UserCircle,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AIFloatingChat from "../components/website/AIFloatingChat";
import DynamicFooter from "../components/website/DynamicFooter";
import LiveVideoPlayer from "../components/website/LiveVideoPlayer";

import TodaySchedule from "../components/website/TodaySchedule";
import ShowsCarousel from "../components/website/ShowsCarousel";
import TestimonialsSlider from '../components/website/TestimonialsSlider';
import HeroExtensionCard from "../components/website/HeroExtensionCard";
import StickyNavbar from "../components/website/StickyNavbar";
// import servicelists from "../components/BookingServices/servicelists.json"
import BgVideo1 from "../components/assets/BgVideo1.mp4";
import Showslist from "../components/ShowsByCategory/Showslist.json";
// import { fetchLiveTvStream } from "../api/LiveTV";
import "../components/assets/Home.css";
import Hls from "hls.js";



// Hero Section Component with Fixed Layout
const HeroSection = ({ heroContent, language, headerContent, heroShows, todayPrograms, categoryShows, liveAudioSettings,
  liveStreamUrl }) => {
  const getText = (item, field) => {
    return language === 'tamil' && item[`${field}_tamil`] ? item[`${field}_tamil`] : item[field];
  };

  const isBackgroundEnabled = heroContent?.is_background_enabled !== false;
  const backgroundType = heroContent?.background_type || "video";
  const imageUrl = heroContent?.background_image_url;
  const videoUrl = heroContent?.background_video_url || BgVideo1;

  const fallbackBgStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1543851523-a6c429541525?q=80&w=2940&auto=format&fit=crop')`,
    backgroundColor: '#0a0f1c'
  };







  const videoRef = useRef(null);

  useEffect(() => {
    if (!liveStreamUrl || !videoRef.current) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 10,
        liveSyncDuration: 2,
        liveMaxLatencyDuration: 5
      });

      hls.loadSource(liveStreamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().catch(() => { });
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari fallback
      videoRef.current.src = liveStreamUrl;
      videoRef.current.play().catch(() => { });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [liveStreamUrl]);

  // const showLiveStream = liveTvSettings?.primary_stream_url;


  return (
    <div
      className="relative text-white min-h-[75vh] md:min-h-[85vh] bg-cover bg-center flex flex-col overflow-hidden"
      style={!isBackgroundEnabled || (backgroundType === 'image' && !imageUrl) ? fallbackBgStyle : { backgroundColor: '#0a0f1c' }}
    >
      {isBackgroundEnabled && (
        <>
          {backgroundType === 'video' && videoUrl && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
              key={videoUrl}
            >
              <source src={videoUrl} type={videoUrl.endsWith('.mp4') ? 'video/mp4' : 'video/webm'} />
            </video>
          )}
          {backgroundType === 'image' && imageUrl && (
            <div
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            ></div>
          )}
        </>
      )}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 mt-5">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-left mb-4 sm:mb-6">
            <p className="text-sm sm:text-base md:text-xl text-[#FFD700] font-medium">
              {language === 'tamil' && heroContent.heading_tamil ? heroContent.heading_tamil : heroContent.heading_english || 'Experience faith through live streaming - 24/7 spiritual programming'}
            </p>
          </div>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-4 items-start">
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                {/* {showLiveStream && liveTvSettings?.primary_stream_url ? (
                  <div className="relative aspect-video w-full">
                 {liveTvSettings?.primary_stream_url ? (
  <LiveVideoPlayer
    primaryStreamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    backupStreamUrl={liveTvSettings.backup_stream_url}
  />
) : (
  <div>No live stream</div>
)}
</div>
                ) : (
                  <div id="live-tvconnect" className="aspect-video bg-slate-800/50 rounded-lg flex items-center justify-center shadow-xl" style={{ width: "800px", height: "500px" }}>
                    <div className="text-center text-white/70">
                      <Tv className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3" />
                      <p className="text-xs sm:text-sm">Video player not configured</p>
                    </div>
                  </div>
                )} */}

                <div id="live-tvconnect" className="relative aspect-video w-full rounded-lg overflow-hidden bg-black" style={{ width: "800px", height: "500px" }}>
                  {liveStreamUrl ? (
                    <video
                      ref={videoRef}
                      controls={false}
                      muted
                      autoPlay
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      Loading live stream...
                    </div>
                  )}
                </div>


              </div>
              <div className="lg:block hidden">
                <HeroExtensionCard liveAudioSettings={liveAudioSettings} language={language} />
              </div>
            </div>

            <div className="space-y-4 lg:block hidden" style={{ marginLeft: "-270px", position: "aboslute" }}>
              <TodaySchedule programs={todayPrograms} language={language} />
              {/* <ShowsCarousel shows={categoryShows.slice(0, 5)} language={language} /> */}
              <ShowsCarousel shows={heroShows} language={language} />

            </div>
          </div>

          <div className="lg:hidden mt-4 space-y-4">
            <HeroExtensionCard liveAudioSettings={liveAudioSettings} language={language} />
            <TodaySchedule programs={todayPrograms} language={language} />
            {/* <ShowsCarousel shows={categoryShows.slice(0, 5)} language={language} /> */}
            <ShowsCarousel shows={heroShows} language={language} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [content, setContent] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');
  const [headerContent, setHeaderContent] = useState({});
  const [homepageHeroContent, setHomepageHeroContent] = useState({});
  // const [liveTvSettings, setLiveTvSettings] = useState(null);
  const [ourServicesSettings, setOurServicesSettings] = useState({});
  const [homepageServices, setHomepageServices] = useState([]);
  const [showsSettings, setShowsSettings] = useState({});
  const [showCategories, setShowCategories] = useState([]);
  const [categoryShows, setCategoryShows] = useState([]);
  const [todayPrograms, setTodayPrograms] = useState([]);
  const [liveAudioSettings, setLiveAudioSettings] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [videoTestimonials, setVideoTestimonials] = useState([]);
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
const [videoData, setVideoData] = useState([]);
const [textData, setTextData] = useState([]);
  const [services, setServices] = useState([]);
const promoVideoUrl = "/Testimonial-promo.mp4";

  const [groupedShows, setGroupedShows] = useState({});



  const showCarouselRefs = useRef(new Map());
  const categoryScrollRefs = useRef({});

  // HERO section la show panna vendiya shows
  const heroShows = Object.values(groupedShows)
    .flat()               // all categories → single array
    .slice(0, 5)
    .map(show => ({
      title_en: show.ShowTitle,
      title_ta: show.ShowTitle,
      image: show.Showimg,
      playlist_url: show.playlisturl
    }));


// useEffect(() => {
//   const fetchTextTestimonials = async () => {
//     try {
//       const res = await fetch(
//         "https://secure.madhatv.in/api/v2/video_testimonials/list.php"
//       );
//       const json = await res.json();

//       if (json?.status === true && Array.isArray(json.data)) {
//         setTextData(json.data);
//       } else {
//         setTextData([]);
//       }
//     } catch (err) {
//       console.error("Text testimonials fetch error:", err);
//       setTextData([]);
//     }
//   };

//   fetchTextTestimonials();
// }, []);


useEffect(() => {
  const fetchServices = async () => {
    try {
      const res = await fetch(
        "https://secure.madhatv.in/api/v2/services/list.php"
      );
      const json = await res.json();

      if (json?.status === true && Array.isArray(json.data)) {
        setServices(json.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Services fetch error:", err);
      setServices([]);
    }
  };

  fetchServices();
}, []);








useEffect(() => {
  const fetchVideoTestimonials = async () => {
    try {
      const res = await fetch(
        "https://secure.madhatv.in/api/v2/video_testimonials/list.php"
      );
      const json = await res.json();

      if (json?.status === true && Array.isArray(json.data)) {
        setVideoData(json.data);
      } else {
        setVideoData([]);
      }
    } catch (err) {
      console.error("Video testimonials fetch error:", err);
      setVideoData([]);
    }
  };

  fetchVideoTestimonials();
}, []);


  useEffect(() => {
    fetchShowsByCategory();
  }, []);

const fetchShowsByCategory = async () => {
    try {
        const res = await fetch("api/v2/showbycategory.php");
        const json = await res.json();

        console.log("SHOW BY CATEGORY API:", json);

        if (Array.isArray(json.data)) {
            const grouped = {};

            json.data.forEach((categoryItem) => {
                // Get the selected language (English or Tamil)
                const selectedLanguage = localStorage.getItem('madha_tv_language') || 'english';

                // Get category name based on the language
                const categoryName = selectedLanguage === 'tamil'
                    ? categoryItem.category_title_ta || categoryItem.category_title_en
                    : categoryItem.category_title_en || categoryItem.category_title_ta;

                // If there are shows in the category
                if (Array.isArray(categoryItem.shows)) {
                    grouped[categoryName] = categoryItem.shows.map((show) => ({
                        id: show.id,
                        ShowTitle: selectedLanguage === 'tamil' ? show.title_ta || show.title_en : show.title_en || show.title_ta,
                        Showimg: show.image || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg",
                        playlisturl: show.playlist_url || "",
                    }));
                }
            });

            setGroupedShows(grouped);
        }
    } catch (err) {
        console.error("ShowByCategory API error:", err);
    }
};





  const scrollCategory = (category, direction) => {
    const container = categoryScrollRefs.current[category];
    if (!container) return;

    const scrollAmount = 300;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };


  const setShowCarouselRef = useCallback((node, categoryId) => {
    if (node) {
      showCarouselRefs.current.set(categoryId, node);
    } else {
      showCarouselRefs.current.delete(categoryId);
    }
  }, []);

  const scrollShowCarousel = (categoryId, direction) => {
    const element = showCarouselRefs.current.get(categoryId);
    if (element) {
      const scrollAmount = element.clientWidth;
      element.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // const scrollCategory = (category, direction) => {
  //   const container = categoryScrollRefs.current[category];
  //   if (!container) return;

  //   const scrollAmount = 300;
  //   container.scrollBy({
  //     left: direction === "left" ? -scrollAmount : scrollAmount,
  //     behavior: "smooth",
  //   });
  // };

  const navItems = [
    { name: 'Schedule', name_tamil: 'அட்டவணை', link: createPageUrl('Schedule') },
    { name: 'Book Service', name_tamil: 'சேவைகள்', link: createPageUrl('BookService') },
    { name: 'Prayer Request', name_tamil: 'பிரார்த்தனை', link: createPageUrl('PrayerRequest') },
    { name: 'Shows', name_tamil: 'நிகழ்ச்சிகள்', link: createPageUrl('Shows') },
    { name: 'Donate', name_tamil: 'நன்கொடை', link: "https://santhomecom.org/otp/" },
    { name: 'Buy Books', name_tamil: 'புத்தகங்கள்', link: createPageUrl('BuyBooks') },
    { name: 'Gallery', name_tamil: 'படத்தொகுப்பு', link: createPageUrl('Gallery') }
  ];

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      setUser({
        full_name: localStorage.getItem("user_name"),
        email: localStorage.getItem("user_email"),
      });
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");

      setUser(null);
      window.location.reload();

    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadPageData = async () => {
    setIsLoading(true);
    try {
    const [
  allWebsiteContentData,
  heroData,
  homepageServicesRaw,
  showCategoriesRaw,
  categoryShowsRaw,
  programsData,
  testimonialsRaw,
  videoTestimonialsRaw
] = await Promise.all([
  WebsiteContent.list(),
  HomepageHero.list(),
  HomepageService.list(),
  ShowCategory.list(),
  CategoryShow.list(),
  Program.list('-schedule_time', 50),
  Testimonial.list(),
  VideoTestimonial.list()
]);

// ✅ FILTER LOCALLY
const homepageServicesData = homepageServicesRaw
  .filter(i => i.is_active)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

const showCategoriesData = showCategoriesRaw
  .filter(i => i.is_active)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

const categoryShowsData = categoryShowsRaw
  .filter(i => i.is_active)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

const testimonialsData = testimonialsRaw
  .filter(i => i.is_active)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

const videoTestimonialsData = videoTestimonialsRaw
  .filter(i => i.is_active)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));


      // const liveData = Array.isArray(liveTvApiResponse?.LiveUrl) ? liveTvApiResponse.LiveUrl : [];

      // if (liveData.length > 0) {
      //   const live = liveData[0];
      //   setLiveTvSettings({
      //     show_in_hero: 'true',
      //     primary_stream_url: live.video_url,
      //     backup_stream_url: live.alternate_url
      //   });
      // } else {
      //   console.warn("❌ Live TV API returned no stream", liveTvApiResponse);
      // }

      



      const contentMap = {};
      const headerContentMap = {};
      const servicesSettingsMap = {};
      const showsSettingsMap = {};
      // const liveTvSettingsMap = {};
      const liveAudioSettingsMap = {};

      allWebsiteContentData.forEach(item => {
        if (item.is_active) {
          switch (item.section) {
            case 'homepage_header':
              headerContentMap[item.content_key] = { value: item.content_value, tamil: item.content_value_tamil };
              break;
            case 'homepage_services':
              servicesSettingsMap[item.content_key] = { value: item.content_value, tamil: item.content_value_tamil };
              break;
            case 'shows_by_category':
              showsSettingsMap[item.content_key] = { value: item.content_value, tamil: item.content_value_tamil };
              break;
            case 'live_audio':
              liveAudioSettingsMap[item.content_key] = item.content_value;
              break;
            case 'footer':
              if (!contentMap[item.section]) contentMap[item.section] = {};
              contentMap[item.section][item.content_key] = {
                value: item.content_value,
                tamil: item.content_value_tamil,
                order: item.display_order || 0
              };
              break;
            default:
              if (!contentMap[item.section]) contentMap[item.section] = {};
              contentMap[item.section][item.content_key] = {
                value: item.content_value,
                tamil: item.content_value_tamil,
                order: item.display_order || 0
              };
              break;
          }
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const todayProgramsFiltered = programsData
        .filter(program =>
          program.schedule_date === today &&
          program.is_published !== false &&
          program.status !== 'cancelled'
        )
        .sort((a, b) => a.schedule_time.localeCompare(b.schedule_time));

      setContent(contentMap);
      setHeaderContent(headerContentMap);
      setOurServicesSettings(servicesSettingsMap);
      setHomepageServices(homepageServicesData);
      setShowsSettings(showsSettingsMap);
      setShowCategories(showCategoriesData);
      setCategoryShows(categoryShowsData);
      setLiveAudioSettings(liveAudioSettingsMap);
      setTodayPrograms(todayProgramsFiltered);
      setTestimonials(testimonialsData);
      setVideoTestimonials(videoTestimonialsData);

      if (heroData.length > 0) {
        setHomepageHeroContent(heroData[0]);
      }

      window.audioSettings = {
        primary_audio_url: liveAudioSettingsMap.primary_audio_url || '',
        backup_audio_url: liveAudioSettingsMap.backup_audio_url || '',
        enabled: liveAudioSettingsMap.enable_audio_player === 'true'
      };

    } catch (error) {
      console.error("Error loading page data:", error);
    }
    setIsLoading(false);
  };

  const getText = (section, key, fallback = '') => {
    const item = content[section]?.[key];
    if (!item) return fallback;
    return language === 'tamil' && item.tamil ? item.tamil : item.value;
  };

  // const handleBookNowClick = (service) => {
  //   const serviceParams = new URLSearchParams({
  //     service: service.services.trim(),
  //     auto_select: 'true'
  //   });

  //   window.location.href = `${createPageUrl('BookService')}?${serviceParams.toString()}`;
  // };

// const handleBookNowClick = (service) => {
//   // Ensure you're using the right property from the service object
//   const serviceParams = new URLSearchParams({
//     service_title: service.services.trim(),  // Use the correct key for service title
//     auto_select: 'true'
//   });

//   window.location.href = `${createPageUrl('BookService')}?${serviceParams.toString()}`;
// };

const handleBookNowClick = (service) => {
  console.log("Selected Service:", service);  // Check if you're getting the correct data

  const serviceParams = new URLSearchParams({
    service_title: service.services.trim(),
    auto_select: 'true'
  });

  console.log("Redirecting to:", `${createPageUrl('BookService')}?${serviceParams.toString()}`);

  window.location.href = `${createPageUrl('BookService')}?${serviceParams.toString()}`;
};





  // const groupedShows = Showslist.reduce((acc, show) => {
  //   if (!acc[show.ShowCategory]) {
  //     acc[show.ShowCategory] = [];
  //   }
  //   acc[show.ShowCategory].push(show);
  //   return acc;
  // }, {});


  useEffect(() => {
    fetch("api/v2/menu_contents.php?action=live&flag=0")
      .then(res => res.json())
      .then(data => {
        console.log("LIVE API RESPONSE", data);

        if (data?.LiveUrl?.length > 0) {
          setLiveStreamUrl(
            data.LiveUrl[0].video_url || data.LiveUrl[0].alternate_url
          );
        }
      })
      .catch(err => {
        console.error("Live stream API error", err);
      });
  }, []);





  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-white hover:text-red-300 px-2 py-2 text-sm font-semibold">
          <UserCircle className="h-5 w-5" />
          <span className="hidden sm:inline">{user ? user.full_name : (language === 'tamil' ? 'உள்நுழை' : 'Login')}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        {user ? (
          <>
            <DropdownMenuLabel>{language === 'tamil' ? 'என் கணக்கு' : 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={createPageUrl('UserDashboard')} className="flex items-center cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>{language === 'tamil' ? 'டாஷ்போர்டு' : 'Dashboard'}</span>
              </Link>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Dashboard')} className="flex items-center cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>{language === 'tamil' ? 'நிர்வாக குழு' : 'Admin Panel'}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{language === 'tamil' ? 'வெளியேறு' : 'Logout'}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to={createPageUrl('UserDashboard')} className="flex items-center cursor-pointer hover:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{language === 'tamil' ? 'உள்நுழைய / பதிவு செய்க' : 'Login / Register'}</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const NO_IMAGE_AVAILABLE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/200px-No_image_available.svg.png';

  return (
    <div className="min-h-screen bg-[#0a0f1c] overflow-x-hidden">
      <div className="relative z-10">
        <StickyNavbar />

        {/* <AIFloatingChat /> */}

        <div className="mt-10 herosection">
          {!isLoading && (
            <HeroSection
              heroContent={homepageHeroContent}
              // liveTvSettings={liveTvSettings}
              liveStreamUrl={liveStreamUrl}
              liveAudioSettings={liveAudioSettings}

              headerContent={headerContent}
              language={language}
              todayPrograms={todayPrograms}
              categoryShows={categoryShows}
              heroShows={heroShows}
            />
          )}

          {/* Services Section - Fully Responsive */}
          <div
            className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8"
            style={{
              backgroundImage: "url(/bgimagehero.png)",
              backgroundColor: "#4f0d0e",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="max-w-7xl mx-auto">
              {/* Services Header */}
              <div className="text-center mb-8 sm:mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9bc9b9a76_technical-support.png"
                    alt="Services Icon"
                  />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#fed800]">
                    OUR SERVICES
                  </h1>
                </div>
                <p className="text-white text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-4">
                  Celebrate Life's Special Moments with Madha TV by Sending your Wishes, Sharing your Joy, and Supporting our Media Mission
                </p>
              </div>

              {/* Desktop View - All in one line, no scroll */}
              <div className="hidden lg:flex lg:flex-wrap lg:justify-center lg:gap-4">
                {services.map((listing) => (
                  <div
                    key={listing.id}
                    className="w-[160px] bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={listing.service_image_url}
                        alt={listing.servicetitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <p className="text-[#861518] font-semibold text-sm mb-2 ">
                        {listing.services}
                      </p>

                      <div className="space-y-2">
                        <p className="text-[#B71C1C] text-lg font-bold">
                          ₹ {listing.rate}
                        </p>

                        <button style={{ marginLeft: "58px", marginTop: "-30px",position:'absolute' ,width: "85px" }}
                          onClick={() => handleBookNowClick(listing)}
                          className="bg-[#861518] hover:bg-[#6a1114] text-white font-semibold py-2 rounded-lg transition-colors duration-300 text-sm"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile/Tablet View - Grid */}
              <div className="lg:hidden grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {services.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={listing.service_image_url}
                        alt={listing.servicetitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <p className="text-[#861518] font-semibold text-sm sm:text-base mb-3 line-clamp-2">
                        {listing.services}
                      </p>

                      <div className="space-y-3">
                        <p className="text-[#B71C1C] text-lg sm:text-xl font-bold">
                          ₹ {listing.rate}
                        </p>

                        <button
                          onClick={() => handleBookNowClick(listing)}
                          className="w-full bg-[#861518] hover:bg-[#6a1114] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 text-sm sm:text-base"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shows Section - Fully Responsive */}
          <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8" style={{height:"3200px"}}>
            <div className="max-w-7xl mx-auto">
              {/* Shows Header */}
              <div className="text-center mb-8 sm:mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    src="/showsicon.png"
                    alt="Shows Icon"
                  />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#fed800]">
                    SHOWS BY CATEGORY
                  </h1>
                </div>
                <p className="text-white text-sm sm:text-base md:text-lg max-w-4xl mx-auto px-4">
                  Missed watching a show on TV? Don't worry! Explore our curated playlists with all your favourite programs, carefully organized for easy browsing and a seamless viewing experience. Be filled with God's abundant blessings.
                </p>
              </div>
          
              {/* Shows Categories */}
              <div className="space-y-8 sm:space-y-12">
                {Object.entries(groupedShows).map(([categoryName, shows]) => (
                  <div key={categoryName}>
                    {/* CATEGORY TITLE */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#deca57ff] text-center mb-6">
                      {categoryName}
                    </h2>
          
                    {/* SHOWS GRID */}
                    <div className="relative">
                      {/* LEFT BUTTON */}
                      <button
                        onClick={() => scrollCategory(categoryName, "left")}
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10
                          w-10 h-10 bg-black/70 hover:bg-black rounded-full
                          items-center justify-center text-white text-xl"
                      >
                        ‹
                      </button>
          
                      {/* RIGHT BUTTON */}
                      <button
                        onClick={() => scrollCategory(categoryName, "right")}
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10
                          w-10 h-10 bg-black/70 hover:bg-black rounded-full
                          items-center justify-center text-white text-xl"
                      >
                        ›
                      </button>
          
                      {/* SCROLL CONTAINER */}
                      <div
                        ref={(el) => (categoryScrollRefs.current[categoryName] = el)}
                        className="
                          flex gap-4 sm:gap-5 md:gap-6
                          overflow-x-auto md:overflow-hidden
                          scroll-smooth
                          px-2 md:px-12 pb-4
                        "
                      >
                        {shows.map((show) => (
                          <div
                            key={show.id}
                            className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72"
                          >
                            <div
                              className="relative aspect-video rounded-xl overflow-hidden cursor-pointer
                                group shadow-lg hover:shadow-2xl transition-all duration-300"
                              onClick={() => show.playlisturl && window.open(show.playlisturl, "_blank")}
                            >
                              <img
                                src={show.Showimg}
                                alt={show.ShowTitle}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
          
                            <p className="text-white mt-3 text-sm sm:text-base font-semibold text-center line-clamp-2">
                              {show.ShowTitle}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TestimonialsSlider  language={language} videoTestimonials={videoData}
            textTestimonials={textData} promoVideoUrl={promoVideoUrl} />

          <DynamicFooter />
        </div>
      </div>
    </div>
  );
}