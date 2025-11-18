# Research Lab Implementation Plan

## Overview
Create a Bible-specific NotebookLM-like feature where users can upload Bible-related materials and chat with AI that responds exclusively from those sources. The implementation includes a dashboard page, notebook creation/management, file uploads, source-based AI chat, and studio tools.

## Screenshots Reference

The following screenshots were provided as design references:

1. **Dashboard View**: Shows "Recent notebooks" section with "Create new notebook" card and existing notebook cards (ICT, AI) with thumbnails, dates, and source counts.

2. **Add Sources Modal**: Modal dialog with upload area, supported file types list, and options for Google Workspace, Link, and Paste text.

3. **Upload Sources Modal**: Detailed modal showing drag-and-drop upload area, file type support, and source input options.

4. **Notebook View**: Three-column layout with Sources panel (left), Chat panel (center), and Studio panel (right) showing various tools.

*Note: Actual screenshot files should be saved in a `docs/screenshots/research-lab/` directory for reference during implementation.*

---

## Database Schema

### New Tables

1. **research_notebooks** table
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `title` (TEXT, nullable, defaults to "Untitled notebook")
   - `description` (TEXT, nullable)
   - `thumbnail_url` (TEXT, nullable)
   - `source_count` (INTEGER, default 0)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
   - Indexes: user_id, updated_at DESC
   - RLS policies: users can only access their own notebooks

2. **research_sources** table
   - `id` (UUID, primary key)
   - `notebook_id` (UUID, foreign key to research_notebooks)
   - `user_id` (UUID, foreign key to auth.users)
   - `source_type` (TEXT: 'pdf', 'docx', 'txt', 'markdown', 'link', 'text', 'image', 'audio', 'video')
   - `title` (TEXT)
   - `file_path` (TEXT, nullable - Supabase storage path)
   - `file_url` (TEXT, nullable - public/signed URL)
   - `link_url` (TEXT, nullable - for web links)
   - `content_text` (TEXT, nullable - extracted text for text sources)
   - `processed_content` (TEXT, nullable - GLM-processed content)
   - `processing_status` (TEXT, default 'pending': 'pending' | 'processing' | 'completed' | 'failed')
   - `file_size` (BIGINT, nullable)
   - `mime_type` (TEXT, nullable)
   - `is_included` (BOOLEAN, default true - toggle include/exclude)
   - `metadata` (JSONB, nullable - file metadata, page count, duration, etc.)
   - `extracted_verses` (JSONB, nullable - array of verse references found)
   - `key_insights` (JSONB, nullable - AI-extracted insights from GLM-4.5-Air)
   - `toc_structure` (JSONB, nullable - table of contents structure)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
   - Indexes: notebook_id, user_id, source_type, processing_status
   - RLS policies: users can only access sources in their notebooks

3. **research_chat_messages** table
   - `id` (UUID, primary key)
   - `notebook_id` (UUID, foreign key to research_notebooks)
   - `user_id` (UUID, foreign key to auth.users)
   - `role` (TEXT: 'user' | 'assistant')
   - `content` (TEXT)
   - `sources_used` (JSONB, nullable - array of source IDs used in response)
   - `citations` (JSONB, nullable - detailed citations with excerpts)
   - `tool_calls` (JSONB, nullable - function calls made by GLM-4.5-Air)
   - `confidence_score` (FLOAT, nullable - AI confidence in response)
   - `created_at` (TIMESTAMPTZ)
   - Indexes: notebook_id, user_id, created_at
   - RLS policies: users can only access messages in their notebooks

