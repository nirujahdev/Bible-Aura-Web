-- =====================================================
-- BIBLE AURA - COMPLETE COMMUNITY BACKEND
-- Single File - Full Working Solution
-- Version: Final - No Issues
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. DROP EXISTING TABLES AND POLICIES (CLEAN SLATE)
-- =====================================================

-- Drop existing policies safely (only if tables exist)
DO $$ 
BEGIN
    -- Drop policies only if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'community_discussions') THEN
        DROP POLICY IF EXISTS "discussions_select_policy" ON community_discussions;
        DROP POLICY IF EXISTS "discussions_insert_policy" ON community_discussions;
        DROP POLICY IF EXISTS "discussions_update_policy" ON community_discussions;
        DROP POLICY IF EXISTS "discussions_delete_policy" ON community_discussions;
        DROP POLICY IF EXISTS "Public discussions are viewable by everyone" ON community_discussions;
        DROP POLICY IF EXISTS "Users can insert their own discussions" ON community_discussions;
        DROP POLICY IF EXISTS "Users can update their own discussions" ON community_discussions;
        DROP POLICY IF EXISTS "Users can delete their own discussions" ON community_discussions;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discussion_comments') THEN
        DROP POLICY IF EXISTS "comments_select_policy" ON discussion_comments;
        DROP POLICY IF EXISTS "comments_insert_policy" ON discussion_comments;
        DROP POLICY IF EXISTS "comments_update_policy" ON discussion_comments;
        DROP POLICY IF EXISTS "comments_delete_policy" ON discussion_comments;
        DROP POLICY IF EXISTS "Comments are viewable by everyone" ON discussion_comments;
        DROP POLICY IF EXISTS "Users can insert their own comments" ON discussion_comments;
        DROP POLICY IF EXISTS "Users can update their own comments" ON discussion_comments;
        DROP POLICY IF EXISTS "Users can delete their own comments" ON discussion_comments;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discussion_likes') THEN
        DROP POLICY IF EXISTS "discussion_likes_policy" ON discussion_likes;
        DROP POLICY IF EXISTS "Likes are viewable by everyone" ON discussion_likes;
        DROP POLICY IF EXISTS "Users can manage their own likes" ON discussion_likes;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comment_likes') THEN
        DROP POLICY IF EXISTS "comment_likes_policy" ON comment_likes;
        DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON comment_likes;
        DROP POLICY IF EXISTS "Users can manage their own comment likes" ON comment_likes;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prayer_requests') THEN
        DROP POLICY IF EXISTS "prayer_requests_select_policy" ON prayer_requests;
        DROP POLICY IF EXISTS "prayer_requests_insert_policy" ON prayer_requests;
        DROP POLICY IF EXISTS "prayer_requests_update_policy" ON prayer_requests;
        DROP POLICY IF EXISTS "prayer_requests_delete_policy" ON prayer_requests;
        DROP POLICY IF EXISTS "Public prayer requests are viewable by everyone" ON prayer_requests;
        DROP POLICY IF EXISTS "Users can insert their own prayer requests" ON prayer_requests;
        DROP POLICY IF EXISTS "Users can update their own prayer requests" ON prayer_requests;
        DROP POLICY IF EXISTS "Users can delete their own prayer requests" ON prayer_requests;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prayer_interactions') THEN
        DROP POLICY IF EXISTS "prayer_interactions_select_policy" ON prayer_interactions;
        DROP POLICY IF EXISTS "prayer_interactions_policy" ON prayer_interactions;
        DROP POLICY IF EXISTS "Prayer interactions are viewable by everyone" ON prayer_interactions;
        DROP POLICY IF EXISTS "Users can manage their own prayer interactions" ON prayer_interactions;
    END IF;
