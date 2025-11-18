Feature: Mock Status Verification
  As a developer
  I want to verify API mocking is working during E2E tests
  So that I can confirm Metro runtime mocking is intercepting requests correctly

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: View mock status screen shows all mocked data
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-mock-status-button"
    Then I should see the "Mock Status" screen
    And I should see the element with testID "mock-status-profile"
    And I should see the element with testID "mock-status-education"
    And I should see the element with testID "mock-status-work-experience"
    And the "mock-status-profile-status" should contain text "Mocked"
    And the "mock-status-education-status" should contain text "Mocked"
    And the "mock-status-work-experience-status" should contain text "Mocked"
