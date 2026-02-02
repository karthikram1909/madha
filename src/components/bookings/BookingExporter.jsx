import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import { toast } from 'sonner';
import { ServiceBooking } from '@/api/entities';

const BookingExporter = () => {
    const [telecastMonth, setTelecastMonth] = useState('');
    const [razorpayMonth, setRazorpayMonth] = useState('');
    const [paypalMonth, setPaypalMonth] = useState('');
    const [isExporting, setIsExporting] = useState(null);

    const monthOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        // Past 6 months
        for (let i = 6; i > 0; i--) {
            options.push(subMonths(now, i));
        }
        // Current month
        options.push(now);
        // Next month
        options.push(addMonths(now, 1));
        
        return options.map(date => ({
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM - yyyy')
        }));
    }, []);

    // Generate CSV content
    const generateCSV = (data, headers) => {
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header] === null || row[header] === undefined ? '' : row[header];
                const escaped = ('' + val).replace(/"/g, '""'); // escape double quotes
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    };

    const handleExport = async (exportType, monthYear) => {
        if (!monthYear) {
            toast.error('Please select a month to export.');
            return;
        }
        
        setIsExporting(exportType);
        const toastId = toast.loading(`Exporting data for ${monthYear}...`);

        try {
            // Fetch all bookings from the database
            const allBookings = await ServiceBooking.list('-created_date');

            // Filter bookings based on export type
            let filteredBookings = allBookings.filter(booking => {
                if (exportType === 'telecasting_date') {
                    return booking.booking_date && booking.booking_date.startsWith(monthYear);
                }
                if (exportType === 'razorpay_invoice') {
                    return booking.payment_method === 'razorpay' && booking.created_date && booking.created_date.startsWith(monthYear);
                }
                if (exportType === 'paypal_invoice') {
                    return booking.payment_method === 'paypal' && booking.created_date && booking.created_date.startsWith(monthYear);
                }
                return false;
            });

            // Handle empty results
            if (filteredBookings.length === 0) {
                toast.warning(`No data found for ${exportType} in ${monthYear}`, { id: toastId });
                setIsExporting(null);
                return;
            }

            // Define CSV headers based on export type
            let headers;
            let dataToExport;

            if (exportType === 'razorpay_invoice' || exportType === 'paypal_invoice') {
                // Invoice export format with exact column names
                headers = [
                    'Paid_Date', 'Invoice_Number', 'Name', 'State', 'Order_Id', 'Total', 'Tax', 'Sub_Total',
                    'Phone_Number', 'Email', 'Address', 'Address2', 'Service_Amount', 'Description_of_service',
                    'Dedicated_to', 'Dedicated_by'
                ];

                dataToExport = filteredBookings.map(b => ({
                    'Paid_Date': b.created_date ? new Date(b.created_date).toISOString().split('T')[0] : '',
                    'Invoice_Number': b.invoice_id || b.trn || '',
                    'Name': b.booker_name || '',
                    'State': b.state || '',
                    'Order_Id': b.order_id || '',
                    'Total': (parseFloat(b.amount) || 0) + (parseFloat(b.tax_amount) || 0),
                    'Tax': parseFloat(b.tax_amount) || 0,
                    'Sub_Total': parseFloat(b.amount) || 0,
                    'Phone_Number': b.booker_phone || '',
                    'Email': b.booker_email || '',
                    'Address': b.booker_address || '',
                    'Address2': b.booker_pincode || '',
                    'Service_Amount': parseFloat(b.amount) || 0,
                    'Description_of_service': b.service_type ? b.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '',
                    'Dedicated_to': b.beneficiary_name || '',
                    'Dedicated_by': b.booker_name || ''
                }));
            } else {
                // Telecasting date export format
                headers = [
                    'invoice_number', 'order_id', 'invoice_amount', 'name', 'email', 'phonenumber',
                    'address1', 'address2', 'country', 'state', 'zipcode', 'dedicatedto', 'intentions', 'telecastdate'
                ];

                dataToExport = filteredBookings.map(b => ({
                    'invoice_number': b.invoice_id || b.trn || '',
                    'order_id': b.order_id || '',
                    'invoice_amount': (parseFloat(b.amount) || 0) + (parseFloat(b.tax_amount) || 0),
                    'name': b.booker_name || '',
                    'email': b.booker_email || '',
                    'phonenumber': b.booker_phone || '',
                    'address1': b.booker_address || '',
                    'address2': b.booker_pincode || '',
                    'country': b.country || '',
                    'state': b.state || '',
                    'zipcode': b.booker_pincode || '',
                    'dedicatedto': b.beneficiary_name || '',
                    'intentions': b.intention_text || '',
                    'telecastdate': b.booking_date || ''
                }));
            }

            // Generate CSV
            const csv = generateCSV(dataToExport, headers);
            const filename = `bookings-${exportType}-${monthYear}.csv`;

            // Download CSV file
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            const recordCount = filteredBookings.length;
            toast.success(`Export completed successfully! Downloaded ${recordCount} record${recordCount !== 1 ? 's' : ''}.`, { id: toastId });
        } catch (error) {
            console.error('Export error:', error);
            const errorMessage = error?.message || 'Export failed. Please try again.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsExporting(null);
        }
    };

    const ExportCard = ({ title, value, onChange, onExport, exportType }) => (
        <Card className="shadow-md border-slate-200 bg-white">
            <CardHeader>
                <CardTitle className="text-md font-semibold text-slate-800">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a month..." />
                    </SelectTrigger>
                    <SelectContent>
                        {monthOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => onExport(exportType, value)}
                    disabled={isExporting === exportType}
                >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting === exportType ? 'Exporting...' : 'Export'}
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <Card className="mt-8 bg-slate-100/50 shadow-lg border-0">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Monthly Export Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ExportCard
                    title="Export by Telecasting Date"
                    value={telecastMonth}
                    onChange={setTelecastMonth}
                    onExport={handleExport}
                    exportType="telecasting_date"
                />
                <ExportCard
                    title="Sort by Invoice Date (Razorpay)"
                    value={razorpayMonth}
                    onChange={setRazorpayMonth}
                    onExport={handleExport}
                    exportType="razorpay_invoice"
                />
                <ExportCard
                    title="Sort by Invoice Date (PayPal)"
                    value={paypalMonth}
                    onChange={setPaypalMonth}
                    onExport={handleExport}
                    exportType="paypal_invoice"
                />
            </CardContent>
        </Card>
    );
};

export default BookingExporter;