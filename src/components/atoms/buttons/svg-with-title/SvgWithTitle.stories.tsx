import React from 'react';
import {VStack} from 'native-base';

import {ComponentMeta, ComponentStory} from '@storybook/react';

import {SvgWithTitle} from '@app/components/atoms/buttons/svg-with-title/SvgWithTitle';

import Altran from '../../../../assets/svg/altran.svg';

export default {
  component: SvgWithTitle,
  parameters: {
    actions: {
      argTypesRegex: '^on.*',
    },
    controls: {
      exclude: ['startIcon'],
    },
  },
  title: 'components/menu-item-svg',
} as ComponentMeta<typeof SvgWithTitle>;

export const Basic: ComponentStory<typeof SvgWithTitle> = args => (
  <VStack p={4}>
    <SvgWithTitle {...args} svg={<Altran height={'100%'} width={'100%'} />} />
  </VStack>
);

Basic.args = {
  label: 'Hello World',
};
