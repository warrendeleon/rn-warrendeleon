// stories/MyButton.stories.tsx
import React from 'react';
import {ComponentMeta, ComponentStory} from '@storybook/react';

import {ButtonWithChevron} from './ButtonWithChevron';
import {VStack} from 'native-base';

export default {
  title: 'components/menu-item',
  component: ButtonWithChevron,
  parameters: {
    actions: {
      argTypesRegex: '^on.*',
    },
  },
} as ComponentMeta<typeof ButtonWithChevron>;

export const MenuItem: ComponentStory<typeof ButtonWithChevron> = args => (
  <VStack p={4}>
    <ButtonWithChevron {...args} />
  </VStack>
);

MenuItem.args = {
  label: 'Hello World',
};
