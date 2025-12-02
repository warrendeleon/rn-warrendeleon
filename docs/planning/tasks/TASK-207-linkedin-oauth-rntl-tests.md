# TASK-207: LinkedIn OAuth RNTL Tests

**ID**: TASK-207 | **US**: [US-034](../stories/US-034-linkedin-oauth-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h | **Created**: 2025-11-21

---

## Context & Background

LinkedIn OAuth flow has many moving parts: button interaction → OAuth authorization → profile fetch → image download → account creation. Each step needs full test coverage to ensure reliability and catch regressions early.

**Why This Task Matters:**

OAuth flows are notoriously difficult to test due to:

- External dependencies (LinkedIn API, browser authorization)
- Async operations (network requests, image processing)
- Multiple failure points (user cancellation, network errors, profile fetch failures)
- Complex state management (loading, success, error states)

Full RNTL tests ensure:

- All user interactions work correctly
- All async operations are properly handled
- Error states display appropriate messages
- Loading states prevent duplicate requests
- Success flows navigate correctly

**Test Coverage Requirements:**

- LinkedInOAuthButton component (all states, interactions)
- useLinkedInAuth hook (all flows, error scenarios)
- InitialsAvatar component (already covered in TASK-206)
- Image download/processing utilities
- Redux thunk integration

---

## Objective

Build full React Native Testing Library test suite with 100% coverage for:

1. **LinkedInOAuthButton**: Rendering, button press, loading states, error states
2. **useLinkedInAuth hook**: Success flow, user cancellation, network errors, profile fetch errors
3. **OAuth flow integration**: End-to-end mock flow from button press to account creation
4. **Image processing**: Profile picture download, resize, upload, fallback to initials
5. **Error scenarios**: All error types with user-friendly messages
6. **Accessibility**: All accessibility props present and correct

---

## Detailed Implementation Guide

### Phase 1: LinkedInOAuthButton Component Tests (45 minutes)

**File**: `src/components/auth/__tests__/LinkedInOAuthButton.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LinkedInOAuthButton } from '../LinkedInOAuthButton';
import { useLinkedInAuth } from '@/hooks/useLinkedInAuth';

// Mock the hook
jest.mock('@/hooks/useLinkedInAuth');

describe('LinkedInOAuthButton', () => {
  const mockInitiateLinkedInAuth = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock return value
    (useLinkedInAuth as jest.Mock).mockReturnValue({
      initiateLinkedInAuth: mockInitiateLinkedInAuth,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  describe('Rendering', () => {
    it('renders correctly with default state', () => {
      const { getByTestId, getByText } = render(<LinkedInOAuthButton />);

      expect(getByTestId('linkedin-oauth-button')).toBeTruthy();
      expect(getByText('Continue with LinkedIn')).toBeTruthy();
    });

    it('displays LinkedIn logo', () => {
      const { getByTestId } = render(<LinkedInOAuthButton testID="linkedin-btn" />);

      // Logo is rendered as ButtonIcon component
      const button = getByTestId('linkedin-btn');
      expect(button).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      (useLinkedInAuth as jest.Mock).mockReturnValue({
        initiateLinkedInAuth: mockInitiateLinkedInAuth,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });

      const { getByTestId, getByText } = render(<LinkedInOAuthButton />);

      expect(getByTestId('linkedin-oauth-button-spinner')).toBeTruthy();
      expect(getByText('Connecting to LinkedIn...')).toBeTruthy();
    });

    it('disables button when isLoading is true', () => {
      (useLinkedInAuth as jest.Mock).mockReturnValue({
        initiateLinkedInAuth: mockInitiateLinkedInAuth,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });

      const { getByTestId } = render(<LinkedInOAuthButton />);
      const button = getByTestId('linkedin-oauth-button');

      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('does not call initiateLinkedInAuth when button is pressed while loading', () => {
      (useLinkedInAuth as jest.Mock).mockReturnValue({
        initiateLinkedInAuth: mockInitiateLinkedInAuth,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });

      const { getByTestId } = render(<LinkedInOAuthButton />);
      const button = getByTestId('linkedin-oauth-button');

      fireEvent.press(button);

      expect(mockInitiateLinkedInAuth).not.toHaveBeenCalled();
    });
  });

  describe('Button Interaction', () => {
    it('calls initiateLinkedInAuth when button is pressed', async () => {
      mockInitiateLinkedInAuth.mockResolvedValue({
        success: true,
        userData: {
          email: 'test@example.com',
          fullName: 'John Doe',
        },
      });

      const { getByTestId } = render(<LinkedInOAuthButton />);
      const button = getByTestId('linkedin-oauth-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(mockInitiateLinkedInAuth).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onSuccess callback when authentication succeeds', async () => {
      const mockOnSuccess = jest.fn();
      const userData = {
        email: 'test@example.com',
        fullName: 'John Doe',
        profilePictureUrl: 'https://example.com/profile.jpg',
      };

      mockInitiateLinkedInAuth.mockResolvedValue({
        success: true,
        userData,
      });

      const { getByTestId } = render(<LinkedInOAuthButton onSuccess={mockOnSuccess} />);

      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(userData);
      });
    });

    it('calls onError callback when authentication fails', async () => {
      const mockOnError = jest.fn();
      const error = new Error('LinkedIn authentication failed');

      mockInitiateLinkedInAuth.mockRejectedValue(error);

      const { getByTestId } = render(<LinkedInOAuthButton onError={mockOnError} />);

      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Error States', () => {
    it('displays error message when authentication fails', async () => {
      const errorMessage = 'LinkedIn authentication failed';
      mockInitiateLinkedInAuth.mockRejectedValue(new Error(errorMessage));

      const { getByTestId, getByText } = render(<LinkedInOAuthButton />);

      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByTestId('linkedin-oauth-button-error')).toBeTruthy();
      });
    });

    it('displays error from hook state', () => {
      const errorMessage = 'Network error';

      (useLinkedInAuth as jest.Mock).mockReturnValue({
        initiateLinkedInAuth: mockInitiateLinkedInAuth,
        isLoading: false,
        error: errorMessage,
        clearError: mockClearError,
      });

      const { getByText, getByTestId } = render(<LinkedInOAuthButton />);

      expect(getByText(errorMessage)).toBeTruthy();
      expect(getByTestId('linkedin-oauth-button-error')).toBeTruthy();
    });

    it('shows red border when error is present', async () => {
      mockInitiateLinkedInAuth.mockRejectedValue(new Error('Error occurred'));

      const { getByTestId } = render(<LinkedInOAuthButton />);

      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        const button = getByTestId('linkedin-oauth-button');
        // Check for error border colour in sx prop
        expect(button.props.sx.borderColor).toMatch(/error/);
      });
    });

    it('clears previous error when button is pressed again', async () => {
      const { getByTestId } = render(<LinkedInOAuthButton />);

      // First press: cause error
      mockInitiateLinkedInAuth.mockRejectedValueOnce(new Error('First error'));
      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(getByTestId('linkedin-oauth-button-error')).toBeTruthy();
      });

      // Second press: success
      mockInitiateLinkedInAuth.mockResolvedValueOnce({
        success: true,
        userData: { email: 'test@example.com', fullName: 'John Doe' },
      });

      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      const { getByTestId } = render(<LinkedInOAuthButton />);
      const button = getByTestId('linkedin-oauth-button');

      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility label', () => {
      const { getByTestId } = render(<LinkedInOAuthButton />);
      const button = getByTestId('linkedin-oauth-button');

      expect(button.props.accessibilityLabel).toBe('Continue with LinkedIn');
    });

    it('has correct accessibility hint', () => {
      const { getByTestId } = render(<LinkedInOAuthButton />);
      const button = getByTestId('linkedin-oauth-button');

      expect(button.props.accessibilityHint).toBe('Sign up or log in using your LinkedIn account');
    });

    it('sets accessibilityState.disabled when loading', () => {
      (useLinkedInAuth as jest.Mock).mockReturnValue({
        initiateLinkedInAuth: mockInitiateLinkedInAuth,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });

      const { getByTestId } = render(<LinkedInOAuthButton />);
      const button = getByTestId('linkedin-oauth-button');

      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(button.props.accessibilityState.busy).toBe(true);
    });

    it('error message has accessibilityRole="alert"', async () => {
      mockInitiateLinkedInAuth.mockRejectedValue(new Error('Test error'));

      const { getByTestId } = render(<LinkedInOAuthButton />);

      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        const errorElement = getByTestId('linkedin-oauth-button-error');
        expect(errorElement.props.accessibilityRole).toBe('alert');
        expect(errorElement.props.accessibilityLive).toBe('assertive');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onSuccess callback gracefully', async () => {
      mockInitiateLinkedInAuth.mockResolvedValue({
        success: true,
        userData: { email: 'test@example.com', fullName: 'John Doe' },
      });

      const { getByTestId } = render(<LinkedInOAuthButton />);

      // Should not throw
      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(mockInitiateLinkedInAuth).toHaveBeenCalled();
      });
    });

    it('handles missing onError callback gracefully', async () => {
      mockInitiateLinkedInAuth.mockRejectedValue(new Error('Test error'));

      const { getByTestId } = render(<LinkedInOAuthButton />);

      // Should not throw
      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(mockInitiateLinkedInAuth).toHaveBeenCalled();
      });
    });

    it('handles non-Error rejection values', async () => {
      mockInitiateLinkedInAuth.mockRejectedValue('String error');

      const { getByTestId, getByText } = render(<LinkedInOAuthButton />);

      fireEvent.press(getByTestId('linkedin-oauth-button'));

      await waitFor(() => {
        expect(getByText('LinkedIn authentication failed')).toBeTruthy();
      });
    });
  });
});
```

### Phase 2: useLinkedInAuth Hook Tests (45 minutes)

**File**: `src/hooks/__tests__/useLinkedInAuth.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useLinkedInAuth } from '../useLinkedInAuth';
import { authorize } from 'react-native-app-auth';
import { downloadAndProcessImage } from '@/utils/image.utils';
import { uploadProfilePicture } from '@/services/supabase/storage.service';
import { registerWithLinkedIn } from '@/store/slices/authSlice';

// Mocks
jest.mock('react-native-app-auth');
jest.mock('@/utils/image.utils');
jest.mock('@/services/supabase/storage.service');
jest.mock('@/store/slices/authSlice');
jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => jest.fn(action => action),
}));

describe('useLinkedInAuth', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (authorize as jest.Mock).mockResolvedValue({
      accessToken: 'test-access-token',
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: 'linkedin-user-123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://linkedin.com/profile.jpg',
      }),
    });

    (downloadAndProcessImage as jest.Mock).mockResolvedValue({
      uri: 'file://processed-image.jpg',
      width: 800,
      height: 800,
      size: 50000,
    });

    (uploadProfilePicture as jest.Mock).mockResolvedValue({
      publicUrl: 'https://supabase.co/storage/profile.jpg',
    });

    (registerWithLinkedIn as any).mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        id: 'user-123',
        email: 'john@example.com',
        fullName: 'John Doe',
      }),
    });
  });

  describe('Successful OAuth Flow', () => {
    it('completes full OAuth flow successfully', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      expect(result.current.isLoading).toBe(true);

      await waitForNextUpdate();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('calls LinkedIn authorize with correct config', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(authorize).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: expect.any(String),
          redirectUrl: expect.any(String),
          scopes: ['openid', 'profile', 'email'],
        })
      );
    });

    it('fetches LinkedIn profile with access token', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.linkedin.com/v2/userinfo',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        })
      );
    });

    it('downloads and processes profile picture', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(downloadAndProcessImage).toHaveBeenCalledWith(
        'https://linkedin.com/profile.jpg',
        expect.objectContaining({
          width: 800,
          height: 800,
          quality: 0.8,
          format: 'JPEG',
        })
      );
    });

    it('uploads processed image to Supabase', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(uploadProfilePicture).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'file://processed-image.jpg',
          mimeType: 'image/jpeg',
        })
      );
    });

    it('registers user via Redux thunk', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(registerWithLinkedIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          fullName: 'John Doe',
          profilePictureUrl: 'https://supabase.co/storage/profile.jpg',
          linkedInUserId: 'linkedin-user-123',
        })
      );
    });

    it('returns success with user data', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      let authResult;

      act(() => {
        authResult = result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      const data = await authResult;

      expect(data).toEqual({
        success: true,
        userData: expect.objectContaining({
          email: 'john@example.com',
          fullName: 'John Doe',
        }),
      });
    });
  });

  describe('Error Handling', () => {
    it('handles user cancellation', async () => {
      (authorize as jest.Mock).mockRejectedValue(new Error('User cancelled flow'));

      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(
        'LinkedIn sign-in was cancelled. Please try again if you want to continue.'
      );
    });

    it('handles network errors', async () => {
      (authorize as jest.Mock).mockRejectedValue(new Error('Network request failed'));

      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(result.current.error).toMatch(/Network error/);
    });

    it('handles missing access token', async () => {
      (authorize as jest.Mock).mockResolvedValue({});

      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(result.current.error).toMatch(/Failed to obtain access token/);
    });

    it('handles profile fetch failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
        text: async () => 'Access denied',
      });

      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(result.current.error).toMatch(/Failed to fetch LinkedIn profile/);
    });

    it('handles missing email in profile', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sub: 'linkedin-user-123',
          name: 'John Doe',
          // email missing
        }),
      });

      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(result.current.error).toMatch(/Email address not provided/);
    });

    it('continues flow if profile picture upload fails', async () => {
      (downloadAndProcessImage as jest.Mock).mockRejectedValue(new Error('Download failed'));

      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      // Should still succeed, but without profile picture
      expect(result.current.error).toBeNull();
      expect(registerWithLinkedIn).toHaveBeenCalledWith(
        expect.objectContaining({
          profilePictureUrl: undefined, // Fallback to initials avatar
        })
      );
    });
  });

  describe('clearError', () => {
    it('clears error state', async () => {
      (authorize as jest.Mock).mockRejectedValue(new Error('Test error'));

      const { result, waitForNextUpdate } = renderHook(() => useLinkedInAuth());

      act(() => {
        result.current.initiateLinkedInAuth();
      });

      await waitForNextUpdate();

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
```

### Phase 3: Run Tests & Verify Coverage (30 minutes)

**Run tests**:

```bash
# Run all LinkedIn OAuth tests
yarn test src/components/auth/__tests__/LinkedInOAuthButton.test.tsx
yarn test src/hooks/__tests__/useLinkedInAuth.test.ts

# Generate coverage report
yarn test:coverage --collectCoverageFrom="src/components/auth/LinkedInOAuthButton.tsx" --collectCoverageFrom="src/hooks/useLinkedInAuth.ts"
```

**Expected Coverage**:

```
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
LinkedInOAuthButton.tsx       | 100     | 100      | 100     | 100
useLinkedInAuth.ts            | 100     | 100      | 100     | 100
```

---

## Acceptance Criteria

- [ ] LinkedInOAuthButton renders correctly
- [ ] Button press triggers OAuth flow
- [ ] Loading state shows spinner and "Connecting to LinkedIn..." text
- [ ] Loading state disables button
- [ ] Success callback called with user data
- [ ] Error callback called when authentication fails
- [ ] Error message displayed below button
- [ ] Error shows red border on button
- [ ] Accessibility props tested (role, label, hint, state)
- [ ] Error has `accessibilityRole="alert"` and `accessibilityLive="assertive"`
- [ ] Hook completes full OAuth flow (authorize → profile fetch → image download → upload → register)
- [ ] Hook handles user cancellation
- [ ] Hook handles network errors
- [ ] Hook handles missing profile data
- [ ] Hook continues flow if picture upload fails (fallback to initials)
- [ ] clearError function clears error state
- [ ] 100% test coverage for component and hook

---

## Troubleshooting

### Issue: "Mock not being called in test"

**Cause**: Hook/module not properly mocked

**Solution**: Ensure mocks are set up before rendering:

```typescript
jest.mock('@/hooks/useLinkedInAuth');

beforeEach(() => {
  (useLinkedInAuth as jest.Mock).mockReturnValue({ ... });
});
```

### Issue: "act() warning in console"

**Cause**: State updates not wrapped in act()

**Solution**: Use waitFor or act() for async operations:

```typescript
await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});
```

### Issue: "Coverage not 100%"

**Cause**: Missing test cases for some branches

**Solution**: Check coverage report to identify untested lines:

```bash
yarn test:coverage --collectCoverageFrom="src/components/auth/LinkedInOAuthButton.tsx"
```

---

**Effort**: 2h | **Last Updated**: 2025-11-21
