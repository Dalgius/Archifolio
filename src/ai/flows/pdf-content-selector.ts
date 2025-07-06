// This file uses server-side functionality.
'use server';

/**
 * @fileOverview A flow that uses AI to determine if project information should be included in a PDF export, based on a user-provided prompt.
 *
 * - pdfContentSelector - A function that processes project details and returns a filtered set of information based on the prompt.
 * - PdfContentSelectorInput - The input type for the pdfContentSelector function.
 * - PdfContentSelectorOutput - The return type for the pdfContentSelector function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PdfContentSelectorInputSchema = z.object({
  projectDetails: z.record(z.string(), z.string()).describe('All the project details as key-value pairs.'),
  prompt: z.string().describe('The prompt to determine if a certain detail should be included or not.'),
});
export type PdfContentSelectorInput = z.infer<typeof PdfContentSelectorInputSchema>;

const PdfContentSelectorOutputSchema = z.record(z.string(), z.string().nullable()).describe('The filtered project details to be included in the PDF, with omitted details set to null.');
export type PdfContentSelectorOutput = z.infer<typeof PdfContentSelectorOutputSchema>;

export async function pdfContentSelector(input: PdfContentSelectorInput): Promise<PdfContentSelectorOutput> {
  return pdfContentSelectorFlow(input);
}

const pdfContentSelectorPrompt = ai.definePrompt({
  name: 'pdfContentSelectorPrompt',
  input: {schema: PdfContentSelectorInputSchema},
  output: {schema: PdfContentSelectorOutputSchema},
  prompt: `You are an AI assistant that filters project details for a PDF export based on a user's prompt.

  Given the following project details:
  {{#each projectDetails}}
    {{@key}}: {{this}}
  {{/each}}

  And the following prompt: {{prompt}}

  Determine whether each detail should be included in the PDF. If a detail should be omitted based on the prompt, set its value to null. If you are not sure about a detail, omit it by setting its value to null.

  Return a JSON object containing the filtered project details with omitted details set to null.
  For example:
  {
    \"projectName\": \"Project A\",
    \"clientName\": null,
    \"location\": \"City B\",
    \"completionDate\": null
  }
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  }
});

const pdfContentSelectorFlow = ai.defineFlow(
  {
    name: 'pdfContentSelectorFlow',
    inputSchema: PdfContentSelectorInputSchema,
    outputSchema: PdfContentSelectorOutputSchema,
  },
  async input => {
    const {output} = await pdfContentSelectorPrompt(input);
    return output!;
  }
);
