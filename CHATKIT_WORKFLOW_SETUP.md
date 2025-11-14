# 🔧 ChatKit Workflow Setup Guide

## ✅ **Your ChatKit Configuration**

You have provided the following configuration details. **Add these to your Vercel environment variables:**

---

## 📋 **Environment Variables to Add in Vercel**

### **Step 1: Go to Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Bible Aura** project
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add These Variables**

Add the following environment variables:

#### **Required Variables:**

```env
CHATKIT_WORKFLOW_ID=wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0
CHATKIT_WORKFLOW_VERSION=1
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

#### **Optional Variable (if using domain key):**

```env
CHATKIT_DOMAIN_KEY=domain_pk_your-domain-key-here
```

**⚠️ IMPORTANT:** Replace the placeholder values above with your actual keys. Do NOT commit actual API keys to Git.

---

## 🔒 **Security Notes**

⚠️ **IMPORTANT:**
- ✅ These values are **NOT** stored in code
- ✅ They are stored securely in Vercel environment variables
- ✅ Never commit API keys to Git
- ✅ Never share these keys publicly

---

## 📝 **How to Add in Vercel**

### **For Each Variable:**

1. Click **"Add New"** button
2. Enter the **Key** (e.g., `CHATKIT_WORKFLOW_ID`)
3. Enter the **Value** (e.g., `wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0`)
4. Select **Environment**: 
   - ✅ **Production**
   - ✅ **Preview** (optional, for testing)
   - ✅ **Development** (optional, for local dev)
5. Click **"Save"**

---

## ✅ **Verification Checklist**

After adding all variables:

- [ ] `CHATKIT_WORKFLOW_ID` is set
- [ ] `CHATKIT_WORKFLOW_VERSION` is set (value: `1`)
- [ ] `OPENAI_API_KEY` is set
- [ ] `CHATKIT_DOMAIN_KEY` is set (if needed)
- [ ] All variables are enabled for **Production** environment
- [ ] Redeploy your application after adding variables

---

## 🚀 **After Adding Variables**

1. **Redeploy your application:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger auto-deploy

2. **Test the AI Chat:**
   - Go to your deployed site
   - Open the AI Chat
   - Send a test message
   - Check browser console for: `[Bible Aura AI] ✓ ChatKit Workflow success`

---

## 🔍 **Troubleshooting**

### **If AI Chat doesn't work:**

1. **Check Vercel Logs:**
   - Go to **Deployments** → Latest deployment → **Functions** tab
   - Check `/api/bibleaura-chat` function logs
   - Look for error messages

2. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to **Console** tab
   - Look for error messages starting with `[Bible Aura AI]`

3. **Common Issues:**

   **"ChatKit Workflow not configured"**
   - ✅ Ensure `CHATKIT_WORKFLOW_ID` is set in Vercel
   - ✅ Ensure it's enabled for Production environment
   - ✅ Redeploy after adding

   **"OpenAI API key not configured"**
   - ✅ Ensure `OPENAI_API_KEY` is set in Vercel
   - ✅ Check the key is valid and has credits
   - ✅ Ensure it's enabled for Production environment

   **"Workflow execution failed"**
   - ✅ Check your workflow ID is correct
   - ✅ Verify workflow exists in OpenAI Platform
   - ✅ Check workflow version matches

---

## 📊 **Your Configuration Summary**

| Variable | Example Value | Status |
|----------|---------------|--------|
| `CHATKIT_WORKFLOW_ID` | `wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0` | ✅ Use your actual workflow ID |
| `CHATKIT_WORKFLOW_VERSION` | `1` | ✅ Usually 1 |
| `OPENAI_API_KEY` | `sk-proj-...` | ✅ Use your actual API key |
| `CHATKIT_DOMAIN_KEY` | `domain_pk_...` | ✅ Optional - use if needed |

---

## 🎯 **Next Steps**

1. ✅ Add all variables to Vercel
2. ✅ Redeploy your application
3. ✅ Test AI Chat functionality
4. ✅ Verify workflow is being used (check console logs)

---

## 📝 **Notes**

- The workflow ID starts with `wf_` - this is correct
- The domain key starts with `domain_pk_` - this is for organization-level access
- The API key starts with `sk-proj-` - this is a project-level key
- All values should be added **exactly as shown** (no extra spaces)

---

**Your ChatKit Workflow is now configured!** 🎉

After adding these to Vercel and redeploying, your AI chat will use the workflow exclusively.

