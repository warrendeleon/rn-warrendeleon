# TASK-357: i18n Translations for Booking Flow

**Epic**: EPIC-031: Book a Call
**User Story**: US-064: Booking Confirmation & Navigation
**Status**: 📋 To Do
**Effort**: 2h
**Priority**: P0 (Critical Path)
**Assigned To**: Warren
**Created**: 2025-11-26

---

## Overview

Add all required i18n translations for the complete booking flow across 5 languages (English, Spanish, Catalan, Polish, Tagalog). Includes all screens (SelectType, SelectDuration, Calendar, Details, Confirmation), error messages, validation messages, and accessibility labels. Must follow British English conventions and maintain natural, conversational tone across all languages.

---

## Requirements

### Functional Requirements

**Languages Supported**:

- English (UK) - `en.json` (primary)
- Spanish - `es.json`
- Catalan - `ca.json`
- Polish - `pl.json`
- Tagalog - `tl.json`

**Translation Scope**:

- All booking screen titles and subtitles
- All button labels
- All form field labels and placeholders
- All validation error messages
- All success/error toast messages
- All accessibility labels and hints
- All calendar date/time formatting
- All confirmation messages

**Translation Quality**:

- Natural, conversational tone (not robotic)
- British English spelling (colour, optimise, etc.)
- Contextually appropriate (formal vs informal)
- Culturally sensitive
- Gender-neutral where applicable

### Non-Functional Requirements

**Consistency**:

- Consistent terminology across all screens
- Consistent punctuation and formatting
- Consistent tone of voice

**Maintainability**:

- Organised by feature (booking.\*)
- Descriptive key names
- Comments for complex strings

**Testing**:

- Verify all keys exist in all 5 language files
- Verify no missing translations
- Verify no placeholder text ("TODO", "[TRANSLATE]")
- Visual QA in all languages

---

## Translation Keys Structure

**Namespace**: `booking.*`

**Key Structure**:

```
booking.
├── selectType.               # Select Call Type screen
├── selectDuration.           # Select Duration screen
├── calendar.                 # Calendar screen
├── details.                  # Booking Details screen
├── confirmation.             # Confirmation screen
├── validation.               # Form validation errors
├── errors.                   # API/system errors
└── common.                   # Shared strings
```

---

## Complete Translation Table

### English (UK) - `en.json`

