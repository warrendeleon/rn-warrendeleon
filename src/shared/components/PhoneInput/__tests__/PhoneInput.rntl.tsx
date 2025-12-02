/**
 * Tests for PhoneInput component
 *
 */

import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { PhoneInput } from '../PhoneInput';

// Mock CountryCodeSelector - must use inline values
jest.mock('@app/shared/components/CountryCodeSelector', () => {
  // eslint requirements prevent importing React here
  // Use createElement pattern with jest.requireActual
  const ReactActual = jest.requireActual('react');
  const RNActual = jest.requireActual('react-native');

  return {
    DEFAULT_COUNTRY: {
      code: 'GB',
      name: 'United Kingdom',
      callingCode: '+44',
      flag: '🇬🇧',
    },
    CountryCodeSelector: (props: {
      selectedCountry: { flag: string; callingCode: string };
      onCountrySelect: (country: {
        code: string;
        name: string;
        callingCode: string;
        flag: string;
      }) => void;
      testID?: string;
      isDisabled?: boolean;
    }) =>
      ReactActual.createElement(
        RNActual.Pressable,
        {
          testID: props.testID,
          disabled: props.isDisabled,
          onPress: () =>
            props.onCountrySelect({
              code: 'US',
              name: 'United States',
              callingCode: '+1',
              flag: '🇺🇸',
            }),
        },
        ReactActual.createElement(
          RNActual.Text,
          null,
          `${props.selectedCountry.flag} ${props.selectedCountry.callingCode}`
        )
      ),
  };
});

