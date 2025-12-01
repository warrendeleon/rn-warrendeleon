Feature: Error States
  As a user
  I want to see clear error messages when data loading fails
  So that I know what went wrong and can try again

  @error @network
  Scenario: Network error during data fetch shows error UI
    Given the app is launched with error mode "network"
    Then I should see an element with testID "splash-error-screen"
    And I should see text "Something Went Wrong"
    And I should see an element with testID "splash-retry-button"

  @error @server
  Scenario: Server error (500) during data fetch shows error UI
    Given the app is launched with error mode "server-500"
    Then I should see an element with testID "splash-error-screen"
    And I should see text "Something Went Wrong"
    And I should see an element with testID "splash-retry-button"

  @error @notfound
  Scenario: Not found error (404) during data fetch shows error UI
    Given the app is launched with error mode "not-found-404"
    Then I should see an element with testID "splash-error-screen"
    And I should see text "Something Went Wrong"

  @error @recovery
  Scenario: Retry button recovers from network error
    Given the app is launched with error mode "network" that clears on retry
    Then I should see an element with testID "splash-error-screen"
    When I tap the retry button and recovery succeeds
    Then I should see the "Home" screen

  @error @partial
  Scenario: Partial data failure shows error UI
    Given the app is launched with error mode "network" for endpoint "profile"
    Then I should see an element with testID "splash-error-screen"
    And I should see text "Something Went Wrong"
