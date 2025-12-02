import type { GroupVariant } from './types';

/**
 * Pure function to calculate the groupVariant for a button based on its position.
 * Exported for testing purposes.
 *
 * @param index - Zero-based index of the button in the group
 * @param total - Total number of buttons in the group
 * @returns The appropriate GroupVariant for the button's position
 */
export const getButtonGroupVariant = (index: number, total: number): GroupVariant => {
  if (total === 1) return 'single';
  if (index === 0) return 'top';
  if (index === total - 1) return 'bottom';
  return 'middle';
};
