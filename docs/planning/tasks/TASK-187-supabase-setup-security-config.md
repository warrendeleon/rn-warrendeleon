# TASK-187: Complete Supabase Setup + Security Configuration

**Task ID**: TASK-187
**Title**: Complete Supabase Setup + Security Configuration
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ⏳ In Progress
**Priority**: Critical
**Effort**: 4 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

**CRITICAL FIRST TASK**: This task MUST be completed before any code is written. The user has NEVER used Supabase before, so these instructions are extremely detailed, walking through every single step from account creation to production-ready security configuration.

Supabase is an open-source Firebase alternative that provides:

- PostgreSQL database with REST API
- Authentication service (email/password, OAuth, magic links)
- Storage for files (profile pictures)
- Realtime subscriptions (for chat later)
- Edge Functions (for push notifications later)
- Row Level Security (RLS) for database protection

This task configures the Supabase project for authentication, storage, and security. All subsequent tasks depend on this foundation.

---

## Objective

Set up a production-ready Supabase project with:

1. Account creation and project setup
2. Database schema for user profiles
3. Row Level Security (RLS) policies
4. Storage bucket for profile pictures
5. Authentication providers (email, LinkedIn, magic link)
6. Environment variables configured
7. API keys and URLs saved securely

**Deliverable**: Fully configured Supabase project ready for React Native integration.

---

## Acceptance Criteria

- [ ] **Supabase account created** at https://supabase.com
- [ ] **New project created** with appropriate name and region
- [ ] **Database schema** created for `profiles` table with all required fields
- [ ] **RLS policies** enabled and configured for secure data access
- [ ] **Storage bucket** created for profile pictures with public access
- [ ] **Email authentication** enabled in Supabase dashboard
- [ ] **LinkedIn OAuth** provider configured (if LinkedIn app ready)
- [ ] **Magic Link** authentication enabled
- [ ] **Environment variables** saved in `.env.development` and `.env.production`
- [ ] **API credentials** verified working with Postman/curl test
- [ ] **Security checklist** completed (no anon key in public code, RLS enabled everywhere)

---

## Detailed Implementation Guide

### Phase 1: Account Creation (15 minutes)

#### Step 1.1: Create Supabase Account

1. **Navigate** to https://supabase.com
2. **Click** "Start your project" or "Sign Up"
3. **Choose** authentication method:
   - Recommended: GitHub OAuth (fastest, links to developer profile)
   - Alternative: Email/password
4. **Complete** email verification if using email/password
5. **Confirm** you're logged into Supabase dashboard

**Expected Result**: You should see the Supabase dashboard with "New project" button.

#### Step 1.2: Create New Organization (if needed)

If this is your first time using Supabase:

1. **Click** "New organization"
2. **Enter** organization name: `Warren de Leon` or `Personal Projects`
3. **Choose** plan: **Free** (includes 500MB database, 1GB storage, 50k MAU)
4. **Skip** billing information (not required for free tier)

**Expected Result**: Organization created, ready to create project.

---

### Phase 2: Project Creation (10 minutes)

#### Step 2.1: Create New Project

1. **Click** "New project" button
2. **Fill in** project details:
   - **Name**: `warrendeleon-portfolio` (or `warrendeleon-app`)
   - **Database Password**: Generate strong password (save in password manager immediately)
   - **Region**: Choose closest to your users:
     - EU users: `eu-west-1` (Ireland) or `eu-central-1` (Frankfurt)
     - UK users: `eu-west-2` (London)
     - Global: `us-east-1` (N. Virginia)
   - **Pricing Plan**: Free
3. **Click** "Create new project"
4. **Wait** 2-3 minutes for project provisioning (Supabase sets up PostgreSQL database, API, storage)

**Expected Result**: Project dashboard loads with API keys visible.

#### Step 2.2: Save API Credentials

Once project is provisioned, navigate to **Settings** → **API**:

