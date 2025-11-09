import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Box, Button, ButtonText, Text } from '@gluestack-ui/themed';

export const LibraryCheck = () => {
  // 🔹 Reanimated test
  const rotation = useSharedValue(0);
  rotation.value = withRepeat(withTiming(360, { duration: 3000 }), -1, false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Box className="flex-1 items-center justify-center bg-blue-50">
      {/* GlueStack + NativeWind */}
      <Text className="text-2xl font-bold text-blue-800 mb-4">
        GlueStack + NativeWind + Reanimated ✅
      </Text>

      <Animated.View style={[animatedStyle, { marginBottom: 20 }]}>
        <Box className="w-16 h-16 bg-blue-500" />
      </Animated.View>

      <Button size="md" variant="solid" className="bg-blue-600">
        <ButtonText>Looks good!</ButtonText>
      </Button>
    </Box>
  );
};
