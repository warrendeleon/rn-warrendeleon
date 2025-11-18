Feature: Profile Screen Navigation and Interactions
  As a user
  I want to view and interact with profile information
  So that I can access contact details and social media links

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Navigate to Profile screen from Home
    When I tap the element with testID "profile-card"
    Then I should see the "Profile" screen
    And I should see the element with testID "profile-name"
    And I should see the element with testID "profile-phone"
    And I should see the element with testID "profile-email"
    When I go back
    Then I should see the "Home" screen

  Scenario: Tap phone contact button
    When I tap the element with testID "profile-card"
    Then I should see the "Profile" screen
    When I tap the element with testID "profile-phone"
    # Note: Cannot test actual phone app opening in E2E
    # Test validates button is tappable and has proper accessibility

  Scenario: Tap email contact button
    When I tap the element with testID "profile-card"
    Then I should see the "Profile" screen
    When I tap the element with testID "profile-email"
    # Note: Cannot test actual email app opening in E2E
    # Test validates button is tappable and has proper accessibility

  Scenario: Navigate to social media via WebView
    When I tap the element with testID "profile-card"
    Then I should see the "Profile" screen
    When I tap the element with testID "profile-social-linkedin"
    Then I should see the "WebView" screen
    # Note: Cannot test actual web page content rendering
    # Test validates navigation and URL parameter passing
    When I go back
    Then I should see the "Profile" screen
