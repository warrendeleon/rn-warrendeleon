Feature: Home Screen
  As a user
  I want to interact with the Home screen
  So that I can navigate to different parts of the app

  Background:
    Given the app is launched

  Scenario: Display Home Screen
    Then I should see the "Home" screen
    And I should see the "home-settings" button

  Scenario: Navigate to Settings
    Given I am on the "Home" screen
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    And I should see an element with testID "settings-appearance-button"
    And I should see an element with testID "settings-language-button"

  Scenario: Return to Home from Settings
    Given I am on the "Home" screen
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I go back
    Then I should see the "Home" screen

  Scenario: Navigate to Appearance settings
    Given I am on the "Home" screen
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-appearance-button"
    Then I should see the "Appearance" screen

  Scenario: Navigate to Language settings
    Given I am on the "Home" screen
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-language-button"
    Then I should see the "Language" screen

  Scenario: Complete navigation flow through all settings
    Given I am on the "Home" screen
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-appearance-button"
    Then I should see the "Appearance" screen
    When I go back
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-language-button"
    Then I should see the "Language" screen
    When I go back
    Then I should see the "Settings" screen
    When I go back
    Then I should see the "Home" screen
