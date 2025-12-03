/**
 * Tests for Image Picker Service
 *
 * Tests service functions with mocked react-native-image-crop-picker.
 * Native image picker UI cannot be tested in unit tests.
 */

import { Image } from 'react-native';

import {
  cleanupPickerCache,
  openCameraForProfilePicture,
  openLibraryForProfilePicture,
} from '../imagePickerService';

// Mock react-native-image-crop-picker
const mockOpenCamera = jest.fn();
const mockOpenPicker = jest.fn();
const mockClean = jest.fn();

jest.mock('react-native-image-crop-picker', () => ({
  openCamera: (...args: unknown[]) => mockOpenCamera(...args),
  openPicker: (...args: unknown[]) => mockOpenPicker(...args),
  clean: () => mockClean(),
}));

// Mock bundled image asset
const MOCK_ASSET_URI = 'http://localhost:8081/assets/src/assets/img/profile-11.jpg';

// Mock E2E config
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

// Mock logger
jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
}));

describe('imagePickerService', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  const mockImage = {
    path: 'file:///tmp/image.jpg',
    width: 800,
    height: 800,
    mime: 'image/jpeg',
    size: 150000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  describe('openCameraForProfilePicture', () => {
    it('should return success result when camera capture succeeds', async () => {
      mockOpenCamera.mockResolvedValue(mockImage);

      const result = await openCameraForProfilePicture();

      expect(result.success).toBe(true);
      expect(result.uri).toBe(mockImage.path);
      expect(result.width).toBe(800);
      expect(result.height).toBe(800);
      expect(result.mime).toBe('image/jpeg');
      expect(result.size).toBe(150000);
    });

    it('should call openCamera with correct options', async () => {
      mockOpenCamera.mockResolvedValue(mockImage);

      await openCameraForProfilePicture();

      expect(mockOpenCamera).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 800,
          height: 800,
          cropping: true,
          cropperCircleOverlay: true,
          compressImageQuality: 0.8,
          mediaType: 'photo',
          includeExif: false,
        })
      );
    });

    it('should handle user cancellation', async () => {
      mockOpenCamera.mockRejectedValue(new Error('User cancelled image selection'));

      const result = await openCameraForProfilePicture();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });

    it('should handle permission errors', async () => {
      mockOpenCamera.mockRejectedValue(new Error('Permission not granted'));

      const result = await openCameraForProfilePicture();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    it('should handle other errors', async () => {
      mockOpenCamera.mockRejectedValue(new Error('Camera not available'));

      const result = await openCameraForProfilePicture();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Camera not available');
    });
  });

  describe('openLibraryForProfilePicture', () => {
    it('should return success result when library selection succeeds', async () => {
      mockOpenPicker.mockResolvedValue(mockImage);

      const result = await openLibraryForProfilePicture();

      expect(result.success).toBe(true);
      expect(result.uri).toBe(mockImage.path);
      expect(result.width).toBe(800);
      expect(result.height).toBe(800);
    });

    it('should call openPicker with correct options', async () => {
      mockOpenPicker.mockResolvedValue(mockImage);

      await openLibraryForProfilePicture();

      expect(mockOpenPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 800,
          height: 800,
          cropping: true,
          cropperCircleOverlay: true,
          compressImageQuality: 0.8,
          mediaType: 'photo',
          includeExif: false,
        })
      );
    });

    it('should handle user cancellation', async () => {
      mockOpenPicker.mockRejectedValue(new Error('User cancelled image selection'));

      const result = await openLibraryForProfilePicture();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });

    it('should handle permission errors', async () => {
      mockOpenPicker.mockRejectedValue(new Error('Permission denied'));

      const result = await openLibraryForProfilePicture();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('cleanupPickerCache', () => {
    it('should call ImagePicker.clean', async () => {
      mockClean.mockResolvedValue(undefined);

      await cleanupPickerCache();

      expect(mockClean).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      mockClean.mockRejectedValue(new Error('Cleanup failed'));

      // Should not throw
      await expect(cleanupPickerCache()).resolves.not.toThrow();
    });
  });

  describe('E2E mock behaviour', () => {
    let resolveAssetSourceSpy: jest.SpyInstance;

    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
      resolveAssetSourceSpy = jest.spyOn(Image, 'resolveAssetSource').mockReturnValue({
        uri: MOCK_ASSET_URI,
        width: 800,
        height: 800,
        scale: 1,
      });
    });

    afterEach(() => {
      resolveAssetSourceSpy.mockRestore();
    });

    it('should return mock result for camera when E2E mock is enabled', async () => {
      const result = await openCameraForProfilePicture();

      expect(result.success).toBe(true);
      expect(result.uri).toBe(MOCK_ASSET_URI);
      expect(result.width).toBe(800);
      expect(result.height).toBe(800);
      expect(mockOpenCamera).not.toHaveBeenCalled();
    });

    it('should return mock result for library when E2E mock is enabled', async () => {
      const result = await openLibraryForProfilePicture();

      expect(result.success).toBe(true);
      expect(result.uri).toBe(MOCK_ASSET_URI);
      expect(result.width).toBe(800);
      expect(result.height).toBe(800);
      expect(mockOpenPicker).not.toHaveBeenCalled();
    });
  });
});
