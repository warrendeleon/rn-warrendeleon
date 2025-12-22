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
  it('renders Default story with placeholder', () => {
    const { args } = stories.Default;
    const { getByPlaceholderText } = renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders WithValue story with phone number', () => {
    const { args } = stories.WithValue;
    const { getByPlaceholderText } = renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders WithError story with error message', () => {
    const { args } = stories.WithError;
    const { getByText } = renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByText('Please enter a valid phone number')).toBeOnTheScreen();
  });

  it('renders InGroupTop story with top variant', () => {
    const { args } = stories.InGroupTop;
    const { getByPlaceholderText } = renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders InGroupBottom story with bottom variant', () => {
    const { args } = stories.InGroupBottom;
    const { getByPlaceholderText } = renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders CountrySelectorDisabled story with disabled selector', () => {
    const { args } = stories.CountrySelectorDisabled;
    const { getByPlaceholderText } = renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders Disabled story with input disabled', () => {
    const { args } = stories.Disabled;
    const { getByTestId } = renderWithProviders(
      <PhoneInput {...(args as PhoneInputProps)} onChangeText={jest.fn()} testID="phone-input" />
    );
    expect(getByTestId('phone-input').props.editable).toBe(false);
  });
});
