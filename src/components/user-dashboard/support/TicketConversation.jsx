import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, ChevronLeft, Shield, User as UserIcon, Calendar, Tag } from 'lucide-react';
import { toast } from 'sonner';

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/v2'  // Proxy in development
  : 'https://secure.madhatv.in/api/v2'; // Direct in production

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown time';
  
  try {
    let date;
    
    // Try multiple date parsing methods
    if (typeof dateStr === 'string') {
      // Handle ISO format
      if (dateStr.includes('T') || dateStr.includes('-')) {
        date = new Date(dateStr);
      }
      // Handle timestamp
      else if (!isNaN(dateStr)) {
        date = new Date(parseInt(dateStr) * 1000); // Unix timestamp
      }
      // Try direct parsing
      else {
        date = new Date(dateStr);
      }
    } else if (typeof dateStr === 'number') {
      // Unix timestamp (in seconds)
      date = new Date(dateStr * 1000);
    } else {
      date = new Date(dateStr);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateStr);
      return 'Unknown time';
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return 'Unknown time';
  }
};

// New function to format date and time for messages
const formatMessageDateTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  
  try {
    let date;
    
    // Handle different date formats
    if (typeof dateStr === 'string') {
      if (dateStr.includes('T') || dateStr.includes('-')) {
        date = new Date(dateStr);
      } else if (!isNaN(dateStr)) {
        date = new Date(parseInt(dateStr) * 1000);
      } else {
        date = new Date(dateStr);
      }
    } else if (typeof dateStr === 'number') {
      date = new Date(dateStr * 1000);
    } else {
      date = new Date(dateStr);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for message:', dateStr);
      return 'Just now';
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${year} at ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting message date:', dateStr, error);
    return 'Just now';
  }
};

const getPriorityColor = (priority) => {
  const colors = {
    High: 'bg-orange-500 text-white border-orange-500',
    high: 'bg-orange-500 text-white border-orange-500',
    Medium: 'bg-yellow-500 text-black border-yellow-500',
    medium: 'bg-yellow-500 text-black border-yellow-500',
    Low: 'bg-blue-500 text-white border-blue-500',
    low: 'bg-blue-500 text-white border-blue-500'
  };
  return colors[priority] || 'bg-yellow-500 text-black border-yellow-500';
};

const getStatusColor = (status) => {
  const colors = {
    open: 'bg-red-600 text-white border-red-600',
    Open: 'bg-red-600 text-white border-red-600',
    replied: 'bg-green-600 text-white border-green-600',
    Replied: 'bg-green-600 text-white border-green-600',
    closed: 'bg-gray-600 text-white border-gray-600',
    Closed: 'bg-gray-600 text-white border-gray-600'
  };
  return colors[status] || 'bg-red-600 text-white border-red-600';
};

