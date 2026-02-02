import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard } from 'lucide-react';

import RazorpaySettings from './RazorpaySettings';
import PayPalSettings from './PayPalSettings';

export default function BookPurchaseSettings() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Book Purchase Settings</h2>
        <p className="text-slate-600">Configure payment gateways for the "Buy Books" module. These keys are independent of other modules.</p>
      </div>

      <Tabs defaultValue="razorpay" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="razorpay"><Wallet className="w-4 h-4 mr-2"/>Razorpay (India)</TabsTrigger>
          <TabsTrigger value="paypal"><CreditCard className="w-4 h-4 mr-2"/>PayPal (Intl)</TabsTrigger>
        </TabsList>

        <TabsContent value="razorpay" className="mt-4">
          <RazorpaySettings configType="books" />
        </TabsContent>

        <TabsContent value="paypal" className="mt-4">
          <PayPalSettings configType="books" />
        </TabsContent>
      </Tabs>
    </div>
  );
}