END $$;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS community_stats CASCADE;
DROP TABLE IF EXISTS daily_verses CASCADE;
DROP TABLE IF EXISTS verse_discussions CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS community_activities CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS community_profiles CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS group_discussions CASCADE;
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS community_groups CASCADE;
DROP TABLE IF EXISTS prayer_interactions CASCADE;
DROP TABLE IF EXISTS prayer_requests CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS discussion_likes CASCADE;
DROP TABLE IF EXISTS discussion_comments CASCADE;
DROP TABLE IF EXISTS community_discussions CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_discussion_counts() CASCADE;
DROP FUNCTION IF EXISTS update_comment_likes() CASCADE;
DROP FUNCTION IF EXISTS update_prayer_counts() CASCADE;
DROP FUNCTION IF EXISTS update_group_counts() CASCADE;
DROP FUNCTION IF EXISTS update_event_counts() CASCADE;
DROP FUNCTION IF EXISTS create_community_profile() CASCADE;
DROP FUNCTION IF EXISTS update_user_stats() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

-- =====================================================
-- 2. CORE COMMUNITY TABLES
-- =====================================================

-- Community Discussions (Main Forum)
CREATE TABLE community_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 200),
    content TEXT NOT NULL CHECK (length(content) >= 10),
    verse_reference TEXT,
    verse_text TEXT,
    discussion_type TEXT DEFAULT 'general' CHECK (discussion_type IN ('general', 'study', 'testimony', 'prayer', 'question', 'doctrine')),
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion Comments
CREATE TABLE discussion_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) >= 1),
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    is_edited BOOLEAN DEFAULT FALSE,
    edit_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion Likes
CREATE TABLE discussion_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, discussion_id)
);

-- Comment Likes
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- =====================================================
-- 3. PRAYER SYSTEM
-- =====================================================

-- Prayer Requests
CREATE TABLE prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 150),
    content TEXT NOT NULL CHECK (length(content) >= 10),
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'healing', 'family', 'guidance', 'thanksgiving', 'financial', 'relationships', 'ministry', 'salvation', 'wisdom', 'protection')),
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'praise_report')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    answer_testimony TEXT,
    prayer_count INTEGER DEFAULT 0 CHECK (prayer_count >= 0),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer Interactions (Who Prayed)
CREATE TABLE prayer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE NOT NULL,
    prayer_type TEXT DEFAULT 'prayed' CHECK (prayer_type IN ('prayed', 'fasted', 'shared', 'supported')),
    prayer_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prayer_request_id, prayer_type)
);

-- =====================================================
-- 4. COMMUNITY GROUPS SYSTEM
-- =====================================================

-- Community Groups
CREATE TABLE community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 100),
    description TEXT NOT NULL CHECK (length(description) >= 10),
    leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT FALSE,
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
    category TEXT DEFAULT 'bible-study' CHECK (category IN ('bible-study', 'theology', 'age-group', 'topical', 'prayer', 'missions', 'fellowship', 'ministry', 'discipleship', 'worship')),
    banner_url TEXT,
    member_count INTEGER DEFAULT 0 CHECK (member_count >= 0),
    max_members INTEGER CHECK (max_members > 0),
    tags TEXT[] DEFAULT '{}',
    rules TEXT,
    meeting_schedule TEXT,
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Memberships
CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'leader')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned', 'left')),
    join_message TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

-- Group Discussions (Separate from main discussions)
CREATE TABLE group_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 200),
    content TEXT NOT NULL CHECK (length(content) >= 5),
    verse_reference TEXT,
    verse_text TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    replies_count INTEGER DEFAULT 0 CHECK (replies_count >= 0),
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. EVENTS SYSTEM
-- =====================================================

