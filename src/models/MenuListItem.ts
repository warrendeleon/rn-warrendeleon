import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import {
  ColorType,
  ResponsiveValue,
} from 'native-base/lib/typescript/components/types';
import {ILinearGradientProps} from 'native-base/lib/typescript/components/primitives/Box/types';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';

export interface MenuListItem {
  icon: IconDefinition;
  iconBgColor: ResponsiveValue<
    ColorType | (string & {}) | ILinearGradientProps
  >;
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
  label: string;
}
