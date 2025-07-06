"use server";

import { generateProjectDescription } from "@/ai/flows/generate-project-description";
import { pdfContentSelector } from "@/ai/flows/pdf-content-selector";
import type { Project } from "@/types";

export async function generateDescriptionAction(formData: {
  projectName: string;
  projectType: string;
  location: string;
  completionDate: string;
  imageDataUri: string;
}) {
  try {
    const result = await generateProjectDescription(formData);
    return { success: true, description: result.description };
  } catch (error) {
    console.error("Error generating description:", error);
    return { success: false, error: "Failed to generate description." };
  }
}

export async function generatePdfContentAction(
  projects: Project[],
  prompt: string
) {
  try {
    const promises = projects.map((project) => {
      // The AI flow expects a Record<string, string>.
      const projectDetails: Record<string, string> = {
        ID: project.id,
        Name: project.name,
        Description: project.description,
        Status: project.status,
        Location: project.location,
        "Completion Date": project.completionDate,
      };

      return pdfContentSelector({
        projectDetails,
        prompt,
      });
    });

    const results = await Promise.all(promises);
    return { success: true, data: results };
  } catch (error) {
    console.error("Error generating PDF content:", error);
    return { success: false, error: "Failed to process PDF content." };
  }
}
