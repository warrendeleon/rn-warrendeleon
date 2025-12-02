# US-042: Update Profile Picture

**ID**: US-042 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **Title**: Upload and Update Profile Picture
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 3 | **Effort**: 7.5h

---

## User Story

**As a** registered user
**I want to** upload and update my profile picture
**So that** I can personalize my account and make it more recognizable

---

## Acceptance Criteria

### Functional Requirements

1. **Image Selection**
   - [ ] User can select photo from gallery
   - [ ] User can take new photo with camera
   - [ ] User can remove existing profile picture (revert to initials avatar)
   - [ ] Image picker shows both "Camera" and "Gallery" options

2. **Image Processing**
   - [ ] Selected image is cropped to 1:1 aspect ratio (square)
   - [ ] Image is resized to 800×800px
   - [ ] Image is compressed to 80% JPEG quality
   - [ ] EXIF metadata is stripped (privacy)
   - [ ] Processing shows loading indicator

3. **Image Upload**
   - [ ] Image uploaded to Supabase Storage (`avatars` bucket)
   - [ ] Unique filename: `{userId}_{timestamp}.jpg`
   - [ ] Upload progress indicator shown (0-100%)
   - [ ] Max file size: 5MB (enforced client-side)
   - [ ] Old profile picture deleted from storage after successful upload

4. **Profile Update**
   - [ ] Profile picture URL updated in Supabase `profiles` table
   - [ ] URL stored in Encrypted Storage (local cache)
   - [ ] Redux state updated with new URL
   - [ ] Success message: "Profile picture updated successfully"
   - [ ] New picture visible immediately across app

5. **Fallback (Initials Avatar)**
   - [ ] If no profile picture: Show initials avatar
   - [ ] Initials: First letter of first name + first letter of last name
   - [ ] Background color: Hash-based (5-color palette for consistency)
   - [ ] Text color: White (4.5:1 contrast)

### Non-Functional Requirements

1. **Performance**
   - [ ] Image picker opens in <500ms
   - [ ] Image processing (crop, resize, compress): <2 seconds
   - [ ] Upload completes in <5 seconds (for 5MB file)

2. **Accessibility (EAA)**
   - [ ] Profile picture has `accessibilityLabel="Profile picture"`
   - [ ] Upload button has `accessibilityHint="Select or take a new photo"`
   - [ ] Progress indicator has `accessibilityLabel="Upload progress: 50%"`

3. **Testing**
   - [ ] 100% RNTL coverage for UpdateProfilePictureScreen
   - [ ] E2E test for complete upload flow
   - [ ] Manual testing on real devices (camera permissions)

---

## Technical Implementation

### Component Structure

```typescript
// src/features/Settings/screens/UpdateProfilePictureScreen.tsx

UpdateProfilePictureScreen
├── Header ("Profile Picture")
├── CurrentProfilePicture
│   ├── ProfileImage (current picture or initials avatar)
│   └── RemoveButton (if picture exists)
├── ActionButtons
│   ├── TakePhotoButton (Camera icon)
│   └── ChooseFromGalleryButton (Gallery icon)
├── LoadingIndicator (during processing)
└── UploadProgressBar (0-100%)
```

### Data Flow

```
User navigates to Settings → Profile → Profile Picture
  → UpdateProfilePictureScreen mounted
  → Display current profile picture (or initials avatar)
  → User taps "Take Photo" or "Choose from Gallery"
  → Request camera/photo library permissions
  → If denied: Show error, link to Settings app
  → If granted: Open image picker
  → User selects/captures image
  → Image picker returns image URI
  → Process image:
    → Crop to 1:1 aspect ratio
    → Resize to 800×800px
    → Compress to 80% JPEG quality
    → Strip EXIF metadata
  → Generate unique filename: {userId}_{timestamp}.jpg
  → Upload to Supabase Storage (avatars bucket)
  → Show progress bar (0% → 100%)
  → On success:
    → Get public URL from Supabase
    → Update Supabase profiles table (profile_picture_url)
    → Store URL in Encrypted Storage
    → Update Redux state
    → Delete old profile picture from storage
    → Show success message
  → On failure:
    → Show error message
    → Retry option
```

### Image Picker Integration

