import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalyticsSummary, GapResult, Study } from './types';

// PDF generation happens entirely client-side (jsPDF + jspdf-autotable), not
// on the Worker: Cloudflare's Workers runtime has no general-purpose headless
// browser to render HTML to PDF without the paid Browser Rendering product,
// and this report's content (a handful of tables and chart snapshots) doesn't
// need one. Chart images are pulled straight off the live Chart.js canvases
// via toBase64Image(), so the PDF matches exactly what the analyst is looking
// at when they export it.

interface ReportInput {
  study: Study | null;
  summary: AnalyticsSummary;
  gap: GapResult | null;
  chartImages: { title: string; dataUrl: string }[];
  generatedBy: string;
}

export function buildAnalyticsPdf({ study, summary, gap, chartImages, generatedBy }: ReportInput): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Survey Analytics Report', marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  y += 20;
  doc.text(`Scope: ${study ? study.title : 'All studies'}`, marginX, y);
  y += 14;
  doc.text(`Generated: ${new Date().toLocaleString()} by ${generatedBy}`, marginX, y);

  y += 28;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Summary', marginX, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['Metric', 'Value']],
    body: [
      ['Households surveyed', summary.totals.households.toLocaleString()],
      ['Districts covered', String(summary.totals.districts)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [83, 74, 183] },
    styles: { fontSize: 9, cellPadding: 6 },
  });

  // @ts-expect-error jspdf-autotable augments the doc instance at runtime
  y = doc.lastAutoTable.finalY + 24;

  for (const chart of chartImages) {
    if (y > 650) {
      doc.addPage();
      y = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(chart.title, marginX, y);
    y += 10;
    const imgWidth = 515;
    const imgHeight = 200;
    doc.addImage(chart.dataUrl, 'PNG', marginX, y, imgWidth, imgHeight);
    y += imgHeight + 24;
  }

  if (gap) {
    if (y > 550) {
      doc.addPage();
      y = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Uptake gap detail — ${gap.scheme}`, marginX, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX },
      head: [['Sub-community', 'Uptake %', 'Gap vs. average (pp)', 'Sample size']],
      body: gap.gap.map((row) => [row.subCommunity, `${row.uptakePct}%`, `${row.gapPp > 0 ? '+' : ''}${row.gapPp}pp`, String(row.sampleSize)]),
      theme: 'grid',
      headStyles: { fillColor: [83, 74, 183] },
      styles: { fontSize: 9, cellPadding: 6 },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} — Survey Platform`, marginX, 820);
  }

  return doc;
}
