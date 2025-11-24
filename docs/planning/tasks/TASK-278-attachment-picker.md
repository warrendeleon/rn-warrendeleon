# TASK-278: AttachmentPicker Component

**ID**: TASK-278 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-049](../stories/US-049-image-file-attachments.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Chat/
└── components/
    ├── AttachmentPicker.tsx
    └── __tests__/
        └── AttachmentPicker.test.tsx
```

**Note**: AttachmentPicker is a Chat-specific component, co-located within the Chat feature for selecting image/file attachments in messages.

---

## Task Description

Create an AttachmentPicker component to allow users to select images or files from their device. Support camera capture, photo library selection, and file picker. Handle permissions and provide user-friendly error messages.

---

## Acceptance Criteria

- [ ] AttachmentPicker component created in `src/features/Chat/components/AttachmentPicker.tsx`
- [ ] Support camera capture
- [ ] Support photo library selection
- [ ] Support file picker (documents)
- [ ] Request and handle permissions
- [ ] Display error messages for permission denials
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### AttachmentPicker Component

```typescript
// src/features/Chat/components/AttachmentPicker.tsx

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  CameraIcon,
  ImageIcon,
  FileTextIcon,
  CloseIcon,
} from '@gluestack-ui/themed';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface AttachmentPickerResult {
  uri: string;
  type: 'image' | 'file';
  name: string;
  size: number;
  mimeType: string;
}

export interface AttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onAttachmentSelected: (attachment: AttachmentPickerResult) => void;
  testID?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Check camera permission
 */
const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    return false;
  } catch (error) {
    console.error('Failed to check camera permission:', error);
    return false;
  }
};

/**
 * Check photo library permission
 */
const checkPhotoLibraryPermission = async (): Promise<boolean> => {
  try {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    return false;
  } catch (error) {
    console.error('Failed to check photo library permission:', error);
    return false;
  }
};

/**
 * Show permission denied alert
 */
