@profile
Feature: Profile Screen Navigation and Interactions
  As a user
  I want to view and interact with profile information
  So that I can access contact details and social media links

  Background:
    Given the app is launched
    And I am on the "Home" screen

  @smoke @critical
  Scenario: Navigate to Profile screen and view all elements
    When I tap the element with testID "profile-card"
    Then I should see the "Profile" screen
    And I should see the element with testID "profile-name"
    And I should see the element with testID "profile-phone"
    And I should see the element with testID "profile-email"
    And I should see the element with testID "profile-birthday"

  @navigation
  Scenario: Back navigation from Profile screen
    When I tap the element with testID "profile-card"
    Then I should see the "Profile" screen
    When I go back
    Then I should see the "Home" screen
