import {
  resetSettings,
  setLanguage,
  setTheme,
  settingsReducer,
  type SettingsState,
} from '../../index';

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
});
