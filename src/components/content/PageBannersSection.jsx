import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Info, Save, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const pageDefinitions = [
    { key: 'schedule', label: 'Schedule Page' },
    { key: 'book_service', label: 'Book Service Page' },
    { key: 'prayer_request', label: 'Prayer Request Page' },
    { key: 'shows', label: 'Shows Page' },
    { key: 'buy_books', label: 'Buy Books Page' },
    { key: 'gallery', label: 'Gallery Page' },
    { key: 'donate', label: 'Donate Page' },
    { key: 'live_tv', label: 'Live TV Page' },
    { key: 'contact', label: 'Contact Page' },
    { key: 'about', label: 'About Page' },
    { key: 'program_schedule', label: 'Program Schedule (Admin)' },
    { key: 'service_bookings', label: 'Service Bookings (Admin)' },
    { key: 'booking_calendar', label: 'Booking Calendar (Admin)' },
    { key: 'user_dashboard', label: 'User Dashboard' }
];

export default function PageBannersSection({ currentSectionItems, loadContent }) {
    // Local state for form data with unsaved changes tracking
    const [formData, setFormData] = useState({});
    const [savingPages, setSavingPages] = useState({});
    const [savedPages, setSavedPages] = useState({});

    // Initialize form data from current section items
    useEffect(() => {
        const initialData = {};
        pageDefinitions.forEach(page => {
            const titleItem = currentSectionItems.find(item => item.content_key === `${page.key}_title`);
            const descriptionItem = currentSectionItems.find(item => item.content_key === `${page.key}_description`);
            const imageItem = currentSectionItems.find(item => item.content_key === `${page.key}_image`);

            initialData[page.key] = {
                title_en: titleItem?.content_value || '',
                title_ta: titleItem?.content_value_tamil || '',
                description_en: descriptionItem?.content_value || '',
                description_ta: descriptionItem?.content_value_tamil || '',
                image: imageItem?.content_value || '',
                titleItem,
                descriptionItem,
                imageItem,
            };
        });
        setFormData(initialData);
    }, [currentSectionItems]);

    // Handle input changes
    const handleChange = (pageKey, field, value) => {
        setFormData(prev => ({
            ...prev,
            [pageKey]: {
                ...prev[pageKey],
                [field]: value
            }
        }));
        // Clear saved status when user makes changes
        setSavedPages(prev => ({ ...prev, [pageKey]: false }));
    };

    // Save a single page's banner data
    const handleSave = async (pageKey) => {
        const data = formData[pageKey];
        if (!data) return;

        setSavingPages(prev => ({ ...prev, [pageKey]: true }));

        try {
            // Save title
            if (data.titleItem) {
                await WebsiteContent.update(data.titleItem.id, {
                    content_value: data.title_en,
                    content_value_tamil: data.title_ta
                });
            } else if (data.title_en || data.title_ta) {
                await WebsiteContent.create({
                    section: 'page_banners',
                    content_key: `${pageKey}_title`,
                    content_type: 'text',
                    title: `${pageKey} Title`,
                    content_value: data.title_en,
                    content_value_tamil: data.title_ta,
                    is_active: true,
                    display_order: 0
                });
            }

            // Save description
            if (data.descriptionItem) {
                await WebsiteContent.update(data.descriptionItem.id, {
                    content_value: data.description_en,
                    content_value_tamil: data.description_ta
                });
            } else if (data.description_en || data.description_ta) {
                await WebsiteContent.create({
                    section: 'page_banners',
                    content_key: `${pageKey}_description`,
                    content_type: 'text',
                    title: `${pageKey} Description`,
                    content_value: data.description_en,
                    content_value_tamil: data.description_ta,
                    is_active: true,
                    display_order: 0
                });
            }

            // Save image
            if (data.imageItem) {
                await WebsiteContent.update(data.imageItem.id, {
                    content_value: data.image
                });
            } else if (data.image) {
                await WebsiteContent.create({
                    section: 'page_banners',
                    content_key: `${pageKey}_image`,
                    content_type: 'image',
                    title: `${pageKey} Image`,
                    content_value: data.image,
                    is_active: true,
                    display_order: 0
                });
            }

            toast.success(`${pageDefinitions.find(p => p.key === pageKey)?.label || pageKey} banner saved successfully!`);
            setSavedPages(prev => ({ ...prev, [pageKey]: true }));
            
            // Reload content to get updated items with IDs
            loadContent();

        } catch (error) {
            console.error('Error saving banner:', error);
            toast.error('Failed to save banner. Please try again.');
        } finally {
            setSavingPages(prev => ({ ...prev, [pageKey]: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Page Banner Management</h4>
                        <p className="text-sm text-blue-800">
                            Configure banner sections (title, description, and background image) for all pages except the Home page. 
                            Each page can have custom content in both English and Tamil. 
                            <strong> Use line breaks in the description to create multiple paragraphs.</strong>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {pageDefinitions.map(page => {
                    const data = formData[page.key] || {};
                    const isSaving = savingPages[page.key];
                    const isSaved = savedPages[page.key];

                    return (
                        <Card key={page.key} className="bg-white border-slate-200">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-semibold text-slate-900">
                                        {page.label} Banner
                                    </CardTitle>
                                    <Button
                                        onClick={() => handleSave(page.key)}
                                        disabled={isSaving}
                                        className={`${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-[#B71C1C] hover:bg-[#D32F2F]'}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : isSaved ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Saved
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Title */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Title (English)
                                        </label>
                                        <Input
                                            value={data.title_en || ''}
                                            onChange={(e) => handleChange(page.key, 'title_en', e.target.value)}
                                            placeholder={`${page.label} title in English`}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Title (Tamil)
                                        </label>
                                        <Input
                                            value={data.title_ta || ''}
                                            onChange={(e) => handleChange(page.key, 'title_ta', e.target.value)}
                                            placeholder={`${page.label} title in Tamil`}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Description - Multi-paragraph support with larger textarea */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Description (English)
                                        </label>
                                        <Textarea
                                            value={data.description_en || ''}
                                            onChange={(e) => handleChange(page.key, 'description_en', e.target.value)}
                                            placeholder={`${page.label} description in English. Use Enter key for new paragraphs.`}
                                            className="w-full h-32 resize-y"
                                            rows={5}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Press Enter to create new paragraphs
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Description (Tamil)
                                        </label>
                                        <Textarea
                                            value={data.description_ta || ''}
                                            onChange={(e) => handleChange(page.key, 'description_ta', e.target.value)}
                                            placeholder={`${page.label} description in Tamil. Use Enter key for new paragraphs.`}
                                            className="w-full h-32 resize-y"
                                            rows={5}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Press Enter to create new paragraphs
                                        </p>
                                    </div>
                                </div>

                                {/* Background Image */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Background Image URL
                                    </label>
                                    <Input
                                        value={data.image || ''}
                                        onChange={(e) => handleChange(page.key, 'image', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full"
                                    />
                                    {data.image && (
                                        <div className="mt-2">
                                            <img
                                                src={data.image}
                                                alt={`${page.label} background`}
                                                className="w-full h-24 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}