-- Add missing columns to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS shared_with text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS formatted_content jsonb,
ADD COLUMN IF NOT EXISTS entry_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS word_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time integer DEFAULT 0;

-- Create index for faster tag searches
CREATE INDEX IF NOT EXISTS journal_entries_tags_idx ON journal_entries USING GIN(tags);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS journal_entries_entry_date_idx ON journal_entries(entry_date);

-- Update existing entries to set entry_date from created_at if null
UPDATE journal_entries 
SET entry_date = created_at::date 
WHERE entry_date IS NULL;

-- Function to calculate reading time based on word count
CREATE OR REPLACE FUNCTION calculate_reading_time(word_count integer)
RETURNS integer AS $$
BEGIN
    -- Assuming 200 words per minute reading speed
    RETURN GREATEST(1, CEIL(word_count::float / 200));
END;
$$ LANGUAGE plpgsql;

-- Function to automatically calculate word count and reading time
CREATE OR REPLACE FUNCTION update_journal_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content
    NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
    
    -- Calculate reading time
    NEW.reading_time = calculate_reading_time(NEW.word_count);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stats on insert/update
DROP TRIGGER IF EXISTS journal_entries_stats_trigger ON journal_entries;
CREATE TRIGGER journal_entries_stats_trigger
    BEFORE INSERT OR UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_stats();

-- Update existing entries with calculated stats
UPDATE journal_entries 
SET 
    word_count = array_length(string_to_array(trim(content), ' '), 1),
    reading_time = calculate_reading_time(array_length(string_to_array(trim(content), ' '), 1))
WHERE word_count = 0 OR word_count IS NULL; 