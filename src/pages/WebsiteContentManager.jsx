import React, { useState, useEffect, useMemo } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Search, Trash2, Info, Upload } from 'lucide-react';
import { groupBy } from 'lodash';
import { base44 } from '@/api/base44Client';
import ContentItemForm from '../components/content/ContentItemForm';
import PageBannersSection from '../components/content/PageBannersSection';
import SocialMediaSettings from '../components/content/SocialMediaSettings';

export default function WebsiteContentManager() {
    const [content, setContent] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeSection, setActiveSection] = useState('theme');
    const [isUploading, setIsUploading] = useState(false);
    const [prayerImageUrl, setPrayerImageUrl] = useState('');

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setIsLoading(true);
        try {
            const data = await WebsiteContent.list('-created_date', 500);
            setContent(data || []);
        } catch (error) {
            console.error("Error loading website content:", error);
            setContent([]);
        }
        setIsLoading(false);
    };

    const handleSaveSuccess = () => {
        setIsFormOpen(false);
        setEditingItem(null);
        loadContent();
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this content item? This action cannot be undone.')) {
            try {
                await WebsiteContent.delete(itemId);
                loadContent();
            } catch (error) {
                console.error('Failed to delete content item:', error);
                alert('Failed to delete content item.');
            }
        }
    };
    
    const filteredContent = useMemo(() => {
        if (!searchTerm) return content;
        return content.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.section.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [content, searchTerm]);

    const groupedContent = useMemo(() => {
        // Grouping is still useful for general organization, but direct iteration for rendering will use activeSection
        return groupBy(filteredContent, 'section');
    }, [filteredContent]);

    // Define the list of sections with labels
    const sectionsList = [
        { value: 'theme', label: 'Theme & Colors' },
        { value: 'navigation', label: 'Navigation & Logo' },
        { value: 'hero', label: 'Homepage Hero Section' },
        { value: 'services', label: 'Services Section' },
        { value: 'live_tv', label: 'Live TV Settings' },
        { value: 'live_audio', label: 'Live Audio Settings' },
        { value: 'events', label: 'Events & Programs' },
        { value: 'page_banners', label: 'Page Banners' },
        { value: 'prayer_request', label: 'Prayer Request Page' },
        { value: 'testimonials', label: 'Testimonials Section' },
        { value: 'floating_ui', label: 'Floating UI Elements' },
        { value: 'floating_ui_spotify', label: 'Spotify Settings' },
        { value: 'floating_ui_social', label: 'Social Media Icons' },
        { value: 'footer', label: 'Footer Content' },
        { value: 'api_keys', label: 'API Keys & Integrations' },
        { value: 'security', label: 'Security Settings' },
        { value: 'notifications', label: 'Notifications' },
        { value: 'gallery_content', label: 'Gallery Settings' }
    ];

    // Helper function for handling quick updates for page banners (English content_value)
    const handleQuickUpdate = async (contentKey, value, existingItem) => {
        const section = 'page_banners';
        const contentType = contentKey.includes('image') ? 'image' : 'text';
        const title = contentKey.charAt(0).toUpperCase() + contentKey.slice(1).replace(/_/g, ' ');

        try {
            if (existingItem) {
                // Update existing item
                await WebsiteContent.update(existingItem.id, {
                    content_value: value
                });
            } else {
                // Create new item
                await WebsiteContent.create({
                    section,
                    content_key: contentKey,
                    content_type: contentType,
                    title: title,
                    content_value: value,
                    is_active: true,
                    display_order: 0
                });
            }
            
            // Reload content to reflect changes
            loadContent();
            
        } catch (error) {
            console.error('Error updating content:', error);
            alert('Failed to update content item.');
        }
    };

    // Helper function for handling Tamil updates (content_value_tamil)
    const handleTamilUpdate = async (contentKey, value, existingItem) => {
        const section = 'page_banners';
        const contentType = contentKey.includes('image') ? 'image' : 'text';
        const title = contentKey.charAt(0).toUpperCase() + contentKey.slice(1).replace(/_/g, ' ');

        try {
            if (existingItem) {
                // Update existing item
                await WebsiteContent.update(existingItem.id, {
                    content_value_tamil: value
                });
            } else {
                // Create new item with Tamil value, English value empty
                await WebsiteContent.create({
                    section,
                    content_key: contentKey,
                    content_type: contentType,
                    title: title,
                    content_value: '', // English value will be empty if only Tamil is set initially
                    content_value_tamil: value,
                    is_active: true,
                    display_order: 0
                });
            }
            
            // Reload content to reflect changes
            loadContent();
            
        } catch (error) {
            console.error('Error updating Tamil content:', error);
            alert('Failed to update Tamil content item.');
        }
    };

    const renderSectionContent = () => {
        const currentSectionItems = filteredContent.filter(item => item.section === activeSection);
        const currentSectionLabel = sectionsList.find(s => s.value === activeSection)?.label;

        // Spotify Settings Section
        if (activeSection === 'floating_ui_spotify') {
            const floatingUIItems = content.filter(item => item.section === 'floating_ui');
            const spotifyUrlItem = floatingUIItems.find(item => item.content_key === 'spotify_url');

            const handleSpotifyUpdate = async (value) => {
                try {
                    if (spotifyUrlItem) {
                        await WebsiteContent.update(spotifyUrlItem.id, { content_value: value });
                    } else {
                        await WebsiteContent.create({
                            section: 'floating_ui',
                            content_key: 'spotify_url',
                            content_type: 'link',
                            title: 'Spotify URL',
                            content_value: value,
                            is_active: true,
                            display_order: 0
                        });
                    }
                    loadContent();
                } catch (error) {
                    console.error('Error updating Spotify URL:', error);
                    alert('Failed to update Spotify URL.');
                }
            };

            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Spotify Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-green-900 mb-1">Spotify Integration</h4>
                                    <p className="text-sm text-green-800">
                                        Configure the Spotify link that appears in the Floating UI and Footer sections of the website.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Spotify URL
                            </label>
                            <Input
                                value={spotifyUrlItem?.content_value || ''}
                                onChange={(e) => handleSpotifyUpdate(e.target.value)}
                                placeholder="https://open.spotify.com/show/your-show-id"
                                className="w-full"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Enter your Spotify show or podcast URL. This will be displayed in the floating UI and footer.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (activeSection === 'page_banners') {
            return <PageBannersSection 
                currentSectionItems={currentSectionItems} 
                loadContent={loadContent} 
            />;
        }

        // Prayer Request Page Section
        if (activeSection === 'prayer_request') {
            const prayerImageItem = currentSectionItems.find(item => item.content_key === 'prayer_image');

            const handleSaveUrl = async () => {
                try {
                    if (prayerImageItem) {
                        await WebsiteContent.update(prayerImageItem.id, { content_value: prayerImageUrl || prayerImageItem.content_value });
                    } else {
                        await WebsiteContent.create({
                            section: 'prayer_request',
                            content_key: 'prayer_image',
                            content_type: 'image',
                            title: 'Prayer Request Page Image',
                            content_value: prayerImageUrl,
                            is_active: true,
                            display_order: 0
                        });
                    }
                    loadContent();
                    setPrayerImageUrl('');
                } catch (error) {
                    console.error('Error updating prayer image:', error);
                    alert('Failed to update prayer image.');
                }
            };

            const handleImageUpload = async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setIsUploading(true);
                try {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    
                    if (prayerImageItem) {
                        await WebsiteContent.update(prayerImageItem.id, { content_value: file_url });
                    } else {
                        await WebsiteContent.create({
                            section: 'prayer_request',
                            content_key: 'prayer_image',
                            content_type: 'image',
                            title: 'Prayer Request Page Image',
                            content_value: file_url,
                            is_active: true,
                            display_order: 0
                        });
                    }
                    loadContent();
                    setPrayerImageUrl('');
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload image.');
                } finally {
                    setIsUploading(false);
                }
            };

            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Prayer Request Page Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900 mb-1">Prayer Request Image</h4>
                                    <p className="text-sm text-blue-800">
                                        Configure the devotional image that appears on the Prayer Request page.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {prayerImageItem?.content_value && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Current Image</label>
                                <img 
                                    src={prayerImageItem.content_value} 
                                    alt="Prayer Request" 
                                    className="w-64 h-64 object-cover rounded-lg border-2 border-slate-200"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Prayer Request Image URL
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={prayerImageUrl || prayerImageItem?.content_value || ''}
                                    onChange={(e) => setPrayerImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="flex-1"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={handleSaveUrl}
                                    className="bg-[#B71C1C] text-white hover:bg-[#D32F2F]"
                                >
                                    Save
                                </Button>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploading}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        disabled={isUploading}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Enter the URL or upload an image to display on the Prayer Request page.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        // Social Media Icons Section
        if (activeSection === 'floating_ui_social') {
            const floatingUIItems = content.filter(item => item.section === 'floating_ui');
            return <SocialMediaSettings 
                floatingUIItems={floatingUIItems}
                loadContent={loadContent}
            />;
        }

        // Default rendering for other sections
        if (currentSectionItems.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="capitalize">{currentSectionLabel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">No content items found for this section. Click "Add New" to create one.</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="capitalize">{currentSectionLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Key</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {currentSectionItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{item.content_key}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><Badge variant="secondary">{item.content_type}</Badge></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 truncate max-w-xs">{item.content_value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge className={item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2940&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Website Content Manager</h1>
                <p className="text-red-100 max-w-2xl text-lg shadow-lg">Dynamically control all text, links, and media on your public website.</p>
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle>Content Controls</CardTitle>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search content..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleAddNew} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
                                    <Plus className="w-4 h-4 mr-2" /> Add New
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {isLoading ? (
                    <p>Loading content...</p>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar for section navigation */}
                        <nav className="flex-shrink-0 w-full md:w-64">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Sections</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="space-y-1 p-4 pt-0">
                                        {sectionsList.map(sec => (
                                            <li key={sec.value}>
                                                <Button
                                                    variant={activeSection === sec.value ? 'secondary' : 'ghost'}
                                                    onClick={() => setActiveSection(sec.value)}
                                                    className="w-full justify-start text-left"
                                                >
                                                    {sec.label}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </nav>

                        {/* Main content area */}
                        <div className="flex-1">
                            {renderSectionContent()}
                        </div>
                    </div>
                )}
            </div>
            
            <ContentItemForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                item={editingItem}
                onSaveSuccess={handleSaveSuccess}
            />
        </div>
    );
}