import axios from 'axios';

/**
 * Base URL for fetching portfolio data from GitHub raw content
 * Points to the test-utils/fixtures/api directory which contains
 * multi-language portfolio data (en, es, ca, pl, tl)
 */
export const BASE_URL =
  'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/test-utils/fixtures/api';

/**
 * Axios client configured for GitHub raw content API
 * Used to fetch profile, work experience, and education data
 * No authentication required for public repositories
 */
export const GithubApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
