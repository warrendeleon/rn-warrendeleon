/**
 * Test fixtures for consistent test data across the application
 * Imports from the same JSON files used for E2E testing
 */

import type { Education, Profile, WorkExperience } from '@app/types/portfolio';

import educationCAData from './api/ca/education.json';
// Catalan fixtures
import profileCAData from './api/ca/profile.json';
import workxpCAData from './api/ca/workxp.json';
import educationENData from './api/en/education.json';
// English fixtures
import profileENData from './api/en/profile.json';
import workxpENData from './api/en/workxp.json';
import educationESData from './api/es/education.json';
// Spanish fixtures
import profileESData from './api/es/profile.json';
import workxpESData from './api/es/workxp.json';
import educationPLData from './api/pl/education.json';
// Polish fixtures
import profilePLData from './api/pl/profile.json';
import workxpPLData from './api/pl/workxp.json';
import educationTLData from './api/tl/education.json';
// Tagalog fixtures
import profileTLData from './api/tl/profile.json';
import workxpTLData from './api/tl/workxp.json';

/**
 * English fixtures (default for most tests)
 */
export const mockProfileEN = profileENData as Profile;
export const mockEducationEN = educationENData as Education[];
export const mockWorkXPEN = workxpENData as WorkExperience[];

/**
 * Spanish fixtures
 */
export const mockProfileES = profileESData as Profile;
export const mockEducationES = educationESData as Education[];
export const mockWorkXPES = workxpESData as WorkExperience[];

/**
 * Catalan fixtures
 */
export const mockProfileCA = profileCAData as Profile;
export const mockEducationCA = educationCAData as Education[];
export const mockWorkXPCA = workxpCAData as WorkExperience[];

/**
 * Polish fixtures
 */
export const mockProfilePL = profilePLData as Profile;
export const mockEducationPL = educationPLData as Education[];
export const mockWorkXPPL = workxpPLData as WorkExperience[];

/**
 * Tagalog fixtures
 */
export const mockProfileTL = profileTLData as Profile;
export const mockEducationTL = educationTLData as Education[];
export const mockWorkXPTL = workxpTLData as WorkExperience[];

/**
 * Default exports (English) for convenience
 */
export const mockProfile = mockProfileEN;
export const mockEducation = mockEducationEN;
export const mockWorkXP = mockWorkXPEN;
