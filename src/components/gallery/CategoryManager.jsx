
import React, { useState } from 'react';
import { GalleryCategory } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export default function CategoryManager({ categories, onUpdate }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', name_tamil: '' });

    const openModal = (category = null) => {
        setEditingCategory(category);
        setFormData({
            name: category ? category.name : '',
            name_tamil: category ? category.name_tamil || '' : '' // Ensure name_tamil defaults to empty string if null/undefined
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', name_tamil: '' });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Category name (English) cannot be empty.");
            return;
        }

        try {
            const payload = {
                name: formData.name,
                name_tamil: formData.name_tamil
            };

            if (editingCategory) {
                await GalleryCategory.update(editingCategory.id, payload);
                toast.success("Category updated successfully.");
            } else {
                await GalleryCategory.create(payload);
                toast.success("Category added successfully.");
            }
            onUpdate();
            closeModal();
        } catch (error) {
            console.error("Failed to save category:", error);
            toast.error("Failed to save category.");
        }
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm("Are you sure you want to delete this category? This cannot be undone.")) {
            try {
                await GalleryCategory.delete(categoryId);
                toast.success("Category deleted.");
                onUpdate();
            } catch (error) {
                console.error("Failed to delete category:", error);
                toast.error("Failed to delete category. It might be in use.");
            }
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Manage Categories</CardTitle>
                <Button size="sm" onClick={() => openModal()}>
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {categories.length > 0 ? categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100">
                            <div className="flex items-center">
                                <GripVertical className="w-5 h-5 text-slate-400 mr-2" />
                                <span className="font-medium">{cat.name} {cat.name_tamil ? `(${cat.name_tamil})` : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(cat)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(cat.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-500 text-center py-4">No categories created yet.</p>
                    )}
                </div>
            </CardContent>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="category-name-en">Category Name (English)</Label>
                            <Input 
                                id="category-name-en"
                                placeholder="e.g., Community Events"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="category-name-ta">Category Name (Tamil)</Label>
                            <Input 
                                id="category-name-ta"
                                placeholder="e.g., சமூக நிகழ்வுகள்"
                                value={formData.name_tamil}
                                onChange={(e) => setFormData({...formData, name_tamil: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
