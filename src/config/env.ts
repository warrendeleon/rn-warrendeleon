import Config from 'react-native-config';

export const APP_ENV_VALUES = ['development', 'production'] as const;
export type AppEnv = (typeof APP_ENV_VALUES)[number];

export interface EnvConfig {
  APP_ENV: AppEnv;
  API_URL: string;
}

const validateEnv = (): EnvConfig => {
  const { APP_ENV, API_URL } = Config as {
    APP_ENV?: string;
    API_URL?: string;
  };

  if (!APP_ENV) {
    throw new Error('APP_ENV is not defined');
  }

  if (!APP_ENV_VALUES.includes(APP_ENV as AppEnv)) {
    throw new Error(
      `APP_ENV must be one of ${APP_ENV_VALUES.join(', ')} but received "${APP_ENV}"`
    );
  }

  if (!API_URL) {
    throw new Error('API_URL is not defined');
  }

  return {
    APP_ENV: APP_ENV as AppEnv,
    API_URL,
  };
};

let cachedEnv: EnvConfig | null = null;

export const getEnv = (): EnvConfig => {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
};

// Single source of truth for the resolved env
export const env = getEnv();

// Convenient named exports
export const { APP_ENV, API_URL } = env;

// Optional default export for flexibility
export default env;
