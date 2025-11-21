# US-029: Structure Normalisation

**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)
**Status**: ✅ Done
**Effort**: 5 hours

---

## User Story

**As a** developer maintaining the portfolio data layer
**I want** to normalise the nested data structures in fixture files
**So that** the data model is simpler, more maintainable, and easier to query

---

## Background

The current fixture data structure has unnecessarily complex nesting:

- Work experience "clients" are nested within companies
- Technology stack fields use inconsistent naming across different entities
- Some data is duplicated across nested structures

This complexity makes it harder to:

- Query specific positions or roles
- Update data consistently
- Maintain type safety
- Write Redux selectors

---

## Acceptance Criteria

- [ ] Clients structure flattened into positions array
- [ ] Each position is a direct child of the work experience entry
- [ ] Technology stack fields use consistent naming
- [ ] No data duplication in nested structures
- [ ] All locale variants updated (en, es, ca, pl, tl)
- [ ] TypeScript types updated to reflect new structure
- [ ] Redux selectors updated and tested
- [ ] All existing functionality preserved

---

## Technical Details

### Before: Nested Clients Structure

```typescript
// Old structure with nested clients
{
  id: "sky",
  company: "Sky",
  clients: [
    {
      id: "client-1",
      name: "Client Name",
      roles: [...]
    }
  ]
}
```

### After: Flattened Positions Structure

```typescript
// New structure with flattened positions
{
  id: "sky",
  company: "Sky",
  positions: [
    {
      id: "position-1",
      clientName: "Client Name",  // Flattened
      role: "...",
      // ... other fields
    }
  ]
}
```

---

## Related Tasks

- [TASK-177](../tasks/TASK-177-flatten-clients-structure.md): Flatten Clients Structure into Positions (3h)
- [TASK-178](../tasks/TASK-178-normalise-tech-stack-fields.md): Normalise Technology Stack Fields (2h)

---

## Definition of Done

- [ ] Data structure flattened in all 5 locale files
- [ ] No nested "clients" arrays
- [ ] Technology stack fields consistently named
- [ ] TypeScript compilation successful
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Redux selectors return correct data
- [ ] UI displays data correctly

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md), [US-028](US-028-data-format-standardisation.md), [US-030](US-030-type-system-updates.md)
