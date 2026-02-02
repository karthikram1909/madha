import React, { useState, useEffect } from 'react';
import { FailedPayment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { History, Search, Loader2, Eye, CheckCircle, IndianRupee, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

export default function RecoveryHistory() {
    const [recoveredRecords, setRecoveredRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        purpose: 'all',
        dateFrom: '',
        dateTo: ''
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 20;

    useEffect(() => {
        loadRecoveredRecords();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [recoveredRecords, searchTerm, filters]);

    const loadRecoveredRecords = async () => {
        setIsLoading(true);
        try {
            const restored = await FailedPayment.filter({ status: 'RESTORED' }, '-restored_at');
            setRecoveredRecords(restored);
        } catch (error) {
            console.error('Failed to load recovery history:', error);
            toast.error('Failed to load recovery history');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...recoveredRecords];

        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.restored_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.restored_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.payment_data?.trn?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.purpose !== 'all') {
            filtered = filtered.filter(record => record.purpose === filters.purpose);
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(record => new Date(record.restored_at) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            const dateToEnd = new Date(filters.dateTo);
            dateToEnd.setHours(23, 59, 59, 999);
            filtered = filtered.filter(record => new Date(record.restored_at) <= dateToEnd);
        }

        setFilteredRecords(filtered);
        setCurrentPage(1);
    };

    const handleViewDetails = (record) => {
        setSelectedPayment(record);
        setShowDetailsModal(true);
    };

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

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
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <History className="w-6 h-6 text-green-600" />
                        Recovery History
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2">
                        Complete history of all recovered payments and who restored them
                    </p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by customer name, payment ID, TRN, restored by, or order ID..."
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
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Recovery History</h3>
                            <p className="text-slate-600">No recovered payments found matching your criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Restored On</TableHead>
                                        <TableHead className="font-semibold">TRN</TableHead>
                                        <TableHead className="font-semibold">Payment ID</TableHead>
                                        <TableHead className="font-semibold">Customer</TableHead>
                                        <TableHead className="font-semibold">Purpose</TableHead>
                                        <TableHead className="font-semibold">Amount</TableHead>
                                        <TableHead className="font-semibold">Restored Order ID</TableHead>
                                        <TableHead className="font-semibold">Restored By</TableHead>
                                        <TableHead className="font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentRecords.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-slate-50">
                                            <TableCell className="font-mono text-xs">
                                                {record.restored_at ? format(new Date(record.restored_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm font-bold text-blue-600">
                                                    {record.payment_data?.trn || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">{record.payment_id}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{record.user_name}</p>
                                                    <p className="text-xs text-slate-500">{record.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={record.purpose === 'service_booking' ? 'default' : 'secondary'}>
                                                    {record.purpose === 'service_booking' ? 'Service' : 'Books'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                <div className="flex items-center gap-1">
                                                    {record.currency === 'INR' ? <IndianRupee className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                                    {record.amount?.toFixed(2)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {record.restored_order_id || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm">{record.restored_by || 'System'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(record)}>
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
                                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records
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
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Recovery Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <p className="font-semibold text-green-900">Successfully Restored</p>
                                </div>
                                <p className="text-sm text-green-700">
                                    This payment was successfully recovered and the order/booking was created.
                                </p>
                            </div>

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
                                <div>
                                    <p className="text-sm font-medium text-slate-600">TRN</p>
                                    <p className="text-base font-mono text-sm font-bold text-blue-600">{selectedPayment.payment_data?.trn || 'N/A'}</p>
                                </div>
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
                                    <p className="text-sm font-medium text-slate-600">Original Failure Date</p>
                                    <p className="text-sm">{format(new Date(selectedPayment.created_date), 'PPpp')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Restored On</p>
                                    <p className="text-sm">
                                        {selectedPayment.restored_at ? format(new Date(selectedPayment.restored_at), 'PPpp') : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Restored By</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium">{selectedPayment.restored_by || 'System'}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Restored Order/Booking ID</p>
                                    <p className="text-base font-mono">{selectedPayment.restored_order_id || 'N/A'}</p>
                                </div>
                            </div>

                            {selectedPayment.error_message && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-slate-900 mb-1">Original Error:</p>
                                    <p className="text-sm text-slate-700">{selectedPayment.error_message}</p>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-slate-600 mb-2">Payment Data:</p>
                                <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-64">
                                    {JSON.stringify(selectedPayment.payment_data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}