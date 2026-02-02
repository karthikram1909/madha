import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

const emptyItem = {
    title: "",
    section: "hero",
    content_key: "",
    content_type: "text",
    content_value: "",
    content_value_tamil: "",
    description: "",
    display_order: 0,
    is_active: true,
};

export default function ContentItemForm({ isOpen, setIsOpen, item, onSaveSuccess }) {
    const [formData, setFormData] = useState(emptyItem);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData(emptyItem);
        }
    }, [item, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                display_order: Number(formData.display_order) || 0,
            };

            if (item?.id) {
                await WebsiteContent.update(item.id, dataToSave);
            } else {
                await WebsiteContent.create(dataToSave);
            }
            onSaveSuccess();
        } catch (error) {
            console.error("Failed to save content item:", error);
            alert("Failed to save content item. Check console for details.");
        }
        setIsSaving(false);
    };

    const sectionOptions = ["theme", "navigation", "hero", "services", "live_tv", "events", "footer", "floating_ui", "api_keys", "security", "notifications", "gallery_content"];
    const typeOptions = ["text", "image", "icon", "video", "link", "color"];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Content Item' : 'Create New Content Item'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="section" className="text-right">Section</Label>
                        <Select value={formData.section} onValueChange={v => setFormData({ ...formData, section: v })}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {sectionOptions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt.replace(/_/g, ' ')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content_key" className="text-right">Content Key</Label>
                        <Input id="content_key" placeholder="e.g., main_title" value={formData.content_key} onChange={e => setFormData({ ...formData, content_key: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content_type" className="text-right">Content Type</Label>
                         <Select value={formData.content_type} onValueChange={v => setFormData({ ...formData, content_type: v })}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {typeOptions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content_value" className="text-right">Value (English)</Label>
                        <Textarea id="content_value" value={formData.content_value} onChange={e => setFormData({ ...formData, content_value: e.target.value })} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content_value_tamil" className="text-right">Value (Tamil)</Label>
                        <Textarea id="content_value_tamil" value={formData.content_value_tamil} onChange={e => setFormData({ ...formData, content_value_tamil: e.target.value })} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" placeholder="Admin notes..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="display_order" className="text-right">Display Order</Label>
                        <Input id="display_order" type="number" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="is_active" className="text-right">Active</Label>
                        <Switch id="is_active" checked={formData.is_active} onCheckedChange={c => setFormData({ ...formData, is_active: c })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}