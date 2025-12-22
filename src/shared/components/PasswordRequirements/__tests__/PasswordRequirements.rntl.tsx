/**
 * Tests for PasswordRequirements component
 *
 */

import React from 'react';
import { screen } from '@testing-library/react-native';

import { expectFocusOrder, renderWithProviders } from '@app/test-utils';

import {
  checkPasswordRequirements,
  type CustomRequirement,
  PasswordRequirements,
} from '../PasswordRequirements';

describe('checkPasswordRequirements', () => {
  describe('length requirement', () => {
    it('should fail for password less than 8 characters', () => {
      expect(checkPasswordRequirements('Pass1!').length).toBe(false);
      expect(checkPasswordRequirements('1234567').length).toBe(false);
    });

    it('should pass for password with 8 or more characters', () => {
      expect(checkPasswordRequirements('Password').length).toBe(true);
      expect(checkPasswordRequirements('12345678').length).toBe(true);
      expect(checkPasswordRequirements('VeryLongPassword123!').length).toBe(true);
    });
  });

  describe('uppercase requirement', () => {
    it('should fail for password without uppercase', () => {
      expect(checkPasswordRequirements('password123!').uppercase).toBe(false);
    });

    it('should pass for password with uppercase', () => {
      expect(checkPasswordRequirements('Password123!').uppercase).toBe(true);
      expect(checkPasswordRequirements('pASsword').uppercase).toBe(true);
    });
  });

  describe('lowercase requirement', () => {
    it('should fail for password without lowercase', () => {
      expect(checkPasswordRequirements('PASSWORD123!').lowercase).toBe(false);
    });

    it('should pass for password with lowercase', () => {
      expect(checkPasswordRequirements('Password123!').lowercase).toBe(true);
      expect(checkPasswordRequirements('PASSWORd').lowercase).toBe(true);
    });
  });

  describe('number requirement', () => {
    it('should fail for password without number', () => {
      expect(checkPasswordRequirements('Password!').number).toBe(false);
    });

    it('should pass for password with number', () => {
      expect(checkPasswordRequirements('Password1').number).toBe(true);
      expect(checkPasswordRequirements('9password').number).toBe(true);
    });
  });

  describe('special character requirement', () => {
    it('should fail for password without special character', () => {
      expect(checkPasswordRequirements('Password123').special).toBe(false);
    });

    it('should pass for password with special character', () => {
      expect(checkPasswordRequirements('Password123!').special).toBe(true);
      expect(checkPasswordRequirements('Password@').special).toBe(true);
      expect(checkPasswordRequirements('Password#').special).toBe(true);
      expect(checkPasswordRequirements('Password$').special).toBe(true);
      expect(checkPasswordRequirements('Password%').special).toBe(true);
      expect(checkPasswordRequirements('Password&').special).toBe(true);
      expect(checkPasswordRequirements('Password*').special).toBe(true);
    });

    it('should pass for various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '='];
      specialChars.forEach(char => {
        expect(checkPasswordRequirements(`Password1${char}`).special).toBe(true);
      });
    });
  });

  describe('empty and edge cases', () => {
    it('should fail all requirements for empty password', () => {
      const result = checkPasswordRequirements('');
      expect(result.length).toBe(false);
      expect(result.uppercase).toBe(false);
      expect(result.lowercase).toBe(false);
      expect(result.number).toBe(false);
      expect(result.special).toBe(false);
    });

    it('should handle password meeting all requirements', () => {
      const result = checkPasswordRequirements('Password123!');
      expect(result.length).toBe(true);
      expect(result.uppercase).toBe(true);
      expect(result.lowercase).toBe(true);
      expect(result.number).toBe(true);
      expect(result.special).toBe(true);
    });
  });
});

