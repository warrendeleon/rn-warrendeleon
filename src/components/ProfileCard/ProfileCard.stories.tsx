import type { Meta, StoryObj } from '@storybook/react-native';

import { ProfileCard } from './ProfileCard';

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  argTypes: {
    name: {
      control: 'text',
      description: 'First name',
    },
    lastName: {
      control: 'text',
      description: 'Last name',
    },
    profilePicture: {
      control: 'text',
      description: 'URL to profile picture',
    },
  },
  parameters: {
    notes: `
## ProfileCard Component

Displays user profile information with avatar, name, and navigation chevron.

### Props
- \`name\`: string - First name
- \`lastName\`: string - Last name
- \`profilePicture\`: string - URL to avatar image
- \`onPress\`: () => void - Press handler

### Accessibility
- Has proper accessibility label with full name
- Role set as button
- Hint describes navigation action
    `,
  },
};

export default meta;

type Story = StoryObj<typeof ProfileCard>;

export const Default: Story = {
  args: {
    name: 'Warren',
    lastName: 'de Leon',
    profilePicture: 'https://github.com/warrendeleon.png',
    onPress: () => {},
    testID: 'profile-card',
  },
};

export const LongName: Story = {
  args: {
    name: 'Alexander',
    lastName: 'Bartholomew-Richardson',
    profilePicture: 'https://github.com/warrendeleon.png',
    onPress: () => {},
  },
};

export const NoAvatar: Story = {
  args: {
    name: 'John',
    lastName: 'Doe',
    profilePicture: '',
    onPress: () => {},
  },
};
