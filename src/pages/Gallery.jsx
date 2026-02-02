import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Gallery as GalleryEntity, GalleryCategory } from '@/api/entities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from '../components/gallery/Lightbox';
import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';
import PageBanner from "../components/website/PageBanner";
import GalleryPhotos from "../components/assets/GalleryPhotos";
import StickyNavbar from '@/components/website/StickyNavbar';

export default function GalleryPage() {
    const [images, setImages] = useState([]);
    // const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);
    const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');



    const loadImages = useCallback(async () => {
        try {
            const publicImages = await GalleryEntity.filter({ is_public: true }, '-display_order');
            const filteredImages = publicImages.filter(img =>
                img.title.toLowerCase() !== 'check' &&
                img.title.toLowerCase() !== 'youth'
            );
            setImages(filteredImages);
        } catch (error) {
            console.error("Failed to fetch gallery images:", error);
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const fetchedCategories = await GalleryCategory.list('display_order');
            const allCategory = { id: 'all', name: 'All', name_tamil: 'அனைத்தும்' };
            setCategories([allCategory, ...fetchedCategories]);
        } catch (error) {
            console.error("Failed to fetch gallery categories:", error);
        }
    }, []);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([loadImages(), loadCategories()]);
        setIsLoading(false);
    }, [loadImages, loadCategories]);

    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(localStorage.getItem('madha_tv_language') || 'english');
        };
        window.addEventListener('storage', handleLanguageChange);
        window.addEventListener('languageChanged', handleLanguageChange);

        loadData();

        return () => {
            window.removeEventListener('storage', handleLanguageChange);
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, [loadData]);

    const getText = (english, tamil) => {
        return language === 'tamil' ? tamil : english;
    };

    const filteredImages = useMemo(() => {
        if (filter === 'All') return GalleryPhotos;

        return GalleryPhotos.filter(
            img => img.imgcategory === filter
        );
    }, [filter]);


    const openLightbox = (image) => {
        setSelectedImage(image);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const navigateLightbox = (direction) => {
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
        const newIndex = (currentIndex + direction + filteredImages.length) % filteredImages.length;
        setSelectedImage(filteredImages[newIndex]);
    };
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(GalleryPhotos.map(img => img.imgcategory))
        );

        return ['All', ...uniqueCategories];
    }, []);


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col mt-5">
            <StickyNavbar/>
            {/* <AIFloatingChat /> */}

            <PageBanner
                pageKey="gallery"
                fallbackTitle="Step into our Gallery of Grace !"
                fallbackDescription="Our gallery of grace captures moments of faith, prayer, and community and each frame telling the living story of the Madha Television Media Mission."
                fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
            />

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-6 py-8 -mt-16 relative z-10">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                        <CardHeader>
                            <div className="flex justify-center flex-wrap gap-2">
                                {categories.map(category => (
                                    <Button
                                        key={category}
                                        variant={filter === category ? 'default' : 'outline'}
                                        onClick={() => setFilter(category)}
                                        className={filter === category ? 'bg-[#B71C1C] hover:bg-[#D32F2F]' : ''}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>

                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center p-12">{getText('Loading images...', 'படங்கள் ஏற்றப்படுகின்றன...')}</div>
                            ) : (
                                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                      {filteredImages.map(image => (
                                            <motion.div
                                                key={image.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                                className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
                                                onClick={() => openLightbox(image)}
                                            >
                                                <img
                                                    src={image.photos}
                                                    alt={language === 'tamil' && image.title_tamil ? image.title_tamil : (image.title || 'Gallery Image')}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </motion.div>



                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}


                            {/* {filteredImages.length === 0 && !isLoading && (
                                <div className="text-center p-12 text-slate-500">{getText('No images found for this category.', 'இந்தப் பிரிவிற்கு படங்கள் எதுவும் இல்லை.')}</div>
                            )} */}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <AnimatePresence>
                {selectedImage && (
                    <Lightbox
                        image={selectedImage}
                        onClose={closeLightbox}
                        onNext={() => navigateLightbox(1)}
                        onPrev={() => navigateLightbox(-1)}
                        language={language}
                    />
                )}
            </AnimatePresence>
            <DynamicFooter />
        </div>
    );
}