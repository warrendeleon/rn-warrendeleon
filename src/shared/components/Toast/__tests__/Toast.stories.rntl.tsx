/**
 * Story tests for Toast component
 *
 * Verifies all Storybook stories render correctly.
 */

import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import * as stories from '../Toast.stories';
import { ToastProvider } from '../ToastProvider';

describe('Toast Stories', () => {
  describe('story rendering', () => {
    it.each([
      [
        'Types',
        stories.Types,
        [
          'Toast Types',
          'Show Success Toast',
          'Show Error Toast',
          'Show Info Toast',
          'Show Warning Toast',
        ],
      ],
      [
        'WithTitle',
        stories.WithTitle,
        ['Toast with Title', 'Show Toast with Title', 'Show Error with Title'],
      ],
      [
        'WithAction',
        stories.WithAction,
        ['Toast with Action Button', 'Show Toast with Undo Action', 'Show Error with Retry'],
      ],
      [
        'Positions',
        stories.Positions,
        ['Toast Positions', 'Show Toast at Top', 'Show Toast at Bottom'],
      ],
      [
        'NonDismissible',
        stories.NonDismissible,
        ['Non-Dismissible Toast', 'Show Non-Dismissible Toast'],
      ],
      [
        'CustomDurations',
        stories.CustomDurations,
        ['Custom Durations', 'Quick Toast (2s)', 'Long Toast (10s)'],
      ],
    ] as const)(
      'renders %s story with expected content',
      async (_storyName, story, expectedTexts) => {
        const StoryComponent = story.render as React.FC;
        const { getByText } = await renderWithProviders(
          <ToastProvider>
            <StoryComponent />
          </ToastProvider>
        );
        expectedTexts.forEach(text => {
          expect(getByText(text)).toBeOnTheScreen();
        });
      }
    );
  });
});