```json
{
  "booking": {
    "selectType": {
      "title": "Book a Call",
      "subtitle": "Choose how you'd like to connect with Warren",
      "videoCard": {
        "title": "Video Call",
        "description": "Face-to-face conversation via Google Meet",
        "features": [
          "Screen sharing available",
          "Record session (optional)",
          "Visual aids and demos"
        ]
      },
      "phoneCard": {
        "title": "Phone Call",
        "description": "Traditional voice call",
        "features": ["Warren calls you", "No internet required", "Perfect for on-the-go"]
      },
      "nextButton": "Continue"
    },
    "selectDuration": {
      "title": "Select Duration",
      "subtitle": "How long would you like to chat?",
      "duration30": "30 minutes",
      "duration30Description": "Quick chat or focused discussion",
      "duration60": "60 minutes",
      "duration60Description": "In-depth conversation or consultation",
      "nextButton": "Continue"
    },
    "calendar": {
      "title": "Choose Date & Time",
      "subtitle": "Select a time that works for you",
      "loading": "Loading availability...",
      "noAvailability": "No available slots for this day",
      "selectDate": "Select a date",
      "selectTime": "Select a time",
      "timezone": "Times shown in {{timezone}}",
      "nextButton": "Continue",
      "errorLoading": "Failed to load availability. Please try again."
    },
    "details": {
      "title": "Your Details",
      "subtitle": "Tell Warren a bit about yourself",
      "nameLabel": "Full Name",
      "namePlaceholder": "Your name",
      "emailLabel": "Email Address",
      "emailPlaceholder": "your@email.com",
      "phoneLabel": "Phone Number",
      "phonePlaceholder": "+44 7700 900000",
      "phoneHint": "Warren will call you at this number",
      "messageLabel": "Message (Optional)",
      "messagePlaceholder": "What would you like to discuss?",
      "summaryTitle": "Booking Summary",
      "summaryDate": "Date",
      "summaryTime": "Time",
      "summaryDuration": "Duration",
      "summaryCallType": "Call Type",
      "confirmButton": "Confirm Booking",
      "confirmingButton": "Confirming..."
    },
    "confirmation": {
      "title": "Booking Confirmed!",
      "subtitleVideo": "Your video call is scheduled",
      "subtitlePhone": "Your phone call is scheduled",
      "summaryTitle": "Booking Details",
      "videoTitle": "Join with Google Meet:",
      "videoCopyLink": "Copy",
      "videoJoinButton": "Join Meeting",
      "videoLinkCopied": "Link copied to clipboard",
      "phoneMessage": "Warren will call you at:",
      "phoneAlternative": "Or call Warren directly:",
      "phoneCallButton": "📞 Call Warren",
      "addToCalendarButton": "📥 Add to Calendar",
      "addToCalendarSuccess": "Added to calendar",
      "addToCalendarError": "Failed to add to calendar",
      "doneButton": "Done"
    },
    "validation": {
      "nameRequired": "Name is required",
      "nameMin": "Name must be at least 2 characters",
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "phoneRequired": "Phone number is required",
      "phoneInvalid": "Please enter a valid phone number",
      "dateRequired": "Please select a date",
      "timeRequired": "Please select a time"
    },
    "errors": {
      "bookingFailed": "Booking failed. Please try again.",
      "networkError": "Network error. Check your connection and try again.",
      "serverError": "Server error. Please try again later.",
      "cannotOpenLink": "Cannot open meeting link",
      "cannotOpenDialler": "Cannot open phone dialler"
    },
    "common": {
      "backButton": "Back",
      "cancelButton": "Cancel",
      "videoCall": "Video Call",
      "phoneCall": "Phone Call",
      "minutes": "{{count}} minutes",
      "loading": "Loading..."
    }
  }
}
```

### Spanish - `es.json`

