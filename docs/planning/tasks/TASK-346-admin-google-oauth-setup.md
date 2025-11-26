# TASK-346: Admin Google OAuth Setup (One-Time)

**Task ID**: TASK-346
**Title**: Admin Google OAuth Setup (One-Time)
**User Story**: [US-062](../stories/US-062-booking-backend.md)
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 1h
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-343 (Admin OAuth Edge Function)

---

## Context

Before the booking system can access Warren's Google Calendar, we need to configure Google Cloud Console with OAuth credentials and complete the initial authorisation flow. This is a **one-time manual setup** that Warren must perform.

**This task involves**:

1. Creating a Google Cloud project (if not already exists)
2. Enabling Google Calendar API
3. Configuring OAuth consent screen
4. Creating OAuth 2.0 credentials (client ID + secret)
5. Setting authorised redirect URIs
6. Performing first-time OAuth flow to obtain refresh token

**Once completed**, the system will automatically refresh tokens as needed. This setup never needs to be repeated unless credentials are revoked or regenerated.

**Security Considerations**:

- OAuth credentials (client ID + secret) must be stored as Supabase secrets
- Refresh token stored encrypted in database
- Only Warren (admin) can authorise
- OAuth consent screen should be internal (not public)

---

## Objective

Configure Google Cloud Console for OAuth 2.0 and complete the initial authorisation flow to grant the application access to Warren's Google Calendar.

**Deliverable**: Working OAuth integration with refresh token stored in database, ready for use by Edge Functions.

---

## Technical Implementation

### Prerequisites

