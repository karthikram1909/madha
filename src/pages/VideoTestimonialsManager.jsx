
import React, { useState, useEffect, useRef } from 'react';
import { VideoTestimonial } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Video, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { UploadFile } from '@/api/integrations';

export default function VideoTestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const data = await VideoTestimonial.list('display_order');
      setTestimonials(data);
    } catch (error) {
      toast.error('Failed to load video testimonials.');
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTestimonial(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await VideoTestimonial.delete(id);
        toast.success('Testimonial deleted successfully.');
        loadTestimonials();
      } catch (error) {
        toast.error('Failed to delete testimonial.');
      }
    }
  };

  const TestimonialForm = ({ testimonial, onSave }) => {
    const [formData, setFormData] = useState(
      testimonial || {
        name: '',
        video_url: '',
        is_active: true,
        display_order: 0,
      }
    );
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleVideoUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const { file_url } = await UploadFile({ file });
        setFormData({ ...formData, video_url: file_url });
        toast.success("Video uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload video.");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      // Changed validation: name is now optional, only video_url is required
      if (!formData.video_url) {
        toast.error("Video file is required.");
        return;
      }
      try {
        if (testimonial) {
          await VideoTestimonial.update(testimonial.id, formData);
          toast.success('Testimonial updated.');
        } else {
          await VideoTestimonial.create(formData);
          toast.success('Testimonial created.');
        }
        onSave();
      } catch (error) {
        toast.error('Failed to save testimonial.');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* Changed label to indicate 'Name' is optional */}
          <Label htmlFor="name">Name (Optional)</Label>
          {/* Removed 'required' attribute from Input */}
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        
        <div>
          <Label htmlFor="video_url">Video File</Label>
          {!formData.video_url ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <span>{isUploading ? "Uploading..." : "Upload a video"}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleVideoUpload} accept="video/mp4,video/webm" disabled={isUploading} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">MP4, WEBM up to 50MB</p>
              </div>
            </div>
          ) : (
            <div className="mt-1 p-3 border border-green-200 bg-green-50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">Video uploaded successfully</span>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={formData.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-green-600 hover:text-green-800 underline"
                  >
                    View
                  </a>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700" 
                    onClick={() => setFormData({...formData, video_url: ''})}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onSave()}>Cancel</Button>
          <Button type="submit" disabled={isUploading}>Save</Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Video Testimonials</CardTitle>
            <Button onClick={handleAddNew} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>{testimonial.name || 'Untitled'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${testimonial.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {testimonial.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>{testimonial.display_order}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(testimonial.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Video Testimonial' : 'Add Video Testimonial'}
              </DialogTitle>
            </DialogHeader>
            <TestimonialForm
              testimonial={editingTestimonial}
              onSave={() => {
                setIsDialogOpen(false);
                setEditingTestimonial(null);
                loadTestimonials();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
