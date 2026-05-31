/**
 * Story tests for FormInputGroup component
 *
 * Verifies all Storybook stories render correctly.
 */

import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import * as stories from '../FormInputGroup.stories';

// Mock navigation for FormInputGroup stories (some stories use components that need navigation)
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('FormInputGroup Stories', () => {
  it('renders Default story with input fields', async () => {
    const StoryComponent = stories.Default.render as React.FC;
    const { getAllByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/.+/).length).toBeGreaterThan(0);
  });

  it('renders WithoutTitle story with input fields', async () => {
    const StoryComponent = stories.WithoutTitle.render as React.FC;
    const { getAllByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/.+/).length).toBeGreaterThan(0);
  });

  it('renders LoginForm story with email and password', async () => {
    const StoryComponent = stories.LoginForm.render as React.FC;
    const { getByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getByPlaceholderText(/email/i)).toBeOnTheScreen();
    expect(getByPlaceholderText(/password/i)).toBeOnTheScreen();
  });

  it('renders NameSection story with name fields', async () => {
    const StoryComponent = stories.NameSection.render as React.FC;
    const { getAllByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/.+/).length).toBeGreaterThan(0);
  });

  it('renders ContactSection story with phone field', async () => {
    const StoryComponent = stories.ContactSection.render as React.FC;
    const { getByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getByPlaceholderText(/phone/i)).toBeOnTheScreen();
  });

  it('renders PasswordSection story with password fields', async () => {
    const StoryComponent = stories.PasswordSection.render as React.FC;
    const { getAllByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/password/i).length).toBeGreaterThan(0);
  });

  it('renders CompleteRegistrationForm story with all sections', async () => {
    const StoryComponent = stories.CompleteRegistrationForm.render as React.FC;
    const { getAllByPlaceholderText } = await renderWithProviders(<StoryComponent />);
    expect(getAllByPlaceholderText(/.+/).length).toBeGreaterThan(3);
  });
});
