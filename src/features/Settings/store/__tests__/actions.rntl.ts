import { settingsActions } from '../actions';
import type { SettingsState } from '../reducer';

describe('settingsActions', () => {
  describe('setTheme', () => {
    it('updates theme to light', () => {
      const state: SettingsState = { theme: 'system', language: 'en' };
      settingsActions.setTheme(state, { type: 'setTheme', payload: 'light' });
      expect(state.theme).toBe('light');
    });

    it('updates theme to dark', () => {
      const state: SettingsState = { theme: 'system', language: 'en' };
      settingsActions.setTheme(state, { type: 'setTheme', payload: 'dark' });
      expect(state.theme).toBe('dark');
    });

    it('updates theme to system', () => {
      const state: SettingsState = { theme: 'light', language: 'en' };
      settingsActions.setTheme(state, { type: 'setTheme', payload: 'system' });
      expect(state.theme).toBe('system');
    });
  });

  describe('setLanguage', () => {
    it('updates language to Spanish', () => {
      const state: SettingsState = { theme: 'system', language: 'en' };
      settingsActions.setLanguage(state, {
        type: 'setLanguage',
        payload: 'es',
      });
      expect(state.language).toBe('es');
    });

    it('updates language to English', () => {
      const state: SettingsState = { theme: 'system', language: 'es' };
      settingsActions.setLanguage(state, {
        type: 'setLanguage',
        payload: 'en',
      });
      expect(state.language).toBe('en');
    });
  });

  describe('resetSettings', () => {
    it('returns initial state with system theme and English language', () => {
      const result = settingsActions.resetSettings();
      expect(result).toEqual({
        theme: 'system',
        language: 'en',
      });
    });
  });
});
