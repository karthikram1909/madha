import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Unknown';
  
  try {
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateStr);
      return 'Unknown';
    }
    
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 0) return 'just now';
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  } catch (error) {
    console.error('Error formatting date:', error, dateStr);
    return 'Unknown';
  }
};

const getStatusStyles = (status) => {
  const styles = {
    open: { 
      icon: <MessageSquare className="w-4 h-4 text-red-500" />, 
      color: 'border-l-red-500 bg-red-50' 
    },
    replied: { 
      icon: <Clock className="w-4 h-4 text-green-500" />, 
      color: 'border-l-green-500 bg-green-50' 
    },
    closed: { 
      icon: <CheckCircle className="w-4 h-4 text-gray-500" />, 
      color: 'border-l-gray-500 bg-gray-50' 
    }
  };
  return styles[status?.toLowerCase()] || styles.open;
};

export default function TicketList({ tickets, selectedTicket, onSelectTicket }) {
  console.log('TicketList received tickets:', tickets);
  console.log('TicketList tickets count:', tickets?.length);

  return (
    <Card className="h-full flex flex-col shadow-lg border-0">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg">
          All Tickets ({tickets?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-y-auto">
        {!tickets || tickets.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            No support tickets found.
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => {
              console.log('Rendering ticket:', ticket);
              
              const styles = getStatusStyles(ticket.status);
              const isSelected = selectedTicket?.ticket_id === ticket.ticket_id;

              return (
                <div
                  key={ticket.ticket_id}
                  onClick={() => {
                    console.log('Ticket clicked:', ticket);
                    onSelectTicket(ticket);
                  }}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all ${
                    isSelected 
                      ? styles.color 
                      : 'bg-white hover:bg-slate-50 border-l-transparent hover:border-l-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {styles.icon}
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        {ticket.ticket_id}
                      </span>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {ticket.priority || 'Medium'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-slate-800 truncate text-sm">
                    {ticket.subject || 'No Subject'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Last update: {formatTimeAgo(ticket.last_update || ticket.updated_at || ticket.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
