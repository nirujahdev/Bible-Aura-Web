import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'

// Types
export interface Discussion {
  id: string
  user_id: string
  title: string
  content: string
  verse_reference?: string
  verse_text?: string
  likes_count: number
  comments_count: number
  tags: string[]
  created_at: string
  updated_at: string
  author?: {
    name: string
    avatar: string
  }
}

export interface PrayerRequest {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  urgency: 'normal' | 'urgent'
  is_anonymous: boolean
  is_answered: boolean
  testimony?: string
  prayer_count: number
  created_at: string
  updated_at: string
  author?: {
    name: string
    avatar: string
  }
}

export interface CommunityGroup {
  id: string
  name: string
  description: string
  leader_id: string
  is_private: boolean
  invite_code?: string
  category: string
  banner_url?: string
  member_count: number
  tags: string[]
  created_at: string
  updated_at: string
  leader?: {
    name: string
    avatar: string
  }
  is_member?: boolean
}

export interface CommunityEvent {
  id: string
  host_id: string
  group_id?: string
  title: string
  description: string
  event_date: string
  event_time: string
  timezone: string
  location: string
  is_online: boolean
  stream_link?: string
  event_type: string
  related_verse?: string
  max_attendees?: number
  attendee_count: number
  tags: string[]
  banner_url?: string
  created_at: string
  updated_at: string
  host?: {
    name: string
    avatar: string
  }
  is_rsvped?: boolean
}

export interface CommunityProfile {
  id: string
  user_id: string
  display_name?: string
  bio?: string
  favorite_verse_reference?: string
  favorite_verse_text?: string
  banner_url?: string
  community_points: number
  badge_ids: string[]
  is_public: boolean
  show_activity: boolean
  allow_messages: boolean
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_type: string
  badge_name: string
  badge_description?: string
  badge_icon?: string
  earned_date: string
  created_at: string
}

export interface CommunityActivity {
  id: string
  user_id: string
  activity_type: 'post' | 'prayer' | 'group_join' | 'event_rsvp' | 'comment' | 'like'
  activity_title: string
  activity_description?: string
  related_id?: string
  related_type?: string
  verse_reference?: string
  created_at: string
}

