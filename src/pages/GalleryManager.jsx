import React, { useState, useEffect, useMemo } from 'react';
import { Gallery, GalleryCategory } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { groupBy } from 'lodash';

import UploadModal from '../components/gallery/UploadModal';
import ImageGrid from '../components/gallery/ImageGrid';
import CategoryManager from '../components/gallery/CategoryManager';

export default function GalleryManagerPage() {
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([loadImages(), loadCategories()]);
        setIsLoading(false);
    };

    const loadImages = async () => {
        try {
            const allImages = await Gallery.list('-display_order');
            setImages(allImages);
        } catch (error) {
            console.error("Failed to fetch gallery images:", error);
        }
    };
    
    const loadCategories = async () => {
        try {
            const allCategories = await GalleryCategory.list('display_order');
            setCategories(allCategories);
        } catch(error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleUploadSuccess = () => {
        setIsModalOpen(false);
        loadImages();
    };

    const handleEdit = (image) => {
        setEditingImage(image);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (imageId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await Gallery.delete(imageId);
                await loadImages();
            } catch (error) {
                console.error("Failed to delete image:", error);
            }
        }
    };

    const filteredImages = useMemo(() => {
        if (!searchTerm) return images;
        return images.filter(img => 
            img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (img.tags && img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [images, searchTerm]);

    const groupedImages = useMemo(() => {
        return groupBy(filteredImages, 'category');
    }, [filteredImages]);
    
    const sortedCategories = useMemo(() => {
        return [...categories].sort((a,b) => a.display_order - b.display_order);
    }, [categories]);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2940&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Gallery Manager</h1>
                <p className="text-red-100 max-w-2xl text-lg shadow-lg">Upload, organize, and manage all your visual media.</p>
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                      <ImageIcon className="text-[#B71C1C]"/> Media Management ({images.length} images)
                                    </CardTitle>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                            <Input 
                                                placeholder="Search images..." 
                                                className="pl-10"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Button className="bg-[#B71C1C] hover:bg-[#D32F2F]" onClick={() => { setEditingImage(null); setIsModalOpen(true); }}>
                                            <Plus className="w-4 h-4 mr-2"/> Upload
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {isLoading ? (
                            <p>Loading images...</p>
                        ) : (
                            <div className="space-y-8">
                                {sortedCategories.map(category => (
                                    groupedImages[category.name] && groupedImages[category.name].length > 0 && (
                                        <Card key={category.id}>
                                            <CardHeader>
                                                <CardTitle>{category.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ImageGrid 
                                                    images={groupedImages[category.name]}
                                                    setImages={setImages}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            </CardContent>
                                        </Card>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <CategoryManager categories={sortedCategories} onUpdate={loadCategories} />
                    </div>
                </div>
            </div>

            <UploadModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                image={editingImage}
                onUploadSuccess={handleUploadSuccess}
                categories={categories}
            />
        </div>
    );
}