import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Gift, Users, TrendingUp } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DonationStats({ donations }) {
  const completedDonations = donations.filter(d => d.payment_status === 'completed');
  const totalRevenue = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todaysRevenue = completedDonations
    .filter(d => d.created_date.startsWith(today))
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDonors = new Set(completedDonations.map(d => d.donor_email)).size;
  const recurringDonations = completedDonations.filter(d => d.donation_type !== 'one_time').length;

  const stats = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-600" },
    { title: "Today's Donations", value: formatCurrency(todaysRevenue), icon: TrendingUp, color: "text-blue-600" },
    { title: "Unique Donors", value: totalDonors, icon: Users, color: "text-purple-600" },
    { title: "Recurring Donations", value: recurringDonations, icon: Gift, color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-slate-100 ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}