
import React, { useState, useEffect } from 'react';
import { PaymentLog, ServiceBooking, BookOrder, BookOrderItem } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Search, Loader2, Eye, AlertCircle, CheckCircle, XCircle, Clock, IndianRupee, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentLogs() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        payment_method: 'all',
        purpose: 'all',
        dateFrom: '',
        dateTo: ''
    });
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 20;

    useEffect(() => {
        loadLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [logs, searchTerm, filters]);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const allLogs = await PaymentLog.list('-created_date', 500);
            setLogs(allLogs);
        } catch (error) {
            console.error('Failed to load payment logs:', error);
            toast.error('Failed to load payment logs');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...logs];

        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user_mobile?.includes(searchTerm) ||
                log.gateway_response?.trn?.toLowerCase().includes(searchTerm.toLowerCase()) // Add TRN to search
            );
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(log => log.status === filters.status);
        }

        if (filters.payment_method !== 'all') {
            filtered = filtered.filter(log => log.payment_method === filters.payment_method);
        }

        if (filters.purpose !== 'all') {
            filtered = filtered.filter(log => log.purpose === filters.purpose);
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(log => new Date(log.created_date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            const dateToEnd = new Date(filters.dateTo);
            dateToEnd.setHours(23, 59, 59, 999);
            filtered = filtered.filter(log => new Date(log.created_date) <= dateToEnd);
        }

        setFilteredLogs(filtered);
        setCurrentPage(1);
    };

    const loadTransactionDetails = async (log) => {
        setIsLoadingDetails(true);
        try {
            const relatedLogs = await PaymentLog.filter({ payment_id: log.payment_id }, '-created_date');
            
            let orderDetails = null;
            let orderItems = null;

            if (log.purpose === 'service_booking' && log.order_id) {
                try {
                    const bookings = await ServiceBooking.filter({ order_id: log.order_id });
                    orderDetails = bookings.length > 0 ? bookings[0] : null;
                } catch (error) {
                    console.warn('Could not fetch booking details:', error);
                }
            } else if (log.purpose === 'buy_books' && log.order_id) {
                try {
                    try {
                        orderDetails = await BookOrder.get(log.order_id);
                    } catch (getError) {
                        const orders = await BookOrder.filter({ id: log.order_id });
                        orderDetails = orders.length > 0 ? orders[0] : null;
                    }
                    
                    if (orderDetails) {
                        orderItems = await BookOrderItem.filter({ order_id: orderDetails.id });
                    }
                } catch (error) {
                    console.warn('Could not fetch order details:', error);
                }
            }

            setTransactionDetails({
                logs: relatedLogs,
                orderDetails: orderDetails,
                orderItems: orderItems,
                purpose: log.purpose
            });
        } catch (error) {
            console.error('Failed to load transaction details:', error);
            toast.error('Failed to load transaction details');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleViewDetails = async (log) => {
        setSelectedLog(log);
        setShowDetailsModal(true);
        await loadTransactionDetails(log);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'payment_successful':
            case 'order_created':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'order_failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'initiated':
                return <Clock className="w-4 h-4 text-blue-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'payment_successful': 'bg-green-100 text-green-800',
            'order_created': 'bg-green-100 text-green-800',
            'order_failed': 'bg-red-100 text-red-800',
            'initiated': 'bg-blue-100 text-blue-800'
        };
        return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status.replace(/_/g, ' ').toUpperCase()}</Badge>;
    };

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

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
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Payment Logs
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2">
                        Detailed logs of all payment transactions including Razorpay and PayPal
                    </p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, email, payment ID, TRN, or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="initiated">Initiated</SelectItem>
                                    <SelectItem value="payment_successful">Payment Successful</SelectItem>
                                    <SelectItem value="order_created">Order Created</SelectItem>
                                    <SelectItem value="order_failed">Order Failed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.payment_method} onValueChange={(value) => setFilters({ ...filters, payment_method: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Gateway" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Gateways</SelectItem>
                                    <SelectItem value="razorpay">Razorpay</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                </SelectContent>
                            </Select>

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
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Logs Found</h3>
                            <p className="text-slate-600">No payment logs match your search criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Date & Time</TableHead>
                                        <TableHead className="font-semibold">User</TableHead>
                                        <TableHead className="font-semibold">TRN</TableHead>
                                        <TableHead className="font-semibold">Payment ID</TableHead>
                                        <TableHead className="font-semibold">Gateway</TableHead>
                                        <TableHead className="font-semibold">Purpose</TableHead>
                                        <TableHead className="font-semibold">Amount</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentLogs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50">
                                            <TableCell className="font-mono text-xs">
                                                {format(new Date(log.created_date), 'dd/MM/yyyy HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{log.user_name}</p>
                                                    <p className="text-xs text-slate-500">{log.user_email}</p>
                                                    {log.user_mobile && <p className="text-xs text-slate-500">{log.user_mobile}</p>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm font-bold text-blue-600 max-w-28 truncate" title={log.gateway_response?.trn || 'N/A'}>
                                                {log.gateway_response?.trn || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs max-w-32 truncate" title={log.payment_id}>
                                                {log.payment_id || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {log.payment_method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {log.purpose === 'service_booking' ? 'Service' : 'Books'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                <div className="flex items-center gap-1">
                                                    {log.currency === 'INR' ? <IndianRupee className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                                    {log.amount?.toFixed(2)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(log.status)}
                                                    {getStatusBadge(log.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(log)}>
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                            <div className="text-sm text-gray-700">
                                Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
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

            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Transaction Details
                        </DialogTitle>
                    </DialogHeader>
                    {isLoadingDetails ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : selectedLog && transactionDetails ? (
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h3 className="font-semibold text-slate-900 mb-4">Transaction Timeline</h3>
                                <div className="space-y-4">
                                    {transactionDetails.logs.map((log, index) => (
                                        <div key={log.id} className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    log.status === 'order_created' || log.status === 'payment_successful' ? 'bg-green-100' :
                                                    log.status === 'order_failed' ? 'bg-red-100' :
                                                    'bg-blue-100'
                                                }`}>
                                                    {getStatusIcon(log.status)}
                                                </div>
                                                {index < transactionDetails.logs.length - 1 && (
                                                    <div className="w-0.5 h-12 bg-slate-300"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium text-slate-900">
                                                        {log.status.replace(/_/g, ' ').toUpperCase()}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {format(new Date(log.created_date), 'HH:mm:ss')}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {log.status === 'payment_successful' && 'Payment received from gateway'}
                                                    {log.status === 'order_created' && `${log.purpose === 'service_booking' ? 'Booking' : 'Order'} created successfully`}
                                                    {log.status === 'order_failed' && `Failed to create ${log.purpose === 'service_booking' ? 'booking' : 'order'}`}
                                                    {log.status === 'initiated' && 'Payment process started'}
                                                </p>
                                                {log.error_message && (
                                                    <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                                                        <p className="text-xs text-red-700">{log.error_message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border rounded-lg p-4">
                                <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Name</p>
                                        <p className="text-base">{selectedLog.user_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Email</p>
                                        <p className="text-base">{selectedLog.user_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Mobile</p>
                                        <p className="text-base">{selectedLog.user_mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Payment ID</p>
                                        <p className="text-base font-mono text-sm">{selectedLog.payment_id}</p>
                                    </div>
                                    {selectedLog.gateway_response?.trn && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">TRN</p>
                                            <p className="text-base font-mono text-sm">{selectedLog.gateway_response.trn}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {transactionDetails.orderDetails && (
                                <div className="bg-white border rounded-lg p-4">
                                    <h3 className="font-semibold text-slate-900 mb-3">
                                        {transactionDetails.purpose === 'service_booking' ? 'Service Booking Details' : 'Book Order Details'}
                                    </h3>
                                    
                                    {transactionDetails.purpose === 'service_booking' ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Service Type</p>
                                                    <p className="text-base capitalize">{transactionDetails.orderDetails.service_type?.replace(/_/g, ' ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Booking Date</p>
                                                    <p className="text-base">{format(new Date(transactionDetails.orderDetails.booking_date), 'PPP')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Beneficiary</p>
                                                    <p className="text-base">{transactionDetails.orderDetails.beneficiary_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Status</p>
                                                    <Badge className="capitalize">{transactionDetails.orderDetails.status}</Badge>
                                                </div>
                                            </div>
                                            {transactionDetails.orderDetails.intention_text && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Intention</p>
                                                    <p className="text-base">{transactionDetails.orderDetails.intention_text}</p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Amount</p>
                                                    <p className="text-lg font-semibold">
                                                        {transactionDetails.orderDetails.currency === 'INR' ? '₹' : '$'}
                                                        {transactionDetails.orderDetails.amount?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Tax</p>
                                                    <p className="text-lg font-semibold">
                                                        {transactionDetails.orderDetails.currency === 'INR' ? '₹' : '$'}
                                                        {transactionDetails.orderDetails.tax_amount?.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Order ID</p>
                                                    <p className="text-base font-mono">{transactionDetails.orderDetails.id.slice(-8).toUpperCase()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Order Status</p>
                                                    <Badge className="capitalize">{transactionDetails.orderDetails.order_status}</Badge>
                                                </div>
                                            </div>
                                            
                                            {transactionDetails.orderItems && transactionDetails.orderItems.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600 mb-2">Books Ordered</p>
                                                    <div className="space-y-2">
                                                        {transactionDetails.orderItems.map((item) => (
                                                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                                                <span className="text-sm">{item.book_title}</span>
                                                                <span className="text-sm font-medium">
                                                                    Qty: {item.quantity} × {transactionDetails.orderDetails.currency === 'INR' ? '₹' : '$'}{item.price_at_purchase.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Shipping Address</p>
                                                <p className="text-base">{transactionDetails.orderDetails.shipping_address}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Total Amount</p>
                                                    <p className="text-lg font-semibold">
                                                        {transactionDetails.orderDetails.currency === 'INR' ? '₹' : '$'}
                                                        {transactionDetails.orderDetails.total_amount?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Payment Status</p>
                                                    <Badge className="capitalize">{transactionDetails.orderDetails.payment_status}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedLog.gateway_response && (
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-slate-900 mb-2">Gateway Response</h3>
                                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-64">
                                        {JSON.stringify(selectedLog.gateway_response, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
