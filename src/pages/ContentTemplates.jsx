import React, { useState, useEffect } from 'react';
import { ContentTemplate } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TemplateList from '../components/content/TemplateList';
import ContentEditor from '../components/content/ContentEditor';

export default function ContentTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await ContentTemplate.list('-created_date');
            setTemplates(data);
        } catch (error) {
            console.error("Error loading content templates:", error);
        }
        setIsLoading(false);
    };

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        setIsCreating(false);
    };

    const handleAddNew = () => {
        setSelectedTemplate(null);
        setIsCreating(true);
    };

    const handleSaveSuccess = () => {
        setIsCreating(false);
        setSelectedTemplate(null);
        loadTemplates();
    };
    
    const handleCancel = () => {
        setIsCreating(false);
        setSelectedTemplate(null);
    };

    const handleDelete = async (templateId) => {
        if (window.confirm("Are you sure you want to delete this template? This cannot be undone.")) {
            try {
                await ContentTemplate.delete(templateId);
                handleSaveSuccess();
            } catch (error) {
                console.error("Failed to delete template:", error);
                alert("Failed to delete template.");
            }
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=2940&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Content Templates</h1>
                <p className="text-red-100 max-w-2xl text-lg shadow-lg">Manage reusable, multilingual text for the entire website.</p>
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Templates</CardTitle>
                                <Button size="sm" onClick={handleAddNew} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
                                    <Plus className="w-4 h-4 mr-2" /> Add New
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <TemplateList
                                    templates={templates}
                                    isLoading={isLoading}
                                    onSelectTemplate={handleSelectTemplate}
                                    selectedTemplate={selectedTemplate}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isCreating || selectedTemplate ? (
                            <ContentEditor
                                template={selectedTemplate}
                                onSaveSuccess={handleSaveSuccess}
                                onCancel={handleCancel}
                                onDelete={handleDelete}
                            />
                        ) : (
                            <Card className="flex items-center justify-center h-full min-h-[400px]">
                                <div className="text-center">
                                    <p className="text-slate-500">Select a template to edit or create a new one.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}