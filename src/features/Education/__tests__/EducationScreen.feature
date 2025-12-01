@education
Feature: Education Screen
  As a user
  I want to view Warren's education history
  So that I can review his academic qualifications

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Navigate to Education screen from Home
    When I tap the element with testID "home-education-button"
    Then I should see the "Education" screen
    And I should see an element with testID "education-screen"

  Scenario: Education items display correctly
    When I tap the element with testID "home-education-button"
    Then I should see the "Education" screen
    And I should see education items loaded

  Scenario: Back navigation from Education screen
    When I tap the element with testID "home-education-button"
    Then I should see the "Education" screen
    When I go back
    Then I should see the "Home" screen
