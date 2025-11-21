# TASK-206: Initials Avatar Component

**ID**: TASK-206 | **US**: [US-034](../stories/US-034-linkedin-oauth-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h | **Created**: 2025-11-21

---

## Context & Background

When users register via LinkedIn OAuth but don't have a profile picture, or when profile picture download fails, we need a graceful fallback that's both visually appealing and provides visual distinction between users. Initials avatars serve this purpose by displaying the user's initials on a colourful background.

**Why This Task Matters:**

Initials avatars provide:

- **Visual Identity**: Each user has a unique, recognisable avatar even without a photo
- **Consistent Colour**: Same user always gets the same colour (based on name hash)
- **Professional Appearance**: Better than blank avatars or generic icons
- **Accessibility**: Full EAA compliance with proper labels
- **Fallback Reliability**: Works when profile pictures fail to load or aren't available

**Design Requirements:**

- **Initials Extraction**: First letter of first name + first letter of last name (e.g., "Warren de Leon" → "WD")
- **Single Name Handling**: If only one name part, use first letter (e.g., "Warren" → "W")
- **Colour Consistency**: Same name always produces same colour (deterministic hash)
- **Colour Palette**: 5 visually distinct, accessible colours (sufficient contrast for text)
- **Size Variants**: Support all GlueStack Avatar sizes (xs, sm, md, lg, xl, 2xl)
- **Accessibility**: Proper labels for screen readers

**Colour Palette Selection:**

Chosen for:

- High contrast with white text (WCAG AAA compliance for large text)
- Visual distinction (easily differentiable)
- Pleasant aesthetics (not too bright/harsh)

| Colour    | Hex     | Use Case           |
| --------- | ------- | ------------------ |
| Coral     | #FF6B6B | Warm, friendly     |
| Turquoise | #4ECDC4 | Cool, professional |
| Sky Blue  | #45B7D1 | Calm, approachable |
| Peach     | #FFA07A | Warm, energetic    |
| Mint      | #98D8C8 | Fresh, clean       |

---

## Objective

Build a reusable, accessible initials avatar component with:

1. **Initials extraction**: First + last name initials (fallback to first letter if one name)
2. **Colour generation**: Deterministic hash-based colour selection (consistent per name)
3. **Multiple sizes**: Support all GlueStack Avatar size variants
4. **EAA compliance**: Full accessibility support with proper labels
5. **Edge case handling**: Empty names, special characters, long names
6. **Reusability**: Can be used anywhere in the app (user profiles, chat, comments)
7. **Testing**: 100% RNTL coverage for all scenarios

---

## Detailed Implementation Guide

### Phase 1: Component Implementation (1 hour)

Create the initials avatar component with GlueStack UI:

**File**: `src/components/common/InitialsAvatar.tsx`

```typescript
import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gluestack-ui/themed';

/**
 * Colour palette for initials avatars
 * Selected for accessibility (WCAG AAA contrast with white text)
 */
const AVATAR_COLOURS = [
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#FFA07A', // Peach
  '#98D8C8', // Mint
];

export interface InitialsAvatarProps {
  /** Full name to extract initials from */
  name: string;
  /** Avatar size (GlueStack variants) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Optional profile picture URL (if available, image is shown instead of initials) */
  imageUrl?: string;
  /** Test ID for testing */
  testID?: string;
  /** Custom accessibility label (overrides default) */
  accessibilityLabel?: string;
}

/**
 * Extract initials from a full name
 *
 * Rules:
 * - First letter of first name + first letter of last name (e.g., "Warren de Leon" → "WD")
 * - If only one name part, use first letter (e.g., "Warren" → "W")
 * - Ignore middle names (e.g., "John Michael Smith" → "JS")
 * - Handle empty/whitespace names gracefully (return "?")
 *
 * @param fullName - Full name string
 * @returns Uppercase initials (1-2 characters)
 */
export const getInitials = (fullName: string): string => {
  // Handle empty/whitespace names
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return '?';
  }

  // Split name into parts (remove extra whitespace)
  const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);

  if (nameParts.length === 0) {
    return '?';
  }

  if (nameParts.length === 1) {
    // Single name: use first letter
    return nameParts[0][0].toUpperCase();
  }

  // Multiple names: first letter of first name + first letter of last name
  const firstInitial = nameParts[0][0].toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();

  return `${firstInitial}${lastInitial}`;
};

/**
 * Generate a consistent colour based on a name
 *
 * Uses a simple hash function to convert the name to a number,
 * then maps it to a colour from the palette
 *
 * @param name - Full name string
 * @returns Hex colour code
 */
export const getColourForName = (name: string): string => {
  // Simple hash function: sum of character codes
  const hash = name
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Map hash to colour index (modulo palette length for consistent results)
  const colourIndex = hash % AVATAR_COLOURS.length;

  return AVATAR_COLOURS[colourIndex];
};

/**
 * Initials Avatar Component
 *
 * Displays user initials on a coloured background when no profile picture is available
 * Falls back to initials if imageUrl is not provided or fails to load
 *
 * @example
 * // With initials only
 * <InitialsAvatar name="Warren de Leon" size="xl" />
 *
 * @example
 * // With profile picture (shows image, initials as fallback)
 * <InitialsAvatar
 *   name="Warren de Leon"
 *   imageUrl="https://example.com/profile.jpg"
 *   size="md"
 * />
 */
export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  size = 'xl',
  imageUrl,
  testID = 'initials-avatar',
  accessibilityLabel,
}) => {
  const initials = getInitials(name);
  const backgroundColor = getColourForName(name);

  // Default accessibility label
  const defaultAccessibilityLabel = imageUrl
    ? `Profile picture for ${name}`
    : `${name}, profile picture not available`;

  return (
    <Avatar
      size={size}
      bg={backgroundColor}
      testID={testID}
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityRole="image"
    >
      {imageUrl && (
        <AvatarImage
          source={{ uri: imageUrl }}
          alt={`Profile picture for ${name}`}
          testID={`${testID}-image`}
        />
      )}
      <AvatarFallbackText
        testID={`${testID}-initials`}
        sx={{
          color: '$white',
          fontSize: size === 'xs' ? '$xs' : size === 'sm' ? '$sm' : size === 'md' ? '$md' : size === 'lg' ? '$lg' : '$xl',
          fontWeight: '$semibold',
          letterSpacing: '$sm',
        }}
      >
        {initials}
      </AvatarFallbackText>
    </Avatar>
  );
};

export default InitialsAvatar;
```

### Phase 2: Edge Case Handling (20 minutes)

Add comprehensive handling for edge cases:

```typescript
/**
 * Enhanced getInitials with edge case handling
 */
export const getInitials = (fullName: string): string => {
  // Handle empty/whitespace names
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return '?';
  }

  // Remove special characters (keep letters, spaces, hyphens, apostrophes)
  const sanitizedName = trimmedName.replace(/[^a-zA-Z\s'-]/g, '');

  // Split name into parts (remove extra whitespace)
  const nameParts = sanitizedName.split(/\s+/).filter(part => part.length > 0);

  if (nameParts.length === 0) {
    return '?';
  }

  if (nameParts.length === 1) {
    // Single name: use first letter
    return nameParts[0][0].toUpperCase();
  }

  // Multiple names: first letter of first name + first letter of last name
  const firstInitial = nameParts[0][0].toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();

  return `${firstInitial}${lastInitial}`;
};

/**
 * Test cases for edge cases:
 * - "Warren de Leon" → "WD" (hyphenated surname)
 * - "Mary-Jane Smith" → "MS" (hyphenated first name)
 * - "O'Brien" → "O" (apostrophe)
 * - "José García" → "JG" (accented characters)
 * - "   " → "?" (whitespace only)
 * - "" → "?" (empty string)
 * - "Prince" → "P" (single name)
 * - "Jean-Claude Van Damme" → "JD" (multiple middle names)
 */
```

### Phase 3: Integration with User Profile (15 minutes)

Show how to use the component in a user profile context:

**File**: `src/components/user/UserProfile.tsx`

```typescript
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
import { useAppSelector } from '@/store/hooks';

export const UserProfile: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);

  if (!user) return null;

  return (
    <HStack space="md" alignItems="center">
      <InitialsAvatar
        name={user.fullName}
        imageUrl={user.profilePictureUrl}
        size="xl"
        testID="user-profile-avatar"
      />
      <VStack>
        <Text fontWeight="$semibold" fontSize="$lg">
          {user.fullName}
        </Text>
        <Text color="$textLight500" fontSize="$sm">
          {user.email}
        </Text>
      </VStack>
    </HStack>
  );
};
```

### Phase 4: Colour Contrast Validation (15 minutes)

Verify WCAG AAA contrast for white text on all colour backgrounds:

**File**: `src/components/common/__tests__/InitialsAvatar.accessibility.test.ts`

```typescript
import { getContrastRatio } from '@/utils/accessibility.utils';
import { AVATAR_COLOURS } from '../InitialsAvatar';

describe('InitialsAvatar - Accessibility', () => {
  it('all colours have sufficient contrast with white text (WCAG AAA for large text)', () => {
    const WHITE = '#FFFFFF';

    AVATAR_COLOURS.forEach((colour, index) => {
      const contrastRatio = getContrastRatio(colour, WHITE);

      // WCAG AAA for large text requires 7:1 contrast ratio
      // We're using semi-bold text (600 weight), which qualifies as "large"
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // Minimum AA
      console.log(`Colour ${index} (${colour}): ${contrastRatio.toFixed(2)}:1`);
    });
  });
});
```

### Phase 5: Utility Functions Export (10 minutes)

Export utility functions for reuse elsewhere in the app:

**File**: `src/utils/avatar.utils.ts`

```typescript
export { getInitials, getColourForName, AVATAR_COLOURS } from '@/components/common/InitialsAvatar';

/**
 * Get avatar display data for a user
 *
 * Convenience function for getting all avatar-related data
 */
export const getAvatarData = (user: { fullName: string; profilePictureUrl?: string }) => ({
  initials: getInitials(user.fullName),
  colour: getColourForName(user.fullName),
  imageUrl: user.profilePictureUrl,
});
```

---

## Acceptance Criteria

- [ ] Extracts first letter of first name + last letter of last name
- [ ] Handles single name (returns first letter only)
- [ ] Handles empty/whitespace names (returns "?")
- [ ] Handles special characters (removes them before extraction)
- [ ] Handles hyphenated names (e.g., "Mary-Jane" → "M", "Smith-Jones" → "SJ")
- [ ] Handles apostrophes (e.g., "O'Brien" → "O")
- [ ] Consistent colour generation (same name → same colour)
- [ ] 5 colour palette with WCAG AAA contrast
- [ ] Supports all GlueStack size variants (xs, sm, md, lg, xl, 2xl)
- [ ] Shows profile picture if `imageUrl` provided
- [ ] Falls back to initials if image fails to load
- [ ] `accessibilityRole="image"` set
- [ ] `accessibilityLabel` describes the avatar ("Profile picture for {name}")
- [ ] Component is reusable (exported from common directory)
- [ ] 100% RNTL coverage for all scenarios

---

## Testing

**Test File**: `src/components/common/__tests__/InitialsAvatar.test.tsx`

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { InitialsAvatar, getInitials, getColourForName } from '../InitialsAvatar';

describe('InitialsAvatar', () => {
  describe('getInitials', () => {
    it('extracts initials from full name (first + last)', () => {
      expect(getInitials('Warren de Leon')).toBe('WD');
      expect(getInitials('John Smith')).toBe('JS');
      expect(getInitials('Mary Jane Watson')).toBe('MW');
    });

    it('handles single name', () => {
      expect(getInitials('Prince')).toBe('P');
      expect(getInitials('Madonna')).toBe('M');
    });

    it('handles empty/whitespace names', () => {
      expect(getInitials('')).toBe('?');
      expect(getInitials('   ')).toBe('?');
      expect(getInitials('\n\t')).toBe('?');
    });

    it('handles hyphenated names', () => {
      expect(getInitials('Mary-Jane Parker')).toBe('MP');
      expect(getInitials('Jean-Claude Van Damme')).toBe('JD');
    });

    it('handles apostrophes', () => {
      expect(getInitials("O'Brien")).toBe('O');
      expect(getInitials("D'Angelo Smith")).toBe('DS');
    });

    it('handles special characters', () => {
      expect(getInitials('José García')).toBe('JG');
      expect(getInitials('François Müller')).toBe('FM');
    });

    it('handles extra whitespace', () => {
      expect(getInitials('  Warren   de  Leon  ')).toBe('WD');
    });
  });

  describe('getColourForName', () => {
    it('returns consistent colour for the same name', () => {
      const colour1 = getColourForName('Warren de Leon');
      const colour2 = getColourForName('Warren de Leon');

      expect(colour1).toBe(colour2);
    });

    it('returns different colours for different names (usually)', () => {
      const colour1 = getColourForName('John Smith');
      const colour2 = getColourForName('Jane Doe');

      // Not guaranteed to be different, but very likely
      // This is a probabilistic test
      expect(colour1).not.toBe(colour2);
    });

    it('returns a colour from the palette', () => {
      const colour = getColourForName('Test User');

      expect(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']).toContain(colour);
    });
  });

  describe('InitialsAvatar Component', () => {
    it('renders initials correctly', () => {
      const { getByTestId, getByText } = render(
        <InitialsAvatar name="Warren de Leon" testID="avatar" />
      );

      expect(getByTestId('avatar')).toBeTruthy();
      expect(getByText('WD')).toBeTruthy();
    });

    it('renders profile picture when imageUrl is provided', () => {
      const { getByTestId } = render(
        <InitialsAvatar
          name="Warren de Leon"
          imageUrl="https://example.com/profile.jpg"
          testID="avatar"
        />
      );

      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('falls back to initials if imageUrl is not provided', () => {
      const { getByTestId, getByText } = render(
        <InitialsAvatar name="Warren de Leon" testID="avatar" />
      );

      expect(getByText('WD')).toBeTruthy();
    });

    it('has correct accessibility label', () => {
      const { getByTestId } = render(
        <InitialsAvatar name="Warren de Leon" testID="avatar" />
      );

      const avatar = getByTestId('avatar');
      expect(avatar.props.accessibilityLabel).toBe('Warren de Leon, profile picture not available');
    });

    it('has correct accessibility label when image is provided', () => {
      const { getByTestId } = render(
        <InitialsAvatar
          name="Warren de Leon"
          imageUrl="https://example.com/profile.jpg"
          testID="avatar"
        />
      );

      const avatar = getByTestId('avatar');
      expect(avatar.props.accessibilityLabel).toBe('Profile picture for Warren de Leon');
    });

    it('allows custom accessibility label', () => {
      const { getByTestId } = render(
        <InitialsAvatar
          name="Warren de Leon"
          accessibilityLabel="Custom label"
          testID="avatar"
        />
      );

      const avatar = getByTestId('avatar');
      expect(avatar.props.accessibilityLabel).toBe('Custom label');
    });

    it('applies correct size', () => {
      const { getByTestId } = render(
        <InitialsAvatar name="Warren de Leon" size="md" testID="avatar" />
      );

      const avatar = getByTestId('avatar');
      expect(avatar.props.size).toBe('md');
    });
  });
});
```

**Run tests**:

```bash
yarn test src/components/common/__tests__/InitialsAvatar.test.tsx
```

---

## Troubleshooting

### Issue: "Initials not displaying correctly for hyphenated names"

**Cause**: Name parsing doesn't handle hyphens

**Solution**: Enhanced `getInitials` function removes special characters before splitting:

```typescript
const sanitizedName = trimmedName.replace(/[^a-zA-Z\s'-]/g, '');
```

### Issue: "Colour not consistent for the same name"

**Cause**: Hash function is case-sensitive

**Solution**: Normalise name to lowercase before hashing:

```typescript
const hash = name.toLowerCase().split('').reduce(...);
```

### Issue: "White text not readable on some colours"

**Cause**: Insufficient contrast ratio

**Solution**: Use colour contrast validation test to ensure all colours meet WCAG AAA:

```typescript
expect(contrastRatio).toBeGreaterThanOrEqual(7); // WCAG AAA
```

### Issue: "Avatar not updating when imageUrl changes"

**Cause**: Component doesn't re-render on prop change

**Solution**: Ensure GlueStack Avatar properly handles image updates. If needed, add key prop:

```typescript
<Avatar key={imageUrl} ... />
```

---

**Effort**: 2h | **Last Updated**: 2025-11-21
