/**
 * PIN Validation Tests
 *
 * Tests for weak PIN pattern detection and PIN comparison.
 */

import { comparePINs, validatePIN } from '../pinValidation';

describe('pinValidation', () => {
  describe('validatePIN', () => {
    describe('Length validation', () => {
      it('should reject PIN with less than 6 digits', () => {
        const result = validatePIN('12345');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.invalidLength');
      });

      it('should reject PIN with more than 6 digits', () => {
        const result = validatePIN('1234567');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.invalidLength');
      });

      it('should reject empty PIN', () => {
        const result = validatePIN('');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.invalidLength');
      });
    });

    describe('Numeric validation', () => {
      it('should reject PIN containing letters', () => {
        const result = validatePIN('12345a');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.numbersOnly');
      });

      it('should reject PIN containing special characters', () => {
        const result = validatePIN('12345!');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.numbersOnly');
      });

      it('should reject PIN containing spaces', () => {
        const result = validatePIN('12345 ');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.numbersOnly');
      });
    });

    describe('Sequential ascending detection', () => {
      it('should reject 123456', () => {
        const result = validatePIN('123456');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });

      it('should reject 234567', () => {
        const result = validatePIN('234567');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });

      it('should reject 012345', () => {
        const result = validatePIN('012345');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });

      it('should reject 890123 (wrap-around)', () => {
        const result = validatePIN('890123');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });
    });

    describe('Sequential descending detection', () => {
      it('should reject 654321', () => {
        const result = validatePIN('654321');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });

      it('should reject 543210', () => {
        const result = validatePIN('543210');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });

      it('should reject 987654', () => {
        const result = validatePIN('987654');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });

      it('should reject 210987 (wrap-around)', () => {
        const result = validatePIN('210987');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.sequential');
      });
    });

    describe('Repeated digits detection', () => {
      it('should reject 000000', () => {
        const result = validatePIN('000000');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.repeated');
      });

      it('should reject 111111', () => {
        const result = validatePIN('111111');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.repeated');
      });

      it('should reject 999999', () => {
        const result = validatePIN('999999');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.repeated');
      });
    });

    describe('Repeated pairs detection', () => {
      it('should reject 121212', () => {
        const result = validatePIN('121212');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.repeatedPairs');
      });

      it('should reject 454545', () => {
        const result = validatePIN('454545');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.repeatedPairs');
      });

      it('should reject 909090', () => {
        const result = validatePIN('909090');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.repeatedPairs');
      });
    });

    describe('Common PINs detection (179 from top 10K passwords)', () => {
      it('should reject 112233', () => {
        const result = validatePIN('112233');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.tooCommon');
      });

      it('should reject 696969', () => {
        const result = validatePIN('696969');

        // 696969 is caught by repeatedPairs check (69 repeats 3 times) before tooCommon
        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.repeatedPairs');
      });

      it('should reject 420420', () => {
        const result = validatePIN('420420');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.tooCommon');
      });

      it('should reject 314159 (pi digits)', () => {
        const result = validatePIN('314159');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.tooCommon');
      });

      it('should reject 007007', () => {
        const result = validatePIN('007007');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.tooCommon');
      });

      it('should reject 911911', () => {
        const result = validatePIN('911911');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.tooCommon');
      });

      it('should reject 142857 (1/7 repeating)', () => {
        const result = validatePIN('142857');

        expect(result.isValid).toBe(false);
        expect(result.errorKey).toBe('auth.pin.errors.tooCommon');
      });
    });

    describe('Valid PINs', () => {
      it('should accept 742589', () => {
        const result = validatePIN('742589');

        expect(result.isValid).toBe(true);
        expect(result.errorKey).toBeUndefined();
        expect(result.error).toBeUndefined();
      });

      it('should accept 839271', () => {
        const result = validatePIN('839271');

        expect(result.isValid).toBe(true);
      });

      it('should accept 503816', () => {
        const result = validatePIN('503816');

        expect(result.isValid).toBe(true);
      });

      it('should accept PIN with repeated but not all same digits', () => {
        const result = validatePIN('112345');

        expect(result.isValid).toBe(true);
      });

      it('should accept PIN with partial sequence', () => {
        // 938271 has a partial sequence (321) but is not fully sequential
        const result = validatePIN('938271');

        expect(result.isValid).toBe(true);
      });

      it('should accept PIN explicitly not in common list', () => {
        // 847293 is a random 6-digit PIN that is NOT in the COMMON_PINS set
        const result = validatePIN('847293');

        expect(result.isValid).toBe(true);
        expect(result.errorKey).toBeUndefined();
      });

      it('should accept PIN with leading zeros that is not sequential', () => {
        // 007890 is not sequential (would need 006789 or 078901)
        const result = validatePIN('083746');

        expect(result.isValid).toBe(true);
      });
    });

    describe('Error message strings', () => {
      it('should include error message for invalid length', () => {
        const result = validatePIN('12345');

        expect(result.error).toBe('PIN must be exactly 6 digits');
      });

      it('should include error message for non-numeric', () => {
        const result = validatePIN('12345a');

        expect(result.error).toBe('PIN must contain only numbers');
      });

      it('should include error message for sequential', () => {
        const result = validatePIN('123456');

        expect(result.error).toBe('PIN cannot be sequential (e.g., 123456)');
      });

      it('should include error message for repeated', () => {
        const result = validatePIN('000000');

        expect(result.error).toBe('PIN cannot be all the same digit (e.g., 000000)');
      });

      it('should include error message for repeated pairs', () => {
        const result = validatePIN('121212');

        expect(result.error).toBe('PIN cannot be repeated pairs (e.g., 121212)');
      });

      it('should include error message for common PIN', () => {
        const result = validatePIN('112233');

        expect(result.error).toBe('PIN is too common. Please choose a different PIN.');
      });
    });
  });

  describe('comparePINs', () => {
    it('should return valid when PINs match', () => {
      const result = comparePINs('742589', '742589');

      expect(result.isValid).toBe(true);
      expect(result.errorKey).toBeUndefined();
    });

    it('should return invalid when PINs do not match', () => {
      const result = comparePINs('742589', '742580');

      expect(result.isValid).toBe(false);
      expect(result.errorKey).toBe('auth.pin.errors.mismatch');
    });

    it('should return invalid when one PIN is empty', () => {
      const result = comparePINs('742589', '');

      expect(result.isValid).toBe(false);
      expect(result.errorKey).toBe('auth.pin.errors.mismatch');
    });

    it('should return valid when both PINs are empty (edge case - matching empty strings)', () => {
      // Note: This tests the current behaviour where matching empty strings are "valid"
      // The caller should validate PIN format separately before calling comparePINs
      const result = comparePINs('', '');

      expect(result.isValid).toBe(true);
    });

    it('should handle whitespace-only PINs as matching', () => {
      // Edge case: whitespace PINs that match
      const result = comparePINs('   ', '   ');

      expect(result.isValid).toBe(true);
    });
  });
});
