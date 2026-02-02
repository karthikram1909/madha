import React from "react";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BookingFilters({ filters, setFilters }) {
  return (
    <CardContent className="border-b border-slate-100 pb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Tabs 
            value={filters.status} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">All Status</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select 
            value={filters.service_type} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, service_type: value }))}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="holy_mass">Holy Mass</SelectItem>
              <SelectItem value="prayer_support">Prayer Support</SelectItem>
              <SelectItem value="rosary_blessing">Rosary Blessing</SelectItem>
              <SelectItem value="birthday_service">Birthday Service</SelectItem>
              <SelectItem value="deathday_service">Death Anniversary</SelectItem>
              <SelectItem value="marriage_blessing">Marriage Blessing</SelectItem>
              <SelectItem value="healing_novena">Healing Novena</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.payment_status} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, payment_status: value }))}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="completed">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.payment_method} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, payment_method: value }))}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Gateway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gateways</SelectItem>
              <SelectItem value="razorpay">Razorpay</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.currency} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, currency: value }))}
          >
            <SelectTrigger className="w-full sm:w-28">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="flex-1">
            <label className="text-sm font-medium text-slate-600 mb-1 block">Date From</label>
            <Input 
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
        </div>
        <div className="flex-1">
            <label className="text-sm font-medium text-slate-600 mb-1 block">Date To</label>
            <Input 
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
        </div>
      </div>
    </CardContent>
  );
}