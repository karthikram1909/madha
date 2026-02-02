import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.DEV 
  ? '/api/v2'
  : 'https://secure.madhatv.in/api/v2';

const CATEGORIES = [
  'General Inquiry',
  'Payment Issue',
  'Donation Issue',
  'Live Stream Issue',
  'Content Issue'
];

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated, user }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !category) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!user || !user.id) {
      toast.error('User information not found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the payload with ALL possible subject field names
      const payload = {
        user_id: user.id,
        subject: subject.trim(),
        title: subject.trim(), // Also send as title
        ticket_subject: subject.trim(), // Also send as ticket_subject
        category: category,
        message: message.trim(),
        priority: 'Medium',
        status: 'Open'
      };

      console.log('📤 Creating ticket with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/support/create.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log('📥 Create Ticket API Response:', text);

      // Check for HTML response (session expired)
      if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
        toast.error('Session expired. Please login again.');
        setIsSubmitting(false);
        return;
      }

      let data;
      try {
        // Clean response text
        let cleanedText = text.trim();
        cleanedText = cleanedText.replace(/<pre>.*?<\/pre>/gi, '');
        const jsonStart = cleanedText.search(/[\[{]/);
        if (jsonStart > 0) {
          cleanedText = cleanedText.substring(jsonStart);
        }
        
        data = JSON.parse(cleanedText);
        console.log('✅ Parsed response:', data);
      } catch (parseError) {
        console.error('❌ Parse Error:', parseError);
        toast.error('Invalid server response');
        setIsSubmitting(false);
        return;
      }

      // Check for success
      const isSuccess = !data.error || data.success === true || data.ticket_id || data.data;

      if (isSuccess) {
        console.log('✅ Ticket created successfully:', data);
        toast.success('Ticket created successfully!');
        
        const currentDate = new Date();
        const currentTimestamp = currentDate.toISOString();
        
        // Create a properly formatted ticket object with ALL possible field names
        const newTicket = {
          ticket_id: data.ticket_id || data.data?.ticket_id || data.id,
          id: data.ticket_id || data.data?.ticket_id || data.id,
          ticketId: data.ticket_id || data.data?.ticket_id || data.id,
          subject: subject.trim(),
          title: subject.trim(),
          ticket_subject: subject.trim(),
          category: category,
          message: message.trim(),
          description: message.trim(),
          initial_message: message.trim(),
          priority: 'Medium',
          status: 'Open',
          created_at: currentTimestamp,
          created_date: currentTimestamp,
          createdAt: currentTimestamp,
          date_created: currentTimestamp,
          timestamp: Math.floor(currentDate.getTime() / 1000), // Unix timestamp
          messages: []
        };

        console.log('🎫 Formatted new ticket with all fields:', newTicket);
        
        // Reset form
        setSubject('');
        setCategory('General Inquiry');
        setMessage('');
        
        // Close modal
        onClose();

        // Pass the created ticket to the parent to update the ticket list
        if (onTicketCreated) {
          onTicketCreated(newTicket);
        }
      } else {
        console.error('❌ Ticket creation failed:', data);
        toast.error(data.msg || data.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubject('');
      setCategory('General Inquiry');
      setMessage('');
      setIsDropdownOpen(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">Create New Support Ticket</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Brief description of your issue"
              disabled={isSubmitting}
              maxLength={200}
            />
            <p className="text-xs text-slate-500 mt-1">
              {subject.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => !isSubmitting && setIsDropdownOpen(!isDropdownOpen)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white text-left flex items-center justify-between disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <span className={category ? 'text-slate-900' : 'text-slate-400'}>
                  {category || 'Select a category'}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                        category === cat ? 'bg-red-50 text-red-600 font-medium' : 'text-slate-700'
                      }`}
                    >
                      {cat}
                      {category === cat && (
                        <span className="float-right">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none min-h-[150px] resize-y"
              placeholder="Please describe your issue in detail..."
              disabled={isSubmitting}
              maxLength={2000}
            />
            <p className="text-xs text-slate-500 mt-1">
              {message.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !subject.trim() || !message.trim() || !category}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <span className="text-lg mr-2">+</span>
                  Submit Ticket
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
