# EPIC-006: Splash Screen with Loading Animation

**Epic ID**: EPIC-006
**Title**: Splash Screen with Loading Animation
**Status**: Not Started
**Priority**: High
**Created**: 2025-01-14
**Owner**: Warren de Leon
**Category**: UX/UI - First Launch Experience

---

## Executive Summary

Implement a polished native splash screen with Lottie logo animation and intelligent data loading orchestration, providing users with a professional first impression while the app initializes.

**Business Impact**: Professional first launch experience, perceived performance improvement, brand reinforcement through animated logo.

**Origin**: Split from EPIC-005 on 2025-01-14 to create focused, manageable epic with clear technical boundaries separate from data layer work.

---

## Business Value

### Problem

Current app launches directly to home screen:

- **No Loading Feedback**: Users see blank screen while app initializes
- **Poor First Impression**: Jarring, unprofessional launch experience
- **Brand Missed Opportunity**: No logo or brand reinforcement on launch
- **User Anxiety**: No indication that app is loading vs frozen

This leads to:

- Negative first impression (especially important for portfolio app)
- Users closing app thinking it's frozen
- Missed branding opportunity
- Unprofessional appearance compared to polished commercial apps

### Opportunity

By implementing native splash screen with animation:

- **Professional UX**: Smooth, polished first launch matching App Store quality apps
- **Brand Reinforcement**: Animated logo creates memorable first impression
- **Perceived Performance**: Visual feedback reduces perceived wait time
- **Loading Orchestration**: Intelligently manage data fetching during splash
- **Error Handling**: Graceful error recovery without jarring transitions
- **Future-Ready**: Foundation for splash-to-onboarding flows

### Success Metrics

| Metric                      | Current   | Target      | Business Impact                 |
| --------------------------- | --------- | ----------- | ------------------------------- |
| Splash screen               | No        | Yes         | Professional first launch       |
| Loading animation           | No        | Yes         | Brand reinforcement             |
| Data loading orchestration  | None      | Complete    | Smooth initialization           |
| Error recovery              | Crash     | Graceful    | Better reliability              |
| Perceived launch time       | 2-3s slow | <1s smooth  | Improved UX                     |
| Native platform integration | No        | iOS+Android | Platform-appropriate experience |

---

## Scope

### In Scope

**Native Splash Screens**:

- react-native-bootsplash installation and configuration
- iOS native splash screen configuration (LaunchScreen.storyboard)
- Android native splash screen configuration (splash.xml, themes)
- Platform-appropriate splash behaviour

**Lottie Animation**:

- lottie-react-native installation
- Logo animation assets (copy from old repo)
- Logo component with light/dark theme support
- Animation timing and transitions

**Loading Orchestration**:

- SplashScreen component with state management
- Dispatch all data fetches (profile, workXP, education)
- Handle loading states (pending, success, error)
- Navigate to home screen after successful load
- Error recovery UI and retry logic

**React Navigation Integration**:

- Integrate splash screen into navigation stack
- Smooth transitions to home screen
- Prevent back navigation to splash

**Testing**:

- RNTL tests for SplashScreen component
- RNTL tests for Logo component
- Tests for loading states and error handling
- Mock Lottie and data fetching

### Out of Scope

- **Data layer implementation** (covered in EPIC-005)
- Onboarding flow (future enhancement)
- Splash screen customization/theming beyond logo
- Video splash screens
- Splash screen analytics
- Skip splash button (not needed for fast loads)

---

## Timeline & Dates

**Start Date**: 2025-01-14
**Target Date**: 2025-01-18
**Completed Date**: _Not yet completed_

**Estimated Duration**: 4 days (~9 hours total)

**Note**: Can be developed in parallel with EPIC-005 as there are no blocking dependencies.

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 9 hours
**Actual Effort**: _To be tracked_

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: End users (first impression), design/branding

---

## ROI & Risk

**ROI Score**: Medium-High
**Risk Level**: Low

### Key Risks

**Risk 1**: Native Configuration Complexity

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Follow react-native-bootsplash official docs; test on multiple devices; use auto-generate tools

**Risk 2**: Animation Performance on Low-End Devices

- **Likelihood**: Low
- **Impact**: Low
- **Mitigation**: Optimise Lottie JSON; test on older devices; use simple animation; fallback to static image if needed

**Risk 3**: Platform-Specific Behaviours

- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**: Test on both iOS and Android; handle platform differences explicitly; use Platform API where needed

**Risk 4**: Timing Issues (Too Fast or Too Slow)

- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**: Minimum display time (e.g., 1s) to prevent flicker; maximum timeout (e.g., 10s) to prevent infinite loading

---

## User Stories

| ID                                                        | User Story                       | Status      | Story Points |
| --------------------------------------------------------- | -------------------------------- | ----------- | ------------ |
| [US-008](../stories/US-008-splash-screen-with-loading.md) | Splash Screen with Animated Logo | Not Started | 5            |
| [US-011](../stories/US-011-splash-screen-testing.md)      | Splash Screen Testing            | Not Started | 2            |

