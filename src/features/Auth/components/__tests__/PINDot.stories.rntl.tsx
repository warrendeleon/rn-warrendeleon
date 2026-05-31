import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { PINDot } from '../PINDot';
import * as stories from '../PINDot.stories';

describe('PINDot Stories', () => {
  it('renders Empty story with empty accessibility label', async () => {
    const { args } = stories.Empty;
    const { getByTestId } = await renderWithProviders(
      <PINDot
        isFilled={args?.isFilled ?? false}
        hasError={args?.hasError ?? false}
        index={args?.index ?? 0}
        total={args?.total ?? 6}
        testID="pin-dot"
      />
    );
    expect(getByTestId('pin-dot-0').props.accessibilityLabel).toContain('empty');
  });

  it('renders Filled story with entered accessibility label', async () => {
    const { args } = stories.Filled;
    const { getByTestId } = await renderWithProviders(
      <PINDot
        isFilled={args?.isFilled ?? true}
        hasError={args?.hasError ?? false}
        index={args?.index ?? 0}
        total={args?.total ?? 6}
        testID="pin-dot"
      />
    );
    expect(getByTestId('pin-dot-0').props.accessibilityLabel).toContain('entered');
  });

  it('renders Error story with entered state', async () => {
    const { args } = stories.Error;
    const { getByTestId } = await renderWithProviders(
      <PINDot
        isFilled={args?.isFilled ?? true}
        hasError={args?.hasError ?? true}
        index={args?.index ?? 0}
        total={args?.total ?? 6}
        testID="pin-dot"
      />
    );
    expect(getByTestId('pin-dot-0').props.accessibilityLabel).toContain('entered');
  });

  it('renders AllStates story with multiple dots', async () => {
    const Story = stories.AllStates.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/dot-\d/).length).toBeGreaterThan(0);
  });

  it('renders PartialEntry story with mix of filled and empty', async () => {
    const Story = stories.PartialEntry.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/dot-\d/).length).toBeGreaterThan(0);
  });

  it('renders FullError story with all dots in error state', async () => {
    const Story = stories.FullError.render as React.FC;
    const { getAllByTestId } = await renderWithProviders(<Story />);
    expect(getAllByTestId(/dot-\d/).length).toBeGreaterThan(0);
  });

  describe('story args validation', () => {
    it('Empty story has correct props', () => {
      const { args } = stories.Empty;
      expect(args?.isFilled).toBe(false);
      expect(args?.hasError).toBe(false);
    });

    it('Filled story has correct props', () => {
      const { args } = stories.Filled;
      expect(args?.isFilled).toBe(true);
      expect(args?.hasError).toBe(false);
    });

    it('Error story has correct props', () => {
      const { args } = stories.Error;
      expect(args?.isFilled).toBe(true);
      expect(args?.hasError).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('Empty dot has correct accessibility label', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINDot isFilled={false} hasError={false} index={0} total={6} testID="pin-dot" />
      );
      const dot = getByTestId('pin-dot-0');
      expect(dot.props.accessibilityLabel).toBe('PIN digit 1 of 6, empty');
    });

    it('Filled dot has correct accessibility label', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINDot isFilled={true} hasError={false} index={2} total={6} testID="pin-dot" />
      );
      const dot = getByTestId('pin-dot-2');
      expect(dot.props.accessibilityLabel).toBe('PIN digit 3 of 6, entered');
    });

    it('has accessibilityRole none (decorative)', async () => {
      const { getByTestId } = await renderWithProviders(
        <PINDot isFilled={false} hasError={false} index={0} total={6} testID="pin-dot" />
      );
      const dot = getByTestId('pin-dot-0');
      expect(dot.props.accessibilityRole).toBe('none');
    });
  });
});
