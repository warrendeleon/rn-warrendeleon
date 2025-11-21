# TASK-199: Registration Screen UI

**Task ID**: TASK-199 | **Title**: Registration Screen UI (React Hook Form + GlueStack)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: Critical | **Effort**: 4h | **Created**: 2025-11-21

---

## Objective

Build registration screen with email/password/name fields, profile picture picker, form validation (Yup + React Hook Form), submit to Supabase Auth, navigate to email verification.

## Implementation

`src/screens/auth/RegistrationScreen.tsx`:

```typescript
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { VStack, FormControl, Input, Button } from '@gluestack-ui/themed';
import { registrationSchema } from '@/validation/schemas/registrationSchema';
import { ProfilePicturePicker } from '@/components/auth/ProfilePicturePicker';
import { useAppDispatch } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';

export const RegistrationScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const [profilePicture, setProfilePicture] = React.useState<string | null>(null);

  const onSubmit = async (data) => {
    // Upload profile picture
    const pictureUrl = await supabaseStorageClient.uploadProfilePicture(profilePicture);

    // Register user
    await dispatch(register({ ...data, profilePicture: pictureUrl })).unwrap();

    // Navigate to email verification
    navigation.navigate('EmailVerification');
  };

  return (
    <VStack space="lg" className="p-6">
      <ProfilePicturePicker
        onImageSelected={setProfilePicture}
        testID="profile-picture-picker"
      />

      <FormControl isInvalid={!!errors.email}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input>
              <InputField {...field} placeholder="Email" testID="email-input" />
            </Input>
          )}
        />
        {errors.email && <FormControlErrorText>{errors.email.message}</FormControlErrorText>}
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input>
              <InputField {...field} placeholder="Password" secureTextEntry testID="password-input" />
            </Input>
          )}
        />
        {errors.password && <FormControlErrorText>{errors.password.message}</FormControlErrorText>}
      </FormControl>

      <Button onPress={handleSubmit(onSubmit)} isDisabled={isSubmitting || !profilePicture} testID="register-button">
        <ButtonText>Register</ButtonText>
      </Button>
    </VStack>
  );
};
```

## Acceptance Criteria

- [ ] Email, password, confirm password, full name fields
- [ ] Profile picture picker (required)
- [ ] Real-time validation on blur
- [ ] Error messages below fields
- [ ] Submit disabled if invalid or no picture
- [ ] Loading state during submission
- [ ] Navigate to EmailVerification on success
- [ ] EAA compliance (labels, hints, touch targets)
- [ ] 100% RNTL coverage

**Estimated Time**: 4 hours | **Last Updated**: 2025-11-21