**Copy these values** (you'll need them for `.env` files):

1. **Project URL**: `https://[project-id].supabase.co`
2. **Anon (public) key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
3. **Service Role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (different long string)

**⚠️ CRITICAL SECURITY**:

- **Anon key**: Safe to use in React Native app (public)
- **Service Role key**: NEVER use in React Native app (server-side only, bypasses RLS)

**Save these** in a temporary secure note for now (we'll add to `.env` files later).

---

### Phase 3: Database Schema Setup (30 minutes)

#### Step 3.1: Create `profiles` Table

Navigate to **Database** → **Table Editor** → **New table**:

**Table Configuration**:

- **Name**: `profiles`
- **Description**: User profile information
- **Enable Row Level Security (RLS)**: ✅ **CHECKED** (CRITICAL)

**Columns**:

| Column Name       | Type          | Default              | Constraints         | Description                       |
| ----------------- | ------------- | -------------------- | ------------------- | --------------------------------- |
| `id`              | `uuid`        | `uuid_generate_v4()` | Primary Key, Unique | User ID (matches auth.users.id)   |
| `email`           | `text`        | -                    | Not Null, Unique    | User email                        |
| `full_name`       | `text`        | -                    | Not Null            | Full name                         |
| `profile_picture` | `text`        | `null`               | Nullable            | URL to profile picture in Storage |
| `auth_provider`   | `text`        | `'email'`            | Not Null            | 'email', 'linkedin', 'magic_link' |
| `created_at`      | `timestamptz` | `now()`              | Not Null            | Account creation timestamp        |
| `updated_at`      | `timestamptz` | `now()`              | Not Null            | Last update timestamp             |

**Step-by-step in Supabase UI**:

1. **Click** "New table"
2. **Enter** table name: `profiles`
3. **Check** "Enable Row Level Security"
4. **Add columns** one by one using the "Add column" button:

   **Column 1** (already created by default):
   - Name: `id`
   - Type: `uuid`
   - Default value: `uuid_generate_v4()`
   - Primary: ✅
   - Check "Is Unique"

   **Column 2**:
   - Name: `email`
   - Type: `text`
   - Check "Is Not Null"
   - Check "Is Unique"

   **Column 3**:
   - Name: `full_name`
   - Type: `text`
   - Check "Is Not Null"

   **Column 4**:
   - Name: `profile_picture`
   - Type: `text`
   - Leave nullable (optional field)

   **Column 5**:
   - Name: `auth_provider`
   - Type: `text`
   - Default value: `'email'`
   - Check "Is Not Null"

   **Column 6**:
   - Name: `created_at`
   - Type: `timestamptz`
   - Default value: `now()`
   - Check "Is Not Null"

   **Column 7**:
   - Name: `updated_at`
   - Type: `timestamptz`
   - Default value: `now()`
   - Check "Is Not Null"

5. **Click** "Save" to create table

**Expected Result**: `profiles` table created with 7 columns, RLS enabled.

#### Step 3.2: Create Foreign Key to `auth.users`

The `profiles.id` should match `auth.users.id` (Supabase's built-in users table).

1. **Navigate** to **Database** → **Table Editor** → **profiles** table
2. **Click** on `id` column settings
3. **Add foreign key**:
   - Foreign table: `auth.users`
   - Foreign column: `id`
   - On delete: `CASCADE` (delete profile when user deleted)
4. **Save**

**Expected Result**: Foreign key constraint created.

#### Step 3.3: Create `updated_at` Trigger

Automatically update `updated_at` timestamp on every row update:

1. **Navigate** to **Database** → **Functions** → **New function**
2. **Function name**: `handle_updated_at`
3. **Function definition**:

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

4. **Click** "Save"

5. **Navigate** to **Database** → **Triggers** → **New trigger**
6. **Trigger configuration**:
   - Name: `update_profiles_updated_at`
   - Table: `profiles`
   - Events: `UPDATE`
   - Timing: `BEFORE`
   - Function: `handle_updated_at()`

7. **Click** "Save"

**Expected Result**: `updated_at` automatically updates on every profile change.

---

### Phase 4: Row Level Security (RLS) Policies (45 minutes)

**⚠️ CRITICAL**: Without RLS policies, users can access/modify each other's data. These policies enforce that users can only access their own profiles.

#### Step 4.1: Enable RLS (Verify)

Navigate to **Database** → **Table Editor** → **profiles**:

- Verify "Row Level Security" is **enabled** (should have been checked during table creation)
- If not enabled, click table settings and enable it

#### Step 4.2: Create Policy - Users Can Read Own Profile

Navigate to **Authentication** → **Policies** → **profiles** table → **New policy**:

**Policy 1: Select Own Profile**

1. **Policy name**: `Users can read own profile`
2. **Allowed operation**: `SELECT`
3. **Target roles**: `authenticated` (logged-in users only)
4. **USING expression** (who can read):
   ```sql
   auth.uid() = id
   ```
5. **Click** "Review" → "Save policy"

**Explanation**: `auth.uid()` returns the currently logged-in user's ID. This policy allows users to read only rows where `id` matches their own ID.

#### Step 4.3: Create Policy - Users Can Insert Own Profile

**Policy 2: Insert Own Profile**

1. **New policy**
2. **Policy name**: `Users can insert own profile`
3. **Allowed operation**: `INSERT`
4. **Target roles**: `authenticated`
5. **WITH CHECK expression** (what can be inserted):
   ```sql
   auth.uid() = id
   ```
6. **Save**

**Explanation**: Users can only insert profiles where the `id` matches their own user ID (prevents creating profiles for other users).

#### Step 4.4: Create Policy - Users Can Update Own Profile

**Policy 3: Update Own Profile**

1. **New policy**
2. **Policy name**: `Users can update own profile`
3. **Allowed operation**: `UPDATE`
4. **Target roles**: `authenticated`
5. **USING expression**:
   ```sql
   auth.uid() = id
   ```
6. **WITH CHECK expression**:
   ```sql
   auth.uid() = id
   ```
7. **Save**

**Explanation**: Users can update only their own profile (both before and after update).

#### Step 4.5: Create Policy - Users Can Delete Own Profile

**Policy 4: Delete Own Profile**

1. **New policy**
2. **Policy name**: `Users can delete own profile`
3. **Allowed operation**: `DELETE`
4. **Target roles**: `authenticated`
5. **USING expression**:
   ```sql
   auth.uid() = id
   ```
6. **Save**

**Expected Result**: 4 RLS policies created. Users can only access their own profiles.

---

### Phase 5: Storage Bucket for Profile Pictures (30 minutes)

#### Step 5.1: Create Storage Bucket

Navigate to **Storage** → **New bucket**:

1. **Bucket name**: `profile-pictures`
2. **Public bucket**: ✅ **CHECKED** (allows direct image URLs)
3. **File size limit**: 5 MB (sufficient for compressed 800×800 JPEG)
4. **Allowed MIME types**: `image/jpeg,image/png,image/webp`
5. **Click** "Create bucket"

**Expected Result**: `profile-pictures` bucket created.

#### Step 5.2: Configure Bucket RLS Policies

Navigate to **Storage** → **profile-pictures** → **Policies**:

**Policy 1: Authenticated Users Can Upload**

1. **New policy**
2. **Policy name**: `Authenticated users can upload own profile pictures`
3. **Allowed operation**: `INSERT`
4. **Target roles**: `authenticated`
5. **USING expression**:
   ```sql
   (auth.uid())::text = (storage.foldername(name))[1]
   ```
6. **Save**

**Explanation**: Users can upload files to folders named after their user ID (e.g., `a1b2c3d4-uuid/profile.jpg`).

**Policy 2: Public Read Access**

1. **New policy**
2. **Policy name**: `Public can view profile pictures`
3. **Allowed operation**: `SELECT`
4. **Target roles**: `public` (anyone, even non-logged-in users)
5. **USING expression**:
   ```sql
   true
   ```
6. **Save**

**Explanation**: Anyone can view profile pictures (public URLs work).

**Policy 3: Users Can Update Own Pictures**

1. **New policy**
2. **Policy name**: `Users can update own profile pictures`
3. **Allowed operation**: `UPDATE`
4. **Target roles**: `authenticated`
5. **USING expression**:
   ```sql
   (auth.uid())::text = (storage.foldername(name))[1]
   ```
6. **Save**

**Policy 4: Users Can Delete Own Pictures**

1. **New policy**
2. **Policy name**: `Users can delete own profile pictures`
3. **Allowed operation**: `DELETE`
4. **Target roles**: `authenticated`
5. **USING expression**:
   ```sql
   (auth.uid())::text = (storage.foldername(name))[1]
   ```
6. **Save**

**Expected Result**: 4 storage RLS policies created. Users can manage own pictures, public can view.

---

### Phase 6: Authentication Provider Configuration (30 minutes)

#### Step 6.1: Enable Email Authentication

Navigate to **Authentication** → **Providers** → **Email**:

1. **Enable Email provider**: ✅ **ON**
2. **Confirm email**: ✅ **ON** (require email verification)
3. **Email template** (verification email):
   - Customize subject: `Confirm your email - Warren de Leon Portfolio`
   - Customize body (use deep link):
     ```html
     <h2>Confirm your email</h2>
     <p>Welcome! Please confirm your email by clicking the link below:</p>
     <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
     <p>Or copy this link: {{ .ConfirmationURL }}</p>
     ```
4. **Redirect URLs**: Add these (for deep linking):
   - `warrendeleonapp://auth/callback`
   - `http://localhost:19006/auth/callback` (for Expo Go testing, if needed)
5. **Save**

**Expected Result**: Email authentication enabled with email verification.

#### Step 6.2: Enable Magic Link Authentication

Navigate to **Authentication** → **Providers** → **Email**:

1. Scroll to **Magic Link** section
2. **Enable Magic Link**: ✅ **ON**
3. **Magic Link template**:
   - Subject: `Your Magic Link - Warren de Leon Portfolio`
   - Body:
     ```html
     <h2>Your Magic Link</h2>
     <p>Click the link below to sign in:</p>
     <p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
     <p>This link expires in 1 hour.</p>
     ```
4. **Save**

**Expected Result**: Magic Link enabled.

#### Step 6.3: Configure LinkedIn OAuth (if TASK-188 complete)

**⚠️ PREREQUISITE**: Requires LinkedIn Developer App (TASK-188) to be completed first.

If you have LinkedIn Client ID and Client Secret:

Navigate to **Authentication** → **Providers** → **LinkedIn**:

1. **Enable LinkedIn provider**: ✅ **ON**
2. **Client ID**: Paste from LinkedIn Developer App
3. **Client Secret**: Paste from LinkedIn Developer App
4. **Redirect URL**: Copy this for LinkedIn app configuration:
   - `https://[your-project-id].supabase.co/auth/v1/callback`
5. **Save**

Then, go to LinkedIn Developer App:

- Add Supabase redirect URL to authorized redirect URIs

**Expected Result**: LinkedIn OAuth configured (if LinkedIn app ready).

**If LinkedIn app not ready**: Skip this step for now, complete TASK-188 first.

---

### Phase 7: Environment Variables Configuration (20 minutes)

#### Step 7.1: Create `.env.development` File

Navigate to project root and create `.env.development`:

```bash
# Supabase Configuration (Development)
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LinkedIn OAuth (Development - if ready)
LINKEDIN_CLIENT_ID=your_linkedin_client_id_dev
LINKEDIN_REDIRECT_URI=warrendeleonapp://oauth/linkedin/callback

# App Configuration
APP_ENV=development
API_TIMEOUT=10000
```

**Replace**:

- `[your-project-id]` with actual Supabase project ID
- `SUPABASE_ANON_KEY` with actual anon key from Supabase dashboard
- LinkedIn credentials (if ready)

#### Step 7.2: Create `.env.production` File

Create `.env.production`:

```bash
# Supabase Configuration (Production)
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LinkedIn OAuth (Production - if ready)
LINKEDIN_CLIENT_ID=your_linkedin_client_id_prod
LINKEDIN_REDIRECT_URI=warrendeleonapp://oauth/linkedin/callback

# App Configuration
APP_ENV=production
API_TIMEOUT=10000
```

**⚠️ IMPORTANT**: Production should use the SAME Supabase project during development. Later, you may create a separate production Supabase project.

#### Step 7.3: Update `.env.example`

Update `.env.example` (for documentation, safe to commit):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# LinkedIn OAuth (Optional)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_REDIRECT_URI=warrendeleonapp://oauth/linkedin/callback

# App Configuration
APP_ENV=development
API_TIMEOUT=10000
```

#### Step 7.4: Verify `.gitignore`

Ensure `.gitignore` contains:

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
.env.*.local
```

**Expected Result**: Environment variables configured, never committed to git.

---

### Phase 8: Verification & Testing (30 minutes)

#### Step 8.1: Test Database Connection with SQL Editor

Navigate to **Database** → **SQL Editor** → **New query**:

**Test query**:

```sql
-- Verify profiles table exists
SELECT * FROM profiles LIMIT 10;

-- Should return 0 rows (table empty)
```

**Click** "Run"

**Expected Result**: Query succeeds, returns 0 rows (table exists but empty).

#### Step 8.2: Test RLS Policies

Try to insert data as anonymous user (should fail):

```sql
-- This should FAIL (RLS prevents anonymous insert)
INSERT INTO profiles (id, email, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  'Test User'
);
```

**Expected Result**: Error message about RLS policy (this is correct behavior).

#### Step 8.3: Test Storage Bucket

Navigate to **Storage** → **profile-pictures**:

1. **Click** "Upload file"
2. **Select** any test image
3. **Upload** to folder `test/test-image.jpg`
4. **Click** on uploaded file → "Get public URL"
5. **Copy** URL and open in browser

**Expected Result**: Image loads in browser (public access works).

Delete test image after verification.

#### Step 8.4: Test Auth REST API with Postman/curl

**Test 1: Sign Up (Create Account)**

```bash
curl -X POST 'https://[your-project-id].supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Response** (200 OK):

```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "email_confirmed_at": null,
    ...
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here",
    ...
  }
}
```

**Test 2: Check Email Inbox**

- Check `test@example.com` inbox for verification email
- Verify email template looks correct
- Click link to confirm email

**Test 3: Sign In**

```bash
curl -X POST 'https://[your-project-id].supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Response** (200 OK with access_token).

**Cleanup**: Delete test user from **Authentication** → **Users**.

---

## Files Modified

```
(root)/
├── .env.development          # Created - Supabase dev credentials
├── .env.production           # Created - Supabase prod credentials
└── .env.example              # Modified - Added Supabase placeholders
```

**Note**: Supabase configuration is entirely in Supabase dashboard, no code files modified yet.

---

## Troubleshooting

### Issue 1: "relation auth.users does not exist"

**Cause**: Foreign key setup before auth schema ready.

**Fix**:

- Wait 5 minutes for Supabase to fully provision
- Retry foreign key creation
- Or skip foreign key (not critical, just best practice)

### Issue 2: RLS Policy Error - "no policy allows insert"

**Cause**: RLS policy USING vs WITH CHECK confusion.

**Fix**:

- **INSERT**: Only needs `WITH CHECK` (what can be inserted)
- **SELECT/DELETE**: Only needs `USING` (what can be accessed)
- **UPDATE**: Needs both `USING` (current state) and `WITH CHECK` (new state)

### Issue 3: Storage Upload Fails - "new row violates row-level security policy"

**Cause**: Storage folder structure doesn't match RLS policy.

**Fix**:

- Ensure files uploaded to `{user_id}/filename.jpg` structure
- Verify `(storage.foldername(name))[1]` matches `auth.uid()`
- Test with hardcoded user ID first

### Issue 4: Email Verification Not Sending

**Cause**: Email provider not configured or redirect URL missing.

**Fix**:

- Verify Email provider is enabled
- Check redirect URL matches app deep link scheme
- Check Supabase email logs: **Authentication** → **Logs**
- For testing, disable email confirmation temporarily

### Issue 5: API Test Returns 401 Unauthorized

**Cause**: Wrong API key or missing `apikey` header.

**Fix**:

- Verify using **anon key** (not service role key)
- Ensure `apikey` header matches key from dashboard
- Check project URL is correct

---

## Security Checklist

Before marking this task complete, verify:

- [ ] **RLS enabled** on all tables (profiles)
- [ ] **RLS policies** tested and working (users can't access others' data)
- [ ] **Storage RLS** configured (users can't delete others' pictures)
- [ ] **Service role key NEVER in .env files** (use anon key only)
- [ ] **.env files in .gitignore** (never committed)
- [ ] **Email verification enabled** (prevents spam accounts)
- [ ] **Strong database password** saved in password manager
- [ ] **HTTPS enforced** (Supabase uses HTTPS by default)
- [ ] **Test account deleted** (don't leave test users in production)

---

## Validation

### RNTL Tests

**N/A** - This is a configuration task, no React Native code yet.

### E2E Tests

**N/A** - Manual verification via Postman/curl sufficient.

### Manual Testing

- [x] Created Supabase account
- [x] Created project
- [x] Created profiles table with all columns
- [x] Enabled RLS with 4 policies
- [x] Created storage bucket with 4 policies
- [x] Enabled email + magic link auth
- [x] Configured LinkedIn OAuth (if ready)
- [x] Created `.env.development` and `.env.production`
- [x] Tested database with SQL query
- [x] Tested RLS prevents unauthorized access
- [x] Tested storage public access
- [x] Tested auth API with curl/Postman
- [x] Verified email verification works

---

## Dependencies

### Depends On (Blockers)

**None** - This is the first task.

### Blocks (Dependent Tasks)

- **ALL OTHER TASKS** in EPIC-021 depend on this configuration
- **TASK-188**: LinkedIn OAuth setup (parallel, can be done simultaneously)
- **TASK-192**: Supabase Auth REST API Client (needs SUPABASE_URL and SUPABASE_ANON_KEY)
- **TASK-198**: Supabase Storage API Client (needs storage bucket)

---

## Additional Resources

### Supabase Official Documentation

- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Auth](https://supabase.com/docs/guides/auth)
- [Database](https://supabase.com/docs/guides/database)

### Video Tutorials (Recommended for First-Time Users)

- [Supabase in 100 Seconds](https://www.youtube.com/watch?v=zBZgdTb-dns) - Quick overview
- [Supabase Crash Course](https://www.youtube.com/watch?v=7uKQBl9uZ00) - 1 hour tutorial

### Supabase Limits (Free Tier)

- Database: 500MB
- Storage: 1GB
- Bandwidth: 5GB/month
- Monthly Active Users: 50,000
- API Requests: Unlimited
- Paused after 1 week inactivity (resume instantly)

### Internal References

- [US-033: Email/Password Registration](../stories/US-033-email-password-registration.md)
- [EPIC-021: Registration & Profile Setup](../epics/EPIC-021-registration-profile-setup.md)
- [Project Security Standards](../../readme/SECURITY.md)

---

**Estimated Time**: 4 hours (first-time setup with learning)

**Actual Time**: _To be tracked_

**Last Updated**: 2025-11-21
