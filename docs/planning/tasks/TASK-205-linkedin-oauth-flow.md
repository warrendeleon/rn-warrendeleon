# TASK-205: LinkedIn OAuth Flow Implementation

**ID**: TASK-205 | **US**: [US-034](../stories/US-034-linkedin-oauth-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 3h | **Created**: 2025-11-21

---

## Context & Background

LinkedIn OAuth 2.0 authentication allows users to register using their existing LinkedIn credentials. This implementation must follow OAuth 2.0 best practices with PKCE (Proof Key for Code Exchange) for enhanced security, extract user profile data automatically, and seamlessly integrate with our Supabase backend.

**Why This Task Matters:**

OAuth flows are complex, multi-step processes that involve:

- Browser-based authorization → redirect back to app → token exchange → profile fetching → account creation

Each step has potential failure points (network errors, user cancellation, token expiry, profile access denied). This task ensures a robust, secure implementation with proper error handling at every stage.

**OAuth 2.0 Flow with PKCE:**

1. **Generate code verifier + challenge** (PKCE security)
2. **Open LinkedIn authorization URL** in browser with challenge
3. **User approves** in LinkedIn (grants email, profile access)
4. **LinkedIn redirects back** to app with authorization code
5. **Exchange code for access token** (with code verifier)
6. **Fetch user profile** using access token
7. **Download profile picture** (if available)
8. **Upload picture to Supabase Storage**
9. **Create user account** via custom Supabase Auth REST API
10. **Store tokens in Keychain** and navigate to BiometricSetup

**Security Considerations:**

- **PKCE**: Prevents authorization code interception attacks
- **State parameter**: CSRF protection (verifies redirect authenticity)
- **HTTPS only**: All requests must use HTTPS
- **Token storage**: Access token stored in Keychain (never Redux or AsyncStorage)
- **Redirect URI validation**: Must match LinkedIn Developer App configuration

**LinkedIn API Endpoints:**

- Authorization: `https://www.linkedin.com/oauth/v2/authorization`
- Token exchange: `https://www.linkedin.com/oauth/v2/accessToken`
- User profile: `https://api.linkedin.com/v2/userinfo` (OpenID Connect)

---

## Objective

Implement complete, production-ready LinkedIn OAuth 2.0 flow with:

1. **PKCE implementation**: Code verifier + challenge for enhanced security
2. **State parameter validation**: CSRF protection
3. **Profile data extraction**: Email, full name, profile picture URL
4. **Automatic picture handling**: Download → resize (800×800) → compress (80%) → upload to Supabase
5. **Fallback to initials avatar**: If no picture available
6. **Error handling**: Comprehensive error handling for all OAuth steps
7. **Integration with Supabase**: Create user account via custom REST API
8. **Token management**: Store access token in Keychain
9. **Navigation**: Redirect to BiometricSetup screen on success
10. **Testing**: 100% unit test coverage for all flows

---

## Detailed Implementation Guide

### Phase 1: Dependencies Installation (10 minutes)

Install `react-native-app-auth` for OAuth flow handling:

```bash
yarn add react-native-app-auth

# iOS setup
cd ios && pod install && cd ..

# Android setup (update android/build.gradle)
# Already configured in TASK-189
```

### Phase 2: LinkedIn OAuth Configuration (15 minutes)

Create LinkedIn OAuth configuration with credentials from TASK-188:

**File**: `src/config/linkedin.config.ts`

```typescript
import { AuthConfiguration } from 'react-native-app-auth';

/**
 * LinkedIn OAuth 2.0 Configuration
 *
 * Credentials obtained from LinkedIn Developer Portal (TASK-188)
 * Redirect URI must match configuration in LinkedIn app settings
 */
export const linkedInAuthConfig: AuthConfiguration = {
  // LinkedIn Client ID (from TASK-188)
  clientId: process.env.LINKEDIN_CLIENT_ID!,

  // Redirect URI (configured in LinkedIn Developer Portal)
  // Format: {scheme}://{host}/callback
  // Example: warrendeleon://linkedin/callback
  redirectUrl: process.env.LINKEDIN_REDIRECT_URI!,

  // OAuth scopes (permissions requested from user)
  // 'openid' - Required for OpenID Connect
  // 'profile' - Access to name, profile picture
  // 'email' - Access to email address
  scopes: ['openid', 'profile', 'email'],

  // LinkedIn OAuth endpoints
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
  },

  // Use PKCE for enhanced security
  usePKCE: true,

  // Skip code exchange (we'll handle it manually for custom validation)
  skipCodeExchange: false,

  // Additional parameters
  additionalParameters: {
    // Force user to re-authenticate (optional, for testing)
    // prompt: 'login',
  },
};

// Validate configuration on app startup
if (!linkedInAuthConfig.clientId) {
  throw new Error('LINKEDIN_CLIENT_ID is not defined in environment variables');
}

if (!linkedInAuthConfig.redirectUrl) {
  throw new Error('LINKEDIN_REDIRECT_URI is not defined in environment variables');
}
```

**File**: `.env.development` and `.env.production`

```bash
# LinkedIn OAuth Credentials (from TASK-188)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_REDIRECT_URI=warrendeleon://linkedin/callback
```

### Phase 3: LinkedIn Auth Hook Implementation (1 hour)

Create comprehensive hook for LinkedIn OAuth flow:

**File**: `src/hooks/useLinkedInAuth.ts`

```typescript
import { useState, useCallback } from 'react';
import { authorize, AuthorizeResult } from 'react-native-app-auth';
import { linkedInAuthConfig } from '@/config/linkedin.config';
import { useAppDispatch } from '@/store/hooks';
import { registerWithLinkedIn } from '@/store/slices/authSlice';
import { downloadAndProcessImage } from '@/utils/image.utils';
import { uploadProfilePicture } from '@/services/supabase/storage.service';
import { SecureStore, SecureStoreKey } from '@/utils/secure-store';

interface LinkedInUserProfile {
  sub: string; // LinkedIn user ID
  name: string; // Full name
  given_name: string; // First name
  family_name: string; // Last name
  email: string; // Email address
  email_verified: boolean; // Email verification status
  picture?: string; // Profile picture URL (optional)
}

interface LinkedInAuthResult {
  success: boolean;
  userData: {
    email: string;
    fullName: string;
    profilePictureUrl?: string;
  };
}

export const useLinkedInAuth = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiate LinkedIn OAuth flow
   *
   * Steps:
   * 1. Open LinkedIn authorization page in browser
   * 2. User approves access
   * 3. LinkedIn redirects back with authorization code
   * 4. Exchange code for access token (handled by react-native-app-auth)
   * 5. Fetch user profile using access token
   * 6. Download and upload profile picture
   * 7. Create user account via Supabase
   * 8. Store tokens and navigate
   */
  const initiateLinkedInAuth = useCallback(async (): Promise<LinkedInAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Authorize with LinkedIn (opens browser, returns with access token)
      console.log('[LinkedIn OAuth] Starting authorization flow...');
      const authResult: AuthorizeResult = await authorize(linkedInAuthConfig);

      if (!authResult.accessToken) {
        throw new Error('Failed to obtain access token from LinkedIn');
      }

      console.log('[LinkedIn OAuth] Authorization successful, fetching profile...');

      // Step 2: Fetch LinkedIn user profile using access token
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authResult.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('[LinkedIn OAuth] Profile fetch failed:', errorText);
        throw new Error(`Failed to fetch LinkedIn profile: ${profileResponse.statusText}`);
      }

      const profileData: LinkedInUserProfile = await profileResponse.json();

      console.log('[LinkedIn OAuth] Profile fetched successfully:', {
        email: profileData.email,
        name: profileData.name,
        hasPicture: !!profileData.picture,
      });

      // Step 3: Validate required profile data
      if (!profileData.email) {
        throw new Error(
          'Email address not provided by LinkedIn. Please ensure email permission is granted.'
        );
      }

      if (!profileData.name) {
        throw new Error(
          'Name not provided by LinkedIn. Please ensure profile permission is granted.'
        );
      }

      // Step 4: Handle profile picture (if available)
      let profilePictureUrl: string | undefined;

      if (profileData.picture) {
        try {
          console.log('[LinkedIn OAuth] Downloading profile picture...');

          // Download and process image (resize to 800×800, compress to 80%)
          const processedImage = await downloadAndProcessImage(profileData.picture, {
            width: 800,
            height: 800,
            quality: 0.8,
            format: 'JPEG',
          });

          console.log('[LinkedIn OAuth] Uploading profile picture to Supabase Storage...');

          // Upload to Supabase Storage
          const uploadResult = await uploadProfilePicture({
            uri: processedImage.uri,
            fileName: `${profileData.sub}_linkedin_profile.jpg`,
            mimeType: 'image/jpeg',
          });

          profilePictureUrl = uploadResult.publicUrl;

          console.log('[LinkedIn OAuth] Profile picture uploaded successfully');
        } catch (imgError) {
          // Don't fail the entire flow if picture upload fails
          console.error('[LinkedIn OAuth] Failed to download/upload profile picture:', imgError);
          // profilePictureUrl will remain undefined, fallback to initials avatar
        }
      } else {
        console.log('[LinkedIn OAuth] No profile picture available, will use initials avatar');
      }

      // Step 5: Extract user data
      const userData = {
        email: profileData.email,
        fullName: profileData.name,
        profilePictureUrl,
      };

      // Step 6: Register user via Redux thunk (creates Supabase user account)
      console.log('[LinkedIn OAuth] Creating user account...');

      await dispatch(
        registerWithLinkedIn({
          email: userData.email,
          fullName: userData.fullName,
          profilePictureUrl: userData.profilePictureUrl,
          linkedInUserId: profileData.sub,
        })
      ).unwrap();

      console.log('[LinkedIn OAuth] User account created successfully');

      // Step 7: Store LinkedIn access token in Keychain (for future profile updates)
      await SecureStore.set(SecureStoreKey.LINKEDIN_ACCESS_TOKEN, authResult.accessToken);

      setIsLoading(false);

      return {
        success: true,
        userData,
      };
    } catch (err) {
      console.error('[LinkedIn OAuth] Error:', err);

      // Map errors to user-friendly messages
      let errorMessage = 'LinkedIn authentication failed. Please try again.';

      if (err instanceof Error) {
        if (err.message.includes('user_cancelled') || err.message.includes('User cancelled')) {
          errorMessage =
            'LinkedIn sign-in was cancelled. Please try again if you want to continue.';
        } else if (err.message.includes('network') || err.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('invalid_grant')) {
          errorMessage = 'LinkedIn authorization expired. Please try again.';
        } else if (err.message.includes('access_denied')) {
          errorMessage = 'Access denied. Please grant permissions to continue.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);

      throw new Error(errorMessage);
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    initiateLinkedInAuth,
    isLoading,
    error,
    clearError,
  };
};
```

### Phase 4: Image Download & Processing Utilities (30 minutes)

Create utilities for downloading and processing LinkedIn profile pictures:

**File**: `src/utils/image.utils.ts`

```typescript
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Platform } from 'react-native';

interface ImageProcessingOptions {
  width: number;
  height: number;
  quality: number; // 0.0 to 1.0
  format: 'JPEG' | 'PNG';
}

interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number; // File size in bytes
}

/**
 * Download image from URL and process it (resize, compress)
 *
 * @param imageUrl - Remote image URL (e.g., LinkedIn profile picture)
 * @param options - Processing options (dimensions, quality, format)
 * @returns Processed image with local file URI
 */
export const downloadAndProcessImage = async (
  imageUrl: string,
  options: ImageProcessingOptions
): Promise<ProcessedImage> => {
  try {
    // Step 1: Download image to temporary directory
    const tempImagePath = `${RNFS.TemporaryDirectoryPath}/temp_download_${Date.now()}.jpg`;

    console.log(`[Image Utils] Downloading image from: ${imageUrl}`);

    const downloadResult = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: tempImagePath,
    }).promise;

    if (downloadResult.statusCode !== 200) {
      throw new Error(`Failed to download image: HTTP ${downloadResult.statusCode}`);
    }

    console.log(`[Image Utils] Image downloaded to: ${tempImagePath}`);

    // Step 2: Get downloaded file info
    const fileInfo = await RNFS.stat(tempImagePath);
    console.log(`[Image Utils] Downloaded file size: ${fileInfo.size} bytes`);

    // Step 3: Resize and compress image
    console.log(
      `[Image Utils] Resizing to ${options.width}×${options.height}, quality: ${options.quality * 100}%`
    );

    const resizedImage = await ImageResizer.createResizedImage(
      tempImagePath,
      options.width,
      options.height,
      options.format,
      options.quality * 100, // ImageResizer expects 0-100
      0, // rotation
      undefined, // output path (auto-generated)
      false, // keep metadata? (no, strip EXIF for privacy)
      {
        mode: 'cover', // Crop to fill dimensions
        onlyScaleDown: true, // Don't upscale if image is smaller
      }
    );

    console.log(`[Image Utils] Image resized to: ${resizedImage.uri}`);
    console.log(`[Image Utils] Resized file size: ${resizedImage.size} bytes`);

    // Step 4: Clean up temporary download file
    await RNFS.unlink(tempImagePath);

    return {
      uri: Platform.OS === 'android' ? `file://${resizedImage.path}` : resizedImage.uri,
      width: resizedImage.width,
      height: resizedImage.height,
      size: resizedImage.size,
    };
  } catch (error) {
    console.error('[Image Utils] Failed to download and process image:', error);
    throw error;
  }
};

