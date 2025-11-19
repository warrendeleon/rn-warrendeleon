# TASK-170: Update Details Screen for Role-Specific Sections

**Status**: ✅ Done
**Priority**: High
**Effort**: 1.5h
**Epic**: [EPIC-019](../epics/EPIC-019-work-experience-multi-position.md)

---

## Description

Update `WorkExperienceDetailsScreen` to handle position data and display role-specific sections. Manager roles show responsibilities, while developer roles show tech stack sections.

## Section Display Logic

The screen should adapt based on what data is present in the position:

### Developer Roles (has tech data)

- Programming Languages
- Tech Stack
- Unit Testing
- E2E Testing
- Dev Tools
- Agile Methodology

### Manager Roles (has responsibilities)

- Key Responsibilities (bullet list)

### Both (description always shown)

- Description section

## Implementation Approach

```typescript
const WorkExperienceDetailsScreen: React.FC = () => {
  const position = useSelector(state =>
    selectPositionById(state, positionId)
  );

  const hasTechContent = useMemo(() =>
    position?.programmingLanguages?.length ||
    position?.techStack?.length ||
    position?.unitTest?.length ||
    position?.e2e?.length ||
    position?.devTools?.length ||
    position?.agileMethodology?.length,
    [position]
  );

  const hasResponsibilities = useMemo(() =>
    position?.responsibilities?.length,
    [position]
  );

  return (
    <ScrollView>
      {/* Header: Logo, Title, Date Range */}

      {/* Description - always shown */}
      <DescriptionSection description={position.description} />

      {/* Responsibilities - for manager roles */}
      {hasResponsibilities && (
        <ResponsibilitiesSection items={position.responsibilities} />
      )}

      {/* Tech sections - for developer roles */}
      {hasTechContent && (
        <>
          <TechSection title="Programming Languages" items={position.programmingLanguages} />
          <TechSection title="Tech Stack" items={position.techStack} />
          {/* ... other tech sections */}
        </>
      )}
    </ScrollView>
  );
};
```

## Responsibilities Section Component

Create a new section component for displaying responsibilities:

- Bulleted list format
- Each responsibility as a list item
- EAA accessible with proper roles

```typescript
const ResponsibilitiesSection: React.FC<{ items: string[] }> = ({ items }) => (
  <VStack>
    <Heading size="sm">Key Responsibilities</Heading>
    {items.map((item, index) => (
      <HStack key={index} space="sm" alignItems="flex-start">
        <Text>•</Text>
        <Text flex={1}>{item}</Text>
      </HStack>
    ))}
  </VStack>
);
```

## Acceptance Criteria

- [x] Update selector usage to handle position data
- [x] Show responsibilities section for manager roles
- [x] Show tech sections for developer roles
- [x] Hide tech sections when no tech data present
- [x] Create `ResponsibilitiesSection` component
- [x] Use `useMemo` for computed values
- [x] Maintain EAA accessibility compliance
- [x] Add `testID` props for E2E testing
- [x] No TypeScript or ESLint errors

## i18n

Add translations for "Key Responsibilities" in all 5 languages.

## Files to Modify

- `src/features/WorkExperience/WorkExperienceDetailsScreen.tsx`
- `src/locales/*/translation.json` (all 5 languages)

## Files to Create (Optional)

- `src/features/WorkExperience/components/ResponsibilitiesSection.tsx` (or inline)
