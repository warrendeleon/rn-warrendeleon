@accessibility @voiceover @ios @eaa
Feature: VoiceOver Gesture Support
  As a VoiceOver user on iOS
  I want to navigate the app using standard VoiceOver gestures
  So that I can use all app features without visual reliance

  Background:
    Given the app is launched
    And I am on the "Home" screen

  # ============================================================================
  # SWIPE NAVIGATION GESTURES
  # VoiceOver users navigate between elements using left/right swipes
  # ============================================================================

  @swipe @navigation @critical
  Scenario: Navigate login form elements with VoiceOver swipes
    Given I navigate to the Login screen
    And VoiceOver focus is on the first focusable element
    When I perform a VoiceOver swipe right gesture
    Then VoiceOver focus should move to the next element
    And the focused element should have an accessibility label

  @swipe @navigation
  Scenario: Navigate backwards through form with VoiceOver swipe left
    Given I navigate to the Login screen
    And VoiceOver focus is on the login button
    When I perform a VoiceOver swipe left gesture
    Then VoiceOver focus should move to the previous element

  @swipe @navigation
  Scenario: Complete navigation cycle through all login form elements
    Given I navigate to the Login screen
    When I navigate through all focusable elements using VoiceOver swipe right
    Then I should have visited at least 5 focusable elements
    And each element should have an accessibility label or role

  # ============================================================================
  # DOUBLE TAP ACTIVATION GESTURE
  # VoiceOver users activate focused elements with double tap
  # ============================================================================

  @doubletap @activation @critical
  Scenario: Activate login button with VoiceOver double tap
    Given I navigate to the Login screen
    And I have entered valid credentials
    When VoiceOver focus is on the login button
    And I perform a VoiceOver double tap gesture
    Then the login action should be triggered
    And I should see the "Chat Placeholder" screen

  @doubletap @activation
  Scenario: Activate text input with VoiceOver double tap to edit
    Given I navigate to the Login screen
    When VoiceOver focus is on the email input
    And I perform a VoiceOver double tap gesture
    Then the keyboard should appear for text entry

  @doubletap @activation
  Scenario: Activate navigation link with VoiceOver double tap
    Given I navigate to the Login screen
    When VoiceOver focus is on the forgot password link
    And I perform a VoiceOver double tap gesture
    Then I should see the "Forgot Password" screen

  # ============================================================================
  # MAGIC TAP GESTURE (Two-finger double tap)
  # Performs the most likely action - often submit for forms
  # ============================================================================

  @magictap @critical
  Scenario: Submit login form with magic tap gesture
    Given I navigate to the Login screen
    And I have entered valid credentials
    When I perform a VoiceOver magic tap gesture
    Then the login form should submit
    And I should see the "Chat Placeholder" screen

  @magictap
  Scenario: Magic tap with invalid credentials shows error
    Given I navigate to the Login screen
    And I have entered invalid credentials
    When I perform a VoiceOver magic tap gesture
    Then I should see an element with testID "auth-error-message"
    And VoiceOver should announce the error message

  # ============================================================================
  # ESCAPE GESTURE (Two-finger scrub/Z gesture)
  # Goes back or cancels the current operation
  # ============================================================================

  @escape @navigation @critical
  Scenario: Navigate back from forgot password with escape gesture
    Given I navigate to the Login screen
    When I tap the element with testID "forgot-password-link"
    And I should see the "Forgot Password" screen
    And I perform a VoiceOver escape gesture
    Then I should see the "Login" screen

  @escape @navigation
  Scenario: Navigate back from registration with escape gesture
    Given I navigate to the Login screen
    When I tap the element with testID "register-link"
    And I should see the "Registration" screen
    And I perform a VoiceOver escape gesture
    Then I should see the "Login" screen

  @escape @cancel
  Scenario: Escape gesture dismisses keyboard when editing
    Given I navigate to the Login screen
    When VoiceOver focus is on the email input
    And I perform a VoiceOver double tap gesture
    And the keyboard is visible
    And I perform a VoiceOver escape gesture
    Then the keyboard should be dismissed

  # ============================================================================
  # FOCUS ANNOUNCEMENTS
  # VoiceOver must announce element information when focused
  # ============================================================================

  @announcements @critical
  Scenario: VoiceOver announces email input field correctly
    Given I navigate to the Login screen
    When VoiceOver focus is on the email input
    Then VoiceOver should announce the accessibility label
    And VoiceOver should announce the element role as text field
    And VoiceOver should announce any hint text

  @announcements
  Scenario: VoiceOver announces password field with secure entry hint
    Given I navigate to the Login screen
    When VoiceOver focus is on the password input
    Then VoiceOver should announce "password" or "secure"
    And VoiceOver should indicate the field is for secure text entry

  @announcements
  Scenario: VoiceOver announces button disabled state
    Given I navigate to the Login screen
    And the login button is disabled
    When VoiceOver focus is on the login button
    Then VoiceOver should announce the disabled state
    And the element should have accessibility state disabled

  @announcements
  Scenario: VoiceOver announces button enabled state after form completion
    Given I navigate to the Login screen
    And I have entered valid credentials
    When VoiceOver focus is on the login button
    Then VoiceOver should not announce disabled state
    And the element should have accessibility state enabled

  # ============================================================================
  # ERROR ANNOUNCEMENTS (LIVE REGIONS)
  # Errors must be announced immediately via live regions
  # ============================================================================

  @errors @liveregion @critical
  Scenario: VoiceOver announces authentication error via live region
    Given I navigate to the Login screen
    And I have entered invalid credentials
    When I tap the element with testID "login-button"
    And I wait for 3 seconds
    Then the error message should be announced automatically
    And the error element should have accessibility role "alert"

  @errors @liveregion
  Scenario: VoiceOver focus moves to error after form submission failure
    Given I navigate to the Login screen
    And I have entered invalid credentials
    When I submit the login form
    And I wait for 3 seconds
    Then VoiceOver focus should be on or near the error message
    And the user can navigate to retry

  # ============================================================================
  # ROTOR NAVIGATION
  # VoiceOver rotor allows navigation by element type
  # ============================================================================

  @rotor
  Scenario: Navigate form by headings using rotor
    Given I navigate to the Login screen
    When I use VoiceOver rotor set to headings
    And I perform a VoiceOver swipe down gesture
    Then VoiceOver should navigate to the next heading element

  @rotor
  Scenario: Navigate form by text fields using rotor
    Given I navigate to the Login screen
    When I use VoiceOver rotor set to text fields
    And I perform a VoiceOver swipe down gesture
    Then VoiceOver focus should move to the next text field
    And I should be able to cycle through email and password inputs

  @rotor
  Scenario: Navigate form by buttons using rotor
    Given I navigate to the Login screen
    When I use VoiceOver rotor set to buttons
    And I perform a VoiceOver swipe down gesture
    Then VoiceOver focus should move to the next button
    And I should be able to navigate to login button and links

  # ============================================================================
  # TOUCH EXPLORATION
  # VoiceOver users can explore screen by touch
  # ============================================================================

  @touchexplore
  Scenario: Touch exploration reads elements under finger
    Given I navigate to the Login screen
    When I touch the screen at the email input location
    Then VoiceOver should announce the email input
    When I drag my finger to the password input
    Then VoiceOver should announce the password input

  @touchexplore
  Scenario: Lift finger after touch explore and double tap to activate
    Given I navigate to the Login screen
    When I touch the screen at the login button location
    And VoiceOver announces the login button
    And I have entered valid credentials
    And I perform a VoiceOver double tap gesture
    Then the login action should be triggered

  # ============================================================================
  # SCROLL GESTURES (Three-finger swipe)
  # VoiceOver users scroll content using three-finger swipes
  # ============================================================================

  @scroll @critical
  Scenario: Scroll content with three-finger swipe up
    Given I navigate to a screen with scrollable content
    When I perform a VoiceOver three-finger swipe up gesture
    Then the content should scroll down
    And VoiceOver should announce the scroll position

  @scroll
  Scenario: Scroll content with three-finger swipe down
    Given I navigate to a screen with scrollable content
    When I perform a VoiceOver three-finger swipe down gesture
    Then the content should scroll up
    And VoiceOver should announce the new visible content

  # ============================================================================
  # CUSTOM ACCESSIBILITY ACTIONS
  # Elements can expose custom actions to VoiceOver
  # ============================================================================

  @actions @critical
  Scenario: Password visibility toggle has custom accessibility action
    Given I navigate to the Login screen
    When VoiceOver focus is on the password visibility toggle
    Then the element should have a custom accessibility action
    And the action should describe toggling password visibility