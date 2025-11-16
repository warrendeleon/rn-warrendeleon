@splash
Feature: Splash Screen
  As a user launching the app
  I want to see a splash screen with loading animation
  So that I know the app is loading while data is fetched

  Scenario: Splash screen displays on app launch
    Given the app is launched
    Then I should see an element with testID "splash-screen"
    And I should see an element with testID "splash-logo"

  Scenario: Splash screen transitions to Home after data loads
    Given the app is launched
    When I wait for 5 seconds
    Then I should see the "Home" screen
    And I should not see an element with testID "splash-screen"
