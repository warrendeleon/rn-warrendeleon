# TASK-244: Image Picker Integration with Permissions

**ID**: TASK-244 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-042](../stories/US-042-update-profile-picture.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Integrate `react-native-image-picker` with proper permission handling for camera and photo library access. Implement permission checking, request flows, error handling, and fallback UI for denied permissions.

---

## Acceptance Criteria

- [ ] `react-native-image-picker` library installed and configured
- [ ] Camera permission checking and requesting (iOS/Android)
- [ ] Photo library permission checking and requesting (iOS/Android)
- [ ] Permission denied handling with user-friendly messages
- [ ] Settings deeplink for manual permission grant
- [ ] Image selection working from camera
- [ ] Image selection working from library
- [ ] TypeScript type definitions
- [ ] 100% unit test coverage

---

## Implementation Details

### Installation

```bash
yarn add react-native-image-picker
cd ios && pod install
```

### iOS Configuration (`ios/warrendeleon/Info.plist`)

```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to update your profile picture.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to update your profile picture.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need permission to save photos to your library.</string>
```

### Android Configuration (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Image Picker Service

```typescript
// src/services/media/imagePickerService.ts

import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { Platform, Linking, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

/**
 * Image picker result
 */
export interface ImagePickerResult {
  success: boolean;
  uri?: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  error?: string;
}

/**
 * Default camera options
 */
const CAMERA_OPTIONS: CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
  cameraType: 'front',
  saveToPhotos: false,
};

/**
 * Default library options
 */
const LIBRARY_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
  selectionLimit: 1,
};

/**
 * Gets the appropriate camera permission for the platform
 */
const getCameraPermission = (): Permission => {
  return Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
};

/**
 * Gets the appropriate photo library permission for the platform
 */
const getPhotoLibraryPermission = (): Permission => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.PHOTO_LIBRARY;
  }

  // Android 13+ uses different permissions
  if (Platform.Version >= 33) {
    return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
  }

  return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
};

/**
 * Checks if camera permission is granted
 *
 * @returns Promise resolving to boolean
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = getCameraPermission();
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Failed to check camera permission:', error);
    return false;
  }
};

/**
 * Requests camera permission
 *
 * @returns Promise resolving to boolean (true if granted)
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = getCameraPermission();
    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      showPermissionDeniedAlert('Camera');
    }

    return false;
  } catch (error) {
    console.error('Failed to request camera permission:', error);
    return false;
  }
};

/**
 * Checks if photo library permission is granted
 *
 * @returns Promise resolving to boolean
 */
export const checkPhotoLibraryPermission = async (): Promise<boolean> => {
  try {
    const permission = getPhotoLibraryPermission();
    const result = await check(permission);
    return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
  } catch (error) {
    console.error('Failed to check photo library permission:', error);
    return false;
  }
};

/**
 * Requests photo library permission
 *
 * @returns Promise resolving to boolean (true if granted)
 */
export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  try {
    const permission = getPhotoLibraryPermission();
    const result = await request(permission);

    if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
      return true;
    }

    if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      showPermissionDeniedAlert('Photo Library');
    }

    return false;
  } catch (error) {
    console.error('Failed to request photo library permission:', error);
    return false;
  }
};

/**
 * Shows alert when permission is denied
 */
const showPermissionDeniedAlert = (permissionName: string) => {
  Alert.alert(
    `${permissionName} Permission Required`,
    `Please grant ${permissionName} permission in Settings to use this feature.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
};

/**
 * Launches camera to take a photo
 *
 * @returns Promise resolving to ImagePickerResult
 *
 * @example
 * const result = await takePhoto();
 * if (result.success) {
 *   console.log('Photo URI:', result.uri);
 * }
 */
export const takePhoto = async (): Promise<ImagePickerResult> => {
  try {
    // Check permission
    const hasPermission = await checkCameraPermission();

    if (!hasPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        return {
          success: false,
          error: 'Camera permission denied',
        };
      }
    }

    // Launch camera
    const response = await launchCamera(CAMERA_OPTIONS);

    return handleImagePickerResponse(response);
  } catch (error: any) {
    console.error('Failed to take photo:', error);
    return {
      success: false,
      error: error.message || 'Failed to take photo',
    };
  }
};

/**
 * Launches image library to select a photo
 *
 * @returns Promise resolving to ImagePickerResult
 *
 * @example
 * const result = await selectFromLibrary();
 * if (result.success) {
 *   console.log('Photo URI:', result.uri);
 * }
 */
export const selectFromLibrary = async (): Promise<ImagePickerResult> => {
  try {
    // Check permission
    const hasPermission = await checkPhotoLibraryPermission();

    if (!hasPermission) {
      const granted = await requestPhotoLibraryPermission();
      if (!granted) {
        return {
          success: false,
          error: 'Photo library permission denied',
        };
      }
    }

    // Launch library
    const response = await launchImageLibrary(LIBRARY_OPTIONS);

    return handleImagePickerResponse(response);
  } catch (error: any) {
    console.error('Failed to select from library:', error);
    return {
      success: false,
      error: error.message || 'Failed to select photo',
    };
  }
};