-- Community Events
CREATE TABLE community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES community_groups(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 150),
    description TEXT NOT NULL CHECK (length(description) >= 10),
    event_date DATE NOT NULL CHECK (event_date >= CURRENT_DATE),
    event_time TIME NOT NULL,
    end_time TIME,
    timezone TEXT DEFAULT 'UTC',
    location TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    stream_link TEXT,
    meeting_link TEXT,
    event_type TEXT DEFAULT 'bible-study' CHECK (event_type IN ('bible-study', 'prayer', 'worship', 'seminar', 'fellowship', 'outreach', 'conference', 'retreat', 'testimony', 'youth')),
    related_verse TEXT,
    max_attendees INTEGER CHECK (max_attendees > 0),
    attendee_count INTEGER DEFAULT 0 CHECK (attendee_count >= 0),
    tags TEXT[] DEFAULT '{}',
    banner_url TEXT,
    registration_required BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    event_status TEXT DEFAULT 'upcoming' CHECK (event_status IN ('upcoming', 'live', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE NOT NULL,
    rsvp_status TEXT DEFAULT 'going' CHECK (rsvp_status IN ('going', 'maybe', 'not_going', 'interested')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- =====================================================
-- 6. USER PROFILES & SOCIAL FEATURES
-- =====================================================

-- Extended Community Profiles
CREATE TABLE community_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    display_name TEXT CHECK (length(display_name) <= 50),
    bio TEXT CHECK (length(bio) <= 500),
    favorite_verse_reference TEXT,
    favorite_verse_text TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    location TEXT CHECK (length(location) <= 100),
    ministry_role TEXT CHECK (length(ministry_role) <= 100),
    church_name TEXT CHECK (length(church_name) <= 100),
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    community_points INTEGER DEFAULT 0 CHECK (community_points >= 0),
    badge_ids TEXT[] DEFAULT '{}',
    discussion_count INTEGER DEFAULT 0 CHECK (discussion_count >= 0),
    comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
    prayer_request_count INTEGER DEFAULT 0 CHECK (prayer_request_count >= 0),
    helpful_votes_received INTEGER DEFAULT 0 CHECK (helpful_votes_received >= 0),
    consecutive_days_active INTEGER DEFAULT 0 CHECK (consecutive_days_active >= 0),
    last_active_date DATE DEFAULT CURRENT_DATE,
    is_public BOOLEAN DEFAULT TRUE,
    show_activity BOOLEAN DEFAULT TRUE,
    allow_messages BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges System
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('helper', 'encourager', 'scholar', 'faithful_friend', 'prayer_warrior', 'bible_student', 'community_builder', 'wise_counselor', 'evangelist', 'mentor')),
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    badge_color TEXT DEFAULT '#3B82F6',
    earned_reason TEXT,
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Bookmarks
CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('discussion', 'prayer', 'event', 'group', 'comment', 'verse')),
    folder_name TEXT DEFAULT 'default' CHECK (length(folder_name) <= 50),
    notes TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

-- User Follows (Following other users)
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- =====================================================
-- 7. ACTIVITY & NOTIFICATIONS SYSTEM
-- =====================================================

-- Community Activity Feed
CREATE TABLE community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'comment', 'like', 'prayer', 'group_join', 'event_rsvp', 'follow', 'badge_earned', 'testimony', 'verse_shared')),
    activity_title TEXT NOT NULL CHECK (length(activity_title) <= 200),
    activity_description TEXT,
    related_id UUID,
    related_type TEXT CHECK (related_type IN ('discussion', 'comment', 'prayer', 'group', 'event', 'user', 'verse')),
    verse_reference TEXT,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Notifications
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('like', 'comment', 'follow', 'mention', 'prayer_answer', 'event_reminder', 'group_invite', 'badge_earned', 'system')),
    title TEXT NOT NULL CHECK (length(title) <= 150),
    message TEXT NOT NULL,
    related_id UUID,
    related_type TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. BIBLE STUDY & CONTENT SYSTEM
-- =====================================================

-- Verse Discussions Tracker
CREATE TABLE verse_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse_reference TEXT NOT NULL UNIQUE,
    book_name TEXT NOT NULL,
    chapter_number INTEGER NOT NULL CHECK (chapter_number > 0),
    verse_number INTEGER NOT NULL CHECK (verse_number > 0),
    discussion_count INTEGER DEFAULT 0 CHECK (discussion_count >= 0),
    prayer_count INTEGER DEFAULT 0 CHECK (prayer_count >= 0),
    total_engagement INTEGER DEFAULT 0 CHECK (total_engagement >= 0),
    last_discussed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    popular_themes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Verses
CREATE TABLE daily_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse_reference TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    commentary TEXT,
    reflection_questions TEXT[] DEFAULT '{}',
    date_featured DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    theme TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
    comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. COMMUNITY ANALYTICS & STATS
-- =====================================================

-- Community Statistics
CREATE TABLE community_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type TEXT NOT NULL,
    stat_value BIGINT NOT NULL DEFAULT 0,
    stat_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stat_type, stat_date)
);

-- =====================================================
-- 10. PERFORMANCE INDEXES
-- =====================================================

