# 🛡️ ✦Bible Aura Security Notes

## OpenRouter API Key Security

**IMPORTANT**: The OpenRouter API key is currently hardcoded in `src/pages/Chat.tsx`. For production deployment, you should move it to environment variables.

### Recommended Setup:

1. **Create `.env` file** (add to `.gitignore`):
```bash
VITE_OPENROUTER_API_KEY=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
```

2. **Update Chat.tsx**:
```typescript
// Replace this line:
const OPENROUTER_API_KEY = "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";

// With this:
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
```

3. **Add to `.gitignore`**:
```
.env
.env.local
```

### Additional Security Recommendations:

- **Rate Limiting**: Monitor API usage to prevent abuse
- **Input Validation**: Sanitize user inputs before sending to API
- **Error Logging**: Implement secure error logging (avoid logging sensitive data)
- **CORS Configuration**: Ensure proper CORS settings for production domain

### Environment Variables for Production:

```bash
# Required for OpenRouter Integration
VITE_OPENROUTER_API_KEY=your_api_key_here

# Optional Site Information
VITE_SITE_URL=https://bible-aura.app
VITE_SITE_NAME=✦Bible Aura - AI Biblical Insights

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔮 Current API Configuration

- **Provider**: OpenRouter
- **Model**: MoonshotAI Kimi K2 (Free Tier)
- **Features**: Biblical wisdom, spiritual guidance, theological insights
- **Rate Limits**: Follow OpenRouter's free tier limitations
- **Context**: Maintains conversation history for better responses

## 📝 Next Steps

1. Move API key to environment variables
2. Test API responses thoroughly
3. Monitor usage and costs
4. Consider upgrading to paid tier for higher limits
5. Implement conversation export/import features 