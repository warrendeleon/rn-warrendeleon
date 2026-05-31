/**
 * Test Helper Functions
 *
 * Common test patterns extracted into reusable helpers.
 * Reduces duplication and improves test readability.
 */

import type { TestInstance } from 'test-renderer';
import type { RenderResult } from '@testing-library/react-native';
import { waitFor } from '@testing-library/react-native';

import type { mockNavigation } from './mocks/react-navigation';

/**
 * Submits a form and waits for it to complete processing.
 *
 * @param user - User event instance from @testing-library/react-native
 * @param submitButton - The submit button element
 * @param options - Optional configuration
 *
 * @example
 * ```typescript
 * const submitButton = getByTestId('submit-button');
 * await submitForm(user, submitButton);
 * expect(mockNavigate).toHaveBeenCalledWith('Home');
 * ```
 */
export async function submitForm(
  user: { press: (element: TestInstance) => Promise<void> },
  submitButton: TestInstance,
  options: {
    /** Timeout for waiting (default: 3000ms) */
    timeout?: number;
    /** Whether button shows busy state (default: true) */
    checksBusyState?: boolean;
  } = {}
): Promise<void> {
  const { timeout = 3000, checksBusyState = true } = options;

  await user.press(submitButton);

  if (checksBusyState) {
    await waitFor(
      () => {
        const busyState = submitButton.props.accessibilityState?.busy;
        expect(busyState).not.toBe(true);
      },
      { timeout }
    );
  }
}

/**
 * Fills a form field and triggers validation.
 *
 * @param user - User event instance
 * @param input - The input element
 * @param value - Value to enter
 *
 * @example
 * ```typescript
 * await fillField(user, emailInput, 'test@example.com');
 * expect(emailInput.props.value).toBe('test@example.com');
 * ```
 */
export async function fillField(
  user: { type: (element: TestInstance, text: string) => Promise<void> },
  input: TestInstance,
  value: string
): Promise<void> {
  await user.type(input, value);
}

/**
 * Fills multiple form fields at once.
 *
 * @param user - User event instance
 * @param fields - Map of input elements to values
 *
 * @example
 * ```typescript
 * await fillFields(user, {
 *   emailInput: 'test@example.com',
 *   passwordInput: 'Password123!',
 * });
 * ```
 */
export async function fillFields(
  user: { type: (element: TestInstance, text: string) => Promise<void> },
  fields: Record<string, { element: TestInstance; value: string }>
): Promise<void> {
  for (const { element, value } of Object.values(fields)) {
    await user.type(element, value);
  }
}

/**
 * Asserts that navigation was called with specific parameters.
 *
 * @param navigation - Mock navigation object
 * @param screen - Expected screen name
 * @param params - Optional expected params
 *
 * @example
 * ```typescript
 * expectNavigatedTo(mockNavigation, 'Home');
 * expectNavigatedTo(mockNavigation, 'Profile', { userId: '123' });
 * ```
 */
export function expectNavigatedTo(
  navigation: typeof mockNavigation,
  screen: string,
  params?: Record<string, unknown>
): void {
  if (params) {
    expect(navigation.navigate).toHaveBeenCalledWith(screen, params);
  } else {
    expect(navigation.navigate).toHaveBeenCalledWith(screen);
  }
}

/**
 * Asserts that a form field is in an error state with specific message.
 *
 * @param errorElement - Element displaying the error message
 * @param expectedMessage - Expected error message text
 *
 * @example
 * ```typescript
 * const errorText = getByTestId('email-error');
 * expectErrorMessage(errorText, 'Invalid email address');
 * ```
 */
export function expectErrorMessage(errorElement: TestInstance, expectedMessage: string): void {
  expect(errorElement).toBeOnTheScreen();
  // Check children for text content
  const hasMessage =
    errorElement.props.children?.includes?.(expectedMessage) ||
    errorElement.props.accessibilityLabel?.includes(expectedMessage);
  expect(hasMessage).toBe(true);
}

/**
 * Asserts that a field has validation error state.
 *
 * @param field - The form field element
 * @param isInvalid - Whether field should be invalid (default: true)
 *
 * @example
 * ```typescript
 * expectFieldValidationState(emailInput, true); // Expect invalid
 * expectFieldValidationState(passwordInput, false); // Expect valid
 * ```
 */
