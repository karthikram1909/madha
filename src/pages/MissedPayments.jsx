
import React, { useState, useEffect } from 'react';
import { FailedPayment, ServiceBooking, BookOrder, BookOrderItem, Book, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CreditCard, Search, Loader2, Eye, AlertCircle, RefreshCw, CheckCircle, IndianRupee, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function MissedPayments() {
    const [missedPayments, setMissedPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        purpose: 'all',
        dateFrom: '',
        dateTo: ''
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 20;

    useEffect(() => {
        loadCurrentUser();
        loadMissedPayments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [missedPayments, searchTerm, filters]);

    const loadCurrentUser = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to load current user:', error);
        }
    };

    const loadMissedPayments = async () => {
        setIsLoading(true);
        try {
            const pending = await FailedPayment.filter({ status: 'PENDING_RESTORE' }, '-created_date');
            setMissedPayments(pending);
        } catch (error) {
            console.error('Failed to load missed payments:', error);
            toast.error('Failed to load missed payments');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...missedPayments];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.mobile?.includes(searchTerm) ||
                payment.payment_data?.trn?.toLowerCase().includes(searchTerm.toLowerCase()) // Search TRN
            );
        }

        // Purpose filter
        if (filters.purpose !== 'all') {
            filtered = filtered.filter(payment => payment.purpose === filters.purpose);
        }

        // Date range filter
        if (filters.dateFrom) {
            filtered = filtered.filter(payment => new Date(payment.created_date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            const dateToEnd = new Date(filters.dateTo);
            dateToEnd.setHours(23, 59, 59, 999);
            filtered = filtered.filter(payment => new Date(payment.created_date) <= dateToEnd);
        }

        setFilteredPayments(filtered);
        setCurrentPage(1);
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const handleRestorePayment = async (payment) => {
        if (!currentUser) {
            toast.error('Unable to identify current user. Please refresh and try again.');
            return;
        }

        if (!confirm(`Are you sure you want to restore this payment and create the ${payment.purpose === 'service_booking' ? 'booking' : 'order'}?`)) {
            return;
        }

        setIsRestoring(true);
        console.log('=== STARTING PAYMENT RESTORATION ===');
        console.log('Payment ID:', payment.payment_id);
        console.log('Purpose:', payment.purpose);

        try {
            if (payment.purpose === 'service_booking') {
                await restoreServiceBooking(payment);
            } else if (payment.purpose === 'buy_books') {
                await restoreBuyBooks(payment);
            } else {
                throw new Error('Unknown payment purpose');
            }

            // Update FailedPayment status
            await FailedPayment.update(payment.id, {
                status: 'RESTORED',
                restored_at: new Date().toISOString(),
                restored_by: currentUser.email
            });

            toast.success('Payment restored successfully! Order/Booking created and email sent.');
            await loadMissedPayments();
            setShowDetailsModal(false);
        } catch (error) {
            console.error('❌ ERROR RESTORING PAYMENT:', error);
            toast.error(`Restoration failed: ${error.message}`);
            
            // Update status to FAILED
            await FailedPayment.update(payment.id, {
                status: 'FAILED',
                error_message: `${payment.error_message || ''}\n\nRestore attempt failed: ${error.message}`
            });
        } finally {
            setIsRestoring(false);
        }
    };

    const restoreServiceBooking = async (payment) => {
        console.log('Restoring service booking...');
        const { payment_data } = payment;

        if (!payment_data || !payment_data.bookings || payment_data.bookings.length === 0) {
            throw new Error('No booking data found in payment record');
        }

        const bookingsToRestore = payment_data.bookings;
        console.log(`Creating ${bookingsToRestore.length} bookings...`);

        // Create all bookings
        const createdBookings = await ServiceBooking.bulkCreate(
            bookingsToRestore.map(b => ({
                ...b,
                payment_status: 'completed',
                payment_id: payment.payment_id,
                status: 'confirmed'
            }))
        );

        console.log('✓ Bookings created successfully');

        // Update the restored_order_id with the first booking's order_id
        await FailedPayment.update(payment.id, {
            restored_order_id: createdBookings[0]?.order_id || createdBookings[0]?.id
        });

        // Send confirmation email
        try {
            const invoiceData = {
                bookings: createdBookings.map(b => ({
                    id: b.id,
                    order_id: b.order_id,
                    service_type: b.service_type,
                    beneficiary_name: b.beneficiary_name,
                    booker_name: b.booker_name,
                    intention_text: b.intention_text,
                    description: b.description,
                    booking_date: b.booking_date,
                    amount: parseFloat(b.amount) || 0,
                    tax_amount: parseFloat(b.tax_amount) || 0,
                    cgst_amount: parseFloat(b.cgst_amount) || 0,
                    sgst_amount: parseFloat(b.sgst_amount) || 0,
                    igst_amount: parseFloat(b.igst_amount) || 0,
                    currency: b.currency,
                    status: b.status,
                    booking_type: b.booking_type,
                    booker_email: b.booker_email,
                    booker_phone: b.booker_phone,
                    created_date: b.created_date,
                })),
                totals: {
                    subtotal: createdBookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
                    cgst: createdBookings.reduce((sum, b) => sum + (parseFloat(b.cgst_amount) || 0), 0),
                    sgst: createdBookings.reduce((sum, b) => sum + (parseFloat(b.sgst_amount) || 0), 0),
                    igst: createdBookings.reduce((sum, b) => sum + (parseFloat(b.igst_amount) || 0), 0),
                    total: createdBookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0) + (parseFloat(b.tax_amount) || 0), 0)
                },
                meta: {
                    booker_info: payment_data.user_info || {
                        name: payment.user_name,
                        email: payment.email,
                        phone: payment.mobile
                    },
                    currency: payment.currency,
                    invoice_id: `INV-${createdBookings[0]?.order_id || Date.now().toString().slice(-8)}`,
                    invoice_date: new Date().toISOString()
                }
            };

            // Generate and send invoice
            const { generateInvoicePdf } = await import('../components/utils/pdfGenerator');
            const doc = await generateInvoicePdf(invoiceData);
            const invoiceBase64 = doc.output('datauristring').split(',')[1];

            await base44.integrations.Core.SendEmail({
                to: payment.email,
                subject: '✅ Booking Confirmed - Madha TV (Restored)',
                body: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2 style="color: #B71C1C;">Your Booking Has Been Confirmed!</h2>
                        <p>Dear ${payment.user_name},</p>
                        <p>Your spiritual service booking has been successfully confirmed.</p>
                        <p><strong>Payment Reference:</strong> ${payment.payment_id}</p>
                        ${payment.payment_data?.trn ? `<p><strong>Transaction Reference Number (TRN):</strong> ${payment.payment_data.trn}</p>` : ''}
                        <p><strong>Total Amount:</strong> ${payment.currency === 'INR' ? '₹' : '$'}${payment.amount.toFixed(2)}</p>
                        <p>Please find your invoice attached.</p>
                        <p>For any queries, contact us at support@madhatv.in</p>
                        <p style="color: #666; font-size: 12px;">This booking was restored after a technical issue.</p>
                    </div>
                `
            });

            console.log('✓ Confirmation email sent');
        } catch (emailError) {
            console.warn('⚠️ Failed to send email:', emailError.message);
            // Don't throw error - booking is still restored
        }
    };

    const restoreBuyBooks = async (payment) => {
        console.log('Restoring book order...');
        const { payment_data } = payment;

        if (!payment_data || !payment_data.cart || payment_data.cart.length === 0) {
            throw new Error('No cart data found in payment record');
        }

        // Create the order
        const orderData = {
            user_id: payment.user_id,
            customer_name: payment.user_name,
            customer_email: payment.email,
            customer_phone: payment.mobile,
            shipping_address: payment_data.user_info?.address || payment_data.shipping_address || 'N/A',
            total_amount: payment.amount,
            currency: payment.currency,
            payment_method: payment.payment_method,
            payment_id: payment.payment_id,
            payment_status: 'completed',
            order_status: 'pending'
        };

        const newOrder = await BookOrder.create(orderData);
        console.log('✓ Order created:', newOrder.id);

        // Create order items
        const orderItems = payment_data.cart.map(item => ({
            order_id: newOrder.id,
            book_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price,
            book_title: item.title
        }));

        await BookOrderItem.bulkCreate(orderItems);
        console.log('✓ Order items created');

        // Update stock
        for (const item of payment_data.cart) {
            try {
                const book = await Book.get(item.id);
                if (book) {
                    const newStock = Math.max(0, book.stock_quantity - item.quantity);
                    await Book.update(item.id, { stock_quantity: newStock });
                }
            } catch (error) {
                console.warn(`Failed to update stock for book ${item.id}:`, error);
            }
        }
        console.log('✓ Stock updated');

        // Update restored_order_id
        await FailedPayment.update(payment.id, {
            restored_order_id: newOrder.id
        });

        // Send confirmation email
        try {
            await base44.integrations.Core.SendEmail({
                to: payment.email,
                subject: '✅ Book Order Confirmed - Madha TV (Restored)',
                body: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2 style="color: #B71C1C;">Your Book Order Has Been Confirmed!</h2>
                        <p>Dear ${payment.user_name},</p>
                        <p>Your book order has been successfully processed.</p>
                        <p><strong>Order ID:</strong> ${newOrder.id.slice(-8).toUpperCase()}</p>
                        <p><strong>Payment Reference:</strong> ${payment.payment_id}</p>
                        ${payment.payment_data?.trn ? `<p><strong>Transaction Reference Number (TRN):</strong> ${payment.payment_data.trn}</p>` : ''}
                        <p><strong>Total Amount:</strong> ${payment.currency === 'INR' ? '₹' : '$'}${payment.amount.toFixed(2)}</p>
                        <p>Your books will be shipped to the provided address.</p>
                        <p>For any queries, contact us at support@madhatv.in</p>
                        <p style="color: #666; font-size: 12px;">This order was restored after a technical issue.</p>
                    </div>
                `
            });

            console.log('✓ Confirmation email sent');
        } catch (emailError) {
            console.warn('⚠️ Failed to send email:', emailError.message);
        }
    };

    // Pagination logic
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

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
        <div className="bg-slate-50 min-h-screen p-6">
            <Card className="max-w-7xl mx-auto">
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <CreditCard className="w-6 h-6 text-orange-600" />
                        Missed Payments
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2">
                        Payments that succeeded but orders/bookings were not created due to technical issues
                    </p>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="bg-orange-50 border-orange-200">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-orange-900">Total Missed</p>
                                <p className="text-2xl font-bold text-orange-600">{missedPayments.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-blue-900">Service Bookings</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {missedPayments.filter(p => p.purpose === 'service_booking').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-purple-50 border-purple-200">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-purple-900">Book Orders</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {missedPayments.filter(p => p.purpose === 'buy_books').length}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by customer name, email, payment ID, TRN, or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select value={filters.purpose} onValueChange={(value) => setFilters({ ...filters, purpose: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Purpose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Purposes</SelectItem>
                                    <SelectItem value="service_booking">Service Booking</SelectItem>
                                    <SelectItem value="buy_books">Buy Books</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                placeholder="From Date"
                            />

                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                placeholder="To Date"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Missed Payments</h3>
                            <p className="text-slate-600">All payments are properly tracked and recorded</p>
                        </div>
                    ) : (
                        <>
                            <Alert className="mb-6 border-orange-200 bg-orange-50">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-900">
                                    <strong>Action Required:</strong> These payments succeeded in the gateway but orders were not created. 
                                    Click "Restore Order" to manually create them.
                                </AlertDescription>
                            </Alert>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">TRN</TableHead>
                                            <TableHead className="font-semibold">Payment ID</TableHead>
                                            <TableHead className="font-semibold">Customer</TableHead>
                                            <TableHead className="font-semibold">Purpose</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                            <TableHead className="font-semibold">Gateway</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentPayments.map((payment) => (
                                            <TableRow key={payment.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <span className="font-mono text-sm font-bold text-blue-600">
                                                        {payment.payment_data?.trn || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs">{payment.payment_id}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">{payment.user_name}</p>
                                                        <p className="text-xs text-slate-500">{payment.email}</p>
                                                        {payment.mobile && <p className="text-xs text-slate-500">{payment.mobile}</p>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={payment.purpose === 'service_booking' ? 'default' : 'secondary'}>
                                                        {payment.purpose === 'service_booking' ? 'Service' : 'Books'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center gap-1">
                                                        {payment.currency === 'INR' ? <IndianRupee className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                                        {payment.amount?.toFixed(2)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {payment.payment_method}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-orange-100 text-orange-800">
                                                        PENDING
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewDetails(payment)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleRestorePayment(payment)}
                                                            disabled={isRestoring}
                                                        >
                                                            {isRestoring ? (
                                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                            ) : (
                                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                            )}
                                                            Restore
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                    <div className="text-sm text-gray-700">
                                        Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} payments
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
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            Missed Payment Details
                        </DialogTitle>
                        <DialogDescription>
                            Review the details and restore the order if everything looks correct
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <Alert className="border-orange-200 bg-orange-50">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-900">
                                    Payment succeeded but order creation failed
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Customer Name</p>
                                    <p className="text-base">{selectedPayment.user_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Email</p>
                                    <p className="text-base">{selectedPayment.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Mobile</p>
                                    <p className="text-base">{selectedPayment.mobile}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Payment ID</p>
                                    <p className="text-base font-mono text-sm">{selectedPayment.payment_id}</p>
                                </div>
                                {selectedPayment.payment_data?.trn && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">TRN</p>
                                        <p className="text-base font-mono text-sm font-bold text-blue-600">{selectedPayment.payment_data.trn}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Amount</p>
                                    <p className="text-lg font-semibold">
                                        {selectedPayment.currency === 'INR' ? '₹' : '$'}{selectedPayment.amount?.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Purpose</p>
                                    <Badge className="mt-1">
                                        {selectedPayment.purpose === 'service_booking' ? 'Service Booking' : 'Buy Books'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Payment Gateway</p>
                                    <Badge variant="outline" className="mt-1 capitalize">
                                        {selectedPayment.payment_method}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Failed On</p>
                                    <p className="text-sm">{format(new Date(selectedPayment.created_date), 'PPpp')}</p>
                                </div>
                            </div>

                            {selectedPayment.error_message && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-red-900 mb-1">Error Details:</p>
                                    <p className="text-sm text-red-700">{selectedPayment.error_message}</p>
                                </div>
                            )}

                            {selectedPayment.payment_data && (
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-slate-600 mb-2">Payment Data:</p>
                                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-64">
                                        {JSON.stringify(selectedPayment.payment_data, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                                    Close
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleRestorePayment(selectedPayment)}
                                    disabled={isRestoring}
                                >
                                    {isRestoring ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Restoring...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Restore Order
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
