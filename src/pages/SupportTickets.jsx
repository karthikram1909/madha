import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/api/entities';
import TicketList from '../components/tickets/TicketList';
import TicketDetails from '../components/tickets/TicketDetails';
import TicketStats from '../components/tickets/TicketStats';
import CreateTicketModal from '../components/user-dashboard/support/CreateTicketModal';

export default function SupportTickets() {  
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false); // For opening modal

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (!selectedTicket && filteredTickets.length > 0) {
            setSelectedTicket(filteredTickets[0]);
        } else if (selectedTicket) {
            // Update selected ticket with fresh data
            const freshTicket = tickets.find(t => t.id === selectedTicket.id);
            setSelectedTicket(freshTicket);
        }
    }, [filteredTickets, tickets]);

    const loadTickets = async () => {
        setIsLoading(true);
        try {
            const data = await SupportTicket.list('-created_date');
            setTickets(data);
            setFilteredTickets(data); // Initially, show all tickets
        } catch (error) {
            console.error("Error loading support tickets:", error);
        }
        setIsLoading(false);
    };

    const handleUpdateTicket = async (ticketId, updates) => {
        try {
            const updatedTicket = await SupportTicket.update(ticketId, updates);
            await loadTickets(); // Reload all tickets to ensure consistency
        } catch (error) {
            console.error("Failed to update ticket", error);
        }
    };

    const handleTicketCreated = (newTicket) => {
        setTickets((prevTickets) => [...prevTickets, newTicket]);  // Add the new ticket to the list
        setFilteredTickets((prevFilteredTickets) => [...prevFilteredTickets, newTicket]); // Optionally, add to filtered tickets if necessary
    };

    const openCreateTicketModal = () => {
        setIsCreateTicketModalOpen(true); // Open modal
    };

    const closeCreateTicketModal = () => {
        setIsCreateTicketModalOpen(false); // Close modal
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Your header section here */}

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                <TicketStats tickets={tickets} />

                <div className="mt-8 grid lg:grid-cols-12 gap-6 h-[calc(100vh-350px)]">
                    <div className="lg:col-span-4 xl:col-span-3 h-full">
                        <TicketList 
                            tickets={tickets}  // Pass tickets to the TicketList
                            setFilteredTickets={setFilteredTickets}
                            selectedTicket={selectedTicket}
                            onSelectTicket={setSelectedTicket}
                            isLoading={isLoading}
                        />
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9 h-full">
                        <TicketDetails 
                            ticket={selectedTicket}
                            onUpdate={handleUpdateTicket}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* CreateTicketModal Component */}
            <CreateTicketModal
                isOpen={isCreateTicketModalOpen}
                onClose={closeCreateTicketModal}
                onTicketCreated={handleTicketCreated}  // Pass handleTicketCreated to update the ticket list
            />
        </div>
    );
}
