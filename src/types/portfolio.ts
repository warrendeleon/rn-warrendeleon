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
  galleryImages: string[];
  socials: Socials;
}

/**
 * Testing framework configuration
 */
export interface TestingConfig {
  unit: string[] | null;
  e2e: string[] | null;
}

/**
 * Technology stack for a position
 */
export interface Technologies {
  languages: string[];
  frameworks: string[];
  testing: TestingConfig | null;
  tools: string[];
  ci: string[] | null;
  methodology: string[];
}

/**
 * Client reference for contract positions
 */
export interface ClientReference {
  name: string;
  logo: string;
}

/**
 * Position within a company
 * Supports both developer roles (with technologies) and manager roles (with responsibilities)
 */
export interface Position {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
  responsibilities: string[] | null;
  technologies: Technologies | null;
  client?: ClientReference | null;
}

/**
 * Work experience entry
 */
export interface WorkExperience {
  id: string;
  company: string;
  logo?: string;
  positions: Position[];
}

/**
 * Education entry
 */
export interface Education {
  id: string;
  institution: string;
  title: string;
  logo: string;
  startDate: string;
  endDate: string | null;
  certificateUrl: string | null;
}
