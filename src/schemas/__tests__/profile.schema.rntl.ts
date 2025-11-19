import profileFixture from '@app/test-utils/fixtures/api/en/profile.json';

import { ProfileSchema } from '../profile.schema';

describe('ProfileSchema', () => {
  it('validates actual profile fixture data', () => {
    const result = ProfileSchema.safeParse(profileFixture);
    expect(result.success).toBe(true);
  });

  it('validates profile with all required fields', () => {
    const validProfile = {
      profilePicture: 'https://example.com/photo.jpg',
      name: 'Warren',
      lastName: 'de Leon',
      headline: 'Software Engineer',
      namePronunciation: '[ w AW - r uh n ]',
      namePronunciationAudioTrack: 'https://example.com/audio.m4a',
      email: 'test@example.com',
      phone: '+1234567890',
      birthday: '1990-01-01',
      location: {
        cityTown: 'Dartford',
        county: 'Kent',
        country: 'UK',
        coordinates: {
          latitude: 51.4561,
          longitude: 0.24678,
        },
      },
      carousel: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
      socials: {
        facebook: 'https://facebook.com/test',
        twitter: 'https://twitter.com/test',
        instagram: 'https://instagram.com/test',
        linkedIn: 'https://linkedin.com/in/test',
      },
    };

    const result = ProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = ProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = ProfileSchema.safeParse({
      ...profileFixture,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid profile picture URL', () => {
    const result = ProfileSchema.safeParse({
      ...profileFixture,
      profilePicture: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid social media URLs', () => {
    const result = ProfileSchema.safeParse({
      ...profileFixture,
      socials: {
        ...profileFixture.socials,
        linkedIn: 'not-a-url',
      },
    });
    expect(result.success).toBe(false);
  });

  it('validates empty namePronunciation', () => {
    const result = ProfileSchema.safeParse({
      ...profileFixture,
      namePronunciation: '',
    });
    expect(result.success).toBe(true);
  });

  it('validates carousel with multiple images', () => {
    const result = ProfileSchema.safeParse(profileFixture);
    if (result.success) {
      expect(result.data.carousel.length).toBeGreaterThan(0);
    }
  });
});
