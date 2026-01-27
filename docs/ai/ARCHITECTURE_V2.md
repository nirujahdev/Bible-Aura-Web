# Bible Aura AI Chat V2 - Architecture Documentation

## Overview

Advanced Bible Chat V2 uses LangChain orchestration with gpt-4o-mini for all LLM operations, Pinecone for vector retrieval, and Supabase for conversation storage. The system ensures zero hallucinations by grounding all responses in validated Bible verses and providing transparent source attribution.

## Pinecone Index Structure

### Index: `bible-aura-bible`
- **Dimension**: 1536 (OpenAI text-embedding-3-small)
- **Metric**: cosine
- **Status**: Ready
- **Record Count**: 62,204 vectors
- **Embedding Model**: text-embedding-3-small

#### Metadata Schema
```typescript
{
  content_type: 'bible',        // Always 'bible' for this index
  language: 'en' | 'ta',         // English or Tamil
  book: string,                  // Book name (e.g., "John")
  chapter: number,               // Chapter number
  verse: number,                 // Verse number
  verse_reference: string,      // Full reference (e.g., "John 3:16")
  chunk_index: number,          // Chunk index if verse is chunked
  translation: string,          // Translation code (e.g., "KJV")
  verse_text: string            // Original verse text stored in metadata
}
```

#### Vector ID Format
```
bible:{lang}:{book}:{chapter}:{verse}:{chunk_index}
Example: bible:en:John:3:16:0
```

#### Score Thresholds
- **MIN_SCORE**: 0.7 (minimum similarity for retrieval)
- **Good matches**: 0.7 - 0.85
- **Excellent matches**: 0.85 - 1.0

### Index: `cross-references`
- **Dimension**: 1536 (OpenAI text-embedding-3-small)
- **Metric**: cosine
- **Status**: Ready
- **Record Count**: 94,389 vectors
- **Purpose**: Semantic cross-reference relationships between verses

#### Usage
- Queried when verse references detected in user query
- Returns related verses based on semantic similarity
- Used to enrich context with thematic connections

## Supabase Schema

### Table: `ai_conversations`
**Purpose**: Stores conversation threads with message history

**Schema**:
```sql
id: uuid (PK)
user_id: uuid (FK → auth.users)
title: text
messages: jsonb                    -- Array of message objects
mode: text                         -- chat, verse, parable, etc.
language: text                     -- english, tamil
translation: text                 -- KJV, NIV, etc.
created_at: timestamptz
updated_at: timestamptz
```

**RLS**: Enabled (users can only access their own conversations)

**messages JSONB Structure**:
```json
[
  {
    "id": "string",
    "role": "user" | "assistant",
    "content": "string",
    "timestamp": "ISO string",
    "mode": "string",
    "sources": [...],
    "validatedVerses": [...],
    "followUpQuestions": [...],
    "thinking": {...}
  }
]
```

### Table: `ai_message_logs`
**Purpose**: Detailed analytics and logging for each message

**Key Columns**:
- `content`: text (message text)
- `metadata`: jsonb (sources, validatedVerses, thinking, etc.)
- `has_sources`: boolean
- `sources_count`: integer
- `has_validated_verses`: boolean
- `validated_verses_count`: integer
- `validation_status`: text (stored in metadata)
- `response_time_ms`: integer
- Analytics fields: sentiment, emotion, topic, etc.

**RLS**: Enabled

**metadata JSONB Structure**:
```json
{
  "sources": [...],
  "validatedVerses": [...],
  "followUpQuestions": [...],
  "validationStatus": "verified" | "partial" | "failed",
  "thinking": {
    "reasoningSummary": [...],
    "selectedSources": [...],
    "confidence": "high" | "medium" | "low"
  }
}
```

## Bible JSON Data Storage

### English Bible
- **Path**: `/public/Bible/KJV_bible.json`
- **Structure**: `{BookName: {chapter: {verse: text}}}`
- **Example**: `{"John": {"3": {"16": "For God so loved the world..."}}}`

### Tamil Bible
- **Path**: `/public/Bible/Tamil bible/{BookName}.json`
- **Structure**: Same as English (one file per book)
- **Example**: `/public/Bible/Tamil bible/John.json`

### Verse Lookup Function
- **Client-side**: `src/lib/ai-bible-system.tsx::loadBibleVerse()`
- **Server-side**: New API endpoint `/api/bible-verse-lookup.ts` (to be created)

## Pipeline Architecture

### Stage A: Router
- **Model**: gpt-4o-mini
- **Input**: User query, optional mode/language preferences
- **Output**: `{mode, lang, hasDirectVerseRef, verseRefs[]}`
- **Purpose**: Detect intent, language, extract verse references

