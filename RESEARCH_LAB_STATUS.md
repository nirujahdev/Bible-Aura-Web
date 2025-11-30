# Research Lab Status

## Database Migrations

All Research Lab migrations are located in `supabase/migrations/`:

1. **20241118000000_create_research_lab_tables.sql** - Main tables (notebooks, sources, chat, studio outputs)
2. **20241118000001_add_collaboration_tables.sql** - Collaboration features
3. **20241118000002_update_studio_outputs_for_agents.sql** - Agent output support
4. **20241118000003_create_storage_bucket.sql** - File storage bucket
5. **20241118000004_add_vector_indexing_metadata.sql** - Pinecone indexing metadata
6. **20241118000005_add_metadata_to_studio_outputs.sql** - Studio outputs metadata
7. **20241118000006_fix_function_search_path_security.sql** - Security fixes
8. **20241118000007_add_manual_note_output_type.sql** - Manual notes support
9. **20241118000008_add_research_lab_performance_indexes.sql** - Performance indexes

### To Apply Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL from each migration file (in order)
3. Run each migration in the SQL Editor
4. Verify tables exist: `research_notebooks`, `research_sources`, `research_chat_messages`, `research_studio_outputs`

## Recent Updates

### ✅ Completed
- Removed sermon agent (no longer supported)
- Optimized source processing polling (5s interval)
- Enhanced source search (title, type, status filtering)
- Replaced console logs with logger utility
- Improved error messages with better context

### 🔄 Performance Optimizations
- Polling frequency: 3s → 5s (reduces server load)
- Source search: Multi-field filtering
- Caching: 30-second cache for sources
- Rate limiting: 20 req/min (chat), 10 req/min (agents)

### 📝 Code Quality
- Logger utility for consistent logging
- Better error handling with user-friendly messages
- Database migration documentation

## Features

- **Notebooks**: Create and manage research notebooks
- **Sources**: Upload PDFs, DOCX, text, links, images, audio, video
- **AI Chat**: Chat with AI about your sources (GLM-4.5-Air)
- **AI Agents**: 5 agents (Summarize, Cross-Reference, Study Builder, Doctrine Lens, Translate)
- **Vector Search**: Pinecone semantic search for source retrieval
- **Studio Outputs**: Save and manage AI-generated content

