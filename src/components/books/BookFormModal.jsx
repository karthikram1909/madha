import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Book } from '@/api/entities';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BookFormModal({ isOpen, onClose, book, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    title_tamil: '',
    description: '',
    description_tamil: '',
    author: '',
    author_tamil: '',
    price_inr: '',
    price_usd: '',
    stock_quantity: '',
    image_url: '',
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        title_tamil: book.title_tamil || '',
        description: book.description || '',
        description_tamil: book.description_tamil || '',
        author: book.author || '',
        author_tamil: book.author_tamil || '',
        price_inr: book.price_inr || '',
        price_usd: book.price_usd || '',
        stock_quantity: book.stock_quantity || '',
        image_url: book.image_url || '',
        is_active: book.is_active !== undefined ? book.is_active : true,
      });
      setImagePreview(book.image_url || '');
    } else {
      setFormData({
        title: '',
        title_tamil: '',
        description: '',
        description_tamil: '',
        author: '',
        author_tamil: '',
        price_inr: '',
        price_usd: '',
        stock_quantity: '',
        image_url: '',
        is_active: true,
      });
      setImagePreview('');
    }
  }, [book, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      setImagePreview(file_url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const dataToSave = {
        ...formData,
        price_inr: parseFloat(formData.price_inr) || 0,
        price_usd: parseFloat(formData.price_usd) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
      };

      if (book) {
        await Book.update(book.id, dataToSave);
        toast.success("Book updated successfully!");
      } else {
        await Book.create(dataToSave);
        toast.success("Book created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save book:", error);
      toast.error("Failed to save book.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label>Book Cover Image</Label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Book cover preview" 
                  className="w-40 h-56 object-cover rounded-lg shadow-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Upload Section - Always Show */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#B71C1C] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="book-image-upload"
                disabled={isUploading}
              />
              <label htmlFor="book-image-upload" className="cursor-pointer">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B71C1C]"></div>
                    <p className="text-sm text-slate-600">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-slate-400" />
                    <p className="text-sm text-slate-600">{imagePreview ? 'Upload new image' : 'Click to upload book cover image'}</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>

            <p className="text-xs text-slate-500">Or paste image URL below:</p>
            <Input
              name="image_url"
              value={formData.image_url}
              onChange={(e) => {
                handleChange(e);
                setImagePreview(e.target.value);
              }}
              placeholder="https://example.com/book-cover.jpg"
            />
          </div>

          <Tabs defaultValue="english" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="english">English Content</TabsTrigger>
              <TabsTrigger value="tamil">தமிழ் உள்ளடக்கம் (Tamil Content)</TabsTrigger>
            </TabsList>

            <TabsContent value="english" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Book Title (English) *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter book title in English"
                  required
                />
              </div>

              <div>
                <Label htmlFor="author">Author Name (English)</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter author name in English"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter book description in English"
                  rows={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="tamil" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title_tamil">புத்தகத்தின் தலைப்பு (Book Title in Tamil)</Label>
                <Input
                  id="title_tamil"
                  name="title_tamil"
                  value={formData.title_tamil}
                  onChange={handleChange}
                  placeholder="புத்தகத்தின் தலைப்பை தமிழில் உள்ளிடவும்"
                />
              </div>

              <div>
                <Label htmlFor="author_tamil">ஆசிரியர் பெயர் (Author Name in Tamil)</Label>
                <Input
                  id="author_tamil"
                  name="author_tamil"
                  value={formData.author_tamil}
                  onChange={handleChange}
                  placeholder="ஆசிரியர் பெயரை தமிழில் உள்ளிடவும்"
                />
              </div>

              <div>
                <Label htmlFor="description_tamil">விளக்கம் (Description in Tamil)</Label>
                <Textarea
                  id="description_tamil"
                  name="description_tamil"
                  value={formData.description_tamil}
                  onChange={handleChange}
                  placeholder="புத்தக விளக்கத்தை தமிழில் உள்ளிடவும்"
                  rows={5}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price_inr">Price in INR (₹) *</Label>
              <Input
                id="price_inr"
                name="price_inr"
                type="number"
                step="0.01"
                value={formData.price_inr}
                onChange={handleChange}
                placeholder="1000"
                required
              />
            </div>

            <div>
              <Label htmlFor="price_usd">Price in USD ($) *</Label>
              <Input
                id="price_usd"
                name="price_usd"
                type="number"
                step="0.01"
                value={formData.price_usd}
                onChange={handleChange}
                placeholder="12"
                required
              />
            </div>

            <div>
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={handleChange}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-slate-50 rounded-lg">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              <span className="font-medium">Active Status</span>
              <p className="text-sm text-slate-500">Make this book available for purchase on the website</p>
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
              {isSaving ? 'Saving...' : (book ? 'Update Book' : 'Create Book')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}