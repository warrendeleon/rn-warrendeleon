/**
 * Story tests for EmailInput component
 *
 * Verifies all Storybook stories render correctly.
 */

import type { ComponentProps } from 'react';
import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { EmailInput } from '../EmailInput';
import * as stories from '../EmailInput.stories';

type EmailInputProps = ComponentProps<typeof EmailInput>;

describe('EmailInput Stories', () => {
  it('renders Default story with placeholder', () => {
    const { args } = stories.Default;
    const { getByPlaceholderText } = renderWithProviders(
      <EmailInput {...(args as EmailInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/email/i)).toBeOnTheScreen();
  });

  it('renders WithValue story with email visible', () => {
    const { args } = stories.WithValue;
    const { getByDisplayValue } = renderWithProviders(
      <EmailInput {...(args as EmailInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue('warren@example.com')).toBeOnTheScreen();
  });

  it('renders WithError story with error message', () => {
    const { args } = stories.WithError;
    const { getByText } = renderWithProviders(
      <EmailInput {...(args as EmailInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByText('Please enter a valid email address')).toBeOnTheScreen();
  });

  it('renders InGroupTop story with top variant styling', () => {
    const { args } = stories.InGroupTop;
    const { getByPlaceholderText } = renderWithProviders(
      <EmailInput {...(args as EmailInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/email/i)).toBeOnTheScreen();
  });

  it('renders InGroupBottom story with bottom variant styling', () => {
    const { args } = stories.InGroupBottom;
    const { getByPlaceholderText } = renderWithProviders(
      <EmailInput {...(args as EmailInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/email/i)).toBeOnTheScreen();
  });

  it('renders Disabled story with input disabled', () => {
    const { args } = stories.Disabled;
    const { getByTestId } = renderWithProviders(
      <EmailInput {...(args as EmailInputProps)} onChangeText={jest.fn()} testID="email-input" />
    );
    expect(getByTestId('email-input').props.editable).toBe(false);
  });
});
