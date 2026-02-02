import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link2, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageBanner from '@/components/website/PageBanner';

export default function BatchUserLinker() {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleRunBatchLink = async () => {
        setIsRunning(true);
        setError(null);
        setResults(null);

        try {
            const response = await base44.functions.invoke('batchLinkAllUsers');
            
            if (response.data.success) {
                setResults(response.data.results);
            } else {
                setError(response.data.error || 'Batch linking failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during batch linking');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <PageBanner 
                pageKey="user_management"
                title="Batch User Data Linking"
                description="Link all users with their legacy data automatically"
            />

            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="w-5 h-5" />
                            Automatic User Data Linking
                        </CardTitle>
                        <CardDescription>
                            This process will automatically link all Base44 users with their legacy AppUser profiles and historical booking data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>
                                This is a one-time setup process. It will:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Match all Base44 users with AppUser records by email/phone</li>
                                    <li>Update Base44 user profiles with complete data (name, address, etc.)</li>
                                    <li>Link legacy booking/invoice data to the correct users</li>
                                    <li>Make all historical data accessible to users automatically</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        <Button 
                            onClick={handleRunBatchLink}
                            disabled={isRunning}
                            size="lg"
                            className="w-full"
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processing... This may take a few minutes
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5 mr-2" />
                                    Run Batch User Linking
                                </>
                            )}
                        </Button>

                        {error && (
                            <Alert variant="destructive">
                                <XCircle className="w-4 h-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {results && (
                            <Card className="bg-green-50 border-green-200">
                                <CardHeader>
                                    <CardTitle className="text-green-900 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Batch Linking Complete!
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {results.linked}
                                            </div>
                                            <div className="text-sm text-slate-600">Users Linked</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {results.already_linked}
                                            </div>
                                            <div className="text-sm text-slate-600">Already Linked</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {results.bookings_updated}
                                            </div>
                                            <div className="text-sm text-slate-600">Bookings Updated</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600">
                                                {results.failed}
                                            </div>
                                            <div className="text-sm text-slate-600">Failed</div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-700 bg-white p-3 rounded">
                                        <strong>Summary:</strong> Processed {results.total_base44_users} Base44 users and {results.total_app_users} AppUser records.
                                    </div>

                                    {results.errors && results.errors.length > 0 && (
                                        <div className="bg-white p-3 rounded">
                                            <strong className="text-red-600">Errors:</strong>
                                            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                                {results.errors.slice(0, 10).map((err, idx) => (
                                                    <li key={idx} className="text-slate-600">
                                                        {err.email}: {err.error}
                                                    </li>
                                                ))}
                                                {results.errors.length > 10 && (
                                                    <li className="text-slate-500 italic">
                                                        ... and {results.errors.length - 10} more errors
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}