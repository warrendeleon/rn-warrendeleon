export interface WorkXP {
  id: string;
  company: string;
  position: string;
  gradStart: string;
  gradEnd: string;
  projects: Project[];
  start: string;
  end: string;
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
