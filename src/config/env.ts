import Config from 'react-native-config';

// Shape of the environment config we care about
type EnvConfig = {
  APP_ENV?: string;
  API_URL?: string;
};

// Normalise both possible shapes:
// - direct export: { ENV, API_URL }
// - default export: { default: { ENV, API_URL } }
const rawEnv = Config as EnvConfig & { default?: EnvConfig };
const resolvedEnv: EnvConfig = rawEnv.default ?? rawEnv;

export const APP_ENV = resolvedEnv.APP_ENV;
export const API_URL = resolvedEnv.API_URL;

const env = {
  APP_ENV,
  API_URL,
};

export default env;
