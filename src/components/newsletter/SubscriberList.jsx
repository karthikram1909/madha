import React, { useState, useEffect, useMemo } from 'react';
import { NewsletterSubscriber } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriberList() {
    const [subscribers, setSubscribers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSubscribers();
    }, []);
    
    const filteredSubscribers = useMemo(() => {
        if (!searchTerm) return subscribers;
        return subscribers.filter(sub => 
            sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.source && sub.source.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, subscribers]);

    const loadSubscribers = async () => {
        setIsLoading(true);
        try {
            const data = await NewsletterSubscriber.list('-created_date');
            setSubscribers(data);
        } catch (error) {
            console.error("Error loading subscribers:", error);
        }
        setIsLoading(false);
    };

    if (isLoading) return <p>Loading subscribers...</p>;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>All Subscribers ({filteredSubscribers.length})</CardTitle>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search subscribers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Subscribed On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubscribers.map((subscriber) => (
                            <TableRow key={subscriber.id}>
                                <TableCell className="font-medium">{subscriber.email}</TableCell>
                                <TableCell className="capitalize">{subscriber.status}</TableCell>
                                <TableCell className="capitalize">{subscriber.source?.replace(/_/g, ' ') || 'N/A'}</TableCell>
                                <TableCell>{format(new Date(subscriber.created_date), 'PPpp')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}