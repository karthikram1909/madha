import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';
import PageBanner from "../components/website/PageBanner";
import StickyNavbar from '@/components/website/StickyNavbar';

export default function Shows() {
    const [categories, setCategories] = useState([]);
    const [shows, setShows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');
    const categoryScrollRefs = useRef({});

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };

        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);

        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            console.log('🔍 Loading shows data...');
            const response = await fetch('api/v2/showbycategory.php');
            const data = await response.json();
            console.log('📁 API Data loaded:', data); // Log to check the structure

            if (data && data.data && Array.isArray(data.data)) {
                setCategories(data.data); // Set categories from the API
                const allShows = data.data.flatMap(category => category.shows); // Combine all shows from categories
                setShows(allShows); // Set all shows in one array
            } else {
                console.error('❌ Invalid data format:', data);
            }
        } catch (error) {
            console.error('❌ Error loading shows data:', error);
        }
        setIsLoading(false);
    };

    // This function is used to filter shows by their category_id
    const getShowsByCategory = (categoryId) => {
        const categoryShows = shows.filter(show => show.category_id === categoryId);
        console.log(`Category ${categoryId} has ${categoryShows.length} shows`);
        return categoryShows;
    };

    const getText = (english, tamil) => {
        return language === 'tamil' ? tamil : english;
    };

    const scrollCategory = (categoryName, direction) => {
        const container = categoryScrollRefs.current[categoryName];
        if (!container) return;

        const scrollAmount = 300;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <StickyNavbar />
            <style>{`
                .carousel-viewport {
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .carousel-viewport::-webkit-scrollbar {
                  display: none;
                }

                .shows-row {
                  display: flex;
                  gap: 1rem;
                  padding-bottom: 1rem;
                }

                .show-card {
                    flex-shrink: 0;
                    width: 90%;
                }

                @media (min-width: 480px) {
                  .show-card {
                    width: calc(50% - 0.5rem);
                  }
                }

                @media (min-width: 768px) {
                  .show-card {
                    width: calc(33.333% - 0.67rem);
                  }
                }

                @media (min-width: 1200px) {
                  .show-card {
                    width: calc(25% - 0.75rem);
                  }
                }
            `}</style>
            <PageBanner
                pageKey="shows"
                fallbackTitle="Catch Up Anytime!"
                fallbackDescription="Explore our shows that bring God’s Word, prayer, and inspiration into your life and family. We have thoughtfully organized our programs into ten categories: Biblical, Spiritual, Infotainment, Children, Church, Youth, Special Occasions, Talk Shows, and more."
                fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
            />

            <div className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
                    {isLoading && (
                        <div className="text-center py-8">
                            <p>Loading...</p>
                        </div>
                    )}

                    <div className="space-y-10 sm:space-y-12 md:space-y-16">
                        <div className="showscontents" style={{ width: "100%" }}>
                            {categories.map((category) => (
                                <div key={category.category_id} style={{ marginBottom: "60px" }}>
                                    <h2
                                        style={{
                                            textAlign: "center",
                                            color: "red",
                                            fontSize: "26px",
                                            marginBottom: "20px",
                                            fontWeight: "700"
                                        }}
                                    >
                                        {getText(category.category_title_en, category.category_title_ta)}
                                    </h2>

                                    <div style={{ position: "relative", padding: "0 60px" }}>
                                        {/* 🔹 LEFT ARROW */}
                                        <div
                                            onClick={() => scrollCategory(category.category_title_en, "left")}
                                            style={{
                                                position: "absolute",
                                                left: "15px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: "36px",
                                                height: "36px",
                                                background: "rgba(0,0,0,0.6)",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                zIndex: 10
                                            }}
                                        >
                                            <span style={{ color: "#fff", fontSize: "18px" }}>‹</span>
                                        </div>

                                        {/* 🔹 RIGHT ARROW */}
                                        <div
                                            onClick={() => scrollCategory(category.category_title_en, "right")}
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: "36px",
                                                height: "36px",
                                                background: "rgba(0,0,0,0.6)",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                zIndex: 10
                                            }}
                                        >
                                            <span style={{ color: "#fff", fontSize: "18px" }}>›</span>
                                        </div>

                                        {/* 🔹 SHOWS ROW */}
                                        <div
                                            ref={(el) => (categoryScrollRefs.current[category.category_title_en] = el)}
                                            style={{
                                                display: "flex",
                                                gap: "20px",
                                                overflow: "hidden",
                                                scrollBehavior: "smooth"
                                            }}
                                        >
                                            {category.shows.map((show) => (
                                                <div
                                                    key={show.id}
                                                    style={{
                                                        minWidth: "280px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    {/* IMAGE CARD */}
                                                    <div
                                                        className="show-card"
                                                        style={{
                                                            width: "280px",
                                                            height: "180px",
                                                            borderRadius: "14px",
                                                            overflow: "hidden",
                                                            cursor: "pointer"
                                                        }}
                                                        onClick={() => {
                                                            if (show.playlist_url) {
                                                                window.open(show.playlist_url, "_blank");
                                                            }
                                                        }}
                                                    >
                                                        <img
                                                            src={show.image}  // Ensure the field name matches the API response
                                                            alt={show.title}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    </div>

                                                    {/* TITLE BELOW CARD */}
                                                    <p
                                                        style={{
                                                            color: "black",
                                                            marginTop: "10px",
                                                            fontSize: "15px",
                                                            fontWeight: "600",
                                                            textAlign: "center",
                                                            maxWidth: "260px"
                                                        }}
                                                    >
                                                        {getText(show.title_en, show.title_ta)}
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
            </div>

            <DynamicFooter />
        </div>
    );
}
