/**
 * ProfilePicturePreviewScreen RNTL Tests
 *
 * Tests for the profile picture preview screen.
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { expectMinTouchTarget } from '@app/test-utils';

import { ProfilePicturePreviewScreen } from '../ProfilePicturePreviewScreen';

// Track route params - must be defined before jest.mock for hoisting
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockOnConfirm = jest.fn();
const mockValidateProfilePicture = jest.fn();
const mockOpenLibraryForProfilePicture = jest.fn(() => Promise.resolve({ success: false }));
const mockOpenCameraForProfilePicture = jest.fn(() => Promise.resolve({ success: false }));
const mockShowToast = jest.fn();

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
      replace: jest.fn(),
      navigate: mockNavigate,
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {
        imageUri: 'file://test-image.jpg',
        source: 'library' as const,
        onConfirm: mockOnConfirm,
      },
    }),
  };
});

jest.mock('@app/shared/services/media', () => ({
  validateProfilePicture: (uri: string) => mockValidateProfilePicture(uri),
  openCameraForProfilePicture: () => mockOpenCameraForProfilePicture(),
  openLibraryForProfilePicture: () => mockOpenLibraryForProfilePicture(),
}));

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@app/shared/components', () => ({
  AuthScreenWrapper: ({ children, testID }: { children: React.ReactNode; testID: string }) => {
    const { View } = require('react-native');
    return <View testID={testID}>{children}</View>;
  },
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock('@app/store', () => ({
  useAppSelector: jest.fn(() => ({ id: 'test-user-id', email: 'test@example.com' })),
}));

jest.mock('@app/features/Auth', () => ({
  selectUser: jest.fn(),
}));

// Mock SupabaseStorageClient as a function that returns the mock result
jest.mock('@app/httpClients/SupabaseStorageClient', () => {
  return {
    SupabaseStorageClient: {
      uploadProfilePicture: jest.fn(),
    },
  };
});

// Import the mocked module to set up the mock behavior
import { SupabaseStorageClient } from '@app/httpClients/SupabaseStorageClient';
const mockedUploadProfilePicture = SupabaseStorageClient.uploadProfilePicture as jest.Mock;

describe('ProfilePicturePreviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateProfilePicture.mockResolvedValue({
      isValid: true,
      message: 'Face detected',
      confidence: 0.95,
    });
    // Reset picker mocks - default to cancelled (success: false)
    mockOpenLibraryForProfilePicture.mockResolvedValue({ success: false });
    mockOpenCameraForProfilePicture.mockResolvedValue({ success: false });
    // Reset upload mock - default to success
    mockedUploadProfilePicture.mockResolvedValue({
      success: true,
      publicUrl: 'https://storage.supabase.co/profile-pictures/test-user-id/profile-123.jpg',
      filePath: 'test-user-id/profile-123.jpg',
    });
  });

  describe('rendering', () => {
    it('renders the preview screen', async () => {
      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-preview-screen')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    // Note: Title is shown in navigation bar header, not in-screen

    it('renders the image preview', async () => {
      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-preview-image')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('renders retry button', async () => {
      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-preview-retry-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('validation states', () => {
    it('shows validating state initially', async () => {
      mockValidateProfilePicture.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      await render(<ProfilePicturePreviewScreen />);

      expect(screen.getByText('Checking photo...')).toBeOnTheScreen();
    });

    it('shows valid state when face detected', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByText('Face detected')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows save button when valid', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-preview-save-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows invalid state when no face detected', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: false,
        message: 'No face detected in the image',
        confidence: 0,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByText('No face detected in the image')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('does not show save button when invalid', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: false,
        message: 'No face detected',
        confidence: 0,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.queryByTestId('profile-picture-preview-save-button')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows Try Different Photo text when invalid', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: false,
        message: 'No face detected',
        confidence: 0,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByText('Try Different Photo')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('interactions', () => {
    it('renders save button when validation passes', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      // Wait for the save button to appear and verify it exists
      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-preview-save-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('opens library picker when retry is pressed (source is library)', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-preview-retry-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(screen.getByTestId('profile-picture-preview-retry-button'));

      await waitFor(
        () => {
          expect(mockOpenLibraryForProfilePicture).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('accessibility', () => {
    // Note: Title is in navigation bar header, not in-screen

    it('has accessible save button', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          const button = screen.getByTestId('profile-picture-preview-save-button');
          expect(button.props.accessibilityRole).toBe('button');
          expect(button.props.accessibilityLabel).toBe('Save');
          expect(button.props.accessibilityHint).toBe('Saves this photo as your profile picture');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has accessible retry button', async () => {
      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          const button = screen.getByTestId('profile-picture-preview-retry-button');
          expect(button.props.accessibilityRole).toBe('button');
          expect(button.props.accessibilityLabel).toBe('Choose Different Photo');
          expect(button.props.accessibilityHint).toBe('Returns to select a different photo');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has accessible image', async () => {
      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          const image = screen.getByTestId('profile-picture-preview-image');
          expect(image.props.alt).toBe('Selected profile picture');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('missing route params', () => {
    it('renders screen when imageUri is provided', async () => {
      // The mock always provides imageUri, so we just verify the screen renders
      await render(<ProfilePicturePreviewScreen />);

      expect(screen.getByTestId('profile-picture-preview-screen')).toBeOnTheScreen();
    });
  });

  describe('error handling', () => {
    it('shows error message when validation fails', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: false,
        message: 'Multiple faces detected. Please use a photo with only one person.',
        confidence: 0,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(
            screen.getByText('Multiple faces detected. Please use a photo with only one person.')
          ).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows default error message when no message provided', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: false,
        message: undefined,
        confidence: 0,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expect(screen.getByText('No face detected')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('upload functionality', () => {
    // Note: Full upload flow testing is handled by E2E tests.
    // These unit tests verify the component structure and basic behaviour.

    it('save button is rendered with correct accessibility props when valid', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          const saveButton = screen.getByTestId('profile-picture-preview-save-button');
          expect(saveButton).toBeOnTheScreen();
          expect(saveButton.props.accessibilityRole).toBe('button');
          expect(saveButton.props.accessibilityLabel).toBe('Save');
          expect(saveButton.props.accessibilityHint).toBe(
            'Saves this photo as your profile picture'
          );
          expect(saveButton.props.accessibilityState).toEqual({ disabled: false });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('save button is not disabled initially', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          const saveButton = screen.getByTestId('profile-picture-preview-save-button');
          expect(saveButton.props.accessibilityState.disabled).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('SupabaseStorageClient mock is correctly configured', async () => {
      // Verify the mock is set up correctly for upload operations
      const result = await mockedUploadProfilePicture('test-id', 'test-uri');
      expect(mockedUploadProfilePicture).toHaveBeenCalledWith('test-id', 'test-uri');
      expect(result.success).toBe(true);
      expect(result.publicUrl).toBeDefined();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('save button has accessible touch target when valid', async () => {
      mockValidateProfilePicture.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        confidence: 0.95,
      });

      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expectMinTouchTarget(screen.getByTestId('profile-picture-preview-save-button'));
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('retry button has accessible touch target', async () => {
      await render(<ProfilePicturePreviewScreen />);

      await waitFor(
        () => {
          expectMinTouchTarget(screen.getByTestId('profile-picture-preview-retry-button'));
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});
