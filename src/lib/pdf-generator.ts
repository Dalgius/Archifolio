
'use client';

import { jsPDF } from "jspdf";
import type { Project } from "@/types";
import { format, parseISO } from 'date-fns';

const imageToBase64 = async (url: string): Promise<string> => {
    // Use a CORS proxy for development if needed, but Firebase Storage URLs should work directly.
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


export async function generatePortfolioPDF(projects: Project[]) {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const projectsWithImageData = await Promise.all(
        projects.map(async (project) => {
            try {
                const imageData = await imageToBase64(project.image);
                return { ...project, imageData };
            } catch (error) {
                console.error(`Failed to load image for project ${project.name}:`, error);
                return { ...project, imageData: null };
            }
        })
    );

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin + 5;
    let pageNumber = 1;

    const drawHeader = () => {
        doc.setDrawColor(119, 139, 159); // Muted blue
        doc.setLineWidth(0.8);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`architettura ${pageNumber}`, pageWidth - margin, y - 2, { align: 'right' });
    }

    const drawFooter = () => {
        const footerY = pageHeight - margin + 8;
        doc.setDrawColor(0, 0, 0); // black line
        doc.setLineWidth(0.2);
        doc.line(margin, footerY, pageWidth - margin, footerY);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("GIUSEPPE D'ALESSIO ARCHITETTO", pageWidth - margin, footerY + 4, { align: 'right' });
    }

    drawHeader();
    y += 15;

    for (const project of projectsWithImageData) {
        const projectBlockHeight = 65; 
        if (y + projectBlockHeight > pageHeight - margin - 5) {
            doc.addPage();
            pageNumber++;
            y = margin + 5;
            drawHeader();
            y += 15;
        }

        const imageX = margin;
        const imageY = y;
        const imageWidth = 70;
        const imageHeight = 52.5; 

        if (project.imageData) {
            try {
                 doc.addImage(project.imageData, 'JPEG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');
            } catch (e) {
                console.error("jsPDF error adding image:", e);
                doc.setFillColor(245, 245, 245);
                doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
            }
        } else {
            doc.setFillColor(245, 245, 245);
            doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
        }

        const textX = imageX + imageWidth + 10;
        let textY = imageY + 2;
        const textWidth = contentWidth - imageWidth - 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const titleLines = doc.splitTextToSize(project.name.toUpperCase(), textWidth);
        doc.text(titleLines, textX, textY);
        textY += (titleLines.length * 4) + 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        const presentString = "presente";
        const endDateFormatted = format(parseISO(project.endDate), 'MM/yyyy');
        const isPresent = new Date(project.endDate).getFullYear() >= new Date().getFullYear();
        
        const dateString = `${format(parseISO(project.startDate), 'MM/yyyy')} - ${isPresent ? presentString : endDateFormatted}`;

        const locationDate = `${project.location} ${dateString}`;
        doc.text(locationDate, textX, textY);
        textY += 8;

        doc.setTextColor(120, 120, 120);
        doc.text(`Committente: ${project.client}`, textX, textY);
        textY += 5;
        doc.text(`Prestazione: ${project.service}`, textX, textY);
        textY += 5;
        const formattedAmount = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(project.amount);
        doc.text(`Importo: ${formattedAmount}`, textX, textY);
        textY += 5;
        doc.text(`Stato: ${project.status}`, textX, textY);

        y += projectBlockHeight;
    }
    
    drawFooter();

    doc.save("Portfolio-Archifolio.pdf");
}
