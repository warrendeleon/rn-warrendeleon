/**
 * PIN validation utilities
 *
 * Detects weak PIN patterns to ensure security:
 * - Sequential ascending (123456)
 * - Sequential descending (654321)
 * - Repeated digits (000000)
 * - Repeated pairs (121212)
 * - Common patterns (112233)
 */

/**
 * PIN error translation keys (must match keys in locale files)
 */
export type PINErrorKey =
  | 'auth.pin.errors.invalidLength'
  | 'auth.pin.errors.numbersOnly'
  | 'auth.pin.errors.sequential'
  | 'auth.pin.errors.repeated'
  | 'auth.pin.errors.repeatedPairs'
  | 'auth.pin.errors.tooCommon'
  | 'auth.pin.errors.mismatch';

export interface PINValidationResult {
  isValid: boolean;
  error?: string;
  errorKey?: PINErrorKey;
}

/**
 * Check if PIN is sequential ascending (e.g., 123456, 234567, 012345)
 */
const isSequentialAscending = (pin: string): boolean => {
  const digits = pin.split('').map(Number);

  for (let i = 1; i < digits.length; i++) {
    const prevDigit = digits[i - 1];
    const currDigit = digits[i];

    if (prevDigit === undefined || currDigit === undefined) {
      return false;
    }

    // Allow wrap-around from 9 to 0
    if (currDigit !== (prevDigit + 1) % 10) {
      return false;
    }
  }

  return true;
};

/**
 * Check if PIN is sequential descending (e.g., 654321, 543210, 987654)
 */
const isSequentialDescending = (pin: string): boolean => {
  const digits = pin.split('').map(Number);

  for (let i = 1; i < digits.length; i++) {
    const prevDigit = digits[i - 1];
    const currDigit = digits[i];

    if (prevDigit === undefined || currDigit === undefined) {
      return false;
    }

    // Allow wrap-around from 0 to 9
    if (currDigit !== (prevDigit - 1 + 10) % 10) {
      return false;
    }
  }

  return true;
};

/**
 * Check if all digits are the same (e.g., 000000, 111111)
 */
const isRepeatedDigits = (pin: string): boolean => {
  return new Set(pin.split('')).size === 1;
};

/**
 * Check if PIN is repeated pairs (e.g., 121212, 454545)
 */
const isRepeatedPairs = (pin: string): boolean => {
  if (pin.length % 2 !== 0) {
    return false;
  }

  const pair = pin.slice(0, 2);
  const expectedPin = pair.repeat(pin.length / 2);

  return pin === expectedPin;
};

/**
 * Common weak 6-digit PINs extracted from top 10,000 password list
 * These are the most frequently used PINs globally.
 * Note: Sequential (123456) and repeated (111111) patterns are already
 * caught by other validation rules, but included here for completeness.
 */
