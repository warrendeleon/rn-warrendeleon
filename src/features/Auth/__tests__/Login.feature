@auth @login
Feature: Email/Password Login
  As a registered user
  I want to sign in with email and password
  So that I can access protected features

  Background:
    Given the app is launched
    And I am on the "Home" screen
    And I navigate to the Login screen

  @smoke @critical
  Scenario: Successful login with valid credentials (mocked)
    When I type "testuser@example.com" into the input with testID "email-input"
    And I type "SecurePass123" into the input with testID "password-input"
    And I wait for 1 seconds
    And I tap the element with testID "login-button"
    # After login, user is navigated to the protected route they originally requested
    Then I should see the "Chat Placeholder" screen

  @validation
  Scenario: Login button disabled when form is empty
    Then I should see the "Login" screen
    And the element with testID "login-button" should be disabled

  @validation
  Scenario: Email validation error (invalid format)
    When I type "invalid-email" into the input with testID "email-input"
    And I type "SecurePass123" into the input with testID "password-input"
    And I wait for 1 seconds
    Then the element with testID "login-button" should be disabled

  @validation
  Scenario: Password validation error (too short)
    When I type "testuser@example.com" into the input with testID "email-input"
    And I type "short" into the input with testID "password-input"
    And I wait for 1 seconds
    Then the element with testID "login-button" should be disabled

  @navigation
  Scenario: Navigate to Register screen from Login
    When I tap the element with testID "register-link"
    Then I should see the "Registration" screen

  @navigation
  Scenario: Navigate to Forgot Password screen from Login
    When I tap the element with testID "forgot-password-link"
    Then I should see the "Forgot Password" screen

  @ui
  Scenario: Display all Login screen elements
    Then I should see the "Login" screen
    And I should see an element with testID "email-input"
    And I should see an element with testID "password-input"
    And I should see an element with testID "login-button"
    And I should see an element with testID "forgot-password-link"
    And I should see an element with testID "register-link"
