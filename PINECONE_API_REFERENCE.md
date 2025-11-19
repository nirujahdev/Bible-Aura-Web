# Pinecone API Reference

## Core Functions

### Pinecone Client

#### `getPineconeClient()`

Returns Pinecone client instance.

```typescript
import { getPineconeClient } from '@/lib/research-lab/pinecone-client';

const client = getPineconeClient();
```

**Returns**: `Pinecone` instance

**Throws**: Error if `PINECONE_API_KEY` not configured

---

#### `getPineconeIndex()`

Returns Pinecone index instance.

```typescript
import { getPineconeIndex } from '@/lib/research-lab/pinecone-client';

const index = getPineconeIndex();
```

**Returns**: `Index` instance

**Throws**: Error if index not found or API key invalid

---

#### `testPineconeConnection()`

Tests connection to Pinecone.

```typescript
import { testPineconeConnection } from '@/lib/research-lab/pinecone-client';

const isConnected = await testPineconeConnection();
if (isConnected) {
  console.log('Pinecone connected');
}
```

**Returns**: `Promise<boolean>`

---

### Embeddings

#### `generateEmbedding(text: string)`

Generates 1024-dimensional embedding for text.

```typescript
import { generateEmbedding } from '@/lib/research-lab/embeddings';

const embedding = await generateEmbedding("What is the meaning of grace?");
// Returns: [0.123, -0.456, 0.789, ...] (1024 dimensions)
```

**Parameters**:
- `text` (string): Text to embed

**Returns**: `Promise<number[]>` - 1024-dimensional vector

**Throws**: Error if text is empty or API key invalid

**Fallback**: Uses OpenAI if GLM-4.5-Air fails

---

#### `generateBatchEmbeddings(texts: string[])`

Generates embeddings for multiple texts in batch.

```typescript
import { generateBatchEmbeddings } from '@/lib/research-lab/embeddings';

const texts = ["Text 1", "Text 2", "Text 3"];
const embeddings = await generateBatchEmbeddings(texts);
// Returns: [[...], [...], [...]] (array of 1024-dim vectors)
```

**Parameters**:
- `texts` (string[]): Array of texts to embed

**Returns**: `Promise<number[][]>` - Array of 1024-dimensional vectors

**Note**: Processes in batches of 10 to avoid rate limits

---

#### `chunkText(text: string, maxChunkSize?: number, overlapSize?: number)`

Splits text into chunks for embedding.

```typescript
import { chunkText } from '@/lib/research-lab/embeddings';

const chunks = chunkText(longText, 1000, 200);
// Returns: ["chunk 1", "chunk 2", ...]
```

**Parameters**:
- `text` (string): Text to chunk
- `maxChunkSize` (number, optional): Max tokens per chunk (default: 1000)
- `overlapSize` (number, optional): Overlap tokens (default: 200)

**Returns**: `string[]` - Array of text chunks

**Note**: Preserves sentence boundaries when possible

---

#### `estimateTokenCount(text: string)`

Estimates token count for text.

```typescript
import { estimateTokenCount } from '@/lib/research-lab/embeddings';

const tokens = estimateTokenCount("Your text here");
// Returns: ~250 (rough estimate: 4 chars per token)
```

**Parameters**:
- `text` (string): Text to estimate

**Returns**: `number` - Estimated token count

---

### Vector Operations

#### `indexSource(source: Source, notebookId: string, content: string)`

Indexes a source in Pinecone with chunking.

```typescript
import { indexSource } from '@/lib/research-lab/vector-operations';
import type { Source } from '@/lib/research-lab/db-operations';

const source: Source = { /* ... */ };
const { vectorCount, error } = await indexSource(source, notebookId, content);

if (!error) {
  console.log(`Indexed ${vectorCount} vectors`);
}
```

**Parameters**:
- `source` (Source): Source object from database
- `notebookId` (string): Notebook ID
- `content` (string): Source content to index

**Returns**: `Promise<{ vectorCount: number; error?: any }>`

**Process**:
1. Chunks content (1000 tokens, 200 overlap)
2. Generates embeddings for each chunk
3. Upserts vectors to Pinecone with metadata
4. Returns vector count

---

#### `searchSimilarSources(query: string, notebookId: string, topK?: number, minScore?: number)`

Searches for similar sources using vector similarity.

```typescript
import { searchSimilarSources } from '@/lib/research-lab/vector-operations';

const results = await searchSimilarSources(
  "What is the meaning of grace?",
  notebookId,
  5,    // topK
  0.7   // minScore
);
```

**Parameters**:
- `query` (string): Search query
- `notebookId` (string): Notebook ID to search within
- `topK` (number, optional): Number of results (default: 5)
- `minScore` (number, optional): Minimum similarity score 0-1 (default: 0.7)

**Returns**: `Promise<SearchResult[]>`

**SearchResult**:
```typescript
interface SearchResult {
  sourceId: string;
  title: string;
  sourceType: string;
  score: number;        // Similarity score (0-1)
  chunkText: string;   // First 200 chars
  chunkIndex: number;
  notebookId: string;
}
```

---

#### `deleteSourceVectors(sourceId: string, notebookId: string)`

Deletes all vectors for a source.

```typescript
import { deleteSourceVectors } from '@/lib/research-lab/vector-operations';

const { deleted, error } = await deleteSourceVectors(sourceId, notebookId);
console.log(`Deleted ${deleted} vectors`);
```