-- Discussion indexes
CREATE INDEX idx_discussions_user_id ON community_discussions(user_id);
CREATE INDEX idx_discussions_created_at ON community_discussions(created_at DESC);
CREATE INDEX idx_discussions_updated_at ON community_discussions(updated_at DESC);
CREATE INDEX idx_discussions_type ON community_discussions(discussion_type);
CREATE INDEX idx_discussions_tags ON community_discussions USING GIN(tags);
CREATE INDEX idx_discussions_featured ON community_discussions(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_discussions_pinned ON community_discussions(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_discussions_locked ON community_discussions(is_locked) WHERE is_locked = TRUE;

-- Comment indexes
CREATE INDEX idx_comments_discussion_id ON discussion_comments(discussion_id);
CREATE INDEX idx_comments_user_id ON discussion_comments(user_id);
CREATE INDEX idx_comments_parent_id ON discussion_comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON discussion_comments(created_at DESC);

-- Like indexes
CREATE INDEX idx_discussion_likes_user_id ON discussion_likes(user_id);
CREATE INDEX idx_discussion_likes_discussion_id ON discussion_likes(discussion_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

-- Prayer request indexes
CREATE INDEX idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX idx_prayer_requests_urgency ON prayer_requests(urgency);
CREATE INDEX idx_prayer_requests_answered ON prayer_requests(is_answered);
CREATE INDEX idx_prayer_requests_created_at ON prayer_requests(created_at DESC);
CREATE INDEX idx_prayer_requests_updated_at ON prayer_requests(updated_at DESC);

-- Group indexes
CREATE INDEX idx_groups_leader_id ON community_groups(leader_id);
CREATE INDEX idx_groups_category ON community_groups(category);
CREATE INDEX idx_groups_private ON community_groups(is_private);
CREATE INDEX idx_groups_created_at ON community_groups(created_at DESC);
CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_status ON group_memberships(status);
CREATE INDEX idx_group_memberships_role ON group_memberships(role);

-- Event indexes
CREATE INDEX idx_events_host_id ON community_events(host_id);
CREATE INDEX idx_events_group_id ON community_events(group_id);
CREATE INDEX idx_events_date ON community_events(event_date);
CREATE INDEX idx_events_type ON community_events(event_type);
CREATE INDEX idx_events_status ON community_events(event_status);
CREATE INDEX idx_events_online ON community_events(is_online);
CREATE INDEX idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_status ON event_rsvps(rsvp_status);

-- Profile indexes
CREATE INDEX idx_profiles_user_id ON community_profiles(user_id);
CREATE INDEX idx_profiles_display_name ON community_profiles(display_name);
CREATE INDEX idx_profiles_public ON community_profiles(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_profiles_last_active ON community_profiles(last_active_date DESC);

-- Activity and notification indexes
CREATE INDEX idx_activities_user_id ON community_activities(user_id);
CREATE INDEX idx_activities_type ON community_activities(activity_type);
CREATE INDEX idx_activities_created_at ON community_activities(created_at DESC);
CREATE INDEX idx_activities_public ON community_activities(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_notifications_read ON user_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON user_notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON user_notifications(created_at DESC);

-- Bookmark and follow indexes
CREATE INDEX idx_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_item_type ON user_bookmarks(item_type);
CREATE INDEX idx_bookmarks_folder ON user_bookmarks(folder_name);
CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);

-- Verse and content indexes
CREATE INDEX idx_verse_discussions_reference ON verse_discussions(verse_reference);
CREATE INDEX idx_verse_discussions_book ON verse_discussions(book_name);
CREATE INDEX idx_verse_discussions_engagement ON verse_discussions(total_engagement DESC);
CREATE INDEX idx_daily_verses_date ON daily_verses(date_featured);
CREATE INDEX idx_daily_verses_theme ON daily_verses(theme);

-- Statistics indexes
CREATE INDEX idx_community_stats_type ON community_stats(stat_type);
CREATE INDEX idx_community_stats_date ON community_stats(stat_date DESC);

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

-- Function to update discussion counts
CREATE OR REPLACE FUNCTION update_discussion_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'discussion_comments' THEN
            UPDATE community_discussions 
            SET comments_count = comments_count + 1,
                updated_at = NOW()
            WHERE id = NEW.discussion_id;
        ELSIF TG_TABLE_NAME = 'discussion_likes' THEN
            UPDATE community_discussions 
            SET likes_count = likes_count + 1,
                updated_at = NOW()
            WHERE id = NEW.discussion_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'discussion_comments' THEN
            UPDATE community_discussions 
            SET comments_count = GREATEST(comments_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.discussion_id;
        ELSIF TG_TABLE_NAME = 'discussion_likes' THEN
            UPDATE community_discussions 
            SET likes_count = GREATEST(likes_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.discussion_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment likes
CREATE OR REPLACE FUNCTION update_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussion_comments 
        SET likes_count = likes_count + 1,
            updated_at = NOW()
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussion_comments 
        SET likes_count = GREATEST(likes_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update prayer counts
CREATE OR REPLACE FUNCTION update_prayer_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE prayer_requests 
        SET prayer_count = prayer_count + 1,
            updated_at = NOW()
        WHERE id = NEW.prayer_request_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE prayer_requests 
        SET prayer_count = GREATEST(prayer_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.prayer_request_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update group member counts
CREATE OR REPLACE FUNCTION update_group_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE community_groups 
        SET member_count = member_count + 1,
            updated_at = NOW()
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE community_groups 
            SET member_count = member_count + 1,
                updated_at = NOW()
            WHERE id = NEW.group_id;
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE community_groups 
            SET member_count = GREATEST(member_count - 1, 0),
                updated_at = NOW()
            WHERE id = NEW.group_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE community_groups 
        SET member_count = GREATEST(member_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update event attendee counts
CREATE OR REPLACE FUNCTION update_event_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.rsvp_status = 'going' THEN
        UPDATE community_events 
        SET attendee_count = attendee_count + 1,
            updated_at = NOW()
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.rsvp_status = 'going' AND NEW.rsvp_status != 'going' THEN
            UPDATE community_events 
            SET attendee_count = GREATEST(attendee_count - 1, 0),
                updated_at = NOW()
            WHERE id = NEW.event_id;
        ELSIF OLD.rsvp_status != 'going' AND NEW.rsvp_status = 'going' THEN
            UPDATE community_events 
            SET attendee_count = attendee_count + 1,
                updated_at = NOW()
            WHERE id = NEW.event_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.rsvp_status = 'going' THEN
        UPDATE community_events 
        SET attendee_count = GREATEST(attendee_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create community profile
CREATE OR REPLACE FUNCTION create_community_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_profiles (user_id, display_name)
    VALUES (
        NEW.id, 
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user activity stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'community_discussions' THEN
            UPDATE community_profiles 
            SET discussion_count = discussion_count + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF TG_TABLE_NAME = 'discussion_comments' THEN
            UPDATE community_profiles 
            SET comment_count = comment_count + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF TG_TABLE_NAME = 'prayer_requests' THEN
            UPDATE community_profiles 
            SET prayer_request_count = prayer_request_count + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'community_discussions' THEN
            UPDATE community_profiles 
            SET discussion_count = GREATEST(discussion_count - 1, 0),
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        ELSIF TG_TABLE_NAME = 'discussion_comments' THEN
            UPDATE community_profiles 
            SET comment_count = GREATEST(comment_count - 1, 0),
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        ELSIF TG_TABLE_NAME = 'prayer_requests' THEN
            UPDATE community_profiles 
            SET prayer_request_count = GREATEST(prayer_request_count - 1, 0),
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE TRIGGER community_discussions_updated_at
    BEFORE UPDATE ON community_discussions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER discussion_comments_updated_at
    BEFORE UPDATE ON discussion_comments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER prayer_requests_updated_at
    BEFORE UPDATE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER community_groups_updated_at
    BEFORE UPDATE ON community_groups
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER group_memberships_updated_at
    BEFORE UPDATE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER community_events_updated_at
    BEFORE UPDATE ON community_events
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER event_rsvps_updated_at
    BEFORE UPDATE ON event_rsvps
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER community_profiles_updated_at
    BEFORE UPDATE ON community_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER verse_discussions_updated_at
    BEFORE UPDATE ON verse_discussions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Count update triggers
CREATE TRIGGER discussion_comments_count_trigger
    AFTER INSERT OR DELETE ON discussion_comments
    FOR EACH ROW EXECUTE FUNCTION update_discussion_counts();

CREATE TRIGGER discussion_likes_count_trigger
    AFTER INSERT OR DELETE ON discussion_likes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_counts();

CREATE TRIGGER comment_likes_count_trigger
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes();

CREATE TRIGGER prayer_count_trigger
    AFTER INSERT OR DELETE ON prayer_interactions
    FOR EACH ROW EXECUTE FUNCTION update_prayer_counts();

CREATE TRIGGER group_member_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION update_group_counts();

CREATE TRIGGER event_attendee_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
    FOR EACH ROW EXECUTE FUNCTION update_event_counts();

-- Auto-create profile trigger
CREATE TRIGGER create_community_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_community_profile();

-- User stats triggers
CREATE TRIGGER user_discussion_stats_trigger
    AFTER INSERT OR DELETE ON community_discussions
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER user_comment_stats_trigger
    AFTER INSERT OR DELETE ON discussion_comments
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER user_prayer_stats_trigger
    AFTER INSERT OR DELETE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE community_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_stats ENABLE ROW LEVEL SECURITY;

-- Discussion policies
CREATE POLICY "discussions_select_policy" ON community_discussions FOR SELECT USING (
    NOT is_locked OR auth.uid() = user_id
);
CREATE POLICY "discussions_insert_policy" ON community_discussions FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "discussions_update_policy" ON community_discussions FOR UPDATE USING (
    auth.uid() = user_id
);
CREATE POLICY "discussions_delete_policy" ON community_discussions FOR DELETE USING (
    auth.uid() = user_id
);

-- Comment policies
CREATE POLICY "comments_select_policy" ON discussion_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_policy" ON discussion_comments FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "comments_update_policy" ON discussion_comments FOR UPDATE USING (
    auth.uid() = user_id
);
CREATE POLICY "comments_delete_policy" ON discussion_comments FOR DELETE USING (
    auth.uid() = user_id
);

-- Like policies
CREATE POLICY "discussion_likes_policy" ON discussion_likes FOR ALL USING (
    auth.uid() = user_id
);
CREATE POLICY "comment_likes_policy" ON comment_likes FOR ALL USING (
    auth.uid() = user_id
);

-- Prayer request policies
CREATE POLICY "prayer_requests_select_policy" ON prayer_requests FOR SELECT USING (true);
CREATE POLICY "prayer_requests_insert_policy" ON prayer_requests FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "prayer_requests_update_policy" ON prayer_requests FOR UPDATE USING (
    auth.uid() = user_id
);
CREATE POLICY "prayer_requests_delete_policy" ON prayer_requests FOR DELETE USING (
    auth.uid() = user_id
);

-- Prayer interaction policies
CREATE POLICY "prayer_interactions_select_policy" ON prayer_interactions FOR SELECT USING (true);
CREATE POLICY "prayer_interactions_policy" ON prayer_interactions FOR ALL USING (
    auth.uid() = user_id
);

-- Group policies
CREATE POLICY "groups_select_policy" ON community_groups FOR SELECT USING (
    NOT is_private OR EXISTS (
        SELECT 1 FROM group_memberships 
        WHERE group_id = id AND user_id = auth.uid() AND status = 'active'
    )
);
CREATE POLICY "groups_insert_policy" ON community_groups FOR INSERT WITH CHECK (
    auth.uid() = leader_id
);
CREATE POLICY "groups_update_policy" ON community_groups FOR UPDATE USING (
    auth.uid() = leader_id OR EXISTS (
        SELECT 1 FROM group_memberships 
        WHERE group_id = id AND user_id = auth.uid() AND role IN ('leader', 'moderator')
    )
);
CREATE POLICY "groups_delete_policy" ON community_groups FOR DELETE USING (
    auth.uid() = leader_id
);

-- Group membership policies
CREATE POLICY "group_memberships_select_policy" ON group_memberships FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM group_memberships gm 
        WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.status = 'active'
    )
);
CREATE POLICY "group_memberships_insert_policy" ON group_memberships FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "group_memberships_update_policy" ON group_memberships FOR UPDATE USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM community_groups 
        WHERE id = group_id AND leader_id = auth.uid()
    )
);
CREATE POLICY "group_memberships_delete_policy" ON group_memberships FOR DELETE USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM community_groups 
        WHERE id = group_id AND leader_id = auth.uid()
    )
);

-- Group discussion policies
CREATE POLICY "group_discussions_select_policy" ON group_discussions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM group_memberships 
        WHERE group_id = group_discussions.group_id AND user_id = auth.uid() AND status = 'active'
    )
);
CREATE POLICY "group_discussions_insert_policy" ON group_discussions FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM group_memberships 
        WHERE group_id = group_discussions.group_id AND user_id = auth.uid() AND status = 'active'
    )
);
CREATE POLICY "group_discussions_update_policy" ON group_discussions FOR UPDATE USING (
    auth.uid() = user_id
);
CREATE POLICY "group_discussions_delete_policy" ON group_discussions FOR DELETE USING (
    auth.uid() = user_id
);

