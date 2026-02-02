import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tv, Calendar, Mail } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const actions = [
  { title: "New Program", icon: Tv, page: "ProgramSchedule" },
  { title: "New Booking", icon: Calendar, page: "ServiceBookings" },
  { title: "New Campaign", icon: Mail, page: "Newsletter" },
  { title: "Add Content", icon: Plus, page: "WebsiteContentManager" },
];

export default function QuickActions() {
  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map(action => (
          <Link to={createPageUrl(action.page)} key={action.title}>
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <action.icon className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{action.title}</span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}