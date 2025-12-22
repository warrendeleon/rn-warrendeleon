import { selectLanguage, selectTheme } from '@app/features/Settings';
import type { RootState } from '@app/store';

describe('settingsSelectors', () => {
  const mockState = {
    settings: {
      theme: 'dark' as const,
      language: 'es' as const,
    },
  } as RootState;

  describe('selectTheme', () => {
    it('returns the theme from state', () => {
      expect(selectTheme(mockState)).toBe('dark');
    });

    it('returns consistent value when called multiple times', () => {
      expect(selectTheme(mockState)).toBe('dark');
      expect(selectTheme(mockState)).toBe('dark');
    });

    it('reflects state changes', () => {
      const state1 = mockState;
      const state2 = {
        settings: {
          theme: 'light' as const,
          language: 'es' as const,
        },
      } as RootState;

      expect(selectTheme(state1)).toBe('dark');
      expect(selectTheme(state2)).toBe('light');
    });

    it('returns same value when settings slice unchanged', () => {
      const state1 = mockState;
      const state2 = {
        ...mockState,
        settings: mockState.settings,
      } as RootState;

      expect(selectTheme(state1)).toBe('dark');
      expect(selectTheme(state2)).toBe('dark');
    });
  });

  describe('selectLanguage', () => {
    it('returns the language from state', () => {
      expect(selectLanguage(mockState)).toBe('es');
    });

    it('returns consistent value when called multiple times', () => {
      expect(selectLanguage(mockState)).toBe('es');
      expect(selectLanguage(mockState)).toBe('es');
    });

    it('reflects state changes', () => {
      const state1 = mockState;
      const state2 = {
        settings: {
          theme: 'dark' as const,
          language: 'en' as const,
        },
      } as RootState;

      expect(selectLanguage(state1)).toBe('es');
      expect(selectLanguage(state2)).toBe('en');
    });

    it('returns same value when settings slice unchanged', () => {
      const state1 = mockState;
      const state2 = {
        ...mockState,
        settings: mockState.settings,
      } as RootState;

      expect(selectLanguage(state1)).toBe('es');
      expect(selectLanguage(state2)).toBe('es');
    });
  });
});
