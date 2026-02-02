import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  HeadphonesIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

export default function TicketStats({ tickets }) {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;

    const stats = [
        {
            title: 'Total Tickets',
            value: totalTickets,
            icon: HeadphonesIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Open',
            value: openTickets,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'In Progress',
            value: inProgressTickets,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            title: 'Resolved',
            value: resolvedTickets,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Urgent',
            value: urgentTickets,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat, index) => (
                <Card key={index} className="bg-white shadow-lg border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}