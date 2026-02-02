
import React, { useState, useEffect } from 'react';
import { WebsiteContent, HomepageService } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import ServiceFormModal from '../components/services/ServiceFormModal'; // Changed import
import DualImageInput from '@/components/ui/dual-image-input';

export default function HomepageServicesManager() {
    const [ourServicesSettings, setOurServicesSettings] = useState({});
    const [localBackgroundUrl, setLocalBackgroundUrl] = useState(''); // State for background URL input
    const [services, setServices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const settingKeys = ['background_url', 'section_title', 'section_description'];

    useEffect(() => {
        loadPageData();
    }, []);

    // Effect to sync local state when settings are loaded from the database
    useEffect(() => {
        if (ourServicesSettings.background_url) {
            setLocalBackgroundUrl(ourServicesSettings.background_url.content_value || '');
        }
    }, [ourServicesSettings.background_url]);

    const loadPageData = async () => {
        setIsLoading(true);
        try {
            const [contentData, servicesData] = await Promise.all([
                WebsiteContent.filter({ section: 'homepage_services' }),
                HomepageService.filter({ is_active: true }, 'display_order')
            ]);
            
            const settingsMap = contentData.reduce((acc, item) => {
                acc[item.content_key] = item;
                return acc;
            }, {});
            setOurServicesSettings(settingsMap);
            setServices(servicesData);
        } catch (error) {
            console.error("Failed to load page data:", error);
            toast.error("Failed to load page data.");
        }
        setIsLoading(false);
    };

    const handleSaveSetting = async (key, value, tamilValue = null) => {
        try {
            const existingSetting = ourServicesSettings[key];
            let payload = {
                section: 'homepage_services',
                content_key: key,
                content_type: 'text',
                title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                is_active: true,
                content_value: value,
            };
            if (tamilValue !== null) {
                payload.content_value_tamil = tamilValue;
            }

            if (existingSetting && existingSetting.id) {
                await WebsiteContent.update(existingSetting.id, payload);
            } else {
                await WebsiteContent.create(payload);
            }
            toast.success(`'${payload.title}' setting saved successfully.`);
            loadPageData();
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            toast.error(`Failed to save setting: ${key}`);
        }
    };
    
    const handleSaveService = async (serviceData) => {
        try {
            if (editingService) {
                await HomepageService.update(editingService.id, serviceData);
                toast.success("Service card updated successfully.");
            } else {
                await HomepageService.create(serviceData);
                toast.success("New service card added successfully.");
            }
            setIsModalOpen(false);
            setEditingService(null);
            loadPageData();
        } catch (error) {
            console.error("Failed to save service:", error);
            toast.error("Failed to save service card.");
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm("Are you sure you want to delete this service card?")) {
            try {
                await HomepageService.delete(serviceId);
                toast.success("Service card deleted successfully.");
                loadPageData();
            } catch (error) {
                console.error("Failed to delete service:", error);
                toast.error("Failed to delete service card.");
            }
        }
    };

    return (
        <div className="container mx-auto p-6 bg-slate-50 min-h-screen">
            <Card className="mb-6 shadow-lg border-l-4 border-red-600">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-800">Our Services Section Manager</CardTitle>
                    <CardDescription className="text-slate-600">
                        Configure the background, titles, and service cards for the homepage "Our Services" section.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Section Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <DualImageInput
                            label="Section Background Image"
                            value={localBackgroundUrl}
                            onChange={setLocalBackgroundUrl} // Update local state instead of saving directly
                            placeholder="Enter image URL or upload"
                        />
                        <Button 
                            className="mt-2" 
                            size="sm" 
                            onClick={() => handleSaveSetting('background_url', localBackgroundUrl)}
                        >
                            Save Background
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">Section Title (English)</label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    defaultValue={ourServicesSettings.section_title?.content_value}
                                    onBlur={(e) => handleSaveSetting('section_title', e.target.value, ourServicesSettings.section_title?.content_value_tamil)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Section Title (Tamil)</label>
                             <div className="flex gap-2 mt-1">
                                <Input
                                    defaultValue={ourServicesSettings.section_title?.content_value_tamil}
                                    onBlur={(e) => handleSaveSetting('section_title', ourServicesSettings.section_title?.content_value, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">Section Description (English)</label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    defaultValue={ourServicesSettings.section_description?.content_value}
                                    onBlur={(e) => handleSaveSetting('section_description', e.target.value, ourServicesSettings.section_description?.content_value_tamil)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Section Description (Tamil)</label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    defaultValue={ourServicesSettings.section_description?.content_value_tamil}
                                    onBlur={(e) => handleSaveSetting('section_description', ourServicesSettings.section_description?.content_value, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Service Cards Management</CardTitle>
                        <CardDescription>Add, edit, or remove service cards.</CardDescription>
                    </div>
                    <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
                    </Button>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {services.map(service => (
                            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden relative group">
                                <img src={service.image_url} alt={service.title} className="w-full h-48 object-cover"/>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg">{service.title}</h3>
                                    <p className="text-sm text-gray-600">{service.title_tamil}</p>
                                    <p className="text-lg font-semibold mt-2">{service.amount}</p>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="icon" variant="outline" className="bg-white" onClick={() => { setEditingService(service); setIsModalOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => handleDeleteService(service.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
                <ServiceFormModal // Changed component name here
                    service={editingService}
                    onSave={handleSaveService}
                    onClose={() => { setIsModalOpen(false); setEditingService(null); }}
                />
            )}
        </div>
    );
}