-- Event policies
CREATE POLICY "events_select_policy" ON community_events FOR SELECT USING (true);
CREATE POLICY "events_insert_policy" ON community_events FOR INSERT WITH CHECK (
    auth.uid() = host_id
);
CREATE POLICY "events_update_policy" ON community_events FOR UPDATE USING (
    auth.uid() = host_id OR (
        group_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM group_memberships 
            WHERE group_id = community_events.group_id AND user_id = auth.uid() AND role IN ('leader', 'moderator')
        )
    )
);
CREATE POLICY "events_delete_policy" ON community_events FOR DELETE USING (
    auth.uid() = host_id
);

-- RSVP policies
CREATE POLICY "event_rsvps_select_policy" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "event_rsvps_policy" ON event_rsvps FOR ALL USING (
    auth.uid() = user_id
);

-- Profile policies
CREATE POLICY "profiles_select_policy" ON community_profiles FOR SELECT USING (
    is_public = true OR user_id = auth.uid()
);
CREATE POLICY "profiles_policy" ON community_profiles FOR ALL USING (
    auth.uid() = user_id
);

-- Badge policies
CREATE POLICY "badges_select_policy" ON user_badges FOR SELECT USING (
    is_visible = true OR user_id = auth.uid()
);
CREATE POLICY "badges_insert_policy" ON user_badges FOR INSERT WITH CHECK (true);

