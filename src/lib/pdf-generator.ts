
'use client';

import { jsPDF } from "jspdf";
import type { Project } from "@/types";
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';


export type PdfLayout = "Completo" | "Compatto" | "Solo Testo";

const imageToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

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

    drawFooter() {
        const footerY = this.pageHeight - this.margin / 2;
        this.doc.setFontSize(9);
        this.doc.setTextColor(150);
        this.doc.text(String(this.pageNumber), this.pageWidth / 2, footerY, { align: 'center' });
    }

    checkNewPage(requiredHeight: number, projectsPerPage?: number) {
        const needsNewPageByCount = projectsPerPage && this.projectCounter >= projectsPerPage;
        const needsNewPageByHeight = this.y + requiredHeight > this.pageHeight - this.margin;

        if (needsNewPageByCount || needsNewPageByHeight) {
            this.drawFooter();
            this.doc.addPage();
            this.pageNumber++;
            this.startPage();
            // No header in the new designs
        }
    }

    save(filename: string) {
        this.drawFooter();
        this.doc.save(filename);
    }
}

const addCompletoLayout = (pdf: PdfDocument, project: Project & { imageData: string | null }) => {
    const projectBlockHeight = (pdf.pageHeight - pdf.margin * 2) / 3;
    pdf.checkNewPage(projectBlockHeight, 3);
    
    const currentY = pdf.y;

    const imageX = pdf.margin;
    const imageY = currentY;
    const imageWidth = 70;
    const imageHeight = 52.5;

    if (project.imageData) {
        try {
            pdf.doc.addImage(project.imageData, 'JPEG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');
        } catch (e) {
            console.error("jsPDF error adding image:", e);
            pdf.doc.setFillColor(245, 245, 245);
            pdf.doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
        }
    } else {
        pdf.doc.setFillColor(245, 245, 245);
        pdf.doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
    }

    const textX = imageX + imageWidth + 10;
    let textY = imageY + 2;
    const textWidth = pdf.contentWidth - imageWidth - 10;

    pdf.doc.setFont("helvetica", "bold");
    pdf.doc.setFontSize(10);
    pdf.doc.setTextColor(50, 50, 50);
    const titleLines = pdf.doc.splitTextToSize(project.name.toUpperCase(), textWidth);
    pdf.doc.text(titleLines, textX, textY);
    textY += (titleLines.length * 4) + 2;

    pdf.doc.setFont("helvetica", "normal");
    pdf.doc.setFontSize(9);
    pdf.doc.setTextColor(80, 80, 80);

    let dateString: string;
    const startDateFormatted = format(parseISO(project.startDate), 'MM/yyyy');
    if (project.status === 'In Corso') {
        dateString = `${startDateFormatted} - in corso`;
    } else {
        const endDateFormatted = format(parseISO(project.endDate), 'MM/yyyy');
        dateString = startDateFormatted === endDateFormatted ? startDateFormatted : `${startDateFormatted} - ${endDateFormatted}`;
    }

    const locationDate = `${project.location} ${dateString}`;
    const locationLines = pdf.doc.splitTextToSize(locationDate, textWidth);
    pdf.doc.text(locationLines, textX, textY);
    textY += locationLines.length * 5 + 3;

    pdf.doc.setTextColor(120, 120, 120);

    const addWrappedDetail = (label: string, value: string) => {
         if (textY < currentY + imageHeight) {
            const detailLines = pdf.doc.splitTextToSize(`${label}: ${value}`, textWidth);
            pdf.doc.text(detailLines, textX, textY);
            textY += detailLines.length * 5;
        }
    };

    addWrappedDetail('Committente', project.client);
    addWrappedDetail('Prestazione', project.service);
    addWrappedDetail('Categoria Opere', project.category);
    const formattedAmount = new Intl.NumberFormat('it-IT', { style: 'currency', 'currency': 'EUR' }).format(project.amount);
    addWrappedDetail('Importo', formattedAmount);
    addWrappedDetail('Stato', project.status);
    
    pdf.projectCounter++;
    pdf.y += projectBlockHeight;
};

