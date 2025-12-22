@accessibility @talkback @android @eaa
Feature: TalkBack Gesture Support
  As a TalkBack user on Android
  I want to navigate the app using standard TalkBack gestures
  So that I can use all app features without visual reliance

  Background:
    Given the app is launched
    And I am on the "Home" screen

  # ============================================================================
  # SWIPE NAVIGATION GESTURES
  # TalkBack users navigate between elements using left/right swipes
  # ============================================================================

  @swipe @navigation @critical
  Scenario: Navigate login form elements with TalkBack swipes
    Given I navigate to the Login screen
    And TalkBack focus is on the first focusable element
    When I perform a TalkBack swipe right gesture
    Then TalkBack focus should move to the next element
    And the focused element should have a content description

  @swipe @navigation
  Scenario: Navigate backwards through form with TalkBack swipe left
    Given I navigate to the Login screen
    And TalkBack focus is on the login button
    When I perform a TalkBack swipe left gesture
    Then TalkBack focus should move to the previous element

  @swipe @navigation
  Scenario: Complete navigation cycle through all login form elements
    Given I navigate to the Login screen
    When I navigate through all focusable elements using TalkBack swipe right
    Then I should have visited at least 5 focusable elements
    And each element should have a content description or role

  # ============================================================================
  # DOUBLE TAP ACTIVATION GESTURE
  # TalkBack users activate focused elements with double tap
  # ============================================================================

  @doubletap @activation @critical
  Scenario: Activate login button with TalkBack double tap
    Given I navigate to the Login screen
    And I have entered valid credentials
    When TalkBack focus is on the login button
    And I perform a TalkBack double tap gesture
    Then the login action should be triggered
    And I should see the "Chat Placeholder" screen

  @doubletap @activation
  Scenario: Activate text input with TalkBack double tap to edit
    Given I navigate to the Login screen
    When TalkBack focus is on the email input
    And I perform a TalkBack double tap gesture
    Then the keyboard should appear for text entry

  @doubletap @activation
  Scenario: Activate navigation link with TalkBack double tap
    Given I navigate to the Login screen
    When TalkBack focus is on the forgot password link
    And I perform a TalkBack double tap gesture
    Then I should see the "Forgot Password" screen

  # ============================================================================
  # BACK GESTURE (Swipe down then left - Android L gesture)
  # Performs back action similar to system back button
  # ============================================================================

  @backgesture @navigation @critical
  Scenario: Navigate back from forgot password with TalkBack back gesture
    Given I navigate to the Login screen
    When I tap the element with testID "forgot-password-link"
    And I should see the "Forgot Password" screen
    And I perform a TalkBack back gesture
    Then I should see the "Login" screen

  @backgesture @navigation
  Scenario: Navigate back from registration with TalkBack back gesture
    Given I navigate to the Login screen
    When I tap the element with testID "register-link"
    And I should see the "Registration" screen
    And I perform a TalkBack back gesture
    Then I should see the "Login" screen

  # ============================================================================
  # GLOBAL CONTEXT MENU (Swipe up then right)
  # Opens TalkBack global context menu
  # ============================================================================

  @contextmenu
  Scenario: Open global context menu with TalkBack gesture
    Given I navigate to the Login screen
    When I perform a TalkBack global context menu gesture
    Then the TalkBack context menu should be available

  # ============================================================================
  # LOCAL CONTEXT MENU (Swipe up then down)
  # Opens local actions for the focused element
  # ============================================================================

  @contextmenu
  Scenario: Open local context menu for text input
    Given I navigate to the Login screen
    When TalkBack focus is on the email input
    And I perform a TalkBack local context menu gesture
    Then local actions for the text input should be available

  # ============================================================================
  # FOCUS ANNOUNCEMENTS
  # TalkBack must announce element information when focused
  # ============================================================================

  @announcements @critical
  Scenario: TalkBack announces email input field correctly
    Given I navigate to the Login screen
    When TalkBack focus is on the email input
    Then TalkBack should announce the content description
    And TalkBack should announce the element role as edit text
    And TalkBack should announce any hint text

  @announcements
  Scenario: TalkBack announces password field with secure entry hint
    Given I navigate to the Login screen
    When TalkBack focus is on the password input
    Then TalkBack should announce "password" in the description
    And TalkBack should indicate the field is for password entry

  @announcements
  Scenario: TalkBack announces button disabled state
    Given I navigate to the Login screen
    And the login button is disabled
    When TalkBack focus is on the login button
    Then TalkBack should announce the disabled state
    And the element should have accessibility state disabled

  @announcements
  Scenario: TalkBack announces button enabled state after form completion
    Given I navigate to the Login screen
    And I have entered valid credentials
    When TalkBack focus is on the login button
    Then TalkBack should not announce disabled state
    And the element should have accessibility state enabled

  # ============================================================================
  # ERROR ANNOUNCEMENTS (ACCESSIBILITY LIVE REGION)
  # Errors must be announced immediately via accessibility live region
  # ============================================================================

  @errors @liveregion @critical
  Scenario: TalkBack announces authentication error via live region
    Given I navigate to the Login screen
    And I have entered invalid credentials
    When I tap the element with testID "login-button"
    And I wait for 3 seconds
    Then the error message should be announced automatically
    And the error element should have accessibility live region polite or assertive

  @errors @liveregion
  Scenario: TalkBack focus moves to error after form submission failure
    Given I navigate to the Login screen
    And I have entered invalid credentials
    When I submit the login form
    And I wait for 3 seconds
    Then TalkBack focus should be on or near the error message
    And the user can navigate to retry

  # ============================================================================
  # READING CONTROLS (Swipe up/down)
  # Changes granularity and navigates within current granularity
  # ============================================================================

  @readingcontrols
  Scenario: Change reading granularity with TalkBack swipe up/down
    Given I navigate to the Login screen
    When TalkBack focus is on an element with text
    And I perform a TalkBack swipe up gesture
    Then the reading granularity should change

  @readingcontrols
  Scenario: Navigate by characters in text input
    Given I navigate to the Login screen
    And I have entered text in the email input
    When TalkBack focus is on the email input
    And I set TalkBack granularity to characters
    And I perform a TalkBack swipe down gesture
    Then TalkBack should read the next character

  @readingcontrols
  Scenario: Navigate by words in text input
    Given I navigate to the Login screen
    And I have entered multiple words in the email input
    When TalkBack focus is on the email input
    And I set TalkBack granularity to words
    And I perform a TalkBack swipe down gesture
    Then TalkBack should read the next word

  # ============================================================================
  # EXPLORE BY TOUCH
  # TalkBack users can explore screen by touch
  # ============================================================================

  @explorebytouch
  Scenario: Explore by touch reads elements under finger
    Given I navigate to the Login screen
    When I touch the screen at the email input location
    Then TalkBack should announce the email input
    When I drag my finger to the password input
    Then TalkBack should announce the password input

  @explorebytouch
  Scenario: Lift finger after explore and double tap to activate
    Given I navigate to the Login screen
    When I touch the screen at the login button location
    And TalkBack announces the login button
    And I have entered valid credentials
    And I perform a TalkBack double tap gesture
    Then the login action should be triggered

  # ============================================================================
  # HEADING NAVIGATION (Swipe down with 1 finger when in headings mode)
  # Navigate between headings for quick page structure understanding
  # ============================================================================

  @headings
  Scenario: Navigate between headings with TalkBack
    Given I navigate to the Login screen
    When I set TalkBack navigation mode to headings
    And I perform a TalkBack swipe down gesture
    Then TalkBack should navigate to the next heading element

  # ============================================================================
  # SCROLL GESTURES (Two finger swipe)
  # Scroll content when focused on scrollable container
  # ============================================================================

  @scroll
  Scenario: Scroll content with TalkBack two finger swipe
    Given I navigate to a screen with scrollable content
    When I perform a TalkBack two finger swipe up gesture
    Then the content should scroll down
    And TalkBack should announce scroll position or new content

  # ============================================================================
  # ACCESSIBILITY ACTIONS
  # Custom accessibility actions available on elements
  # ============================================================================

  @actions
  Scenario: Password visibility toggle has custom accessibility action
    Given I navigate to the Login screen
    When TalkBack focus is on the password visibility toggle
    Then the element should have a custom accessibility action
    And the action should describe toggling password visibility

  @actions
  Scenario: Execute custom action on password toggle
    Given I navigate to the Login screen
    When TalkBack focus is on the password visibility toggle
    And I execute the toggle visibility accessibility action
    Then the password visibility state should change
    And TalkBack should announce the new state
