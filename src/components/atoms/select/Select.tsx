import React from 'react';
import {
  CheckIcon,
  ISelectProps as NBSelectProps,
  Select as NBSelect,
  useColorModeValue,
} from 'native-base';
import {DarkTheme, DefaultTheme} from '@react-navigation/native';

type SelectItem = {
  label: string;
  value: string;
};

interface SelectProps
  extends Pick<
    NBSelectProps,
    | 'placeholder'
    | 'selectedValue'
    | 'accessibilityLabel'
    | 'onValueChange'
    | 'testID'
  > {
  items: SelectItem[];
}

export const Select = (props: SelectProps): JSX.Element => {
  return (
    <NBSelect
      {...props}
      minW={'full'}
      variant="unstyled"
      bgColor={useColorModeValue('white', 'dark.100')}
      rounded={8}
      size="lg"
      _selectedItem={{
        endIcon: <CheckIcon />,
      }}
      p={4}>
      {props.items.map((item, index) => (
        <NBSelect.Item key={index} label={item.label} value={item.value} />
      ))}
    </NBSelect>
  );
};
