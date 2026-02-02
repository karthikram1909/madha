import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Link as LinkIcon, X } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { toast } from 'sonner';

export default function DualImageInput({ 
    label, 
    value, 
    onChange, 
    placeholder = "Enter image URL",
    className = ""
}) {
    const [activeTab, setActiveTab] = useState('url');
    const [urlInput, setUrlInput] = useState('');
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Initialize with existing value
        if (value) {
            setUrlInput(value);
            setPreviewUrl(value);
        }
    }, [value]);

    useEffect(() => {
        // Update preview based on priority: uploaded file > URL input
        const finalUrl = uploadedUrl || urlInput;
        setPreviewUrl(finalUrl);
        onChange(finalUrl);
    }, [uploadedUrl, urlInput, onChange]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setUploadedUrl(file_url);
            setActiveTab('upload');
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error("Failed to upload image:", error);
            toast.error("Failed to upload image.");
        }
        setIsUploading(false);
    };

    const handleUrlChange = (url) => {
        setUrlInput(url);
        // Clear uploaded file if user is entering URL
        if (url && uploadedUrl) {
            setUploadedUrl('');
        }
    };

    const clearImage = () => {
        setUrlInput('');
        setUploadedUrl('');
        setPreviewUrl('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={className}>
            <Label className="text-sm font-semibold">{label}</Label>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url" className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        Upload
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder={placeholder}
                            value={urlInput}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            className="flex-1"
                        />
                        {urlInput && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearImage}
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            value={uploadedUrl ? uploadedUrl.split('/').pop() : 'No file selected'}
                            readOnly
                            placeholder="No file selected"
                            className="flex-1"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            type="button"
                        >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Browse'}
                        </Button>
                        {uploadedUrl && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearImage}
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                    />
                </TabsContent>
            </Tabs>

            {previewUrl && (
                <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-w-sm h-32 object-cover rounded-lg border-2 border-gray-200"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        {uploadedUrl && (
                            <div className="absolute top-2 left-2">
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    Uploaded
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}