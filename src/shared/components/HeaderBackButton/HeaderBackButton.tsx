import React, { useCallback } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { Pressable } from '@app/components/ui/pressable';
import { useAppColorScheme } from '@app/shared/hooks';

export const HeaderBackButton: React.FC = React.memo(() => {
  const navigation = useNavigation();
  const colorScheme = useAppColorScheme();

  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const handlePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Pressable
      onPress={handlePress}
      testID="header-back-button"
      accessibilityRole="button"
      accessibilityLabel="Go back"
      accessibilityHint="Returns to the previous screen"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons name="chevron-left" size={32} color={iconColor} />
    </Pressable>
  );
});

HeaderBackButton.displayName = 'HeaderBackButton';
