import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { inviteUser } from '@/api/functions';
import { toast } from 'sonner';

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: 'user',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        status: 'active'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            role: 'user',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            status: 'active'
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await inviteUser(formData);
            
            if (data.success) {
                toast.success(`User invitation prepared for ${formData.full_name}! ${data.instructions}`);
                
                // Show temporary password info
                if (data.temporary_password) {
                    toast.info(`Temporary password: ${data.temporary_password} (User should change on first login)`);
                }
                
                onSuccess();
            } else {
                toast.error(data.error || 'Failed to create user invitation');
            }
            
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Failed to create user invitation. Please try again.');
        }

        setIsLoading(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-[#B71C1C]" />
                        Add New User
                    </DialogTitle>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700">
                            This will prepare user profile information. You may need to manually invite the user through the platform's standard invitation process.
                        </p>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                placeholder="Enter full name"
                                className={errors.full_name ? 'border-red-500' : ''}
                            />
                            {errors.full_name && (
                                <p className="text-sm text-red-500">{errors.full_name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter email address"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter phone number"
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">{errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select 
                                value={formData.role} 
                                onValueChange={(value) => handleInputChange('role', value)}
                            >
                                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select user role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-500">{errors.role}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address_line_1">Address Line 1</Label>
                        <Input
                            id="address_line_1"
                            value={formData.address_line_1}
                            onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                            placeholder="Enter address line 1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address_line_2">Address Line 2</Label>
                        <Input
                            id="address_line_2"
                            value={formData.address_line_2}
                            onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                            placeholder="Enter address line 2 (optional)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="Enter city"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => handleInputChange('state', e.target.value)}
                                placeholder="Enter state"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                                id="pincode"
                                value={formData.pincode}
                                onChange={(e) => handleInputChange('pincode', e.target.value)}
                                placeholder="Enter pincode"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            placeholder="Enter country"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-[#B71C1C] hover:bg-[#8B0000]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Preparing User...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Prepare User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}