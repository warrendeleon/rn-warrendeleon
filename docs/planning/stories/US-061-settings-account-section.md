# US-061: Settings Account Section

**ID**: US-061 | **Title**: Settings Account Section
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 3 | **Effort**: 7.5h
**Created**: 2025-11-25 | **Assignee**: Warren de Leon

---

## User Story

**As a** logged-in user
**I want to** see my account information in Settings and be able to sign out
**So that** I can manage my account and securely log out when needed

---

## Context & Background

### Why This Story Matters

Account management belongs in Settings (iOS standard pattern). Users need to:

1. **See account status**: View their profile information
2. **Access profile editing**: Navigate to edit account details
3. **Sign out**: Securely log out from the app
4. **Sign in prompt**: If not logged in, see option to sign in

**Settings Account Section Design**:

**When logged in:**

```
Settings Screen
├── Account Section
│   ├── User Card (avatar + name + email) → taps to EditAccountScreen
│   └── Sign Out button (destructive red)
├── General Section
│   ├── Appearance
│   └── Language
```

**When NOT logged in:**

```
Settings Screen
├── Account Section
│   └── Sign In / Create Account → navigates to Login
├── General Section
│   ├── Appearance
│   └── Language
```

### Current State vs Desired State

**Current State**:

- SettingsScreen exists with General section (Appearance, Language)
- No Account section
- No user card or sign out functionality

**Desired State**:

- Account section at top of Settings
- Conditional rendering based on auth status
- User card with avatar, name, email
- Sign Out button (destructive style)
- Sign In button when logged out

---

## Acceptance Criteria

### Functional Requirements

#### Account Section (Authenticated)

- [ ] Account section appears at top of Settings when authenticated
- [ ] User card displays:
  - [ ] User avatar (or initials fallback)
  - [ ] First name + Last name
  - [ ] Email address
  - [ ] Chevron indicating tappable
- [ ] Tapping user card navigates to EditAccountScreen (future)
- [ ] Sign Out button below user card
- [ ] Sign Out button styled as destructive (red text)
- [ ] Sign Out dispatches logout action
- [ ] After sign out, user redirected to Home

#### Account Section (Not Authenticated)

- [ ] Account section shows "Sign In / Create Account" button
- [ ] Tapping navigates to Login screen

#### UserCard Component

- [ ] Displays user avatar or initials fallback
- [ ] Shows full name (first + last)
- [ ] Shows email address
- [ ] Has chevron icon indicating navigation
- [ ] EAA compliant with proper accessibility

---

## Feature-First File Structure

Following the project's feature-first architecture:

### Files to Create

| File                                         | Purpose                           |
| -------------------------------------------- | --------------------------------- |
| `src/components/UserCard/UserCard.tsx`       | Reusable user info card component |
| `src/components/UserCard/index.ts`           | Component export                  |
| `src/features/Account/EditAccountScreen.tsx` | Edit account form screen          |
| `src/features/Account/index.ts`              | Feature exports                   |

### Files to Modify

| File                                             | Changes                  |
| ------------------------------------------------ | ------------------------ |
| `src/features/Settings/SettingsScreen.tsx`       | Add Account section      |
| `src/navigation/RootNavigator/RootNavigator.tsx` | Add EditAccount screen   |
| `src/components/index.ts`                        | Export UserCard          |
| `src/i18n/locales/*.json`                        | Add account translations |

### Test Files to Create

| File                                                      | Purpose                           |
| --------------------------------------------------------- | --------------------------------- |
| `src/components/UserCard/__tests__/UserCard.rntl.tsx`     | UserCard unit tests               |
| `src/features/Settings/__tests__/SettingsScreen.rntl.tsx` | Updated tests for account section |

---

## Tasks

### Task Breakdown (4 tasks, 7.5h total)

| ID                                                           | Task                                  | Status   | Effort | Priority | Dependencies       |
| ------------------------------------------------------------ | ------------------------------------- | -------- | ------ | -------- | ------------------ |
| [TASK-338](../tasks/TASK-338-settings-account-section.md)    | Add Account Section to SettingsScreen | 📋 To Do | 2h     | High     | US-060             |
| [TASK-339](../tasks/TASK-339-user-card-component.md)         | Create UserCard Component             | 📋 To Do | 1h     | Medium   | None               |
| [TASK-340](../tasks/TASK-340-edit-account-screen.md)         | Create EditAccountScreen              | 📋 To Do | 3h     | Medium   | TASK-339           |
| [TASK-341](../tasks/TASK-341-settings-account-rntl-tests.md) | Settings Account RNTL Tests           | 📋 To Do | 1.5h   | Medium   | TASK-338, TASK-339 |

**Total Effort**: 7.5 hours

**Dependency Chain**:

```
TASK-339 (UserCard) → TASK-338 (Settings Account Section)
                    → TASK-340 (EditAccountScreen)
                                                    → TASK-341 (Tests)
```

---

## i18n Keys

Add to all locale files (`en.json`, `es.json`, `ca.json`, `pl.json`, `tl.json`):

```json
{
  "settings": {
    "account": {
      "title": "Account",
      "signIn": "Sign In / Create Account",
      "signOut": "Sign Out",
      "editAccount": "Edit Account"
    }
  }
}
```

---

## Definition of Done

**Functional**:

- [ ] Account section shows when authenticated
- [ ] User card displays name, email, avatar
- [ ] Sign Out button works and redirects to Home
- [ ] Sign In button shows when not authenticated
- [ ] Navigation to EditAccountScreen works

**Quality**:

- [ ] 100% RNTL coverage for new components
- [ ] `yarn validate` passes
- [ ] Zero ESLint/TypeScript errors

**Accessibility**:

- [ ] UserCard EAA compliant
- [ ] Sign Out button accessible with proper role and hint
- [ ] Touch targets minimum 48×48

---

**Last Updated**: 2025-11-25
**Story Points**: 3
**Priority**: High (enables logout and account management)
