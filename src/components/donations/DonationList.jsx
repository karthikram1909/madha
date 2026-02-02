
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MailCheck, MailWarning, FileText, Award, Loader2, Globe } from "lucide-react";
import { format } from 'date-fns';
import { generateDonationDocument } from '@/api/functions';
import { toast } from "sonner";

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};

const statusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

const emailStatusColors = {
    sent: 'text-green-600',
    pending: 'text-yellow-600',
    failed: 'text-red-600',
};

const EmailStatusIcon = ({ status }) => {
    if (status === 'sent') return <MailCheck className="w-5 h-5 text-green-600" />;
    if (status === 'failed') return <MailWarning className="w-5 h-5 text-red-600" />;
    return <MailCheck className="w-5 h-5 text-gray-400" />; // Default for pending or null
};

export default function DonationList({ donations, isLoading }) {
    const [downloading, setDownloading] = useState(null);

    const handleDownload = async (donation, documentType) => {
        setDownloading(`${donation.id}-${documentType}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                const response = await generateDonationDocument({ donationId: donation.id, documentType });
                
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                const donorName = (donation.donor_name || 'donor').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/gi, '');
                const filename = documentType === 'receipt'
                  ? `SCC_Receipt_${donation.id.slice(-5)}_${donorName}.pdf`
                  : `madhatv-certificate-${donation.id.slice(-6)}.pdf`;
                
                a.download = filename;
                
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                
                break; // Success - exit retry loop
                
            } catch (error) {
                console.error('Download failed', error);
                
                if (error.response?.data?.error === 'Rate limit exceeded' && retryCount < maxRetries - 1) {
                    retryCount++;
                    toast.info(`Rate limit hit. Retrying in ${retryCount * 2} seconds... (${retryCount}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, retryCount * 2000)); // Exponential backoff
                } else {
                    const errorMessage = error.response?.data?.error || 'Failed to download document. Please try again later.';
                    toast.error(errorMessage);
                    break; // Exit loop for non-rate limit errors or max retries reached
                }
            }
        }
        
        setDownloading(null);
    };

    if (isLoading) {
        return <p>Loading donations...</p>;
    }
    
    if (donations.length === 0) {
        return <p className="text-center text-slate-500 p-10">No donations match the current filters.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {donations.map(donation => (
                        <TableRow key={donation.id}>
                            <TableCell>
                                <div className="font-medium text-slate-800">{donation.donor_name || 'N/A'}</div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                    <Globe className="w-3 h-3"/> {donation.country || 'N/A'}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{formatCurrency(donation.amount, donation.currency)}</div>
                                <div className="text-xs text-slate-500 capitalize">{donation.payment_method}</div>
                            </TableCell>
                            <TableCell><Badge className={statusColors[donation.payment_status] || statusColors.pending}>{donation.payment_status || 'pending'}</Badge></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <EmailStatusIcon status={donation.email_status} />
                                    <span className={`capitalize text-sm ${emailStatusColors[donation.email_status] || 'text-gray-500'}`}>
                                        {donation.email_status || 'pending'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>{format(new Date(donation.created_date), 'PPP')}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleDownload(donation, 'receipt')}
                                        disabled={downloading === `${donation.id}-receipt`}
                                        className="flex items-center gap-1"
                                    >
                                        {downloading === `${donation.id}-receipt` ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                        Receipt
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleDownload(donation, 'certificate')}
                                        disabled={downloading === `${donation.id}-certificate`}
                                        className="flex items-center gap-1"
                                    >
                                        {downloading === `${donation.id}-certificate` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                        Certificate
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
