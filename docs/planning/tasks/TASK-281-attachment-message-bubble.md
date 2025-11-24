# TASK-281: AttachmentMessageBubble Component

**ID**: TASK-281 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-049](../stories/US-049-image-file-attachments.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## File Structure

```
src/features/Chat/
└── components/
    ├── AttachmentMessageBubble.tsx
    └── __tests__/
        └── AttachmentMessageBubble.test.tsx
```

**Note**: AttachmentMessageBubble is a Chat-specific component, co-located within the Chat feature for displaying image/file attachments in message bubbles.

---

## Task Description

Create AttachmentMessageBubble component to display image and file attachments in messages. Support image preview, file download, loading states, error states, and tap-to-view functionality.

---

## Acceptance Criteria

- [ ] AttachmentMessageBubble component created in `src/features/Chat/components/AttachmentMessageBubble.tsx`
- [ ] Display image attachments with preview
- [ ] Display file attachments with icon and name
- [ ] Support loading states during upload
- [ ] Support error states
- [ ] Tap-to-view full screen image
- [ ] Tap-to-download file
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### AttachmentMessageBubble Component

```typescript
// src/features/Chat/components/AttachmentMessageBubble.tsx

import React, { useState } from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';
import {
  Box,
  HStack,
  VStack,
  Text,
  Spinner,
  FileTextIcon,
  DownloadIcon,
  AlertCircleIcon,
} from '@gluestack-ui/themed';

export interface Attachment {
  url: string;
  type: 'image' | 'file';
  name: string;
  size: number;
  mimeType: string;
}

export interface AttachmentMessageBubbleProps {
  attachment: Attachment;
  isUploading?: boolean;
  uploadProgress?: number; // 0-100
  error?: string;
  onImagePress?: (url: string) => void;
  onFileDownload?: (url: string, filename: string) => void;
  testID?: string;
}

/**
 * Format file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentMessageBubble: React.FC<AttachmentMessageBubbleProps> = ({
  attachment,
  isUploading = false,
  uploadProgress = 0,
  error,
  onImagePress,
  onFileDownload,
  testID = 'attachment-message-bubble',
}) => {
  const [imageError, setImageError] = useState(false);

  /**
   * Render image attachment
   */
  const renderImageAttachment = () => {
    return (
      <Pressable
        onPress={() => {
          if (!isUploading && !error && onImagePress) {
            onImagePress(attachment.url);
          }
        }}
        disabled={isUploading || !!error}
        testID={`${testID}-image-pressable`}
        accessibilityRole="button"
        accessibilityLabel={`View image attachment ${attachment.name}`}
        accessibilityState={{ disabled: isUploading || !!error }}
      >
        <Box
          width={250}
          height={250}
          borderRadius="$lg"
          overflow="hidden"
          backgroundColor="$gray100"
          testID={`${testID}-image-container`}
        >
          {imageError ? (
            <Box
              flex={1}
              justifyContent="center"
              alignItems="center"
              testID={`${testID}-image-error`}
            >
              <AlertCircleIcon size="xl" color="$red600" />
              <Text fontSize="$sm" color="$red600" marginTop="$2">
                Failed to load image
              </Text>
            </Box>
          ) : (
            <Image
              source={{ uri: attachment.url }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
              testID={`${testID}-image`}
            />
          )}

          {/* Upload progress overlay */}
          {isUploading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(0, 0, 0, 0.5)"
              justifyContent="center"
              alignItems="center"
              testID={`${testID}-upload-overlay`}
            >
              <VStack space="sm" alignItems="center">
                <Spinner size="large" color="$white" />
                <Text fontSize="$sm" color="$white" fontWeight="$medium">
                  Uploading... {uploadProgress}%
                </Text>
              </VStack>
            </Box>
          )}

          {/* Error overlay */}
          {error && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(255, 0, 0, 0.1)"
              justifyContent="center"
              alignItems="center"
              testID={`${testID}-error-overlay`}
            >
              <VStack space="sm" alignItems="center">
                <AlertCircleIcon size="xl" color="$red600" />
                <Text
                  fontSize="$sm"
                  color="$red900"
                  fontWeight="$medium"
                  textAlign="center"
                  paddingHorizontal="$4"
                >
                  {error}
                </Text>
              </VStack>
            </Box>
          )}
        </Box>
      </Pressable>
    );
  };

  /**
   * Render file attachment
   */
  const renderFileAttachment = () => {
    return (
      <Pressable
        onPress={() => {
          if (!isUploading && !error && onFileDownload) {
            onFileDownload(attachment.url, attachment.name);
          }
        }}
        disabled={isUploading || !!error}
        testID={`${testID}-file-pressable`}
        accessibilityRole="button"
        accessibilityLabel={`Download file ${attachment.name}`}
        accessibilityState={{ disabled: isUploading || !!error }}
      >
        <Box
          width={250}
          backgroundColor="$gray50"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$gray200"
          padding="$4"
          testID={`${testID}-file-container`}
        >
          <HStack space="md" alignItems="center">
            {/* File Icon */}
            <Box
              width={48}
              height={48}
              backgroundColor="$blue100"
              borderRadius="$lg"
              justifyContent="center"
              alignItems="center"
              testID={`${testID}-file-icon`}
            >
              {isUploading ? (
                <Spinner size="small" color="$blue600" />
              ) : error ? (
                <AlertCircleIcon size="lg" color="$red600" />
              ) : (
                <FileTextIcon size="lg" color="$blue600" />
              )}
            </Box>

            {/* File Info */}
            <VStack flex={1}>
              <Text
                fontSize="$md"
                fontWeight="$medium"
                numberOfLines={1}
                testID={`${testID}-file-name`}
              >
                {attachment.name}
              </Text>

              {isUploading ? (
                <Text
                  fontSize="$sm"
                  color="$gray600"
                  testID={`${testID}-upload-progress`}
                >
                  Uploading... {uploadProgress}%
                </Text>
              ) : error ? (
                <Text fontSize="$sm" color="$red600" testID={`${testID}-error-text`}>
                  {error}
                </Text>
              ) : (
                <Text
                  fontSize="$sm"
                  color="$gray600"
                  testID={`${testID}-file-size`}
                >
                  {formatFileSize(attachment.size)}
                </Text>
              )}
            </VStack>

            {/* Download Icon */}
            {!isUploading && !error && (
              <DownloadIcon
                size="md"
                color="$blue600"
                testID={`${testID}-download-icon`}
              />
            )}
          </HStack>
        </Box>
      </Pressable>
    );
  };

  return (
    <Box testID={testID}>
      {attachment.type === 'image'
        ? renderImageAttachment()
        : renderFileAttachment()}
    </Box>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/components/__tests__/AttachmentMessageBubble.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AttachmentMessageBubble, Attachment } from '../AttachmentMessageBubble';

describe('AttachmentMessageBubble', () => {
  const mockImageAttachment: Attachment = {
    url: 'https://example.com/image.jpg',
    type: 'image',
    name: 'photo.jpg',
    size: 204800,
    mimeType: 'image/jpeg',
  };

  const mockFileAttachment: Attachment = {
    url: 'https://example.com/document.pdf',
    type: 'file',
    name: 'document.pdf',
    size: 1048576,
    mimeType: 'application/pdf',
  };

  describe('Image Attachment', () => {
    it('should render image attachment', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble attachment={mockImageAttachment} />
      );

      expect(getByTestId('attachment-message-bubble')).toBeTruthy();
      expect(getByTestId('attachment-message-bubble-image-container')).toBeTruthy();
      expect(getByTestId('attachment-message-bubble-image')).toBeTruthy();
    });

    it('should call onImagePress when image pressed', () => {
      const mockOnImagePress = jest.fn();

      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={mockImageAttachment}
          onImagePress={mockOnImagePress}
        />
      );

      fireEvent.press(getByTestId('attachment-message-bubble-image-pressable'));

      expect(mockOnImagePress).toHaveBeenCalledWith(mockImageAttachment.url);
    });

    it('should not call onImagePress when uploading', () => {
      const mockOnImagePress = jest.fn();

      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={mockImageAttachment}
          isUploading={true}
          onImagePress={mockOnImagePress}
        />
      );

      fireEvent.press(getByTestId('attachment-message-bubble-image-pressable'));

      expect(mockOnImagePress).not.toHaveBeenCalled();
    });

    it('should show upload progress overlay', () => {
      const { getByTestId, getByText } = render(
        <AttachmentMessageBubble
          attachment={mockImageAttachment}
          isUploading={true}
          uploadProgress={75}
        />
      );

      expect(getByTestId('attachment-message-bubble-upload-overlay')).toBeTruthy();
      expect(getByText('Uploading... 75%')).toBeTruthy();
    });

    it('should show error overlay', () => {
      const { getByTestId, getByText } = render(
        <AttachmentMessageBubble
          attachment={mockImageAttachment}
          error="Upload failed"
        />
      );

      expect(getByTestId('attachment-message-bubble-error-overlay')).toBeTruthy();
      expect(getByText('Upload failed')).toBeTruthy();
    });

    it('should show image load error', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble attachment={mockImageAttachment} />
      );

      const image = getByTestId('attachment-message-bubble-image');
      fireEvent(image, 'error');

      expect(getByTestId('attachment-message-bubble-image-error')).toBeTruthy();
    });
  });

  describe('File Attachment', () => {
    it('should render file attachment', () => {
      const { getByTestId, getByText } = render(
        <AttachmentMessageBubble attachment={mockFileAttachment} />
      );

      expect(getByTestId('attachment-message-bubble-file-container')).toBeTruthy();
      expect(getByTestId('attachment-message-bubble-file-icon')).toBeTruthy();
      expect(getByText('document.pdf')).toBeTruthy();
      expect(getByText('1.0 MB')).toBeTruthy();
    });

    it('should call onFileDownload when file pressed', () => {
      const mockOnFileDownload = jest.fn();

      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={mockFileAttachment}
          onFileDownload={mockOnFileDownload}
        />
      );

      fireEvent.press(getByTestId('attachment-message-bubble-file-pressable'));

      expect(mockOnFileDownload).toHaveBeenCalledWith(
        mockFileAttachment.url,
        mockFileAttachment.name
      );
    });

    it('should show upload progress for file', () => {
      const { getByTestId, getByText } = render(
        <AttachmentMessageBubble
          attachment={mockFileAttachment}
          isUploading={true}
          uploadProgress={50}
        />
      );

      expect(getByText('Uploading... 50%')).toBeTruthy();
    });

    it('should show error for file', () => {
      const { getByText } = render(
        <AttachmentMessageBubble
          attachment={mockFileAttachment}
          error="Upload failed"
        />
      );

      expect(getByText('Upload failed')).toBeTruthy();
    });

    it('should show download icon when not uploading', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble attachment={mockFileAttachment} />
      );

      expect(getByTestId('attachment-message-bubble-download-icon')).toBeTruthy();
    });

    it('should hide download icon when uploading', () => {
      const { queryByTestId } = render(
        <AttachmentMessageBubble
          attachment={mockFileAttachment}
          isUploading={true}
        />
      );

      expect(queryByTestId('attachment-message-bubble-download-icon')).toBeNull();
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes', () => {
      const attachment = { ...mockFileAttachment, size: 512 };

      const { getByText } = render(
        <AttachmentMessageBubble attachment={attachment} />
      );

      expect(getByText('512 B')).toBeTruthy();
    });

    it('should format KB', () => {
      const attachment = { ...mockFileAttachment, size: 2048 };

      const { getByText } = render(
        <AttachmentMessageBubble attachment={attachment} />
      );

      expect(getByText('2.0 KB')).toBeTruthy();
    });

    it('should format MB', () => {
      const attachment = { ...mockFileAttachment, size: 5242880 };

      const { getByText } = render(
        <AttachmentMessageBubble attachment={attachment} />
      );

      expect(getByText('5.0 MB')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible image button', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble attachment={mockImageAttachment} />
      );

      const pressable = getByTestId('attachment-message-bubble-image-pressable');
      expect(pressable).toHaveProp('accessibilityRole', 'button');
      expect(pressable).toHaveProp(
        'accessibilityLabel',
        'View image attachment photo.jpg'
      );
    });

    it('should have accessible file button', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble attachment={mockFileAttachment} />
      );

      const pressable = getByTestId('attachment-message-bubble-file-pressable');
      expect(pressable).toHaveProp('accessibilityRole', 'button');
      expect(pressable).toHaveProp(
        'accessibilityLabel',
        'Download file document.pdf'
      );
    });

    it('should disable interactions when uploading', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={mockImageAttachment}
          isUploading={true}
        />
      );

      const pressable = getByTestId('attachment-message-bubble-image-pressable');
      expect(pressable).toHaveProp('accessibilityState', { disabled: true });
    });

    it('should disable interactions when error', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={mockImageAttachment}
          error="Upload failed"
        />
      );

      const pressable = getByTestId('attachment-message-bubble-image-pressable');
      expect(pressable).toHaveProp('accessibilityState', { disabled: true });
    });
  });
});
```

---

## Dependencies

- React Native (Image, Pressable)
- GlueStack UI

---

## Definition of Done

- [ ] AttachmentMessageBubble component implemented
- [ ] Image attachment display working
- [ ] File attachment display working
- [ ] Upload progress working
- [ ] Error states working
- [ ] Tap-to-view working
- [ ] Tap-to-download working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-049](../stories/US-049-image-file-attachments.md), [TASK-263](TASK-263-message-bubble.md), [TASK-280](TASK-280-supabase-storage-upload.md)
