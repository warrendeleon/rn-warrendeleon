import workxpFixture from '@app/test-utils/fixtures/api/en/workxp.json';

import {
  ClientSchema,
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

  it('validates work experience with clients', () => {
    const result = WorkExperienceSchema.safeParse(workxpFixture);
    if (result.success) {
      // xDesign has clients
      const xdesign = result.data.find(exp => exp.company === 'xDesign');
      expect(xdesign?.clients?.length).toBeGreaterThan(0);
    }
  });
});

describe('PositionSchema', () => {
  it('validates developer position with tech fields', () => {
    const validPosition = {
      id: 'pos-1',
      title: 'Senior React Native Engineer',
      start: 'Jan 2023',
      end: 'Oct 2023',
      description: 'Developed mobile apps',
      programmingLanguages: ['TypeScript'],
      techStack: ['React Native', 'Redux'],
      unitTest: ['RNTL'],
      e2e: ['Detox'],
      devTools: ['VS Code', 'Git'],
      agileMethodology: ['Scrum'],
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it('validates manager position with responsibilities', () => {
    const validPosition = {
      id: 'pos-2',
      title: 'Software Engineering Manager',
      start: 'Oct 2023',
      end: 'Dec 2025',
      description: 'Led engineering teams',
      responsibilities: ['People Leadership', 'Technical Direction'],
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

describe('ClientSchema', () => {
  it('validates client with all required fields', () => {
    const validClient = {
      id: 'client-1',
      company: 'FanDuel',
      logo: 'https://example.com/logo.svg',
      start: 'Jan 2022',
      end: 'Present',
      type: 'contract',
      position: 'Lead Developer',
      programmingLanguages: ['TypeScript'],
      techStack: ['React Native'],
      devTools: ['WebStorm', 'Git'],
      agileMethodology: ['SCRUM'],
      description: 'Led development team',
    };

    const result = ClientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it('rejects client with missing required fields', () => {
    const invalid = {
      company: 'Test Company',
    };

    const result = ClientSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects client with invalid logo URL', () => {
    const invalid = {
      id: 'client-1',
      company: 'Test Company',
      logo: 'not-a-url',
      start: 'Jan 2022',
      end: 'Present',
      type: 'contract',
      position: 'Developer',
      programmingLanguages: ['TypeScript'],
      techStack: ['React Native'],
      devTools: ['VS Code'],
      agileMethodology: ['Scrum'],
      description: 'Test description',
    };

    const result = ClientSchema.safeParse(invalid);
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
          start: '2020',
          end: '2021',
          description: 'Developed apps',
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
          start: '2020',
          end: '2021',
          description: 'Developed apps',
        },
      ],
    };

    const result = WorkExperienceItemSchema.safeParse(validWorkExp);
    expect(result.success).toBe(true);
  });
});
