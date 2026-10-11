'use client';

import { jsPDF } from "jspdf";
import type { Project } from "@/types";
import { format, isValid, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';


export type PdfLayout = "Completo" | "Compatto" | "Solo Testo";

type ProjectWithImage = Project & { imageData: string | null };

const PT_TO_MM = 0.3528;
const LINE_SPACING = 1.2;
const IMAGE_ASPECT = 4 / 3;

const lineHeight = (fontSizePt: number) => fontSizePt * PT_TO_MM * LINE_SPACING;

const formatAmount = (amount: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

const formatDate = (date: string, pattern: string) => {
    const parsed = parseISO(date);
    return isValid(parsed) ? format(parsed, pattern, { locale: it }) : '';
};

// "MM/yyyy - MM/yyyy", collapsed to one date when start and end match.
const formatShortPeriod = (project: Project) => {
    const start = formatDate(project.startDate, 'MM/yyyy');
    if (project.status === 'In Corso') return `${start} - in corso`;
    const end = formatDate(project.endDate, 'MM/yyyy');
    return start === end || !end ? start : `${start} - ${end}`;
};

// Fetches an image and center-crops it to 4:3, so it isn't stretched into the PDF frame.
// Re-encoding to JPEG also normalizes PNG/WebP uploads for jsPDF.
const loadCroppedImage = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const bitmap = await createImageBitmap(await response.blob());

    let sx = 0, sy = 0, sw = bitmap.width, sh = bitmap.height;
    if (sw / sh > IMAGE_ASPECT) {
        sw = sh * IMAGE_ASPECT;
        sx = (bitmap.width - sw) / 2;
    } else {
        sh = sw / IMAGE_ASPECT;
        sy = (bitmap.height - sh) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.85);
};

interface TextItem {
    text: string;
    fontSize: number;
    bold?: boolean;
    color: number;
    gapAfter?: number;
}

class PdfDocument {
    doc: jsPDF;
    pageWidth: number;
    pageHeight: number;
    margin: number;
    contentWidth: number;
    y: number;

    constructor() {
        this.doc = new jsPDF('p', 'mm', 'a4');
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 20;
        this.contentWidth = this.pageWidth - this.margin * 2;
        this.y = this.margin;
    }

    newPage() {
        this.doc.addPage();
        this.y = this.margin;
    }

    // Footers are drawn once at the end, when the total page count is known.
    drawFooters(label: string) {
        const pageCount = this.doc.getNumberOfPages();
        const footerY = this.pageHeight - this.margin / 2;
        for (let page = 1; page <= pageCount; page++) {
            this.doc.setPage(page);
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(8);
            this.doc.setTextColor(150);
            this.doc.text(label, this.margin, footerY);
            this.doc.text(`Pagina ${page} di ${pageCount}`, this.pageWidth - this.margin, footerY, { align: 'right' });
        }
    }

    // The small tolerance avoids a page break caused by floating point rounding
    // when blocks fill the page exactly.
    checkNewPage(requiredHeight: number) {
        if (this.y + requiredHeight > this.pageHeight - this.margin + 0.01) {
            this.newPage();
            return true;
        }
        return false;
    }

    drawImage(imageData: string | null, x: number, y: number, width: number, height: number) {
        if (imageData) {
            try {
                this.doc.addImage(imageData, 'JPEG', x, y, width, height, undefined, 'FAST');
                return;
            } catch (e) {
                console.error("jsPDF error adding image:", e);
            }
        }
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(x, y, width, height, 'F');
    }

    // Draws the items top-down inside width × maxHeight. Instead of dropping the
    // fields that don't fit, the whole block is scaled down (to 60% at most).
    drawTextBlock(items: TextItem[], x: number, y: number, width: number, maxHeight: number) {
        const measure = (scale: number) => {
            let height = 0;
            const lines = items.map((item) => {
                this.doc.setFont("helvetica", item.bold ? "bold" : "normal");
                this.doc.setFontSize(item.fontSize * scale);
                const itemLines: string[] = this.doc.splitTextToSize(item.text, width);
                height += itemLines.length * lineHeight(item.fontSize * scale) + (item.gapAfter ?? 0) * scale;
                return itemLines;
            });
            return { lines, height };
        };

        let scale = 1;
        let measured = measure(scale);
        for (let step = 1; step <= 8 && measured.height > maxHeight; step++) {
            scale = 1 - step * 0.05;
            measured = measure(scale);
        }

        let textY = y;
        items.forEach((item, index) => {
            const fontSize = item.fontSize * scale;
            this.doc.setFont("helvetica", item.bold ? "bold" : "normal");
            this.doc.setFontSize(fontSize);
            this.doc.setTextColor(item.color);
            this.doc.text(measured.lines[index], x, textY, { baseline: 'top', lineHeightFactor: LINE_SPACING });
            textY += measured.lines[index].length * lineHeight(fontSize) + (item.gapAfter ?? 0) * scale;
        });
    }

}

const PROJECTS_PER_PAGE_COMPLETO = 3;
const PROJECTS_PER_PAGE_COMPATTO = 6;

// Logo, document title, generation date and number of projects on the first page.
const addHeader = (pdf: PdfDocument, title: string, projectCount: number) => {
    const { doc, margin } = pdf;
    const logoSize = 18;

    // Simplified GDAStudio logo: dark square with "GDA" / "STUDIO".
    doc.setFillColor(54, 57, 62);
    doc.rect(margin, margin, logoSize, logoSize, 'F');
    doc.setTextColor(212, 213, 216);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("GDA", margin + 1.8, margin + 8.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("STUDIO", margin + 1.8, margin + 13.5);

    const textX = margin + logoSize + 6;
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, textX, margin + 7.5, { maxWidth: pdf.contentWidth - logoSize - 6 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110);
    const count = projectCount === 1 ? "1 lavoro" : `${projectCount} lavori`;
    doc.text(`GDAStudio · ${format(new Date(), 'd MMMM yyyy', { locale: it })} · ${count}`, textX, margin + 14);

    const lineY = margin + logoSize + 4;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, lineY, pdf.pageWidth - margin, lineY);
    pdf.y = lineY + 8;
};

// Final page: number of projects and total amount per "Categoria Opere".
const addSummary = (pdf: PdfDocument, projects: Project[]) => {
    const { doc, margin } = pdf;
    const totals = new Map<string, { count: number; amount: number }>();
    for (const project of projects) {
        const category = project.category.trim() || "Senza categoria";
        const entry = totals.get(category) ?? { count: 0, amount: 0 };
        entry.count++;
        entry.amount += project.amount || 0;
        totals.set(category, entry);
    }
    const rows = [...totals.entries()].sort(([a], [b]) => a.localeCompare(b, 'it'));

    pdf.newPage();
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Riepilogo per categoria opere", margin, pdf.y, { baseline: 'top' });
    pdf.y += 12;

    const countX = margin + 120;
    const amountX = pdf.pageWidth - margin;
    const rowHeight = 7;
    const drawRow = (cells: [string, string, string], bold: boolean) => {
        pdf.checkNewPage(rowHeight);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(bold ? 30 : 60);
        doc.text(cells[0], margin, pdf.y, { baseline: 'top', maxWidth: countX - margin - 30 });
        doc.text(cells[1], countX, pdf.y, { baseline: 'top', align: 'right' });
        doc.text(cells[2], amountX, pdf.y, { baseline: 'top', align: 'right' });
        pdf.y += rowHeight;
    };
    const drawRule = () => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, pdf.y - 2, amountX, pdf.y - 2);
    };

    drawRow(["Categoria", "N. lavori", "Importo totale"], true);
    drawRule();
    for (const [category, { count, amount }] of rows) {
        drawRow([category, String(count), formatAmount(amount)], false);
    }
    drawRule();
    const totalAmount = rows.reduce((sum, [, entry]) => sum + entry.amount, 0);
    drawRow(["Totale", String(projects.length), formatAmount(totalAmount)], true);
};

