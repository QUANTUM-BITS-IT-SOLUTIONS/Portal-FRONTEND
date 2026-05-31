import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResourceContent {
  title: string;
  type: 'pdf' | 'presentation' | 'video' | 'template' | 'guide';
  content: string;
}

const addHeader = (doc: jsPDF, title: string) => {
  // Add gradient-like header background
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add Qbits branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('QBITS', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Partner Program Resources', 20, 28);
  
  // Document title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 55);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  return 65; // Return Y position after header
};

const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, pageHeight - 20, 190, pageHeight - 20);
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Qbits Partner Program | partners@qbits.com | Confidential', 20, pageHeight - 12);
  doc.text(`Page ${pageNumber}`, 190, pageHeight - 12, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
};

const parseContentIntoSections = (content: string): { heading: string; body: string[] }[] => {
  const lines = content.split('\n');
  const sections: { heading: string; body: string[] }[] = [];
  let currentSection: { heading: string; body: string[] } | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines at the start
    if (!currentSection && !trimmed) continue;
    
    // Check if it's a heading (all caps or ends with specific patterns)
    const isHeading = (
      (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('✓') && !trimmed.startsWith('✗')) ||
      trimmed.match(/^(SLIDE \d+|TEMPLATE \d+|SCRIPT \d+|CASE STUDY \d+|STEP \d+|\d+\.):/i) ||
      trimmed.match(/^={3,}$/) ||
      trimmed.match(/^-{3,}$/)
    );
    
    if (isHeading && !trimmed.match(/^[=-]{3,}$/)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { heading: trimmed.replace(/[=\-]+$/, '').trim(), body: [] };
    } else if (trimmed && !trimmed.match(/^[=-]{3,}$/) && currentSection) {
      currentSection.body.push(trimmed);
    } else if (trimmed && !trimmed.match(/^[=-]{3,}$/) && !currentSection) {
      currentSection = { heading: '', body: [trimmed] };
    }
  }
  
  if (currentSection && (currentSection.heading || currentSection.body.length > 0)) {
    sections.push(currentSection);
  }
  
  return sections;
};

export const generateResourcePDF = (resource: ResourceContent): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHeader(doc, resource.title);
  let pageNumber = 1;
  
  const sections = parseContentIntoSections(resource.content);
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 30;
  
  for (const section of sections) {
    // Check if we need a new page
    if (yPos > pageHeight - marginBottom - 40) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    // Section heading
    if (section.heading) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      
      // Handle long headings
      const headingLines = doc.splitTextToSize(section.heading, 170);
      doc.text(headingLines, 20, yPos);
      yPos += headingLines.length * 6 + 4;
    }
    
    // Section body
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    for (const line of section.body) {
      if (yPos > pageHeight - marginBottom) {
        addFooter(doc, pageNumber);
        doc.addPage();
        pageNumber++;
        yPos = 20;
      }
      
      // Handle bullet points with different styling
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('✓') || line.startsWith('✗');
      const indent = isBullet ? 25 : 20;
      
      // Check for special formatting
      if (line.startsWith('✓')) {
        doc.setTextColor(34, 197, 94); // Green
      } else if (line.startsWith('✗')) {
        doc.setTextColor(239, 68, 68); // Red
      } else if (line.startsWith('→')) {
        doc.setTextColor(139, 92, 246); // Purple
      } else {
        doc.setTextColor(60, 60, 60);
      }
      
      const wrappedLines = doc.splitTextToSize(line, 170 - (isBullet ? 5 : 0));
      
      for (let i = 0; i < wrappedLines.length; i++) {
        if (yPos > pageHeight - marginBottom) {
          addFooter(doc, pageNumber);
          doc.addPage();
          pageNumber++;
          yPos = 20;
        }
        doc.text(wrappedLines[i], indent, yPos);
        yPos += 5;
      }
    }
    
    yPos += 5; // Space between sections
  }
  
  // Add final footer
  addFooter(doc, pageNumber);
  
  return doc;
};

