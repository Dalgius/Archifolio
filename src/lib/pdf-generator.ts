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
    pageNumber: number;
    projectCounter: number;

    constructor() {
        this.doc = new jsPDF('p', 'mm', 'a4');
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 20;
        this.contentWidth = this.pageWidth - this.margin * 2;
        this.y = 0;
        this.pageNumber = 1;
        this.projectCounter = 0;
    }

    startPage() {
        this.y = this.margin;
        this.projectCounter = 0;
    }

    newPage() {
        this.drawFooter();
        this.doc.addPage();
        this.pageNumber++;
        this.startPage();
    }

    drawFooter() {
        const footerY = this.pageHeight - this.margin / 2;
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(9);
        this.doc.setTextColor(150);
        this.doc.text(String(this.pageNumber), this.pageWidth / 2, footerY, { align: 'center' });
    }

    checkNewPage(requiredHeight: number) {
        if (this.y + requiredHeight > this.pageHeight - this.margin) {
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

    save(filename: string) {
        this.drawFooter();
        this.doc.save(filename);
    }
}

const PROJECTS_PER_PAGE_COMPLETO = 3;
const PROJECTS_PER_PAGE_COMPATTO = 6;

const addCompletoLayout = (pdf: PdfDocument, project: ProjectWithImage) => {
    if (pdf.projectCounter === PROJECTS_PER_PAGE_COMPLETO) pdf.newPage();
    const projectBlockHeight = (pdf.pageHeight - pdf.margin * 2) / PROJECTS_PER_PAGE_COMPLETO;

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

    pdf.projectCounter++;
    pdf.y += projectBlockHeight;
};

const addCompattoLayout = (pdf: PdfDocument, project: ProjectWithImage) => {
    if (pdf.projectCounter === PROJECTS_PER_PAGE_COMPATTO) pdf.newPage();
    const projectBlockHeight = (pdf.pageHeight - pdf.margin * 2) / PROJECTS_PER_PAGE_COMPATTO;
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

    pdf.projectCounter++;
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


export async function generatePortfolioPDF(projects: Project[], layout: PdfLayout) {
    const pdfDoc = new PdfDocument();

    const projectsWithImageData: ProjectWithImage[] = layout !== "Solo Testo"
        ? await Promise.all(
            projects.map(async (project) => {
                try {
                    const imageData = await loadCroppedImage(project.image);
                    return { ...project, imageData };
                } catch (error) {
                    console.error(`Failed to load image for project ${project.name}:`, error);
                    return { ...project, imageData: null };
                }
            })
          )
        : projects.map(p => ({...p, imageData: null}));

    pdfDoc.startPage();

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

    pdfDoc.save(`Portfolio-GDAStudio-${layout}.pdf`);
}