export function expectFieldValidationState(
  field: TestInstance,
  isInvalid: boolean = true
): void {
  const state = field.props.accessibilityState;
  expect(state?.invalid).toBe(isInvalid);
}

/**
 * Asserts that a button is in disabled state.
 *
 * @param button - The button element
 * @param isDisabled - Whether button should be disabled (default: true)
 *
 * @example
 * ```typescript
 * expectButtonDisabled(submitButton, true);
 * ```
 */
export function expectButtonDisabled(button: TestInstance, isDisabled: boolean = true): void {
  const state = button.props.accessibilityState;
  expect(state?.disabled).toBe(isDisabled);
}

/**
 * Asserts that a button is in loading/busy state.
 *
 * @param button - The button element
 * @param isBusy - Whether button should be busy (default: true)
 *
 * @example
 * ```typescript
 * await user.press(submitButton);
 * expectButtonBusy(submitButton, true);
 * ```
 */
export function expectButtonBusy(button: TestInstance, isBusy: boolean = true): void {
  const state = button.props.accessibilityState;
  expect(state?.busy).toBe(isBusy);
}

/**
 * Waits for loading state to complete.
 *
 * @param getByTestId - Query function from render result
 * @param loadingTestId - TestID of loading indicator
 * @param options - Wait options
 *
 * @example
 * ```typescript
 * await waitForLoadingComplete(getByTestId, 'loading-spinner');
 * ```
 */
export async function waitForLoadingComplete(
  queryByTestId: RenderResult['queryByTestId'],
  loadingTestId: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 3000 } = options;

  await waitFor(
    () => {
      expect(queryByTestId(loadingTestId)).toBeNull();
    },
    { timeout }
  );
}

/**
 * Asserts that a component renders without crashing.
 * Use this for smoke tests instead of toBeTruthy().
 *
 * @param renderResult - Result from render function
 *
 * @example
 * ```typescript
 * const result = renderWithProviders(<MyComponent />);
 * expectRendersSuccessfully(result);
 * ```
 */
export function expectRendersSuccessfully(renderResult: {
  toJSON: () => unknown;
  root: unknown;
}): void {
  expect(renderResult.toJSON()).not.toBeNull();
  expect(renderResult.root).toBeDefined();
}

/**
 * Asserts that a Storybook story renders correctly.
 * Checks for non-null render output.
 *
 * @param toJSON - toJSON function from render result
 * @param storyName - Name of the story for error messages
 *
 * @example
 * ```typescript
 * const { toJSON } = renderWithProviders(<DefaultStory />);
 * expectStoryRenders(toJSON, 'Default');
 * ```
 */
export function expectStoryRenders(toJSON: () => unknown, storyName: string): void {
  const output = toJSON();
  expect(output).not.toBeNull();
  if (output === null) {
    throw new Error(`Story "${storyName}" rendered null output`);
  }
}

/**
 * Asserts specific text is visible on screen.
 * More specific than toBeTruthy().
 *
 * @param getByText - Query function from render result
 * @param text - Text to find
 *
 * @example
 * ```typescript
 * expectTextVisible(getByText, 'Welcome');
 * ```
 */
export function expectTextVisible(
  getByText: (text: string | RegExp) => TestInstance,
  text: string | RegExp
): void {
  const element = getByText(text);
  expect(element).toBeOnTheScreen();
}

/**
 * Asserts an element with testID is visible on screen.
 *
 * @param getByTestId - Query function from render result
 * @param testId - TestID to find
 *
 * @example
 * ```typescript
 * expectElementVisible(getByTestId, 'submit-button');
 * ```
 */
export function expectElementVisible(
  getByTestId: (testId: string) => TestInstance,
  testId: string
): void {
  const element = getByTestId(testId);
  expect(element).toBeOnTheScreen();
}

/**
 * Mock storage interface for testing AsyncStorage operations
 */
export interface MockStorage {
  /** Internal store map - useful for test assertions */
  store: Map<string, string>;
  /** Mock getItem function */
  getItem: jest.Mock<Promise<string | null>, [string]>;
  /** Mock setItem function */
  setItem: jest.Mock<Promise<void>, [string, string]>;
  /** Mock removeItem function */
  removeItem: jest.Mock<Promise<void>, [string]>;
  /** Mock clear function */
  clear: jest.Mock<Promise<void>, []>;
}