```typescript
// src/services/media/imagePickerService.ts

import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles permission via Info.plist
};

export const pickImageFromCamera = async (): Promise<string | null> => {
  const hasPermission = await requestCameraPermission();

  if (!hasPermission) {
    throw new Error('Camera permission denied');
  }

  const response: ImagePickerResponse = await launchCamera({
    mediaType: 'photo',
    cameraType: 'front',
    quality: 1,
    saveToPhotos: false,
  });

  if (response.didCancel) {
    return null;
  }

  if (response.errorCode) {
    throw new Error(response.errorMessage || 'Failed to take photo');
  }

  return response.assets?.[0]?.uri || null;
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  const response: ImagePickerResponse = await launchImageLibrary({
    mediaType: 'photo',
    quality: 1,
    selectionLimit: 1,
  });

  if (response.didCancel) {
    return null;
  }

  if (response.errorCode) {
    throw new Error(response.errorMessage || 'Failed to select image');
  }

  return response.assets?.[0]?.uri || null;
};
```

### Image Processing

```typescript
// src/services/media/imageProcessingService.ts

import ImageResizer from 'react-native-image-resizer';
import { Platform } from 'react-native';

export const processImage = async (imageUri: string): Promise<string> => {
  try {
    // 1. Resize to 800×800px (maintain aspect ratio, then crop)
    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      800,
      800,
      'JPEG',
      80, // 80% quality
      0, // rotation
      undefined,
      false,
      {
        mode: 'cover', // Crop to fit
        onlyScaleDown: true,
      }
    );

    // 2. Return processed image URI
    return Platform.OS === 'ios' ? resizedImage.uri.replace('file://', '') : resizedImage.uri;
  } catch (error: any) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

export const stripEXIF = async (imageUri: string): Promise<string> => {
  // EXIF stripping is handled by ImageResizer when creating new image
  // The resized image automatically excludes EXIF metadata
  return imageUri;
};
```

### Supabase Storage Upload

```typescript
// src/services/storage/supabaseStorageService.ts

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';
import RNFS from 'react-native-fs';

const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);

export const uploadProfilePicture = async (
  userId: string,
  imageUri: string,
  onProgress: (progress: number) => void
): Promise<string> => {
  try {
    // 1. Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}.jpg`;

    // 2. Read file as base64
    const fileData = await RNFS.readFile(imageUri, 'base64');
    const fileBlob = new Blob([Buffer.from(fileData, 'base64')], { type: 'image/jpeg' });

    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage.from('avatars').upload(filename, fileBlob, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    // 4. Get public URL
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const deleteProfilePicture = async (imageUrl: string): Promise<void> => {
  try {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();

    if (!filename) {
      throw new Error('Invalid image URL');
    }

    const { error } = await supabase.storage.from('avatars').remove([filename]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('Failed to delete old profile picture:', error);
    // Don't throw - old picture deletion is not critical
  }
};
```

### Initials Avatar Component

```typescript
// src/components/profile/InitialsAvatar.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Box } from '@gluestack-ui/themed';

interface InitialsAvatarProps {
  firstName: string;
  lastName: string;
  size?: number;
  testID?: string;
}

const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
];

const getBackgroundColor = (firstName: string, lastName: string): string => {
  const hash = (firstName + lastName).split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
};

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  firstName,
  lastName,
  size = 100,
  testID = 'initials-avatar',
}) => {
  const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  const backgroundColor = getBackgroundColor(firstName, lastName);

  return (
    <Box
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor={backgroundColor}
      justifyContent="center"
      alignItems="center"
      testID={testID}
      accessibilityLabel={`${firstName} ${lastName}'s profile picture`}
    >
      <Text
        style={{
          fontSize: size * 0.4,
          fontWeight: '600',
          color: '#FFFFFF',
        }}
      >
        {initials}
      </Text>
    </Box>
  );
};
```

---

## Tasks Breakdown

| Task ID  | Description                   | Effort |
| -------- | ----------------------------- | ------ |
| TASK-243 | UpdateProfilePictureScreen UI | 1.5h   |
| TASK-244 | Image Picker Integration      | 1.5h   |
| TASK-245 | Image Processing              | 1.5h   |
| TASK-246 | Supabase Storage Upload       | 2h     |
| TASK-247 | Profile Picture RNTL Tests    | 1h     |

**Total**: 5 tasks, 7.5 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/features/Settings/screens/__tests__/UpdateProfilePictureScreen.rntl.tsx`