```json
{
  "booking": {
    "selectType": {
      "title": "Reservar una Llamada",
      "subtitle": "Elige cómo te gustaría conectarte con Warren",
      "videoCard": {
        "title": "Videollamada",
        "description": "Conversación cara a cara mediante Google Meet",
        "features": [
          "Compartir pantalla disponible",
          "Grabar sesión (opcional)",
          "Ayudas visuales y demos"
        ]
      },
      "phoneCard": {
        "title": "Llamada Telefónica",
        "description": "Llamada de voz tradicional",
        "features": ["Warren te llama", "No requiere internet", "Perfecto para estar en movimiento"]
      },
      "nextButton": "Continuar"
    },
    "selectDuration": {
      "title": "Seleccionar Duración",
      "subtitle": "¿Cuánto tiempo te gustaría charlar?",
      "duration30": "30 minutos",
      "duration30Description": "Charla rápida o discusión enfocada",
      "duration60": "60 minutos",
      "duration60Description": "Conversación profunda o consulta",
      "nextButton": "Continuar"
    },
    "calendar": {
      "title": "Elegir Fecha y Hora",
      "subtitle": "Selecciona una hora que te funcione",
      "loading": "Cargando disponibilidad...",
      "noAvailability": "No hay horarios disponibles para este día",
      "selectDate": "Selecciona una fecha",
      "selectTime": "Selecciona una hora",
      "timezone": "Horarios mostrados en {{timezone}}",
      "nextButton": "Continuar",
      "errorLoading": "Error al cargar disponibilidad. Inténtalo de nuevo."
    },
    "details": {
      "title": "Tus Datos",
      "subtitle": "Cuéntale a Warren un poco sobre ti",
      "nameLabel": "Nombre Completo",
      "namePlaceholder": "Tu nombre",
      "emailLabel": "Correo Electrónico",
      "emailPlaceholder": "tu@correo.com",
      "phoneLabel": "Número de Teléfono",
      "phonePlaceholder": "+34 600 000 000",
      "phoneHint": "Warren te llamará a este número",
      "messageLabel": "Mensaje (Opcional)",
      "messagePlaceholder": "¿Qué te gustaría discutir?",
      "summaryTitle": "Resumen de Reserva",
      "summaryDate": "Fecha",
      "summaryTime": "Hora",
      "summaryDuration": "Duración",
      "summaryCallType": "Tipo de Llamada",
      "confirmButton": "Confirmar Reserva",
      "confirmingButton": "Confirmando..."
    },
    "confirmation": {
      "title": "¡Reserva Confirmada!",
      "subtitleVideo": "Tu videollamada está programada",
      "subtitlePhone": "Tu llamada telefónica está programada",
      "summaryTitle": "Detalles de la Reserva",
      "videoTitle": "Únete con Google Meet:",
      "videoCopyLink": "Copiar",
      "videoJoinButton": "Unirse a la Reunión",
      "videoLinkCopied": "Enlace copiado al portapapeles",
      "phoneMessage": "Warren te llamará al:",
      "phoneAlternative": "O llama directamente a Warren:",
      "phoneCallButton": "📞 Llamar a Warren",
      "addToCalendarButton": "📥 Añadir al Calendario",
      "addToCalendarSuccess": "Añadido al calendario",
      "addToCalendarError": "Error al añadir al calendario",
      "doneButton": "Hecho"
    },
    "validation": {
      "nameRequired": "El nombre es obligatorio",
      "nameMin": "El nombre debe tener al menos 2 caracteres",
      "emailRequired": "El correo electrónico es obligatorio",
      "emailInvalid": "Por favor, introduce un correo electrónico válido",
      "phoneRequired": "El número de teléfono es obligatorio",
      "phoneInvalid": "Por favor, introduce un número de teléfono válido",
      "dateRequired": "Por favor, selecciona una fecha",
      "timeRequired": "Por favor, selecciona una hora"
    },
    "errors": {
      "bookingFailed": "Error en la reserva. Inténtalo de nuevo.",
      "networkError": "Error de red. Verifica tu conexión e inténtalo de nuevo.",
      "serverError": "Error del servidor. Inténtalo más tarde.",
      "cannotOpenLink": "No se puede abrir el enlace de la reunión",
      "cannotOpenDialler": "No se puede abrir el marcador telefónico"
    },
    "common": {
      "backButton": "Atrás",
      "cancelButton": "Cancelar",
      "videoCall": "Videollamada",
      "phoneCall": "Llamada Telefónica",
      "minutes": "{{count}} minutos",
      "loading": "Cargando..."
    }
  }
}
```

### Catalan - `ca.json`

