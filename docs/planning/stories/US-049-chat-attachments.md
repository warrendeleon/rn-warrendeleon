# US-049: Image and File Attachments in Chat

**ID**: US-049 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **Title**: Send and Receive Image/File Attachments
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 3 | **Effort**: 6h

---

## User Story

**As a** registered user
**I want to** send images and files in chat messages
**So that** I can share screenshots, documents, and other visual information with administrators

---

## Acceptance Criteria

### Functional Requirements

1. **Attachment Button**
   - [ ] Paperclip icon button next to message input
   - [ ] Tapping button shows attachment picker with options:
     - "Take Photo" (camera)
     - "Choose from Gallery" (photo library)
     - "Choose File" (document picker)

2. **Image Attachments**
   - [ ] User can attach images (JPEG, PNG, GIF)
   - [ ] Image preview shown before sending
   - [ ] Images resized to max 1920×1920px
   - [ ] Images compressed to 85% JPEG quality
   - [ ] Max file size: 10MB
   - [ ] Uploaded to Supabase Storage (`chat-attachments` bucket)

3. **File Attachments**
   - [ ] User can attach files (PDF, DOC, XLS, TXT, etc.)
   - [ ] File name and size shown before sending
   - [ ] Max file size: 10MB
   - [ ] Uploaded to Supabase Storage (`chat-attachments` bucket)

4. **Attachment Display**
   - [ ] Image attachments: Show inline thumbnail (tap to view full size)
   - [ ] File attachments: Show file icon + name + size (tap to download)
   - [ ] Upload progress indicator (0-100%)
   - [ ] Error handling: Show error if upload fails

5. **View/Download Attachments**
   - [ ] Image tap: Open full-screen image viewer
   - [ ] File tap: Download and open with system viewer
   - [ ] Loading indicator while downloading

### Non-Functional Requirements

1. **Performance**
   - [ ] Image resize: <2 seconds
   - [ ] Upload 10MB file: <10 seconds
   - [ ] Thumbnail generation: <500ms

2. **Accessibility (EAA)**
   - [ ] Attachment button has `accessibilityLabel="Attach file"`
   - [ ] Image attachments have `accessibilityLabel="Image attachment"`
   - [ ] File attachments have `accessibilityLabel="File: {filename}"`

3. **Testing**
   - [ ] 100% RNTL coverage for attachment components
   - [ ] E2E test for image upload flow
   - [ ] Manual testing with real images/files

---

## Technical Implementation

### Component Structure

```typescript
// src/components/chat/MessageInput.tsx (enhanced)

MessageInput
├── TextInput
├── AttachmentButton (paperclip icon)
│   └── AttachmentPicker (camera, gallery, files)
├── AttachmentPreview (before sending)
│   ├── ImagePreview
│   ├── FilePreview
│   └── RemoveButton
├── SendButton
└── UploadProgressBar
```

### Data Flow

```
User taps attachment button
  → Show picker (Camera, Gallery, Files)
  → User selects image/file
  → Show preview with cancel option
  → User confirms send
  → Process attachment:
    - Images: Resize + compress
    - Files: Validate size
  → Upload to Supabase Storage
  → Show progress bar (0-100%)
  → On success:
    → Get public URL
    → Insert message with attachment URL
    → Clear preview
  → On failure:
    → Show error, allow retry
```

### Supabase Storage Upload

```typescript
// src/services/storage/chatAttachmentsService.ts

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY);

export const uploadChatAttachment = async (
  fileUri: string,
  fileName: string,
  mimeType: string,
  onProgress: (progress: number) => void
): Promise<string> => {
  try {
    // 1. Process image if needed
    let processedUri = fileUri;

    if (mimeType.startsWith('image/')) {
      processedUri = await processImage(fileUri);
    }

    // 2. Read file as base64
    const fileData = await RNFS.readFile(processedUri, 'base64');
    const fileBlob = new Blob([Buffer.from(fileData, 'base64')], { type: mimeType });

    // 3. Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;

    // 4. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(uniqueFileName, fileBlob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    // 5. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(uniqueFileName);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

const processImage = async (imageUri: string): Promise<string> => {
  const resizedImage = await ImageResizer.createResizedImage(
    imageUri,
    1920, // max width
    1920, // max height
    'JPEG',
    85, // quality
    0, // rotation
    undefined,
    false,
    { mode: 'contain' }
  );

  return resizedImage.uri;
};
```

### AttachmentPicker Component

```typescript
// src/components/chat/AttachmentPicker.tsx

import React from 'react';
import { Modal, Pressable, View, Text } from 'react-native';
import { Box, VStack } from '@gluestack-ui/themed';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

interface AttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onAttachmentSelected: (uri: string, fileName: string, mimeType: string) => void;
  testID?: string;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  visible,
  onClose,
  onAttachmentSelected,
  testID = 'attachment-picker',
}) => {
  const handleTakePhoto = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      onAttachmentSelected(
        asset.uri!,
        asset.fileName || 'photo.jpg',
        asset.type || 'image/jpeg'
      );
    }

    onClose();
  };

  const handleChooseFromGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      onAttachmentSelected(
        asset.uri!,
        asset.fileName || 'image.jpg',
        asset.type || 'image/jpeg'
      );
    }

    onClose();
  };

  const handleChooseFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      onAttachmentSelected(result[0].uri, result[0].name, result[0].type || 'application/octet-stream');
    } catch (error) {
      // User cancelled
    }

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" testID={testID}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <Box backgroundColor="$white" borderTopLeftRadius="$lg" borderTopRightRadius="$lg" padding="$6">
          <VStack space="md">
            <Pressable
              onPress={handleTakePhoto}
              testID={`${testID}-camera`}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
            >
              <Text style={{ fontSize: 18 }}>📷 Take Photo</Text>
            </Pressable>

            <Pressable
              onPress={handleChooseFromGallery}
              testID={`${testID}-gallery`}
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery"
            >
              <Text style={{ fontSize: 18 }}>🖼️ Choose from Gallery</Text>
            </Pressable>

            <Pressable
              onPress={handleChooseFile}
              testID={`${testID}-file`}
              accessibilityRole="button"
              accessibilityLabel="Choose file"
            >
              <Text style={{ fontSize: 18 }}>📄 Choose File</Text>
            </Pressable>
          </VStack>
        </Box>
      </Pressable>
    </Modal>
  );
};
```

