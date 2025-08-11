# Community Database Setup Instructions

## 🚀 Quick Setup via Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to: https://app.supabase.com/project/foleepziqgrdgkljedux
2. Login with your Supabase account
3. Navigate to **SQL Editor** (left sidebar)

### Step 2: Execute Migration
1. Click **"New Query"** in the SQL Editor
2. Copy the entire content from: `supabase/migrations/20250205_complete_community_backend.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify Setup
After running the migration, verify these tables exist:
- `community_discussions` ✅
- `prayer_requests` ✅
- `community_groups` ✅ 
- `community_events` ✅
- `discussion_comments` ✅
- `group_memberships` ✅
- `prayer_interactions` ✅

## 🔧 Alternative: Command Line Setup

If you prefer command line:

### Install PostgreSQL Tools
```powershell
# Option 1: Chocolatey (if available)
choco install postgresql

# Option 2: Direct download
# Download from: https://www.postgresql.org/download/windows/
```

### Run Migration
```bash
psql -h db.foleepziqgrdgkljedux.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/20250205_complete_community_backend.sql
```

## 🧪 Test Your Setup

After setup, test your community features:

1. **Visit**: http://localhost:5173/community
2. **Try creating**: 
   - A new discussion
   - A prayer request
   - Joining a group

## 🛠️ Troubleshooting

### Common Issues:
- **"Table already exists"** - This is normal, ignore these errors
- **Permission denied** - Make sure you're logged into the correct Supabase project
- **Connection failed** - Check your internet connection and Supabase project status

### Need Help?
- Check the SQL Editor logs in Supabase dashboard
- Verify your project URL: `foleepziqgrdgkljedux.supabase.co`
- Contact support if issues persist

## 📋 What This Migration Creates

The migration sets up these features:
- **Community Discussions** - Bible study conversations
- **Prayer Requests** - Share and pray for others
- **Community Groups** - Join Bible study groups
- **Events** - Community gatherings and studies
- **User Profiles** - Enhanced community profiles
- **Notifications** - Stay updated on community activity

🎉 **Once complete, your Bible Aura community features will be fully functional!** 