@error
Feature: Error States and Recovery
  As a user
  I want errors to be handled gracefully
  So that the app doesn't crash when something goes wrong

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: App continues running after errors
    Then I should see the "Home" screen
    And I should see the "home-settings" button