**Total Stories**: 2
**Total Story Points**: 7

---

## Tasks

| ID                                                                 | Task                                   | Status | Effort | Priority |
| ------------------------------------------------------------------ | -------------------------------------- | ------ | ------ | -------- |
| [TASK-037](../tasks/TASK-037-install-react-native-bootsplash.md)   | Install react-native-bootsplash        | To Do  | 0.5h   | High     |
| [TASK-038](../tasks/TASK-038-configure-ios-native-splash.md)       | Configure iOS native splash            | To Do  | 1h     | High     |
| [TASK-039](../tasks/TASK-039-configure-android-native-splash.md)   | Configure Android native splash        | To Do  | 1h     | High     |
| [TASK-040](../tasks/TASK-040-install-lottie-react-native.md)       | Install lottie-react-native            | To Do  | 0.5h   | High     |
| [TASK-041](../tasks/TASK-041-copy-logo-animation-assets.md)        | Copy logo animation assets             | To Do  | 0.5h   | Medium   |
| [TASK-042](../tasks/TASK-042-create-logo-component.md)             | Create Logo component                  | To Do  | 1h     | High     |
| [TASK-043](../tasks/TASK-043-create-splashscreen-component.md)     | Create SplashScreen component          | To Do  | 2h     | High     |
| [TASK-044](../tasks/TASK-044-integrate-splash-react-navigation.md) | Integrate splash with React Navigation | To Do  | 1h     | High     |
| [TASK-051](../tasks/TASK-051-rntl-tests-splash-screen.md)          | RNTL tests for Splash screen           | To Do  | 1.5h   | High     |

**Total Tasks**: 9
**Total Effort**: 9 hours

---

## Definition of Done

This epic is complete when:

1. ✅ Native Splash Screens: Working on both iOS and Android with platform-appropriate behaviour
2. ✅ Logo Animation: Lottie animation renders correctly in light and dark themes
3. ✅ Loading Orchestration: All data fetches dispatched, loading states handled, navigation triggered
4. ✅ Error Handling: Graceful error recovery with retry option
5. ✅ All Tests Pass: RNTL coverage for SplashScreen and Logo components
6. ✅ No Regressions: Existing functionality unchanged
7. ✅ Performance: Smooth animation on low-end devices, no ANR/freezing

---

## Status History

| Date       | Status      | Notes                              |
| ---------- | ----------- | ---------------------------------- |
| 2025-01-14 | Not Started | Epic created (split from EPIC-005) |

---

## Related Epics

- [EPIC-005](./EPIC-005-multi-language-portfolio-data-layer.md): Multi-Language Data Layer (provides data to load during splash)
- [EPIC-001](./EPIC-001-performance-optimization.md): Performance Optimization (benefits from optimised data loading)
- [EPIC-002](./EPIC-002-quality-reliability.md): Quality & Reliability (error boundaries help splash error handling)
- Future: Onboarding flow (could integrate with splash screen)

---

## References

- [React Native Bootsplash](https://github.com/zoontek/react-native-bootsplash)
- [Lottie React Native](https://github.com/lottie-react-native/lottie-react-native)
- [Lottie Animation Format](https://airbnb.io/lottie/)
- [iOS Human Interface Guidelines - Launch Screens](https://developer.apple.com/design/human-interface-guidelines/launching)
- [Android Material Design - Launch Screens](https://material.io/design/communication/launch-screen.html)
- [Old Repository](https://github.com/warrendeleon/rn-warrendeleon/tree/fbea2378ec61d843568a2ae5531cc61dcd221993) (logo animation assets)

---

## Technical Notes

### Native Configuration

**iOS (`ios/warrendeleon/LaunchScreen.storyboard`)**:

- Use auto-generated storyboard from react-native-bootsplash CLI
- Background colour should match app theme
- Center logo with appropriate sizing

**Android (`android/app/src/main/res/drawable/splash.xml`)**:

- Use auto-generated splash drawable
- Configure theme in `styles.xml` to hide action bar
- Handle notch/cutout appropriately

### Lottie Animation

**Assets location**: `src/assets/animations/logo.json`

**Animation specs**:

- Duration: ~2s (loop if data loading takes longer)
- Frame rate: 60fps
- Size: Optimised (<100KB)
- Theme support: Use dynamic colours from app theme

### Loading Orchestration

```typescript
// Pseudo-code for splash screen logic
useEffect(() => {
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchProfile()),
        dispatch(fetchWorkXP()),
        dispatch(fetchEducation()),
      ]);
      // Minimum display time to prevent flicker
      await minDelay(1000);
      navigation.replace('Home');
    } catch (error) {
      // Show error UI with retry option
      setError(error);
    } finally {
      RNBootSplash.hide({ fade: true });
    }
  };

  loadData();
}, []);
```

---

**Last Updated**: 2025-01-14
