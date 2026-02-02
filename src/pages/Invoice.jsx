import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ServiceBooking } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Printer, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/533fd1448_nlogo.png';
const SIGNATURE_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ebfafd462_F-Sign1.png';

const numberToWords = (num) => {
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (!num || isNaN(num)) return '';
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? '' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim().toUpperCase() + ' RUPEES';
};

export default function InvoicePage() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const idParam = searchParams.get('id');

    useEffect(() => {
        const fetchInvoiceData = async () => {
            setIsLoading(true);
            setError(null);

            if (!idParam) {
                setError('No invoice ID provided in URL.');
                setIsLoading(false);
                return;
            }

            try {
                let foundBookings = [];
                
                try {
                    const singleBooking = await ServiceBooking.get(idParam);
                    if (singleBooking && singleBooking.id) {
                        foundBookings = [singleBooking];
                    }
                } catch (err) {
                    const allServiceBookings = await ServiceBooking.list();
                    foundBookings = allServiceBookings.filter(b => 
                        b.invoice_id === idParam || 
                        b.order_id === idParam ||
                        b.id === idParam
                    );
                }
                
                if (foundBookings.length > 0) {
                    setBookings(foundBookings);
                } else {
                    setError('Invoice not found. Please contact support.');
                    setBookings([]);
                }
            } catch (err) {
                console.error('Error fetching invoice:', err);
                setError('Failed to load invoice. Please try again.');
                setBookings([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoiceData();
    }, [idParam]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Invoice...</p>
                </div>
            </div>
        );
    }
    
    if (error || bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'No invoice data available.'}</p>
                    <p className="text-sm text-gray-500">Invoice ID: {idParam}</p>
                </div>
            </div>
        );
    }

    const firstBooking = bookings[0];
    const subTotal = bookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const cgst = bookings.reduce((sum, b) => sum + (parseFloat(b.cgst_amount) || 0), 0);
    const sgst = bookings.reduce((sum, b) => sum + (parseFloat(b.sgst_amount) || 0), 0);
    const igst = bookings.reduce((sum, b) => sum + (parseFloat(b.igst_amount) || 0), 0);
    const total = subTotal + cgst + sgst + igst;

    const formatServiceType = (serviceType) => {
        if (!serviceType) return '';
        const serviceMap = {
            'holy_mass': 'Holy Mass',
            'rosary_blessing': 'Rosary',
            'birthday_service': 'Birthday Service',
            'marriage_blessing': 'Marriage Blessing',
            'deathday_service': 'Prayer for the Dead',
            'prayer_support': 'Prayer Support',
            'healing_novena': 'Healing Novena'
        };
        return serviceMap[serviceType] || serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const handlePrint = () => window.print();

    const handleDownload = async () => {
        const invoiceData = {
            bookings: bookings.map(b => ({
                id: b.id,
                service_type: b.service_type || 'holy_mass',
                beneficiary_name: b.beneficiary_name || 'N/A',
                booker_name: b.booker_name || 'N/A',
                intention_text: b.intention_text || 'Prayer intention',
                description: b.description || '',
                booking_date: b.booking_date || new Date().toISOString().split('T')[0],
                amount: parseFloat(b.amount) || 0,
                tax_amount: parseFloat(b.tax_amount) || 0,
                cgst_amount: parseFloat(b.cgst_amount) || 0,
                sgst_amount: parseFloat(b.sgst_amount) || 0,
                igst_amount: parseFloat(b.igst_amount) || 0,
                currency: b.currency || 'INR',
                status: b.status || 'confirmed',
                booking_type: b.booking_type || 'one-time',
                booker_email: b.booker_email || 'N/A',
                booker_phone: b.booker_phone || 'N/A',
                created_date: b.created_date || new Date().toISOString(),
                ordination_date: b.ordination_date || null,
                vows_date: b.vows_date || null,
                jubilee_date: b.jubilee_date || null,
                trn: b.trn || 'N/A',
            })),
            totals: {
                subtotal: subTotal,
                cgst: cgst,
                sgst: sgst,
                igst: igst,
                total: total
            },
            meta: {
                booker_info: {
                    name: firstBooking.booker_name || 'N/A',
                    email: firstBooking.booker_email || 'N/A',
                    phone: firstBooking.booker_phone || 'N/A',
                    address: firstBooking.booker_address || 'N/A',
                    state: firstBooking.state || 'N/A',
                    country: firstBooking.country || 'India',
                    pincode: firstBooking.booker_pincode || 'N/A'
                },
                currency: firstBooking.currency || 'INR',
                invoice_id: firstBooking.order_id || `INV-${firstBooking.id ? firstBooking.id.slice(-8).toUpperCase() : 'UNKNOWN'}`,
                invoice_date: new Date().toISOString(),
                trn: firstBooking.trn || firstBooking.order_id || `INV-${firstBooking.id ? firstBooking.id.slice(-8).toUpperCase() : 'UNKNOWN'}`,
            }
        };

        const { generateInvoicePdf } = await import('../components/utils/pdfGenerator');
        const doc = await generateInvoicePdf(invoiceData);
        
        const fileName = `MadhaTV-Invoice-${firstBooking.trn || firstBooking.order_id || (firstBooking.id ? firstBooking.id.slice(-8).toUpperCase() : 'UNKNOWN')}.pdf`;
        doc.save(fileName);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <style>{`
                @media print {
                    body { margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    .invoice-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; min-height: auto !important; }
                    .invoice-wrapper { box-shadow: none !important; margin: 0 !important; border: none !important; }
                }
                .invoice-container {
                    background: white;
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 20mm;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    position: relative;
                }
                @media screen and (max-width: 800px) {
                    .invoice-container {
                        width: 100%;
                        padding: 10px;
                    }
                }
                .logo-img, .signature-img {
                    max-width: 120px;
                    height: auto;
                    display: block;
                }
            `}</style>

            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
                {/* Actions Bar */}
                <div className="bg-gray-100 border-b border-gray-200 p-4 flex justify-between items-center print:hidden">
                    <h2 className="text-lg font-semibold text-gray-800">Actions</h2>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} variant="outline" size="sm" className="flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            Print
                        </Button>
                        <Button onClick={handleDownload} size="sm" className="bg-[#B71C1C] hover:bg-[#8B0000] flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Download
                        </Button>
                    </div>
                </div>

                <div className="invoice-container invoice-wrapper">
                    {/* Header with Logo */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-300">
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-800">Madha Media Renaissance Pvt Ltd</h1>
                            <p className="text-xs text-gray-600 mt-1">No. 150, Luz Church Road, Mylapore, Chennai – 600 004.</p>
                            <p className="text-xs text-gray-600">Phone: 0091-44-24991344, 24993314</p>
                            <p className="text-xs text-gray-600">Email: info@madhatv.in</p>
                        </div>
                        
                        <div className="text-right">
                            <img 
                                src={LOGO_URL}
                                alt="Madha TV Logo" 
                                className="logo-img ml-auto mb-2"
                                onError={(e) => { e.target.style.display='none'; }}
                            />
                            <div className="text-xs mt-2">
                                <p><span className="font-semibold">Invoice No.</span> : {firstBooking.trn || '001'}</p>
                                <p><span className="font-semibold">Order Id</span> : {firstBooking.order_id || '001'}</p>
                                <p><span className="font-semibold">Invoice Date</span> : {format(new Date(firstBooking.created_date), 'dd-MM-yyyy')}</p>
                                <p><span className="font-semibold">Currency Type</span> : {firstBooking.currency || 'INR'}</p>
                            </div>
                        </div>
                    </div>

                    {/* INVOICE Title */}
                    <div className="text-center mb-6">
                        <div className="inline-block border-2 border-gray-800 px-8 py-2">
                            <h2 className="text-2xl font-bold">INVOICE</h2>
                        </div>
                    </div>

                    {/* Billed To */}
                    <div className="mb-6">
                        <h3 className="font-bold text-sm mb-2">Billed To:</h3>
                        <table className="w-full text-xs">
                            <tbody>
                                <tr>
                                    <td className="py-1 w-32">Name</td>
                                    <td className="py-1">: {firstBooking.booker_name || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">Address</td>
                                    <td className="py-1">: {firstBooking.booker_address || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">State & Country</td>
                                    <td className="py-1">: {firstBooking.state || 'N/A'}, {firstBooking.country || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">Pincode</td>
                                    <td className="py-1">: {firstBooking.booker_pincode || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">GSTIN/Unique ID</td>
                                    <td className="py-1">: {'-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">Email</td>
                                    <td className="py-1">: {firstBooking.booker_email || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">Phone Number</td>
                                    <td className="py-1">: {firstBooking.booker_phone || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Services Table */}
                    <div className="mb-6">
                        <table className="w-full border border-gray-800 text-xs">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-800">
                                    <th className="border-r border-gray-800 px-2 py-2 text-left font-bold">Description Of Services</th>
                                    <th className="border-r border-gray-800 px-2 py-2 text-left font-bold">Dedicated to</th>
                                    <th className="border-r border-gray-800 px-2 py-2 text-left font-bold">Dedicated by</th>
                                    <th className="border-r border-gray-800 px-2 py-2 text-left font-bold">Message</th>
                                    <th className="border-r border-gray-800 px-2 py-2 text-left font-bold">Telecast Date</th>
                                    <th className="px-2 py-2 text-right font-bold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking, idx) => (
                                    <tr key={idx} className="border-b border-gray-300">
                                        <td className="border-r border-gray-300 px-2 py-2">{formatServiceType(booking.service_type)}</td>
                                        <td className="border-r border-gray-300 px-2 py-2">{booking.beneficiary_name || 'N/A'}</td>
                                        <td className="border-r border-gray-300 px-2 py-2">{booking.booker_name || 'N/A'}</td>
                                        <td className="border-r border-gray-300 px-2 py-2">{booking.intention_text || '-'}</td>
                                        <td className="border-r border-gray-300 px-2 py-2">{format(new Date(booking.booking_date), 'dd-MM-yyyy')}</td>
                                        <td className="px-2 py-2 text-right">{(parseFloat(booking.amount) || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Company Details and Totals */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-xs">
                           <p className="mb-1"><span className="font-semibold">CIN NO.</span> : U72900TN2008PTC065943</p>
                            <p className="mb-1"><span className="font-semibold">PAN NO.</span> : AADCK3798D</p>
                            <p className="mb-1"><span className="font-semibold">GST REG NO.</span> : 33AADCK3798D1ZJ</p>
                            <p className="mb-1"><span className="font-semibold">Heading No.</span> : 9984</p>
                            <p className="mb-1"><span className="font-semibold">Group</span> : 99846</p>
                            <p className="mb-1"><span className="font-semibold">Service Code</span> : 998465</p>
                            <p className="mb-1"><span className="font-semibold">Service Description</span> : Broadcasting services</p>

                            
              </div>
                        <div className="text-xs">
                            <div className="flex justify-between mb-1">
                                <span>Sub Total</span>
                                <span className="text-right">{subTotal.toFixed(2)}</span>
                            </div>
                            {cgst > 0 && (
                                <div className="flex justify-between mb-1">
                                    <span>CGST : 9%</span>
                                    <span className="text-right">{cgst.toFixed(2)}</span>
                                </div>
                            )}
                            {sgst > 0 && (
                                <div className="flex justify-between mb-1">
                                    <span>SGST : 9%</span>
                                    <span className="text-right">{sgst.toFixed(2)}</span>
                                </div>
                            )}
                            {igst > 0 && (
                                <div className="flex justify-between mb-1">
                                    <span>IGST: 18%</span>
                                    <span className="text-right">{igst.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-right">{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mb-6 text-xs">
                        <p><span className="font-semibold">Amount in words:</span> {numberToWords(Math.round(total))}</p>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="mb-4 text-xs">
                        <h4 className="font-bold mb-1">Terms & Conditions</h4>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>No refund after leasing.</li>
                            <li>You must intimate minimum 5 days before the telecasting date for refund.</li>
                            <li>If we can display your services in desired diet will be postponed to nestable.</li>
                            <li>Once the service dets as herred can't be modified or changed.</li>
                            <li>All the services amount are fixed and can't be changed.</li>
                        </ol>
                     </div>

                    {/* Declaration */}
                    <div className="mb-6 text-xs">
                        <h4 className="font-bold mb-1">Declaration</h4>
                        <p>We declare that this invoice shows actual price of the services described inclusive of taxes and that all particulars are true and correct.</p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-end text-xs mt-8">
                        <div>
                            <p className="font-bold">For Queries Related Services</p>
                            <p>Phone : 0091-44-24991344, 24993314</p>
                            <p>Email : info@madhatv.in</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold mb-1">For Madha Media Renaissance Pvt Ltd</p>
                            <img 
                                src={SIGNATURE_URL}
                                alt="Signature" 
                                className="signature-img ml-auto my-2"
                                onError={(e) => { e.target.style.display='none'; }}
                            />
                            <p className="font-bold">Authorised Signatory</p>
                        </div>
                    </div>

                    {/* Computer Generated */}
                    <div className="text-center mt-6 pt-4 border-t border-gray-300">
                        <p className="text-xs font-bold">This is a computer generated invoice</p>
                    </div>
                </div>
            </div>
        </div>
    );
}