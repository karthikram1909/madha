import React, { useState, useEffect, useCallback } from "react";
import { ServiceBooking, HomepageService } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

import BookingDetailsModal from "../components/bookings/BookingDetailsModal";
import BookingExporter from "../components/bookings/BookingExporter";
import PageBanner from "../components/website/PageBanner";

// Email template generators
function generateBookingConfirmationEmail(booking, emailConfig) {
  const totalAmount = (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0);
  const currencySymbol = booking.currency === 'USD' ? '$' : '₹';
  
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background: linear-gradient(135deg, #B71C1C, #D32F2F); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .booking-card { background: white; padding: 25px; border-radius: 12px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { color: #666; font-weight: 500; }
        .detail-value { color: #333; font-weight: bold; }
        .amount { font-size: 24px; font-weight: bold; color: #B71C1C; text-align: center; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🙏 Booking Confirmed!</h1>
        <p>Your spiritual service has been successfully booked</p>
    </div>
    
    <div class="content">
        <div class="booking-card">
            <h2 style="color: #B71C1C; margin-top: 0;">Dear ${booking.booker_name},</h2>
            <p>Thank you for booking a spiritual service with Madha TV. Your booking has been confirmed and will be included in our daily prayers.</p>
            
            <div class="amount">
                Total Amount: ${currencySymbol}${totalAmount.toFixed(2)}
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${(booking.service_type || '').replace(/_/g, ' ').toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">For:</span>
                <span class="detail-value">${booking.beneficiary_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${format(new Date(booking.booking_date), 'MMMM d, yyyy')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${booking.order_id || booking.id.slice(-8)}</span>
            </div>
            ${booking.trn ? `<div class="detail-row">
                <span class="detail-label">Invoice Number:</span>
                <span class="detail-value">${booking.trn}</span>
            </div>` : ''}
            ${booking.intention_text ? `<div class="detail-row">
                <span class="detail-label">Intention:</span>
                <span class="detail-value">${booking.intention_text}</span>
            </div>` : ''}
            
            <p style="margin-top: 25px; color: #666;">We will keep you updated on the status of your booking. For any queries, please contact our support team.</p>
        </div>
    </div>
    
    <div class="footer">
        <p>🙏 <strong>${emailConfig?.sender_name || 'Madha TV'}</strong> - Spreading Faith and Hope</p>
        <p>For support, contact us at ${emailConfig?.reply_to_email || 'support@madhatv.in'}</p>
    </div>
</body>
</html>`;
}

function generateBookingPublishedEmail(booking, emailConfig) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .booking-card { background: white; padding: 25px; border-radius: 12px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .detail-row { margin: 10px 0; }
        .detail-label { color: #666; font-size: 14px; }
        .detail-value { color: #333; font-weight: bold; font-size: 16px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Your Service is Published!</h1>
        <p>It will be telecasted as per the schedule</p>
    </div>
    
    <div class="content">
        <div class="booking-card">
            <h2 style="color: #059669; margin-top: 0;">Dear ${booking.booker_name},</h2>
            <p>We are happy to inform you that your service booking has been published. It is scheduled for telecast as detailed below. We join you in prayer.</p>
            
            <div class="detail-row">
                <span class="detail-label">Service:</span><br/>
                <span class="detail-value">${(booking.service_type || '').replace(/_/g, ' ').toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">For:</span><br/>
                <span class="detail-value">${booking.beneficiary_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Telecast Date:</span><br/>
                <span class="detail-value">${format(new Date(booking.booking_date), 'MMMM d, yyyy')}</span>
            </div>
            ${booking.trn ? `<div class="detail-row">
                <span class="detail-label">Invoice Number:</span><br/>
                <span class="detail-value">${booking.trn}</span>
            </div>` : ''}
            
            <p style="margin-top: 25px; color: #666;">Thank you for your contribution to the Madha TV Media Mission.</p>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>${emailConfig?.sender_name || 'Madha TV'}</strong> - Spreading Faith and Hope</p>
        <p>For support, contact us at ${emailConfig?.reply_to_email || 'support@madhatv.in'}</p>
    </div>
</body>
</html>`;
}

// Internal component for filters
const BookingFilters = ({ filters, setFilters, searchTerm, setSearchTerm }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          All Service Bookings
        </CardTitle>
        <div className="relative flex-1 lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, intention, TRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.service_type}
          onValueChange={(value) => handleFilterChange('service_type', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="holy_mass">Holy Mass</SelectItem>
            <SelectItem value="rosary_blessing">Holy Rosary</SelectItem>
            <SelectItem value="birthday_service">Birthday</SelectItem>
            <SelectItem value="marriage_blessing">Wedding / Ordination</SelectItem>
            <SelectItem value="deathday_service">Prayer for the Dead</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.payment_status}
          onValueChange={(value) => handleFilterChange('payment_status', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="completed">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.payment_method}
          onValueChange={(value) => handleFilterChange('payment_method', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Gateway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gateways</SelectItem>
            <SelectItem value="razorpay">Razorpay</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.country}
          onValueChange={(value) => handleFilterChange('country', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="IN">India</SelectItem>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="GB">United Kingdom</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
            <SelectItem value="AU">Australia</SelectItem>
            <SelectItem value="OTH">Other</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 lg:col-span-2">
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="text-sm"
          />
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

// Internal component for the booking list table
const BookingList = ({
  bookings,
  isLoading,
  handleSort,
  sortBy,
  sortOrder,
  getSortIcon,
  getCurrencySymbol,
  getServiceDisplayName,
  language,
  onViewDetails,
  formatTRN,
  indexOffset,
  totalCount,
}) => {
  return (
    <>
      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading bookings...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead
                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('trn')}
              >
                <div className="flex items-center">
                  Invoice No. {getSortIcon('trn')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('order_id')}
              >
                <div className="flex items-center">
                  {language === 'tamil' ? 'ஆர்டர் ஐடி' : 'Order ID'} {getSortIcon('order_id')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('booker_name')}
              >
                <div className="flex items-center">
                  Name {getSortIcon('booker_name')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('beneficiary_name')}
              >
                <div className="flex items-center">
                  Dedicated To {getSortIcon('beneficiary_name')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('service_type')}
              >
                <div className="flex items-center">
                  {language === 'tamil' ? 'சேவை' : 'Service'} {getSortIcon('service_type')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700">Intention</TableHead>
              <TableHead
                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('booking_date')}
              >
                <div className="flex items-center">
                  Telecasting Date {getSortIcon('booking_date')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount (with tax) {getSortIcon('amount')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Payment</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking, index) => {
              const totalAmount = (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0);

              return (
                <TableRow
                  key={booking.id}
                  className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                >
                  <TableCell className="font-medium">
                    <p className="text-sm font-mono text-blue-600 font-bold">
                      {formatTRN(booking)}
                    </p>
                  </TableCell>
                  <TableCell className="font-medium">
                    <p className="text-sm font-mono text-slate-900">
                      {booking.order_id || 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{booking.booker_name}</p>
                      <p className="text-xs text-slate-500">{booking.booker_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-slate-900">{booking.beneficiary_name}</p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {getServiceDisplayName(booking)}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {booking.booking_type !== 'one-time' ? booking.booking_type : 'One-time'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.intention_text || booking.description ? (
                      <p className="text-xs text-slate-600 truncate max-w-32" title={booking.intention_text || booking.description}>
                        {booking.intention_text || booking.description}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-400">No intention</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                      </p>
                      {booking.booking_time && (
                        <p className="text-xs text-slate-500">{booking.booking_time}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {getCurrencySymbol(booking.currency)}{totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{booking.payment_method}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'published' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }>
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      booking.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }>
                      {booking.payment_status === 'completed' ? 'Paid' :
                       booking.payment_status === 'failed' ? 'Failed' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(booking)}
                      className="hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View / Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </>
  );
};

export default function ServiceBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    service_type: "all",
    payment_status: "all",
    payment_method: "all",
    country: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [sortBy, setSortBy] = useState('trn');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [allServices, setAllServices] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(15);

  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');

  // Helper function to format TRN - Updated to display 5-digit sequential format
  const formatTRN = (booking) => {
    // Priority 1: Use the trn field if it exists (this is the 5-digit sequential number)
    if (booking.trn) {
      const trnStr = String(booking.trn).trim();
      
      // If it's a pure number, pad it to 5 digits
      if (!isNaN(trnStr) && trnStr.length > 0) {
        const trnNumber = parseInt(trnStr, 10);
        return trnNumber.toString().padStart(5, '0');
      }
      
      // If it already has letters or is formatted, return as-is
      return trnStr;
    }
    
    // Priority 2: Fall back to order_id if TRN is missing (for old records)
    if (booking.order_id) {
      return booking.order_id;
    }
    
    // Last resort: use last 8 characters of booking id
    return booking.id ? booking.id.slice(-8).toUpperCase() : 'N/A';
  };

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('madha_tv_language') || 'english');
    };

    window.addEventListener('storage', handleLanguageChange);
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    loadBookings();
    const fetchAllServices = async () => {
        try {
            const servicesData = await HomepageService.list();
            setAllServices(servicesData);
        } catch (error) {
            console.error("Error fetching all services:", error);
        }
    };
    fetchAllServices();
  }, []);

  const getServiceDisplayName = useCallback((booking) => {
    // Legacy service ID mapping
    const legacyServiceMap = {
      '1': 'Holy Mass',
      '2': 'Holy Rosary',
      '3': 'Birthday Service',
      '4': 'Wedding / Ordination',
      '5': 'Prayer for the Dead',
      '6': 'Prayer Support',
      '7': 'Healing Novena'
    };

    // Check if it's a numeric service type (legacy data)
    if (booking.service_type && !isNaN(booking.service_type)) {
      const serviceName = legacyServiceMap[String(booking.service_type)];
      if (serviceName) return serviceName;
    }

    // Try to match with HomepageService
    const matchingService = allServices.find(s => 
      s.title?.toLowerCase().replace(/\s+/g, '_') === booking.service_type ||
      s.id === booking.service_id
    );

    if (matchingService) {
      return language === 'tamil' && matchingService.title_tamil 
        ? matchingService.title_tamil 
        : matchingService.title;
    }

    return booking.service_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  }, [allServices, language]);

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(booking => {
        const beneficiaryName = booking.beneficiary_name || '';
        const intentionText = booking.intention_text || '';
        const serviceType = booking.service_type || '';
        const bookerEmail = booking.booker_email || '';
        const bookerName = booking.booker_name || '';
        const orderId = booking.order_id || '';
        const trn = booking.trn || '';


        return beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               intentionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
               serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
               bookerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
               bookerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
               trn.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(booking => (booking.status || 'pending') === filters.status);
    }
    if (filters.service_type !== "all") {
      filtered = filtered.filter(booking => (booking.service_type || '') === filters.service_type);
    }
    if (filters.payment_status !== "all") {
      filtered = filtered.filter(booking => (booking.payment_status || 'pending') === filters.payment_status);
    }
    if (filters.payment_method !== "all") {
      filtered = filtered.filter(b => b.payment_method === filters.payment_method);
    }
    if (filters.country !== "all") {
      filtered = filtered.filter(b => (b.country || 'OTH') === filters.country);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(b => new Date(b.booking_date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const dateToMidnight = new Date(filters.dateTo);
      dateToMidnight.setHours(23, 59, 59, 999);
      filtered = filtered.filter(b => new Date(b.booking_date) <= dateToMidnight);
    }

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'created_date' || sortBy === 'booking_date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'amount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (sortBy === 'beneficiary_name' || sortBy === 'booker_name' || sortBy === 'service_type' || sortBy === 'order_id' || sortBy === 'trn') {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
        if (sortOrder === 'asc') {
            return aVal.localeCompare(bVal);
        } else {
            return bVal.localeCompare(aVal);
        }
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, filters, sortBy, sortOrder]);
  
  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [applyFilters]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch both current and legacy bookings
      const [currentBookings, legacyBookings] = await Promise.all([
        base44.entities.ServiceBooking.list('-created_date'),
        base44.entities.LegacyServiceBooking.list('-created_date')
      ]);

      // Transform legacy bookings to match ServiceBooking structure
      const transformedLegacy = (legacyBookings || []).map(legacy => ({
        ...legacy,
        // Map legacy fields to ServiceBooking fields
        id: legacy.id,
        trn: legacy.legacy_invoice_number,
        order_id: legacy.legacy_service_id,
        user_id: legacy.app_user_id,
        service_type: legacy.service_type,
        booking_date: legacy.telecast_date || legacy.created_date,
        booking_time: '',
        intention_text: legacy.intentions,
        beneficiary_name: legacy.dedicated_to,
        booker_name: legacy.dedicated_to, // Legacy data doesn't have separate booker
        booker_email: '', // Legacy data doesn't have email
        booker_phone: '',
        amount: legacy.amount || 0,
        tax_amount: 0,
        currency: 'INR',
        payment_method: 'manual',
        payment_status: 'completed',
        status: legacy.publish ? 'published' : 'confirmed',
        published: legacy.publish,
        created_date: legacy.created_date,
        _isLegacy: true // Flag to identify legacy records
      }));

      // Merge and sort by TRN (invoice number) in DESCENDING order for proper sequential display
      const allBookings = [...(currentBookings || []), ...transformedLegacy]
        .sort((a, b) => {
          // Parse TRN as numbers for proper sorting
          const aTrn = parseInt(String(a.trn || 0), 10);
          const bTrn = parseInt(String(b.trn || 0), 10);
          return bTrn - aTrn; // Descending order (newest/highest TRN first)
        });

      // Assign sequential IDs based on TRN order (highest TRN = ID 1)
      const bookingsWithSeqId = allBookings.map((booking, index) => ({
        ...booking,
        _sequentialId: index + 1
      }));

      setBookings(bookingsWithSeqId);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    }
    setIsLoading(false);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 ml-2" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-2" /> : <ArrowDown className="w-4 h-4 ml-2" />;
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await ServiceBooking.update(bookingId, { status: newStatus });
      toast.success(`Booking status updated to ${newStatus}.`);
      
      // Send email if status is confirmed or published
      if (newStatus === 'confirmed' || newStatus === 'published') {
        try {
          // Fetch the specific booking directly from database to ensure we have the latest data
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for DB to update
          const allBookings = await ServiceBooking.list();
          const freshBooking = allBookings.find(b => b.id === bookingId);
          
          if (!freshBooking) {
            console.error('Booking not found after status update');
            toast.error('Failed to send email - booking not found');
            await loadBookings();
            return;
          }
          
          console.log('📧 Sending email for Order ID:', freshBooking.order_id);
          
          const emailType = newStatus === 'confirmed' ? 'confirmation' : 'published';
          
          const emailPayload = {
            module: 'bookings',
            type: emailType,
            recipient_email: freshBooking.booker_email,
            data: {
              bookings: [freshBooking],
              trn: freshBooking.trn,
              order_id: freshBooking.order_id,
              booker_name: freshBooking.booker_name,
              booker_email: freshBooking.booker_email,
              booker_address: freshBooking.booker_address,
              booker_pincode: freshBooking.booker_pincode,
              state: freshBooking.state,
              country: freshBooking.country,
              currency: freshBooking.currency
            }
          };
          
          const response = await base44.functions.invoke('sendResendEmail', emailPayload);
          
          console.log('📬 Email response:', JSON.stringify(response, null, 2));
          console.log('📬 Response data:', JSON.stringify(response.data, null, 2));
          
          if (response.data?.success) {
            toast.success(`✅ Email sent to ${freshBooking.booker_email}`);
          } else if (response.data?.skipped) {
            toast.info(response.data.message || 'Email configuration not found');
          } else if (response.data?.error) {
            console.error('Email error details:', JSON.stringify(response.data, null, 2));
            toast.error(`Email failed: ${response.data.error}`);
            if (response.data.details) {
              console.error('Resend error details:', JSON.stringify(response.data.details, null, 2));
            }
          } else {
            toast.warning('Email status unknown. Check Email Logs.');
          }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError);
          console.error('❌ Error name:', emailError.name);
          console.error('❌ Error message:', emailError.message);
          
          if (emailError.response) {
            console.error('❌ Response status:', emailError.response.status);
            console.error('❌ Response data (stringified):', JSON.stringify(emailError.response.data, null, 2));
          }
          
          let errorMsg = 'Unknown error';
          if (emailError.response?.data?.error) {
            errorMsg = emailError.response.data.error;
          } else if (emailError.response?.data?.message) {
            errorMsg = emailError.response.data.message;
          } else if (emailError.message) {
            errorMsg = emailError.message;
          }
          
          toast.error(`Email failed: ${errorMsg}`);
          toast.info('Check the backend function logs for more details');
        }
      }
      
      await loadBookings();
    } catch (error) {
      toast.error("Error updating booking status.");
      console.error("Error updating booking status:", error);
    }
  };

  const handleUpdateBooking = async (bookingId, data) => {
    try {
      await ServiceBooking.update(bookingId, data);
      toast.success("Booking updated successfully!");
      await loadBookings();
    } catch (error) {
      console.error("Failed to update booking:", error);
      toast.error("Failed to update booking. Please try again.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await ServiceBooking.delete(bookingId);
      toast.success("Booking deleted successfully!");
      setIsModalOpen(false);
      await loadBookings();
    } catch(error) {
      console.error("Failed to delete booking:", error);
      toast.error("Failed to delete booking. Please try again.");
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const getCurrencySymbol = (currency) => {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return '₹';
  };

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const getPaginationGroup = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageBanner 
        pageKey="service_bookings"
        fallbackTitle="Service Bookings Management"
        fallbackDescription="Manage and track all spiritual service bookings and requests"
        fallbackImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2940&auto=format&fit=crop"
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        <Card className="mt-8 bg-white shadow-lg border-0">
          <CardHeader className="border-b border-slate-100 p-0">
            <BookingFilters
              filters={filters}
              setFilters={setFilters}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </CardHeader>

          <CardContent className="p-0">
            <BookingList
              bookings={currentBookings}
              isLoading={isLoading}
              handleSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              getSortIcon={getSortIcon}
              getCurrencySymbol={getCurrencySymbol}
              getServiceDisplayName={getServiceDisplayName}
              language={language}
              onViewDetails={handleViewDetails}
              formatTRN={formatTRN}
              indexOffset={indexOfFirstBooking}
              totalCount={filteredBookings.length}
            />

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 p-6 pt-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstBooking + 1} to {Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {getPaginationGroup().map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <BookingExporter />
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={updateBookingStatus}
        onUpdateBooking={handleUpdateBooking}
        onDeleteBooking={handleDeleteBooking}
      />
    </div>
  );
}