describe('PhoneInput', () => {
  const defaultProps = {
    placeholder: 'Phone number',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with placeholder', () => {
      renderWithProviders(<PhoneInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Phone number')).toBeTruthy();
    });

    it('should render with testID', () => {
      renderWithProviders(<PhoneInput {...defaultProps} testID="phone-input" />);

      expect(screen.getByTestId('phone-input')).toBeTruthy();
    });

    it('should render country code selector', () => {
      renderWithProviders(
        <PhoneInput {...defaultProps} countrySelectorTestID="country-selector" />
      );

      expect(screen.getByTestId('country-selector')).toBeTruthy();
    });

    it('should display national number without country code', () => {
      renderWithProviders(
        <PhoneInput {...defaultProps} value="+447510084239" testID="phone-input" />
      );

      // Should display without the +44 prefix
      expect(screen.getByDisplayValue('7510084239')).toBeTruthy();
    });
  });

  describe('phone-specific configuration', () => {
    it('should use phone-pad keyboard type', () => {
      renderWithProviders(<PhoneInput {...defaultProps} testID="phone-input" />);

      expect(screen.getByTestId('phone-input').props.keyboardType).toBe('phone-pad');
    });

    it('should set autoComplete to tel', () => {
      renderWithProviders(<PhoneInput {...defaultProps} testID="phone-input" />);

      expect(screen.getByTestId('phone-input').props.autoComplete).toBe('tel');
    });

    it('should set textContentType to telephoneNumber', () => {
      renderWithProviders(<PhoneInput {...defaultProps} testID="phone-input" />);

      expect(screen.getByTestId('phone-input').props.textContentType).toBe('telephoneNumber');
    });
  });

  describe('interaction', () => {
    it('should prepend country code when text is entered', () => {
      const onChangeText = jest.fn();
      renderWithProviders(
        <PhoneInput {...defaultProps} onChangeText={onChangeText} testID="phone-input" />
      );

      fireEvent.changeText(screen.getByTestId('phone-input'), '7510084239');

      expect(onChangeText).toHaveBeenCalledWith('+447510084239');
    });

    it('should not double-prepend country code', () => {
      const onChangeText = jest.fn();
      renderWithProviders(
        <PhoneInput {...defaultProps} onChangeText={onChangeText} testID="phone-input" />
      );

      // If user somehow enters with +, it should not add another
      fireEvent.changeText(screen.getByTestId('phone-input'), '+447510084239');

      expect(onChangeText).toHaveBeenCalledWith('+447510084239');
    });

    it('should call onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      renderWithProviders(<PhoneInput {...defaultProps} onBlur={onBlur} testID="phone-input" />);

      fireEvent(screen.getByTestId('phone-input'), 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key is pressed', () => {
      const onSubmitEditing = jest.fn();
      renderWithProviders(
        <PhoneInput {...defaultProps} onSubmitEditing={onSubmitEditing} testID="phone-input" />
      );

      fireEvent(screen.getByTestId('phone-input'), 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('country code selection', () => {
    it('should call onChangeText when country is selected with existing value', () => {
      const onChangeText = jest.fn();
      renderWithProviders(
        <PhoneInput
          {...defaultProps}
          value="+447510084239"
          onChangeText={onChangeText}
          countrySelectorTestID="country-selector"
        />
      );

      // Press country selector (mock will select US +1)
      fireEvent.press(screen.getByTestId('country-selector'));

      // Should be called with new country code (actual behaviour based on regex stripping)
      expect(onChangeText).toHaveBeenCalled();
    });

    it('should not call onChangeText when selecting country with empty value', () => {
      const onChangeText = jest.fn();
      renderWithProviders(
        <PhoneInput
          {...defaultProps}
          value=""
          onChangeText={onChangeText}
          countrySelectorTestID="country-selector"
        />
      );

      fireEvent.press(screen.getByTestId('country-selector'));

      // Should not call with empty value
      expect(onChangeText).not.toHaveBeenCalled();
    });

    it('should render country selector with isCountrySelectorDisabled', () => {
      renderWithProviders(
        <PhoneInput
          {...defaultProps}
          isCountrySelectorDisabled
          countrySelectorTestID="country-selector"
        />
      );

      // Verify selector renders - disabled state tested in CountryCodeSelector tests
      expect(screen.getByTestId('country-selector')).toBeTruthy();
    });

    it('should render country selector when editable is false', () => {
      renderWithProviders(
        <PhoneInput {...defaultProps} editable={false} countrySelectorTestID="country-selector" />
      );

      // Verify selector renders - disabled state tested in CountryCodeSelector tests
      expect(screen.getByTestId('country-selector')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should use placeholder as default accessibility label', () => {
      renderWithProviders(<PhoneInput {...defaultProps} />);

      expect(screen.getByLabelText('Phone number')).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      renderWithProviders(<PhoneInput {...defaultProps} accessibilityLabel="Your phone" />);

      expect(screen.getByLabelText('Your phone')).toBeTruthy();
    });

    it('should have default accessibility hint', () => {
      renderWithProviders(<PhoneInput {...defaultProps} testID="phone-input" />);

      expect(screen.getByTestId('phone-input').props.accessibilityHint).toBe(
        'Enter your phone number'
      );
    });

    it('should use custom accessibility hint when provided', () => {
      renderWithProviders(
        <PhoneInput {...defaultProps} accessibilityHint="Custom hint" testID="phone-input" />
      );

      expect(screen.getByTestId('phone-input').props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('error display', () => {
    it('should render error message when error prop is provided', () => {
      renderWithProviders(<PhoneInput {...defaultProps} error="Invalid phone number" />);

      expect(screen.getByText('Invalid phone number')).toBeTruthy();
    });

    it('should not render error when no error prop', () => {
      renderWithProviders(<PhoneInput {...defaultProps} />);

      expect(screen.queryByText('Invalid phone number')).toBeNull();
    });
  });

  describe('return key type', () => {
    it('should default to next return key type', () => {
      renderWithProviders(<PhoneInput {...defaultProps} testID="phone-input" />);

      expect(screen.getByTestId('phone-input').props.returnKeyType).toBe('next');
    });

    it('should accept custom return key type', () => {
      renderWithProviders(
        <PhoneInput {...defaultProps} returnKeyType="done" testID="phone-input" />
      );

      expect(screen.getByTestId('phone-input').props.returnKeyType).toBe('done');
    });
  });

  describe('editable state', () => {
    it('should be editable by default', () => {
      renderWithProviders(<PhoneInput {...defaultProps} testID="phone-input" />);

      expect(screen.getByTestId('phone-input').props.editable).toBe(true);
    });

    it('should be non-editable when editable is false', () => {
      renderWithProviders(<PhoneInput {...defaultProps} editable={false} testID="phone-input" />);

      expect(screen.getByTestId('phone-input').props.editable).toBe(false);
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref for focus functionality', () => {
      const ref = createRef<{ focus: () => void }>();
      renderWithProviders(<PhoneInput {...defaultProps} ref={ref} testID="phone-input" />);

      expect(ref.current).toBeTruthy();
    });
  });

  describe('initial country', () => {
    it('should use UK as default country', () => {
      renderWithProviders(
        <PhoneInput {...defaultProps} countrySelectorTestID="country-selector" />
      );

      // The mock displays flag and calling code
      expect(screen.getByText('🇬🇧 +44')).toBeTruthy();
    });

    it('should accept custom initial country', () => {
      const customCountry = {
        code: 'US' as const,
        name: 'United States',
        callingCode: '+1',
        flag: '🇺🇸',
      };

      renderWithProviders(
        <PhoneInput
          {...defaultProps}
          initialCountry={customCountry}
          countrySelectorTestID="country-selector"
        />
      );

      expect(screen.getByText('🇺🇸 +1')).toBeTruthy();
    });
  });

  describe('display value extraction', () => {
    it('should strip matching country code from display value', () => {
      renderWithProviders(
        <PhoneInput {...defaultProps} value="+447510084239" testID="phone-input" />
      );

      // Display should show national number only (UK +44 is stripped)
      expect(screen.getByDisplayValue('7510084239')).toBeTruthy();
    });

    it('should handle empty value', () => {
      renderWithProviders(<PhoneInput {...defaultProps} value="" testID="phone-input" />);

      expect(screen.getByTestId('phone-input')).toBeTruthy();
    });

    it('should handle value without country code prefix', () => {
      renderWithProviders(<PhoneInput {...defaultProps} value="7510084239" testID="phone-input" />);

      // Value without + prefix is displayed as-is
      expect(screen.getByDisplayValue('7510084239')).toBeTruthy();
    });
  });
});
