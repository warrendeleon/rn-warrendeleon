# EPIC-023: Security Settings

**ID**: EPIC-023 | **Title**: Security Settings & Profile Management
**Status**: 📋 To Do | **Priority**: Medium | **Start Date**: TBD | **Target Date**: TBD
**Owner**: Warren de Leon | **Total Story Points**: 12 | **Total Effort**: 28.5h

---

## Epic Overview

Provide users with full security settings to manage their authentication methods, update profile information, and maintain account security.

**Key Features**:

- Change 6-digit PIN
- Toggle biometric authentication (Face ID/Touch ID/Fingerprint)
- Update profile picture
- Edit profile information (name, phone, birthday)
- Root/jailbreak detection with security warnings

---

## Business Value

### Why This Epic Matters

1. **User Control**: Users can manage their own security preferences
2. **Account Recovery**: PIN changes prevent lockouts from forgotten credentials
3. **Privacy**: Users can update personal information without contacting support
4. **Security Awareness**: Root/jailbreak detection educates users about device security risks
5. **Compliance**: Gives users control over their data (GDPR right to rectification)

### Success Metrics

| Metric                      | Target | Why It Matters                       |
| --------------------------- | ------ | ------------------------------------ |
| PIN Change Success Rate     | 95%+   | Measures ease of PIN update process  |
| Biometric Toggle Usage      | 80%+   | Shows users actively manage security |
| Profile Picture Update Rate | 60%+   | Users keep profiles current          |
| Root Detection Alert Rate   | <5%    | Most users on secure devices         |

---

## User Stories

### Overview

| ID                                                    | Title                           | Priority | Story Points | Effort | Status   |
| ----------------------------------------------------- | ------------------------------- | -------- | ------------ | ------ | -------- |
| [US-040](../stories/US-040-change-pin.md)             | Change PIN                      | High     | 4            | 9h     | 📋 To Do |
| [US-041](../stories/US-041-toggle-biometrics.md)      | Toggle Biometric Authentication | Medium   | 3            | 7h     | 📋 To Do |
| [US-042](../stories/US-042-update-profile-picture.md) | Update Profile Picture          | Medium   | 3            | 7.5h   | 📋 To Do |
| [US-043](../stories/US-043-root-detection.md)         | Root/Jailbreak Detection        | Medium   | 2            | 5h     | 📋 To Do |

**Total**: 4 user stories, 12 story points, 28.5 hours

---

## Technical Architecture

### Security Settings Screen Structure

```
SettingsScreen (Main)
├── Security Section
│   ├── Change PIN button → ChangePINScreen
│   ├── Biometric toggle → BiometricToggleScreen
│   └── Root Detection status indicator
├── Profile Section
│   ├── Profile Picture → UpdateProfilePictureScreen
│   ├── Edit Name/Phone → EditProfileScreen
│   └── Birthday field
└── Account Section
    ├── Email (read-only)
    └── Account creation date
```

### Component Hierarchy

```typescript
// Settings
- SettingsScreen (Main hub)
  - SecuritySettingsSection
    - ChangePINButton
    - BiometricToggle
    - RootDetectionIndicator
  - ProfileSettingsSection
    - ProfilePictureEditor
    - ProfileInformationForm
  - AccountSettingsSection
    - EmailDisplay (read-only)
    - AccountMetadata
```

### Data Flow

```
User taps "Change PIN"
  → Navigate to ChangePINScreen
  → User enters current PIN
  → Validate with bcrypt
  → User enters new PIN (twice for confirmation)
  → Validate new PIN (no weak PINs)
  → Hash new PIN with bcrypt
  → Store hash in Keychain
  → Update Redux state
  → Show success message
  → Navigate back to SettingsScreen
```

---

## Security Considerations

### PIN Changes

**Security Requirements**:

- Require current PIN verification before change
- Enforce weak PIN validation (no 123456, 000000, etc.)
- Hash new PIN with bcrypt (10 rounds)
- Store hash in hardware-backed Keychain
- Clear any cached PIN attempts on success

**Code Example**:

