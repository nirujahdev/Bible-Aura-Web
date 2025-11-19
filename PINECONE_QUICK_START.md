# Pinecone Quick Start Guide

## 5-Minute Setup

### 1. Install Package

```bash
npm install @pinecone-database/pinecone
```

### 2. Add Environment Variables

**`.env.local`**:
```bash
PINECONE_API_KEY=pcsk_your_api_key_here
PINECONE_INDEX_NAME=bible-aura-research-lab
PINECONE_DIMENSION=1024
```

**Vercel** (Settings → Environment Variables):
- Add all three variables for Production, Preview, Development

### 3. Run Database Migration

In Supabase Dashboard → SQL Editor, run:
```sql
-- File: supabase/migrations/20241118000004_add_vector_indexing_metadata.sql
```

### 4. Restart Server

```bash
npm run dev
```

✅ **Done!** Sources will now be automatically indexed.

---

## Essential Commands

### Index a Source

```typescript
import { indexSource } from '@/lib/research-lab/vector-operations';

await indexSource(source, notebookId, content);
```

### Search Similar Sources

```typescript
import { searchSimilarSources } from '@/lib/research-lab/vector-operations';

const results = await searchSimilarSources(query, notebookId, 5, 0.7);
```

### Generate Embedding

```typescript
import { generateEmbedding } from '@/lib/research-lab/embeddings';

const embedding = await generateEmbedding("Your text");
```

---

## Common Tasks

### Check Indexing Status

```typescript
const { data: source } = await supabase
  .from('research_sources')
  .select('indexing_status, vector_count')
  .eq('id', sourceId)
  .single();
```

### Re-index a Source

```typescript
import { deleteSourceVectors, indexSource } from '@/lib/research-lab/vector-operations';

await deleteSourceVectors(sourceId, notebookId);
await indexSource(source, notebookId, newContent);
```

### Search via API

```bash
curl -X POST /api/research-lab/vector-search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is grace?",
    "notebookId": "notebook-id",
    "topK": 5
  }'
```

---

## Quick Reference

### Vector ID Format
```
{notebook_id}:{source_id}:{chunk_index}
```

### Metadata Structure
```typescript
{
  notebook_id: string;
  source_id: string;
  source_type: string;
  title: string;
  chunk_index: number;
  chunk_text: string;
  created_at: string;
}
```

### Indexing Status Values
- `pending` - Not yet indexed
- `indexing` - Currently being indexed
- `completed` - Successfully indexed
- `failed` - Indexing failed

### Search Parameters
- `topK`: Number of results (default: 5-10)
- `minScore`: Minimum similarity score (0.0-1.0, default: 0.6-0.7)

---

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| API key error | Check `.env.local` and Vercel env vars |
| Index not found | Verify `PINECONE_INDEX_NAME` matches |
| No search results | Lower `minScore` to 0.5 |
| Slow indexing | Reduce chunk size or process async |
| Dimension mismatch | Ensure embeddings are 1024 dimensions |

---

## File Locations

- **Client**: `src/lib/research-lab/pinecone-client.ts`
- **Embeddings**: `src/lib/research-lab/embeddings.ts`
- **Operations**: `src/lib/research-lab/vector-operations.ts`
- **API Routes**: `api/research-lab/*.ts`
- **Migration**: `supabase/migrations/20241118000004_add_vector_indexing_metadata.sql`

---

## Next Steps

1. ✅ Setup complete
2. 📖 Read [Full Integration Guide](./PINECONE_INTEGRATION_GUIDE.md)
3. 📚 Check [API Reference](./PINECONE_API_REFERENCE.md)
4. 🧪 Test with a sample source upload

---

**Need Help?** See the [Full Guide](./PINECONE_INTEGRATION_GUIDE.md) for detailed documentation.