/**
 * Strip EXIF metadata from image for privacy
 * (Already handled by ImageResizer with keepMetadata: false)
 */
export const stripExifMetadata = async (imagePath: string): Promise<void> => {
  // ImageResizer with keepMetadata: false already strips EXIF
  // This is a placeholder for additional metadata stripping if needed
  console.log('[Image Utils] EXIF metadata stripped by ImageResizer');
};
```

### Phase 5: Redux Thunk for LinkedIn Registration (30 minutes)

Add LinkedIn registration thunk to auth slice:

**File**: `src/store/slices/authSlice.ts`

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabaseAuthClient } from '@/services/supabase/auth.service';
import { SecureStore, SecureStoreKey } from '@/utils/secure-store';

interface RegisterWithLinkedInPayload {
  email: string;
  fullName: string;
  profilePictureUrl?: string;
  linkedInUserId: string;
}

/**
 * Register user with LinkedIn OAuth
 *
 * Creates Supabase user account using LinkedIn profile data
 */
export const registerWithLinkedIn = createAsyncThunk(
  'auth/registerWithLinkedIn',
  async (payload: RegisterWithLinkedInPayload, { rejectWithValue }) => {
    try {
      // Create Supabase user account via custom REST API
      const response = await supabaseAuthClient.signUpWithLinkedIn({
        email: payload.email,
        fullName: payload.fullName,
        profilePictureUrl: payload.profilePictureUrl,
        linkedInUserId: payload.linkedInUserId,
      });

      // Store tokens in Keychain
      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, response.session.accessToken);
      await SecureStore.set(SecureStoreKey.REFRESH_TOKEN, response.session.refreshToken);

      // Return user data (NOT tokens - security best practice)
      return {
        id: response.user.id,
        email: response.user.email!,
        fullName: response.user.user_metadata.full_name,
        profilePictureUrl: response.user.user_metadata.profile_picture_url,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'LinkedIn registration failed'
      );
    }
  }
);

// Add to extraReducers in authSlice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(registerWithLinkedIn.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerWithLinkedIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerWithLinkedIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
```

