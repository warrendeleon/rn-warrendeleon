Feature: Language Switching
  As a user
  I want to switch between different languages
  So that I can view content in my preferred language

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Language persists after app restart
    When I tap the "home-settings" button
    And I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-es"
    And I go back
    When I restart the app
    And I tap the "home-settings" button
    Then I should see the "Settings" screen
    And the "settings-language-button" should show "Español" as end label
