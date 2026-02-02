
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProgramImage } from '../utils/programImageMapper';

export default function ProgramForm({ program, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    title_tamil: "",
    description: "",
    description_tamil: "",
    schedule_date: "",
    schedule_time: "",
    duration_minutes: 60,
    category: "live_mass",
    category_tamil: "",
    program_image: "", // Added for program image
  });

  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title || "",
        title_tamil: program.title_tamil || "",
        description: program.description || "",
        description_tamil: program.description_tamil || "",
        schedule_date: program.schedule_date ? program.schedule_date.split('T')[0] : "",
        schedule_time: program.schedule_time || "",
        duration_minutes: program.duration_minutes || 60,
        category: program.category || "live_mass",
        category_tamil: program.category_tamil || "",
        program_image: program.program_image || "", // Set program image from existing program
      });
    } else {
      // Reset form for new program
      setFormData({
        title: "",
        title_tamil: "",
        description: "",
        description_tamil: "",
        schedule_date: "",
        schedule_time: "",
        duration_minutes: 60,
        category: "live_mass",
        category_tamil: "",
        program_image: "", // Reset program image for new program
      });
    }
  }, [program]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      
      // Auto-assign image when title changes (if no custom image is set)
      if (key === 'title' && !updated.program_image) {
        updated.program_image = getProgramImage(value);
      }
      
      return updated;
    });
  };

  const handleImageAssignment = () => {
    const autoImage = getProgramImage(formData.title);
    setFormData(prev => ({ ...prev, program_image: autoImage }));
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-900">
            {program ? 'Edit Program' : 'Schedule New Program'}
          </CardTitle>
          <Button 
            onClick={onCancel}
            variant="ghost"
            size="icon"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Program Name (English) *</label>
              <Input 
                value={formData.title} 
                onChange={(e) => handleChange('title', e.target.value)} 
                required 
                placeholder="e.g., Morning Mass"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Program Name (Tamil)</label>
              <Input 
                value={formData.title_tamil} 
                onChange={(e) => handleChange('title_tamil', e.target.value)} 
                placeholder="e.g., காலை திருப்பலி"
              />
            </div>
          </div>
          
          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <Input 
                type="date" 
                value={formData.schedule_date} 
                onChange={(e) => handleChange('schedule_date', e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
              <Input 
                type="time" 
                value={formData.schedule_time} 
                onChange={(e) => handleChange('schedule_time', e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live_mass">Live Mass</SelectItem>
                  <SelectItem value="devotional">Devotional</SelectItem>
                  <SelectItem value="rosary">Rosary</SelectItem>
                  <SelectItem value="bible_reflection">Bible Reflection</SelectItem>
                  <SelectItem value="special_event">Special Event</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
              <Input 
                type="number" 
                value={formData.duration_minutes} 
                onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value, 10))} 
                placeholder="e.g., 60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Program Image Filename</label>
              <Button 
                type="button"
                size="sm"
                variant="outline"
                onClick={handleImageAssignment}
                className="text-xs"
              >
                Auto-Assign
              </Button>
            </div>
            <Input 
              value={formData.program_image} 
              onChange={(e) => handleChange('program_image', e.target.value)} 
              placeholder="e.g., holy-mass.jpg"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional. Auto-assigned based on program title, or enter custom filename.
            </p>
            {formData.title && (
              <p className="text-xs text-blue-600 mt-1">
                Suggested: {getProgramImage(formData.title)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Add a short description for the program..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Tamil)</label>
              <Textarea 
                value={formData.description_tamil} 
                onChange={(e) => handleChange('description_tamil', e.target.value)}
                placeholder="நிகழ்ச்சிக்கான குறிப்பு..." 
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" className="bg-[#B71C1C] hover:bg-[#D32F2F]">
              <Save className="w-4 h-4 mr-2" />
              {program ? 'Update Program' : 'Save Program'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
