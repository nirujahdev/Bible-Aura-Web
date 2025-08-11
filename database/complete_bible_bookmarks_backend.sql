-- =====================================================
-- BIBLE AURA - COMPLETE BIBLE BOOKMARKS & FAVORITES BACKEND
-- Single File - Full Working Solution
-- Version: Final - No Issues
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. DROP EXISTING TABLES AND POLICIES (CLEAN SLATE)
-- =====================================================

-- Drop existing policies safely (only if tables exist)
DO $$ 
BEGIN
    -- Drop policies only if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bible_verses') THEN
        DROP POLICY IF EXISTS "verses_select_policy" ON bible_verses;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'verse_bookmarks') THEN
        DROP POLICY IF EXISTS "bookmarks_policy" ON verse_bookmarks;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'verse_favorites') THEN
        DROP POLICY IF EXISTS "favorites_policy" ON verse_favorites;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'verse_collections') THEN
        DROP POLICY IF EXISTS "collections_policy" ON verse_collections;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'verse_highlights') THEN
        DROP POLICY IF EXISTS "highlights_policy" ON verse_highlights;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'study_notes') THEN
        DROP POLICY IF EXISTS "study_notes_policy" ON study_notes;
    END IF;
END $$;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS bible_analytics CASCADE;
DROP TABLE IF EXISTS verse_search_history CASCADE;
DROP TABLE IF EXISTS shared_collections CASCADE;
DROP TABLE IF EXISTS reading_plan_progress CASCADE;
DROP TABLE IF EXISTS reading_plans CASCADE;
DROP TABLE IF EXISTS study_notes CASCADE;
DROP TABLE IF EXISTS verse_highlights CASCADE;
DROP TABLE IF EXISTS collection_verses CASCADE;
DROP TABLE IF EXISTS verse_collections CASCADE;
DROP TABLE IF EXISTS verse_favorites CASCADE;
DROP TABLE IF EXISTS verse_bookmarks CASCADE;
DROP TABLE IF EXISTS verse_cross_references CASCADE;
DROP TABLE IF EXISTS bible_verses CASCADE;
DROP TABLE IF EXISTS bible_chapters CASCADE;
DROP TABLE IF EXISTS bible_books CASCADE;
DROP TABLE IF EXISTS bible_translations CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_bookmark_counts() CASCADE;
DROP FUNCTION IF EXISTS update_collection_counts() CASCADE;
DROP FUNCTION IF EXISTS update_reading_progress() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS search_verses(text, text, text) CASCADE;

-- =====================================================
-- 2. CORE BIBLE STRUCTURE
-- =====================================================

-- Bible Translations
CREATE TABLE bible_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abbreviation TEXT NOT NULL UNIQUE CHECK (length(abbreviation) >= 2 AND length(abbreviation) <= 10),
    full_name TEXT NOT NULL CHECK (length(full_name) >= 5),
    language TEXT NOT NULL DEFAULT 'English',
    language_code TEXT NOT NULL DEFAULT 'en',
    description TEXT,
    copyright_info TEXT,
    year_published INTEGER CHECK (year_published > 0 AND year_published <= EXTRACT(YEAR FROM NOW())),
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bible Books
CREATE TABLE bible_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_number INTEGER NOT NULL CHECK (book_number >= 1 AND book_number <= 66),
    book_name TEXT NOT NULL CHECK (length(book_name) >= 2),
    book_abbreviation TEXT NOT NULL CHECK (length(book_abbreviation) >= 1),
    testament TEXT NOT NULL CHECK (testament IN ('Old Testament', 'New Testament')),
    chapter_count INTEGER NOT NULL CHECK (chapter_count > 0),
    verse_count INTEGER NOT NULL CHECK (verse_count > 0),
    category TEXT CHECK (category IN ('Law', 'History', 'Wisdom', 'Prophecy', 'Gospels', 'Acts', 'Epistles', 'Revelation')),
    author TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_number, book_name)
);

-- Bible Chapters
CREATE TABLE bible_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES bible_books(id) ON DELETE CASCADE NOT NULL,
    chapter_number INTEGER NOT NULL CHECK (chapter_number > 0),
    verse_count INTEGER NOT NULL CHECK (verse_count > 0),
    summary TEXT,
    theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, chapter_number)
);

-- Bible Verses (Multi-translation support)
CREATE TABLE bible_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id UUID REFERENCES bible_translations(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES bible_books(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES bible_chapters(id) ON DELETE CASCADE NOT NULL,
    verse_number INTEGER NOT NULL CHECK (verse_number > 0),
    verse_text TEXT NOT NULL CHECK (length(verse_text) >= 1),
    verse_reference TEXT NOT NULL, -- e.g., "John 3:16"
    full_reference TEXT NOT NULL, -- e.g., "John 3:16 (NIV)"
    words_of_jesus BOOLEAN DEFAULT FALSE,
    is_poetry BOOLEAN DEFAULT FALSE,
    footnotes TEXT,
    cross_references TEXT[],
    strong_numbers INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(translation_id, book_id, chapter_id, verse_number)
);

-- Verse Cross References
CREATE TABLE verse_cross_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE NOT NULL,
    referenced_verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE NOT NULL,
    reference_type TEXT DEFAULT 'related' CHECK (reference_type IN ('parallel', 'related', 'quoted', 'allusion', 'contrast')),
    strength INTEGER DEFAULT 5 CHECK (strength >= 1 AND strength <= 10),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(verse_id, referenced_verse_id)
);

