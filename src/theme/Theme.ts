import {extendTheme} from 'native-base';

export const theme = extendTheme({
  fontConfig: {
    SFProText: {
      100: {
        normal: 'SFProText-Regular',
        italic: 'Roboto-LightItalic',
      },
      200: {
        normal: 'SFProText-Light',
        italic: 'SFProText-LightItalic',
      },
      300: {
        normal: 'SFProText-Light',
        italic: 'SFProText-LightItalic',
      },
      400: {
        normal: 'SFProText-Regular',
        italic: 'SFProText-Italic',
      },
      500: {
        normal: 'SFProText-Medium',
      },
      600: {
        normal: 'SFProText-Medium',
        italic: 'SFProText-MediumItalic',
      },
      700: {
        normal: 'SFProText-Bold',
        italic: 'SFProText-BoldItalic',
      },
      800: {
        normal: 'SFProText-Bold',
        italic: 'SFProText-BoldItalic',
      },
      900: {
        normal: 'SFProText-Bold',
        italic: 'SFProText-BoldItalic',
      },
    },
  },
  fonts: {
    heading: 'SFProText',
    body: 'SFProText',
    mono: 'SFProText',
  },
});