const addCompletoLayout = (pdf: PdfDocument, project: ProjectWithImage) => {
    const projectBlockHeight = (pdf.pageHeight - pdf.margin * 2) / PROJECTS_PER_PAGE_COMPLETO;
    pdf.checkNewPage(projectBlockHeight);

    const imageWidth = 70;
    const imageHeight = imageWidth / IMAGE_ASPECT;
    pdf.drawImage(project.imageData, pdf.margin, pdf.y, imageWidth, imageHeight);

    const textX = pdf.margin + imageWidth + 10;
    const textWidth = pdf.contentWidth - imageWidth - 10;

    pdf.drawTextBlock([
        { text: project.name.toUpperCase(), fontSize: 10, bold: true, color: 50, gapAfter: 2 },
        { text: `${project.location} ${formatShortPeriod(project)}`, fontSize: 9, color: 80, gapAfter: 3 },
        { text: `Committente: ${project.client}`, fontSize: 9, color: 120 },
        { text: `Prestazione: ${project.service}`, fontSize: 9, color: 120 },
        { text: `Categoria Opere: ${project.category}`, fontSize: 9, color: 120 },
        { text: `Importo: ${formatAmount(project.amount)}`, fontSize: 9, color: 120 },
        { text: `Stato: ${project.status}`, fontSize: 9, color: 120 },
    ], textX, pdf.y, textWidth, projectBlockHeight - 8);

    pdf.y += projectBlockHeight;
};