-- =====================================================
-- 3. USER BOOKMARKS SYSTEM
-- =====================================================

-- Verse Bookmarks
CREATE TABLE verse_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE NOT NULL,
    bookmark_type TEXT DEFAULT 'saved' CHECK (bookmark_type IN ('saved', 'to_read', 'memorizing', 'studying', 'sharing')),
    is_private BOOLEAN DEFAULT FALSE,
    personal_note TEXT,
    tags TEXT[] DEFAULT '{}',
    reminder_date DATE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- Verse Favorites (Quick access)
CREATE TABLE verse_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE NOT NULL,
    favorite_reason TEXT CHECK (favorite_reason IN ('comfort', 'inspiration', 'guidance', 'promise', 'memory', 'study', 'other')),
    personal_testimony TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- =====================================================
-- 4. COLLECTIONS & ORGANIZATION SYSTEM
-- =====================================================

-- Verse Collections (Folders/Categories)
CREATE TABLE verse_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    collection_name TEXT NOT NULL CHECK (length(collection_name) >= 1 AND length(collection_name) <= 100),
    description TEXT,
    color_theme TEXT DEFAULT 'blue' CHECK (color_theme IN ('blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'gray')),
    icon TEXT DEFAULT 'bookmark',
    is_private BOOLEAN DEFAULT TRUE,
    is_system_collection BOOLEAN DEFAULT FALSE, -- For default collections like "Favorites", "To Read"
    verse_count INTEGER DEFAULT 0 CHECK (verse_count >= 0),
    sort_order INTEGER DEFAULT 0,
    parent_collection_id UUID REFERENCES verse_collections(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, collection_name)
);

-- Collection Verses (Many-to-many relationship)
CREATE TABLE collection_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES verse_collections(id) ON DELETE CASCADE NOT NULL,
    verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE NOT NULL,
    added_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    added_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, verse_id)
);

-- =====================================================
-- 5. VERSE HIGHLIGHTS SYSTEM
-- =====================================================

-- Verse Highlights (with colors)
CREATE TABLE verse_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE NOT NULL,
    highlight_color TEXT DEFAULT 'yellow' CHECK (highlight_color IN ('yellow', 'blue', 'green', 'orange', 'pink', 'purple', 'red', 'gray')),
    highlight_type TEXT DEFAULT 'full_verse' CHECK (highlight_type IN ('full_verse', 'partial', 'word', 'phrase')),
    highlighted_text TEXT, -- For partial highlights
    start_position INTEGER, -- For partial highlights
    end_position INTEGER, -- For partial highlights
    note TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id, highlight_color)
);

-- =====================================================
-- 6. STUDY NOTES SYSTEM
-- =====================================================

-- Study Notes
CREATE TABLE study_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE,
    book_id UUID REFERENCES bible_books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES bible_chapters(id) ON DELETE CASCADE,
    note_type TEXT DEFAULT 'personal' CHECK (note_type IN ('personal', 'sermon', 'study', 'commentary', 'question', 'insight', 'application')),
    title TEXT CHECK (length(title) <= 200),
    content TEXT NOT NULL CHECK (length(content) >= 1),
    is_private BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    related_verses UUID[], -- Array of verse IDs
    study_date DATE DEFAULT CURRENT_DATE,
    is_favorite BOOLEAN DEFAULT FALSE,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. READING PLANS SYSTEM
-- =====================================================

-- Reading Plans
CREATE TABLE reading_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL CHECK (length(plan_name) >= 3 AND length(plan_name) <= 100),
    description TEXT,
    plan_type TEXT DEFAULT 'chronological' CHECK (plan_type IN ('chronological', 'canonical', 'thematic', 'devotional', 'topical', 'custom')),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    readings_per_day INTEGER DEFAULT 1 CHECK (readings_per_day > 0),
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_system_plan BOOLEAN DEFAULT FALSE, -- For built-in plans
    total_verses INTEGER DEFAULT 0 CHECK (total_verses >= 0),
    average_verses_per_day INTEGER DEFAULT 0,
    plan_data JSONB, -- Detailed reading schedule
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading Plan Progress
CREATE TABLE reading_plan_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reading_plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE NOT NULL,
    current_day INTEGER DEFAULT 1 CHECK (current_day > 0),
    verses_read_today INTEGER DEFAULT 0 CHECK (verses_read_today >= 0),
    total_verses_read INTEGER DEFAULT 0 CHECK (total_verses_read >= 0),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    start_date DATE DEFAULT CURRENT_DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    consecutive_days INTEGER DEFAULT 0 CHECK (consecutive_days >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    missed_days INTEGER DEFAULT 0 CHECK (missed_days >= 0),
    last_read_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reading_plan_id)
);

-- =====================================================
-- 8. SHARING & SOCIAL FEATURES
-- =====================================================

-- Shared Collections
CREATE TABLE shared_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES verse_collections(id) ON DELETE CASCADE NOT NULL,
    shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type TEXT DEFAULT 'private' CHECK (share_type IN ('private', 'public', 'link')),
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'add', 'edit')),
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, shared_with_user_id)
);

-- =====================================================
-- 9. SEARCH & ANALYTICS
-- =====================================================

