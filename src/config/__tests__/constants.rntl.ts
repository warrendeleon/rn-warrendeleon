/**
 * Tests for application-wide constants
 * @jest-environment node
 */

import {
  ALLOWED_PDF_DOMAINS,
  ALLOWED_WEBVIEW_DOMAINS,
  CAROUSEL_HEIGHT_RATIO,
  SPLASH_MINIMUM_DURATION,
  TOUCH_TARGET_SIZE,
} from '../constants';

describe('constants', () => {
  describe('SPLASH_MINIMUM_DURATION', () => {
    it('should be a positive number', () => {
      expect(typeof SPLASH_MINIMUM_DURATION).toBe('number');
      expect(SPLASH_MINIMUM_DURATION).toBeGreaterThan(0);
    });

    it('should be 1500ms for branding visibility', () => {
      expect(SPLASH_MINIMUM_DURATION).toBe(1500);
    });
  });

  describe('CAROUSEL_HEIGHT_RATIO', () => {
    it('should be a number between 0 and 1', () => {
      expect(typeof CAROUSEL_HEIGHT_RATIO).toBe('number');
      expect(CAROUSEL_HEIGHT_RATIO).toBeGreaterThan(0);
      expect(CAROUSEL_HEIGHT_RATIO).toBeLessThanOrEqual(1);
    });

    it('should be 0.4 (40% of screen height)', () => {
      expect(CAROUSEL_HEIGHT_RATIO).toBe(0.4);
    });
  });

  describe('TOUCH_TARGET_SIZE', () => {
    it('should have width and height properties', () => {
      expect(TOUCH_TARGET_SIZE).toHaveProperty('width');
      expect(TOUCH_TARGET_SIZE).toHaveProperty('height');
    });

    it('should meet iOS HIG minimum (44x44 points)', () => {
      expect(TOUCH_TARGET_SIZE.width).toBeGreaterThanOrEqual(44);
      expect(TOUCH_TARGET_SIZE.height).toBeGreaterThanOrEqual(44);
    });

    it('should be exactly 44x44 as per iOS standard', () => {
      expect(TOUCH_TARGET_SIZE).toEqual({ width: 44, height: 44 });
    });
  });

  describe('ALLOWED_WEBVIEW_DOMAINS', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(ALLOWED_WEBVIEW_DOMAINS)).toBe(true);
      expect(ALLOWED_WEBVIEW_DOMAINS.length).toBeGreaterThan(0);
    });

    it('should include professional networks', () => {
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('linkedin.com');
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('www.linkedin.com');
    });

    it('should include social media platforms', () => {
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('facebook.com');
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('twitter.com');
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('x.com');
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('instagram.com');
    });

    it('should include developer platforms', () => {
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('github.com');
    });

    it('should include certificate providers', () => {
      expect(ALLOWED_WEBVIEW_DOMAINS).toContain('udemy-certificate.s3.amazonaws.com');
    });

    it('should only contain string values', () => {
      ALLOWED_WEBVIEW_DOMAINS.forEach(domain => {
        expect(typeof domain).toBe('string');
        expect(domain.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ALLOWED_PDF_DOMAINS', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(ALLOWED_PDF_DOMAINS)).toBe(true);
      expect(ALLOWED_PDF_DOMAINS.length).toBeGreaterThan(0);
    });

    it('should include portfolio domain', () => {
      expect(ALLOWED_PDF_DOMAINS).toContain('warrendeleon.com');
      expect(ALLOWED_PDF_DOMAINS).toContain('www.warrendeleon.com');
    });

    it('should only contain string values', () => {
      ALLOWED_PDF_DOMAINS.forEach(domain => {
        expect(typeof domain).toBe('string');
        expect(domain.length).toBeGreaterThan(0);
      });
    });
  });
});
