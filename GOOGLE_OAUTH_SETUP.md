# 🔧 Google OAuth Setup - Fix Redirect URI Mismatch

## 🚨 Current Error:
```
Error 400: redirect_uri_mismatch
redirect_uri=https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback
```

## ✅ Solution Steps:

### 1. **Google Cloud Console Setup**

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project** or create a new one
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID** or create a new one

### 2. **Add Authorized Redirect URIs**

In your OAuth 2.0 Client settings, add these **exact** URIs:

```
https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback
```

**For Development (if testing locally):**
```
http://localhost:8080/auth/callback
http://127.0.0.1:8080/auth/callback
```

**For Production (add your domain):**
```
https://bible-aura.vercel.app/auth/callback
https://your-production-domain.com/auth/callback
```

### 3. **Supabase Dashboard Configuration**

1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Navigate to**: Authentication → Settings → Auth Providers
3. **Enable Google Provider**
4. **Add your Google OAuth credentials**:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### 4. **Important Notes**

- ✅ **Exact Match Required**: URIs must match exactly (including https/http)
- ✅ **No Trailing Slash**: Don't add `/` at the end
- ✅ **Case Sensitive**: URIs are case-sensitive
- ✅ **Protocol Matters**: Use `https` for production, `http` for localhost

### 5. **Testing Steps**

1. **Save all settings** in both Google Console and Supabase
2. **Wait 5-10 minutes** for changes to propagate
3. **Test Google Sign In** from your auth page
4. **Check console logs** for any remaining errors

### 6. **Common Issues & Fixes**

#### **Issue**: Still getting redirect_uri_mismatch
**Fix**: 
- Double-check URI spelling in Google Console
- Ensure you're using the correct project in Google Cloud
- Clear browser cache and try again

#### **Issue**: OAuth popup blocked
**Fix**:
- Allow popups for your domain
- Use redirect flow instead of popup (already implemented)

#### **Issue**: "This app isn't verified"
**Fix**:
- Click "Advanced" → "Go to [App Name] (unsafe)" for testing
- For production, submit app for verification

---

## 🔍 **Quick Checklist:**

- [ ] Google Cloud Console project created/selected
- [ ] OAuth 2.0 Client ID created
- [ ] Correct redirect URI added to Google Console
- [ ] Google provider enabled in Supabase
- [ ] Client ID & Secret added to Supabase
- [ ] Changes saved and propagated (wait 5-10 min)
- [ ] Browser cache cleared
- [ ] Test Google Sign In

**Once these steps are complete, Google authentication should work perfectly! 🎉** 