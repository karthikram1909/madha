import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { formatISTDate } from '../components/utils/dateUtils';

// API configuration
const API_BASE_URL = '/api/v2'; // Use Vite proxy

export default function UserInvoices() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    // useEffect(() => {
    //     const fetchUserAndInvoices = async () => {
    //         setIsLoading(true);
    //         try {
    //             // Get user from localStorage
    //             const userString = localStorage.getItem('user');
    //             if (!userString || userString === 'undefined') {
    //                 throw new Error('User not authenticated');
    //             }

    //             const userObj = JSON.parse(userString);
    //             const userId = userObj.id;
    //             setUser(userObj);

    //             // Check if running on localhost (development mode)
    //             const isLocalhost = window.location.hostname === 'localhost' || 
    //                                window.location.hostname === '127.0.0.1';

    //             if (isLocalhost) {
    //                 // Mock data for local development
    //                 console.warn('Running in localhost - using mock invoice data');
    //                 const mockBookings = [
    //                     {
    //                         id: 'invoice_001',
    //                         service_type: 'holy_mass',
    //                         beneficiary_name: 'John Doe',
    //                         booking_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    //                         created_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    //                         amount: 500,
    //                         tax_amount: 90,
    //                         currency: 'INR',
    //                         status: 'completed',
    //                         payment_status: 'completed',
    //                         trn: 'INV-2025-001',
    //                         order_id: 'ORD-2025-001',
    //                         intentions: 'For good health',
    //                         isLegacy: false
    //                     },
    //                     {
    //                         id: 'invoice_002',
    //                         service_type: 'special_prayer',
    //                         beneficiary_name: 'Mary Smith',
    //                         booking_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    //                         created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    //                         amount: 300,
    //                         tax_amount: 54,
    //                         currency: 'INR',
    //                         status: 'confirmed',
    //                         payment_status: 'completed',
    //                         trn: 'INV-2025-002',
    //                         order_id: 'ORD-2025-002',
    //                         intentions: 'For family',
    //                         isLegacy: false
    //                     },
    //                     {
    //                         id: 'invoice_003',
    //                         service_type: 'holy_mass',
    //                         beneficiary_name: 'David Johnson',
    //                         booking_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    //                         created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    //                         amount: 500,
    //                         tax_amount: 90,
    //                         currency: 'INR',
    //                         status: 'published',
    //                         payment_status: 'completed',
    //                         trn: 'INV-2025-003',
    //                         order_id: 'ORD-2025-003',
    //                         intentions: 'Thanksgiving',
    //                         isLegacy: false
    //                     }
    //                 ];

    //                 // Simulate API delay
    //                 await new Promise(resolve => setTimeout(resolve, 500));
    //                 setBookings(mockBookings);
    //             } else {
    //                 // Production: Make actual API calls
    //                 // Adjust these endpoints to match your actual backend API
    //                 const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
    //                     method: 'GET',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                     credentials: 'include',
    //                 });

    //                 if (!response.ok) {
    //                     throw new Error('Failed to fetch invoices');
    //                 }

    //                 const data = await response.json();
    //                 setBookings(Array.isArray(data) ? data : data.bookings || []);
    //             }
    //         } catch (error) {
    //             console.error("Failed to fetch user invoices:", error);
    //             toast.error("Failed to load invoices. Please try again.");
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchUserAndInvoices();
    // }, []);
    
