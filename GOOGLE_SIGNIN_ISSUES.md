# Google Sign-In Issues - Diagnostic Guide

## Overview
This document outlines the potential issues with Google OAuth sign-in and how to fix them.

## ✅ Database Fixes Applied

**Migration Applied**: `fix_google_oauth_improvements`
- ✅ Fixed `handle_new_user` function with proper `search_path` security
- ✅ Improved OAuth user detection (checks multiple metadata locations)
- ✅ Enhanced error handling in trigger function
- ✅ Verified trigger exists and is active
- ✅ Confirmed RLS policies allow profile creation

**Status**: Database schema is properly configured for Google OAuth users.

## Common Issues

### 1. **Supabase Configuration Issue**
**Problem**: Google OAuth provider not configured in Supabase dashboard.

**Symptoms**:
- Error: "Google sign-in is not properly configured"
- Error: "not configured" or "not enabled" in console

**Fix**:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Google" provider
3. Add your Google OAuth Client ID and Client Secret
4. Add authorized redirect URLs:
   - `http://localhost:5173/auth` (development)
   - `https://yourdomain.com/auth` (production)

### 2. **Google Cloud Console Configuration**
**Problem**: OAuth credentials not set up in Google Cloud Console.

**Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID (if not exists)
3. Add authorized redirect URIs:
   - `https://[your-project-ref].supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth` (for local dev)
   - `https://yourdomain.com/auth` (for production)

### 3. **Database Profile Creation Issue**
**Problem**: OAuth users fail to create profiles because required fields are not nullable.

**Symptoms**:
- Error: "Database error saving new user"
- User signs in but profile is not created

**Fix**: Run the migration file `database/FIX_GOOGLE_OAUTH.sql`:
```sql
-- This makes phone_number, age, and display_name nullable
-- And updates the trigger to handle OAuth users properly
```

**To apply the fix**:
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `database/FIX_GOOGLE_OAUTH.sql`
3. Verify the trigger exists and is active

### 4. **Redirect URL Mismatch**
**Problem**: Redirect URL in code doesn't match Supabase/Google settings.

**Current Code** (in `src/hooks/useAuth.tsx`):
```typescript
const redirectUrl = `${window.location.origin}/auth`;
```

**Fix**: Ensure this matches:
- Supabase Auth → URL Configuration → Redirect URLs
- Google Cloud Console → OAuth 2.0 → Authorized redirect URIs

### 5. **OAuth Callback Handling**
**Problem**: Complex callback logic may cause timing issues.

**Current Implementation**: 
- Located in `src/pages/Auth.tsx` (lines 127-240)
- Uses multiple useEffect hooks to detect OAuth callbacks
- Has 10-second timeout for authentication

**Potential Issues**:
- Race conditions between session loading and redirect
- URL hash not being properly parsed
- Session not persisting after OAuth redirect

## Diagnostic Steps

### Step 1: Check Supabase Configuration
```bash
# Check if Google provider is enabled
# Go to: Supabase Dashboard → Authentication → Providers → Google
```

### Step 2: Check Browser Console
Look for these errors:
- `Google OAuth error: ...`
- `not configured`
- `not enabled`
- `unauthorized`
- `popup blocked`

### Step 3: Check Network Tab
- Look for failed requests to Supabase auth endpoints
- Check if redirect is happening correctly

### Step 4: Verify Database Trigger
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if profile columns are nullable
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('phone_number', 'age', 'display_name');
```

### Step 5: Test OAuth Flow
1. Click "Sign in with Google"
2. Complete Google authentication
3. Check if redirect to `/auth` happens
4. Check if session is created
5. Check if profile is created in database

## Quick Fixes

### Fix 1: Apply Database Migration
```bash
# Run this in Supabase SQL Editor
# File: database/FIX_GOOGLE_OAUTH.sql
```

### Fix 2: Update Redirect URL
If your domain changed, update:
- `src/hooks/useAuth.tsx` line 467
- Supabase Dashboard → Authentication → URL Configuration
- Google Cloud Console → OAuth 2.0 → Authorized redirect URIs

### Fix 3: Enable Google Provider
1. Supabase Dashboard → Authentication → Providers
2. Toggle "Google" to ON
3. Enter Client ID and Secret
4. Save

## Error Messages Reference

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "not configured" | Google provider not enabled in Supabase | Enable in Supabase Dashboard |
| "not enabled" | Same as above | Enable in Supabase Dashboard |
| "unauthorized" | Domain not authorized in Google Console | Add domain to authorized redirect URIs |
| "popup blocked" | Browser blocked popup | Allow popups for your site |
| "Database error saving new user" | Profile creation failed | Run FIX_GOOGLE_OAUTH.sql migration |

## Testing Checklist

- [ ] Google provider enabled in Supabase
- [ ] Google OAuth credentials configured
- [ ] Redirect URLs match in all places
- [ ] Database migration applied (FIX_GOOGLE_OAUTH.sql)
- [ ] Trigger function exists and is active
- [ ] Profile columns are nullable
- [ ] OAuth callback handling works
- [ ] Session persists after redirect
- [ ] Profile is created for OAuth users

## Support

If issues persist:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Check browser console for detailed errors
3. Verify all configuration steps above
4. Test with a fresh browser session (incognito mode)

