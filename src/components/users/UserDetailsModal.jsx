import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Calendar, 
  DollarSign,
  HeadphonesIcon,
  MessageSquare,
  Clock,
  Edit,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UserDetailsModal({ user, isOpen, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

  if (!user) return null;

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
      case 'admin':
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'staff':
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      case 'volunteer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate(user.id, {
        full_name: editedUser.full_name,
        phone: editedUser.phone,
        role: editedUser.role,
        address_line_1: editedUser.address_line_1,
        address_line_2: editedUser.address_line_2,
        city: editedUser.city,
        state: editedUser.state,
        pincode: editedUser.pincode,
        country: editedUser.country,
        status: editedUser.status
      });
      setIsEditing(false);
      toast.success("User updated successfully!");
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#B71C1C]" />
              User Profile: {user.full_name}
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] text-white font-bold text-2xl">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <Input 
                    value={editedUser.full_name || ''} 
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="text-center font-bold text-lg mb-2"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{user.full_name}</h3>
                )}
                
                <p className="text-slate-500 mb-4">{user.email}</p>
                
                <div className="flex flex-col gap-2 mb-4">
                  {isEditing ? (
                    <Select 
                      value={editedUser.role || ''} 
                      onValueChange={(value) => handleInputChange('role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  )}
                  
                  <Badge className={user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {user.status === 'inactive' ? 'Inactive' : 'Active'}
                  </Badge>
                </div>

                <div className="text-sm text-slate-500 mb-4">
                  <p>Joined: {format(new Date(user.created_date), 'MMM d, yyyy')}</p>
                  <p>ID: {user.id.slice(-12)}</p>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} size="sm" className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="flex-1">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    Bookings
                  </span>
                  <span className="font-semibold">{user.bookings?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    Donations
                  </span>
                  <span className="font-semibold">{user.donations?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <HeadphonesIcon className="w-4 h-4" />
                    Support Tickets
                  </span>
                  <span className="font-semibold">{user.tickets?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <MessageSquare className="w-4 h-4" />
                    Feedback
                  </span>
                  <span className="font-semibold">{user.feedback?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="donations">Donations</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        {isEditing ? (
                          <Input 
                            value={editedUser.full_name || ''} 
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                          />
                        ) : (
                          <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                        )}
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        {isEditing ? (
                          <Input 
                            value={editedUser.phone || ''} 
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        ) : (
                          <p className="text-sm font-medium text-slate-900">{user.phone || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label>Role</Label>
                        {isEditing ? (
                          <Select 
                            value={editedUser.role || ''} 
                            onValueChange={(value) => handleInputChange('role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="accountant">Accountant</SelectItem>
                              <SelectItem value="volunteer">Volunteer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-3">
                      <Label>Address</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {isEditing ? (
                          <>
                            <Input 
                              placeholder="Address Line 1"
                              value={editedUser.address_line_1 || ''} 
                              onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                            />
                            <Input 
                              placeholder="Address Line 2"
                              value={editedUser.address_line_2 || ''} 
                              onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                            />
                            <div className="grid grid-cols-3 gap-3">
                              <Input 
                                placeholder="City"
                                value={editedUser.city || ''} 
                                onChange={(e) => handleInputChange('city', e.target.value)}
                              />
                              <Input 
                                placeholder="State"
                                value={editedUser.state || ''} 
                                onChange={(e) => handleInputChange('state', e.target.value)}
                              />
                              <Input 
                                placeholder="Pincode"
                                value={editedUser.pincode || ''} 
                                onChange={(e) => handleInputChange('pincode', e.target.value)}
                              />
                            </div>
                            <Input 
                              placeholder="Country"
                              value={editedUser.country || ''} 
                              onChange={(e) => handleInputChange('country', e.target.value)}
                            />
                          </>
                        ) : (
                          <div className="text-sm text-slate-700">
                            {user.address_line_1 && <p>{user.address_line_1}</p>}
                            {user.address_line_2 && <p>{user.address_line_2}</p>}
                            {(user.city || user.state || user.pincode) && (
                              <p>{user.city}, {user.state} {user.pincode}</p>
                            )}
                            {user.country && <p>{user.country}</p>}
                            {!user.address_line_1 && <p className="text-slate-500">No address provided</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Account Status</Label>
                        <p className="text-sm text-slate-500">Control user access to the platform</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={editedUser.status !== 'inactive'}
                          onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
                        />
                      ) : (
                        <Badge className={user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {user.status === 'inactive' ? 'Inactive' : 'Active'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Service Bookings ({user.bookings?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.bookings && user.bookings.length > 0 ? (
                      <div className="space-y-3">
                        {user.bookings.slice(0, 10).map(booking => (
                          <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">{booking.service_type?.replace('_', ' ')}</p>
                              <p className="text-sm text-slate-500">
                                {booking.beneficiary_name} • {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">₹{booking.amount}</p>
                              <Badge className={booking.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {booking.payment_status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">No bookings found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="donations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Donations ({user.donations?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.donations && user.donations.length > 0 ? (
                      <div className="space-y-3">
                        {user.donations.slice(0, 10).map(donation => (
                          <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">₹{donation.amount}</p>
                              <p className="text-sm text-slate-500">
                                {donation.donation_type} • {format(new Date(donation.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge className={donation.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {donation.payment_status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">No donations found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HeadphonesIcon className="w-5 h-5" />
                      Support Tickets ({user.tickets?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.tickets && user.tickets.length > 0 ? (
                      <div className="space-y-3">
                        {user.tickets.slice(0, 10).map(ticket => (
                          <div key={ticket.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-slate-900">{ticket.subject}</p>
                              <Badge className={
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {ticket.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>
                            <p className="text-xs text-slate-500">{format(new Date(ticket.created_date), 'MMM d, yyyy')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">No support tickets found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Login Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.loginLogs && user.loginLogs.length > 0 ? (
                      <div className="space-y-3">
                        {user.loginLogs.map(log => (
                          <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">
                                {format(new Date(log.login_time), 'MMM d, yyyy h:mm a')}
                              </p>
                              <p className="text-sm text-slate-500">
                                {log.ip_address} • {log.device_type}
                              </p>
                            </div>
                            <Badge className={log.login_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {log.login_status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">No login activity found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}