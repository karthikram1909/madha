
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProgramImage, Program } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadFile } from '@/api/integrations';
import { toast } from 'sonner';
import { Upload, FileUp, Copy, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';

const ImageUploader = ({ onUploadSuccess }) => {
    const [existingFilenames, setExistingFilenames] = useState(new Set());
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        ProgramImage.list().then(images => {
            setExistingFilenames(new Set(images.map(img => img.filename.toLowerCase())));
        });
    }, []);

    const handleFiles = useCallback(async (files) => {
        if (!files || files.length === 0) return;

        toast.info(`Uploading ${files.length} file(s)...`);

        for (const file of files) {
            const lowerFilename = file.name.toLowerCase();
            
            if (file.size > 2 * 1024 * 1024) {
                toast.error(`Error: ${file.name} is larger than 2MB.`);
                continue;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                 toast.error(`Error: ${file.name} is not a supported image type.`);
                continue;
            }
            if (existingFilenames.has(lowerFilename)) {
                toast.error(`File "${file.name}" already exists. Please rename or delete the existing one.`);
                continue;
            }

            try {
                const { file_url } = await UploadFile({ file });
                await ProgramImage.create({
                    filename: file.name,
                    file_url: file_url,
                    size: file.size,
                    content_type: file.type
                });
                toast.success(`Successfully uploaded "${file.name}"`);
                setExistingFilenames(prev => new Set(prev).add(lowerFilename));
                if (onUploadSuccess) onUploadSuccess();
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Failed to upload "${file.name}"`);
            }
        }
    }, [existingFilenames, onUploadSuccess]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(Array.from(e.target.files));
        }
    };
    
    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <form
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            onClick={onButtonClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragActive ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'}`}
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                onChange={handleChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
            />
            <div className="flex flex-col items-center pointer-events-none">
                <FileUp className="w-12 h-12 text-slate-400 mb-4" />
                <p className="font-semibold text-slate-700">Drag & drop images here, or click to select</p>
                <p className="text-sm text-slate-500">Supports: JPG, PNG, WEBP (Max 2MB each)</p>
            </div>
        </form>
    );
};

const ImageTable = ({ images, usedFilenames, onCopy, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead className="bg-slate-50">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Thumbnail</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Filename</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Used in Program?</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {images.map(image => {
                    const isUsed = usedFilenames.has(image.filename.toLowerCase());
                    return (
                        <tr key={image.id}>
                            <td className="px-4 py-2">
                                <img src={image.file_url} alt={image.filename} className="w-16 h-16 object-cover rounded-lg" />
                            </td>
                            <td className="px-4 py-2 font-mono text-sm text-slate-800">{image.filename}</td>
                            <td className="px-4 py-2 text-sm text-slate-600">{(image.size / 1024).toFixed(1)} KB</td>
                            <td className="px-4 py-2">
                                {isUsed ? (
                                    <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> Yes</span>
                                ) : (
                                    <span className="flex items-center text-slate-500"><XCircle className="w-4 h-4 mr-2" /> No</span>
                                )}
                            </td>
                            <td className="px-4 py-2">
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => onCopy(image.filename)}><Copy className="w-4 h-4 mr-2" />Copy</Button>
                                    <Button size="sm" variant="destructive" onClick={() => onDelete(image.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default function ProgramImageUploadPage() {
    const [images, setImages] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [imageData, programData] = await Promise.all([
                ProgramImage.list('-created_date'),
                Program.list()
            ]);
            setImages(imageData);
            setPrograms(programData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Could not load image data.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCopy = (filename) => {
        navigator.clipboard.writeText(filename);
        toast.success(`Filename "${filename}" copied to clipboard!`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this image? This action cannot be undone and may break existing program schedules if the image is in use.")) {
            try {
                await ProgramImage.delete(id);
                toast.success("Image deleted successfully.");
                fetchData();
            } catch (error) {
                console.error("Delete error:", error);
                toast.error("Failed to delete image.");
            }
        }
    };

    const usedFilenames = new Set(programs.map(p => p.program_image?.toLowerCase()).filter(Boolean));
    const filteredImages = images.filter(image => image.filename.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#B71C1C] to-[#8B0000] text-white">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="text-center">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-6 h-6 text-[#B71C1C]" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Upload Program Images</h1>
                        <p className="text-red-100 max-w-2xl mx-auto">Manage the image library for program thumbnails.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-8 relative z-10 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload New Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ImageUploader onUploadSuccess={fetchData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle>Uploaded Image Library ({filteredImages.length})</CardTitle>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by filename..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-center text-slate-500 py-8">Loading images...</p>
                        ) : filteredImages.length > 0 ? (
                            <ImageTable images={filteredImages} usedFilenames={usedFilenames} onCopy={handleCopy} onDelete={handleDelete} />
                        ) : (
                            <p className="text-center text-slate-500 py-8">No images found. Upload some to get started!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
