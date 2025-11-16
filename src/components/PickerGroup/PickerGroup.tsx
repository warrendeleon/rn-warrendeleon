import React from 'react';

import { ButtonGroup, PickerItem } from '@app/components';

export type PickerGroupItem = {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
  testID?: string;
};

type PickerGroupProps = {
  items: PickerGroupItem[];
};

/**
 * PickerGroup component renders a vertical list of selectable buttons with iOS-style grouped appearance.
 * Automatically handles rounded corners (first item gets top radius, last gets bottom radius).
 * Adds dividers between items.
 * Shows check marks for selected items.
 *
 * This is a specialized wrapper around the generic ButtonGroup component.
 */
export const PickerGroup: React.FC<PickerGroupProps> = ({ items }) => {
  return (
    <ButtonGroup
      items={items}
      renderItem={(item, groupVariant) => (
        <PickerItem
          label={item.label}
          onPress={item.onPress}
          groupVariant={groupVariant}
          isSelected={item.isSelected}
          testID={item.testID}
        />
      )}
    />
  );
};
