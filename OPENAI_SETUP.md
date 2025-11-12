# OpenAI Integration Setup Guide

## ✅ Setup Complete

OpenAI has been successfully integrated into your Bible Aura chat system. The integration includes:

- **OpenAI Agents** for intelligent conversation routing
- **Guardrails** for content safety (PII detection, moderation, jailbreak prevention, hallucination detection)
- **Language Detection** (English/Tamil)
- **Mode Classification** (chat, verse, parable, character, topical, qa)

## 🔐 Security Setup

### Step 1: Create `.env.local` file

Create a `.env.local` file in the root directory (if it doesn't exist) and add your OpenAI API key:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Replace `your_openai_api_key_here` with your actual OpenAI API key.**

### Step 2: Verify Security

✅ `.gitignore` is configured to exclude:
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `*.env` (all env files)
- But allows `*.env*.template` files

**IMPORTANT**: Never commit your `.env.local` file to Git. It's already in `.gitignore` for your protection.

## 📦 Installed Packages

The following packages have been installed:
- `openai` - OpenAI SDK
- `@openai/agents` - OpenAI Agents framework
- `@openai/guardrails` - Content safety guardrails
- `zod` - Schema validation

## 🔄 Changes Made

1. **Created** `src/lib/openai-workflow.ts` - Main OpenAI workflow service
2. **Updated** `src/components/BibleAuraChat.tsx` - Now uses OpenAI workflow instead of DeepSeek
3. **Updated** `env.local.template` - Added OpenAI API key placeholder
4. **Updated** `.gitignore` - Enhanced security for environment files
5. **Removed** hardcoded API keys from `src/lib/ai-bible-system.tsx`

## 🚀 Usage

The chat component will automatically use OpenAI when:
- `VITE_OPENAI_API_KEY` is set in your environment
- The workflow will handle language detection, mode classification, and safety checks automatically

## 🛡️ Safety Features

The integration includes multiple safety layers:

1. **PII Detection** - Blocks credit cards, SSN, passport numbers
2. **Content Moderation** - Filters inappropriate content
3. **Jailbreak Prevention** - Prevents prompt injection attacks
4. **Hallucination Detection** - Verifies responses against knowledge base

## 📝 Notes

- The workflow automatically detects language (English/Tamil)
- It classifies user intent into appropriate modes
- All responses go through safety guardrails before being returned
- If guardrails trigger, users will see a friendly error message

## 🔧 Troubleshooting

If you encounter issues:

1. **API Key Error**: Make sure `VITE_OPENAI_API_KEY` is set in `.env.local`
2. **Module Not Found**: Run `npm install` to ensure all packages are installed
3. **Guardrails Error**: Check that your OpenAI account has access to guardrails features

## ⚠️ Security Reminder

**NEVER**:
- Commit `.env.local` to Git
- Share your API key publicly
- Hardcode API keys in source files
- Push API keys to GitHub

The `.gitignore` file is configured to protect you, but always double-check before committing!

