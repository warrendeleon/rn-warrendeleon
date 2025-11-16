import React from 'react';

import { ButtonGroup, ButtonWithChevron } from '@app/components';

export type ChevronButtonGroupItem = {
  label: string;
  onPress: () => void;
  startIcon?: React.ElementType;
  startIconBgColor?: string;
  endLabel?: string;
  testID?: string;
};

/**
 * @deprecated Use SettingsGroup instead. This component will be removed.
 * ChevronButtonGroup has been renamed to SettingsGroup for purpose-based clarity.
 */

type ChevronButtonGroupProps = {
  items: ChevronButtonGroupItem[];
};

/**
 * ChevronButtonGroup component renders a vertical list of buttons with iOS-style grouped appearance.
 * Automatically handles rounded corners (first item gets top radius, last gets bottom radius).
 * Adds dividers between items.
 *
 * This is a specialized wrapper around the generic ButtonGroup component.
 */
export const ChevronButtonGroup: React.FC<ChevronButtonGroupProps> = ({ items }) => {
  return (
    <ButtonGroup
      items={items}
      renderItem={(item, groupVariant) => (
        <ButtonWithChevron
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
