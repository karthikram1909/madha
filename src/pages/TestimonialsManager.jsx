import React, { useState, useEffect } from 'react';
import { Testimonial } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  MessageSquare,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DualImageInput from '../components/ui/dual-image-input';

const TestimonialForm = ({ testimonial, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_tamil: '',
    text: '',
    text_tamil: '',
    rating: 5,
    image_url: '',
    is_active: true,
    display_order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setFormData(testimonial);
    } else {
      setFormData({
        name: '',
        name_tamil: '',
        text: '',
        text_tamil: '',
        rating: 5,
        image_url: '',
        is_active: true,
        display_order: 0
      });
    }
  }, [testimonial, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (testimonial?.id) {
        await Testimonial.update(testimonial.id, formData);
        toast.success('Testimonial updated successfully!');
      } else {
        await Testimonial.create(formData);
        toast.success('Testimonial created successfully!');
      }
      onSave();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name (English)*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="name_tamil">Name (Tamil)</Label>
              <Input
                id="name_tamil"
                value={formData.name_tamil}
                onChange={(e) => setFormData({ ...formData, name_tamil: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="text">Review Text (English)*</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="text_tamil">Review Text (Tamil)</Label>
            <Textarea
              id="text_tamil"
              value={formData.text_tamil}
              onChange={(e) => setFormData({ ...formData, text_tamil: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Star Rating*</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: num })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        num <= formData.rating
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DualImageInput
            label="Profile Image"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            placeholder="Enter image URL or upload file"
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active (visible on website)</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (testimonial ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const data = await Testimonial.list('display_order');
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error('Failed to load testimonials');
    }
    setIsLoading(false);
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setShowForm(true);
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  const handleDelete = async (testimonial) => {
    if (window.confirm(`Are you sure you want to delete the testimonial from "${testimonial.name}"?`)) {
      try {
        await Testimonial.delete(testimonial.id);
        toast.success('Testimonial deleted successfully!');
        loadTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error('Failed to delete testimonial');
      }
    }
  };

  const handleToggleActive = async (testimonial) => {
    try {
      await Testimonial.update(testimonial.id, { is_active: !testimonial.is_active });
      toast.success(`Testimonial ${testimonial.is_active ? 'deactivated' : 'activated'} successfully!`);
      loadTestimonials();
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      toast.error('Failed to update testimonial status');
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingTestimonial(null);
    loadTestimonials();
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div 
        className="relative bg-cover bg-center h-52" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Testimonials Manager</h1>
          <p className="text-red-100 max-w-2xl text-lg shadow-lg">Manage customer testimonials and reviews displayed on your website</p>
        </div>
      </div>
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Testimonials</p>
                <p className="text-3xl font-bold text-slate-900">{testimonials.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Testimonials</p>
                <p className="text-3xl font-bold text-slate-900">{testimonials.filter(t => t.is_active).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-slate-900">
                  {testimonials.length > 0 
                    ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#B71C1C]" />
                Testimonials Management
              </CardTitle>
              <Button onClick={handleAdd} className="bg-[#B71C1C] hover:bg-[#8B0000]">
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading testimonials...</div>
            ) : testimonials.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No testimonials found. Add your first testimonial to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="relative">
                          <img
                            src={testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=B71C1C&color=fff&size=64`}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                          />
                          {!testimonial.is_active && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <X className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{testimonial.name}</h3>
                            <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                              {testimonial.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating
                                    ? 'text-amber-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm text-slate-500">
                              ({testimonial.rating}/5)
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            "{testimonial.text}"
                          </p>
                          {testimonial.name_tamil && (
                            <p className="text-slate-500 text-xs mt-1">
                              Tamil name: {testimonial.name_tamil}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(testimonial)}
                        >
                          {testimonial.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(testimonial)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(testimonial)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TestimonialForm
        testimonial={editingTestimonial}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTestimonial(null);
        }}
        onSave={handleFormSave}
      />
    </div>
  );
}