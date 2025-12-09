# TASK-390: Consent API Client

**Task ID**: TASK-390
**Title**: Consent API Client
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-072: Unified Consent Management System](../stories/US-072-consent-management-system.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: API

---

## Overview

Create an API client for syncing consent preferences with Supabase. This handles CRUD operations for the `user_consent` table and implements two-way sync between local storage and the database.

---

## Technical Details

### Implementation

**`src/httpClients/ConsentClient.ts`**:

```typescript
import { AxiosInstance } from 'axios';
import { z } from 'zod';
import { getDeviceLocale } from '@app/utils/locale';

// Zod schema for API response validation
const ConsentResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  analytics_enabled: z.boolean(),
  terms_version_accepted: z.string().nullable(),
  privacy_version_accepted: z.string().nullable(),
  terms_accepted_at: z.string().nullable(),
  privacy_accepted_at: z.string().nullable(),
  device_locale: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ConsentResponse = z.infer<typeof ConsentResponseSchema>;

export interface ConsentUpdatePayload {
  analytics_enabled?: boolean;
  terms_version_accepted?: string;
  privacy_version_accepted?: string;
}

/**
 * API Client for consent management
 */
export class ConsentClient {
  private client: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.client = axiosInstance;
  }

  /**
   * Get user's consent preferences from Supabase
   */
  async getConsent(userId: string): Promise<ConsentResponse | null> {
    try {
      const response = await this.client.get(`/rest/v1/user_consent?user_id=eq.${userId}&select=*`);

      if (!response.data || response.data.length === 0) {
        return null;
      }

      return ConsentResponseSchema.parse(response.data[0]);
    } catch (error) {
      // Log error but don't throw - consent should work offline
      console.error('[ConsentClient] Failed to fetch consent:', error);
      return null;
    }
  }

  /**
   * Create or update consent preferences
   * Uses upsert to handle both insert and update
   */
  async upsertConsent(
    userId: string,
    consent: ConsentUpdatePayload
  ): Promise<ConsentResponse | null> {
    try {
      const payload = {
        user_id: userId,
        ...consent,
        device_locale: getDeviceLocale(),
        ...(consent.terms_version_accepted && {
          terms_accepted_at: new Date().toISOString(),
        }),
        ...(consent.privacy_version_accepted && {
          privacy_accepted_at: new Date().toISOString(),
        }),
      };

      const response = await this.client.post('/rest/v1/user_consent', payload, {
        headers: {
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
      });

      return ConsentResponseSchema.parse(response.data[0]);
    } catch (error) {
      console.error('[ConsentClient] Failed to upsert consent:', error);
      throw error;
    }
  }

  /**
   * Update only analytics preference
   */
  async updateAnalyticsConsent(userId: string, enabled: boolean): Promise<void> {
    await this.upsertConsent(userId, { analytics_enabled: enabled });
  }

  /**
   * Record T&C and Privacy acceptance
   */
  async acceptTerms(userId: string, termsVersion: string, privacyVersion: string): Promise<void> {
    await this.upsertConsent(userId, {
      terms_version_accepted: termsVersion,
      privacy_version_accepted: privacyVersion,
    });
  }
}

// Factory function for creating client with auth
export const createConsentClient = (axiosInstance: AxiosInstance): ConsentClient => {
  return new ConsentClient(axiosInstance);
};
```

**`src/schemas/consent.schema.ts`**:

```typescript
import { z } from 'zod';

export const ConsentResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  analytics_enabled: z.boolean(),
  terms_version_accepted: z.string().nullable(),
  privacy_version_accepted: z.string().nullable(),
  terms_accepted_at: z.string().nullable(),
  privacy_accepted_at: z.string().nullable(),
  device_locale: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ConsentResponse = z.infer<typeof ConsentResponseSchema>;
```

---

## Files to Create

| File                               | Purpose                |
| ---------------------------------- | ---------------------- |
| `src/httpClients/ConsentClient.ts` | Consent API client     |
| `src/schemas/consent.schema.ts`    | Zod validation schemas |

---

## Acceptance Criteria

- [ ] ConsentClient class created with all methods
- [ ] `getConsent()` fetches user consent from Supabase
- [ ] `upsertConsent()` handles both insert and update
- [ ] `updateAnalyticsConsent()` convenience method works
- [ ] `acceptTerms()` convenience method works
- [ ] Zod schema validates API responses
- [ ] Device locale captured with each update
- [ ] Timestamps auto-set for T&C/Privacy acceptance
- [ ] Errors caught and logged (offline-friendly)
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Get Consent - Existing User**

```gherkin
Given a user has consent record in Supabase
When getConsent(userId) is called
Then it should return the consent record
And the response should pass Zod validation
```

**Scenario 2: Get Consent - New User**

```gherkin
Given a user has no consent record
When getConsent(userId) is called
Then it should return null
And no error should be thrown
```

**Scenario 3: Upsert Consent - Create**

```gherkin
Given a user has no consent record
When upsertConsent is called with analytics_enabled: true
Then a new record should be created
And device_locale should be set
```

**Scenario 4: Upsert Consent - Update**

```gherkin
Given a user has an existing consent record
When upsertConsent is called with new values
Then the existing record should be updated
And the response should reflect new values
```

**Scenario 5: Offline Resilience**

```gherkin
Given the network is unavailable
When getConsent is called
Then it should return null
And the error should be logged
And no exception should propagate
```

---

## Dependencies

**Blocked By**: TASK-388 (Supabase schema)

**Blocks**: TASK-393, TASK-395

---

## Notes

**Upsert Strategy**:
Using Supabase's `resolution=merge-duplicates` header allows a single endpoint to handle both insert and update. The unique constraint on `user_id` ensures only one record per user.

**Offline-First Design**:
The `getConsent` method catches errors and returns null to allow the app to work offline using locally stored consent. Sync happens opportunistically when the network is available.

**Device Locale**:
The device locale is captured with each consent update to help with GDPR auditing and regional compliance tracking.

---

**Last Updated**: 2025-12-09
