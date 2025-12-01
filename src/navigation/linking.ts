import { Linking } from 'react-native';
import type { LinkingOptions, NavigationState, PartialState } from '@react-navigation/native';
import { getStateFromPath } from '@react-navigation/native';

import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

import type { RootStackParamList } from './RootNavigator/RootNavigator';
import { resetToRoute } from './navigationRef';

/**
 * Custom URL scheme for the app
 * Configured in iOS Info.plist and Android AndroidManifest.xml
 */
const URL_SCHEME = 'warrendeleonapp';

/**
 * Callback to refresh auth state after deep link tokens are stored.
 * Set by AuthProvider to dispatch checkSession() when tokens are stored via deep link.
 */
let onAuthTokensStored: (() => void) | null = null;

/**
 * Register a callback to be called when auth tokens are stored via deep link.
 * This allows the AuthProvider to refresh the auth state.
 */
export const setOnAuthTokensStored = (callback: (() => void) | null): void => {
  onAuthTokensStored = callback;
};

/**
 * Auth callback parameters extracted from Supabase redirect URL
 */
interface AuthCallbackParams {
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
}

/**
 * Parse Supabase auth callback URL
 *
 * Supabase auth links redirect to:
 * warrendeleonapp://auth/callback#access_token=TOKEN&refresh_token=REFRESH&type=recovery
 *
 * The token is in the hash fragment, not query params
 */
const parseAuthCallback = (url: string): AuthCallbackParams | null => {
  try {
    // Handle hash fragment (Supabase puts token in hash)
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hashFragment = url.substring(hashIndex + 1);
      const params = new URLSearchParams(hashFragment);
      return {
        accessToken: params.get('access_token'),
        refreshToken: params.get('refresh_token'),
        type: params.get('type'),
      };
    }

    // Handle query params as fallback
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const queryString = url.substring(queryIndex + 1);
      const params = new URLSearchParams(queryString);
      return {
        accessToken: params.get('access_token'),
        refreshToken: params.get('refresh_token'),
        type: params.get('type'),
      };
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Store auth tokens for auto-login
 * Called asynchronously after parsing deep link.
 * After storing, notifies the AuthProvider to refresh auth state.
 */
const storeAuthTokens = async (accessToken: string, refreshToken: string | null): Promise<void> => {
  await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.set(SecureStoreKey.REFRESH_TOKEN, refreshToken);
  }
  // Notify AuthProvider to refresh auth state
  if (onAuthTokensStored) {
    onAuthTokensStored();
  }
};

/**
 * Custom getStateFromPath to handle Supabase auth callbacks
 *
 * React Navigation's default path parsing doesn't handle hash fragments,
 * so we need custom parsing for Supabase auth URLs.
 *
 * This function is called for both:
 * - Cold starts (app not running) via getInitialURL
 * - Warm starts (app in background/foreground) via subscribe
 *
 * Supabase auth callback types:
 * - recovery: Password reset → ResetPassword screen
 * - signup: Email confirmation after registration → Home screen (auto-login)
 * - email_change: Email change confirmation → Home screen
 * - magiclink: Magic link login → Home screen (auto-logged in)
 */
const customGetStateFromPath = (
  path: string,
  options?: Parameters<typeof getStateFromPath>[1]
): PartialState<NavigationState> | undefined => {
  // Check if this is a Supabase auth callback URL
  if (path.includes('auth/callback')) {
    const authParams = parseAuthCallback(path);

    if (authParams?.accessToken) {
      // Route based on auth callback type
      switch (authParams.type) {
        case 'recovery':
          // Password reset - go to ResetPassword screen
          return {
            routes: [
              { name: 'Home' },
              {
                name: 'ResetPassword',
                params: {
                  accessToken: authParams.accessToken,
                  fromEditAccount: false,
                },
              },
            ],
          };

        case 'signup':
          // Email confirmed after registration - auto-login and go to Home
          // Store tokens asynchronously (fire and forget for navigation)
          storeAuthTokens(authParams.accessToken, authParams.refreshToken);
          return {
            routes: [{ name: 'Home' }],
          };

        case 'email_change':
        case 'magiclink':
        default:
          // Email change confirmed or magic link - store tokens and go to Home
          storeAuthTokens(authParams.accessToken, authParams.refreshToken);
          return {
            routes: [{ name: 'Home' }],
          };
      }
    }
  }

  // Fall back to default parsing for other routes
  return getStateFromPath(path, options);
};

/**
 * Handle Supabase auth callback deep link for warm starts
 *
 * When the app is in the background/foreground and receives a deep link,
 * React Navigation's default linking doesn't properly handle URLs with
 * hash fragments. This function manually parses the URL and navigates.
 *
 * Supabase auth callback types:
 * - recovery: Password reset → ResetPassword screen
 * - signup: Email confirmation → Home screen (auto-login)
 * - email_change/magiclink: → Home screen
 *
 * Returns true if the URL was handled, false otherwise.
 */
const handleAuthCallbackDeepLink = async (url: string): Promise<boolean> => {
  if (url.includes('auth/callback')) {
    const authParams = parseAuthCallback(url);

    if (authParams?.accessToken) {
      switch (authParams.type) {
        case 'recovery':
          // Password reset - go to ResetPassword screen
          resetToRoute('ResetPassword', {
            accessToken: authParams.accessToken,
            fromEditAccount: false,
          });
          return true;

        case 'signup':
          // Email confirmed - store tokens and go to Home (auto-login)
          await storeAuthTokens(authParams.accessToken, authParams.refreshToken);
          resetToRoute('Home', undefined);
          return true;

        case 'email_change':
        case 'magiclink':
        default:
          // Store tokens and go to Home screen
          await storeAuthTokens(authParams.accessToken, authParams.refreshToken);
          resetToRoute('Home', undefined);
          return true;
      }
    }
  }
  return false;
};

/**
 * React Navigation linking configuration
 *
 * Handles Supabase auth callbacks via: warrendeleonapp://auth/callback#access_token=TOKEN&type=TYPE
 * - type=recovery → ResetPassword screen (password reset)
 * - type=signup → Home screen (auto-login after email confirmation)
 * - type=email_change → Home screen (email change confirmed)
 * - type=magiclink → Home screen (logged in via magic link)
 */
export const linkingConfiguration: LinkingOptions<RootStackParamList> = {
  prefixes: [`${URL_SCHEME}://`],

  // Custom state parsing to handle Supabase auth callbacks
  getStateFromPath: customGetStateFromPath,

  // Screen configuration for standard URL patterns
  config: {
    screens: {
      Home: 'home',
      Login: 'login',
      Registration: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
      Settings: 'settings',
      EditAccount: 'edit-account',
    },
  },

  // Get the initial URL that opened the app
  async getInitialURL(): Promise<string | null> {
    return Linking.getInitialURL();
  },

  // Subscribe to URL events while app is running (warm starts)
  subscribe(listener: (url: string) => void): () => void {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      // For auth callback URLs with hash fragments, handle navigation manually
      // because React Navigation's default linking doesn't handle them properly
      // during warm starts. Handle asynchronously.
      handleAuthCallbackDeepLink(url).then(handled => {
        if (!handled) {
          // If not an auth callback, pass to React Navigation
          listener(url);
        }
      });
    });

    return () => {
      // Use optional chaining for test environment compatibility
      subscription?.remove();
    };
  },
};
