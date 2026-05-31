import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatINRForPdf = (value: number): string => {
  // jsPDF's built-in fonts don't reliably support the ₹ glyph, so we use an ASCII-safe prefix.
  const amount = Math.round(Number(value) || 0);
  return `INR ${amount.toLocaleString('en-IN')}`;
};

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  companyName: string | null;
  dealValue: number;
  notes: string | null;
  referrerName: string;
}

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [99, 102, 241]; // Indigo
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];

  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('QBITS', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Partner Portal', 20, 33);

  // Invoice Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceNumber, pageWidth - 20, 33, { align: 'right' });

  // Invoice Details Box
  const startY = 55;
  
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', 20, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceDate.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 55, startY);

  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', 20, startY + 7);
  doc.setFont('helvetica', 'normal');
  const dueDate = new Date(data.invoiceDate);
  dueDate.setDate(dueDate.getDate() + 15);
  doc.text(dueDate.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 55, startY + 7);

  // Bill To Section
  const billToY = startY + 25;
  doc.setFillColor(249, 250, 251);
  doc.rect(20, billToY - 5, pageWidth - 40, 35, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 25, billToY + 5);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.text(data.clientName, 25, billToY + 14);
  
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  if (data.companyName) {
    doc.text(data.companyName, 25, billToY + 21);
  }
  doc.text(data.clientEmail, 25, billToY + 28);

  // From Section (Right side)
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', pageWidth - 85, billToY + 5);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.text('Qbits Technologies', pageWidth - 85, billToY + 14);
  
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Partner Program', pageWidth - 85, billToY + 21);
  doc.text(`Ref: ${data.referrerName}`, pageWidth - 85, billToY + 28);

  // Services Table
  const tableY = billToY + 45;
  const tableAvailableWidth = pageWidth - 40; // 20mm left + 20mm right
  const qtyCol = 20;
  const rateCol = 30;
  const amountCol = 30;
  const descCol = tableAvailableWidth - (qtyCol + rateCol + amountCol);

  autoTable(doc, {
    startY: tableY,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: [
      [
        data.notes || 'Professional Services',
        '1',
        formatINRForPdf(data.dealValue),
        formatINRForPdf(data.dealValue),
      ],
    ],
    theme: 'plain',
    styles: {
      fontSize: 10,
      textColor,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      overflow: 'linebreak',
      lineColor: [229, 231, 235],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: descCol },
      1: { cellWidth: qtyCol, halign: 'center' },
      2: { cellWidth: rateCol, halign: 'right' },
      3: { cellWidth: amountCol, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals Section
  const totalsX = pageWidth - 80;
  
  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX - 20, finalY, pageWidth - 20, finalY);
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(10);
  doc.text('Subtotal:', totalsX, finalY + 10);
  doc.setTextColor(...textColor);
  doc.text(formatINRForPdf(data.dealValue), pageWidth - 20, finalY + 10, { align: 'right' });

  doc.setTextColor(...mutedColor);
  doc.text('Tax (0%):', totalsX, finalY + 18);
  doc.setTextColor(...textColor);
  doc.text(formatINRForPdf(0), pageWidth - 20, finalY + 18, { align: 'right' });

  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX - 20, finalY + 23, pageWidth - 20, finalY + 23);

  doc.setFillColor(...primaryColor);
  doc.rect(totalsX - 20, finalY + 25, pageWidth - totalsX, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, finalY + 33);
  doc.text(formatINRForPdf(data.dealValue), pageWidth - 20, finalY + 33, { align: 'right' });

  // Payment Terms
  const termsY = finalY + 55;
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', 20, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text('Payment is due within 15 days of invoice date.', 20, termsY + 7);
  doc.text('Please include the invoice number in your payment reference.', 20, termsY + 14);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Qbits Partner Portal | contact@qbits.in', pageWidth / 2, footerY + 6, { align: 'center' });

  return doc;
};

export const downloadInvoice = (data: InvoiceData): void => {
  const doc = generateInvoicePDF(data);
  doc.save(`${data.invoiceNumber}.pdf`);
};

export const getInvoiceBlob = (data: InvoiceData): Blob => {
  const doc = generateInvoicePDF(data);
  return doc.output('blob');
};
