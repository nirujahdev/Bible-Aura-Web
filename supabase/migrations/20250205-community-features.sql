-- Community Features Migration
-- This migration creates all the necessary tables for the community features

-- 1. Community Discussions Table
CREATE TABLE IF NOT EXISTS community_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    verse_reference TEXT,
    verse_text TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Discussion Comments Table
CREATE TABLE IF NOT EXISTS discussion_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Discussion Likes Table
CREATE TABLE IF NOT EXISTS discussion_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, discussion_id)
);

-- 4. Comment Likes Table
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 5. Prayer Requests Table
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
    is_anonymous BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false,
    testimony TEXT,
    prayer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Prayer Interactions Table (for tracking who prayed)
CREATE TABLE IF NOT EXISTS prayer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prayer_request_id)
);

-- 7. Community Groups Table
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT false,
    invite_code TEXT UNIQUE,
    category TEXT NOT NULL DEFAULT 'bible-study',
    banner_url TEXT,
    member_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Group Memberships Table
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'leader')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

-- 9. Group Discussions Table
CREATE TABLE IF NOT EXISTS group_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    verse_reference TEXT,
    pinned BOOLEAN DEFAULT false,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Community Events Table
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES community_groups(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    location TEXT,
    is_online BOOLEAN DEFAULT false,
    stream_link TEXT,
    event_type TEXT NOT NULL DEFAULT 'bible-study',
    related_verse TEXT,
    max_attendees INTEGER,
    attendee_count INTEGER DEFAULT 0,
    tags TEXT[],
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Event RSVPs Table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    rsvp_status TEXT DEFAULT 'going' CHECK (rsvp_status IN ('going', 'maybe', 'not_going')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- 12. Community User Profiles Table (extended profile info)
CREATE TABLE IF NOT EXISTS community_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    bio TEXT,
    favorite_verse_reference TEXT,
    favorite_verse_text TEXT,
    banner_url TEXT,
    community_points INTEGER DEFAULT 0,
    badge_ids TEXT[],
    is_public BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Community Activity Feed Table
CREATE TABLE IF NOT EXISTS community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'prayer', 'group_join', 'event_rsvp', 'comment', 'like')),
    activity_title TEXT NOT NULL,
    activity_description TEXT,
    related_id UUID, -- Can reference discussion, prayer, group, or event
    related_type TEXT, -- 'discussion', 'prayer', 'group', 'event'
    verse_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Community Stats Table (for tracking engagement)
CREATE TABLE IF NOT EXISTS community_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type TEXT NOT NULL,
    stat_value INTEGER NOT NULL,
    stat_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stat_type, stat_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON community_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON community_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_tags ON community_discussions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_urgency ON prayer_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_groups_leader_id ON community_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_category ON community_groups(category);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON community_events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_group_id ON community_events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON community_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON community_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON community_activities(created_at DESC);

-- Create RLS (Row Level Security) policies
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
ALTER TABLE community_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_stats ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can read public content, modify their own)
-- Discussions
CREATE POLICY "Public discussions are viewable by everyone" ON community_discussions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own discussions" ON community_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own discussions" ON community_discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own discussions" ON community_discussions FOR DELETE USING (auth.uid() = user_id);

-- Prayer Requests
CREATE POLICY "Public prayer requests are viewable by everyone" ON prayer_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert their own prayer requests" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayer requests" ON prayer_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayer requests" ON prayer_requests FOR DELETE USING (auth.uid() = user_id);

-- Groups
CREATE POLICY "Public groups are viewable by everyone" ON community_groups FOR SELECT USING (NOT is_private OR EXISTS (SELECT 1 FROM group_memberships WHERE group_id = id AND user_id = auth.uid()));
CREATE POLICY "Authenticated users can create groups" ON community_groups FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Group leaders can update their groups" ON community_groups FOR UPDATE USING (auth.uid() = leader_id);

-- Group Memberships
CREATE POLICY "Group memberships are viewable by group members" ON group_memberships FOR SELECT USING (EXISTS (SELECT 1 FROM group_memberships gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid()));
CREATE POLICY "Users can join public groups" ON group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_memberships FOR DELETE USING (auth.uid() = user_id);

-- Events
CREATE POLICY "Public events are viewable by everyone" ON community_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON community_events FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Event hosts can update their events" ON community_events FOR UPDATE USING (auth.uid() = host_id);

-- Community Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON community_profiles FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "Users can manage their own profile" ON community_profiles FOR ALL USING (auth.uid() = user_id);

-- User Badges
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System can award badges" ON user_badges FOR INSERT WITH CHECK (true);

-- Community Activities
CREATE POLICY "Public activities are viewable by everyone" ON community_activities FOR SELECT USING (true);
CREATE POLICY "Users can create their own activities" ON community_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions to update counters
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

-- Triggers for updating counters
CREATE TRIGGER discussion_comments_count_trigger
  AFTER INSERT OR DELETE ON discussion_comments
  FOR EACH ROW EXECUTE FUNCTION update_discussion_counts();

CREATE TRIGGER discussion_likes_count_trigger
  AFTER INSERT OR DELETE ON discussion_likes
  FOR EACH ROW EXECUTE FUNCTION update_discussion_counts();

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

-- Trigger for prayer counts
CREATE TRIGGER prayer_count_trigger
  AFTER INSERT OR DELETE ON prayer_interactions
  FOR EACH ROW EXECUTE FUNCTION update_prayer_counts();

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

-- Trigger for group member counts
CREATE TRIGGER group_member_count_trigger
  AFTER INSERT OR DELETE ON group_memberships
  FOR EACH ROW EXECUTE FUNCTION update_group_counts();

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

-- Trigger for event attendee counts
CREATE TRIGGER event_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_event_counts();

-- Insert initial community stats
INSERT INTO community_stats (stat_type, stat_value) VALUES 
  ('total_discussions', 0),
  ('total_prayers', 0),
  ('total_groups', 0),
  ('total_events', 0),
  ('total_members', 0)
ON CONFLICT (stat_type, stat_date) DO NOTHING;

-- Create some sample data for development (remove in production)
INSERT INTO community_discussions (user_id, title, content, verse_reference, verse_text, tags) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Understanding Faith vs Works', 'I have been studying James 2 and would love to hear different perspectives...', 'James 2:14-26', 'What good is it, my brothers and sisters, if someone claims to have faith but has no deeds?', ARRAY['Faith', 'Salvation', 'James']),
  ('00000000-0000-0000-0000-000000000000', 'God''s Provision During Trials', 'I wanted to share how God provided for my family...', 'Philippians 4:19', 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.', ARRAY['Testimony', 'Provision', 'Trust'])
ON CONFLICT DO NOTHING;

INSERT INTO prayer_requests (user_id, title, content, category, urgency) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Healing for My Mother', 'Please pray for my mother who was diagnosed with cancer...', 'healing', 'urgent'),
  ('00000000-0000-0000-0000-000000000000', 'Job Interview Tomorrow', 'I have an important job interview tomorrow...', 'guidance', 'normal')
ON CONFLICT DO NOTHING;

INSERT INTO community_groups (name, description, leader_id, category, tags) VALUES
  ('Bible in a Year', 'Join us as we read through the entire Bible together in one year.', '00000000-0000-0000-0000-000000000000', 'bible-study', ARRAY['Bible Reading', 'Accountability', 'Community']),
  ('Apologetics & Theology', 'Dive deep into Christian apologetics and theology.', '00000000-0000-0000-0000-000000000000', 'theology', ARRAY['Apologetics', 'Theology', 'Doctrine'])
ON CONFLICT DO NOTHING; 