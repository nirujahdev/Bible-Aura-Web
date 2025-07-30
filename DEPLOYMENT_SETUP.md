# 🚀 Bible Aura - Deployment & Setup Guide

This guide will walk you through setting up Bible Aura with all the enhanced Bible and Journal features.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account
- Git installed
- GitHub account (optional, for deployment)

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/nirujahdev/Bible-Aura.git
cd Bible-Aura
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

## 🗄️ Database Setup

### Option 1: Using Supabase CLI (Recommended)

#### Install Supabase CLI
```bash
# Using npm
npm install -g supabase

# Or using chocolatey (Windows)
choco install supabase

# Or download from https://github.com/supabase/cli/releases
```

#### Initialize Supabase
```bash
supabase login
supabase init
supabase start
```

#### Apply Migrations
```bash
supabase db push
```

### Option 2: Manual Database Setup

If you can't use the Supabase CLI, copy and run the SQL from `supabase/migrations/20250129-bible-features.sql` in your Supabase SQL editor.

#### Key Tables Created:
- `reading_progress` - Bible reading progress tracking
- `user_bookmarks` - User verse bookmarks
- `daily_verses` - Daily verse system
- Enhanced `journal_entries` - Journal with metadata, categories, mood tracking
- Enhanced `verse_highlights` - Verse highlighting system

## 📚 Bible Data Setup

The app uses local JSON files for Bible data (no database storage needed):

### English Bible (KJV)
- Located at: `public/Bible/KJV_bible.json`
- Structure: `{ "BookName": { "1": { "1": "verse text..." } } }`

### Tamil Bible
- Located at: `public/Bible/Tamil bible/`
- Individual book files: `Genesis.json`, `Matthew.json`, etc.
- Book list: `Books.json`

**Note**: Bible data is loaded from local JSON files for optimal performance and offline capability.

## 🔧 Configuration

### Supabase Configuration

1. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Users can only access their own data
   - Public read access for daily verses

2. **Authentication**
   - Email/password authentication
   - Google OAuth (optional)
   - Profile creation on signup

3. **Storage**
   - User avatars (optional)
   - Journal exports

### Environment Variables

Required environment variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id (for OAuth)
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   Add your Supabase credentials in Vercel dashboard

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node.js Version: 18.x

### Option 2: Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Add your Supabase credentials in Netlify dashboard

### Option 3: GitHub Pages

1. **Build and Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

## 🔒 Security Setup

### Supabase Security

1. **Row Level Security Policies**
   ```sql
   -- Users can only access their own data
   CREATE POLICY "Users manage own data" ON journal_entries
   FOR ALL USING (auth.uid() = user_id);
   
   CREATE POLICY "Users manage own bookmarks" ON user_bookmarks
   FOR ALL USING (auth.uid() = user_id);
   
   CREATE POLICY "Users manage own progress" ON reading_progress
   FOR ALL USING (auth.uid() = user_id);
   ```

2. **API Rate Limiting**
   - Configure rate limits in Supabase dashboard
   - Enable CAPTCHA for auth (optional)

### Environment Security

- Never commit `.env` files
- Use different keys for development/production
- Enable HTTPS in production
- Configure CORS properly

## 📱 PWA Setup (Optional)

Bible Aura includes PWA capabilities:

1. **Service Worker**
   - Located at `public/sw.js`
   - Caches Bible data for offline use

2. **Manifest**
   - Located at `public/manifest.json`
   - Configures app icons and display

3. **Installation**
   - Users can install as desktop/mobile app
   - Works offline for core features

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Database Testing
```bash
# Test migrations
supabase db reset
supabase db push

# Test with sample data
npm run seed-db
```

### Performance Testing
```bash
npm run build
npm run preview
```

## 📊 Monitoring & Analytics

### Supabase Analytics

1. **Database Performance**
   - Monitor query performance
   - Check storage usage
   - Review API usage

2. **User Analytics**
   - Track user registrations
   - Monitor feature usage
   - Review error logs

### Application Monitoring

1. **Error Tracking**
   - Use Sentry or similar service
   - Monitor JavaScript errors
   - Track API failures

2. **Performance Monitoring**
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals
   - Check mobile performance

## 🔄 Updates & Maintenance

### Database Migrations

When adding new features:
```bash
supabase migration new feature_name
# Edit the migration file
supabase db push
```

### Dependency Updates
```bash
npm update
npm audit fix
```

### Content Updates

1. **Bible Data Updates**
   - Replace JSON files in `public/Bible/`
   - Maintain same structure
   - Test thoroughly

2. **Feature Updates**
   - Update through normal git workflow
   - Test migrations in staging
   - Deploy to production

## 🆘 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Check environment variables
   - Verify project URL and keys
   - Check RLS policies

2. **Bible Data Loading Issues**
   - Verify JSON file structure
   - Check file paths
   - Review browser console for errors

3. **Build Issues**
   - Clear `node_modules` and reinstall
   - Check for TypeScript errors
   - Verify all imports

4. **Performance Issues**
   - Optimize Bible data loading
   - Implement pagination for journal entries
   - Use React.memo for expensive components

### Getting Help

1. **Documentation**
   - Check `BIBLE_JOURNAL_FEATURES.md` for feature details
   - Review component documentation
   - Check Supabase docs

2. **Community Support**
   - Create GitHub issues for bugs
   - Check existing issues for solutions
   - Join discussions for feature requests

## 📈 Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Authentication working
- [ ] Bible data loading correctly
- [ ] Journal features functional
- [ ] Search functionality working
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] Error handling implemented
- [ ] Backup strategy in place

## 🎯 Next Steps

After successful deployment:

1. **User Onboarding**
   - Create user guides
   - Add feature tutorials
   - Implement help system

2. **Feature Enhancements**
   - User feedback integration
   - Additional Bible translations
   - Community features

3. **Performance Optimization**
   - Implement caching
   - Optimize bundle size
   - Add service worker updates

---

## 🌟 Key Features Deployed

### 📖 Enhanced Bible Features
- ✅ Modern gradient UI with glass morphism
- ✅ Advanced search with filters
- ✅ 5-color highlighting system
- ✅ Reading progress tracking
- ✅ Daily verse widget
- ✅ Reading plans
- ✅ Font controls and navigation

### 📓 Enhanced Journal Features
- ✅ Beautiful purple gradient theme
- ✅ 4 structured templates
- ✅ 10 categories and mood tracking
- ✅ Analytics dashboard
- ✅ Bible verse integration
- ✅ Entry management and export
- ✅ Calendar view and filtering

### 🛠️ Technical Features
- ✅ Database schema and migrations
- ✅ Local Bible JSON integration
- ✅ Enhanced bookmark system
- ✅ Row-level security
- ✅ PWA capabilities
- ✅ Mobile-responsive design

**Your enhanced Bible Aura app is ready for spiritual growth! 🙏✨** 