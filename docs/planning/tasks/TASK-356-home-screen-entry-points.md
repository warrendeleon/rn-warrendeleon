# TASK-356: Home Screen Entry Points

**Epic**: EPIC-031: Book a Call
**User Story**: US-064: Booking Confirmation & Navigation
**Status**: 📋 To Do
**Effort**: 2h
**Priority**: P0 (Critical Path)
**Assigned To**: Warren
**Created**: 2025-11-26

---

## Overview

Add "Book a Call" and "My Bookings" entry points to the Home screen's contact button group. These buttons provide primary navigation into the booking flow and upcoming bookings list. Must integrate smoothly with existing Home screen design, follow iOS-native patterns, and include full EAA compliance.

---

## Requirements

### Functional Requirements

**Button Group Location**:

- Add buttons to existing "Contact Warren" section on Home screen
- Position below contact methods (email, LinkedIn, phone)
- Maintain consistent spacing and styling with existing buttons

**"Book a Call" Button**:

- Label: `t('home.contact.bookCall')` ("Book a Call")
- Icon: `faCalendar` from FontAwesome (pink.700 colour)
- Action: Navigate to `BookingSelectType` screen
- Prominent visual treatment (primary action)

**"My Bookings" Button**:

- Label: `t('home.contact.myBookings')` ("My Bookings")
- Icon: `faListCheck` from FontAwesome (blue.500 colour)
- Action: Navigate to `MyBookingsScreen` (future implementation)
- Secondary visual treatment

**EAA Compliance**:

- Both buttons: `minHeight="$12"` (48pt)
- `accessibilityRole="button"`
- `accessibilityLabel` with clear description
- `accessibilityHint` explaining action
- High contrast icons and text (4.5:1 minimum)

**i18n Labels**:

- `home.contact.bookCall` - "Book a Call"
- `home.contact.myBookings` - "My Bookings"
- `home.contact.bookCallHint` - "Opens booking form to schedule a call with Warren"
- `home.contact.myBookingsHint` - "View your upcoming and past bookings"

### Non-Functional Requirements

**Performance**:

- Buttons render immediately (no delay)
- Navigation transition <100ms
- Icons load from cache (no network)

**Visual Design**:

- Match existing Home screen button style
- Use GlueStack tokens for colours/spacing
- iOS-native look and feel
- Support dark mode

**Testing**:

- 100% RNTL coverage for new buttons
- Storybook stories showing button states
- Snapshot tests for visual regression
- Integration tests for navigation

---

## Design Specifications

### iOS-Native Design

**Colours** (GlueStack tokens):

- Book a Call icon: `$pink700`
- My Bookings icon: `$blue500`
- Button background: `$backgroundLight50` (light), `$backgroundDark900` (dark)
- Button border: `$borderLight300` (light), `$borderDark700` (dark)
- Text: `$textLight950` (light), `$textDark50` (dark)

**Typography** (GlueStack tokens):

- Button label: `$md` (16pt), `$medium` weight
- iOS-native font family (SF Pro)

**Spacing** (GlueStack tokens):

- Section gap: `$6` (24pt) above button group
- Button gap: `$3` (12pt) between buttons
- Icon-to-text gap: `$2` (8pt)
- Button padding: `$4` (16pt)

**Layout**:

- Full-width buttons (edge-to-edge with screen padding)
- Left-aligned icon + text
- Right chevron icon (optional, for consistency)

### ASCII Mockup

**Home Screen - Contact Section** (before):

```
┌─────────────────────────────────────┐
│  Contact Warren                     │  Section title
├─────────────────────────────────────┤
│                                     │
│  📧 warren@warrendeleon.com         │  Email button
│                                     │
│  💼 LinkedIn                        │  LinkedIn button
│                                     │
│  📞 +44 7700 900 000                │  Phone button
│                                     │
└─────────────────────────────────────┘
```

**Home Screen - Contact Section** (after - with new buttons):

