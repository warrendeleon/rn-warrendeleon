import React, { Fragment } from 'react';
import { View } from 'react-native';

import { ButtonGroupDivider, getButtonGroupVariant, SelectableListButton } from '@app/components';

export type SelectableButtonGroupItem = {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
  testID?: string;
};

type SelectableButtonGroupProps = {
  items: SelectableButtonGroupItem[];
};

/**
 * SelectableButtonGroup component renders a vertical list of selectable buttons with iOS-style grouped appearance.
 * Automatically handles rounded corners (first item gets top radius, last gets bottom radius).
 * Adds dividers between items.
 * Shows check marks for selected items.
 */
export const SelectableButtonGroup: React.FC<SelectableButtonGroupProps> = ({ items }) => {
  return (
    <View>
      {items.map((item, index) => {
        const groupVariant = getButtonGroupVariant(index, items.length);
        const isLastItem = index === items.length - 1;

        return (
          <Fragment key={index}>
            <SelectableListButton
              label={item.label}
              onPress={item.onPress}
              groupVariant={groupVariant}
              isSelected={item.isSelected}
              testID={item.testID}
            />
            {!isLastItem && <ButtonGroupDivider />}
          </Fragment>
        );
      })}
    </View>
  );
};