-- Bookmark policies
CREATE POLICY "bookmarks_policy" ON user_bookmarks FOR ALL USING (
    auth.uid() = user_id
);

-- Follow policies
CREATE POLICY "follows_select_policy" ON user_follows FOR SELECT USING (true);
CREATE POLICY "follows_policy" ON user_follows FOR ALL USING (
    auth.uid() = follower_id
);

-- Activity policies
CREATE POLICY "activities_select_policy" ON community_activities FOR SELECT USING (
    is_public = true OR user_id = auth.uid()
);
CREATE POLICY "activities_insert_policy" ON community_activities FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Notification policies
CREATE POLICY "notifications_select_policy" ON user_notifications FOR SELECT USING (
    auth.uid() = user_id
);
CREATE POLICY "notifications_update_policy" ON user_notifications FOR UPDATE USING (
    auth.uid() = user_id
);

-- Public read policies
CREATE POLICY "verse_discussions_select_policy" ON verse_discussions FOR SELECT USING (true);
CREATE POLICY "daily_verses_select_policy" ON daily_verses FOR SELECT USING (true);
CREATE POLICY "community_stats_select_policy" ON community_stats FOR SELECT USING (true);

-- =====================================================
-- 14. INITIAL DATA SETUP
-- =====================================================

-- Insert initial community stats
INSERT INTO community_stats (stat_type, stat_value, metadata) VALUES 
    ('total_discussions', 0, '{"description": "Total number of community discussions"}'),
    ('total_prayers', 0, '{"description": "Total number of prayer requests"}'),
    ('total_groups', 0, '{"description": "Total number of community groups"}'),
    ('total_events', 0, '{"description": "Total number of community events"}'),
    ('total_members', 0, '{"description": "Total number of community members"}'),
    ('total_comments', 0, '{"description": "Total number of comments"}'),
    ('total_likes', 0, '{"description": "Total number of likes"}'),
    ('active_users_today', 0, '{"description": "Number of active users today"}'),
    ('verses_discussed', 0, '{"description": "Number of unique verses discussed"}'),
    ('answered_prayers', 0, '{"description": "Number of answered prayer requests"}')
