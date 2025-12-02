import React from 'react';
import * as ReactNative from 'react-native';
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react-native';

import { settingsReducer } from '@app/features/Settings';
import type { RootState } from '@app/store';

import { useAppColorScheme } from '../useAppColorScheme';

// Helper to create wrapper with Redux store
const createWrapper = (preloadedState?: Partial<RootState>) => {
  const rootReducer = combineReducers({
    settings: settingsReducer,
  });

  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useAppColorScheme', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  describe('when theme preference is "system"', () => {
    it('returns "light" when device color scheme is "light"', () => {
      mockUseColorScheme.mockReturnValue('light');
      const wrapper = createWrapper({ settings: { theme: 'system', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('light');
    });

    it('returns "dark" when device color scheme is "dark"', () => {
      mockUseColorScheme.mockReturnValue('dark');
      const wrapper = createWrapper({ settings: { theme: 'system', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('dark');
    });

    it('returns "light" when device color scheme is null (fallback)', () => {
      mockUseColorScheme.mockReturnValue(null);
      const wrapper = createWrapper({ settings: { theme: 'system', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('light');
    });

    it('returns "light" when device color scheme is undefined (fallback)', () => {
      mockUseColorScheme.mockReturnValue(undefined);
      const wrapper = createWrapper({ settings: { theme: 'system', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('light');
    });
  });

  describe('when theme preference is "light"', () => {
    it('returns "light" regardless of device color scheme being "dark"', () => {
      mockUseColorScheme.mockReturnValue('dark');
      const wrapper = createWrapper({ settings: { theme: 'light', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('light');
    });

    it('returns "light" when device color scheme is "light"', () => {
      mockUseColorScheme.mockReturnValue('light');
      const wrapper = createWrapper({ settings: { theme: 'light', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('light');
    });

    it('returns "light" when device color scheme is null', () => {
      mockUseColorScheme.mockReturnValue(null);
      const wrapper = createWrapper({ settings: { theme: 'light', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('light');
    });
  });

  describe('when theme preference is "dark"', () => {
    it('returns "dark" regardless of device color scheme being "light"', () => {
      mockUseColorScheme.mockReturnValue('light');
      const wrapper = createWrapper({ settings: { theme: 'dark', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('dark');
    });

    it('returns "dark" when device color scheme is "dark"', () => {
      mockUseColorScheme.mockReturnValue('dark');
      const wrapper = createWrapper({ settings: { theme: 'dark', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('dark');
    });

    it('returns "dark" when device color scheme is null', () => {
      mockUseColorScheme.mockReturnValue(null);
      const wrapper = createWrapper({ settings: { theme: 'dark', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      expect(result.current).toBe('dark');
    });
  });

  describe('hook integration', () => {
    it('calls React Native useColorScheme', () => {
      mockUseColorScheme.mockReturnValue('light');
      const wrapper = createWrapper({ settings: { theme: 'system', language: 'en' } });

      renderHook(() => useAppColorScheme(), { wrapper });

      expect(mockUseColorScheme).toHaveBeenCalledTimes(1);
    });

    it('integrates with Redux store to read theme preference', () => {
      mockUseColorScheme.mockReturnValue('light');
      const wrapper = createWrapper({ settings: { theme: 'dark', language: 'en' } });

      const { result } = renderHook(() => useAppColorScheme(), { wrapper });

      // Even though system is 'light', preference is 'dark', so should return 'dark'
      expect(result.current).toBe('dark');
    });
  });
});
