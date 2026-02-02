
import React, { useState, useEffect } from 'react';
import { ServiceBooking } from '@/api/entities'; // User entity import removed as it's fetched via base44 now
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  UserPlus,
  Download,
  Filter,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client'; // New import for base44

export default function ReportsPage() {
    const [activeReport, setActiveReport] = useState('bookings');
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        status: 'all',
        type: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);

    const reportTypes = [
        {
            id: 'bookings',
            title: 'Service Bookings',
            description: 'Monitor service bookings, payments, and booking trends',
            icon: CalendarCheck, 
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 'users',
            title: 'User Registrations',
            description: 'Analyze user growth, registration patterns, and demographics',
            icon: UserPlus, 
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    useEffect(() => {
        loadReportData();
    }, [activeReport]);

    const applyAndFetch = () => {
        setCurrentPage(1);
        loadReportData();
    };

    const loadReportData = async () => {
        setIsLoading(true);
        try {
            let data = [];
            let queryFilters = {}; // This object will only be populated for 'bookings' now

            // Populate queryFilters only for 'bookings' which uses ServiceBooking.filter
            if (activeReport === 'bookings') {
                if (filters.dateFrom) queryFilters.created_date_gte = new Date(filters.dateFrom).toISOString();
                if (filters.dateTo) queryFilters.created_date_lte = new Date(filters.dateTo + 'T23:59:59').toISOString();
                
                if (filters.status !== 'all') {
                    if (['completed', 'pending', 'failed'].includes(filters.status)) {
                        queryFilters.payment_status = filters.status;
                    } else if (filters.status === 'confirmed') {
                        queryFilters.status = filters.status;
                    }
                }
                if (filters.type !== 'all') {
                    queryFilters.service_type = filters.type;
                }
            }

            switch (activeReport) {
                case 'bookings':
                    data = await ServiceBooking.filter(queryFilters, '-created_date', 500);
                    break;
                case 'users':
                    // Fetch all users and then apply filters manually
                    data = await base44.entities.User.list('-created_date');

                    // Apply date filters
                    if (filters.dateFrom) {
                        data = data.filter(u => new Date(u.created_date) >= new Date(filters.dateFrom));
                    }
                    if (filters.dateTo) {
                        data = data.filter(u => new Date(u.created_date) <= new Date(filters.dateTo + 'T23:59:59'));
                    }

                    // Apply status filter
                    if (filters.status !== 'all') {
                        data = data.filter(u => {
                            // Assuming 'inactive' is explicitly set, otherwise considered active
                            if (filters.status === 'active') return u.status !== 'inactive';
                            if (filters.status === 'inactive') return u.status === 'inactive';
                            return true; 
                        });
                    }
                    // Apply type (role) filter
                    if (filters.type !== 'all') {
                        data = data.filter(u => u.role === filters.type);
                    }
                    break;
                default:
                    data = [];
            }
            
            setReportData(data);
        } catch (error) {
            console.error('Error loading report data:', error);
            toast.error('Failed to load report data');
        }
        setIsLoading(false);
    };

    const exportToCSV = () => {
        try {
            let csvContent = '';
            let filename = '';

            switch (activeReport) {
                case 'bookings':
                    csvContent = "data:text/csv;charset=utf-8," + 
                        "Date,Service Type,Beneficiary Name,Booker Name,Email,Amount,Status,Payment Status\n" +
                        reportData.map(item => 
                            `"${format(new Date(item.created_date), 'yyyy-MM-dd HH:mm:ss')}","${item.service_type || ''}","${item.beneficiary_name || ''}","${item.booker_name || ''}","${item.booker_email || ''}","${item.amount || 0}","${item.status || ''}","${item.payment_status || ''}"`
                        ).join("\n");
                    filename = `bookings_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'users':
                    csvContent = "data:text/csv;charset=utf-8," + 
                        "Date,Name,Email,Role,Status,Phone,Location\n" +
                        reportData.map(item => 
                            `"${format(new Date(item.created_date), 'yyyy-MM-dd HH:mm:ss')}","${item.full_name || ''}","${item.email || ''}","${item.role || ''}","${item.status || 'active'}","${item.phone || ''}","${item.location || ''}"`
                        ).join("\n");
                    filename = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                default:
                    return;
            }

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Report exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report');
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reportData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderReportTable = () => {
        if (isLoading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C] mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading report data...</p>
                </div>
            );
        }

        if (!reportData.length) {
            return (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No data found for the selected filters.</p>
                </div>
            );
        }

        switch (activeReport) {
            case 'bookings':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Date</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Beneficiary</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.map((booking, index) => (
                                <TableRow key={booking.id || index}>
                                    <TableCell className="text-sm">
                                        {format(new Date(booking.created_date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{booking.service_type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{booking.beneficiary_name}</p>
                                            <p className="text-xs text-slate-500">{booking.booker_email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-blue-600">
                                            ₹{booking.amount?.toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={
                                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }>
                                            {booking.status || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

            case 'users':
                return (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Date</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.map((user, index) => (
                                <TableRow key={user.id || index}>
                                    <TableCell className="text-sm">
                                        {format(new Date(user.created_date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{user.full_name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={
                                            user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }>
                                            {user.status === 'inactive' ? 'Inactive' : 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {user.location || 'Not specified'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

            default:
                return null;
        }
    };

    const ActiveReportIcon = reportTypes.find(r => r.id === activeReport)?.icon;

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Reports & Analytics</h1>
                <p className="text-red-100 max-w-2xl text-lg shadow-lg">Generate detailed reports for bookings and user registrations</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                {/* Report Type Selection - Only Bookings and Users */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {reportTypes.map((report) => {
                        const Icon = report.icon;
                        return (
                            <Card 
                                key={report.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                    activeReport === report.id ? 'ring-2 ring-[#B71C1C] bg-red-50' : 'bg-white'
                                }`}
                                onClick={() => {
                                    setActiveReport(report.id);
                                    setFilters({dateFrom: '', dateTo: '', status: 'all', type: 'all'}); // Reset filters on report type change
                                    setCurrentPage(1); // Reset page on report type change
                                }}
                            >
                                <CardContent className="p-6 text-center">
                                    <Icon className={`w-12 h-12 mx-auto mb-4 ${
                                        activeReport === report.id ? 'text-[#B71C1C]' : 'text-slate-400'
                                    }`} />
                                    <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                                    <p className="text-sm text-slate-500 mt-2">{report.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Filters and Export */}
                <Card className="bg-white shadow-lg border-0 mb-8">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                {ActiveReportIcon && <ActiveReportIcon className="w-6 h-6 text-[#B71C1C]" />}
                                {reportTypes.find(r => r.id === activeReport)?.title}
                            </CardTitle>
                            <Button onClick={exportToCSV} className="bg-[#B71C1C] hover:bg-[#8B0000]">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Date Range</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                                    />
                                    <span>-</span>
                                    <Input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {/* Status options for bookings and users */}
                                        {activeReport === 'bookings' && (
                                            <>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                            </>
                                        )}
                                        {activeReport === 'users' && (
                                            <>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Type</label>
                                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {activeReport === 'bookings' && (
                                            <>
                                                <SelectItem value="holy_mass">Holy Mass</SelectItem>
                                                <SelectItem value="rosary_blessing">Rosary Blessing</SelectItem>
                                                <SelectItem value="birthday_service">Birthday Service</SelectItem>
                                                <SelectItem value="deathday_service">Prayer for the Dead</SelectItem>
                                                <SelectItem value="marriage_blessing">Wedding/Anniversary</SelectItem>
                                                <SelectItem value="prayer_support">Prayer Support</SelectItem>
                                                <SelectItem value="healing_novena">Healing Novena</SelectItem>
                                            </>
                                        )}
                                        {activeReport === 'users' && (
                                            <>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="moderator">Moderator</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end mb-4">
                            <Button onClick={applyAndFetch} className="bg-[#B71C1C] hover:bg-[#8B0000]">
                                <Filter className="w-4 h-4 mr-2" /> Apply Filters
                            </Button>
                        </div>

                        {/* Report Table */}
                        <div className="overflow-x-auto">
                            {renderReportTable()}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <span className="text-sm text-slate-500">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => paginate(currentPage + 1)}
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
