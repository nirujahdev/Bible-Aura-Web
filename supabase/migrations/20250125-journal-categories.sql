-- Add category column to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'personal';

-- Update existing entries to have a default category
UPDATE journal_entries 
SET category = 'personal' 
WHERE category IS NULL;

-- Add index for better performance on category filtering
CREATE INDEX IF NOT EXISTS idx_journal_entries_category 
ON journal_entries(category);

-- Add index for better performance on date filtering
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date 
ON journal_entries(entry_date);

-- Add index for better performance on user and date combination
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date 
ON journal_entries(user_id, entry_date); 