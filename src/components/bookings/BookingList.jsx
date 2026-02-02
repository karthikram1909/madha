
import React from "react";
// Retained, though its main usage for wrapping content is replaced by table. Kept for consistency if other parts use it.
import { Badge } from "@/components/ui/badge";
// Not used in current render, but kept.
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar,
  Clock,
  Heart,
  Repeat
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Badge variant="outline" className={`${styles[status] || styles.pending} border text-xs`}>
      {(status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1)}
    </Badge>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    completed: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-slate-100 text-slate-800"
  };

  const displayStatus = status === 'completed' ? 'Paid' : (status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1);

  return (
    <Badge className={`${styles[status] || styles.pending} text-xs`}>
      {displayStatus}
    </Badge>
  );
};

const ServiceTypeIcon = ({ type }) => {
  const icons = {
    holy_mass: Calendar,
    prayer_support: Heart,
    rosary_blessing: Heart,
    birthday_service: Calendar,
    deathday_service: Calendar,
    marriage_blessing: Heart,
    healing_novena: Heart
  };
  
  const Icon = icons[type] || Calendar;
  return <Icon className="w-4 h-4" />;
};

// Helper function for Transaction Reference Number (TRN)
const formatTRN = (booking) => {
  if (!booking || !booking.id) return 'N/A';
  // Example TRN format: first 8 chars of ID, or a timestamp-based ID could be used.
  // This assumes 'id' is a sufficiently unique identifier to base a TRN on.
  return `TRN-${booking.id.substring(0, 8).toUpperCase()}`;
};

export default function BookingList({ bookings, isLoading, selectedBookingId, onSelectBooking, onUpdateStatus }) {
  const formatServiceType = (type) => {
    if (!type) return 'Unknown Service';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCurrencySymbol = (currency) => {
    switch (currency?.toUpperCase()) {
      case 'USD':
        return '$';
      case 'INR':
      default:
        return '₹';
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full overflow-auto max-h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TRN</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Beneficiary</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="py-4"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="flex items-center gap-2 py-4">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="py-4"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="text-right py-4"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="py-4"><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="py-4"><Skeleton className="h-6 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center max-h-[60vh] flex flex-col justify-center items-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto max-h-[60vh] rounded-md border"> {/* Added border and rounded-md for table styling */}
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10 shadow-sm"> {/* Sticky header */}
          <TableRow>
            <TableHead className="w-[120px]">TRN</TableHead>
            <TableHead className="w-[180px]">Service</TableHead>
            <TableHead>Beneficiary</TableHead>
            <TableHead className="w-[200px]">Date & Time</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="text-right w-[100px]">Amount</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {bookings.map((booking, index) => {
              const totalAmount = (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0);

              return (
                <motion.tr
                  key={booking.id}
                  className={`hover:bg-red-50 transition-colors duration-200 cursor-pointer ${selectedBookingId === booking.id ? 'bg-red-100' : (index % 2 === 0 ? 'bg-white' : 'bg-slate-25')}`}
                  onClick={() => onSelectBooking(booking)}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TableCell className="font-medium">
                    <p className="text-sm font-mono text-blue-600 font-bold">
                      {formatTRN(booking)}
                    </p>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ServiceTypeIcon type={booking.service_type} />
                    </div>
                    <span className="font-semibold text-slate-900 text-sm">
                      {formatServiceType(booking.service_type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.beneficiary_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {booking.booking_date ? format(new Date(booking.booking_date), "MMM d, yyyy") : 'No date'}
                    </div>
                    {booking.booking_time && (
                      <div className="flex items-center gap-1 text-sm mt-1 text-slate-700">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {booking.booking_time}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {booking.booking_type !== 'one-time' ? (
                      <div className="flex items-center gap-1 text-blue-600 text-sm">
                        <Repeat className="w-4 h-4" />
                        <span className="capitalize">{booking.booking_type}</span>
                      </div>
                    ) : (
                      <span className="text-sm capitalize text-slate-700">One-time</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.amount && (
                      <div className="font-medium text-slate-700 text-sm">
                        {getCurrencySymbol(booking.currency)}{totalAmount.toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={booking.payment_status} />
                  </TableCell>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
