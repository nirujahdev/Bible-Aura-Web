# Bible Aura ChatKit Integration

## Overview
This document describes the ChatKit workflow integration for Bible Aura, using OpenAI's API with a custom workflow system.

## Files Created

### 1. Backend API Route
**File:** `api/bibleaura-chat.ts`
- Vercel serverless function that handles POST requests to `/api/bibleaura-chat`
- Implements language classification (English/Tamil)
- Implements mode classification (chat, verse, parable, character, topical, qa)
- Calls OpenAI API with appropriate system prompts
- Returns response in format: `{ text: string, mode: string, lang: string }`

### 2. ChatKit Client Setup
**File:** `src/lib/chatkit.ts`
- Centralized configuration for ChatKit workflow
- Exports `sendBibleAuraMessage()` function
- Exports `checkChatKitAvailability()` function
- Handles API endpoint resolution (development vs production)
- Error handling and validation

### 3. Frontend Helper Function
**File:** `src/lib/sendMessage.ts`
- Convenience exports from `chatkit.ts`
- Provides simplified `sendMessage()` function
- Re-exports types for TypeScript support

## Configuration

### Workflow Constants
- **Workflow ID:** `wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0`
- **Version:** `1`
- **Domain Key:** `pk_69156df484148193bde4d23dd08c12fc0d90a851713b0413`
- **Allowed Origin:** `https://bibleaura.xyz`

### Environment Variables
- `OPENAI_API_KEY` or `VITE_OPENAI_API_KEY` - Required for OpenAI API calls
- `VITE_APP_URL` - Production URL (defaults to `https://bibleaura.xyz`)

## Usage

### Frontend Usage
```typescript
import { sendBibleAuraMessage } from '@/lib/chatkit';

// Send a message to the ChatKit workflow
const response = await sendBibleAuraMessage('What does John 3:16 mean?');
console.log(response.text); // AI response
console.log(response.mode); // 'verse', 'chat', etc.
console.log(response.lang); // 'en' or 'ta'
```

### Backend API Usage
```bash
# POST request to /api/bibleaura-chat
curl -X POST https://bibleaura.xyz/api/bibleaura-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What does John 3:16 mean?"}'

# Response:
# {
#   "text": "AI response text...",
#   "mode": "verse",
#   "lang": "en"
# }
```

## Integration with BibleAuraChat Component

The `BibleAuraChat` component has been updated to use the ChatKit workflow:
- Removed direct OpenAI API calls from frontend
- Now calls backend API route via `sendBibleAuraMessage()`
- Maintains existing UI and functionality
- No breaking changes to user experience

## Development

### Local Development
1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   VITE_APP_URL=http://localhost:5173
   ```
3. For API routes to work locally, use Vercel CLI:
   ```bash
   npm install -g vercel
   vercel dev
   ```
   This will proxy `/api/*` routes to serverless functions.

4. Or use production API in development:
   - Update `src/lib/chatkit.ts` to use production URL in development
   - Set `VITE_APP_URL=https://bibleaura.xyz` in `.env.local`

### Production Deployment
1. Deploy to Vercel: `vercel --prod`
2. Set environment variables in Vercel dashboard:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `VITE_APP_URL` - Production URL (https://bibleaura.xyz)
3. API routes will be automatically available at `/api/bibleaura-chat`

## Workflow Process

1. **Language Classification:** Detects if user message is in English or Tamil
2. **Mode Classification:** Determines the best mode (chat, verse, parable, character, topical, qa)
3. **System Prompt Selection:** Chooses appropriate system prompt based on mode and language
4. **OpenAI API Call:** Calls OpenAI API with the selected prompt
5. **Response Formatting:** Returns response with text, mode, and language

## Error Handling

- API key validation on backend
- Input validation (message must be non-empty string)
- Network error handling
- Graceful fallbacks for classification failures
- Detailed error messages in development mode

## CORS Configuration

- Allows requests from `https://bibleaura.xyz`
- Allows requests from subdomains of `bibleaura.xyz`
- Handles OPTIONS preflight requests
- Sets appropriate CORS headers

## Security

- API key stored in environment variables (never exposed to frontend)
- Input validation on backend
- CORS restrictions to allowed origins
- Error messages don't leak sensitive information in production

## Testing

### Test API Route
```bash
# Test with curl
curl -X POST http://localhost:3000/api/bibleaura-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Expected response:
# {
#   "text": "AI response...",
#   "mode": "chat",
#   "lang": "en"
# }
```

### Test Frontend Function
```typescript
import { sendBibleAuraMessage } from '@/lib/chatkit';

// Test in browser console or component
const test = async () => {
  try {
    const response = await sendBibleAuraMessage('Test message');
    console.log('Success:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Migration Notes

### Removed Files
- DeepSeek API references removed from `vercel.json`
- Old workflow files can be removed (kept for reference):
  - `src/lib/openai-workflow-enhanced.ts` (can be removed if not used elsewhere)
  - `src/lib/openai-workflow-simple.ts` (can be removed if not used elsewhere)

### Updated Files
- `src/components/BibleAuraChat.tsx` - Now uses ChatKit API
- `vercel.json` - Removed DeepSeek API keys
- `package.json` - Added `@vercel/node` dependency

### Unused Dependencies
The following dependencies are no longer needed but kept for backward compatibility:
- `@openai/agents` - Can be removed if not used elsewhere
- `@openai/guardrails` - Can be removed if not used elsewhere

## Next Steps

1. Remove unused workflow files if not needed
2. Remove unused dependencies (`@openai/agents`, `@openai/guardrails`)
3. Test API route in production
4. Monitor API usage and costs
5. Add rate limiting if needed
6. Add caching for common queries
7. Add analytics for workflow usage

## Support

For issues or questions:
1. Check API route logs in Vercel dashboard
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Test API route directly with curl
5. Check OpenAI API status and rate limits

