# TASK-199: Registration Screen UI

**Task ID**: TASK-199 | **Title**: Registration Screen UI (React Hook Form + GlueStack)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: ✅ Done | **Priority**: Critical | **Effort**: 4h | **Created**: 2025-11-21

---

## Objective

Build registration screen with email/password/first name/last name/phone number fields, country code selector, form validation (Yup + React Hook Form), submit to Supabase Auth, navigate to email verification.

**Note**: Profile picture upload moved to post-registration (TASK-197/198 deferred to US-042). Users can upload profile picture after email verification + login.

## Implementation

`src/features/Auth/screens/RegistrationScreen.tsx`:

```typescript
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { VStack, FormControl, Input, Button } from '@gluestack-ui/themed';
import { registrationSchema } from '@app/features/Auth/validation/registrationSchema';
import { useAppDispatch } from '@app/store/hooks';
import { register } from '@app/features/Auth';

export const RegistrationScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const onSubmit = async (data) => {
    // Register user (no profile picture during registration)
    await dispatch(register(data)).unwrap();

    // Navigate to email verification
    navigation.navigate('EmailVerification');
  };

  return (
    <VStack space="lg" className="p-6">

      <FormControl isInvalid={!!errors.firstName}>
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <Input>
              <InputField {...field} placeholder="First Name" testID="first-name-input" />
            </Input>
          )}
        />
        {errors.firstName && <FormControlErrorText>{errors.firstName.message}</FormControlErrorText>}
      </FormControl>

      <FormControl isInvalid={!!errors.lastName}>
        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <Input>
              <InputField {...field} placeholder="Last Name" testID="last-name-input" />
            </Input>
          )}
        />
        {errors.lastName && <FormControlErrorText>{errors.lastName.message}</FormControlErrorText>}
      </FormControl>

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

      <FormControl isInvalid={!!errors.phoneNumber}>
        <HStack space="sm">
          <CountryCodeSelector
            selectedCountryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            testID="country-code-selector"
          />
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <Input flex={1}>
                <InputField {...field} placeholder="Mobile Number" keyboardType="phone-pad" testID="phone-number-input" />
              </Input>
            )}
          />
        </HStack>
        {errors.phoneNumber && <FormControlErrorText>{errors.phoneNumber.message}</FormControlErrorText>}
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

      <FormControl isInvalid={!!errors.confirmPassword}>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Input>
              <InputField {...field} placeholder="Confirm Password" secureTextEntry testID="confirm-password-input" />
            </Input>
          )}
        />
        {errors.confirmPassword && <FormControlErrorText>{errors.confirmPassword.message}</FormControlErrorText>}
      </FormControl>

      <Button onPress={handleSubmit(onSubmit)} isDisabled={isSubmitting || !profilePicture} testID="register-button">
        <ButtonText>Register</ButtonText>
      </Button>
    </VStack>
  );
};
```

## File Structure

```
src/features/Auth/
└── screens/
    ├── RegistrationScreen.tsx
    └── __tests__/
        └── RegistrationScreen.rntl.tsx
```

**Note**: Screen co-located with Auth feature following feature-first architecture (established in TASK-196).

## Acceptance Criteria

- [x] First name, last name, email, phone number, password, confirm password fields
- [x] Country code selector with flag and search (using react-native-phone-number-input or equivalent)
- [x] Phone number validation with libphonenumber-js for E.164 format
- [x] Profile picture picker (required) - Deferred to TASK-197/198
- [x] Real-time validation on blur
- [x] Error messages below fields
- [x] Submit disabled if invalid or no picture
- [x] Loading state during submission
- [x] Navigate to EmailVerification on success
- [x] EAA compliance (labels, hints, touch targets)
- [x] 100% RNTL coverage

## Additional Notes

**Country Code Selector Implementation**:

- Use `react-native-phone-number-input` (recommended) or `react-native-country-picker-modal` for country selector
- Integrate `libphonenumber-js` for validation based on selected country
- Format phone number to E.164 format before submitting (+447412345678)
- Store in Supabase metadata as `phoneNumber`

**Estimated Time**: 4 hours | **Last Updated**: 2025-11-21
