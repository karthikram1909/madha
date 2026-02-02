import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Plus } from 'lucide-react';
import TicketList from '../components/user-dashboard/support/TicketList';
import TicketConversation from '../components/user-dashboard/support/TicketConversation';
import CreateTicketModal from '../components/user-dashboard/support/CreateTicketModal';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.DEV 
  ? '/api/v2'
  : 'https://secure.madhatv.in/api/v2';

export default function UserSupportTickets() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  useEffect(() => {
    fetchUserAndTickets();
  }, []);

  const fetchUserAndTickets = async () => {
    setIsLoading(true);
    try {
      const userString = localStorage.getItem('user');
      if (!userString || userString === 'undefined') {
        toast.error('Please log in to view support tickets');
        setIsLoading(false);
        return;
      }

      const currentUser = JSON.parse(userString);
      console.log('Current User:', currentUser);
      setUser(currentUser);
      await loadUserTickets(currentUser.id);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      toast.error('Failed to load tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserTickets = async (userId) => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching tickets for user ID:', userId);
      
      const response = await fetch(`${API_BASE_URL}/support/my.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId })
      });

      const text = await response.text();
      console.log('📥 Raw API Response:', text);

      // Check if response is HTML (session expired or error page)
      if (text.includes('<html>') || text.includes('<!DOCTYPE') || text.includes('<pre>')) {
        console.error('❌ Received HTML instead of JSON');
        toast.error('Session expired or server error. Please login again.');
        setTickets([]);
        return;
      }

      // Check for empty response
      if (!text || text.trim() === '') {
        console.log('⚠️ Empty response from server');
        setTickets([]);
        return;
      }

      // Try to clean the response (remove any PHP debug output)
      let cleanedText = text.trim();
      
      // Remove any <pre> tags and their content
      cleanedText = cleanedText.replace(/<pre>.*?<\/pre>/gi, '');
      
      // Find the JSON part (starts with [ or {)
      const jsonStart = cleanedText.search(/[\[{]/);
      if (jsonStart > 0) {
        cleanedText = cleanedText.substring(jsonStart);
        console.log('🧹 Cleaned text:', cleanedText);
      }

      // Parse the JSON response
      let data;
      try {
        data = JSON.parse(cleanedText);
        console.log('✅ Parsed API Response:', data);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('Failed to parse:', cleanedText.substring(0, 200));
        toast.error('Invalid response from server');
        setTickets([]);
        return;
      }

      // Handle different possible response structures
      let ticketArray = [];
      
      if (Array.isArray(data)) {
        ticketArray = data;
        console.log('📋 Response is direct array');
      } else if (data.data && Array.isArray(data.data)) {
        ticketArray = data.data;
        console.log('📋 Tickets found in data.data');
      } else if (data.tickets && Array.isArray(data.tickets)) {
        ticketArray = data.tickets;
        console.log('📋 Tickets found in data.tickets');
      } else if (data.success && data.data && Array.isArray(data.data)) {
        ticketArray = data.data;
        console.log('📋 Tickets found in success.data');
      } else if (data.error === false && data.data && Array.isArray(data.data)) {
        ticketArray = data.data;
        console.log('📋 Tickets found in error:false.data');
      }

      // Normalize date fields for each ticket
      ticketArray = ticketArray.map(ticket => ({
        ...ticket,
        // Ensure we have a valid date field for "last update"
        last_update: ticket.last_update || ticket.updated_at || ticket.created_at || new Date().toISOString(),
        created_at: ticket.created_at || ticket.created_date || new Date().toISOString()
      }));

      console.log(`✅ Successfully loaded ${ticketArray.length} tickets`);
      console.log('📋 Tickets with normalized dates:', ticketArray);

      // Validate ticket structure
      if (ticketArray.length > 0) {
        const sampleTicket = ticketArray[0];
        console.log('🎫 Sample ticket structure:', sampleTicket);
        console.log('🎫 Sample ticket dates:', {
          last_update: sampleTicket.last_update,
          created_at: sampleTicket.created_at
        });
        
        // Check if required fields exist
        if (!sampleTicket.ticket_id) {
          console.warn('⚠️ Tickets missing ticket_id field');
        }
      }

      setTickets(ticketArray);

      if (ticketArray.length === 0) {
        console.log('ℹ️ No tickets found for user');
      }
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
      console.error('Error details:', error.message);
      toast.error('Failed to load tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketDetails = async (ticket) => {
    setIsLoadingDetails(true);
    try {
      console.log('🔍 Loading details for ticket:', ticket.ticket_id);
      
      const response = await fetch(`${API_BASE_URL}/support/view.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ticket_id: ticket.ticket_id })
      });

      const text = await response.text();
      console.log('📥 Raw ticket details response:', text);

      // Clean the response if needed
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/<pre>.*?<\/pre>/gi, '');
      
      const jsonStart = cleanedText.search(/[\[{]/);
      if (jsonStart > 0) {
        cleanedText = cleanedText.substring(jsonStart);
      }

      const data = JSON.parse(cleanedText);
      console.log('📥 Parsed ticket details:', data);

      // Handle different response structures
      let ticketData = null;
      
      if (data.ticket) {
        ticketData = data.ticket;
      } else if (data.data && data.data.ticket) {
        ticketData = data.data.ticket;
      } else if (data.data) {
        ticketData = data.data;
      } else if (!data.error) {
        ticketData = data;
      }

      if (ticketData) {
        console.log('✅ Ticket details loaded:', ticketData);
        
        // Ensure messages array exists and is properly formatted
        if (!ticketData.messages) {
          ticketData.messages = [];
          
          // If there's an initial message/description, add it as the first message
          if (ticketData.message || ticketData.description) {
            ticketData.messages.push({
              sender: 'user',
              message: ticketData.message || ticketData.description,
              time: ticketData.created_at || ticketData.created_date || new Date().toISOString()
            });
          }
        }
        
        console.log('📨 Ticket messages:', ticketData.messages);
        
        setTicketDetails(ticketData);
        setSelectedTicket(ticket);
        setShowConversation(true);
      } else {
        console.error('❌ No ticket data found in response');
        toast.error('Failed to load ticket details');
      }
    } catch (error) {
      console.error('❌ Error loading ticket details:', error);
      toast.error('Failed to load ticket details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleTicketSelect = (ticket) => {
    console.log('🎫 Ticket selected:', ticket);
    loadTicketDetails(ticket);
  };

  const handleTicketCreated = async (newTicket) => {
    console.log('🎉 New ticket created:', newTicket);
    
    // Close modal
    setIsModalOpen(false);
    
    // Reload tickets and auto-select the new ticket
    if (user) {
      await loadUserTickets(user.id);
      
      // Wait a bit for the tickets to load, then select the new ticket
      setTimeout(() => {
        // Find the newly created ticket by ID
        if (newTicket.ticket_id) {
          // Fetch and open the newly created ticket
          const newTicketToSelect = {
            ticket_id: newTicket.ticket_id,
            subject: newTicket.subject,
            status: newTicket.status || 'open',
            priority: newTicket.priority || 'Medium'
          };
          handleTicketSelect(newTicketToSelect);
        }
      }, 800);
    }
  };

  const handleBackToList = () => {
    console.log('⬅️ Going back to ticket list');
    setShowConversation(false);
    setSelectedTicket(null);
    setTicketDetails(null);
  };

  const handleTicketUpdate = async () => {
    console.log('🔄 Ticket updated, reloading details');
    if (selectedTicket) {
      await loadTicketDetails(selectedTicket);
    }
  };

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading tickets...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              My Support Tickets {tickets.length > 0 && `(${tickets.length})`}
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Get help with any issues or questions you may have
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Ticket
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-auto lg:h-[calc(100vh-200px)]">
          {/* Ticket List - Hidden on mobile when conversation is shown */}
          <div className={`lg:col-span-1 ${showConversation ? 'hidden lg:block' : 'block'}`}>
            <TicketList
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={handleTicketSelect}
            />
          </div>
          
          {/* Ticket Conversation - Hidden on desktop when no ticket selected */}
          <div className={`lg:col-span-2 ${showConversation ? 'block' : 'hidden lg:block'}`}>
            {isLoadingDetails ? (
              <div className="flex justify-center items-center h-full bg-white rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading conversation...</p>
                </div>
              </div>
            ) : (
              <TicketConversation
                ticket={ticketDetails}
                onUpdate={handleTicketUpdate}
                user={user}
                onBack={handleBackToList}
              />
            )}
          </div>
        </div>
      </div>

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
        user={user}
      />
    </UserDashboardLayout>
  );
}
