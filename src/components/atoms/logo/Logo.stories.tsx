import {ComponentMeta, ComponentStoryObj} from '@storybook/react-native';

import {Logo as LogoComponent} from './Logo';

const LogoMeta: ComponentMeta<typeof LogoComponent> = {
  component: LogoComponent,
  title: 'components/Logo',
};

export default LogoMeta;

type LogoStory = ComponentStoryObj<typeof LogoComponent>;

export const Logo: LogoStory = {};
