import React from 'react';
import Lottie, { LottieViewProps } from 'lottie-react-native';

import blackLogo from '../../assets/animations/logo/black.json';
import whiteLogo from '../../assets/animations/logo/white.json';

interface LogoProps extends Omit<LottieViewProps, 'source'> {
  darkMode?: boolean;
}

export const Logo = ({ darkMode = false, style, ...props }: LogoProps) => {
  // In dark mode, show white logo (white letters)
  // In light mode, show black logo (black letters)
  return (
    <Lottie source={darkMode ? whiteLogo : blackLogo} autoPlay loop style={style} {...props} />
  );
};
