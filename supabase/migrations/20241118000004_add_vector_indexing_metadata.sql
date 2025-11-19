-- Migration: Add Vector Indexing Metadata for Pinecone Integration
-- Adds columns and table to track source indexing status

-- Add indexing metadata columns to research_sources
ALTER TABLE research_sources
ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS vector_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS indexing_status TEXT DEFAULT 'pending' 
  CHECK (indexing_status IN ('pending', 'indexing', 'completed', 'failed'));

-- Create index for faster lookups by indexing status
CREATE INDEX IF NOT EXISTS idx_research_sources_indexing_status 
  ON research_sources(indexing_status) 
  WHERE indexing_status IN ('pending', 'indexing');

-- Create research_source_chunks table to track chunked content
CREATE TABLE IF NOT EXISTS research_source_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_start INTEGER, -- Character position in original text
  chunk_end INTEGER,   -- Character position in original text
  vector_id TEXT,      -- Pinecone vector ID (format: notebook_id:source_id:chunk_index)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, chunk_index)
);

-- Indexes for research_source_chunks
CREATE INDEX IF NOT EXISTS idx_research_source_chunks_source_id 
  ON research_source_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_research_source_chunks_vector_id 
  ON research_source_chunks(vector_id) 
  WHERE vector_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE research_source_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_source_chunks
DROP POLICY IF EXISTS "Users can view chunks in their sources" ON research_source_chunks;
CREATE POLICY "Users can view chunks in their sources" ON research_source_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM research_sources
      WHERE research_sources.id = research_source_chunks.source_id
      AND research_sources.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert chunks in their sources" ON research_source_chunks;
CREATE POLICY "Users can insert chunks in their sources" ON research_source_chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_sources
      WHERE research_sources.id = research_source_chunks.source_id
      AND research_sources.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update chunks in their sources" ON research_source_chunks;
CREATE POLICY "Users can update chunks in their sources" ON research_source_chunks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM research_sources
      WHERE research_sources.id = research_source_chunks.source_id
      AND research_sources.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete chunks in their sources" ON research_source_chunks;
CREATE POLICY "Users can delete chunks in their sources" ON research_source_chunks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM research_sources
      WHERE research_sources.id = research_source_chunks.source_id
      AND research_sources.user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON COLUMN research_sources.indexed_at IS 'Timestamp when source was indexed in Pinecone';
COMMENT ON COLUMN research_sources.vector_count IS 'Number of vectors created for this source (chunks)';
COMMENT ON COLUMN research_sources.indexing_status IS 'Status of vector indexing: pending, indexing, completed, failed';
COMMENT ON TABLE research_source_chunks IS 'Stores chunked content for vector indexing in Pinecone';
COMMENT ON COLUMN research_source_chunks.vector_id IS 'Pinecone vector ID (format: notebook_id:source_id:chunk_index)';

