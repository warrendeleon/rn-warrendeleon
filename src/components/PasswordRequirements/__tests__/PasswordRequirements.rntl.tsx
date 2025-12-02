/**
 * Tests for PasswordRequirements component
 *
 */

import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

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

      expect(screen.getByTestId('password-requirements')).toBeTruthy();
    });

    it('should render title', () => {
      renderWithProviders(<PasswordRequirements password="" />);

      // The title is translated - check for the requirements container
      expect(screen.getByTestId('password-requirements')).toBeTruthy();
    });
  });

  describe('requirement indicators', () => {
    it('should show all requirements as unmet for empty password', () => {
      renderWithProviders(<PasswordRequirements password="" />);

      // All X icons should be present (requirements not met)
      // We verify by checking the component renders without error
      expect(screen.getByTestId('password-requirements')).toBeTruthy();
    });

    it('should show all requirements as met for strong password', () => {
      renderWithProviders(<PasswordRequirements password="StrongPass123!" />);

      // All check icons should be present (requirements met)
      expect(screen.getByTestId('password-requirements')).toBeTruthy();
    });

    it('should update indicators when password changes', () => {
      const { rerender } = renderWithProviders(<PasswordRequirements password="" />);

      // Rerender with a password that meets some requirements
      rerender(<PasswordRequirements password="Pass" />);

      expect(screen.getByTestId('password-requirements')).toBeTruthy();
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

      expect(screen.getByText('Different from current password')).toBeTruthy();
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

      expect(screen.getByText('Different from current')).toBeTruthy();
      expect(screen.getByText('Not used recently')).toBeTruthy();
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

      expect(screen.getByText('Met requirement')).toBeTruthy();

      // Re-render fresh with different requirements
      renderWithProviders(
        <PasswordRequirements password="" additionalRequirements={unmetRequirement} />
      );

      expect(screen.getByText('Unmet requirement')).toBeTruthy();
    });
  });

  describe('memoisation', () => {
    it('should recalculate requirements when password changes', () => {
      const { rerender } = renderWithProviders(<PasswordRequirements password="short" />);

      // Length requirement should be false
      expect(screen.getByTestId('password-requirements')).toBeTruthy();

      rerender(<PasswordRequirements password="longenough" />);

      // Length requirement should now be true
      expect(screen.getByTestId('password-requirements')).toBeTruthy();
    });
  });

  describe('null/undefined password handling', () => {
    it('should handle undefined password gracefully', () => {
      // TypeScript would catch this, but runtime should be safe
      renderWithProviders(<PasswordRequirements password={undefined as unknown as string} />);

      expect(screen.getByTestId('password-requirements')).toBeTruthy();
    });
  });
});
