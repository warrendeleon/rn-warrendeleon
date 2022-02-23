import {EnhancedStore} from '@reduxjs/toolkit';
import axios from 'axios';

let store: any;
const APPLICATION_FORM = 'application/json';
const CONTENT_TYPE = 'Content-Type';

export const BASE_URL = 'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/data';

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

export const injectStore = (_store: EnhancedStore) => {
  store = _store;
};

apiClient.interceptors.request.use(
  config => {
    config.headers = {
      [CONTENT_TYPE]: APPLICATION_FORM,
    };
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
