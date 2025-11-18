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
   - `source_type` (TEXT: 'pdf', 'docx', 'txt', 'markdown', 'link', 'text', 'image', 'audio')
   - `title` (TEXT)
   - `file_path` (TEXT, nullable - Supabase storage path)
   - `file_url` (TEXT, nullable - public/signed URL)
   - `link_url` (TEXT, nullable - for web links)
   - `content_text` (TEXT, nullable - extracted text for text sources)
   - `file_size` (BIGINT, nullable)
   - `mime_type` (TEXT, nullable)
   - `is_included` (BOOLEAN, default true - toggle include/exclude)
   - `metadata` (JSONB, nullable - file metadata, page count, etc.)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
   - Indexes: notebook_id, user_id, source_type
   - RLS policies: users can only access sources in their notebooks

3. **research_chat_messages** table
   - `id` (UUID, primary key)
   - `notebook_id` (UUID, foreign key to research_notebooks)
   - `user_id` (UUID, foreign key to auth.users)
   - `role` (TEXT: 'user' | 'assistant')
   - `content` (TEXT)
   - `sources_used` (JSONB, nullable - array of source IDs used in response)
   - `created_at` (TIMESTAMPTZ)
   - Indexes: notebook_id, user_id, created_at
   - RLS policies: users can only access messages in their notebooks

4. **research_studio_outputs** table
   - `id` (UUID, primary key)
   - `notebook_id` (UUID, foreign key to research_notebooks)
   - `user_id` (UUID, foreign key to auth.users)
   - `output_type` (TEXT: 'summary', 'audio_overview', 'mind_map', 'flashcards', 'quiz', 'report')
   - `content` (JSONB - structured output data)
   - `generated_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
   - Indexes: notebook_id, user_id, output_type
   - RLS policies: users can only access outputs in their notebooks

## Storage Bucket

Create new Supabase storage bucket: `research-lab-sources`
- Public: false (private bucket)
- File size limit: 50MB per file
- Allowed file types: PDF, DOCX, TXT, Markdown, images, audio files
- RLS policies: users can only upload/access files in their own folders (`{user_id}/{notebook_id}/`)

## API Endpoints

### New API: `api/research-lab-chat.ts`
- Handles chat requests with source context
- Accepts: `notebook_id`, `message`, `conversation_history`
- Retrieves included sources from database
- Extracts text from sources (if needed)
- Calls OpenAI API with source context + Bible-specific prompts
- Returns: AI response with citations to sources used
- Tracks AI usage via existing `AIUsageTracker`

### Optional: `api/research-lab-process-source.ts`
- Processes uploaded files (extract text from PDFs, etc.)
- Uses OpenAI File API or client-side extraction
- Stores extracted text in `research_sources.content_text`

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

### Source Management
- Upload files to Supabase Storage
- Extract and store text content for searchability
- Toggle sources on/off for chat context
- Delete and rename sources
- Track source metadata (file size, type, upload date)

### Chat Functionality
- AI responds ONLY from included sources
- Citations show which sources were used
- Conversation history saved per notebook
- Bible-specific context understanding

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

1. Create database migration files for new tables
2. Set up Supabase storage bucket with RLS policies
3. Create API endpoint for source-based chat
4. Build Research Lab dashboard page
5. Build Create Notebook modal
6. Build Notebook view with three-column layout
7. Implement Sources panel with upload functionality
8. Implement Chat panel with source-aware AI
9. Implement Studio panel with tool generation
10. Add routing in App.tsx
11. Add navigation link in sidebar (if using ModernLayout)
12. Test file uploads, chat, and studio tools

## Technical Considerations

- Use existing `uploadFile` utility from `src/lib/supabase-storage.ts`
- Extend existing AI usage tracking for research lab features
- Reuse UI components from shadcn/ui (Dialog, Button, Card, etc.)
- Follow existing code patterns (ProtectedRoute, useAuth, etc.)
- Handle file size limits and validation
- Implement proper error handling and loading states
- Add toast notifications for user feedback
- Ensure mobile responsiveness (use existing responsive hooks)

## Dependencies

- No new npm packages required (use existing OpenAI, Supabase, React Router)
- May need PDF text extraction library if doing client-side processing (optional)

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

*Plan created: [Current Date]*
*Status: Ready for Implementation*

