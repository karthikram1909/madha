import React, { useState, useEffect } from 'react';
import { NewsletterCampaign, NewsletterSubscriber } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Send, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { sendNewsletter } from '@/api/functions';
import { toast } from 'sonner';

const getStatusBadge = (status) => {
    switch (status) {
        case 'draft': return <Badge variant="secondary">Draft</Badge>;
        case 'sending': return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Sending</Badge>;
        case 'sent': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Sent</Badge>;
        case 'scheduled': return <Badge className="bg-purple-100 text-purple-800"><Clock className="w-3 h-3 mr-1"/> Scheduled</Badge>;
        case 'failed': return <Badge variant="destructive">Failed</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

export default function CampaignList({ onEdit, refreshKey }) {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(null); // campaign.id of the sending campaign

    useEffect(() => {
        loadCampaigns();
    }, [refreshKey]);

    const loadCampaigns = async () => {
        setIsLoading(true);
        try {
            const data = await NewsletterCampaign.list('-created_date');
            setCampaigns(data);
        } catch (error) {
            console.error("Error loading campaigns:", error);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await NewsletterCampaign.delete(id);
                toast.success("Campaign deleted successfully.");
                loadCampaigns();
            } catch (error) {
                console.error("Failed to delete campaign:", error);
                toast.error("Failed to delete campaign.");
            }
        }
    };
    
    const handleSend = async (campaign) => {
        const totalSubscribers = await NewsletterSubscriber.filter({ status: 'subscribed' });
        if(window.confirm(`Are you sure you want to send the campaign "${campaign.subject}" to ${totalSubscribers.length} subscribers?`)) {
            setIsSending(campaign.id);
            try {
                await NewsletterCampaign.update(campaign.id, { status: 'sending' });
                loadCampaigns(); // To show "sending" status immediately

                const { data, error } = await sendNewsletter({ campaignId: campaign.id });

                if (error) {
                    throw new Error(error.message || "Unknown error occurred.");
                }

                toast.success(data.message);
                
            } catch(error) {
                console.error("Failed to send campaign:", error);
                toast.error(`Failed to send campaign: ${error.message}`);
                await NewsletterCampaign.update(campaign.id, { status: 'failed' });
            } finally {
                setIsSending(null);
                loadCampaigns();
            }
        }
    };

    if (isLoading) return <p>Loading campaigns...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent To</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                                <TableCell className="font-medium">{campaign.subject}</TableCell>
                                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                                <TableCell>{campaign.sent_to_count || 'N/A'}</TableCell>
                                <TableCell>
                                    {campaign.status === 'scheduled' && campaign.scheduled_for
                                        ? `Scheduled for ${format(new Date(campaign.scheduled_for), 'PPp')}`
                                        : `Created on ${format(new Date(campaign.created_date), 'PP')}`
                                    }
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {(campaign.status === 'draft' || campaign.status === 'failed') && (
                                         <Button variant="outline" size="sm" onClick={() => handleSend(campaign)} disabled={isSending === campaign.id}>
                                            {isSending === campaign.id ? 
                                                <><Loader2 className="w-4 h-4 mr-1 animate-spin"/>Sending...</> : 
                                                <><Send className="w-4 h-4 mr-1"/> Send Now</>
                                            }
                                        </Button>
                                    )}
                                    <Button variant="outline" size="icon" onClick={() => onEdit(campaign)} disabled={isSending}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(campaign.id)} disabled={isSending}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}