const showPermissionDeniedAlert = (permissionType: string) => {
  Alert.alert(
    'Permission Required',
    `Please enable ${permissionType} permission in your device settings to use this feature.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
};

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  visible,
  onClose,
  onAttachmentSelected,
  testID = 'attachment-picker',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle camera capture
   */
  const handleCameraCapture = async () => {
    try {
      const hasPermission = await checkCameraPermission();

      if (!hasPermission) {
        showPermissionDeniedAlert('camera');
        return;
      }

      const options: CameraOptions = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
      };

      setIsProcessing(true);

      launchCamera(options, (response: ImagePickerResponse) => {
        setIsProcessing(false);

        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to capture photo');
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];

          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert('Error', 'Image size must be less than 10MB');
            return;
          }

          onAttachmentSelected({
            uri: asset.uri!,
            type: 'image',
            name: asset.fileName || 'photo.jpg',
            size: asset.fileSize || 0,
            mimeType: asset.type || 'image/jpeg',
          });

          onClose();
        }
      });
    } catch (error) {
      setIsProcessing(false);
      console.error('Failed to capture photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  /**
   * Handle photo library selection
   */
  const handlePhotoLibrarySelection = async () => {
    try {
      const hasPermission = await checkPhotoLibraryPermission();

      if (!hasPermission) {
        showPermissionDeniedAlert('photo library');
        return;
      }

      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
        selectionLimit: 1,
      };

      setIsProcessing(true);

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        setIsProcessing(false);

        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to select photo');
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];

          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert('Error', 'Image size must be less than 10MB');
            return;
          }

          onAttachmentSelected({
            uri: asset.uri!,
            type: 'image',
            name: asset.fileName || 'image.jpg',
            size: asset.fileSize || 0,
            mimeType: asset.type || 'image/jpeg',
          });

          onClose();
        }
      });
    } catch (error) {
      setIsProcessing(false);
      console.error('Failed to select photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelection = async () => {
    try {
      setIsProcessing(true);

      const result: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.plainText],
        copyTo: 'cachesDirectory',
      });

      setIsProcessing(false);

      if (result && result[0]) {
        const file = result[0];

        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert('Error', 'File size must be less than 10MB');
          return;
        }

        onAttachmentSelected({
          uri: file.fileCopyUri || file.uri,
          type: 'file',
          name: file.name,
          size: file.size || 0,
          mimeType: file.type || 'application/octet-stream',
        });

        onClose();
      }
    } catch (error) {
      setIsProcessing(false);

      if (DocumentPicker.isCancel(error)) {
        return;
      }

      console.error('Failed to select file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <Box
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        justifyContent="flex-end"
        testID={`${testID}-backdrop`}
      >
        <Pressable
          flex={1}
          onPress={onClose}
          accessibilityLabel="Close attachment picker"
        />

        <Box
          backgroundColor="$white"
          borderTopLeftRadius="$3xl"
          borderTopRightRadius="$3xl"
          paddingTop="$4"
          paddingBottom="$6"
          paddingHorizontal="$6"
          testID={`${testID}-content`}
        >
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <Text
              fontSize="$xl"
              fontWeight="$semibold"
              accessibilityRole="header"
            >
              Add Attachment
            </Text>

            <Pressable
              onPress={onClose}
              padding="$2"
              testID={`${testID}-close-button`}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseIcon size="md" color="$gray600" />
            </Pressable>
          </HStack>

          {/* Options */}
          <VStack space="md">
            {/* Camera */}
            <Pressable
              onPress={handleCameraCapture}
              disabled={isProcessing}
              testID={`${testID}-camera-option`}
              accessibilityRole="button"
              accessibilityLabel="Take photo with camera"
              accessibilityState={{ disabled: isProcessing }}
            >
              <HStack
                space="md"
                alignItems="center"
                padding="$4"
                backgroundColor="$gray50"
                borderRadius="$lg"
              >
                <Box
                  width={48}
                  height={48}
                  backgroundColor="$blue100"
                  borderRadius="$full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <CameraIcon size="lg" color="$blue600" />
                </Box>

                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$medium">
                    Camera
                  </Text>
                  <Text fontSize="$sm" color="$gray600">
                    Take a photo
                  </Text>
                </VStack>
              </HStack>
            </Pressable>

            {/* Photo Library */}
            <Pressable
              onPress={handlePhotoLibrarySelection}
              disabled={isProcessing}
              testID={`${testID}-photo-library-option`}
              accessibilityRole="button"
              accessibilityLabel="Choose photo from library"
              accessibilityState={{ disabled: isProcessing }}
            >
              <HStack
                space="md"
                alignItems="center"
                padding="$4"
                backgroundColor="$gray50"
                borderRadius="$lg"
              >
                <Box
                  width={48}
                  height={48}
                  backgroundColor="$green100"
                  borderRadius="$full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <ImageIcon size="lg" color="$green600" />
                </Box>

                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$medium">
                    Photo Library
                  </Text>
                  <Text fontSize="$sm" color="$gray600">
                    Choose from your photos
                  </Text>
                </VStack>
              </HStack>
            </Pressable>

            {/* File */}
            <Pressable
              onPress={handleFileSelection}
              disabled={isProcessing}
              testID={`${testID}-file-option`}
              accessibilityRole="button"
              accessibilityLabel="Choose document file"
              accessibilityState={{ disabled: isProcessing }}
            >
              <HStack
                space="md"
                alignItems="center"
                padding="$4"
                backgroundColor="$gray50"
                borderRadius="$lg"
              >
                <Box
                  width={48}
                  height={48}
                  backgroundColor="$purple100"
                  borderRadius="$full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <FileTextIcon size="lg" color="$purple600" />
                </Box>

                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$medium">
                    Document
                  </Text>
                  <Text fontSize="$sm" color="$gray600">
                    Choose a file (PDF, TXT)
                  </Text>
                </VStack>
              </HStack>
            </Pressable>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/components/__tests__/AttachmentPicker.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AttachmentPicker } from '../AttachmentPicker';
import * as ImagePicker from 'react-native-image-picker';
import * as DocumentPicker from 'react-native-document-picker';
import * as Permissions from 'react-native-permissions';

jest.mock('react-native-image-picker');
jest.mock('react-native-document-picker');
jest.mock('react-native-permissions');

const mockLaunchCamera = ImagePicker.launchCamera as jest.MockedFunction<
  typeof ImagePicker.launchCamera
>;
const mockLaunchImageLibrary = ImagePicker.launchImageLibrary as jest.MockedFunction<
  typeof ImagePicker.launchImageLibrary
>;
const mockDocumentPicker = DocumentPicker.pick as jest.MockedFunction<
  typeof DocumentPicker.pick
>;

describe('AttachmentPicker', () => {
  const mockOnClose = jest.fn();
  const mockOnAttachmentSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
  });

  describe('Rendering', () => {
    it('should render when visible', () => {
      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      expect(getByTestId('attachment-picker')).toBeTruthy();
      expect(getByTestId('attachment-picker-content')).toBeTruthy();
    });

    it('should render all options', () => {
      const { getByTestId, getByText } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      expect(getByTestId('attachment-picker-camera-option')).toBeTruthy();
      expect(getByTestId('attachment-picker-photo-library-option')).toBeTruthy();
      expect(getByTestId('attachment-picker-file-option')).toBeTruthy();

      expect(getByText('Camera')).toBeTruthy();
      expect(getByText('Photo Library')).toBeTruthy();
      expect(getByText('Document')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      expect(getByTestId('attachment-picker-close-button')).toBeTruthy();
    });
  });

  describe('Camera Capture', () => {
    it('should launch camera when camera option pressed', async () => {
      (Permissions.check as jest.Mock).mockResolvedValue(Permissions.RESULTS.GRANTED);

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback({
          assets: [
            {
              uri: 'file://photo.jpg',
              fileName: 'photo.jpg',
              fileSize: 1024,
              type: 'image/jpeg',
            },
          ],
        });
      });

      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      fireEvent.press(getByTestId('attachment-picker-camera-option'));

      await waitFor(() => {
        expect(mockLaunchCamera).toHaveBeenCalled();
        expect(mockOnAttachmentSelected).toHaveBeenCalledWith({
          uri: 'file://photo.jpg',
          type: 'image',
          name: 'photo.jpg',
          size: 1024,
          mimeType: 'image/jpeg',
        });
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle camera cancellation', async () => {
      (Permissions.check as jest.Mock).mockResolvedValue(Permissions.RESULTS.GRANTED);

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback({ didCancel: true });
      });

      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      fireEvent.press(getByTestId('attachment-picker-camera-option'));

      await waitFor(() => {
        expect(mockOnAttachmentSelected).not.toHaveBeenCalled();
      });
    });

    it('should show error when file too large', async () => {
      (Permissions.check as jest.Mock).mockResolvedValue(Permissions.RESULTS.GRANTED);

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback({
          assets: [
            {
              uri: 'file://photo.jpg',
              fileName: 'photo.jpg',
              fileSize: 20 * 1024 * 1024, // 20MB
              type: 'image/jpeg',
            },
          ],
        });
      });

      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      fireEvent.press(getByTestId('attachment-picker-camera-option'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Image size must be less than 10MB'
        );
        expect(mockOnAttachmentSelected).not.toHaveBeenCalled();
      });
    });
  });

  describe('Photo Library Selection', () => {
    it('should launch photo library when option pressed', async () => {
      (Permissions.check as jest.Mock).mockResolvedValue(Permissions.RESULTS.GRANTED);

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback({
          assets: [
            {
              uri: 'file://image.jpg',
              fileName: 'image.jpg',
              fileSize: 2048,
              type: 'image/jpeg',
            },
          ],
        });
      });

      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      fireEvent.press(getByTestId('attachment-picker-photo-library-option'));

      await waitFor(() => {
        expect(mockLaunchImageLibrary).toHaveBeenCalled();
        expect(mockOnAttachmentSelected).toHaveBeenCalled();
      });
    });
  });

  describe('File Selection', () => {
    it('should launch document picker when file option pressed', async () => {
      mockDocumentPicker.mockResolvedValue([
        {
          uri: 'file://document.pdf',
          name: 'document.pdf',
          size: 1024,
          type: 'application/pdf',
          fileCopyUri: 'file://document.pdf',
        },
      ]);

      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      fireEvent.press(getByTestId('attachment-picker-file-option'));

      await waitFor(() => {
        expect(mockDocumentPicker).toHaveBeenCalled();
        expect(mockOnAttachmentSelected).toHaveBeenCalledWith({
          uri: 'file://document.pdf',
          type: 'file',
          name: 'document.pdf',
          size: 1024,
          mimeType: 'application/pdf',
        });
      });
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button pressed', () => {
      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      fireEvent.press(getByTestId('attachment-picker-close-button'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop pressed', () => {
      const { getByTestId } = render(
        <AttachmentPicker
          visible={true}
          onClose={mockOnClose}
          onAttachmentSelected={mockOnAttachmentSelected}
        />
      );

      fireEvent.press(getByTestId('attachment-picker-backdrop'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
```

---

## Dependencies

- react-native-image-picker (camera and photo library)
- react-native-document-picker (file selection)
- react-native-permissions (permission handling)
- GlueStack UI

---

## Definition of Done

- [ ] AttachmentPicker component implemented
- [ ] Camera capture working
- [ ] Photo library selection working
- [ ] File picker working
- [ ] Permission handling working
- [ ] Error messages working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-049](../stories/US-049-image-file-attachments.md), [TASK-279](TASK-279-image-processing.md)
