# TASK-368: Home Screen Contact Entry Points

**Epic**: EPIC-022: Login & Session Management (Prerequisite)
**User Story**: Pre-Auth Navigation Setup
**Status**: ✅ Done
**Effort**: 3h
**Priority**: P0 (Critical Path - Blocks Login Epic)
**Assigned To**: Warren
**Created**: 2025-11-26

---

## Overview

Add "Contact me" and "Book a Call" entry point buttons to the Home screen. These buttons navigate to placeholder screens that will later require authentication. This task is a prerequisite for EPIC-022 (Login & Session Management) as it establishes the screens that will be protected by login guards.

**Key Difference from TASK-356**: TASK-356 covers "Book a Call" + "My Bookings" buttons (booking-focused, post-auth). This task creates "Contact me" + "Book a Call" buttons (contact-focused, pre-auth placeholder setup).

---

## Requirements

### Functional Requirements

**New Button Group on Home Screen**:

- Add a new "Contact Warren" section below existing groups
- Two buttons in the group:
  1. "Contact me" - navigates to ChatPlaceholderScreen
  2. "Book a Call" - navigates to BookingPlaceholderScreen

**"Contact me" Button**:

- Label: `t('home.contact.contactMe')` ("Contact me")
- Icon: `message-text` from MaterialCommunityIcons
- Icon background colour: `#34C759` (green)
- Action: Navigate to `ChatPlaceholder` screen
- testID: `home-contact-me-button`

**"Book a Call" Button**:

- Label: `t('home.contact.bookCall')` ("Book a Call")
- Icon: `calendar-clock` from MaterialCommunityIcons
- Icon background colour: `#FF2D55` (pink)
- Action: Navigate to `BookingPlaceholder` screen
- testID: `home-book-call-button`

**Placeholder Screens**:

Both screens should display:

- A centred icon representing the feature
- Feature title
- "Coming soon" message
- Brief description of what the feature will offer
- EAA-compliant accessibility props

### Non-Functional Requirements

**EAA Compliance**:

- All buttons: `minHeight="$12"` (48pt touch targets)
- `accessibilityRole="button"`
- `accessibilityLabel` with clear description
- `accessibilityHint` explaining action
- Placeholder screens: `accessibilityLabel` on container

**i18n Translations**:

Required for all 5 languages (en, es, ca, pl, tl):

- `home.contact.title` - "Contact Warren"
- `home.contact.contactMe` - "Contact me"
- `home.contact.bookCall` - "Book a Call"
- `placeholder.chat.title` - "Chat"
- `placeholder.chat.comingSoon` - "Coming soon"
- `placeholder.chat.description` - "Chat directly with Warren"
- `placeholder.booking.title` - "Book a Call"
- `placeholder.booking.comingSoon` - "Coming soon"
- `placeholder.booking.description` - "Schedule a video or phone call with Warren"

---

## Design Specifications

### Home Screen - New Section

```
┌─────────────────────────────────────────────┐
│                 Home Screen                  │
├─────────────────────────────────────────────┤
│                                             │
│  [ProfileCard]                              │
│                                             │
│  WORK & LEARNING                            │
│  ┌─────────────────────────────────────┐    │
│  │ 💼 Work Experience                   │    │
│  │ 🎓 Education                         │    │
│  │ 📄 CV                                │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  CONTACT WARREN                   ← NEW     │
│  ┌─────────────────────────────────────┐    │
│  │ 💬 Contact me              (green)  │    │
│  │ 📅 Book a Call             (pink)   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  SETTINGS                                   │
│  ┌─────────────────────────────────────┐    │
│  │ 🐙 GitHub                            │    │
│  │ ⚙️ Settings                          │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Placeholder Screen Layout

```
┌─────────────────────────────────────────────┐
│  ← Back           Chat Placeholder          │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│                                             │
│                    💬                       │
│                                             │
│                  Chat                       │
│                                             │
│              Coming soon                    │
│                                             │
│     Chat directly with Warren.             │
│     Send messages and receive              │
│     replies in real-time.                  │
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Technical Implementation

### Files to Create

1. `src/features/Placeholder/ChatPlaceholderScreen.tsx`
2. `src/features/Placeholder/BookingPlaceholderScreen.tsx`
3. `src/features/Placeholder/index.ts`

### Files to Modify

1. `src/features/Home/HomeScreen.tsx` - Add contact button group
2. `src/features/index.ts` - Export placeholder screens
3. `src/navigation/RootNavigator/RootNavigator.tsx` - Add routes
4. `src/i18n/locales/en.json` - Add translations
5. `src/i18n/locales/es.json` - Add translations
6. `src/i18n/locales/ca.json` - Add translations
7. `src/i18n/locales/pl.json` - Add translations
8. `src/i18n/locales/tl.json` - Add translations

### Code Example: ChatPlaceholderScreen.tsx

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, VStack } from '@gluestack-ui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppColorScheme } from '@app/hooks';

