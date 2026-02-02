import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function UserList({ users, isLoading, onSelectUser, selectedUser }) {

    if (isLoading) {
        return (
            <div className="p-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (users.length === 0) {
        return <p className="text-center text-slate-500 p-10">No users found.</p>;
    }

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    }

    const getVerificationStatus = (user) => {
        const sms = user.sms_verified;
        const wa = user.whatsapp_verified;
        if (sms && wa) return { text: "Fully Verified", icon: <CheckCircle className="w-4 h-4 text-green-500" />};
        if (sms || wa) return { text: "Partially Verified", icon: <CheckCircle className="w-4 h-4 text-yellow-500" />};
        return { text: "Not Verified", icon: <AlertTriangle className="w-4 h-4 text-red-500" />};
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Total Donations</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => {
                    const verification = getVerificationStatus(user);
                    return (
                        <TableRow 
                            key={user.id} 
                            onClick={() => onSelectUser(user)}
                            className={`cursor-pointer hover:bg-slate-50 ${selectedUser?.id === user.id ? 'bg-red-50' : ''}`}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        {/* Assuming user has an avatar_url field */}
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-slate-800">{user.full_name}</p>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{user.user_type}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {verification.icon}
                                    <span className="text-sm text-slate-600">{verification.text}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                ₹{user.total_donations || 0}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}