```json
{
  "booking": {
    "selectType": {
      "title": "Reservar una Trucada",
      "subtitle": "Tria com t'agradaria connectar amb Warren",
      "videoCard": {
        "title": "Videotrucada",
        "description": "Conversa cara a cara mitjançant Google Meet",
        "features": [
          "Compartir pantalla disponible",
          "Gravar sessió (opcional)",
          "Ajudes visuals i demos"
        ]
      },
      "phoneCard": {
        "title": "Trucada Telefònica",
        "description": "Trucada de veu tradicional",
        "features": ["Warren et truca", "No requereix internet", "Perfect per estar en moviment"]
      },
      "nextButton": "Continuar"
    },
    "selectDuration": {
      "title": "Seleccionar Durada",
      "subtitle": "Quant de temps t'agradaria xerrar?",
      "duration30": "30 minuts",
      "duration30Description": "Xerrada ràpida o discussió enfocada",
      "duration60": "60 minuts",
      "duration60Description": "Conversa profunda o consulta",
      "nextButton": "Continuar"
    },
    "calendar": {
      "title": "Triar Data i Hora",
      "subtitle": "Selecciona una hora que et funcioni",
      "loading": "Carregant disponibilitat...",
      "noAvailability": "No hi ha horaris disponibles per aquest dia",
      "selectDate": "Selecciona una data",
      "selectTime": "Selecciona una hora",
      "timezone": "Horaris mostrats en {{timezone}}",
      "nextButton": "Continuar",
      "errorLoading": "Error en carregar disponibilitat. Torna-ho a intentar."
    },
    "details": {
      "title": "Les Teves Dades",
      "subtitle": "Explica a Warren una mica sobre tu",
      "nameLabel": "Nom Complet",
      "namePlaceholder": "El teu nom",
      "emailLabel": "Correu Electrònic",
      "emailPlaceholder": "el-teu@correu.com",
      "phoneLabel": "Número de Telèfon",
      "phonePlaceholder": "+34 600 000 000",
      "phoneHint": "Warren et trucarà a aquest número",
      "messageLabel": "Missatge (Opcional)",
      "messagePlaceholder": "Què t'agradaria discutir?",
      "summaryTitle": "Resum de Reserva",
      "summaryDate": "Data",
      "summaryTime": "Hora",
      "summaryDuration": "Durada",
      "summaryCallType": "Tipus de Trucada",
      "confirmButton": "Confirmar Reserva",
      "confirmingButton": "Confirmant..."
    },
    "confirmation": {
      "title": "Reserva Confirmada!",
      "subtitleVideo": "La teva videotrucada està programada",
      "subtitlePhone": "La teva trucada telefònica està programada",
      "summaryTitle": "Detalls de la Reserva",
      "videoTitle": "Uneix-te amb Google Meet:",
      "videoCopyLink": "Copiar",
      "videoJoinButton": "Unir-se a la Reunió",
      "videoLinkCopied": "Enllaç copiat al porta-retalls",
      "phoneMessage": "Warren et trucarà al:",
      "phoneAlternative": "O truca directament a Warren:",
      "phoneCallButton": "📞 Trucar a Warren",
      "addToCalendarButton": "📥 Afegir al Calendari",
      "addToCalendarSuccess": "Afegit al calendari",
      "addToCalendarError": "Error en afegir al calendari",
      "doneButton": "Fet"
    },
    "validation": {
      "nameRequired": "El nom és obligatori",
      "nameMin": "El nom ha de tenir almenys 2 caràcters",
      "emailRequired": "El correu electrònic és obligatori",
      "emailInvalid": "Si us plau, introdueix un correu electrònic vàlid",
      "phoneRequired": "El número de telèfon és obligatori",
      "phoneInvalid": "Si us plau, introdueix un número de telèfon vàlid",
      "dateRequired": "Si us plau, selecciona una data",
      "timeRequired": "Si us plau, selecciona una hora"
    },
    "errors": {
      "bookingFailed": "Error en la reserva. Torna-ho a intentar.",
      "networkError": "Error de xarxa. Verifica la teva connexió i torna-ho a intentar.",
      "serverError": "Error del servidor. Torna-ho a intentar més tard.",
      "cannotOpenLink": "No es pot obrir l'enllaç de la reunió",
      "cannotOpenDialler": "No es pot obrir el marcador telefònic"
    },
    "common": {
      "backButton": "Enrere",
      "cancelButton": "Cancel·lar",
      "videoCall": "Videotrucada",
      "phoneCall": "Trucada Telefònica",
      "minutes": "{{count}} minuts",
      "loading": "Carregant..."
    }
  }
}
```

### Polish - `pl.json`

