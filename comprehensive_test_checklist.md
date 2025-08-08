# Bible Aura Features Test Checklist ✅

## 🗄️ **Database Setup** (Run in Supabase SQL Editor)
```sql
-- Run this SQL migration first:
-- fix_bible_features_v2.sql
```

## 🧪 **Test Plan**

### ✅ **1. Journal Delete Function**
- [ ] Go to `/journal` page
- [ ] Create a test journal entry
- [ ] **Calendar View**: Hover over entry → see Edit/Delete buttons
- [ ] **List View**: Click 3-dot menu → see Edit/Delete options  
- [ ] Click Delete → confirmation dialog appears
- [ ] Confirm deletion → entry disappears immediately
- [ ] Check database: entry should be deleted

### ✅ **2. Bible Verse - Add to Favorites**
- [ ] Go to `/bible` page (e.g., Genesis 1)
- [ ] Find any verse
- [ ] Click **Heart ❤️ icon** 
- [ ] Should show "Added to favorites" toast
- [ ] Go to `/favorites` page
- [ ] **Favorites tab**: Should show the verse with full text
- [ ] Verify: `book_name chapter:verse` format
- [ ] Verify: Full verse text displayed

### ✅ **3. Bible Verse - Add to Bookmarks**  
- [ ] Go to `/bible` page
- [ ] Find any verse
- [ ] Click **Bookmark 🔖 icon**
- [ ] Should show "Bookmarked" toast
- [ ] Go to `/favorites` page  
- [ ] **Bookmarks tab**: Should show the verse with full text
- [ ] Verify: Category badge (study/prayer/etc.)
- [ ] Verify: Full verse text displayed

### ✅ **4. Bible Verse - Add to Journal**
- [ ] Go to `/bible` page
- [ ] Find any verse  
- [ ] Click **Journal 📝 icon** (FileText icon)
- [ ] Should show "Added to Journal" toast
- [ ] Go to `/journal` page
- [ ] Should see new entry with:
  - [ ] Title: "BookName Chapter:Verse Reflection"
  - [ ] Pre-filled reflection template
  - [ ] Verse reference and text included

### ✅ **5. Favorites Page Structure**
- [ ] Go to `/favorites` page
- [ ] Should see **2 tabs only**:
  - [ ] **Favorites** (Heart icon) 
  - [ ] **Bookmarks** (Bookmark icon)
- [ ] **NO Highlights tab** (removed)
- [ ] **NO Notes tab** (removed)

### ✅ **6. Full Verse Text Display**
- [ ] **Favorites tab**: Each verse shows complete text
- [ ] **Bookmarks tab**: Each verse shows complete text  
- [ ] Format: `"Full verse text here" - BookName Chapter:Verse`
- [ ] Translation info displayed

### ✅ **7. Database Schema Verification**
```sql
-- Check table structure:
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('user_favorites', 'user_bookmarks', 'journal_entries')
ORDER BY table_name, ordinal_position;
```

## 🎯 **Expected Results**

| Feature | Expected Behavior | Status |
|---------|------------------|--------|
| **Journal Delete** | Entries can be deleted with confirmation | ✅ |
| **Favorites** | Heart icon saves to separate favorites table | ✅ |  
| **Bookmarks** | Bookmark icon saves to separate bookmarks table | ✅ |
| **Journal Creation** | Journal icon creates reflection entry | ✅ |
| **Full Text Display** | Complete verses shown in favorites/bookmarks | ✅ |
| **No Highlights Tab** | Highlights tab removed from favorites page | ✅ |

## 🐛 **Troubleshooting**

### If Journal Button Not Visible:
- Check browser console for errors
- Verify user is signed in  
- Check if button is rendered but not visible (CSS issues)

### If Save Functions Fail:
- Run the SQL migration first
- Check Supabase logs for RLS policy errors
- Verify user authentication

### If Data Not Showing:
- Check correct table names are being used
- Verify data exists in database
- Check RLS policies are applied correctly

## 📋 **Database Tables Structure**

### `user_favorites`
- Stores ❤️ favorited verses only
- Separate from bookmarks

### `user_bookmarks`  
- Stores 🔖 bookmarked verses only
- Includes categorization and highlighting

### `journal_entries`
- Complete schema with all fields
- Supports verse references and full content

## 🔄 **Migration Commands**
```bash
# If you need to push changes:
git add .
git commit -m "Fix favorites/bookmarks separation and add full verse display"
git push origin main
``` 