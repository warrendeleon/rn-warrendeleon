import React from 'react';
import {VStack} from 'native-base';

import {faSliders} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {ComponentMeta, ComponentStory} from '@storybook/react';

import {ButtonWithChevron} from '@app/atoms';

export default {
  component: ButtonWithChevron,
  parameters: {
    actions: {
      argTypesRegex: '^on.*',
    },
    controls: {
      exclude: ['startIcon'],
    },
  },
  title: 'components/menu-item',
} as ComponentMeta<typeof ButtonWithChevron>;

export const Basic: ComponentStory<typeof ButtonWithChevron> = args => (
  <VStack p={4}>
    <ButtonWithChevron {...args} />
  </VStack>
);

Basic.args = {
  label: 'Hello World',
};

export const WithIcon: ComponentStory<typeof ButtonWithChevron> = args => (
  <VStack p={4}>
    <ButtonWithChevron
      {...args}
      startIcon={<FontAwesomeIcon size={18} icon={faSliders} color={'white'} />}
    />
  </VStack>
);

WithIcon.args = {
  label: 'Hello World',
  startIconBgColor: 'blue.600',
};

WithIcon.argTypes = {
  startIconBgColor: {
    control: {type: 'radio'},
    options: ['primary.600', 'secondary.600', 'blue.600', 'teal.600'],
  },
};
