import React from 'react';
import Lottie, { LottieViewProps } from 'lottie-react-native';

import darkLogo from '../../../assets/animations/logo/dark.json';
import lightLogo from '../../../assets/animations/logo/light.json';

interface LogoProps extends Omit<LottieViewProps, 'source'> {
  darkMode?: boolean;
}

export const Logo = ({ darkMode = false, ...props }: LogoProps) => {
  return <Lottie source={darkMode ? darkLogo : lightLogo} autoPlay loop {...props} />;
};
