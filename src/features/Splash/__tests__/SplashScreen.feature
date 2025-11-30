@splash
Feature: Splash Screen
  As a user launching the app
  I want to see a splash screen with loading animation
  So that I know the app is loading while data is fetched

  # Note: Splash screen transitions to Home almost instantly with mocked data fixtures
  # Testing splash screen visibility requires real API delays which we avoid in E2E
  # The splash screen functionality is covered by RNTL unit tests instead
