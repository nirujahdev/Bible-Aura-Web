# Pinecone Integration - Issues and Fixes

## Current Issues Identified

### 1. ⚠️ Path Alias Resolution in API Routes

**Issue**: API routes use `@/lib/research-lab/...` imports, but Vercel serverless functions may not resolve the `@/` alias correctly.

**Files Affected**:
- `api/research-lab/generate-embeddings.ts`
- `api/research-lab/vector-search.ts`
- `api/research-lab/index-source.ts`
- `api/research-lab/chat.ts`
- `api/research-lab/agents/index.ts`

**Current Import Pattern**:
```typescript
import { generateEmbedding } from '@/lib/research-lab/embeddings';
import { searchSimilarSources } from '@/lib/research-lab/vector-operations';
```

**Problem**: 
- `tsconfig.json` maps `@/*` to `./src/*`
- API routes are in `api/` directory, not `src/`
- Vercel might not resolve these paths correctly at runtime

**Solution Options**:
1. **Use Relative Paths** (Recommended for API routes):
   ```typescript
   import { generateEmbedding } from '../../src/lib/research-lab/embeddings';
   ```

2. **Create Shared Utilities in API Directory**:
   - Copy or symlink utilities to `api/research-lab/lib/`
   - Use relative imports within `api/` directory

3. **Configure Vercel Build**:
   - Add path alias resolution in `vercel.json` or build config
   - May require additional TypeScript configuration

**Recommended Fix**: Use relative paths in API routes for maximum compatibility.

---

### 2. ⚠️ GLM-4.5-Air Embedding Endpoint

**Issue**: The embedding generation code assumes GLM-4.5-Air has a `/embeddings` endpoint, but this may not exist.

**File**: `src/lib/research-lab/embeddings.ts`

**Current Code**:
```typescript
const response = await fetch(`${GLM_API_BASE_URL}/embeddings`, {
  method: 'POST',
  body: JSON.stringify({
    model: 'glm-4.5-air',
    input: text.trim(),
    dimensions: EMBEDDING_DIMENSION,
  }),
});
```

**Problem**:
- GLM-4.5-Air API might not have a dedicated embeddings endpoint
- May need to use chat completions with special parameters
- Or use a different GLM model for embeddings

**Solution Options**:
1. **Verify GLM API Documentation**: Check actual GLM-4.5-Air API for embedding endpoint
2. **Use Alternative Model**: Use GLM embedding model if available
3. **Fallback to OpenAI**: Already implemented, but should be primary if GLM doesn't support embeddings
4. **Use Different Service**: Consider using OpenAI embeddings as primary

**Recommended Fix**: 
- Test GLM embedding endpoint
- If unavailable, switch to OpenAI as primary
- Update documentation accordingly

---

### 3. ⚠️ Environment Variables Not Set

**Issue**: Pinecone API key and configuration not added to Vercel.

**Required Variables**:
```
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=bible-aura-research-lab
PINECONE_DIMENSION=1024
```

**Status**: Not yet added to Vercel environment variables.

**Fix**: Add to Vercel project settings → Environment Variables.

---

### 4. ⚠️ Database Migration Not Run

**Issue**: Migration file exists but hasn't been executed in Supabase.

**File**: `supabase/migrations/20241118000004_add_vector_indexing_metadata.sql`

**Status**: Migration needs to be run in Supabase Dashboard.

**Fix**: Execute migration in Supabase Dashboard → SQL Editor.

---

### 5. ⚠️ Missing Error Handling for Edge Cases

**Potential Issues**:
- Empty content indexing
- Very large sources (many chunks)
- Network timeouts during embedding generation
- Pinecone rate limits
- Dimension mismatches

**Current Status**: Basic error handling exists, but could be more robust.

**Recommended**: Add retry logic, timeout handling, and better error messages.

---

### 6. ⚠️ No Backfill Script for Existing Sources

**Issue**: Existing sources in database are not indexed.

**Status**: No script to index existing sources.

**Fix**: Create migration/script to index all existing sources:
```typescript
// Script to index all existing sources
const sources = await getAllSources();
for (const source of sources) {
  await indexSource(source, source.notebook_id, source.processed_content);
}
```

---

### 7. ⚠️ Chunking Strategy May Need Tuning

**Current Settings**:
- Chunk size: 1000 tokens
- Overlap: 200 tokens

**Potential Issues**:
- May be too large for some use cases
- Overlap might be insufficient
- Doesn't preserve verse boundaries for Bible content

**Recommendation**: 
- Test with actual Bible content
- Consider verse-aware chunking for Bible sources
- Adjust based on performance metrics

---

## Priority Fixes

### High Priority (Before Production)

1. ✅ **Fix Path Aliases in API Routes** - Use relative paths
2. ✅ **Verify/Update Embedding Endpoint** - Test GLM API or switch to OpenAI
3. ✅ **Add Environment Variables** - Configure in Vercel
4. ✅ **Run Database Migration** - Execute in Supabase

### Medium Priority (Before Launch)

5. ⚠️ **Create Backfill Script** - Index existing sources
6. ⚠️ **Improve Error Handling** - Add retries and timeouts
7. ⚠️ **Test with Real Data** - Verify chunking and search quality

### Low Priority (Post-Launch)

8. 📝 **Optimize Chunking** - Tune based on usage
9. 📝 **Add Monitoring** - Track indexing success rate
10. 📝 **Performance Tuning** - Optimize based on metrics

---

## Testing Checklist

- [ ] Test path alias resolution in API routes
- [ ] Test GLM embedding endpoint (or verify OpenAI fallback)
- [ ] Test source indexing end-to-end
- [ ] Test vector search functionality
- [ ] Test chat integration with Pinecone
- [ ] Test agent integration with Pinecone
- [ ] Test error handling and fallbacks
- [ ] Test with large sources (many chunks)
- [ ] Test with empty/minimal content
- [ ] Verify environment variables are set
- [ ] Verify database migration is applied
- [ ] Test indexing status updates
- [ ] Test vector deletion on source delete

---

## Next Steps

1. **Fix Path Aliases**: Update all API route imports to use relative paths
2. **Test Embedding Endpoint**: Verify GLM API or switch to OpenAI
3. **Add Environment Variables**: Configure in Vercel
4. **Run Migration**: Execute in Supabase
5. **Test Integration**: End-to-end testing with real data
6. **Create Backfill Script**: Index existing sources
7. **Monitor and Optimize**: Track performance and adjust

---

**Last Updated**: 2024-11-18

