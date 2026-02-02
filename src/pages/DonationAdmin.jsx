import React, { useState, useEffect } from 'react';
import { Donation } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Download, 
  Search, 
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  TrendingUp,
  Repeat,
  FileText,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

export default function DonationAdminPage() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    donationType: 'all',
    paymentStatus: 'all',
    panRequired: 'all',
    dateFrom: null,
    dateTo: null,
    amountFrom: '',
    amountTo: ''
  });

  useEffect(() => {
    loadDonations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donations, filters]);

  const loadDonations = async () => {
    setIsLoading(true);
    try {
      const data = await Donation.list('-created_date');
      setDonations(data);
    } catch (error) {
      console.error("Error loading donations:", error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...donations];
    const { searchTerm, donationType, paymentStatus, panRequired, dateFrom, dateTo, amountFrom, amountTo } = filters;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.donor_name?.toLowerCase().includes(term) ||
        d.donor_email?.toLowerCase().includes(term) ||
        d.donor_phone?.includes(term) ||
        d.payment_id?.toLowerCase().includes(term)
      );
    }

    // Donation type filter
    if (donationType !== 'all') {
      filtered = filtered.filter(d => d.donation_type === donationType);
    }

    // Payment status filter
    if (paymentStatus !== 'all') {
      filtered = filtered.filter(d => d.payment_status === paymentStatus);
    }

    // PAN filter
    if (panRequired !== 'all') {
      if (panRequired === 'required') {
        filtered = filtered.filter(d => d.amount > 5000 && d.pan_number);
      } else if (panRequired === 'missing') {
        filtered = filtered.filter(d => d.amount > 5000 && !d.pan_number);
      }
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(d => new Date(d.created_date) >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(d => new Date(d.created_date) <= dateTo);
    }

    // Amount range filter
    if (amountFrom) {
      filtered = filtered.filter(d => d.amount >= parseFloat(amountFrom));
    }
    if (amountTo) {
      filtered = filtered.filter(d => d.amount <= parseFloat(amountTo));
    }

    setFilteredDonations(filtered);
  };

  const getStats = () => {
    const completedDonations = donations.filter(d => d.payment_status === 'completed');
    const totalRevenue = completedDonations.reduce((sum, d) => sum + d.amount, 0);
    const monthlyDonations = completedDonations.filter(d => d.donation_type === 'monthly');
    const uniqueDonors = new Set(completedDonations.map(d => d.donor_phone)).size;

    return {
      totalRevenue,
      totalDonations: completedDonations.length,
      monthlyDonations: monthlyDonations.length,
      uniqueDonors
    };
  };

  const exportToCSV = () => {
    const csvHeaders = [
      'Date',
      'Donor Name',
      'Phone',
      'Email',
      'Amount',
      'Type',
      'Payment Status',
      'PAN Number',
      'Payment ID',
      'Address'
    ].join(',');

    const csvData = filteredDonations.map(donation => [
      format(new Date(donation.created_date), 'yyyy-MM-dd'),
      donation.donor_name,
      donation.donor_phone,
      donation.donor_email,
      donation.amount,
      donation.donation_type,
      donation.payment_status,
      donation.pan_number || '',
      donation.payment_id || '',
      donation.donor_address || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');

    const csvContent = csvHeaders + '\n' + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // For demo purposes, we'll export as CSV with .xlsx extension
    // In production, you'd use a proper Excel library
    exportToCSV();
  };

  const stats = getStats();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div 
        className="relative bg-cover bg-center h-52" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2940&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Donation Management</h1>
          <p className="text-red-100 max-w-2xl text-lg shadow-lg">Manage and track all donations to Santhome Communication Centre</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <TrendingUp className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalDonations}</p>
                  <p className="text-sm text-slate-500">Total Donations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.uniqueDonors}</p>
                  <p className="text-sm text-slate-500">Unique Donors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100">
                  <Repeat className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.monthlyDonations}</p>
                  <p className="text-sm text-slate-500">Monthly Subscriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Export */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-900">
                Donations ({filteredDonations.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={exportToExcel} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search donations..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.donationType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, donationType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Donation Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.paymentStatus}
                onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.panRequired}
                onValueChange={(value) => setFilters(prev => ({ ...prev, panRequired: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="PAN Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All PAN</SelectItem>
                  <SelectItem value="required">PAN Provided</SelectItem>
                  <SelectItem value="missing">PAN Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount and Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                type="number"
                placeholder="Min amount"
                value={filters.amountFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, amountFrom: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max amount"
                value={filters.amountTo}
                onChange={(e) => setFilters(prev => ({ ...prev, amountTo: e.target.value }))}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'PPP') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Donations Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading donations...</div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No donations found matching the current filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        PAN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {format(new Date(donation.created_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{donation.donor_name}</div>
                          <div className="text-sm text-slate-500">{donation.donor_email}</div>
                          <div className="text-sm text-slate-500">+91 {donation.donor_phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          ₹{donation.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={donation.donation_type === 'monthly' ? 'default' : 'secondary'}>
                            {donation.donation_type === 'monthly' ? 'Monthly' : 'One-time'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={
                              donation.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                              donation.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {donation.payment_status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {donation.amount > 5000 ? (
                            donation.pan_number ? (
                              <Badge className="bg-green-100 text-green-800">
                                {donation.pan_number}
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                Missing
                              </Badge>
                            )
                          ) : (
                            <span className="text-slate-400">Not required</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <div className="flex space-x-2">
                            {donation.receipt_pdf_url && (
                              <Button variant="ghost" size="sm">
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            {donation.certificate_pdf_url && (
                              <Button variant="ghost" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}