# TASK-076: Add Certificate WebView Navigation

**Epic**: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
**User Story**: [US-016: Education Screen with SVG Logos](../stories/US-016-education-screen-svg-logos.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 0.5 hours
**Created**: 2025-11-15

---

## Context

Add navigation from EducationDataScreen to the WebView screen when a user taps an education entry that has a certificate. This allows users to view education certificates (diplomas, course completion certificates, etc.) within the app.

## Technical Details

### Current State

- EducationDataScreen already has navigation import
- WebView screen exists and is registered in navigation
- Education data includes optional `certificate` field with URL

### Implementation

The implementation is mostly complete in TASK-075. This task focuses on verification and testing.

**File**: `src/features/Education/EducationDataScreen.tsx`

Already implemented:

```typescript
const handleEducationPress = useCallback(
  (certificateUrl?: string) => {
    if (certificateUrl) {
      navigation.navigate('WebView', {
        uri: certificateUrl,
        title: 'Certificate',
      });
    }
  },
  [navigation]
);
```

Already applied to items:

```typescript
onPress: item.certificate
  ? () => handleEducationPress(item.certificate)
  : undefined,
showChevron: !!item.certificate,
```

### Verification Steps

1. **Verify WebView route exists**:

   ```typescript
   // In src/navigation/types.ts or RootStackParamList
   type RootStackParamList = {
     // ...
     WebView: { uri: string; title?: string };
     // ...
   };
   ```

2. **Verify certificate URLs in data**:
   - Check sample education data has certificate URLs
   - Ensure URLs are valid and accessible

3. **Test navigation flow**:
   - Tap education entry with certificate
   - Verify WebView opens
   - Verify certificate loads correctly
   - Verify back button returns to Education screen

### Files Affected

- None (implementation in TASK-075)
- Verification only

## Acceptance Criteria

- ✅ WebView navigation route exists in RootStackParamList
- ✅ handleEducationPress correctly navigates with certificate URL
- ✅ Education items with certificates show chevron
- ✅ Education items without certificates are not tappable
- ✅ Certificate title shows in WebView header
- ✅ Back button returns to Education screen
- ✅ WebView loads certificate successfully
- ✅ Error handling if certificate URL is invalid

## Test Scenarios

### Scenario 1: Navigate to certificate

**GIVEN** I am on the Education screen
**AND** an education entry has a certificate
**WHEN** I tap that entry
**THEN** I should navigate to the WebView screen
**AND** the WebView should load the certificate URL
**AND** the header should show "Certificate"

### Scenario 2: No certificate

**GIVEN** I am on the Education screen
**AND** an education entry has no certificate
**WHEN** I view that entry
**THEN** it should not have a chevron
**AND** tapping it should do nothing

### Scenario 3: Back navigation

**GIVEN** I am viewing a certificate in WebView
**WHEN** I tap the back button
**THEN** I should return to the Education screen
**AND** the Education screen should maintain its scroll position

### Scenario 4: Invalid certificate URL

**GIVEN** an education entry has an invalid certificate URL
**WHEN** I tap that entry and navigate to WebView
**THEN** the WebView should show an error
**AND** the error should be user-friendly

## Dependencies

**Prerequisites**:

- ✅ TASK-075: EducationDataScreen UI updated
- ✅ WebView screen exists
- ✅ React Navigation configured

**Enables**:

- TASK-078: E2E Tests for Education Screen Flow

## Success Criteria

- Certificate navigation works on iOS and Android
- Proper error handling for invalid URLs
- Smooth navigation transitions
- Back button behaves correctly
- Professional UX throughout

## Notes

- WebView screen is shared across features (GitHub, certificates, etc.)
- Certificate URLs should be HTTPS for security
- Consider adding loading indicator in WebView while certificate loads
- Some certificates may be PDF files - WebView should handle these
- Consider adding share button for certificates in future iteration
