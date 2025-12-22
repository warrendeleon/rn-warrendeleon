/**
 * Screen Reader Gesture Test Utilities
 *
 * Tests for verifying screen reader gesture support in React Native components.
 * While full VoiceOver/TalkBack testing requires E2E tests, these utilities
 * verify that components are configured correctly for screen reader gestures.
 *
 * WCAG 2.1 Level AA compliance for EAA (European Accessibility Act).
 */

import React from 'react';
import type { AccessibilityActionEvent, ViewStyle } from 'react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';

// Custom prop types for testing edge cases
type TestPressableProps = React.ComponentProps<typeof Pressable> & {
  accessibilityOrder?: number;
};

// Test-only Pressable wrapper for custom props
const TestPressable = (props: TestPressableProps) => {
  const pressableProps = props as unknown as React.ComponentProps<typeof Pressable>;
  return <Pressable {...pressableProps} />;
};

/**
 * Verifies that an element has screen reader-compatible accessibility actions.
 *
 * React Native exposes custom accessibility actions via:
 * - accessibilityActions: Array of available actions
 * - onAccessibilityAction: Handler for actions
 */
function expectAccessibilityActions(
  element: { props: Record<string, unknown> },
  expectedActions: string[]
): void {
  const actions = element.props.accessibilityActions as
    | Array<{ name: string; label?: string }>
    | undefined;

  expect(actions).toBeDefined();
  expect(Array.isArray(actions)).toBe(true);

  const actionNames = actions?.map((a: { name: string }) => a.name) ?? [];
  expectedActions.forEach(expectedAction => {
    expect(actionNames).toContain(expectedAction);
  });

  // Handler must be defined
  expect(typeof element.props.onAccessibilityAction).toBe('function');
}

/**
 * Verifies swipe navigation order for screen reader users.
 * Elements should be focusable and in logical reading order.
 */
function expectSwipeNavigationOrder(elements: Array<{ props: Record<string, unknown> }>): void {
  elements.forEach((element, index) => {
    // Element must be accessible
    expect(element.props.accessible).not.toBe(false);

    // Element must not be hidden from accessibility tree
    expect(element.props.accessibilityElementsHidden).not.toBe(true);
    expect(element.props.importantForAccessibility).not.toBe('no-hide-descendants');
    expect(element.props.importantForAccessibility).not.toBe('no');

    // If accessibilityOrder is defined, it should match sequence
    if (element.props.accessibilityOrder !== undefined) {
      expect(element.props.accessibilityOrder).toBe(index);
    }
  });
}

/**
 * Verifies that an element supports the "magic tap" gesture (iOS double-tap with two fingers).
 * This typically triggers a default action.
 */
function expectMagicTapSupport(element: { props: Record<string, unknown> }): void {
  const actions = element.props.accessibilityActions as
    | Array<{ name: string; label?: string }>
    | undefined;

  // Magic tap is represented as 'magicTap' action
  const hasMagicTap = actions?.some(a => a.name === 'magicTap');

  if (!hasMagicTap) {
    throw new Error(
      'Element does not support magic tap gesture. Add "magicTap" to accessibilityActions.'
    );
  }

  expect(typeof element.props.onAccessibilityAction).toBe('function');
}

/**
 * Verifies that an element supports escape gesture (two-finger Z scrub on iOS).
 * Used for dismissing modals, going back, etc.
 */
function expectEscapeGestureSupport(element: { props: Record<string, unknown> }): void {
  const actions = element.props.accessibilityActions as
    | Array<{ name: string; label?: string }>
    | undefined;

  const hasEscape = actions?.some(a => a.name === 'escape');

  if (!hasEscape) {
    throw new Error(
      'Element does not support escape gesture. Add "escape" to accessibilityActions.'
    );
  }

  expect(typeof element.props.onAccessibilityAction).toBe('function');
}

