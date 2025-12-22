/**
 * Story tests for FormInputItem component
 *
 * Verifies all Storybook stories render correctly.
 */

import type { ComponentProps } from 'react';
import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { FormInputItem } from '../FormInputItem';
import * as stories from '../FormInputItem.stories';

type FormInputItemProps = ComponentProps<typeof FormInputItem>;

describe('FormInputItem Stories', () => {
  it('renders Default story with placeholder', () => {
    const { args } = stories.Default;
    const { getByPlaceholderText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(args!.placeholder as string)).toBeOnTheScreen();
  });

  it('renders WithValue story with value displayed', () => {
    const { args } = stories.WithValue;
    const { getByDisplayValue } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue(args!.value as string)).toBeOnTheScreen();
  });

  it('renders EmailInput story with email keyboard', () => {
    const { args } = stories.EmailInput;
    const { getByPlaceholderText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/email/i)).toBeOnTheScreen();
  });

  it('renders PasswordInput story with secure text', () => {
    const { args } = stories.PasswordInput;
    const { getByPlaceholderText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders WithError story with error message', () => {
    const { args } = stories.WithError;
    const { getByText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByText('Please enter a valid email address')).toBeOnTheScreen();
  });

  it('renders PhoneInput story with phone placeholder', () => {
    const { args } = stories.PhoneInput;
    const { getByPlaceholderText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders TopInGroup story with top variant', () => {
    const { args } = stories.TopInGroup;
    const { getByPlaceholderText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(args!.placeholder as string)).toBeOnTheScreen();
  });

  it('renders MiddleInGroup story with middle variant', () => {
    const { args } = stories.MiddleInGroup;
    const { getByPlaceholderText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(args!.placeholder as string)).toBeOnTheScreen();
  });

  it('renders BottomInGroup story with bottom variant', () => {
    const { args } = stories.BottomInGroup;
    const { getByPlaceholderText } = renderWithProviders(
      <FormInputItem {...(args as FormInputItemProps)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText(args!.placeholder as string)).toBeOnTheScreen();
  });

  it('renders GroupedForm story with multiple inputs', () => {
    const StoryComponent = stories.GroupedForm.render as React.FC;
    const { getAllByPlaceholderText } = renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/.+/).length).toBeGreaterThan(0);
  });
});
