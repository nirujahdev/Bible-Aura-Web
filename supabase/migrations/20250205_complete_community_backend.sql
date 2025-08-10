-- =====================================================
-- COMPLETE COMMUNITY BACKEND SQL MIGRATION
-- Bible Aura Community Features - Full Backend Setup
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COMMUNITY DISCUSSIONS
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

-- =====================================================
-- 2. PRAYER REQUESTS
-- =====================================================

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

-- Prayer interactions table (for tracking who prayed)
CREATE TABLE IF NOT EXISTS prayer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
    prayer_type TEXT DEFAULT 'prayed' CHECK (prayer_type IN ('prayed', 'fasted', 'shared')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prayer_request_id, prayer_type)
);

-- =====================================================
-- 3. COMMUNITY GROUPS
-- =====================================================

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

-- Group discussions table
CREATE TABLE IF NOT EXISTS group_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    verse_reference TEXT,
    pinned BOOLEAN DEFAULT FALSE,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. COMMUNITY EVENTS
-- =====================================================

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

-- =====================================================
-- 5. USER PROFILES & SOCIAL FEATURES
-- =====================================================

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

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('helper', 'encourager', 'scholar', 'faithful_friend', 'prayer_warrior', 'bible_student', 'community_builder', 'wise_counselor')),
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    badge_color TEXT DEFAULT '#3B82F6',
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('discussion', 'prayer', 'event', 'group', 'comment')),
    folder_name TEXT DEFAULT 'default',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

-- User follows table (for following other users)
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- =====================================================
-- 6. ACTIVITY FEED & NOTIFICATIONS
-- =====================================================

-- Community activity feed
CREATE TABLE IF NOT EXISTS community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'comment', 'like', 'prayer', 'group_join', 'event_rsvp', 'follow', 'badge_earned', 'testimony')),
    activity_title TEXT NOT NULL,
    activity_description TEXT,
    related_id UUID,
    related_type TEXT CHECK (related_type IN ('discussion', 'comment', 'prayer', 'group', 'event', 'user')),
    verse_reference TEXT,
    metadata JSONB,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('like', 'comment', 'follow', 'mention', 'prayer_answer', 'event_reminder', 'group_invite', 'badge_earned')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    related_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. BIBLE STUDY & THEOLOGICAL RESOURCES
-- =====================================================

-- Bible verses discussion tracking
CREATE TABLE IF NOT EXISTS verse_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse_reference TEXT NOT NULL,
    book_name TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    discussion_count INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    last_discussed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(verse_reference)
);

-- Daily verses table
CREATE TABLE IF NOT EXISTS daily_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse_reference TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    commentary TEXT,
    reflection_questions TEXT[],
    date_featured DATE NOT NULL UNIQUE,
    theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. COMMUNITY STATS & ANALYTICS
-- =====================================================

-- Community statistics
CREATE TABLE IF NOT EXISTS community_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type TEXT NOT NULL,
    stat_value INTEGER NOT NULL,
    stat_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stat_type, stat_date)
);

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Discussion indexes
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON community_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON community_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_discussion_type ON community_discussions(discussion_type);
CREATE INDEX IF NOT EXISTS idx_discussions_tags ON community_discussions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_discussions_featured ON community_discussions(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_discussions_pinned ON community_discussions(is_pinned) WHERE is_pinned = TRUE;

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_discussion_id ON discussion_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON discussion_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON discussion_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON discussion_comments(created_at DESC);

-- Prayer request indexes
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_urgency ON prayer_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_answered ON prayer_requests(is_answered);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);

-- Group indexes
CREATE INDEX IF NOT EXISTS idx_groups_leader_id ON community_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_category ON community_groups(category);
CREATE INDEX IF NOT EXISTS idx_groups_private ON community_groups(is_private);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_status ON group_memberships(status);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_host_id ON community_events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_group_id ON community_events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON community_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_online ON community_events(is_online);

