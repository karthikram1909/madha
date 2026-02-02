import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, DollarSign, Gift, Users } from "lucide-react";

export default function DonationSection({ contentTemplates }) {
  const getDonationCTA = () => {
    const template = contentTemplates.find(t => t.template_key === 'donation_cta');
    return template?.content_english || 'Your contribution powers our mission. Support Madha TV today.';
  };

  return (
    <Card className="bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] text-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Support Our Mission
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-100 mb-6 text-sm leading-relaxed">
          {getDonationCTA()}
        </p>
        
        <div className="space-y-3">
          <Button className="w-full bg-white text-[#B71C1C] hover:bg-red-50 justify-start">
            <DollarSign className="w-4 h-4 mr-2" />
            One-time Donation
          </Button>
          <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-[#B71C1C] justify-start">
            <Gift className="w-4 h-4 mr-2" />
            Monthly Support
          </Button>
          <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-[#B71C1C] justify-start">
            <Users className="w-4 h-4 mr-2" />
            Become a Patron
          </Button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-red-400">
          <div className="text-center">
            <p className="text-xs text-red-100 mb-2">This month's goal</p>
            <div className="w-full bg-red-800 rounded-full h-2 mb-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '68%' }} />
            </div>
            <p className="text-sm font-medium">₹2,04,000 of ₹3,00,000 raised</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}