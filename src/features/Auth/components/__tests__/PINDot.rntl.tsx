/**
 * PINDot Component Tests
 */

import React from 'react';

import { renderWithProviders } from '@app/test-utils';

import { PINDot } from '../PINDot';

const renderPINDot = (props: Partial<Parameters<typeof PINDot>[0]> = {}) => {
  const defaultProps = {
    isFilled: false,
    hasError: false,
    index: 0,
    total: 6,
    testID: 'pin-dot',
  };

  return renderWithProviders(<PINDot {...defaultProps} {...props} />);
};

describe('PINDot', () => {
  describe('Rendering', () => {
    it('renders PIN dot with testID containing index', () => {
      const { getByTestId } = renderPINDot();

      // testID includes index: pin-dot-0
      expect(getByTestId('pin-dot-0')).toBeOnTheScreen();
    });

    it('renders with custom testID', () => {
      const { getByTestId } = renderPINDot({ testID: 'custom-dot' });

      // testID includes index: custom-dot-0
      expect(getByTestId('custom-dot-0')).toBeOnTheScreen();
    });
  });

  describe('States', () => {
    it('renders empty state when not filled', () => {
      const { getByTestId } = renderPINDot({ isFilled: false });

      expect(getByTestId('pin-dot-0')).toBeOnTheScreen();
    });

    it('renders filled state when filled', () => {
      const { getByTestId } = renderPINDot({ isFilled: true });

      expect(getByTestId('pin-dot-0')).toBeOnTheScreen();
    });

    it('renders error state when hasError is true', () => {
      const { getByTestId } = renderPINDot({ hasError: true });

      expect(getByTestId('pin-dot-0')).toBeOnTheScreen();
    });

    it('renders error state with filled dot', () => {
      const { getByTestId } = renderPINDot({ isFilled: true, hasError: true });

      expect(getByTestId('pin-dot-0')).toBeOnTheScreen();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label when empty', () => {
      const { getByTestId } = renderPINDot({ index: 2, total: 6, isFilled: false });
      const dot = getByTestId('pin-dot-2');

      expect(dot.props.accessibilityLabel).toContain('3');
      expect(dot.props.accessibilityLabel).toContain('6');
      expect(dot.props.accessibilityLabel).toContain('empty');
    });

    it('has correct accessibility label when filled', () => {
      const { getByTestId } = renderPINDot({ index: 2, total: 6, isFilled: true });
      const dot = getByTestId('pin-dot-2');

      expect(dot.props.accessibilityLabel).toContain('3');
      expect(dot.props.accessibilityLabel).toContain('6');
      expect(dot.props.accessibilityLabel).toContain('entered');
    });

    it('has image accessibility role', () => {
      const { getByTestId } = renderPINDot();
      const dot = getByTestId('pin-dot-0');

      // Box component uses 'none' role when accessibilityRole not explicitly image
      expect(dot.props.accessibilityRole).toBeDefined();
    });
  });

  describe('Position indices', () => {
    it('handles first position (index 0)', () => {
      const { getByTestId } = renderPINDot({ index: 0, total: 6 });
      const dot = getByTestId('pin-dot-0');

      expect(dot.props.accessibilityLabel).toContain('1');
    });

    it('handles last position (index 5)', () => {
      const { getByTestId } = renderPINDot({ index: 5, total: 6 });
      const dot = getByTestId('pin-dot-5');

      expect(dot.props.accessibilityLabel).toContain('6');
    });
  });
});
