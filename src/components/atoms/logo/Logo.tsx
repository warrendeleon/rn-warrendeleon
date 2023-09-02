import React, {PropsWithChildren} from 'react';
import Lottie from 'lottie-react-native';

type LogoProp = PropsWithChildren<{
  darkMode?: boolean;
}>;

export const Logo = ({darkMode = false}: LogoProp): JSX.Element => {
  return (
    <Lottie
      source={
        darkMode
          ? require('../../../assets/animations/logo/black.json')
          : require('../../../assets/animations/logo/white.json')
      }
      autoPlay
      loop
    />
  );
};
