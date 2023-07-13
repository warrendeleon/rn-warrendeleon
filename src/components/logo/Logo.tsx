import React, {PropsWithChildren} from 'react';
import Lottie from 'lottie-react-native';

type LogoProp = PropsWithChildren<{
  darkMode?: boolean;
}>;

const Logo = ({darkMode = false}: LogoProp): JSX.Element => {
  return (
    <Lottie
      source={
        darkMode
          ? require('../../assets/animations/logo/white.json')
          : require('../../assets/animations/logo/black.json')
      }
      autoPlay
      loop
    />
  );
};

export default Logo;
