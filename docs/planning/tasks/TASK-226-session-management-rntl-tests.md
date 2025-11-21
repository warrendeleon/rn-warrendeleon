# TASK-226: Session Management RNTL Tests

**ID**: TASK-226 | **Title**: Write RNTL Tests for Session Management Hooks
**User Story**: [US-038](../stories/US-038-session-management.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 1.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Objective

Write comprehensive RNTL tests for:

1. useTokenRefresh hook
2. useInactivityTimeout hook
3. useAppStateListener hook
4. JWT utilities

**Coverage Target**: 100%

---

## Test Files

### File 1: `src/hooks/__tests__/useTokenRefresh.test.ts`

```typescript
import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { refreshAccessToken } from '../../api/auth/refresh';

jest.mock('axios');
jest.mock('react-native-keychain');

describe('refreshAccessToken', () => {
  it('should refresh token successfully', async () => {
    const mockResponse = {
      data: {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 3600,
        token_type: 'bearer',
      },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await refreshAccessToken('old_refresh_token');

    expect(result.accessToken).toBe('new_access_token');
    expect(result.refreshToken).toBe('new_refresh_token');
  });

  it('should retry on network error', async () => {
    (axios.post as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        data: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          expires_in: 3600,
          token_type: 'bearer',
        },
      });

    const result = await refreshAccessToken('token');

    expect(result.accessToken).toBe('new_access_token');
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
```

### File 2: `src/hooks/__tests__/useInactivityTimeout.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useInactivityTimeout } from '../useInactivityTimeout';
import { Provider } from 'react-redux';
import { store } from '../../store';

jest.useFakeTimers();

describe('useInactivityTimeout', () => {
  it('should logout after 5 minutes of inactivity', () => {
    const { result } = renderHook(() => useInactivityTimeout(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000 + 30 * 1000);
    });

    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});
```

### File 3: `src/utils/__tests__/jwt.test.ts`

```typescript
import { decodeJWT, isTokenExpired } from '../jwt';

describe('JWT Utilities', () => {
  it('should decode valid JWT', () => {
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzM1MDAwMDAwfQ.signature';
    const decoded = decodeJWT(validToken);
    expect(decoded.sub).toBe('1234567890');
    expect(decoded.email).toBe('test@example.com');
  });

  it('should detect expired token', () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjAwMDAwMDAwfQ.signature';
    expect(isTokenExpired(expiredToken)).toBe(true);
  });
});
```

---

## Acceptance Criteria

- [ ] 100% coverage for all hooks
- [ ] 100% coverage for JWT utilities
- [ ] All edge cases tested
- [ ] All error scenarios tested

---

## Definition of Done

- [ ] All test files created
- [ ] All tests passing: `yarn test --coverage`
- [ ] 100% coverage
- [ ] `yarn validate` passes

---

**Dependencies**: TASK-222, TASK-223, TASK-224, TASK-225

**Next Task**: [TASK-227](TASK-227-biometric-prompt-screen.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 1.5 hours
