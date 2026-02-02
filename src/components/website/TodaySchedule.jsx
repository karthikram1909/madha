import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Tv } from 'lucide-react';
import { format } from 'date-fns';

export default function TodaySchedule({ language = 'english' }) {
    const [displayPrograms, setDisplayPrograms] = useState({ live: [], upcoming: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    // Fetch the programs from the API
    useEffect(() => {
        const fetchPrograms = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('https://secure.madhatv.in/api/v2/menu_contents.php?action=schedule&flag=0');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const programs = data.schedule || [];

                if (programs.length === 0) {
                    setDisplayPrograms({ live: [], upcoming: [] });
                    setIsLoading(false);
                    return;
                }

                const livePrograms = [];
                const upcomingPrograms = [];
                const now = new Date();

                programs.forEach((program) => {
                    const scheduleTime = program.time;
                    const scheduleDate = program.date;

                    if (!scheduleTime || !scheduleDate) {
                        return;
                    }

                    try {
                        const timeStr = scheduleTime.trim();
                        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                        
                        if (!timeMatch) {
                            return;
                        }

                        let hours = parseInt(timeMatch[1]);
                        const minutes = parseInt(timeMatch[2]);
                        const period = timeMatch[3].toUpperCase();

                        if (period === 'PM' && hours !== 12) {
                            hours += 12;
                        } else if (period === 'AM' && hours === 12) {
                            hours = 0;
                        }

                        const scheduleStart = new Date(scheduleDate);
                        scheduleStart.setHours(hours, minutes, 0, 0);

                        const scheduleEnd = new Date(scheduleStart);
                        scheduleEnd.setMinutes(scheduleEnd.getMinutes() + 60);

                        const isLive = now >= scheduleStart && now <= scheduleEnd;

                        const programDateOnly = new Date(scheduleDate);
                        programDateOnly.setHours(0, 0, 0, 0);
                        const todayDateOnly = new Date();
                        todayDateOnly.setHours(0, 0, 0, 0);

                        if (isLive) {
                            livePrograms.push(program);
                        } else if (programDateOnly >= todayDateOnly && now < scheduleStart) {
                            upcomingPrograms.push(program);
                        }
                    } catch (err) {
                        console.error('Error processing program:', err);
                    }
                });

                // Fallback: show all programs if none matched
                if (livePrograms.length === 0 && upcomingPrograms.length === 0) {
                    programs.forEach((program) => {
                        if (program.time && program.date) {
                            upcomingPrograms.push(program);
                        }
                    });
                }

                setDisplayPrograms({ live: livePrograms, upcoming: upcomingPrograms });
            } catch (error) {
                console.error('Error fetching programs:', error);
                setError(error.message);
                setDisplayPrograms({ live: [], upcoming: [] });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchPrograms();
    }, []);

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.trim();
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const programDate = new Date(date);
            programDate.setHours(0, 0, 0, 0);

            if (programDate.getTime() === today.getTime()) {
                return language === 'tamil' ? 'இன்று' : 'Today';
            }

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (programDate.getTime() === tomorrow.getTime()) {
                return language === 'tamil' ? 'நாளை' : 'Tomorrow';
            }

            return format(date, 'MMM d');
        } catch (error) {
            return '';
        }
    };

    const getProgramTitle = (program) => {
        return program.program_name || program.title || 'Untitled';
    };

    // Seamless infinite scroll effect
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const scrollStep = 1;
        let scrollPosition = 0;

        const scrollInterval = setInterval(() => {
            scrollPosition += scrollStep;
            container.scrollTop = scrollPosition;

            // Reset to top when scrolled halfway (seamless loop due to duplicated content)
            if (scrollPosition >= container.scrollHeight / 2) {
                scrollPosition = 0;
                container.scrollTop = 0;
            }
        }, 30);

        return () => clearInterval(scrollInterval);
    }, [displayPrograms]);

    if (isLoading) {
        return (
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[#FFD700]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                        {language === 'tamil' ? 'அட்டவணை' : 'SCHEDULE'}
                    </h3>
                </div>
                <Card className="bg-[#1a2332] backdrop-blur-sm rounded-2xl shadow-lg border-0">
                    <CardContent className="p-6 text-center min-h-[200px] flex items-center justify-center">
                        <div className="text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700] mx-auto mb-2"></div>
                            <p className="text-sm">{language === 'tamil' ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[#FFD700]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                        {language === 'tamil' ? 'அட்டவணை' : 'SCHEDULE'}
                    </h3>
                </div>
                <Card className="bg-[#1a2332] backdrop-blur-sm rounded-2xl shadow-lg border-0">
                    <CardContent className="p-6 text-center min-h-[200px] flex items-center justify-center">
                        <div className="text-red-400">
                            <Tv className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-semibold">Error loading schedule</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (displayPrograms.live.length === 0 && displayPrograms.upcoming.length === 0) {
        return (
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[#FFD700]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                        {language === 'tamil' ? 'அட்டவணை' : 'SCHEDULE'}
                    </h3>
                </div>
                <Card className="bg-[#1a2332] backdrop-blur-sm rounded-2xl shadow-lg border-0">
                    <CardContent className="p-6 text-center min-h-[200px] flex items-center justify-center">
                        <div className="text-slate-400">
                            <Tv className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">
                                {language === 'tamil' ? 'வரவிருக்கும் நிகழ்ச்சிகள் எதுவும் இல்லை' : 'No upcoming programs'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render program list function for reusability
    const renderProgramList = () => (
        <>
            {/* Display Live Programs */}
            {displayPrograms.live.length > 0 && (
                <div className="p-4 border-b border-gray-700/20">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                            {language === 'tamil' ? 'நேரலை' : 'LIVE NOW'}
                        </h4>
                    </div>
                    {displayPrograms.live.map((program, index) => (
                        <div key={`live-${index}`} className="bg-transparent rounded-lg p-3 mb-3 last:mb-0 border border-transparent hover:border-[#FFD700]/20">
                            <p className="font-semibold text-white text-sm mb-1">{getProgramTitle(program)}</p>
                            <p className="text-xs text-gray-400 font-medium">
                                {formatDate(program.date)} • {formatTime(program.time)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Display Upcoming Programs */}
            {displayPrograms.upcoming.length > 0 && (
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        {/* <Calendar className="w-3.5 h-3.5 text-black bg-[#FFD700]" /> */}
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                            {/* {language === 'tamil' ? 'வரவிருக்கும்' : 'UPCOMING'} */}
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {displayPrograms.upcoming.slice(0, 15).map((program, index) => (
                            <div key={`upcoming-${index}`} className="bg-transparent rounded-lg p-3 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-[#FFD700]/20">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white text-sm mb-1 truncate">{getProgramTitle(program)}</p>
                                        <p className="text-xs text-[#FFD700] font-medium">{formatDate(program.date)} • {formatTime(program.time)}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-[#FFD700] text-black text-[10px] font-bold uppercase rounded-full whitespace-nowrap">
                                        {language === 'tamil' ? 'வரவிருக்கும்' : 'Upcoming'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#FFD700]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    {language === 'tamil' ? 'அட்டவணை' : 'SCHEDULE'}
                </h3>
            </div>
            
            <Card className="bg-[#111926] backdrop-blur-sm rounded-lg shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                    <div 
                        ref={scrollRef} 
                        className="max-h-[220px] overflow-y-scroll"
                        style={{
                            scrollbarWidth: 'none', /* Firefox */
                            msOverflowStyle: 'none', /* IE and Edge */
                        }}
                    >
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                display: none; /* Chrome, Safari, Opera */
                            }
                        `}</style>
                        
                        {/* Original content */}
                        {renderProgramList()}
                        
                        {/* Duplicated content for seamless loop */}
                        {renderProgramList()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
