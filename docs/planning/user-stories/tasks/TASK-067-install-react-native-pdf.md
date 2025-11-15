# TASK-067: Install react-native-pdf Dependencies

**Epic**: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
**User Story**: [US-015: CV PDF Viewer](../stories/US-015-cv-pdf-viewer.md)
**Status**: ⭕ Not Started
**Priority**: High
**Estimated Effort**: 0.5 hours
**Created**: 2025-11-15

---

## Context

Install react-native-pdf library and its peer dependency react-native-blob-util to enable native PDF viewing in the app. This library provides better performance and features compared to WebView-based PDF rendering.

## Technical Details

### Libraries to Install

1. **react-native-pdf@7.0.3**
   - Native PDF rendering for iOS and Android
   - Supports URL loading with caching
   - Zoom, pan, page navigation

2. **react-native-blob-util@0.23.2**
   - Peer dependency for react-native-pdf
   - Handles file downloads and caching
   - Cross-platform file system access

### Installation Steps

```bash
# Install npm packages
yarn add react-native-pdf react-native-blob-util

# Install iOS native dependencies
cd ios && pod install && cd ..
```

### Files Affected

- `package.json` - Add dependencies
- `yarn.lock` - Lock versions
- `ios/Podfile.lock` - iOS native dependencies
- `ios/Pods/` - CocoaPods installation

### Verification

```bash
# Check installations
yarn list react-native-pdf
yarn list react-native-blob-util

# Verify iOS pods
cd ios && pod list | grep -i pdf
```

## Acceptance Criteria

- ✅ react-native-pdf@7.0.3 installed
- ✅ react-native-blob-util@0.23.2 installed
- ✅ iOS CocoaPods dependencies installed
- ✅ No peer dependency warnings
- ✅ TypeScript types available
- ✅ yarn ios builds successfully

## Test Scenarios

### Scenario 1: Installation succeeds

**GIVEN** I have a clean project state
**WHEN** I run `yarn add react-native-pdf react-native-blob-util`
**THEN** both packages should install without errors
**AND** package.json should list the dependencies
**AND** yarn.lock should be updated

### Scenario 2: iOS native linking succeeds

**GIVEN** packages are installed
**WHEN** I run `cd ios && pod install`
**THEN** Pods should install without errors
**AND** RNPdf pod should be listed
**AND** RNBlobUtil pod should be listed

### Scenario 3: Build verification

**GIVEN** all dependencies are installed
**WHEN** I run `yarn ios`
**THEN** the build should succeed
**AND** no linking errors should occur

## Dependencies

**Prerequisites**:

- ✅ Node.js 22.12
- ✅ Yarn 3.6.4
- ✅ CocoaPods configured
- ✅ Ruby 3.3.6 (for CocoaPods)

**Enables**:

- TASK-068: Create PDFScreen Component

## Success Criteria

- react-native-pdf successfully installed and linked
- iOS build completes without errors
- Ready to import and use Pdf component from 'react-native-pdf'

## Notes

- react-native-pdf v7.0.3 supports React Native 0.82.1 New Architecture
- Codegen artifacts will be generated automatically during pod install
- react-native-blob-util is required for file caching and downloads