const addCompattoLayout = (pdf: PdfDocument, project: ProjectWithImage) => {
    const projectBlockHeight = (pdf.pageHeight - pdf.margin * 2) / PROJECTS_PER_PAGE_COMPATTO;
    pdf.checkNewPage(projectBlockHeight);
    const currentY = pdf.y;

    const imageWidth = 35;
    const imageHeight = imageWidth / IMAGE_ASPECT;
    pdf.drawImage(project.imageData, pdf.margin, currentY, imageWidth, imageHeight);

    const textX = pdf.margin + imageWidth + 5;
    const textWidth = pdf.contentWidth - imageWidth - 5;
    const separatorY = currentY + projectBlockHeight - 5;

    pdf.drawTextBlock([
        { text: project.name.toUpperCase(), fontSize: 9, bold: true, color: 50, gapAfter: 1.5 },
        { text: `${project.location} | ${formatShortPeriod(project)}`, fontSize: 7.5, color: 100, gapAfter: 0.5 },
        { text: `Comm.: ${project.client}`, fontSize: 7.5, color: 100 },
        { text: `Prest.: ${project.service}`, fontSize: 7.5, color: 100 },
        { text: `Cat.: ${project.category}`, fontSize: 7.5, color: 100 },
        { text: `Imp.: ${formatAmount(project.amount)}`, fontSize: 7.5, color: 100 },
        { text: `Stato: ${project.status}`, fontSize: 7.5, color: 100 },
    ], textX, currentY, textWidth, separatorY - currentY - 1.5);

    pdf.doc.setDrawColor(220, 220, 220);
    pdf.doc.setLineWidth(0.2);
    pdf.doc.line(pdf.margin, separatorY, pdf.pageWidth - pdf.margin, separatorY);
    pdf.y += projectBlockHeight;
};

