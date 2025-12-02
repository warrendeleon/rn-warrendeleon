/**
 * Tests for ConfirmDialog component
 *
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { ConfirmDialog, type ConfirmDialogButton } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultButtons: ConfirmDialogButton[] = [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'default' },
  ];

  const defaultProps = {
    visible: true,
    title: 'Test Title',
    buttons: defaultButtons,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('should render when visible is true', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      expect(screen.getByTestId('dialog')).toBeTruthy();
    });

    it('should render title when visible', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      expect(screen.getByTestId('dialog-title')).toBeTruthy();
      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should not render content when visible is false', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} visible={false} testID="dialog" />);

      expect(screen.queryByTestId('dialog-content')).toBeNull();
    });
  });

  describe('title and message', () => {
    it('should render title', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should render message when provided', () => {
      renderWithProviders(
        <ConfirmDialog
          {...defaultProps}
          message="Are you sure you want to continue?"
          testID="dialog"
        />
      );

      expect(screen.getByText('Are you sure you want to continue?')).toBeTruthy();
      expect(screen.getByTestId('dialog-message')).toBeTruthy();
    });

    it('should not render message when not provided', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      expect(screen.queryByTestId('dialog-message')).toBeNull();
    });
  });

  describe('buttons', () => {
    it('should render all buttons', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      expect(screen.getByText('Cancel')).toBeTruthy();
      expect(screen.getByText('Confirm')).toBeTruthy();
    });

    it('should call button onPress when pressed', () => {
      const onPress = jest.fn();
      const buttons: ConfirmDialogButton[] = [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress },
      ];

      renderWithProviders(<ConfirmDialog {...defaultProps} buttons={buttons} testID="dialog" />);

      fireEvent.press(screen.getByText('Confirm'));

      expect(onPress).toHaveBeenCalled();
    });

    it('should call onClose when button is pressed', () => {
      const onClose = jest.fn();
      renderWithProviders(<ConfirmDialog {...defaultProps} onClose={onClose} testID="dialog" />);

      fireEvent.press(screen.getByText('Cancel'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should call both onPress and onClose when button is pressed', () => {
      const onPress = jest.fn();
      const onClose = jest.fn();
      const buttons: ConfirmDialogButton[] = [{ text: 'Confirm', onPress }];

      renderWithProviders(
        <ConfirmDialog {...defaultProps} buttons={buttons} onClose={onClose} testID="dialog" />
      );

      fireEvent.press(screen.getByText('Confirm'));

      expect(onPress).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should use custom testID for buttons when provided', () => {
      const buttons: ConfirmDialogButton[] = [
        { text: 'Cancel', testID: 'cancel-btn' },
        { text: 'Confirm', testID: 'confirm-btn' },
      ];

      renderWithProviders(<ConfirmDialog {...defaultProps} buttons={buttons} testID="dialog" />);

      expect(screen.getByTestId('cancel-btn')).toBeTruthy();
      expect(screen.getByTestId('confirm-btn')).toBeTruthy();
    });

    it('should use default testID for buttons when not provided', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      expect(screen.getByTestId('dialog-button-0')).toBeTruthy();
      expect(screen.getByTestId('dialog-button-1')).toBeTruthy();
    });
  });

  describe('button styles', () => {
    it('should render cancel style button', () => {
      const buttons: ConfirmDialogButton[] = [{ text: 'Cancel', style: 'cancel' }];

      renderWithProviders(<ConfirmDialog {...defaultProps} buttons={buttons} testID="dialog" />);

      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('should render destructive style button', () => {
      const buttons: ConfirmDialogButton[] = [{ text: 'Delete', style: 'destructive' }];

      renderWithProviders(<ConfirmDialog {...defaultProps} buttons={buttons} testID="dialog" />);

      expect(screen.getByText('Delete')).toBeTruthy();
    });

    it('should render default style button', () => {
      const buttons: ConfirmDialogButton[] = [{ text: 'OK', style: 'default' }];

      renderWithProviders(<ConfirmDialog {...defaultProps} buttons={buttons} testID="dialog" />);

      expect(screen.getByText('OK')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have alert accessibility role on content', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      const content = screen.getByTestId('dialog-content');
      expect(content.props.accessibilityRole).toBe('alert');
    });

    it('should have header accessibility role on title', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      const title = screen.getByTestId('dialog-title');
      expect(title.props.accessibilityRole).toBe('header');
    });

    it('should have button accessibility role on buttons', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      const button = screen.getByTestId('dialog-button-0');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should have accessibilityLabel on buttons', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="dialog" />);

      expect(screen.getByLabelText('Cancel')).toBeTruthy();
      expect(screen.getByLabelText('Confirm')).toBeTruthy();
    });
  });

  describe('testID structure', () => {
    it('should use default testID', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByTestId('confirm-dialog')).toBeTruthy();
    });

    it('should use custom testID', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} testID="custom-dialog" />);

      expect(screen.getByTestId('custom-dialog')).toBeTruthy();
      expect(screen.getByTestId('custom-dialog-overlay')).toBeTruthy();
      expect(screen.getByTestId('custom-dialog-content')).toBeTruthy();
      expect(screen.getByTestId('custom-dialog-title')).toBeTruthy();
    });
  });

  describe('common use cases', () => {
    it('should render logout dialog correctly', () => {
      const buttons: ConfirmDialogButton[] = [
        { text: 'Cancel', style: 'cancel', testID: 'logout-cancel' },
        { text: 'Log Out', style: 'destructive', testID: 'logout-confirm' },
      ];

      renderWithProviders(
        <ConfirmDialog
          visible={true}
          title="Log Out"
          message="Are you sure you want to log out?"
          buttons={buttons}
          testID="logout-dialog"
        />
      );

      // Title "Log Out" appears in both title and button, use testID for specificity
      expect(screen.getByTestId('logout-dialog-title')).toBeTruthy();
      expect(screen.getByText('Are you sure you want to log out?')).toBeTruthy();
      expect(screen.getByTestId('logout-cancel')).toBeTruthy();
      expect(screen.getByTestId('logout-confirm')).toBeTruthy();
    });

    it('should render delete confirmation dialog correctly', () => {
      const onDelete = jest.fn();
      const buttons: ConfirmDialogButton[] = [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ];

      renderWithProviders(
        <ConfirmDialog
          visible={true}
          title="Delete Item"
          message="This action cannot be undone."
          buttons={buttons}
          testID="delete-dialog"
        />
      );

      fireEvent.press(screen.getByText('Delete'));

      expect(onDelete).toHaveBeenCalled();
    });
  });
});