const addCompattoLayout = (pdf: PdfDocument, project: Project & { imageData: string | null }) => {
    const projectBlockHeight = (pdf.pageHeight - pdf.margin * 2) / 6;
    pdf.checkNewPage(projectBlockHeight, 6);

    const currentY = pdf.y;

    const imageX = pdf.margin;
    const imageY = currentY;
    const imageWidth = 35;
    const imageHeight = 26.25;

    if (project.imageData) {
        try {
            pdf.doc.addImage(project.imageData, 'JPEG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');
        } catch (e) {
            console.error("jsPDF error adding image:", e);
            pdf.doc.setFillColor(245, 245, 245);
            pdf.doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
        }
    } else {
        pdf.doc.setFillColor(245, 245, 245);
        pdf.doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
    }

    const textX = imageX + imageWidth + 5;
    let textY = imageY + 2;
    const textWidth = pdf.contentWidth - imageWidth - 5;

    pdf.doc.setFont("helvetica", "bold");
    pdf.doc.setFontSize(9);
    pdf.doc.setTextColor(50, 50, 50);
    const titleLines = pdf.doc.splitTextToSize(project.name.toUpperCase(), textWidth);
    pdf.doc.text(titleLines, textX, textY);
    textY += (titleLines.length * 3.5) + 2;
    
    pdf.doc.setFont("helvetica", "normal");
    pdf.doc.setFontSize(8);
    pdf.doc.setTextColor(100, 100, 100);

    let dateString: string;
    const startDateFormatted = format(parseISO(project.startDate), 'MM/yyyy');
    if (project.status === 'In Corso') {
        dateString = `${startDateFormatted} - in corso`;
    } else {
        const endDateFormatted = format(parseISO(project.endDate), 'MM/yyyy');
        dateString = startDateFormatted === endDateFormatted ? startDateFormatted : `${startDateFormatted} - ${endDateFormatted}`;
    }

    const locationDate = `${project.location} ${dateString}`;
    pdf.doc.text(locationDate, textX, textY);
    textY += 4;
    
    const addDetailLine = (label: string, value: string) => {
        if (textY < currentY + projectBlockHeight - 5) {
            const line = `${label}: ${value}`;
            pdf.doc.text(line, textX, textY, { maxWidth: textWidth });
            textY += 4;
        }
    };
    
    addDetailLine('Committente', project.client);
    addDetailLine('Prestazione', project.service);
    
    pdf.projectCounter++;
    pdf.doc.setDrawColor(220, 220, 220);
    pdf.doc.setLineWidth(0.2);
    pdf.doc.line(pdf.margin, currentY + projectBlockHeight - 5, pdf.pageWidth - pdf.margin, currentY + projectBlockHeight - 5);
    pdf.y += projectBlockHeight;
};

const addSoloTestoLayout = (pdf: PdfDocument, project: Project) => {
    const leftColX = pdf.margin;
    const rightColX = pdf.margin + 50;
    const separatorX = rightColX - 2.5;
    const leftColWidth = separatorX - leftColX - 2.5;
    const rightColWidth = pdf.pageWidth - pdf.margin - rightColX;
    const lineHeight = 4;
    const sectionSpacing = 8;
    
    pdf.doc.setFontSize(9);
    pdf.doc.setTextColor(0, 0, 0); // Set text color to black
    
    // Store original Y position to draw the line later
    const startY = pdf.y;

    const addEntry = (label: string, value: string) => {
        pdf.doc.setFont('helvetica', 'bold');
        const labelLines = pdf.doc.splitTextToSize(`• ${label}`, leftColWidth);

        pdf.doc.setFont('helvetica', 'normal');
        const valueLines = pdf.doc.splitTextToSize(value, rightColWidth);
        const requiredHeight = Math.max(labelLines.length, valueLines.length) * lineHeight;
        
        pdf.checkNewPage(requiredHeight);
        
        // We might have a new page, so we need to set color again
        pdf.doc.setTextColor(0, 0, 0);
        
        pdf.doc.setFont('helvetica', 'bold');
        pdf.doc.text(labelLines, leftColX, pdf.y);

        pdf.doc.setFont('helvetica', 'normal');
        pdf.doc.text(valueLines, rightColX, pdf.y);
        pdf.y += requiredHeight;
    };
    
    const dateFormatted = `da ${format(parseISO(project.startDate), 'MMMM yyyy', { locale: it })} a ${format(parseISO(project.endDate), 'MMMM yyyy', { locale: it })}`;

    const clientLines = pdf.doc.splitTextToSize(project.client, rightColWidth);
    const nameLines = pdf.doc.splitTextToSize(project.name, rightColWidth);
    const serviceLines = pdf.doc.splitTextToSize(project.service, rightColWidth);
    const dateLines = pdf.doc.splitTextToSize(dateFormatted, rightColWidth);
    const estimatedHeight = (clientLines.length + nameLines.length + serviceLines.length + dateLines.length + 3) * lineHeight + sectionSpacing;

    pdf.checkNewPage(estimatedHeight);
    
    const blockStartY = pdf.y;

    addEntry('Date', dateFormatted);
    pdf.y += lineHeight / 2;
    addEntry('Nome e tipo ente', project.client);
    pdf.y += lineHeight / 2;
    addEntry('Titolo del progetto', project.name);
    pdf.y += lineHeight / 2;
    addEntry('Tipo di attività', project.service);
    
    const blockEndY = pdf.y;
    
    pdf.doc.setDrawColor(200, 200, 200);
    pdf.doc.setLineWidth(0.2);
    pdf.doc.line(separatorX, blockStartY - (lineHeight / 2), separatorX, blockEndY - lineHeight);

    pdf.y += sectionSpacing;
};


export async function generatePortfolioPDF(projects: Project[], layout: PdfLayout) {
    const pdf = new PdfDocument();
    
    const projectsWithImageData = layout !== "Solo Testo"
        ? await Promise.all(
            projects.map(async (project) => {
                try {
                    const imageData = await imageToBase64(project.image);
                    return { ...project, imageData };
                } catch (error) {
                    console.error(`Failed to load image for project ${project.name}:`, error);
                    return { ...project, imageData: null };
                }
            })
          )
        : projects.map(p => ({...p, imageData: null}));

    pdf.startPage();
    
    for (const project of projectsWithImageData) {
        switch (layout) {
            case "Completo":
                addCompletoLayout(pdf, project as Project & { imageData: string | null });
                break;
            case "Compatto":
                addCompattoLayout(pdf, project as Project & { imageData: string | null });
                break;
            case "Solo Testo":
                addSoloTestoLayout(pdf, project);
                break;
        }
    }
    
    pdf.save(`Portfolio-Archifolio-${layout}.pdf`);
}