/**
 * Creates a mock for async storage operations in tests.
 *
 * @returns Mock storage object with typed methods
 */
export function createMockStorage(): MockStorage {
  const store = new Map<string, string>();

  return {
    store,
    getItem: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store.clear();
      return Promise.resolve();
    }),
  };
}

/**
 * Fills form fields and submits, then waits for expected text to appear.
 * Combines common form submission pattern into one call.
 *
 * @param user - User event instance
 * @param fields - Array of field/value pairs to fill
 * @param submitButton - Button to press after filling
 * @param expectedText - Text to wait for after submission
 * @param getByText - Query function from render result
 *
 * @example
 * ```typescript
 * await fillFormAndSubmit(
 *   user,
 *   [{ element: emailInput, value: 'test@example.com' }],
 *   submitButton,
 *   'Success',
 *   getByText
 * );
 * ```
 */
export async function fillFormAndSubmit(
  user: {
    type: (element: TestInstance, text: string) => Promise<void>;
    press: (element: TestInstance) => Promise<void>;
  },
  fields: Array<{ element: TestInstance; value: string }>,
  submitButton: TestInstance,
  expectedText: string,
  getByText: (text: string | RegExp) => TestInstance
): Promise<void> {
  // Fill all fields
  for (const { element, value } of fields) {
    await user.type(element, value);
  }

  // Submit the form
  await user.press(submitButton);

  // Wait for expected result
  await waitFor(
    () => {
      expect(getByText(expectedText)).toBeOnTheScreen();
    },
    { timeout: 3000, interval: 100 }
  );
}

/**
 * Asserts that a validation error is displayed for a specific field.
 * Checks both the error message and field invalid state.
 *
 * @param field - The form field element
 * @param errorElement - Element displaying the error message
 * @param expectedError - Expected error message
 *
 * @example
 * ```typescript
 * expectValidationError(emailInput, emailError, 'Invalid email address');
 * ```
 */
export function expectValidationError(
  field: TestInstance,
  errorElement: TestInstance,
  expectedError: string
): void {
  // Field should be in invalid state
  expect(field.props.accessibilityState?.invalid).toBe(true);

  // Error should be visible
  expect(errorElement).toBeOnTheScreen();

  // Error message should match
  const hasMessage =
    errorElement.props.children?.includes?.(expectedError) ||
    errorElement.props.accessibilityLabel?.includes(expectedError);
  expect(hasMessage).toBe(true);
}

/**
 * Simulates pressing an element and asserts navigation occurred.
 * Combines press + navigation assertion.
 *
 * @param user - User event instance
 * @param element - Element to press
 * @param navigation - Mock navigation object
 * @param expectedScreen - Screen to navigate to
 * @param params - Optional navigation params
 *
 * @example
 * ```typescript
 * await pressAndExpectNavigation(user, loginButton, mockNavigation, 'Home');
 * ```
 */
export async function pressAndExpectNavigation(
  user: { press: (element: TestInstance) => Promise<void> },
  element: TestInstance,
  navigation: typeof mockNavigation,
  expectedScreen: string,
  params?: Record<string, unknown>
): Promise<void> {
  await user.press(element);

  await waitFor(
    () => {
      if (params) {
        expect(navigation.navigate).toHaveBeenCalledWith(expectedScreen, params);
      } else {
        expect(navigation.navigate).toHaveBeenCalledWith(expectedScreen);
      }
    },
    { timeout: 3000, interval: 100 }
  );
}

/**
 * Waits for an async action to complete and asserts success state.
 * Useful for testing API calls that show success feedback.
 *
 * @param getByText - Query function from render result
 * @param successText - Text indicating success
 * @param timeout - Maximum wait time (default: 3000ms)
 *
 * @example
 * ```typescript
 * await expectAsyncSuccess(getByText, 'Profile updated successfully');
 * ```
 */
export async function expectAsyncSuccess(
  getByText: (text: string | RegExp) => TestInstance,
  successText: string,
  timeout = 3000
): Promise<void> {
  await waitFor(
    () => {
      const element = getByText(successText);
      expect(element).toBeOnTheScreen();
    },
    { timeout }
  );
}

