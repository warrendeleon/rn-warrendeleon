@settings @profile-picture
Feature: Profile Picture Management
  As a user
  I want to change my profile picture from the Edit Account screen
  So that I can personalise my account with a photo

  Background:
    Given the app is launched
    And I am on the "Home" screen

  # ===========================================
  # ACTION SHEET SCENARIOS
  # ===========================================

  @smoke @critical
  Scenario: Open profile picture action sheet
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    And I should see "Change Profile Picture"
    And I should see an element with testID "profile-picture-action-take-photo"
    And I should see an element with testID "profile-picture-action-choose-library"

  @action-sheet
  Scenario: Close profile picture action sheet via backdrop
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-sheet-backdrop"
    Then I should not see an element with testID "profile-picture-action-sheet"

  @action-sheet
  Scenario: Close profile picture action sheet via close button
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-sheet-close"
    Then I should not see an element with testID "profile-picture-action-sheet"

  # ===========================================
  # CAMERA FLOW SCENARIOS (E2E Mocked)
  # ===========================================

  @smoke @camera @mocked
  Scenario: Take photo and preview (mocked camera)
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-take-photo"
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    And I should see an element with testID "profile-picture-preview-image"
    And I should see "Face detected"
    And I should see an element with testID "profile-picture-preview-save-button"

  @camera @mocked
  Scenario: Save profile picture after camera capture (mocked)
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-take-photo"
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    When I tap the element with testID "profile-picture-preview-save-button"
    And I wait for 1 seconds
    Then I should see the "Edit Account" screen

  @camera @mocked
  Scenario: Retry photo from preview screen
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-take-photo"
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    When I tap the element with testID "profile-picture-preview-retry-button"
    Then I should see the "Edit Account" screen

  # ===========================================
  # PHOTO LIBRARY FLOW SCENARIOS (E2E Mocked)
  # ===========================================

  @smoke @library @mocked
  Scenario: Choose from library and preview (mocked library)
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-choose-library"
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    And I should see an element with testID "profile-picture-preview-image"
    And I should see "Face detected"

  @library @mocked
  Scenario: Save profile picture after library selection (mocked)
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-choose-library"
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    When I tap the element with testID "profile-picture-preview-save-button"
    And I wait for 1 seconds
    Then I should see the "Edit Account" screen

  # ===========================================
  # UI DISPLAY SCENARIOS
  # ===========================================

  @ui
  Scenario: Display profile picture section on Edit Account screen
    Given I am logged in and on the Edit Account screen
    Then I should see an element with testID "profile-picture-section"
    And I should see an element with testID "profile-picture-edit-button"
    And I should see "Tap to change"

  @ui
  Scenario: Preview screen displays all elements
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-take-photo"
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    And I should see "Preview"
    And I should see an element with testID "profile-picture-preview-image"
    And I should see an element with testID "profile-picture-preview-save-button"
    And I should see an element with testID "profile-picture-preview-retry-button"
