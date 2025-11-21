# TASK-188: Create LinkedIn Developer App

**Task ID**: TASK-188
**Title**: Create LinkedIn Developer App for OAuth Authentication
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: 📋 To Do
**Priority**: Critical
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

LinkedIn OAuth allows users to register/login using their LinkedIn account, automatically extracting their professional profile picture and verified contact information. This task sets up the LinkedIn Developer App required for OAuth integration.

**Why LinkedIn?**

- Free for standard OAuth authentication
- Aligns with professional portfolio app
- Provides verified email addresses
- Professional profile pictures (higher quality than casual social media)
- Common authentication method for career-focused apps

This task obtains the Client ID and Client Secret needed for OAuth flow.

---

## Objective

Create and configure LinkedIn Developer Application to enable OAuth authentication:

1. Create LinkedIn Developer account
2. Create new OAuth application
3. Configure OAuth redirect URIs
4. Request required permissions (r_liteprofile, r_emailaddress)
5. Obtain Client ID and Client Secret
6. Store credentials securely in `.env` files
7. Test credentials with Postman before integration

**Deliverable**: LinkedIn Client ID and Client Secret saved in `.env.development` and `.env.production`.

---

## Acceptance Criteria

- [ ] **LinkedIn Developer account created** at https://developer.linkedin.com
- [ ] **New app created** with appropriate name and description
- [ ] **OAuth redirect URIs configured** for development and production
- [ ] **Required permissions requested** (r_liteprofile, r_emailaddress)
- [ ] **Client ID obtained** and saved in `.env` files
- [ ] **Client Secret obtained** and saved in `.env` files
- [ ] **Credentials tested** with Postman/curl to verify OAuth flow works
- [ ] **Privacy policy URL** added (required for production apps)
- [ ] **Logo uploaded** (optional but recommended)

---

## Detailed Implementation Guide

### Phase 1: LinkedIn Developer Account Creation (15 minutes)

#### Step 1.1: Navigate to LinkedIn Developers

1. **Open browser** and go to https://developer.linkedin.com
2. **Click** "Get started" or "My Apps" (top-right)
3. **Sign in** with your LinkedIn account (the one you use professionally)

**Expected Result**: You should see the LinkedIn Developer dashboard.

#### Step 1.2: Verify LinkedIn Account Requirements

LinkedIn requires a complete profile to create developer apps:

- **Profile must have**: Real name, profile picture, current position, education
- **Account must be**: At least 7 days old (to prevent spam)
- **Email must be**: Verified

If your account doesn't meet requirements:

- Complete your LinkedIn profile
- Wait if account is too new
- Verify email if prompted

**Expected Result**: Dashboard shows "Create app" button (not disabled).

---

### Phase 2: Create New Application (20 minutes)

#### Step 2.1: Click "Create app"

1. **Navigate** to **My Apps** → **Create app** button
2. **Fill in** application details:

**App name**:

```
Warren de Leon Portfolio
```

**LinkedIn Page**:

- Select your personal LinkedIn page
- If you don't have a company page, you can use your personal profile
- **Alternative**: Create a company page for "Warren de Leon Development" (takes 2 minutes)

**Privacy policy URL** (Required):

```
https://warrendeleon.com/privacy
```

**⚠️ If you don't have a privacy policy yet**:

- Use a temporary placeholder: `https://www.privacypolicyonline.com/live.php?token=YOUR_TOKEN`
- Generate free privacy policy at https://www.privacypolicygenerator.info
- Or use this minimal template:

```markdown
# Privacy Policy

Last updated: 2025-11-21

## Data Collection

We collect:

- Email address (from LinkedIn)
- Full name (from LinkedIn)
- Profile picture URL (from LinkedIn)

## Data Usage

Your data is used solely for authentication and profile creation within the Warren de Leon Portfolio app.

## Data Storage

Data is stored securely using Supabase with encryption at rest.

## Data Sharing

We do not share your data with third parties.

## Contact

For privacy concerns, contact: your-email@example.com
```

**App logo** (Optional but recommended):

- Upload square logo (400×400px minimum)
- PNG or JPG format
- Professional-looking icon or personal branding

3. **Check** "I have read and agree to the LinkedIn APIs Terms of Use"
4. **Click** "Create app"

**Expected Result**: App created, redirected to app settings page.

