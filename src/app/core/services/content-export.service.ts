import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { jsPDF } from 'jspdf';

export interface PdfExportSection {
  heading?: string;
  text: string;
}

export interface PdfExportDocument {
  title: string;
  sections: PdfExportSection[];
}

@Injectable({ providedIn: 'root' })
export class ContentExportService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  exportPdf(content: PdfExportDocument, filename: string): void {
    if (!this.isBrowser || !this.document.defaultView) {
      throw new Error('PDF export is only available in a browser');
    }

    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 18;
    const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const lineHeight = 5.2;
    let y = margin;

    pdf.setProperties({
      title: content.title,
      subject: 'Radici San Giovanni Lipioni',
      creator: 'Radici San Giovanni Lipioni',
    });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(138, 90, 50);
    pdf.text('RADICI SAN GIOVANNI LIPIONI', margin, y);
    y += 11;

    pdf.setFontSize(20);
    pdf.setTextColor(31, 41, 51);
    y = this.addText(pdf, content.title, margin, y, contentWidth, lineHeight * 1.25, 20);
    y += 4;

    for (const section of content.sections) {
      if (!section.text.trim()) continue;

      if (section.heading) {
        y = this.ensureSpace(pdf, y, pageHeight, margin, 12);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(47, 111, 78);
        y = this.addText(pdf, section.heading, margin, y, contentWidth, lineHeight * 1.15, 12);
        y += 1.5;
      }

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(31, 41, 51);
      y = this.addText(pdf, section.text, margin, y, contentWidth, lineHeight, 10);
      y += 4;
    }

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      pdf.setPage(page);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(95, 107, 109);
      pdf.text(
        `${page} / ${pageCount}`,
        pdf.internal.pageSize.getWidth() - margin,
        pageHeight - 8,
        { align: 'right' },
      );
    }

    pdf.save(this.sanitizeFilename(filename, '.pdf'));
  }

  private addText(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    width: number,
    lineHeight: number,
    fontSize: number,
  ): number {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text.trim(), width);
    let currentY = y;

    for (const line of lines) {
      currentY = this.ensureSpace(pdf, currentY, pdf.internal.pageSize.getHeight(), 18, lineHeight);
      pdf.text(line, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  private ensureSpace(
    pdf: jsPDF,
    y: number,
    pageHeight: number,
    margin: number,
    requiredHeight: number,
  ): number {
    if (y + requiredHeight <= pageHeight - margin) return y;
    pdf.addPage();
    return margin;
  }

  private sanitizeFilename(filename: string, extension: string): string {
    const baseName = filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return `${baseName || 'radici-export'}${extension}`;
  }
}
