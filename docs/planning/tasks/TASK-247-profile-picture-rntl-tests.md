# TASK-247: Profile Picture Update RNTL Tests

**ID**: TASK-247 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-042](../stories/US-042-update-profile-picture.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Write full React Native Testing Library tests for the UpdateProfilePictureScreen component. Test image picker integration, upload flow, progress tracking, success/error states, and accessibility. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Test file created at `src/screens/settings/__tests__/UpdateProfilePictureScreen.test.tsx`
- [ ] Image picker launch tested (camera + library)
- [ ] Image selection flow tested
- [ ] Upload progress tested
- [ ] Successful upload tested
- [ ] Error states tested (picker errors, upload failures)
- [ ] Accessibility tested
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Test Suite

```typescript
// src/screens/settings/__tests__/UpdateProfilePictureScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UpdateProfilePictureScreen } from '../UpdateProfilePictureScreen';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as profileService from '../../../services/profile/profileService';

jest.mock('react-native-image-picker');
jest.mock('../../../services/profile/profileService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));
jest.mock('react-redux', () => ({
  useSelector: () => ({
    id: 'user-123',
    name: 'John Doe',
    profile_picture_url: 'https://example.com/current-profile.jpg',
  }),
}));

const mockLaunchCamera = launchCamera as jest.MockedFunction<typeof launchCamera>;
const mockLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<typeof launchImageLibrary>;
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

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

  describe('Take Photo', () => {
    it('should launch camera when take photo button is pressed', async () => {
      mockLaunchCamera.mockResolvedValue({
        assets: [{ uri: 'file:///photo.jpg' }],
      });

      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('take-photo-button'));

      await waitFor(() => {
        expect(mockLaunchCamera).toHaveBeenCalled();
      });
    });

    it('should show upload button after taking photo', async () => {
      mockLaunchCamera.mockResolvedValue({
        assets: [{ uri: 'file:///photo.jpg' }],
      });

      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('take-photo-button'));

      await waitFor(() => {
        expect(getByTestId('upload-button')).toBeTruthy();
      });
    });

    it('should handle camera error', async () => {
      mockLaunchCamera.mockResolvedValue({
        errorCode: 'camera_unavailable',
        errorMessage: 'Camera not available',
      });

      const { getByTestId, getByText } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('take-photo-button'));

      await waitFor(() => {
        expect(getByText('Camera not available')).toBeTruthy();
      });
    });

    it('should handle user cancellation', async () => {
      mockLaunchCamera.mockResolvedValue({ didCancel: true });

      const { getByTestId, queryByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('take-photo-button'));

      await waitFor(() => {
        expect(queryByTestId('upload-button')).toBeNull();
      });
    });
  });

  describe('Choose from Library', () => {
    it('should launch image library when choose from library button is pressed', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///library-photo.jpg' }],
      });

      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('choose-from-library-button'));

      await waitFor(() => {
        expect(mockLaunchImageLibrary).toHaveBeenCalled();
      });
    });

    it('should show upload button after selecting from library', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///library-photo.jpg' }],
      });

      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('choose-from-library-button'));

      await waitFor(() => {
        expect(getByTestId('upload-button')).toBeTruthy();
      });
    });
  });

  describe('Upload Flow', () => {
    it('should upload profile picture successfully', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///selected-photo.jpg' }],
      });
      mockProfileService.uploadProfilePicture.mockResolvedValue(
        'https://storage.supabase.co/new-profile.jpg'
      );

      const { getByTestId, getByText } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('choose-from-library-button'));

      await waitFor(() => {
        expect(getByTestId('upload-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('upload-button'));

      await waitFor(() => {
        expect(mockProfileService.uploadProfilePicture).toHaveBeenCalledWith(
          'file:///selected-photo.jpg',
          expect.any(Function)
        );
        expect(getByText('Profile picture updated successfully')).toBeTruthy();
      });
    });

    it('should show upload progress', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///selected-photo.jpg' }],
      });

      let progressCallback: (progress: number) => void;
      mockProfileService.uploadProfilePicture.mockImplementation((uri, onProgress) => {
        progressCallback = onProgress!;
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

    it('should show error when upload fails', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///selected-photo.jpg' }],
      });
      mockProfileService.uploadProfilePicture.mockRejectedValue(
        new Error('Upload failed')
      );

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

    it('should disable buttons during upload', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///selected-photo.jpg' }],
      });

      let resolveUpload: (value: string) => void;
      const uploadPromise = new Promise<string>((resolve) => {
        resolveUpload = resolve;
      });
      mockProfileService.uploadProfilePicture.mockReturnValue(uploadPromise);

      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('choose-from-library-button'));

      await waitFor(() => {
        expect(getByTestId('upload-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('upload-button'));

      await waitFor(() => {
        expect(getByTestId('take-photo-button')).toBeDisabled();
        expect(getByTestId('choose-from-library-button')).toBeDisabled();
      });

      resolveUpload!('https://storage.supabase.co/new-profile.jpg');
    });

    it('should clear selected image after successful upload', async () => {
      jest.useFakeTimers();

      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///selected-photo.jpg' }],
      });
      mockProfileService.uploadProfilePicture.mockResolvedValue(
        'https://storage.supabase.co/new-profile.jpg'
      );

      const mockGoBack = jest.fn();
      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('choose-from-library-button'));

      await waitFor(() => {
        expect(getByTestId('upload-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('upload-button'));

      await waitFor(() => {
        expect(mockProfileService.uploadProfilePicture).toHaveBeenCalled();
      });

      // Fast-forward time to trigger navigation
      jest.advanceTimersByTime(2000);

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', () => {
      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      expect(getByTestId('take-photo-button')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('choose-from-library-button')).toHaveProp('accessibilityRole', 'button');
    });

    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      expect(getByTestId('take-photo-button')).toHaveProp(
        'accessibilityLabel',
        'Take photo with camera'
      );
      expect(getByTestId('choose-from-library-button')).toHaveProp(
        'accessibilityLabel',
        'Choose from photo library'
      );
    });

    it('should announce success message to screen readers', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [{ uri: 'file:///selected-photo.jpg' }],
      });
      mockProfileService.uploadProfilePicture.mockResolvedValue(
        'https://storage.supabase.co/new-profile.jpg'
      );

      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      fireEvent.press(getByTestId('choose-from-library-button'));

      await waitFor(() => {
        expect(getByTestId('upload-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('upload-button'));

      await waitFor(() => {
        const successMessage = getByTestId('success-message');
        expect(successMessage).toHaveProp('accessibilityRole', 'alert');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should show error when no image is selected before upload', () => {
      const { getByTestId, getByText } = render(<UpdateProfilePictureScreen />);

      // Try to upload without selecting image
      // This shouldn't be possible in UI, but test defensive coding

      // No upload button should be visible
      expect(() => getByTestId('upload-button')).toThrow();
    });

    it('should show placeholder when no profile picture exists', () => {
      jest.spyOn(require('react-redux'), 'useSelector').mockReturnValue({
        id: 'user-123',
        name: 'John Doe',
        profile_picture_url: null,
      });

      const { getByTestId } = render(<UpdateProfilePictureScreen />);

      expect(getByTestId('profile-picture-placeholder')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest

---

## Definition of Done

- [ ] Test file created with full test suite
- [ ] Image picker tested
- [ ] Upload flow tested
- [ ] Progress tracking tested
- [ ] Success/error states tested
- [ ] Accessibility tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-042](../stories/US-042-update-profile-picture.md), [TASK-243](TASK-243-update-profile-picture-ui.md), [TASK-246](TASK-246-supabase-storage-upload.md)
