-- =====================================================
-- SAFE COMMUNITY BACKEND SQL MIGRATION
-- Bible Aura Community Features - Safe Setup (Handles Existing Objects)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DROP EXISTING POLICIES SAFELY
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public discussions are viewable by everyone" ON community_discussions;
DROP POLICY IF EXISTS "Users can insert their own discussions" ON community_discussions;
DROP POLICY IF EXISTS "Users can update their own discussions" ON community_discussions;
DROP POLICY IF EXISTS "Users can delete their own discussions" ON community_discussions;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON discussion_comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON discussion_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON discussion_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON discussion_comments;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON discussion_likes;
DROP POLICY IF EXISTS "Users can manage their own likes" ON discussion_likes;
DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON comment_likes;
DROP POLICY IF EXISTS "Users can manage their own comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Public prayer requests are viewable by everyone" ON prayer_requests;
DROP POLICY IF EXISTS "Users can insert their own prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Users can update their own prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Users can delete their own prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Prayer interactions are viewable by everyone" ON prayer_interactions;
DROP POLICY IF EXISTS "Users can manage their own prayer interactions" ON prayer_interactions;

-- =====================================================
-- 2. CREATE TABLES (SAFE)
-- =====================================================

-- Main discussions table
CREATE TABLE IF NOT EXISTS community_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    verse_reference TEXT,
    verse_text TEXT,
    discussion_type TEXT DEFAULT 'general' CHECK (discussion_type IN ('general', 'study', 'testimony', 'prayer', 'question')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion comments table
CREATE TABLE IF NOT EXISTS discussion_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion likes table
CREATE TABLE IF NOT EXISTS discussion_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, discussion_id)
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- Prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'healing', 'family', 'guidance', 'thanksgiving', 'financial', 'relationships', 'ministry', 'salvation')),
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    testimony TEXT,
    prayer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer interactions table
CREATE TABLE IF NOT EXISTS prayer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
    prayer_type TEXT DEFAULT 'prayed' CHECK (prayer_type IN ('prayed', 'fasted', 'shared')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prayer_request_id, prayer_type)
);

-- Community groups table
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT FALSE,
    invite_code TEXT UNIQUE,
    category TEXT NOT NULL DEFAULT 'bible-study' CHECK (category IN ('bible-study', 'theology', 'age-group', 'topical', 'prayer', 'missions', 'fellowship', 'ministry')),
    banner_url TEXT,
    member_count INTEGER DEFAULT 0,
    max_members INTEGER,
    tags TEXT[],
    rules TEXT,
    meeting_schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'leader')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

-- Community events table
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES community_groups(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    end_time TIME,
    timezone TEXT DEFAULT 'UTC',
    location TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    stream_link TEXT,
    meeting_link TEXT,
    event_type TEXT NOT NULL DEFAULT 'bible-study' CHECK (event_type IN ('bible-study', 'prayer', 'worship', 'seminar', 'fellowship', 'outreach', 'conference', 'retreat')),
    related_verse TEXT,
    max_attendees INTEGER,
    attendee_count INTEGER DEFAULT 0,
    tags TEXT[],
    banner_url TEXT,
    registration_required BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    rsvp_status TEXT DEFAULT 'going' CHECK (rsvp_status IN ('going', 'maybe', 'not_going')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Extended community user profiles
CREATE TABLE IF NOT EXISTS community_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    bio TEXT,
    favorite_verse_reference TEXT,
    favorite_verse_text TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    location TEXT,
    ministry_role TEXT,
    church_name TEXT,
    website_url TEXT,
    social_links JSONB,
    community_points INTEGER DEFAULT 0,
    badge_ids TEXT[],
    prayer_request_count INTEGER DEFAULT 0,
    discussion_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    helpful_votes_received INTEGER DEFAULT 0,
    consecutive_days_active INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    is_public BOOLEAN DEFAULT TRUE,
    show_activity BOOLEAN DEFAULT TRUE,
    allow_messages BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES (SAFE)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON community_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON community_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_type ON community_discussions(discussion_type);
CREATE INDEX IF NOT EXISTS idx_comments_discussion_id ON discussion_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_prayer_user_id ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_groups_leader ON community_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_events_host ON community_events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON community_events(event_date);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE community_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE POLICIES (SAFE)
-- =====================================================

-- Discussion policies
CREATE POLICY "Public discussions are viewable by everyone" ON community_discussions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own discussions" ON community_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own discussions" ON community_discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own discussions" ON community_discussions FOR DELETE USING (auth.uid() = user_id);

-- Comment policies
CREATE POLICY "Comments are viewable by everyone" ON discussion_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON discussion_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON discussion_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON discussion_comments FOR DELETE USING (auth.uid() = user_id);

-- Like policies
CREATE POLICY "Likes are viewable by everyone" ON discussion_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON discussion_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Comment likes are viewable by everyone" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own comment likes" ON comment_likes FOR ALL USING (auth.uid() = user_id);

-- Prayer request policies
CREATE POLICY "Public prayer requests are viewable by everyone" ON prayer_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert their own prayer requests" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayer requests" ON prayer_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayer requests" ON prayer_requests FOR DELETE USING (auth.uid() = user_id);

-- Prayer interaction policies
CREATE POLICY "Prayer interactions are viewable by everyone" ON prayer_interactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own prayer interactions" ON prayer_interactions FOR ALL USING (auth.uid() = user_id);

-- Group policies
CREATE POLICY "Public groups are viewable by everyone" ON community_groups FOR SELECT USING (NOT is_private OR EXISTS (SELECT 1 FROM group_memberships WHERE group_id = id AND user_id = auth.uid()));
CREATE POLICY "Authenticated users can create groups" ON community_groups FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Group leaders can update their groups" ON community_groups FOR UPDATE USING (auth.uid() = leader_id);

-- Group membership policies
CREATE POLICY "Group memberships are viewable by group members" ON group_memberships FOR SELECT USING (EXISTS (SELECT 1 FROM group_memberships gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid()));
CREATE POLICY "Users can join groups" ON group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_memberships FOR DELETE USING (auth.uid() = user_id);

-- Event policies
CREATE POLICY "Public events are viewable by everyone" ON community_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON community_events FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Event hosts can update their events" ON community_events FOR UPDATE USING (auth.uid() = host_id);

-- RSVP policies
CREATE POLICY "RSVPs are viewable by everyone" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can manage their own RSVPs" ON event_rsvps FOR ALL USING (auth.uid() = user_id);

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON community_profiles FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "Users can manage their own profile" ON community_profiles FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. SUCCESS MESSAGE
-- =====================================================

-- Create a success confirmation
DO $$
BEGIN
  RAISE NOTICE 'Bible Aura Safe Community Migration Complete! 🎉';
  RAISE NOTICE 'All community tables are ready for use.';
END $$; 