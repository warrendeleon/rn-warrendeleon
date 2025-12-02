/**
 * Sensitive Data Masking Utility
 *
 * Masks sensitive information in logs to prevent accidental exposure of:
 * - JWT tokens (Bearer tokens, access/refresh tokens)
 * - Email addresses
 * - Passwords
 * - PII (phone numbers, addresses, names in sensitive contexts)
 *
 * Used by logger utility to sanitise data before logging.
 */

/** Masked value placeholders */
const MASKED = {
  TOKEN: '[MASKED_TOKEN]',
  EMAIL: '[MASKED_EMAIL]',
  PASSWORD: '[MASKED]',
  PHONE: '[MASKED_PHONE]',
  ADDRESS: '[MASKED_ADDRESS]',
  CREDIT_CARD: '[MASKED_CARD]',
  SSN: '[MASKED_SSN]',
} as const;

/** Fields that should always have their values masked */
const SENSITIVE_FIELDS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'oldPassword',
  'secret',
  'apiKey',
  'apiSecret',
  'accessToken',
  'refreshToken',
  'token',
  'authToken',
  'bearerToken',
  'idToken',
  'sessionToken',
  'pin',
  'cvv',
  'cvc',
  'securityCode',
  'ssn',
  'socialSecurityNumber',
  'taxId',
  'creditCard',
  'cardNumber',
  'accountNumber',
]);

/** Fields that contain email addresses */
const EMAIL_FIELDS = new Set(['email', 'emailAddress', 'userEmail', 'contactEmail']);

/** Fields that contain phone numbers */
const PHONE_FIELDS = new Set([
  'phone',
  'phoneNumber',
  'mobile',
  'mobileNumber',
  'telephone',
  'cell',
  'cellPhone',
]);

/** Fields that contain address information */
const ADDRESS_FIELDS = new Set([
  'address',
  'streetAddress',
  'street',
  'addressLine1',
  'addressLine2',
  'fullAddress',
  'homeAddress',
  'billingAddress',
  'shippingAddress',
]);

/**
 * Regular expression patterns for detecting sensitive data in strings
 */
const PATTERNS = {
  // JWT tokens: header.payload.signature format
  JWT: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,

  // Bearer token in Authorization header
  BEARER: /Bearer\s+[A-Za-z0-9_-]+\.?[A-Za-z0-9_-]*\.?[A-Za-z0-9_-]*/gi,

  // Email addresses (RFC 5322 simplified)
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Password in JSON strings: "password": "value" or 'password': 'value'
  PASSWORD_JSON:
    /"(password|newPassword|currentPassword|confirmPassword|oldPassword|secret|pin)":\s*"[^"]*"/gi,

  // UK phone numbers: +44, 07, 01onal formats
  PHONE_UK: /(\+44\s?|0)(\d\s?){10,11}/g,

  // US phone numbers: (xxx) xxx-xxxx, xxx-xxx-xxxx, etc.
  PHONE_US: /(\+1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,

  // International phone: +country code followed by digits
  PHONE_INTL: /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,

  // Credit card numbers (basic pattern)
  CREDIT_CARD: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,

  // US Social Security Number
  SSN: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,

  // UK National Insurance Number
  NI_NUMBER: /\b[A-Za-z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-Za-z]\b/g,
} as const;

/**
 * Check if a string looks like it might be a standalone token
 * (not a string that contains a token embedded within other text)
 */
const looksLikeToken = (value: string): boolean => {
  // Base64-like string longer than 20 chars with no spaces
  if (value.length > 20 && /^[A-Za-z0-9_-]+$/.test(value)) {
    return true;
  }
  // Entire string is a JWT (not just contains one)
  if (/^eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/.test(value)) {
    return true;
  }
  return false;
};

/**
 * Mask sensitive patterns in a string
 */
