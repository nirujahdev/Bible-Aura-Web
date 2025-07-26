# ✦Bible Aura - Production Deployment Guide

## 🚀 Complete Step-by-Step Production Deployment

This guide will walk you through deploying Bible Aura to production with all necessary optimizations, security measures, and monitoring in place.

---

## 📋 **Pre-Deployment Checklist**

### ✅ **Critical Requirements**
- [ ] **Node.js 18+** installed locally
- [ ] **Git** repository access
- [ ] **Vercel** account (recommended) or alternative hosting platform
- [ ] **Supabase** production project set up
- [ ] **OpenAI API** key for AI features
- [ ] **Domain name** registered (optional but recommended)

### ✅ **Optional Services**
- [ ] **Google Analytics** account for tracking
- [ ] **Sentry** account for error monitoring
- [ ] **Google OAuth** credentials for social login

---

## 🔧 **Step 1: Environment Configuration**

### 1.1 **Create Production Environment Variables**

Copy the `env.production.template` file and configure these **REQUIRED** variables:

```bash
# CRITICAL - Required for production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_OPENAI_API_KEY=sk-your_openai_api_key_here
VITE_APP_URL=https://yourdomain.com
NODE_ENV=production

# Optional but recommended
VITE_SENTRY_DSN=https://your_sentry_dsn_here
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### 1.2 **Verify Local Build**

```bash
# Install dependencies
npm install

# Test production build locally
npm run build

# Preview production build
npm run preview
```

**Expected Result:** Build completes without errors, bundle sizes are optimized.

---

## 🗄️ **Step 2: Database Setup**

### 2.1 **Set Up Production Supabase Project**

1. **Create New Project** at [supabase.com](https://supabase.com)
2. **Note down** your project URL and anon key
3. **Configure Authentication**:
   - Enable Email/Password auth
   - Set up OAuth providers (Google, etc.) if needed
   - Configure email templates using files in `supabase/email-templates/`

### 2.2 **Run Database Migrations**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push

# Verify tables were created
supabase db diff
```

### 2.3 **Configure Row Level Security (RLS)**

Verify these policies are active in your Supabase dashboard:
- ✅ `verse_highlights` table has user-specific RLS policies
- ✅ `reading_plans` table restricts access to plan owners
- ✅ `reading_progress` table isolates user data
- ✅ All sensitive tables have RLS enabled

---

## 🚀 **Step 3: Deploy to Vercel**

### 3.1 **Connect Repository**

1. **Push to GitHub**:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Bible Aura repository
   - Configure build settings (they should auto-detect)

### 3.2 **Configure Environment Variables in Vercel**

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from your `env.production.template`:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key_here
VITE_OPENAI_API_KEY = sk-your_openai_api_key_here
VITE_APP_URL = https://your-domain.vercel.app
NODE_ENV = production
```

### 3.3 **Deploy and Test**

1. **Deploy**: Click "Deploy" in Vercel
2. **Monitor Build**: Watch build logs for any errors
3. **Test Deployment**: Visit your deployment URL and test:
   - ✅ App loads without errors
   - ✅ User registration/login works
   - ✅ Bible content loads properly
   - ✅ AI chat functionality works
   - ✅ PWA features work (install prompt, offline mode)

---

## 🌐 **Step 4: Custom Domain Setup (Optional)**

### 4.1 **Add Custom Domain in Vercel**

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `bibleaura.com`)
3. Configure DNS records as shown by Vercel

### 4.2 **Update Environment Variables**

Update `VITE_APP_URL` in Vercel to use your custom domain:
```
VITE_APP_URL = https://yourdomain.com
```

### 4.3 **Update OAuth Redirects**

If using Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Update authorized redirect URIs to include your new domain
3. Update Supabase Auth settings with new domain

---

## 📊 **Step 5: Set Up Monitoring & Analytics**

### 5.1 **Error Monitoring with Sentry (Recommended)**

1. **Create Sentry Account** at [sentry.io](https://sentry.io)
2. **Create New Project** for React
3. **Add Sentry DSN** to Vercel environment variables:
```
VITE_SENTRY_DSN = https://your-sentry-dsn-here
```
4. **Install Sentry** (if not using built-in error tracking):
```bash
npm install @sentry/react
```

### 5.2 **Google Analytics Setup**

1. **Create GA4 Property** at [analytics.google.com](https://analytics.google.com)
2. **Get Tracking ID** (format: G-XXXXXXXXXX)
3. **Add to Vercel Environment Variables**:
```
VITE_GA_TRACKING_ID = G-XXXXXXXXXX
```

### 5.3 **Set Up Uptime Monitoring**

Use services like:
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

Monitor these endpoints:
- Main app: `https://yourdomain.com`
- API health: `https://yourdomain.com/dashboard`

