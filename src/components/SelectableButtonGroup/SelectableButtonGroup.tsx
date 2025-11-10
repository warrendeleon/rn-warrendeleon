import React, { Fragment } from 'react';
import { View } from 'react-native';

import { ButtonGroupDivider } from '../ButtonGroupDivider/ButtonGroupDivider';
import { SelectableListButton } from '../SelectableListButton/SelectableListButton';

export type SelectableButtonGroupItem = {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
  testID?: string;
};

type SelectableButtonGroupProps = {
  items: SelectableButtonGroupItem[];
};

type GroupVariant = 'single' | 'top' | 'middle' | 'bottom';

/**
 * Pure function to calculate the groupVariant for a button based on its position.
 * Exported for testing purposes.
 */
export const getSelectableButtonGroupVariant = (index: number, total: number): GroupVariant => {
  if (total === 1) return 'single';
  if (index === 0) return 'top';
  if (index === total - 1) return 'bottom';
  return 'middle';
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
        const groupVariant = getSelectableButtonGroupVariant(index, items.length);
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
