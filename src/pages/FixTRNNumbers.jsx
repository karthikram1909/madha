import React, { useState } from 'react';
import { ServiceBooking } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';

export default function FixTRNNumbers() {
    const [isFixing, setIsFixing] = useState(false);
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);

    const fixAllTRNs = async () => {
        setIsFixing(true);
        setProgress('Loading all bookings...');
        setResult(null);

        try {
            // Get ALL bookings sorted by creation date (oldest first)
            const allBookings = await ServiceBooking.list('created_date', 10000);
            
            if (!allBookings || allBookings.length === 0) {
                toast.info('No bookings found to fix');
                setIsFixing(false);
                return;
            }

            setProgress(`Found ${allBookings.length} bookings. Assigning TRNs...`);

            // Assign sequential TRNs starting from 1
            let updatedCount = 0;
            let errorCount = 0;
            const errors = [];

            for (let i = 0; i < allBookings.length; i++) {
                const booking = allBookings[i];
                const newTRN = (i + 1).toString().padStart(3, '0'); // 001, 002, 003, etc.

                try {
                    // Update the booking with new TRN
                    await ServiceBooking.update(booking.id, { trn: newTRN });
                    updatedCount++;
                    
                    // Update progress every 10 bookings
                    if ((i + 1) % 10 === 0 || i === allBookings.length - 1) {
                        setProgress(`Updated ${i + 1} of ${allBookings.length} bookings...`);
                    }
                } catch (error) {
                    console.error(`Failed to update booking ${booking.id}:`, error);
                    errorCount++;
                    errors.push(`Booking ID ${booking.id}: ${error.message}`);
                }
            }

            // Show result
            const resultMessage = {
                total: allBookings.length,
                updated: updatedCount,
                errors: errorCount,
                errorDetails: errors
            };

            setResult(resultMessage);
            
            if (errorCount === 0) {
                toast.success(`✅ Successfully updated ${updatedCount} bookings!`);
            } else {
                toast.warning(`Updated ${updatedCount} bookings with ${errorCount} errors`);
            }

        } catch (error) {
            console.error('TRN fix error:', error);
            toast.error(`Failed to fix TRNs: ${error.message}`);
        } finally {
            setIsFixing(false);
            setProgress(null);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-6">
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <RefreshCw className="w-6 h-6 text-orange-600" />
                            Fix TRN Numbers
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-2">
                            This utility will regenerate all TRN numbers sequentially based on booking creation date
                        </p>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-900">
                                <strong>Important:</strong> This will reassign TRN numbers to ALL bookings in the database.
                                Bookings will be numbered sequentially (001, 002, 003...) based on their creation date.
                                This action cannot be undone.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-slate-900 mb-2">What this will do:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                                    <li>Load all bookings from the database</li>
                                    <li>Sort them by creation date (oldest first)</li>
                                    <li>Assign sequential TRN numbers: 001, 002, 003, etc.</li>
                                    <li>Update each booking with the new TRN</li>
                                </ul>
                            </div>

                            {progress && (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    <AlertDescription className="text-blue-900">
                                        {progress}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {result && (
                                <Alert className={result.errors === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                                    <CheckCircle className={`h-4 w-4 ${result.errors === 0 ? 'text-green-600' : 'text-yellow-600'}`} />
                                    <AlertDescription className={result.errors === 0 ? 'text-green-900' : 'text-yellow-900'}>
                                        <div className="space-y-2">
                                            <div className="font-semibold">TRN Fix Complete!</div>
                                            <div className="text-sm space-y-1">
                                                <div>Total Bookings: {result.total}</div>
                                                <div>Successfully Updated: {result.updated}</div>
                                                {result.errors > 0 && (
                                                    <>
                                                        <div className="text-red-800">Errors: {result.errors}</div>
                                                        <details className="mt-2">
                                                            <summary className="cursor-pointer">View Error Details</summary>
                                                            <div className="mt-2 p-2 bg-white rounded text-xs font-mono max-h-40 overflow-y-auto">
                                                                {result.errorDetails.map((err, idx) => (
                                                                    <div key={idx} className="text-red-700">{err}</div>
                                                                ))}
                                                            </div>
                                                        </details>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={fixAllTRNs}
                                disabled={isFixing}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg"
                            >
                                {isFixing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Fixing TRNs...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Fix All TRN Numbers
                                    </>
                                )}
                            </Button>

                            {result && result.errors === 0 && (
                                <div className="text-center text-sm text-slate-600">
                                    <p>✅ TRN numbers have been successfully fixed!</p>
                                    <p>You can now go back to the Service Bookings page to verify.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}