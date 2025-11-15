import React from 'react';

import { ButtonGroup, SelectableListButton } from '@app/components';

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
 *
 * This is a specialized wrapper around the generic ButtonGroup component.
 */
export const SelectableButtonGroup: React.FC<SelectableButtonGroupProps> = ({ items }) => {
  return (
    <ButtonGroup
      items={items}
      renderItem={(item, groupVariant) => (
        <SelectableListButton
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
