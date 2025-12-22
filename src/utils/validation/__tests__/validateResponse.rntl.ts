import { z } from 'zod';

import { validateResponse, validateResponseSafe } from '../validateResponse';

const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe('validateResponse', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should validate correct data', () => {
    const data = { name: 'Warren', age: 30 };
    const result = validateResponse(TestSchema, data, 'Test');

    expect(result).toEqual(data);
  });

  it('should throw on invalid data type', () => {
    const data = { name: 'Warren', age: 'thirty' }; // age should be number

    expect(() => validateResponse(TestSchema, data, 'Test')).toThrow(
      'Invalid response from server'
    );
  });

  it('should throw on missing required field', () => {
    const data = { name: 'Warren' }; // missing age

    expect(() => validateResponse(TestSchema, data, 'Test')).toThrow(
      'Invalid response from server'
    );
  });

  it('should throw on extra unexpected fields being invalid', () => {
    const data = { name: 'Warren', age: 30, extra: 'field' }; // extra field is allowed by default

    // Should NOT throw - Zod allows extra fields by default
    expect(() => validateResponse(TestSchema, data, 'Test')).not.toThrow();
  });

  it('should include field path in error message', () => {
    const data = { name: 'Warren', age: 'thirty' };

    try {
      validateResponse(TestSchema, data, 'Test');
      fail('Expected to throw error');
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toContain('age');
      }
    }
  });

  it('should include context in logged error', () => {
    const data = { name: 'Warren', age: 'thirty' };

    try {
      validateResponse(TestSchema, data, 'Supabase Auth signUp');
    } catch {
      // Expected to throw
    }

    // Logger wraps with [DEV] prefix and passes error + context object
    expect(console.error).toHaveBeenCalledWith(
      '[DEV] [Supabase Auth signUp] Response validation failed',
      expect.any(Object),
      expect.objectContaining({ issues: expect.any(Array) })
    );
  });

  it('should re-throw non-ZodError errors', () => {
    // Create a schema that throws a non-ZodError
    const SchemaWithCustomError = z.string().transform(() => {
      throw new TypeError('Custom transform error');
    });

    expect(() => validateResponse(SchemaWithCustomError, 'test', 'Test')).toThrow(TypeError);
  });

  it('should handle schema with issues that have path', () => {
    // Create a schema with a custom refinement that fails
    const SchemaWithRefinement = z.object({
      value: z.number().refine(val => val > 100, 'Must be greater than 100'),
    });

    expect(() => validateResponse(SchemaWithRefinement, { value: 50 }, 'Test')).toThrow(
      'Invalid response from server'
    );
  });

  it('should throw generic error when ZodError has no issues', () => {
    // Test line 40 - the fallback when firstError is undefined
    // This tests the case where ZodError.issues is empty
    const { ZodError } = require('zod');

    // Create a schema that will throw our custom ZodError with empty issues
    const mockSchema = {
      parse: jest.fn().mockImplementation(() => {
        const error = new ZodError([]);
        throw error;
      }),
    };

    expect(() => validateResponse(mockSchema as unknown as z.ZodSchema, {}, 'Test')).toThrow(
      'Invalid response from server'
    );
  });

  it('should handle nested field paths', () => {
    const NestedSchema = z.object({
      user: z.object({
        profile: z.object({
          email: z.string().email(),
        }),
      }),
    });

    try {
      validateResponse(NestedSchema, { user: { profile: { email: 'not-an-email' } } }, 'Test');
      fail('Expected to throw error');
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toContain('user.profile.email');
      }
    }
  });
});

describe('validateResponseSafe', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return null on invalid data', () => {
    const data = { name: 'Warren', age: 'thirty' };
    const result = validateResponseSafe(TestSchema, data, 'Test');

    expect(result).toBeNull();
  });

  it('should return validated data on valid input', () => {
    const data = { name: 'Warren', age: 30 };
    const result = validateResponseSafe(TestSchema, data, 'Test');

    expect(result).toEqual(data);
  });

  it('should log warning on validation failure', () => {
    const data = { name: 'Warren', age: 'thirty' };

    validateResponseSafe(TestSchema, data, 'Optional metadata fetch');

    // Logger wraps with [DEV] prefix and passes context object
    expect(console.warn).toHaveBeenCalledWith(
      '[DEV] [Optional metadata fetch] Response validation failed (non-critical)',
      expect.objectContaining({ error: expect.any(Object) })
    );
  });

  it('should not throw on missing required field', () => {
    const data = { name: 'Warren' }; // missing age

    expect(() => validateResponseSafe(TestSchema, data, 'Test')).not.toThrow();
  });
});