export const ChatPlaceholderScreen: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box
      flex={1}
      bg={isDark ? '$black' : '$coolGray100'}
      justifyContent="center"
      alignItems="center"
      p="$6"
      testID="chat-placeholder-screen"
      accessibilityLabel={t('placeholder.chat.title')}
    >
      <VStack space="$4" alignItems="center">
        <Box
          bg="$green500"
          p="$6"
          borderRadius="$full"
          accessibilityElementsHidden
        >
          <MaterialCommunityIcons
            name="message-text"
            size={48}
            color="#FFFFFF"
          />
        </Box>

        <Text
          fontSize="$2xl"
          fontWeight="$bold"
          color={isDark ? '$white' : '$black'}
          testID="chat-placeholder-title"
        >
          {t('placeholder.chat.title')}
        </Text>

        <Text
          fontSize="$lg"
          color="$coolGray500"
          testID="chat-placeholder-coming-soon"
        >
          {t('placeholder.chat.comingSoon')}
        </Text>

        <Text
          fontSize="$md"
          color={isDark ? '$coolGray400' : '$coolGray600'}
          textAlign="center"
          maxWidth="$80"
          testID="chat-placeholder-description"
        >
          {t('placeholder.chat.description')}
        </Text>
      </VStack>
    </Box>
  );
};
```

### Code Example: HomeScreen.tsx Addition

```typescript
// Add to imports
import { handleContactMePress, handleBookCallPress } from './handlers';

// Add handlers
export const handleContactMePress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('ChatPlaceholder');
};

export const handleBookCallPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('BookingPlaceholder');
};

// Add in component
const handleContactMe = useCallback(() => {
  handleContactMePress(navigation);
}, [navigation]);

const handleBookCall = useCallback(() => {
  handleBookCallPress(navigation);
}, [navigation]);

const contactItems: SettingsGroupItem[] = useMemo(
  () => [
    {
      label: t('home.contact.contactMe'),
      onPress: handleContactMe,
      startIcon: createIconComponent('message-text'),
      startIconBgColor: '#34C759',
      testID: 'home-contact-me-button',
    },
    {
      label: t('home.contact.bookCall'),
      onPress: handleBookCall,
      startIcon: createIconComponent('calendar-clock'),
      startIconBgColor: '#FF2D55',
      testID: 'home-book-call-button',
    },
  ],
  [t, handleContactMe, handleBookCall]
);
```

### i18n Translations

**English (en.json)**:

```json
{
  "home": {
    "contact": {
      "title": "Contact Warren",
      "contactMe": "Contact me",
      "bookCall": "Book a Call"
    }
  },
  "placeholder": {
    "chat": {
      "title": "Chat",
      "comingSoon": "Coming soon",
      "description": "Chat directly with Warren. Send messages and receive replies in real-time."
    },
    "booking": {
      "title": "Book a Call",
      "comingSoon": "Coming soon",
      "description": "Schedule a video or phone call with Warren at a time that works for you."
    }
  }
}
```

**Spanish (es.json)**:

```json
{
  "home": {
    "contact": {
      "title": "Contactar con Warren",
      "contactMe": "Contactarme",
      "bookCall": "Reservar una llamada"
    }
  },
  "placeholder": {
    "chat": {
      "title": "Chat",
      "comingSoon": "Próximamente",
      "description": "Chatea directamente con Warren. Envía mensajes y recibe respuestas en tiempo real."
    },
    "booking": {
      "title": "Reservar una llamada",
      "comingSoon": "Próximamente",
      "description": "Programa una videollamada o llamada telefónica con Warren en el momento que te convenga."
    }
  }
}
```

---

## Acceptance Criteria

**Home Screen**:

- [x] "Contact Warren" section appears below "Work & Learning"
- [x] "Contact me" button renders with chat icon (green background)
- [x] "Book a Call" button renders with calendar-clock icon (pink background)
- [x] Both buttons navigate to their respective placeholder screens
- [x] Both buttons have EAA-compliant accessibility props
- [x] Both buttons have correct testIDs

**Placeholder Screens**:

- [x] ChatPlaceholderScreen displays icon, title, "Coming soon", and description
- [x] BookingPlaceholderScreen displays icon, title, "Coming soon", and description
- [x] Both screens support dark mode
- [x] Both screens have EAA-compliant accessibility props
- [x] Both screens have correct testIDs

**Navigation**:

- [x] `ChatPlaceholder` route added to RootStackParamList
- [x] `BookingPlaceholder` route added to RootStackParamList
- [x] Back navigation works correctly from placeholder screens

**i18n**:

- [x] All translation keys added to en.json
- [x] All translation keys translated to es.json
- [x] All translation keys translated to ca.json
- [x] All translation keys translated to pl.json
- [x] All translation keys translated to tl.json

**Validation**:

- [x] `yarn typecheck` passes with 0 errors
- [x] `yarn lint` passes with 0 warnings
- [x] `yarn test` passes with 0 failures
- [x] `yarn validate` passes completely

---

## Dependencies

**Blocked By**:

- None (can start immediately)

**Blocks**:

- EPIC-022 (Login & Session Management) - These screens will be protected by auth guards
- TASK-333 (AuthContext with Redux Integration) - Auth guards will protect these routes

---

## Notes

**Why Placeholder Screens?**

1. Establishes navigation routes for auth protection
2. Provides visual feedback that features are coming
3. Allows login epic to implement route guards without waiting for full feature implementation
4. Clean separation between auth infrastructure and feature development

**Future Integration**:

- ChatPlaceholderScreen will be replaced by ChatScreen (EPIC-025)
- BookingPlaceholderScreen will be replaced by BookingSelectTypeScreen (EPIC-031)
- Auth guards from EPIC-022 will protect both screens

---

**Last Updated**: 2025-11-26
**Completed**: 2025-11-26
