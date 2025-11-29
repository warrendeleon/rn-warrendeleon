# TASK-340: Create EditAccountScreen

**Task ID**: TASK-340
**Title**: Create EditAccountScreen
**User Story**: [US-061](../stories/US-061-settings-account-section.md) - Settings Account Section
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: ⏳ In Progress
**Priority**: Medium
**Effort**: 3 hours
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-339

---

## Context

EditAccountScreen allows users to edit their profile information (first name, last name). Email changes and password changes are more complex operations that will be handled in separate tickets within EPIC-023 (Security Settings).

**Scope for this task**:

- Edit first name
- Edit last name
- Save changes to EncryptedStore and Redux

**Out of scope (future tasks)**:

- Change email (requires password verification)
- Change password (EPIC-023)
- Profile picture (TASK-197)
- Delete account

---

## Objective

Create EditAccountScreen that:

1. Displays current user info in form
2. Allows editing first name and last name
3. Validates with Yup schema
4. Saves changes to EncryptedStore and Redux
5. Full EAA accessibility compliance

**Deliverable**: EditAccountScreen in Account feature.

---

## Implementation Guide

### Create Account Feature

Create `src/features/Account/EditAccountScreen.tsx`:

```typescript
import React, { useCallback } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import * as yup from 'yup';

import { Button, ButtonText, FormControl, FormControlLabel, Input, InputField } from '@gluestack-ui/themed';
import { selectUser, updateUserProfile } from '@app/features/Auth';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';

interface EditAccountFormData {
  firstName: string;
  lastName: string;
}

const editAccountSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
});

export const EditAccountScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditAccountFormData>({
    resolver: yupResolver(editAccountSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const onSubmit = useCallback(
    async (data: EditAccountFormData) => {
      // Update EncryptedStore
      await EncryptedStore.set(EncryptedStoreKey.USER_FIRST_NAME, data.firstName);
      await EncryptedStore.set(EncryptedStoreKey.USER_LAST_NAME, data.lastName);

      // Update Redux state
      dispatch(
        updateUserProfile({
          firstName: data.firstName,
          lastName: data.lastName,
        })
      );

      // Navigate back
      navigation.goBack();
    },
    [dispatch, navigation]
  );

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* First Name */}
      <FormControl isInvalid={!!errors.firstName} style={{ marginBottom: 16 }}>
        <FormControlLabel>
          <Text>{t('account.firstName')}</Text>
        </FormControlLabel>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder={t('account.firstNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                accessibilityLabel={t('account.firstName')}
                testID="first-name-input"
              />
            </Input>
          )}
        />
        {errors.firstName && (
          <Text style={{ color: 'red', marginTop: 4 }}>
            {errors.firstName.message}
          </Text>
        )}
      </FormControl>

      {/* Last Name */}
      <FormControl isInvalid={!!errors.lastName} style={{ marginBottom: 24 }}>
        <FormControlLabel>
          <Text>{t('account.lastName')}</Text>
        </FormControlLabel>
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder={t('account.lastNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                accessibilityLabel={t('account.lastName')}
                testID="last-name-input"
              />
            </Input>
          )}
        />
        {errors.lastName && (
          <Text style={{ color: 'red', marginTop: 4 }}>
            {errors.lastName.message}
          </Text>
        )}
      </FormControl>

      {/* Save Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        isDisabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={t('account.save')}
        accessibilityHint="Saves your account changes"
        testID="save-button"
      >
        <ButtonText>
          {isSubmitting ? t('common.saving') : t('account.save')}
        </ButtonText>
      </Button>
    </ScrollView>
  );
};
```

### Barrel Export

Create `src/features/Account/index.ts`:

```typescript
export { EditAccountScreen } from './EditAccountScreen';
```

### Add Navigation Route

Update `src/navigation/RootNavigator/RootNavigator.tsx`:

```typescript
import { EditAccountScreen } from '@app/features/Account';

// In navigator
<Stack.Screen
  name="EditAccount"
  component={EditAccountScreen}
  options={{ title: t('account.editAccount') }}
/>
```

### Add i18n Translations

```json
{
  "account": {
    "firstName": "First Name",
    "firstNamePlaceholder": "Enter your first name",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Enter your last name",
    "save": "Save Changes",
    "editAccount": "Edit Account"
  },
  "common": {
    "saving": "Saving..."
  }
}
```

---

## File Structure

```
src/features/Account/
├── EditAccountScreen.tsx        # Edit account form
├── index.ts                     # Feature exports
└── __tests__/
    └── EditAccountScreen.rntl.tsx # Unit tests
```

---

## Acceptance Criteria

- [ ] EditAccountScreen created in Account feature
- [ ] Form pre-populated with current user data
- [ ] First name and last name editable
- [ ] Yup validation working
- [ ] Saves to EncryptedStore on submit
- [ ] Updates Redux state on submit
- [ ] Navigates back after save
- [ ] Navigation route added
- [ ] i18n translations for all languages
- [ ] EAA accessibility compliance

---

**Estimated Time**: 3 hours
**Last Updated**: 2025-11-25
