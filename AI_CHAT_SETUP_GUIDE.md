# 🔧 AI Chat Setup Guide - Bible Aura

## Problem: AI Chat Not Working

Your AI chat isn't working because it needs proper configuration to connect to OpenAI's API.

---

## 📋 **What You Need**

1. **OpenAI API Key** - Get from https://platform.openai.com/api-keys
2. **ChatKit Workflow ID** (Optional - for advanced workflows)
3. **Supabase Project** (for saving conversations)

---

## 🚀 **Quick Fix - Option 1: Simple Direct API Setup**

If you don't have a ChatKit workflow setup, we can simplify the AI chat to use OpenAI's API directly.

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### Step 2: Create Environment File

Create a file named `.env.local` in your project root:

```env
# Supabase (you should already have these)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# OpenAI API Key (ADD THIS)
OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# App URL
VITE_APP_URL=http://localhost:5173
```

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

---

## 🔧 **Option 2: Full ChatKit Workflow Setup**

If you have an OpenAI ChatKit workflow:

### Step 1: Configure Workflow

Add to your `.env.local`:

```env
# ChatKit Configuration
VITE_CHATKIT_WORKFLOW_ID=your_workflow_id_here
VITE_CHATKIT_WORKFLOW_VERSION=1
VITE_CHATKIT_API_ENDPOINT=/api/bibleaura-chat

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Step 2: Vercel Deployment (Production)

In your Vercel project settings, add these environment variables:

```
OPENAI_API_KEY=sk-your-openai-api-key
CHATKIT_WORKFLOW_ID=your_workflow_id
CHATKIT_WORKFLOW_VERSION=1
CHATKIT_ALLOWED_ORIGIN=https://bibleaura.xyz
```

---

## 🐛 **Debugging**

### Check if API is configured:

1. Open browser console (F12)
2. Look for errors like:
   - ❌ `OpenAI API key not configured`
   - ❌ `ChatKit workflow ID not configured`
   - ❌ `Failed to fetch`

### Common Issues:

**Issue 1: "API key not configured"**
- **Fix:** Add `OPENAI_API_KEY` to `.env.local`

**Issue 2: "Workflow ID not configured"**
- **Fix:** Add `VITE_CHATKIT_WORKFLOW_ID` to `.env.local` OR switch to direct API mode

**Issue 3: "Failed to fetch" or "Network error"**
- **Fix:** Check your internet connection
- **Fix:** Make sure dev server is running (`npm run dev`)
- **Fix:** In production, check Vercel deployment logs

**Issue 4: API works in development but not production**
- **Fix:** Add environment variables to Vercel project settings

---

## 🔄 **Switching to Direct API Mode (Recommended for Now)**

If ChatKit is too complex, I can simplify your AI chat to use OpenAI's API directly without workflows:

### Benefits:
- ✅ Simpler setup
- ✅ Faster responses
- ✅ Easier to debug
- ✅ Only need OpenAI API key

### Changes needed:
1. Modify `src/lib/chatkit.ts` to call OpenAI directly
2. Skip the workflow complexity
3. Keep all the same features

---

## 📊 **Current Architecture**

```
User Input
    ↓
BibleAuraChat Component
    ↓
sendBibleAuraMessage() [src/lib/chatkit.ts]
    ↓
/api/bibleaura-chat [api/bibleaura-chat.ts] (Vercel Function)
    ↓
OpenAI ChatKit Workflow
    ↓
Response back to user
```

---

## ✅ **What to Do Next**

1. **Check your `.env.local` file** - Do you have it?
2. **Add your OpenAI API key** if missing
3. **Restart your dev server**
4. **Test the AI chat**

If it's still not working, let me know and I can:
- Simplify the AI chat to use direct API calls
- Help you debug the specific error
- Set up a fallback system

---

## 🆘 **Need Help?**

Tell me:
1. Do you have an OpenAI API key?
2. Do you have a `.env.local` file?
3. What error do you see in the browser console?

I'll help you fix it! 🚀

