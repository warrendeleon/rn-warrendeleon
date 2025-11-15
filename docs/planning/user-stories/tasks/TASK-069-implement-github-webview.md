# TASK-069: Implement GitHub WebView Functionality

**Task ID**: TASK-069
**Title**: Implement GitHub Button WebView Navigation
**User Story**: Standalone - Feature Implementation
**Epic**: [EPIC-007: Home Screen UI Redesign](../epics/EPIC-007-home-screen-redesign.md)
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-11-15
**Effort Estimate**: 2 hours

---

## Description

Implement WebView functionality for the GitHub button on the HomeScreen. When users tap the GitHub button, the app should navigate to a WebView screen displaying the developer's GitHub repository at https://github.com/warrendeleon/rn-warrendeleon.

**Current State**:

- GitHub button exists with TODO handler
- No WebView screen or navigation configured
- react-native-webview not installed

**Desired State**:

- Tapping GitHub button opens WebView with GitHub repo
- WebView screen with proper navigation setup
- Type-safe navigation params for URI handling

---

## Acceptance Criteria

- [ ] react-native-webview installed and configured for iOS/Android
- [ ] WebView screen component created following project patterns
- [ ] WebView route added to RootStackParamList with URI parameter
- [ ] WebView screen added to Stack.Navigator
- [ ] handleGitHub in HomeScreen navigates to WebView with GitHub URL
- [ ] WebView displays GitHub repository correctly
- [ ] Back button navigation works properly
- [ ] Tests added for WebView screen
- [ ] TypeScript types all correct

---

## Technical Approach

### 1. Install Dependencies (0.25h)

```bash
yarn add react-native-webview
cd ios && pod install && cd ..
```

**Version**: Latest compatible with React Native 0.82.1

### 2. Create WebView Screen (0.5h)

**File**: `src/features/WebView/WebViewScreen.tsx`

Based on previous implementation pattern:

```typescript
import React from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import RNWebView from 'react-native-webview';

import type { RootStackParamList } from '@app/navigation';

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

export const WebViewScreen = () => {
  const route = useRoute<WebViewScreenRouteProp>();

  return <RNWebView source={{ uri: route.params.uri }} />;
};
```

**Structure**:

- `src/features/WebView/`
  - `WebViewScreen.tsx` - Main screen component
  - `__tests__/WebViewScreen.rntl.tsx` - Unit tests
  - `index.ts` - Barrel export

### 3. Update Navigation Types (0.25h)

**File**: `src/navigation/RootNavigator/RootNavigator.tsx`

Add to RootStackParamList:

```typescript
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Language: undefined;
  Appearance: undefined;
  ProfileData: undefined;
  WorkXPData: undefined;
  EducationData: undefined;
  WebView: { uri: string }; // New route
};
```

### 4. Add WebView Route (0.25h)

Add to Stack.Navigator:

```typescript
<Stack.Screen
  name="WebView"
  component={WebViewScreen}
  options={{ title: 'GitHub' }}
/>
```

### 5. Update HomeScreen Handler (0.25h)

Replace TODO handler:

```typescript
const handleGitHub = useCallback(() => {
  navigation.navigate('WebView', { uri: 'https://github.com/warrendeleon/rn-warrendeleon' });
}, [navigation]);
```

### 6. Testing (0.5h)

**Unit Tests** (`WebViewScreen.rntl.tsx`):

```typescript
import React from 'react';
import { renderWithProviders } from '@app/test-utils';
import { WebViewScreen } from '../WebViewScreen';

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="webview" {...props} />,
  };
});

describe('WebViewScreen', () => {
  it('renders without crashing', () => {
    const { getByTestId } = renderWithProviders(<WebViewScreen />, {
      initialRouteName: 'WebView',
      initialRouteParams: { uri: 'https://github.com/test' },
    });

    expect(getByTestId('webview')).toBeTruthy();
  });

  it('passes correct URI to WebView', () => {
    const testUri = 'https://github.com/warrendeleon/rn-warrendeleon';
    const { getByTestId } = renderWithProviders(<WebViewScreen />, {
      initialRouteName: 'WebView',
      initialRouteParams: { uri: testUri },
    });

    const webview = getByTestId('webview');
    expect(webview.props.source.uri).toBe(testUri);
  });
});
```

**Integration Test** (add to HomeScreen tests):

```typescript
it('navigates to WebView when GitHub button pressed', () => {
  const { getByText } = renderWithProviders(<HomeScreen />, {
    preloadedState: defaultState,
  });

  const githubButton = getByText(/github/i);
  fireEvent.press(githubButton);

  expect(mockNavigate).toHaveBeenCalledWith('WebView', {
    uri: 'https://github.com/warrendeleon/rn-warrendeleon',
  });
});
```

---

## Implementation Steps

1. **Install Package**:
   - Add react-native-webview via yarn
   - Install iOS pods
   - Verify installation

2. **Create Feature**:
   - Create WebView feature directory structure
   - Implement WebViewScreen component
   - Add barrel export

3. **Update Navigation**:
   - Add WebView to RootStackParamList
   - Add WebView screen to Stack.Navigator
   - Export WebViewScreen from features

4. **Update HomeScreen**:
   - Replace handleGitHub TODO with navigation call
   - Test navigation works

5. **Add Tests**:
   - WebViewScreen unit tests
   - HomeScreen integration test for GitHub navigation
   - Run full test suite

6. **Validate**:
   - Test on iOS simulator
   - Test on Android emulator (if applicable)
   - Verify back button works
   - Check light/dark theme compatibility

---

## Dependencies

**Package**:

- react-native-webview (^13.x)

**Project Files**:

- RootNavigator.tsx (navigation setup)
- HomeScreen.tsx (GitHub button handler)
- Navigation types

**External**:

- GitHub repository must be publicly accessible

---

## Benefits

**User Experience**:

- Seamless in-app browsing of GitHub repo
- No context switching to external browser
- Maintains app navigation flow

**Technical**:

- Reusable WebView pattern for future web content
- Type-safe navigation with URI params
- Follows existing project architecture

**Maintenance**:

- Simple implementation, easy to extend
- Standard React Navigation pattern
- Well-tested component

---

## Edge Cases

**Network Issues**:

- WebView shows default error UI for connection failures
- User can pull-to-refresh or navigate back

**External Links**:

- Links within GitHub (issues, PRs, etc.) open in WebView
- External links may open in system browser (WebView default behavior)

**Loading States**:

- WebView shows default loading indicator
- Future enhancement: Custom loading component

**Deep Navigation**:

- User can navigate within GitHub repo
- Back button returns to previous page or exits to HomeScreen

---

## Related Tasks

- Completed: Home Screen Button Groups (US-014)
- Potential: Add WebView for other external content (CV, Videos, Meeting)

---

## Notes

This implementation follows the same pattern used in the previous version of the app (fbea237 commit). The WebView screen is intentionally simple and focused, delegating all navigation and display logic to the react-native-webview component.

**Future Enhancements** (out of scope for this task):

- Custom loading indicators
- Custom error pages
- Progress bar
- Share functionality
- Open in browser option

**GitHub URL**: https://github.com/warrendeleon/rn-warrendeleon

---

**Last Updated**: 2025-11-15
