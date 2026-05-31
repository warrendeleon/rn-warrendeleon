/**
 * Story tests for CountryCodeSelector component
 *
 * Verifies all Storybook stories render correctly.
 */

import React from 'react';

import { expectStoryRenders, renderWithProviders } from '@app/test-utils';

import { CountryCodeSelector, type CountryData, DEFAULT_COUNTRY } from '../index';

// Mock navigation for CountryCodeSelector (uses useNavigation)
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('CountryCodeSelector Stories', () => {
  const defaultProps = {
    selectedCountry: DEFAULT_COUNTRY,
    onCountrySelect: jest.fn(),
    testID: 'country-selector',
  };

  it('renders Default story with country flag', async () => {
    const { toJSON, getByText } = await renderWithProviders(
      <CountryCodeSelector {...defaultProps} />
    );
    expectStoryRenders(toJSON, 'Default');
    expect(getByText(DEFAULT_COUNTRY.flag)).toBeOnTheScreen();
  });

  it('renders UnitedKingdom story with GB flag and +44 code', async () => {
    const ukCountry: CountryData = {
      code: 'GB',
      name: 'United Kingdom',
      callingCode: '+44',
      flag: '🇬🇧',
    };
    const { toJSON, getByText } = await renderWithProviders(
      <CountryCodeSelector {...defaultProps} selectedCountry={ukCountry} />
    );
    expectStoryRenders(toJSON, 'UnitedKingdom');
    expect(getByText('🇬🇧')).toBeOnTheScreen();
    expect(getByText('+44')).toBeOnTheScreen();
  });

  it('renders UnitedStates story with US flag and +1 code', async () => {
    const usCountry: CountryData = {
      code: 'US',
      name: 'United States',
      callingCode: '+1',
      flag: '🇺🇸',
    };
    const { toJSON, getByText } = await renderWithProviders(
      <CountryCodeSelector {...defaultProps} selectedCountry={usCountry} />
    );
    expectStoryRenders(toJSON, 'UnitedStates');
    expect(getByText('🇺🇸')).toBeOnTheScreen();
    expect(getByText('+1')).toBeOnTheScreen();
  });

  it('renders Spain story with ES flag and +34 code', async () => {
    const esCountry: CountryData = {
      code: 'ES',
      name: 'Spain',
      callingCode: '+34',
      flag: '🇪🇸',
    };
    const { toJSON, getByText } = await renderWithProviders(
      <CountryCodeSelector {...defaultProps} selectedCountry={esCountry} />
    );
    expectStoryRenders(toJSON, 'Spain');
    expect(getByText('🇪🇸')).toBeOnTheScreen();
    expect(getByText('+34')).toBeOnTheScreen();
  });

  it('renders Philippines story with PH flag and +63 code', async () => {
    const phCountry: CountryData = {
      code: 'PH',
      name: 'Philippines',
      callingCode: '+63',
      flag: '🇵🇭',
    };
    const { toJSON, getByText } = await renderWithProviders(
      <CountryCodeSelector {...defaultProps} selectedCountry={phCountry} />
    );
    expectStoryRenders(toJSON, 'Philippines');
    expect(getByText('🇵🇭')).toBeOnTheScreen();
    expect(getByText('+63')).toBeOnTheScreen();
  });

  it('renders Disabled story without crashing', async () => {
    const { toJSON } = await renderWithProviders(
      <CountryCodeSelector {...defaultProps} isDisabled />
    );
    expectStoryRenders(toJSON, 'Disabled');
  });

  it('renders InFormContext story without crashing', async () => {
    const { toJSON } = await renderWithProviders(<CountryCodeSelector {...defaultProps} />);
    expectStoryRenders(toJSON, 'InFormContext');
  });
});
