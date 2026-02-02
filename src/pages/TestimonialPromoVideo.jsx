import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video, Upload, Save, Trash2, FileVideo, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TestimonialPromoVideoPage() {
    // const [promoVideoData, setPromoVideoData] = useState({
    //     video_url: '',
    //     title: 'Testimonial Promo Video',
    //     description: ''
    // });


    const DEFAULT_PROMO_VIDEO = '/Testimonial-promo.mp4';

    const [promoVideoData, setPromoVideoData] = useState({
        video_url: DEFAULT_PROMO_VIDEO,
        title: 'Testimonial Promo Video',
        description: ''
    });

    const [sectionTitleData, setSectionTitleData] = useState({
        title_english: 'What Our Viewers Say',
        title_tamil: '',
        description_english: 'Hear from our faithful community about how Madha TV has touched their lives and strengthened their spiritual journey.',
        description_tamil: ''
    });
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
    const [backgroundImageRecord, setBackgroundImageRecord] = useState(null);
    const [sectionTitleRecord, setSectionTitleRecord] = useState(null);
    const [sectionDescRecord, setSectionDescRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [existingRecord, setExistingRecord] = useState(null);

    useEffect(() => {
        loadPromoVideoData();
    }, []);

const loadPromoVideoData = async () => {
    setIsLoading(true);
    try {
        const content = await WebsiteContent.filter({
            section: 'testimonials'
        });

        let foundVideo = false;
        
        content.forEach(record => {
            if (record.content_key === 'promo_video_url') {
                foundVideo = true;
                setExistingRecord(record);
                setPromoVideoData({
                    video_url: record.content_value || DEFAULT_PROMO_VIDEO,
                    title: record.title || 'Testimonial Promo Video',
                    description: record.description || ''
                });
            }
            else if (record.content_key === 'section_title') {
                setSectionTitleRecord(record);
                setSectionTitleData(prev => ({
                    ...prev,
                    title_english: record.content_value || 'What Our Viewers Say',
                    title_tamil: record.content_value_tamil || ''
                }));
            } else if (record.content_key === 'section_description') {
                setSectionDescRecord(record);
                setSectionTitleData(prev => ({
                    ...prev,
                    description_english: record.content_value || 'Hear from our faithful community about how Madha TV has touched their lives and strengthened their spiritual journey.',
                    description_tamil: record.content_value_tamil || ''
                }));
            } else if (record.content_key === 'background_url') {
                setBackgroundImageRecord(record);
                setBackgroundImageUrl(record.content_value || '');
            }
        });

        // Auto-save default video if no record exists
        if (!foundVideo) {
            const videoPayload = {
                section: 'testimonials',
                content_key: 'promo_video_url',
                content_type: 'video',
                title: 'Testimonial Promo Video',
                content_value: DEFAULT_PROMO_VIDEO,
                description: '',
                is_active: true,
                display_order: 0
            };
            const newRecord = await WebsiteContent.create(videoPayload);
            setExistingRecord(newRecord);
        }
    } catch (error) {
        console.error("Error loading promo video data:", error);
        toast.error("Failed to load promo video data");
    }
    setIsLoading(false);
};
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                toast.error("File is too large. Please upload a video under 50MB.");
                setSelectedFile(null); // Clear selected file
                e.target.value = ''; // Clear input to allow re-selection of same file
                return;
            }
            setSelectedFile(file);
        }
    };