const maskString = (str: string): string => {
  let result = str;

  // Mask Bearer tokens first (includes JWT)
  result = result.replace(PATTERNS.BEARER, `Bearer ${MASKED.TOKEN}`);

  // Mask standalone JWT tokens
  result = result.replace(PATTERNS.JWT, MASKED.TOKEN);

  // Mask password fields in JSON
  result = result.replace(PATTERNS.PASSWORD_JSON, match => {
    const fieldMatch = match.match(/"([^"]+)":/);
    const field = fieldMatch ? fieldMatch[1] : 'password';
    return `"${field}": "${MASKED.PASSWORD}"`;
  });

  // Mask email addresses
  result = result.replace(PATTERNS.EMAIL, MASKED.EMAIL);

  // Mask credit card numbers
  result = result.replace(PATTERNS.CREDIT_CARD, MASKED.CREDIT_CARD);

  // Mask SSN
  result = result.replace(PATTERNS.SSN, MASKED.SSN);

  // Mask NI numbers
  result = result.replace(PATTERNS.NI_NUMBER, MASKED.SSN);

  // Mask phone numbers (order matters - most specific first)
  result = result.replace(PATTERNS.PHONE_INTL, MASKED.PHONE);
  result = result.replace(PATTERNS.PHONE_UK, MASKED.PHONE);
  result = result.replace(PATTERNS.PHONE_US, MASKED.PHONE);

  return result;
};

/**
 * Mask a value based on its field name
 */
const maskByFieldName = (fieldName: string, value: unknown): unknown => {
  const lowerFieldName = fieldName.toLowerCase();

  // Check if field is in sensitive fields list
  for (const sensitiveField of SENSITIVE_FIELDS) {
    if (lowerFieldName === sensitiveField.toLowerCase()) {
      return MASKED.PASSWORD;
    }
  }

  // Check email fields
  for (const emailField of EMAIL_FIELDS) {
    if (lowerFieldName === emailField.toLowerCase()) {
      return MASKED.EMAIL;
    }
  }

  // Check phone fields
  for (const phoneField of PHONE_FIELDS) {
    if (lowerFieldName === phoneField.toLowerCase()) {
      return MASKED.PHONE;
    }
  }

  // Check address fields
  for (const addressField of ADDRESS_FIELDS) {
    if (lowerFieldName === addressField.toLowerCase()) {
      return MASKED.ADDRESS;
    }
  }

  return value;
};

/**
 * Internal recursive masking function with circular reference detection
 */
const maskDataRecursive = (
  data: unknown,
  fieldName: string | undefined,
  seen: WeakSet<object>
): unknown => {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === 'string') {
    // If we have a field name, check if it's a sensitive field
    if (fieldName) {
      const maskedByField = maskByFieldName(fieldName, data);
      if (maskedByField !== data) {
        return maskedByField;
      }
    }

    // Check if it looks like a standalone token
    if (looksLikeToken(data)) {
      return MASKED.TOKEN;
    }

    // Apply pattern-based masking
    return maskString(data);
  }

  // Handle arrays
  if (Array.isArray(data)) {
    // Check for circular reference
    if (seen.has(data)) {
      return '[Circular Reference]';
    }
    seen.add(data);
    return data.map(item => maskDataRecursive(item, undefined, seen));
  }

  // Handle objects
  if (typeof data === 'object') {
    // Check for circular reference
    if (seen.has(data)) {
      return '[Circular Reference]';
    }
    seen.add(data);

    const masked: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      masked[key] = maskDataRecursive(value, key, seen);
    }

    return masked;
  }

  // Return primitives as-is (numbers, booleans)
  return data;
};

/**
 * Recursively mask sensitive data in any data structure
 *
 * @param data - The data to mask (string, object, array, or primitive)
 * @param fieldName - Optional field name for context-aware masking
 * @returns The masked data with the same structure
 *
 * @example
 * // Mask a string with sensitive data
 * maskSensitiveData('Bearer eyJhbGc...');
 * // Returns: 'Bearer [MASKED_TOKEN]'
 *
 * @example
 * // Mask an object with sensitive fields
 * maskSensitiveData({ email: 'user@test.com', password: 'secret123' });
 * // Returns: { email: '[MASKED_EMAIL]', password: '[MASKED]' }
 */
export const maskSensitiveData = (data: unknown, fieldName?: string): unknown => {
  return maskDataRecursive(data, fieldName, new WeakSet());
};

/**
 * Mask sensitive data and convert to string for logging
 *
 * @param data - The data to mask and stringify
 * @returns A string safe for logging
 */
export const maskAndStringify = (data: unknown): string => {
  const masked = maskSensitiveData(data);

  if (typeof masked === 'string') {
    return masked;
  }

  try {
    return JSON.stringify(masked, null, 2);
  } catch {
    return '[Unable to stringify data]';
  }
};

// Export constants for testing
export const _internals = {
  MASKED,
  SENSITIVE_FIELDS,
  EMAIL_FIELDS,
  PHONE_FIELDS,
  ADDRESS_FIELDS,
  PATTERNS,
  maskString,
  maskByFieldName,
  looksLikeToken,
};
