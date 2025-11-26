# TASK-338: Add Account Section to SettingsScreen

**Task ID**: TASK-338
**Title**: Add Account Section to SettingsScreen
**User Story**: [US-061](../stories/US-061-settings-account-section.md) - Settings Account Section
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: 📋 To Do
**Priority**: High
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: US-060 (Auth Navigation Foundation)

---

## Context

Add an Account section to the existing SettingsScreen. This section displays differently based on authentication status:

- **Authenticated**: UserCard + Sign Out button
- **Not Authenticated**: Sign In button

Follows iOS standard pattern of having account management at the top of Settings.

---

## Objective

Modify SettingsScreen to:

1. Add Account section at top
2. Show UserCard when authenticated
3. Show Sign Out button when authenticated
4. Show Sign In button when not authenticated
5. Handle sign out action
6. Add i18n translations

**Deliverable**: SettingsScreen with functional Account section.

---

## Implementation Guide

### Update SettingsScreen

Modify `src/features/Settings/SettingsScreen.tsx`:

```typescript
import React, { useCallback } from 'react';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { UserCard } from '@app/components';
import { useAuth, logout, selectUser } from '@app/features/Auth';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';

// ... existing imports

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const user = useAppSelector(selectUser);

  const handleSignOut = useCallback(async () => {
    await dispatch(logout());
    navigation.navigate('Home');
  }, [dispatch, navigation]);

  const handleSignIn = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleEditAccount = useCallback(() => {
    navigation.navigate('EditAccount');
  }, [navigation]);

  return (
    <ScrollView>
      {/* Account Section */}
      <SettingsGroup header={t('settings.account.title')}>
        {isAuthenticated && user ? (
          <>
            <UserCard
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              profilePicture={user.profilePicture}
              onPress={handleEditAccount}
            />
            <SettingsItem
              label={t('settings.account.signOut')}
              onPress={handleSignOut}
              variant="destructive"
              accessibilityLabel={t('settings.account.signOut')}
              accessibilityHint="Signs you out of your account"
            />
          </>
        ) : (
          <SettingsItem
            label={t('settings.account.signIn')}
            onPress={handleSignIn}
            accessibilityLabel={t('settings.account.signIn')}
            accessibilityHint="Opens the login screen"
          />
        )}
      </SettingsGroup>

      {/* General Section (existing) */}
      <SettingsGroup header={t('settings.general.title')}>
        {/* ... existing Appearance and Language items */}
      </SettingsGroup>
    </ScrollView>
  );
};
```

### Add Destructive Variant to SettingsItem

The Sign Out button needs a destructive (red) styling variant.

### Add i18n Translations

Update all locale files (`en.json`, `es.json`, `ca.json`, `pl.json`, `tl.json`):

```json
{
  "settings": {
    "account": {
      "title": "Account",
      "signIn": "Sign In / Create Account",
      "signOut": "Sign Out",
      "editAccount": "Edit Account"
    },
    "general": {
      "title": "General"
    }
  }
}
```

---

## Acceptance Criteria

- [ ] Account section appears at top of Settings
- [ ] UserCard shows when authenticated
- [ ] Sign Out button shows when authenticated
- [ ] Sign Out is styled as destructive (red text)
- [ ] Sign Out dispatches logout and navigates to Home
- [ ] Sign In button shows when not authenticated
- [ ] Sign In navigates to Login screen
- [ ] All i18n translations added
- [ ] EAA accessibility props on all interactive elements

---

**Estimated Time**: 2 hours
**Last Updated**: 2025-11-25
