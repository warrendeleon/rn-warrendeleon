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
    And I should see text "Change Profile Picture"
    And I should see an element with testID "profile-picture-action-take-photo"
    And I should see an element with testID "profile-picture-action-choose-library"

  # NOTE: "Close action sheet via backdrop/back" scenarios removed - Detox cannot
  # tap modal backdrops (visibility threshold) or navigate back while modal is open.
  # The dismiss functionality is tested via RNTL unit tests instead.

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
    And I should see text "Face detected"
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
    # Wait for validation to complete, then tap by visible text (testID has visibility issues)
    And I wait for 2 seconds
    When I tap the text "Choose Different Photo"
    # Retry re-opens the camera mock which returns success, replacing with a new preview
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    And I should see an element with testID "profile-picture-preview-image"

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
    And I should see text "Face detected"

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
    And I should see text "Tap to change"

  @ui
  Scenario: Preview screen displays all elements
    Given I am logged in and on the Edit Account screen
    When I tap the element with testID "profile-picture-edit-button"
    Then I should see an element with testID "profile-picture-action-sheet"
    When I tap the element with testID "profile-picture-action-take-photo"
    And I wait for 2 seconds
    Then I should see the "Profile Picture Preview" screen
    And I should see an element with testID "profile-picture-preview-image"
    And I should see an element with testID "profile-picture-preview-save-button"
    # Note: Retry button testID not reliably visible due to debugger banner; tested via text tap in retry scenario
    And I should see text "Choose Different Photo"