export default function TicketConversation({ ticket, onUpdate, user, onBack }) {
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize local messages when ticket changes
  useEffect(() => {
    if (ticket?.messages) {
      setLocalMessages(Array.isArray(ticket.messages) ? ticket.messages : []);
    } else {
      setLocalMessages([]);
    }
  }, [ticket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Enhanced logging for debugging
  useEffect(() => {
    if (ticket) {
      console.log('🎫 TicketConversation received ticket:', ticket);
      console.log('📝 ALL TICKET FIELDS:', Object.keys(ticket));
      console.log('📝 Subject fields:', {
        subject: ticket.subject,
        title: ticket.title,
        ticket_subject: ticket.ticket_subject,
        Subject: ticket.Subject,
        ticket_title: ticket.ticket_title,
        name: ticket.name
      });
      console.log('💬 Message fields:', {
        message: ticket.message,
        description: ticket.description,
        initial_message: ticket.initial_message,
        content: ticket.content,
        body: ticket.body,
        ticket_message: ticket.ticket_message
      });
      console.log('🆔 ID fields:', {
        ticket_id: ticket.ticket_id,
        id: ticket.id,
        ticketId: ticket.ticketId,
        ticket_ID: ticket.ticket_ID
      });
    }
  }, [ticket]);

  const handleReplySubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedReply = newReply.trim();
    
    if (!trimmedReply || !ticket) {
      console.log('❌ Cannot send - empty message or no ticket');
      return;
    }

    // Get the ticket ID - try ALL possible field names
    const ticketId = ticket.ticket_id || 
                     ticket.id || 
                     ticket.ticketId || 
                     ticket.ticket_ID || 
                     ticket.ID ||
                     ticket._id;

    console.log('🎫 Ticket ID found:', ticketId);
    console.log('📝 Message to send:', trimmedReply);

    if (!ticketId) {
      console.error('❌ No ticket ID found in ticket object:', ticket);
      toast.error('Cannot send reply - ticket ID not found');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Sending reply to ticket ID:', ticketId);
      console.log('📤 API URL:', `${API_BASE_URL}/support/reply.php`);
      
      const requestBody = {
        ticket_id: ticketId,
        message: trimmedReply,
      };
      
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/support/reply.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📥 Reply API response:', data);

      if (data.success || response.ok) {
        toast.success('Reply sent successfully! ✅');

        // Create new message object with current timestamp
        const newMessage = {
          sender: 'user',
          message: trimmedReply,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          date: new Date().toISOString(),
        };

        console.log('✅ New message object:', newMessage);

        // Update local messages immediately for instant UI feedback
        const updatedMessages = [...localMessages, newMessage];
        setLocalMessages(updatedMessages);

        // Update ticket object
        const updatedTicket = { 
          ...ticket, 
          messages: updatedMessages,
          status: 'replied'
        };

        console.log('✅ Updated ticket with new message:', updatedTicket);

        // Clear the input field
        setNewReply('');

        // Notify parent component
        if (onUpdate) {
          onUpdate(updatedTicket);
        }

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

      } else {
        console.error('❌ Reply failed:', data);
        toast.error(data.message || data.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('❌ Error sending reply:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket) {
    return (
      <Card className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 shadow-inner">
        <MessageSquare className="w-20 h-20 text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold">Select a ticket</h3>
        <p className="text-center px-4">Choose a ticket from the list to see the conversation.</p>
      </Card>
    );
  }

  // FIX 1: Enhanced subject extraction - try ALL possible field names
  const ticketSubject = ticket.subject || 
                        ticket.title || 
                        ticket.ticket_subject || 
                        ticket.Subject || 
                        ticket.ticket_title ||
                        ticket.name ||
                        ticket.heading ||
                        'General Inquiry';

  // FIX 2: Enhanced message extraction - try ALL possible field names
  const initialMessage = ticket.message || 
                         ticket.description || 
                         ticket.initial_message || 
                         ticket.content ||
                         ticket.body ||
                         ticket.ticket_message ||
                         ticket.text ||
                         ticket.details;
  
  console.log('✅ Final subject to display:', ticketSubject);
  console.log('✅ Final initial message to display:', initialMessage);
  console.log('✅ Local messages count:', localMessages.length);

  return (
    <Card className="h-[600px] flex flex-col shadow-lg border-0">
      {/* Header Section - Compact */}
      <CardHeader className="p-4 border-b bg-white space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="lg:hidden -ml-2 hover:bg-slate-100 h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-xl font-bold text-slate-900">
                {ticketSubject}
              </h3>
            </div>
          </div>
        </div>

        {/* Ticket Metadata - Compact */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Tag */}
          <div className="flex items-center gap-1 text-slate-600">
            <Tag className="w-3 h-3 text-slate-500" />
            <span className="font-medium">{ticket.category || 'General Inquiry'}</span>
          </div>

          {/* Priority Badge */}
          <Badge className={`${getPriorityColor(ticket.priority)} text-xs font-semibold px-2 py-0.5 rounded-full`}>
            {ticket.priority || 'Medium'}
          </Badge>

          {/* Status Badge */}
          <Badge className={`${getStatusColor(ticket.status)} text-xs font-semibold px-2 py-0.5 rounded-full`}>
            {ticket.status || 'Open'}
          </Badge>

          {/* Created Date */}
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Created: {formatDate(
              ticket.created_at || 
              ticket.created_date || 
              ticket.createdAt || 
              ticket.date_created || 
              ticket.timestamp ||
              ticket.created ||
              new Date().toISOString()
            )}</span>
          </div>
        </div>
      </CardHeader>

      {/* Messages Section - Scrollable */}
      <CardContent className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {/* Display the initial message if it exists */}
        {initialMessage && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-blue-700">You</p>
                  <p className="text-xs text-slate-500">
                    {formatMessageDateTime(
                      ticket.created_at || 
                      ticket.created_date || 
                      ticket.timestamp ||
                      new Date().toISOString()
                    )}
                  </p>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap">{initialMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Render additional messages with proper date formatting */}
        {localMessages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isAdmin = msg.sender === 'admin' || msg.sender === 'support';
          
          return (
            <div key={`msg-${idx}-${msg.timestamp || Date.now()}`} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUser ? 'bg-blue-500' : 'bg-red-600'
              } text-white`}>
                {isUser ? (
                  <UserIcon className="w-4 h-4" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 max-w-[75%]">
                <div className={`rounded-lg p-4 shadow-sm ${
                  isUser 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold text-sm ${
                      isUser ? 'text-blue-100' : 'text-red-700'
                    }`}>
                      {isUser ? 'You' : 'Support Team'}
                    </p>
                    <p className={`text-xs ${
                      isUser ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {formatMessageDateTime(
                        msg.timestamp || 
                        msg.created_at || 
                        msg.date || 
                        msg.time ||
                        new Date().toISOString()
                      )}
                    </p>
                  </div>
                  <p className={`whitespace-pre-wrap ${
                    isUser ? 'text-white' : 'text-slate-700'
                  }`}>
                    {msg.message || msg.content || msg.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Reply Input - Only show if ticket is not closed */}
      {ticket.status !== 'closed' && ticket.status !== 'Closed' && (
        <div className="border-t p-3 bg-white flex-shrink-0">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleReplySubmit(e);
          }} className="flex gap-2 items-center">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
              disabled={isSubmitting}
              autoComplete="off"
            />
            <Button
              type="submit"
              onClick={handleReplySubmit}
              disabled={!newReply.trim() || isSubmitting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 h-auto transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Send</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
