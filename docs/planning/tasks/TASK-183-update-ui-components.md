# TASK-183: Update UI Components for New Field Names

**Status**: 📋 To Do
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Update all UI components and screens to use the new field names and data structure. This includes updating data access patterns, prop types, and display logic to work with the restructured fixture data.

---

## Components/Screens to Update

### Profile Feature

- `ProfileScreen.tsx` - Gallery images display
- `ProfileCard.tsx` - If it uses carousel data

### Education Feature

- `EducationDataScreen.tsx` - List display
- `EducationDetailScreen.tsx` (if exists) - Detail view

### WorkExperience Feature

- `WorkXPScreen.tsx` - List display
- `WorkExperienceListScreen.tsx`
- `WorkExperienceDetailsScreen.tsx` - Detail view
- `WorkExperiencePositionsScreen.tsx` - Multi-position display
- `WorkExperienceClientsScreen.tsx` - Should be refactored or removed

---

## Step-by-Step Instructions

### Step 1: Update Profile Components

**File**: `src/features/Profile/screens/ProfileScreen.tsx`

```typescript
// Before
const carousel = useSelector(selectProfileCarousel);
// ...
{carousel?.map((imageUrl) => (
  <Image source={{ uri: imageUrl }} />
))}

// After
const galleryImages = useSelector(selectProfileGalleryImages);
// ...
{galleryImages?.map((imageUrl) => (
  <Image source={{ uri: imageUrl }} />
))}
```

### Step 2: Update Education Components

**File**: `src/features/Education/screens/EducationDataScreen.tsx`

```typescript
// Before
{education.map((item) => (
  <EducationItem
    key={item.title}  // No ID before
    institution={item.location}
    title={item.title}
    startDate={item.start}
    endDate={item.end}
    certificateUrl={item.certificate}
  />
))}

// After
{education.map((item) => (
  <EducationItem
    key={item.id}  // Use ID now
    institution={item.institution}
    title={item.title}
    startDate={item.startDate}
    endDate={item.endDate}
    certificateUrl={item.certificateUrl}
  />
))}
```

### Step 3: Update WorkExperience List Screen

**File**: `src/features/WorkExperience/screens/WorkExperienceListScreen.tsx`

```typescript
// Before - might have been listing clients separately
{workExperiences.map((we) => (
  <CompanyItem key={we.id} company={we} />
))}
{/* Separate client section */}

// After - all positions in one place
{workExperiences.map((we) => (
  <CompanyItem key={we.id} company={we} />
))}
// No separate client section needed
```

### Step 4: Update WorkExperience Details Screen

**File**: `src/features/WorkExperience/screens/WorkExperienceDetailsScreen.tsx`

```typescript
// Before - different handling for clients vs positions
if (itemType === 'client') {
  // Display client data
} else {
  // Display position data
}

// After - unified position display
const position = positions.find(p => p.id === positionId);

// Handle client info if present
{position?.client && (
  <ClientBadge
    name={position.client.name}
    logo={position.client.logo}
  />
)}

// Display technologies
{position?.technologies && (
  <TechnologiesSection technologies={position.technologies} />
)}

// Display responsibilities (manager role)
{position?.responsibilities && (
  <ResponsibilitiesList items={position.responsibilities} />
)}
```

### Step 5: Create/Update Technologies Display Component

Create a component to display the new technologies structure:

