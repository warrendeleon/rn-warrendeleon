import { getButtonGroupVariant } from '../utils';

describe('shared utils', () => {
  describe('getButtonGroupVariant', () => {
    it('should return single for a single item', () => {
      expect(getButtonGroupVariant(0, 1)).toBe('single');
    });

    it('should return top for the first item of multiple', () => {
      expect(getButtonGroupVariant(0, 2)).toBe('top');
      expect(getButtonGroupVariant(0, 3)).toBe('top');
      expect(getButtonGroupVariant(0, 10)).toBe('top');
    });

    it('should return bottom for the last item of multiple', () => {
      expect(getButtonGroupVariant(1, 2)).toBe('bottom');
      expect(getButtonGroupVariant(2, 3)).toBe('bottom');
      expect(getButtonGroupVariant(9, 10)).toBe('bottom');
    });

    it('should return middle for middle items', () => {
      expect(getButtonGroupVariant(1, 3)).toBe('middle');
      expect(getButtonGroupVariant(1, 4)).toBe('middle');
      expect(getButtonGroupVariant(2, 4)).toBe('middle');
      expect(getButtonGroupVariant(5, 10)).toBe('middle');
    });
  });
});
