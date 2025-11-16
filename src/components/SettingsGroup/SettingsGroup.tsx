import React from 'react';

import { ButtonGroup, SettingsItem } from '@app/components';

export type SettingsGroupItem = {
  label: string;
  onPress: () => void;
  startIcon?: React.ElementType;
  startIconBgColor?: string;
  endLabel?: string;
  testID?: string;
};

type SettingsGroupProps = {
  items: SettingsGroupItem[];
};

/**
 * SettingsGroup component renders a vertical list of buttons with iOS-style grouped appearance.
 * Automatically handles rounded corners (first item gets top radius, last gets bottom radius).
 * Adds dividers between items.
 *
 * This is a specialized wrapper around the generic ButtonGroup component.
 */
export const SettingsGroup: React.FC<SettingsGroupProps> = ({ items }) => {
  return (
    <ButtonGroup
      items={items}
      renderItem={(item, groupVariant) => (
        <SettingsItem
          label={item.label}
          onPress={item.onPress}
          startIcon={item.startIcon}
          startIconBgColor={item.startIconBgColor}
          endLabel={item.endLabel}
          groupVariant={groupVariant}
          testID={item.testID}
        />
      )}
    />
  );
};
