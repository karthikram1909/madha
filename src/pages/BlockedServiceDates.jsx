import React, { useState, useEffect } from 'react';
import { BlockedServiceDate, HomepageService } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function BlockedServiceDates() {
    const [services, setServices] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        blocked_date: null,
        reason: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [servicesData, blockedData] = await Promise.all([
                HomepageService.filter({ is_active: true }, 'display_order'),
                BlockedServiceDate.filter({ is_active: true }, '-blocked_date')
            ]);
            setServices(servicesData);
            setBlockedDates(blockedData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        }
        setIsLoading(false);
    };

    const handleAddBlockedDate = async () => {
        if (!selectedService || !formData.blocked_date) {
            toast.error('Please select service and date');
            return;
        }

        try {
            await BlockedServiceDate.create({
                service_type: selectedService,
                blocked_date: format(formData.blocked_date, 'yyyy-MM-dd'),
                reason: formData.reason || 'Date blocked by admin',
                is_active: true
            });

            toast.success('Date blocked successfully');
            setShowAddDialog(false);
            setFormData({ blocked_date: null, reason: '' });
            loadData();
        } catch (error) {
            console.error('Error adding blocked date:', error);
            toast.error('Failed to block date');
        }
    };

    const handleDeleteBlockedDate = async (id) => {
        if (!confirm('Are you sure you want to unblock this date?')) return;

        try {
            await BlockedServiceDate.delete(id);
            toast.success('Date unblocked successfully');
            loadData();
        } catch (error) {
            console.error('Error deleting blocked date:', error);
            toast.error('Failed to unblock date');
        }
    };

    const getServiceName = (serviceType) => {
        const service = services.find(s => s.title.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_$/, '') === serviceType);
        return service?.title || serviceType;
    };

    const groupedBlockedDates = blockedDates.reduce((acc, date) => {
        if (!acc[date.service_type]) {
            acc[date.service_type] = [];
        }
        acc[date.service_type].push(date);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Blocked Service Dates</h1>
                    <p className="text-slate-600 mt-2">Manage dates when services cannot be booked</p>
                </div>
                <Button 
                    onClick={() => setShowAddDialog(true)}
                    className="bg-[#B71C1C] hover:bg-[#8B0000]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Block New Date
                </Button>
            </div>

            <div className="grid gap-6">
                {services.map((service) => {
                    const serviceKey = service.title.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_$/, '');
                    const serviceDates = groupedBlockedDates[serviceKey] || [];

                    return (
                        <Card key={service.id} className="shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl">{service.title}</CardTitle>
                                    <Badge variant="secondary">
                                        {serviceDates.length} blocked dates
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {serviceDates.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>No blocked dates for this service</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {serviceDates.map((blockedDate) => (
                                            <motion.div
                                                key={blockedDate.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="w-5 h-5 text-[#B71C1C]" />
                                                        <span className="font-semibold">
                                                            {format(new Date(blockedDate.blocked_date), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteBlockedDate(blockedDate.id)}
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {blockedDate.reason && (
                                                    <p className="text-sm text-slate-600 mt-2">
                                                        {blockedDate.reason}
                                                    </p>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Add Blocked Date Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Block Service Date</DialogTitle>
                        <DialogDescription>
                            Select a service and date to prevent bookings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <Label>Service</Label>
                            <Select value={selectedService} onValueChange={setSelectedService}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map((service) => {
                                        const serviceKey = service.title.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_$/, '');
                                        return (
                                            <SelectItem key={service.id} value={serviceKey}>
                                                {service.title}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Date to Block</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.blocked_date ? format(formData.blocked_date, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.blocked_date}
                                        onSelect={(date) => setFormData({ ...formData, blocked_date: date })}
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label>Reason (Optional)</Label>
                            <Input
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="e.g., Priest on leave, Already scheduled"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleAddBlockedDate}
                                className="bg-[#B71C1C] hover:bg-[#8B0000]"
                            >
                                Block Date
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}