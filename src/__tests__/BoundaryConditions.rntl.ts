/**
 * Boundary Condition Tests
 *
 * Tests for boundary conditions, edge cases, and limits across the codebase.
 * Covers array bounds, null propagation, maximum limits, and numeric edge cases.
 */

import { formatDate, formatDateRange } from '@app/utils/dateFormatter';

describe('Date Formatter Boundary Conditions', () => {
  describe('formatDate', () => {
    describe('empty and null inputs', () => {
      it('returns empty string for empty input', () => {
        expect(formatDate('')).toBe('');
      });

      it('returns whitespace as-is (no trim in formatDate)', () => {
        // formatDate doesn't trim input, documents current behaviour
        expect(formatDate('   ')).toBe('   ');
      });
    });

    describe('year-only format', () => {
      it('handles year-only input (2024)', () => {
        expect(formatDate('2024')).toBe('2024');
      });

      it('handles year-only input (1900)', () => {
        expect(formatDate('1900')).toBe('1900');
      });

      it('handles year-only input (2099)', () => {
        expect(formatDate('2099')).toBe('2099');
      });
    });

    describe('year-month format', () => {
      it('formats January correctly', () => {
        const result = formatDate('2024-01');
        expect(result).toContain('2024');
      });

      it('formats December correctly', () => {
        const result = formatDate('2024-12');
        expect(result).toContain('2024');
      });

      it('handles month 01 (January boundary)', () => {
        const result = formatDate('2024-01');
        expect(result).toBeDefined();
      });

      it('handles month 12 (December boundary)', () => {
        const result = formatDate('2024-12');
        expect(result).toBeDefined();
      });
    });

    describe('edge cases', () => {
      it('handles partial year input', () => {
        // Single digit - will be parsed as year only
        const result = formatDate('9');
        expect(result).toBe('9');
      });

      it('handles malformed input with extra hyphens', () => {
        const result = formatDate('2024-01-15');
        // Will parse year and month, ignore rest
        expect(result).toContain('2024');
      });
    });
  });

  describe('formatDateRange', () => {
    it('formats range with present end', () => {
      const result = formatDateRange('2024-01', null, 'Present');
      expect(result).toContain('Present');
    });

    it('formats range with both dates', () => {
      const result = formatDateRange('2020-01', '2024-12', 'Present');
      expect(result).toContain('2020');
      expect(result).toContain('2024');
    });

    it('handles same start and end date', () => {
      const result = formatDateRange('2024-06', '2024-06', 'Present');
      expect(result).toContain('2024');
    });

    it('handles year-only dates', () => {
      const result = formatDateRange('2020', '2024', 'Present');
      expect(result).toBe('2020 - 2024');
    });

    it('handles mixed format dates', () => {
      const result = formatDateRange('2020-01', '2024', 'Present');
      expect(result).toContain('2020');
      expect(result).toContain('2024');
    });

    it('uses custom present text', () => {
      const result = formatDateRange('2024-01', null, 'Current');
      expect(result).toContain('Current');
    });

    it('handles empty present text', () => {
      const result = formatDateRange('2024-01', null, '');
      expect(result).toContain(' - ');
    });
  });
});

