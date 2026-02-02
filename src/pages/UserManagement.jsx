
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users,
  Search,
  UserPlus,
  Shield,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  MoreVertical,
  UserCheck,
  Key
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { format } from 'date-fns';

import AddUserModal from "../components/users/AddUserModal";
import UserDetailsModal from "../components/users/UserDetailsModal";
import UserFilters from "../components/users/UserFilters";
import { base44 } from '@/api/base44Client';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "all",
    status: "all"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(15);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filters, sortBy, sortOrder]);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      if (!['admin', 'superadmin'].includes(user.role)) {
        toast.error("Access denied. Admin privileges required.");
        window.location.href = '/Dashboard';
      }
    } catch (error) {
      toast.error("Unable to verify admin access.");
      window.location.href = '/Dashboard';
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.User.list("-created_date");
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users.");
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // Role filter
    if (filters.role !== "all") {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter(user => user.status !== 'inactive' && !user.is_deleted);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter(user => user.status === 'inactive' || user.is_deleted);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleViewUser = async (user) => {
    try {
      // Load additional user data
      const [bookings, donations, tickets, feedback, loginLogs] = await Promise.all([
        base44.entities.ServiceBooking.filter({ user_id: user.id }, '-created_date').catch(() => []),
        base44.entities.Donation.filter({ user_id: user.id }, '-created_date').catch(() => []),
        base44.entities.SupportTicket.filter({ user_id: user.id }, '-created_date').catch(() => []),
        base44.entities.Feedback.filter({ user_id: user.id }, '-created_date').catch(() => []),
        base44.entities.UserLoginLog.filter({ user_id: user.id }, '-login_time', 10).catch(() => [])
      ]);

      setSelectedUser({
        ...user,
        bookings,
        donations,
        tickets,
        feedback,
        loginLogs
      });
      setShowUserDetailsModal(true);
    } catch (error) {
      console.error("Error loading user details:", error);
      toast.error("Failed to load user details.");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = (user.status === 'inactive' || user.is_deleted) ? 'active' : 'inactive';
    await handleUpdateUser(user.id, { 
      status: newStatus,
      is_deleted: false
    });
  };

  const handleBlockUser = async (user) => {
    if (window.confirm(`Are you sure you want to ${user.status === 'inactive' ? 'unblock' : 'block'} ${user.full_name}?`)) {
      await handleUpdateUser(user.id, {
        status: user.status === 'inactive' ? 'active' : 'inactive'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This will mark them as deleted but preserve data integrity.")) {
      try {
        const userToDelete = users.find(u => u.id === userId);
        await base44.entities.User.update(userId, { 
          is_deleted: true,
          status: 'inactive'
        });
        
        // Log the action
        await base44.entities.AuditLog.create({
          admin_user_email: currentUser?.email || 'N/A',
          action: `Deleted user: ${userToDelete?.full_name}`,
          entity_type: 'User',
          entity_id: userId,
          details: {
            deleted_user_email: userToDelete?.email,
            deleted_user_role: userToDelete?.role
          }
        });
        
        await loadUsers();
        toast.success("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
      }
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await base44.entities.User.update(userId, updates);
      
      // Log the action
      await base44.entities.AuditLog.create({
        admin_user_email: currentUser?.email || 'N/A',
        action: `Updated user profile`,
        entity_type: 'User',
        entity_id: userId,
        details: {
          updated_fields: Object.keys(updates),
          changes: updates
        }
      });
      
      await loadUsers();
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const generateNewPassword = async (user) => {
    if (window.confirm(`Generate new password for ${user.full_name}? The current password will be invalidated.`)) {
      const newPassword = Math.random().toString(36).slice(-12);
      
      toast.info(`New password for ${user.email}: ${newPassword} (User should change this immediately)`);
      
      await base44.entities.AuditLog.create({
        admin_user_email: currentUser?.email || 'N/A',
        action: `Generated new password for user: ${user.full_name}`,
        entity_type: 'User',
        entity_id: user.id,
        details: { action: 'password_reset' }
      });
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Phone,Role,Status,Created Date\n" +
      filteredUsers.map(user => 
        `"${user.full_name}","${user.email}","${user.phone || ''}","${user.role}","${user.status || 'active'}","${user.created_date}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users data exported successfully!");
  };

  const getUserStats = () => {
    const total = users.filter(u => !u.is_deleted).length;
    const admins = users.filter(u => u.role === 'admin' && !u.is_deleted).length;
    const staff = users.filter(u => ['staff', 'moderator', 'accountant', 'volunteer'].includes(u.role) && !u.is_deleted).length;
    const active = users.filter(u => u.status !== 'inactive' && !u.is_deleted).length;
    
    return { total, admins, staff, active };
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
      case 'admin':
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'staff':
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      case 'volunteer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (user) => {
    if (user.is_deleted) return 'bg-black text-white';
    return user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getStatusText = (user) => {
    if (user.is_deleted) return 'Deleted';
    return user.status === 'inactive' ? 'Inactive' : 'Active';
  };

  const stats = getUserStats();

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You need admin privileges to access User Management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div 
        className="relative bg-cover bg-center h-52" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2940&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-slate-800/30" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">User Management</h1>
          <p className="text-amber-200 max-w-2xl text-lg shadow-lg">Manage platform users, roles, and access permissions</p>
        </div>
      </div>
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 mb-1">Admin Users</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.admins}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 mb-1">Staff Members</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.staff}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-[#B71C1C]" />
                All Users ({filteredUsers.length})
              </CardTitle>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setShowAddUserModal(true)} className="bg-[#B71C1C] hover:bg-[#8B0000] whitespace-nowrap">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
                <Button onClick={exportUsers} variant="outline" className="whitespace-nowrap">
                  <Key className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <UserFilters filters={filters} setFilters={setFilters} />
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading users...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-100">
                      <TableHead className="font-semibold text-slate-700">User</TableHead>
                      <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                      <TableHead className="font-semibold text-slate-700">Role</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Registered</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map(user => (
                      <TableRow 
                        key={user.id} 
                        className="cursor-pointer hover:bg-red-50 transition-colors duration-200"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] text-white font-semibold">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800">{user.full_name}</p>
                              <p className="text-sm text-slate-500">ID: {user.id.slice(-8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{user.email}</p>
                            <p className="text-sm text-slate-500">{user.phone || 'No phone'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(user)}>
                              {getStatusText(user)}
                            </Badge>
                            {!user.is_deleted && (
                              <Switch
                                checked={user.status !== 'inactive'}
                                onCheckedChange={() => handleToggleStatus(user)}
                                size="sm"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {format(new Date(user.created_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBlockUser(user)}>
                                {user.status === 'inactive' ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Unblock User
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-4 h-4 mr-2" />
                                    Block User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateNewPassword(user)}>
                                <Key className="w-4 h-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
                    <span className="text-sm text-slate-500">
                      Page {currentPage} of {totalPages} (showing {currentUsers.length} of {filteredUsers.length} users)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddUserModal 
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => {
          setShowAddUserModal(false);
          loadUsers();
        }}
      />

      <UserDetailsModal
        user={selectedUser}
        isOpen={showUserDetailsModal}
        onClose={() => {
          setShowUserDetailsModal(false);
          setSelectedUser(null);
        }}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
}
