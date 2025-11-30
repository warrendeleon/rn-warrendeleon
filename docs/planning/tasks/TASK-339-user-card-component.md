# TASK-339: Create UserCard Component

**Task ID**: TASK-339
**Title**: Create UserCard Component
**User Story**: [US-061](../stories/US-061-settings-account-section.md) - Settings Account Section
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: ✅ Done
**Priority**: Medium
**Effort**: 1 hour
**Owner**: Warren de Leon
**Created**: 2025-11-25

---

## Context

UserCard is a reusable component that displays user profile information (avatar, name, email). It's used in Settings to show the current user and can be reused elsewhere in the app.

**Design**:

```
┌─────────────────────────────────────────────┐
│  ┌────┐  Warren de Leon                  >  │
│  │ WD │  warren@example.com                 │
│  └────┘                                     │
└─────────────────────────────────────────────┘
```

---

## Objective

Create UserCard component that:

1. Displays user avatar (or initials fallback)
2. Shows full name
3. Shows email
4. Has chevron indicating it's tappable
5. Full EAA accessibility compliance

**Deliverable**: Reusable UserCard in shared components.

---

## Implementation Guide

### UserCard Component

Create `src/components/UserCard/UserCard.tsx`:

````typescript
import React, { useMemo } from 'react';

import { ChevronRightIcon, Icon } from '@gluestack-ui/themed';
import { Image, Pressable, Text, View } from 'react-native';

interface UserCardProps {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profilePicture?: string | null;
  onPress?: () => void;
  testID?: string;
}

/**
 * UserCard Component
 *
 * Displays user profile information with avatar, name, and email.
 * Used in Settings for account section.
 *
 * @example
 * ```tsx
 * <UserCard
 *   firstName="Warren"
 *   lastName="de Leon"
 *   email="warren@example.com"
 *   profilePicture={null}
 *   onPress={handleEditProfile}
 * />
 * ```
 */
export const UserCard: React.FC<UserCardProps> = ({
  firstName,
  lastName,
  email,
  profilePicture,
  onPress,
  testID = 'user-card',
}) => {
  const fullName = useMemo(() => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'User';
  }, [firstName, lastName]);

  const initials = useMemo(() => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }, [firstName, lastName]);

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Account for ${fullName}`}
      accessibilityHint="Opens account settings"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        minHeight: 72,
      }}
    >
      {/* Avatar */}
      {profilePicture ? (
        <Image
          source={{ uri: profilePicture }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
          }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#E5E5EA',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#8E8E93',
            }}
          >
            {initials}
          </Text>
        </View>
      )}

      {/* User Info */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
          }}
          numberOfLines={1}
        >
          {fullName}
        </Text>
        {email && (
          <Text
            style={{
              fontSize: 14,
              color: '#8E8E93',
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {email}
          </Text>
        )}
      </View>

      {/* Chevron */}
      {onPress && (
        <Icon as={ChevronRightIcon} size="md" color="$textLight400" />
      )}
    </Pressable>
  );
};
````

### Barrel Export

Create `src/components/UserCard/index.ts`:

```typescript
export { UserCard } from './UserCard';
```

### Update Components Export

Update `src/components/index.ts`:

```typescript
export { UserCard } from './UserCard';
```

---

## File Structure

```
src/components/
├── UserCard/
│   ├── UserCard.tsx             # Component
│   ├── index.ts                 # Barrel export
│   └── __tests__/
│       └── UserCard.rntl.tsx    # Unit tests (TASK-341)
└── index.ts                     # Updated exports
```

---

## Acceptance Criteria

- [x] UserCard component created
- [x] Displays profile picture when provided
- [x] Shows initials avatar as fallback
- [x] Displays full name (handles missing first/last)
- [x] Displays email when provided
- [x] Shows chevron when onPress provided
- [x] EAA compliant with accessibility props
- [x] Exported from components barrel

---

**Estimated Time**: 1 hour
**Completed**: 2025-11-30
**Last Updated**: 2025-11-30
