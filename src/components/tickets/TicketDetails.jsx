import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Clock, 
  Send,
  Loader2,
  Bookmark,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { User as UserEntity, AuditLog } from '@/api/entities';
import { toast } from 'sonner';

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'urgent': return 'bg-red-500 text-white';
        case 'high': return 'bg-orange-500 text-white';
        case 'medium': return 'bg-yellow-400 text-black';
        case 'low': return 'bg-blue-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'open': return 'bg-red-100 text-red-800';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getCategoryColor = (category) => {
    switch (category) {
        case 'payment_issue': return 'bg-red-100 text-red-800';
        case 'donation_issue': return 'bg-green-100 text-green-800';
        case 'live_stream_issue': return 'bg-purple-100 text-purple-800';
        case 'content_issue': return 'bg-blue-100 text-blue-800';
        case 'general_inquiry': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function TicketDetails({ ticket, onUpdate, isLoading }) {
    const [newReply, setNewReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await UserEntity.me();
                setCurrentUser(user);
            } catch (e) {
                console.error("Failed to fetch current user", e);
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async (updates) => {
        if (!ticket) return;
        
        try {
            await onUpdate(ticket.id, updates);
            
            // Log the action
            if (currentUser) {
                await AuditLog.create({
                    admin_user_email: currentUser.email,
                    action: `Updated support ticket status`,
                    entity_type: 'SupportTicket',
                    entity_id: ticket.id,
                    details: {
                        ticket_subject: ticket.subject,
                        status_change: updates.status,
                        updates: updates
                    }
                });
            }
        } catch (error) {
            console.error('Failed to update ticket:', error);
            toast.error('Failed to update ticket');
        }
    };

    const handleReplySubmit = async () => {
        if (!newReply.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            const currentReplies = ticket.replies || [];
            const newReplyObj = {
                author_name: currentUser.full_name,
                author_email: currentUser.email,
                author_role: 'admin',
                content: newReply,
                created_date: new Date().toISOString()
            };
            
            await handleUpdate({ 
                replies: [...currentReplies, newReplyObj],
                last_response_date: new Date().toISOString(),
                status: 'in_progress' // Automatically move to in_progress on reply
            });
            
            // Log the reply action
            await AuditLog.create({
                admin_user_email: currentUser.email,
                action: `Replied to support ticket`,
                entity_type: 'SupportTicket',
                entity_id: ticket.id,
                details: {
                    ticket_subject: ticket.subject,
                    reply_content: newReply.substring(0, 100) + '...'
                }
            });
            
            setNewReply('');
            toast.success('Reply sent successfully!');
        } catch (error) {
            console.error('Failed to add reply:', error);
            toast.error('Failed to send reply');
        }
        setIsSubmitting(false);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    if (isLoading) {
        return (
            <Card className="h-full bg-white shadow-lg border-0">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                </CardContent>
            </Card>
        );
    }

    if (!ticket) {
        return (
            <Card className="h-full bg-white shadow-lg border-0">
                <CardContent className="flex flex-col items-center justify-center h-full text-center">
                    <Bookmark className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No Ticket Selected</h3>
                    <p className="text-slate-500 mt-2">Please select a ticket from the list to view its details.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col bg-white shadow-lg border-0">
            <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-slate-800">#{ticket.ticket_number || ticket.id.slice(-6).toUpperCase()}</h3>
                            <Badge className={`${getPriorityColor(ticket.priority)} capitalize`}>
                                {ticket.priority}
                            </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-800 mb-3">{ticket.subject}</CardTitle>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={`${getStatusColor(ticket.status)} capitalize`}>
                                {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={`${getCategoryColor(ticket.category)} capitalize`} variant="outline">
                                {ticket.category.replace('_', ' ')}
                            </Badge>
                        </div>

                        {/* User Profile Section */}
                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Raised by
                            </h4>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] text-white font-semibold">
                                        {getInitials(ticket.user_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-slate-800">{ticket.user_name || 'Anonymous User'}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {ticket.user_email || 'No email'}
                                        </span>
                                        {ticket.user_phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {ticket.user_phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>Created {format(new Date(ticket.created_date), 'MMM d, yyyy HH:mm')}</span>
                            </div>
                            {ticket.last_response_date && (
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Last reply {formatDistanceToNow(new Date(ticket.last_response_date), { addSuffix: true })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                        <Select value={ticket.priority} onValueChange={(val) => handleUpdate({ priority: val })}>
                            <SelectTrigger className="w-32 bg-slate-50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={ticket.status} onValueChange={(val) => handleUpdate({ status: val })}>
                            <SelectTrigger className="w-32 bg-slate-50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Original Message */}
                <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-slate-300">
                    <h4 className="font-semibold mb-2 text-slate-700">Original Message</h4>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                    {ticket.related_booking_id && (
                        <div className="mt-3 text-sm text-slate-600 border-t pt-2">
                            <span className="font-medium">Related Booking ID:</span> {ticket.related_booking_id}
                        </div>
                    )}
                </div>

                {/* Conversation History */}
                {ticket.replies && ticket.replies.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-700 border-b pb-2">Conversation History</h4>
                        {ticket.replies.map((reply, index) => (
                            <div key={index} className={`flex gap-3 ${reply.author_role === 'admin' ? 'justify-end' : ''}`}>
                                {reply.author_role !== 'admin' && (
                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                        <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                            {getInitials(reply.author_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-[80%] rounded-lg p-3 ${
                                    reply.author_role === 'admin' 
                                        ? 'bg-[#B71C1C] text-white rounded-br-none' 
                                        : 'bg-slate-100 text-slate-800 rounded-bl-none border'
                                }`}>
                                    <p className="text-sm mb-2 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                                    <div className={`text-xs opacity-75 text-right ${reply.author_role === 'admin' ? 'text-red-100' : 'text-slate-500'}`}>
                                        <span className="font-medium">{reply.author_name}</span>
                                        <span className="ml-2">
                                            {format(new Date(reply.created_date), 'MMM d, HH:mm')}
                                        </span>
                                    </div>
                                </div>
                                {reply.author_role === 'admin' && (
                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                        <AvatarFallback className="bg-[#B71C1C] text-white text-xs">
                                            {getInitials(reply.author_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t p-4 bg-slate-50">
                <div className="w-full space-y-3">
                    <Textarea
                        placeholder="Type your response..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        className="min-h-[80px] bg-white border-slate-200 focus:border-[#B71C1C] focus:ring-[#B71C1C]"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleReplySubmit}
                            disabled={!newReply.trim() || isSubmitting}
                            className="bg-[#B71C1C] hover:bg-[#8B0000]"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            {isSubmitting ? 'Sending...' : 'Send Reply'}
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}