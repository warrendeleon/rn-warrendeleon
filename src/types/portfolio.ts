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
 * Work experience entry
 */
export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  position: string;
  start: string;
  end: string;
  programmingLanguages?: string[];
  techStack?: string[];
  unitTest?: string[];
  e2e?: string[];
  devTools?: string[];
  agileMethodology?: string[];
  description: string;
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
