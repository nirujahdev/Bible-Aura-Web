# 🔧 Google OAuth Setup for Bible Aura - Complete Guide

## ✅ **HOMEPAGE REQUIREMENTS - COMPLETED!**
Your Bible Aura homepage now meets all Google OAuth requirements:
- ✅ **App Identity**: Clear branding with "✦Bible Aura - AI-Powered Biblical Insight"
- ✅ **Functionality Description**: Comprehensive features overview including AI chat, Bible study, journals
- ✅ **Data Usage Transparency**: NEW - Added dedicated "Your Data & Privacy" section
- ✅ **Privacy Policy Link**: Available in footer and data section
- ✅ **Public Access**: Homepage visible without login
- ✅ **Professional Domain**: Using Vercel deployment (bible-aura.vercel.app)

## ✅ **STEP 1: Configure Google Cloud Console**

### **Google Cloud Console Configuration:**

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project** or create a new one
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID** or create a new one

### **Set Up OAuth Application:**

1. **Create OAuth 2.0 Client ID** (if not already created)
2. **Application Type**: Web application
3. **Name**: Bible Aura
4. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://bible-aura.vercel.app
   https://bible-aura.app (if you have custom domain)
   ```

5. **Authorized Redirect URIs** (⚠️ **CRITICAL - EXACT URIs**):
   ```
   https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback
   ```

### **Set App Homepage URL:**
In your OAuth consent screen configuration:
- **Application Homepage**: `https://bible-aura.vercel.app`
- **Privacy Policy**: `https://bible-aura.vercel.app/privacy`
- **Terms of Service**: `https://bible-aura.vercel.app/terms`

---

## ✅ **STEP 2: Extract Google OAuth Credentials**

### **From your downloaded credentials.json file:**
1. Open `C:\Users\benai\Downloads\credentials.json`
2. Copy the **Client ID** and **Client Secret** from the file
3. The file structure should look like:
   ```json
   {
     "web": {
       "client_id": "your-client-id-here.googleusercontent.com",
       "client_secret": "your-client-secret-here",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       "redirect_uris": [...]
     }
   }
   ```

---

## ✅ **STEP 3: Supabase Dashboard Configuration**

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

#### **B. Configure Site URL and Redirect URLs:**
1. Go to **Authentication → Settings → URL Configuration**
2. **Set Site URL** to: 
   - `http://localhost:5173` (development)
   - `https://bible-aura.vercel.app` (production)
3. **Set Redirect URLs** to: 
   - `http://localhost:5173/auth` (development)
   - `https://bible-aura.vercel.app/auth` (production)
   - `http://localhost:5173/dashboard` (development)
   - `https://bible-aura.vercel.app/dashboard` (production)

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

## ✅ **STEP 4: Deploy and Test**

### **Deploy Your Updated Homepage:**
1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add Google OAuth data transparency section"
   git push origin main
   ```

2. **Verify deployment** at `https://bible-aura.vercel.app`
3. **Check the new "Your Data & Privacy" section** is visible on homepage

### **Test OAuth:**
1. **Save all settings** in both Google Console and Supabase
2. **Wait 5-10 minutes** for changes to propagate
3. **Start development server**: `npm run dev`
4. **Test Google OAuth**: Try "Sign in with Google" button
5. **Test Magic Link**: Try signing in with email (check spam folder)
6. **Check browser console** for any errors

---

## 🔍 **Complete Setup Checklist:**

### **Homepage Requirements (✅ COMPLETED):**
- [x] **App Identity**: Clear branding and description
- [x] **Data Transparency**: Added "Your Data & Privacy" section
- [x] **Privacy Policy Link**: Available and accessible
- [x] **Public Access**: Homepage visible without login
- [x] **Professional Domain**: Deployed on Vercel

### **Google Cloud Console:**
- [ ] OAuth 2.0 Client ID created for "Bible Aura"
- [ ] Homepage URL set: `https://bible-aura.vercel.app`
- [ ] Privacy Policy URL set: `https://bible-aura.vercel.app/privacy`
- [ ] Authorized origins: `http://localhost:5173` and `https://bible-aura.vercel.app`
- [ ] **CRITICAL** redirect URI: `https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback`
- [ ] Downloaded credentials.json and extracted Client ID & Secret

### **Supabase Configuration:**
- [ ] Google provider enabled in Authentication → Settings
- [ ] Client ID & Secret from credentials.json added to Supabase
- [ ] Email provider enabled in Supabase
- [ ] Magic links enabled in Supabase
- [ ] Site URLs configured for dev (`http://localhost:5173`) and prod (`https://bible-aura.vercel.app`)
- [ ] Redirect URLs configured: `/auth` and `/dashboard` for both dev and prod domains

### **Deployment & Testing:**
- [ ] Changes committed and pushed to repository
- [ ] Vercel deployment verified at `https://bible-aura.vercel.app`
- [ ] 5-10 minutes waited for Google OAuth propagation
- [ ] Google OAuth tested successfully
- [ ] Magic link authentication tested

---

## 🚨 **Common Issues & Fixes:**

### **Google OAuth Still Not Working:**

#### **URL Mismatch Issues (Most Common):**
- **Google Cloud Console** redirect URI must be **exactly**: `https://foleepziqgrdgkljedux.supabase.co/auth/v1/callback`
- **Supabase redirect URLs** must include: 
  - `http://localhost:5173/auth` (development)
  - `https://bible-aura.vercel.app/auth` (production)
- **Check Supabase Dashboard** → Authentication → Settings → URL Configuration
- **Verify Site URL** matches your domain exactly

#### **Other Common Fixes:**
- Ensure you're using the correct Google project
- Clear browser cache completely
- Try incognito/private browsing
- Wait 5-10 minutes after making changes

### **Magic Links Not Working:**
- Check spam/junk folder
- Verify email provider is enabled in Supabase
- Ensure Site URL matches your development URL
- Check Supabase logs for email delivery issues

### **Still Getting 404 Errors:**
- Verify your Supabase project URL is correct
- Check if Supabase project is active and not paused
- Restart development server: `npm run dev`

---

## 🚀 **NEXT STEPS:**

### **1. Deploy Your Changes First:**
```bash
git add .
git commit -m "Add Google OAuth data transparency section"
git push origin main
```

### **2. Complete Google OAuth Setup:**
1. Open `C:\Users\benai\Downloads\credentials.json`
2. Copy the Client ID and Client Secret
3. Add them to your Supabase project in Authentication → Settings → Auth Providers → Google
4. Set all the URLs as specified in the checklist above

### **3. Test Everything:**
- Visit `https://bible-aura.vercel.app`
- Verify the new "Your Data & Privacy" section appears
- Test Google OAuth login
- Test magic link login

### **4. Domain Verification (Optional but Recommended):**
If you want to use a custom domain like `bible-aura.app`:
1. Purchase the domain
2. Add it to Vercel
3. Update all Google OAuth URLs to use the custom domain
4. Update Supabase URLs accordingly

---

## 🎯 **GOOGLE OAUTH APPROVAL:**
With your enhanced homepage showing clear data usage transparency, comprehensive app description, and proper legal pages, your app should meet all Google OAuth verification requirements for production use.

**🎉 Your Bible Aura app is now ready for Google OAuth verification!** 