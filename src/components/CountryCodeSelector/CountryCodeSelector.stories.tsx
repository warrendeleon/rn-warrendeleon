import React, { useState } from 'react';
import { Box } from '@gluestack-ui/themed';
import type { Meta, StoryObj } from '@storybook/react-native';

import { CountryCodeSelector, type CountryData, DEFAULT_COUNTRY } from './index';

const meta: Meta<typeof CountryCodeSelector> = {
  title: 'Components/CountryCodeSelector',
  component: CountryCodeSelector,
  decorators: [
    Story => (
      <Box p="$4" flex={1}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    isDisabled: {
      control: 'boolean',
      description: 'Disable the selector',
    },
  },
  parameters: {
    notes: `
## CountryCodeSelector Component

Country code selector button for phone number input fields.
Opens a full-screen modal with searchable country list.

### Props
- \`selectedCountry\`: CountryData - Currently selected country
- \`onCountrySelect\`: (country: CountryData) => void - Selection handler
- \`isDisabled\`: boolean - Disable interactions
- \`testID\`: string - Test identifier

### CountryData Shape
\`\`\`typescript
{
  code: string;      // ISO 3166-1 alpha-2 (e.g., "GB")
  name: string;      // Country name (e.g., "United Kingdom")
  callingCode: string; // Dial code (e.g., "+44")
  flag: string;      // Emoji flag (e.g., "🇬🇧")
}
\`\`\`

### Features
- Searchable country list
- Shows flag emoji and dial code
- Supports 50+ countries
- EAA accessible

### Accessibility
- Button role with descriptive label
- Full keyboard navigation in modal
- Screen reader support
    `,
  },
};

export default meta;

type Story = StoryObj<typeof CountryCodeSelector>;

// Interactive wrapper
const InteractiveSelector = (props: Partial<React.ComponentProps<typeof CountryCodeSelector>>) => {
  const [country, setCountry] = useState<CountryData>(props.selectedCountry || DEFAULT_COUNTRY);
  return (
    <CountryCodeSelector
      selectedCountry={country}
      onCountrySelect={setCountry}
      testID="country-selector"
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => <InteractiveSelector />,
};

export const UnitedKingdom: Story = {
  render: () => (
    <InteractiveSelector
      selectedCountry={{
        code: 'GB',
        name: 'United Kingdom',
        callingCode: '+44',
        flag: '🇬🇧',
      }}
    />
  ),
};

export const UnitedStates: Story = {
  render: () => (
    <InteractiveSelector
      selectedCountry={{
        code: 'US',
        name: 'United States',
        callingCode: '+1',
        flag: '🇺🇸',
      }}
    />
  ),
};

export const Spain: Story = {
  render: () => (
    <InteractiveSelector
      selectedCountry={{
        code: 'ES',
        name: 'Spain',
        callingCode: '+34',
        flag: '🇪🇸',
      }}
    />
  ),
};

export const Philippines: Story = {
  render: () => (
    <InteractiveSelector
      selectedCountry={{
        code: 'PH',
        name: 'Philippines',
        callingCode: '+63',
        flag: '🇵🇭',
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => <InteractiveSelector isDisabled />,
};

export const InFormContext: Story = {
  render: () => {
    const [country, setCountry] = useState<CountryData>(DEFAULT_COUNTRY);

    return (
      <Box bg="$white" borderRadius="$xl" p="$3">
        <Box flexDirection="row" alignItems="center">
          <CountryCodeSelector
            selectedCountry={country}
            onCountrySelect={setCountry}
            testID="form-country-selector"
          />
          <Box flex={1} ml="$2">
            <Box
              borderWidth={0}
              bg="transparent"
              p="$0"
              accessibilityLabel="Phone number input placeholder"
            >
              <Box height={22} justifyContent="center" opacity={0.5}>
                {/* Placeholder text would go here */}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
};
