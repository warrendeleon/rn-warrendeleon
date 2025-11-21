# US-035: Biometric Security Setup

**User Story ID**: US-035
**Title**: Biometric Security Setup (Face ID / Fingerprint / 6-Digit PIN)
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: 📋 To Do
**Priority**: High
**Story Points**: 4
**Effort Estimate**: 9 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## User Story

**As a** user who has just registered,
**I want to** set up biometric authentication (Face ID, Fingerprint, or 6-digit PIN),
**So that** I can quickly and securely access the app without typing my password every time.

---

## Context & Rationale

### Why This Story Exists

Biometric authentication provides the perfect balance between security and convenience. Users expect modern apps to support Face ID/Fingerprint for quick access, while maintaining bank-grade security. A 6-digit PIN fallback ensures all users can benefit from quick re-authentication, regardless of device capabilities.

### Business Value

**Enhanced Security**:

- Biometric authentication is more secure than passwords (can't be guessed, phished, or shared)
- Reduces risk of unauthorized access (biometrics can't be observed or stolen)
- Hardware-backed security (iOS Secure Enclave, Android Keystore)
- Prevents shoulder surfing attacks (unlike password entry)

**Improved User Experience**:

- Re-authentication in <2 seconds (vs ~10 seconds typing password)
- No password fatigue (users don't need to remember/type password frequently)
- Modern, expected feature (90%+ of banking apps use biometrics)
- Professional appearance (builds trust and credibility)

**Reduced Support Burden**:

- Fewer "forgot password" tickets from active users
- Less frustration from repeated login requirements
- Higher user retention (friction reduction)

### User Benefits

1. **Speed**: Unlock app in <2 seconds with Face ID/Fingerprint
2. **Convenience**: No need to remember or type password for re-authentication
3. **Security**: Biometrics more secure than passwords for device access
4. **Flexibility**: Can choose Face ID, Fingerprint, or PIN based on preference and device capabilities
5. **Control**: Can disable biometrics in Settings if desired (reverts to full login)

### Technical Benefits

1. **Session Management**: Biometrics validate session without server round-trip
2. **Token Protection**: Refresh tokens safely stored in Keychain, accessed only via biometric/PIN
3. **Offline Support**: Biometric authentication works without internet connection
4. **Industry Standard**: Uses platform-native APIs (LocalAuthentication, BiometricPrompt)
5. **Revocable**: User can disable biometrics in Settings without affecting account

---

## Impact & Effort

### Story Points: 4

**Justification**:

- Moderate complexity (platform-specific biometric APIs, fallback handling)
- Native module integration (react-native-biometrics)
- UI complexity (multiple screens: capability detection, setup, PIN entry, confirmation)
- State management (biometric preference stored in Keychain)
- Testing complexity (mocking biometric prompts, testing all fallback scenarios)

**Compared to Similar Stories**:

- Similar complexity to LinkedIn OAuth (US-034: 5 SP) - both involve device capabilities and fallback handling
- Less complex than email/password registration (US-033: 8 SP) - no server interaction, simpler flow

### Effort: 9 hours

**Breakdown**:

- TASK-209: Biometric Capability Detection (1.5h)
- TASK-210: BiometricSetupScreen UI (3h)
- TASK-211: 6-Digit PIN Setup Screen (2.5h)
- TASK-212: Biometric Setup E2E Tests (2h)

**Confidence**: Medium - Platform differences (iOS vs Android) may add debugging time

---

## Acceptance Criteria

### Functional Requirements

- [ ] **Automatic trigger** shows BiometricSetupScreen immediately after first successful login/registration
- [ ] **Capability detection** identifies available biometric type (Face ID, Fingerprint, or none)
- [ ] **Preference hierarchy** presents options in order: Face ID → Fingerprint → 6-digit PIN
- [ ] **Face ID setup** prompts user to enable Face ID if available (iOS only)
- [ ] **Fingerprint setup** prompts user to enable Fingerprint if available (iOS Touch ID, Android Fingerprint)
- [ ] **PIN setup** prompts user to create 6-digit PIN if no biometrics available or user declines biometrics
- [ ] **PIN confirmation** requires user to re-enter PIN to confirm (must match)
- [ ] **PIN validation** rejects weak PINs (e.g., "123456", "000000", "111111")
- [ ] **Decline option** allows user to skip biometric setup with clear warning
- [ ] **Warning message** explains re-login requirement if biometric security declined ("You'll need to log in with your password every time")
- [ ] **Settings integration** allows user to change PIN or toggle biometrics on/off later
- [ ] **Keychain storage** stores biometric preference and hashed PIN in Keychain (never AsyncStorage)

### Security Requirements

- [ ] **Keychain-only storage** for biometric preference and PIN (NEVER AsyncStorage, NEVER Redux)
- [ ] **PIN hashing** uses bcrypt or Argon2 before storing (never store plain text)
- [ ] **Hardware-backed** biometric authentication uses Secure Enclave (iOS) / Keystore (Android)
- [ ] **No server storage** - biometric preference and PIN stored locally only
- [ ] **Biometric-protected Keychain** requires biometric/PIN to access tokens
- [ ] **Fallback to PIN** automatically shown if biometric authentication fails 3 times
- [ ] **Device-bound** biometric settings don't sync across devices (device-specific security)
- [ ] **No logging** of PIN attempts or biometric results (security)

### UI/UX Requirements

- [ ] **Clear explanations** describe benefits of each security option
- [ ] **Visual indicators** show which biometric type is available (Face ID icon, Fingerprint icon)
- [ ] **Progress indication** shows user is on "Step 1 of 2" (biometric → PIN confirmation)
- [ ] **Error feedback** for weak PINs ("Please choose a more secure PIN")
- [ ] **Success feedback** after setup complete ("Face ID enabled!")
- [ ] **Skip warning** prominently displayed with consequences ("You'll need to enter your password every time")
- [ ] **GlueStack UI styling** consistent with rest of app
- [ ] **NativeWind classes** for Tailwind-style layout
- [ ] **Accessibility** follows EAA compliance (labels, hints, touch targets 44×44)

### Testing Requirements

- [ ] **100% RNTL coverage** for BiometricSetupScreen component
- [ ] **100% RNTL coverage** for PINSetupScreen component
- [ ] **100% RNTL coverage** for biometric capability detection logic
- [ ] **Detox E2E test** for Face ID setup (iOS simulator)
- [ ] **Detox E2E test** for Fingerprint setup (Android emulator)
- [ ] **Detox E2E test** for 6-digit PIN setup
- [ ] **Detox E2E test** for declining biometric setup
- [ ] **Physical device testing** on iOS and Android (biometric simulators behave differently)

### Performance Requirements

- [ ] **Capability detection** completes in <500ms
- [ ] **Biometric prompt** appears in <1 second after button press
- [ ] **PIN setup** validates and stores in <1 second
- [ ] **Screen navigation** smooth with no lag

---

## Test Scenarios

### Scenario 1: Face ID Setup (iOS with Face ID)

```gherkin
Feature: Face ID Security Setup

  Scenario: User enables Face ID after first login
    Given I am a user who just logged in for the first time
    And my device has Face ID capability
    When I see the BiometricSetupScreen
    Then I should see the heading "Secure Your Account"
    And I should see "Enable Face ID for quick and secure access"
    And I should see a Face ID icon
    When I tap "Enable Face ID"
    Then I should see the native Face ID prompt
    When I authenticate with Face ID successfully
    Then I should see a success message "Face ID enabled!"
    And Face ID preference should be saved in Keychain
    And I should be redirected to the Home screen
```

### Scenario 2: Fingerprint Setup (Android with Fingerprint)

```gherkin
Feature: Fingerprint Security Setup

  Scenario: User enables Fingerprint after registration
    Given I am a user who just registered
    And my device has Fingerprint capability
    When I see the BiometricSetupScreen
    Then I should see "Enable Fingerprint for quick and secure access"
    And I should see a Fingerprint icon
    When I tap "Enable Fingerprint"
    Then I should see the native Fingerprint prompt
    When I scan my fingerprint successfully
    Then I should see a success message "Fingerprint enabled!"
    And Fingerprint preference should be saved in Keychain
```

### Scenario 3: 6-Digit PIN Setup (No Biometrics Available)

```gherkin
Feature: PIN Security Setup

  Scenario: User creates 6-digit PIN when no biometrics available
    Given I am a user who just logged in for the first time
    And my device has no biometric capability
    When I see the BiometricSetupScreen
    Then I should see "Set up a 6-digit PIN for quick access"
    And I should NOT see Face ID or Fingerprint options
    When I tap "Set up PIN"
    Then I should see a PIN entry screen with 6 digit fields
    When I enter PIN "123789"
    And I tap "Continue"
    Then I should see "Confirm your PIN"
    When I enter PIN "123789" again
    And I tap "Confirm"
    Then I should see a success message "PIN created!"
    And my hashed PIN should be saved in Keychain
    And I should be redirected to the Home screen
```

### Scenario 4: Weak PIN Rejection

```gherkin
Feature: PIN Validation

  Scenario: User tries to create weak PIN
    Given I am on the PIN setup screen
    When I enter PIN "123456"
    And I tap "Continue"
    Then I should see an error "Please choose a more secure PIN"
    And I should NOT proceed to confirmation screen
    When I enter PIN "847259"
    And I tap "Continue"
    Then I should proceed to PIN confirmation screen
```

### Scenario 5: PIN Confirmation Mismatch

```gherkin
Feature: PIN Confirmation Validation

  Scenario: User enters mismatched PINs
    Given I have entered PIN "123789" and tapped "Continue"
    And I am on the PIN confirmation screen
    When I enter PIN "987654"
    And I tap "Confirm"
    Then I should see an error "PINs don't match. Please try again."
    And I should be returned to the PIN entry screen
    When I enter PIN "123789" and confirm with "123789"
    Then PIN setup should complete successfully
```

### Scenario 6: Declining Biometric Setup

```gherkin
Feature: Skip Biometric Setup

  Scenario: User declines to set up biometric security
    Given I am on the BiometricSetupScreen
    And my device has Face ID capability
    When I tap "Skip for now"
    Then I should see a warning modal
    And the modal should say "You'll need to log in with your password every time"
    And I should see buttons "Go Back" and "Skip Anyway"
    When I tap "Skip Anyway"
    Then no biometric preference should be saved
    And I should be redirected to the Home screen
    And I should need to enter my full password on next app resume
```

### Scenario 7: Changing Security Method in Settings

```gherkin
Feature: Security Settings Management

  Scenario: User wants to change from Face ID to PIN
    Given I have Face ID enabled
    And I am on the Security Settings screen
    When I tap "Change Security Method"
    Then I should see options: "Face ID", "Fingerprint", "6-digit PIN", "None"
    When I select "6-digit PIN"
    Then I should be prompted to authenticate with current Face ID
    When I authenticate successfully
    Then I should be guided through PIN setup
    When I complete PIN setup
    Then Face ID should be disabled
    And PIN should be enabled
    And I should see "Security method updated to PIN"
```

---

## Risks & Mitigation

### Risk 1: Biometric Enrollment Issues

- **Likelihood**: Medium (users may not have biometrics enrolled on device)
- **Impact**: Medium (can't use Face ID/Fingerprint if not enrolled)
- **Mitigation**:
  - Detect enrollment status before offering biometric option
  - Show helpful message: "Set up Face ID in your device Settings to enable it here"
  - PIN fallback always available
  - Clear instructions in app guide users to system settings

### Risk 2: Platform Differences (iOS vs Android)

- **Likelihood**: High (biometric APIs differ significantly)
- **Impact**: Medium (may work on one platform but not the other)
- **Mitigation**:
  - Use `react-native-biometrics` library (abstracts platform differences)
  - Comprehensive testing on both iOS and Android physical devices
  - Platform-specific E2E tests
  - Graceful degradation if biometric API fails

### Risk 3: Keychain Storage Failures

- **Likelihood**: Low (but catastrophic if happens)
- **Impact**: High (user locked out, can't access tokens)
- **Mitigation**:
  - Wrap all Keychain operations in try-catch
  - Fallback to full login if Keychain access fails
  - Clear error messages: "Biometric setup failed. Please try again or contact support."
  - Logging (without sensitive data) for debugging

### Risk 4: PIN Weakness (User Chooses Weak PIN)

- **Likelihood**: High (users often choose sequential or repeated digits)
- **Impact**: Low (PIN is device-local, not server authentication)
- **Mitigation**:
  - Blacklist common weak PINs (123456, 000000, 111111, etc.)
  - Reject sequential patterns (123456, 654321)
  - Reject repeated digits (111111, 222222)
  - Educate user with validation messages

### Risk 5: Biometric Failure During Authentication

- **Likelihood**: Medium (Face ID can fail in poor lighting, Fingerprint with wet fingers)
- **Impact**: Low (user can retry or use PIN fallback)
- **Mitigation**:
  - Allow unlimited biometric retry attempts
  - After 3 failures, offer PIN fallback
  - After 5 failures, offer full password login
  - Clear error messages for each failure type

---

## Pros & Cons

### Pros

✅ **Enhanced Security**: Biometrics more secure than passwords on device
✅ **Improved UX**: Quick access (<2 seconds vs ~10 seconds)
✅ **Industry Standard**: Expected feature in modern apps
✅ **Reduced Friction**: No password fatigue for active users
✅ **Offline Support**: Works without internet connection
✅ **Flexibility**: Multiple options (Face ID, Fingerprint, PIN, or none)
✅ **Revocable**: User can disable in Settings without affecting account

### Cons

❌ **Platform Complexity**: iOS and Android biometric APIs differ
❌ **Testing Difficulty**: Hard to test biometrics in CI/CD (requires physical devices)
❌ **Enrollment Dependency**: Users must have biometrics set up on device
❌ **False Sense of Security**: Device-level security, not account-level
❌ **Additional Code**: Adds complexity to authentication flow
❌ **Support Burden**: Users may need help with biometric setup

---

## Definition of Ready

This story is ready to start when:

- [x] **react-native-biometrics** library researched and approved
- [x] **Design mockups** approved for BiometricSetupScreen and PINSetupScreen
- [x] **Keychain storage** implemented and tested (TASK-191 complete)
- [x] **Redux auth slice** supports biometric preference (TASK-196 complete)
- [x] **Navigation flow** defined (when to show BiometricSetupScreen)
- [x] **Security requirements** reviewed from SECURITY.md

---

## Definition of Done

This story is complete when:

- [ ] **All acceptance criteria** are met (functional, security, UI/UX, testing, performance)
- [ ] **All 4 tasks** completed (TASK-209 through TASK-212)
- [ ] **100% RNTL coverage** for BiometricSetupScreen and PINSetupScreen
- [ ] **All E2E tests passing** (Face ID, Fingerprint, PIN, decline scenarios)
- [ ] **Physical device testing** completed on iOS and Android
- [ ] **Biometric authentication** works end-to-end (setup → resume app → re-auth)
- [ ] **PIN fallback** works when biometrics unavailable or fail
- [ ] **Settings integration** allows changing security method
- [ ] **Code review** completed with no blockers
- [ ] **`yarn validate`** passes (typecheck + lint + test)
- [ ] **EAA compliance** verified (accessibilityRole, label, hint, touch targets)
- [ ] **Security audit** passed (Keychain storage, PIN hashing, no logging)
- [ ] **Documentation** updated (README, user guide)

---

## Dependencies

### Depends On (Blockers)

- **TASK-191**: 3-Tier Storage Implementation (Keychain for biometric preference/PIN)
- **TASK-196**: Redux Auth Slice (state management for biometric preference)
- **US-033**: Email/Password Registration (provides navigation trigger to BiometricSetupScreen)
- **US-034**: LinkedIn OAuth Registration (alternative navigation trigger to BiometricSetupScreen)

### Blocks (Dependent Stories)

- **US-036**: Email/Password Login (uses biometric re-authentication)
- **US-037**: Magic Link Login (uses biometric re-authentication)
- **US-038**: Session Management (biometric re-auth when app resumes)
- **US-040**: Security Settings (manage biometric preferences)

---

## Tasks

| ID                                                              | Task                           | Status   | Effort | Priority |
| --------------------------------------------------------------- | ------------------------------ | -------- | ------ | -------- |
| [TASK-209](../tasks/TASK-209-biometric-capability-detection.md) | Biometric Capability Detection | 📋 To Do | 1.5h   | High     |
| [TASK-210](../tasks/TASK-210-biometric-setup-screen.md)         | BiometricSetupScreen UI        | 📋 To Do | 3h     | High     |
| [TASK-211](../tasks/TASK-211-pin-setup-screen.md)               | 6-Digit PIN Setup Screen       | 📋 To Do | 2.5h   | High     |
| [TASK-212](../tasks/TASK-212-biometric-setup-e2e-tests.md)      | Biometric Setup E2E Tests      | 📋 To Do | 2h     | Medium   |

**Total Tasks**: 4
**Total Effort**: 9 hours

---

## Implementation Phases

### Phase 1: Capability Detection (TASK-209) - 1.5h

**Objective**: Detect device biometric capabilities and guide user to appropriate setup.

**Implementation**:

```typescript
// hooks/useBiometricCapability.ts
import ReactNativeBiometrics from 'react-native-biometrics';

export const useBiometricCapability = () => {
  const [capability, setCapability] = useState<'faceId' | 'fingerprint' | 'none'>('none');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const detectCapability = async () => {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available) {
        if (biometryType === 'FaceID') setCapability('faceId');
        else if (biometryType === 'TouchID' || biometryType === 'Biometrics') {
          setCapability('fingerprint');
        }

        // Check enrollment
        const { biometryAvailable } = await rnBiometrics.isSensorAvailable();
        setIsEnrolled(biometryAvailable);
      }
    };

    detectCapability();
  }, []);

  return { capability, isEnrolled };
};
```

**Deliverable**: Hook that reliably detects biometric capabilities across iOS/Android

### Phase 2: BiometricSetupScreen UI (TASK-210) - 3h

**Objective**: Build screen that presents appropriate biometric option based on capability.

**Components**:

```typescript
// screens/BiometricSetupScreen.tsx
const BiometricSetupScreen = () => {
  const { capability, isEnrolled } = useBiometricCapability();
  const navigation = useNavigation();

  const handleEnableBiometric = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Confirm your identity'
    });

    if (success) {
      await SecureStore.setBiometricPreference(capability);
      showToast('success', `${capability === 'faceId' ? 'Face ID' : 'Fingerprint'} enabled!`);
      navigation.navigate('Home');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Biometric Setup?',
      "You'll need to log in with your password every time.",
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Skip Anyway',
          style: 'destructive',
          onPress: () => navigation.navigate('Home')
        }
      ]
    );
  };

  if (capability === 'none' || !isEnrolled) {
    return <PINSetupScreen />;
  }

  return (
    <VStack className="flex-1 p-6" space="lg">
      <Heading>Secure Your Account</Heading>
      <Text>
        Enable {capability === 'faceId' ? 'Face ID' : 'Fingerprint'} for quick and secure access
      </Text>
      <Icon name={capability === 'faceId' ? 'face-id' : 'fingerprint'} size={64} />

      <Button onPress={handleEnableBiometric} testID="enable-biometric-button">
        <ButtonText>Enable {capability === 'faceId' ? 'Face ID' : 'Fingerprint'}</ButtonText>
      </Button>

      <Button variant="link" onPress={handleSkip} testID="skip-biometric-button">
        <ButtonText>Skip for now</ButtonText>
      </Button>
    </VStack>
  );
};
```

**Deliverable**: Fully functional BiometricSetupScreen with EAA compliance

### Phase 3: PIN Setup Screen (TASK-211) - 2.5h

**Objective**: Build 6-digit PIN entry screen with validation and confirmation.

**Components**:

```typescript
// screens/PINSetupScreen.tsx
const PINSetupScreen = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const WEAK_PINS = ['123456', '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '654321'];

  const validatePIN = (value: string): boolean => {
    if (WEAK_PINS.includes(value)) {
      setError('Please choose a more secure PIN');
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (step === 'enter') {
      if (validatePIN(pin)) {
        setStep('confirm');
        setError('');
      }
    } else {
      if (pin === confirmPin) {
        // Hash PIN before storing
        const hashedPIN = await bcrypt.hash(pin, 10);
        await SecureStore.setPIN(hashedPIN);
        showToast('success', 'PIN created!');
        navigation.navigate('Home');
      } else {
        setError("PINs don't match. Please try again.");
        setStep('enter');
        setPin('');
        setConfirmPin('');
      }
    }
  };

  return (
    <VStack className="flex-1 p-6" space="lg">
      <Heading>{step === 'enter' ? 'Create a 6-digit PIN' : 'Confirm your PIN'}</Heading>

      <PINInput
        value={step === 'enter' ? pin : confirmPin}
        onChange={step === 'enter' ? setPin : setConfirmPin}
        length={6}
        secureTextEntry
        testID="pin-input"
      />

      {error && <Text className="text-error">{error}</Text>}

      <Button
        onPress={handleContinue}
        disabled={step === 'enter' ? pin.length !== 6 : confirmPin.length !== 6}
        testID="pin-continue-button"
      >
        <ButtonText>{step === 'enter' ? 'Continue' : 'Confirm'}</ButtonText>
      </Button>
    </VStack>
  );
};
```

**Deliverable**: PIN setup flow with validation, confirmation, and secure storage

### Phase 4: Testing (TASK-212) - 2h

**RNTL Tests** (included in component tasks):

- BiometricSetupScreen renders correctly for Face ID
- BiometricSetupScreen renders correctly for Fingerprint
- BiometricSetupScreen shows PIN setup when no biometrics
- Skip button shows warning modal
- PINSetupScreen validates weak PINs
- PINSetupScreen validates mismatched confirmation
- All accessibility props present

**Detox E2E Tests** (2h):

- Face ID setup flow (iOS simulator)
- Fingerprint setup flow (Android emulator)
- 6-digit PIN setup with validation
- Skip biometric setup shows warning
- Change security method in Settings

**Deliverable**: 100% coverage, all E2E scenarios passing on both platforms

---

## Alternative Approaches Considered

### Approach 1: 4-Digit PIN (User Originally Suggested)

**Pros**: Faster to enter, common standard
**Cons**: Less secure (10,000 combinations vs 1,000,000 for 6-digit)
**Decision**: Use 6-digit PIN for better security (as user agreed)

### Approach 2: Require Biometric Setup (No Skip Option)

**Pros**: All users secured, simpler flow
**Cons**: Blocks users without biometrics, poor UX, user loses autonomy
**Decision**: Make biometric setup optional with clear warning

### Approach 3: Pattern Lock as Alternative

**Pros**: Common on Android, visual memory easier for some users
**Cons**: Less secure than PIN, platform-specific (not iOS), harder to implement
**Decision**: Stick with 6-digit PIN as universal fallback

### Approach 4: Store PIN on Server for Multi-Device Sync

**Pros**: PIN works across devices
**Cons**: Security nightmare (server breach exposes PINs), violates principle of device-local security
**Decision**: Store PIN locally only (device-bound security)

---

## References

### React Native Libraries

- [react-native-biometrics](https://github.com/SelfLender/react-native-biometrics) - Biometric authentication
- [react-native-keychain](https://github.com/oblador/react-native-keychain) - Secure storage

### Platform Documentation

- [iOS LocalAuthentication](https://developer.apple.com/documentation/localauthentication) - Face ID/Touch ID
- [Android BiometricPrompt](https://developer.android.com/training/sign-in/biometric-auth) - Fingerprint/Face

### Security Standards

- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Project Security Standards](../../readme/SECURITY.md)

### Internal Documentation

- [EPIC-021: Registration & Profile Setup](../epics/EPIC-021-registration-profile-setup.md)
- [US-033: Email/Password Registration](./US-033-email-password-registration.md)
- [TASK-191: 3-Tier Storage Implementation](../tasks/TASK-191-three-tier-storage-implementation.md)

---

**Last Updated**: 2025-11-21