const COMMON_PINS = new Set([
  // From top 10K password list (179 six-digit numeric entries)
  '123456',
  '696969',
  '111111',
  '654321',
  '123123',
  '666666',
  '121212',
  '131313',
  '000000',
  '112233',
  '222222',
  '777777',
  '987654',
  '232323',
  '555555',
  '123321',
  '999999',
  '333333',
  '888888',
  '444444',
  '101010',
  '420420',
  '147147',
  '212121',
  '242424',
  '007007',
  '123654',
  '789456',
  '252525',
  '159753',
  '141414',
  '202020',
  '151515',
  '323232',
  '314159',
  '456789',
  '246810',
  '111222',
  '181818',
  '171717',
  '147258',
  '102030',
  '363636',
  '343434',
  '454545',
  '424242',
  '272727',
  '098765',
  '159357',
  '147852',
  '191919',
  '321321',
  '010101',
  '565656',
  '362436',
  '456123',
  '741852',
  '123789',
  '505050',
  '262626',
  '161616',
  '000007',
  '636363',
  '313131',
  '666999',
  '010203',
  '134679',
  '420247',
  '124578',
  '353535',
  '456456',
  '545454',
  '303030',
  '321654',
  '135790',
  '143143',
  '898989',
  '787878',
  '911911',
  '515151',
  '234567',
  '909090',
  '474747',
  '989898',
  '012345',
  '196969',
  '142536',
  '282828',
  '404040',
  '727272',
  '200000',
  '369369',
  '292929',
  '987456',
  '969696',
  '100000',
  '525252',
  '311311',
  '223344',
  '757575',
  '585858',
  '187187',
  '112358',
  '789789',
  '753951',
  '555666',
  '717171',
  '686868',
  '635241',
  '987987',
  '414141',
  '434343',
  '575757',
  '090909',
  '000001',
  '420000',
  '747474',
  '373737',
  '120676',
  '655321',
  '963852',
  '646464',
  '124038',
  '123457',
  '852456',
  '030303',
  '767676',
  '616161',
  '515000',
  '656565',
  '626262',
  '336699',
  '951753',
  '494949',
  '383838',
  '456654',
  '818181',
  '222333',
  '102938',
  '737373',
  '789987',
  '484848',
  '121314',
  '878787',
  '070462',
  '427900',
  '676767',
  '123987',
  '159159',
  '112211',
  '535353',
  '100100',
  '332211',
  '778899',
  '321123',
  '797979',
  '464646',
  '543210',
  '050505',
  '445566',
  '333666',
  '789654',
  '020202',
  '616913',
  '199999',
  '123098',
  '753159',
  '666777',
  '902100',
  '222777',
  '456321',
  '515051',
  '606060',
  '159951',
  '142857',
  '789123',
  '393939',
  '868686',
  '567890',
]);

/**
 * Check if PIN is in the common PINs list
 * Uses Set for O(1) lookup performance
 */
const isCommonPIN = (pin: string): boolean => {
  return COMMON_PINS.has(pin);
};

/**
 * Validate PIN strength
 *
 * @param pin - 6-digit PIN string
 * @returns Validation result with error message and i18n key if invalid
 *
 * @example
 * const result = validatePIN('123456');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 */
export const validatePIN = (pin: string): PINValidationResult => {
  // Check length
  if (pin.length !== 6) {
    return {
      isValid: false,
      error: 'PIN must be exactly 6 digits',
      errorKey: 'auth.pin.errors.invalidLength',
    };
  }

  // Check if all digits
  if (!/^\d{6}$/.test(pin)) {
    return {
      isValid: false,
      error: 'PIN must contain only numbers',
      errorKey: 'auth.pin.errors.numbersOnly',
    };
  }

  // Check sequential ascending
  if (isSequentialAscending(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be sequential (e.g., 123456)',
      errorKey: 'auth.pin.errors.sequential',
    };
  }

  // Check sequential descending
  if (isSequentialDescending(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be sequential (e.g., 654321)',
      errorKey: 'auth.pin.errors.sequential',
    };
  }

  // Check repeated digits
  if (isRepeatedDigits(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be all the same digit (e.g., 000000)',
      errorKey: 'auth.pin.errors.repeated',
    };
  }

  // Check repeated pairs
  if (isRepeatedPairs(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be repeated pairs (e.g., 121212)',
      errorKey: 'auth.pin.errors.repeatedPairs',
    };
  }

  // Check common PINs (179 entries from top 10K password list)
  if (isCommonPIN(pin)) {
    return {
      isValid: false,
      error: 'PIN is too common. Please choose a different PIN.',
      errorKey: 'auth.pin.errors.tooCommon',
    };
  }

  return { isValid: true };
};

/**
 * Compare two PINs for confirmation
 *
 * @param pin1 - First PIN entry
 * @param pin2 - Second PIN entry (confirmation)
 * @returns Validation result
 */
export const comparePINs = (pin1: string, pin2: string): PINValidationResult => {
  if (pin1 !== pin2) {
    return {
      isValid: false,
      error: 'PINs do not match. Please try again.',
      errorKey: 'auth.pin.errors.mismatch',
    };
  }

  return { isValid: true };
};
