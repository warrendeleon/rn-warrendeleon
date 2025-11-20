import workxpFixture from '@app/test-utils/fixtures/api/en/workxp.json';

import {
  ClientReferenceSchema,
  PositionSchema,
  WorkExperienceItemSchema,
  WorkExperienceSchema,
} from '../workExperience.schema';

describe('WorkExperienceSchema', () => {
  it('validates actual work experience fixture data', () => {
    const result = WorkExperienceSchema.safeParse(workxpFixture);
    expect(result.success).toBe(true);
  });

  it('validates work experience with multiple positions', () => {
    const result = WorkExperienceSchema.safeParse(workxpFixture);
    if (result.success) {
      // Sky has multiple positions
      const sky = result.data.find(exp => exp.company === 'Sky');
      expect(sky?.positions.length).toBeGreaterThan(1);
    }
  });

  it('validates work experience with client references in positions', () => {
    const result = WorkExperienceSchema.safeParse(workxpFixture);
    if (result.success) {
      // xDesign has positions with client references
      const xdesign = result.data.find(exp => exp.company === 'xDesign');
      const positionsWithClients = xdesign?.positions.filter(pos => pos.client !== null);
      expect(positionsWithClients?.length).toBeGreaterThan(0);
    }
  });
});

describe('PositionSchema', () => {
  it('validates developer position with tech fields', () => {
    const validPosition = {
      id: 'pos-1',
      title: 'Senior React Native Engineer',
      startDate: '2023-01',
      endDate: '2023-10',
      description: 'Developed mobile apps',
      responsibilities: null,
      technologies: {
        languages: ['TypeScript'],
        frameworks: ['React Native', 'Redux'],
        testing: {
          unit: ['RNTL'],
          e2e: ['Detox'],
        },
        tools: ['VS Code', 'Git'],
        ci: null,
        methodology: ['Scrum'],
      },
      client: null,
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it('validates manager position with responsibilities', () => {
    const validPosition = {
      id: 'pos-2',
      title: 'Software Engineering Manager',
      startDate: '2023-10',
      endDate: '2025-12',
      description: 'Led engineering teams',
      responsibilities: ['People Leadership', 'Technical Direction'],
      technologies: null,
      client: null,
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it('rejects position without required fields', () => {
    const invalid = {
      title: 'Developer',
    };

    const result = PositionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('ClientReferenceSchema', () => {
  it('validates client reference with all required fields', () => {
    const validClientRef = {
      name: 'FanDuel',
      logo: 'https://example.com/logo.svg',
    };

    const result = ClientReferenceSchema.safeParse(validClientRef);
    expect(result.success).toBe(true);
  });

  it('rejects client reference with missing required fields', () => {
    const invalid = {
      name: 'Test Company',
    };

    const result = ClientReferenceSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects client reference with invalid logo URL', () => {
    const invalid = {
      name: 'Test Company',
      logo: 'not-a-url',
    };

    const result = ClientReferenceSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('WorkExperienceItemSchema', () => {
  it('validates work experience item with single position', () => {
    const validWorkExp = {
      id: 'work-1',
      company: 'Tech Corp',
      logo: 'https://example.com/logo.svg',
      positions: [
        {
          id: 'pos-1',
          title: 'Developer',
          startDate: '2020',
          endDate: '2021',
          description: 'Developed apps',
          responsibilities: null,
          technologies: null,
          client: null,
        },
      ],
    };

    const result = WorkExperienceItemSchema.safeParse(validWorkExp);
    expect(result.success).toBe(true);
  });

  it('rejects work experience without positions', () => {
    const invalid = {
      id: 'work-1',
      company: 'Tech Corp',
      positions: [],
    };

    const result = WorkExperienceItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates work experience without logo (optional)', () => {
    const validWorkExp = {
      id: 'work-1',
      company: 'Tech Corp',
      positions: [
        {
          id: 'pos-1',
          title: 'Developer',
          startDate: '2020',
          endDate: '2021',
          description: 'Developed apps',
          responsibilities: null,
          technologies: null,
          client: null,
        },
      ],
    };

    const result = WorkExperienceItemSchema.safeParse(validWorkExp);
    expect(result.success).toBe(true);
  });
});