4. **research_studio_outputs** table
   - `id` (UUID, primary key)
   - `notebook_id` (UUID, foreign key to research_notebooks)
   - `user_id` (UUID, foreign key to auth.users)
   - `output_type` (TEXT: 'summary', 'audio_overview', 'mind_map', 'flashcards', 'quiz', 'report', 'study_guide', 'sermon', 'timeline', 'glossary')
   - `content` (JSONB - structured output data)
   - `generated_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
   - Indexes: notebook_id, user_id, output_type
   - RLS policies: users can only access outputs in their notebooks

5. **research_agentic_actions** table (NEW - for GLM-4.5-Air function calling)
   - `id` (UUID, primary key)
   - `notebook_id` (UUID, foreign key to research_notebooks)
   - `user_id` (UUID, foreign key to auth.users)
   - `action_type` (TEXT NOT NULL: 'search', 'synthesize', 'extract', 'generate', 'build')
   - `tool_name` (TEXT NOT NULL - GLM function name)
   - `parameters` (JSONB - function parameters)
   - `result` (JSONB - function execution result)
   - `status` (TEXT DEFAULT 'pending': 'pending' | 'processing' | 'completed' | 'failed')
   - `created_at` (TIMESTAMPTZ DEFAULT NOW())
   - `completed_at` (TIMESTAMPTZ, nullable)
   - Indexes: notebook_id, user_id, action_type, status
   - RLS policies: users can only access actions in their notebooks

## Storage Bucket

Create new Supabase storage bucket: `research-lab-sources`
- Public: false (private bucket)
- File size limit: 50MB per file
- Allowed file types: 
  - Documents: PDF, DOCX, TXT, Markdown
  - Media: Images (JPG, PNG, GIF, WebP), Audio (MP3, WAV, M4A), Video (MP4, WebM)
  - Links: Web URLs (processed via content fetching)
- RLS policies: users can only upload/access files in their own folders (`{user_id}/{notebook_id}/`)

**Multi-Modal Processing:**
- PDF files: Text extraction → stored in `content_text`
- Video files: Frame extraction + audio transcription → both analyzed
- Audio files: Speech-to-text via GLM-4.5-Air → transcript analyzed
- Image files: Direct GLM-4.5-Air vision API analysis
- Links: Content fetched → text extracted → analyzed

## AI Integration: GLM-4.5-Air

### Overview
This Research Lab uses **GLM-4.5-Air** (Z.AI) for advanced multi-modal research capabilities:
- **Chat Completions**: Source-aware conversations with citations
- **Function Calling**: Agentic actions for research tasks
- **Vision Understanding**: Image and video frame analysis
- **Speech-to-Text**: Audio transcription and analysis
- **Web Search**: Link content analysis

### API Configuration

**Environment Variables Required:**
```bash
# GLM-4.5-Air API Configuration
GLM_API_KEY=your_glm_api_key_here
GLM_API_BASE_URL=https://api.z.ai/api/paas/v4
GLM_MODEL=glm-4.5-air  # or glm-4.6 for latest
```

**Get API Key:**
1. Access [Z.AI Open Platform](https://z.ai/model-api)
2. Register or Login
3. Create API Key in [API Keys Management](https://z.ai/manage-apikey/apikey-list)
4. Copy API Key for use

### API Endpoints

#### 1. `api/research-lab-glm-chat.ts` (Primary Chat Endpoint)
- Handles GLM-4.5-Air chat requests with source context
- Accepts: `notebook_id`, `message`, `conversation_history`, `stream`
- Retrieves included sources from database
- Builds source context from processed content
- Calls GLM-4.5-Air API with:
  - Source context + Bible-specific system prompts
  - Function calling tools for agentic actions
  - Streaming support for real-time responses
- Returns: AI response with citations to sources used
- Tracks AI usage via existing `AIUsageTracker`

**Request Format:**
```typescript
{
  notebook_id: string;
  message: string;
  conversation_history?: Array<{role: string, content: string}>;
  stream?: boolean;
  tools?: string[]; // Optional: specific tools to use
}
```

**Response Format:**
```typescript
{
  content: string;
  sources_used: string[]; // Source IDs
  citations: Array<{source_id: string, excerpt: string}>;
  tool_calls?: Array<{tool: string, result: any}>;
  confidence_score?: number;
}
```

#### 2. `api/research-lab-process-source.ts` (Multi-Modal Processing)
- Processes uploaded files using appropriate method:
  - **PDF**: Extract text using pdf-parse or pdfjs-dist
  - **Video**: Extract frames + transcribe audio
  - **Audio**: GLM-4.5-Air speech-to-text → analyze transcript
  - **Link**: Fetch content → extract text → analyze
  - **Image**: Direct GLM-4.5-Air vision API
- Stores extracted content in `research_sources.content_text`
- Auto-generates insights, verse references, TOC
- Updates processing status in database

**Processing Flow:**
1. Upload file to Supabase Storage
2. Detect file type (PDF, video, audio, image, link)
3. Route to appropriate processor
4. Extract/process content
5. Store processed content + metadata
6. Auto-analyze with GLM-4.5-Air for insights
7. Update database with results

#### 3. `api/research-lab-agentic-action.ts` (Agentic Actions)
- Handles function calling for research actions
- Available tools:
  - `search_sources`: Semantic search within sources
  - `extract_verses`: Find and link Bible verses
  - `synthesize_sources`: Combine multiple sources
  - `generate_summary`: Create summaries
  - `create_study_guide`: Generate study guides
  - `build_sermon`: Extract sermon points
- Executes tool calls via GLM-4.5-Air function calling
- Stores results in `research_agentic_actions` table

## Frontend Components

### Pages

1. **`src/pages/ResearchLab.tsx`** (Dashboard)
   - Shows "Recent notebooks" section
   - "Create New Notebook" card
   - Grid of existing notebook cards with thumbnails
   - Each card shows: title, date, source count
   - "See all >" link to full list
   - Route: `/research-lab` (protected)

2. **`src/pages/ResearchNotebook.tsx`** (Notebook View)
   - Three-column layout (Sources | Chat | Studio)
   - Route: `/research-lab/:notebookId` (protected)
   - Uses `ModernLayout` component for consistency

### Components

1. **`src/components/research-lab/CreateNotebookModal.tsx`**
   - Modal for creating new notebook
   - Upload sources interface:
     - Drag & drop file upload area
     - "Upload files" button
     - "Add link" button
     - "Paste text" button
     - "Connect Google Drive" (optional, future)
   - Supported file types list
   - Source limit indicator (0/50)
   - Creates notebook and redirects to notebook view

2. **`src/components/research-lab/SourcesPanel.tsx`**
   - Left panel in notebook view
   - "Add source" button at top
   - List of uploaded sources with:
     - File icon/thumbnail
     - Title
     - Source type badge
     - Toggle switch (include/exclude)
     - Delete button
     - Rename capability
   - Shows source count

3. **`src/components/research-lab/ChatPanel.tsx`**
   - Center panel in notebook view
   - Placeholder: "Add a source to get started" (when no sources)
   - Chat interface similar to `BibleAuraChat` but:
     - Only uses sources from current notebook
     - Shows citation bubbles under AI responses
     - References specific sources used
   - Input field at bottom
   - Message history from `research_chat_messages` table

4. **`src/components/research-lab/StudioPanel.tsx`**
   - Right panel in notebook view
   - Grid of studio tool cards:
     - Audio Overview
     - Video Overview (future)
     - Mind Map
     - Reports
     - Flashcards
     - Quiz
   - Each card shows:
     - Icon
     - Title
     - "Generate" button or preview if already generated
   - Clicking generates output via AI using notebook sources

5. **`src/components/research-lab/AddSourceModal.tsx`**
   - Modal for adding sources to existing notebook
   - Same interface as CreateNotebookModal upload section
   - Supports: file upload, link, paste text

6. **`src/components/research-lab/NotebookCard.tsx`**
   - Card component for notebook grid
   - Shows thumbnail, title, date, source count
   - Click to open notebook
   - Menu button (three dots) for: rename, delete, share

7. **`src/components/research-lab/SourceItem.tsx`**
   - Individual source item in SourcesPanel
   - Shows file icon, title, type
   - Include/exclude toggle
   - Actions menu

## Key Features

### Bible-Optimized AI Prompts
- System prompt emphasizes Bible context understanding
- Links uploaded content to Bible verses when relevant
- Generates Bible study guides, sermon outlines, doctrinal themes
- Simplifies theological texts for lay readers

### Source Management (Multi-Modal Support)
- Upload files to Supabase Storage (PDF, video, audio, images, links)
- **PDF**: Extract text, detect verses, generate TOC
- **Video**: Extract frames, transcribe audio, analyze both
- **Audio**: Transcribe via GLM-4.5-Air speech-to-text, analyze transcript
- **Images**: Direct GLM-4.5-Air vision API analysis
- **Links**: Fetch content, extract text, analyze
- Auto-generate insights on upload
- Extract Bible verses automatically
- Toggle sources on/off for chat context
- Delete and rename sources
- Track source metadata (file size, type, upload date, processing status)
- Show processing progress indicators

### Chat Functionality (GLM-4.5-Air Powered)
- AI responds ONLY from included sources using GLM-4.5-Air
- Real-time streaming responses for better UX
- Citations show which sources were used with excerpts
- Conversation history saved per notebook
- Bible-specific context understanding
- Function calling for agentic research actions
- Confidence scores for AI responses
- Multi-turn conversations with context retention

### Studio Tools
- **Summary**: Auto-generated overview of all sources
- **Audio Overview**: Text-to-speech summary (future)
- **Mind Map**: Visual representation of key themes
- **Flashcards**: Key terms/concepts from sources
- **Quiz**: Questions based on source content
- **Reports**: Structured analysis reports

## Advanced Features (Premium-Grade)

These features make Bible Aura Research Lab significantly more powerful than NotebookLM and other competitors:

### 🔥 1. Bible-Aware Semantic Search (Better than RAG, even without RAG)

Users can search inside their uploaded PDF or book with Bible-contextual queries:

- "Show all verses mentioned in this book."
- "Find every place this commentary talks about grace."
- "Show all quotes by early church fathers in this file."
- "Highlight all Greek/Hebrew word explanations."

**Why it's advanced**: This means Bible-contextual search, not normal keyword search. The AI understands Bible references, theological concepts, and scripture context.

**Implementation**: 
- Use OpenAI embeddings for semantic search within source content
- Bible verse detection and linking
- Theological concept recognition
- Language-aware search (Greek/Hebrew terms)

### 🔥 2. Verse Auto-Linking

When a user uploads a PDF:
- Detect all Bible verses automatically
- Convert them to clickable references
- Show verse previews on hover
- Example: "John 3:16" → show the verse on hover + cross references

**NotebookLM cannot do this.**

**Implementation**:
- Verse reference regex patterns
- Integration with existing Bible data
- Hover tooltip component with verse display
- Cross-reference lookup

### 🔥 3. Multi-Source Synthesis

User uploads multiple sources:
- 1 Bible commentary
- 1 sermon
- 1 theology book
- 1 YouTube transcript

AI generates a merged unified explanation.

**Example query**: "Combine all these sources to give me one clear summary of Romans 8."

**Powerful for pastors** who need to synthesize multiple perspectives.

**Implementation**:
- Multi-source context aggregation
- Conflict resolution in AI prompts
- Source attribution in synthesized output

### 🔥 4. Sermon Builder Mode

Using the user's uploaded content, AI automatically:
- Extracts key ideas
- Generates a 3-point sermon structure
- Adds illustrations
- Adds applications
- Adds a closing prayer
- Adds 5 supporting verses

**This is a premium-grade feature** that saves pastors hours of work.

**Implementation**:
- Structured sermon template
- AI prompt for sermon generation
- Verse selection algorithm
- Illustration extraction from sources

### 🔥 5. Study Guide Auto-Generator

Turn any PDF into a complete Bible study curriculum:
- Key themes
- Summary
- Big ideas
- Memory verses
- Discussion questions
- Application steps

**Basically**: Upload a book → get a Bible study curriculum.

**Implementation**:
- Structured study guide template
- AI extraction of key concepts
- Question generation
- Verse selection for memory work

### 🔥 6. Paraphrase Modes

Let users choose explanation style:
- **Scholarly** (seminary style)
- **Youth group** (simple)
- **Kids** (very simple)
- **Preacher** (powerful tone)
- **Teacher** (structured)

**NotebookLM doesn't offer style switching.**

**Implementation**:
- Style selector in chat panel
- Different AI prompts per style
- Tone and complexity adjustment

### 🔥 7. Theological Lens Selector

User can choose a theological perspective:
- Evangelical
- Pentecostal
- Reformed
- Catholic
- Neutral academic

AI rewrites explanations according to that viewpoint.

**This is huge for global users** with different denominational backgrounds.

**Implementation**:
- Lens selector UI component
- Theological perspective prompts
- Balanced, respectful handling of different views

### 🔥 8. Book Navigator (AI-generated Table of Contents)

When a user uploads a big commentary/book:
- AI creates a table of contents automatically
- Sections become clickable
- Each section gets a mini-summary
- This makes huge PDFs easy to explore

**Implementation**:
- PDF structure analysis
- Chapter/section detection
- TOC generation component
- Navigation sidebar

### 🔥 9. Auto-Highlight Important Insights

AI reads the PDF and highlights:
- "Important quote"
- "Key theological point"
- "Major doctrine explained"
- "Verse interpretation"

**Like Kindle highlights — but AI-powered.**

**Implementation**:
- AI analysis of source content
- Highlight detection and storage
- Visual highlight display
- Export highlights feature

### 🔥 10. AI Timeline & Maps (Bible Geography)

When sources mention:
- Paul's journeys
- Exodus
- Kings of Israel
- Prophets timelines

AI auto-builds:
- Simple timeline visualization
- Map visualization
- People + events connections

**Great for visual learners.**

**Implementation**:
- Timeline component (using existing chart libraries)
- Map integration (Google Maps or similar)
- Event extraction from sources
- Geographic data matching

### 🔥 11. Audio Summary + Audio Lesson

Turn any PDF or link into:
- Audio summary
- Audio sermon
- Audio teaching

**Users can listen like a podcast.**

**Implementation**:
- Text-to-speech API integration
- Audio player component
- Download audio feature
- Playback controls

### 🔥 12. AI Cross-Reference Engine

AI detects verses in the uploaded content and adds:
- Parallel passages
- OT/NT connections
- Thematic links
- Prophecy fulfillment references

**This makes ordinary PDFs into smart Bible commentaries.**

**Implementation**:
- Verse detection in source text
- Cross-reference database lookup
- Thematic connection algorithm
- Display component for cross-references

### 🔥 13. Collaboration Mode

Users can share a notebook:
- With their church
- Bible study group
- Students
- Fellow pastors

Each collaborator can:
- Add notes
- Ask AI questions
- See shared sources
- Contribute to discussions

**Implementation**:
- Notebook sharing/permissions system
- Real-time collaboration (optional)
- User roles (owner, editor, viewer)
- Activity feed

### 🔥 14. Auto-Glossary (Dictionary of Key Terms)

For any upload, AI automatically:
- Extracts technical terms
- Makes definitions
- Links related terms

**Example terms**:
- "Justification"
- "Sanctification"
- "Agape"
- "Shekinah glory"

**Users get a glossary tab automatically.**

**Implementation**:
- Term extraction from sources
- Definition generation
- Glossary UI component
- Term linking/hyperlinks

### 🔥 15. Academic Citation Generator

When AI summarizes or answers:
- MLA / APA citation support
- Bibliographical entries
- Footnotes with source reference

**Perfect for students writing essays or research.**

**Implementation**:
- Citation format templates
- Source metadata collection
- Citation generator component
- Copy-to-clipboard functionality

## Implementation Steps

### Phase 0: GLM-4.5-Air Setup
1. Get GLM-4.5-Air API key from Z.AI platform
2. Configure environment variables (GLM_API_KEY, GLM_API_BASE_URL)
3. Create `src/lib/research-lab/glm-api-helper.ts` for API integration
4. Test basic GLM-4.5-Air API connection

### Phase 1: Core Infrastructure
1. Create database migration files for new tables (including agentic_actions)
2. Set up Supabase storage bucket with RLS policies
3. Create `api/research-lab-glm-chat.ts` endpoint
4. Create `api/research-lab-process-source.ts` for multi-modal processing
5. Create `api/research-lab-agentic-action.ts` for function calling
6. Build Research Lab dashboard page
7. Build Create Notebook modal
8. Build Notebook view with three-column layout

### Phase 2: Source Management
9. Implement Sources panel with upload functionality
10. Add multi-modal file upload support (PDF, video, audio, images, links)
11. Implement source processing pipeline
12. Add processing status indicators
13. Auto-generate insights on upload

### Phase 3: Advanced Chat
14. Implement Chat panel with GLM-4.5-Air integration
15. Add streaming support for real-time responses
16. Implement source citations with excerpts
17. Add function calling UI for agentic actions
18. Save conversation history

### Phase 4: Studio Tools
19. Implement Studio panel with tool generation
20. Connect tools to GLM-4.5-Air function calling
21. Generate summaries, study guides, flashcards, etc.

### Phase 5: Integration & Testing
22. Add routing in App.tsx
23. Add navigation link in sidebar (if using ModernLayout)
24. Test file uploads (all types)
25. Test chat with source context
26. Test agentic actions
27. Test studio tools
28. Performance optimization
29. Error handling and edge cases

## Technical Considerations

### GLM-4.5-Air Integration
- Use existing `uploadFile` utility from `src/lib/supabase-storage.ts`
- Create new `src/lib/research-lab/glm-api-helper.ts` for GLM-4.5-Air API calls
- Implement streaming support for real-time chat responses
- Handle function calling for agentic actions
- Process multi-modal content (PDF, video, audio, images, links)
- Cache processed content to avoid reprocessing

### General Considerations
- Extend existing AI usage tracking for research lab features
- Reuse UI components from shadcn/ui (Dialog, Button, Card, etc.)
- Follow existing code patterns (ProtectedRoute, useAuth, etc.)
- Handle file size limits and validation (50MB max)
- Implement proper error handling and loading states
- Add toast notifications for user feedback
- Ensure mobile responsiveness (use existing responsive hooks)
- Async processing for large files (show progress indicators)
- Rate limiting on GLM-4.5-Air API calls

### Multi-Modal Processing Strategy
1. **Client-Side**: Light processing (small PDFs, image previews)
2. **Server-Side**: Heavy processing (large PDFs, video frames, audio transcription)
3. **Hybrid**: Upload → queue → process → notify when complete
4. **Caching**: Store processed content to avoid reprocessing

## Dependencies

### Required Packages
```bash
# GLM-4.5-Air SDK (Python SDK available, but we'll use HTTP API)
# No npm package needed - use fetch API directly

