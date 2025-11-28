@mock-validation @critical
Feature: Mock Status Verification
  As a developer
  I want to verify API mocking is working during E2E tests
  So that I can confirm Metro runtime mocking is intercepting requests correctly

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: View mock status screen shows all Portfolio API mocked data
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-mock-status-button"
    Then I should see the "Mock Status" screen
    And I should see the element with testID "mock-status-profile"
    And I should see the element with testID "mock-status-education"
    And I should see the element with testID "mock-status-work-experience"
    # Check for state-specific testIDs to avoid false positives (Not Mocked contains Mocked)
    And I should see the element with testID "mock-status-profile-mocked"
    And I should see the element with testID "mock-status-education-mocked"
    And I should see the element with testID "mock-status-work-experience-mocked"

  Scenario: View mock status screen shows Supabase Auth API is mocked
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-mock-status-button"
    Then I should see the "Mock Status" screen
    # Verify Auth API call returns mocked=true (actual API call verification)
    And I should see the element with testID "mock-status-auth-api"
    And I should see the element with testID "mock-status-auth-api-mocked"