-- Verse Search History
CREATE TABLE verse_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    search_query TEXT NOT NULL CHECK (length(search_query) >= 1),
    search_type TEXT DEFAULT 'text' CHECK (search_type IN ('text', 'reference', 'topic', 'keyword')),
    translation_filter TEXT,
    book_filter TEXT,
    results_count INTEGER DEFAULT 0,
    search_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bible Analytics & Statistics
CREATE TABLE bible_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('verse_read', 'bookmark_added', 'note_created', 'search_performed', 'collection_created', 'plan_started', 'plan_completed')),
    metric_value INTEGER DEFAULT 1,
    verse_id UUID REFERENCES bible_verses(id) ON DELETE SET NULL,
    book_id UUID REFERENCES bible_books(id) ON DELETE SET NULL,
    related_id UUID,
    metadata JSONB DEFAULT '{}',
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, metric_type, verse_id, date_recorded)
);

-- =====================================================
-- 10. PERFORMANCE INDEXES
-- =====================================================

-- Translation indexes
CREATE INDEX IF NOT EXISTS idx_translations_abbreviation ON bible_translations(abbreviation);
CREATE INDEX IF NOT EXISTS idx_translations_language ON bible_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_active ON bible_translations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_translations_default ON bible_translations(is_default) WHERE is_default = TRUE;

-- Book indexes
CREATE INDEX IF NOT EXISTS idx_books_number ON bible_books(book_number);
CREATE INDEX IF NOT EXISTS idx_books_name ON bible_books(book_name);
CREATE INDEX IF NOT EXISTS idx_books_testament ON bible_books(testament);
CREATE INDEX IF NOT EXISTS idx_books_category ON bible_books(category);

