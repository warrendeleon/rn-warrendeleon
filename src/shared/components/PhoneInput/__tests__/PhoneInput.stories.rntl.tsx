/**
 * Story tests for PhoneInput component
 *
 * Verifies all Storybook stories render correctly.
 */

import type { ComponentProps } from 'react';
import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PhoneInput } from '../PhoneInput';
import * as stories from '../PhoneInput.stories';

type PhoneInputProps = ComponentProps<typeof PhoneInput>;

// Mock navigation for PhoneInput (uses useNavigation for country selector)
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('PhoneInput Stories', () => {
  it('renders Default story with placeholder', async () => {
    const { args } = stories.Default;
    const { getByPlaceholderText } = await renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders WithValue story with phone number', async () => {
    const { args } = stories.WithValue;
    const { getByPlaceholderText } = await renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders WithError story with error message', async () => {
    const { args } = stories.WithError;
    const { getByText } = await renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByText('Please enter a valid phone number')).toBeOnTheScreen();
  });

  it('renders InGroupTop story with top variant', async () => {
    const { args } = stories.InGroupTop;
    const { getByPlaceholderText } = await renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders InGroupBottom story with bottom variant', async () => {
    const { args } = stories.InGroupBottom;
    const { getByPlaceholderText } = await renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders CountrySelectorDisabled story with disabled selector', async () => {
    const { args } = stories.CountrySelectorDisabled;
    const { getByPlaceholderText } = await renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders Disabled story with input disabled', async () => {
    const { args } = stories.Disabled;
    const { getByTestId } = await renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} testID="phone-input" />
    );
    expect(getByTestId('phone-input').props.readOnly).toBe(true);
  });
});
