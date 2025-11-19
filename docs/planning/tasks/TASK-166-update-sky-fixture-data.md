# TASK-166: Update Sky Fixture Data (All Languages)

**Status**: ✅ Done
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Update all work experience fixture files (5 languages) to use the new `positions` array structure. Add Sky's two positions with full data including the new Software Engineering Manager role with responsibilities.

## Sky Position Data

### Position 1: Software Engineering Manager

- **Title**: Software Engineering Manager
- **Dates**: Oct 2023 - Dec 2025
- **Key Responsibilities**:
  - People Leadership: Manage 10+ engineers with focus on coaching, performance, and progression
  - Agile Delivery in SAFe: Lead PI planning, ART Syncs, ensure predictability and alignment
  - Technical Direction: Guide architectural decisions for mobile (React Native) and web stacks
  - Stakeholder Engagement: Partner with Product Owners, Scrum Masters, Delivery Leads
  - Organisational Influence: Lead squad transitions, onboard new hires, contribute to engineering standards
  - Career Development: Transition Associate Engineers to productive, confident team members

### Position 2: Senior React Native Engineer

- **Title**: Senior React Native Engineer
- **Dates**: Jan 2023 - Oct 2023
- **Tech Stack**: React Native, Apollo GraphQL, TypeScript, etc. (existing data)
- **Description**: Existing contractor description

## Acceptance Criteria

- [x] Update `src/test-utils/fixtures/api/en/workxp.json` with positions array
- [x] Update `src/test-utils/fixtures/api/es/workxp.json` (Spanish translations)
- [x] Update `src/test-utils/fixtures/api/ca/workxp.json` (Catalan translations)
- [x] Update `src/test-utils/fixtures/api/pl/workxp.json` (Polish translations)
- [x] Update `src/test-utils/fixtures/api/tl/workxp.json` (Tagalog translations)
- [x] All other work experience entries migrated to `positions` array format
- [x] JSON files are valid (no syntax errors)
- [x] Each position has unique UUID
- [x] Dates are consistent across languages

## Data Migration

All existing work experience entries need migration from:

```json
{
  "id": "...",
  "company": "Company",
  "position": "Title",
  "start": "Date",
  "end": "Date",
  "description": "...",
  "techStack": [...]
}
```

To:

```json
{
  "id": "...",
  "company": "Company",
  "positions": [{
    "id": "new-uuid",
    "title": "Title",
    "start": "Date",
    "end": "Date",
    "description": "...",
    "techStack": [...]
  }]
}
```

## Translation Notes

Manager responsibilities need translation to all 5 languages. Key terms:

- People Leadership
- Agile Delivery in SAFe
- Technical Direction
- Stakeholder Engagement
- Organisational Influence
- Career Development

## Files to Modify

- `src/test-utils/fixtures/api/en/workxp.json`
- `src/test-utils/fixtures/api/es/workxp.json`
- `src/test-utils/fixtures/api/ca/workxp.json`
- `src/test-utils/fixtures/api/pl/workxp.json`
- `src/test-utils/fixtures/api/tl/workxp.json`
