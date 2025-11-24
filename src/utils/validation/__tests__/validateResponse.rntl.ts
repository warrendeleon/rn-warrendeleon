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

    expect(console.error).toHaveBeenCalledWith(
      '[Supabase Auth signUp] Response validation failed:',
      expect.any(Array)
    );
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

    expect(console.warn).toHaveBeenCalledWith(
      '[Optional metadata fetch] Response validation failed (non-critical):',
      expect.any(Object)
    );
  });

  it('should not throw on missing required field', () => {
    const data = { name: 'Warren' }; // missing age

    expect(() => validateResponseSafe(TestSchema, data, 'Test')).not.toThrow();
  });
});