const handleSave = async () => {
    let videoUrlToSave = promoVideoData.video_url;

    setIsSaving(true);

    if (selectedFile) {
        setIsUploading(true);
        try {
            // Check file type before uploading
            const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
            if (!validVideoTypes.includes(selectedFile.type)) {
                toast.error("Unsupported video format. Please upload MP4, WebM, or OGG.");
                setIsSaving(false);
                setIsUploading(false);
                return;
            }

            const uploadResult = await UploadFile({ file: selectedFile });
            if (uploadResult && uploadResult.file_url) {
                videoUrlToSave = uploadResult.file_url;
                setPromoVideoData(prev => ({ ...prev, video_url: videoUrlToSave }));
            } else {
                throw new Error("File upload did not return a URL.");
            }
        } catch (uploadError) {
            console.error("Error uploading video:", uploadError);
            toast.error("Failed to upload video. Please try again.");
            setIsSaving(false);
            setIsUploading(false);
            return;
        } finally {
            setIsUploading(false);
        }
    }

    try {
        // Save video settings
        const videoPayload = {
            section: 'testimonials',
            content_key: 'promo_video_url',
            content_type: 'video',
            title: promoVideoData.title,
            content_value: videoUrlToSave,
            description: promoVideoData.description,
            is_active: true,
            display_order: 0
        };

        if (existingRecord) {
            await WebsiteContent.update(existingRecord.id, videoPayload);
        } else {
            const newRecord = await WebsiteContent.create(videoPayload);
            setExistingRecord(newRecord);
        }

        toast.success("Testimonial promo video settings saved successfully!");
        setSelectedFile(null);
    } catch (error) {
        console.error("Error saving promo video:", error);
        toast.error("Failed to save promo video settings");
    } finally {
        setIsSaving(false);
    }
};

    const handleDelete = async () => {
        if (!existingRecord) return;

        if (window.confirm("Are you sure you want to delete the testimonial promo video? This action cannot be undone.")) {
            try {
                await WebsiteContent.delete(existingRecord.id);
                setExistingRecord(null);
                setPromoVideoData({
                    video_url: DEFAULT_PROMO_VIDEO,
                    title: 'Testimonial Promo Video',
                    description: ''
                });
                setSelectedFile(null); // Clear selected file state
                toast.success("Testimonial promo video deleted successfully!");
            } catch (error) {
                console.error("Error deleting promo video:", error);
                toast.error("Failed to delete promo video");
            }
        }
    };

    const totalLoading = isSaving || isUploading;
    const buttonText = isUploading ? 'Uploading...' : isSaving ? 'Saving...' : existingRecord ? 'Update Video' : 'Save Video';

    return (
        <div className="bg-slate-50 min-h-screen ">
            <div
                className="relative bg-cover bg-center h-52"
                style={{ backgroundImage: "url('https://base44.app/api/apps/68f9beb680650e7849f02a09/files/public/68f9beb680650e7849f02a09/93d42ba27_Screenbox_20251203_134619.png')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
                <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                    <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Testimonial Promo Video</h1>
                    <p className="text-red-100 max-w-2xl text-lg shadow-lg">Manage the background video shown in the testimonials section.</p>
                </div>
            </div>

            <div className="p-6 md:p-8 max-w-4xl mx-auto -mt-16 relative z-10">
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Video className="w-6 h-6 text-[#B71C1C]" />
                            Testimonial Promo Video Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (
                            <div className="space-y-6">
                                {/* Section Title and Description for Frontend */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Section Title & Description (Displayed on Homepage)</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title (English)
                                            </label>
                                            <Input
                                                value={sectionTitleData.title_english}
                                                onChange={(e) => setSectionTitleData({
                                                    ...sectionTitleData,
                                                    title_english: e.target.value
                                                })}
                                                placeholder="What Our Viewers Say"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title (Tamil)
                                            </label>
                                            <Input
                                                value={sectionTitleData.title_tamil}
                                                onChange={(e) => setSectionTitleData({
                                                    ...sectionTitleData,
                                                    title_tamil: e.target.value
                                                })}
                                                placeholder="எங்கள் பார்வையாளர்கள் சொல்வது"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description (English)
                                            </label>
                                            <Textarea
                                                value={sectionTitleData.description_english}
                                                onChange={(e) => setSectionTitleData({
                                                    ...sectionTitleData,
                                                    description_english: e.target.value
                                                })}
                                                placeholder="Hear from our faithful community..."
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description (Tamil)
                                            </label>
                                            <Textarea
                                                value={sectionTitleData.description_tamil}
                                                onChange={(e) => setSectionTitleData({
                                                    ...sectionTitleData,
                                                    description_tamil: e.target.value
                                                })}
                                                placeholder="எங்கள் விசுவாசமுள்ள சமூகத்திடமிருந்து..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Background Image Section */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-[#B71C1C]" />
                                        Section Background Image
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Background Image URL
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={backgroundImageUrl}
                                                    onChange={(e) => setBackgroundImageUrl(e.target.value)}
                                                    placeholder="https://example.com/background.jpg"
                                                    className="flex-1"
                                                />
                                                <label className="cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                                                    setBackgroundImageUrl(file_url);
                                                                    toast.success('Background image uploaded');
                                                                } catch (error) {
                                                                    toast.error('Failed to upload image');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" variant="outline" asChild>
                                                        <span><Upload className="w-4 h-4 mr-2" />Upload</span>
                                                    </Button>
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">This image will be displayed as the background of the testimonials section on the homepage.</p>
                                        </div>

                                        {backgroundImageUrl && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Background Preview
                                                </label>
                                                <div className="relative rounded-lg overflow-hidden h-32">
                                                    <img
                                                        src={backgroundImageUrl}
                                                        alt="Background Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">Background Preview</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        Video Title (Internal Reference)
    </label>
    <Input
        value={promoVideoData.title}
        onChange={(e) => setPromoVideoData({
            ...promoVideoData,
            title: e.target.value
        })}
        placeholder="Testimonial Promo Video"
    />
</div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Upload Video File
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label htmlFor="video-upload" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-3 px-4 py-2 border rounded-md hover:bg-gray-50">
                                                <FileVideo className="w-5 h-5 text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {selectedFile ? selectedFile.name : "Choose a video file..."}
                                                </span>
                                            </div>
                                        </label>
                                        <Input
                                            id="video-upload"
                                            type="file"
                                            className="hidden"
                                            accept="video/mp4,video/webm,video/ogg"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">Max file size: 50MB. Supported formats: MP4, WebM, OGG.</p>
                                </div>

                                <div className="text-center text-sm text-gray-500">OR</div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter Video URL
                                    </label>
                                    <Input
                                        value={promoVideoData.video_url}
                                        onChange={(e) => setPromoVideoData({
                                            ...promoVideoData,
                                            video_url: e.target.value
                                        })}
                                        placeholder="https://example.com/video.mp4"
                                        type="url"
                                        disabled={!!selectedFile}
                                    />
                                    {selectedFile && <p className="text-xs text-red-500 mt-1">Video URL is disabled while a file is selected for upload.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <Textarea
                                        value={promoVideoData.description}
                                        onChange={(e) => setPromoVideoData({
                                            ...promoVideoData,
                                            description: e.target.value
                                        })}
                                        placeholder="Description or notes about this video..."
                                        rows={3}
                                    />
                                </div>

                                {promoVideoData.video_url && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Video Preview
                                        </label>
                                        <div className="bg-black rounded-lg overflow-hidden">
                                            <video
                                                key={promoVideoData.video_url} // Added key to force re-render on URL change
                                                src={promoVideoData.video_url}
                                                controls
                                                className="w-full aspect-video"
                                                onError={(e) => {
                                                    console.error("Video error:", e);
                                                    toast.error("Failed to load video. Please check the URL.");
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={totalLoading}
                                        className="bg-[#B71C1C] hover:bg-[#8B0000]"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {buttonText}
                                    </Button>

                                    {existingRecord && (
                                        <Button
                                            onClick={handleDelete}
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Video
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}