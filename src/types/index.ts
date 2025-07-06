export type ProjectStatus = "Completato" | "In Corso" | "Concettuale" | "Da fare";

export interface Project {
  id: string;
  name: string; // Titolo
  image: string; // Immagine
  location: string; // Località
  completionDate: string; // Data, "YYYY-MM-DD"
  classification: string; // Classificazione
  category: string; // Categorie delle opere
  typology: string; // Tipologia
  intervention: string; // Intervento
  client: string; // Committente
  service: string; // Prestazione
  amount: number; // Importo lavori
  status: ProjectStatus; // Avanzamento
  works: string[]; // Lavori
  description?: string; // Note / Descrizione
  isPublic: boolean;
}
