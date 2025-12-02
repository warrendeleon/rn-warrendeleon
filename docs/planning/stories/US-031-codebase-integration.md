# US-031: Codebase Integration

**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)
**Status**: ✅ Done
**Effort**: 5.5 hours

---

## User Story

**As a** developer updating the data structure
**I want** all code that consumes portfolio data updated to use the new structure
**So that** the application continues to function correctly with the normalised data

---

## Background

After updating the fixture data structure (US-028, US-029) and type system (US-030), all code that reads or manipulates this data needs to be updated:

- Redux selectors that query work experience/education data
- API client functions that fetch and transform data
- UI components that display portfolio information
- Utility functions that process dates or field names

Without these updates:

- Redux selectors will return undefined or incorrect data
- UI will break or display empty/incorrect information
- API responses won't be processed correctly
- Application functionality will be broken

---

## Acceptance Criteria

- [ ] Redux selectors updated for new structure
- [ ] API client functions updated
- [ ] UI components updated to use new field names
- [ ] Date formatting updated for ISO 8601
- [ ] All selector tests passing
- [ ] All component tests passing
- [ ] UI displays data correctly
- [ ] No runtime errors

---

## Technical Details

### Redux Selector Updates

```typescript
// src/features/WorkExperience/store/selectors.ts

// OLD: Nested clients structure
export const selectWorkExperienceClients = (state: RootState, workExpId: string) => {
  const workExp = state.workExperience.entities[workExpId];
  return workExp?.clients || [];
};

// NEW: Flattened positions structure
export const selectWorkExperiencePositions = (state: RootState, workExpId: string) => {
  const workExp = state.workExperience.entities[workExpId];
  return workExp?.positions || [];
};

// OLD: Nested client selection
export const selectClientById = (state: RootState, workExpId: string, clientId: string) => {
  const clients = selectWorkExperienceClients(state, workExpId);
  return clients.find(client => client.id === clientId);
};

// NEW: Direct position selection
export const selectPositionById = (state: RootState, workExpId: string, positionId: string) => {
  const positions = selectWorkExperiencePositions(state, workExpId);
  return positions.find(position => position.id === positionId);
};
```

### UI Component Updates

```typescript
// src/components/WorkExperienceCard.tsx

// OLD: Using nested structure and old field names
<Text>{client.technologies.join(', ')}</Text>
<Text>{formatDate(client.start_date)}</Text>

// NEW: Using flattened structure and normalised field names
<Text>{position.techStack.join(', ')}</Text>
<Text>{formatISODate(position.startDate)}</Text>
```

### API Client Updates

```typescript
// src/services/api/workExperienceApi.ts

// OLD: Transform to nested structure
const transformWorkExperience = (data: any) => ({
  id: data.id,
  company: data.company,
  clients: data.clients.map(transformClient),
});

// NEW: Transform to flattened structure
const transformWorkExperience = (data: any) => ({
  id: data.id,
  company: data.company,
  positions: data.positions.map(transformPosition),
  techStack: data.tech_stack || data.technologies || [],
});
```

---

## Related Tasks

- [TASK-181](../tasks/TASK-181-update-redux-selectors.md): Update Redux Selectors for New Structure (2h)
- [TASK-182](../tasks/TASK-182-update-api-clients.md): Update API Client Functions (1.5h)
- [TASK-183](../tasks/TASK-183-update-ui-components.md): Update UI Components for New Field Names (2h)

---

## Definition of Done

- [ ] All Redux selectors updated and tested
- [ ] All API clients updated and tested
- [ ] All UI components updated
- [ ] Date formatting uses ISO 8601
- [ ] Field names use normalised versions
- [ ] No references to old structure remain
- [ ] All unit tests passing
- [ ] Application runs without errors
- [ ] UI displays all data correctly

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md), [US-030](US-030-type-system-updates.md), [US-032](US-032-testing-validation.md)
