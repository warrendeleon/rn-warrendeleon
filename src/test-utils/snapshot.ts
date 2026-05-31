/**
 * Snapshot Testing Utilities
 *
 * Provides configuration and helper functions for consistent snapshot testing
 * across the application. Normalises platform differences and excludes dynamic values.
 */

import type { TestInstance, JsonElement } from 'test-renderer';

/**
 * Properties to exclude from snapshots for stability.
 *
 * These props contain dynamic values that change between test runs:
 * - testID: Used for test identification, not visual representation
 * - nativeID: Platform-specific identifiers
 * - key: React internal identifier
 * - onPress/onChange etc: Function references that serialise inconsistently
 */
export const SNAPSHOT_EXCLUDED_PROPS = [
  'testID',
  'nativeID',
  'key',
  'onPress',
  'onPressIn',
  'onPressOut',
  'onChange',
  'onChangeText',
  'onSubmitEditing',
  'onFocus',
  'onBlur',
  'onLayout',
  'onScroll',
  'onMomentumScrollEnd',
  'collapsable',
] as const;

/**
 * Snapshot configuration for consistent component snapshots.
 */
export const snapshotConfig = {
  /**
   * Properties to exclude from snapshots to ensure stability.
   */
  exclude: SNAPSHOT_EXCLUDED_PROPS,

  /**
   * Target platform for normalising platform-specific differences.
   */
  platform: 'ios' as const,
} as const;

/**
 * Recursively removes excluded properties from a snapshot tree.
 *
 * @param node - The snapshot node to process
 * @returns A cleaned snapshot node without excluded properties
 */
export function cleanSnapshotProps(
  node: JsonElement | JsonElement[] | null
): JsonElement | JsonElement[] | null {
  if (!node) {
    return null;
  }

  // Handle array of nodes
  if (Array.isArray(node)) {
    return node.map(child => cleanSnapshotProps(child)) as JsonElement[];
  }

  // Handle string nodes (text content)
  if (typeof node === 'string') {
    return node as unknown as JsonElement;
  }

  // Clone the node to avoid mutations
  const cleanedNode: JsonElement = {
    ...node,
    props: { ...node.props },
  };

  // Remove excluded properties
  for (const prop of SNAPSHOT_EXCLUDED_PROPS) {
    if (prop in cleanedNode.props) {
      delete cleanedNode.props[prop];
    }
  }

  // Recursively clean children
  if (cleanedNode.children) {
    cleanedNode.children = cleanedNode.children.map(child => {
      if (typeof child === 'string') {
        return child;
      }
      return cleanSnapshotProps(child);
    }) as JsonElement['children'];
  }

  return cleanedNode;
}

/**
 * Snapshot serialiser interface for Jest's expect.addSnapshotSerializer().
 */
export interface SnapshotSerializer {
  /** Tests whether a value should be processed by this serialiser */
  test: (val: unknown) => boolean;
  /** Serialises the value to a string for snapshot comparison */
  serialize: (
    val: JsonElement,
    config: unknown,
    indentation: string,
    depth: number,
    refs: unknown,
    printer: (val: unknown) => string
  ) => string;
}

/**
 * Creates a snapshot serialiser that excludes dynamic properties.
 *
 * Use with Jest's expect.addSnapshotSerializer() for consistent snapshots.
 *
 * @returns Snapshot serialiser with test and serialize methods
 *
 * @example
 * ```typescript
 * expect.addSnapshotSerializer(createSnapshotSerializer());
 *
 * it('matches snapshot', () => {
 *   const tree = renderer.create(<MyComponent />).toJSON();
 *   expect(tree).toMatchSnapshot();
 * });
 * ```
 */
export function createSnapshotSerializer(): SnapshotSerializer {
  return {
    test: (val: unknown): boolean => {
      return val !== null && typeof val === 'object' && 'type' in val && 'props' in val;
    },
    serialize: (
      val: JsonElement,
      _config: unknown,
      _indentation: string,
      _depth: number,
      _refs: unknown,
      printer: (val: unknown) => string
    ): string => {
      const cleaned = cleanSnapshotProps(val);
      return printer(cleaned);
    },
  };
}