```typescript
// src/screens/settings/ChangePINScreen.tsx
const handleChangePIN = async (currentPIN: string, newPIN: string) => {
  // 1. Verify current PIN
  const currentPINHash = await Keychain.getGenericPassword({
    service: 'auth_pin_hash',
  });

  const isCurrentPINValid = await bcrypt.compare(currentPIN, currentPINHash.password);

  if (!isCurrentPINValid) {
    throw new Error('Current PIN is incorrect');
  }

  // 2. Validate new PIN
  const validation = validatePIN(newPIN);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 3. Hash and store new PIN
  const newPINHash = await bcrypt.hash(newPIN, 10);
  await Keychain.setGenericPassword('auth_pin_hash', newPINHash, {
    service: 'auth_pin_hash',
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  // 4. Success
  showSuccessMessage('PIN changed successfully');
};
```

### Biometric Toggle

**Security Requirements**:

- Verify user authentication before disabling biometrics
- If disabling biometrics, ensure PIN is set as fallback
- Update Redux state to reflect biometric preference
- Test biometric availability before enabling

**Code Example**:

```typescript
// src/screens/settings/BiometricToggleScreen.tsx
const handleToggleBiometric = async (enabled: boolean) => {
  if (enabled) {
    // Enabling biometrics
    const { isAvailable, isEnrolled } = await checkBiometricCapability();

    if (!isAvailable || !isEnrolled) {
      throw new Error('Biometrics not available on this device');
    }

    // Test authentication
    const success = await authenticate({
      promptMessage: 'Verify to enable biometric authentication',
    });

    if (!success) {
      throw new Error('Biometric verification failed');
    }

    // Save preference
    await EncryptedStorage.setItem('biometric_enabled', 'true');
    dispatch(setBiometricEnabled(true));
  } else {
    // Disabling biometrics - ensure PIN is set
    const pinHash = await Keychain.getGenericPassword({
      service: 'auth_pin_hash',
    });

    if (!pinHash) {
      throw new Error('Please set up a PIN before disabling biometrics');
    }

    await EncryptedStorage.setItem('biometric_enabled', 'false');
    dispatch(setBiometricEnabled(false));
  }
};
```

### Root/Jailbreak Detection

**Security Requirements**:

- Check on app launch and periodically
- Warn user but allow app usage (user choice)
- Log detection events for security monitoring
- Show educational message about risks

**Detection Methods**:

- File system checks (e.g., `/Applications/Cydia.app` on iOS)
- Process checks (e.g., `su`, `daemonsu` on Android)
- Library injection checks
- Sandbox checks

**Code Example**:

```typescript
// src/utils/rootDetection.ts
import JailMonkey from 'jail-monkey';

export const checkDeviceSecurity = () => {
  const isJailbroken = JailMonkey.isJailBroken();
  const isRooted = JailMonkey.isJailBroken(); // Same method for Android
  const canMockLocation = JailMonkey.canMockLocation();

  return {
    isCompromised: isJailbroken || isRooted,
    canMockLocation,
    risks: getRiskDescription(isJailbroken, isRooted, canMockLocation),
  };
};

const getRiskDescription = (jailbroken: boolean, rooted: boolean, mockLocation: boolean) => {
  const risks = [];

  if (jailbroken || rooted) {
    risks.push('Your device appears to be jailbroken/rooted');
    risks.push('This may compromise app security');
  }

  if (mockLocation) {
    risks.push('Location mocking is enabled');
  }

  return risks;
};
```

---

## Profile Picture Updates

### Image Processing Pipeline

```
User selects new picture
  → Open image picker (camera or gallery)
  → User selects/takes photo
  → Crop to 1:1 aspect ratio
  → Resize to 800×800px
  → Compress to 80% JPEG quality
  → Strip EXIF metadata
  → Generate unique filename (UUID)
  → Upload to Supabase Storage (avatars bucket)
  → Get public URL
  → Update user profile in Supabase
  → Update Encrypted Storage
  → Update Redux state
  → Show success message
```

**Libraries**:

- `react-native-image-picker`: Select/capture photo
- `react-native-image-crop-picker`: Crop to square
- `react-native-image-resizer`: Resize and compress

---

## Implementation Phases

### Phase 1: Change PIN Flow (9h)

**User Story**: [US-040](../stories/US-040-change-pin.md)

**Tasks**:

1. ChangePINScreen UI with current/new PIN inputs
2. PIN validation logic (weak PIN checks)
3. bcrypt hash update in Keychain
4. RNTL tests
5. E2E tests (Detox + Cucumber)

**Deliverables**:

- ChangePINScreen component
- usePINChange hook
- PIN validation utilities
- Complete test coverage

---

### Phase 2: Biometric Toggle (7h)

**User Story**: [US-041](../stories/US-041-toggle-biometrics.md)

**Tasks**:

1. BiometricToggleScreen UI
2. Biometric capability checks
3. Enable/disable logic with fallback validation
4. RNTL tests
5. E2E tests

**Deliverables**:

- BiometricToggleScreen component
- useBiometricToggle hook
- Redux state updates
- Complete test coverage

---

### Phase 3: Profile Picture Update (7.5h)

**User Story**: [US-042](../stories/US-042-update-profile-picture.md)

**Tasks**:

1. UpdateProfilePictureScreen UI
2. Image picker integration
3. Image processing (crop, resize, compress)
4. Supabase Storage upload
5. Profile update API call
6. RNTL tests
7. E2E tests

**Deliverables**:

- UpdateProfilePictureScreen component
- useProfilePictureUpdate hook
- Image processing utilities
- Supabase Storage integration
- Complete test coverage

---

### Phase 4: Root/Jailbreak Detection (5h)

**User Story**: [US-043](../stories/US-043-root-detection.md)

**Tasks**:

1. Root detection utility with jail-monkey
2. Security warning UI
3. Detection on app launch
4. Periodic checks
5. User education modal
6. RNTL tests
7. E2E tests

**Deliverables**:

- Root detection utilities
- SecurityWarningModal component
- App launch integration
- Complete test coverage

---

## Non-Functional Requirements

### Performance

- PIN change: <100ms (bcrypt hashing)
- Biometric toggle: <50ms (setting update)
- Profile picture upload: <5 seconds (800KB image)
- Root detection: <200ms (on app launch)

### Security

- All PIN operations use bcrypt (10 rounds)
- PINs never logged or exposed
- Biometric changes require authentication
- Profile pictures uploaded to secure Supabase bucket
- Root detection results logged for security monitoring

### Accessibility (EAA Compliance)

- All settings have clear labels
- Toggle switches have proper accessibility roles
- Success/error messages announced to screen readers
- All touch targets minimum 48×48 (Android) / 44×44 (iOS)
- Color contrast 4.5:1 for all text

### Testing

- 100% RNTL coverage for all screens and hooks
- E2E tests for all user flows (Detox + Cucumber)
- Manual testing on real devices (iOS + Android)
- Security testing for root detection bypass attempts

---

## Dependencies

### Upstream Dependencies

- EPIC-021: Registration complete (PIN and biometric setup established)
- EPIC-022: Login complete (authentication working)

### Downstream Dependencies

- None (settings are independent features)

---

## Risks & Mitigation

### Technical Risks

| Risk                                    | Probability | Impact | Mitigation                                       |
| --------------------------------------- | ----------- | ------ | ------------------------------------------------ |
| Root detection bypassed                 | Medium      | Medium | Use multiple detection methods, educate users    |
| Profile picture upload fails            | Low         | Medium | Retry logic, local caching, clear error messages |
| PIN change corrupts hash                | Low         | High   | Backup old hash before change, rollback on error |
| Biometric toggle leaves user locked out | Low         | High   | Require PIN as fallback before allowing disable  |

### UX Risks

| Risk                                   | Probability | Impact | Mitigation                                      |
| -------------------------------------- | ----------- | ------ | ----------------------------------------------- |
| Users forget current PIN during change | Medium      | High   | Provide "Forgot PIN?" link to reset via email   |
| Users confused by root warning         | Low         | Low    | Clear educational message, FAQ link             |
| Image picker permissions denied        | Medium      | Medium | Graceful permission request, explain why needed |

---

## Definition of Done

**Functional**:

- [ ] All 4 user stories complete
- [ ] All settings screens functional
- [ ] PIN change working with validation
- [ ] Biometric toggle working with fallback checks
- [ ] Profile picture upload working
- [ ] Root detection implemented

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing (iOS + Android)
- [ ] `yarn validate` passes (typecheck + lint + test)
- [ ] Zero ESLint/TypeScript errors
- [ ] Manual testing complete on real devices

**Security**:

- [ ] All PIN operations use bcrypt
- [ ] Biometric changes authenticated
- [ ] Profile pictures in secure bucket
- [ ] Root detection active on app launch

**Accessibility**:

- [ ] All EAA requirements met
- [ ] VoiceOver/TalkBack tested
- [ ] Touch targets verified

**Documentation**:

- [ ] All components documented with JSDoc
- [ ] Settings guide in README.md
- [ ] Security best practices documented

---

**Last Updated**: 2025-11-21
**Status**: Ready for implementation
**Next Review**: Before Phase 1 kickoff
