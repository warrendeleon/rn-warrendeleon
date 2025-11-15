import React, { Fragment } from 'react';
import { View } from 'react-native';

import { ButtonGroupDivider, getButtonGroupVariant, type GroupVariant } from '@app/components';

export type ButtonGroupItem = {
  [key: string]: unknown;
};

type ButtonGroupProps<T extends ButtonGroupItem> = {
  items: T[];
  renderItem: (item: T, groupVariant: GroupVariant, index: number) => React.ReactElement;
};

/**
 * Generic ButtonGroup component that renders a vertical list of buttons with iOS-style grouped appearance.
 * Automatically handles rounded corners (first item gets top radius, last gets bottom radius).
 * Adds dividers between items.
 *
 * @template T - The type of items in the list (must extend ButtonGroupItem)
 * @param items - Array of items to render
 * @param renderItem - Function that renders each item with the appropriate groupVariant
 */
export const ButtonGroup = <T extends ButtonGroupItem>({
  items,
  renderItem,
}: ButtonGroupProps<T>) => {
  return (
    <View>
      {items.map((item, index) => {
        const groupVariant = getButtonGroupVariant(index, items.length);
        const isLastItem = index === items.length - 1;

        return (
          <Fragment key={index}>
            {renderItem(item, groupVariant, index)}
            {!isLastItem && <ButtonGroupDivider />}
          </Fragment>
        );
      })}
    </View>
  );
};
