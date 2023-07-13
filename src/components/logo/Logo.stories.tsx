import LogoComponent from './Logo';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react-native';

const LogoMeta: ComponentMeta<typeof LogoComponent> = {
  title: 'components/Logo',
  component: LogoComponent,
};

export default LogoMeta;

type LogoStory = ComponentStoryObj<typeof LogoComponent>;

export const Logo: LogoStory = {};
