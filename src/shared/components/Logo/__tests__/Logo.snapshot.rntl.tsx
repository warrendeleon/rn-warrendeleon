/**
 * Logo Snapshot Tests
 *
 * Verifies visual consistency of the Logo component across all variants.
 * Uses @testing-library/react-native for compatibility with Lottie animations.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

import { Logo } from '../Logo';

describe('Logo Snapshots', () => {
  describe('Light Mode (Default)', () => {
    it('renders default light mode logo', async () => {
      const { toJSON } = await render(<Logo testID="logo" />);
      expect(toJSON()).toMatchSnapshot('Logo - Light Mode Default');
    });

    it('renders light mode logo with explicit darkMode=false', async () => {
      const { toJSON } = await render(<Logo darkMode={false} testID="logo" />);
      expect(toJSON()).toMatchSnapshot('Logo - Light Mode Explicit');
    });
  });

  describe('Dark Mode', () => {
    it('renders dark mode logo', async () => {
      const { toJSON } = await render(<Logo darkMode testID="logo" />);
      expect(toJSON()).toMatchSnapshot('Logo - Dark Mode');
    });
  });

  describe('Size Variants', () => {
    it('renders small logo (100x100)', async () => {
      const { toJSON } = await render(<Logo testID="logo" style={{ width: 100, height: 100 }} />);
      expect(toJSON()).toMatchSnapshot('Logo - Small Size');
    });

    it('renders medium logo (200x200)', async () => {
      const { toJSON } = await render(<Logo testID="logo" style={{ width: 200, height: 200 }} />);
      expect(toJSON()).toMatchSnapshot('Logo - Medium Size');
    });

    it('renders large logo (300x300)', async () => {
      const { toJSON } = await render(<Logo testID="logo" style={{ width: 300, height: 300 }} />);
      expect(toJSON()).toMatchSnapshot('Logo - Large Size');
    });
  });

  describe('Animation Variants', () => {
    it('renders auto-playing logo', async () => {
      const { toJSON } = await render(<Logo testID="logo" autoPlay />);
      expect(toJSON()).toMatchSnapshot('Logo - AutoPlay');
    });

    it('renders non-looping logo', async () => {
      const { toJSON } = await render(<Logo testID="logo" loop={false} />);
      expect(toJSON()).toMatchSnapshot('Logo - Non-Looping');
    });

    it('renders paused logo', async () => {
      const { toJSON } = await render(<Logo testID="logo" autoPlay={false} />);
      expect(toJSON()).toMatchSnapshot('Logo - Paused');
    });
  });

  describe('Theme Combinations', () => {
    it('renders dark mode with custom size', async () => {
      const { toJSON } = await render(
        <Logo darkMode testID="logo" style={{ width: 150, height: 150 }} />
      );
      expect(toJSON()).toMatchSnapshot('Logo - Dark Mode Custom Size');
    });

    it('renders light mode with custom size and non-looping', async () => {
      const { toJSON } = await render(
        <Logo darkMode={false} testID="logo" style={{ width: 250, height: 250 }} loop={false} />
      );
      expect(toJSON()).toMatchSnapshot('Logo - Light Mode Custom Size Non-Looping');
    });
  });
});

describe('Logo Snapshot Consistency', () => {
  it('produces consistent output between renders', async () => {
    const { toJSON: toJSON1 } = await render(<Logo testID="logo" />);
    const { toJSON: toJSON2 } = await render(<Logo testID="logo" />);

    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(toJSON1())).toBe(JSON.stringify(toJSON2()));
  });

  it('dark and light modes produce different outputs', async () => {
    const { toJSON: lightJSON } = await render(<Logo darkMode={false} testID="logo" />);
    const { toJSON: darkJSON } = await render(<Logo darkMode testID="logo" />);

    // The sources should be different (whiteLogo vs blackLogo)
    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(lightJSON())).not.toBe(JSON.stringify(darkJSON()));
  });
});