```
┌─────────────────────────────────────┐
│  Contact Warren                     │  Section title
├─────────────────────────────────────┤
│                                     │
│  📧 warren@warrendeleon.com         │  Email button
│                                     │
│  💼 LinkedIn                        │  LinkedIn button
│                                     │
│  📞 +44 7700 900 000                │  Phone button
│                                     │
│  ─────────────────────────────────  │  Divider (optional)
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📅  Book a Call         >  │   │  NEW: Book a Call button
│  └─────────────────────────────┘   │  (pink.700 icon)
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ✓  My Bookings          >  │   │  NEW: My Bookings button
│  └─────────────────────────────┘   │  (blue.500 icon)
│                                     │
└─────────────────────────────────────┘
```

**Button Detail** (Book a Call):

```
┌───────────────────────────────────┐
│  [📅]  Book a Call            [>] │  48pt min height
│                                   │  Pink.700 icon
│                                   │  Medium weight text
└───────────────────────────────────┘
```

**Button Detail** (My Bookings):

```
┌───────────────────────────────────┐
│  [✓]  My Bookings             [>] │  48pt min height
│                                   │  Blue.500 icon
│                                   │  Medium weight text
└───────────────────────────────────┘
```

---

## Technical Implementation

### Component Structure

**Option 1: Add buttons directly to HomeScreen.tsx** (simplest):

```typescript
// src/features/Home/HomeScreen.tsx
// Add buttons to existing contact section
```

**Option 2: Extract ContactSection component** (cleaner):

```typescript
// src/features/Home/components/ContactSection/
// ├── ContactSection.tsx
// ├── ContactSection.test.tsx
// └── ContactSection.stories.tsx
```

Recommendation: **Option 2** for better separation of concerns and testability.

### Code Example: ContactSection.tsx

```typescript
import React from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  VStack,
  HStack,
  Text,
  Pressable,
  Icon,
  Divider,
} from '@gluestack-ui/themed';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faEnvelope,
  faPhone,
  faCalendar,
  faListCheck,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '@app/navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleEmail = async () => {
    await Linking.openURL('mailto:warren@warrendeleon.com');
  };

  const handleLinkedIn = async () => {
    await Linking.openURL('https://linkedin.com/in/warrendeleon');
  };

  const handlePhone = async () => {
    await Linking.openURL('tel:+447700900000');
  };

  const handleBookCall = () => {
    navigation.navigate('BookingSelectType');
  };

  const handleMyBookings = () => {
    // TODO: Implement MyBookingsScreen
    // navigation.navigate('MyBookingsScreen');
    console.log('My Bookings - Coming soon');
  };

  return (
    <VStack space="$3" testID="contact-section">
      {/* Section Title */}
      <Text
        fontSize="$xl"
        fontWeight="$bold"
        color="$textLight950"
        _dark={{ color: '$textDark50' }}
        mb="$2"
        testID="contact-section-title"
      >
        {t('home.contact.title')}
      </Text>

      {/* Email Button */}
      <ContactButton
        icon={faEnvelope}
        iconColor="$blue500"
        label={t('home.contact.email')}
        onPress={handleEmail}
        accessibilityLabel={t('home.contact.emailLabel')}
        accessibilityHint={t('home.contact.emailHint')}
        testID="contact-email-button"
      />

      {/* LinkedIn Button */}
      <ContactButton
        icon={faLinkedin}
        iconColor="$blue700"
        label={t('home.contact.linkedin')}
        onPress={handleLinkedIn}
        accessibilityLabel={t('home.contact.linkedinLabel')}
        accessibilityHint={t('home.contact.linkedinHint')}
        testID="contact-linkedin-button"
      />

      {/* Phone Button */}
      <ContactButton
        icon={faPhone}
        iconColor="$green600"
        label={t('home.contact.phone')}
        onPress={handlePhone}
        accessibilityLabel={t('home.contact.phoneLabel')}
        accessibilityHint={t('home.contact.phoneHint')}
        testID="contact-phone-button"
      />

      {/* Divider */}
      <Divider my="$2" />

      {/* Book a Call Button */}
      <ContactButton
        icon={faCalendar}
        iconColor="$pink700"
        label={t('home.contact.bookCall')}
        onPress={handleBookCall}
        accessibilityLabel={t('home.contact.bookCallLabel')}
        accessibilityHint={t('home.contact.bookCallHint')}
        testID="contact-book-call-button"
        showChevron
      />

      {/* My Bookings Button */}
      <ContactButton
        icon={faListCheck}
        iconColor="$blue500"
        label={t('home.contact.myBookings')}
        onPress={handleMyBookings}
        accessibilityLabel={t('home.contact.myBookingsLabel')}
        accessibilityHint={t('home.contact.myBookingsHint')}
        testID="contact-my-bookings-button"
        showChevron
      />
    </VStack>
  );
};

interface ContactButtonProps {
  icon: any;  // FontAwesome icon
  iconColor: string;  // GlueStack token
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID?: string;
  showChevron?: boolean;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  icon,
  iconColor,
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  showChevron = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      bg="$backgroundLight50"
      _dark={{ bg: '$backgroundDark900' }}
      borderWidth="$1"
      borderColor="$borderLight300"
      _dark={{ borderColor: '$borderDark700' }}
      borderRadius="$lg"
      p="$4"
      minHeight="$12"
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      // Hover/press states
      _pressed={{
        bg: '$backgroundLight100',
        _dark: { bg: '$backgroundDark800' },
      }}
    >
      <HStack alignItems="center" justifyContent="space-between">
        <HStack space="$3" alignItems="center" flex={1}>
          {/* Icon */}
          <FontAwesomeIcon
            icon={icon}
            size={20}
            color={iconColor}
            testID={`${testID}-icon`}
          />

          {/* Label */}
          <Text
            fontSize="$md"
            fontWeight="$medium"
            color="$textLight950"
            _dark={{ color: '$textDark50' }}
            flex={1}
            testID={`${testID}-label`}
          >
            {label}
          </Text>
        </HStack>

        {/* Chevron (optional) */}
        {showChevron && (
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="$textLight400"
            testID={`${testID}-chevron`}
          />
        )}
      </HStack>
    </Pressable>
  );
};
```

