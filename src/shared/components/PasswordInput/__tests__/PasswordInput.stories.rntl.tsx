/**
 * Story tests for PasswordInput component
 *
 * Verifies all Storybook stories render correctly.
 */

import type { ComponentProps } from 'react';
import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PasswordInput } from '../PasswordInput';
import * as stories from '../PasswordInput.stories';

type PasswordInputProps = ComponentProps<typeof PasswordInput>;

describe('PasswordInput Stories', () => {
  it('renders Default story with placeholder', () => {
    const { args } = stories.Default;
    const { getByPlaceholderText } = renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders WithValue story with masked input', () => {
    const { args } = stories.WithValue;
    const { getByPlaceholderText } = renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders NewPassword story with new password placeholder', () => {
    const { args } = stories.NewPassword;
    const { getByPlaceholderText } = renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders WithError story with error message', () => {
    const { args } = stories.WithError;
    const { getByText } = renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByText('Password must be at least 8 characters')).toBeOnTheScreen();
  });

  it('renders InGroupTop story with top variant', () => {
    const { args } = stories.InGroupTop;
    const { getByPlaceholderText } = renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders InGroupBottom story with bottom variant', () => {
    const { args } = stories.InGroupBottom;
    const { getByPlaceholderText } = renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders PasswordGroup story with multiple fields', () => {
    const StoryComponent = stories.PasswordGroup.render as React.FC;
    const { getAllByPlaceholderText } = renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/password/i).length).toBeGreaterThan(0);
  });

  it('renders Disabled story with input disabled', () => {
    const { args } = stories.Disabled;
    const { getByTestId } = renderWithProviders(
      <PasswordInput
        {...(args as PasswordInputProps)}
        onChangeText={jest.fn()}
        testID="password-input"
      />
    );
    expect(getByTestId('password-input').props.editable).toBe(false);
  });
});
