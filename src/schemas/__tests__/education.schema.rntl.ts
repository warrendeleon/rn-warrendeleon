import educationFixture from '@app/test-utils/fixtures/api/en/education.json';

import { EducationItemSchema, EducationSchema } from '../education.schema';

describe('EducationSchema', () => {
  it('validates actual education fixture data', () => {
    const result = EducationSchema.safeParse(educationFixture);
    expect(result.success).toBe(true);
  });

  it('validates single education item with certificate', () => {
    const validEducation = {
      location: 'Udemy',
      title: 'CircleCI: The complete introduction',
      logo: 'https://example.com/logo.svg',
      start: 'April 2021',
      certificate: 'https://example.com/certificate.jpg',
    };

    const result = EducationItemSchema.safeParse(validEducation);
    expect(result.success).toBe(true);
  });

  it('validates single education item without certificate', () => {
    const validEducation = {
      location: 'University',
      title: 'Computer Science',
      logo: 'https://example.com/logo.svg',
      start: '2014',
      end: '2016',
    };

    const result = EducationItemSchema.safeParse(validEducation);
    expect(result.success).toBe(true);
  });

  it('validates array of education items', () => {
    const result = EducationSchema.safeParse(educationFixture);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it('rejects missing location', () => {
    const invalid = {
      title: 'Test Course',
      logo: 'https://example.com/logo.svg',
      start: '2021',
    };

    const result = EducationItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const invalid = {
      location: 'Test Institution',
      logo: 'https://example.com/logo.svg',
      start: '2021',
    };

    const result = EducationItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid logo URL', () => {
    const invalid = {
      location: 'Test Institution',
      title: 'Test Course',
      logo: 'not-a-url',
      start: '2021',
    };

    const result = EducationItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid certificate URL', () => {
    const invalid = {
      location: 'Test Institution',
      title: 'Test Course',
      logo: 'https://example.com/logo.svg',
      start: '2021',
      certificate: 'not-a-url',
    };

    const result = EducationItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates empty array', () => {
    const result = EducationSchema.safeParse([]);
    expect(result.success).toBe(true);
  });
});