```typescript
// src/features/WorkExperience/components/TechnologiesSection.tsx
interface TechnologiesSectionProps {
  technologies: Technologies;
}

export const TechnologiesSection = ({ technologies }: TechnologiesSectionProps) => (
  <VStack space="md">
    {technologies.languages.length > 0 && (
      <TechCategory title="Languages" items={technologies.languages} />
    )}
    {technologies.frameworks.length > 0 && (
      <TechCategory title="Frameworks" items={technologies.frameworks} />
    )}
    {technologies.testing.unit && (
      <TechCategory title="Unit Testing" items={technologies.testing.unit} />
    )}
    {technologies.testing.e2e && (
      <TechCategory title="E2E Testing" items={technologies.testing.e2e} />
    )}
    {technologies.tools.length > 0 && (
      <TechCategory title="Tools" items={technologies.tools} />
    )}
    {technologies.ci && (
      <TechCategory title="CI/CD" items={technologies.ci} />
    )}
    {technologies.methodology.length > 0 && (
      <TechCategory title="Methodology" items={technologies.methodology} />
    )}
  </VStack>
);
```

### Step 6: Update Date Display Logic

Update any date formatting logic:

```typescript
// Before
const formatDate = (date: string) => {
  // Handle "April 2021", "Oct 2023", etc.
};

// After
const formatDate = (isoDate: string | null) => {
  if (!isoDate) return 'Present';

  // Parse YYYY-MM format
  const [year, month] = isoDate.split('-');
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};
```

### Step 7: Remove/Refactor Clients Screen

**File**: `src/features/WorkExperience/screens/WorkExperienceClientsScreen.tsx`

This screen may no longer be needed. Options:

1. **Remove entirely** if no longer used
2. **Refactor** to show positions with clients:

```typescript
// Refactored to show client positions
const clientPositions = workExperiences.flatMap(we =>
  we.positions.filter(p => p.client !== null).map(p => ({ company: we.company, position: p }))
);
```

### Step 8: Update Navigation Parameters

If screens pass data via navigation params:

```typescript
// Before
navigation.navigate('WorkExperienceDetails', {
  type: 'client',
  id: client.id,
});

// After
navigation.navigate('WorkExperienceDetails', {
  companyId: workExperience.id,
  positionId: position.id,
});
```

### Step 9: Verification

```bash
yarn typecheck
yarn ios  # Visual verification
```

---

## Files to Modify

### Profile

- `src/features/Profile/screens/ProfileScreen.tsx`
- `src/features/Profile/components/*.tsx` (as needed)

### Education

- `src/features/Education/screens/EducationDataScreen.tsx`

### WorkExperience

- `src/features/WorkExperience/screens/WorkXPScreen.tsx`
- `src/features/WorkExperience/screens/WorkExperienceListScreen.tsx`
- `src/features/WorkExperience/screens/WorkExperienceDetailsScreen.tsx`
- `src/features/WorkExperience/screens/WorkExperiencePositionsScreen.tsx`
- `src/features/WorkExperience/screens/WorkExperienceClientsScreen.tsx`
- `src/features/WorkExperience/components/*.tsx`

### Navigation

- `src/navigation/*.tsx` (if param types change)

---

## Acceptance Criteria

- [ ] Profile gallery uses `galleryImages` field
- [ ] Education screens use new field names (institution, certificateUrl)
- [ ] Education items use `id` for keys
- [ ] Work experience displays technologies object correctly
- [ ] Client positions display client badge
- [ ] Date formatting handles ISO format
- [ ] Manager roles display responsibilities
- [ ] Navigation params updated
- [ ] No TypeScript errors
- [ ] App renders correctly (visual verification)

---

## Implementation Notes

- **Selector updates**: Components using renamed selectors (e.g., `selectProfileCarousel`) must update to new names (e.g., `selectProfileGalleryImages`).
- **Key props**: Education items should now use `id` as key prop instead of title.
- **Conditional rendering**: Technologies/responsibilities are mutually exclusive - render the one that's not null.
- **Date display**: Create a utility function for formatting ISO dates for display.

---

## Dependencies

- [TASK-181](./TASK-181-update-redux-selectors.md) - Selectors must be updated first
- [TASK-182](./TASK-182-update-api-clients.md) - API clients must be updated

---

## Next Steps

- [TASK-184](./TASK-184-update-unit-tests.md) - Update Unit Tests for New Data Structure
