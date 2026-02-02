import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CalendarFilters({ filters, setFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <Select value={filters.service_type} onValueChange={v => handleFilterChange('service_type', v)}>
        <SelectTrigger className="w-full md:w-auto"><SelectValue placeholder="Filter by Service" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Service Types</SelectItem>
          <SelectItem value="holy_mass">Holy Mass</SelectItem>
          <SelectItem value="rosary_blessing">Rosary</SelectItem>
          <SelectItem value="birthday_service">Birthday</SelectItem>
          <SelectItem value="marriage_blessing">Wedding Anniversary</SelectItem>
          <SelectItem value="deathday_service">Prayer for the Dead</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
        <SelectTrigger className="w-full md:w-auto"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.payment_status} onValueChange={v => handleFilterChange('payment_status', v)}>
        <SelectTrigger className="w-full md:w-auto"><SelectValue placeholder="Filter by Payment" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="completed">Paid</SelectItem>
          <SelectItem value="pending">Unpaid</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}