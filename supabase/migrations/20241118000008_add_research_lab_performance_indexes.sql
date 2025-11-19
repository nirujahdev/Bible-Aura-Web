-- Research Lab Performance Indexes Migration
-- Adds composite indexes for common query patterns to improve performance

-- Composite index for filtering ready sources by notebook and user
-- Used in: api/research-lab/agents/index.ts, api/research-lab/chat.ts
CREATE INDEX IF NOT EXISTS idx_research_sources_notebook_user_status 
ON research_sources(notebook_id, user_id, processing_status) 
WHERE processing_status = 'completed' OR processing_status IS NULL;

-- Composite index for indexing status checks
-- Used in: api/research-lab/index-source.ts, SourcesPanel polling
CREATE INDEX IF NOT EXISTS idx_research_sources_notebook_indexing 
ON research_sources(notebook_id, indexing_status) 
WHERE indexing_status IN ('pending', 'indexing', 'failed');

-- Composite index for included sources filtering
-- Used in: getCachedSources, SourcesPanel
CREATE INDEX IF NOT EXISTS idx_research_sources_included_status 
ON research_sources(is_included, processing_status) 
WHERE is_included = true;

-- Composite index for studio outputs retrieval
-- Used in: getStudioOutputs, StudioPanel
CREATE INDEX IF NOT EXISTS idx_research_studio_outputs_notebook_user_generated 
ON research_studio_outputs(notebook_id, user_id, generated_at DESC);

-- Index for notebook listing with user and update time
-- Used in: getUserNotebooks
CREATE INDEX IF NOT EXISTS idx_research_notebooks_user_updated 
ON research_notebooks(user_id, updated_at DESC);

-- Index for chat messages by notebook and creation time
-- Used in: ChatPanel message loading
CREATE INDEX IF NOT EXISTS idx_research_chat_messages_notebook_created 
ON research_chat_messages(notebook_id, created_at DESC);