describe('Numeric Boundary Conditions', () => {
  describe('array index boundaries', () => {
    it('handles empty array', () => {
      const arr: string[] = [];
      expect(arr.length).toBe(0);
      expect(arr[0]).toBeUndefined();
    });

    it('handles single element array', () => {
      const arr = ['item'];
      expect(arr[0]).toBe('item');
      expect(arr[1]).toBeUndefined();
    });

    it('handles array with negative index', () => {
      const arr = ['a', 'b', 'c'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((arr as any)[-1]).toBeUndefined();
    });
  });

  describe('string length boundaries', () => {
    it('handles empty string', () => {
      expect(''.length).toBe(0);
    });

    it('handles single character string', () => {
      expect('a'.length).toBe(1);
    });

    it('handles very long string (10000 chars)', () => {
      const longString = 'x'.repeat(10000);
      expect(longString.length).toBe(10000);
    });
  });

  describe('number boundaries', () => {
    it('handles zero', () => {
      expect(0).toBe(0);
      // Object.is (used by Jest) treats -0 and 0 as different
      expect(Object.is(-0, 0)).toBe(false);
      expect(Object.is(0, 0)).toBe(true);
      // -0 can be detected via division (1/-0 = -Infinity)
      expect(1 / -0).toBe(-Infinity);
      expect(1 / 0).toBe(Infinity);
    });

    it('handles very small numbers', () => {
      expect(Number.MIN_VALUE).toBeGreaterThan(0);
    });

    it('handles very large numbers', () => {
      expect(Number.MAX_VALUE).toBeGreaterThan(0);
    });

    it('handles negative numbers', () => {
      expect(-1).toBeLessThan(0);
    });

    it('handles floating point precision', () => {
      expect(0.1 + 0.2).toBeCloseTo(0.3);
    });
  });
});

describe('Object and Null Boundary Conditions', () => {
  describe('null coalescing', () => {
    it('handles null with nullish coalescing', () => {
      const nullValue: string | null = null;
      const value = nullValue ?? 'default';
      expect(value).toBe('default');
    });

    it('handles undefined with nullish coalescing', () => {
      const undefinedValue: string | undefined = undefined;
      const value = undefinedValue ?? 'default';
      expect(value).toBe('default');
    });

    it('preserves empty string with nullish coalescing', () => {
      const emptyString: string | null = '';
      const value = emptyString ?? 'default';
      expect(value).toBe('');
    });

    it('preserves zero with nullish coalescing', () => {
      const zeroValue: number | null = 0;
      const value = zeroValue ?? 100;
      expect(value).toBe(0);
    });

    it('preserves false with nullish coalescing', () => {
      const falseValue: boolean | null = false;
      const value = falseValue ?? true;
      expect(value).toBe(false);
    });
  });

  describe('optional chaining', () => {
    it('handles null object', () => {
      const obj: { nested?: { value: string } } | null = null;
      // Using type assertion to test runtime behaviour
      const result = (obj as { nested?: { value: string } } | null)?.nested?.value;
      expect(result).toBeUndefined();
    });

    it('handles undefined property', () => {
      const obj: { nested?: { value: string } } = { nested: undefined };
      expect(obj.nested).toBeUndefined();
    });

    it('handles deeply nested access', () => {
      const obj: { a?: { b?: { c?: { d?: string } } } } = {};
      expect(obj?.a?.b?.c?.d).toBeUndefined();
    });
  });

  describe('empty object handling', () => {
    it('detects empty object', () => {
      const obj = {};
      expect(Object.keys(obj).length).toBe(0);
    });

    it('handles object with only undefined values', () => {
      const obj = { a: undefined, b: undefined };
      expect(Object.keys(obj).length).toBe(2);
    });

    it('handles object with null values', () => {
      const obj = { a: null, b: null };
      expect(obj.a).toBeNull();
      expect(Object.values(obj).every(v => v === null)).toBe(true);
    });
  });
});

describe('String Boundary Conditions', () => {
  describe('substring operations', () => {
    it('handles empty string slice', () => {
      expect(''.slice(0, 0)).toBe('');
    });

    it('handles out of bounds slice', () => {
      expect('abc'.slice(0, 100)).toBe('abc');
    });

    it('handles negative slice', () => {
      expect('abc'.slice(-1)).toBe('c');
    });
  });

  describe('split operations', () => {
    it('handles split with no matches', () => {
      expect('abc'.split('x')).toEqual(['abc']);
    });

    it('handles split on empty string', () => {
      expect('abc'.split('')).toEqual(['a', 'b', 'c']);
    });

    it('handles empty string split', () => {
      expect(''.split('-')).toEqual(['']);
    });
  });

  describe('trim operations', () => {
    it('handles string with only whitespace', () => {
      expect('   '.trim()).toBe('');
    });

    it('handles string with tabs', () => {
      expect('\t\tabc\t\t'.trim()).toBe('abc');
    });

    it('handles string with newlines', () => {
      expect('\n\nabc\n\n'.trim()).toBe('abc');
    });

    it('handles string with mixed whitespace', () => {
      expect(' \t\n abc \n\t '.trim()).toBe('abc');
    });
  });

  describe('case conversion', () => {
    it('handles empty string case conversion', () => {
      expect(''.toLowerCase()).toBe('');
      expect(''.toUpperCase()).toBe('');
    });

    it('handles numeric string case conversion', () => {
      expect('123'.toLowerCase()).toBe('123');
      expect('123'.toUpperCase()).toBe('123');
    });

    it('handles special characters case conversion', () => {
      expect('!@#$%'.toLowerCase()).toBe('!@#$%');
    });
  });
});

describe('Array Boundary Conditions', () => {
  describe('array methods', () => {
    it('handles map on empty array', () => {
      const result = [].map(x => x);
      expect(result).toEqual([]);
    });

    it('handles filter on empty array', () => {
      const result = [].filter(() => true);
      expect(result).toEqual([]);
    });

    it('handles reduce on empty array with initial value', () => {
      const result = [].reduce((acc: number) => acc, 0);
      expect(result).toBe(0);
    });

    it('handles find on empty array', () => {
      const result = [].find(() => true);
      expect(result).toBeUndefined();
    });

    it('handles every on empty array', () => {
      const result = [].every(() => false);
      expect(result).toBe(true); // vacuously true
    });

    it('handles some on empty array', () => {
      const result = [].some(() => true);
      expect(result).toBe(false);
    });

    it('handles concat with empty arrays', () => {
      const result = [].concat([], []);
      expect(result).toEqual([]);
    });
  });

  describe('array spread operations', () => {
    it('handles spread of empty array', () => {
      const arr: number[] = [];
      const result = [...arr];
      expect(result).toEqual([]);
    });

    it('handles spread into function arguments', () => {
      const arr = [1, 2, 3];
      const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0);
      expect(sum(...arr)).toBe(6);
    });
  });
});

describe('Boolean Boundary Conditions', () => {
  describe('truthy/falsy evaluation', () => {
    it('handles zero as falsy', () => {
      expect(Boolean(0)).toBe(false);
    });

    it('handles negative zero as falsy', () => {
      expect(Boolean(-0)).toBe(false);
    });

    it('handles empty string as falsy', () => {
      expect(Boolean('')).toBe(false);
    });

    it('handles null as falsy', () => {
      expect(Boolean(null)).toBe(false);
    });

    it('handles undefined as falsy', () => {
      expect(Boolean(undefined)).toBe(false);
    });

    it('handles NaN as falsy', () => {
      expect(Boolean(NaN)).toBe(false);
    });

    it('handles empty array as truthy', () => {
      expect(Boolean([])).toBe(true);
    });

    it('handles empty object as truthy', () => {
      expect(Boolean({})).toBe(true);
    });

    it('handles whitespace string as truthy', () => {
      expect(Boolean(' ')).toBe(true);
    });
  });
});
