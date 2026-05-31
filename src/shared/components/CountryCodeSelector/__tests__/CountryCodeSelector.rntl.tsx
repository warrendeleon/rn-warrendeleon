/**
 * Tests for CountryCodeSelector component
 *
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { CountryCodeSelector } from '../CountryCodeSelector';
import type { CountryData } from '../countryData';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('CountryCodeSelector', () => {
  const defaultCountry: CountryData = {
    code: 'GB',
    name: 'United Kingdom',
    callingCode: '+44',
    flag: '🇬🇧',
  };

  const defaultProps = {
    selectedCountry: defaultCountry,
    onCountrySelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default testID', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      expect(screen.getByTestId('country-code-selector')).toBeOnTheScreen();
    });

    it('renders with custom testID', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} testID="custom-selector" />);

      expect(screen.getByTestId('custom-selector')).toBeOnTheScreen();
    });

    it('displays country flag emoji', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      expect(screen.getByText('🇬🇧')).toBeOnTheScreen();
    });

    it('displays calling code with plus prefix', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      expect(screen.getByText('+44')).toBeOnTheScreen();
    });
  });

  describe('interaction', () => {
    it('should navigate to CountryCodeSelector screen when pressed', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      await fireEvent.press(screen.getByTestId('country-code-selector'));

      expect(mockNavigate).toHaveBeenCalledWith('CountryCodeSelector', {
        selectedCountryCode: 'GB',
        onSelect: defaultProps.onCountrySelect,
      });
    });

    it('should not navigate when disabled', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} isDisabled />);

      await fireEvent.press(screen.getByTestId('country-code-selector'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should be enabled by default', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      const selector = screen.getByTestId('country-code-selector');
      expect(selector.props.accessibilityState).toEqual({ disabled: false });
    });

    it('should be disabled when isDisabled is true', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} isDisabled />);

      const selector = screen.getByTestId('country-code-selector');
      expect(selector.props.accessibilityState).toEqual({ disabled: true });
    });

    it('should not navigate when disabled', async () => {
      // This is the practical test - disabled state prevents navigation
      await renderWithProviders(<CountryCodeSelector {...defaultProps} isDisabled />);

      await fireEvent.press(screen.getByTestId('country-code-selector'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have button accessibility role', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      const selector = screen.getByTestId('country-code-selector');
      expect(selector.props.accessibilityRole).toBe('button');
    });

    it('has descriptive accessibility label with country name and code', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      expect(
        screen.getByLabelText('Country code selector. Currently selected: United Kingdom, +44')
      ).toBeOnTheScreen();
    });

    it('should have accessibility hint', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      const selector = screen.getByTestId('country-code-selector');
      expect(selector.props.accessibilityHint).toBe('Double tap to open country selector');
    });

    it('should have disabled accessibility state when disabled', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} isDisabled />);

      const selector = screen.getByTestId('country-code-selector');
      expect(selector.props.accessibilityState).toEqual({ disabled: true });
    });

    it('should have enabled accessibility state when not disabled', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      const selector = screen.getByTestId('country-code-selector');
      expect(selector.props.accessibilityState).toEqual({ disabled: false });
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('selector has accessible touch target (44×44 minimum)', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} />);

      const selector = screen.getByTestId('country-code-selector');
      expectMinTouchTarget(selector);
    });

    it('selector with custom testID has accessible touch target', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} testID="custom-selector" />);

      const selector = screen.getByTestId('custom-selector');
      expectMinTouchTarget(selector);
    });

    it('disabled selector maintains accessible touch target', async () => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} isDisabled />);

      const selector = screen.getByTestId('country-code-selector');
      expectMinTouchTarget(selector);
    });
  });

  describe('different countries', () => {
    it.each<CountryData>([
      { code: 'US', name: 'United States', callingCode: '+1', flag: '🇺🇸' },
      { code: 'DE', name: 'Germany', callingCode: '+49', flag: '🇩🇪' },
      { code: 'JP', name: 'Japan', callingCode: '+81', flag: '🇯🇵' },
      { code: 'AU', name: 'Australia', callingCode: '+61', flag: '🇦🇺' },
    ])('displays $name flag and calling code', async country => {
      await renderWithProviders(<CountryCodeSelector {...defaultProps} selectedCountry={country} />);

      expect(screen.getByText(country.flag)).toBeOnTheScreen();
      expect(screen.getByText(country.callingCode)).toBeOnTheScreen();
    });

    it('updates accessibility label when country changes', async () => {
      const usCountry: CountryData = {
        code: 'US',
        name: 'United States',
        callingCode: '+1',
        flag: '🇺🇸',
      };

      await renderWithProviders(<CountryCodeSelector {...defaultProps} selectedCountry={usCountry} />);

      expect(
        screen.getByLabelText('Country code selector. Currently selected: United States, +1')
      ).toBeOnTheScreen();
    });
  });

  describe('navigation params', () => {
    it('should pass selectedCountryCode to navigation', async () => {
      const usCountry: CountryData = {
        code: 'US',
        name: 'United States',
        callingCode: '+1',
        flag: '🇺🇸',
      };

      await renderWithProviders(<CountryCodeSelector {...defaultProps} selectedCountry={usCountry} />);

      await fireEvent.press(screen.getByTestId('country-code-selector'));

      expect(mockNavigate).toHaveBeenCalledWith('CountryCodeSelector', {
        selectedCountryCode: 'US',
        onSelect: defaultProps.onCountrySelect,
      });
    });

    it('should pass onCountrySelect callback to navigation', async () => {
      const onCountrySelect = jest.fn();

      await renderWithProviders(
        <CountryCodeSelector {...defaultProps} onCountrySelect={onCountrySelect} />
      );

      await fireEvent.press(screen.getByTestId('country-code-selector'));

      expect(mockNavigate).toHaveBeenCalledWith('CountryCodeSelector', {
        selectedCountryCode: 'GB',
        onSelect: onCountrySelect,
      });
    });
  });
});
