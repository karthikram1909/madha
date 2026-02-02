import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard } from 'lucide-react';

import RazorpaySettings from './RazorpaySettings';
import PayPalSettings from './PayPalSettings';

export default function ServiceBookingSettings() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Booking Payment Settings</h2>
        <p className="text-slate-600">Configure payment gateways for service bookings.</p>
      </div>

      <Tabs defaultValue="razorpay" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="razorpay"><Wallet className="w-4 h-4 mr-2"/>Razorpay (India)</TabsTrigger>
          <TabsTrigger value="paypal"><CreditCard className="w-4 h-4 mr-2"/>PayPal (Intl)</TabsTrigger>
        </TabsList>

        <TabsContent value="razorpay" className="mt-4">
          <RazorpaySettings configType="bookings" />
        </TabsContent>

        <TabsContent value="paypal" className="mt-4">
          <PayPalSettings configType="bookings" />
        </TabsContent>
      </Tabs>
    </div>
  );
}