### Phase 6: Error Handling & Validation (15 minutes)

Add comprehensive error handling:

```typescript
/**
 * LinkedIn OAuth error types and user-friendly messages
 */
export const getLinkedInErrorMessage = (error: Error | string): string => {
  const errorString = typeof error === 'string' ? error : error.message;

  // User cancelled OAuth flow
  if (errorString.includes('user_cancelled') || errorString.includes('User cancelled')) {
    return 'LinkedIn sign-in was cancelled. Please try again if you want to continue.';
  }

  // Network errors
  if (errorString.includes('network') || errorString.includes('Network request failed')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Token exchange errors
  if (errorString.includes('invalid_grant')) {
    return 'LinkedIn authorization expired or is invalid. Please try signing in again.';
  }

  // Access denied (user rejected permissions)
  if (errorString.includes('access_denied')) {
    return 'You must grant LinkedIn permissions to continue. Please try again and approve the requested permissions.';
  }

  // Email not available
  if (errorString.includes('email') && errorString.includes('not provided')) {
    return 'Email address is required. Please ensure your LinkedIn profile has an email address and grant email permission.';
  }

  // Profile fetch failed
  if (errorString.includes('Failed to fetch LinkedIn profile')) {
    return 'Unable to retrieve your LinkedIn profile. Please try again or contact support if the issue persists.';
  }

  // Generic error
  return 'Unable to sign in with LinkedIn. Please try again or use email registration.';
};
```

