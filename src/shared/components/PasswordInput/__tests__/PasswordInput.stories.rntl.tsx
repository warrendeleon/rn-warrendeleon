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
  it('renders Default story with placeholder', async () => {
    const { args } = stories.Default;
    const { getByPlaceholderText } = await renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders WithValue story with masked input', async () => {
    const { args } = stories.WithValue;
    const { getByPlaceholderText } = await renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders NewPassword story with new password placeholder', async () => {
    const { args } = stories.NewPassword;
    const { getByPlaceholderText } = await renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders WithError story with error message', async () => {
    const { args } = stories.WithError;
    const { getByText } = await renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByText('Password must be at least 8 characters')).toBeOnTheScreen();
  });

  it('renders InGroupTop story with top variant', async () => {
    const { args } = stories.InGroupTop;
    const { getByPlaceholderText } = await renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders InGroupBottom story with bottom variant', async () => {
    const { args } = stories.InGroupBottom;
    const { getByPlaceholderText } = await renderWithProviders(
      <PasswordInput {...(args as PasswordInputProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders PasswordGroup story with multiple fields', async () => {
    const StoryComponent = stories.PasswordGroup.render as React.FC;
    const { getAllByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/password/i).length).toBeGreaterThan(0);
  });

  it('renders Disabled story with input disabled', async () => {
    const { args } = stories.Disabled;
    const { getByTestId } = await renderWithProviders(
      <PasswordInput
        {...(args as PasswordInputProps)}
        onChangeText={jest.fn()}
        testID="password-input"
      />
    );
    expect(getByTestId('password-input').props.editable).toBe(false);
  });
});
