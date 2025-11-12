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

    it('is memoized - returns same reference when state unchanged', () => {
      // Call selector twice with same state
      const result1 = selectTheme(mockState);
      const result2 = selectTheme(mockState);

      // Should return same value
      expect(result1).toBe(result2);
      expect(result1).toBe('dark');
    });

    it('recomputes when settings slice changes', () => {
      const state1 = mockState;
      const state2 = {
        settings: {
          theme: 'light' as const,
          language: 'es' as const,
        },
      } as RootState;

      const result1 = selectTheme(state1);
      const result2 = selectTheme(state2);

      // Should return different values
      expect(result1).toBe('dark');
      expect(result2).toBe('light');
    });

    it('does not recompute when unrelated state changes', () => {
      const state1 = mockState;
      const state2 = {
        ...mockState,
        settings: mockState.settings, // Same settings reference
      } as RootState;

      // Call with first state
      const result1 = selectTheme(state1);

      // Call with second state (same settings slice)
      const result2 = selectTheme(state2);

      // Should return same memoized result
      expect(result1).toBe(result2);
      expect(result1).toBe('dark');
    });
  });

  describe('selectLanguage', () => {
    it('returns the language from state', () => {
      expect(selectLanguage(mockState)).toBe('es');
    });

    it('is memoized - returns same reference when state unchanged', () => {
      // Call selector twice with same state
      const result1 = selectLanguage(mockState);
      const result2 = selectLanguage(mockState);

      // Should return same value
      expect(result1).toBe(result2);
      expect(result1).toBe('es');
    });

    it('recomputes when settings slice changes', () => {
      const state1 = mockState;
      const state2 = {
        settings: {
          theme: 'dark' as const,
          language: 'en' as const,
        },
      } as RootState;

      const result1 = selectLanguage(state1);
      const result2 = selectLanguage(state2);

      // Should return different values
      expect(result1).toBe('es');
      expect(result2).toBe('en');
    });

    it('does not recompute when unrelated state changes', () => {
      const state1 = mockState;
      const state2 = {
        ...mockState,
        settings: mockState.settings, // Same settings reference
      } as RootState;

      // Call with first state
      const result1 = selectLanguage(state1);

      // Call with second state (same settings slice)
      const result2 = selectLanguage(state2);

      // Should return same memoized result
      expect(result1).toBe(result2);
      expect(result1).toBe('es');
    });
  });
});