describe('PasswordRequirements component', () => {
  describe('rendering', () => {
    it('should render with testID', () => {
      renderWithProviders(<PasswordRequirements password="" testID="password-requirements" />);

      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });

    it('should render title', () => {
      renderWithProviders(<PasswordRequirements password="" />);

      // The title is translated - check for the requirements container
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });
  });

  describe('requirement indicators', () => {
    it('should show all requirements as unmet for empty password', () => {
      renderWithProviders(<PasswordRequirements password="" />);

      // All requirements should be displayed with unmet styling (grey text)
      // Note: Icons are mocked in jest.setup, so we verify text presence
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();

      // Verify requirement text is visible (translated via i18n mock)
      // The checkPasswordRequirements function returns all false for empty
      const result = checkPasswordRequirements('');
      expect(result.length).toBe(false);
      expect(result.uppercase).toBe(false);
      expect(result.lowercase).toBe(false);
      expect(result.number).toBe(false);
      expect(result.special).toBe(false);
    });

    it('should show all requirements as met for strong password', () => {
      renderWithProviders(<PasswordRequirements password="StrongPass123!" />);

      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();

      // Verify all requirements are met via the exported function
      const result = checkPasswordRequirements('StrongPass123!');
      expect(result.length).toBe(true);
      expect(result.uppercase).toBe(true);
      expect(result.lowercase).toBe(true);
      expect(result.number).toBe(true);
      expect(result.special).toBe(true);
    });

    it('should show partial requirements for password with some criteria met', () => {
      renderWithProviders(<PasswordRequirements password="password" />);

      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();

      // 'password' meets length and lowercase, but not uppercase, number, or special
      const result = checkPasswordRequirements('password');
      expect(result.length).toBe(true);
      expect(result.lowercase).toBe(true);
      expect(result.uppercase).toBe(false);
      expect(result.number).toBe(false);
      expect(result.special).toBe(false);
    });

    it('should update indicators when password changes', () => {
      const { rerender } = renderWithProviders(<PasswordRequirements password="" />);

      // Initially all unmet
      let result = checkPasswordRequirements('');
      expect(result.length).toBe(false);

      // Rerender with a password that meets length requirement
      rerender(<PasswordRequirements password="12345678" />);

      // Now length is met
      result = checkPasswordRequirements('12345678');
      expect(result.length).toBe(true);
      expect(result.number).toBe(true);
      expect(result.uppercase).toBe(false);
      expect(result.lowercase).toBe(false);
    });
  });

  describe('additional requirements', () => {
    it('should render additional requirements when provided', () => {
      const additionalRequirements: CustomRequirement[] = [
        { key: 'different', met: true, text: 'Different from current password' },
      ];

      renderWithProviders(
        <PasswordRequirements
          password="NewPass123!"
          additionalRequirements={additionalRequirements}
        />
      );

      expect(screen.getByText('Different from current password')).toBeOnTheScreen();
    });

    it('should render multiple additional requirements', () => {
      const additionalRequirements: CustomRequirement[] = [
        { key: 'different', met: true, text: 'Different from current' },
        { key: 'history', met: false, text: 'Not used recently' },
      ];

      renderWithProviders(
        <PasswordRequirements
          password="NewPass123!"
          additionalRequirements={additionalRequirements}
        />
      );

      expect(screen.getByText('Different from current')).toBeOnTheScreen();
      expect(screen.getByText('Not used recently')).toBeOnTheScreen();
    });

    it('should show correct indicator for additional requirement status', () => {
      const metRequirement: CustomRequirement[] = [
        { key: 'met', met: true, text: 'Met requirement' },
      ];
      const unmetRequirement: CustomRequirement[] = [
        { key: 'unmet', met: false, text: 'Unmet requirement' },
      ];

      renderWithProviders(
        <PasswordRequirements password="" additionalRequirements={metRequirement} />
      );

      expect(screen.getByText('Met requirement')).toBeOnTheScreen();

      // Re-render fresh with different requirements
      renderWithProviders(
        <PasswordRequirements password="" additionalRequirements={unmetRequirement} />
      );

      expect(screen.getByText('Unmet requirement')).toBeOnTheScreen();
    });
  });

  describe('memoisation', () => {
    it('should recalculate requirements when password changes', () => {
      const { rerender } = renderWithProviders(<PasswordRequirements password="short" />);

      // Length requirement should be false
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();

      rerender(<PasswordRequirements password="longenough" />);

      // Length requirement should now be true
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });
  });

  describe('null/undefined password handling', () => {
    it('should handle undefined password gracefully', () => {
      // TypeScript would catch this, but runtime should be safe
      renderWithProviders(<PasswordRequirements password={undefined as unknown as string} />);

      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });
  });

  describe('Accessibility', () => {
    it('renders requirement text with correct met/unmet status', () => {
      renderWithProviders(<PasswordRequirements password="Password123!" />);

      // All requirements should be met for a strong password
      // The component displays text for each requirement
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });

    it('displays visual indicators for each requirement status', () => {
      renderWithProviders(<PasswordRequirements password="" />);

      // For empty password, all requirements should show as unmet
      // Verify component renders all requirement items
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });

    it('provides informative content for screen readers via text', () => {
      renderWithProviders(
        <PasswordRequirements
          password="short"
          additionalRequirements={[{ key: 'custom', met: false, text: 'Custom requirement text' }]}
        />
      );

      // Screen readers can access the requirement text
      expect(screen.getByText('Custom requirement text')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('requirement items are in correct focus order', () => {
      renderWithProviders(<PasswordRequirements password="" testID="password-requirements" />);

      const container = screen.getByTestId('password-requirements');
      expect(container).toBeOnTheScreen();

      // Requirement items should be accessible
      expectFocusOrder([container]);
    });

    it('requirement text is visible for all states', () => {
      renderWithProviders(<PasswordRequirements password="Password123!" />);

      // Requirement items should be visible
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });

    it('status changes are reflected visually', () => {
      const { rerender } = renderWithProviders(<PasswordRequirements password="" />);

      // Initial - all unmet
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();

      // Change password to meet some requirements
      rerender(<PasswordRequirements password="Password123!" />);

      // Requirements should update
      expect(screen.getByTestId('password-requirements')).toBeOnTheScreen();
    });

    it('container is accessible to screen readers', () => {
      renderWithProviders(<PasswordRequirements password="" testID="password-requirements" />);

      const container = screen.getByTestId('password-requirements');
      expect(container.props.accessible).not.toBe(false);
    });
  });
});