---

## Acceptance Criteria

- [ ] PKCE flow implemented (`usePKCE: true` in config)
- [ ] State parameter used for CSRF protection
- [ ] LinkedIn authorization opens in system browser
- [ ] User can approve/deny LinkedIn permissions
- [ ] Authorization code exchanged for access token
- [ ] User profile fetched from `https://api.linkedin.com/v2/userinfo`
- [ ] Email, name, and picture extracted from profile
- [ ] Profile picture downloaded and resized to 800×800
- [ ] Profile picture compressed to 80% JPEG quality
- [ ] EXIF metadata stripped from picture
- [ ] Picture uploaded to Supabase Storage
- [ ] Fallback to initials avatar if picture not available
- [ ] User account created via Supabase REST API
- [ ] Access token stored in Keychain (NOT Redux)
- [ ] Navigation to BiometricSetup screen on success
- [ ] Error handling for: user cancellation, network errors, token errors, profile fetch errors
- [ ] User-friendly error messages displayed
- [ ] 100% unit test coverage for hook and utilities

---

## Testing

**Test File**: `src/hooks/__tests__/useLinkedInAuth.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useLinkedInAuth } from '../useLinkedInAuth';
import { authorize } from 'react-native-app-auth';
import { downloadAndProcessImage } from '@/utils/image.utils';
import { uploadProfilePicture } from '@/services/supabase/storage.service';

jest.mock('react-native-app-auth');
jest.mock('@/utils/image.utils');
jest.mock('@/services/supabase/storage.service');
jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}));

describe('useLinkedInAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully completes LinkedIn OAuth flow', async () => {
    // Mock authorization
    (authorize as jest.Mock).mockResolvedValue({
      accessToken: 'test-access-token',
    });

    // Mock profile fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: 'linkedin-user-123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://linkedin.com/profile.jpg',
      }),
    });

    // Mock image processing
    (downloadAndProcessImage as jest.Mock).mockResolvedValue({
      uri: 'file://processed-image.jpg',
      width: 800,
      height: 800,
      size: 50000,
    });

    // Mock upload
    (uploadProfilePicture as jest.Mock).mockResolvedValue({
      publicUrl: 'https://supabase.co/storage/profile.jpg',
    });

    const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

    act(() => {
      result.current.initiateLinkedInAuth();
    });

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles user cancellation', async () => {
    (authorize as jest.Mock).mockRejectedValue(new Error('User cancelled flow'));

    const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

    act(() => {
      result.current.initiateLinkedInAuth();
    });

    await waitForNextUpdate();

    expect(result.current.error).toBe(
      'LinkedIn sign-in was cancelled. Please try again if you want to continue.'
    );
  });
});
```

---

## Troubleshooting

### Issue: "Redirect URI mismatch"

**Cause**: Redirect URI in app doesn't match LinkedIn Developer Portal configuration

**Solution**: Verify `LINKEDIN_REDIRECT_URI` matches exactly in both places:

```typescript
// Must match LinkedIn Developer Portal → Auth → Redirect URLs
LINKEDIN_REDIRECT_URI=warrendeleon://linkedin/callback
```

### Issue: "Failed to fetch LinkedIn profile"

**Cause**: Incorrect scopes or API permissions

**Solution**: Ensure scopes include `['openid', 'profile', 'email']`:

```typescript
scopes: ['openid', 'profile', 'email'],
```

### Issue: "Profile picture download fails"

**Cause**: LinkedIn picture URL expired or network error

**Solution**: Don't fail entire flow, fallback to initials avatar:

```typescript
try {
  profilePictureUrl = await downloadAndUploadPicture();
} catch (error) {
  console.error('Picture upload failed, using initials avatar');
  // Continue without picture
}
```

---

**Effort**: 3h | **Last Updated**: 2025-11-21
