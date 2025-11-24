# TASK-219: Magic Link API Integration

## File Structure

```
src/features/Auth/
├── api/
│   └── api.ts              # Add sendMagicLink + verifyMagicLink methods
└── store/
    └── actions.ts          # Add magicLinkLogin action
```

**Note**: Magic Link API methods co-located with Auth feature API following feature-first architecture (established in TASK-196).

# TASK-219: Magic Link API Integration (Original Content)

**ID**: TASK-219 | **Title**: Integrate Supabase Magic Link API and Deep Link Handler
**User Story**: [US-037](../stories/US-037-magic-link-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

Magic Link authentication requires two components:

1. **Email Sending**: API call to Supabase to send magic link email
2. **Deep Link Handling**: Capture callback when user taps link, extract tokens, store them

**Magic Link Flow**:

```
User enters email → Tap "Send Magic Link"
  → POST /auth/v1/magiclink (Supabase)
  → Supabase sends email with link
  → User taps link in email
  → Link: https://PROJECT_ID.supabase.co/auth/v1/verify?token=TOKEN&type=magiclink&redirect_to=warrendeleon://login
  → Browser redirects to: warrendeleon://login?access_token=TOKEN&refresh_token=TOKEN&type=magiclink
  → App opens (or comes to foreground)
  → Deep link handler captures URL
  → Extract access_token + refresh_token
  → Store in Keychain
  → Update Redux
  → Navigate to Home
```

---

## Objective

Implement:

1. Magic link sending API function
2. Deep link URL scheme registration (iOS + Android)
3. Deep link handler (LoginCallbackScreen)
4. Token extraction and validation
5. Token storage in Keychain
6. Navigation to Home on success

---

## Detailed Implementation Guide

### Phase 1: Magic Link API Function (25 minutes)

**File**: `src/api/auth/magicLink.ts`

**Code**:

```typescript
// src/api/auth/magicLink.ts
import { apiClient } from '../client';
import { z } from 'zod';

const magicLinkResponseSchema = z
  .object({
    // Supabase returns empty object on success (intentional)
  })
  .optional();

export class MagicLinkError extends Error {
  constructor(
    public code: string,
    public description: string,
    public statusCode?: number
  ) {
    super(description);
    this.name = 'MagicLinkError';
  }
}

export const sendMagicLink = async (email: string): Promise<void> => {
  try {
    const response = await apiClient.post('/auth/v1/magiclink', {
      email,
      redirectTo: 'warrendeleon://login',
    });

    console.log('[MagicLink] Magic link sent successfully to:', email);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;

      if (status === 429) {
        throw new MagicLinkError(
          'rate_limit_exceeded',
          'Too many requests. Please wait 60 seconds.',
          429
        );
      } else if (status === 404) {
        throw new MagicLinkError(
          'email_not_found',
          'Email address not found. Please register first.',
          404
        );
      } else {
        throw new MagicLinkError(
          'unknown_error',
          'An unexpected error occurred. Please try again.',
          status
        );
      }
    } else if (error.request) {
      throw new MagicLinkError('network_error', 'Network error. Please try again.', 0);
    } else {
      throw new MagicLinkError('unknown_error', error.message || 'An unexpected error occurred', 0);
    }
  }
};
```

**Test File**:

```typescript
// src/api/auth/__tests__/magicLink.test.ts
import { sendMagicLink, MagicLinkError } from '../magicLink';
import { apiClient } from '../../client';

jest.mock('../../client');

describe('sendMagicLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send magic link successfully', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });

    await expect(sendMagicLink('user@example.com')).resolves.not.toThrow();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/v1/magiclink', {
      email: 'user@example.com',
      redirectTo: 'warrendeleon://login',
    });
  });

  it('should throw MagicLinkError on rate limit (429)', async () => {
    const mockError = {
      response: { status: 429, data: { error: 'rate_limit_exceeded' } },
    };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(sendMagicLink('user@example.com')).rejects.toThrow(MagicLinkError);
  });

  it('should throw MagicLinkError on email not found (404)', async () => {
    const mockError = {
      response: { status: 404, data: { error: 'email_not_found' } },
    };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(sendMagicLink('notfound@example.com')).rejects.toThrow(MagicLinkError);
  });

  it('should throw MagicLinkError on network error', async () => {
    const mockError = { request: {}, message: 'Network Error' };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(sendMagicLink('user@example.com')).rejects.toThrow(MagicLinkError);
  });
});
```

---

### Phase 2: Deep Link URL Scheme Registration (20 minutes)

**iOS Configuration** (`ios/warrendeleon/Info.plist`):

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>warrendeleon</string>
    </array>
    <key>CFBundleURLName</key>
    <string>com.warrendeleon.app</string>
  </dict>
</array>
```

**Android Configuration** (`android/app/src/main/AndroidManifest.xml`):

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">

  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="warrendeleon" android:host="login" />
  </intent-filter>
</activity>
```

**Verification**:

```bash
# iOS - Test deep link
xcrun simctl openurl booted "warrendeleon://login?access_token=test&refresh_token=test&type=magiclink"

# Android - Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "warrendeleon://login?access_token=test&refresh_token=test&type=magiclink"
```

---

### Phase 3: LoginCallbackScreen Component (35 minutes)

**File**: `src/screens/auth/LoginCallbackScreen.tsx`

**Code**:

```typescript
// src/screens/auth/LoginCallbackScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import { storeTokens } from '../../utils/tokenStorage';
import { setUser, setAuthenticated } from '../../store/auth/authSlice';
import EncryptedStorage from 'react-native-encrypted-storage';

// Zod schema for URL parameters
const urlParamsSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  type: z.literal('magiclink'),
});

export const LoginCallbackScreen: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    handleDeepLink();
  }, []);

  const handleDeepLink = async () => {
    try {
      // Get initial URL (if app was closed and opened via deep link)
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl) {
        await processDeepLink(initialUrl);
      } else {
        // Listen for deep links (if app was already open)
        const subscription = Linking.addEventListener('url', ({ url }) => {
          processDeepLink(url);
        });

        return () => subscription.remove();
      }
    } catch (err) {
      console.error('[LoginCallback] Error handling deep link:', err);
      setError('Invalid login link. Please try again.');
    }
  };

  const processDeepLink = async (url: string) => {
    try {
      console.log('[LoginCallback] Processing deep link:', url);

      // Parse URL parameters
      const params = parseURLParams(url);

      // Validate with Zod
      const validation = urlParamsSchema.safeParse(params);

      if (!validation.success) {
        console.error('[LoginCallback] Invalid URL parameters:', validation.error);
        setError('Invalid login link. Please request a new one.');
        return;
      }

      const { access_token, refresh_token } = validation.data;

      // Store tokens in Keychain
      await storeTokens(access_token, refresh_token);

      // Decode user info from access token (JWT)
      const userInfo = decodeJWT(access_token);

      // Store user metadata in Encrypted Storage
      await EncryptedStorage.setItem(
        'user_metadata',
        JSON.stringify({
          id: userInfo.sub,
          email: userInfo.email,
        })
      );

      // Update Redux state
      dispatch(setUser({
        id: userInfo.sub,
        email: userInfo.email,
      }));
      dispatch(setAuthenticated(true));

      // Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      console.error('[LoginCallback] Error processing deep link:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const parseURLParams = (url: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const urlObj = new URL(url);

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  };

  const decodeJWT = (token: string): { sub: string; email?: string } => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Failed to decode JWT');
    }
  };

  return (
    <SafeAreaView testID="login-callback-screen" className="flex-1 bg-white justify-center items-center">
      {error ? (
        <View className="items-center px-6">
          <Text className="text-error-700 text-center text-lg mb-4">{error}</Text>
          <Button onPress={() => navigation.navigate('Login')}>
            <ButtonText>Back to Login</ButtonText>
          </Button>
        </View>
      ) : (
        <View className="items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-600">Logging you in...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};
```

---

### Phase 4: Integrate API into MagicLinkTab (15 minutes)

**File**: Update `src/components/auth/MagicLinkTab.tsx`

**Code**:

```typescript
// src/components/auth/MagicLinkTab.tsx (updated)
import { sendMagicLink, MagicLinkError } from '../../api/auth/magicLink';

export const MagicLinkTab: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: MagicLinkFormData) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await sendMagicLink(data.email);

      setSuccessMessage(`Check your email! We've sent you a magic link to ${data.email}.`);
      startResendCountdown();
    } catch (err) {
      if (err instanceof MagicLinkError) {
        switch (err.code) {
          case 'rate_limit_exceeded':
            setError('Too many requests. Please wait 60 seconds.');
            break;
          case 'email_not_found':
            setError('Email address not found. Please register first.');
            break;
          case 'network_error':
            setError('Network error. Please check your connection.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('[MagicLink] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View testID="magic-link-tab">
      {/* Error Message */}
      {error && (
        <View className="bg-error-100 p-4 rounded-lg mb-4" accessibilityLiveRegion="assertive">
          <Text className="text-error-700 text-sm" testID="magiclink-error">
            {error}
          </Text>
        </View>
      )}

      {/* ... rest of component ... */}
    </View>
  );
};
```

---

### Phase 5: Add LoginCallbackScreen to Navigation (10 minutes)

**File**: Update navigation stack

**Code**:

```typescript
// src/navigation/UnauthenticatedStack.tsx
import { LoginCallbackScreen } from '../screens/auth/LoginCallbackScreen';

export const UnauthenticatedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="LoginCallback"
        component={LoginCallbackScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
```

---

## Acceptance Criteria

**Functional**:

- [ ] `sendMagicLink` API function works
- [ ] Deep link URL scheme registered (iOS + Android)
- [ ] LoginCallbackScreen handles deep links
- [ ] Tokens extracted from URL parameters
- [ ] Tokens stored in Keychain
- [ ] User metadata stored in Encrypted Storage
- [ ] Redux state updated
- [ ] Navigation to Home on success
- [ ] All error scenarios handled

**Error Handling**:

- [ ] Invalid URL → "Invalid login link"
- [ ] Expired link → "This login link has expired"
- [ ] Network error → "Network error. Please try again."
- [ ] Rate limit (429) → "Too many requests"
- [ ] Email not found (404) → "Email address not found"

**Security**:

- [ ] Tokens validated with Zod
- [ ] Tokens stored in hardware-backed Keychain
- [ ] JWT decoded safely

---

## Testing

### Manual Testing

1. Send magic link to email
2. Check email inbox
3. Tap magic link
4. Verify app opens (or comes to foreground)
5. Verify tokens stored in Keychain (check logs)
6. Verify navigation to Home

### Deep Link Testing

```bash
# iOS
xcrun simctl openurl booted "warrendeleon://login?access_token=eyJhbGci...&refresh_token=v1.MRjVvF...&type=magiclink"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "warrendeleon://login?access_token=eyJhbGci...&refresh_token=v1.MRjVvF...&type=magiclink"
```

---

## Troubleshooting

### Issue: Deep link not opening app

**iOS**: Check `Info.plist` has correct URL scheme.

**Android**: Check `AndroidManifest.xml` has intent-filter.

### Issue: "Invalid login link" error

**Cause**: URL parameters not parsed correctly.

**Debug**: Log URL parameters before validation.

---

## Definition of Done

- [ ] Magic link API function working
- [ ] Deep link URL scheme registered
- [ ] LoginCallbackScreen working
- [ ] Token extraction and storage working
- [ ] Navigation working
- [ ] All tests passing
- [ ] `yarn validate` passes

---

**Dependencies**:

- TASK-218 (Magic Link UI) complete

**Next Task**: [TASK-220](TASK-220-magic-link-rntl-tests.md) - Magic Link RNTL Tests

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2 hours