---

## 🔒 **Step 6: Security Hardening**

### 6.1 **Review Security Headers**

Vercel automatically includes many security headers, but verify:
- ✅ HTTPS is enforced
- ✅ CSP headers are set
- ✅ HSTS is enabled

### 6.2 **API Key Security**

- ✅ OpenAI API key is properly restricted
- ✅ Supabase RLS policies are tested
- ✅ No sensitive data in client-side code

### 6.3 **Rate Limiting**

Our built-in rate limiter is active, but consider:
- Cloudflare for additional DDoS protection
- API rate limiting on Supabase side

---

## 🧪 **Step 7: Performance Testing**

### 7.1 **Run Lighthouse Audit**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test your production site
lighthouse https://yourdomain.com --output html
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### 7.2 **Test PWA Features**

- ✅ App installs correctly on mobile/desktop
- ✅ Offline mode works for cached content
- ✅ Service worker updates properly
- ✅ Push notifications work (if enabled)

---

## 📱 **Step 8: Mobile & Cross-Browser Testing**

### 8.1 **Test on Real Devices**

- **iOS Safari** (iPhone/iPad)
- **Android Chrome** (various screen sizes)
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)

### 8.2 **PWA Installation Testing**

- ✅ Install prompt appears appropriately
- ✅ App works offline after installation
- ✅ App icon and splash screen display correctly

---

## 🎯 **Step 9: SEO & Social Optimization**

### 9.1 **Verify Meta Tags**

Check these are properly set:
- ✅ Title tags for each page
- ✅ Meta descriptions
- ✅ Open Graph tags for social sharing
- ✅ Favicon and app icons

### 9.2 **Submit to Search Engines**

- Submit `sitemap.xml` to Google Search Console
- Submit to Bing Webmaster Tools
- Verify `robots.txt` is accessible

---

## 🚨 **Step 10: Launch Checklist**

### 10.1 **Final Pre-Launch Tests**

- [ ] **Authentication flow** works end-to-end
- [ ] **Bible content** loads properly (English & Tamil)
- [ ] **AI features** respond correctly
- [ ] **Journal/notes** save and sync properly
- [ ] **Search functionality** works across all content
- [ ] **Mobile responsiveness** is perfect
- [ ] **Error tracking** captures test errors
- [ ] **Analytics** tracks page views
- [ ] **PWA installation** works on multiple devices

### 10.2 **Performance Verification**

- [ ] **Page load time** < 3 seconds
- [ ] **First Contentful Paint** < 2 seconds
- [ ] **Largest Contentful Paint** < 4 seconds
- [ ] **Bundle sizes** are optimized (< 500KB per chunk)
- [ ] **Images** are optimized and lazy-loaded

### 10.3 **Security Final Check**

- [ ] **HTTPS** is enforced everywhere
- [ ] **Environment variables** are secure
- [ ] **API keys** have proper restrictions
- [ ] **User data** is properly isolated (RLS working)
- [ ] **Error messages** don't leak sensitive information

---

## 📈 **Post-Launch Monitoring**

### Week 1 Tasks
- [ ] Monitor error rates in Sentry
- [ ] Check Core Web Vitals in Search Console
- [ ] Review user registration/engagement metrics
- [ ] Test backup and recovery procedures

### Ongoing Maintenance
- [ ] **Weekly**: Review error logs and fix critical issues
- [ ] **Monthly**: Update dependencies and security patches
- [ ] **Quarterly**: Performance audit and optimization
- [ ] **As needed**: Feature updates and user feedback implementation

---

## 🆘 **Troubleshooting Common Issues**

### **Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Environment Variables Not Working**
- Ensure variables start with `VITE_` for client-side access
- Restart Vercel deployment after adding new variables
- Check variable names match exactly (case-sensitive)

### **Database Connection Issues**
- Verify Supabase URL and keys are correct
- Check RLS policies aren't blocking legitimate requests
- Monitor Supabase logs for specific errors

### **PWA Not Installing**
- Ensure HTTPS is working
- Check manifest.json is accessible
- Verify service worker is registered correctly
- Test on different browsers/devices

---

## 🎉 **Congratulations!**

If you've completed all steps, Bible Aura is now live and ready for users! 🚀

### **What's Next?**
- Share your app with beta users
- Gather feedback and iterate
- Monitor performance and user engagement
- Plan future feature releases

### **Need Help?**
- Check the error tracking dashboard for issues
- Review analytics for user behavior insights
- Monitor uptime and performance metrics
- Keep documentation updated as you add features

---

*✦Bible Aura - Bringing ancient wisdom to the modern world through technology* 