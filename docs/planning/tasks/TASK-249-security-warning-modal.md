# TASK-249: SecurityWarningModal Component Implementation

**ID**: TASK-249 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-043](../stories/US-043-root-jailbreak-detection.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create a SecurityWarningModal component to display security warnings when root/jailbreak is detected. Show risk level, specific warnings, recommendations, and option to proceed with caution or exit app.

---

## Acceptance Criteria

- [ ] SecurityWarningModal component created in `src/components/security/SecurityWarningModal.tsx`
- [ ] Display risk level with color-coded indicator
- [ ] List all security warnings
- [ ] List security recommendations
- [ ] "Proceed with Caution" button
- [ ] "Exit App" button (for CRITICAL risk)
- [ ] Modal cannot be dismissed on CRITICAL risk
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Component Structure

```typescript
// src/components/security/SecurityWarningModal.tsx

import React from 'react';
import { Platform } from 'react-native';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  VStack,
  HStack,
  Button,
  ButtonText,
  Text,
  Heading,
  AlertCircleIcon,
  ShieldAlertIcon,
} from '@gluestack-ui/themed';
import {
  SecurityRiskLevel,
  getSecurityStatusMessage,
  getRiskLevelColor,
  shouldBlockFunctionality,
} from '../../services/security/securityDetectionService';

export interface SecurityWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onExit: () => void;
  riskLevel: SecurityRiskLevel;
  warnings: string[];
  recommendations: string[];
}

export const SecurityWarningModal: React.FC<SecurityWarningModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  onExit,
  riskLevel,
  warnings,
  recommendations,
}) => {
  const isBlocked = shouldBlockFunctionality(riskLevel);
  const riskColor = getRiskLevelColor(riskLevel);
  const statusMessage = getSecurityStatusMessage(riskLevel);

  const handleProceed = () => {
    onProceed();
    if (!isBlocked) {
      onClose();
    }
  };

  const handleExit = () => {
    onExit();
    // On iOS, we can't force quit the app, so we just call onClose
    if (Platform.OS === 'ios') {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isBlocked ? undefined : onClose}
      size="lg"
      testID="security-warning-modal"
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <VStack space="sm">
            <HStack space="sm" alignItems="center">
              <ShieldAlertIcon size="xl" color={riskColor} />
              <Heading
                size="lg"
                color={riskColor}
                accessibilityRole="header"
              >
                Security Warning
              </Heading>
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalBody>
          <VStack space="lg">
            {/* Risk Level Indicator */}
            <Box
              backgroundColor={`${riskColor}15`}
              borderColor={riskColor}
              borderWidth={2}
              borderRadius="$md"
              padding="$3"
              testID="risk-level-indicator"
            >
              <HStack space="sm" alignItems="center">
                <AlertCircleIcon size="md" color={riskColor} />
                <VStack flex={1}>
                  <Text fontSize="$sm" fontWeight="$bold" color={riskColor}>
                    Risk Level: {riskLevel.toUpperCase()}
                  </Text>
                  <Text fontSize="$sm" color="$gray700">
                    {statusMessage}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Warnings */}
            {warnings.length > 0 && (
              <VStack space="xs">
                <Text fontSize="$md" fontWeight="$semibold" color="$gray900">
                  Security Issues Detected:
                </Text>
                <VStack space="xs">
                  {warnings.map((warning, index) => (
                    <HStack key={index} space="xs" alignItems="flex-start">
                      <Text fontSize="$md" color={riskColor}>
                        •
                      </Text>
                      <Text flex={1} fontSize="$sm" color="$gray700">
                        {warning}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <VStack space="xs">
                <Text fontSize="$md" fontWeight="$semibold" color="$gray900">
                  Recommendations:
                </Text>
                <VStack space="xs">
                  {recommendations.map((recommendation, index) => (
                    <HStack key={index} space="xs" alignItems="flex-start">
                      <Text fontSize="$md" color="$blue600">
                        ✓
                      </Text>
                      <Text flex={1} fontSize="$sm" color="$gray700">
                        {recommendation}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            )}

            {/* Critical Warning Message */}
            {isBlocked && (
              <Box
                backgroundColor="$red100"
                borderColor="$red600"
                borderWidth={1}
                borderRadius="$md"
                padding="$3"
                testID="critical-warning"
              >
                <Text fontSize="$sm" color="$red800" fontWeight="$semibold">
                  ⚠️ For your security, we cannot allow the app to continue on this device. Please use a secure, non-rooted/jailbroken device.
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <VStack space="sm" width="100%">
            {!isBlocked && (
              <Button
                onPress={handleProceed}
                variant="outline"
                borderColor={riskColor}
                testID="proceed-button"
                accessibilityRole="button"
                accessibilityLabel="Proceed with caution"
                accessibilityHint="Continue using the app despite security warnings"
              >
                <ButtonText color={riskColor}>Proceed with Caution</ButtonText>
              </Button>
            )}

            <Button
              onPress={handleExit}
              backgroundColor={riskColor}
              testID="exit-button"
              accessibilityRole="button"
              accessibilityLabel={isBlocked ? 'Exit app' : 'Close warning'}
              accessibilityHint={isBlocked ? 'Exit the application' : 'Close this warning'}
            >
              <ButtonText color="$white">
                {isBlocked ? 'Exit App' : 'Close'}
              </ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/security/__tests__/SecurityWarningModal.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SecurityWarningModal } from '../SecurityWarningModal';
import { SecurityRiskLevel } from '../../../services/security/securityDetectionService';

describe('SecurityWarningModal', () => {
  const mockOnClose = jest.fn();
  const mockOnProceed = jest.fn();
  const mockOnExit = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onProceed: mockOnProceed,
    onExit: mockOnExit,
    riskLevel: SecurityRiskLevel.MEDIUM,
    warnings: ['Warning 1', 'Warning 2'],
    recommendations: ['Recommendation 1', 'Recommendation 2'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when open', () => {
    const { getByTestId, getByText } = render(<SecurityWarningModal {...defaultProps} />);

    expect(getByTestId('security-warning-modal')).toBeTruthy();
    expect(getByText('Security Warning')).toBeTruthy();
  });

  it('should display risk level indicator', () => {
    const { getByTestId, getByText } = render(<SecurityWarningModal {...defaultProps} />);

    expect(getByTestId('risk-level-indicator')).toBeTruthy();
    expect(getByText('Risk Level: MEDIUM')).toBeTruthy();
  });

  it('should display all warnings', () => {
    const { getByText } = render(<SecurityWarningModal {...defaultProps} />);

    expect(getByText('Warning 1')).toBeTruthy();
    expect(getByText('Warning 2')).toBeTruthy();
  });

  it('should display all recommendations', () => {
    const { getByText } = render(<SecurityWarningModal {...defaultProps} />);

    expect(getByText('Recommendation 1')).toBeTruthy();
    expect(getByText('Recommendation 2')).toBeTruthy();
  });

  describe('CRITICAL risk level', () => {
    it('should show critical warning message', () => {
      const { getByTestId } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.CRITICAL}
        />
      );

      expect(getByTestId('critical-warning')).toBeTruthy();
    });

    it('should hide "Proceed with Caution" button', () => {
      const { queryByTestId } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.CRITICAL}
        />
      );

      expect(queryByTestId('proceed-button')).toBeNull();
    });

    it('should show "Exit App" button', () => {
      const { getByTestId, getByText } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.CRITICAL}
        />
      );

      expect(getByTestId('exit-button')).toBeTruthy();
      expect(getByText('Exit App')).toBeTruthy();
    });

    it('should not allow modal dismissal', () => {
      const { getByTestId } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.CRITICAL}
        />
      );

      // Modal should not have onClose when blocked
      // This is enforced by passing undefined to Modal's onClose
    });
  });

  describe('NON-CRITICAL risk levels', () => {
    it('should show "Proceed with Caution" button for HIGH risk', () => {
      const { getByTestId } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.HIGH}
        />
      );

      expect(getByTestId('proceed-button')).toBeTruthy();
    });

    it('should show "Proceed with Caution" button for MEDIUM risk', () => {
      const { getByTestId } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.MEDIUM}
        />
      );

      expect(getByTestId('proceed-button')).toBeTruthy();
    });

    it('should show "Close" button instead of "Exit App"', () => {
      const { getByText } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.MEDIUM}
        />
      );

      expect(getByText('Close')).toBeTruthy();
    });

    it('should call onProceed and onClose when proceed button is pressed', () => {
      const { getByTestId } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.MEDIUM}
        />
      );

      fireEvent.press(getByTestId('proceed-button'));

      expect(mockOnProceed).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onExit when exit button is pressed', () => {
      const { getByTestId } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.MEDIUM}
        />
      );

      fireEvent.press(getByTestId('exit-button'));

      expect(mockOnExit).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', () => {
      const { getByTestId } = render(<SecurityWarningModal {...defaultProps} />);

      expect(getByTestId('proceed-button')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('exit-button')).toHaveProp('accessibilityRole', 'button');
    });

    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(<SecurityWarningModal {...defaultProps} />);

      expect(getByTestId('proceed-button')).toHaveProp(
        'accessibilityLabel',
        'Proceed with caution'
      );
      expect(getByTestId('exit-button')).toHaveProp(
        'accessibilityLabel',
        'Close warning'
      );
    });

    it('should have correct accessibility hints', () => {
      const { getByTestId } = render(<SecurityWarningModal {...defaultProps} />);

      expect(getByTestId('proceed-button')).toHaveProp(
        'accessibilityHint',
        'Continue using the app despite security warnings'
      );
    });
  });

  describe('Risk level colors', () => {
    it('should use red color for CRITICAL risk', () => {
      const { getByText } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.CRITICAL}
        />
      );

      // Color is applied via getRiskLevelColor function
      expect(getByText('Risk Level: CRITICAL')).toBeTruthy();
    });

    it('should use orange color for HIGH risk', () => {
      const { getByText } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.HIGH}
        />
      );

      expect(getByText('Risk Level: HIGH')).toBeTruthy();
    });

    it('should use amber color for MEDIUM risk', () => {
      const { getByText } = render(
        <SecurityWarningModal
          {...defaultProps}
          riskLevel={SecurityRiskLevel.MEDIUM}
        />
      );

      expect(getByText('Risk Level: MEDIUM')).toBeTruthy();
    });
  });
});
```

---

## Dependencies

- GlueStack UI components
- Security detection service (TASK-248)

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Risk level indicator working
- [ ] Warnings and recommendations displayed
- [ ] Button behavior correct for each risk level
- [ ] Modal dismissal blocked on CRITICAL risk
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-043](../stories/US-043-root-jailbreak-detection.md), [TASK-248](TASK-248-root-detection-service.md), [TASK-250](TASK-250-security-status-indicator.md)
