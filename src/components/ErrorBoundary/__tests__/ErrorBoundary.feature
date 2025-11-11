Feature: ErrorBoundary
  As a user
  I want errors to be caught gracefully
  So that the app doesn't crash and I can recover

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: ErrorBoundary catches component error and displays fallback UI
    When I tap the element with testID "test-error-button"
    And I dismiss the React Native error screen
    Then I should see an element with testID "error-try-again-button"
    And I should see an element with testID "error-go-home-button"
    And I should see the text "Something Went Wrong"

  Scenario: Try Again button resets error state
    When I tap the element with testID "test-error-button"
    And I dismiss the React Native error screen
    Then I should see an element with testID "error-try-again-button"
    When I tap the element with testID "error-try-again-button"
    Then I should see the element with testID "test-error-button"

  Scenario: Go Home button navigates to Home screen
    When I tap the element with testID "test-error-button"
    And I dismiss the React Native error screen
    Then I should see an element with testID "error-go-home-button"
    When I tap the element with testID "error-go-home-button"
    Then I should see the "Home" screen
    And I should see the element with testID "home-settings-button"
