-- =====================================================
-- SIMPLE COMMUNITY TABLES CREATION
-- Creates core tables for Bible Aura Community
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CORE COMMUNITY TABLES
-- =====================================================

-- Main discussions table
CREATE TABLE IF NOT EXISTS community_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    verse_reference TEXT,
    verse_text TEXT,
    discussion_type TEXT DEFAULT 'general',
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
    parent_comment_id UUID,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for parent comments after table creation
ALTER TABLE discussion_comments 
ADD CONSTRAINT fk_parent_comment 
FOREIGN KEY (parent_comment_id) REFERENCES discussion_comments(id) ON DELETE CASCADE;

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
    category TEXT DEFAULT 'general',
    urgency TEXT DEFAULT 'normal',
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
    prayer_type TEXT DEFAULT 'prayed',
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
    category TEXT DEFAULT 'bible-study',
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
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'active',
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
    event_type TEXT DEFAULT 'bible-study',
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
    rsvp_status TEXT DEFAULT 'going',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Community user profiles
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
-- 2. BASIC INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON community_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON community_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_discussion_id ON discussion_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON discussion_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_user_id ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_groups_leader ON community_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_events_host ON community_events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON community_profiles(user_id);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
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
-- 4. DROP EXISTING POLICIES (SAFE)
-- =====================================================

DROP POLICY IF EXISTS "Public discussions are viewable by everyone" ON community_discussions;
DROP POLICY IF EXISTS "Users can insert their own discussions" ON community_discussions;
DROP POLICY IF EXISTS "Users can update their own discussions" ON community_discussions;
DROP POLICY IF EXISTS "Users can delete their own discussions" ON community_discussions;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON discussion_comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON discussion_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON discussion_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON discussion_comments;

-- =====================================================
-- 5. CREATE BASIC POLICIES
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

-- Prayer policies
CREATE POLICY "Prayer requests are viewable by everyone" ON prayer_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert their own prayers" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayers" ON prayer_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayers" ON prayer_requests FOR DELETE USING (auth.uid() = user_id);

-- Prayer interaction policies
CREATE POLICY "Prayer interactions are viewable by everyone" ON prayer_interactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own prayer interactions" ON prayer_interactions FOR ALL USING (auth.uid() = user_id);

-- Group policies
CREATE POLICY "Groups are viewable by everyone" ON community_groups FOR SELECT USING (true);
CREATE POLICY "Users can create groups" ON community_groups FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Group leaders can update groups" ON community_groups FOR UPDATE USING (auth.uid() = leader_id);

-- Membership policies
CREATE POLICY "Memberships are viewable by everyone" ON group_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_memberships FOR DELETE USING (auth.uid() = user_id);

-- Event policies
CREATE POLICY "Events are viewable by everyone" ON community_events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON community_events FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Event hosts can update events" ON community_events FOR UPDATE USING (auth.uid() = host_id);

-- RSVP policies
CREATE POLICY "RSVPs are viewable by everyone" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can manage their own RSVPs" ON event_rsvps FOR ALL USING (auth.uid() = user_id);

-- Profile policies
CREATE POLICY "Profiles are viewable by everyone" ON community_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own profile" ON community_profiles FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Community tables created successfully! 🎉';
  RAISE NOTICE 'Tables ready: discussions, comments, prayers, groups, events, profiles';
END $$; 