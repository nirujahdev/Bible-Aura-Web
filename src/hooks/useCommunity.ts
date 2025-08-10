import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService, type Discussion, type PrayerRequest, type CommunityGroup, type CommunityEvent } from '@/lib/community-service'
import { useAuth } from './useAuth'
import { toast } from '@/hooks/use-toast'

export const useCommunity = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Discussions
  const useDiscussions = (filter: 'latest' | 'popular' | 'verse-based' | 'my-groups' = 'latest') => {
    return useQuery({
      queryKey: ['discussions', filter],
      queryFn: () => communityService.getDiscussions(filter),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const useCreateDiscussion = () => {
    return useMutation({
      mutationFn: (discussion: Omit<Discussion, 'id' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>) =>
        communityService.createDiscussion(discussion),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['discussions'] })
        toast({
          title: "Discussion Created",
          description: "Your discussion has been posted successfully.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create discussion.",
          variant: "destructive",
        })
      },
    })
  }

  const useLikeDiscussion = () => {
    return useMutation({
      mutationFn: ({ discussionId, isLiking }: { discussionId: string; isLiking: boolean }) => {
        if (!user?.id) throw new Error('User not authenticated')
        return isLiking 
          ? communityService.likeDiscussion(discussionId, user.id)
          : communityService.unlikeDiscussion(discussionId, user.id)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['discussions'] })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update like.",
          variant: "destructive",
        })
      },
    })
  }

  // Prayer Requests
  const usePrayerRequests = (filter: 'latest' | 'urgent' | 'most-prayed' | 'answered' = 'latest') => {
    return useQuery({
      queryKey: ['prayer-requests', filter],
      queryFn: () => communityService.getPrayerRequests(filter),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const useCreatePrayerRequest = () => {
    return useMutation({
      mutationFn: (prayerRequest: Omit<PrayerRequest, 'id' | 'prayer_count' | 'created_at' | 'updated_at'>) =>
        communityService.createPrayerRequest(prayerRequest),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prayer-requests'] })
        toast({
          title: "Prayer Request Submitted",
          description: "Your prayer request has been shared with the community.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to submit prayer request.",
          variant: "destructive",
        })
      },
    })
  }

  const usePrayForRequest = () => {
    return useMutation({
      mutationFn: (prayerRequestId: string) => {
        if (!user?.id) throw new Error('User not authenticated')
        return communityService.prayForRequest(prayerRequestId, user.id)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prayer-requests'] })
        toast({
          title: "Prayer Added",
          description: "Thank you for praying! The requester has been notified.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to add prayer.",
          variant: "destructive",
        })
      },
    })
  }

  const useMarkPrayerAnswered = () => {
    return useMutation({
      mutationFn: ({ prayerRequestId, testimony }: { prayerRequestId: string; testimony?: string }) =>
        communityService.markPrayerAnswered(prayerRequestId, testimony),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prayer-requests'] })
        toast({
          title: "Prayer Marked as Answered",
          description: "Praise God! Your testimony has been shared.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to mark prayer as answered.",
          variant: "destructive",
        })
      },
    })
  }

  // Groups
  const useGroups = (category = 'all') => {
    return useQuery({
      queryKey: ['groups', category],
      queryFn: () => communityService.getGroups(category),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  const useUserGroups = () => {
    return useQuery({
      queryKey: ['user-groups', user?.id],
      queryFn: () => user?.id ? communityService.getUserGroups(user.id) : [],
      enabled: !!user?.id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  const useCreateGroup = () => {
    return useMutation({
      mutationFn: (group: Omit<CommunityGroup, 'id' | 'member_count' | 'created_at' | 'updated_at'>) =>
        communityService.createGroup(group),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        queryClient.invalidateQueries({ queryKey: ['user-groups'] })
        toast({
          title: "Group Created",
          description: "Your group has been created successfully.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create group.",
          variant: "destructive",
        })
      },
    })
  }

  const useJoinGroup = () => {
    return useMutation({
      mutationFn: (groupId: string) => {
        if (!user?.id) throw new Error('User not authenticated')
        return communityService.joinGroup(groupId, user.id)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        queryClient.invalidateQueries({ queryKey: ['user-groups'] })
        toast({
          title: "Joined Group",
          description: "Welcome to the group! You can now participate in discussions.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to join group.",
          variant: "destructive",
        })
      },
    })
  }

  const useLeaveGroup = () => {
    return useMutation({
      mutationFn: (groupId: string) => {
        if (!user?.id) throw new Error('User not authenticated')
        return communityService.leaveGroup(groupId, user.id)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        queryClient.invalidateQueries({ queryKey: ['user-groups'] })
        toast({
          title: "Left Group",
          description: "You have left the group.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to leave group.",
          variant: "destructive",
        })
      },
    })
  }

  // Events
  const useEvents = (filter: 'upcoming' | 'past' = 'upcoming') => {
    return useQuery({
      queryKey: ['events', filter],
      queryFn: () => communityService.getEvents(filter),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  const useUserEvents = () => {
    return useQuery({
      queryKey: ['user-events', user?.id],
      queryFn: () => user?.id ? communityService.getUserEvents(user.id) : [],
      enabled: !!user?.id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  const useCreateEvent = () => {
    return useMutation({
      mutationFn: (event: Omit<CommunityEvent, 'id' | 'attendee_count' | 'created_at' | 'updated_at'>) =>
        communityService.createEvent(event),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] })
        toast({
          title: "Event Created",
          description: "Your event has been created successfully.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create event.",
          variant: "destructive",
        })
      },
    })
  }

  const useRSVPToEvent = () => {
    return useMutation({
      mutationFn: ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }) => {
        if (!user?.id) throw new Error('User not authenticated')
        return communityService.rsvpToEvent(eventId, user.id, status)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['user-events'] })
        toast({
          title: "RSVP Updated",
          description: "Your RSVP has been updated.",
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update RSVP.",
          variant: "destructive",
        })
      },
    })
  }

  // Profile and Stats
  const useCommunityProfile = (userId?: string) => {
    const targetUserId = userId || user?.id
    return useQuery({
      queryKey: ['community-profile', targetUserId],
      queryFn: () => targetUserId ? communityService.getCommunityProfile(targetUserId) : null,
      enabled: !!targetUserId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  const useUserBadges = (userId?: string) => {
    const targetUserId = userId || user?.id
    return useQuery({
      queryKey: ['user-badges', targetUserId],
      queryFn: () => targetUserId ? communityService.getUserBadges(targetUserId) : [],
      enabled: !!targetUserId,
      staleTime: 30 * 60 * 1000, // 30 minutes
    })
  }

  const useUserActivity = (userId?: string) => {
    const targetUserId = userId || user?.id
    return useQuery({
      queryKey: ['user-activity', targetUserId],
      queryFn: () => targetUserId ? communityService.getUserActivity(targetUserId) : [],
      enabled: !!targetUserId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const useCommunityStats = () => {
    return useQuery({
      queryKey: ['community-stats'],
      queryFn: () => communityService.getCommunityStats(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    })
  }

  const useTrendingVerses = () => {
    return useQuery({
      queryKey: ['trending-verses'],
      queryFn: () => communityService.getTrendingVerses(),
      staleTime: 60 * 60 * 1000, // 1 hour
    })
  }

  const useTopContributors = () => {
    return useQuery({
      queryKey: ['top-contributors'],
      queryFn: () => communityService.getTopContributors(),
      staleTime: 60 * 60 * 1000, // 1 hour
    })
  }

  return {
    // Discussions
    useDiscussions,
    useCreateDiscussion,
    useLikeDiscussion,
    
    // Prayer Requests
    usePrayerRequests,
    useCreatePrayerRequest,
    usePrayForRequest,
    useMarkPrayerAnswered,
    
    // Groups
    useGroups,
    useUserGroups,
    useCreateGroup,
    useJoinGroup,
    useLeaveGroup,
    
    // Events
    useEvents,
    useUserEvents,
    useCreateEvent,
    useRSVPToEvent,
    
    // Profile and Stats
    useCommunityProfile,
    useUserBadges,
    useUserActivity,
    useCommunityStats,
    useTrendingVerses,
    useTopContributors,
  }
}

export default useCommunity 