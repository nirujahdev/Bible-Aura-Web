# 🔧 Google OAuth & Magic Link Setup - Complete Fix Guide

## 🚨 Current Errors:
```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
Magic link authentication not working
```

## ✅ **STEP 1: Fix Google OAuth Setup**

### **Google Cloud Console Configuration:**

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project** or create a new one
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID** or create a new one

### **Add CORRECT Authorized Redirect URIs:**

⚠️ **CRITICAL**: Use these **EXACT** URIs (note `/auth/v1/callback` not `/auth/callback`):

```
https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback
```

**For Development:**
```
http://localhost:8080
http://127.0.0.1:8080
```

**For Production (when deployed):**
```
https://your-production-domain.com
```

---

## ✅ **STEP 2: Supabase Dashboard Configuration**

### **Go to Supabase Dashboard:**
1. **Visit**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project**: `foleepziqgrdgkljedux`
3. **Navigate to**: Authentication → Settings

### **Configure Auth Providers:**

#### **A. Enable Google Provider:**
1. Go to **Authentication → Settings → Auth Providers**
2. **Enable Google** provider
3. **Add your Google OAuth credentials**:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. **Save settings**

#### **B. Configure Email Settings:**
1. Go to **Authentication → Settings → Email**
2. **Enable email confirmations** if not already enabled
3. **Set Site URL** to: `http://localhost:8080` (for development)
4. **Set Redirect URLs** to: `http://localhost:8080/dashboard`

#### **C. Enable Magic Links:**
1. In **Authentication → Settings → Auth Providers**
2. **Enable Email** provider
3. **Check "Enable email confirmations"**
4. **Check "Enable magic link"**

---

## ✅ **STEP 3: Environment Variables (if needed)**

Create a `.env.local` file in your project root with:
```
VITE_SUPABASE_URL=https://foleepziqgrdgkljedux.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbGVlcHppcWdyZGdrbGplZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxNTgsImV4cCI6MjA2NzY1NTE1OH0.XyTKj6ayTYWnoJRUrkKyuNlQSfE6PMGeBHDdafqMs9g
```

---

## ✅ **STEP 4: Testing Steps**

1. **Save all settings** in both Google Console and Supabase
2. **Wait 5-10 minutes** for changes to propagate
3. **Restart your development server**: `npm run dev`
4. **Test Magic Link**: Try signing in with email (check spam folder)
5. **Test Google OAuth**: Try "Sign in with Google" button
6. **Check browser console** for any errors

---

## 🔍 **Quick Checklist:**

- [ ] Google Cloud Console OAuth 2.0 Client created
- [ ] **CORRECT** redirect URI added: `https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback`
- [ ] Google provider enabled in Supabase
- [ ] Client ID & Secret added to Supabase
- [ ] Email provider enabled in Supabase
- [ ] Magic links enabled in Supabase
- [ ] Site URL configured: `http://localhost:8080`
- [ ] Redirect URLs configured: `http://localhost:8080/dashboard`
- [ ] Development server restarted
- [ ] 5-10 minutes waited for propagation

---

## 🚨 **Common Issues & Fixes:**

### **Google OAuth Still Not Working:**
- Double-check redirect URI is **exactly**: `https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback`
- Ensure you're using the correct Google project
- Clear browser cache completely
- Try incognito/private browsing

### **Magic Links Not Working:**
- Check spam/junk folder
- Verify email provider is enabled in Supabase
- Ensure Site URL matches your development URL
- Check Supabase logs for email delivery issues

### **Still Getting 404 Errors:**
- Verify your Supabase project URL is correct
- Check if Supabase project is active and not paused
- Restart development server: `npm run dev`

**🎉 Once all steps are complete, both Google OAuth and Magic Links should work perfectly!** 