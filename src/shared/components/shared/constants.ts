import type { GroupVariant } from './types';

/**
 * Maps group variants to their corresponding border radius values
 */
export const groupVariantRadius: Record<GroupVariant, { top: string; bottom: string }> = {
  single: { top: '$2xl', bottom: '$2xl' },
  top: { top: '$2xl', bottom: '$none' },
  middle: { top: '$none', bottom: '$none' },
  bottom: { top: '$none', bottom: '$2xl' },
};