### Code Example: HomeScreen.tsx Integration

```typescript
import React from 'react';
import { ScrollView, VStack } from '@gluestack-ui/themed';
import { ContactSection } from './components/ContactSection';
// ... other imports

export const HomeScreen: React.FC = () => {
  return (
    <ScrollView
      bg="$backgroundLight0"
      _dark={{ bg: '$backgroundDark0' }}
      testID="home-screen"
    >
      <VStack space="$8" p="$6">
        {/* ... existing sections (hero, about, etc.) */}

        {/* Contact Section */}
        <ContactSection />

        {/* ... other sections */}
      </VStack>
    </ScrollView>
  );
};
```

### i18n Translation Keys

**Add to all locale files** (`en.json`, `es.json`, `ca.json`, `pl.json`, `tl.json`):

```json
{
  "home": {
    "contact": {
      "title": "Contact Warren",
      "email": "warren@warrendeleon.com",
      "emailLabel": "Email Warren",
      "emailHint": "Opens your email app to send a message",
      "linkedin": "LinkedIn",
      "linkedinLabel": "View Warren's LinkedIn profile",
      "linkedinHint": "Opens LinkedIn in your browser or app",
      "phone": "+44 7700 900 000",
      "phoneLabel": "Call Warren",
      "phoneHint": "Opens your phone dialler to call Warren",
      "bookCall": "Book a Call",
      "bookCallLabel": "Book a call with Warren",
      "bookCallHint": "Opens booking form to schedule a video or phone call",
      "myBookings": "My Bookings",
      "myBookingsLabel": "View your bookings",
      "myBookingsHint": "View your upcoming and past bookings with Warren"
    }
  }
}
```

**Spanish** (`es.json`):

```json
{
  "home": {
    "contact": {
      "title": "Contactar con Warren",
      "email": "warren@warrendeleon.com",
      "emailLabel": "Enviar correo a Warren",
      "emailHint": "Abre tu aplicación de correo para enviar un mensaje",
      "linkedin": "LinkedIn",
      "linkedinLabel": "Ver perfil de LinkedIn de Warren",
      "linkedinHint": "Abre LinkedIn en tu navegador o aplicación",
      "phone": "+44 7700 900 000",
      "phoneLabel": "Llamar a Warren",
      "phoneHint": "Abre tu marcador telefónico para llamar a Warren",
      "bookCall": "Reservar una Llamada",
      "bookCallLabel": "Reservar una llamada con Warren",
      "bookCallHint": "Abre el formulario de reserva para programar una videollamada o llamada telefónica",
      "myBookings": "Mis Reservas",
      "myBookingsLabel": "Ver tus reservas",
      "myBookingsHint": "Ver tus reservas próximas y pasadas con Warren"
    }
  }
}
```

