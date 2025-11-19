# Pinecone Integration Guide for Research Lab

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Setup & Configuration](#setup--configuration)
4. [Architecture Overview](#architecture-overview)
5. [Implementation Details](#implementation-details)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Introduction

### What is Pinecone?

Pinecone is a managed vector database service that enables semantic search and similarity matching. In the Research Lab, Pinecone stores embeddings (vector representations) of your source content, allowing the AI to find the most relevant sources based on meaning rather than keyword matching.

### Why Pinecone for Research Lab?

1. **Semantic Search**: Find sources based on meaning, not just keywords
2. **Improved Context**: AI agents get the most relevant sources, improving response quality
3. **Token Efficiency**: Use top-K relevant sources instead of all sources, reducing API costs
4. **Scalability**: Handle thousands of sources efficiently
5. **Hybrid Architecture**: Pinecone for vectors, Supabase for relational data

### Architecture Overview

```
┌─────────────────┐
│  User Uploads   │
│     Source      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Store │  ← Relational data (metadata, users, notebooks)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Process &      │
│  Chunk Content  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate       │
│  Embeddings     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pinecone       │  ← Vector storage (embeddings)
│  Index Vectors  │
└─────────────────┘

Query Flow:
┌─────────────────┐
│  User Question  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate Query │
│  Embedding      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pinecone       │
│  Search (Top-K) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Full     │
│  Content from   │
│  Supabase       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Context  │
│  for GLM-4.5-Air│
└─────────────────┘
```

---

## Prerequisites

- Pinecone account (free tier available)
- Supabase project with Research Lab tables
- Node.js 18+ and npm
- TypeScript knowledge
- Understanding of embeddings and vector databases

---

## Setup & Configuration

### Step 1: Create Pinecone Index

1. **Sign up** at [pinecone.io](https://www.pinecone.io)
2. **Create a new index**:
   - **Name**: `bible-aura-research-lab`
   - **Dimension**: `1024` (matches GLM-4.5-Air embeddings)
   - **Metric**: `cosine` (best for semantic similarity)
   - **Type**: `Dense`
   - **Capacity Mode**: `Serverless` (recommended for scalability)

### Step 2: Get API Key

1. Go to **API Keys** in Pinecone dashboard
2. Copy your API key (starts with `pcsk_...`)
3. Save it securely

### Step 3: Environment Variables

Add to `.env.local`:

```bash
PINECONE_API_KEY=pcsk_your_api_key_here
PINECONE_INDEX_NAME=bible-aura-research-lab
PINECONE_DIMENSION=1024
```

Add to **Vercel** environment variables:
1. Go to your Vercel project → Settings → Environment Variables
2. Add all three variables for Production, Preview, and Development

### Step 4: Install Dependencies

```bash
npm install @pinecone-database/pinecone
```

### Step 5: Database Migration

Run the migration in Supabase Dashboard → SQL Editor:

```sql
-- File: supabase/migrations/20241118000004_add_vector_indexing_metadata.sql
```

This adds:
- `indexed_at` - Timestamp when indexed
- `vector_count` - Number of vectors created
- `indexing_status` - Status: pending, indexing, completed, failed
- `research_source_chunks` table - Tracks chunked content

### Step 6: MCP Server Configuration (Optional)

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "pinecone": {
      "command": "npx",
      "args": ["-y", "@pinecone-database/mcp"],
      "env": {
        "PINECONE_API_KEY": "pcsk_your_api_key_here"
      }
    }
  }
}
```

Restart Cursor to load the MCP server.

---

## Architecture Overview

### Data Flow

#### Source Indexing Flow

1. **Upload**: User uploads source (file, link, text)
2. **Store**: Source saved to Supabase `research_sources` table
3. **Process**: Content extracted and stored in `processed_content`
4. **Chunk**: Content split into chunks (1000 tokens, 200 overlap)
5. **Embed**: Generate 1024-dim embeddings for each chunk
6. **Index**: Store vectors in Pinecone with metadata
7. **Update**: Mark `indexing_status = 'completed'` in Supabase

#### Query Flow

1. **Question**: User asks question in chat or triggers agent
2. **Embed**: Generate query embedding
3. **Search**: Query Pinecone for top-K similar sources (default: 8 for chat, 10 for agents)
4. **Fetch**: Get full source content from Supabase
5. **Context**: Build context string from Pinecone results
6. **AI**: Send to GLM-4.5-Air with enhanced context

### Vector ID Format

```
{notebook_id}:{source_id}:{chunk_index}
```

Example: `abc123:def456:0`, `abc123:def456:1`, etc.

### Metadata Structure

```typescript
{
  notebook_id: string;      // Which notebook this source belongs to
  source_id: string;         // Supabase source ID
  source_type: string;       // 'file', 'link', 'text'
  title: string;             // Source title
  chunk_index: number;       // Which chunk (0, 1, 2...)
  chunk_text: string;        // First 200 chars for preview
  created_at: string;        // ISO timestamp
}
```

### Hybrid Architecture Benefits

- **Supabase**: Relational data, file storage, user management, RLS policies
- **Pinecone**: Vector search, semantic similarity, scalable indexing
- **Best of Both**: Fast queries + structured data management

---

## Implementation Details

### Core Libraries

#### 1. Pinecone Client (`src/lib/research-lab/pinecone-client.ts`)

Initializes and manages Pinecone connection:

```typescript
import { getPineconeClient, getPineconeIndex } from '@/lib/research-lab/pinecone-client';

// Get index instance
const index = getPineconeIndex();

// Test connection
const isConnected = await testPineconeConnection();
```

**Key Functions**:
- `getPineconeClient()` - Returns Pinecone client instance
- `getPineconeIndex()` - Returns index instance
- `testPineconeConnection()` - Tests connection

#### 2. Embeddings Service (`src/lib/research-lab/embeddings.ts`)

Generates 1024-dimensional embeddings:

```typescript
import { generateEmbedding, chunkText } from '@/lib/research-lab/embeddings';

// Generate embedding
const embedding = await generateEmbedding("Your text here");

// Chunk text
const chunks = chunkText(longText, 1000, 200); // 1000 tokens, 200 overlap
```

**Key Functions**:
- `generateEmbedding(text: string)` - Generate single embedding
- `generateBatchEmbeddings(texts: string[])` - Batch processing
- `chunkText(text, maxSize, overlap)` - Split into chunks
- `estimateTokenCount(text)` - Estimate token count

**Embedding Models**:
- **Primary**: GLM-4.5-Air (1024 dimensions)
- **Fallback**: OpenAI `text-embedding-3-small` (1536 → reduced to 1024)

#### 3. Vector Operations (`src/lib/research-lab/vector-operations.ts`)

Handles indexing and searching:

```typescript
import { 
  indexSource, 
  searchSimilarSources, 
  deleteSourceVectors 
} from '@/lib/research-lab/vector-operations';

// Index a source
const { vectorCount } = await indexSource(source, notebookId, content);

// Search for similar sources
const results = await searchSimilarSources(query, notebookId, 8, 0.6);

// Delete vectors
await deleteSourceVectors(sourceId, notebookId);
```

**Key Functions**:
- `indexSource(source, notebookId, content)` - Index source with chunks
- `searchSimilarSources(query, notebookId, topK, minScore)` - Semantic search
- `deleteSourceVectors(sourceId, notebookId)` - Remove from index
- `updateSourceVectors(source, notebookId, newContent)` - Re-index
- `deleteNotebookVectors(notebookId)` - Delete all notebook vectors

### API Endpoints

#### 1. Generate Embeddings (`/api/research-lab/generate-embeddings`)

**POST** `/api/research-lab/generate-embeddings`

**Request**:
```json
{
  "text": "Your text to embed",
  "sourceId": "optional-source-id"
}
```

**Response**:
```json
{
  "success": true,
  "embedding": [0.123, -0.456, ...],
  "dimension": 1024,
  "sourceId": "source-id"
}
```

#### 2. Vector Search (`/api/research-lab/vector-search`)

**POST** `/api/research-lab/vector-search`

**Request**:
```json
{
  "query": "What is the meaning of grace?",
  "notebookId": "notebook-id",
  "topK": 5,
  "minScore": 0.7,
  "sourceTypes": ["file", "link"]
}
```

**Response**:
```json
{
  "success": true,
  "query": "What is the meaning of grace?",
  "results": [
    {
      "sourceId": "source-id",
      "title": "Source Title",
      "sourceType": "file",
      "score": 0.85,
      "chunkText": "First 200 chars...",
      "chunkIndex": 0,
      "notebookId": "notebook-id",
      "fullContent": "Full source content..."
    }
  ],
  "count": 5
}
```

#### 3. Index Source (`/api/research-lab/index-source`)

**POST** `/api/research-lab/index-source`

**Request**:
```json
{
  "sourceId": "source-id",
  "notebookId": "notebook-id",
  "content": "Source content to index"
}
```

**Response**:
```json
{
  "success": true,
  "vectorCount": 5,
  "sourceId": "source-id",
  "message": "Successfully indexed 5 vector(s)"
}
```

### Integration Points

#### Chat Integration (`api/research-lab/chat.ts`)

```typescript
// Before building context, search Pinecone
const pineconeResults = await searchSimilarSources(message, notebookId, 8, 0.6);

// Fetch full content for results
const sources = await fetchSourcesFromSupabase(pineconeResults);

// Build context from Pinecone results
const context = buildContext(sources);
```

#### Agents Integration (`api/research-lab/agents/index.ts`)

```typescript
// Build agent-specific query
const semanticQuery = buildAgentQuery(agentType, params);

// Search Pinecone
const results = await searchSimilarSources(semanticQuery, notebookId, 10, 0.6);

// Use results for agent context
```

#### Source Upload (`src/components/research-lab/AddSourceModal.tsx`)

```typescript
// After source creation, trigger indexing
await supabase
  .from('research_sources')
  .update({ indexing_status: 'indexing' })
  .eq('id', sourceId);

// Index in Pinecone (async)
fetch('/api/research-lab/index-source', {
  method: 'POST',
  body: JSON.stringify({ sourceId, notebookId, content }),
});
```

---

## Usage Examples

### Example 1: Index a New Source

```typescript
import { indexSource } from '@/lib/research-lab/vector-operations';
import { getSource } from '@/lib/research-lab/db-operations';

const source = await getSource(sourceId, userId);
const content = source.processed_content || source.content_text;

const { vectorCount, error } = await indexSource(source, notebookId, content);

if (!error) {
  console.log(`Indexed ${vectorCount} vectors`);
}
```

### Example 2: Search for Similar Sources

```typescript
import { searchSimilarSources } from '@/lib/research-lab/vector-operations';

const query = "What does the Bible say about forgiveness?";
const results = await searchSimilarSources(query, notebookId, 5, 0.7);

results.forEach(result => {
  console.log(`${result.title}: ${(result.score * 100).toFixed(0)}% match`);
});
```

### Example 3: Use in Chat

```typescript
// In chat API
const pineconeResults = await searchSimilarSources(message, notebookId, 8, 0.6);

if (pineconeResults.length > 0) {
  // Use Pinecone results
  const context = buildContextFromResults(pineconeResults);
} else {
  // Fallback to all sources
  const context = buildContextFromAllSources();
}
```

### Example 4: Monitor Indexing Status

```typescript
const { data: source } = await supabase
  .from('research_sources')
  .select('indexing_status, vector_count, indexed_at')
  .eq('id', sourceId)
  .single();

console.log(`Status: ${source.indexing_status}`);
console.log(`Vectors: ${source.vector_count}`);
console.log(`Indexed: ${source.indexed_at}`);
```

---

## Best Practices

### 1. Chunking Strategy

- **Chunk Size**: 500-1000 tokens (we use 1000)
- **Overlap**: 100-200 tokens (we use 200)
- **Preserve Boundaries**: Break at sentences/paragraphs
- **Store Metadata**: Track chunk positions in original text

### 2. Embedding Generation

- **Batch Processing**: Process multiple chunks together
- **Error Handling**: Always have fallback (OpenAI if GLM fails)
- **Dimension Matching**: Ensure embeddings match index dimension (1024)

### 3. Indexing

- **Async Processing**: Don't block source creation
- **Status Tracking**: Update `indexing_status` throughout process
- **Error Recovery**: Mark as 'failed' if indexing fails, allow retry
- **Batch Upserts**: Upsert up to 100 vectors per request

### 4. Searching

- **Top-K Selection**: Use 5-10 for chat, 10-15 for agents
- **Score Threshold**: Filter by `minScore` (0.6-0.7 recommended)
- **Metadata Filtering**: Always filter by `notebook_id` for security
- **Fallback Strategy**: If Pinecone fails, use all sources

### 5. Performance

- **Caching**: Cache query embeddings (same query = same embedding)
- **Batch Operations**: Process multiple sources together
- **Connection Pooling**: Reuse Pinecone client instances
- **Monitoring**: Track indexing success rate and search latency

### 6. Security

- **API Keys**: Never expose in client-side code
- **Server-Side Only**: All Pinecone operations in API routes
- **Metadata Filtering**: Filter by `user_id` and `notebook_id`
- **RLS Policies**: Supabase RLS ensures data access control

### 7. Cost Management

- **Serverless Mode**: Pay per query, scales automatically
- **Caching**: Reduce redundant queries
- **Selective Indexing**: Only index sources with content
- **Cleanup**: Delete vectors when sources are deleted

---

## Troubleshooting

### Issue: "PINECONE_API_KEY is not configured"

**Solution**:
1. Check `.env.local` has `PINECONE_API_KEY`
2. Add to Vercel environment variables
3. Restart development server

### Issue: "Index not found"

**Solution**:
1. Verify index name matches `PINECONE_INDEX_NAME`
2. Check index exists in Pinecone dashboard
3. Ensure index dimension matches (1024)

### Issue: "Embedding dimension mismatch"

**Solution**:
1. Verify embedding model outputs 1024 dimensions
2. Check `PINECONE_DIMENSION=1024` in env
3. If using OpenAI, dimension reduction is applied

### Issue: "Indexing always fails"

**Solution**:
1. Check Pinecone API key is valid
2. Verify index is active (not paused)
3. Check content is not empty
4. Review error logs in API route

### Issue: "Search returns no results"

**Solution**:
1. Verify sources are indexed (`indexing_status = 'completed'`)
2. Check `minScore` threshold (try lowering to 0.5)
3. Ensure query has content (not empty)
4. Check metadata filters are correct

### Issue: "Slow indexing"

**Solution**:
1. Reduce chunk size (try 500 tokens)
2. Process in smaller batches
3. Use async processing (don't block)
4. Consider background job queue

### Issue: "High costs"

**Solution**:
1. Implement caching for queries
2. Reduce `topK` values
3. Only index sources with substantial content
4. Monitor usage in Pinecone dashboard

---

## FAQ

### Q: Do I need to index existing sources?

**A**: Yes, existing sources need to be indexed. You can:
1. Re-upload sources (triggers auto-indexing)
2. Create a migration script to index all sources
3. Use the `/api/research-lab/index-source` endpoint

### Q: Can I use a different embedding model?

**A**: Yes, but ensure:
1. Dimension matches index (1024)
2. Update `embeddings.ts` to use new model
3. Test embedding quality

### Q: What happens if Pinecone is down?

**A**: The system falls back to using all included sources. No functionality is lost, just less optimal context selection.

### Q: How do I re-index a source?

**A**: 
```typescript
await deleteSourceVectors(sourceId, notebookId);
await indexSource(source, notebookId, newContent);
```

### Q: Can I search across multiple notebooks?

**A**: Currently, searches are scoped to a single notebook for security. To search across notebooks, you'd need to:
1. Query multiple notebooks separately
2. Merge and rank results
3. Ensure user has access to all notebooks

### Q: How do I monitor indexing performance?

**A**: 
1. Check `indexing_status` in `research_sources` table
2. Monitor `vector_count` per source
3. Track `indexed_at` timestamps
4. Review API logs for errors

### Q: What's the maximum source size?

**A**: No hard limit, but:
- Large sources create many chunks
- More chunks = more vectors = higher cost
- Consider splitting very large sources
- Recommended: < 50,000 tokens per source

---

## Additional Resources

- [Pinecone Documentation](https://docs.pinecone.io)
- [Pinecone Serverless Guide](https://docs.pinecone.io/guides/serverless)
- [Vector Database Best Practices](https://www.pinecone.io/learn/vector-database-best-practices/)
- [Embedding Models Comparison](https://www.pinecone.io/learn/embeddings/)

---

## Support

For issues or questions:
1. Check troubleshooting section
2. Review API logs
3. Check Pinecone dashboard for index status
4. Verify environment variables

---

**Last Updated**: 2024-11-18
**Version**: 1.0.0