/**
 * Helper to create a snapshot test for a component with all its variants.
 *
 * @param name - Test suite name
 * @param renderVariant - Function that renders a specific variant
 * @param variants - Object mapping variant names to their props
 *
 * @example
 * ```typescript
 * describeSnapshots('Button', renderButton, {
 *   default: {},
 *   primary: { variant: 'primary' },
 *   disabled: { disabled: true },
 * });
 * ```
 */
export function describeSnapshots<P extends Record<string, unknown>>(
  name: string,
  renderVariant: (props: P) => JsonElement | null,
  variants: Record<string, P>
): void {
  describe(`${name} Snapshots`, () => {
    for (const [variantName, props] of Object.entries(variants)) {
      it(`renders ${variantName} variant correctly`, () => {
        const tree = renderVariant(props);
        const cleaned = cleanSnapshotProps(tree);
        expect(cleaned).toMatchSnapshot();
      });
    }
  });
}

/**
 * Options for expectMatchesSnapshot helper.
 */
export interface SnapshotOptions {
  /**
   * Additional properties to exclude beyond the defaults.
   */
  additionalExclusions?: string[];

  /**
   * Name for the snapshot (useful for multiple snapshots in one test).
   */
  snapshotName?: string;
}

/**
 * Asserts that a component tree matches its snapshot.
 *
 * Automatically cleans dynamic properties before comparison.
 *
 * @param tree - The component tree from renderer.toJSON()
 * @param options - Optional configuration
 *
 * @example
 * ```typescript
 * it('matches snapshot', () => {
 *   const tree = renderer.create(<MyComponent />).toJSON();
 *   expectMatchesSnapshot(tree);
 * });
 * ```
 */
export function expectMatchesSnapshot(
  tree: JsonElement | JsonElement[] | null,
  options?: SnapshotOptions
): void {
  const cleaned = cleanSnapshotProps(tree);

  if (options?.snapshotName) {
    expect(cleaned).toMatchSnapshot(options.snapshotName);
  } else {
    expect(cleaned).toMatchSnapshot();
  }
}

/**
 * Asserts component matches snapshot with descriptive name.
 *
 * Convenience wrapper that renders, cleans, and asserts in one call.
 * Use this for simple snapshot tests where you just need to verify
 * a component renders consistently.
 *
 * @param tree - The component tree from renderer.toJSON()
 * @param name - Descriptive name for the snapshot
 *
 * @example
 * ```typescript
 * it('matches snapshot', () => {
 *   const tree = renderer.create(<Button variant="primary" />).toJSON();
 *   expectSnapshotMatch(tree, 'primary button');
 * });
 * ```
 */
export function expectSnapshotMatch(
  tree: JsonElement | JsonElement[] | null,
  name: string
): void {
  const cleaned = cleanSnapshotProps(tree);
  expect(cleaned).toMatchSnapshot(name);
}

/**
 * Creates a consistent snapshot from a TestInstance.
 *
 * Useful when working with @testing-library/react-native results.
 *
 * @param instance - The React test instance to snapshot
 * @returns A cleaned JSON representation suitable for snapshots
 */
export function instanceToSnapshot(instance: TestInstance): Record<string, unknown> {
  const extractProps = (inst: TestInstance): Record<string, unknown> => {
    const cleanedProps: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(inst.props)) {
      // Skip excluded properties
      if (SNAPSHOT_EXCLUDED_PROPS.includes(key as (typeof SNAPSHOT_EXCLUDED_PROPS)[number])) {
        continue;
      }

      // Skip function props
      if (typeof value === 'function') {
        continue;
      }

      cleanedProps[key] = value;
    }

    return cleanedProps;
  };

  return {
    type: instance.type,
    props: extractProps(instance),
  };
}
