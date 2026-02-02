// PDF Generator using jsPDF for direct download
import { getCurrentISTDate, formatISTDate } from './dateUtils';

// ABSOLUTE URLs for logo and signature - ensuring they work in all contexts (email, download, view)
const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/533fd1448_nlogo.png';
const SIGNATURE_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ebfafd462_F-Sign1.png';

const safeNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

const formatServiceType = (serviceType) => {
    if (!serviceType) return '';
    const serviceMap = {
        holy_mass: 'Holy Mass',
        rosary_blessing: 'Rosary',
        birthday_service: 'Birthday Service',
        marriage_blessing: 'Marriage Blessing',
        deathday_service: 'Prayer for the Dead',
        prayer_support: 'Prayer Support',
        healing_novena: 'Healing Novena',
    };
    return (
        serviceMap[serviceType] ||
        serviceType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
};

const numberToWords = (num) => {
    const a = [
        '',
        'ONE',
        'TWO',
        'THREE',
        'FOUR',
        'FIVE',
        'SIX',
        'SEVEN',
        'EIGHT',
        'NINE',
        'TEN',
        'ELEVEN',
        'TWELVE',
        'THIRTEEN',
        'FOURTEEN',
        'FIFTEEN',
        'SIXTEEN',
        'SEVENTEEN',
        'EIGHTEEN',
        'NINETEEN',
    ];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    if (!num || isNaN(num)) return '';
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' CRORE ' : '';
    str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' LAKH ' : '';
    str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' THOUSAND ' : '';
    str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' HUNDRED ' : '';
    str += n[5] != 0 ? (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    // Clean up extra spaces and add RUPEES
    return str.trim().replace(/\s+/g, ' ') + ' RUPEES';
};

// Enhanced image loading with retry and fallback
const loadImageAsBase64 = async (url, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Loading image from ${url} (attempt ${attempt}/${maxRetries})`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'image/png,image/jpeg,image/*',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log(`Successfully loaded image from ${url}`);
                    resolve(reader.result);
                };
                reader.onerror = (error) => {
                    console.error(`FileReader error for ${url}:`, error);
                    reject(error);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error(`Error loading image (attempt ${attempt}/${maxRetries}):`, error);

            if (attempt === maxRetries) {
                console.error(`Failed to load image after ${maxRetries} attempts: ${url}`);
                return null;
            }

            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
    }
    return null;
};

export const generateInvoicePdf = async (invoiceData) => {
    try {
        console.log('Starting PDF invoice generation...');

        const { default: jsPDF } = await import('jspdf');

        const bookerInfo = invoiceData.meta.booker_info;
        const bookings = invoiceData.bookings;
        const totals = invoiceData.totals;

        // Use IST for invoice date
        const invoiceDate = getCurrentISTDate();
        const formattedInvoiceDate = formatISTDate(invoiceDate, 'DD/MM/YYYY');

        // Load images
        console.log('Loading logo and signature images...');
        const [logoBase64, signatureBase64] = await Promise.all([
            loadImageAsBase64(LOGO_URL),
            loadImageAsBase64(SIGNATURE_URL),
        ]);

        if (!logoBase64) console.warn('⚠️ Logo failed to load - invoice will be generated without logo');
        if (!signatureBase64)
            console.warn('⚠️ Signature failed to load - invoice will be generated without signature');

        // Create PDF
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // === FULL PAGE BORDER (FIRST PAGE) ===
        const margin = 10;
        doc.setLineWidth(0.6);
        doc.setDrawColor(0, 0, 0);
        doc.rect(
            margin,
            margin,
            pageWidth - margin * 2,
            pageHeight - margin * 2,
            'S'
        );
        let yPos = 15;



        // Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Madha Media Renaissance Pvt Ltd', 15, yPos);
        yPos += 5;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('No. 150, Luz Church Road, Mylapore, Chennai – 600 004.', 15, yPos);
        yPos += 4;
        doc.text('Phone: 0091-44-24991344, 24993314  Email: info@madhatv.in', 15, yPos);

        // Logo
        if (logoBase64) {
            try {
                const logoWidth = 35;  // Adjust size as you want
                const logoHeight = logoWidth * (60 / 196); // exact ratio

                const logoX = pageWidth - logoWidth - 10;
                const logoY = 12;

                doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
            } catch (e) {
                console.error('Error adding logo to PDF:', e);
            }
        }

        // Invoice details on right
        yPos = 32;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const trnNumber = invoiceData.meta.trn || invoiceData.meta.invoice_id || 'N/A';
        const orderId = invoiceData.meta.order_id || invoiceData.bookings?.[0]?.order_id || 'N/A';

        console.log('📄 PDF Invoice - TRN:', trnNumber, 'Order ID:', orderId);

        doc.text(`Invoice No.: ${trnNumber}`, pageWidth - 15, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Order ID.: ${orderId}`, pageWidth - 15, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Invoice Date: ${formattedInvoiceDate}`, pageWidth - 15, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Currency: ${invoiceData.meta.currency}`, pageWidth - 15, yPos, { align: 'right' });

        // Line separator
        yPos = 50;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(15, yPos, pageWidth - 15, yPos);

        // INVOICE title
        yPos += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const titleWidth = doc.getTextWidth('INVOICE');
        doc.rect((pageWidth - titleWidth) / 2 - 5, yPos - 5, titleWidth + 10, 10, 'S');
        doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });

        // Billed To
        yPos += 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Billed To:', 15, yPos);


        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        const billedToData = [
            ['Name', `: ${bookerInfo.name || 'N/A'}`],
            ['Address', `: ${bookerInfo.address || 'N/A'}`],
            ['State & Country', `: ${bookerInfo.state || 'N/A'}, ${bookerInfo.country || 'N/A'}`],
            ['Pincode', `: ${bookerInfo.pincode || 'N/A'}`],
            ['Email', `: ${bookerInfo.email || 'N/A'}`],
            ['Phone Number', `: ${bookerInfo.phone || 'N/A'}`],
        ];

        billedToData.forEach(([label, value]) => {
            doc.text(label, 15, yPos);
            doc.text(value, 50, yPos);
            yPos += 4;
        });

        // Small extra gap so phone number never touches the table
        yPos += 15; // ensures table never touches customer details
 
        // === SERVICES TABLE ===

        // Column widths (Option 1)
        const rowHeight = 12;
        const colWidths = [22, 22, 22, 75, 22, 15]; // Description, Ded To, Ded By, Message, Telecast Date, Amount
        const colPositions = [15];
        for (let i = 0; i < colWidths.length - 1; i++) {
            colPositions.push(colPositions[i] + colWidths[i]);
        }

        // Table header
        const headerHeight = rowHeight;
        const headerY = yPos;
        doc.setFillColor(240, 240, 240);
        doc.setLineWidth(0.3);

        // Header background & border
        doc.rect(15, headerY, pageWidth - 30, headerHeight, 'F');
        doc.rect(15, headerY, pageWidth - 30, headerHeight, 'S');

        // Vertical lines
        for (let i = 1; i < colPositions.length; i++) {
            doc.line(colPositions[i], headerY, colPositions[i], headerY + headerHeight);
        }

        // Header text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        const headerTextY = headerY + 6;
        doc.text('Description', colPositions[0] + 2, headerTextY);
        doc.text('Dedicated to', colPositions[1] + 2, headerTextY);
        doc.text('Dedicated by', colPositions[2] + 2, headerTextY);
        doc.text('Message', colPositions[3] + 2, headerTextY);
        doc.text('Telecast Date', colPositions[4] + 2, headerTextY);
        doc.text('Amount', colPositions[5] + 2, headerTextY);

        // First row Y position
        yPos = headerY + headerHeight;

        // Booking rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);

        const isSubscriptionInvoice =
            bookings.length > 1 &&
            bookings.some((b) => b.booking_type === 'monthly' || b.booking_type === 'yearly');

        const subscriptionRowHeight = 14;
        const normalRowHeight = rowHeight;
        const effectiveRowBaseHeight = isSubscriptionInvoice ? subscriptionRowHeight : normalRowHeight;

        const firstPageThreshold = pageHeight - 120;
        const subsequentPageThreshold = pageHeight - 40;

        const addNewPageWithHeader = () => {
            doc.addPage();

            // ✅ DEFINE PAGE SIZE INSIDE FUNCTION (VERY IMPORTANT)
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // ✅ FULL PAGE BORDER (ALL 4 SIDES)
            const margin = 10;
            doc.setLineWidth(0.6);
            doc.setDrawColor(0, 0, 0);
            doc.rect(
                margin,
                margin,
                pageWidth - margin * 2,
                pageHeight - margin * 2,
                'S'
            );

            let newYPos = 20;


            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Madha Media Renaissance Pvt Ltd - Invoice (Continued)', 15, newYPos);
            newYPos += 8;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Invoice No.: ${trnNumber}`, pageWidth - 15, newYPos, { align: 'right' });
            newYPos += 10;

            // Header on continuation page
            doc.setFillColor(240, 240, 240);
            doc.rect(15, newYPos, pageWidth - 30, headerHeight, 'F');
            doc.rect(15, newYPos, pageWidth - 30, headerHeight, 'S');

            for (let i = 1; i < colPositions.length; i++) {
                doc.line(colPositions[i], newYPos, colPositions[i], newYPos + headerHeight);
            }

            const headerY2 = newYPos + 7;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text('Description', colPositions[0] + 2, headerY2);
            doc.text('Dedicated to', colPositions[1] + 2, headerY2);
            doc.text('Dedicated by', colPositions[2] + 2, headerY2);
            doc.text('Message', colPositions[3] + 2, headerY2);
            doc.text('Telecast Date', colPositions[4] + 2, headerY2);
            doc.text('Amount', colPositions[5] + 2, headerY2);

            newYPos += headerHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);

            return newYPos;
        };

        let isFirstPage = true;

        bookings.forEach((booking, index) => {
            const currentThreshold = isFirstPage ? firstPageThreshold : subsequentPageThreshold;

            if (yPos > currentThreshold) {
                yPos = addNewPageWithHeader();
                isFirstPage = false;
            }

            const serviceDescription = formatServiceType(booking.service_type);
            const beneficiaryName = booking.beneficiary_name || booking.beneficiaryName || 'N/A';
            const bookerName = booking.booker_name || booking.bookerName || 'N/A';
            const rawIntention =
                booking.intention_text || booking.intentionText || booking.description || '-';

            // ✅ Intention limited to max 90 characters, but fully visible with wrapping
            const intentionText = rawIntention.length > 90 ? rawIntention.slice(0, 90) : rawIntention;

            const bookingDate = booking.booking_date || booking.bookingDate;
            const amount = safeNumber(booking.amount);

            // Split text for wrapping based on new column widths
            const descLines = doc.splitTextToSize(serviceDescription, colWidths[0] - 4);
            const messageLines = doc.splitTextToSize(intentionText, colWidths[3] - 4);

            const maxLines = Math.max(descLines.length, messageLines.length, 1);
            const currentRowHeight = Math.max(
                effectiveRowBaseHeight,
                maxLines * 4 + 2 // 4pt line height approx
            );

            // Alternate row background
            if (index % 2 === 1) {
                doc.setFillColor(250, 250, 250);
                doc.rect(15, yPos, pageWidth - 30, currentRowHeight, 'F');
            }

            // Row border
            doc.setDrawColor(200, 200, 200);
            doc.rect(15, yPos, pageWidth - 30, currentRowHeight, 'S');

            // Vertical column lines
            for (let i = 1; i < colPositions.length; i++) {
                doc.line(colPositions[i], yPos, colPositions[i], yPos + currentRowHeight);
            }

            // Description
            if (isSubscriptionInvoice) {
                const truncatedDesc = doc.splitTextToSize(serviceDescription, colWidths[0] - 4);
                doc.text(truncatedDesc[0] || serviceDescription, colPositions[0] + 2, yPos + 6);
            } else {
                doc.text(descLines, colPositions[0] + 2, yPos + 3);
            }

            // Dedicated to / by
            const truncatedBeneficiary = doc.splitTextToSize(beneficiaryName, colWidths[1] - 4);
            const truncatedBooker = doc.splitTextToSize(bookerName, colWidths[2] - 4);

            doc.text(
                truncatedBeneficiary[0] || beneficiaryName,
                colPositions[1] + 2,
                yPos + (isSubscriptionInvoice ? 6 : 3)
            );
            doc.text(
                truncatedBooker[0] || bookerName,
                colPositions[2] + 2,
                yPos + (isSubscriptionInvoice ? 6 : 3)
            );

            // ✅ Message – full (up to 90 chars) wrapped inside the 75mm cell
            doc.text(messageLines, colPositions[3] + 2, yPos + 4);

            // Telecast Date
            let dateText = '-';
            if (bookingDate) {
                const dateObj = new Date(bookingDate);
                if (!isNaN(dateObj.getTime())) {
                    dateText = formatISTDate(dateObj, 'DD/MM/YYYY');
                }
            }
            doc.text(dateText, colPositions[4] + 2, yPos + (isSubscriptionInvoice ? 6 : 3));

            // Amount
            doc.text(amount.toFixed(2), colPositions[5] + 2, yPos + (isSubscriptionInvoice ? 6 : 3));

            yPos += currentRowHeight;
        });

        // If no space for footer, add new page
        if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = 20;
        }

        yPos += 10;
        // === COMPANY DETAILS & TOTALS ===
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const companyY = yPos;

        // Left – Company details
        doc.text('CIN NO.: U72900TN2008PTC065943', 15, companyY);
        doc.text('PAN NO.: AADCK3798D', 15, companyY + 4);
        doc.text('GST REG NO.: 33AADCK3798D1ZJ', 15, companyY + 8);
        doc.text('Heading No.: 9984', 15, companyY + 12);
        doc.text('Group: 99846', 15, companyY + 16);
        doc.text('Service Code: 998465', 15, companyY + 20);
        doc.text('Service Description: Broadcasting services', 15, companyY + 24);

        // Right – Totals
        const totalsX = pageWidth - 15;
        let totalsY = companyY;

        doc.text('Sub Total', totalsX - 40, totalsY);
        doc.text(safeNumber(totals.subtotal).toFixed(2), totalsX, totalsY, { align: 'right' });
        totalsY += 4;

        if (safeNumber(totals.cgst) > 0) {
            doc.text('CGST : 9%', totalsX - 40, totalsY);
            doc.text(safeNumber(totals.cgst).toFixed(2), totalsX, totalsY, { align: 'right' });
            totalsY += 4;
        }

        if (safeNumber(totals.sgst) > 0) {
            doc.text('SGST : 9%', totalsX - 40, totalsY);
            doc.text(safeNumber(totals.sgst).toFixed(2), totalsX, totalsY, { align: 'right' });
            totalsY += 4;
        }

        if (safeNumber(totals.igst) > 0) {
            doc.text('IGST : 18%', totalsX - 40, totalsY);
            doc.text(safeNumber(totals.igst).toFixed(2), totalsX, totalsY, { align: 'right' });
            totalsY += 4;
        }

        doc.setLineWidth(0.3);
        doc.line(totalsX - 40, totalsY, totalsX, totalsY);
        totalsY += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Total', totalsX - 40, totalsY);
        doc.text(safeNumber(totals.total).toFixed(2), totalsX, totalsY, { align: 'right' });

        yPos = Math.max(companyY + 32, totalsY + 8);

        // Amount in words
        doc.setFont('helvetica', 'bold');
        doc.text('Amount in words:', 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(numberToWords(Math.round(safeNumber(totals.total))), 50, yPos);

        // Terms & Conditions
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Terms & Conditions', 15, yPos);

        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);

        const terms = [
            '1. No refund after booking the service.',
            '2. You must inform us at least 5 days before the telecast date to request a refund.',
            '3. If we are unable to display your service on the requested date, it will be postponed to the next available date.',
            '4. Once the service details are confirmed, they cannot be modified or changed.',
            '5. All service charges are fixed and cannot be altered.',
        ];

        terms.forEach((term) => {
            const lines = doc.splitTextToSize(term, pageWidth - 30);
            doc.text(lines, 15, yPos);
            yPos += lines.length * 4;
        });

        // Declaration
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('Declaration', 15, yPos);

        yPos += 4;
        doc.setFont('helvetica', 'normal');
        doc.text(
            'We declare that this invoice shows actual price of the services described inclusive of taxes and that all particulars are true and correct.',
            15,
            yPos
        );

        // Footer line
        yPos += 10;
        doc.setLineWidth(0.2);
        doc.line(15, yPos, pageWidth - 15, yPos);
        yPos += 5;

        // Footer: contact
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('For Queries Related Services', 15, yPos);
        yPos += 4;
        doc.setFont('helvetica', 'normal');
        doc.text('Phone: 0091-44-24991344, 24993314', 15, yPos);
        yPos += 4;
        doc.text('Email: info@madhatv.in', 15, yPos);

        // Signature block
        const signatureBlockX = pageWidth - 65;
        let signatureY = yPos - 16;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('For Madha Media Renaissance Pvt Ltd', signatureBlockX, signatureY);

        if (signatureBase64) {
            try {
                signatureY += 4;
                const signatureWidth = 40;
                const signatureHeight = 15;
                doc.addImage(signatureBase64, 'PNG', signatureBlockX, signatureY, signatureWidth, signatureHeight);
                signatureY += signatureHeight + 2;
            } catch (e) {
                console.error('Error adding signature to PDF:', e);
                signatureY += 17;
            }
        } else {
            signatureY += 17;
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Authorised Signatory', signatureBlockX + 5, signatureY);

        // Computer generated note
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('This is a computer generated invoice', pageWidth / 2, pageHeight - 10, { align: 'center' });

        console.log('✅ PDF invoice generated successfully');
        return doc;
    } catch (error) {
        console.error('❌ Error generating invoice:', error);
        throw new Error(`Invoice generation failed: ${error.message}`);
    }
};