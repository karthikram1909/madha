
import React, { useState, useEffect } from 'react';
import { BookOrder, BookOrderItem, FailedPayment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Package, CheckCircle, ChevronUp, ChevronDown, FileText, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PageBanner from '@/components/website/PageBanner';
import { base44 } from '@/api/base44Client';

// Simple Pagination component
const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex justify-center p-4">
            <ul className="flex list-none rounded shadow-sm">
                {pageNumbers.map(number => (
                    <li key={number} className="mx-1">
                        <Button
                            onClick={() => paginate(number)}
                            className={currentPage === number ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                            variant={currentPage === number ? 'default' : 'outline'}
                            size="sm"
                        >
                            {number}
                        </Button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default function BookOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [sortKey, setSortKey] = useState('created_date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [processingOrderId, setProcessingOrderId] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await BookOrder.list(); 
            setOrders(data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to load orders:", error);
            toast.error("Failed to load book orders.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await BookOrder.update(orderId, { order_status: newStatus });
            
            // Send status update email
            try {
                let emailType = '';
                if (newStatus === 'shipped') {
                    emailType = 'order_shipped';
                } else if (newStatus === 'delivered') {
                    emailType = 'order_delivered';
                }
                
                if (emailType) {
                    await base44.functions.invoke('sendBookOrderEmail', {
                        orderId: orderId,
                        emailType: emailType
                    });
                    console.log(`✅ ${newStatus} email sent`);
                }
            } catch (emailError) {
                console.warn('⚠️ Failed to send status update email:', emailError);
            }
            
            toast.success(`Order status updated to ${newStatus}!`);
            loadOrders();
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

    const handleVerifyPayment = async (orderId) => {
        try {
            await BookOrder.update(orderId, { 
                payment_status: 'completed',
                order_status: 'processing'
            });
            toast.success("Payment verified! Order moved to processing.");
            loadOrders();
        } catch (error) {
            toast.error("Failed to verify payment.");
        }
    };

    const handleRecoverMissedPayment = async (orderId) => {
        setProcessingOrderId(orderId);
        try {
            const order = await BookOrder.get(orderId);
            
            // Check if there's a failed payment record
            const failedPayments = await FailedPayment.filter({ 
                payment_id: order.payment_id,
                purpose: 'buy_books',
                status: 'PENDING_RESTORE'
            });

            if (failedPayments.length === 0) {
                toast.error("No failed payment record found for this order.");
                return;
            }

            const failedPayment = failedPayments[0];

            // Create order items from failed payment data
            if (failedPayment.payment_data && failedPayment.payment_data.cart) {
                const orderItems = failedPayment.payment_data.cart.map(item => ({
                    order_id: orderId,
                    book_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: item.price,
                    book_title: item.title
                }));

                await BookOrderItem.bulkCreate(orderItems);
            }

            // Update order status
            await BookOrder.update(orderId, {
                payment_status: 'completed',
                order_status: 'processing'
            });

            // Mark failed payment as restored
            await FailedPayment.update(failedPayment.id, {
                status: 'RESTORED',
                restored_at: new Date().toISOString(),
                restored_order_id: orderId
            });

            toast.success("🎉 Payment recovered successfully! Order is now processing.");
            loadOrders();
        } catch (error) {
            console.error("Recovery error:", error);
            toast.error("Failed to recover payment: " + error.message);
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleViewInvoice = async (orderId) => {
        try {
            toast.info('Generating invoice...');

            const order = await BookOrder.get(orderId);
            const orderItems = await BookOrderItem.filter({ order_id: orderId });

            if (!order || orderItems.length === 0) {
                toast.error('Order details not found');
                return;
            }

            const invoiceData = {
                order: order,
                items: orderItems,
                customer: {
                    name: order.customer_name,
                    email: order.customer_email,
                    phone: order.customer_phone,
                    address: order.shipping_address,
                    pincode: order.booker_pincode
                }
            };

            const { generateBookInvoicePdf } = await import('../components/utils/bookInvoiceGenerator');
            const doc = await generateBookInvoicePdf(invoiceData);

            const orderNumber = order.trn || order.id.slice(-8).toUpperCase();
            const pdfDataUri = doc.output('dataurlstring');

            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Invoice-${orderNumber}</title>
                        <style>
                            body { margin: 0; padding: 0; }
                            iframe { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${pdfDataUri}" type="application/pdf"></iframe>
                    </body>
                    </html>
                `);
                newWindow.document.close();
            }

            toast.success('Invoice opened successfully!');
        } catch (error) {
            console.error('Failed to generate invoice:', error);
            toast.error('Failed to generate invoice');
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            toast.info('Generating invoice...');

            const order = await BookOrder.get(orderId);
            const orderItems = await BookOrderItem.filter({ order_id: orderId });

            if (!order || orderItems.length === 0) {
                toast.error('Order details not found');
                return;
            }

            const invoiceData = {
                order: order,
                items: orderItems,
                customer: {
                    name: order.customer_name,
                    email: order.customer_email,
                    phone: order.customer_phone,
                    address: order.shipping_address,
                    pincode: order.booker_pincode
                }
            };

            const { generateBookInvoicePdf } = await import('../components/utils/bookInvoiceGenerator');
            const doc = await generateBookInvoicePdf(invoiceData);

            const orderNumber = order.trn || order.id.slice(-8).toUpperCase();
            const fileName = `MadhaTV-BookOrder-${orderNumber}.pdf`;
            doc.save(fileName);

            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            console.error('Failed to download invoice:', error);
            toast.error('Failed to download invoice');
        }
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (key) => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
        }
        return null;
    };

    const filteredAndSortedOrders = [...orders]
        .filter(order => {
            const statusMatch = statusFilter === 'all' || order.order_status === statusFilter;
            const paymentMatch = paymentFilter === 'all' || order.payment_status === paymentFilter;
            return statusMatch && paymentMatch;
        })
        .sort((a, b) => {
            if (!sortKey) return 0;

            let aValue = a[sortKey];
            let bValue = b[sortKey];

            if (sortKey === 'customer_name') {
                aValue = a.customer_name || '';
                bValue = b.customer_name || '';
            } else if (sortKey === 'total_amount') {
                aValue = parseFloat(a.total_amount || 0);
                bValue = parseFloat(b.total_amount || 0);
            } else if (sortKey === 'created_date') {
                aValue = new Date(a.created_date || 0).getTime();
                bValue = new Date(b.created_date || 0).getTime();
            } else if (sortKey === 'trn' || sortKey === 'id') {
                aValue = a[sortKey] || '';
                bValue = b[sortKey] || '';
            }
            
            if (aValue === undefined || aValue === null) aValue = '';
            if (bValue === undefined || bValue === null) bValue = '';

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });

    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = filteredAndSortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { className: 'bg-gray-100 text-gray-800' },
            processing: { className: 'bg-blue-100 text-blue-800 font-semibold' },
            shipped: { className: 'bg-purple-100 text-purple-800 font-semibold' },
            delivered: { className: 'bg-green-100 text-green-800 font-semibold' },
            cancelled: { className: 'bg-red-100 text-red-800 font-semibold' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge className={config.className}>{status.toUpperCase()}</Badge>;
    };

    const getPaymentBadge = (status) => {
        const statusConfig = {
            pending: { className: 'bg-orange-100 text-orange-800 font-semibold' },
            completed: { className: 'bg-emerald-100 text-emerald-800 font-semibold' },
            failed: { className: 'bg-red-100 text-red-800 font-semibold' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge className={config.className}>{status.toUpperCase()}</Badge>;
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <PageBanner 
                pageKey="book_orders"
                fallbackTitle="Book Orders Management"
                fallbackDescription="Manage and track all book orders"
                fallbackImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2940&auto=format&fit=crop"
            />

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                <Card className="mt-8 bg-white shadow-lg border-0 mb-6">
                    <CardHeader className="border-b border-slate-100 p-6">
                        <div className="flex justify-between items-center">
                            <CardTitle>All Book Orders</CardTitle>
                            <div className="flex gap-4">
                                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Payment Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payment</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Order Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Orders</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 text-center text-slate-500">Loading orders...</div>
                        ) : filteredAndSortedOrders.length === 0 ? (
                            <div className="text-center py-10">
                                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No orders found</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead
                                                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                                onClick={() => handleSort('trn')}
                                            >
                                                <div className="flex items-center">
                                                    TRN {getSortIcon('trn')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                                onClick={() => handleSort('id')}
                                            >
                                                <div className="flex items-center">
                                                    Order ID {getSortIcon('id')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                                onClick={() => handleSort('customer_name')}
                                            >
                                                <div className="flex items-center">
                                                    Customer {getSortIcon('customer_name')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                                onClick={() => handleSort('created_date')}
                                            >
                                                <div className="flex items-center">
                                                    Date {getSortIcon('created_date')}
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
                                            <TableHead className="font-semibold text-slate-700">Payment Status</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Order Status</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentOrders.map((order, index) => (
                                            <TableRow
                                                key={order.id}
                                                className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                                            >
                                                <TableCell className="font-medium">
                                                    <p className="text-sm font-mono text-blue-600 font-bold">
                                                        {order.trn || 'N/A'}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <p className="text-sm font-mono text-slate-900">{order.id.slice(-8).toUpperCase()}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-semibold">{order.customer_name}</p>
                                                        <p className="text-sm text-slate-500">{order.customer_email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(order.created_date), 'PP')}
                                                </TableCell>
                                                <TableCell>
                                                    {order.currency === 'INR' ? '₹' : '$'}{order.total_amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentBadge(order.payment_status)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(order.order_status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {order.payment_status === 'pending' && (
                                                            <>
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={() => handleVerifyPayment(order.id)}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                                    Verify
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={() => handleRecoverMissedPayment(order.id)}
                                                                    disabled={processingOrderId === order.id}
                                                                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                                                >
                                                                    {processingOrderId === order.id ? (
                                                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                                    ) : (
                                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                                    )}
                                                                    Recover
                                                                </Button>
                                                            </>
                                                        )}
                                                        {order.payment_status === 'completed' && (
                                                            <>
                                                                {order.order_status === 'processing' && (
                                                                    <Button 
                                                                        size="sm" 
                                                                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                                                        className="bg-purple-600 hover:bg-purple-700"
                                                                    >
                                                                        Mark Shipped
                                                                    </Button>
                                                                )}
                                                                {order.order_status === 'shipped' && (
                                                                    <Button 
                                                                        size="sm" 
                                                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        Mark Delivered
                                                                    </Button>
                                                                )}
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={() => handleViewInvoice(order.id)}
                                                                >
                                                                    <FileText className="w-4 h-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                                >
                                                                    <Download className="w-4 h-4 mr-1" />
                                                                    Download
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {totalPages > 1 && (
                                    <Pagination
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredAndSortedOrders.length}
                                        paginate={paginate}
                                        currentPage={currentPage}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
