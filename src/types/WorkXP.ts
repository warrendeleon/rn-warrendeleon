import {Client} from '@app/types';

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
  type?: string;
  programmingLanguages?: string[];
  techStack?: string[];
  unitTest?: string[];
  e2e?: string[];
  devTools?: string[];
  agileMethodology?: string[];
  description?: string;
}