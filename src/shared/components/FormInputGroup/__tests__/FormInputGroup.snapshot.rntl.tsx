/**
 * FormInputGroup Snapshot Tests
 *
 * Verifies visual consistency of the FormInputGroup component across all states.
 * Uses @testing-library/react-native for compatibility with GlueStack UI components.
 */

import React from 'react';
import * as ReactNative from 'react-native';
import { Text } from '@gluestack-ui/themed';

import { renderWithProviders } from '@app/test-utils';

import { FormInputGroup } from '../FormInputGroup';

describe('FormInputGroup Snapshots', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  describe('Light Mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders with title in light mode', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Account Details" testID="form-group">
          <Text>Input placeholder</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Light Mode With Title');
    });

    it('renders without title in light mode', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup testID="form-group">
          <Text>Input placeholder</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Light Mode Without Title');
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('renders with title in dark mode', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Account Details" testID="form-group">
          <Text>Input placeholder</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Dark Mode With Title');
    });

    it('renders without title in dark mode', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup testID="form-group">
          <Text>Input placeholder</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Dark Mode Without Title');
    });
  });

  describe('Title Variants', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders with short title', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Info" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Short Title');
    });

    it('renders with long title', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Personal Information and Contact Details" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Long Title');
    });

    it('renders with special characters in title', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Información Personal" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Special Characters Title');
    });

    it('renders with lowercase title (gets uppercased)', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="account details" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Lowercase Title');
    });
  });

  describe('Spacing Variants', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders with default spacing', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Default Spacing" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Default Spacing');
    });

    it('renders with custom horizontal margin', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Custom Margin" mx="$8" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Custom Horizontal Margin');
    });

    it('renders with custom top margin', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Custom Top" mt="$10" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Custom Top Margin');
    });

    it('renders with zero margins', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Zero Margins" mx="$0" mt="$0" testID="form-group">
          <Text>Content</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Zero Margins');
    });
  });

  describe('Children Variants', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders with single child', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Single Child" testID="form-group">
          <Text>Single input</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Single Child');
    });

    it('renders with multiple children', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Multiple Children" testID="form-group">
          <Text>First input</Text>
          <Text>Second input</Text>
          <Text>Third input</Text>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Multiple Children');
    });

    it('renders with nested components', async () => {
      const { toJSON } = await renderWithProviders(
        <FormInputGroup title="Nested" testID="form-group">
          <FormInputGroup testID="nested-group">
            <Text>Nested content</Text>
          </FormInputGroup>
        </FormInputGroup>
      );
      expect(toJSON()).toMatchSnapshot('FormInputGroup - Nested Components');
    });
  });
});

describe('FormInputGroup Snapshot Consistency', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('produces consistent output between renders', async () => {
    const { toJSON: toJSON1 } = await renderWithProviders(
      <FormInputGroup title="Test" testID="form-group">
        <Text>Content</Text>
      </FormInputGroup>
    );
    const { toJSON: toJSON2 } = await renderWithProviders(
      <FormInputGroup title="Test" testID="form-group">
        <Text>Content</Text>
      </FormInputGroup>
    );

    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(toJSON1())).toBe(JSON.stringify(toJSON2()));
  });

  it('light and dark modes produce different outputs', async () => {
    mockUseColorScheme.mockReturnValue('light');
    const { toJSON: lightJSON } = await renderWithProviders(
      <FormInputGroup title="Test" testID="form-group">
        <Text>Content</Text>
      </FormInputGroup>
    );

    mockUseColorScheme.mockReturnValue('dark');
    const { toJSON: darkJSON } = await renderWithProviders(
      <FormInputGroup title="Test" testID="form-group">
        <Text>Content</Text>
      </FormInputGroup>
    );

    // Title colours differ between light and dark modes
    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(lightJSON())).not.toBe(JSON.stringify(darkJSON()));
  });
});