- Google account with calendar access (Warren's account)
- Google Cloud Console access (https://console.cloud.google.com)
- Supabase project with deployed Edge Functions (TASK-343)

---

## Step-by-Step Setup Guide

### Step 1: Create Google Cloud Project

1. **Navigate to Google Cloud Console**:
   - Go to https://console.cloud.google.com
   - Sign in with Warren's Google account

2. **Create New Project** (skip if project already exists):
   - Click project dropdown (top-left)
   - Click "New Project"
   - Project name: "Warren's Portfolio Booking System" (or any descriptive name)
   - Organization: Leave as default (No organization)
   - Click "Create"
   - Wait for project creation (1-2 minutes)

3. **Select Project**:
   - Click project dropdown
   - Select newly created project

---

### Step 2: Enable Google Calendar API

1. **Navigate to APIs & Services**:
   - In left sidebar, click "APIs & Services" → "Library"

2. **Search for Calendar API**:
   - In search bar, type "Google Calendar API"
   - Click "Google Calendar API" from results

3. **Enable API**:
   - Click "Enable" button
   - Wait for API to be enabled (10-20 seconds)

---

### Step 3: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**:
   - In left sidebar, click "APIs & Services" → "OAuth consent screen"

2. **Choose User Type**:
   - Select "Internal" (recommended - only Warren can authorise)
   - If no Google Workspace organisation: Select "External" (but limit test users to Warren's email)
   - Click "Create"

3. **App Information** (Step 1 of 4):
   - **App name**: "Warren's Booking System"
   - **User support email**: Warren's email address
   - **App logo**: Optional (skip for now)
   - **Application home page**: https://warrendeleon.com (or your portfolio URL)
   - **Application privacy policy link**: https://warrendeleon.com/privacy (if exists, or skip)
   - **Application terms of service link**: Skip (not required for internal)
   - **Authorized domains**: Add `warrendeleon.com` (if applicable)
   - **Developer contact information**: Warren's email address
   - Click "Save and Continue"

4. **Scopes** (Step 2 of 4):
   - Click "Add or Remove Scopes"
   - In filter box, search for "calendar"
   - Select these scopes:
     - `https://www.googleapis.com/auth/calendar.readonly` - See and download any calendar you can access using your Calendar
     - `https://www.googleapis.com/auth/calendar.events` - View and edit events on all your calendars
   - Click "Update"
   - Click "Save and Continue"

5. **Test Users** (Step 3 of 4) - **Only if "External" selected**:
   - Click "Add Users"
   - Add Warren's email address
   - Click "Add"
   - Click "Save and Continue"

6. **Summary** (Step 4 of 4):
   - Review all settings
   - Click "Back to Dashboard"

---

### Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**:
   - In left sidebar, click "APIs & Services" → "Credentials"

2. **Create OAuth Client ID**:
   - Click "Create Credentials" → "OAuth client ID"

3. **Configure OAuth Client**:
   - **Application type**: Select "Web application"
   - **Name**: "Booking System OAuth Client"
   - **Authorized JavaScript origins**: Leave empty (not needed)
   - **Authorized redirect URIs**: Click "Add URI"
     - Add: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/admin-oauth/callback`
     - Example: `https://abcdefghijklmnop.supabase.co/functions/v1/admin-oauth/callback`
     - **IMPORTANT**: Replace with your actual Supabase project URL
   - Click "Create"

4. **Save Credentials**:
   - Modal will appear with Client ID and Client Secret
   - **Copy Client ID** - Save to secure location (e.g., 1Password)
   - **Copy Client Secret** - Save to secure location
   - Click "OK"
   - Optionally, click "Download JSON" to save credentials file

---

### Step 5: Configure Supabase Environment Variables

1. **Set Supabase Secrets**:

   ```bash
   # Navigate to Supabase project directory
   cd /path/to/your/supabase/project

   # Set Google OAuth Client ID
   supabase secrets set GOOGLE_OAUTH_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"

   # Set Google OAuth Client Secret
   supabase secrets set GOOGLE_OAUTH_CLIENT_SECRET="YOUR_CLIENT_SECRET"

   # Set OAuth Redirect URI (must match Google Cloud Console)
   supabase secrets set GOOGLE_OAUTH_REDIRECT_URI="https://YOUR_PROJECT.supabase.co/functions/v1/admin-oauth/callback"

   # Set OAuth Encryption Key (generate strong random key)
   # Generate with: openssl rand -base64 32
   supabase secrets set OAUTH_ENCRYPTION_KEY="YOUR_RANDOMLY_GENERATED_256_BIT_KEY"
   ```

2. **Verify Secrets Set**:

   ```bash
   supabase secrets list
   ```

3. **Update Local .env File** (for local development):
   ```bash
   # Add to .env (DO NOT COMMIT TO GIT)
   GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
   GOOGLE_OAUTH_REDIRECT_URI=http://localhost:54321/functions/v1/admin-oauth/callback
   OAUTH_ENCRYPTION_KEY=your-local-encryption-key
   ```

---

### Step 6: Complete Initial OAuth Flow

This is the **one-time authorisation** where Warren grants the application access to his calendar.

1. **Deploy Edge Functions** (if not already deployed):

   ```bash
   supabase functions deploy admin-oauth
   ```

2. **Get Admin JWT Token**:

   ```bash
   # Login to Supabase as Warren (admin user)
   # Copy JWT token from browser DevTools (Application → Local Storage → supabase.auth.token)
   # Or use Supabase CLI:
   supabase auth login
   ```

3. **Request Authorization URL**:

   ```bash
   curl -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
     https://YOUR_PROJECT.supabase.co/functions/v1/admin-oauth/authorize
   ```

   **Expected Response**:

   ```json
   {
     "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
     "state": "abc123..."
   }
   ```

4. **Visit Authorization URL**:
   - Copy the `authUrl` from response
   - Open in browser (while logged in as Warren)
   - Review permissions (Calendar read + events)
   - Click "Allow"

5. **Handle Callback**:
   - Browser will redirect to callback URL
   - Edge Function will automatically:
     - Exchange code for tokens
     - Encrypt tokens
     - Store in `admin_oauth` table
   - You should see success message or JSON response:
     ```json
     {
       "success": true,
       "message": "OAuth authorization successful",
       "expiresAt": "2025-11-26T15:00:00Z"
     }
     ```

6. **Verify Token Storage**:

   ```sql
   -- Run in Supabase SQL Editor
   SELECT
     admin_user_id,
     provider,
     token_expires_at,
     scopes,
     created_at
   FROM admin_oauth
   WHERE provider = 'google';
   ```

   **Expected Result**:
   - One row with Warren's user ID
   - `token_expires_at` should be ~1 hour in future
   - `scopes` should include `calendar.readonly` and `calendar.events`

---

## Verification Checklist

After completing setup, verify everything works:

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured (Internal or External with test user)
- [ ] OAuth client ID created with correct redirect URI
- [ ] Supabase secrets set (all 4 environment variables)
- [ ] Admin OAuth Edge Function deployed
- [ ] Initial OAuth flow completed successfully
- [ ] Refresh token stored in `admin_oauth` table (encrypted)
- [ ] Token expiration set correctly (~1 hour from authorization)
- [ ] Scopes include `calendar.readonly` and `calendar.events`

---

## Testing OAuth Integration

### Test Token Refresh

Wait for token to expire (1 hour), or manually expire it:

```sql
-- Manually expire token (for testing)
UPDATE admin_oauth
SET token_expires_at = NOW() - INTERVAL '1 hour'
WHERE provider = 'google';
```

Then call refresh endpoint:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  https://YOUR_PROJECT.supabase.co/functions/v1/admin-oauth/refresh
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "expiresAt": "2025-11-26T16:00:00Z"
}
```

### Test Calendar Access

Try fetching availability (requires TASK-344 deployed):

```bash
curl -H "Authorization: Bearer USER_JWT_TOKEN" \
  "https://YOUR_PROJECT.supabase.co/functions/v1/get-availability?date=2025-11-26"
```

**Expected**: Should return available slots (not an OAuth error)

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: Redirect URI in Google Cloud Console doesn't match Edge Function URL

**Fix**:

1. Go to Google Cloud Console → Credentials
2. Edit OAuth client
3. Ensure redirect URI exactly matches: `https://YOUR_PROJECT.supabase.co/functions/v1/admin-oauth/callback`
4. No trailing slash, exact match required

---

### Error: "invalid_grant" During Token Exchange

**Cause**: Authorization code expired (10 minutes) or already used

**Fix**:

1. Restart OAuth flow from Step 6.3
2. Complete authorization and callback quickly (<10 minutes)

---

### Error: "access_denied" During Authorization

**Cause**: User clicked "Deny" or account doesn't have calendar access

**Fix**:

1. Restart OAuth flow
2. Click "Allow" when prompted
3. Ensure Google account has calendar access

---

### Error: "unauthorized_client" During Authorization

**Cause**: OAuth consent screen not configured or wrong user type

**Fix**:

1. Go to Google Cloud Console → OAuth consent screen
2. If "External", add Warren's email to test users
3. If no organization, use "External" (not "Internal")

---

### Token Refresh Fails After 7 Days

**Cause**: Refresh token only valid for 7 days if app is in testing mode (External + not verified)

**Fix**:

1. Go to Google Cloud Console → OAuth consent screen
2. Click "Publish App" (for External apps)
3. Or keep refreshing token every 7 days (re-authorize)

---

## Security Best Practices

1. **Never Commit Credentials**:
   - Add `.env` to `.gitignore`
   - Never commit OAuth client ID/secret to Git
   - Use Supabase secrets for production

2. **Rotate Credentials Periodically**:
   - Every 90 days, regenerate OAuth client secret
   - Update Supabase secrets
   - Re-authorize application

3. **Monitor OAuth Usage**:
   - Check Google Cloud Console → APIs & Services → Dashboard
   - Review quota usage for Calendar API
   - Set up alerts for unusual activity

4. **Limit Scope Access**:
   - Only request necessary scopes (calendar.readonly, calendar.events)
   - Never request broader "calendar" scope (full access)

---

## Acceptance Criteria

- [ ] Google Cloud project created with Calendar API enabled
- [ ] OAuth consent screen configured (Internal or External with test user)
- [ ] OAuth client ID created with correct redirect URI
- [ ] Supabase secrets configured (4 environment variables)
- [ ] Initial OAuth flow completed successfully
- [ ] Refresh token stored encrypted in `admin_oauth` table
- [ ] Token refresh tested and working
- [ ] Calendar access verified (can fetch availability)
- [ ] All credentials stored securely (not in Git)
- [ ] Documentation updated with OAuth setup instructions

---

## Post-Setup Maintenance

### Token Expiration

- **Access token**: Expires after 1 hour (automatically refreshed by Edge Functions)
- **Refresh token**: Valid indefinitely (unless revoked or app unpublished)

### Revoking Access

To revoke OAuth access:

1. Go to https://myaccount.google.com/permissions
2. Find "Warren's Booking System"
3. Click "Remove Access"
4. Re-authorize using Step 6 to grant access again

### Regenerating Credentials

If credentials are compromised:

1. Go to Google Cloud Console → Credentials
2. Delete existing OAuth client
3. Create new OAuth client (Step 4)
4. Update Supabase secrets (Step 5)
5. Re-authorize application (Step 6)

---

## Edge Cases & Error Handling

| Scenario                                        | Expected Behaviour                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| OAuth consent screen not published (External)   | Authorization works but tokens expire after 7 days                           |
| Redirect URI has trailing slash                 | `redirect_uri_mismatch` error - remove trailing slash                        |
| Wrong Google account used for authorization     | Edge Function succeeds but wrong calendar accessed - revoke and re-authorize |
| OAuth client deleted/regenerated                | All existing tokens invalid - re-authorize required                          |
| User revokes access via Google account settings | Edge Functions fail with 401 - re-authorize required                         |
| Supabase secrets not set                        | Edge Function returns "Missing OAuth configuration" error                    |
| Encryption key changed after tokens stored      | Decryption fails - re-authorize required                                     |

---

## Dependencies

- **Blocked by**: TASK-343 (Admin OAuth Edge Function must be implemented and deployed)
- **Blocks**:
  - TASK-344 (Get Availability - needs OAuth tokens to query Google Calendar)
  - TASK-345 (Create Booking - needs OAuth tokens to create events)

---

## Additional Resources

- **Google OAuth 2.0 Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Google Calendar API Reference**: https://developers.google.com/calendar/api/v3/reference
- **OAuth 2.0 Playground**: https://developers.google.com/oauthplayground (test OAuth flow)
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

**Estimated Time**: 1h
**Last Updated**: 2025-11-25
