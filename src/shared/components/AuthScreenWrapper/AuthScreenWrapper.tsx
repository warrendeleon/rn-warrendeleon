import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from '@gluestack-ui/themed';

import { useAppColorScheme } from '@app/shared/hooks';

export interface AuthScreenWrapperProps {
  /** Child components to render inside the wrapper */
  children: React.ReactNode;
  /** Test ID for the ScrollView */
  testID: string;
  /** Whether the ScrollView should grow to fill available space (default: true) */
  flexGrow?: boolean;
  /** Bottom padding for content (default: 40) */
  paddingBottom?: number;
}

/**
 * AuthScreenWrapper - Common wrapper for Auth screens
 *
 * Provides KeyboardAvoidingView + ScrollView with consistent styling.
 * Handles keyboard behaviour and dark mode automatically.
 */
export const AuthScreenWrapper: React.FC<AuthScreenWrapperProps> = ({
  children,
  testID,
  flexGrow = true,
  paddingBottom = 40,
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        flex={1}
        bg={isDark ? '$black' : '$coolGray100'}
        contentContainerStyle={{ flexGrow: flexGrow ? 1 : undefined, paddingBottom }}
        keyboardShouldPersistTaps="handled"
        testID={testID}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
