export interface WorkXP {
  id: string;
  company: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  start: string;
  end: string;
  type: string;
  position: string;
  programmingLanguages: string[];
  techStack: string[];
  unitTest: string[];
  e2e: string[];
  devTools: string[];
  agileMethodology: string[];
  description: string;
}