class CommunityService {
  // Discussions
  async getDiscussions(filter: 'latest' | 'popular' | 'verse-based' | 'my-groups' = 'latest', limit = 20) {
    let query = supabase
      .from('community_discussions')
      .select(`
        *,
        community_profiles!community_discussions_user_id_fkey (
          display_name,
          user_id
        )
      `)
      .limit(limit)

    switch (filter) {
      case 'popular':
        query = query.order('likes_count', { ascending: false })
        break
      case 'verse-based':
        query = query.not('verse_reference', 'is', null).order('created_at', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async createDiscussion(discussion: Omit<Discussion, 'id' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('community_discussions')
      .insert([discussion])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async likeDiscussion(discussionId: string, userId: string) {
    const { error } = await supabase
      .from('discussion_likes')
      .insert([{ discussion_id: discussionId, user_id: userId }])

    if (error) throw error
  }

  async unlikeDiscussion(discussionId: string, userId: string) {
    const { error } = await supabase
      .from('discussion_likes')
      .delete()
      .eq('discussion_id', discussionId)
      .eq('user_id', userId)

    if (error) throw error
  }

  // Comments and Replies
  async getDiscussionComments(discussionId: string) {
    const { data, error } = await supabase
      .from('discussion_comments')
      .select(`
        *,
        community_profiles!discussion_comments_user_id_fkey (
          display_name,
          user_id
        )
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  async createComment(comment: {
    discussion_id: string
    user_id: string
    content: string
    parent_comment_id?: string
  }) {
    const { data, error } = await supabase
      .from('discussion_comments')
      .insert([comment])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async likeComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from('comment_likes')
      .insert([{ comment_id: commentId, user_id: userId }])

    if (error) throw error
  }

  async unlikeComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)

    if (error) throw error
  }

  // Bookmarks
  async bookmarkDiscussion(discussionId: string, userId: string) {
    const { error } = await supabase
      .from('user_bookmarks')
      .insert([{ 
        user_id: userId, 
        item_id: discussionId, 
        item_type: 'discussion' 
      }])

    if (error) throw error
  }

  async unbookmarkDiscussion(discussionId: string, userId: string) {
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('item_id', discussionId)
      .eq('user_id', userId)
      .eq('item_type', 'discussion')

    if (error) throw error
  }

  // Prayer Requests
  async getPrayerRequests(filter: 'latest' | 'urgent' | 'most-prayed' | 'answered' = 'latest', limit = 20) {
    let query = supabase
      .from('prayer_requests')
      .select(`
        *,
        community_profiles!prayer_requests_user_id_fkey (
          display_name,
          user_id
        )
      `)
      .limit(limit)

    switch (filter) {
      case 'urgent':
        query = query.eq('urgency', 'urgent').order('created_at', { ascending: false })
        break
      case 'most-prayed':
        query = query.order('prayer_count', { ascending: false })
        break
      case 'answered':
        query = query.eq('is_answered', true).order('updated_at', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async createPrayerRequest(prayerRequest: Omit<PrayerRequest, 'id' | 'prayer_count' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert([prayerRequest])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async prayForRequest(prayerRequestId: string, userId: string) {
    const { error } = await supabase
      .from('prayer_interactions')
      .insert([{ prayer_request_id: prayerRequestId, user_id: userId }])

    if (error) throw error
  }

  async markPrayerAnswered(prayerRequestId: string, testimony?: string) {
    const updateData: any = { is_answered: true, updated_at: new Date().toISOString() }
    if (testimony) updateData.testimony = testimony

    const { error } = await supabase
      .from('prayer_requests')
      .update(updateData)
      .eq('id', prayerRequestId)

    if (error) throw error
  }

  // Groups
  async getGroups(category = 'all', limit = 20) {
    let query = supabase
      .from('community_groups')
      .select(`
        *,
        community_profiles!community_groups_leader_id_fkey (
          display_name,
          user_id
        )
      `)
      .limit(limit)

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    query = query.order('member_count', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async createGroup(group: Omit<CommunityGroup, 'id' | 'member_count' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('community_groups')
      .insert([group])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async joinGroup(groupId: string, userId: string) {
    const { error } = await supabase
      .from('group_memberships')
      .insert([{ group_id: groupId, user_id: userId }])

    if (error) throw error
  }

  async leaveGroup(groupId: string, userId: string) {
    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) throw error
  }

  async getUserGroups(userId: string) {
    const { data, error } = await supabase
      .from('group_memberships')
      .select(`
        *,
        community_groups (*)
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data?.map(membership => membership.community_groups) || []
  }

  // Events
  async getEvents(filter: 'upcoming' | 'past' = 'upcoming', limit = 20) {
    let query = supabase
      .from('community_events')
      .select(`
        *,
        community_profiles!community_events_host_id_fkey (
          display_name,
          user_id
        )
      `)
      .limit(limit)

    const today = new Date().toISOString().split('T')[0]

    if (filter === 'upcoming') {
      query = query.gte('event_date', today).order('event_date', { ascending: true })
    } else {
      query = query.lt('event_date', today).order('event_date', { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async createEvent(event: Omit<CommunityEvent, 'id' | 'attendee_count' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('community_events')
      .insert([event])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async rsvpToEvent(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going' = 'going') {
    const { error } = await supabase
      .from('event_rsvps')
      .upsert([{ event_id: eventId, user_id: userId, rsvp_status: status }])

    if (error) throw error
  }

  async getUserEvents(userId: string) {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        community_events (*)
      `)
      .eq('user_id', userId)
      .eq('rsvp_status', 'going')

    if (error) throw error
    return data?.map(rsvp => rsvp.community_events) || []
  }

  // Profile & User Management
  async getCommunityProfile(userId: string): Promise<CommunityProfile | null> {
    const { data, error } = await supabase
      .from('community_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async createOrUpdateProfile(userId: string, profileData: Partial<CommunityProfile>) {
    const { data, error } = await supabase
      .from('community_profiles')
      .upsert([{ user_id: userId, ...profileData }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getUserActivity(userId: string, limit = 20): Promise<CommunityActivity[]> {
    const { data, error } = await supabase
      .from('community_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // Statistics
  async getCommunityStats() {
    const { data, error } = await supabase
      .from('community_stats')
      .select('*')
      .eq('stat_date', new Date().toISOString().split('T')[0])

    if (error) throw error
    return data || []
  }

  // Trending content
  async getTrendingVerses(limit = 10) {
    const { data, error } = await supabase
      .from('community_discussions')
      .select('verse_reference')
      .not('verse_reference', 'is', null)
      .order('likes_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    
    // Count occurrences of each verse
    const verseCounts: { [key: string]: number } = {}
    data?.forEach(item => {
      if (item.verse_reference) {
        verseCounts[item.verse_reference] = (verseCounts[item.verse_reference] || 0) + 1
      }
    })

    return Object.entries(verseCounts)
      .map(([reference, count]) => ({ reference, engagement: count }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit)
  }

  async getTopContributors(limit = 10) {
    // This would need a more complex query in production
    // For now, return mock data
    return [
      { name: 'Pastor John', contributions: 89, avatar: '/placeholder.svg' },
      { name: 'Mary S.', contributions: 67, avatar: '/placeholder.svg' },
      { name: 'David L.', contributions: 45, avatar: '/placeholder.svg' }
    ]
  }
}

export const communityService = new CommunityService()
export default communityService 