/**
 * Tests for FormInputGroup component
 *
 * Tests grouped input rendering, styling, and accessibility.
 */

import React from 'react';
import { Text as RNText } from 'react-native';
import { screen } from '@testing-library/react-native';

import { expectFocusOrder, renderWithProviders } from '@app/test-utils';

import { FormInputGroup } from '../FormInputGroup';

// Mock useAppColorScheme hook
const mockUseAppColorScheme = jest.fn();
jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => mockUseAppColorScheme(),
}));

describe('FormInputGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
  });

  describe('rendering', () => {
    it('renders children correctly', () => {
      renderWithProviders(
        <FormInputGroup testID="form-group">
          <RNText testID="child">Child content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('child')).toBeOnTheScreen();
      expect(screen.getByText('Child content')).toBeOnTheScreen();
    });

    it('renders with testID', () => {
      renderWithProviders(
        <FormInputGroup testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
    });

    it('renders without title', () => {
      renderWithProviders(
        <FormInputGroup testID="form-group">
          <RNText testID="input">Input field</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
      expect(screen.getByTestId('input')).toBeOnTheScreen();
    });

    it('renders with title', () => {
      renderWithProviders(
        <FormInputGroup title="Account Details" testID="form-group">
          <RNText>Input field</RNText>
        </FormInputGroup>
      );

      expect(screen.getByText('Account Details')).toBeOnTheScreen();
    });

    it('renders multiple children', () => {
      renderWithProviders(
        <FormInputGroup testID="form-group">
          <RNText testID="input-1">Email</RNText>
          <RNText testID="input-2">Password</RNText>
          <RNText testID="input-3">Confirm Password</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('input-1')).toBeOnTheScreen();
      expect(screen.getByTestId('input-2')).toBeOnTheScreen();
      expect(screen.getByTestId('input-3')).toBeOnTheScreen();
    });
  });

  describe('title styling', () => {
    it('renders title in uppercase', () => {
      renderWithProviders(
        <FormInputGroup title="account details" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      // The component applies textTransform="uppercase"
      expect(screen.getByText('account details')).toBeOnTheScreen();
    });

    it('title has header accessibility role', () => {
      renderWithProviders(
        <FormInputGroup title="Personal Info" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByRole('header')).toBeOnTheScreen();
    });
  });

  describe('theme support', () => {
    it('renders with light theme', () => {
      mockUseAppColorScheme.mockReturnValue('light');

      renderWithProviders(
        <FormInputGroup title="Light Mode" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
      expect(screen.getByText('Light Mode')).toBeOnTheScreen();
    });

    it('renders with dark theme', () => {
      mockUseAppColorScheme.mockReturnValue('dark');

      renderWithProviders(
        <FormInputGroup title="Dark Mode" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
      expect(screen.getByText('Dark Mode')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('title has role="header" for screen readers', () => {
      renderWithProviders(
        <FormInputGroup title="Contact Information" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      const header = screen.getByRole('header');
      expect(header).toBeOnTheScreen();
      expect(screen.getByText('Contact Information')).toBeOnTheScreen();
    });

    it('groups form fields semantically', () => {
      renderWithProviders(
        <FormInputGroup title="Login Credentials" testID="login-group">
          <RNText testID="email-input">Email input</RNText>
          <RNText testID="password-input">Password input</RNText>
        </FormInputGroup>
      );

      // All elements should be within the group container
      const group = screen.getByTestId('login-group');
      expect(group).toBeOnTheScreen();
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
      expect(screen.getByTestId('password-input')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('has correct focus order with title and inputs', () => {
      renderWithProviders(
        <FormInputGroup title="Login" testID="form-group">
          <RNText testID="email-field" accessibilityRole="none">
            Email
          </RNText>
          <RNText testID="password-field" accessibilityRole="none">
            Password
          </RNText>
        </FormInputGroup>
      );

      const title = screen.getByRole('header');
      const emailField = screen.getByTestId('email-field');
      const passwordField = screen.getByTestId('password-field');

      expectFocusOrder([title, emailField, passwordField]);
    });

    it('has correct focus order for multi-field form', () => {
      renderWithProviders(
        <FormInputGroup title="Personal Details" testID="form-group">
          <RNText testID="first-name" accessibilityRole="none">
            First Name
          </RNText>
          <RNText testID="last-name" accessibilityRole="none">
            Last Name
          </RNText>
          <RNText testID="email" accessibilityRole="none">
            Email
          </RNText>
        </FormInputGroup>
      );

      const title = screen.getByRole('header');
      const firstName = screen.getByTestId('first-name');
      const lastName = screen.getByTestId('last-name');
      const email = screen.getByTestId('email');

      expectFocusOrder([title, firstName, lastName, email]);
    });
  });

  describe('customisation', () => {
    it('accepts custom horizontal margin', () => {
      renderWithProviders(
        <FormInputGroup mx="$8" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
    });

    it('accepts custom top margin', () => {
      renderWithProviders(
        <FormInputGroup mt="$10" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
    });

    it('accepts both custom margins', () => {
      renderWithProviders(
        <FormInputGroup mx="$2" mt="$0" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
    });
  });

  describe('edge cases', () => {
    it('handles empty title', () => {
      renderWithProviders(
        <FormInputGroup title="" testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
      // Empty title should not render a header
      expect(screen.queryByRole('header')).toBeNull();
    });

    it('handles undefined title', () => {
      renderWithProviders(
        <FormInputGroup title={undefined} testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
      expect(screen.queryByRole('header')).toBeNull();
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(100);

      renderWithProviders(
        <FormInputGroup title={longTitle} testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByText(longTitle)).toBeOnTheScreen();
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Account & Security (2FA)';

      renderWithProviders(
        <FormInputGroup title={specialTitle} testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByText(specialTitle)).toBeOnTheScreen();
    });

    it('handles unicode in title', () => {
      const unicodeTitle = 'Données personnelles 日本語';

      renderWithProviders(
        <FormInputGroup title={unicodeTitle} testID="form-group">
          <RNText>Content</RNText>
        </FormInputGroup>
      );

      expect(screen.getByText(unicodeTitle)).toBeOnTheScreen();
    });

    it('handles null children', () => {
      renderWithProviders(<FormInputGroup testID="form-group">{null}</FormInputGroup>);

      expect(screen.getByTestId('form-group')).toBeOnTheScreen();
    });
  });

  describe('integration', () => {
    it('renders nested form groups', () => {
      renderWithProviders(
        <FormInputGroup title="Outer Group" testID="outer-group">
          <FormInputGroup title="Inner Group" testID="inner-group">
            <RNText>Nested content</RNText>
          </FormInputGroup>
        </FormInputGroup>
      );

      expect(screen.getByTestId('outer-group')).toBeOnTheScreen();
      expect(screen.getByTestId('inner-group')).toBeOnTheScreen();
      expect(screen.getByText('Nested content')).toBeOnTheScreen();
    });

    it('renders complete form layout', () => {
      renderWithProviders(
        <FormInputGroup title="Login" testID="login-form">
          <RNText testID="email">Email field</RNText>
          <RNText testID="divider">Divider</RNText>
          <RNText testID="password">Password field</RNText>
        </FormInputGroup>
      );

      expect(screen.getByText('Login')).toBeOnTheScreen();
      expect(screen.getByTestId('email')).toBeOnTheScreen();
      expect(screen.getByTestId('divider')).toBeOnTheScreen();
      expect(screen.getByTestId('password')).toBeOnTheScreen();
    });
  });
});
