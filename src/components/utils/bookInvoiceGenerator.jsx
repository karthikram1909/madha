const LOGO_URL = '/logo.png';
const SIGNATURE_URL = '/sign.png';

const numberToWords = (num) => {
    const a = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    if (!num || isNaN(num)) return '';
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' CRORE ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' LAKH ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' THOUSAND ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' HUNDRED ' : '';
    str += (n[5] != 0) ? ((str != '') ? '' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    
    // Clean up extra spaces and add RUPEES
    return str.trim().replace(/\s+/g, ' ') + ' RUPEES';
};

export const generateBookInvoicePdf = async (invoiceData) => {
    const { order, items, customer } = invoiceData;
    
    try {
        console.log('📄 Generating invoice with order data:', order);
        
        const invoiceDate = new Date(order.created_date).toLocaleDateString('en-GB');
        
        // Extract and validate values from order
        const subtotal = parseFloat(order.subtotal_amount) || 0;
        const packagingCharge = parseFloat(order.packaging_charge) || 0;
        const cgst = parseFloat(order.cgst_amount) || 0;
        const sgst = parseFloat(order.sgst_amount) || 0;
        const igst = parseFloat(order.igst_amount) || 0;
        const grandTotal = parseFloat(order.total_amount) || 0;
        
        console.log('💰 Invoice amounts:', {
            subtotal,
            packagingCharge,
            cgst,
            sgst,
            igst,
            grandTotal
        });
        
        // Determine if same state based on stored amounts
        const isSameState = cgst > 0 || sgst > 0;
        
        const amountInWords = numberToWords(Math.round(grandTotal));

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${order.trn || order.id.slice(-8).toUpperCase()}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
        }
        
        .invoice-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
            border: 2px solid #000;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
        }
        
        .header-left h1 {
            font-size: 12pt;
            margin-bottom: 5px;
        }
        
        .header-left p {
            font-size: 8pt;
            line-height: 1.3;
        }
        
        .header-center {
            text-align: center;
            margin-top: 10px;
        }
        
        .invoice-box {
            border: 2px solid #000;
            padding: 5px 20px;
            display: inline-block;
            font-size: 12pt;
            font-weight: bold;
        }
        
        .header-right {
            text-align: right;
        }
        
        .header-right img {
            max-width: 100px;
            height: auto;
            margin-bottom: 5px;
            display: block;
            margin-left: auto;
        }
        
        .invoice-details {
            font-size: 8pt;
            line-height: 1.6;
        }
        
        .billed-to {
            margin: 15px 0;
            font-size: 9pt;
        }
        
        .billed-to h3 {
            font-size: 10pt;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        .billed-to table {
            width: 100%;
        }
        
        .billed-to td:first-child {
            width: 150px;
            font-weight: 500;
        }
        
        .books-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9pt;
        }
        
        .books-table th {
            background-color: #f0f0f0;
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
            font-weight: bold;
        }
        
        .books-table td {
            border: 1px solid #000;
            padding: 6px;
        }
        
        .books-table td:last-child,
        .books-table th:last-child {
            text-align: right;
        }
        
        .books-table td:nth-child(2),
        .books-table th:nth-child(2) {
            text-align: center;
        }
        
        .company-details {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            font-size: 8pt;
        }
        
        .company-info {
            flex: 1;
        }
        
        .totals {
            text-align: right;
            width: 45%;
        }
        
        .totals table {
            width: 100%;
            margin-left: auto;
        }
        
        .totals td {
            padding: 3px 0;
        }
        
        .totals td:last-child {
            text-align: right;
            padding-left: 20px;
        }
        
        .totals .total-row {
            border-top: 1px solid #000;
            font-weight: bold;
            padding-top: 5px;
        }
        
        .amount-words {
            margin: 10px 0;
            font-size: 9pt;
        }
        
        .amount-words strong {
            font-weight: bold;
        }
        
        .terms {
            margin: 15px 0;
        }
        
        .terms h4 {
            font-size: 10pt;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .terms ul {
            margin-left: 15px;
            font-size: 7pt;
        }
        
        .terms li {
            margin: 3px 0;
        }
        
        .declaration {
            margin: 15px 0;
            font-size: 8pt;
        }
        
        .declaration h4 {
            font-size: 9pt;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            font-size: 8pt;
        }
        
        .signature {
            text-align: right;
        }
        
        .signature img {
            max-width: 120px;
            height: auto;
            display: block;
            margin-left: auto;
            margin-bottom: 5px;
        }
        
        .signature-line {
            margin-top: 10px;
            margin-bottom: 5px;
        }
        
        .computer-generated {
            text-align: center;
            font-size: 8pt;
            font-weight: bold;
            margin-top: 20px;
        }
        
        @media print {
            .no-print {
                display: none;
            }
            
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .invoice-container {
                border: 2px solid #000;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="header-left">
                <h1>Madha Media Renaissance Pvt Ltd</h1>
                <p>No.150, Luz Church Road, Mylapore, Chennai - 600 004.</p>
                <p>Phone : 0091 44 2499 1344, 24993314  Email : info@madhatv.in</p>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="flex: 1;"></div>
            <div class="header-center" style="flex: 0 0 auto;">
                <div class="invoice-box">INVOICE</div>
            </div>
            <div class="header-right" style="flex: 1;">
                <img src="${LOGO_URL}" alt="Madha TV Logo" crossorigin="anonymous" />
                <div class="invoice-details">
                    <p><strong>Invoice No.:</strong> ${order.trn || order.id.slice(-8).toUpperCase()}</p>
                    <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
                    <p><strong>Currency Type:</strong> ${order.currency || 'INR'}</p>
                </div>
            </div>
        </div>
        
        <div class="billed-to">
            <h3>Billed To :</h3>
            <table>
                <tr>
                    <td>Name</td>
                    <td>: ${customer.name || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Phone Number</td>
                    <td>: ${customer.phone || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Address</td>
                    <td>: ${customer.address || 'N/A'}</td>
                </tr>
                <tr>
                    <td>State & Country</td>
                    <td>: ${order.state || 'N/A'}, ${order.country || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Pincode</td>
                    <td>: ${order.booker_pincode || 'N/A'}</td>
                </tr>
            </table>
        </div>
        
        <table class="books-table">
            <thead>
                <tr>
                    <th>Book</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.book_title || 'Unknown Book'}</td>
                        <td>${item.quantity}</td>
                        <td>${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="company-details">
            <div class="company-info">
                <p><strong>CIN NO.:</strong> U74900TN2008PTC069843</p>
                <p><strong>PAN NO.:</strong> AADCM0434Q</p>
                <p><strong>GST NO.:</strong> 33AADCM0434Q1ZU</p>
                <p><strong>Trickling No.:</strong> 0984</p>
                <p><strong>CESS:</strong> --</p>
                <p><strong>HSN Code:</strong> 4901 10 10</p>
                <p><strong>Service Description:</strong> religious book</p>
            </div>
            <div class="totals">
                <table>
                    <tr>
                        <td>Sub Total</td>
                        <td>${subtotal > 0 ? subtotal.toFixed(2) : '0.00'}</td>
                    </tr>
                    ${isSameState ? `
                    <tr>
                        <td>CGST : 2.5%</td>
                        <td>${cgst > 0 ? cgst.toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr>
                        <td>SGST : 2.5%</td>
                        <td>${sgst > 0 ? sgst.toFixed(2) : '0.00'}</td>
                    </tr>
                    ` : `
                    <tr>
                        <td>IGST : 5%</td>
                        <td>${igst.toFixed(2)}</td>
                    </tr>
                    `}
                    <tr>
                        <td>Package Charge</td>
                        <td>${packagingCharge > 0 ? packagingCharge.toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Total</strong></td>
                        <td><strong>${grandTotal > 0 ? grandTotal.toFixed(2) : '0.00'}</strong></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="amount-words">
            <strong>Amount in words:</strong> ${amountInWords}
        </div>
        
        <div class="terms">
            <h4>Terms & Conditions:-</h4>
            <ul>
                <li>No returns after Delivery.</li>
                <li>Once an order is booked, it can't get back to be receiving due for refund.</li>
                <li>Kindly order product well in prior to the confirmed date of the customer's to main availability date</li>
                <li>Once the service details has been entered,it get be modified or changes.</li>
                <li>All the media product are fixed, and can't be changed.</li>
            </ul>
        </div>
        
        <div class="declaration">
            <h4>Declaration</h4>
            <p>We declare that this invoice shows actual price of the services described inclusive of taxes and that all particulars are true and correct.</p>
        </div>
        
        <div class="footer">
            <div>
                <p><strong>For Queries Related Services</strong></p>
                <p>Phone : 00 91 44 2499 1344, 2499 3314</p>
                <p>Email : info@madhatv.in</p>
            </div>
            <div class="signature">
                <p><strong>For Madha Media Renaissance Pvt Ltd</strong></p>
                <img src="${SIGNATURE_URL}" alt="Signature" crossorigin="anonymous" />
                <p><strong>Authorised Signatory</strong></p>
            </div>
        </div>
        
        <div class="computer-generated">
            This is a computer generated invoice
        </div>
    </div>
</body>
</html>
        `;

        // Return an object that mimics the PDF interface
        return {
            output: (type) => {
                if (type === 'dataurlstring') {
                    return 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
                }
                return htmlContent;
            },
            save: (filename) => {
                // Create a new window for printing - this will trigger browser's "Save as PDF" option
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                
                // Wait for content to load, then trigger print
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.focus();
                        printWindow.print();
                        // Note: Window will close after user saves/cancels the PDF dialog
                    }, 500);
                };
            }
        };

    } catch (error) {
        console.error('Error generating book invoice:', error);
        throw new Error(`Invoice generation failed: ${error.message}`);
    }
};