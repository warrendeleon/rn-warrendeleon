import {
  resetSettings,
  setLanguage,
  setTheme,
  settingsReducer,
  type SettingsState,
} from '@app/features/Settings';

describe('settingsReducer', () => {
  const initialState: SettingsState = {
    theme: 'system',
    language: 'en',
  };

  it('returns the initial state', () => {
    expect(settingsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setTheme', () => {
    it('updates the theme to light', () => {
      const actual = settingsReducer(initialState, setTheme('light'));
      expect(actual.theme).toBe('light');
    });

    it('updates the theme to dark', () => {
      const actual = settingsReducer(initialState, setTheme('dark'));
      expect(actual.theme).toBe('dark');
    });

    it('updates the theme to system', () => {
      const actual = settingsReducer(initialState, setTheme('system'));
      expect(actual.theme).toBe('system');
    });
  });

  describe('setLanguage', () => {
    it('updates the language to Spanish', () => {
      const actual = settingsReducer(initialState, setLanguage('es'));
      expect(actual.language).toBe('es');
    });

    it('updates the language to English', () => {
      const actual = settingsReducer(initialState, setLanguage('en'));
      expect(actual.language).toBe('en');
    });
  });

  describe('resetSettings', () => {
    it('resets all settings to initial state', () => {
      const modifiedState: SettingsState = {
        theme: 'dark',
        language: 'es',
      };

      const actual = settingsReducer(modifiedState, resetSettings());
      expect(actual).toEqual(initialState);
    });
  });

  describe('complex state transition sequences', () => {
    it('handles theme → language → reset sequence', () => {
      // Step 1: Set theme
      let state = settingsReducer(initialState, setTheme('dark'));
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('en');

      // Step 2: Set language
      state = settingsReducer(state, setLanguage('es'));
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('es');

      // Step 3: Reset
      state = settingsReducer(state, resetSettings());
      expect(state.theme).toBe('system');
      expect(state.language).toBe('en');
    });

    it('handles multiple theme changes correctly', () => {
      let state = settingsReducer(initialState, setTheme('dark'));
      state = settingsReducer(state, setTheme('light'));
      state = settingsReducer(state, setTheme('system'));
      state = settingsReducer(state, setTheme('dark'));

      expect(state.theme).toBe('dark');
      expect(state.language).toBe('en'); // Language unaffected
    });

    it('handles all supported language changes', () => {
      const languages: SettingsState['language'][] = ['en', 'es', 'ca', 'pl', 'tl'];
      let state = initialState;

      languages.forEach(lang => {
        state = settingsReducer(state, setLanguage(lang));
        expect(state.language).toBe(lang);
      });
    });

    it('handles reset → immediate modification sequence', () => {
      const modifiedState: SettingsState = {
        theme: 'dark',
        language: 'es',
      };

      // Reset to initial
      let state = settingsReducer(modifiedState, resetSettings());
      expect(state.theme).toBe('system');

      // Immediately modify again
      state = settingsReducer(state, setTheme('light'));
      expect(state.theme).toBe('light');
      expect(state.language).toBe('en');
    });
  });

  describe('partial state updates preserve unaffected data', () => {
    it('setTheme preserves language', () => {
      const state: SettingsState = {
        theme: 'system',
        language: 'es',
      };

      const newState = settingsReducer(state, setTheme('dark'));

      expect(newState.theme).toBe('dark');
      expect(newState.language).toBe('es'); // Preserved
    });

    it('setLanguage preserves theme', () => {
      const state: SettingsState = {
        theme: 'dark',
        language: 'en',
      };

      const newState = settingsReducer(state, setLanguage('ca'));

      expect(newState.language).toBe('ca');
      expect(newState.theme).toBe('dark'); // Preserved
    });

    it('rapid sequential updates preserve latest values', () => {
      let state: SettingsState = {
        theme: 'system',
        language: 'en',
      };

      // Rapid updates
      state = settingsReducer(state, setTheme('dark'));
      state = settingsReducer(state, setLanguage('pl'));
      state = settingsReducer(state, setTheme('light'));
      state = settingsReducer(state, setLanguage('tl'));

      expect(state.theme).toBe('light');
      expect(state.language).toBe('tl');
    });
  });

  describe('theme edge cases', () => {
    it('handles all theme values', () => {
      const themes: SettingsState['theme'][] = ['light', 'dark', 'system'];

      themes.forEach(theme => {
        const state = settingsReducer(initialState, setTheme(theme));
        expect(state.theme).toBe(theme);
      });
    });

    it('handles same theme set twice', () => {
      let state = settingsReducer(initialState, setTheme('dark'));
      state = settingsReducer(state, setTheme('dark'));

      expect(state.theme).toBe('dark');
    });
  });

  describe('language edge cases', () => {
    it('handles all supported language codes', () => {
      const expectedLanguages: SettingsState['language'][] = ['en', 'es', 'ca', 'pl', 'tl'];

      expectedLanguages.forEach(lang => {
        const state = settingsReducer(initialState, setLanguage(lang));
        expect(state.language).toBe(lang);
      });
    });

    it('handles same language set twice', () => {
      let state = settingsReducer(initialState, setLanguage('es'));
      state = settingsReducer(state, setLanguage('es'));

      expect(state.language).toBe('es');
    });
  });
});
