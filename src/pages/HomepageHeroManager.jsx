import React, { useState, useEffect, useRef } from 'react';
import { HomepageHero } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Save, UploadCloud, Video, Image as ImageIcon } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export default function HomepageHeroManager() {
    const [heroContent, setHeroContent] = useState({
        background_image_url: '',
        background_video_url: '',
        background_type: 'image',
        is_background_enabled: true,
        heading_english: '',
        heading_tamil: '',
        youtube_embed_url: ''
    });
    const [dbId, setDbId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const imageFileInputRef = useRef(null);
    const videoFileInputRef = useRef(null);

    useEffect(() => {
        loadHeroContent();
    }, []);

    const loadHeroContent = async () => {
        setIsLoading(true);
        try {
            const content = await HomepageHero.list();
            if (content.length > 0) {
                // Ensure defaults for new fields if they don't exist
                const data = {
                    ...{ background_type: 'image', is_background_enabled: true },
                    ...content[0]
                };
                setHeroContent(data);
                setDbId(content[0].id);
            }
        } catch (error) {
            console.error("Failed to load hero content:", error);
            toast.error("Failed to load hero content");
        }
        setIsLoading(false);
    };

    const handleChange = (field, value) => {
        setHeroContent(prev => ({ ...prev, [field]: value }));
    };

    const handleImageFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            handleChange('background_image_url', file_url);
            toast.success("Background image uploaded successfully!");
        } catch (error) {
            console.error("Failed to upload image:", error);
            toast.error("Failed to upload image.");
        }
        setIsUploading(false);
    };
    
    const handleVideoFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            handleChange('background_video_url', file_url);
            toast.success("Background video uploaded successfully!");
        } catch (error) {
            console.error("Failed to upload video:", error);
            toast.error("Failed to upload video.");
        }
        setIsUploading(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            if (dbId) {
                await HomepageHero.update(dbId, heroContent);
            } else {
                const newContent = await HomepageHero.create(heroContent);
                setDbId(newContent.id);
            }
            toast.success("Hero content saved successfully!");
        } catch (error) {
            console.error("Failed to save hero content:", error);
            toast.error("Failed to save hero content.");
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Homepage Hero Manager</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Hero Section Content</CardTitle>
                    <CardDescription>Manage the main banner content, including the background and text.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                            <Label htmlFor="enable-background" className="font-medium text-slate-800">Enable Hero Background</Label>
                            <p className="text-sm text-slate-500 mt-1">Turn the hero section background on or off.</p>
                        </div>
                        <Switch
                            id="enable-background"
                            checked={heroContent.is_background_enabled}
                            onCheckedChange={(checked) => handleChange('is_background_enabled', checked)}
                        />
                    </div>

                    <div>
                        <Label className="font-medium text-slate-800">Background Type</Label>
                        <RadioGroup
                            value={heroContent.background_type || 'image'}
                            onValueChange={(value) => handleChange('background_type', value)}
                            className="mt-2 grid grid-cols-2 gap-4"
                        >
                            <Label htmlFor="type-image" className="flex items-center space-x-3 border rounded-md p-4 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                                <RadioGroupItem value="image" id="type-image" />
                                <ImageIcon className="w-5 h-5 text-slate-600" />
                                <span className="font-medium">Image</span>
                            </Label>
                            <Label htmlFor="type-video" className="flex items-center space-x-3 border rounded-md p-4 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                                <RadioGroupItem value="video" id="type-video" />
                                <Video className="w-5 h-5 text-slate-600" />
                                <span className="font-medium">Video</span>
                            </Label>
                        </RadioGroup>
                    </div>

                    {heroContent.background_type === 'image' ? (
                        <div>
                            <Label>Background Image</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <Input
                                    value={heroContent.background_image_url || ''}
                                    readOnly
                                    placeholder="Upload an image"
                                    className="flex-grow"
                                />
                                <Button onClick={() => imageFileInputRef.current.click()} disabled={isUploading}>
                                    <UploadCloud className="w-4 h-4 mr-2" />
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </Button>
                                <input
                                    type="file"
                                    ref={imageFileInputRef}
                                    onChange={handleImageFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            {heroContent.background_image_url && (
                                <img src={heroContent.background_image_url} alt="background preview" className="mt-4 rounded-lg w-48 h-auto" />
                            )}
                        </div>
                    ) : (
                        <div>
                            <Label>Background Video</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <Input
                                    value={heroContent.background_video_url || ''}
                                    readOnly
                                    placeholder="Upload a video (.mp4, .webm)"
                                    className="flex-grow"
                                />
                                <Button onClick={() => videoFileInputRef.current.click()} disabled={isUploading}>
                                    <UploadCloud className="w-4 h-4 mr-2" />
                                    {isUploading ? 'Uploading...' : 'Upload Video'}
                                </Button>
                                <input
                                    type="file"
                                    ref={videoFileInputRef}
                                    onChange={handleVideoFileChange}
                                    className="hidden"
                                    accept="video/mp4,video/webm,video/ogg"
                                />
                            </div>
                            {heroContent.background_video_url && (
                                <video
                                    src={heroContent.background_video_url}
                                    className="mt-4 rounded-lg w-full max-w-sm"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    key={heroContent.background_video_url}
                                />
                            )}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="heading_english">Heading (English)</Label>
                        <Input
                            id="heading_english"
                            value={heroContent.heading_english || ''}
                            onChange={(e) => handleChange('heading_english', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="heading_tamil">Heading (Tamil)</Label>

                        <Input
                            id="heading_tamil"
                            value={heroContent.heading_tamil || ''}
                            onChange={(e) => handleChange('heading_tamil', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="youtube_embed_url">YouTube Embed URL (Fallback)</Label>
                        <Input
                            id="youtube_embed_url"
                            value={heroContent.youtube_embed_url || ''}
                            onChange={(e) => handleChange('youtube_embed_url', e.target.value)}
                            placeholder="e.g., https://www.youtube.com/embed/your_video_id"
                        />
                        <p className="text-sm text-slate-500 mt-1">
                            This will be shown only if "Show Live Video" is turned OFF in the Live Stream settings.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Content
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}