### Stage B: Retriever
- **Tool**: Pinecone SDK (direct, not LangChain integration)
- **Index**: `bible-aura-bible`
- **Query**: Generate embedding → Pinecone query
- **Filters**: `content_type='bible'`, `language={lang}`
- **topK**: 30 candidates
- **Output**: Array of `{id, score, metadata, text}`

### Stage C: Rerank
- **Model**: gpt-4o-mini
- **Input**: 30 candidates from retriever
- **Output**: Top 8-12 ranked passages (strict JSON)
- **Scoring**: `finalScore = (originalScore * 0.6) + (rerankScore * 0.4)`

### Stage D: Evidence Pack Builder
- **Purpose**: Convert reranked docs to sources[] format
- **Source ID**: `bible:{book}:{chapter}:{verse}:{chunk_index}`
- **Output**: `sources[]` with id, filename, score, reference, snippet

### Stage E: Grounding Plan
- **Model**: gpt-4o-mini
- **Input**: Query + evidence pack
- **Output**: `{usedVerseRefs[], reasoningSummary[], confidenceDraft}`
- **Critical**: NO verse text in output, only references

### Stage F: Compose Response
- **Model**: gpt-4o-mini
- **Input**: Query + grounding plan + evidence pack
- **Output**: `{text, mode, lang, usedVerseRefs[], followUpQuestions[]}`
- **Formatting**: ➤ ⤷ ↗ symbols only, NO markdown, NO verse quotations

### Stage G: Quote Injection
- **Tool**: Bible JSON API endpoint
- **Input**: `usedVerseRefs[]` from compose stage
- **Process**: Fetch exact verseText from Bible JSON
- **Output**: `validatedVerses[]` with exact verse text

### Stage H: Validators
- **Type**: Deterministic (no LLM)
- **Checks**:
  1. Every verse ref in text exists in validatedVerses
  2. sources.length <= 5
  3. followUpQuestions.length between 3-5
  4. At least one verse reference in text
- **Output**: `validationStatus: 'verified' | 'partial' | 'failed'`

### Stage I: Persist
- **Tables**: `ai_conversations`, `ai_message_logs`
- **Data**: Full response + metadata + analytics

## Response Contract

### Required Fields
```typescript
{
  text: string,
  mode: 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa',
  lang: 'en' | 'ta',
  sources?: Array<{
    id: string,
    filename: string,
    score: number,
    url?: string,
    snippet?: string,
    reference?: string,
    verseText?: string
  }>,
  crossReferences?: string[],
  validatedVerses?: Array<{
    reference: string,
    verseText: string,
    book: string,
    chapter: number,
    verse: number
  }>,
  followUpQuestions?: Array<{
    question: string,
    relevance: number
  }>,
  validationStatus?: 'verified' | 'partial' | 'failed'
}
```

### Optional Extension
```typescript
{
  thinking?: {
    reasoningSummary: string[],
    selectedSources: Array<{
      reference?: string,
      filename: string,
      score: number,
      url?: string
    }>,
    confidence: 'high' | 'medium' | 'low'
  }
}
```

## Formatting Rules

### Allowed Symbols
- `➤` - Main title/section
- `⤷` - Sub-sections
- `↗` - Additional headings (optional)

### Forbidden
- Markdown: `#`, `*`, `**`, etc.
- Emojis
- Decorative symbols
- Verse text quotations (only references like "John 3:16")

### Required
- Blank lines between sections
- At least one verse reference in every response
- Mode-specific formatting (see `src/lib/ai-response-templates/`)

## Invariants

1. **Zero Hallucinations**: Every verse reference must exist in validatedVerses
2. **Accurate Quotes**: verseText always from Bible JSON, never generated
3. **Source Attribution**: Every claim backed by sources[] or validatedVerses[]
4. **Model Consistency**: All LLM calls use gpt-4o-mini
5. **Response Shape**: Must match exact API contract (can add optional fields)
6. **Validation**: validationStatus reflects actual grounding quality

## Cache Strategy

- **Cache Key**: Include pipeline version "v2" in key
- **TTL**: 5 minutes (same as v1)
- **Key Format**: `{message}|{mode}|{language}|v2`

## Error Handling

- **Retrieval Failure**: Fallback to user input as context
- **Verse Lookup Failure**: Skip that verse, continue with others
- **Validation Failure**: Return safe fallback message with at least one verse ref
- **LLM Failure**: Retry once, then return error response

## Performance Targets

- **Retrieval**: < 500ms
- **Rerank**: < 2s
- **Compose**: < 5s
- **Total Pipeline**: < 10s (excluding persistence)

## Security

- **RLS**: All Supabase tables have Row Level Security enabled
- **API Keys**: Stored in environment variables
- **Input Sanitization**: All user input sanitized before processing
- **Output Validation**: All LLM outputs validated against schema

