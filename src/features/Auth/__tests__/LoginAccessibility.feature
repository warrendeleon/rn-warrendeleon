@accessibility @login @eaa
Feature: Login Screen Accessibility
  As a user with accessibility needs
  I want the login screen to be fully accessible
  So that I can authenticate regardless of my abilities

  Background:
    Given the app is launched
    And I am on the "Home" screen
    And I navigate to the Login screen

  # UI Element Visibility (Basic Accessibility)
  @ui @critical
  Scenario: All form elements are visible and tappable
    Then I should see the "Login" screen
    And I should see an element with testID "email-input"
    And I should see an element with testID "password-input"
    And I should see an element with testID "login-button"
    And I should see an element with testID "forgot-password-link"
    And I should see an element with testID "register-link"

  # Form State Accessibility
  @state
  Scenario: Disabled state prevents interaction
    Then the element with testID "login-button" should be disabled

  @state
  Scenario: Button becomes enabled with valid input
    When I type "testuser@example.com" into the input with testID "email-input"
    And I type "SecurePass123" into the input with testID "password-input"
    And I wait for 1 seconds
    Then the element with testID "login-button" should be enabled

  # Password Visibility Toggle (Accessibility Feature)
  @password
  Scenario: Password visibility can be toggled
    When I type "SecurePass123!" into the input with testID "password-input"
    And I tap the element with testID "password-visibility-toggle"
    And I wait for 1 seconds
    # Password is now visible - toggle button should reflect new state
    And I tap the element with testID "password-visibility-toggle"
    And I wait for 1 seconds
    # Password hidden again
    Then I should see an element with testID "password-input"

  # Error Display (Accessibility - Errors Must Be Perceivable)
  # E2E mock returns auth error for passwords starting with "Wrong"
  @errors
  Scenario: Authentication error is displayed visually
    When I type "testuser@example.com" into the input with testID "email-input"
    And I type "WrongPassword123!" into the input with testID "password-input"
    And I wait for 1 seconds
    And I tap the element with testID "login-button"
    And I wait for 3 seconds
    Then I should see an element with testID "auth-error-message"

  # Keyboard Flow (Sequential Focus)
  @keyboard
  Scenario: Form can be completed in sequence
    When I type "testuser@example.com" into the input with testID "email-input"
    And I wait for 1 seconds
    And I type "SecurePass123" into the input with testID "password-input"
    And I wait for 1 seconds
    And I tap the element with testID "login-button"
    Then I should see the "Chat Placeholder" screen

  # Navigation Links (Alternative Paths)
  @navigation
  Scenario: Forgot password link is accessible
    When I tap the element with testID "forgot-password-link"
    Then I should see the "Forgot Password" screen

  @navigation
  Scenario: Registration link is accessible
    When I tap the element with testID "register-link"
    Then I should see the "Registration" screen