**Catalan** (`ca.json`):

```json
{
  "home": {
    "contact": {
      "title": "Contactar amb Warren",
      "email": "warren@warrendeleon.com",
      "emailLabel": "Enviar correu a Warren",
      "emailHint": "Obre la teva aplicació de correu per enviar un missatge",
      "linkedin": "LinkedIn",
      "linkedinLabel": "Veure perfil de LinkedIn de Warren",
      "linkedinHint": "Obre LinkedIn al teu navegador o aplicació",
      "phone": "+44 7700 900 000",
      "phoneLabel": "Trucar a Warren",
      "phoneHint": "Obre el teu marcador telefònic per trucar a Warren",
      "bookCall": "Reservar una Trucada",
      "bookCallLabel": "Reservar una trucada amb Warren",
      "bookCallHint": "Obre el formulari de reserva per programar una videotrucada o trucada telefònica",
      "myBookings": "Les Meves Reserves",
      "myBookingsLabel": "Veure les teves reserves",
      "myBookingsHint": "Veure les teves reserves properes i passades amb Warren"
    }
  }
}
```

**Polish** (`pl.json`):

```json
{
  "home": {
    "contact": {
      "title": "Kontakt z Warren",
      "email": "warren@warrendeleon.com",
      "emailLabel": "Wyślij email do Warren",
      "emailHint": "Otwiera aplikację e-mail, aby wysłać wiadomość",
      "linkedin": "LinkedIn",
      "linkedinLabel": "Zobacz profil Warren na LinkedIn",
      "linkedinHint": "Otwiera LinkedIn w przeglądarce lub aplikacji",
      "phone": "+44 7700 900 000",
      "phoneLabel": "Zadzwoń do Warren",
      "phoneHint": "Otwiera telefon, aby zadzwonić do Warren",
      "bookCall": "Zarezerwuj Rozmowę",
      "bookCallLabel": "Zarezerwuj rozmowę z Warren",
      "bookCallHint": "Otwiera formularz rezerwacji, aby zaplanować wideorozmowę lub rozmowę telefoniczną",
      "myBookings": "Moje Rezerwacje",
      "myBookingsLabel": "Zobacz swoje rezerwacje",
      "myBookingsHint": "Zobacz nadchodzące i przeszłe rezerwacje z Warren"
    }
  }
}
```

**Tagalog** (`tl.json`):

```json
{
  "home": {
    "contact": {
      "title": "Makipag-ugnayan kay Warren",
      "email": "warren@warrendeleon.com",
      "emailLabel": "Mag-email kay Warren",
      "emailHint": "Buksan ang iyong email app para magpadala ng mensahe",
      "linkedin": "LinkedIn",
      "linkedinLabel": "Tingnan ang LinkedIn profile ni Warren",
      "linkedinHint": "Buksan ang LinkedIn sa iyong browser o app",
      "phone": "+44 7700 900 000",
      "phoneLabel": "Tawagan si Warren",
      "phoneHint": "Buksan ang iyong phone dialer para tawagan si Warren",
      "bookCall": "Mag-book ng Tawag",
      "bookCallLabel": "Mag-book ng tawag kay Warren",
      "bookCallHint": "Buksan ang booking form para mag-iskedyul ng video o phone call",
      "myBookings": "Aking mga Booking",
      "myBookingsLabel": "Tingnan ang iyong mga booking",
      "myBookingsHint": "Tingnan ang iyong paparating at nakaraang mga booking kay Warren"
    }
  }
}
```

---

## Testing Requirements

### RNTL Tests (100% Coverage Required)

**Test File**: `ContactSection.test.tsx`

