export interface WorkXP {
  id: string;
  company: string;
  position: string;
  gradStart: string[];
  gradEnd: string[];
  clients: Client[];
  start: string;
  end: string;
  logo: string;
}

export interface Client {
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
  logo: string;
}
