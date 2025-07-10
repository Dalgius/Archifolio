
'use client';

import { jsPDF } from "jspdf";
import type { Project } from "@/types";
import { format, parseISO } from 'date-fns';

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

    constructor() {
        this.doc = new jsPDF('p', 'mm', 'a4');
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 20;
        this.contentWidth = this.pageWidth - this.margin * 2;
        this.y = 0;
        this.pageNumber = 1;
    }

    startPage() {
        this.y = this.margin + 5;
        this.drawHeader();
        this.y += 15;
    }

    drawHeader() {
        const headerY = this.margin + 5;
        this.doc.setDrawColor(119, 139, 159); // Muted blue
        this.doc.setLineWidth(0.8);
        this.doc.line(this.margin, headerY, this.pageWidth - this.margin, headerY);
        this.doc.setFontSize(10);
        this.doc.setTextColor(100);
        this.doc.text(`architettura ${this.pageNumber}`, this.pageWidth - this.margin, headerY - 2, { align: 'right' });
    }

    drawFooter() {
        const footerY = this.pageHeight - this.margin + 8;
        this.doc.setDrawColor(0, 0, 0); // black line
        this.doc.setLineWidth(0.2);
        this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
        this.doc.setFontSize(9);
        this.doc.setTextColor(150);
        this.doc.text("GIUSEPPE D'ALESSIO ARCHITETTO", this.pageWidth - this.margin, footerY + 4, { align: 'right' });
    }

    checkNewPage(requiredHeight: number) {
        if (this.y + requiredHeight > this.pageHeight - this.margin - 15) {
            this.drawFooter();
            this.doc.addPage();
            this.pageNumber++;
            this.startPage();
        }
    }

    save(filename: string) {
        this.drawFooter();
        this.doc.save(filename);
    }
}

const addCompletoLayout = (pdf: PdfDocument, project: Project & { imageData: string | null }) => {
    const projectBlockHeight = 70;
    pdf.checkNewPage(projectBlockHeight);

    const imageX = pdf.margin;
    const imageY = pdf.y;
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
        if (textY < pdf.y + imageHeight) {
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

    pdf.y += projectBlockHeight;
};

const addCompattoLayout = (pdf: PdfDocument, project: Project & { imageData: string | null }) => {
    const projectBlockHeight = 35;
    pdf.checkNewPage(projectBlockHeight);

    const imageX = pdf.margin;
    const imageY = pdf.y;
    const imageWidth = 20;
    const imageHeight = 15;

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
    textY += (titleLines.length * 3.5) + 1;
    
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
        if (textY < pdf.y + projectBlockHeight - 5) { // prevent overflow
            const line = `${label}: ${value}`;
            pdf.doc.text(line, textX, textY, { maxWidth: textWidth });
            textY += 4;
        }
    };
    
    addDetailLine('Committente', project.client);
    addDetailLine('Prestazione', project.service);
    const formattedAmount = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(project.amount);
    addDetailLine('Importo lavori', formattedAmount);

    pdf.y += projectBlockHeight;
    pdf.doc.setDrawColor(220, 220, 220);
    pdf.doc.setLineWidth(0.2);
    pdf.doc.line(pdf.margin, pdf.y - (projectBlockHeight / 2) + 10, pdf.pageWidth - pdf.margin, pdf.y - (projectBlockHeight / 2) + 10);
};

const addSoloTestoLayout = (pdf: PdfDocument, project: Project) => {
    const projectBlockHeight = 30;
    pdf.checkNewPage(projectBlockHeight);
    
    let textY = pdf.y;
    const textX = pdf.margin;
    const textWidth = pdf.contentWidth;

    pdf.doc.setFont("helvetica", "bold");
    pdf.doc.setFontSize(9);
    pdf.doc.setTextColor(50, 50, 50);
    const titleLines = pdf.doc.splitTextToSize(project.name.toUpperCase(), textWidth);
    pdf.doc.text(titleLines, textX, textY);
    textY += (titleLines.length * 3.5) + 1;
    
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
         if (textY < pdf.y + projectBlockHeight - 5) {
            const line = `${label}: ${value}`;
            pdf.doc.text(line, textX, textY, { maxWidth: textWidth });
            textY += 4;
        }
    };
    
    addDetailLine('Committente', project.client);
    addDetailLine('Prestazione', project.service);
    const formattedAmount = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(project.amount);
    addDetailLine('Importo lavori', formattedAmount);
    
    pdf.y += projectBlockHeight;
    pdf.doc.setDrawColor(220, 220, 220);
    pdf.doc.setLineWidth(0.2);
    pdf.doc.line(pdf.margin, pdf.y - (projectBlockHeight / 2) + 8, pdf.pageWidth - pdf.margin, pdf.y - (projectBlockHeight / 2) + 8);
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

    if (layout === "Compatto" || layout === "Solo Testo") {
        pdf.doc.setFont("helvetica", "bold");
        pdf.doc.setFontSize(11);
        pdf.doc.setTextColor(85, 85, 85);
        pdf.doc.text("ENTI PUBBLICI E PRIVATI", pdf.margin, pdf.y);
        pdf.y += 8;
        pdf.doc.setDrawColor(85, 85, 85);
        pdf.doc.setLineWidth(0.4);
        pdf.doc.line(pdf.margin, pdf.y, pdf.margin + 40, pdf.y);
        pdf.y += 8;
    }

    for (const project of projectsWithImageData) {
        switch (layout) {
            case "Completo":
                addCompletoLayout(pdf, project);
                break;
            case "Compatto":
                addCompattoLayout(pdf, project);
                break;
            case "Solo Testo":
                addSoloTestoLayout(pdf, project);
                break;
        }
    }
    
    pdf.save(`Portfolio-Archifolio-${layout}.pdf`);
}