export const generatePitchDeckPDF = (content: string): jsPDF => {
  const doc = new jsPDF('landscape');
  const slides = content.split(/SLIDE \d+:/i).filter(s => s.trim());
  
  slides.forEach((slideContent, index) => {
    if (index > 0) doc.addPage();
    
    const lines = slideContent.trim().split('\n').filter(l => l.trim());
    const slideTitle = lines[0] || `Slide ${index + 1}`;
    const slideBody = lines.slice(1);
    
    // Slide background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Header bar
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 297, 10, 'F');
    
    // Slide number
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}/${slides.length}`, 287, 7, { align: 'right' });
    
    // Qbits logo area
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(10, 15, 40, 15, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('QBITS', 15, 25);
    
    // Slide title
    doc.setFontSize(24);
    doc.setTextColor(30, 41, 59);
    doc.text(slideTitle, 148, 50, { align: 'center' });
    
    // Slide content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    
    let yPos = 75;
    for (const line of slideBody) {
      if (yPos > 180) break;
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        doc.setFillColor(59, 130, 246);
        doc.circle(25, yPos - 2, 2, 'F');
        doc.text(trimmed.substring(1).trim(), 32, yPos);
      } else {
        doc.text(trimmed, 20, yPos);
      }
      yPos += 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Qbits Partner Pitch Deck | Confidential', 148, 200, { align: 'center' });
  });
  
  return doc;
};

export const generateEmailTemplatesPDF = (content: string): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHeader(doc, 'Email Templates');
  let pageNumber = 1;
  
  const templates = content.split(/TEMPLATE \d+:|---/).filter(t => t.trim() && !t.includes('QBITS EMAIL TEMPLATES'));
  
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i].trim();
    if (!template) continue;
    
    if (yPos > 220) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    // Template card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, yPos - 5, 180, 60, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, yPos - 5, 180, 60, 3, 3, 'S');
    
    const lines = template.split('\n').filter(l => l.trim());
    const title = lines[0]?.replace(/[-=]+/g, '').trim() || `Template ${i + 1}`;
    
    // Template title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(title, 20, yPos + 5);
    
    // Template preview
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    
    let previewY = yPos + 15;
    for (let j = 1; j < Math.min(lines.length, 6); j++) {
      const line = lines[j].trim();
      if (line && previewY < yPos + 50) {
        const wrapped = doc.splitTextToSize(line, 170);
        doc.text(wrapped[0] + (wrapped.length > 1 ? '...' : ''), 20, previewY);
        previewY += 7;
      }
    }
    
    yPos += 70;
  }
  
  addFooter(doc, pageNumber);
  return doc;
};

export const generateCaseStudiesPDF = (content: string): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHeader(doc, 'Client Success Stories');
  let pageNumber = 1;
  
  const cases = content.split(/CASE STUDY \d+:/).filter(c => c.trim() && !c.includes('QBITS CASE STUDIES'));
  
  for (const caseStudy of cases) {
    if (!caseStudy.trim()) continue;
    
    if (yPos > 180) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    const lines = caseStudy.trim().split('\n').filter(l => l.trim() && !l.match(/^-{3,}$/));
    const title = lines[0]?.replace(/[-=]+/g, '').trim() || 'Case Study';
    
    // Case study card
    doc.setFillColor(240, 253, 244); // Light green background
    doc.roundedRect(15, yPos - 5, 180, 75, 3, 3, 'F');
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos - 5, 180, 75, 3, 3, 'S');
    
    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text(title, 20, yPos + 5);
    
    // Content
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let contentY = yPos + 15;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (contentY > yPos + 65) break;
      
      if (line.startsWith('•') || line.startsWith('Client:') || line.startsWith('Challenge:') || line.startsWith('Solution:')) {
        doc.setTextColor(21, 128, 61);
        doc.setFont('helvetica', 'bold');
      } else if (line.startsWith('RESULTS')) {
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
      } else if (line.includes('Quote:') || line.includes('"')) {
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'italic');
      } else {
        doc.setTextColor(55, 65, 81);
        doc.setFont('helvetica', 'normal');
      }
      
      const wrapped = doc.splitTextToSize(line, 170);
      doc.text(wrapped[0], 20, contentY);
      contentY += 7;
    }
    
    yPos += 85;
  }
  
  addFooter(doc, pageNumber);
  return doc;
};

export const generateWhatsAppScriptsPDF = (content: string): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHeader(doc, 'WhatsApp Outreach Scripts');
  let pageNumber = 1;
  
  const scripts = content.split(/SCRIPT \d+:|---/).filter(s => s.trim() && !s.includes('QBITS WHATSAPP'));
  
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i].trim();
    if (!script || script.startsWith('TIPS FOR')) continue;
    
    if (yPos > 200) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    const lines = script.split('\n').filter(l => l.trim() && !l.match(/^-{3,}$/));
    const title = lines[0]?.replace(/[-=]+/g, '').trim() || `Script ${i + 1}`;
    
    // WhatsApp-style bubble
    doc.setFillColor(220, 248, 198); // WhatsApp green bubble
    doc.roundedRect(15, yPos - 5, 180, 50, 8, 8, 'F');
    
    // Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 72);
    doc.text(title, 22, yPos + 5);
    
    // Script preview
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    
    let scriptY = yPos + 15;
    for (let j = 1; j < Math.min(lines.length, 5); j++) {
      const line = lines[j].trim();
      if (scriptY < yPos + 40 && line) {
        const wrapped = doc.splitTextToSize(line, 165);
        doc.text(wrapped[0] + (wrapped.length > 1 ? '...' : ''), 22, scriptY);
        scriptY += 7;
      }
    }
    
    yPos += 60;
  }
  
  // Tips section
  if (yPos > 200) {
    addFooter(doc, pageNumber);
    doc.addPage();
    pageNumber++;
    yPos = 20;
  }
  
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(15, yPos, 180, 40, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text('Pro Tips for WhatsApp Outreach', 20, yPos + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const tips = [
    '• Keep messages short and friendly',
    '• Best times: 10-11 AM or 7-8 PM',
    '• Always personalize with their name'
  ];
  tips.forEach((tip, i) => {
    doc.text(tip, 20, yPos + 22 + (i * 6));
  });
  
  addFooter(doc, pageNumber);
  return doc;
};

export const generateHandbookPDF = (content: string): jsPDF => {
  const doc = new jsPDF();
  
  // Cover page
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 297, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('QBITS', 105, 100, { align: 'center' });
  
  doc.setFontSize(24);
  doc.text('Partner Handbook', 105, 120, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Complete Guide to Success', 105, 140, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Version 2024.1', 105, 260, { align: 'center' });
  doc.text('partners@qbits.com', 105, 270, { align: 'center' });
  
  // Table of Contents
  doc.addPage();
  let yPos = addHeader(doc, 'Table of Contents');
  
  const tocItems = [
    { title: '1. Getting Started', page: 3 },
    { title: '2. Commission Structure', page: 4 },
    { title: '3. How to Refer', page: 5 },
    { title: '4. Best Practices', page: 6 },
    { title: '5. Support & Resources', page: 7 },
    { title: '6. FAQs', page: 8 }
  ];
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  tocItems.forEach((item, i) => {
    doc.setTextColor(59, 130, 246);
    doc.text(item.title, 30, yPos + (i * 15));
    doc.setTextColor(148, 163, 184);
    doc.text(`.....................................`, 100, yPos + (i * 15));
    doc.text(`${item.page}`, 180, yPos + (i * 15));
  });
  
  // Content pages
  const sections = parseContentIntoSections(content);
  let pageNumber = 2;
  
  doc.addPage();
  pageNumber++;
  yPos = 20;
  
  for (const section of sections) {
    if (yPos > 250) {
      addFooter(doc, pageNumber);
      doc.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    if (section.heading) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(section.heading, 20, yPos);
      yPos += 10;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    
    for (const line of section.body) {
      if (yPos > 270) {
        addFooter(doc, pageNumber);
        doc.addPage();
        pageNumber++;
        yPos = 20;
      }
      
      const wrapped = doc.splitTextToSize(line, 170);
      for (const wLine of wrapped) {
        doc.text(wLine, 25, yPos);
        yPos += 6;
      }
    }
    
    yPos += 8;
  }
  
  addFooter(doc, pageNumber);
  return doc;
};

export const downloadResourcePDF = (
  title: string,
  type: 'pdf' | 'presentation' | 'video' | 'template' | 'guide',
  content: string
): void => {
  let doc: jsPDF;
  
  // Choose the appropriate generator based on resource type and title
  if (title.toLowerCase().includes('pitch deck')) {
    doc = generatePitchDeckPDF(content);
  } else if (title.toLowerCase().includes('email')) {
    doc = generateEmailTemplatesPDF(content);
  } else if (title.toLowerCase().includes('case stud')) {
    doc = generateCaseStudiesPDF(content);
  } else if (title.toLowerCase().includes('whatsapp')) {
    doc = generateWhatsAppScriptsPDF(content);
  } else if (title.toLowerCase().includes('handbook')) {
    doc = generateHandbookPDF(content);
  } else {
    doc = generateResourcePDF({ title, type, content });
  }
  
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const getResourcePDFBlob = (
  title: string,
  type: 'pdf' | 'presentation' | 'video' | 'template' | 'guide',
  content: string
): Blob => {
  let doc: jsPDF;
  
  if (title.toLowerCase().includes('pitch deck')) {
    doc = generatePitchDeckPDF(content);
  } else if (title.toLowerCase().includes('email')) {
    doc = generateEmailTemplatesPDF(content);
  } else if (title.toLowerCase().includes('case stud')) {
    doc = generateCaseStudiesPDF(content);
  } else if (title.toLowerCase().includes('whatsapp')) {
    doc = generateWhatsAppScriptsPDF(content);
  } else if (title.toLowerCase().includes('handbook')) {
    doc = generateHandbookPDF(content);
  } else {
    doc = generateResourcePDF({ title, type, content });
  }
  
  return doc.output('blob');
};