-- Activity and notification indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON community_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON community_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON community_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_public ON community_activities(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON user_notifications(is_read) WHERE is_read = FALSE;

-- Bookmark and follow indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_item_type ON user_bookmarks(item_type);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
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

-- Badge policies
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System can award badges" ON user_badges FOR INSERT WITH CHECK (true);

-- Bookmark policies
CREATE POLICY "Users can manage their own bookmarks" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Follow policies
CREATE POLICY "Follows are viewable by everyone" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);

-- Activity policies
CREATE POLICY "Public activities are viewable by everyone" ON community_activities FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own activities" ON community_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activities" ON community_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Public read policies for reference tables
CREATE POLICY "Verse discussions are viewable by everyone" ON verse_discussions FOR SELECT USING (true);
CREATE POLICY "Daily verses are viewable by everyone" ON daily_verses FOR SELECT USING (true);
CREATE POLICY "Community stats are viewable by everyone" ON community_stats FOR SELECT USING (true);

-- =====================================================
-- 11. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update discussion counts
CREATE OR REPLACE FUNCTION update_discussion_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'discussion_comments' THEN
      UPDATE community_discussions SET comments_count = comments_count + 1 WHERE id = NEW.discussion_id;
    ELSIF TG_TABLE_NAME = 'discussion_likes' THEN
      UPDATE community_discussions SET likes_count = likes_count + 1 WHERE id = NEW.discussion_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'discussion_comments' THEN
      UPDATE community_discussions SET comments_count = comments_count - 1 WHERE id = OLD.discussion_id;
    ELSIF TG_TABLE_NAME = 'discussion_likes' THEN
      UPDATE community_discussions SET likes_count = likes_count - 1 WHERE id = OLD.discussion_id;
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
    UPDATE discussion_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discussion_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
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
    UPDATE prayer_requests SET prayer_count = prayer_count + 1 WHERE id = NEW.prayer_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests SET prayer_count = prayer_count - 1 WHERE id = OLD.prayer_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update group member counts
CREATE OR REPLACE FUNCTION update_group_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update event attendee counts
CREATE OR REPLACE FUNCTION update_event_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.rsvp_status = 'going' THEN
    UPDATE community_events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.rsvp_status = 'going' AND NEW.rsvp_status != 'going' THEN
      UPDATE community_events SET attendee_count = attendee_count - 1 WHERE id = NEW.event_id;
    ELSIF OLD.rsvp_status != 'going' AND NEW.rsvp_status = 'going' THEN
      UPDATE community_events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.rsvp_status = 'going' THEN
    UPDATE community_events SET attendee_count = attendee_count - 1 WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create community profile automatically
CREATE OR REPLACE FUNCTION create_community_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user activity stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'community_discussions' THEN
      UPDATE community_profiles SET discussion_count = discussion_count + 1 WHERE user_id = NEW.user_id;
    ELSIF TG_TABLE_NAME = 'discussion_comments' THEN
      UPDATE community_profiles SET comment_count = comment_count + 1 WHERE user_id = NEW.user_id;
    ELSIF TG_TABLE_NAME = 'prayer_requests' THEN
      UPDATE community_profiles SET prayer_request_count = prayer_request_count + 1 WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'community_discussions' THEN
      UPDATE community_profiles SET discussion_count = discussion_count - 1 WHERE user_id = OLD.user_id;
    ELSIF TG_TABLE_NAME = 'discussion_comments' THEN
      UPDATE community_profiles SET comment_count = comment_count - 1 WHERE user_id = OLD.user_id;
    ELSIF TG_TABLE_NAME = 'prayer_requests' THEN
      UPDATE community_profiles SET prayer_request_count = prayer_request_count - 1 WHERE user_id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Discussion count triggers
CREATE TRIGGER discussion_comments_count_trigger
  AFTER INSERT OR DELETE ON discussion_comments
  FOR EACH ROW EXECUTE FUNCTION update_discussion_counts();

CREATE TRIGGER discussion_likes_count_trigger
  AFTER INSERT OR DELETE ON discussion_likes
  FOR EACH ROW EXECUTE FUNCTION update_discussion_counts();

-- Comment likes trigger
CREATE TRIGGER comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes();

-- Prayer count trigger
CREATE TRIGGER prayer_count_trigger
  AFTER INSERT OR DELETE ON prayer_interactions
  FOR EACH ROW EXECUTE FUNCTION update_prayer_counts();