ON CONFLICT (stat_type, stat_date) DO NOTHING;

-- Sample data removed - database ready for production use

-- =====================================================
-- 15. HELPFUL VIEWS FOR EASY QUERIES
-- =====================================================

-- View for popular discussions with user info
CREATE OR REPLACE VIEW popular_discussions AS
SELECT 
    d.id,
    d.title,
    d.content,
    d.verse_reference,
    d.discussion_type,
    d.likes_count,
    d.comments_count,
    d.views_count,
    d.created_at,
    p.display_name,
    p.avatar_url,
    (d.likes_count + d.comments_count * 2 + d.views_count / 10) as engagement_score
FROM community_discussions d
JOIN community_profiles p ON d.user_id = p.user_id
WHERE NOT d.is_locked
ORDER BY engagement_score DESC;

-- View for active prayer requests
CREATE OR REPLACE VIEW active_prayer_requests AS
SELECT 
    pr.id,
    pr.title,
    pr.category,
    pr.urgency,
    pr.prayer_count,
    pr.is_answered,
    pr.created_at,
    p.display_name,
    p.avatar_url
FROM prayer_requests pr
JOIN community_profiles p ON pr.user_id = p.user_id
WHERE NOT pr.is_answered OR pr.updated_at > NOW() - INTERVAL '30 days'
ORDER BY 
    CASE pr.urgency WHEN 'urgent' THEN 1 ELSE 2 END,
    pr.created_at DESC;

