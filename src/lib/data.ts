import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "1",
    name: "Villa Moderna",
    description:
      "Una splendida villa moderna caratterizzata da linee pulite, ampie pareti vetrate e una connessione perfetta con il paesaggio circostante. Lo spazio abitativo open-plan è perfetto per intrattenere.",
    image: "https://placehold.co/600x400.png",
    status: "Completato",
    location: "Malibu, California",
    completionDate: "2023-05-15",
    isPublic: true,
  },
  {
    id: "2",
    name: "Grattacielo Urbano",
    description:
      "Una nuova icona nello skyline della città, questo grattacielo combina un design innovativo con pratiche di costruzione sostenibili. Offre un mix di spazi residenziali e commerciali.",
    image: "https://placehold.co/600x400.png",
    status: "In Corso",
    location: "New York, New York",
    completionDate: "2025-12-01",
    isPublic: true,
  },
  {
    id: "3",
    name: "Baita Ecologica",
    description:
      "Immersa nella foresta, questa baita è costruita interamente con materiali sostenibili e progettata per avere un impatto ambientale minimo, con pannelli solari e raccolta dell'acqua piovana.",
    image: "https://placehold.co/600x400.png",
    status: "Completato",
    location: "Asheville, North Carolina",
    completionDate: "2022-09-20",
    isPublic: true,
  },
  {
    id: "4",
    name: "Concetto di Città Galleggiante",
    description:
      "Un concetto visionario per una città galleggiante sostenibile, progettata per adattarsi all'innalzamento del livello del mare. Il progetto esplora nuove forme di vita urbana e architettura modulare.",
    image: "https://placehold.co/600x400.png",
    status: "Concettuale",
    location: "Oceano Pacifico",
    completionDate: "2040-01-01",
    isPublic: false,
  },
    {
    id: "5",
    name: "Museo del Patrimonio",
    description:
      "Un restauro sensibile e un'estensione di un edificio storico per creare un museo moderno. Il design rispetta l'architettura originale fornendo allo stesso tempo spazi espositivi contemporanei.",
    image: "https://placehold.co/600x400.png",
    status: "Completato",
    location: "Kyoto, Japan",
    completionDate: "2024-02-10",
    isPublic: true,
  },
  {
    id: "6",
    name: "Centro Sportivo Comunitario",
    description:
      "Una struttura sportiva polivalente progettata per essere il cuore della comunità. Il progetto è attualmente in fase strutturale e il completamento è previsto per il prossimo anno.",
    image: "https://placehold.co/600x400.png",
    status: "In Corso",
    location: "Manchester, UK",
    completionDate: "2025-08-30",
    isPublic: false,
  },
];
