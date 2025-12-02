import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { getUserCardStyles, UserCard } from '../UserCard';

describe('UserCard', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { UNSAFE_root } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with testID', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card')).toBeTruthy();
    });

    it('renders with custom testID', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard
          firstName="Warren"
          lastName="de Leon"
          email="warren@example.com"
          testID="custom-user-card"
        />
      );

      expect(getByTestId('custom-user-card')).toBeTruthy();
    });

    it('renders avatar element', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card-avatar')).toBeTruthy();
    });

    it('renders initials in avatar', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      const initials = getByTestId('user-card-initials');
      expect(initials).toBeTruthy();
      expect(initials.props.children).toBe('WD');
    });

    it('renders name element', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      const name = getByTestId('user-card-name');
      expect(name).toBeTruthy();
      expect(name.props.children).toBe('Warren de Leon');
    });

    it('renders email element', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      const email = getByTestId('user-card-email');
      expect(email).toBeTruthy();
      expect(email.props.children).toBe('warren@example.com');
    });
  });

  describe('Initials Display', () => {
    it('displays both initials when both names provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="John" lastName="Smith" email="john@example.com" />
      );

      expect(getByTestId('user-card-initials').props.children).toBe('JS');
    });

    it('displays single initial when only first name provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="John" lastName={null} email="john@example.com" />
      );

      expect(getByTestId('user-card-initials').props.children).toBe('J');
    });

    it('displays single initial when only last name provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName={null} lastName="Smith" email="john@example.com" />
      );

      expect(getByTestId('user-card-initials').props.children).toBe('S');
    });

    it('displays fallback "U" when no names provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName={null} lastName={null} email="user@example.com" />
      );

      expect(getByTestId('user-card-initials').props.children).toBe('U');
    });

    it('displays uppercase initials', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="john" lastName="smith" email="john@example.com" />
      );

      expect(getByTestId('user-card-initials').props.children).toBe('JS');
    });
  });

  describe('Name Display', () => {
    it('displays full name when both names provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card-name').props.children).toBe('Warren de Leon');
    });

    it('displays first name only when last name is null', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName={null} email="warren@example.com" />
      );

      expect(getByTestId('user-card-name').props.children).toBe('Warren');
    });

    it('displays last name only when first name is null', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName={null} lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card-name').props.children).toBe('de Leon');
    });

    it('displays fallback "User" when no names provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName={null} lastName={null} email="user@example.com" />
      );

      expect(getByTestId('user-card-name').props.children).toBe('User');
    });
  });

  describe('Email Display', () => {
    it('renders email when provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card-email').props.children).toBe('warren@example.com');
    });

    it('does not render email element when email is null', () => {
      const { queryByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email={null} />
      );

      expect(queryByTestId('user-card-email')).toBeNull();
    });
  });

  describe('Press Handler', () => {
    it('calls onPress when card is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = renderWithProviders(
        <UserCard
          firstName="Warren"
          lastName="de Leon"
          email="warren@example.com"
          onPress={mockOnPress}
        />
      );

      fireEvent.press(getByTestId('user-card'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when pressed without onPress handler', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(() => fireEvent.press(getByTestId('user-card'))).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has button accessibility role', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityRole).toBe('button');
    });

    it('has accessibility label with user name', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityLabel).toBe('Account for Warren de Leon');
    });

    it('has accessibility hint', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityHint).toBe('Opens account settings');
    });

    it('uses fallback name in accessibility label when no names provided', () => {
      const { getByTestId } = renderWithProviders(
        <UserCard firstName={null} lastName={null} email="user@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityLabel).toBe('Account for User');
    });
  });
});

describe('getUserCardStyles', () => {
  it('returns light theme styles', () => {
    const styles = getUserCardStyles('light', 'single');

    expect(styles.bg).toBe('$white');
    expect(styles.nameColor).toBe('$black');
    expect(styles.emailColor).toBe('$textLight500');
    expect(styles.avatarBg).toBe('$coolGray200');
    expect(styles.initialsColor).toBe('$textLight600');
    expect(styles.chevronColor).toBe('$textLight500');
  });

  it('returns dark theme styles', () => {
    const styles = getUserCardStyles('dark', 'single');

    expect(styles.bg).toBe('$backgroundDark900');
    expect(styles.nameColor).toBe('$white');
    expect(styles.emailColor).toBe('$textLight400');
    expect(styles.avatarBg).toBe('$backgroundDark700');
    expect(styles.initialsColor).toBe('$textLight300');
    expect(styles.chevronColor).toBe('$textLight400');
  });

  it('applies correct radius for single variant', () => {
    const styles = getUserCardStyles('light', 'single');

    expect(styles.top).toBe('$2xl');
    expect(styles.bottom).toBe('$2xl');
  });

  it('applies correct radius for top variant', () => {
    const styles = getUserCardStyles('light', 'top');

    expect(styles.top).toBe('$2xl');
    expect(styles.bottom).toBe('$none');
  });

  it('applies correct radius for middle variant', () => {
    const styles = getUserCardStyles('light', 'middle');

    expect(styles.top).toBe('$none');
    expect(styles.bottom).toBe('$none');
  });

  it('applies correct radius for bottom variant', () => {
    const styles = getUserCardStyles('light', 'bottom');

    expect(styles.top).toBe('$none');
    expect(styles.bottom).toBe('$2xl');
  });
});

describe('UserCard implementation', () => {
  it('exports UserCard as a React component', () => {
    expect(typeof UserCard).toBe('object'); // React.memo returns an object
  });

  it('exports getUserCardStyles as a function', () => {
    expect(typeof getUserCardStyles).toBe('function');
  });
});
