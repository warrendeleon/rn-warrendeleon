// Import common and auth steps to make them available
import '@app/test-utils/cucumber/step-definitions/common.cucumber';
import '@app/test-utils/cucumber/step-definitions/auth.cucumber';

// Profile Picture specific step definitions
// All steps used in ProfilePicture.feature are provided by common.steps and auth.steps
// Note: Camera/Library flows are E2E mocked via isE2EMockEnabled() in imagePickerService
