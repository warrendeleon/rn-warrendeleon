import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';

import { AuthProvider, authReducer } from '@app/features/Auth';
import { educationReducer } from '@app/features/Education';
import { profileReducer } from '@app/features/Profile';
import { settingsReducer } from '@app/features/Settings';
import { workExperienceReducer } from '@app/features/WorkExperience';
import i18n from '@app/i18n';
import { ToastProvider } from '@app/shared/components';

/**
 * Root reducer for tests (same structure as production)
 * Note: We don't use redux-persist in tests to avoid AsyncStorage complexity
 */
const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: authReducer,
  profile: profileReducer,
  workExperience: workExperienceReducer,
  education: educationReducer,
});

type RootState = ReturnType<typeof rootReducer>;

// Helper to create a properly typed store for tests
function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for testing
        immutableCheck: false, // Disable for testing
      }),
  });
}

type AppStore = ReturnType<typeof createTestStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * Test utility to render components with Redux store
 * Uses REAL Redux store with MSW for HTTP mocking
 *
 * Benefits:
 * - Tests actual integration behaviour (not mocked Redux)
 * - No act() warnings (all state updates within React's control)
 * - MSW intercepts HTTP requests at the correct layer
 * - Reusable pattern for all Redux-connected component tests
 *
 * @param ui - Component to render
 * @param options - Render options including optional preloadedState and store
 * @returns Render result with store instance
 *
 * @example
 * ```tsx
 * const { store, getByText } = renderWithProviders(<MyComponent />);
 *
 * // Wait for async Redux updates
 * await waitFor(() => {
 *   expect(store.getState().profile.loading).toBe(false);
 * });
 *
 * // Verify UI reflects Redux state
 * expect(getByText('Warren de Leon')).toBeTruthy();
 * ```
 */
export async function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, store, ...renderOptions }: ExtendedRenderOptions = {}
) {
  // Create store if not provided
  const createdStore = store || createTestStore(preloadedState);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={createdStore}>
        <AuthProvider>
          <I18nextProvider i18n={i18n}>
            <GluestackUIProvider config={config}>
              <ToastProvider>{children}</ToastProvider>
            </GluestackUIProvider>
          </I18nextProvider>
        </AuthProvider>
      </Provider>
    );
  }

  return { store: createdStore, ...await render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
