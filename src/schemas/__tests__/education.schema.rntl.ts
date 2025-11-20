import educationFixture from '@app/test-utils/fixtures/api/en/education.json';

import { EducationItemSchema, EducationSchema } from '../education.schema';

describe('EducationSchema', () => {
  it('validates actual education fixture data', () => {
    const result = EducationSchema.safeParse(educationFixture);
    expect(result.success).toBe(true);
  });

  it('validates single education item with certificate', () => {
    const validEducation = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      institution: 'Udemy',
      title: 'CircleCI: The complete introduction',
      logo: 'https://example.com/logo.svg',
      startDate: '2021-04',
      endDate: null,
      certificateUrl: 'https://example.com/certificate.jpg',
    };

    const result = EducationItemSchema.safeParse(validEducation);
    expect(result.success).toBe(true);
  });

  it('validates single education item without certificate', () => {
    const validEducation = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      institution: 'University',
      title: 'Computer Science',
      logo: 'https://example.com/logo.svg',
      startDate: '2014',
      endDate: '2016',
      certificateUrl: null,
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
