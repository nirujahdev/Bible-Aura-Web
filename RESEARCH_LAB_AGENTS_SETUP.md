# Research Lab AI Agents Setup Guide

## Overview
The Research Lab now includes 6 specialized AI agents powered by GLM-4.5-Air:
1. **Summarization & Synthesis Agent** - Summarizes and synthesizes multiple sources
2. **Theology-Specific Search & Q&A Agent** - Bible-focused questions and answers
3. **Cross-Reference Discovery Agent** - Finds related Bible verses and connections
4. **Curriculum & Study Plan Builder** - Creates Bible study curricula
5. **Sermon Preparation & Generation Assistant** - Helps with sermon outlines
6. **Doctrinal Harmonization & Multi-Perspective Agent** - Harmonizes doctrine and presents multiple viewpoints

## Environment Variables Setup

### Required: GLM-4.5-Air API Key

#### 1. Local Development (.env.local)

Create or update `.env.local` in the project root:

```bash
# GLM-4.5-Air API Configuration
GLM_API_KEY=9b294793ee044eda87e35ea63b2164cf.XuIiDLsoLyyIWmMs
```

**Important**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Keep your API key secure and private

#### 2. Vercel Production Environment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `GLM_API_KEY`
   - **Value**: `9b294793ee044eda87e35ea63b2164cf.XuIiDLsoLyyIWmMs`
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### Optional: GLM API Base URL

If you need to override the default API base URL:

```bash
GLM_API_BASE_URL=https://api.z.ai/api/paas/v4
```

The default is already set to `https://api.z.ai/api/paas/v4`, so this is only needed if the API endpoint changes.

## API Endpoints

All agent endpoints are located in `api/research-lab/agents/`:

- `/api/research-lab/agents/summarize` - Summarization agent
- `/api/research-lab/agents/search-qa` - Q&A agent
- `/api/research-lab/agents/cross-reference` - Cross-reference agent
- `/api/research-lab/agents/curriculum` - Curriculum builder
- `/api/research-lab/agents/sermon` - Sermon assistant
- `/api/research-lab/agents/doctrinal` - Doctrinal harmonization

## Security Notes

1. **API Key Protection**: The GLM API key is only used in serverless functions (API routes), never exposed to the client
2. **Authentication**: All endpoints require user authentication via JWT token
3. **Bible Policy Enforcement**: All agents include system prompts that restrict responses to Bible/theology content only
4. **Error Handling**: Invalid or non-Bible questions are rejected with appropriate error messages

## Database Schema

Agent outputs are stored in the `research_studio_outputs` table with the following output types:
- `summarization` - Summary outputs
- `theology_qa` - Q&A results
- `cross_references` - Cross-reference findings
- `curriculum` - Study plan outputs
- `sermon` - Sermon outlines
- `doctrinal_harmony` - Doctrinal harmonization results

## Testing

After setting up environment variables:

1. Start the development server: `npm run dev`
2. Navigate to Research Lab: `/research-lab`
3. Create or open a notebook
4. Click on any agent in the Studio panel
5. Fill in the required fields and generate output

## Troubleshooting

### "GLM API key not configured" error
- Verify `GLM_API_KEY` is set in `.env.local` for local development
- Verify `GLM_API_KEY` is set in Vercel environment variables for production
- Restart the development server after adding `.env.local` variables

### "Unauthorized" error
- Ensure you're logged in
- Check that JWT token is being sent in the Authorization header

### "Question must be Bible-related" error
- All agents enforce Bible-focused content
- Ensure questions are about Bible, theology, or Christianity
- Non-Bible questions will be rejected

## Support

For issues or questions:
1. Check the browser console for error messages
2. Check Vercel function logs for API errors
3. Verify environment variables are correctly set
4. Ensure database tables exist (run migrations if needed)