describe('screen reader gesture tests', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('swipe navigation order', () => {
    it('verifies elements are in correct swipe order', () => {
      render(
        <View>
          <Pressable testID="first" accessible={true} accessibilityLabel="First button">
            <Text>First</Text>
          </Pressable>
          <Pressable testID="second" accessible={true} accessibilityLabel="Second button">
            <Text>Second</Text>
          </Pressable>
          <Pressable testID="third" accessible={true} accessibilityLabel="Third button">
            <Text>Third</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');
      const third = screen.getByTestId('third');

      expect(() => expectSwipeNavigationOrder([first, second, third])).not.toThrow();
    });

    it('fails when element is not accessible', () => {
      render(
        <View>
          <Pressable testID="first" accessible={true}>
            <Text>First</Text>
          </Pressable>
          <Pressable testID="second" accessible={false}>
            <Text>Hidden</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');

      expect(() => expectSwipeNavigationOrder([first, second])).toThrow();
    });

    it('fails when element is hidden from accessibility tree', () => {
      const { UNSAFE_getByProps } = render(
        <View>
          <Pressable testID="first" accessible={true}>
            <Text>First</Text>
          </Pressable>
          <Pressable testID="hidden" accessibilityElementsHidden={true}>
            <Text>Hidden</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const hidden = UNSAFE_getByProps({ testID: 'hidden' });

      expect(() => expectSwipeNavigationOrder([first, hidden])).toThrow();
    });

    it('verifies accessibilityOrder matches visual order when set', () => {
      render(
        <View>
          <TestPressable testID="first" accessible={true} accessibilityOrder={0}>
            <Text>First</Text>
          </TestPressable>
          <TestPressable testID="second" accessible={true} accessibilityOrder={1}>
            <Text>Second</Text>
          </TestPressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');

      expect(() => expectSwipeNavigationOrder([first, second])).not.toThrow();
    });

    it('fails when accessibilityOrder does not match expected sequence', () => {
      render(
        <View>
          <TestPressable testID="first" accessible={true} accessibilityOrder={1}>
            <Text>First</Text>
          </TestPressable>
          <TestPressable testID="second" accessible={true} accessibilityOrder={0}>
            <Text>Second</Text>
          </TestPressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const second = screen.getByTestId('second');

      expect(() => expectSwipeNavigationOrder([first, second])).toThrow();
    });

    it('handles elements with importantForAccessibility set to no', () => {
      const { UNSAFE_getByProps } = render(
        <View>
          <Pressable testID="first" accessible={true}>
            <Text>First</Text>
          </Pressable>
          <Pressable testID="hidden" importantForAccessibility="no">
            <Text>Hidden</Text>
          </Pressable>
        </View>
      );

      const first = screen.getByTestId('first');
      const hidden = UNSAFE_getByProps({ testID: 'hidden' });

      expect(() => expectSwipeNavigationOrder([first, hidden])).toThrow();
    });
  });

  describe('custom accessibility actions', () => {
    it('verifies element has required actions', () => {
      const handleAction = jest.fn();

      render(
        <Pressable
          testID="action-element"
          accessibilityActions={[
            { name: 'activate', label: 'Activate' },
            { name: 'increment', label: 'Increase value' },
            { name: 'decrement', label: 'Decrease value' },
          ]}
          onAccessibilityAction={handleAction}
        >
          <Text>Actionable</Text>
        </Pressable>
      );

      const element = screen.getByTestId('action-element');

      expect(() =>
        expectAccessibilityActions(element, ['activate', 'increment', 'decrement'])
      ).not.toThrow();
    });

    it('fails when required action is missing', () => {
      const handleAction = jest.fn();

      render(
        <Pressable
          testID="action-element"
          accessibilityActions={[{ name: 'activate', label: 'Activate' }]}
          onAccessibilityAction={handleAction}
        >
          <Text>Actionable</Text>
        </Pressable>
      );

      const element = screen.getByTestId('action-element');

      expect(() => expectAccessibilityActions(element, ['activate', 'delete'])).toThrow();
    });

    it('fails when accessibilityActions is not defined', () => {
      render(
        <Pressable testID="action-element">
          <Text>No Actions</Text>
        </Pressable>
      );

      const element = screen.getByTestId('action-element');

      expect(() => expectAccessibilityActions(element, ['activate'])).toThrow();
    });

    it('fails when onAccessibilityAction handler is missing', () => {
      render(
        <Pressable
          testID="action-element"
          accessibilityActions={[{ name: 'activate', label: 'Activate' }]}
          // Missing onAccessibilityAction
        >
          <Text>No Handler</Text>
        </Pressable>
      );

      const element = screen.getByTestId('action-element');

      expect(() => expectAccessibilityActions(element, ['activate'])).toThrow();
    });
  });

  describe('magic tap gesture (iOS)', () => {
    it('verifies element supports magic tap', () => {
      const handleAction = jest.fn();

      render(
        <Pressable
          testID="magic-tap-element"
          accessibilityActions={[
            { name: 'activate', label: 'Activate' },
            { name: 'magicTap', label: 'Toggle play/pause' },
          ]}
          onAccessibilityAction={handleAction}
        >
          <Text>Media Player</Text>
        </Pressable>
      );

      const element = screen.getByTestId('magic-tap-element');

      expect(() => expectMagicTapSupport(element)).not.toThrow();
    });

    it('fails when magic tap is not supported', () => {
      const handleAction = jest.fn();

      render(
        <Pressable
          testID="no-magic-tap"
          accessibilityActions={[{ name: 'activate', label: 'Activate' }]}
          onAccessibilityAction={handleAction}
        >
          <Text>No Magic Tap</Text>
        </Pressable>
      );

      const element = screen.getByTestId('no-magic-tap');

      expect(() => expectMagicTapSupport(element)).toThrow(/magic tap/i);
    });
  });

  describe('escape gesture (two-finger Z)', () => {
    it('verifies element supports escape gesture', () => {
      const handleAction = jest.fn();

      render(
        <View
          testID="modal"
          accessibilityActions={[
            { name: 'escape', label: 'Dismiss modal' },
            { name: 'activate', label: 'Select' },
          ]}
          onAccessibilityAction={handleAction}
        >
          <Text>Modal Content</Text>
        </View>
      );

      const element = screen.getByTestId('modal');

      expect(() => expectEscapeGestureSupport(element)).not.toThrow();
    });

    it('fails when escape gesture is not supported', () => {
      const handleAction = jest.fn();

      render(
        <View
          testID="modal"
          accessibilityActions={[{ name: 'activate', label: 'Select' }]}
          onAccessibilityAction={handleAction}
        >
          <Text>Modal Content</Text>
        </View>
      );

      const element = screen.getByTestId('modal');

      expect(() => expectEscapeGestureSupport(element)).toThrow(/escape/i);
    });
  });

  describe('direct touch passthrough', () => {
    it('verifies accessibilityViewIsModal creates focus trap', () => {
      render(
        <View>
          <Pressable testID="background" accessible={true}>
            <Text>Background</Text>
          </Pressable>
          <View testID="modal" accessibilityViewIsModal={true}>
            <Pressable testID="modal-content" accessible={true}>
              <Text>Modal</Text>
            </Pressable>
          </View>
        </View>
      );

      const modal = screen.getByTestId('modal');

      // accessibilityViewIsModal should be true for focus trapping
      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });

    it('verifies elements outside modal are hidden from accessibility', () => {
      // When accessibilityViewIsModal is true, elements outside should not be focusable
      // This is handled by the OS, but we can verify the modal setup is correct
      render(
        <View>
          <View testID="background-container">
            <Pressable testID="background-button">
              <Text>Background</Text>
            </Pressable>
          </View>
          <View testID="modal" accessibilityViewIsModal={true}>
            <Pressable testID="modal-button">
              <Text>Modal Button</Text>
            </Pressable>
          </View>
        </View>
      );

      const modal = screen.getByTestId('modal');

      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });
  });

  describe('complete accessibility actions array', () => {
    it('verifies slider has increment/decrement actions', () => {
      const handleAction = jest.fn((event: AccessibilityActionEvent) => {
        const { actionName } = event.nativeEvent;
        if (actionName === 'increment' || actionName === 'decrement') {
          // Handle value change
        }
      });

      render(
        <Pressable
          testID="slider"
          accessibilityRole="adjustable"
          accessibilityValue={{ min: 0, max: 100, now: 50 }}
          accessibilityActions={[
            { name: 'increment', label: 'Increase' },
            { name: 'decrement', label: 'Decrease' },
          ]}
          onAccessibilityAction={handleAction}
        >
          <Text>Volume: 50%</Text>
        </Pressable>
      );

      const slider = screen.getByTestId('slider');

      expect(slider.props.accessibilityRole).toBe('adjustable');
      expect(slider.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
      expect(() => expectAccessibilityActions(slider, ['increment', 'decrement'])).not.toThrow();
    });

    it('verifies deletable item has delete action', () => {
      const handleAction = jest.fn();

      render(
        <Pressable
          testID="deletable-item"
          accessibilityActions={[
            { name: 'activate', label: 'Open item' },
            { name: 'delete', label: 'Delete item' },
          ]}
          onAccessibilityAction={handleAction}
        >
          <Text>List Item</Text>
        </Pressable>
      );

      const item = screen.getByTestId('deletable-item');

      expect(() => expectAccessibilityActions(item, ['activate', 'delete'])).not.toThrow();
    });

    it('verifies media control has play/pause via magicTap', () => {
      const handleAction = jest.fn();

      render(
        <Pressable
          testID="media-control"
          accessibilityRole="button"
          accessibilityLabel="Play/Pause"
          accessibilityActions={[
            { name: 'activate', label: 'Toggle play/pause' },
            { name: 'magicTap', label: 'Toggle play/pause' },
          ]}
          onAccessibilityAction={handleAction}
        >
          <Text>▶️</Text>
        </Pressable>
      );

      const control = screen.getByTestId('media-control');

      expect(() => expectMagicTapSupport(control)).not.toThrow();
    });
  });

  describe('scroll view accessibility', () => {
    it('verifies scroll view has accessible scroll content', () => {
      render(
        <ScrollView testID="scroll-view" accessible={false}>
          <Pressable testID="item-1" accessible={true} accessibilityLabel="Item 1">
            <Text>Item 1</Text>
          </Pressable>
          <Pressable testID="item-2" accessible={true} accessibilityLabel="Item 2">
            <Text>Item 2</Text>
          </Pressable>
          <Pressable testID="item-3" accessible={true} accessibilityLabel="Item 3">
            <Text>Item 3</Text>
          </Pressable>
        </ScrollView>
      );

      const scrollView = screen.getByTestId('scroll-view');
      const item1 = screen.getByTestId('item-1');
      const item2 = screen.getByTestId('item-2');
      const item3 = screen.getByTestId('item-3');

      // ScrollView itself should not be accessible (contents are)
      expect(scrollView.props.accessible).toBe(false);

      // Children should be accessible
      expect(item1.props.accessible).toBe(true);
      expect(item2.props.accessible).toBe(true);
      expect(item3.props.accessible).toBe(true);
    });

    it('verifies scroll view items are navigable in order', () => {
      render(
        <ScrollView testID="scroll-view" accessible={false}>
          <Pressable testID="item-1" accessible={true}>
            <Text>Item 1</Text>
          </Pressable>
          <Pressable testID="item-2" accessible={true}>
            <Text>Item 2</Text>
          </Pressable>
        </ScrollView>
      );

      const item1 = screen.getByTestId('item-1');
      const item2 = screen.getByTestId('item-2');

      expect(() => expectSwipeNavigationOrder([item1, item2])).not.toThrow();
    });
  });

  describe('grouped accessibility elements', () => {
    it('verifies group is announced as single element when accessible', () => {
      render(
        <View
          testID="card"
          accessible={true}
          accessibilityLabel="John Doe, Software Engineer, View profile"
          accessibilityRole="button"
        >
          <Text>John Doe</Text>
          <Text>Software Engineer</Text>
        </View>
      );

      const card = screen.getByTestId('card');

      // Group should be accessible as one element
      expect(card.props.accessible).toBe(true);
      expect(card.props.accessibilityLabel).toBe('John Doe, Software Engineer, View profile');
    });

    it('verifies children are individually focusable when group is not accessible', () => {
      render(
        <View testID="container" accessible={false}>
          <Pressable testID="name" accessible={true} accessibilityLabel="John Doe">
            <Text>John Doe</Text>
          </Pressable>
          <Pressable testID="title" accessible={true} accessibilityLabel="Software Engineer">
            <Text>Software Engineer</Text>
          </Pressable>
        </View>
      );

      const container = screen.getByTestId('container');
      const name = screen.getByTestId('name');
      const title = screen.getByTestId('title');

      expect(container.props.accessible).toBe(false);
      expect(name.props.accessible).toBe(true);
      expect(title.props.accessible).toBe(true);
    });
  });

  describe('advanced screen reader gestures', () => {
    describe('magic tap gesture (onMagicTap handler)', () => {
      /**
       * Magic tap is a two-finger double-tap gesture on iOS.
       * React Native supports it via onMagicTap prop for custom handling.
       * Common uses: play/pause media, toggle primary action.
       */
      it('verifies onMagicTap handler is configured', () => {
        const handleMagicTap = jest.fn(() => true);

        render(
          <Pressable
            testID="media-player"
            onMagicTap={handleMagicTap}
            accessibilityRole="button"
            accessibilityLabel="Media player"
          >
            <Text>Play/Pause</Text>
          </Pressable>
        );

        const element = screen.getByTestId('media-player');

        // onMagicTap should be defined
        expect(typeof element.props.onMagicTap).toBe('function');
      });

      it('verifies magic tap returns true for successful handling', () => {
        const handleMagicTap = jest.fn(() => true);

        render(
          <Pressable testID="media-player" onMagicTap={handleMagicTap}>
            <Text>Play/Pause</Text>
          </Pressable>
        );

        const element = screen.getByTestId('media-player');

        // Simulate calling the handler
        const result = element.props.onMagicTap?.();

        expect(result).toBe(true);
        expect(handleMagicTap).toHaveBeenCalledTimes(1);
      });

      it('verifies magic tap returns false to allow bubbling', () => {
        const handleMagicTap = jest.fn(() => false);

        render(
          <Pressable testID="child" onMagicTap={handleMagicTap}>
            <Text>Child</Text>
          </Pressable>
        );

        const element = screen.getByTestId('child');

        // Return false to allow parent to handle
        const result = element.props.onMagicTap?.();

        expect(result).toBe(false);
      });

      it('verifies media player pattern with magic tap', () => {
        let isPlaying = false;
        const togglePlayback = jest.fn(() => {
          isPlaying = !isPlaying;
          return true;
        });

        render(
          <Pressable
            testID="audio-player"
            onMagicTap={togglePlayback}
            accessibilityRole="button"
            accessibilityState={{ expanded: isPlaying }}
            accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            <Text>{isPlaying ? '⏸️' : '▶️'}</Text>
          </Pressable>
        );

        const element = screen.getByTestId('audio-player');

        // Verify initial state
        expect(isPlaying).toBe(false);

        // Trigger magic tap
        element.props.onMagicTap?.();

        // Verify toggle occurred
        expect(togglePlayback).toHaveBeenCalledTimes(1);
        expect(isPlaying).toBe(true);
      });
    });

    describe('two-finger scrub escape gesture (onAccessibilityEscape handler)', () => {
      /**
       * Escape gesture is a two-finger Z-shaped scrub on iOS.
       * React Native supports it via onAccessibilityEscape prop.
       * Common uses: dismiss modal, go back, cancel action.
       */
      it('verifies onAccessibilityEscape handler is configured', () => {
        const handleEscape = jest.fn(() => true);

        render(
          <View testID="modal" onAccessibilityEscape={handleEscape} accessibilityViewIsModal={true}>
            <Text>Modal Content</Text>
          </View>
        );

        const element = screen.getByTestId('modal');

        // onAccessibilityEscape should be defined
        expect(typeof element.props.onAccessibilityEscape).toBe('function');
      });

      it('verifies escape returns true for successful dismissal', () => {
        const handleEscape = jest.fn(() => true);

        render(
          <View testID="modal" onAccessibilityEscape={handleEscape}>
            <Text>Modal Content</Text>
          </View>
        );

        const element = screen.getByTestId('modal');

        // Simulate calling the handler
        const result = element.props.onAccessibilityEscape?.();

        expect(result).toBe(true);
        expect(handleEscape).toHaveBeenCalledTimes(1);
      });

      it('verifies modal dismissal pattern with escape', () => {
        let isModalVisible = true;
        const dismissModal = jest.fn(() => {
          isModalVisible = false;
          return true;
        });

        render(
          <View
            testID="dismissible-modal"
            onAccessibilityEscape={dismissModal}
            accessibilityViewIsModal={true}
            accessibilityLabel="Modal dialog, swipe left or right with two fingers to dismiss"
          >
            <Text>Content</Text>
          </View>
        );

        const modal = screen.getByTestId('dismissible-modal');

        // Verify modal is initially visible
        expect(isModalVisible).toBe(true);

        // Trigger escape gesture
        modal.props.onAccessibilityEscape?.();

        // Verify modal was dismissed
        expect(dismissModal).toHaveBeenCalledTimes(1);
        expect(isModalVisible).toBe(false);
      });

      it('verifies escape combined with accessibilityViewIsModal for proper focus trapping', () => {
        const handleEscape = jest.fn(() => true);

        render(
          <View
            testID="focus-trapped-modal"
            onAccessibilityEscape={handleEscape}
            accessibilityViewIsModal={true}
          >
            <Pressable testID="modal-button" accessible={true}>
              <Text>Action</Text>
            </Pressable>
          </View>
        );

        const modal = screen.getByTestId('focus-trapped-modal');

        // accessibilityViewIsModal traps focus within modal
        expect(modal.props.accessibilityViewIsModal).toBe(true);
        // onAccessibilityEscape provides escape route
        expect(typeof modal.props.onAccessibilityEscape).toBe('function');
      });
    });

    describe('rotor navigation (accessibilityActions)', () => {
      /**
       * VoiceOver rotor allows users to navigate by element type.
       * Custom actions appear in rotor and can be triggered with swipe.
       * This tests the configuration of custom rotor actions.
       */
      it('verifies rotor actions are properly configured', () => {
        const handleAction = jest.fn();

        render(
          <Pressable
            testID="rotor-element"
            accessibilityActions={[
              { name: 'activate', label: 'Open item' },
              { name: 'delete', label: 'Delete item' },
              { name: 'copy', label: 'Copy to clipboard' },
              { name: 'share', label: 'Share item' },
            ]}
            onAccessibilityAction={handleAction}
          >
            <Text>List Item</Text>
          </Pressable>
        );

        const element = screen.getByTestId('rotor-element');

        const actions = element.props.accessibilityActions;
        expect(actions).toHaveLength(4);
        expect(actions.map((a: { name: string }) => a.name)).toEqual([
          'activate',
          'delete',
          'copy',
          'share',
        ]);
      });

      it('verifies rotor action handler receives correct action name', () => {
        const handleAction = jest.fn();

        render(
          <Pressable
            testID="rotor-element"
            accessibilityActions={[
              { name: 'delete', label: 'Delete' },
              { name: 'archive', label: 'Archive' },
            ]}
            onAccessibilityAction={handleAction}
          >
            <Text>Email</Text>
          </Pressable>
        );

        const element = screen.getByTestId('rotor-element');

        // Simulate rotor action
        element.props.onAccessibilityAction?.({
          nativeEvent: { actionName: 'delete' },
        });

        expect(handleAction).toHaveBeenCalledWith(
          expect.objectContaining({
            nativeEvent: { actionName: 'delete' },
          })
        );
      });

      it('verifies multiple rotor actions can be distinguished', () => {
        const actions: string[] = [];
        const handleAction = jest.fn((event: AccessibilityActionEvent) => {
          actions.push(event.nativeEvent.actionName);
        });

        render(
          <Pressable
            testID="multi-action"
            accessibilityActions={[
              { name: 'activate', label: 'Open' },
              { name: 'longpress', label: 'Show menu' },
              { name: 'increment', label: 'Next' },
              { name: 'decrement', label: 'Previous' },
            ]}
            onAccessibilityAction={handleAction}
          >
            <Text>Carousel Item</Text>
          </Pressable>
        );

        const element = screen.getByTestId('multi-action');

        // Simulate multiple rotor actions
        element.props.onAccessibilityAction?.({
          nativeEvent: { actionName: 'activate' },
        });
        element.props.onAccessibilityAction?.({
          nativeEvent: { actionName: 'increment' },
        });
        element.props.onAccessibilityAction?.({
          nativeEvent: { actionName: 'decrement' },
        });

        expect(actions).toEqual(['activate', 'increment', 'decrement']);
      });

      it('verifies standard rotor actions for adjustable elements', () => {
        const handleAction = jest.fn();

        render(
          <Pressable
            testID="rating-slider"
            accessibilityRole="adjustable"
            accessibilityLabel="Rating"
            accessibilityValue={{ min: 1, max: 5, now: 3, text: '3 out of 5 stars' }}
            accessibilityActions={[
              { name: 'increment', label: 'Increase rating' },
              { name: 'decrement', label: 'Decrease rating' },
            ]}
            onAccessibilityAction={handleAction}
          >
            <Text>⭐⭐⭐☆☆</Text>
          </Pressable>
        );

        const element = screen.getByTestId('rating-slider');

        // Verify adjustable role has increment/decrement
        expect(element.props.accessibilityRole).toBe('adjustable');
        expect(element.props.accessibilityActions.map((a: { name: string }) => a.name)).toContain(
          'increment'
        );
        expect(element.props.accessibilityActions.map((a: { name: string }) => a.name)).toContain(
          'decrement'
        );
      });

      it('verifies rotor action labels are descriptive', () => {
        const handleAction = jest.fn();

        render(
          <Pressable
            testID="labeled-actions"
            accessibilityActions={[
              { name: 'activate', label: 'View full article' },
              { name: 'delete', label: 'Remove from reading list' },
              { name: 'longpress', label: 'Show sharing options' },
            ]}
            onAccessibilityAction={handleAction}
          >
            <Text>Article Preview</Text>
          </Pressable>
        );

        const element = screen.getByTestId('labeled-actions');

        const actions = element.props.accessibilityActions;

        // Labels should be descriptive, not just action names
        expect(actions.find((a: { name: string }) => a.name === 'activate')?.label).toBe(
          'View full article'
        );
        expect(actions.find((a: { name: string }) => a.name === 'delete')?.label).toBe(
          'Remove from reading list'
        );
      });
    });

    describe('combined gesture patterns', () => {
      it('verifies element supports both magic tap and escape', () => {
        const handleMagicTap = jest.fn(() => true);
        const handleEscape = jest.fn(() => true);
        const handleAction = jest.fn();

        render(
          <View
            testID="full-featured"
            onMagicTap={handleMagicTap}
            onAccessibilityEscape={handleEscape}
            accessibilityActions={[
              { name: 'activate', label: 'Play/Pause' },
              { name: 'magicTap', label: 'Play/Pause' },
              { name: 'escape', label: 'Close player' },
            ]}
            onAccessibilityAction={handleAction}
          >
            <Text>Full-Screen Media Player</Text>
          </View>
        );

        const element = screen.getByTestId('full-featured');

        // All gesture handlers should be defined
        expect(typeof element.props.onMagicTap).toBe('function');
        expect(typeof element.props.onAccessibilityEscape).toBe('function');
        expect(typeof element.props.onAccessibilityAction).toBe('function');

        // Actions should also include magicTap and escape for rotor
        const actionNames = element.props.accessibilityActions.map((a: { name: string }) => a.name);
        expect(actionNames).toContain('magicTap');
        expect(actionNames).toContain('escape');
      });

      it('verifies swipeable list item with rotor delete action', () => {
        const handleDelete = jest.fn();
        const handleAction = jest.fn((event: AccessibilityActionEvent) => {
          if (event.nativeEvent.actionName === 'delete') {
            handleDelete();
          }
        });

        render(
          <Pressable
            testID="swipeable-item"
            accessibilityLabel="Email from John, Subject: Meeting tomorrow"
            accessibilityHint="Swipe up or down for actions"
            accessibilityActions={[
              { name: 'activate', label: 'Open email' },
              { name: 'delete', label: 'Delete email' },
              { name: 'longpress', label: 'More actions' },
            ]}
            onAccessibilityAction={handleAction}
          >
            <Text>Email Item</Text>
          </Pressable>
        );

        const element = screen.getByTestId('swipeable-item');

        // Simulate rotor delete action
        element.props.onAccessibilityAction?.({
          nativeEvent: { actionName: 'delete' },
        });

        expect(handleDelete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('accessibility value for adjustable elements', () => {
    it('verifies slider announces current value', () => {
      render(
        <Pressable
          testID="brightness"
          accessibilityRole="adjustable"
          accessibilityLabel="Brightness"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: 75,
            text: '75%',
          }}
          accessibilityActions={[
            { name: 'increment', label: 'Increase brightness' },
            { name: 'decrement', label: 'Decrease brightness' },
          ]}
          onAccessibilityAction={jest.fn()}
        >
          <Text>75%</Text>
        </Pressable>
      );

      const slider = screen.getByTestId('brightness');

      expect(slider.props.accessibilityRole).toBe('adjustable');
      expect(slider.props.accessibilityValue.now).toBe(75);
      expect(slider.props.accessibilityValue.text).toBe('75%');
    });

    it('verifies progress element announces progress', () => {
      render(
        <View
          testID="progress"
          accessibilityRole="progressbar"
          accessibilityLabel="Download progress"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: 45,
            text: '45% complete',
          }}
        >
          <View style={{ width: '45%', backgroundColor: 'blue' } as ViewStyle} />
        </View>
      );

      const progress = screen.getByTestId('progress');

      expect(progress.props.accessibilityRole).toBe('progressbar');
      expect(progress.props.accessibilityValue.now).toBe(45);
      expect(progress.props.accessibilityValue.text).toBe('45% complete');
    });
  });
});
