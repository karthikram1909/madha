import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Search, RefreshCw, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageBanner from '@/components/website/PageBanner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function UserDataVerification() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        loadVerificationData();
    }, []);

    const loadVerificationData = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('getUserVerificationData');
            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                console.error('Error loading verification data:', response.data.error);
            }
        } catch (error) {
            console.error('Error loading verification data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: users.length,
        linked: users.filter(u => u.isLinked).length,
        unlinked: users.filter(u => !u.isLinked).length,
        complete: users.filter(u => u.status === 'complete').length,
        incomplete: users.filter(u => u.status === 'incomplete').length,
        totalLegacyBookings: users.reduce((sum, u) => sum + u.legacyBookingsCount, 0),
        totalServiceBookings: users.reduce((sum, u) => sum + u.serviceBookingsCount, 0)
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'complete': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'incomplete': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
            case 'unlinked': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            complete: 'bg-green-100 text-green-800',
            incomplete: 'bg-amber-100 text-amber-800',
            unlinked: 'bg-red-100 text-red-800'
        };
        const labels = {
            complete: 'Fully Linked',
            incomplete: 'Profile Incomplete',
            unlinked: 'Not Linked'
        };
        return <Badge className={variants[status]}>{labels[status]}</Badge>;
    };

    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowDetails(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Loading verification data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PageBanner 
                pageKey="user_management"
                title="User Data Verification"
                description="Verify user linking status and data completeness"
            />

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-slate-600">Total Users</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.linked}</div>
                            <div className="text-sm text-slate-600">Linked</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.unlinked}</div>
                            <div className="text-sm text-slate-600">Unlinked</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
                            <div className="text-sm text-slate-600">Complete</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-amber-600">{stats.incomplete}</div>
                            <div className="text-sm text-slate-600">Incomplete</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{stats.totalLegacyBookings}</div>
                            <div className="text-sm text-slate-600">Legacy Bookings</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-indigo-600">{stats.totalServiceBookings}</div>
                            <div className="text-sm text-slate-600">New Bookings</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Refresh */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>User Verification List</CardTitle>
                            <Button onClick={loadVerificationData} variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by email or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">Status</th>
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Email</th>
                                        <th className="text-left p-3 font-semibold">Phone</th>
                                        <th className="text-center p-3 font-semibold">Legacy ID</th>
                                        <th className="text-center p-3 font-semibold">Legacy Bookings</th>
                                        <th className="text-center p-3 font-semibold">New Bookings</th>
                                        <th className="text-center p-3 font-semibold">Total</th>
                                        <th className="text-center p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b hover:bg-slate-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(user.status)}
                                                    {getStatusBadge(user.status)}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium">{user.full_name}</td>
                                            <td className="p-3 text-slate-600">{user.email}</td>
                                            <td className="p-3 text-slate-600">{user.phone || '-'}</td>
                                            <td className="p-3 text-center">
                                                {user.appUser?.legacy_user_id ? (
                                                    <Badge variant="outline">{user.appUser.legacy_user_id}</Badge>
                                                ) : '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Badge className="bg-purple-100 text-purple-800">
                                                    {user.legacyBookingsCount}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Badge className="bg-indigo-100 text-indigo-800">
                                                    {user.serviceBookingsCount}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    {user.totalBookings}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    onClick={() => viewUserDetails(user)}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                No users found matching your search.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* User Details Modal */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(selectedUser.status)}
                                {getStatusBadge(selectedUser.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                    <p className="text-slate-900">{selectedUser.full_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Email</label>
                                    <p className="text-slate-900">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Phone</label>
                                    <p className="text-slate-900">{selectedUser.phone || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Role</label>
                                    <p className="text-slate-900">{selectedUser.role}</p>
                                </div>
                            </div>

                            {selectedUser.appUser && (
                                <>
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold mb-3">AppUser Link</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700">Legacy User ID</label>
                                                <p className="text-slate-900">{selectedUser.appUser.legacy_user_id}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700">Base44 User ID</label>
                                                <p className="text-slate-900 text-xs">{selectedUser.appUser.base44_user_id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold mb-3">Address</h3>
                                        <div className="space-y-2">
                                            <p className="text-slate-900">{selectedUser.address_line_1 || 'Not set'}</p>
                                            {selectedUser.address_line_2 && <p className="text-slate-900">{selectedUser.address_line_2}</p>}
                                            <p className="text-slate-900">
                                                {[selectedUser.city, selectedUser.state, selectedUser.pincode].filter(Boolean).join(', ') || 'Not set'}
                                            </p>
                                            <p className="text-slate-900">{selectedUser.country || 'Not set'}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Booking Statistics</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-purple-50 p-3 rounded">
                                        <div className="text-2xl font-bold text-purple-600">{selectedUser.legacyBookingsCount}</div>
                                        <div className="text-sm text-slate-600">Legacy Bookings</div>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded">
                                        <div className="text-2xl font-bold text-indigo-600">{selectedUser.serviceBookingsCount}</div>
                                        <div className="text-sm text-slate-600">New Bookings</div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded">
                                        <div className="text-2xl font-bold text-blue-600">{selectedUser.totalBookings}</div>
                                        <div className="text-sm text-slate-600">Total Bookings</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}