**Parameters**:
- `sourceId` (string): Source ID
- `notebookId` (string): Notebook ID

**Returns**: `Promise<{ deleted: number; error?: any }>`

---

#### `updateSourceVectors(source: Source, notebookId: string, newContent: string)`

Re-indexes a source with new content.

```typescript
import { updateSourceVectors } from '@/lib/research-lab/vector-operations';

const { vectorCount } = await updateSourceVectors(source, notebookId, newContent);
```

**Parameters**:
- `source` (Source): Source object
- `notebookId` (string): Notebook ID
- `newContent` (string): New content to index

**Returns**: `Promise<{ vectorCount: number; error?: any }>`

**Note**: Deletes old vectors, then creates new ones

---

#### `deleteNotebookVectors(notebookId: string)`

Deletes all vectors for a notebook.

```typescript
import { deleteNotebookVectors } from '@/lib/research-lab/vector-operations';

const { deleted } = await deleteNotebookVectors(notebookId);
```

**Parameters**:
- `notebookId` (string): Notebook ID

**Returns**: `Promise<{ deleted: number; error?: any }>`

---

## API Endpoints

### POST `/api/research-lab/generate-embeddings`

Generates embedding for text.

**Request**:
```json
{
  "text": "Your text here",
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

**Errors**:
- `400`: Text is empty
- `401`: Unauthorized
- `500`: API key not configured or generation failed

---

### POST `/api/research-lab/vector-search`

Searches for similar sources.

**Request**:
```json
{
  "query": "What is grace?",
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
  "query": "What is grace?",
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

**Errors**:
- `400`: Query or notebookId missing
- `401`: Unauthorized
- `403`: Notebook not found or access denied
- `500`: Pinecone service error

---

### POST `/api/research-lab/index-source`

Indexes a source in Pinecone.

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

**Errors**:
- `400`: Missing required fields
- `401`: Unauthorized
- `403`: Source not found or access denied
- `500`: Indexing failed

---

## Types

### Source

```typescript
interface Source {
  id: string;
  notebook_id: string;
  user_id: string;
  source_type: 'file' | 'link' | 'text';
  title: string;
  processed_content: string | null;
  content_text: string | null;
  indexing_status: 'pending' | 'indexing' | 'completed' | 'failed';
  vector_count: number | null;
  indexed_at: string | null;
  // ... other fields
}
```

### VectorMetadata

```typescript
interface VectorMetadata {
  notebook_id: string;
  source_id: string;
  source_type: string;
  title: string;
  chunk_index: number;
  chunk_text: string;
  created_at: string;
}
```

### SearchResult

```typescript
interface SearchResult {
  sourceId: string;
  title: string;
  sourceType: string;
  score: number;
  chunkText: string;
  chunkIndex: number;
  notebookId: string;
}
```

---

## Error Handling

All functions return error objects:

```typescript
const { data, error } = await someFunction();

if (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

**Error Structure**:
```typescript
{
  code?: string;      // Error code (e.g., 'TABLE_NOT_FOUND')
  message: string;    // Error message
  hint?: string;      // Helpful hint
  details?: any;      // Additional details
}
```

---

## Configuration

### Environment Variables

```bash
PINECONE_API_KEY=pcsk_...          # Required
PINECONE_INDEX_NAME=bible-aura-... # Optional (default: bible-aura-research-lab)
PINECONE_DIMENSION=1024            # Optional (default: 1024)
```

### Chunking Defaults

- **Max Chunk Size**: 1000 tokens
- **Overlap**: 200 tokens
- **Preserve Boundaries**: Yes (sentence/paragraph breaks)

### Search Defaults

- **Chat**: `topK=8`, `minScore=0.6`
- **Agents**: `topK=10`, `minScore=0.6`

---

## Examples

### Complete Indexing Flow

```typescript
import { indexSource } from '@/lib/research-lab/vector-operations';
import { getSource } from '@/lib/research-lab/db-operations';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const source = await getSource(sourceId, userId);

// Update status
await supabase
  .from('research_sources')
  .update({ indexing_status: 'indexing' })
  .eq('id', sourceId);

// Index
const { vectorCount, error } = await indexSource(
  source,
  source.notebook_id,
  source.processed_content || ''
);

// Update status
await supabase
  .from('research_sources')
  .update({
    indexing_status: error ? 'failed' : 'completed',
    vector_count: vectorCount,
    indexed_at: new Date().toISOString(),
  })
  .eq('id', sourceId);
```

### Complete Search Flow

```typescript
import { searchSimilarSources } from '@/lib/research-lab/vector-operations';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Search Pinecone
const results = await searchSimilarSources(query, notebookId, 8, 0.6);

// Fetch full content
const sourceIds = [...new Set(results.map(r => r.sourceId))];
const { data: sources } = await supabase
  .from('research_sources')
  .select('id, title, processed_content')
  .in('id', sourceIds);

// Build context
const context = sources
  .map(s => {
    const result = results.find(r => r.sourceId === s.id);
    return `[Source: ${s.title} (${(result.score * 100).toFixed(0)}% match)]\n${s.processed_content}`;
  })
  .join('\n\n---\n\n');
```

---

**See Also**:
- [Full Integration Guide](./PINECONE_INTEGRATION_GUIDE.md)
- [Quick Start Guide](./PINECONE_QUICK_START.md)

