@auth @change-password
Feature: Change Password (Authenticated User)
  As a logged-in user
  I want to change my password from the Account settings
  So that I can update my account security

  # This feature tests the Change Password flow from Edit Account screen
  # Requires: current password verification, new password different from current

  Background:
    Given the app is launched
    And I am on the "Home" screen

  # ============================================================================
  # NAVIGATION - Accessing Change Password from Edit Account
  # ============================================================================

  @smoke @critical @navigation
  Scenario: Navigate to Change Password screen from Edit Account
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "change-password-button"
    Then I should see the "Change Password" screen

  # ============================================================================
  # UI ELEMENTS - Verify all form elements are displayed correctly
  # ============================================================================

  @ui
  Scenario: Display all Change Password screen elements
    Given I am logged in and on the Change Password screen
    Then I should see an element with testID "current-password-input"
    And I should see an element with testID "new-password-input"
    And I should see an element with testID "confirm-password-input"
    And I should see an element with testID "password-requirements"
    And I should see an element with testID "change-password-button"

  # ============================================================================
  # FORM VALIDATION - Testing password requirements and matching
  # ============================================================================

  @validation
  Scenario: Change password button disabled when all fields are empty
    Given I am logged in and on the Change Password screen
    Then the element with testID "change-password-button" should be disabled

  @validation
  Scenario: Change password button disabled when only current password is filled
    Given I am logged in and on the Change Password screen
    When I type "CurrentPass123!" into the input with testID "current-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be disabled

  @validation
  Scenario: Change password button disabled when new password is too short
    Given I am logged in and on the Change Password screen
    When I type "CurrentPass123!" into the input with testID "current-password-input"
    And I type "Short1!" into the input with testID "new-password-input"
    And I type "Short1!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be disabled

  @validation
  Scenario: Change password button disabled when new password lacks uppercase
    Given I am logged in and on the Change Password screen
    When I type "CurrentPass123!" into the input with testID "current-password-input"
    And I type "lowercase123!" into the input with testID "new-password-input"
    And I type "lowercase123!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be disabled

  @validation
  Scenario: Change password button disabled when new password lacks number
    Given I am logged in and on the Change Password screen
    When I type "CurrentPass123!" into the input with testID "current-password-input"
    And I type "NoNumberHere!" into the input with testID "new-password-input"
    And I type "NoNumberHere!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be disabled

  @validation
  Scenario: Change password button disabled when new password lacks special character
    Given I am logged in and on the Change Password screen
    When I type "CurrentPass123!" into the input with testID "current-password-input"
    And I type "NoSpecial123" into the input with testID "new-password-input"
    And I type "NoSpecial123" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be disabled

  @validation
  Scenario: Change password button disabled when passwords do not match
    Given I am logged in and on the Change Password screen
    When I type "CurrentPass123!" into the input with testID "current-password-input"
    And I type "NewStrongPass123!" into the input with testID "new-password-input"
    And I type "DifferentPass456!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be disabled

  @validation @critical
  Scenario: Change password button disabled when new password equals current password
    Given I am logged in and on the Change Password screen
    When I type "SamePassword123!" into the input with testID "current-password-input"
    And I type "SamePassword123!" into the input with testID "new-password-input"
    And I type "SamePassword123!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be disabled

  @validation
  Scenario: Change password button enabled when all fields are valid and different
    Given I am logged in and on the Change Password screen
    When I type "CurrentPass123!" into the input with testID "current-password-input"
    And I type "NewStrongPass456!" into the input with testID "new-password-input"
    And I type "NewStrongPass456!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    Then the element with testID "change-password-button" should be enabled

  # ============================================================================
  # SUCCESSFUL CHANGE FLOW - Complete password change journey (mocked API)
  # ============================================================================

  @smoke @critical
  Scenario: Successfully change password and navigate back to Edit Account
    Given I am logged in and on the Change Password screen
    When I type "SecurePass123" into the input with testID "current-password-input"
    And I type "NewSecurePass456!" into the input with testID "new-password-input"
    And I type "NewSecurePass456!" into the input with testID "confirm-password-input"
    And I wait for 1 seconds
    And I tap the element with testID "change-password-button"
    And I wait for 2 seconds
    Then I should see the "Edit Account" screen

  # ============================================================================
  # NAVIGATION - Back without changing
  # ============================================================================

  @navigation
  Scenario: Navigate back to Edit Account using header back button
    Given I am logged in and on the Change Password screen
    When I go back
    Then I should see the "Edit Account" screen
