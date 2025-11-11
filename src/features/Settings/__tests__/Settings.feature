Feature: Settings Management
  As a user
  I want to change app settings
  So that I can customize my app experience

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Change appearance to Dark mode
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-appearance-button"
    Then I should see the "Appearance" screen
    When I tap the element with testID "appearance-option-dark"
    Then I should see the "Settings" screen
    And the "settings-appearance-button" should show "Dark" as end label

  Scenario: Change appearance to Light mode
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-appearance-button"
    Then I should see the "Appearance" screen
    When I tap the element with testID "appearance-option-light"
    Then I should see the "Settings" screen
    And the "settings-appearance-button" should show "Light" as end label

  Scenario: Change appearance to Automatic mode
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-appearance-button"
    Then I should see the "Appearance" screen
    When I tap the element with testID "appearance-option-system"
    Then I should see the "Settings" screen
    And the "settings-appearance-button" should show "Automatic" as end label

  Scenario: Change language to Spanish
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-language-button"
    Then I should see the "Language" screen
    When I tap the element with testID "language-option-es"
    Then I should see the "Settings" screen
    And the "settings-language-button" should show "Español" as end label

  Scenario: Change language to English
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    When I tap the element with testID "settings-language-button"
    Then I should see the "Language" screen
    When I tap the element with testID "language-option-en"
    Then I should see the "Settings" screen
    And the "settings-language-button" should show "English" as end label

  Scenario: Settings persist after returning home
    When I tap the "home-settings" button
    And I tap the element with testID "settings-appearance-button"
    And I tap the element with testID "appearance-option-dark"
    And I go back
    Then I should see the "Home" screen
    When I tap the "home-settings" button
    Then I should see the "Settings" screen
    And the "settings-appearance-button" should show "Dark" as end label
