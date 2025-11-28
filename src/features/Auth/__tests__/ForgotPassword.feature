@auth @forgot-password
Feature: Forgot Password
  As a user who has forgotten my password
  I want to request a password reset email
  So that I can regain access to my account

  Background:
    Given the app is launched
    And I am on the "Home" screen
    And I navigate to the Login screen
    When I tap the element with testID "forgot-password-link"
    Then I should see the "Forgot Password" screen

  @smoke @critical
  Scenario: Request password reset successfully (mocked)
    When I type "user@example.com" into the input with testID "email-input"
    And I wait for 1 seconds
    And I tap the element with testID "send-reset-email-button"
    Then I should see an element with testID "success-message"
    And I should see an element with testID "back-to-login-button"

  @ui
  Scenario: Display Forgot Password screen elements
    Then I should see the "Forgot Password" screen
    And I should see an element with testID "email-input"
    And I should see an element with testID "send-reset-email-button"
    And I should see an element with testID "back-to-login-link"
    And I should see an element with testID "info-box"

  @validation
  Scenario: Send button disabled when email is empty
    Then I should see the "Forgot Password" screen
    And the element with testID "send-reset-email-button" should be disabled

  @validation
  Scenario: Send button disabled with invalid email format
    When I type "invalid-email" into the input with testID "email-input"
    And I wait for 1 seconds
    Then the element with testID "send-reset-email-button" should be disabled

  @navigation
  Scenario: Navigate back to login using link
    When I tap the element with testID "back-to-login-link"
    Then I should see the "Login" screen

  @navigation
  Scenario: Navigate back to login after success
    When I type "user@example.com" into the input with testID "email-input"
    And I wait for 1 seconds
    And I tap the element with testID "send-reset-email-button"
    Then I should see an element with testID "success-message"
    When I tap the element with testID "back-to-login-button"
    Then I should see the "Login" screen

  @ui
  Scenario: Display information about the password reset process
    Then I should see the "Forgot Password" screen
    And I should see an element with testID "info-box"