useEffect(() => {
        const fetchUserAndInvoices = async () => {
            setIsLoading(true);
            try {
                // Get user from localStorage
                const userString = localStorage.getItem('user');
                if (!userString || userString === 'undefined') {
                    throw new Error('User not authenticated');
                }

                const userObj = JSON.parse(userString);
                const userId = userObj.id;
                setUser(userObj);

                // Call the real billing details API
                const response = await fetch('https://secure.madhatv.in/api/v2/billing_dtls.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ userid: userId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch invoices');
                }

                // Get response as text first to handle potential JSON parsing issues
                const responseText = await response.text();
                
                // More aggressive cleaning of control characters
                const cleanedText = responseText
                    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove ALL control characters
                    .replace(/\\/g, '\\\\') // Escape backslashes first
                    .replace(/\\\\"/g, '\\"') // But fix escaped quotes
                    .replace(/\\\\n/g, '\\n') // Fix common escape sequences
                    .replace(/\\\\r/g, '\\r')
                    .replace(/\\\\t/g, '\\t')
                    .trim();
                
                let data;
                try {
                    data = JSON.parse(cleanedText);
                } catch (parseError) {
                    console.error('JSON Parse Error:', parseError);
                    console.error('Full response length:', responseText.length);
                    console.error('Response text (first 1000 chars):', responseText.substring(0, 1000));
                    console.error('Response text around error position:', responseText.substring(45400, 45550));
                    
                    // Try alternative parsing - replace the problematic data and try again
                    try {
                        // Last resort: try to extract just the payment_details array
                        const match = responseText.match(/"payment_details"\s*:\s*(\[[\s\S]*?\])\s*\}/);
                        if (match) {
                            const paymentDetailsJson = match[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '');
                            const paymentDetails = JSON.parse(paymentDetailsJson);
                            data = {
                                error: false,
                                nodata: false,
                                payment_details: paymentDetails
                            };
                            console.warn('Used fallback parsing method');
                        } else {
                            throw new Error('Could not extract payment details');
                        }
                    } catch (fallbackError) {
                        console.error('Fallback parsing also failed:', fallbackError);
                        throw new Error('Invalid response format from server');
                    }
                }
                
                if (data.error) {
                    throw new Error('API returned an error');
                }

                // Transform API data to match the component's expected format
                const transformedBookings = (data.payment_details || []).map(detail => ({
                    id: detail.id,
                    service_type: 'holy_mass', // The API doesn't provide this, using default
                    beneficiary_name: detail.name,
                    booking_date: detail.date, // Using date as booking_date
                    created_date: detail.date,
                    amount: parseFloat(detail.invoice_amount) || 0,
                    tax_amount: 0, // Not provided in API
                    currency: detail.currency === 'india' ? 'INR' : 'USD',
                    status: detail.payment_status === 'paid' ? 'completed' : 'pending',
                    payment_status: detail.payment_status,
                    trn: detail.invoice_number,
                    order_id: detail.invoice_number,
                    intentions: '', // Not provided in API
                    invoice_url: detail.invoice, // Store the invoice URL
                    isLegacy: true // Mark as legacy data from old API
                }));

                // Sort by date in descending order (latest first)
                transformedBookings.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

                setBookings(transformedBookings);
            } catch (error) {
                console.error("Failed to fetch user invoices:", error);
                toast.error("Failed to load invoices. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserAndInvoices();
    }, []);
    
    const getStatusVariant = (status) => {
        switch(status) {
            case 'completed': return 'success';
            case 'confirmed': return 'default';
            case 'published': return 'success';
            case 'pending': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const handleDownloadInvoice = async (booking) => {
        setDownloadingId(booking.id);
        toast.info("Generating invoice PDF...");
        
        try {
            // Check if running on localhost
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';

            if (isLocalhost) {
                // Mock download for localhost
                toast.info("PDF download simulated (localhost mode)");
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast.success("In production, invoice would be downloaded here!");
                return;
            }

            // Production: Call backend to generate PDF
            const response = await fetch(`${API_BASE_URL}/invoices/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ booking_id: booking.id })
            });

            if (!response.ok) {
                throw new Error('Failed to generate invoice');
            }

            const data = await response.json();

            // Use the client-side PDF generator with the invoice data
            const { generateInvoicePdf } = await import('../components/utils/pdfGenerator');
            
            // Prepare the invoice data
            const invoiceData = {
                bookings: data.bookings || [booking],
                totals: data.totals || {
                    subtotal: parseFloat(booking.amount) || 0,
                    cgst: parseFloat(booking.cgst_amount) || 0,
                    sgst: parseFloat(booking.sgst_amount) || 0,
                    igst: parseFloat(booking.igst_amount) || 0,
                    total: (parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0)
                },
                meta: data.meta || {
                    invoice_id: booking.trn || booking.order_id || booking.id.slice(-8).toUpperCase(),
                    invoice_date: new Date().toISOString(),
                    currency: booking.currency || 'INR',
                    trn: booking.trn || 'N/A',
                    booker_info: {
                        name: booking.booker_name || '',
                        email: booking.booker_email || '',
                        phone: booking.booker_phone || '',
                        address: booking.booker_address || '',
                        state: booking.state || '',
                        country: booking.country || '',
                        pincode: booking.booker_pincode || '',
                        gstin: booking.gstin || '',
                    }
                }
            };

            // Generate and trigger download
            const doc = await generateInvoicePdf(invoiceData);
            const invoiceNumber = booking.trn || booking.order_id || booking.id.slice(-8).toUpperCase();
            doc.save(`MadhaTV-Invoice-${invoiceNumber}.pdf`);

            toast.success("Invoice downloaded successfully!");
        } catch (error) {
            console.error("Failed to generate invoice:", error);
            toast.error("Could not generate invoice. Please try again.");
        } finally {
            setDownloadingId(null);
        }
    };

    if (isLoading) {
        return (
            <UserDashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin h-12 w-12 text-red-600" />
                </div>
            </UserDashboardLayout>
        );
    }

    return (
        <UserDashboardLayout>
            <div className="p-6 md:p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">My Invoices</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {bookings.length === 0 ? (
                            <div className="text-center py-10">
                                <FileText className="mx-auto h-12 w-12 text-slate-300" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900">No invoices found</h3>
                                <p className="mt-1 text-sm text-slate-500">Your invoices from bookings will appear here.</p>
                             </div>
                         ) : (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <Card key={booking.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
                                        <div className="flex-1 mb-4 md:mb-0">
                                            <p className="font-bold capitalize">{booking.service_type?.replace(/_/g, ' ')}</p>
                                            <p className="text-sm text-slate-600">For: {booking.beneficiary_name}</p>
                                            <p className="text-sm text-slate-500">
                                                Booked on: {formatISTDate(booking.created_date, 'DD/MM/YYYY')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Telecast Date: {formatISTDate(booking.booking_date, 'DD/MM/YYYY')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Amount: {booking.currency === 'USD' ? '$' : '₹'}{((parseFloat(booking.amount) || 0) + (parseFloat(booking.tax_amount) || 0)).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                                            <div className="flex gap-2">
                                                <Link to={createPageUrl(`Invoice?id=${booking.id}`)} target="_blank">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleDownloadInvoice(booking)}
                                                    disabled={downloadingId === booking.id}
                                                >
                                                    {downloadingId === booking.id ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4 mr-2" />
                                                    )}
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>
        </UserDashboardLayout>
    );
}