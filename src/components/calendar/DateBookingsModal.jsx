import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
  published: "bg-green-100 text-green-800 border-green-300",
};

export default function DateBookingsModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  bookings = [], 
  serviceDetails 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 20;

  if (!selectedDate) return null;

  // Sort bookings: service type ASC, then created_date DESC
  const sortedBookings = [...bookings].sort((a, b) => {
    const serviceA = a.service_type || '';
    const serviceB = b.service_type || '';
    if (serviceA !== serviceB) {
      return serviceA.localeCompare(serviceB);
    }
    return new Date(b.created_date) - new Date(a.created_date);
  });

  // Pagination
  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, startIndex + bookingsPerPage);

  const formatServiceType = (type) => {
    const details = serviceDetails[type] || serviceDetails.default;
    return details.label;
  };

  const getTotalAmount = (booking) => {
    return (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Bookings for {format(selectedDate, 'MMMM dd, yyyy')}
          </DialogTitle>
          <p className="text-slate-600">
            {sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''} found
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {paginatedBookings.map((booking, index) => {
            const details = serviceDetails[booking.service_type] || serviceDetails.default;
            const totalAmount = getTotalAmount(booking);
            
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-50/50 rounded-lg p-4 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Photo thumbnail */}
                  {booking.booker_photo_url && (
                    <div 
                      className="flex-shrink-0"
                    >
                      <img 
                        src={booking.booker_photo_url} 
                        alt="Booking" 
                        className="w-10 h-10 rounded-md object-cover border border-slate-200"
                      />
                    </div>
                  )}
                  
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{details.icon}</span>
                          <h3 className="font-semibold text-slate-900">
                            {formatServiceType(booking.service_type)}
                          </h3>
                        </div>
                        
                        <div className="space-y-1 text-sm text-slate-700">
                          <p><span className="font-medium">For:</span> {booking.beneficiary_name}</p>
                          <p><span className="font-medium">Amount:</span> ₹{totalAmount.toFixed(2)}</p>
                          {booking.intention_text && (
                            <p className="text-slate-600 italic text-xs mt-2">
                              "{booking.intention_text}"
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      <div className="flex-shrink-0">
                        <Badge className={`${statusColors[booking.status]} border text-xs`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4 border-t">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}

        {sortedBookings.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No bookings found for this date.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}