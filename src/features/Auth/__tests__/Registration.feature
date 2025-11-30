@auth @registration
Feature: User Registration
  As a new user
  I want to register with email and password
  So I can create an account and access the app

  Background:
    Given the app is launched
    And I am on the "Home" screen
    And I navigate to the Registration screen

  @smoke @critical
  Scenario: Successful registration with valid data (mocked)
    When I type "John" into the input with testID "firstName-input"
    And I type "Doe" into the input with testID "lastName-input"
    And I type "+447123456789" into the input with testID "phone-number-input"
    And I type "john.doe@example.com" into the input with testID "email-input"
    And I type "SecurePass123!" into the input with testID "password-input"
    And I type "SecurePass123!" into the input with testID "confirmPassword-input"
    And I toggle the switch with testID "accept-terms-switch"
    And I wait for 1 seconds
    And I tap the element with testID "register-button"
    # Successful registration shows email verification dialog (using testID)
    Then I should see an alert with title "verify-email-dialog"
    When I tap "verify-email-ok-button" on the alert
    Then I should see the "Login" screen

  @ui
  Scenario: Display all Registration screen elements
    Then I should see the "Registration" screen
    And I should see an element with testID "firstName-input"
    And I should see an element with testID "lastName-input"
    And I should see an element with testID "phone-number-input"
    And I should see an element with testID "email-input"
    And I should see an element with testID "password-input"
    And I should see an element with testID "confirmPassword-input"
    And I should see an element with testID "accept-terms-switch"
    And I should see an element with testID "register-button"
    And I should see an element with testID "login-link"

  @validation
  Scenario: Register button disabled when form is empty
    Then I should see the "Registration" screen
    And the element with testID "register-button" should be disabled

  @validation
  Scenario: Registration fails with invalid email format
    When I type "John" into the input with testID "firstName-input"
    And I type "Doe" into the input with testID "lastName-input"
    And I type "+447123456789" into the input with testID "phone-number-input"
    And I type "invalid-email" into the input with testID "email-input"
    And I type "SecurePass123!" into the input with testID "password-input"
    And I type "SecurePass123!" into the input with testID "confirmPassword-input"
    And I toggle the switch with testID "accept-terms-switch"
    And I wait for 1 seconds
    Then the element with testID "register-button" should be disabled

  @validation
  Scenario: Registration fails with weak password
    When I type "John" into the input with testID "firstName-input"
    And I type "Doe" into the input with testID "lastName-input"
    And I type "+447123456789" into the input with testID "phone-number-input"
    And I type "john.doe@example.com" into the input with testID "email-input"
    And I type "weak" into the input with testID "password-input"
    And I type "weak" into the input with testID "confirmPassword-input"
    And I toggle the switch with testID "accept-terms-switch"
    And I wait for 1 seconds
    Then the element with testID "register-button" should be disabled

  @validation
  Scenario: Registration fails with password mismatch
    When I type "John" into the input with testID "firstName-input"
    And I type "Doe" into the input with testID "lastName-input"
    And I type "+447123456789" into the input with testID "phone-number-input"
    And I type "john.doe@example.com" into the input with testID "email-input"
    And I type "SecurePass123!" into the input with testID "password-input"
    And I type "DifferentPass456!" into the input with testID "confirmPassword-input"
    And I toggle the switch with testID "accept-terms-switch"
    And I wait for 1 seconds
    Then the element with testID "register-button" should be disabled

  @validation
  Scenario: Registration fails without accepting terms
    When I type "John" into the input with testID "firstName-input"
    And I type "Doe" into the input with testID "lastName-input"
    And I type "+447123456789" into the input with testID "phone-number-input"
    And I type "john.doe@example.com" into the input with testID "email-input"
    And I type "SecurePass123!" into the input with testID "password-input"
    And I type "SecurePass123!" into the input with testID "confirmPassword-input"
    # Don't toggle the terms switch
    And I wait for 1 seconds
    Then the element with testID "register-button" should be disabled

  @navigation
  Scenario: Navigate to Login from Registration
    When I tap the element with testID "login-link"
    Then I should see the "Login" screen

  @navigation
  Scenario: Navigate to Terms and Conditions
    When I tap the element with testID "terms-link"
    Then I should see the "Terms And Conditions" screen

  @navigation
  Scenario: Navigate to Privacy Policy
    When I tap the element with testID "privacy-link"
    Then I should see the "Privacy Policy" screen
