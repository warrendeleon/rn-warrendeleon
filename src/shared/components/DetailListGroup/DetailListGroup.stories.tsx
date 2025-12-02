import type { Meta, StoryObj } from '@storybook/react-native';

import { DetailListGroup } from './DetailListGroup';

const meta: Meta<typeof DetailListGroup> = {
  title: 'Components/DetailListGroup',
  component: DetailListGroup,
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
  parameters: {
    notes: `
## DetailListGroup Component

List group with logos, labels, subtitles, badges, and navigation chevrons.

### Props
- \`items\`: DetailListGroupItem[] - Array of items
- \`loading\`: boolean - Show loading state
- \`error\`: string - Error message

### Item Properties
- \`id\`: string - Unique identifier
- \`label\`: string - Main text
- \`subtitle\`: string - Secondary text
- \`logoUri\`: string - SVG logo URL
- \`badge\`: string - Badge text
- \`showChevron\`: boolean - Show navigation chevron
    `,
  },
};

export default meta;

type Story = StoryObj<typeof DetailListGroup>;

export const Default: Story = {
  args: {
    items: [
      {
        id: '1',
        label: 'Company A',
        subtitle: '2020 - 2023',
        onPress: () => {},
        testID: 'company-a',
      },
      {
        id: '2',
        label: 'Company B',
        subtitle: '2018 - 2020',
        onPress: () => {},
        testID: 'company-b',
      },
    ],
  },
};

export const WithBadges: Story = {
  args: {
    items: [
      {
        id: '1',
        label: 'React Native',
        subtitle: 'Mobile Development',
        badge: '3',
        onPress: () => {},
      },
      {
        id: '2',
        label: 'TypeScript',
        subtitle: 'Web Development',
        badge: '5',
        onPress: () => {},
      },
    ],
  },
};

export const WithoutChevrons: Story = {
  args: {
    items: [
      {
        id: '1',
        label: 'Static Item',
        subtitle: 'No navigation',
        showChevron: false,
      },
      {
        id: '2',
        label: 'Another Item',
        subtitle: 'Also static',
        showChevron: false,
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
  },
};

export const Error: Story = {
  args: {
    items: [],
    error: 'Failed to load data. Please try again.',
  },
};

export const SingleItem: Story = {
  args: {
    items: [
      {
        id: '1',
        label: 'Only Item',
        subtitle: 'Single item in list',
        onPress: () => {},
      },
    ],
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      {
        id: '1',
        label: 'Item 1',
        subtitle: 'Description 1',
        onPress: () => {},
      },
      {
        id: '2',
        label: 'Item 2',
        subtitle: 'Description 2',
        badge: '2',
        onPress: () => {},
      },
      {
        id: '3',
        label: 'Item 3',
        subtitle: 'Description 3',
        onPress: () => {},
      },
      {
        id: '4',
        label: 'Item 4',
        subtitle: 'Description 4',
        badge: 'New',
        onPress: () => {},
      },
    ],
  },
};
