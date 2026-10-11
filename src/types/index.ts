
export type ProjectStatus = "Completato" | "In Corso" | "Concettuale" | "Da fare";

export interface Project {
  id: string;
  name: string; // Titolo
  // Versione dell'immagine salvata in projectImages/{id} (timestamp); null = nessuna immagine
  imageVersion: number | null;
  location: string; // Località
  startDate: string; // Data Inizio, "YYYY-MM-DD"
  endDate: string; // Data Fine, "YYYY-MM-DD"
  classification: string; // Classificazione
  category: string; // Categorie delle opere
  typology: string; // Tipologia
  intervention: string; // Intervento
  client: string; // Committente
  service: string; // Prestazione
  amount: number; // Importo lavori
  status: ProjectStatus; // Avanzamento
  works: string[]; // Lavori
  description: string; // Note / Descrizione
  isPublic: boolean;
}

// Project fields edited in the form (the image is saved separately).
export type ProjectFields = Omit<Project, 'id' | 'imageVersion'>;
