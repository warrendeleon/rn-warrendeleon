import { selectLanguage, selectTheme } from '@app/features/Settings';
import type { RootState } from '@app/store';

describe('settingsSelectors', () => {
  const mockState = {
    settings: {
      theme: 'dark' as const,
      language: 'es' as const,
    },
  } as RootState;

  it('selectTheme returns the theme', () => {
    expect(selectTheme(mockState)).toBe('dark');
  });

  it('selectLanguage returns the language', () => {
    expect(selectLanguage(mockState)).toBe('es');
  });
});
