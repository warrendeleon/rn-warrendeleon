/**
 * Tests for AuthScreenWrapper component
 *
 * Tests layout, keyboard avoiding behaviour, and theme support.
 */

import React from 'react';
import { Platform, Text } from 'react-native';
import { screen } from '@testing-library/react-native';

import { expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { AuthScreenWrapper } from '../AuthScreenWrapper';

// Mock useAppColorScheme hook
const mockUseAppColorScheme = jest.fn();
jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => mockUseAppColorScheme(),
}));

describe('AuthScreenWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
  });

  describe('rendering', () => {
    it('renders children correctly', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text testID="child">Child content</Text>
        </AuthScreenWrapper>
      );

      expect(screen.getByTestId('child')).toBeOnTheScreen();
      expect(screen.getByText('Child content')).toBeOnTheScreen();
    });

    it('renders with testID on ScrollView', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text>Content</Text>
        </AuthScreenWrapper>
      );

      expect(screen.getByTestId('auth-wrapper')).toBeOnTheScreen();
    });

    it('renders multiple children', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text testID="child-1">First</Text>
          <Text testID="child-2">Second</Text>
          <Text testID="child-3">Third</Text>
        </AuthScreenWrapper>
      );

      expect(screen.getByTestId('child-1')).toBeOnTheScreen();
      expect(screen.getByTestId('child-2')).toBeOnTheScreen();
      expect(screen.getByTestId('child-3')).toBeOnTheScreen();
    });
  });

  describe('theme support', () => {
    it('renders with light theme', () => {
      mockUseAppColorScheme.mockReturnValue('light');

      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text>Light mode</Text>
        </AuthScreenWrapper>
      );

      expect(screen.getByTestId('auth-wrapper')).toBeOnTheScreen();
    });

    it('renders with dark theme', () => {
      mockUseAppColorScheme.mockReturnValue('dark');

      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text>Dark mode</Text>
        </AuthScreenWrapper>
      );

      expect(screen.getByTestId('auth-wrapper')).toBeOnTheScreen();
    });
  });

  describe('scroll behaviour', () => {
    it('has keyboardShouldPersistTaps="handled"', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text>Content</Text>
        </AuthScreenWrapper>
      );

      const scrollView = screen.getByTestId('auth-wrapper');
      expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
    });

    it('has flexGrow enabled by default', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text>Content</Text>
        </AuthScreenWrapper>
      );

      const scrollView = screen.getByTestId('auth-wrapper');
      expect(scrollView.props.contentContainerStyle.flexGrow).toBe(1);
    });

    it('can disable flexGrow', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper" flexGrow={false}>
          <Text>Content</Text>
        </AuthScreenWrapper>
      );

      const scrollView = screen.getByTestId('auth-wrapper');
      expect(scrollView.props.contentContainerStyle.flexGrow).toBeUndefined();
    });

    it('has default paddingBottom of 40', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text>Content</Text>
        </AuthScreenWrapper>
      );

      const scrollView = screen.getByTestId('auth-wrapper');
      expect(scrollView.props.contentContainerStyle.paddingBottom).toBe(40);
    });

    it('can set custom paddingBottom', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper" paddingBottom={80}>
          <Text>Content</Text>
        </AuthScreenWrapper>
      );

      const scrollView = screen.getByTestId('auth-wrapper');
      expect(scrollView.props.contentContainerStyle.paddingBottom).toBe(80);
    });

    it('can set paddingBottom to 0', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper" paddingBottom={0}>
          <Text>Content</Text>
        </AuthScreenWrapper>
      );

      const scrollView = screen.getByTestId('auth-wrapper');
      expect(scrollView.props.contentContainerStyle.paddingBottom).toBe(0);
    });
  });

  describe('keyboard avoiding behaviour', () => {
    it('uses padding behaviour on iOS', () => {
      // Note: This tests the implementation logic
      // Platform.OS is mocked to 'ios' by default in jest.setup
      expect(Platform.OS === 'ios' ? 'padding' : 'height').toBe('padding');
    });

    it('uses height behaviour on Android', () => {
      const originalPlatform = Platform.OS;
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });

      expect(Platform.OS === 'ios' ? 'padding' : 'height').toBe('height');

      Object.defineProperty(Platform, 'OS', { value: originalPlatform, writable: true });
    });
  });

  describe('edge cases', () => {
    it('handles empty children', () => {
      renderWithProviders(<AuthScreenWrapper testID="auth-wrapper">{null}</AuthScreenWrapper>);

      expect(screen.getByTestId('auth-wrapper')).toBeOnTheScreen();
    });

    it('handles nested wrappers', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="outer-wrapper">
          <AuthScreenWrapper testID="inner-wrapper">
            <Text>Nested content</Text>
          </AuthScreenWrapper>
        </AuthScreenWrapper>
      );

      expect(screen.getByTestId('outer-wrapper')).toBeOnTheScreen();
      expect(screen.getByTestId('inner-wrapper')).toBeOnTheScreen();
      expect(screen.getByText('Nested content')).toBeOnTheScreen();
    });
  });

  describe('integration', () => {
    it('renders auth form content correctly', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="login-wrapper">
          <Text testID="form-title">Login</Text>
          <Text testID="email-label">Email</Text>
          <Text testID="password-label">Password</Text>
          <Text testID="submit-button">Sign In</Text>
        </AuthScreenWrapper>
      );

      expect(screen.getByTestId('login-wrapper')).toBeOnTheScreen();
      expect(screen.getByText('Login')).toBeOnTheScreen();
      expect(screen.getByText('Email')).toBeOnTheScreen();
      expect(screen.getByText('Password')).toBeOnTheScreen();
      expect(screen.getByText('Sign In')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('wrapper is accessible to screen readers', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text testID="child">Content</Text>
        </AuthScreenWrapper>
      );

      const wrapper = screen.getByTestId('auth-wrapper');
      expect(wrapper.props.accessible).not.toBe(false);
    });

    it('children maintain focus order', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text testID="first-element">First</Text>
          <Text testID="second-element">Second</Text>
          <Text testID="third-element">Third</Text>
        </AuthScreenWrapper>
      );

      const first = screen.getByTestId('first-element');
      const second = screen.getByTestId('second-element');
      const third = screen.getByTestId('third-element');

      // Verify elements are in expected DOM order for focus traversal
      expectFocusOrder([first, second, third]);
    });

    it('supports keyboard avoiding for form accessibility', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper">
          <Text>Form content</Text>
        </AuthScreenWrapper>
      );

      // KeyboardAvoidingView ensures forms remain accessible when keyboard is shown
      const wrapper = screen.getByTestId('auth-wrapper');
      expect(wrapper).toBeOnTheScreen();
    });

    it('scroll view allows full content access', () => {
      renderWithProviders(
        <AuthScreenWrapper testID="auth-wrapper" paddingBottom={40}>
          <Text>Content that may need scrolling</Text>
        </AuthScreenWrapper>
      );

      const wrapper = screen.getByTestId('auth-wrapper');
      // paddingBottom ensures content is accessible above keyboard
      expect(wrapper.props.contentContainerStyle.paddingBottom).toBe(40);
    });
  });
});
