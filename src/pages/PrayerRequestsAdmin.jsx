import React, { useState, useEffect } from 'react';
import { PrayerRequest } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { HeartHandshake, Mail, Phone, Send, Loader } from 'lucide-react';

export default function PrayerRequestsAdmin() {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isReplying, setIsReplying] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchRequests();
        fetchCurrentUser();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await PrayerRequest.list('-created_date');
            setRequests(data);
        } catch (error) {
            toast.error("Failed to fetch prayer requests.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchCurrentUser = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);
        } catch (error) {
            console.error("Failed to fetch current user", error);
        }
    }

    const handleReplyClick = (request) => {
        setSelectedRequest(request);
        setReplyMessage('');
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim()) {
            toast.error("Reply message cannot be empty.");
            return;
        }
        setIsReplying(true);
        try {
            await PrayerRequest.update(selectedRequest.id, {
                reply_message: replyMessage,
                status: 'replied',
                replied_at: new Date().toISOString(),
                replied_by: currentUser?.email || 'admin'
            });
            toast.success("Reply sent successfully!");
            setSelectedRequest(null);
            fetchRequests(); // Refresh list
        } catch (error) {
            toast.error("Failed to send reply.");
            console.error(error);
        } finally {
            setIsReplying(false);
        }
    };
    
    const formatDateSafe = (dateString) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, h:mm a");
        } catch {
            return 'Invalid Date';
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen p-6">
            <Card className="max-w-7xl mx-auto shadow-lg">
                <CardHeader className="bg-slate-100 border-b">
                    <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                        <HeartHandshake className="w-8 h-8 text-red-600" />
                        Prayer Requests Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 animate-spin text-red-600" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Requester</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell className="text-sm text-slate-500 whitespace-nowrap">{formatDateSafe(req.created_date)}</TableCell>
                                            <TableCell>
                                                <p className="font-semibold">{req.requester_name}</p>
                                                <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                                                    <Mail className="w-3 h-3" /> {req.requester_email}
                                                </div>
                                                <div className="text-xs text-slate-600 flex items-center gap-2">
                                                    <Phone className="w-3 h-3" /> {req.requester_phone || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-sm">
                                                <p className="line-clamp-3 text-slate-700">{req.message}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={req.status === 'replied' ? 'default' : 'secondary'} className={req.status === 'replied' ? 'bg-green-600' : ''}>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleReplyClick(req)} size="sm">
                                                    {req.status === 'replied' ? 'View/Edit Reply' : 'Reply'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Reply to Prayer Request</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-slate-100 rounded-lg">
                            <p className="font-semibold">{selectedRequest?.requester_name}</p>
                            <p className="text-sm text-slate-600">{selectedRequest?.message}</p>
                        </div>
                        <Textarea
                            placeholder="Type your reply here..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows={6}
                        />
                        {selectedRequest?.status === 'replied' && (
                             <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500 text-sm">
                                <p className="font-semibold">Previous Reply:</p>
                                <p className="text-slate-600">{selectedRequest.reply_message}</p>
                                <p className="text-xs text-slate-400 mt-1">by {selectedRequest.replied_by} on {formatDateSafe(selectedRequest.replied_at)}</p>
                             </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                        <Button onClick={handleSendReply} disabled={isReplying}>
                            {isReplying && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            <Send className="mr-2 h-4 w-4" />
                            Send Reply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}