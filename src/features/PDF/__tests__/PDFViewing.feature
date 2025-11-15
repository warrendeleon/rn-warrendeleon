Feature: CV PDF Viewing
  As a portfolio app user
  I want to view Warren's CV in the app
  So that I can review his qualifications

  Scenario: Navigate to CV PDF from HomeScreen
    Given I am on the HomeScreen
    When I tap the My CV button
    Then I should see the PDF viewer screen
    And the PDF should load successfully

  Scenario: Share CV PDF
    Given I am on the HomeScreen
    When I tap the My CV button
    And I wait for the PDF to load
    And I tap the share button
    Then the native share sheet should appear

  Scenario: Cancel PDF share
    Given I am on the HomeScreen
    When I tap the My CV button
    And I wait for the PDF to load
    And I tap the share button
    And I cancel the share sheet
    Then I should return to the PDF viewer

  Scenario: Navigate back from PDF viewer
    Given I am on the HomeScreen
    When I tap the My CV button
    And I wait for the PDF to load
    And I tap the back button
    Then I should return to the HomeScreen
