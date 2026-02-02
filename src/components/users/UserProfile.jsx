import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserProfile({ user, onUpdateUser, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  useEffect(() => {
    setEditedUser(user);
    setIsEditing(false);
  }, [user]);

  if (!user) {
    return (
      <Card className="bg-white shadow-lg border-0 sticky top-6">
        <CardContent className="p-12 text-center flex flex-col items-center justify-center h-full">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No User Selected</h3>
          <p className="text-slate-500">Select a user from the list to see their profile.</p>
        </CardContent>
      </Card>
    );
  }

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    onUpdateUser(user.id, editedUser);
    setIsEditing(false);
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isActive = user.status !== 'inactive';

  return (
    <Card className="bg-white shadow-lg border-0 sticky top-6">
       <CardHeader className="flex flex-row justify-between items-start border-b pb-4">
        <div>
            <CardTitle className="text-xl font-bold text-slate-900">User Profile</CardTitle>
            <CardDescription>Details and actions for this user</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
        </Button>
      </CardHeader>

      <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-lg">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] text-white font-bold text-3xl">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          {isEditing ? (
            <Input 
                value={editedUser.full_name} 
                onChange={(e) => handleInputChange('full_name', e.target.value)} 
                className="text-center text-xl font-bold"
            />
          ) : (
            <h2 className="text-2xl font-bold text-slate-900">{user.full_name}</h2>
          )}
          <p className="text-slate-500">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
            <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {isEditing ? (
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={editedUser.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input id="address1" value={editedUser.address_line_1 || ''} onChange={(e) => handleInputChange('address_line_1', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input id="address2" value={editedUser.address_line_2 || ''} onChange={(e) => handleInputChange('address_line_2', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={editedUser.city || ''} onChange={(e) => handleInputChange('city', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" value={editedUser.pincode || ''} onChange={(e) => handleInputChange('pincode', e.target.value)} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" value={editedUser.state || ''} onChange={(e) => handleInputChange('state', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={editedUser.country || ''} onChange={(e) => handleInputChange('country', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={editedUser.role} onValueChange={(v) => handleInputChange('role', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                            <Switch
                                checked={editedUser.status !== 'inactive'}
                                onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
                            />
                            <span className="text-sm">{editedUser.status !== 'inactive' ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={handleEditToggle}>Cancel</Button>
                    <Button onClick={handleSaveChanges}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="border-t pt-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /> <span>{user.email}</span></div>
                        <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /> <span>{user.phone || 'Not provided'}</span></div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Address</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                         <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" /> 
                            <span>
                                {user.address_line_1 || 'Not provided'}
                                {user.address_line_2 && `, ${user.address_line_2}`}
                                <br/>
                                {user.city && `${user.city}, `}{user.state && `${user.state} `}{user.pincode}
                                <br/>
                                {user.country}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Admin Actions</h4>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleEditToggle} size="sm"><Edit className="w-4 h-4 mr-2" /> Edit User</Button>
                        {/* Removed Reset Password button for security reasons */}
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}