```typescript
describe('UpdateProfilePictureScreen', () => {
  it('should render current profile picture', () => {
    const mockUser = {
      profilePictureUrl: 'https://example.com/avatar.jpg',
    };

    const { getByTestId } = render(<UpdateProfilePictureScreen user={mockUser} />);

    expect(getByTestId('profile-picture-image')).toHaveProp(
      'source',
      { uri: 'https://example.com/avatar.jpg' }
    );
  });

  it('should render initials avatar when no profile picture', () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      profilePictureUrl: null,
    };

    const { getByTestId } = render(<UpdateProfilePictureScreen user={mockUser} />);

    expect(getByTestId('initials-avatar')).toHaveTextContent('JD');
  });

  it('should open image picker when "Take Photo" is tapped', async () => {
    mockImagePickerService.pickImageFromCamera.mockResolvedValue('file:///image.jpg');

    const { getByTestId } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('take-photo-button'));

    await waitFor(() => {
      expect(mockImagePickerService.pickImageFromCamera).toHaveBeenCalled();
    });
  });

  it('should process and upload selected image', async () => {
    mockImagePickerService.pickImageFromGallery.mockResolvedValue('file:///image.jpg');
    mockImageProcessingService.processImage.mockResolvedValue('file:///processed.jpg');
    mockSupabaseStorageService.uploadProfilePicture.mockResolvedValue('https://example.com/new-avatar.jpg');

    const { getByTestId } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('choose-from-gallery-button'));

    await waitFor(() => {
      expect(mockImageProcessingService.processImage).toHaveBeenCalledWith('file:///image.jpg');
      expect(mockSupabaseStorageService.uploadProfilePicture).toHaveBeenCalled();
    });
  });

  it('should show upload progress', async () => {
    mockSupabaseStorageService.uploadProfilePicture.mockImplementation((userId, imageUri, onProgress) => {
      onProgress(50); // Simulate 50% progress
      return Promise.resolve('https://example.com/avatar.jpg');
    });

    const { getByTestId } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('choose-from-gallery-button'));

    await waitFor(() => {
      expect(getByTestId('upload-progress-bar')).toHaveTextContent('50%');
    });
  });

  it('should delete old profile picture after upload', async () => {
    const mockUser = {
      profilePictureUrl: 'https://example.com/old-avatar.jpg',
    };

    mockSupabaseStorageService.uploadProfilePicture.mockResolvedValue('https://example.com/new-avatar.jpg');

    const { getByTestId } = render(<UpdateProfilePictureScreen user={mockUser} />);

    fireEvent.press(getByTestId('choose-from-gallery-button'));

    await waitFor(() => {
      expect(mockSupabaseStorageService.deleteProfilePicture).toHaveBeenCalledWith('https://example.com/old-avatar.jpg');
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `src/features/Settings/__tests__/UpdateProfilePicture/update-profile-picture.feature`

```gherkin
Feature: Update Profile Picture

  Background:
    Given I am logged in
    And I am on the Settings screen

  Scenario: Upload profile picture from gallery
    When I tap "Profile Picture"
    Then I should see the Update Profile Picture screen
    When I tap "Choose from Gallery"
    And I select an image from the gallery
    Then I should see the upload progress bar
    And I should see "Profile picture updated successfully"
    And the new profile picture should be visible

  Scenario: Remove profile picture
    Given I have a profile picture
    When I tap "Profile Picture"
    And I tap "Remove Picture"
    Then I should see my initials avatar
    And I should see "Profile picture removed"

  Scenario: Camera permission denied
    When I tap "Profile Picture"
    And I tap "Take Photo"
    And camera permission is denied
    Then I should see "Camera permission denied"
    And I should see "Open Settings" button
```

---

## Dependencies

**Upstream**:

- EPIC-021: Registration (user profile exists)
- Supabase Storage bucket `avatars` configured

**Downstream**:

- Profile picture visible across app (Home, Settings, Chat)

---

## Risks & Mitigation

| Risk                                 | Probability | Impact | Mitigation                                          |
| ------------------------------------ | ----------- | ------ | --------------------------------------------------- |
| Upload fails (network error)         | Medium      | Medium | Retry logic, local caching                          |
| Image processing slow on old devices | Low         | Medium | Optimize resize algorithm, background processing    |
| Camera/gallery permissions denied    | Medium      | Low    | Clear permission request messages, link to Settings |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Upload working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] Manual testing with real devices
- [ ] `yarn validate` passes

**Security**:

- [ ] EXIF metadata stripped
- [ ] Images stored in secure Supabase bucket
- [ ] Old pictures deleted after upload

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-023](../epics/EPIC-023-security-settings.md), [US-040](US-040-change-pin.md)
