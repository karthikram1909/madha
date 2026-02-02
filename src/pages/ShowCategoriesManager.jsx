import React, { useState, useEffect } from 'react';
import { ShowCategory, CategoryShow, WebsiteContent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Upload, Globe, Tv, Folder } from 'lucide-react';
import DualImageInput from '@/components/ui/dual-image-input';

// Category Form Component
const CategoryForm = ({ category, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        title_tamil: '',
        display_order: 0,
        is_active: true,
        ...category
    });

    useEffect(() => {
        if (category) {
            setFormData(prev => ({ ...prev, ...category }));
        }
    }, [category]);

    const handleSave = async () => {
        if (!formData.title?.trim()) {
            toast.error("Category title (English) is required.");
            return;
        }

        try {
            if (formData.id) {
                await ShowCategory.update(formData.id, formData);
                toast.success("Category updated successfully.");
            } else {
                await ShowCategory.create(formData);
                toast.success("Category created successfully.");
            }
            onSave();
        } catch (error) {
            console.error("Failed to save category:", error);
            toast.error("Failed to save category. Please try again.");
        }
    };

    return (
        <Card className="mt-4 border-2 border-green-200">
            <CardHeader className="bg-green-50">
                <CardTitle className="text-lg text-green-800">
                    {formData.id ? 'Edit Category' : 'Add New Category'}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="cat_title" className="text-sm font-semibold">Category Title (English) *</Label>
                        <Input
                            id="cat_title"
                            placeholder="e.g., Emmaus Experience"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="cat_title_tamil" className="text-sm font-semibold">Category Title (Tamil)</Label>
                        <Input
                            id="cat_title_tamil"
                            placeholder="எம்மாஸ் அனுபவம்"
                            value={formData.title_tamil || ''}
                            onChange={e => setFormData({ ...formData, title_tamil: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="cat_display_order" className="text-sm font-semibold">Display Order</Label>
                        <Input
                            id="cat_display_order"
                            type="number"
                            placeholder="0"
                            value={formData.display_order || 0}
                            onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex items-center space-x-3 mt-6">
                        <Switch
                            id="cat_is_active"
                            checked={formData.is_active !== false}
                            onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label htmlFor="cat_is_active" className="text-sm font-semibold">
                            {formData.is_active !== false ? 'Active' : 'Inactive'}
                        </Label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        {formData.id ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// ShowForm Component
const ShowForm = ({ show, onSave, onCancel, categories }) => {
    const [formData, setFormData] = useState({
        title: '',
        title_tamil: '',
        poster_image_url: '',
        redirect_url: '',
        category_id: '',
        display_order: 0,
        open_in_new_tab: true,
        is_active: true,
        ...show
    });

    useEffect(() => {
        if (show) {
            setFormData(prev => ({ ...prev, ...show }));
        }
    }, [show]);

    const handleSave = async () => {
        if (!formData.title?.trim()) {
            toast.error("Show title (English) is required.");
            return;
        }
        if (!formData.poster_image_url?.trim()) {
            toast.error("Poster image is required.");
            return;
        }
        if (!formData.category_id) {
            toast.error("Please select a category.");
            return;
        }

        try {
            if (formData.id) {
                await CategoryShow.update(formData.id, formData);
                toast.success("Show updated successfully.");
            } else {
                await CategoryShow.create(formData);
                toast.success("Show created successfully.");
            }
            onSave();
        } catch (error) {
            console.error("Failed to save show:", error);
            toast.error("Failed to save show. Please try again.");
        }
    };

    return (
        <Card className="mt-4 border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-800">
                    {formData.id ? 'Edit Show' : 'Add New Show'}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="show_title" className="text-sm font-semibold">Show Title (English) *</Label>
                        <Input
                            id="show_title"
                            placeholder="e.g., Holy Mass"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="show_title_tamil" className="text-sm font-semibold">Show Title (Tamil)</Label>
                        <Input
                            id="show_title_tamil"
                            placeholder="திருப்பலி"
                            value={formData.title_tamil || ''}
                            onChange={e => setFormData({ ...formData, title_tamil: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                </div>

                <DualImageInput
                    label="Poster Image *"
                    value={formData.poster_image_url || ''}
                    onChange={(url) => setFormData({ ...formData, poster_image_url: url })}
                    placeholder="https://example.com/poster.jpg"
                />

                <div>
                    <Label htmlFor="show_redirect" className="text-sm font-semibold flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Redirect URL
                    </Label>
                    <Input
                        id="show_redirect"
                        placeholder="https://example.com/show"
                        value={formData.redirect_url || ''}
                        onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="show_category" className="text-sm font-semibold">Category *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="show_display_order" className="text-sm font-semibold">Display Order</Label>
                        <Input
                            id="show_display_order"
                            type="number"
                            placeholder="0"
                            value={formData.display_order || 0}
                            onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex items-center space-x-3 mt-6">
                        <Switch
                            id="show_open_new_tab"
                            checked={formData.open_in_new_tab !== false}
                            onCheckedChange={checked => setFormData({ ...formData, open_in_new_tab: checked })}
                        />
                        <Label htmlFor="show_open_new_tab" className="text-sm font-semibold">
                            Open in New Tab
                        </Label>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Switch
                        id="show_is_active"
                        checked={formData.is_active !== false}
                        onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="show_is_active" className="text-sm font-semibold">
                        {formData.is_active !== false ? 'Active' : 'Inactive'}
                    </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                        {formData.id ? 'Update Show' : 'Create Show'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// Categories Manager Component
const CategoriesManager = () => {
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await ShowCategory.list();
            setCategories(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setShowCategoryForm(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowCategoryForm(true);
    };

    const handleSaveSuccess = () => {
        setShowCategoryForm(false);
        setEditingCategory(null);
        loadCategories();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This will also delete all shows under this category.')) {
            try {
                await ShowCategory.delete(id);
                toast.success('Category deleted successfully');
                loadCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    return (
        <Card>
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Folder className="w-6 h-6" />
                            Categories Management
                        </CardTitle>
                        <p className="text-green-100 mt-1">Manage show categories and groupings</p>
                    </div>
                    <Button
                        onClick={handleAddNew}
                        className="bg-white text-green-600 hover:bg-green-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {showCategoryForm && (
                    <CategoryForm
                        category={editingCategory}
                        onSave={handleSaveSuccess}
                        onCancel={() => setShowCategoryForm(false)}
                    />
                )}

                {categories.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">No Categories Added Yet</h3>
                        <p className="mb-4">Create your first category to get started</p>
                        <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Category
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(category => (
                            <Card key={category.id} className={`border-2 transition-all duration-200 hover:shadow-lg ${category.is_active ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50'}`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">{category.title}</h3>
                                            {category.title_tamil && (
                                                <p className="text-sm text-gray-600 line-clamp-1">{category.title_tamil}</p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                                <span>Order: {category.display_order || 0}</span>
                                                <span className={`px-2 py-1 rounded ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(category)}
                                            className="flex-1"
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Shows Manager Component
const ShowsManager = () => {
    const [shows, setShows] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingShow, setEditingShow] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadShows();
        loadCategories();
    }, []);

    const loadShows = async () => {
        try {
            const data = await CategoryShow.list();
            setShows(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
        } catch (error) {
            console.error('Failed to load shows:', error);
            toast.error('Failed to load shows');
        }
    };

    const loadCategories = async () => {
        try {
            const data = await ShowCategory.filter({ is_active: true });
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleAddNew = () => {
        setEditingShow(null);
        setShowForm(true);
    };

    const handleEdit = (show) => {
        setEditingShow(show);
        setShowForm(true);
    };

    const handleSaveSuccess = () => {
        setShowForm(false);
        setEditingShow(null);
        loadShows();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this show?')) {
            try {
                await CategoryShow.delete(id);
                toast.success('Show deleted successfully');
                loadShows();
            } catch (error) {
                console.error('Failed to delete show:', error);
                toast.error('Failed to delete show');
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.title : 'Unknown Category';
    };

    return (
        <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Tv className="w-6 h-6" />
                            Shows Management
                        </CardTitle>
                        <p className="text-purple-100 mt-1">Manage individual shows and their details</p>
                    </div>
                    <Button
                        onClick={handleAddNew}
                        className="bg-white text-purple-600 hover:bg-purple-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Show
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {showForm && (
                    <ShowForm
                        show={editingShow}
                        onSave={handleSaveSuccess}
                        onCancel={() => setShowForm(false)}
                        categories={categories}
                    />
                )}

                {shows.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Tv className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="lg:text-lg font-semibold mb-2">No Shows Added Yet</h3>
                        <p className="mb-4">Create your first show to get started</p>
                        <Button onClick={handleAddNew} className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Show
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {shows.map(show => (
                            <Card key={show.id} className={`border-2 transition-all duration-200 hover:shadow-lg ${show.is_active ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200 bg-gray-50'}`}>
                                <CardContent className="p-4">
                                    <div className="aspect-[3/4] relative overflow-hidden rounded-lg mb-3">
                                        <img
                                            src={show.poster_image_url}
                                            alt={show.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwTDEwMCAxMjBaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                                            }}
                                        />
                                        {!show.is_active && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">INACTIVE</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2">{show.title}</h3>
                                        {show.title_tamil && (
                                            <p className="text-sm text-gray-600 line-clamp-1">{show.title_tamil}</p>
                                        )}
                                        <div className="text-xs text-gray-500">
                                            <div>Category: {getCategoryName(show.category_id)}</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span>Order: {show.display_order || 0}</span>
                                                {show.redirect_url && <Globe className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(show)}
                                            className="flex-1"
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(show.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function ShowCategoriesManager() {
    const [showsSettings, setShowsSettings] = useState({});
    const [localBackgroundUrl, setLocalBackgroundUrl] = useState(''); // State for background URL input

    useEffect(() => {
        loadPageData();
    }, []);

    // Effect to sync local state when settings are loaded from the database
    useEffect(() => {
        if (showsSettings.background_url) {
            setLocalBackgroundUrl(showsSettings.background_url.content_value || '');
        }
    }, [showsSettings.background_url]);

    const loadPageData = async () => {
        try {
            const settings = await WebsiteContent.filter({ section: 'shows_by_category' });
            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.content_key] = setting; // Store the entire object
            });
            setShowsSettings(settingsMap);
        } catch (error) {
            console.error('Failed to load shows settings:', error);
            toast.error('Failed to load section settings');
        }
    };

    const handleSaveSetting = async (key, value, tamilValue = null) => {
        let settingTitle;
        try {
            let contentType = 'text';
            if (key === 'background_url') {
                contentType = 'image';
                settingTitle = 'Background Image';
            } else if (key === 'section_title') {
                settingTitle = 'Section Title';
            } else if (key === 'section_description') {
                settingTitle = 'Section Description';
            } else {
                settingTitle = key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            }

            const existingSetting = showsSettings[key];

            const payload = {
                section: 'shows_by_category',
                content_key: key,
                content_type: contentType,
                title: settingTitle,
                content_value: value,
                content_value_tamil: tamilValue,
                is_active: true
            };

            if (existingSetting && existingSetting.id) {
                await WebsiteContent.update(existingSetting.id, payload);
                setShowsSettings(prev => ({
                    ...prev,
                    [key]: { ...existingSetting, ...payload }
                }));
                toast.success(`${settingTitle} updated successfully.`);
            } else {
                const newSetting = await WebsiteContent.create(payload);
                setShowsSettings(prev => ({
                    ...prev,
                    [key]: newSetting
                }));
                toast.success(`${settingTitle} saved successfully.`);
            }
        } catch (error) {
            console.error(`Failed to save ${settingTitle}:`, error);
            toast.error(`Failed to save ${settingTitle}. Please try again.`);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-slate-50 min-h-screen">
            <Card className="mb-6 shadow-lg border-l-4 border-red-600">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-800">Shows by Category Manager</CardTitle>
                    <CardDescription className="text-slate-600">
                        Manage the settings and content for the "Shows" section on the homepage.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Section Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                            <Label htmlFor="shows_section_title_en" className="text-sm font-semibold">Section Title (English)</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="shows_section_title_en"
                                    defaultValue={showsSettings.section_title?.content_value || 'SHOWS BY CATEGORY'}
                                    onBlur={(e) => handleSaveSetting('section_title', e.target.value, showsSettings.section_title?.content_value_tamil)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="shows_section_title_tamil" className="text-sm font-semibold">Section Title (Tamil)</Label>
                             <div className="flex gap-2 mt-1">
                                <Input
                                    id="shows_section_title_tamil"
                                    defaultValue={showsSettings.section_title?.content_value_tamil || 'வகை வாரியான நிகழ்ச்சிகள்'}
                                    onBlur={(e) => handleSaveSetting('section_title', showsSettings.section_title?.content_value, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="shows_section_description_en" className="text-sm font-semibold">Section Description (English)</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="shows_section_description_en"
                                    defaultValue={showsSettings.section_description?.content_value || ''}
                                    onBlur={(e) => handleSaveSetting('section_description', e.target.value, showsSettings.section_description?.content_value_tamil)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="shows_section_description_tamil" className="text-sm font-semibold">Section Description (Tamil)</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="shows_section_description_tamil"
                                    defaultValue={showsSettings.section_description?.content_value_tamil || ''}
                                    onBlur={(e) => handleSaveSetting('section_description', showsSettings.section_description?.content_value, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <CategoriesManager />
                <ShowsManager />
            </div>
        </div>
    );
}