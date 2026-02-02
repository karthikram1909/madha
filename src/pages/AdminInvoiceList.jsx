import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Download,
  Loader2,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageBanner from "../components/website/PageBanner";

export default function AdminInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    gateway: "all",
    subscription_type: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [sortBy, setSortBy] = useState('payment_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [downloadingId, setDownloadingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(15);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings, legacy billing data, and app users
      const [currentBookings, legacyBillings, appUsers] = await Promise.all([
        base44.entities.ServiceBooking.filter({ payment_status: 'completed' }, '-created_date'),
        base44.entities.LegacyOverallBilling.list('-created_date'),
        base44.entities.AppUser.list()
      ]);

      // Create maps for quick AppUser lookup (by id, legacy_user_id, and email)
      const appUserMap = new Map();
      const legacyUserMap = new Map();
      const emailMap = new Map();
      appUsers.forEach(user => {
        appUserMap.set(user.id, user);
        if (user.legacy_user_id) {
          // Handle both string and number legacy IDs
          legacyUserMap.set(String(user.legacy_user_id).trim(), user);
        }
        if (user.email) {
          emailMap.set(user.email.toLowerCase().trim(), user);
        }
      });

      // Payment method mapping for legacy data
      const mapLegacyGateway = (paymentMethod) => {
        const method = String(paymentMethod).trim();
        if (method === '0' || method === '1') return 'ccavenue';
        if (method === '2') return 'razorpay';
        return 'manual';
      };

      // Group current bookings by invoice_id or payment_id to create unique invoices
      const invoiceMap = new Map();

      currentBookings.forEach(booking => {
        // Use invoice_id if available, otherwise use payment_id, otherwise booking id
        const invoiceKey = booking.invoice_id || booking.payment_id || booking.id;
        
        if (invoiceMap.has(invoiceKey)) {
          // Add to existing invoice
          const existing = invoiceMap.get(invoiceKey);
          existing.services.push(booking);
          existing.total_amount += (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0);
          existing.subtotal += parseFloat(booking.amount) || 0;
          existing.tax_amount += parseFloat(booking.tax_amount) || 0;
          existing.cgst_amount += parseFloat(booking.cgst_amount) || 0;
          existing.sgst_amount += parseFloat(booking.sgst_amount) || 0;
          existing.igst_amount += parseFloat(booking.igst_amount) || 0;
          existing.services_count += 1;
        } else {
          // Create new invoice entry
          invoiceMap.set(invoiceKey, {
            id: invoiceKey,
            invoice_id: booking.invoice_id || booking.trn || booking.order_id || invoiceKey.slice(-8).toUpperCase(),
            order_id: booking.order_id || booking.id.slice(-8).toUpperCase(),
            payment_id: booking.payment_id || '',
            user_name: booking.booker_name || '',
            user_email: booking.booker_email || '',
            user_phone: booking.booker_phone || '',
            country: booking.country || 'IN',
            state: booking.state || '',
            total_amount: (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0),
            subtotal: parseFloat(booking.amount) || 0,
            tax_amount: parseFloat(booking.tax_amount) || 0,
            cgst_amount: parseFloat(booking.cgst_amount) || 0,
            sgst_amount: parseFloat(booking.sgst_amount) || 0,
            igst_amount: parseFloat(booking.igst_amount) || 0,
            currency: booking.currency || 'INR',
            payment_date: booking.created_date,
            gateway: booking.payment_method || 'razorpay',
            subscription_type: booking.booking_type === 'one-time' ? 'one_time' : booking.booking_type,
            services_count: 1,
            services: [booking],
          });
        }
      });

      // Add legacy billing records as separate invoices
      legacyBillings.forEach(legacy => {
        // Get actual user details from AppUser - try multiple methods
        let appUser = null;
        
        // Try app_user_id first
        if (legacy.app_user_id) {
          appUser = appUserMap.get(legacy.app_user_id);
        }
        
        // Try legacy_user_id (handle both string and number types)
        if (!appUser && legacy.legacy_user_id) {
          const legacyId = String(legacy.legacy_user_id).trim();
          appUser = legacyUserMap.get(legacyId);
        }
        
        invoiceMap.set(`legacy_${legacy.id}`, {
          id: `legacy_${legacy.id}`,
          invoice_id: legacy.legacy_invoice_number,
          order_id: legacy.legacy_invoice_number,
          payment_id: legacy.legacy_invoice_number,
          user_name: appUser?.full_name || 'Unknown User',
          user_email: appUser?.email || '',
          user_phone: appUser?.phone || '',
          country: 'IN',
          state: '',
          total_amount: parseFloat(legacy.invoice_amount) || 0,
          subtotal: parseFloat(legacy.invoice_amount) || 0,
          tax_amount: 0,
          cgst_amount: 0,
          sgst_amount: 0,
          igst_amount: 0,
          currency: 'INR',
          payment_date: legacy.curdate || legacy.created_date,
          gateway: mapLegacyGateway(legacy.payment_method),
          subscription_type: 'one_time',
          services_count: 1,
          services: [],
          legacy_data: legacy,
          _isLegacy: true
        });
      });

      // Convert map to array
      const invoiceList = Array.from(invoiceMap.values());
      setInvoices(invoiceList);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    }
    setIsLoading(false);
  };

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.user_name?.toLowerCase().includes(lowerSearch) ||
        inv.user_email?.toLowerCase().includes(lowerSearch) ||
        inv.invoice_id?.toLowerCase().includes(lowerSearch) ||
        inv.order_id?.toLowerCase().includes(lowerSearch)
      );
    }

    // Gateway filter
    if (filters.gateway !== "all") {
      filtered = filtered.filter(inv => inv.gateway === filters.gateway);
    }

    // Subscription type filter
    if (filters.subscription_type !== "all") {
      filtered = filtered.filter(inv => inv.subscription_type === filters.subscription_type);
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(inv => new Date(inv.payment_date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter(inv => new Date(inv.payment_date) <= dateTo);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'payment_date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'total_amount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return filtered;
  }, [invoices, searchTerm, filters, sortBy, sortOrder]);

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

  const getCurrencySymbol = (currency) => {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return '₹';
  };

  const handleDownloadInvoice = async (invoice) => {
    setDownloadingId(invoice.id);
    toast.info("Generating invoice PDF...");

    try {
      // Use the client-side PDF generator
      const { generateInvoicePdf } = await import('../components/utils/pdfGenerator');

      let invoiceData;

      if (invoice._isLegacy) {
        // Handle legacy invoice without service bookings
        const legacy = invoice.legacy_data;
        invoiceData = {
          bookings: [{
            service_type: 'Legacy Service',
            beneficiary_name: legacy.legacy_user_id || 'N/A',
            intention_text: legacy.remarks || 'Legacy booking from old system',
            booking_date: legacy.curdate || legacy.created_date,
            amount: invoice.subtotal,
            tax_amount: 0
          }],
          totals: {
            subtotal: invoice.subtotal,
            cgst: invoice.cgst_amount,
            sgst: invoice.sgst_amount,
            igst: invoice.igst_amount,
            total: invoice.total_amount
          },
          meta: {
            invoice_id: invoice.invoice_id,
            invoice_date: invoice.payment_date,
            currency: invoice.currency,
            trn: invoice.invoice_id,
            booker_info: {
              name: invoice.user_name,
              email: invoice.user_email,
              phone: invoice.user_phone,
              address: '',
              state: invoice.state,
              country: invoice.country,
            }
          }
        };
      } else {
        // Handle current bookings
        const bookingIds = invoice.services.map(s => s.id);
        const response = await base44.functions.invoke('generateBookingInvoice', {
          bookingIds: bookingIds
        });

        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response format from invoice generator');
        }

        invoiceData = {
          bookings: response.data.bookings || invoice.services,
          totals: response.data.totals || {
            subtotal: invoice.subtotal,
            cgst: invoice.cgst_amount,
            sgst: invoice.sgst_amount,
            igst: invoice.igst_amount,
            total: invoice.total_amount
          },
          meta: response.data.meta || {
            invoice_id: invoice.invoice_id,
            invoice_date: invoice.payment_date,
            currency: invoice.currency,
            trn: invoice.invoice_id,
            booker_info: {
              name: invoice.user_name,
              email: invoice.user_email,
              phone: invoice.user_phone,
              address: '',
              state: invoice.state,
              country: invoice.country,
            }
          }
        };
      }

      const doc = await generateInvoicePdf(invoiceData);
      doc.save(`MadhaTV-Invoice-${invoice.invoice_id}.pdf`);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      toast.error("Could not generate invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

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
        pageKey="admin_invoice_list"
        fallbackTitle="Invoice List"
        fallbackDescription="View and manage all payment invoices"
        fallbackImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2940&auto=format&fit=crop"
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                All Invoices
              </CardTitle>
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, invoice no..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <Select
                value={filters.gateway}
                onValueChange={(value) => handleFilterChange('gateway', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="ccavenue">CCAvenue</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.subscription_type}
                onValueChange={(value) => handleFilterChange('subscription_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Subscription Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one_time">One-Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading invoices...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('invoice_id')}
                    >
                      <div className="flex items-center">
                        Invoice No. {getSortIcon('invoice_id')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('order_id')}
                    >
                      <div className="flex items-center">
                        Order ID {getSortIcon('order_id')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('user_name')}
                    >
                      <div className="flex items-center">
                        Name {getSortIcon('user_name')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Email</TableHead>
                    <TableHead
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('payment_date')}
                    >
                      <div className="flex items-center">
                        Date {getSortIcon('payment_date')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('total_amount')}
                    >
                      <div className="flex items-center">
                        Amount {getSortIcon('total_amount')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Gateway</TableHead>
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Services</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Invoice PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoices.map((invoice, index) => (
                    <TableRow
                      key={invoice.id}
                      className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                    >
                      <TableCell className="font-medium">
                        <p className="text-sm font-mono text-blue-600 font-bold">
                          {invoice.invoice_id}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">
                        <p className="text-sm font-mono text-slate-900">
                          {invoice.order_id}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-slate-900">{invoice.user_name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">{invoice.user_email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">
                          {format(new Date(invoice.payment_date), 'MMM d, yyyy')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-slate-900">
                          {getCurrencySymbol(invoice.currency)}{invoice.total_amount.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {invoice.gateway}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          invoice.subscription_type === 'monthly' ? 'bg-blue-100 text-blue-800' :
                          invoice.subscription_type === 'yearly' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {invoice.subscription_type === 'one_time' ? 'One-Time' : invoice.subscription_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {invoice.services_count} service{invoice.services_count > 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={downloadingId === invoice.id}
                          className="hover:bg-blue-50"
                        >
                          {downloadingId === invoice.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredInvoices.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No invoices found</h3>
                <p className="text-slate-500">Try adjusting your search criteria or filters</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 p-6 pt-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstInvoice + 1} to {Math.min(indexOfLastInvoice, filteredInvoices.length)} of {filteredInvoices.length} entries
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
      </div>
    </div>
  );
}