```json
{
  "booking": {
    "selectType": {
      "title": "Zarezerwuj Rozmowę",
      "subtitle": "Wybierz sposób połączenia z Warren",
      "videoCard": {
        "title": "Wideorozmowa",
        "description": "Rozmowa twarzą w twarz przez Google Meet",
        "features": [
          "Udostępnianie ekranu dostępne",
          "Nagrywanie sesji (opcjonalne)",
          "Pomoce wizualne i demonstracje"
        ]
      },
      "phoneCard": {
        "title": "Rozmowa Telefoniczna",
        "description": "Tradycyjna rozmowa głosowa",
        "features": ["Warren dzwoni do Ciebie", "Nie wymaga internetu", "Idealne w podróży"]
      },
      "nextButton": "Kontynuuj"
    },
    "selectDuration": {
      "title": "Wybierz Czas Trwania",
      "subtitle": "Jak długo chciałbyś rozmawiać?",
      "duration30": "30 minut",
      "duration30Description": "Krótka rozmowa lub skoncentrowana dyskusja",
      "duration60": "60 minut",
      "duration60Description": "Dogłębna rozmowa lub konsultacja",
      "nextButton": "Kontynuuj"
    },
    "calendar": {
      "title": "Wybierz Datę i Godzinę",
      "subtitle": "Wybierz termin, który Ci odpowiada",
      "loading": "Ładowanie dostępności...",
      "noAvailability": "Brak dostępnych terminów tego dnia",
      "selectDate": "Wybierz datę",
      "selectTime": "Wybierz godzinę",
      "timezone": "Czasy wyświetlane w {{timezone}}",
      "nextButton": "Kontynuuj",
      "errorLoading": "Nie udało się załadować dostępności. Spróbuj ponownie."
    },
    "details": {
      "title": "Twoje Dane",
      "subtitle": "Powiedz Warren trochę o sobie",
      "nameLabel": "Imię i Nazwisko",
      "namePlaceholder": "Twoje imię",
      "emailLabel": "Adres Email",
      "emailPlaceholder": "twoj@email.com",
      "phoneLabel": "Numer Telefonu",
      "phonePlaceholder": "+48 600 000 000",
      "phoneHint": "Warren zadzwoni pod ten numer",
      "messageLabel": "Wiadomość (Opcjonalna)",
      "messagePlaceholder": "O czym chciałbyś porozmawiać?",
      "summaryTitle": "Podsumowanie Rezerwacji",
      "summaryDate": "Data",
      "summaryTime": "Godzina",
      "summaryDuration": "Czas Trwania",
      "summaryCallType": "Typ Rozmowy",
      "confirmButton": "Potwierdź Rezerwację",
      "confirmingButton": "Potwierdzanie..."
    },
    "confirmation": {
      "title": "Rezerwacja Potwierdzona!",
      "subtitleVideo": "Twoja wideorozmowa jest zaplanowana",
      "subtitlePhone": "Twoja rozmowa telefoniczna jest zaplanowana",
      "summaryTitle": "Szczegóły Rezerwacji",
      "videoTitle": "Dołącz przez Google Meet:",
      "videoCopyLink": "Kopiuj",
      "videoJoinButton": "Dołącz do Spotkania",
      "videoLinkCopied": "Link skopiowany do schowka",
      "phoneMessage": "Warren zadzwoni pod numer:",
      "phoneAlternative": "Lub zadzwoń bezpośrednio do Warren:",
      "phoneCallButton": "📞 Zadzwoń do Warren",
      "addToCalendarButton": "📥 Dodaj do Kalendarza",
      "addToCalendarSuccess": "Dodano do kalendarza",
      "addToCalendarError": "Nie udało się dodać do kalendarza",
      "doneButton": "Gotowe"
    },
    "validation": {
      "nameRequired": "Imię jest wymagane",
      "nameMin": "Imię musi mieć co najmniej 2 znaki",
      "emailRequired": "Email jest wymagany",
      "emailInvalid": "Wprowadź prawidłowy adres email",
      "phoneRequired": "Numer telefonu jest wymagany",
      "phoneInvalid": "Wprowadź prawidłowy numer telefonu",
      "dateRequired": "Wybierz datę",
      "timeRequired": "Wybierz godzinę"
    },
    "errors": {
      "bookingFailed": "Rezerwacja nie powiodła się. Spróbuj ponownie.",
      "networkError": "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.",
      "serverError": "Błąd serwera. Spróbuj ponownie później.",
      "cannotOpenLink": "Nie można otworzyć linku do spotkania",
      "cannotOpenDialler": "Nie można otworzyć telefonu"
    },
    "common": {
      "backButton": "Wstecz",
      "cancelButton": "Anuluj",
      "videoCall": "Wideorozmowa",
      "phoneCall": "Rozmowa Telefoniczna",
      "minutes": "{{count}} minut",
      "loading": "Ładowanie..."
    }
  }
}
```

### Tagalog - `tl.json`