-- View for upcoming events
CREATE OR REPLACE VIEW upcoming_events AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.event_date,
    e.event_time,
    e.event_type,
    e.location,
    e.is_online,
    e.attendee_count,
    e.max_attendees,
    p.display_name as host_name,
    g.name as group_name
FROM community_events e
JOIN community_profiles p ON e.host_id = p.user_id
LEFT JOIN community_groups g ON e.group_id = g.id
WHERE e.event_date >= CURRENT_DATE AND e.event_status = 'upcoming'
ORDER BY e.event_date, e.event_time;

-- View for community member rankings
CREATE OR REPLACE VIEW community_leaderboard AS
SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.community_points,
    p.discussion_count,
    p.comment_count,
    p.prayer_request_count,
    p.helpful_votes_received,
    p.consecutive_days_active,
    (p.discussion_count * 5 + p.comment_count * 2 + p.prayer_request_count * 3 + p.helpful_votes_received * 10) as total_score
FROM community_profiles p
WHERE p.is_public = true
ORDER BY total_score DESC;

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
    AND (table_name LIKE 'community_%' OR table_name LIKE 'prayer_%' OR table_name LIKE 'user_%' OR table_name LIKE 'daily_%' OR table_name LIKE 'verse_%' OR table_name LIKE 'event_%' OR table_name LIKE 'group_%' OR table_name LIKE 'discussion_%' OR table_name LIKE 'comment_%');
    
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
    RAISE NOTICE '🎉 BIBLE AURA COMMUNITY BACKEND COMPLETE!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Successfully created:';
    RAISE NOTICE '  📊 Tables: %', table_count;
    RAISE NOTICE '  ⚙️  Functions: %', function_count;
    RAISE NOTICE '  🔄 Triggers: %', trigger_count;
    RAISE NOTICE '  🔒 RLS Policies: %', policy_count;
    RAISE NOTICE '  🚀 Indexes: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features included:';
    RAISE NOTICE '  • Community Discussions & Comments';
    RAISE NOTICE '  • Prayer Request System';
    RAISE NOTICE '  • Community Groups & Events';
    RAISE NOTICE '  • User Profiles & Social Features';
    RAISE NOTICE '  • Activity Feed & Notifications';
    RAISE NOTICE '  • Bible Study & Verse Tracking';
    RAISE NOTICE '  • Analytics & Statistics';
    RAISE NOTICE '  • Row Level Security (RLS)';
    RAISE NOTICE '  • Performance Optimizations';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your community backend is ready!';
    RAISE NOTICE '==========================================';
END $$; 