---

### Phase 3: Configure OAuth Settings (30 minutes)

#### Step 3.1: Navigate to "Auth" Tab

On your app's dashboard:

1. **Click** "Auth" tab in the sidebar
2. **Scroll** to "OAuth 2.0 settings" section

#### Step 3.2: Add Redirect URLs

**⚠️ CRITICAL**: Redirect URLs must match exactly what Supabase expects.

**Authorized redirect URLs for your app**:

Add ALL of these URLs (click "+ Add redirect URL" for each):

1. **Supabase callback** (CRITICAL):

   ```
   https://[your-supabase-project-id].supabase.co/auth/v1/callback
   ```

   Replace `[your-supabase-project-id]` with actual project ID from TASK-187.

2. **React Native deep link** (for direct OAuth without Supabase):

   ```
   warrendeleonapp://oauth/linkedin/callback
   ```

3. **Development testing** (optional, for Expo Go):
   ```
   http://localhost:19006/auth/callback
   ```

**How to find Supabase Project ID**:

- Go to Supabase dashboard → Settings → General
- Project ID is in the "Reference ID" field
- Or extract from Project URL: `https://[project-id].supabase.co`

**Example** (if your Supabase project ID is `abcdefgh12345678`):

```
https://abcdefgh12345678.supabase.co/auth/v1/callback
```

4. **Click** "Update" after adding all URLs

**Expected Result**: All redirect URLs saved (you should see them listed).

---

### Phase 4: Request Required Permissions (20 minutes)

#### Step 4.1: Navigate to "Products" Tab

1. **Click** "Products" tab in sidebar
2. **Scroll** to find available products

#### Step 4.2: Request "Sign In with LinkedIn using OpenID Connect"

1. **Find** "Sign In with LinkedIn using OpenID Connect" product
2. **Click** "Request access"
3. **Fill in** access request form:
   - **Why do you need access?**: "To enable users to register and log in to Warren de Leon Portfolio app using their LinkedIn credentials. This provides a seamless authentication experience and allows us to access verified professional profile information."
   - **How will you use the data?**: "We will retrieve the user's email address and basic profile information (name, profile picture) to create their account. This data is stored securely and used solely for authentication purposes."
4. **Submit** request

**Expected Result**: Request submitted. LinkedIn may approve instantly or within 24 hours.

#### Step 4.3: Verify Granted Permissions

Once approved (check email or dashboard):

Navigate to **Auth** tab → **OAuth 2.0 scopes**:

**Verify these scopes are listed**:

- `openid` (required for OAuth)
- `profile` (access to name, profile picture)
- `email` (access to email address)

**If scopes not visible**:

- Wait for LinkedIn approval (check email)
- Approval usually takes 1-24 hours
- For instant approval: Use basic "Sign In with LinkedIn" (r_liteprofile + r_emailaddress)

**Alternative if "OpenID Connect" pending**:

- Request "Sign In with LinkedIn" product instead
- Provides scopes: `r_liteprofile`, `r_emailaddress`
- Works identically for our use case

---

### Phase 5: Obtain Credentials (10 minutes)

#### Step 5.1: Copy Client ID

Navigate to **Auth** tab:

1. **Find** "OAuth 2.0 settings" section
2. **Copy** "Client ID" (long alphanumeric string)
3. **Save** to secure note temporarily

**Example Client ID**: `78abcd1234567890`

#### Step 5.2: Copy Client Secret

1. **Find** "Client Secret" field
2. **Click** "Show" to reveal secret
3. **Copy** Client Secret (longer alphanumeric string)
4. **Save** to secure note (NEVER commit to git)

**⚠️ SECURITY WARNING**:

- Client Secret is like a password
- NEVER commit to git
- NEVER share publicly
- Store only in `.env` files (which are gitignored)

**Example Client Secret**: `xY9zAbC123dEf456GhI789jKl012MnO3`

---

### Phase 6: Store Credentials Securely (15 minutes)

#### Step 6.1: Update `.env.development`

Open `/Users/warrendeleon/Developer/warrendeleon/.env.development`:

Add these lines (or update if already exist):

