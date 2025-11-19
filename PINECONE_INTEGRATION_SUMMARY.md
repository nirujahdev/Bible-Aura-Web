# Pinecone Integration Summary

## Overview
Pinecone Serverless vector database has been integrated into the Research Lab for semantic search and intelligent source retrieval.

## Index Configuration
- **Index Name**: `bible-aura-research-lab`
- **Dimension**: 1024
- **Metric**: `cosine`
- **Host**: `https://bible-aura-research-lab-n5j3otn.svc.aped-4627-b74a.pinecone.io`
- **Cloud**: AWS
- **Region**: `us-east-1`
- **Type**: Dense
- **Capacity Mode**: Serverless

## Environment Variables Required

Add these to `.env.local` and Vercel:

```bash
PINECONE_API_KEY=pcsk_2PXYxm_HqC9Gfs5sJ1KFmDQN1T2XwCCKYSfyymiuw5wjPDtCfZKjCtVp3vsSvyUdppRqRt
PINECONE_INDEX_NAME=bible-aura-research-lab
PINECONE_DIMENSION=1024
```

**Note**: Serverless indexes don't require `PINECONE_ENVIRONMENT` - the client uses the index host directly.

## Files Created

### Core Libraries
1. **`src/lib/research-lab/pinecone-client.ts`**
   - Pinecone client initialization
   - Serverless index connection
   - Connection testing utility

2. **`src/lib/research-lab/embeddings.ts`**
   - Embedding generation (1024 dimensions)
   - Primary: GLM-4.5-Air embedding API
   - Fallback: OpenAI embeddings (with dimension reduction)
   - Text chunking utilities
   - Batch embedding generation

3. **`src/lib/research-lab/vector-operations.ts`**
   - Source indexing in Pinecone
   - Semantic source search
   - Vector deletion (by source/notebook)
   - Vector updates

### API Endpoints
4. **`api/research-lab/generate-embeddings.ts`**
   - Server-side embedding generation
   - Secure API key usage

5. **`api/research-lab/vector-search.ts`**
   - Vector similarity search
   - Returns top-K similar sources
   - Enriched with full source content

6. **`api/research-lab/index-source.ts`**
   - Indexes a source in Pinecone
   - Updates indexing status in database
   - Returns vector count

### Database Migration
7. **`supabase/migrations/20241118000004_add_vector_indexing_metadata.sql`**
   - Adds `indexed_at`, `vector_count`, `indexing_status` to `research_sources`
   - Creates `research_source_chunks` table
   - Adds RLS policies

## Files Modified

1. **`api/research-lab/chat.ts`**
   - Integrated Pinecone semantic search
   - Generates query embedding
   - Retrieves top-K relevant sources
   - Falls back to all sources if Pinecone fails

2. **`api/research-lab/agents/index.ts`**
   - Uses Pinecone for semantic source selection
   - Agent-specific query generation
   - Improved context quality

3. **`src/components/research-lab/AddSourceModal.tsx`**
   - Triggers source indexing after upload
   - Updates indexing status
   - Non-blocking async indexing

## How It Works

### Source Indexing Flow
1. User uploads a source (file, link, text)
2. Source is saved to Supabase
3. `indexing_status` set to `'indexing'`
4. Content is chunked (1000 tokens, 200 overlap)
5. Embeddings generated for each chunk
6. Vectors stored in Pinecone with metadata
7. `indexing_status` updated to `'completed'` with `vector_count`

### Chat/Agent Flow
1. User asks a question or triggers an agent
2. Query embedding generated
3. Pinecone searched for top-K similar sources
4. Full source content fetched from Supabase
5. Context built from Pinecone results
6. GLM-4.5-Air called with enhanced context

### Fallback Behavior
- If Pinecone fails, falls back to all included sources
- If embedding generation fails, uses OpenAI (if configured)
- If indexing fails, source still works (just not searchable)

## Vector ID Format
`{notebook_id}:{source_id}:{chunk_index}`

## Metadata Structure
```typescript
{
  notebook_id: string;
  source_id: string;
  source_type: string;
  title: string;
  chunk_index: number;
  chunk_text: string; // First 200 chars
  created_at: string;
}
```

## Next Steps

1. **Add Environment Variables**
   - Add `PINECONE_API_KEY` to Vercel
   - Add `PINECONE_INDEX_NAME` to Vercel (optional, defaults to `bible-aura-research-lab`)
   - Add `PINECONE_DIMENSION` to Vercel (optional, defaults to `1024`)

2. **Run Database Migration**
   - Execute `supabase/migrations/20241118000004_add_vector_indexing_metadata.sql` in Supabase Dashboard

3. **Test Integration**
   - Upload a source
   - Check indexing status
   - Ask a question in chat
   - Verify Pinecone search results

4. **Monitor Performance**
   - Check indexing success rate
   - Monitor search latency
   - Track vector count per source

## Notes

- **Embedding Model**: Currently configured for GLM-4.5-Air (1024 dim). If GLM doesn't have a dedicated embeddings endpoint, you may need to:
  - Use a different GLM model for embeddings
  - Use OpenAI embeddings with dimension reduction
  - Use a different embedding service

- **Chunking Strategy**: 1000 tokens per chunk with 200 token overlap. Adjust based on your content and performance needs.

- **Search Parameters**: Default `topK=8` for chat, `topK=10` for agents, `minScore=0.6`. Adjust based on your needs.

- **Error Handling**: All Pinecone operations have graceful fallbacks. Indexing failures don't block source creation.

