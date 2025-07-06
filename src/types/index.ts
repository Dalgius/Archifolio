export type ProjectStatus = "Completed" | "In Progress" | "Conceptual";

export interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  status: ProjectStatus;
  location: string;
  completionDate: string; // "YYYY-MM-DD"
}
