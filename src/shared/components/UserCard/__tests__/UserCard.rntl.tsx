import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { getUserCardStyles, UserCard } from '../UserCard';

describe('UserCard', () => {
  describe('Rendering', () => {
    it('renders with all required elements', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      // Verify main container and key content elements render
      expect(getByTestId('user-card')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByText('warren@example.com')).toBeOnTheScreen();
    });

    it('renders with testID', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card')).toBeOnTheScreen();
    });

    it('renders with custom testID', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard
          firstName="Warren"
          lastName="de Leon"
          email="warren@example.com"
          testID="custom-user-card"
        />
      );

      expect(getByTestId('custom-user-card')).toBeOnTheScreen();
    });

    it('renders avatar element', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card-avatar')).toBeOnTheScreen();
    });

    it('renders initials in avatar', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      const initials = getByTestId('user-card-initials');
      expect(initials).toBeOnTheScreen();
      expect(initials.props.children).toBe('WD');
    });

    it('renders name element', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      const name = getByTestId('user-card-name');
      expect(name).toBeOnTheScreen();
      expect(name.props.children).toBe('Warren de Leon');
    });

    it('renders email element', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      const email = getByTestId('user-card-email');
      expect(email).toBeOnTheScreen();
      expect(email.props.children).toBe('warren@example.com');
    });
  });

  describe('Initials Display', () => {
    it.each([
      { firstName: 'John', lastName: 'Smith', expected: 'JS', scenario: 'both names provided' },
      { firstName: 'John', lastName: null, expected: 'J', scenario: 'only first name provided' },
      { firstName: null, lastName: 'Smith', expected: 'S', scenario: 'only last name provided' },
      { firstName: null, lastName: null, expected: 'U', scenario: 'no names provided (fallback)' },
      { firstName: 'john', lastName: 'smith', expected: 'JS', scenario: 'lowercase names' },
    ])('displays $expected initials when $scenario', async ({ firstName, lastName, expected }) => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName={firstName} lastName={lastName} email="test@example.com" />
      );

      expect(getByTestId('user-card-initials').props.children).toBe(expected);
    });
  });

  describe('Name Display', () => {
    it.each([
      {
        firstName: 'Warren',
        lastName: 'de Leon',
        expected: 'Warren de Leon',
        scenario: 'both names',
      },
      { firstName: 'Warren', lastName: null, expected: 'Warren', scenario: 'only first name' },
      { firstName: null, lastName: 'de Leon', expected: 'de Leon', scenario: 'only last name' },
      { firstName: null, lastName: null, expected: 'User', scenario: 'no names (fallback)' },
    ])('displays $expected when $scenario', async ({ firstName, lastName, expected }) => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName={firstName} lastName={lastName} email="test@example.com" />
      );

      expect(getByTestId('user-card-name').props.children).toBe(expected);
    });
  });

  describe('Email Display', () => {
    it('renders email when provided', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card-email').props.children).toBe('warren@example.com');
    });

    it('does not render email element when email is null', async () => {
      const { queryByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email={null} />
      );

      expect(queryByTestId('user-card-email')).toBeNull();
    });
  });

  describe('Press Handler', () => {
    it('calls onPress when card is pressed', async () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = await renderWithProviders(
        <UserCard
          firstName="Warren"
          lastName="de Leon"
          email="warren@example.com"
          onPress={mockOnPress}
        />
      );

      await fireEvent.press(getByTestId('user-card'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when pressed without onPress handler', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      await expect(fireEvent.press(getByTestId('user-card'))).resolves.toBeUndefined();
    });
  });

  describe('Accessibility', () => {
    it('has button accessibility role', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityRole).toBe('button');
    });

    it('has accessibility label with user name', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityLabel).toBe('Account for Warren de Leon');
    });

    it('has accessibility hint', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityHint).toBe('Opens account settings');
    });

    it('uses fallback name in accessibility label when no names provided', async () => {
      const { getByTestId } = await renderWithProviders(
        <UserCard firstName={null} lastName={null} email="user@example.com" />
      );

      expect(getByTestId('user-card').props.accessibilityLabel).toBe('Account for User');
    });
  });
});

describe('getUserCardStyles', () => {
  describe('theme styles', () => {
    it.each([
      ['light', '#FFFFFF', '#000000', '#6B6B6B', '#e5e7eb', '#737373', '#6B6B6B'],
      ['dark', '#262626', '#FFFFFF', '#A3A3A3', '#525252', '#D4D4D4', '#A3A3A3'],
    ] as const)(
      'returns correct colours for %s theme',
      (
        theme,
        expectedBg,
        expectedNameColor,
        expectedEmailColor,
        expectedAvatarBg,
        expectedInitialsColor,
        expectedChevronColor
      ) => {
        const styles = getUserCardStyles(theme, 'single');

        expect(styles.bg).toBe(expectedBg);
        expect(styles.nameColor).toBe(expectedNameColor);
        expect(styles.emailColor).toBe(expectedEmailColor);
        expect(styles.avatarBg).toBe(expectedAvatarBg);
        expect(styles.initialsColor).toBe(expectedInitialsColor);
        expect(styles.chevronColor).toBe(expectedChevronColor);
      }
    );
  });

  describe('border radius variants', () => {
    it.each([
      ['single', 16, 16],
      ['top', 16, 0],
      ['middle', 0, 0],
      ['bottom', 0, 16],
    ] as const)(
      'applies correct radius for %s variant (top: %s, bottom: %s)',
      (variant, expectedTop, expectedBottom) => {
        const styles = getUserCardStyles('light', variant);

        expect(styles.top).toBe(expectedTop);
        expect(styles.bottom).toBe(expectedBottom);
      }
    );
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

describe('UserCard EAA Accessibility Compliance', () => {
  it('card has accessible touch target (44×44 minimum)', async () => {
    const { getByTestId } = await renderWithProviders(
      <UserCard firstName="Warren" lastName="de Leon" email="warren@example.com" />
    );

    const card = getByTestId('user-card');
    expectMinTouchTarget(card);
  });

  it('card with custom testID has accessible touch target', async () => {
    const { getByTestId } = await renderWithProviders(
      <UserCard
        firstName="Warren"
        lastName="de Leon"
        email="warren@example.com"
        testID="custom-user-card"
      />
    );

    const card = getByTestId('custom-user-card');
    expectMinTouchTarget(card);
  });

  it('card without email has accessible touch target', async () => {
    const { getByTestId } = await renderWithProviders(
      <UserCard firstName="Warren" lastName="de Leon" email={null} />
    );

    const card = getByTestId('user-card');
    expectMinTouchTarget(card);
  });

  it('card with fallback name has accessible touch target', async () => {
    const { getByTestId } = await renderWithProviders(
      <UserCard firstName={null} lastName={null} email="user@example.com" />
    );

    const card = getByTestId('user-card');
    expectMinTouchTarget(card);
  });
});
