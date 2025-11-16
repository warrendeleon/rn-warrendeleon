@work-experience
Feature: Work Experience Flow
  As a portfolio app user
  I want to view Warren's work experience
  So that I can review his professional history and technical expertise

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Navigate to Work Experience screen from Home
    When I tap the element with testID "home-work-experience-button"
    Then I should see the "Work Experience" screen
    And I should see an element with testID "work-experience-screen"

  Scenario: Work experience items display correctly
    When I tap the element with testID "home-work-experience-button"
    Then I should see the "Work Experience" screen
    And work experience items should be visible

  Scenario: Back navigation from Work Experience screen
    When I tap the element with testID "home-work-experience-button"
    Then I should see the "Work Experience" screen
    When I go back
    Then I should see the "Home" screen
