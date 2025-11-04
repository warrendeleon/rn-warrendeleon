import Config from 'react-native-config';

// Shape of the environment config we care about
type EnvConfig = {
  ENV?: string;
  API_URL?: string;
};

// Normalise both possible shapes:
// - direct export: { ENV, API_URL }
// - default export: { default: { ENV, API_URL } }
const rawEnv = Config as EnvConfig & { default?: EnvConfig };
const resolvedEnv: EnvConfig = rawEnv.default ?? rawEnv;

export const ENV = resolvedEnv.ENV;
export const API_URL = resolvedEnv.API_URL;

const env = {
  ENV,
  API_URL,
};

export default env;
