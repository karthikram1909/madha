import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Gallery } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

export default function UploadModal({ isOpen, setIsOpen, image, onUploadSuccess, categories = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    is_public: true,
    image_url: ''
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (image) {
      setFormData({
        title: image.title || '',
        description: image.description || '',
        category: image.category || (categories[0]?.name || ''),
        tags: image.tags?.join(', ') || '',
        is_public: image.is_public !== false,
        image_url: image.image_url || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: categories[0]?.name || '',
        tags: '',
        is_public: true,
        image_url: ''
      });
    }
  }, [image, isOpen, categories]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    let finalImageUrl = formData.image_url;

    if (file) {
      try {
        const { file_url } = await UploadFile({ file });
        finalImageUrl = file_url;
      } catch (error) {
        console.error("File upload failed:", error);
        alert("File upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
    }

    if (!finalImageUrl) {
        alert("Please upload an image file.");
        setIsUploading(false);
        return;
    }

    const payload = {
      ...formData,
      image_url: finalImageUrl,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      if (image?.id) {
        await Gallery.update(image.id, payload);
      } else {
        await Gallery.create(payload);
      }
      onUploadSuccess();
    } catch (error) {
      console.error("Failed to save gallery item:", error);
      alert("Failed to save. Please check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{image ? 'Edit Image' : 'Upload New Image'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="imageFile">Image File</Label>
            <Input id="imageFile" type="file" onChange={handleFileChange} accept="image/*" />
            {formData.image_url && !file && <p className="text-sm text-slate-500 mt-2">Current image: <a href={formData.image_url} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>}
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_public" checked={formData.is_public} onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })} />
            <Label htmlFor="is_public">Publicly Visible</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isUploading}>{isUploading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}