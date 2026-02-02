import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

export default function DonationFilters({ filters, setFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="relative flex-1 w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, email, or payment ID..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-4 w-full md:w-auto flex-wrap">
        <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
          <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
          <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="one_time">One-time</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
         <Select value={filters.method} onValueChange={(v) => handleFilterChange('method', v)}>
          <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="razorpay">Razorpay</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.currency} onValueChange={(v) => handleFilterChange('currency', v)}>
          <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Currency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="INR">INR</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}