# TASK-343: Admin OAuth Edge Function

**Task ID**: TASK-343
**Title**: Admin OAuth Edge Function
**User Story**: [US-062](../stories/US-062-booking-backend.md)
**Epic**: [EPIC-031](../epics/EPIC-031-book-a-call.md)
**Status**: 📋 To Do
**Priority**: High
**Effort**: 4h
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-342 (Database Schema)

---

## Context

The booking system requires Warren's Google Calendar access to create events and check availability. This Edge Function handles the complete OAuth 2.0 flow for Google Calendar, including:

- Initial authorisation URL generation
- OAuth callback handling with code exchange
- Secure token storage with encryption
- Automatic token refresh when expired
- Token validation and scope verification

This is an **admin-only** function - only Warren can authorise the application. The OAuth tokens are stored encrypted in the `admin_oauth` table and automatically refreshed when needed.

**Security Requirements**:

- Admin-only access (role check via RLS)
- PKCE (Proof Key for Code Exchange) for OAuth security
- Token encryption using Supabase pg_crypto
- Scope validation (calendar.readonly, calendar.events)
- State parameter validation to prevent CSRF

**OAuth Scopes Required**:

- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events and freebusy
- `https://www.googleapis.com/auth/calendar.events` - Create and manage calendar events

---

## Objective

Implement a Deno Edge Function that handles Google OAuth 2.0 flow for admin Google Calendar access, with automatic token refresh and secure storage.

**Deliverable**: Fully functional Edge Function with three endpoints:

1. `GET /admin-oauth/authorize` - Generate OAuth URL
2. `GET /admin-oauth/callback` - Handle OAuth callback
3. `POST /admin-oauth/refresh` - Manually refresh tokens

---

## Technical Implementation

### OAuth 2.0 Flow Sequence Diagram

```
┌─────────┐                ┌──────────────┐              ┌─────────────┐              ┌─────────────┐
│ Warren  │                │ Edge Function│              │   Google    │              │  Supabase   │
│ (Admin) │                │ (admin-oauth)│              │   OAuth     │              │  Database   │
└────┬────┘                └──────┬───────┘              └──────┬──────┘              └──────┬──────┘
     │                            │                             │                            │
     │ 1. GET /authorize          │                             │                            │
     │───────────────────────────>│                             │                            │
     │                            │                             │                            │
     │                            │ 2. Generate PKCE verifier   │                            │
     │                            │    and challenge            │                            │
     │                            │                             │                            │
     │                            │ 3. Store verifier in        │                            │
     │                            │    session/cookie           │                            │
     │                            │                             │                            │
     │ 4. OAuth URL with state    │                             │                            │
     │<───────────────────────────│                             │                            │
     │                            │                             │                            │
     │ 5. Redirect to Google      │                             │                            │
     │────────────────────────────────────────────────────────>│                            │
     │                            │                             │                            │
     │ 6. User grants permissions │                             │                            │
     │<───────────────────────────────────────────────────────>│                            │
     │                            │                             │                            │
     │ 7. GET /callback?code=...&state=...                      │                            │
     │───────────────────────────>│                             │                            │
     │                            │                             │                            │
     │                            │ 8. Validate state           │                            │
     │                            │                             │                            │
     │                            │ 9. Exchange code + verifier │                            │
     │                            │────────────────────────────>│                            │
     │                            │                             │                            │
     │                            │ 10. Access + refresh tokens │                            │
     │                            │<────────────────────────────│                            │
     │                            │                             │                            │
     │                            │ 11. Encrypt tokens          │                            │
     │                            │                             │                            │
     │                            │ 12. UPSERT admin_oauth      │                            │
     │                            │────────────────────────────────────────────────────────>│
     │                            │                             │                            │
     │                            │ 13. Success confirmation    │                            │
     │                            │<────────────────────────────────────────────────────────│
     │                            │                             │                            │
     │ 14. Success response       │                             │                            │
     │<───────────────────────────│                             │                            │
     │                            │                             │                            │


Later: Token Refresh Flow
     │                            │                             │                            │
     │ (Token expires)            │                             │                            │
     │                            │                             │                            │
     │ POST /refresh              │                             │                            │
     │───────────────────────────>│                             │                            │
     │                            │                             │                            │
     │                            │ 1. Fetch encrypted tokens   │                            │
     │                            │────────────────────────────────────────────────────────>│
     │                            │                             │                            │
     │                            │ 2. Decrypt refresh token    │                            │
     │                            │<────────────────────────────────────────────────────────│
     │                            │                             │                            │
     │                            │ 3. Request new access token │                            │
     │                            │────────────────────────────>│                            │
     │                            │                             │                            │
     │                            │ 4. New access token         │                            │
     │                            │<────────────────────────────│                            │
     │                            │                             │                            │
     │                            │ 5. Encrypt & UPDATE tokens  │                            │
     │                            │────────────────────────────────────────────────────────>│
     │                            │                             │                            │
     │ 6. Success response        │                             │                            │
     │<───────────────────────────│                             │                            │
```