-- Chapter indexes
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON bible_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON bible_chapters(chapter_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chapters_book_chapter ON bible_chapters(book_id, chapter_number);

-- Verse indexes
CREATE INDEX IF NOT EXISTS idx_verses_translation_id ON bible_verses(translation_id);
CREATE INDEX IF NOT EXISTS idx_verses_book_id ON bible_verses(book_id);
CREATE INDEX IF NOT EXISTS idx_verses_chapter_id ON bible_verses(chapter_id);
CREATE INDEX IF NOT EXISTS idx_verses_reference ON bible_verses(verse_reference);
CREATE INDEX IF NOT EXISTS idx_verses_full_reference ON bible_verses(full_reference);
CREATE INDEX IF NOT EXISTS idx_verses_text_search ON bible_verses USING GIN(to_tsvector('english', verse_text));
CREATE INDEX IF NOT EXISTS idx_verses_jesus_words ON bible_verses(words_of_jesus) WHERE words_of_jesus = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_verses_translation_book_chapter_verse ON bible_verses(translation_id, book_id, chapter_id, verse_number);

-- Cross reference indexes
CREATE INDEX IF NOT EXISTS idx_cross_refs_verse_id ON verse_cross_references(verse_id);
CREATE INDEX IF NOT EXISTS idx_cross_refs_referenced_id ON verse_cross_references(referenced_verse_id);
CREATE INDEX IF NOT EXISTS idx_cross_refs_type ON verse_cross_references(reference_type);

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON verse_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_verse_id ON verse_bookmarks(verse_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_type ON verse_bookmarks(bookmark_type);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON verse_bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_reminder_date ON verse_bookmarks(reminder_date) WHERE reminder_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON verse_bookmarks USING GIN(tags);

-- Favorite indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON verse_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_verse_id ON verse_favorites(verse_id);
CREATE INDEX IF NOT EXISTS idx_favorites_reason ON verse_favorites(favorite_reason);
CREATE INDEX IF NOT EXISTS idx_favorites_public ON verse_favorites(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON verse_favorites(created_at DESC);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON verse_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_name ON verse_collections(collection_name);
CREATE INDEX IF NOT EXISTS idx_collections_private ON verse_collections(is_private);
CREATE INDEX IF NOT EXISTS idx_collections_parent_id ON verse_collections(parent_collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_system ON verse_collections(is_system_collection) WHERE is_system_collection = TRUE;
CREATE INDEX IF NOT EXISTS idx_collection_verses_collection_id ON collection_verses(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_verses_verse_id ON collection_verses(verse_id);
CREATE INDEX IF NOT EXISTS idx_collection_verses_user_id ON collection_verses(added_by_user_id);
CREATE INDEX IF NOT EXISTS idx_collection_verses_sort ON collection_verses(collection_id, sort_order);

-- Highlight indexes
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON verse_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_verse_id ON verse_highlights(verse_id);
CREATE INDEX IF NOT EXISTS idx_highlights_color ON verse_highlights(highlight_color);
CREATE INDEX IF NOT EXISTS idx_highlights_type ON verse_highlights(highlight_type);
CREATE INDEX IF NOT EXISTS idx_highlights_private ON verse_highlights(is_private);

-- Study note indexes
CREATE INDEX IF NOT EXISTS idx_study_notes_user_id ON study_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_verse_id ON study_notes(verse_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_book_id ON study_notes(book_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_chapter_id ON study_notes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_type ON study_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_study_notes_date ON study_notes(study_date DESC);
CREATE INDEX IF NOT EXISTS idx_study_notes_favorite ON study_notes(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_study_notes_tags ON study_notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_study_notes_content_search ON study_notes USING GIN(to_tsvector('english', title || ' ' || content));

-- Reading plan indexes
CREATE INDEX IF NOT EXISTS idx_reading_plans_name ON reading_plans(plan_name);
CREATE INDEX IF NOT EXISTS idx_reading_plans_type ON reading_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_reading_plans_duration ON reading_plans(duration_days);
CREATE INDEX IF NOT EXISTS idx_reading_plans_difficulty ON reading_plans(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_reading_plans_public ON reading_plans(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_reading_plans_system ON reading_plans(is_system_plan) WHERE is_system_plan = TRUE;
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_user_id ON reading_plan_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_plan_id ON reading_plan_progress(reading_plan_id);
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_active ON reading_plan_progress(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_completed ON reading_plan_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_last_read ON reading_plan_progress(last_read_date DESC);

-- Sharing indexes
CREATE INDEX IF NOT EXISTS idx_shared_collections_collection_id ON shared_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_shared_collections_shared_by ON shared_collections(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_collections_shared_with ON shared_collections(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_collections_type ON shared_collections(share_type);
CREATE INDEX IF NOT EXISTS idx_shared_collections_token ON shared_collections(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_collections_active ON shared_collections(is_active) WHERE is_active = TRUE;

-- Search and analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON verse_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON verse_search_history(search_query);
CREATE INDEX IF NOT EXISTS idx_search_history_type ON verse_search_history(search_type);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON verse_search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bible_analytics_user_id ON bible_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_analytics_metric_type ON bible_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_bible_analytics_verse_id ON bible_analytics(verse_id);
CREATE INDEX IF NOT EXISTS idx_bible_analytics_book_id ON bible_analytics(book_id);
CREATE INDEX IF NOT EXISTS idx_bible_analytics_date ON bible_analytics(date_recorded DESC);

-- =====================================================
-- 11. UTILITY FUNCTIONS
-- =====================================================

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update bookmark counts
CREATE OR REPLACE FUNCTION update_bookmark_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- This can be extended to update user stats
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update collection verse counts
CREATE OR REPLACE FUNCTION update_collection_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE verse_collections 
        SET verse_count = verse_count + 1,
            updated_at = NOW()
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE verse_collections 
        SET verse_count = GREATEST(verse_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update reading progress
CREATE OR REPLACE FUNCTION update_reading_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Update completion percentage
        NEW.completion_percentage = CASE 
            WHEN NEW.total_verses_read > 0 AND EXISTS (
                SELECT 1 FROM reading_plans rp 
                WHERE rp.id = NEW.reading_plan_id AND rp.total_verses > 0
            ) THEN
                LEAST(100.0, (NEW.total_verses_read::DECIMAL / (
                    SELECT total_verses FROM reading_plans WHERE id = NEW.reading_plan_id
                )) * 100.0)
            ELSE 0.0
        END;
        
        -- Update completion status
        NEW.is_completed = (NEW.completion_percentage >= 100.0);
        
        -- Update actual completion date
        IF NEW.is_completed AND OLD.is_completed = FALSE THEN
            NEW.actual_completion_date = CURRENT_DATE;
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function for searching verses
CREATE OR REPLACE FUNCTION search_verses(
    search_text TEXT DEFAULT NULL,
    translation_abbrev TEXT DEFAULT NULL,
    book_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    verse_id UUID,
    verse_reference TEXT,
    verse_text TEXT,
    translation_name TEXT,
    book_name TEXT,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bv.id,
        bv.verse_reference,
        bv.verse_text,
        bt.abbreviation,
        bb.book_name,
        CASE 
            WHEN search_text IS NULL THEN 1.0
            ELSE ts_rank(to_tsvector('english', bv.verse_text), plainto_tsquery('english', search_text))
        END as relevance_score
    FROM bible_verses bv
    JOIN bible_translations bt ON bv.translation_id = bt.id
    JOIN bible_books bb ON bv.book_id = bb.id
    WHERE 
        (search_text IS NULL OR to_tsvector('english', bv.verse_text) @@ plainto_tsquery('english', search_text))
        AND (translation_abbrev IS NULL OR bt.abbreviation = translation_abbrev)
        AND (book_filter IS NULL OR bb.book_name ILIKE '%' || book_filter || '%')
        AND bt.is_active = TRUE
    ORDER BY relevance_score DESC, bv.verse_reference;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate word count for notes
CREATE OR REPLACE FUNCTION calculate_word_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.word_count = array_length(string_to_array(regexp_replace(NEW.content, '\s+', ' ', 'g'), ' '), 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE TRIGGER bible_translations_updated_at
    BEFORE UPDATE ON bible_translations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER bible_verses_updated_at
    BEFORE UPDATE ON bible_verses
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER verse_bookmarks_updated_at
    BEFORE UPDATE ON verse_bookmarks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER verse_collections_updated_at
    BEFORE UPDATE ON verse_collections
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER verse_highlights_updated_at
    BEFORE UPDATE ON verse_highlights
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER study_notes_updated_at
    BEFORE UPDATE ON study_notes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER reading_plans_updated_at
    BEFORE UPDATE ON reading_plans
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER reading_plan_progress_updated_at
    BEFORE UPDATE ON reading_plan_progress
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Collection count triggers
CREATE TRIGGER collection_verses_count_trigger
    AFTER INSERT OR DELETE ON collection_verses
    FOR EACH ROW EXECUTE FUNCTION update_collection_counts();

-- Reading progress triggers
CREATE TRIGGER reading_progress_update_trigger
    BEFORE UPDATE ON reading_plan_progress
    FOR EACH ROW EXECUTE FUNCTION update_reading_progress();

-- Word count trigger for study notes
CREATE TRIGGER study_notes_word_count_trigger
    BEFORE INSERT OR UPDATE ON study_notes
    FOR EACH ROW EXECUTE FUNCTION calculate_word_count();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all user-specific tables
ALTER TABLE verse_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_analytics ENABLE ROW LEVEL SECURITY;

-- Bible structure tables are public (read-only)
ALTER TABLE bible_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;

-- Public read policies for Bible structure
CREATE POLICY "translations_select_policy" ON bible_translations FOR SELECT USING (is_active = TRUE);
CREATE POLICY "books_select_policy" ON bible_books FOR SELECT USING (TRUE);
CREATE POLICY "chapters_select_policy" ON bible_chapters FOR SELECT USING (TRUE);
CREATE POLICY "verses_select_policy" ON bible_verses FOR SELECT USING (TRUE);
CREATE POLICY "cross_refs_select_policy" ON verse_cross_references FOR SELECT USING (TRUE);

-- Bookmark policies
CREATE POLICY "bookmarks_select_policy" ON verse_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_policy" ON verse_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_update_policy" ON verse_bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_policy" ON verse_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "favorites_select_policy" ON verse_favorites FOR SELECT USING (
    auth.uid() = user_id OR is_public = TRUE
);
CREATE POLICY "favorites_insert_policy" ON verse_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_update_policy" ON verse_favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "favorites_delete_policy" ON verse_favorites FOR DELETE USING (auth.uid() = user_id);

-- Collection policies
CREATE POLICY "collections_select_policy" ON verse_collections FOR SELECT USING (
    auth.uid() = user_id OR (
        NOT is_private AND EXISTS (
            SELECT 1 FROM shared_collections sc
            WHERE sc.collection_id = id 
            AND (sc.shared_with_user_id = auth.uid() OR sc.share_type = 'public')
            AND sc.is_active = TRUE
        )
    )
);
CREATE POLICY "collections_insert_policy" ON verse_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_policy" ON verse_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "collections_delete_policy" ON verse_collections FOR DELETE USING (auth.uid() = user_id);

-- Collection verses policies
CREATE POLICY "collection_verses_select_policy" ON collection_verses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM verse_collections vc
        WHERE vc.id = collection_id
        AND (
            vc.user_id = auth.uid() OR (
                NOT vc.is_private AND EXISTS (
                    SELECT 1 FROM shared_collections sc
                    WHERE sc.collection_id = vc.id 
                    AND (sc.shared_with_user_id = auth.uid() OR sc.share_type = 'public')
                    AND sc.is_active = TRUE
                )
            )
        )
    )
);
CREATE POLICY "collection_verses_insert_policy" ON collection_verses FOR INSERT WITH CHECK (
    auth.uid() = added_by_user_id AND EXISTS (
        SELECT 1 FROM verse_collections vc
        WHERE vc.id = collection_id AND vc.user_id = auth.uid()
    )
);
CREATE POLICY "collection_verses_delete_policy" ON collection_verses FOR DELETE USING (
    auth.uid() = added_by_user_id OR EXISTS (
        SELECT 1 FROM verse_collections vc
        WHERE vc.id = collection_id AND vc.user_id = auth.uid()
    )
);

-- Highlight policies
CREATE POLICY "highlights_select_policy" ON verse_highlights FOR SELECT USING (
    auth.uid() = user_id OR is_private = FALSE
);
CREATE POLICY "highlights_insert_policy" ON verse_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "highlights_update_policy" ON verse_highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "highlights_delete_policy" ON verse_highlights FOR DELETE USING (auth.uid() = user_id);

-- Study notes policies
CREATE POLICY "study_notes_select_policy" ON study_notes FOR SELECT USING (
    auth.uid() = user_id OR is_private = FALSE
);
CREATE POLICY "study_notes_insert_policy" ON study_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_notes_update_policy" ON study_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "study_notes_delete_policy" ON study_notes FOR DELETE USING (auth.uid() = user_id);

-- Reading plans policies
CREATE POLICY "reading_plans_select_policy" ON reading_plans FOR SELECT USING (
    is_public = TRUE OR created_by_user_id = auth.uid()
);
CREATE POLICY "reading_plans_insert_policy" ON reading_plans FOR INSERT WITH CHECK (auth.uid() = created_by_user_id);
CREATE POLICY "reading_plans_update_policy" ON reading_plans FOR UPDATE USING (auth.uid() = created_by_user_id);
CREATE POLICY "reading_plans_delete_policy" ON reading_plans FOR DELETE USING (auth.uid() = created_by_user_id);

-- Reading progress policies
CREATE POLICY "reading_progress_policy" ON reading_plan_progress FOR ALL USING (auth.uid() = user_id);

-- Shared collections policies
CREATE POLICY "shared_collections_select_policy" ON shared_collections FOR SELECT USING (
    auth.uid() = shared_by_user_id OR auth.uid() = shared_with_user_id OR share_type = 'public'
);
CREATE POLICY "shared_collections_insert_policy" ON shared_collections FOR INSERT WITH CHECK (
    auth.uid() = shared_by_user_id
);
CREATE POLICY "shared_collections_update_policy" ON shared_collections FOR UPDATE USING (
    auth.uid() = shared_by_user_id
);
CREATE POLICY "shared_collections_delete_policy" ON shared_collections FOR DELETE USING (
    auth.uid() = shared_by_user_id
);

-- Search history and analytics policies
CREATE POLICY "search_history_policy" ON verse_search_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "bible_analytics_policy" ON bible_analytics FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 14. HELPFUL VIEWS FOR EASY QUERIES
-- =====================================================

-- View for user's bookmark summary
CREATE OR REPLACE VIEW user_bookmark_summary AS
SELECT 
    vb.user_id,
    COUNT(*) as total_bookmarks,
    COUNT(*) FILTER (WHERE vb.bookmark_type = 'saved') as saved_count,
    COUNT(*) FILTER (WHERE vb.bookmark_type = 'memorizing') as memorizing_count,
    COUNT(*) FILTER (WHERE vb.bookmark_type = 'studying') as studying_count,
    COUNT(DISTINCT bb.testament) as testaments_covered,
    COUNT(DISTINCT bb.id) as books_covered,
    MAX(vb.created_at) as last_bookmark_date
FROM verse_bookmarks vb
JOIN bible_verses bv ON vb.verse_id = bv.id
JOIN bible_books bb ON bv.book_id = bb.id
GROUP BY vb.user_id;

-- View for popular verses (most bookmarked/favorited)
CREATE OR REPLACE VIEW popular_verses AS
SELECT 
    bv.id,
    bv.verse_reference,
    bv.verse_text,
    bt.abbreviation as translation,
    bb.book_name,
    COALESCE(bookmark_count, 0) as bookmark_count,
    COALESCE(favorite_count, 0) as favorite_count,
    COALESCE(highlight_count, 0) as highlight_count,
    (COALESCE(bookmark_count, 0) + COALESCE(favorite_count, 0) * 2 + COALESCE(highlight_count, 0)) as popularity_score
FROM bible_verses bv
JOIN bible_translations bt ON bv.translation_id = bt.id
JOIN bible_books bb ON bv.book_id = bb.id
LEFT JOIN (
    SELECT verse_id, COUNT(*) as bookmark_count
    FROM verse_bookmarks
    GROUP BY verse_id
) b ON bv.id = b.verse_id
LEFT JOIN (
    SELECT verse_id, COUNT(*) as favorite_count
    FROM verse_favorites
    GROUP BY verse_id
) f ON bv.id = f.verse_id
LEFT JOIN (
    SELECT verse_id, COUNT(*) as highlight_count
    FROM verse_highlights
    GROUP BY verse_id
) h ON bv.id = h.verse_id
WHERE COALESCE(bookmark_count, 0) + COALESCE(favorite_count, 0) + COALESCE(highlight_count, 0) > 0
ORDER BY popularity_score DESC;

-- View for user's study progress
CREATE OR REPLACE VIEW user_study_progress AS
SELECT 
    u.id as user_id,
    COALESCE(bs.total_bookmarks, 0) as total_bookmarks,
    COALESCE(f.favorite_count, 0) as favorite_count,
    COALESCE(c.collection_count, 0) as collection_count,
    COALESCE(h.highlight_count, 0) as highlight_count,
    COALESCE(n.note_count, 0) as note_count,
    COALESCE(rpp.active_plans, 0) as active_reading_plans,
    COALESCE(rpp.completed_plans, 0) as completed_reading_plans
FROM auth.users u
LEFT JOIN user_bookmark_summary bs ON u.id = bs.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as favorite_count
    FROM verse_favorites
    GROUP BY user_id
) f ON u.id = f.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as collection_count
    FROM verse_collections
    WHERE NOT is_system_collection
    GROUP BY user_id
) c ON u.id = c.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as highlight_count
    FROM verse_highlights
    GROUP BY user_id
) h ON u.id = h.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as note_count
    FROM study_notes
    GROUP BY user_id
) n ON u.id = n.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) FILTER (WHERE is_active = TRUE) as active_plans,
        COUNT(*) FILTER (WHERE is_completed = TRUE) as completed_plans
    FROM reading_plan_progress
    GROUP BY user_id
) rpp ON u.id = rpp.user_id;

-- View for collection details with verse count
CREATE OR REPLACE VIEW collection_details AS
SELECT 
    vc.id,
    vc.user_id,
    vc.collection_name,
    vc.description,
    vc.color_theme,
    vc.icon,
    vc.is_private,
    vc.verse_count,
    vc.created_at,
    vc.updated_at,
    u.email as owner_email,
    COALESCE(sc.share_count, 0) as share_count,
    CASE 
        WHEN vc.verse_count = 0 THEN 'empty'
        WHEN vc.verse_count < 5 THEN 'small'
        WHEN vc.verse_count < 20 THEN 'medium'
        ELSE 'large'
    END as size_category
FROM verse_collections vc
JOIN auth.users u ON vc.user_id = u.id
LEFT JOIN (
    SELECT collection_id, COUNT(*) as share_count
    FROM shared_collections
    WHERE is_active = TRUE
    GROUP BY collection_id
) sc ON vc.id = sc.collection_id;

-- =====================================================
-- 15. INITIAL DATA SETUP
-- =====================================================

-- Insert popular Bible translations
INSERT INTO bible_translations (abbreviation, full_name, language, language_code, description, year_published, is_active, is_default, sort_order) VALUES
    ('NIV', 'New International Version', 'English', 'en', 'A popular modern English translation', 1978, TRUE, TRUE, 1),
    ('ESV', 'English Standard Version', 'English', 'en', 'A literal English translation', 2001, TRUE, FALSE, 2),
    ('KJV', 'King James Version', 'English', 'en', 'The classic English translation from 1611', 1611, TRUE, FALSE, 3),
    ('NASB', 'New American Standard Bible', 'English', 'en', 'A highly accurate English translation', 1971, TRUE, FALSE, 4),
    ('NLT', 'New Living Translation', 'English', 'en', 'A thought-for-thought English translation', 1996, TRUE, FALSE, 5)
ON CONFLICT (abbreviation) DO NOTHING;

-- Insert Bible books
INSERT INTO bible_books (book_number, book_name, book_abbreviation, testament, chapter_count, verse_count, category, author) VALUES
    -- Old Testament
    (1, 'Genesis', 'Gen', 'Old Testament', 50, 1533, 'Law', 'Moses'),
    (2, 'Exodus', 'Exod', 'Old Testament', 40, 1213, 'Law', 'Moses'),
    (3, 'Leviticus', 'Lev', 'Old Testament', 27, 859, 'Law', 'Moses'),
    (4, 'Numbers', 'Num', 'Old Testament', 36, 1288, 'Law', 'Moses'),
    (5, 'Deuteronomy', 'Deut', 'Old Testament', 34, 959, 'Law', 'Moses'),
    (6, 'Joshua', 'Josh', 'Old Testament', 24, 658, 'History', 'Joshua'),
    (7, 'Judges', 'Judg', 'Old Testament', 21, 618, 'History', 'Samuel'),
    (8, 'Ruth', 'Ruth', 'Old Testament', 4, 85, 'History', 'Samuel'),
    (9, '1 Samuel', '1Sam', 'Old Testament', 31, 810, 'History', 'Samuel'),
    (10, '2 Samuel', '2Sam', 'Old Testament', 24, 695, 'History', 'Samuel'),
    (11, '1 Kings', '1Kgs', 'Old Testament', 22, 816, 'History', 'Jeremiah'),
    (12, '2 Kings', '2Kgs', 'Old Testament', 25, 719, 'History', 'Jeremiah'),
    (13, '1 Chronicles', '1Chr', 'Old Testament', 29, 942, 'History', 'Ezra'),
    (14, '2 Chronicles', '2Chr', 'Old Testament', 36, 822, 'History', 'Ezra'),
    (15, 'Ezra', 'Ezra', 'Old Testament', 10, 280, 'History', 'Ezra'),
    (16, 'Nehemiah', 'Neh', 'Old Testament', 13, 406, 'History', 'Nehemiah'),
    (17, 'Esther', 'Esth', 'Old Testament', 10, 167, 'History', 'Mordecai'),
    (18, 'Job', 'Job', 'Old Testament', 42, 1070, 'Wisdom', 'Job'),
    (19, 'Psalms', 'Ps', 'Old Testament', 150, 2461, 'Wisdom', 'David and others'),
    (20, 'Proverbs', 'Prov', 'Old Testament', 31, 915, 'Wisdom', 'Solomon'),
    (21, 'Ecclesiastes', 'Eccl', 'Old Testament', 12, 222, 'Wisdom', 'Solomon'),
    (22, 'Song of Songs', 'Song', 'Old Testament', 8, 117, 'Wisdom', 'Solomon'),
    (23, 'Isaiah', 'Isa', 'Old Testament', 66, 1292, 'Prophecy', 'Isaiah'),
    (24, 'Jeremiah', 'Jer', 'Old Testament', 52, 1364, 'Prophecy', 'Jeremiah'),
    (25, 'Lamentations', 'Lam', 'Old Testament', 5, 154, 'Prophecy', 'Jeremiah'),
    (26, 'Ezekiel', 'Ezek', 'Old Testament', 48, 1273, 'Prophecy', 'Ezekiel'),
    (27, 'Daniel', 'Dan', 'Old Testament', 12, 357, 'Prophecy', 'Daniel'),
    (28, 'Hosea', 'Hos', 'Old Testament', 14, 197, 'Prophecy', 'Hosea'),
    (29, 'Joel', 'Joel', 'Old Testament', 3, 73, 'Prophecy', 'Joel'),
    (30, 'Amos', 'Amos', 'Old Testament', 9, 146, 'Prophecy', 'Amos'),
    (31, 'Obadiah', 'Obad', 'Old Testament', 1, 21, 'Prophecy', 'Obadiah'),
    (32, 'Jonah', 'Jonah', 'Old Testament', 4, 48, 'Prophecy', 'Jonah'),
    (33, 'Micah', 'Mic', 'Old Testament', 7, 105, 'Prophecy', 'Micah'),
    (34, 'Nahum', 'Nah', 'Old Testament', 3, 47, 'Prophecy', 'Nahum'),
    (35, 'Habakkuk', 'Hab', 'Old Testament', 3, 56, 'Prophecy', 'Habakkuk'),
    (36, 'Zephaniah', 'Zeph', 'Old Testament', 3, 53, 'Prophecy', 'Zephaniah'),
    (37, 'Haggai', 'Hag', 'Old Testament', 2, 38, 'Prophecy', 'Haggai'),
    (38, 'Zechariah', 'Zech', 'Old Testament', 14, 211, 'Prophecy', 'Zechariah'),
    (39, 'Malachi', 'Mal', 'Old Testament', 4, 55, 'Prophecy', 'Malachi'),
    -- New Testament
    (40, 'Matthew', 'Matt', 'New Testament', 28, 1071, 'Gospels', 'Matthew'),
    (41, 'Mark', 'Mark', 'New Testament', 16, 678, 'Gospels', 'Mark'),
    (42, 'Luke', 'Luke', 'New Testament', 24, 1151, 'Gospels', 'Luke'),
    (43, 'John', 'John', 'New Testament', 21, 879, 'Gospels', 'John'),
    (44, 'Acts', 'Acts', 'New Testament', 28, 1007, 'Acts', 'Luke'),
    (45, 'Romans', 'Rom', 'New Testament', 16, 433, 'Epistles', 'Paul'),
    (46, '1 Corinthians', '1Cor', 'New Testament', 16, 437, 'Epistles', 'Paul'),
    (47, '2 Corinthians', '2Cor', 'New Testament', 13, 257, 'Epistles', 'Paul'),
    (48, 'Galatians', 'Gal', 'New Testament', 6, 149, 'Epistles', 'Paul'),
    (49, 'Ephesians', 'Eph', 'New Testament', 6, 155, 'Epistles', 'Paul'),
    (50, 'Philippians', 'Phil', 'New Testament', 4, 104, 'Epistles', 'Paul'),
    (51, 'Colossians', 'Col', 'New Testament', 4, 95, 'Epistles', 'Paul'),
    (52, '1 Thessalonians', '1Thess', 'New Testament', 5, 89, 'Epistles', 'Paul'),
    (53, '2 Thessalonians', '2Thess', 'New Testament', 3, 47, 'Epistles', 'Paul'),
    (54, '1 Timothy', '1Tim', 'New Testament', 6, 113, 'Epistles', 'Paul'),
    (55, '2 Timothy', '2Tim', 'New Testament', 4, 83, 'Epistles', 'Paul'),
    (56, 'Titus', 'Titus', 'New Testament', 3, 46, 'Epistles', 'Paul'),
    (57, 'Philemon', 'Phlm', 'New Testament', 1, 25, 'Epistles', 'Paul'),
    (58, 'Hebrews', 'Heb', 'New Testament', 13, 303, 'Epistles', 'Unknown'),
    (59, 'James', 'Jas', 'New Testament', 5, 108, 'Epistles', 'James'),
    (60, '1 Peter', '1Pet', 'New Testament', 5, 105, 'Epistles', 'Peter'),
    (61, '2 Peter', '2Pet', 'New Testament', 3, 61, 'Epistles', 'Peter'),
    (62, '1 John', '1John', 'New Testament', 5, 105, 'Epistles', 'John'),
    (63, '2 John', '2John', 'New Testament', 1, 13, 'Epistles', 'John'),
    (64, '3 John', '3John', 'New Testament', 1, 14, 'Epistles', 'John'),
    (65, 'Jude', 'Jude', 'New Testament', 1, 25, 'Epistles', 'Jude'),
    (66, 'Revelation', 'Rev', 'New Testament', 22, 404, 'Revelation', 'John')
ON CONFLICT (book_number, book_name) DO NOTHING;

-- Sample data removed - database ready for production use

-- =====================================================
-- 16. FINAL SUCCESS MESSAGE
-- =====================================================

-- Create success confirmation with stats
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Count created objects
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (table_name LIKE 'bible_%' OR table_name LIKE 'verse_%' OR table_name LIKE 'study_%' OR table_name LIKE 'reading_%' OR table_name LIKE 'shared_%' OR table_name LIKE 'collection_%');
    
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION';
    
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- Success message
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🎉 BIBLE BOOKMARKS & FAVORITES COMPLETE!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Successfully created:';
    RAISE NOTICE '  📊 Tables: %', table_count;
    RAISE NOTICE '  ⚙️  Functions: %', function_count;
    RAISE NOTICE '  🔄 Triggers: %', trigger_count;
    RAISE NOTICE '  🔒 RLS Policies: %', policy_count;
    RAISE NOTICE '  🚀 Indexes: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features included:';
    RAISE NOTICE '  • Complete Bible Structure (66 books)';
    RAISE NOTICE '  • Multi-Translation Support';
    RAISE NOTICE '  • Advanced Bookmarks & Favorites';
    RAISE NOTICE '  • Collections & Organization';
    RAISE NOTICE '  • Verse Highlights with Colors';
    RAISE NOTICE '  • Study Notes System';
    RAISE NOTICE '  • Reading Plans & Progress';
    RAISE NOTICE '  • Sharing & Social Features';
    RAISE NOTICE '  • Search & Analytics';
    RAISE NOTICE '  • Row Level Security (RLS)';
    RAISE NOTICE '  • Performance Optimizations';
    RAISE NOTICE '';
    RAISE NOTICE '📖 Bible translations ready:';
    RAISE NOTICE '  • NIV, ESV, KJV, NASB, NLT';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your Bible backend is ready!';
    RAISE NOTICE '==========================================';
END $$; 