```typescript
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
import { ContactSection } from './ContactSection';
import { Linking } from 'react-native';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('ContactSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders section title', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-section-title')).toHaveTextContent('Contact Warren');
    });

    it('renders all contact buttons', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-email-button')).toBeTruthy();
      expect(screen.getByTestId('contact-linkedin-button')).toBeTruthy();
      expect(screen.getByTestId('contact-phone-button')).toBeTruthy();
      expect(screen.getByTestId('contact-book-call-button')).toBeTruthy();
      expect(screen.getByTestId('contact-my-bookings-button')).toBeTruthy();
    });

    it('renders divider between contact methods and booking buttons', () => {
      renderWithProviders(<ContactSection />);

      // Divider should exist between phone and book call buttons
      const divider = screen.UNSAFE_getAllByType('Divider');
      expect(divider.length).toBeGreaterThan(0);
    });
  });

  describe('Book a Call Button', () => {
    it('renders with correct label', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-book-call-button-label')).toHaveTextContent('Book a Call');
    });

    it('renders with calendar icon', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-book-call-button-icon')).toBeTruthy();
    });

    it('renders chevron icon', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-book-call-button-chevron')).toBeTruthy();
    });

    it('navigates to BookingSelectType when pressed', () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-book-call-button');
      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith('BookingSelectType');
    });

    it('has correct accessibility labels', () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-book-call-button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Book a call with Warren');
      expect(button.props.accessibilityHint).toBe('Opens booking form to schedule a video or phone call');
    });

    it('has minimum touch target height (48pt)', () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-book-call-button');
      expect(button.props.minHeight).toBe('$12');  // $12 = 48pt
    });
  });

  describe('My Bookings Button', () => {
    it('renders with correct label', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-my-bookings-button-label')).toHaveTextContent('My Bookings');
    });

    it('renders with list check icon', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-my-bookings-button-icon')).toBeTruthy();
    });

    it('renders chevron icon', () => {
      renderWithProviders(<ContactSection />);

      expect(screen.getByTestId('contact-my-bookings-button-chevron')).toBeTruthy();
    });

    it('logs "Coming soon" when pressed (placeholder)', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-my-bookings-button');
      fireEvent.press(button);

      expect(consoleSpy).toHaveBeenCalledWith('My Bookings - Coming soon');

      consoleSpy.mockRestore();
    });

    it('has correct accessibility labels', () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-my-bookings-button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('View your bookings');
      expect(button.props.accessibilityHint).toBe('View your upcoming and past bookings with Warren');
    });

    it('has minimum touch target height (48pt)', () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-my-bookings-button');
      expect(button.props.minHeight).toBe('$12');  // $12 = 48pt
    });
  });

  describe('Existing Contact Buttons', () => {
    it('opens email app when email button pressed', async () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-email-button');
      fireEvent.press(button);

      expect(Linking.openURL).toHaveBeenCalledWith('mailto:warren@warrendeleon.com');
    });

    it('opens LinkedIn when LinkedIn button pressed', async () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-linkedin-button');
      fireEvent.press(button);

      expect(Linking.openURL).toHaveBeenCalledWith('https://linkedin.com/in/warrendeleon');
    });

    it('opens phone dialler when phone button pressed', async () => {
      renderWithProviders(<ContactSection />);

      const button = screen.getByTestId('contact-phone-button');
      fireEvent.press(button);

      expect(Linking.openURL).toHaveBeenCalledWith('tel:+447700900000');
    });
  });

  describe('i18n', () => {
    it('renders Spanish translations', () => {
      renderWithProviders(<ContactSection />, { locale: 'es' });

      expect(screen.getByTestId('contact-book-call-button-label')).toHaveTextContent('Reservar una Llamada');
      expect(screen.getByTestId('contact-my-bookings-button-label')).toHaveTextContent('Mis Reservas');
    });

    it('renders Catalan translations', () => {
      renderWithProviders(<ContactSection />, { locale: 'ca' });

      expect(screen.getByTestId('contact-book-call-button-label')).toHaveTextContent('Reservar una Trucada');
      expect(screen.getByTestId('contact-my-bookings-button-label')).toHaveTextContent('Les Meves Reserves');
    });
  });
});
```

**Test Coverage Targets**:

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

---

## Storybook Stories

**Test File**: `ContactSection.stories.tsx`

```typescript
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ContactSection } from './ContactSection';
import { NavigationDecorator } from '@app/.storybook/decorators/NavigationDecorator';

const meta: Meta<typeof ContactSection> = {
  title: 'Features/Home/ContactSection',
  component: ContactSection,
  decorators: [NavigationDecorator],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof ContactSection>;

export const Default: Story = {};

export const LightMode: Story = {
  parameters: {
    theme: 'light',
  },
};

export const DarkMode: Story = {
  parameters: {
    theme: 'dark',
  },
};

export const Spanish: Story = {
  parameters: {
    locale: 'es',
  },
};

export const Catalan: Story = {
  parameters: {
    locale: 'ca',
  },
};
```