### File Structure

```
supabase/
└── functions/
    └── admin-oauth/
        ├── index.ts                    # Main handler (routes requests)
        ├── authorize.ts                # Generate OAuth URL
        ├── callback.ts                 # Handle OAuth callback
        ├── refresh.ts                  # Refresh token endpoint
        ├── utils/
        │   ├── pkce.ts                 # PKCE generation (verifier, challenge)
        │   ├── encryption.ts           # Token encryption/decryption
        │   ├── validation.ts           # State and scope validation
        │   └── google-oauth-client.ts  # Google OAuth API client
        ├── types.ts                    # TypeScript types
        └── README.md                   # Usage documentation
```

### 1. Main Handler (index.ts)

Routes requests to appropriate handlers based on path and method.

```typescript
// supabase/functions/admin-oauth/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleAuthorize } from './authorize.ts';
import { handleCallback } from './callback.ts';
import { handleRefresh } from './refresh.ts';

/**
 * Admin OAuth Edge Function
 * Handles Google OAuth flow for admin calendar access
 *
 * Endpoints:
 * - GET  /admin-oauth/authorize - Generate OAuth URL
 * - GET  /admin-oauth/callback  - Handle OAuth callback
 * - POST /admin-oauth/refresh   - Refresh expired tokens
 */

serve(async (req: Request) => {
  // CORS headers for local development
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialise Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is authenticated and is admin
    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route based on URL path and method
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/authorize') && req.method === 'GET') {
      return await handleAuthorize(req, supabaseClient, user.id, corsHeaders);
    }

    if (path.endsWith('/callback') && req.method === 'GET') {
      return await handleCallback(req, supabaseClient, user.id, corsHeaders);
    }

    if (path.endsWith('/refresh') && req.method === 'POST') {
      return await handleRefresh(req, supabaseClient, user.id, corsHeaders);
    }

    // Unknown route
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin OAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 2. Authorize Endpoint (authorize.ts)

Generates OAuth authorisation URL with PKCE.

```typescript
// supabase/functions/admin-oauth/authorize.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generatePKCE } from './utils/pkce.ts';
import { generateState } from './utils/validation.ts';

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

