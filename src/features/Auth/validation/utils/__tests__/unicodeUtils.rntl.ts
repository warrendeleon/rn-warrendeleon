import { containsMixedScripts, detectHomographs, normalizeAndValidate } from '../unicodeUtils';

describe('unicodeUtils', () => {
  describe('containsMixedScripts', () => {
    it('should return false for pure Latin names', () => {
      expect(containsMixedScripts('John')).toBe(false);
      expect(containsMixedScripts("O'Brien")).toBe(false);
      expect(containsMixedScripts('Mary-Jane')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(containsMixedScripts('')).toBe(false);
    });

    it('should return true for Latin + Cyrillic mix', () => {
      // "Јohn" - Cyrillic J (U+0408) + Latin "ohn"
      expect(containsMixedScripts('Јohn')).toBe(true);
    });

    it('should return true for Latin + Greek mix', () => {
      // "Jοhn" - Latin J + Greek omicron (U+03BF) + Latin hn
      expect(containsMixedScripts('Jοhn')).toBe(true);
    });

    it('should return false for pure Cyrillic names', () => {
      // "Иван" - Ivan in Cyrillic
      expect(containsMixedScripts('Иван')).toBe(false);
    });

    it('should return false for pure Greek names', () => {
      // "Νικος" - Nikos in Greek
      expect(containsMixedScripts('Νικος')).toBe(false);
    });

    it('should return false for pure Arabic names', () => {
      // "محمد" - Mohammed in Arabic
      expect(containsMixedScripts('محمد')).toBe(false);
    });

    it('should return true for Latin + Arabic mix', () => {
      // "Jمhn" - Latin J + Arabic meem + Latin hn
      expect(containsMixedScripts('Jمhn')).toBe(true);
    });

    it('should handle names with spaces correctly', () => {
      expect(containsMixedScripts('Mary Jane')).toBe(false);
      // "Mаry" - M + Cyrillic а + ry (Latin)
      expect(containsMixedScripts('Mаry Jane')).toBe(true);
    });
  });

  describe('normalizeAndValidate', () => {
    it('should normalize and validate Latin names', () => {
      const result = normalizeAndValidate('John');
      expect(result.normalized).toBe('John');
      expect(result.isValid).toBe(true);
    });

    it('should return empty normalized string and isValid true for empty input', () => {
      const result = normalizeAndValidate('');
      expect(result.normalized).toBe('');
      expect(result.isValid).toBe(true);
    });

    it('should reject names with Cyrillic characters', () => {
      // "Јohn" - Cyrillic J
      const result = normalizeAndValidate('Јohn');
      expect(result.isValid).toBe(false);
    });

    it('should reject names with Greek characters', () => {
      // "Jοhn" - Greek omicron
      const result = normalizeAndValidate('Jοhn');
      expect(result.isValid).toBe(false);
    });

    it('should allow hyphens', () => {
      const result = normalizeAndValidate('Mary-Jane');
      expect(result.isValid).toBe(true);
    });

    it('should allow apostrophes', () => {
      const result = normalizeAndValidate("O'Brien");
      expect(result.isValid).toBe(true);
    });

    it('should allow spaces', () => {
      const result = normalizeAndValidate('Mary Jane');
      expect(result.isValid).toBe(true);
    });

    it('should reject numbers', () => {
      const result = normalizeAndValidate('John123');
      expect(result.isValid).toBe(false);
    });

    it('should reject special characters', () => {
      const result = normalizeAndValidate('John@doe');
      expect(result.isValid).toBe(false);
    });
  });

  describe('detectHomographs', () => {
    it('should detect Cyrillic "а" (looks like Latin "a")', () => {
      // "Mаry" - M + Cyrillic а (U+0430) at position 1 + ry
      const homographs = detectHomographs('Mаry');
      expect(homographs).toHaveLength(1);
      expect(homographs[0]!.char).toBe('а');
      expect(homographs[0]!.position).toBe(1);
    });

    it('should detect Cyrillic "о" (looks like Latin "o")', () => {
      // "Jоhn" - J + Cyrillic о (U+043E) at position 1 + hn
      const homographs = detectHomographs('Jоhn');
      expect(homographs).toHaveLength(1);
      expect(homographs[0]!.char).toBe('о');
      expect(homographs[0]!.position).toBe(1);
    });

    it('should detect multiple homographs', () => {
      // "Маrу" - Cyrillic М + а + Latin r + Cyrillic у
      const homographs = detectHomographs('Маrу');
      expect(homographs.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for pure Latin', () => {
      const homographs = detectHomographs('John');
      expect(homographs).toHaveLength(0);
    });

    it('should return empty array for empty string', () => {
      const homographs = detectHomographs('');
      expect(homographs).toHaveLength(0);
    });

    it('should detect uppercase Cyrillic lookalikes', () => {
      // "JОНN" - J + Cyrillic О (U+041E) + Cyrillic Н (U+041D) + N
      const homographs = detectHomographs('JОНN');
      expect(homographs.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect Cyrillic "р" (looks like Latin "p")', () => {
      // "Jоhр" - J + Cyrillic о + h + Cyrillic р (U+0440)
      const homographs = detectHomographs('Johр');
      expect(homographs).toHaveLength(1);
      expect(homographs[0]!.char).toBe('р');
    });

    it('should detect Cyrillic "с" (looks like Latin "c")', () => {
      // "Сlark" - Cyrillic С (U+0421) + lark
      const homographs = detectHomographs('Сlark');
      expect(homographs).toHaveLength(1);
      expect(homographs[0]!.char).toBe('С');
      expect(homographs[0]!.position).toBe(0);
    });
  });
});