---

## Acceptance Criteria

**Rendering**:

- [ ] "Book a Call" button renders with calendar icon (pink.700)
- [ ] "My Bookings" button renders with list check icon (blue.500)
- [ ] Both buttons display chevron icons on right
- [ ] Divider separates contact methods from booking buttons
- [ ] All buttons have consistent styling (padding, border radius, etc.)

**Navigation**:

- [ ] "Book a Call" navigates to `BookingSelectType` screen
- [ ] "My Bookings" logs "Coming soon" (placeholder for future implementation)

**EAA Compliance**:

- [ ] Both buttons have `minHeight="$12"` (48pt)
- [ ] Both buttons have `accessibilityRole="button"`
- [ ] Both buttons have descriptive `accessibilityLabel`
- [ ] Both buttons have helpful `accessibilityHint`
- [ ] Icon-text contrast meets 4.5:1 minimum

**i18n**:

- [ ] All translation keys defined in 5 languages (en, es, ca, pl, tl)
- [ ] Labels render correctly in all languages
- [ ] Accessibility labels/hints render correctly in all languages

**Testing**:

- [ ] 100% RNTL coverage achieved
- [ ] Storybook stories render in light/dark modes
- [ ] Snapshot tests pass

---

## Dependencies

**Blocked By**:

- None (can start immediately)

**Depends On**:

- TASK-349 (BookingSelectType screen) - for navigation target

**Blocks**:

- None

---

## Implementation Checklist

**Component Creation**:

- [ ] Create `src/features/Home/components/ContactSection/` directory
- [ ] Create `ContactSection.tsx` component
- [ ] Create `ContactButton` sub-component
- [ ] Export from `index.ts`

**Home Screen Integration**:

- [ ] Import `ContactSection` in `HomeScreen.tsx`
- [ ] Replace existing contact buttons with `ContactSection`
- [ ] Verify layout/spacing matches design

**i18n Translations**:

- [ ] Add `home.contact.bookCall*` keys to `en.json`
- [ ] Add `home.contact.myBookings*` keys to `en.json`
- [ ] Translate to Spanish (`es.json`)
- [ ] Translate to Catalan (`ca.json`)
- [ ] Translate to Polish (`pl.json`)
- [ ] Translate to Tagalog (`tl.json`)

**Navigation Setup**:

- [ ] Implement `handleBookCall` navigation to `BookingSelectType`
- [ ] Implement `handleMyBookings` placeholder (console.log)
- [ ] Verify navigation works correctly

**EAA Compliance**:

- [ ] Add `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` to both buttons
- [ ] Set `minHeight="$12"` on both buttons
- [ ] Verify touch targets meet 48pt minimum
- [ ] Test with VoiceOver/TalkBack

**Testing**:

- [ ] Write RNTL tests (100% coverage)
- [ ] Write Storybook stories (light/dark modes, i18n)
- [ ] Run `yarn test:coverage` and verify 100%
- [ ] Manual test navigation

**Validation**:

- [ ] Run `yarn validate` (0 errors)
- [ ] Visual QA on iOS simulator
- [ ] Visual QA on Android emulator
- [ ] Test in all 5 languages

---

## Notes

**Design Consistency**:

- Buttons match existing Home screen contact buttons
- Icons use consistent sizing (20pt)
- Spacing matches existing sections ($6 section gap, $3 button gap)

**Future "My Bookings" Implementation**:

- Currently a placeholder (console.log)
- Will be implemented in future user story (US-065 or similar)
- Navigation call is commented out, ready to uncomment when screen exists

**Icon Choices**:

- `faCalendar` (pink.700): Universal symbol for booking/scheduling
- `faListCheck` (blue.500): Represents list of completed/upcoming items

**Divider Usage**:

- Optional divider separates "contact methods" from "booking actions"
- Provides visual grouping
- Can be removed if design feels cluttered

**Future Enhancements**:

- Add badge to "My Bookings" showing upcoming bookings count
- Add skeleton loading state while fetching bookings
- Add "New" badge to "Book a Call" button during initial launch period
