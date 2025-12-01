@auth @reset-password
Feature: Reset Password
  As a user who requested a password reset
  I want to set a new password using the recovery link
  So that I can regain access to my account

  # Deep link URL format: warrendeleonapp://auth/callback#access_token=TOKEN&type=recovery
  # In E2E mode, the API is mocked and any token will succeed

  # ============================================================================
  # DEEP LINK SCENARIOS - Testing the three ways a deep link can open the app
  # ============================================================================

  @smoke @critical @deep-link
  Scenario: Deep link opens Reset Password screen on cold start
    # Cold start: App is not running, user taps recovery link from email
    Given the app is launched via password reset deep link
    Then I should see the "Reset Password" screen
    And I should see an element with testID "new-password-input"
    And I should see an element with testID "confirm-password-input"
    And I should see an element with testID "reset-password-button"

  @deep-link
  Scenario: Deep link opens Reset Password screen on warm start
    # Warm start: App is in background, user taps recovery link from email
    Given the app is launched
    And I am on the "Home" screen
    When I send the app to background
    And I open the password reset deep link from background
    Then I should see the "Reset Password" screen
    And I should see an element with testID "new-password-input"

  @deep-link
  Scenario: Deep link opens Reset Password screen when app is in foreground
    # Foreground: App is active on screen, user taps recovery link (e.g. from notification)
    Given the app is launched
    And I am on the "Home" screen
    When I open the password reset deep link
    Then I should see the "Reset Password" screen
    And I should see an element with testID "new-password-input"

  # ============================================================================
  # UI ELEMENTS - Verify all form elements are displayed correctly
  # ============================================================================

  @ui
  Scenario: Display all Reset Password screen elements
    Given the app is launched via password reset deep link
    Then I should see the "Reset Password" screen
    And I should see an element with testID "new-password-input"
    And I should see an element with testID "confirm-password-input"
    And I should see an element with testID "password-requirements"
    And I should see an element with testID "reset-password-button"
    And I should see an element with testID "back-to-login-link"

  # ============================================================================
  # FORM VALIDATION - Testing password requirements and matching
  # ============================================================================

  @validation
  Scenario: Reset button disabled when passwords are empty
    Given the app is launched via password reset deep link
    Then I should see the "Reset Password" screen
    And the element with testID "reset-password-button" should be disabled

  @validation
  Scenario: Reset button disabled with weak password (too short)
    Given the app is launched via password reset deep link
    When I type "Short1!" into the input with testID "new-password-input"
    And I type "Short1!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "reset-password-button" should be disabled

  @validation
  Scenario: Reset button disabled when password lacks uppercase letter
    Given the app is launched via password reset deep link
    When I type "lowercase123!" into the input with testID "new-password-input"
    And I type "lowercase123!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "reset-password-button" should be disabled

  @validation
  Scenario: Reset button disabled when password lacks number
    Given the app is launched via password reset deep link
    When I type "NoNumberHere!" into the input with testID "new-password-input"
    And I type "NoNumberHere!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "reset-password-button" should be disabled

  @validation
  Scenario: Reset button disabled when password lacks special character
    Given the app is launched via password reset deep link
    When I type "NoSpecial123" into the input with testID "new-password-input"
    And I type "NoSpecial123" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "reset-password-button" should be disabled

  @validation
  Scenario: Reset button disabled when passwords do not match
    Given the app is launched via password reset deep link
    When I type "StrongPass123!" into the input with testID "new-password-input"
    And I type "DifferentPass456!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "reset-password-button" should be disabled

  @validation
  Scenario: Reset button enabled when password is valid and matches
    Given the app is launched via password reset deep link
    When I type "StrongPass123!" into the input with testID "new-password-input"
    And I type "StrongPass123!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "reset-password-button" should be enabled

  # ============================================================================
  # SUCCESSFUL RESET FLOW - Complete password reset journey (mocked API)
  # ============================================================================

  @smoke @critical
  Scenario: Successfully reset password and navigate to login
    Given the app is launched via password reset deep link
    When I type "NewSecurePass123!" into the input with testID "new-password-input"
    And I type "NewSecurePass123!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    And I tap the element with testID "reset-password-button"
    Then I should see an element with testID "success-message"
    And I should see an element with testID "back-to-login-button"
    When I tap the element with testID "back-to-login-button"
    Then I should see the "Login" screen

  # ============================================================================
  # NAVIGATION - Back to login without resetting
  # ============================================================================

  @navigation
  Scenario: Navigate back to login using link
    Given the app is launched via password reset deep link
    When I tap the element with testID "back-to-login-link"
    Then I should see the "Login" screen

