@auth @email-verification
Feature: Email Verification Screen
  As a newly registered user
  I want to see a confirmation that a verification email was sent
  So I can verify my email address and access my account

  Background:
    Given the app is launched
    And I am on the "Home" screen
    And I navigate to the Registration screen
    # Complete registration to get to Email Verification screen
    When I type "John" into the input with testID "firstName-input"
    And I type "Doe" into the input with testID "lastName-input"
    And I type "+447123456789" into the input with testID "phone-number-input"
    And I type "john.doe@example.com" into the input with testID "email-input"
    And I type "SecurePass123!" into the input with testID "password-input"
    And I type "SecurePass123!" into the input with testID "confirmPassword-input"
    And I toggle the switch with testID "accept-terms-switch"
    And I wait for 1 seconds
    And I scroll down
    And I tap the element with testID "register-button"
    # Registration navigates directly to Email Verification screen
    Then I should see the "Email Verification" screen

  @ui
  Scenario: Display all Email Verification screen elements
    Then I should see an element with testID "email-verification-screen"
    And I should see an element with testID "email-icon-container"
    And I should see an element with testID "verification-title"
    And I should see an element with testID "verification-message"
    And I should see an element with testID "email-display"
    And I should see an element with testID "email-address"
    And I should see an element with testID "resend-email-button"
    And I should see an element with testID "back-to-login-button"
    And I should see an element with testID "back-to-login-link"
    And I should see an element with testID "info-box"

  @navigation
  Scenario: Navigate to Login from Email Verification via button
    When I tap the element with testID "back-to-login-button"
    Then I should see the "Login" screen

  @navigation
  Scenario: Navigate to Login from Email Verification via link
    When I tap the element with testID "back-to-login-link"
    Then I should see the "Login" screen

