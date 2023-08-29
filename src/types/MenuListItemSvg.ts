import {JSX} from 'react';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';

export type MenuListItemSvg = {
  title?: string;
  subtitle?: string;
  label?: string;
  svg: JSX.Element | Array<JSX.Element>;
  start: string;
  end: string;
  onPressItem: (event: GestureResponderEvent) => void;
};
