
import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, User as UserIcon, Edit, Trash2, Download, Search, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        action: 'all',
        user: 'all',
        entity_type: 'all',
        dateFrom: '',
        dateTo: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(20);

    useEffect(() => {
        loadAuditLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [logs, searchTerm, filters]);

    const loadAuditLogs = async () => {
        setIsLoading(true);
        try {
            const auditLogs = await AuditLog.list('-created_date', 500);
            setLogs(auditLogs);
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        }
        setIsLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...logs];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(log => 
                log.admin_user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Action filter
        if (filters.action !== 'all') {
            filtered = filtered.filter(log => 
                log.action?.toLowerCase().includes(filters.action.toLowerCase())
            );
        }

        // User filter
        if (filters.user !== 'all') {
            filtered = filtered.filter(log => log.admin_user_email === filters.user);
        }

        // Entity type filter
        if (filters.entity_type !== 'all') {
            filtered = filtered.filter(log => log.entity_type === filters.entity_type);
        }

        // Date range filter
        if (filters.dateFrom) {
            filtered = filtered.filter(log => 
                new Date(log.created_date) >= new Date(filters.dateFrom)
            );
        }
        if (filters.dateTo) {
            filtered = filtered.filter(log => 
                new Date(log.created_date) <= new Date(filters.dateTo + 'T23:59:59')
            );
        }

        setFilteredLogs(filtered);
        setCurrentPage(1);
    };

    const exportToCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," + 
            "Date,User,Action,Entity Type,Entity ID,Details\n" +
            filteredLogs.map(log => 
                `"${format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss')}","${log.admin_user_email}","${log.action}","${log.entity_type}","${log.entity_id}","${JSON.stringify(log.details || {})}"`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        // Create a simple PDF content
        const pdfContent = filteredLogs.map(log => 
            `${format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss')} | ${log.admin_user_email} | ${log.action} | ${log.entity_type} | ${log.entity_id}`
        ).join('\n');
        
        const element = document.createElement('a');
        const file = new Blob([pdfContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `audit_log_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const getActionIcon = (action) => {
        if (action?.toLowerCase().includes('create')) return <UserIcon className="w-4 h-4 text-green-500"/>;
        if (action?.toLowerCase().includes('update')) return <Edit className="w-4 h-4 text-blue-500"/>;
        if (action?.toLowerCase().includes('delete')) return <Trash2 className="w-4 h-4 text-red-500"/>;
        if (action?.toLowerCase().includes('login')) return <UserIcon className="w-4 h-4 text-purple-500"/>;
        return <History className="w-4 h-4 text-gray-500"/>;
    };

    const getActionBadgeColor = (action) => {
        if (action?.toLowerCase().includes('create')) return 'bg-green-100 text-green-800';
        if (action?.toLowerCase().includes('update')) return 'bg-blue-100 text-blue-800';
        if (action?.toLowerCase().includes('delete')) return 'bg-red-100 text-red-800';
        if (action?.toLowerCase().includes('login')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getEntityBadgeColor = (entityType) => {
        switch (entityType) {
            case 'User': return 'bg-blue-100 text-blue-800';
            case 'ServiceBooking': return 'bg-green-100 text-green-800';
            case 'Donation': return 'bg-yellow-100 text-yellow-800';
            case 'Program': return 'bg-purple-100 text-purple-800';
            case 'SupportTicket': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get unique users, actions, and entity types for filters
    const uniqueUsers = [...new Set(logs.map(log => log.admin_user_email))].filter(Boolean);
    const uniqueActions = [...new Set(logs.map(log => {
        const action = log.action?.toLowerCase();
        if (action?.includes('create')) return 'create';
        if (action?.includes('update')) return 'update';
        if (action?.includes('delete')) return 'delete';
        if (action?.includes('login')) return 'login';
        return 'other';
    }))];
    const uniqueEntityTypes = [...new Set(logs.map(log => log.entity_type))].filter(Boolean);

    // Pagination
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const getLogStats = () => {
        const total = logs.length;
        const today = new Date().toDateString();
        const todayLogs = logs.filter(log => new Date(log.created_date).toDateString() === today).length;
        const userActions = logs.filter(log => log.action?.toLowerCase().includes('user')).length;
        const criticalActions = logs.filter(log => log.action?.toLowerCase().includes('delete')).length;
        
        return { total, todayLogs, userActions, criticalActions };
    };

    const stats = getLogStats();

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528747045269-3505c0e85ce8?q=80&w=2940&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-slate-800/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Audit Log</h1>
                <p className="text-amber-200 max-w-2xl text-lg shadow-lg">Track all administrative actions and system events</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Total Logs</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                                </div>
                                <History className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Today's Actions</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.todayLogs}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">User Actions</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.userActions}</p>
                                </div>
                                <UserIcon className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Critical Actions</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.criticalActions}</p>
                                </div>
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <History className="w-6 h-6 text-[#B71C1C]" />
                                System Activity Log ({filteredLogs.length} entries)
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button onClick={exportToCSV} variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button onClick={exportToPDF} variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Export TXT
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            
                            <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    {uniqueActions.map(action => (
                                        <SelectItem key={action} value={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.user} onValueChange={(value) => setFilters({...filters, user: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {uniqueUsers.map(user => (
                                        <SelectItem key={user} value={user}>{user}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.entity_type} onValueChange={(value) => setFilters({...filters, entity_type: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    {uniqueEntityTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                placeholder="From date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                            />

                            <Input
                                type="date"
                                placeholder="To date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                            />
                        </div>

                        {/* Audit Log Table */}
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C] mx-auto"></div>
                                <p className="mt-4 text-slate-500">Loading audit logs...</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead className="font-semibold">Date & Time</TableHead>
                                                <TableHead className="font-semibold">User</TableHead>
                                                <TableHead className="font-semibold">Action</TableHead>
                                                <TableHead className="font-semibold">Module</TableHead>
                                                <TableHead className="font-semibold">Entity ID</TableHead>
                                                <TableHead className="font-semibold">Details</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentLogs.map(log => (
                                                <TableRow key={log.id} className="hover:bg-slate-50">
                                                    <TableCell className="text-sm">
                                                        {format(new Date(log.created_date), "MMM d, yyyy")}
                                                        <br />
                                                        <span className="text-xs text-slate-500">
                                                            {format(new Date(log.created_date), "hh:mm a")}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                                            <span className="text-sm font-medium">{log.admin_user_email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getActionIcon(log.action)}
                                                            <Badge className={getActionBadgeColor(log.action)}>
                                                                {log.action}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getEntityBadgeColor(log.entity_type)}>
                                                            {log.entity_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-mono">
                                                        {log.entity_id.length > 8 ? log.entity_id.slice(-8) : log.entity_id}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-600 max-w-xs">
                                                        {log.details && typeof log.details === 'object' 
                                                            ? (
                                                                <div className="space-y-1">
                                                                    {Object.entries(log.details).slice(0, 2).map(([key, value]) => (
                                                                        <div key={key} className="text-xs">
                                                                            <span className="font-medium">{key}:</span> {String(value).substring(0, 30)}...
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )
                                                            : 'No additional details'
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <span className="text-sm text-slate-500">
                                            Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-sm text-slate-500">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            </div>
        </div>
    );
};

export default AuditLogPage;
