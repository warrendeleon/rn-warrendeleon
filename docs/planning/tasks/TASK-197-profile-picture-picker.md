# TASK-197: Profile Picture Picker Component

**Task ID**: TASK-197
**Title**: Profile Picture Picker Component (Camera + Library + Square Crop)
**User Story**: [US-033](../stories/US-033-email-password-registration.md)
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 3 hours
**Created**: 2025-11-21

---

## Objective

Build profile picture picker component with camera/library selection, square crop (1:1), resize to 800×800px, compress to 80% JPEG, strip EXIF metadata.

---

## Implementation

### Install Dependencies

```bash
yarn add react-native-image-picker react-native-image-resizer react-native-image-crop-picker
cd ios && pod install && cd ..
```

### Component

`src/features/Auth/components/ProfilePicturePicker.tsx`:

```typescript
import React, { useState } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { VStack, Button, Avatar, ActionSheet } from '@gluestack-ui/themed';

export const ProfilePicturePicker = ({ onImageSelected, testID }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = async (source: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 1,
    };

    const result =
      source === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);

    if (result.assets?.[0]) {
      const resized = await ImageResizer.createResizedImage(
        result.assets[0].uri,
        800,
        800,
        'JPEG',
        80,
        0,
        undefined,
        false,
        { mode: 'cover', onlyScaleDown: false }
      );

      setImageUri(resized.uri);
      onImageSelected(resized.uri);
    }
  };

  return (
    <VStack space="md" className="items-center">
      <Avatar size="2xl" source={{ uri: imageUri }} testID={testID} />
      <Button onPress={() => handlePickImage('library')}>
        <ButtonText>Choose from Library</ButtonText>
      </Button>
      <Button onPress={() => handlePickImage('camera')}>
        <ButtonText>Take Photo</ButtonText>
      </Button>
    </VStack>
  );
};
```

---

## File Structure

```
src/features/Auth/
└── components/
    ├── ProfilePicturePicker.tsx
    └── __tests__/
        └── ProfilePicturePicker.rntl.tsx
```

**Note**: Component co-located with Auth feature following feature-first architecture (established in TASK-196).

## Acceptance Criteria

- [ ] Camera/library selection working
- [ ] Square crop enforced (1:1 aspect ratio)
- [ ] Resize to 800×800px
- [ ] JPEG compression 80%
- [ ] EXIF metadata stripped
- [ ] iOS/Android permissions handled
- [ ] 100% RNTL coverage

---

**Estimated Time**: 3 hours

**Last Updated**: 2025-11-21
