import React, { useState, useEffect } from 'react';
import { ContentTemplate } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2, XCircle } from 'lucide-react';
import TemplatePreview from './TemplatePreview';

const emptyTemplate = {
    template_key: '',
    template_name: '',
    content_english: '',
    content_tamil: '',
    section: 'homepage',
    status: 'active',
    version: 1
};

export default function ContentEditor({ template, onSaveSuccess, onCancel, onDelete }) {
    const [formData, setFormData] = useState(emptyTemplate);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(template ? { ...template } : emptyTemplate);
    }, [template]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (template?.id) {
                await ContentTemplate.update(template.id, formData);
            } else {
                await ContentTemplate.create(formData);
            }
            onSaveSuccess();
        } catch (error) {
            console.error("Error saving template:", error);
            alert("Failed to save template.");
        }
        setIsSaving(false);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{template ? 'Edit' : 'Create'} Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="template_name">Template Name</Label>
                        <Input id="template_name" value={formData.template_name} onChange={e => handleChange('template_name', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="template_key">Template Key</Label>
                        <Input id="template_key" placeholder="e.g., hero_title" value={formData.template_key} onChange={e => handleChange('template_key', e.target.value)} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="section">Section</Label>
                    <Select value={formData.section} onValueChange={v => handleChange('section', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="homepage">Homepage</SelectItem>
                            <SelectItem value="donation">Donation</SelectItem>
                            <SelectItem value="booking">Booking</SelectItem>
                            <SelectItem value="prayer_wall">Prayer Wall</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                            <SelectItem value="forms">Forms</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="content_english">English Content</Label>
                        <Textarea id="content_english" value={formData.content_english} onChange={e => handleChange('content_english', e.target.value)} rows={5} />
                    </div>
                    <div>
                        <Label htmlFor="content_tamil">Tamil Content</Label>
                        <Textarea id="content_tamil" value={formData.content_tamil} onChange={e => handleChange('content_tamil', e.target.value)} rows={5} />
                    </div>
                </div>
                <TemplatePreview contentEnglish={formData.content_english} contentTamil={formData.content_tamil} />
            </CardContent>
            <CardFooter className="flex justify-between">
                <div>
                    {template && <Button variant="destructive" size="sm" onClick={() => onDelete(template.id)}><Trash2 className="w-4 h-4 mr-2"/> Delete</Button>}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}><XCircle className="w-4 h-4 mr-2"/> Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2"/> {isSaving ? 'Saving...' : 'Save Template'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}