import React, { useEffect, useState } from 'react';
import { DevSettings, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { App } from './App';

const STORYBOOK_KEY = '@storybook_enabled';

const StorybookToggle = () => {
  const [isStorybookEnabled, setIsStorybookEnabled] = useState<boolean | null>(null);
  const [StorybookComponent, setStorybookComponent] = useState<React.ComponentType | null>(null);
  const [storybookError, setStorybookError] = useState<string | null>(null);

  useEffect(() => {
    // Check AsyncStorage for Storybook preference
    const checkStorybookPreference = async () => {
      try {
        const value = await AsyncStorage.getItem(STORYBOOK_KEY);
        const enabled = value === 'true';
        setIsStorybookEnabled(enabled);

        // Pre-load Storybook component if enabled
        if (enabled) {
          try {
            const storybookModule = await import('../../.rnstorybook');
            setStorybookComponent(() => storybookModule.default);
          } catch (error) {
            console.error('Failed to load Storybook:', error);
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to load Storybook';
            setStorybookError(errorMessage);
            // Disable Storybook if it fails to load
            await AsyncStorage.setItem(STORYBOOK_KEY, 'false');
            setIsStorybookEnabled(false);
          }
        }
      } catch {
        setIsStorybookEnabled(false);
      }
    };

    checkStorybookPreference();
  }, []);

  useEffect(() => {
    // Add dev menu item to toggle Storybook
    if (__DEV__) {
      DevSettings.addMenuItem('Toggle Storybook', async () => {
        try {
          const currentValue = await AsyncStorage.getItem(STORYBOOK_KEY);
          const newValue = currentValue === 'true' ? 'false' : 'true';
          await AsyncStorage.setItem(STORYBOOK_KEY, newValue);

          // Reload the app to apply the change
          DevSettings.reload();
        } catch (error) {
          console.error('Failed to toggle Storybook:', error);
        }
      });
    }
  }, []);

  // Show loading state while checking preference
  if (isStorybookEnabled === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show error if Storybook failed to load
  if (storybookError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>Storybook Error:</Text>
        <Text style={{ textAlign: 'center' }}>{storybookError}</Text>
        <Text style={{ marginTop: 20, color: 'gray' }}>
          Storybook has been disabled. Use Cmd+D to re-enable.
        </Text>
      </View>
    );
  }

  // Render Storybook if enabled and loaded
  if (isStorybookEnabled && StorybookComponent) {
    return <StorybookComponent />;
  }

  // Default to main app
  return <App />;
};

export default StorybookToggle;
