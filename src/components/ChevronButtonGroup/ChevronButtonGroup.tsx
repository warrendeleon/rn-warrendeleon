import React, { Fragment } from 'react';
import { View } from 'react-native';

import { ButtonGroupDivider } from '../ButtonGroupDivider/ButtonGroupDivider';
import { ButtonWithChevron } from '../ButtonWithChevron/ButtonWithChevron';

export type ChevronButtonGroupItem = {
  label: string;
  onPress: () => void;
  startIcon?: React.ElementType;
  startIconBgColor?: string;
  endLabel?: string;
  testID?: string;
};

type ChevronButtonGroupProps = {
  items: ChevronButtonGroupItem[];
};

type GroupVariant = 'single' | 'top' | 'middle' | 'bottom';

/**
 * Pure function to calculate the groupVariant for a button based on its position.
 * Exported for testing purposes.
 */
export const getChevronButtonGroupVariant = (index: number, total: number): GroupVariant => {
  if (total === 1) return 'single';
  if (index === 0) return 'top';
  if (index === total - 1) return 'bottom';
  return 'middle';
};

/**
 * ChevronButtonGroup component renders a vertical list of buttons with iOS-style grouped appearance.
 * Automatically handles rounded corners (first item gets top radius, last gets bottom radius).
 * Adds dividers between items.
 */
export const ChevronButtonGroup: React.FC<ChevronButtonGroupProps> = ({ items }) => {
  return (
    <View>
      {items.map((item, index) => {
        const groupVariant = getChevronButtonGroupVariant(index, items.length);
        const isLastItem = index === items.length - 1;

        return (
          <Fragment key={index}>
            <ButtonWithChevron
              label={item.label}
              onPress={item.onPress}
              startIcon={item.startIcon}
              startIconBgColor={item.startIconBgColor}
              endLabel={item.endLabel}
              groupVariant={groupVariant}
              testID={item.testID}
            />
            {!isLastItem && <ButtonGroupDivider />}
          </Fragment>
        );
      })}
    </View>
  );
};
