/**
 * Portfolio data types matching the JSON structure from GitHub API
 * Used by Profile, WorkXP, and Education features
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Location information
 */
export interface Location {
  cityTown: string;
  county: string;
  country: string;
  coordinates: Coordinates;
}

/**
 * Social media links
 */
export interface Socials {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedIn: string;
}

/**
 * User profile data
 */
export interface Profile {
  profilePicture: string;
  name: string;
  lastName: string;
  headline: string;
  namePronunciation: string;
  namePronunciationAudioTrack: string;
  email: string;
  phone: string;
  birthday: string;
  location: Location;
  carousel: string[];
  socials: Socials;
}

/**
 * Client information for contract work
 */
export interface Client {
  id: string;
  company: string;
  logo: string;
  start: string;
  end: string;
  type: string;
  position: string;
  programmingLanguages: string[];
  techStack: string[];
  unitTest?: string[];
  e2e?: string[];
  devTools: string[];
  agileMethodology: string[];
  description: string;
}

/**
 * Position within a company
 * Supports both developer roles (with tech stack) and manager roles (with responsibilities)
 */
export interface Position {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  // Technical fields (for developer roles)
  programmingLanguages?: string[];
  techStack?: string[];
  unitTest?: string[];
  e2e?: string[];
  devTools?: string[];
  agileMethodology?: string[];
  // Management fields (for manager roles)
  responsibilities?: string[];
}

/**
 * Work experience entry
 */
export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  positions: Position[];
  clients?: Client[];
}

/**
 * Education entry
 */
export interface Education {
  location: string;
  title: string;
  logo: string;
  start: string;
  end?: string;
  certificate?: string;
}
