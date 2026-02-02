import React, { useState, useEffect, useCallback } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Clock } from 'lucide-react';
import { format, addDays, subDays, isSameDay, parseISO, differenceInSeconds } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';

import PageBanner from "../components/website/PageBanner";
import StickyNavbar from '@/components/website/StickyNavbar';

const getProgramVisuals = (category) => {
    switch (category) {
        case 'live_mass':
            return { icon: '⛪', bgColor: 'bg-orange-500', textColor: 'text-white' };
        case 'devotional':
            return { icon: '✨', bgColor: 'bg-purple-500', textColor: 'text-white' };
        case 'rosary':
            return { icon: '📿', bgColor: 'bg-pink-500', textColor: 'text-white' };
        case 'bible_reflection':
            return { icon: '📖', bgColor: 'bg-yellow-600', textColor: 'text-white' };
        case 'special_event':
            return { icon: '🎉', bgColor: 'bg-blue-500', textColor: 'text-white' };
        case 'documentary':
            return { icon: '🎬', bgColor: 'bg-indigo-500', textColor: 'text-white' };
        default:
            return { icon: '⭐', bgColor: 'bg-gray-500', textColor: 'text-white' };
    }
};

const HeroSection = ({ liveProgram, upcomingProgram, language }) => {
    const [countdown, setCountdown] = useState('');

    const getText = useCallback((english, tamil) => (language === 'tamil' ? tamil : english), [language]);

    useEffect(() => {
        if (!liveProgram && upcomingProgram) {
            const timer = setInterval(() => {
                const now = new Date();
                const startTime = parseISO(upcomingProgram.start_datetime);
                const diff = differenceInSeconds(startTime, now);

                if (diff <= 0) {
                    setCountdown('00:00:00');
                    clearInterval(timer);
                    return;
                }
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = diff % 60;
                setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [liveProgram, upcomingProgram]);

    const program = liveProgram || upcomingProgram;

    // Show a default message when neither liveProgram nor upcomingProgram exists
    if (!program) return null; // Will render all programs in the schedule

    const visuals = getProgramVisuals(program.category);
    const imageUrl = program.program_image || 'default-image.png';  // Fallback for image

    const title = language === 'tamil' && program.title_tamil ? program.title_tamil : program.title;
    const description = language === 'tamil' && program.description_tamil ? program.description_tamil : (program.description || '');

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl mx-auto max-w-4xl p-3 sm:p-6 shadow-lg border border-white/30 -mt-12 sm:-mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center ${visuals.bgColor} shadow-md flex-shrink-0`}>
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 truncate sm:whitespace-normal">{title}</h2>
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{description}</p>
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    {liveProgram ? (
                        <Link to={createPageUrl('LiveTV')}>
                            <div className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm animate-pulse inline-block cursor-pointer hover:bg-red-600 transition-colors">
                                LIVE NOW
                            </div>
                        </Link>
                    ) : (
                        <>
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">UP NEXT IN</div>
                            <div className="text-2xl sm:text-3xl font-bold text-red-600 font-mono tracking-wider">{countdown}</div>
                        </>
                    )}
                    <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                        {format(parseISO(program.start_datetime), 'h:mm a')} - {format(parseISO(program.end_datetime), 'h:mm a')}
                    </div>
                </div>
            </div>
        </div>
    );
};



const formatProgramTitle = (title) => {
    if (!title) return title;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.startsWith('new!')) {
        const newPart = title.substring(0, 4);
        const restPart = title.substring(4);
        return (
            <>
                <span className="text-[#E74C3C] font-bold">{newPart}</span>
                {restPart}
            </>
        );
    }
    return title;
};

const WeekNavigation = ({ selectedDate, onDateSelect, language }) => {
    const getText = useCallback((english, tamil) => (language === 'tamil' ? tamil : english), [language]);

    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek, i));
    const goToPrevWeek = () => onDateSelect(subDays(selectedDate, 7));
    const goToNextWeek = () => onDateSelect(addDays(selectedDate, 7));

    return (
        <div className="flex items-center justify-between px-3 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto">
            <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevWeek}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium text-xs sm:text-sm px-2 sm:px-3"
            >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="flex gap-1 sm:gap-1 overflow-x-auto hide-scrollbar">
                {weekDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={`flex flex-col items-center p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 min-w-[50px] sm:min-w-[70px] ${isSelected
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-white hover:bg-gray-50 shadow-sm text-gray-700'
                                }`}
                        >
                            <span className="text-[10px] sm:text-xs font-medium">{format(day, 'EEE')}</span>
                            <span className="text-lg sm:text-2xl font-bold">{format(day, 'd')}</span>
                            <span className="text-[10px] sm:text-xs">{format(day, 'MMM')}</span>
                        </button>
                    );
                })}
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={goToNextWeek}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium text-xs sm:text-sm px-2 sm:px-3"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
        </div>
    );
};

const ProgramItem = ({ program, imageMap, language }) => {
    const visuals = getProgramVisuals(program.category);
    // const imageFilename = program.program_image || 'madhatv.png';
    // const imageUrl = imageMap[imageFilename] || null;
    const imageUrl = program.program_image || null;

    const title = language === 'tamil' && program.title_tamil ? program.title_tamil : program.title;
    const description = language === 'tamil' && program.description_tamil ? program.description_tamil : (program.description || '');

    const startTime = parseISO(program.start_datetime);

    return (
        <div className="flex items-center gap-2 sm:gap-4 bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3 sm:p-4 border border-gray-100">
            {/* Time */}
            <div className="text-center min-w-[60px] sm:min-w-[80px] font-bold text-gray-700 text-xs sm:text-base">
                {format(startTime, 'h:mm a')}
            </div>

            {/* Program Icon */}
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center ${visuals.bgColor} shadow-sm flex-shrink-0`}>
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <span className="text-base sm:text-lg">{visuals.icon}</span>
                )}
            </div>

            {/* Program Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm sm:text-lg truncate sm:whitespace-normal">{formatProgramTitle(title)}</h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2">{description}</p>
                <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{format(startTime, 'h:mm a')}</span>
                </div>
            </div>


        </div>
    );
};

export default function SchedulePage() {
    const [programs, setPrograms] = useState([]);
    // const [imageMap, setImageMap] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [liveProgram, setLiveProgram] = useState(null);
    const [upcomingProgram, setUpcomingProgram] = useState(null);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

    const getText = useCallback((english, tamil) => (language === 'tamil' ? tamil : english), [language]);

    useEffect(() => {
        const handleLanguageChange = () => setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);
        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);


   const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
        const res = await fetch(
            "https://secure.madhatv.in/api/v2/menu_contents.php?action=schedule&flag=0",
            { headers: { Accept: "application/json" } }
        );

        const data = await res.json();

        if (!data?.schedule) {
            setPrograms([]);
            return;
        }

        const transformedPrograms = data.schedule.map((item, index) => {
            // Ensure date and time are combined correctly
            const formattedDate = `${item.date} ${item.time}`;
            const startDateTime = new Date(formattedDate);

            // Check if startDateTime is valid
            if (isNaN(startDateTime)) {
                console.error("Invalid start datetime: ", formattedDate);
                return null;  // Skip invalid date/time entries
            }

            // Assuming a default 30-minute duration for the program
            const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

            return {
                id: index + 1,
                title: item.program_name || 'No Title',  // Fallback if program_name is missing
                description: item.description || '',  // Fallback if description is missing
                category: item.category || 'devotional',  // Default category if missing
                start_datetime: startDateTime.toISOString(),
                end_datetime: endDateTime.toISOString(),
                program_image: item.img || 'default-image.png',  // Default image if missing
            };
        }).filter(item => item !== null);  // Filter out any invalid program data

        setPrograms(transformedPrograms);
    } catch (err) {
        console.error("Schedule API Error:", err);
        setPrograms([]);
    }

    setIsLoading(false);
}, []);





    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const currentLive = programs.find(p => now >= parseISO(p.start_datetime) && now < parseISO(p.end_datetime));
            setLiveProgram(currentLive);
            if (!currentLive) {
                const nextUpcoming = programs.filter(p => parseISO(p.start_datetime) > now).sort((a, b) => parseISO(a.start_datetime) - parseISO(b.start_datetime))[0];
                setUpcomingProgram(nextUpcoming);
            } else {
                setUpcomingProgram(null);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [programs]);

    const getProgramsForDate = (date) => programs
        .filter(p => isSameDay(parseISO(p.start_datetime), date))
        .filter(program => {
            if (!searchTerm) return true;
            const lowerSearchTerm = searchTerm.toLowerCase();
            const titleMatch = (program.title?.toLowerCase().includes(lowerSearchTerm)) || (language === 'tamil' && program.title_tamil?.toLowerCase().includes(lowerSearchTerm));
            const descriptionMatch = (program.description?.toLowerCase().includes(lowerSearchTerm)) || (language === 'tamil' && program.description_tamil?.toLowerCase().includes(lowerSearchTerm));
            return titleMatch || descriptionMatch;
        })
        .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    const todaysPrograms = getProgramsForDate(selectedDate);

    return (
        <div className="min-h-screen bg-slate-50">
            <StickyNavbar />
            {/* <AIFloatingChat /> */}

            <PageBanner
                pageKey="schedule"
                fallbackTitle="Daily Programme Schedule"
                fallbackDescription="Stay tuned to our live broadcasts and spiritual shows that bring God’s presence into your home."
                fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
            />

            {/* Hero Section */}
            <div className="px-3 sm:px-4">
                <HeroSection
                    liveProgram={liveProgram}
                    upcomingProgram={upcomingProgram}
                    language={language}
                />

            </div>

            {/* Week Navigation */}
            <WeekNavigation selectedDate={selectedDate} onDateSelect={setSelectedDate} language={language} />

            {/* Search Bar */}
            <div className="px-3 sm:px-6 mb-4 sm:mb-6">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder={getText('Search programs...', 'நிகழ்ச்சிகளைத் தேடுங்கள்...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 sm:py-3 rounded-full border-gray-200 bg-white shadow-sm focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                    />
                </div>
            </div>

            {/* Program List */}
            <div className="px-3 sm:px-6 pb-6 sm:pb-8">
                <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
                    <AnimatePresence>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm animate-pulse">
                                    <div className="w-16 sm:w-20 h-4 sm:h-6 bg-gray-200 rounded"></div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1">
                                        <div className="w-24 sm:w-32 h-4 sm:h-5 bg-gray-200 rounded mb-2"></div>
                                        <div className="w-32 sm:w-48 h-3 sm:h-4 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                                </div>
                            ))
                        ) : todaysPrograms.length === 0 ? (
                            <div className="text-center py-12 sm:py-16 bg-white rounded-lg sm:rounded-xl">
                                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📺</div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{getText('No programs scheduled', 'இன்று நிகழ்ச்சிகள் இல்லை')}</h3>
                                <p className="text-sm sm:text-base text-gray-600">{getText('Check back later for updates', 'பின்னர் புதுப்பிப்புகளுக்காக சரிபார்க்கவும்')}</p>
                            </div>
                        ) : (
                            todaysPrograms.map((program) => (
                                <motion.div
                                    key={program.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <ProgramItem
                                        program={program}
                                        language={language}
                                    />

                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <DynamicFooter />

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </div>
    );
}