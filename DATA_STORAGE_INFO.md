# 📊 Bible Reading Planner - Data Storage Information

## 🗄️ **How Data is Stored**

The Bible Reading Planner uses **localStorage** (browser-based storage) to save your reading plans and progress.

---

## 📁 **Storage Keys**

### **1. Reading Plan** (`bibleAuraReadingPlan`)
Stores the complete reading plan with all days and progress.

**Structure:**
```json
{
  "preferences": {
    "scope": "Whole Bible",
    "specificBooks": [],
    "duration": 90,
    "daysPerWeek": 5,
    "readingSize": "Auto",
    "language": "English"
  },
  "days": [
    {
      "day": 1,
      "reading": ["Genesis 1", "Genesis 2"],
      "completed": false,
      "date": "2025-01-13"
    },
    {
      "day": 2,
      "reading": ["Genesis 3", "Genesis 4"],
      "completed": true,
      "date": "2025-01-14"
    }
    // ... more days
  ],
  "createdAt": "2025-01-13T10:00:00.000Z",
  "startDate": "2025-01-13"
}
```

### **2. Preferences** (`bibleAuraReadingPreferences`)
Stores user preferences separately for quick access.

**Structure:**
```json
{
  "scope": "New Testament",
  "duration": 30,
  "daysPerWeek": 7,
  "readingSize": "Medium",
  "language": "English"
}
```

---

## 🔄 **How It Works**

### **Creating a Plan:**
1. User completes 5-step wizard
2. `generateReadingPlan()` creates deterministic plan
3. Plan saved to `localStorage` with key `bibleAuraReadingPlan`

### **Marking Days Complete:**
1. User clicks on a day card
2. `updateDayCompletion()` updates the specific day
3. Updated plan saved back to `localStorage`
4. Stats recalculated and UI refreshed

### **Loading on Page Load:**
1. `loadPlan()` reads from `localStorage`
2. If plan exists, display it
3. If no plan, show wizard

### **Progress Tracking:**
- Completed days count
- Total days count
- Percentage calculation: `(completed / total) * 100`
- Streak: consecutive completed days from day 1

---

## 💾 **localStorage Functions**

### **Save Plan**
```typescript
savePlan(plan: ReadingPlan): void
```
Saves the entire plan to localStorage

### **Load Plan**
```typescript
loadPlan(): ReadingPlan | null
```
Retrieves the plan from localStorage

### **Reset Plan**
```typescript
resetPlan(): void
```
Deletes the plan from localStorage

### **Update Day Completion**
```typescript
updateDayCompletion(dayNumber: number, completed: boolean): void
```
Toggles a specific day's completion status

### **Get Stats**
```typescript
getCompletionStats(): { 
  completed: number; 
  total: number; 
  percentage: number; 
  streak: number 
}
```
Calculates current progress statistics

---

## 🔒 **Data Persistence**

### **Advantages:**
✅ **No backend needed** - Works offline
✅ **Instant access** - No API calls
✅ **Privacy** - Data stays on user's device
✅ **Fast** - No network latency

### **Limitations:**
⚠️ **Per-browser** - Data doesn't sync across devices
⚠️ **Can be cleared** - If user clears browser data
⚠️ **No backup** - Lost if browser cache cleared

---

## 🔄 **Future: Database Integration**

If you want to sync across devices, you could integrate with **Supabase**:

### **Tables Needed:**

#### `reading_plans`
```sql
CREATE TABLE reading_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  preferences JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  start_date DATE NOT NULL
);
```

#### `reading_plan_days`
```sql
CREATE TABLE reading_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES reading_plans(id),
  day_number INTEGER NOT NULL,
  reading TEXT[] NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  UNIQUE(plan_id, day_number)
);
```

### **Migration Steps:**
1. Create Supabase tables
2. Update `src/lib/storage.ts` to use Supabase instead of localStorage
3. Add sync logic to push/pull data
4. Keep localStorage as fallback/cache

---

## 📊 **Current Storage Size**

A typical 90-day plan uses approximately:
- **Plan data**: ~5-10 KB
- **Preferences**: ~500 bytes
- **Total**: ~10-15 KB (very small!)

localStorage limit: **5-10 MB** (plenty of space)

---

## 🔍 **Viewing Stored Data**

To see your stored data:

1. **Open Browser DevTools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Navigate to **Local Storage** → `http://localhost:5173` or your domain
4. Find keys:
   - `bibleAuraReadingPlan`
   - `bibleAuraReadingPreferences`

---

## 🎯 **Key Features**

### **1. Deterministic Generation**
- Same inputs = Same plan
- No randomness
- Predictable chapter distribution

### **2. Progress Tracking**
- Real-time completion stats
- Streak counter
- Percentage calculation

### **3. Flexible Views**
- Daily: Individual day cards
- Weekly: Grouped by weeks
- Calendar: Visual grid layout

### **4. Reset Capability**
- Delete plan anytime
- Create new plan from scratch
- Preserves preferences

---

**Your reading plan data is stored locally and privately on your device!** 🔐