/**
 * Waits for an async action to fail and asserts error state.
 * Useful for testing API calls that show error feedback.
 *
 * @param getByText - Query function from render result
 * @param errorText - Text indicating error
 * @param timeout - Maximum wait time (default: 3000ms)
 *
 * @example
 * ```typescript
 * await expectAsyncError(getByText, 'Network error occurred');
 * ```
 */
export async function expectAsyncError(
  getByText: (text: string | RegExp) => TestInstance,
  errorText: string,
  timeout = 3000
): Promise<void> {
  await waitFor(
    () => {
      const element = getByText(errorText);
      expect(element).toBeOnTheScreen();
    },
    { timeout }
  );
}

/**
 * Default timeout options for waitFor calls.
 * Provides consistent, explicit timeouts across all async tests.
 */
export const DEFAULT_WAIT_OPTIONS = {
  /** Standard timeout for UI updates (1 second) */
  fast: { timeout: 1000, interval: 50 },
  /** Standard timeout for most async operations (3 seconds) */
  standard: { timeout: 3000, interval: 100 },
  /** Extended timeout for network operations (5 seconds) */
  network: { timeout: 5000, interval: 100 },
  /** Long timeout for complex flows (10 seconds) */
  long: { timeout: 10000, interval: 200 },
} as const;

/**
 * Type for wait options
 */
export type WaitOptions = {
  timeout?: number;
  interval?: number;
  onTimeout?: (error: Error) => Error;
};

/**
 * Wrapper around waitFor with explicit default timeout.
 * Prevents flaky tests by ensuring consistent timeout behaviour.
 *
 * @param callback - Function to wait for
 * @param options - Wait options (defaults to 3000ms timeout, 100ms interval)
 *
 * @example
 * ```typescript
 * // Basic usage with default timeout
 * await waitForWithTimeout(() => {
 *   expect(screen.getByText('Success')).toBeOnTheScreen();
 * });
 *
 * // With custom timeout
 * await waitForWithTimeout(
 *   () => expect(element).toBeOnTheScreen(),
 *   { timeout: 5000 }
 * );
 *
 * // Using preset options
 * await waitForWithTimeout(
 *   () => expect(element).toBeOnTheScreen(),
 *   DEFAULT_WAIT_OPTIONS.network
 * );
 * ```
 */
export async function waitForWithTimeout(
  callback: () => void | Promise<void>,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 3000, interval = 100, ...rest } = options;
  await waitFor(callback, { timeout, interval, ...rest });
}

/**
 * Waits for an element to appear on screen with explicit timeout.
 *
 * @param getElement - Function that returns the element
 * @param options - Wait options
 *
 * @example
 * ```typescript
 * await waitForElement(() => screen.getByTestId('success-message'));
 * ```
 */
export async function waitForElement(
  getElement: () => TestInstance,
  options: WaitOptions = {}
): Promise<TestInstance> {
  const { timeout = 3000, interval = 100 } = options;
  let element: TestInstance | undefined;

  await waitFor(
    () => {
      element = getElement();
      expect(element).toBeOnTheScreen();
    },
    { timeout, interval }
  );

  return element!;
}

/**
 * Waits for an element to disappear from screen with explicit timeout.
 *
 * @param queryElement - Function that queries for the element (returns null if not found)
 * @param options - Wait options
 *
 * @example
 * ```typescript
 * await waitForElementToDisappear(() => screen.queryByTestId('loading-spinner'));
 * ```
 */
export async function waitForElementToDisappear(
  queryElement: () => TestInstance | null,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 3000, interval = 100 } = options;

  await waitFor(
    () => {
      expect(queryElement()).toBeNull();
    },
    { timeout, interval }
  );
}

/**
 * Waits for text to appear on screen with explicit timeout.
 *
 * @param getByText - Query function from render result
 * @param text - Text to find
 * @param options - Wait options
 *
 * @example
 * ```typescript
 * await waitForText(screen.getByText, 'Welcome back!');
 * ```
 */
export async function waitForText(
  getByText: (text: string | RegExp) => TestInstance,
  text: string | RegExp,
  options: WaitOptions = {}
): Promise<TestInstance> {
  const { timeout = 3000, interval = 100 } = options;
  let element: TestInstance | undefined;

  await waitFor(
    () => {
      element = getByText(text);
      expect(element).toBeOnTheScreen();
    },
    { timeout, interval }
  );

  return element!;
}