-- Group member count trigger
CREATE TRIGGER group_member_count_trigger
  AFTER INSERT OR DELETE ON group_memberships
  FOR EACH ROW EXECUTE FUNCTION update_group_counts();

-- Event attendee count trigger
CREATE TRIGGER event_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_event_counts();

-- Auto-create community profile trigger
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
-- 13. INITIAL DATA SETUP
-- =====================================================

-- Insert initial community stats
INSERT INTO community_stats (stat_type, stat_value) VALUES 
  ('total_discussions', 0),
  ('total_prayers', 0),
  ('total_groups', 0),
  ('total_events', 0),
  ('total_members', 0),
  ('total_comments', 0),
  ('total_likes', 0),
  ('active_users_today', 0),
  ('verses_discussed', 0)
ON CONFLICT (stat_type, stat_date) DO NOTHING;

-- Insert a sample daily verse
INSERT INTO daily_verses (verse_reference, verse_text, commentary, theme, date_featured) VALUES 
  ('John 3:16', 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 'This verse encapsulates the heart of the Gospel - God''s love, sacrifice, and the gift of eternal life through faith in Jesus Christ.', 'God''s Love', CURRENT_DATE)
ON CONFLICT (date_featured) DO NOTHING;

-- Insert sample discussion for testing (optional - remove in production)
INSERT INTO community_discussions (
  user_id, 
  title, 
  content, 
  verse_reference, 
  verse_text, 
  discussion_type,
  tags
) VALUES 
  (
    '00000000-0000-0000-0000-000000000000', 
    'Understanding Faith and Works in James 2', 
    'I have been studying James 2:14-26 and would love to hear different perspectives on how faith and works relate to salvation. How do we reconcile this with Paul''s teachings in Ephesians 2:8-9?',
    'James 2:14-26',
    'What good is it, my brothers and sisters, if someone claims to have faith but has no deeds? Can such faith save them?',
    'study',
    ARRAY['faith', 'salvation', 'james', 'works']
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Testimony: God''s Provision During Difficult Times',
    'I wanted to share how God provided for my family during a very challenging season. His faithfulness in Philippians 4:19 became so real to us...',
    'Philippians 4:19',
    'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',
    'testimony',
    ARRAY['testimony', 'provision', 'faithfulness', 'trust']
  )
ON CONFLICT DO NOTHING;

-- Insert sample prayer requests
INSERT INTO prayer_requests (
  user_id,
  title, 
  content, 
  category, 
  urgency
) VALUES 
  (
    '00000000-0000-0000-0000-000000000000',
    'Healing for Family Member', 
    'Please pray for healing and strength during this difficult health challenge.',
    'healing', 
    'urgent'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Wisdom in Job Decision', 
    'Seeking God''s guidance and wisdom for an important career decision.',
    'guidance', 
    'normal'
  )
ON CONFLICT DO NOTHING;

-- Insert sample community groups
INSERT INTO community_groups (
  name, 
  description, 
  leader_id, 
  category, 
  tags
) VALUES 
  (
    'Bible in a Year',
    'Join us as we read through the entire Bible together in one year. Daily discussions, encouragement, and accountability.',
    '00000000-0000-0000-0000-000000000000',
    'bible-study',
    ARRAY['bible-reading', 'accountability', 'community']
  ),
  (
    'Apologetics & Theology',
    'Dive deep into Christian apologetics and theology. Respectful discussions about faith, doctrine, and difficult questions.',
    '00000000-0000-0000-0000-000000000000',
    'theology',
    ARRAY['apologetics', 'theology', 'doctrine']
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Create a success confirmation
DO $$
BEGIN
  RAISE NOTICE 'Bible Aura Community Backend Setup Complete! 🎉';
  RAISE NOTICE 'Tables created: %, Functions: %, Triggers: %', 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%community%' OR table_name LIKE '%prayer%' OR table_name LIKE '%user_%' OR table_name LIKE '%daily%'),
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%update_%' OR routine_name LIKE '%create_%'),
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public');
END $$; 