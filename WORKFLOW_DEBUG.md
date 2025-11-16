# AI Tools Workflow Debug

## Current Workflow:
1. User clicks AI tool → `TextSelectionMenu.tsx` or `AIResearchPanel.tsx`
2. Calls `executeAgent()` from `sermon-agents.ts`
3. `executeAgent()` calls `agent.execute()` which calls `generateSermonContent()` from `sermon-agent-sdk.ts`
4. `generateSermonContent()` calls `callSermonAIAPI()` from `sermon-ai-api-helper.ts`
5. `callSermonAIAPI()` makes fetch to `/api/sermon-ai`
6. API route checks for `Sermon_AI_API` env variable

## Potential Issues:
- API route not accessible in development (404)
- `Sermon_AI_API` env variable not set in Vercel
- CORS issues
- Network errors
- API route errors