/**
 * Handles image picker response
 */
const handleImagePickerResponse = (response: ImagePickerResponse): ImagePickerResult => {
  if (response.didCancel) {
    return {
      success: false,
      error: 'User cancelled',
    };
  }

  if (response.errorCode) {
    return {
      success: false,
      error: response.errorMessage || `Error code: ${response.errorCode}`,
    };
  }

  if (!response.assets || response.assets.length === 0) {
    return {
      success: false,
      error: 'No image selected',
    };
  }

  const asset = response.assets[0];

  return {
    success: true,
    uri: asset.uri,
    fileName: asset.fileName,
    fileSize: asset.fileSize,
    type: asset.type,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/media/__tests__/imagePickerService.test.ts

import { Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, RESULTS } from 'react-native-permissions';
import {
  checkCameraPermission,
  requestCameraPermission,
  checkPhotoLibraryPermission,
  requestPhotoLibraryPermission,
  takePhoto,
  selectFromLibrary,
} from '../imagePickerService';

jest.mock('react-native-image-picker');
jest.mock('react-native-permissions');

const mockLaunchCamera = launchCamera as jest.MockedFunction<typeof launchCamera>;
const mockLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<typeof launchImageLibrary>;
const mockCheck = check as jest.MockedFunction<typeof check>;
const mockRequest = request as jest.MockedFunction<typeof request>;

describe('imagePickerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkCameraPermission', () => {
    it('should return true when camera permission is granted', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const result = await checkCameraPermission();

      expect(result).toBe(true);
    });

    it('should return false when camera permission is denied', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const result = await checkCameraPermission();

      expect(result).toBe(false);
    });
  });

  describe('requestCameraPermission', () => {
    it('should return true when permission is granted', async () => {
      mockRequest.mockResolvedValue(RESULTS.GRANTED);

      const result = await requestCameraPermission();

      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      mockRequest.mockResolvedValue(RESULTS.DENIED);

      const result = await requestCameraPermission();

      expect(result).toBe(false);
    });
  });

  describe('checkPhotoLibraryPermission', () => {
    it('should return true when photo library permission is granted', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const result = await checkPhotoLibraryPermission();

      expect(result).toBe(true);
    });

    it('should return true when permission is limited (iOS)', async () => {
      mockCheck.mockResolvedValue(RESULTS.LIMITED);

      const result = await checkPhotoLibraryPermission();

      expect(result).toBe(true);
    });
  });

  describe('takePhoto', () => {
    it('should return success result when photo is taken', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);
      mockLaunchCamera.mockResolvedValue({
        assets: [
          {
            uri: 'file:///path/to/photo.jpg',
            fileName: 'photo.jpg',
            fileSize: 1024,
            type: 'image/jpeg',
          },
        ],
      });

      const result = await takePhoto();

      expect(result.success).toBe(true);
      expect(result.uri).toBe('file:///path/to/photo.jpg');
      expect(result.fileName).toBe('photo.jpg');
    });

    it('should request permission if not granted', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.GRANTED);
      mockLaunchCamera.mockResolvedValue({
        assets: [{ uri: 'file:///path/to/photo.jpg' }],
      });

      const result = await takePhoto();

      expect(mockRequest).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should return error when permission is denied', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.DENIED);

      const result = await takePhoto();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Camera permission denied');
    });

    it('should return error when user cancels', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);
      mockLaunchCamera.mockResolvedValue({ didCancel: true });

      const result = await takePhoto();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });
  });

  describe('selectFromLibrary', () => {
    it('should return success result when photo is selected', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [
          {
            uri: 'file:///path/to/photo.jpg',
            fileName: 'photo.jpg',
            fileSize: 2048,
            type: 'image/jpeg',
          },
        ],
      });

      const result = await selectFromLibrary();

      expect(result.success).toBe(true);
      expect(result.uri).toBe('file:///path/to/photo.jpg');
    });

    it('should request permission if not granted', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.GRANTED);
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///path/to/photo.jpg' }],
      });

      const result = await selectFromLibrary();

      expect(mockRequest).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should return error when permission is denied', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.DENIED);

      const result = await selectFromLibrary();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Photo library permission denied');
    });
  });
});
```

---

## Dependencies

- `react-native-image-picker` - Image selection
- `react-native-permissions` - Permission handling

---

## Definition of Done

- [ ] Library installed and configured
- [ ] Permission checking implemented (iOS/Android)
- [ ] Permission requesting implemented
- [ ] Camera launch working
- [ ] Library launch working
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-042](../stories/US-042-update-profile-picture.md), [TASK-243](TASK-243-update-profile-picture-ui.md), [TASK-245](TASK-245-image-processing.md)