```bash
# LinkedIn OAuth (Development)
LINKEDIN_CLIENT_ID=78abcd1234567890
LINKEDIN_CLIENT_SECRET=xY9zAbC123dEf456GhI789jKl012MnO3
LINKEDIN_REDIRECT_URI=warrendeleonapp://oauth/linkedin/callback
LINKEDIN_SCOPES=openid,profile,email
```

Replace with your actual credentials.

#### Step 6.2: Update `.env.production`

Open `/Users/warrendeleon/Developer/warrendeleon/.env.production`:

Add the SAME credentials (we're using one LinkedIn app for both dev and prod during development):

```bash
# LinkedIn OAuth (Production)
LINKEDIN_CLIENT_ID=78abcd1234567890
LINKEDIN_CLIENT_SECRET=xY9zAbC123dEf456GhI789jKl012MnO3
LINKEDIN_REDIRECT_URI=warrendeleonapp://oauth/linkedin/callback
LINKEDIN_SCOPES=openid,profile,email
```

**Note**: In a real production scenario, you'd create a separate LinkedIn app for production, but for now one app is sufficient.

#### Step 6.3: Update `.env.example`

Open `/Users/warrendeleon/Developer/warrendeleon/.env.example`:

Add placeholders (safe to commit):

```bash
# LinkedIn OAuth (Optional)
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=warrendeleonapp://oauth/linkedin/callback
LINKEDIN_SCOPES=openid,profile,email
```

#### Step 6.4: Verify `.gitignore`

Ensure `.env.development` and `.env.production` are in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
.env.*.local
```

**Expected Result**: Credentials saved securely, never committed to git.

---

### Phase 7: Test LinkedIn OAuth Flow (30 minutes)

**⚠️ IMPORTANT**: Test credentials BEFORE integration to catch issues early.

#### Step 7.1: Test with Postman

**Install Postman** (if not already): https://www.postman.com/downloads/

**Create new request**:

1. **Method**: GET
2. **URL** (construct authorization URL):

   ```
   https://www.linkedin.com/oauth/v2/authorization
     ?response_type=code
     &client_id=78abcd1234567890
     &redirect_uri=https://[supabase-project-id].supabase.co/auth/v1/callback
     &scope=openid%20profile%20email
     &state=random_string_12345
   ```

   Replace:
   - `78abcd1234567890` with your Client ID
   - `[supabase-project-id]` with actual Supabase project ID
   - `random_string_12345` with any random string (CSRF protection)

3. **Paste URL in browser** (Postman can't open OAuth dialog)
4. **Authorize** the app with your LinkedIn account
5. **After authorization**, you'll be redirected to Supabase callback URL with `code` parameter

**Expected URL after redirect**:

```
https://[supabase-project-id].supabase.co/auth/v1/callback?code=AQTAb...&state=random_string_12345
```

**Copy the `code` parameter** (long string after `code=`, before `&state`).

#### Step 7.2: Exchange Code for Access Token

**Create new Postman request**:

1. **Method**: POST
2. **URL**: `https://www.linkedin.com/oauth/v2/accessToken`
3. **Body** (x-www-form-urlencoded):
   - `grant_type`: `authorization_code`
   - `code`: [paste code from step 7.1]
   - `redirect_uri`: `https://[supabase-project-id].supabase.co/auth/v1/callback`
   - `client_id`: `78abcd1234567890`
   - `client_secret`: `xY9zAbC123dEf456GhI789jKl012MnO3`

4. **Send request**

**Expected Response** (200 OK):

```json
{
  "access_token": "AQVdN...long_token",
  "expires_in": 5184000,
  "scope": "openid,profile,email"
}
```

**If you get an error**:

- `invalid_client`: Client ID or Secret wrong
- `invalid_redirect_uri`: Redirect URI doesn't match LinkedIn app settings
- `invalid_grant`: Code expired (codes expire in 30 seconds, repeat step 7.1)

#### Step 7.3: Fetch User Profile

**Create new Postman request**:

1. **Method**: GET
2. **URL**: `https://api.linkedin.com/v2/me`
3. **Headers**:
   - `Authorization`: `Bearer AQVdN...` (access token from step 7.2)
4. **Send request**

**Expected Response** (200 OK):

```json
{
  "localizedFirstName": "Warren",
  "localizedLastName": "de Leon",
  "profilePicture": {
    "displayImage": "urn:li:digitalmediaAsset:..."
  },
  ...
}
```

**Success!** LinkedIn OAuth is working correctly.

---

## Files Modified

```
(root)/
├── .env.development          # Modified - Added LinkedIn OAuth credentials
├── .env.production           # Modified - Added LinkedIn OAuth credentials
└── .env.example              # Modified - Added LinkedIn OAuth placeholders
```

---

## Troubleshooting

### Issue 1: "App not approved for Sign In with LinkedIn"

**Cause**: LinkedIn app verification pending or rejected.

**Fix**:

- Check LinkedIn email for approval status
- Resubmit access request with more detailed justification
- Use "r_liteprofile" and "r_emailaddress" scopes instead of OpenID Connect
- Contact LinkedIn support if rejected

### Issue 2: "redirect_uri_mismatch" Error

**Cause**: Redirect URI in OAuth request doesn't match LinkedIn app settings.

**Fix**:

- Verify redirect URI in LinkedIn app settings matches exactly
- Check for typos, trailing slashes, http vs https
- Supabase redirect URI must be: `https://[project-id].supabase.co/auth/v1/callback` (no trailing slash)

### Issue 3: "invalid_client_id" Error

**Cause**: Client ID incorrect or app deleted.

**Fix**:

- Double-check Client ID copied correctly
- Verify app still exists in LinkedIn Developer dashboard
- Ensure no hidden characters (copy-paste issue)

### Issue 4: Authorization Code Expires Immediately

**Cause**: LinkedIn authorization codes expire in 30 seconds.

**Fix**:

- Complete token exchange within 30 seconds of receiving code
- Use Postman to test, not manual curl (faster)
- In production, app will handle this automatically

### Issue 5: Can't Access Profile Picture

**Cause**: LinkedIn changed profile picture API (common).

**Fix**:

- Use `/v2/me` endpoint with `profilePicture` projection
- Extract `displayImage` URL from response
- Resolve image URL using `GET /v2/me?projection=(profilePicture(displayImage~:playableStreams))` for full-size picture
- Refer to latest LinkedIn API docs: https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api

---

## Security Checklist

Before marking this task complete, verify:

- [ ] **Client Secret NEVER committed** to git
- [ ] **Client Secret only in .env files** (which are gitignored)
- [ ] **.env files in .gitignore** (verified)
- [ ] **Redirect URIs use HTTPS** (except localhost for development)
- [ ] **State parameter used** in OAuth flow (CSRF protection)
- [ ] **Test credentials work** via Postman before integration
- [ ] **Privacy policy URL valid** and accessible
- [ ] **LinkedIn app approved** for required scopes

---

## Validation

### Manual Testing

- [x] Created LinkedIn Developer account
- [x] Created new app with correct details
- [x] Added all required redirect URIs (Supabase + deep link)
- [x] Requested and received "Sign In with LinkedIn" approval
- [x] Copied Client ID and Client Secret
- [x] Saved credentials in `.env.development` and `.env.production`
- [x] Verified `.env` files gitignored
- [x] Tested OAuth flow with Postman (authorization → token → profile)
- [x] Verified access to email and profile data
- [x] Privacy policy URL accessible

---

## Dependencies

### Depends On (Blockers)

**TASK-187**: Supabase Setup (need Supabase project ID for redirect URI)

**⚠️ NOTE**: Can be done in parallel with TASK-187 if you know your Supabase project ID.

### Blocks (Dependent Tasks)

- **TASK-205**: LinkedIn OAuth Flow Implementation (needs Client ID/Secret)
- **US-034**: LinkedIn OAuth Registration (entire user story depends on this)

---

## Additional Resources

### LinkedIn OAuth Documentation

- [LinkedIn OAuth 2.0](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Developer Portal](https://developer.linkedin.com)
- [Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)
- [OAuth Best Practices](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/best-practices/overview)

### OAuth 2.0 Standards

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

### Internal References

- [US-034: LinkedIn OAuth Registration](../stories/US-034-linkedin-oauth-registration.md)
- [EPIC-021: Registration & Profile Setup](../epics/EPIC-021-registration-profile-setup.md)
- [TASK-187: Supabase Setup](./TASK-187-supabase-setup-security-config.md)

---

**Estimated Time**: 2 hours (including approval wait time)

**Actual Time**: _To be tracked_

**Last Updated**: 2025-11-21
