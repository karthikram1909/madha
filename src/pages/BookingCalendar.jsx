
import React, { useState, useEffect } from "react";
import { ServiceBooking } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, isSameDay } from "date-fns";

import CalendarGrid from "../components/calendar/CalendarGrid";
import BookingModal from "../components/calendar/BookingModal";
import DateBookingsModal from "../components/calendar/DateBookingsModal";
import CalendarFilters from "../components/calendar/CalendarFilters";
import { generateInvoicePdf } from "@/components/utils/pdfGenerator"; // Updated import
import { toast } from "sonner";
import PageBanner from "../components/website/PageBanner";

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [filters, setFilters] = useState({
    service_type: "all",
    status: "all",
    payment_status: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // Load all users' bookings (not just current admin)
      const data = await ServiceBooking.list("-booking_date");
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings.");
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.service_type !== "all") {
      filtered = filtered.filter(booking => booking.service_type === filters.service_type);
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }
    if (filters.payment_status !== "all") {
      filtered = filtered.filter(booking => booking.payment_status === filters.payment_status);
    }

    setFilteredBookings(filtered);
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleDateClick = (date, bookingsForDate) => {
    setSelectedDate(date);
    setSelectedDateBookings(bookingsForDate);
    setShowDateModal(true);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const getBookingsForDate = (date) => {
    return filteredBookings.filter(booking => 
      isSameDay(new Date(booking.booking_date), date)
    );
  };

  // Updated service details - matching exactly 5 services as requested
  const serviceDetails = {
    holy_mass: { label: "Holy Mass", color: "bg-blue-200 text-blue-800", icon: "⛪" },
    rosary_blessing: { label: "Rosary", color: "bg-purple-200 text-purple-800", icon: "📿" },
    birthday_service: { label: "Birthday", color: "bg-green-200 text-green-800", icon: "🎂" },
    marriage_blessing: { label: "Wedding Anniversary", color: "bg-orange-200 text-orange-800", icon: "💍" },
    deathday_service: { label: "Prayer for the Dead", color: "bg-red-200 text-red-800", icon: "🕊️" },
    default: { label: "Other Service", color: "bg-slate-200 text-slate-800", icon: "⭐" },
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      // Find the booking
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        toast.error("Booking not found.");
        return;
      }

      // Prepare invoice data
      const invoiceData = {
        bookings: [booking], // Pass the single booking in an array
        totals: {
          subtotal: parseFloat(booking.amount) || 0,
          cgst: parseFloat(booking.cgst_amount) || 0,
          sgst: parseFloat(booking.sgst_amount) || 0,
          igst: parseFloat(booking.igst_amount) || 0,
          total: (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0)
        },
        meta: {
          invoice_id: booking.order_id || `INV-${booking.id.slice(-8).toUpperCase()}`,
          invoice_date: new Date().toISOString(),
          currency: booking.currency || 'INR',
          booker_info: {
            name: booking.booker_name || '',
            address: booking.booker_address || '',
            state: booking.booker_state || '', // Assuming booker_state, adjust if field name is different
            country: booking.booker_country || '', // Assuming booker_country, adjust if field name is different
            pincode: booking.booker_pincode || '',
            email: booking.booker_email || '',
            phone: booking.booker_phone || '',
            gstin: booking.gstin || '',
          }
        }
      };

      // Generate and download PDF
      const doc = await generateInvoicePdf(invoiceData);
      const invoiceNumber = invoiceData.meta.invoice_id;
      doc.save(`invoice-${invoiceNumber}.pdf`);
      
      toast.success("Invoice downloaded successfully!");
    } catch(error) {
      console.error("Failed to download invoice:", error);
      toast.error("Could not download invoice.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageBanner 
        pageKey="booking_calendar"
        fallbackTitle="Service Booking Calendar"
        fallbackDescription="Visual calendar view of all service bookings and appointments"
        fallbackImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop"
      />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}><ChevronLeft className="w-4 h-4" /></Button>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 w-48 text-center">{format(currentDate, "MMMM yyyy")}</h2>
                <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}><ChevronRight className="w-4 h-4" /></Button>
              </div>
              <CalendarFilters filters={filters} setFilters={setFilters} />
            </div>
          </CardHeader>
          
          <CardContent className="p-2 md:p-6">
            <CalendarGrid 
              currentDate={currentDate}
              bookings={filteredBookings}
              onBookingClick={handleBookingClick}
              onDateClick={handleDateClick}
              serviceDetails={serviceDetails}
              getBookingsForDate={getBookingsForDate}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader><CardTitle className="text-lg font-semibold text-slate-900">Service Types Legend</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(serviceDetails).filter(([key]) => key !== 'default').map(([key, { label, color }]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${color.split(' ')[0]}`}></div>
                  <span className="text-sm text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <BookingModal 
          booking={selectedBooking}
          showModal={showModal}
          setShowModal={setShowModal}
          serviceDetails={serviceDetails}
          onDownloadInvoice={handleDownloadInvoice}
        />

        <DateBookingsModal
          isOpen={showDateModal}
          onClose={() => setShowDateModal(false)}
          selectedDate={selectedDate}
          bookings={selectedDateBookings}
          serviceDetails={serviceDetails}
        />
      </div>
    </div>
  );
}
