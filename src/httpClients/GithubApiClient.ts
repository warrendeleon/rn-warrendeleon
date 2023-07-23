import axios from 'axios';

export const BASE_URL =
  'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/data';

export const GithubApiClient = axios.create({
  baseURL: BASE_URL,
});
