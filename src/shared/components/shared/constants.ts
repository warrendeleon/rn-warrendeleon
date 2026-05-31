import type { GroupVariant } from './types';

/**
 * Maps group variants to their corner border radius values in px
 * ($2xl = 16, $none = 0), applied via style on the grouped items.
 */
export const groupVariantRadius: Record<GroupVariant, { top: number; bottom: number }> = {
  single: { top: 16, bottom: 16 },
  top: { top: 16, bottom: 0 },
  middle: { top: 0, bottom: 0 },
  bottom: { top: 0, bottom: 16 },
};