const addSoloTestoLayout = (pdf: PdfDocument, project: Project) => {
    const leftColWidth = 55;
    const separatorX = pdf.margin + leftColWidth + 2.5;
    const rightColX = separatorX + 2.5;
    const rightColWidth = pdf.pageWidth - rightColX - pdf.margin;

    const lineHeight = 4.2;
    const entrySpacing = 1;
    const blockSpacing = 6;

    let dateString: string;
    const startDateFormatted = formatDate(project.startDate, 'MMMM yyyy');
    if (project.status === 'In Corso') {
        dateString = `${startDateFormatted} - in corso`;
    } else {
        const endDateFormatted = formatDate(project.endDate, 'MMMM yyyy');
        dateString = `da ${startDateFormatted} a ${endDateFormatted}`;
    }

    const entries = [
        { label: 'Titolo del progetto', value: project.name.toUpperCase() },
        { label: 'Periodo', value: dateString },
        { label: 'Località', value: project.location },
        { label: 'Committente', value: project.client },
        { label: 'Prestazione', value: project.service },
        { label: 'Categoria Opere', value: project.category },
        { label: 'Importo Lavori', value: formatAmount(project.amount) },
        { label: 'Stato Avanzamento', value: project.status }
    ];

    pdf.doc.setFontSize(9);
    let requiredBlockHeight = 0;
    for (const [index, entry] of entries.entries()) {
        pdf.doc.setFont("helvetica", index === 0 ? "bold" : "normal");
        const valueLines = pdf.doc.splitTextToSize(entry.value, rightColWidth);
        requiredBlockHeight += valueLines.length * lineHeight + entrySpacing;
    }
    requiredBlockHeight += blockSpacing;

    pdf.checkNewPage(requiredBlockHeight);

    pdf.doc.setTextColor(0, 0, 0);

    const startY = pdf.y;
    let currentY = startY;

    for (const [index, entry] of entries.entries()) {
        pdf.doc.setFont("helvetica", "bold");
        pdf.doc.setFontSize(9);
        const labelLines = pdf.doc.splitTextToSize(entry.label, leftColWidth);
        pdf.doc.text(labelLines, pdf.margin + leftColWidth, currentY, { baseline: 'top', align: 'right' });

        pdf.doc.setFont("helvetica", index === 0 ? "bold" : "normal");
        const valueLines = pdf.doc.splitTextToSize(entry.value, rightColWidth);
        pdf.doc.text(valueLines, rightColX, currentY, { baseline: 'top' });

        currentY += Math.max(labelLines.length, valueLines.length) * lineHeight + entrySpacing;
    }

    const endY = currentY;

    pdf.doc.setDrawColor(200, 200, 200);
    pdf.doc.setLineWidth(0.2);
    pdf.doc.line(separatorX, startY, separatorX, endY - entrySpacing);

    pdf.y = endY + blockSpacing;
};


export interface PdfOptions {
    title: string;
    includeHeader: boolean;
    includeSummary: boolean;
    // Returns the project's image as a data URL (or null). Kept as a parameter so
    // the generator doesn't depend on where images are stored.
    loadImageData: (project: Project) => Promise<string | null>;
}

const fileNamePart = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '');

export async function generatePortfolioPDF(projects: Project[], layout: PdfLayout, options: PdfOptions) {
    const pdfDoc = new PdfDocument();
    const title = options.title.trim() || "Elenco lavori";

    const projectsWithImageData: ProjectWithImage[] = layout !== "Solo Testo"
        ? await Promise.all(
            projects.map(async (project) => {
                try {
                    const source = await options.loadImageData(project);
                    const imageData = source ? await loadCroppedImage(source) : null;
                    return { ...project, imageData };
                } catch (error) {
                    console.error(`Failed to load image for project ${project.name}:`, error);
                    return { ...project, imageData: null };
                }
            })
          )
        : projects.map(p => ({...p, imageData: null}));

    if (options.includeHeader) {
        addHeader(pdfDoc, title, projects.length);
    }

    for (const project of projectsWithImageData) {
        switch (layout) {
            case "Completo":
                addCompletoLayout(pdfDoc, project);
                break;
            case "Compatto":
                addCompattoLayout(pdfDoc, project);
                break;
            case "Solo Testo":
                addSoloTestoLayout(pdfDoc, project);
                break;
        }
    }

    if (options.includeSummary) {
        addSummary(pdfDoc, projects);
    }

    pdfDoc.drawFooters(`GDAStudio — ${title}`);
    pdfDoc.doc.save(`${fileNamePart(title) || 'Elenco-lavori'}-GDAStudio-${fileNamePart(layout)}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
