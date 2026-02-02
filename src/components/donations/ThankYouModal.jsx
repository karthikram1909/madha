import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Award, Download, ExternalLink, Loader2, X, CreditCard } from "lucide-react";
import { generateDonationDocument } from '@/api/functions';
import { toast } from 'sonner';

export default function ThankYouModal({ isOpen, onClose, donationData, paymentReference }) {
    const [downloading, setDownloading] = useState(null);

    const handleDownload = async (documentType) => {
        setDownloading(documentType);
        try {
            const response = await generateDonationDocument({ donationId: donationData.id, documentType });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `madhatv-${documentType}-${donationData.id.slice(-6)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.success(`${documentType === 'certificate' ? 'Certificate' : 'Receipt'} downloaded successfully!`);
        } catch (error) {
            console.error('Download failed', error);
            toast.error('Failed to download document.');
        } finally {
            setDownloading(null);
        }
    };

    const handleView = async (documentType) => {
        try {
            const response = await generateDonationDocument({ donationId: donationData.id, documentType });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('View failed', error);
            toast.error('Failed to open document.');
        }
    };

    const currencySymbol = donationData?.currency === 'INR' ? '₹' : '$';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-3">
                            <CheckCircle className="w-8 h-8" />
                            Thank You for Your Donation!
                        </DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-800 mb-2">
                            {currencySymbol}{donationData?.amount?.toLocaleString()}
                        </div>
                        <p className="text-lg text-slate-600">
                            Your generous contribution has been received successfully.
                        </p>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Payment Reference:</strong> {paymentReference}
                            </p>
                        </div>
                    </div>

                    <Alert className="bg-green-50 border-green-200 text-green-700">
                        <Award className="h-4 w-4" />
                        <AlertDescription>
                            A receipt and certificate have been sent to your email address ({donationData?.donor_email}).
                        </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    Donation Receipt
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-slate-600">Official receipt for your donation with payment details and contact information.</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleView('receipt')}
                                        className="flex-1"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload('receipt')}
                                        disabled={downloading === 'receipt'}
                                        className="flex-1"
                                    >
                                        {downloading === 'receipt' ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downloading...</>
                                        ) : (
                                            <><Download className="w-4 h-4 mr-2" />Download</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    Certificate of Appreciation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-slate-600">Beautiful certificate from Commission for Social Communications Society recognizing your generous contribution.</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleView('certificate')}
                                        className="flex-1"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload('certificate')}
                                        disabled={downloading === 'certificate'}
                                        className="flex-1"
                                    >
                                        {downloading === 'certificate' ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downloading...</>
                                        ) : (
                                            <><Download className="w-4 h-4 mr-2" />Download</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center pt-4 border-t">
                        <p className="text-slate-600 mb-4">
                            "The liberal soul shall be made fat: and he that watereth shall be watered also himself." - Proverbs 11:25
                        </p>
                        <Button 
                            onClick={onClose}
                            className="bg-[#B71C1C] hover:bg-[#D32F2F] text-white px-8"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}