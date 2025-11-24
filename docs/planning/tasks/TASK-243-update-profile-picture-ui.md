# TASK-243: UpdateProfilePictureScreen UI Implementation

**ID**: TASK-243 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-042](../stories/US-042-update-profile-picture.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Auth/
├── screens/
│   ├── UpdateProfilePictureScreen.tsx
│   └── __tests__/
│       └── UpdateProfilePictureScreen.rntl.tsx
└── api/
    └── storage.ts                  # Profile picture upload (Supabase Storage)
```

**Note**: Profile picture management is Auth-specific user data functionality, co-located with Auth feature following feature-first architecture (established in TASK-196). Uses existing `storage.ts` from TASK-198.

---

## Task Description

Create the UpdateProfilePictureScreen component with current profile picture display, image picker integration, image preview, crop/resize controls, upload progress indicator, and success/error messaging. Support both camera capture and photo library selection.

---

## Acceptance Criteria

- [ ] UpdateProfilePictureScreen component created in `src/features/Auth/screens/UpdateProfilePictureScreen.tsx`
- [ ] Display current profile picture (avatar)
- [ ] "Take Photo" button (camera)
- [ ] "Choose from Library" button (photo library)
- [ ] Image preview after selection
- [ ] Crop/resize UI (optional but recommended)
- [ ] Upload button with progress indicator
- [ ] Success/error messaging
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Component Structure

```typescript
// src/features/Auth/screens/UpdateProfilePictureScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, Image } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Button,
  ButtonText,
  Text,
  Spinner,
  Avatar,
  AvatarImage,
  Progress,
  ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { selectUser } from '@app/features/Auth/store/selectors';
import { uploadProfilePicture } from '@app/features/Auth/api/storage';

export const UpdateProfilePictureScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    setErrorMessage(null);

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        cameraType: 'front',
        saveToPhotos: false,
      });

      handleImagePickerResponse(result);
    } catch (error: any) {
      console.error('Failed to launch camera:', error);
      setErrorMessage('Failed to open camera. Please try again.');
    }
  };

  const handleChooseFromLibrary = async () => {
    setErrorMessage(null);

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1,
      });

      handleImagePickerResponse(result);
    } catch (error: any) {
      console.error('Failed to launch image library:', error);
      setErrorMessage('Failed to open photo library. Please try again.');
    }
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }

    if (response.errorCode) {
      setErrorMessage(response.errorMessage || 'An error occurred');
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      setSelectedImage(asset.uri || null);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setErrorMessage('Please select an image first');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    try {
      const uploadedUrl = await uploadProfilePicture(selectedImage, (progress) => {
        setUploadProgress(progress);
      });

      setSuccessMessage('Profile picture updated successfully');
      setSelectedImage(null);

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      setErrorMessage(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const currentProfilePicture = selectedImage || user?.profile_picture_url;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      testID="update-profile-picture-screen"
    >
      <Box flex={1} padding="$6">
        <VStack space="xl">
          {/* Header */}
          <VStack space="xs">
            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color="$gray900"
              accessibilityRole="header"
            >
              Update Profile Picture
            </Text>
            <Text fontSize="$sm" color="$gray600">
              Take a photo or choose from your library
            </Text>
          </VStack>

          {/* Current/Selected Profile Picture */}
          <Box alignItems="center" paddingVertical="$6">
            {currentProfilePicture ? (
              <Avatar size="2xl" testID="profile-picture-preview">
                <AvatarImage source={{ uri: currentProfilePicture }} />
              </Avatar>
            ) : (
              <Avatar size="2xl" testID="profile-picture-placeholder">
                <Text fontSize="$4xl" color="$gray600">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Text>
              </Avatar>
            )}
          </Box>

          {/* Action Buttons */}
          <VStack space="md">
            <Button
              onPress={handleTakePhoto}
              isDisabled={isUploading}
              backgroundColor="$blue600"
              testID="take-photo-button"
              accessibilityRole="button"
              accessibilityLabel="Take photo with camera"
              accessibilityHint="Opens camera to take a new profile picture"
            >
              <ButtonText>📷  Take Photo</ButtonText>
            </Button>

            <Button
              onPress={handleChooseFromLibrary}
              isDisabled={isUploading}
              variant="outline"
              borderColor="$blue600"
              testID="choose-from-library-button"
              accessibilityRole="button"
              accessibilityLabel="Choose from photo library"
              accessibilityHint="Opens photo library to select a profile picture"
            >
              <ButtonText color="$blue600">📁  Choose from Library</ButtonText>
            </Button>
          </VStack>

          {/* Upload Button and Progress */}
          {selectedImage && (
            <VStack space="md">
              {isUploading && (
                <Box testID="upload-progress">
                  <Text fontSize="$sm" color="$gray600" marginBottom="$2">
                    Uploading... {uploadProgress}%
                  </Text>
                  <Progress value={uploadProgress} size="md">
                    <ProgressFilledTrack />
                  </Progress>
                </Box>
              )}

              <Button
                onPress={handleUpload}
                isDisabled={isUploading}
                backgroundColor="$green600"
                testID="upload-button"
                accessibilityRole="button"
                accessibilityLabel="Upload profile picture"
                accessibilityHint="Uploads the selected image as your profile picture"
              >
                {isUploading ? (
                  <Spinner color="$white" testID="upload-spinner" />
                ) : (
                  <ButtonText>Upload</ButtonText>
                )}
              </Button>
            </VStack>
          )}

          {/* Success Message */}
          {successMessage && (
            <Box
              backgroundColor="$green100"
              borderColor="$green600"
              borderWidth={1}
              borderRadius="$md"
              padding="$3"
              testID="success-message"
              accessibilityRole="alert"
            >
              <HStack space="sm" alignItems="center">
                <Text fontSize="$lg">✓</Text>
                <Text color="$green800">{successMessage}</Text>
              </HStack>
            </Box>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Box
              backgroundColor="$red100"
              borderColor="$red600"
              borderWidth={1}
              borderRadius="$md"
              padding="$3"
              testID="error-message"
              accessibilityRole="alert"
            >
              <HStack space="sm" alignItems="center">
                <Text fontSize="$lg">✕</Text>
                <Text color="$red800">{errorMessage}</Text>
              </HStack>
            </Box>
          )}

          {/* Information */}
          <Box
            backgroundColor="$blue50"
            borderColor="$blue200"
            borderWidth={1}
            borderRadius="$md"
            padding="$4"
          >
            <VStack space="xs">
              <Text fontSize="$md" fontWeight="$semibold" color="$blue900">
                Image Requirements
              </Text>
              <Text fontSize="$sm" color="$blue800">
                • Recommended size: 512x512 pixels{'\n'}
                • Maximum file size: 5MB{'\n'}
                • Supported formats: JPEG, PNG{'\n'}
                • Image will be resized to 1024x1024 max
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Auth/screens/__tests__/UpdateProfilePictureScreen.rntl.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UpdateProfilePictureScreen } from '../UpdateProfilePictureScreen';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as storage from '../../api/storage';

jest.mock('react-native-image-picker');
jest.mock('../../api/storage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));
jest.mock('react-redux', () => ({
  useSelector: () => ({
    firstName: 'John',
    lastName: 'Doe',
    profilePictureUrl: 'https://example.com/profile.jpg',
  }),
}));

const mockLaunchCamera = launchCamera as jest.MockedFunction<typeof launchCamera>;
const mockLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<typeof launchImageLibrary>;
const mockStorage = storage as jest.Mocked<typeof storage>;

describe('UpdateProfilePictureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render screen with current profile picture', () => {
    const { getByText, getByTestId } = render(<UpdateProfilePictureScreen />);

    expect(getByText('Update Profile Picture')).toBeTruthy();
    expect(getByTestId('profile-picture-preview')).toBeTruthy();
    expect(getByTestId('take-photo-button')).toBeTruthy();
    expect(getByTestId('choose-from-library-button')).toBeTruthy();
  });

  it('should launch camera when take photo button is pressed', async () => {
    mockLaunchCamera.mockResolvedValue({
      assets: [{ uri: 'file:///path/to/photo.jpg' }],
    });

    const { getByTestId } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('take-photo-button'));

    await waitFor(() => {
      expect(mockLaunchCamera).toHaveBeenCalledWith({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        cameraType: 'front',
        saveToPhotos: false,
      });
    });
  });

  it('should launch image library when choose from library button is pressed', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      assets: [{ uri: 'file:///path/to/library-photo.jpg' }],
    });

    const { getByTestId } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('choose-from-library-button'));

    await waitFor(() => {
      expect(mockLaunchImageLibrary).toHaveBeenCalledWith({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1,
      });
    });
  });

  it('should show selected image and upload button after selecting photo', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      assets: [{ uri: 'file:///path/to/selected-photo.jpg' }],
    });

    const { getByTestId } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('choose-from-library-button'));

    await waitFor(() => {
      expect(getByTestId('upload-button')).toBeTruthy();
    });
  });

  it('should upload profile picture successfully', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      assets: [{ uri: 'file:///path/to/selected-photo.jpg' }],
    });
    mockStorage.uploadProfilePicture.mockResolvedValue('https://storage.supabase.co/new-profile.jpg');

    const { getByTestId, getByText } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('choose-from-library-button'));

    await waitFor(() => {
      expect(getByTestId('upload-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('upload-button'));

    await waitFor(() => {
      expect(mockStorage.uploadProfilePicture).toHaveBeenCalledWith(
        'file:///path/to/selected-photo.jpg',
        expect.any(Function)
      );
      expect(getByText('Profile picture updated successfully')).toBeTruthy();
    });
  });

  it('should show error when upload fails', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      assets: [{ uri: 'file:///path/to/selected-photo.jpg' }],
    });
    mockStorage.uploadProfilePicture.mockRejectedValue(new Error('Upload failed'));

    const { getByTestId, getByText } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('choose-from-library-button'));

    await waitFor(() => {
      expect(getByTestId('upload-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('upload-button'));

    await waitFor(() => {
      expect(getByText('Upload failed')).toBeTruthy();
    });
  });

  it('should show upload progress during upload', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      assets: [{ uri: 'file:///path/to/selected-photo.jpg' }],
    });

    let progressCallback: (progress: number) => void;
    mockStorage.uploadProfilePicture.mockImplementation((uri, onProgress) => {
      progressCallback = onProgress;
      return new Promise((resolve) => {
        setTimeout(() => {
          progressCallback(50);
          progressCallback(100);
          resolve('https://storage.supabase.co/new-profile.jpg');
        }, 100);
      });
    });

    const { getByTestId, getByText } = render(<UpdateProfilePictureScreen />);

    fireEvent.press(getByTestId('choose-from-library-button'));

    await waitFor(() => {
      expect(getByTestId('upload-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('upload-button'));

    await waitFor(() => {
      expect(getByTestId('upload-progress')).toBeTruthy();
      expect(getByText(/Uploading.../)).toBeTruthy();
    });
  });

  it('should have correct accessibility properties', () => {
    const { getByTestId } = render(<UpdateProfilePictureScreen />);

    expect(getByTestId('take-photo-button')).toHaveProp('accessibilityRole', 'button');
    expect(getByTestId('take-photo-button')).toHaveProp('accessibilityLabel', 'Take photo with camera');
    expect(getByTestId('choose-from-library-button')).toHaveProp('accessibilityLabel', 'Choose from photo library');
  });
});
```

---

## Dependencies

- `react-native-image-picker` - Image selection
- GlueStack UI components
- Supabase Storage API client (TASK-198, TASK-246)

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Image picker integration working (camera + library)
- [ ] Image preview working
- [ ] Upload progress indicator working
- [ ] Success/error messaging working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-042](../stories/US-042-update-profile-picture.md), [TASK-244](TASK-244-image-picker-integration.md), [TASK-246](TASK-246-supabase-storage-upload.md)
