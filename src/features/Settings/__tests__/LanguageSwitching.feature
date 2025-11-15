Feature: Language Switching
  As a user
  I want to switch between different languages
  So that I can view content in my preferred language

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Switch to Spanish and verify data reloads
    When I tap the "home-settings" button
    And I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-es"
    Then I should see the "Settings" screen
    And the "settings-language-button" should show "Español" as end label
    When I go back
    And I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And the profile data should be in Spanish

  Scenario: Switch to Catalan and verify data reloads
    When I tap the "home-settings" button
    And I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-ca"
    And I go back
    And I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And the profile data should be in Catalan

  Scenario: Switch to Polish and verify data reloads
    When I tap the "home-settings" button
    And I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-pl"
    And I go back
    And I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And the profile data should be in Polish

  Scenario: Switch to Tagalog and verify data reloads
    When I tap the "home-settings" button
    And I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-tl"
    And I go back
    And I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And the profile data should be in Tagalog

  Scenario: Switch back to English and verify data reloads
    # First switch to Spanish
    When I tap the "home-settings" button
    And I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-es"
    # Then switch back to English
    When I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-en"
    And I go back
    And I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And the profile data should be in English

  Scenario: Language persists after app restart
    When I tap the "home-settings" button
    And I tap the element with testID "settings-language-button"
    And I tap the element with testID "language-option-es"
    And I go back
    When I restart the app
    And I tap the "home-settings" button
    Then I should see the "Settings" screen
    And the "settings-language-button" should show "Español" as end label