### AttachmentMessageBubble Component

```typescript
// src/components/chat/AttachmentMessageBubble.tsx

import React from 'react';
import { Pressable, Image, Text } from 'react-native';
import { Box, VStack } from '@gluestack-ui/themed';
import { Message } from '../../services/chat/realtimeService';

interface AttachmentMessageBubbleProps {
  message: Message;
  onAttachmentPress: (url: string, type: string) => void;
  testID?: string;
}

export const AttachmentMessageBubble: React.FC<AttachmentMessageBubbleProps> = ({
  message,
  onAttachmentPress,
  testID = 'attachment-message-bubble',
}) => {
  const isImage = message.attachment_type?.startsWith('image/');

  return (
    <Pressable
      onPress={() => onAttachmentPress(message.attachment_url!, message.attachment_type!)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={isImage ? 'Image attachment' : `File: ${message.content}`}
    >
      <Box borderRadius="$lg" overflow="hidden">
        {isImage ? (
          <Image
            source={{ uri: message.attachment_url! }}
            style={{ width: 200, height: 200 }}
            resizeMode="cover"
          />
        ) : (
          <Box backgroundColor="$gray200" padding="$3" borderRadius="$md">
            <VStack space="xs">
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                📄 {message.content || 'File attachment'}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                Tap to view
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
    </Pressable>
  );
};
```

---

## Tasks Breakdown

| Task ID  | Description                       | Effort |
| -------- | --------------------------------- | ------ |
| TASK-278 | AttachmentPicker Component        | 1.5h   |
| TASK-279 | Image Processing                  | 1.5h   |
| TASK-280 | Supabase Storage Upload           | 1.5h   |
| TASK-281 | AttachmentMessageBubble Component | 1h     |
| TASK-282 | Attachment RNTL Tests             | 0.5h   |

**Total**: 5 tasks, 6 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/components/chat/__tests__/AttachmentPicker.test.tsx`

```typescript
describe('AttachmentPicker', () => {
  it('should render all attachment options', () => {
    const { getByTestId } = render(
      <AttachmentPicker
        visible={true}
        onClose={jest.fn()}
        onAttachmentSelected={jest.fn()}
      />
    );

    expect(getByTestId('attachment-picker-camera')).toBeTruthy();
    expect(getByTestId('attachment-picker-gallery')).toBeTruthy();
    expect(getByTestId('attachment-picker-file')).toBeTruthy();
  });

  it('should call onAttachmentSelected when image is picked', async () => {
    const mockOnAttachmentSelected = jest.fn();

    mockImagePicker.launchImageLibrary.mockResolvedValue({
      assets: [{ uri: 'file:///image.jpg', fileName: 'image.jpg', type: 'image/jpeg' }],
    });

    const { getByTestId } = render(
      <AttachmentPicker
        visible={true}
        onClose={jest.fn()}
        onAttachmentSelected={mockOnAttachmentSelected}
      />
    );

    fireEvent.press(getByTestId('attachment-picker-gallery'));

    await waitFor(() => {
      expect(mockOnAttachmentSelected).toHaveBeenCalledWith(
        'file:///image.jpg',
        'image.jpg',
        'image/jpeg'
      );
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

```gherkin
Feature: Chat Attachments

  Background:
    Given I am logged in
    And I am on the Chat screen

  Scenario: Send image attachment
    When I tap the attachment button
    And I select "Choose from Gallery"
    And I select an image
    Then I should see the image preview
    When I tap "Send"
    Then the image should be uploaded
    And the message should appear with the image

  Scenario: Send file attachment
    When I tap the attachment button
    And I select "Choose File"
    And I select a PDF file
    Then I should see the file preview
    When I tap "Send"
    Then the file should be uploaded
    And the message should appear with the file icon

  Scenario: Cancel attachment
    When I tap the attachment button
    And I select "Choose from Gallery"
    And I tap "Cancel"
    Then the attachment picker should close
    And no attachment should be selected
```

---

## Dependencies

**Upstream**:

- US-046: Send and Receive Messages (chat exists)
- Supabase Storage bucket `chat-attachments` configured

**Downstream**:

- None (Attachments are enhancement)

---

## Risks & Mitigation

| Risk                    | Probability | Impact | Mitigation                               |
| ----------------------- | ----------- | ------ | ---------------------------------------- |
| Large file upload fails | Medium      | Medium | Retry logic, chunk uploads               |
| Image processing slow   | Low         | Low    | Background processing, loading indicator |
| Storage quota exceeded  | Low         | High   | Monitor usage, set limits per user       |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Attachments working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] File size validated (10MB limit)
- [ ] MIME type validated
- [ ] Storage bucket secure

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-025](../epics/EPIC-025-chat.md), [US-046](US-046-send-receive-messages.md)
