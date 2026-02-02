import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Phone, Mail, DollarSign, Calendar, Heart, Download, Image as ImageIcon } from "lucide-react";

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function BookingModal({ booking, showModal, setShowModal, serviceDetails }) {
  if (!booking) return null;

  const details = serviceDetails[booking.service_type] || serviceDetails.default;
  const totalAmount = (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0);

  const handlePhotoDownload = () => {
    if (!booking.booker_photo_url) return;
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = booking.booker_photo_url;
    link.download = `booking_photo_${booking.id.slice(-8)}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-lg" style={{ zIndex: 1050 }}>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${details.color}`}>{details.icon}</div>
              <div>
                <p className="text-xl font-bold text-slate-900">{details.label}</p>
                <DialogDescription>Order ID: <span className="font-semibold text-slate-800">{booking.id.slice(-8).toUpperCase()}</span></DialogDescription>
              </div>
            </div>
            <Badge className={`border ${statusColors[booking.status]}`}>{booking.status}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {/* Service Details */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Service Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {booking.booker_name}</div>
              <div><span className="font-medium">Dedicated To:</span> {booking.beneficiary_name}</div>
              <div className="flex items-center gap-3 text-slate-800">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Telecasting Date: {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')} {booking.booking_time ? `at ${booking.booking_time}` : ''}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-800">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span>Amount (with tax): <span className="font-semibold">₹{totalAmount.toLocaleString()}</span></span>
                <Badge className={booking.payment_status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-amber-100 text-amber-800 border-amber-300'}>
                    Payment: {booking.payment_status === 'completed' ? 'Paid' : booking.payment_status === 'failed' ? 'Failed' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Intention */}
          {booking.intention_text && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500"/>Intention</h4>
              <p className="text-slate-600 italic">"{booking.intention_text}"</p>
            </div>
          )}

          {/* Booker Info */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-500" />{booking.booker_name}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" />{booking.booker_email}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" />{booking.booker_phone}</div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="flex justify-center items-center pt-4 border-t min-h-[140px]">
            {booking.booker_photo_url ? (
              <div 
                className="cursor-pointer group relative overflow-hidden rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                onClick={handlePhotoDownload}
                title="Click to download photo"
              >
                <img 
                  src={booking.booker_photo_url} 
                  alt="Booking photo" 
                  className="w-30 h-30 object-cover rounded-lg"
                  style={{ width: '120px', height: '120px' }}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-slate-400" />
                <span className="text-sm">No photo uploaded</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}