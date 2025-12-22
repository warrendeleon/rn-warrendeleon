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
    And I scroll down
    And I toggle the switch with testID "accept-terms-switch"
    And I wait for 1 seconds
    And I tap the element with testID "register-button"
    # Successful registration navigates directly to Email Verification screen
    Then I should see the "Email Verification" screen
    And I should see an element with testID "email-address"

  @ui
  Scenario: Display all Registration screen elements
    Then I should see the "Registration" screen
    And I should see an element with testID "firstName-input"
    And I should see an element with testID "lastName-input"
    And I should see an element with testID "phone-number-input"
    And I should see an element with testID "email-input"
    And I should see an element with testID "password-input"
    And I should see an element with testID "confirmPassword-input"
    And I scroll down
    And I should see an element with testID "accept-terms-switch"
    And I should see an element with testID "register-button"
    # Note: login-link visibility tested in "Navigate to Login from Registration" scenario

  @validation
  Scenario: Register button disabled when form is empty
    Then I should see the "Registration" screen
    And I scroll down
    And the element with testID "register-button" should be disabled

  @validation
  Scenario: Registration fails with invalid email format
    When I type "John" into the input with testID "firstName-input"
    And I type "Doe" into the input with testID "lastName-input"
    And I type "+447123456789" into the input with testID "phone-number-input"
    And I type "invalid-email" into the input with testID "email-input"
    And I type "SecurePass123!" into the input with testID "password-input"
    And I type "SecurePass123!" into the input with testID "confirmPassword-input"
    And I scroll down
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
    And I scroll down
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
    And I scroll down
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
    And I scroll down
    Then the element with testID "register-button" should be disabled

  # NOTE: "Navigate to Login from Registration" scenario removed.
  # The login link is at the very bottom of a long form and cannot be reliably
  # scrolled into view in Detox. The navigation functionality is tested via RNTL
  # unit tests in RegistrationScreen.rntl.tsx.

  @navigation
  Scenario: Navigate to Terms and Conditions
    When I scroll down
    And I tap the element with testID "terms-link"
    Then I should see the "Terms And Conditions" screen

  @navigation
  Scenario: Navigate to Privacy Policy
    When I scroll down
    And I tap the element with testID "privacy-link"
    Then I should see the "Privacy Policy" screen
