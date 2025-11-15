Feature: Data Loading & Persistence
  As a user
  I want my portfolio data to load from GitHub
  So that I can view my profile, education, and work experience

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Profile data loads successfully
    When I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And I should see an element with testID "profile-data-json"
    And the profile data should contain "name"

  Scenario: Work experience data loads successfully
    When I tap the "home-workxp-data" button
    Then I should see the "Work Experience Data" screen
    And I should see an element with testID "workxp-data-json"
    And the workxp data should contain "company"

  Scenario: Education data loads successfully
    When I tap the "home-education-data" button
    Then I should see the "Education Data" screen
    And I should see an element with testID "education-data-json"
    And the education data should contain "title"

  Scenario: All three data sources load without errors
    When I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And I should not see an element with testID "profile-error"
    When I go back
    And I tap the "home-workxp-data" button
    Then I should see the "Work Experience Data" screen
    And I should not see an element with testID "workxp-error"
    When I go back
    And I tap the "home-education-data" button
    Then I should see the "Education Data" screen
    And I should not see an element with testID "education-error"

  Scenario: Data persists after app restart
    When I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And I should see an element with testID "profile-data-json"
    When I restart the app
    And I tap the "home-profile-data" button
    Then I should see the "Profile Data" screen
    And I should see an element with testID "profile-data-json"