export async function handleAuthorize(
  req: Request,
  supabase: SupabaseClient,
  adminUserId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // Get OAuth credentials from environment
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new Error(
        'Missing OAuth configuration (GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_REDIRECT_URI)'
      );
    }

    // Generate PKCE code verifier and challenge
    const { codeVerifier, codeChallenge } = await generatePKCE();

    // Generate state parameter (CSRF protection)
    const state = generateState();

    // Store verifier and state in session (temporary storage)
    // NOTE: In production, use encrypted HTTP-only cookie or database session
    // For simplicity, we'll use a temporary database table (pkce_sessions)
    await supabase.from('pkce_sessions').insert({
      admin_user_id: adminUserId,
      state,
      code_verifier: codeVerifier,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    // Build OAuth URL
    const authUrl = new URL(GOOGLE_OAUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPES.join(' '));
    authUrl.searchParams.set('access_type', 'offline'); // Request refresh token
    authUrl.searchParams.set('prompt', 'consent'); // Force consent screen (ensures refresh token)
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256'); // SHA-256 PKCE

    return new Response(
      JSON.stringify({
        authUrl: authUrl.toString(),
        state, // Return state for client-side validation (optional)
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Authorization error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate authorization URL', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

### 3. Callback Endpoint (callback.ts)

Handles OAuth callback, exchanges code for tokens, and stores encrypted tokens.

```typescript
// supabase/functions/admin-oauth/callback.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { exchangeCodeForTokens } from './utils/google-oauth-client.ts';
import { encryptToken } from './utils/encryption.ts';
import { validateState } from './utils/validation.ts';

export async function handleCallback(
  req: Request,
  supabase: SupabaseClient,
  adminUserId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return new Response(JSON.stringify({ error: 'OAuth error', details: error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!code || !state) {
      return new Response(JSON.stringify({ error: 'Missing code or state parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retrieve PKCE verifier from session
    const { data: sessionData, error: sessionError } = await supabase
      .from('pkce_sessions')
      .select('code_verifier, state')
      .eq('admin_user_id', adminUserId)
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !sessionData) {
      return new Response(JSON.stringify({ error: 'Invalid or expired state parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate state (CSRF protection)
    if (!validateState(state, sessionData.state)) {
      return new Response(JSON.stringify({ error: 'State mismatch (CSRF protection)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code, sessionData.code_verifier);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Missing access_token or refresh_token from Google OAuth');
    }

    // Encrypt tokens
    const encryptedAccessToken = await encryptToken(tokens.access_token);
    const encryptedRefreshToken = await encryptToken(tokens.refresh_token);

    // Calculate token expiration (Google typically returns 3600 seconds = 1 hour)
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();

    // Store encrypted tokens in database (UPSERT)
    const { error: upsertError } = await supabase.from('admin_oauth').upsert(
      {
        admin_user_id: adminUserId,
        provider: 'google',
        encrypted_access_token: encryptedAccessToken,
        encrypted_refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt,
        scopes: tokens.scope?.split(' ') || [],
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'admin_user_id,provider', // Update if exists
      }
    );

    if (upsertError) {
      throw new Error(`Failed to store tokens: ${upsertError.message}`);
    }

    // Clean up PKCE session
    await supabase
      .from('pkce_sessions')
      .delete()
      .eq('admin_user_id', adminUserId)
      .eq('state', state);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OAuth authorization successful',
        expiresAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Callback error:', error);
    return new Response(
      JSON.stringify({ error: 'OAuth callback failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

### 4. Refresh Endpoint (refresh.ts)

Manually refreshes OAuth tokens (also used by other Edge Functions automatically).

```typescript
// supabase/functions/admin-oauth/refresh.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { refreshAccessToken } from './utils/google-oauth-client.ts';
import { encryptToken, decryptToken } from './utils/encryption.ts';

export async function handleRefresh(
  req: Request,
  supabase: SupabaseClient,
  adminUserId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // Fetch current OAuth tokens
    const { data: oauthData, error: fetchError } = await supabase
      .from('admin_oauth')
      .select('encrypted_refresh_token, provider')
      .eq('admin_user_id', adminUserId)
      .eq('provider', 'google')
      .single();

    if (fetchError || !oauthData) {
      return new Response(
        JSON.stringify({ error: 'No OAuth tokens found. Please authorize first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt refresh token
    const refreshToken = await decryptToken(oauthData.encrypted_refresh_token);

    // Request new access token from Google
    const tokens = await refreshAccessToken(refreshToken);

    if (!tokens.access_token) {
      throw new Error('No access_token returned from Google refresh');
    }

    // Encrypt new access token
    const encryptedAccessToken = await encryptToken(tokens.access_token);

    // Calculate new expiration
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();

    // Update database with new access token
    const { error: updateError } = await supabase
      .from('admin_oauth')
      .update({
        encrypted_access_token: encryptedAccessToken,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('admin_user_id', adminUserId)
      .eq('provider', 'google');

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Access token refreshed successfully',
        expiresAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Refresh error:', error);
    return new Response(JSON.stringify({ error: 'Token refresh failed', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
```

### 5. Utility Functions

#### PKCE Generation (utils/pkce.ts)

```typescript
// supabase/functions/admin-oauth/utils/pkce.ts

/**
 * Generate PKCE (Proof Key for Code Exchange) parameters
 * https://tools.ietf.org/html/rfc7636
 */

/**
 * Generate random code verifier (43-128 characters, base64url)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32); // 32 bytes = 256 bits
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate code challenge from verifier using SHA-256
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Generate PKCE pair (verifier + challenge)
 */
export async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}

/**
 * Base64 URL-safe encoding (no padding)
 */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''); // Remove padding
}
```

#### Token Encryption (utils/encryption.ts)

```typescript
// supabase/functions/admin-oauth/utils/encryption.ts

/**
 * Encrypt/decrypt tokens using Supabase pg_crypto
 * NOTE: In Deno Edge Functions, we use Web Crypto API for encryption
 */

const ENCRYPTION_KEY = Deno.env.get('OAUTH_ENCRYPTION_KEY') || 'default-key-change-in-production';

/**
 * Encrypt token using AES-256-GCM
 */
export async function encryptToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);

  // Derive key from ENCRYPTION_KEY
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('supabase-oauth-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Return base64-encoded
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt token using AES-256-GCM
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Decode base64
  const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0));

  // Extract IV (first 12 bytes) and encrypted data
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  // Derive key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('supabase-oauth-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

  return decoder.decode(decrypted);
}
```

#### Google OAuth Client (utils/google-oauth-client.ts)

```typescript
// supabase/functions/admin-oauth/utils/google-oauth-client.ts

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
  const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI');

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing OAuth configuration');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing OAuth configuration');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return await response.json();
}
```

#### Validation Utilities (utils/validation.ts)

```typescript
// supabase/functions/admin-oauth/utils/validation.ts

/**
 * Generate random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(16); // 128 bits
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate state parameter (constant-time comparison)
 */
export function validateState(receivedState: string, storedState: string): boolean {
  if (receivedState.length !== storedState.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < receivedState.length; i++) {
    result |= receivedState.charCodeAt(i) ^ storedState.charCodeAt(i);
  }

  return result === 0;
}
```

### 6. TypeScript Types (types.ts)

```typescript
// supabase/functions/admin-oauth/types.ts

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

export interface PKCESession {
  admin_user_id: string;
  state: string;
  code_verifier: string;
  expires_at: string;
}

export interface AdminOAuthRecord {
  id: string;
  admin_user_id: string;
  provider: 'google';
  encrypted_access_token: string;
  encrypted_refresh_token: string;
  token_expires_at: string;
  scopes: string[];
  created_at: string;
  updated_at: string;
}
```

---

## Environment Variables

Add to `.env` and Supabase Edge Function secrets:

```bash
# Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://your-project.supabase.co/functions/v1/admin-oauth/callback

# Token Encryption Key (generate strong random key)
OAUTH_ENCRYPTION_KEY=your-256-bit-encryption-key-change-in-production
```

Set secrets in Supabase:

```bash
supabase secrets set GOOGLE_OAUTH_CLIENT_ID=your-client-id
supabase secrets set GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
supabase secrets set GOOGLE_OAUTH_REDIRECT_URI=https://your-project.supabase.co/functions/v1/admin-oauth/callback
supabase secrets set OAUTH_ENCRYPTION_KEY=your-encryption-key
```

---

## Testing Strategy

### Manual Testing

1. **Authorization Flow**:

   ```bash
   curl -H "Authorization: Bearer YOUR_ADMIN_JWT" \
     https://your-project.supabase.co/functions/v1/admin-oauth/authorize
   ```

   - Should return OAuth URL
   - Visit URL in browser, grant permissions
   - Should redirect to callback with code and state

2. **Token Refresh**:

   ```bash
   curl -X POST -H "Authorization: Bearer YOUR_ADMIN_JWT" \
     https://your-project.supabase.co/functions/v1/admin-oauth/refresh
   ```

   - Should return new access token and expiration

3. **Database Verification**:
   ```sql
   SELECT admin_user_id, provider, token_expires_at, scopes
   FROM admin_oauth
   WHERE admin_user_id = 'YOUR_ADMIN_USER_ID';
   ```

### Security Testing

- [ ] Non-admin user cannot call endpoints (403 Forbidden)
- [ ] Invalid state parameter rejected (CSRF protection)
- [ ] Expired PKCE session rejected (10 minute timeout)
- [ ] Tokens stored encrypted in database
- [ ] Refresh token rotation (if Google supports it)

---

## Acceptance Criteria

- [ ] `/authorize` endpoint generates valid OAuth URL with PKCE
- [ ] `/callback` endpoint exchanges code for tokens successfully
- [ ] `/refresh` endpoint refreshes expired tokens
- [ ] All tokens stored encrypted in `admin_oauth` table
- [ ] State parameter validated (CSRF protection)
- [ ] PKCE verifier validated (OAuth security)
- [ ] Only admin users can access endpoints (role check)
- [ ] Token expiration tracked accurately
- [ ] Automatic token refresh on expiration (used by other Edge Functions)
- [ ] TypeScript strict mode compliance
- [ ] All error cases handled with descriptive messages
- [ ] Environment variables validated on startup

---

## Edge Cases & Error Handling

| Scenario                           | Expected Behaviour                                   |
| ---------------------------------- | ---------------------------------------------------- |
| Missing OAuth credentials in env   | Throw error on startup with clear message            |
| User denies OAuth consent          | Return error from callback with Google error details |
| Invalid/expired authorization code | Return 400 with token exchange error                 |
| State parameter mismatch           | Return 400 CSRF error                                |
| PKCE session expired (>10 min)     | Return 400 expired session error                     |
| Refresh token invalid/revoked      | Return error, require re-authorization               |
| Token encryption fails             | Return 500 with encryption error                     |
| Database connection fails          | Return 500 with database error                       |
| Non-admin user attempts access     | Return 403 Forbidden                                 |
| Missing Authorization header       | Return 401 Unauthorized                              |

---

## Dependencies

- **Blocked by**: TASK-342 (Database Schema - needs admin_oauth table)
- **Blocks**:
  - TASK-344 (Get Availability - needs OAuth tokens to query Google Calendar)
  - TASK-345 (Create Booking - needs OAuth tokens to create events)

---

## Additional Notes

### PKCE Sessions Table

Create temporary table for PKCE session storage:

```sql
-- Migration: 20250125000006_create_pkce_sessions.sql

CREATE TABLE pkce_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pkce_sessions_unique_state UNIQUE (state)
);

CREATE INDEX idx_pkce_sessions_expires ON pkce_sessions(expires_at);
CREATE INDEX idx_pkce_sessions_admin ON pkce_sessions(admin_user_id);

-- Auto-delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_pkce_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM pkce_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Run cleanup periodically (pg_cron extension)
-- SELECT cron.schedule('delete-expired-pkce', '*/5 * * * *', 'SELECT delete_expired_pkce_sessions()');
```

---

**Estimated Time**: 4h
**Last Updated**: 2025-11-25