```json
{
  "booking": {
    "selectType": {
      "title": "Mag-book ng Tawag",
      "subtitle": "Pumili kung paano mo gustong makipag-ugnayan kay Warren",
      "videoCard": {
        "title": "Video Call",
        "description": "Harap-harapang pag-uusap sa pamamagitan ng Google Meet",
        "features": [
          "Pwedeng mag-screen share",
          "Pwedeng i-record ang session (opsyonal)",
          "May visual aids at demos"
        ]
      },
      "phoneCard": {
        "title": "Phone Call",
        "description": "Tradisyonal na voice call",
        "features": [
          "Si Warren ang tatawag sa'yo",
          "Hindi kailangan ng internet",
          "Perpekto habang on-the-go"
        ]
      },
      "nextButton": "Magpatuloy"
    },
    "selectDuration": {
      "title": "Piliin ang Tagal",
      "subtitle": "Gaano katagal mo gustong mag-usap?",
      "duration30": "30 minuto",
      "duration30Description": "Mabilis na pag-uusap o focused discussion",
      "duration60": "60 minuto",
      "duration60Description": "Malalim na pag-uusap o consultation",
      "nextButton": "Magpatuloy"
    },
    "calendar": {
      "title": "Pumili ng Petsa at Oras",
      "subtitle": "Pumili ng oras na swak sa'yo",
      "loading": "Naglo-load ng availability...",
      "noAvailability": "Walang available na slots para sa araw na ito",
      "selectDate": "Pumili ng petsa",
      "selectTime": "Pumili ng oras",
      "timezone": "Mga oras ay ipinakikita sa {{timezone}}",
      "nextButton": "Magpatuloy",
      "errorLoading": "Hindi ma-load ang availability. Subukan ulit."
    },
    "details": {
      "title": "Ang Iyong mga Detalye",
      "subtitle": "Sabihin kay Warren ang tungkol sa'yo",
      "nameLabel": "Buong Pangalan",
      "namePlaceholder": "Ang iyong pangalan",
      "emailLabel": "Email Address",
      "emailPlaceholder": "your@email.com",
      "phoneLabel": "Numero ng Telepono",
      "phonePlaceholder": "+63 917 123 4567",
      "phoneHint": "Tatawagan ka ni Warren sa numerong ito",
      "messageLabel": "Mensahe (Opsyonal)",
      "messagePlaceholder": "Ano ang gusto mong pag-usapan?",
      "summaryTitle": "Buod ng Booking",
      "summaryDate": "Petsa",
      "summaryTime": "Oras",
      "summaryDuration": "Tagal",
      "summaryCallType": "Uri ng Tawag",
      "confirmButton": "Kumpirmahin ang Booking",
      "confirmingButton": "Kinukumpirma..."
    },
    "confirmation": {
      "title": "Nakumpirma ang Booking!",
      "subtitleVideo": "Naka-iskedyul na ang iyong video call",
      "subtitlePhone": "Naka-iskedyul na ang iyong phone call",
      "summaryTitle": "Mga Detalye ng Booking",
      "videoTitle": "Sumali gamit ang Google Meet:",
      "videoCopyLink": "Kopyahin",
      "videoJoinButton": "Sumali sa Meeting",
      "videoLinkCopied": "Nakopya na ang link sa clipboard",
      "phoneMessage": "Tatawagan ka ni Warren sa:",
      "phoneAlternative": "O tawagan si Warren nang direkta:",
      "phoneCallButton": "📞 Tawagan si Warren",
      "addToCalendarButton": "📥 Idagdag sa Calendar",
      "addToCalendarSuccess": "Naidagdag na sa calendar",
      "addToCalendarError": "Hindi maidagdag sa calendar",
      "doneButton": "Tapos Na"
    },
    "validation": {
      "nameRequired": "Kailangan ang pangalan",
      "nameMin": "Dapat hindi bababa sa 2 character ang pangalan",
      "emailRequired": "Kailangan ang email",
      "emailInvalid": "Maglagay ng valid na email address",
      "phoneRequired": "Kailangan ang numero ng telepono",
      "phoneInvalid": "Maglagay ng valid na numero ng telepono",
      "dateRequired": "Pumili ng petsa",
      "timeRequired": "Pumili ng oras"
    },
    "errors": {
      "bookingFailed": "Hindi nagtagumpay ang booking. Subukan ulit.",
      "networkError": "Network error. Tingnan ang iyong connection at subukan ulit.",
      "serverError": "Server error. Subukan ulit mamaya.",
      "cannotOpenLink": "Hindi mabuksan ang meeting link",
      "cannotOpenDialler": "Hindi mabuksan ang phone dialler"
    },
    "common": {
      "backButton": "Bumalik",
      "cancelButton": "Kanselahin",
      "videoCall": "Video Call",
      "phoneCall": "Phone Call",
      "minutes": "{{count}} minuto",
      "loading": "Naglo-load..."
    }
  }
}
```

