/**
 * User Factory
 *
 * Creates mock user objects for testing with sensible defaults
 * and easy customisation via overrides.
 */

import type { AuthState } from '@app/features/Auth/store/reducer';

type UserType = NonNullable<AuthState['user']>;

/**
 * Default user values for testing
 */
const defaultUser: UserType = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: null,
  profilePicture: null,
  authProvider: 'email',
};

/**
 * Creates a mock user with optional overrides
 *
 * Type-safe factory with improved inference: explicitly provided fields are
 * guaranteed to be present in the return type with their exact types.
 *
 * @param overrides - Partial user object to override defaults
 * @returns Complete user object with overrides merged
 *
 * @example
 * ```typescript
 * // Default user
 * const user = createMockUser();
 *
 * // User with LinkedIn auth - authProvider is typed as 'linkedin'
 * const linkedInUser = createMockUser({
 *   authProvider: 'linkedin',
 *   email: 'linkedin@example.com',
 * });
 *
 * // User with profile picture - profilePicture is non-null in return type
 * const userWithPic = createMockUser({
 *   profilePicture: 'https://example.com/avatar.jpg',
 * });
 * ```
 */
export function createMockUser<T extends Partial<UserType>>(overrides?: T): UserType & T {
  return {
    ...defaultUser,
    ...overrides,
  } as UserType & T;
}

/**
 * Creates a verified user (email confirmed)
 *
 * @param overrides - Optional user field overrides
 * @returns Verified user object
 */
export function createVerifiedUser<T extends Partial<UserType>>(overrides?: T): UserType & T {
  return createMockUser({
    ...overrides,
  } as T);
}

/**
 * Creates a user with complete profile (all fields filled)
 *
 * @param overrides - Optional user field overrides
 * @returns User with all profile fields populated
 */
export function createCompleteUser<T extends Partial<UserType>>(
  overrides?: T
): UserType & {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string;
} & T {
  return createMockUser({
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+44 7123 456789',
    profilePicture: 'https://example.com/profile.jpg',
    ...overrides,
  } as T & { firstName: string; lastName: string; phoneNumber: string; profilePicture: string });
}

/**
 * Creates a user registered via LinkedIn OAuth
 *
 * @param overrides - Optional user field overrides
 * @returns User with LinkedIn auth provider
 */
export function createLinkedInUser<T extends Partial<UserType>>(
  overrides?: T
): UserType & { authProvider: 'linkedin' } & T {
  return createMockUser({
    authProvider: 'linkedin',
    firstName: 'LinkedIn',
    lastName: 'User',
    email: 'linkedin-user@example.com',
    ...overrides,
  } as T & { authProvider: 'linkedin' });
}

/**
 * Creates a user registered via magic link
 *
 * @param overrides - Optional user field overrides
 * @returns User with magic_link auth provider
 */
export function createMagicLinkUser<T extends Partial<UserType>>(
  overrides?: T
): UserType & { authProvider: 'magic_link' } & T {
  return createMockUser({
    authProvider: 'magic_link',
    email: 'magic-link@example.com',
    ...overrides,
  } as T & { authProvider: 'magic_link' });
}

/**
 * Creates multiple unique users for list/collection testing
 *
 * @param count - Number of users to create
 * @param baseOverrides - Overrides applied to all users
 * @returns Array of unique users with sequential IDs and emails
 */
export function createMockUsers<T extends Partial<UserType>>(
  count: number,
  baseOverrides?: T
): Array<UserType & T> {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `user-${index + 1}`,
      email: `user${index + 1}@example.com`,
      firstName: `User`,
      lastName: `${index + 1}`,
      ...baseOverrides,
    } as T)
  );
}
