@auth @email-confirmation
Feature: Email Confirmation
  As a user who just registered
  I want to confirm my email using the confirmation link
  So that I can activate my account and be automatically logged in

  # Deep link URL format: warrendeleonapp://auth/callback#access_token=TOKEN&refresh_token=REFRESH&type=signup
  # In E2E mode, the API is mocked and any token will succeed
  # Auto-login: After email confirmation, the access token is stored and user is logged in automatically

  # ============================================================================
  # DEEP LINK SCENARIOS - Testing the three ways a deep link can open the app
  # Auto-login: User is automatically logged in and taken to Home screen
  # ============================================================================

  @smoke @critical @deep-link
  Scenario: Deep link auto-logs in user and opens Home screen on cold start
    # Cold start: App is not running, user taps confirmation link from email
    # After confirmation, user is automatically logged in via the access token
    Given the app is launched via email confirmation deep link
    Then I should see the "Home" screen

  @deep-link
  Scenario: Deep link auto-logs in user and opens Home screen on warm start
    # Warm start: App is in background, user taps confirmation link from email
    Given the app is launched
    And I am on the "Home" screen
    When I send the app to background
    And I open the email confirmation deep link from background
    Then I should see the "Home" screen

  @deep-link
  Scenario: Deep link auto-logs in user and opens Home screen when app is in foreground
    # Foreground: App is active on screen, user taps confirmation link
    Given the app is launched
    And I am on the "Home" screen
    When I open the email confirmation deep link
    Then I should see the "Home" screen

  # ============================================================================
  # USER FLOW SCENARIOS - Testing the complete user journey after confirmation
  # ============================================================================

  @user-flow
  Scenario: User is logged in and can access authenticated features after email confirmation
    # User confirms email, is auto-logged in, and can access protected features
    Given the app is launched via email confirmation deep link
    Then I should see the "Home" screen
    # Verify user can access authenticated features (Settings shows logged-in state)
    When I tap the element with testID "home-settings-button"
    Then I should see the "Settings" screen
    And I should see an element with testID "settings-user-card"