---

## Implementation Checklist

**File Updates**:

- [ ] Update `src/i18n/locales/en.json` with all booking.\* keys
- [ ] Update `src/i18n/locales/es.json` with all booking.\* keys
- [ ] Update `src/i18n/locales/ca.json` with all booking.\* keys
- [ ] Update `src/i18n/locales/pl.json` with all booking.\* keys
- [ ] Update `src/i18n/locales/tl.json` with all booking.\* keys

**Validation**:

- [ ] Verify all 5 files have identical key structure
- [ ] Run i18n validation script (if available)
- [ ] Verify no missing translations (no "TODO", "[TRANSLATE]")
- [ ] Verify no placeholder text remains

**Testing**:

- [ ] Switch to each language in app and verify all screens
- [ ] Verify British English spelling (colour, optimise, etc.)
- [ ] Verify natural, conversational tone
- [ ] Verify contextually appropriate translations

**Visual QA**:

- [ ] English - all screens
- [ ] Spanish - all screens
- [ ] Catalan - all screens
- [ ] Polish - all screens
- [ ] Tagalog - all screens
- [ ] Verify no text truncation or overflow

**Integration**:

- [ ] Verify all screens use `t()` function correctly
- [ ] Verify dynamic values ({{timezone}}, {{count}}) work
- [ ] Verify pluralization works (if used)

---

## Acceptance Criteria

**Translation Completeness**:

- [ ] All booking.\* keys exist in all 5 language files
- [ ] No missing translations (100% coverage)
- [ ] No placeholder text ("TODO", "[TRANSLATE]")

**Translation Quality**:

- [ ] British English spelling in en.json (colour, optimise, etc.)
- [ ] Natural, conversational tone in all languages
- [ ] Contextually appropriate (formal vs informal)
- [ ] Gender-neutral where applicable

**Visual Verification**:

- [ ] All screens render correctly in all 5 languages
- [ ] No text truncation or overflow
- [ ] Dynamic values ({{timezone}}, {{count}}) render correctly

**Testing**:

- [ ] i18n validation script passes (if available)
- [ ] Manual QA in all 5 languages

---

## Dependencies

**Blocked By**:

- None (can start immediately)

**Depends On**:

- None

**Blocks**:

- TASK-353 (Confirmation screen) - needs translation keys
- TASK-356 (Home screen entry points) - needs translation keys

---

## Notes

**Translation Process**:

1. Write English (UK) translations first (primary language)
2. Translate to other languages using professional translators or native speakers
3. Review for cultural sensitivity and contextual appropriateness
4. Test in app to verify formatting and visual fit

**British English vs American English**:

- British: colour, optimise, organise, centre, metre
- American: color, optimize, organize, center, meter
- Use British spelling consistently in en.json

**Dynamic Values**:

- `{{timezone}}` - Replaced with actual timezone (e.g., "GMT", "Europe/London")
- `{{count}}` - Replaced with actual number (e.g., "30 minutes")

**Pluralization**:

- English: "{{count}} minutes" works for both singular/plural
- Other languages may need separate keys for singular/plural

**Future Enhancements**:

- Add more granular accessibility labels (separate keys for hints)
- Add help text/tooltips for complex fields
- Add onboarding/tutorial translations
- Add email notification translations (separate namespace)
