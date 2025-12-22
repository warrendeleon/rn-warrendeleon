@settings @account
Feature: Settings Account Section
  As a user
  I want to manage my account from the Settings screen
  So that I can view and update my profile information and sign out

  Background:
    Given the app is launched
    And I am on the "Home" screen

  # ===========================================
  # UNAUTHENTICATED USER SCENARIOS
  # ===========================================

  @unauthenticated
  Scenario: View account section when not authenticated
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    And I should see an element with testID "settings-sign-in-button"
    And I should not see an element with testID "settings-user-card"

  @unauthenticated @navigation
  Scenario: Navigate to Login from Settings when not authenticated
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-sign-in-button"
    Then I should see the "Login" screen

  # ===========================================
  # AUTHENTICATED USER SCENARIOS
  # ===========================================

  @smoke @critical
  Scenario: View account section when authenticated
    # Login first via Settings sign-in button (full flow to test login integration)
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-sign-in-button"
    Then I should see the "Login" screen
    When I type "testuser@example.com" into the input with testID "email-input"
    And I type "SecurePass123" into the input with testID "password-input"
    And I wait for 1 seconds
    And I tap the element with testID "login-button"
    And I wait for 2 seconds
    Then I should see the "Home" screen
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    And I should see an element with testID "settings-user-card"
    And I should see an element with testID "user-card-name"
    And I should see an element with testID "user-card-email"

  @edit
  Scenario: Edit first name successfully
    Given I am logged in and on the Edit Account screen
    When I clear and type "UpdatedFirst" into the input with testID "first-name-input"
    And I dismiss the keyboard
    And I wait for 1 seconds
    Then the element with testID "save-button" should be enabled
    When I tap the element with testID "save-button"
    Then I should see the "Settings" screen

  @edit
  Scenario: Edit last name successfully
    Given I am logged in and on the Edit Account screen
    When I clear and type "UpdatedLast" into the input with testID "last-name-input"
    And I dismiss the keyboard
    And I wait for 1 seconds
    Then the element with testID "save-button" should be enabled
    When I tap the element with testID "save-button"
    Then I should see the "Settings" screen

  @edit @phone
  Scenario: Edit phone number successfully
    Given I am logged in and on the Edit Account screen
    When I clear and type "7510123456" into the input with testID "phone-number-input"
    And I dismiss the keyboard
    And I wait for 1 seconds
    Then the element with testID "save-button" should be enabled
    When I tap the element with testID "save-button"
    Then I should see the "Settings" screen

  @edit @phone @navigation
  Scenario: Access country code selector from Edit Account
    Given I am logged in and on the Edit Account screen
    And I should see an element with testID "country-code-selector"
    And I should see an element with testID "phone-number-input"
    When I tap the element with testID "country-code-selector"
    Then I should see the "Country Code Selector" screen
    When I go back
    Then I should see the "Edit Account" screen

  @validation
  Scenario: Save button disabled when no changes made
    Given I am logged in and on the Edit Account screen
    Then the element with testID "save-button" should be disabled

  @logout @smoke
  Scenario: Sign out with confirmation
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "logout-button"
    Then I should see an alert with title "logout-dialog"
    When I tap "logout-confirm-button" on the alert
    Then I should see the "Home" screen

  @logout
  Scenario: Cancel sign out
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "logout-button"
    Then I should see an alert with title "logout-dialog"
    When I tap "logout-cancel-button" on the alert
    Then I should see the "Edit Account" screen

  # ===========================================
  # UI DISPLAY SCENARIOS
  # ===========================================

  @ui
  Scenario: Display all Edit Account screen elements
    Given I am logged in and on the Edit Account screen
    And I should see an element with testID "edit-account-screen"
    And I should see an element with testID "first-name-input"
    And I should see an element with testID "last-name-input"
    And I should see an element with testID "country-code-selector"
    And I should see an element with testID "phone-number-input"
    And I should see an element with testID "email-display"
    And I should see an element with testID "save-button"
    And I should see an element with testID "logout-button"
