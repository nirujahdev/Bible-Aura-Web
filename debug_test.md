# 🐛 Bible Aura Debug Guide

## 🚨 **STEP 1: Run Database Debug Query**

Copy and paste this SQL in **Supabase SQL Editor**:

```sql
-- 1. Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_favorites', 'user_bookmarks', 'journal_entries');

-- 2. If no tables found, run this:
-- (Copy the entire contents of fix_bible_features_v2.sql)

-- 3. Check your user ID
SELECT auth.uid();

-- 4. Test insert (replace YOUR_USER_ID with result from step 3)
INSERT INTO user_favorites (
    user_id, verse_id, book_name, chapter, verse_number, 
    verse_text, verse_reference, translation
) VALUES (
    'YOUR_USER_ID_HERE', 
    'Genesis-1-1', 
    'Genesis', 
    1, 
    1, 
    'In the beginning God created the heaven and the earth.', 
    'Genesis 1:1', 
    'KJV'
);
```

## 🚨 **STEP 2: Check Browser Console**

1. Open Bible page: `/bible`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try clicking the ❤️ (heart) icon on any verse
5. Look for error messages starting with ❌

**Expected Console Messages:**
```
🔍 Adding to favorites: {userId: "...", verse: {...}, translation: "KJV"}
📝 Inserting favorite data: {...}
✅ Favorite added successfully: {...}
```

**If you see errors like:**
- `relation "user_favorites" does not exist` → Run the SQL migration
- `permission denied` → Check RLS policies
- `auth.uid() is null` → Sign out and sign back in

## 🚨 **STEP 3: Check Action Buttons Visibility**

### **Are the action buttons visible?**

In the Bible reader, each verse should have **3 small icons** after the verse text:
- ⭐ **First icon**: AI/Analysis (orange)
- ❤️ **Second icon**: Favorites (red when favorited)
- 🔖 **Third icon**: Bookmarks (blue when bookmarked) 
- 📝 **Fourth icon**: Journal (green hover)

### **If buttons are NOT visible:**
1. Check if you're signed in
2. Try refreshing the page
3. Try a different verse/chapter
4. Check browser zoom level (should be 100%)

### **If buttons are visible but not working:**
- Check browser console for errors
- Verify you ran the SQL migration
- Try signing out and back in

## 🚨 **STEP 4: Test Each Function**

### **Test Favorites (❤️):**
1. Click heart icon on any verse
2. Should show toast: "Added to favorites" 
3. Go to `/favorites` → **Favorites tab**
4. Should see the verse listed with full text

### **Test Bookmarks (🔖):**
1. Click bookmark icon on any verse  
2. Should show toast: "Bookmarked"
3. Go to `/favorites` → **Bookmarks tab**
4. Should see the verse listed with full text

### **Test Journal (📝):**
1. Click journal/file icon on any verse
2. Should show toast: "Added to Journal"
3. Go to `/journal` page
4. Should see new entry with reflection template

## 🚨 **STEP 5: Common Fixes**

### **If "Failed to save to favorites" error:**
```sql
-- Check if user_favorites table exists:
SELECT * FROM user_favorites LIMIT 1;

-- If error "relation does not exist", run the full migration:
-- (Copy entire fix_bible_features_v2.sql)
```

### **If buttons not visible:**
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh page (Ctrl+F5)  
- Check if signed in (top right corner)

### **If journal button missing:**
- The button might be the 📝 (FileText) icon
- It should be the 4th icon after each verse
- Try hovering over icons to see tooltips

## 🚨 **STEP 6: Emergency Reset**

If nothing works, run this in Supabase SQL Editor:

```sql
-- Clean slate - removes all existing data!
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE; 
DROP TABLE IF EXISTS journal_entries CASCADE;

-- Then run the full migration again:
-- (Copy entire fix_bible_features_v2.sql)
```

## 📞 **Report Results**

After testing, report:
1. ✅/❌ Tables exist in database
2. ✅/❌ Buttons are visible  
3. ✅/❌ Console errors found
4. ✅/❌ Functions working
5. Copy any error messages you see

## 🎯 **Expected Working State**

When everything works:
- ❤️ Heart icon: Saves to favorites, turns red
- 🔖 Bookmark icon: Saves to bookmarks, turns blue  
- 📝 Journal icon: Creates journal entry
- `/favorites` page shows 2 tabs with full verse text
- All functions show success toasts 