# PDF Processing
npm install pdf-parse pdfjs-dist

# Video/Audio Processing (if client-side)
npm install @ffmpeg/ffmpeg @ffmpeg/util

# Link Content Extraction
npm install cheerio jsdom readability

# Optional: For better PDF handling
npm install pdf-lib
```

### API Integration
- **GLM-4.5-Air API**: Direct HTTP calls to `https://api.z.ai/api/paas/v4/chat/completions`
- **Authentication**: Bearer token with API key
- **Model**: `glm-4.5-air` or `glm-4.6` (latest)
- **Features Used**:
  - Chat completions with streaming
  - Function calling (agentic actions)
  - Vision API (for images and video frames)
  - Speech-to-text (for audio files)
  - Web search tool (for link analysis)

## Feature Implementation Priority

### Phase 1: Core Features (MVP)
- Basic notebook creation and management
- File upload and source management
- Source-based AI chat
- Basic studio tools (Summary, Flashcards, Quiz)
- Verse auto-linking (Feature #2)

### Phase 2: Essential Advanced Features
- Bible-aware semantic search (Feature #1)
- Multi-source synthesis (Feature #3)
- Study Guide Auto-Generator (Feature #5)
- Paraphrase Modes (Feature #6)
- Auto-Glossary (Feature #14)

### Phase 3: Premium Features
- Sermon Builder Mode (Feature #4)
- Theological Lens Selector (Feature #7)
- Book Navigator (Feature #8)
- Auto-Highlight Important Insights (Feature #9)
- AI Cross-Reference Engine (Feature #12)

### Phase 4: Advanced Visualizations & Collaboration
- AI Timeline & Maps (Feature #10)
- Audio Summary + Audio Lesson (Feature #11)
- Collaboration Mode (Feature #13)
- Academic Citation Generator (Feature #15)

## Future Enhancements

- Google Drive integration
- Video source support
- Export studio outputs (PDF, etc.)
- Version history for notebooks
- Real-time collaboration features
- Advanced analytics and insights

## User Experience Flow

### Step 1: User Opens Research Lab Dashboard
- Page shows recent notebooks
- "Create New Notebook" card is prominent
- Thumbnails of existing notebooks displayed
- Clean, simple UI matching NotebookLM design

### Step 2: User Clicks "Create New Notebook"
- Modal opens with upload interface
- Options: Upload PDF, Upload files, Add link, Paste text
- Connect Google Drive (optional)
- Supported file types clearly listed
- Source limit indicator (0/50)

### Step 3: Notebook Opens With Three Columns
- **Left: Sources Panel**
  - Shows uploaded Bible book / commentary / link
  - "Add source" button
  - Thumbnails of files
  - Toggle "include/exclude source" for each

- **Center: AI Chat Panel**
  - AI responds ONLY from those sources
  - User can ask:
    - "Summarize this commentary chapter"
    - "Explain this PDF book simply"
    - "What does this theology book say about faith?"
    - "Give me sermon points based on this book"
  - Citation bubbles show which sources were used

- **Right: Studio Tools**
  - Automatically generated tools:
    - Summary
    - Audio summary
    - Flashcards
    - Mind Map
    - Reports
    - Quiz
  - Exactly like NotebookLM, but Bible-optimized

## What Makes Bible Aura Research Lab Unique

This is not for random textbooks — this is for Bible-related research only:

- The AI understands scripture context
- It links uploaded books to Bible verses
- It can generate Bible study guides
- It can produce sermon outlines
- It can extract doctrinal themes
- It can simplify theological texts

NotebookLM cannot do this. Bible Aura Research Lab is Bible-optimized.

## Purpose

### For USERS:
They can upload any Bible-related resource and instantly turn it into:
- A study guide
- A sermon
- A theology explanation
- Flashcards
- A mind map
- A summary

### For BIBLE AURA:
This page becomes one of your strongest product features — something no Bible tool currently has.

---

## Implementation Checklist

### Core Features (Phase 1)
- [ ] Database migration files created
- [ ] Storage bucket configured
- [ ] API endpoint for source-based chat
- [ ] Research Lab dashboard page
- [ ] Create Notebook modal
- [ ] Notebook view (three-column layout)
- [ ] Sources panel component
- [ ] Chat panel component
- [ ] Studio panel component
- [ ] Add source modal
- [ ] Notebook card component
- [ ] Source item component
- [ ] Verse auto-linking (Feature #2)
- [ ] Routing configured
- [ ] Navigation link added
- [ ] TypeScript types added
- [ ] Testing completed
- [ ] Documentation updated

### Advanced Features (Phase 2-4)
- [ ] Bible-aware semantic search (Feature #1)
- [ ] Multi-source synthesis (Feature #3)
- [ ] Sermon Builder Mode (Feature #4)
- [ ] Study Guide Auto-Generator (Feature #5)
- [ ] Paraphrase Modes (Feature #6)
- [ ] Theological Lens Selector (Feature #7)
- [ ] Book Navigator / TOC (Feature #8)
- [ ] Auto-Highlight Important Insights (Feature #9)
- [ ] AI Timeline & Maps (Feature #10)
- [ ] Audio Summary + Audio Lesson (Feature #11)
- [ ] AI Cross-Reference Engine (Feature #12)
- [ ] Collaboration Mode (Feature #13)
- [ ] Auto-Glossary (Feature #14)
- [ ] Academic Citation Generator (Feature #15)

---

## GLM-4.5-Air Integration Details

### Function Calling Tools

GLM-4.5-Air supports function calling for agentic research actions. Define these tools:

```typescript
const researchTools = [
  {
    type: "function",
    function: {
      name: "search_sources",
      description: "Search within uploaded sources for specific content, verses, or concepts",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          source_ids: { type: "array", items: { type: "string" }, description: "Source IDs to search" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "extract_verses",
      description: "Extract and link Bible verses from sources",
      parameters: {
        type: "object",
        properties: {
          source_id: { type: "string", description: "Source ID" },
          verse_reference: { type: "string", description: "Optional verse reference to find" }
        },
        required: ["source_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "synthesize_sources",
      description: "Combine multiple sources into unified explanation",
      parameters: {
        type: "object",
        properties: {
          source_ids: { type: "array", items: { type: "string" } },
          question: { type: "string", description: "Question to answer by synthesizing sources" }
        },
        required: ["source_ids", "question"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_summary",
      description: "Generate summary of selected sources",
      parameters: {
        type: "object",
        properties: {
          source_ids: { type: "array", items: { type: "string" } },
          summary_type: { type: "string", enum: ["brief", "detailed", "thematic"] }
        },
        required: ["source_ids"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_study_guide",
      description: "Create Bible study guide from sources",
      parameters: {
        type: "object",
        properties: {
          source_ids: { type: "array", items: { type: "string" } },
          topic: { type: "string", description: "Study topic" }
        },
        required: ["source_ids", "topic"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "build_sermon",
      description: "Extract sermon points and structure from sources",
      parameters: {
        type: "object",
        properties: {
          source_ids: { type: "array", items: { type: "string" } },
          scripture_reference: { type: "string", description: "Main scripture reference" }
        },
        required: ["source_ids"]
      }
    }
  }
];
```

### System Prompts for Bible Context

```typescript
const BIBLE_RESEARCH_SYSTEM_PROMPT = `You are a Bible research assistant powered by GLM-4.5-Air. Your role is to help users understand Bible-related content from their uploaded sources.

Key Guidelines:
1. Always respond based ONLY on the provided sources
2. Cite specific sources when referencing content
3. Understand Bible verse references and theological concepts
4. Link uploaded content to relevant Bible verses
5. Provide accurate, Bible-focused insights
6. Use function calling tools when appropriate for research tasks

When analyzing sources:
- Detect and link Bible verse references
- Identify theological themes and doctrines
- Extract key insights and quotes
- Understand context and historical background
- Connect concepts across different sources

Always cite your sources clearly.`;
```

### Multi-Modal Processing Examples

**PDF Processing:**
```typescript
// Extract text from PDF
const pdfText = await extractPDFText(file);
// Analyze with GLM-4.5-Air
const analysis = await glmChat({
  messages: [{ role: "user", content: `Analyze this PDF content and extract key insights:\n\n${pdfText}` }]
});
```

**Video Processing:**
```typescript
// Extract frames and transcribe audio
const frames = await extractVideoFrames(videoFile);
const transcript = await glmSpeechToText(audioFile);
// Analyze both
const analysis = await glmChat({
  messages: [
    { role: "user", content: `Analyze this video transcript:\n\n${transcript}` },
    ...frames.map(frame => ({ role: "user", content: `Frame: ${frame}` }))
  ]
});
```

**Audio Processing:**
```typescript
// Transcribe audio
const transcript = await glmSpeechToText(audioFile);
// Analyze transcript
const analysis = await glmChat({
  messages: [{ role: "user", content: `Analyze this audio transcript:\n\n${transcript}` }]
});
```

**Link Processing:**
```typescript
// Fetch and extract content
const content = await fetchLinkContent(url);
// Analyze with GLM-4.5-Air
const analysis = await glmChat({
  messages: [{ role: "user", content: `Analyze this web content:\n\n${content}` }]
});
```

### Error Handling

```typescript
// Handle GLM-4.5-Air API errors
try {
  const response = await glmChat({...});
} catch (error) {
  if (error.status === 401) {
    // Invalid API key
  } else if (error.status === 429) {
    // Rate limit exceeded
  } else if (error.status === 500) {
    // Server error
  }
}
```

---

*Plan created: [Current Date]*
*Status: Ready for Implementation with GLM-4.5-Air*
*Last Updated: Added GLM-4.5-Air integration details*

