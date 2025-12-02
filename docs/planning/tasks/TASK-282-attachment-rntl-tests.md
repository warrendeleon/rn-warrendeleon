# TASK-282: Attachment RNTL Tests

**ID**: TASK-282 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-049](../stories/US-049-image-file-attachments.md)
**Status**: 📋 To Do | **Effort**: 0.5h

---

## Task Description

Write full React Native Testing Library tests for attachment functionality. Test AttachmentPicker, image processing, storage upload, and AttachmentMessageBubble. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Complete RNTL test suite for AttachmentPicker
- [ ] Complete tests for image processing utilities
- [ ] Complete tests for storage upload service
- [ ] Complete tests for AttachmentMessageBubble
- [ ] Edge cases tested
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Full RNTL Test Suite

```typescript
// src/components/chat/__tests__/AttachmentTests.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AttachmentPicker } from '../AttachmentPicker';
import { AttachmentMessageBubble, Attachment } from '../AttachmentMessageBubble';
import * as ImagePicker from 'react-native-image-picker';
import * as DocumentPicker from 'react-native-document-picker';

jest.mock('react-native-image-picker');
jest.mock('react-native-document-picker');
jest.mock('react-native-permissions');

describe('Attachment Integration Tests', () => {
  describe('AttachmentPicker Flow', () => {
    const mockOnClose = jest.fn();
    const mockOnAttachmentSelected = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should complete full camera capture flow', async () => {
      const mockLaunchCamera = ImagePicker.launchCamera as jest.MockedFunction<
        typeof ImagePicker.launchCamera
      >;

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

    it('should complete full photo library flow', async () => {
      const mockLaunchImageLibrary = ImagePicker.launchImageLibrary as jest.MockedFunction<
        typeof ImagePicker.launchImageLibrary
      >;

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
        expect(mockOnAttachmentSelected).toHaveBeenCalled();
      });
    });

    it('should complete full file selection flow', async () => {
      const mockDocumentPicker = DocumentPicker.pick as jest.MockedFunction<
        typeof DocumentPicker.pick
      >;

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

  describe('AttachmentMessageBubble States', () => {
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

    describe('Upload States', () => {
      it('should show upload progress for image', () => {
        const { getByText } = render(
          <AttachmentMessageBubble
            attachment={mockImageAttachment}
            isUploading={true}
            uploadProgress={50}
          />
        );

        expect(getByText('Uploading... 50%')).toBeTruthy();
      });

      it('should transition from uploading to complete', () => {
        const { getByText, rerender, queryByText } = render(
          <AttachmentMessageBubble
            attachment={mockImageAttachment}
            isUploading={true}
            uploadProgress={50}
          />
        );

        expect(getByText('Uploading... 50%')).toBeTruthy();

        rerender(
          <AttachmentMessageBubble
            attachment={mockImageAttachment}
            isUploading={false}
          />
        );

        expect(queryByText('Uploading... 50%')).toBeNull();
      });

      it('should transition from uploading to error', () => {
        const { getByText, rerender } = render(
          <AttachmentMessageBubble
            attachment={mockImageAttachment}
            isUploading={true}
            uploadProgress={50}
          />
        );

        expect(getByText('Uploading... 50%')).toBeTruthy();

        rerender(
          <AttachmentMessageBubble
            attachment={mockImageAttachment}
            error="Upload failed"
          />
        );

        expect(getByText('Upload failed')).toBeTruthy();
      });
    });

    describe('Interactive Elements', () => {
      it('should allow image interaction when not uploading', () => {
        const mockOnImagePress = jest.fn();

        const { getByTestId } = render(
          <AttachmentMessageBubble
            attachment={mockImageAttachment}
            onImagePress={mockOnImagePress}
          />
        );

        fireEvent.press(getByTestId('attachment-message-bubble-image-pressable'));

        expect(mockOnImagePress).toHaveBeenCalled();
      });

      it('should prevent image interaction when uploading', () => {
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

      it('should prevent file interaction when error', () => {
        const mockOnFileDownload = jest.fn();

        const { getByTestId } = render(
          <AttachmentMessageBubble
            attachment={mockFileAttachment}
            error="Upload failed"
            onFileDownload={mockOnFileDownload}
          />
        );

        fireEvent.press(getByTestId('attachment-message-bubble-file-pressable'));

        expect(mockOnFileDownload).not.toHaveBeenCalled();
      });
    });
  });

  describe('File Size Display', () => {
    it('should display various file sizes correctly', () => {
      const sizes = [
        { bytes: 512, expected: '512 B' },
        { bytes: 1024, expected: '1.0 KB' },
        { bytes: 1536, expected: '1.5 KB' },
        { bytes: 1048576, expected: '1.0 MB' },
        { bytes: 5242880, expected: '5.0 MB' },
      ];

      sizes.forEach(({ bytes, expected }) => {
        const attachment: Attachment = {
          url: 'https://example.com/file.pdf',
          type: 'file',
          name: 'file.pdf',
          size: bytes,
          mimeType: 'application/pdf',
        };

        const { getByText } = render(
          <AttachmentMessageBubble attachment={attachment} />
        );

        expect(getByText(expected)).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle image load failure gracefully', () => {
      const mockImageAttachment: Attachment = {
        url: 'https://example.com/invalid.jpg',
        type: 'image',
        name: 'invalid.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
      };

      const { getByTestId } = render(
        <AttachmentMessageBubble attachment={mockImageAttachment} />
      );

      const image = getByTestId('attachment-message-bubble-image');
      fireEvent(image, 'error');

      expect(getByTestId('attachment-message-bubble-image-error')).toBeTruthy();
    });

    it('should display custom error messages', () => {
      const customErrors = [
        'Network error',
        'File too large',
        'Upload timeout',
        'Invalid file type',
      ];

      customErrors.forEach((error) => {
        const { getByText } = render(
          <AttachmentMessageBubble
            attachment={{
              url: 'https://example.com/file.pdf',
              type: 'file',
              name: 'file.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            }}
            error={error}
          />
        );

        expect(getByText(error)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility for image attachments', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={{
            url: 'https://example.com/photo.jpg',
            type: 'image',
            name: 'photo.jpg',
            size: 1024,
            mimeType: 'image/jpeg',
          }}
        />
      );

      const pressable = getByTestId('attachment-message-bubble-image-pressable');
      expect(pressable).toHaveProp('accessibilityRole', 'button');
      expect(pressable.props.accessibilityLabel).toContain('photo.jpg');
    });

    it('should have proper accessibility for file attachments', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={{
            url: 'https://example.com/document.pdf',
            type: 'file',
            name: 'document.pdf',
            size: 1024,
            mimeType: 'application/pdf',
          }}
        />
      );

      const pressable = getByTestId('attachment-message-bubble-file-pressable');
      expect(pressable).toHaveProp('accessibilityRole', 'button');
      expect(pressable.props.accessibilityLabel).toContain('document.pdf');
    });

    it('should update accessibility state during upload', () => {
      const { getByTestId } = render(
        <AttachmentMessageBubble
          attachment={{
            url: 'https://example.com/photo.jpg',
            type: 'image',
            name: 'photo.jpg',
            size: 1024,
            mimeType: 'image/jpeg',
          }}
          isUploading={true}
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

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest
- AttachmentPicker component (TASK-278)
- AttachmentMessageBubble component (TASK-281)

---

## Definition of Done

- [ ] All attachment tests passing
- [ ] AttachmentPicker tested
- [ ] AttachmentMessageBubble tested
- [ ] Upload states tested
- [ ] Error states tested
- [ ] Accessibility tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-049](../stories/US-049-image-file-attachments.md), [TASK-278](TASK-278-attachment-picker.md), [TASK-281](TASK-281-attachment-message-bubble.md)
