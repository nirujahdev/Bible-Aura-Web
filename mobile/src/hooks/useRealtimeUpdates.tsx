import { useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { queryClient, invalidateQueries } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type DatabaseTable = 
  | 'profiles'
  | 'ai_conversations'
  | 'journal_entries'
  | 'prayer_requests'
  | 'bookmarks'
  | 'daily_verses'
  | 'reading_progress'
  | 'reading_plans';

type ChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimeSubscription {
  table: DatabaseTable;
  event?: ChangeType | '*';
  schema?: string;
  filter?: string;
  callback?: (payload: any) => void;
}

interface UseRealtimeOptions {
  enabled?: boolean;
  showToasts?: boolean;
  autoInvalidateQueries?: boolean;
  onConnectionChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void;
}

export function useRealtimeUpdates(
  subscriptions: RealtimeSubscription[],
  options: UseRealtimeOptions = {}
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const subscriptionsRef = useRef<RealtimeSubscription[]>([]);

  const {
    enabled = true,
    showToasts = false,
    autoInvalidateQueries = true,
    onConnectionChange
  } = options;

  // Handle real-time payload changes
  const handleRealtimeChange = useCallback((
    table: DatabaseTable,
    payload: any,
    customCallback?: (payload: any) => void
  ) => {
    console.log(`Real-time ${payload.eventType} on ${table}:`, payload);

    // Call custom callback if provided
    if (customCallback) {
      customCallback(payload);
    }

    // Auto-invalidate queries based on table
    if (autoInvalidateQueries && user) {
      switch (table) {
        case 'profiles':
          invalidateQueries.profile(user.id);
          break;
        case 'ai_conversations':
          invalidateQueries.conversations(user.id);
          break;
        case 'journal_entries':
          invalidateQueries.journalEntries(user.id);
          break;
        case 'prayer_requests':
          invalidateQueries.prayerRequests(user.id);
          break;
        case 'bookmarks':
          invalidateQueries.bookmarks(user.id);
          break;
        case 'daily_verses':
        case 'reading_progress':
        case 'reading_plans':
          invalidateQueries.analytics(user.id);
          break;
      }
    }

    // Show toast notifications for certain events
    if (showToasts && user) {
      const getToastMessage = () => {
        switch (payload.eventType) {
          case 'INSERT':
            switch (table) {
              case 'ai_conversations':
                return { title: 'New Chat Started', description: 'Your AI conversation has been saved.' };
              case 'journal_entries':
                return { title: 'Journal Entry Saved', description: 'Your spiritual reflection has been saved.' };
              case 'prayer_requests':
                return { title: 'Prayer Request Added', description: 'Your prayer has been added to your list.' };
              case 'bookmarks':
                return { title: 'Verse Bookmarked', description: 'Bible verse saved to your collection.' };
              default:
                return null;
            }
          case 'UPDATE':
            switch (table) {
              case 'prayer_requests':
                if (payload.new.status === 'answered') {
                  return { title: 'Prayer Answered! 🙏', description: 'Praise the Lord! Your prayer has been marked as answered.' };
                }
                return { title: 'Prayer Updated', description: 'Your prayer request has been updated.' };
              case 'reading_progress':
                return { title: 'Progress Updated', description: 'Your reading progress has been saved.' };
              default:
                return null;
            }
          default:
            return null;
        }
      };

      const toastMessage = getToastMessage();
      if (toastMessage) {
        toast(toastMessage);
      }
    }
  }, [autoInvalidateQueries, showToasts, user, toast]);

  // Set up real-time subscriptions
  const setupSubscriptions = useCallback(() => {
    if (!enabled || !user || subscriptions.length === 0) return;

    // Create a channel for the user
    const channelName = `user_updates_${user.id}`;
    const channel = supabase.channel(channelName);

    // Add subscriptions to the channel
    subscriptions.forEach(subscription => {
      const {
        table,
        event = '*',
        schema = 'public',
        filter,
        callback
      } = subscription;

      let filterString = `user_id=eq.${user.id}`;
      if (filter) {
        filterString += ` AND ${filter}`;
      }

      // Special handling for tables that might not have user_id
      if (table === 'daily_verses') {
        filterString = `user_id=eq.${user.id}`;
      } else if (table === 'profiles') {
        filterString = `user_id=eq.${user.id}`;
      }

      channel.on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          filter: filterString
        },
        (payload) => handleRealtimeChange(table, payload, callback)
      );
    });

    // Handle channel status changes
    channel.on('system', {}, (status) => {
      console.log('Realtime channel status:', status);
      if (onConnectionChange) {
        onConnectionChange(status.status);
      }
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`Realtime subscription status: ${status}`);
      
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to real-time updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Failed to subscribe to real-time updates');
        
        if (showToasts) {
          toast({
            title: 'Connection Issue',
            description: 'Real-time updates may be delayed. Check your connection.',
            variant: 'destructive'
          });
        }
      }

      if (onConnectionChange) {
        onConnectionChange(status);
      }
    });

    channelRef.current = channel;
    subscriptionsRef.current = subscriptions;
  }, [enabled, user, subscriptions, handleRealtimeChange, onConnectionChange, showToasts, toast]);

  // Clean up subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up real-time subscriptions');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  // Set up subscriptions when dependencies change
  useEffect(() => {
    // Clean up existing subscriptions
    cleanupSubscriptions();

    // Set up new subscriptions
    if (enabled && user && subscriptions.length > 0) {
      setupSubscriptions();
    }

    return cleanupSubscriptions;
  }, [enabled, user, subscriptions, setupSubscriptions, cleanupSubscriptions]);

  // Manual refresh function
  const refreshData = useCallback(() => {
    if (user && autoInvalidateQueries) {
      // Invalidate all user-related queries
      invalidateQueries.profile(user.id);
      invalidateQueries.conversations(user.id);
      invalidateQueries.journalEntries(user.id);
      invalidateQueries.prayerRequests(user.id);
      invalidateQueries.bookmarks(user.id);
      invalidateQueries.analytics(user.id);
    }
  }, [user, autoInvalidateQueries]);

  return {
    refreshData,
    isConnected: channelRef.current !== null,
    cleanup: cleanupSubscriptions
  };
}

// Convenience hook for dashboard real-time updates
export function useDashboardRealtimeUpdates(options?: UseRealtimeOptions) {
  const subscriptions: RealtimeSubscription[] = [
    {
      table: 'profiles',
      event: 'UPDATE'
    },
    {
      table: 'ai_conversations',
      event: '*'
    },
    {
      table: 'journal_entries',
      event: '*'
    },
    {
      table: 'prayer_requests',
      event: '*'
    },
    {
      table: 'bookmarks',
      event: '*'
    },
    {
      table: 'daily_verses',
      event: 'INSERT'
    },
    {
      table: 'reading_progress',
      event: 'UPDATE'
    }
  ];

  return useRealtimeUpdates(subscriptions, {
    showToasts: true,
    autoInvalidateQueries: true,
    ...options
  });
}

// Convenience hook for chat real-time updates
export function useChatRealtimeUpdates(conversationId?: string, options?: UseRealtimeOptions) {
  const subscriptions: RealtimeSubscription[] = conversationId ? [
    {
      table: 'ai_conversations',
      event: 'UPDATE',
      filter: `id=eq.${conversationId}`,
      callback: (payload) => {
        console.log('Chat conversation updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      }
    }
  ] : [];

  return useRealtimeUpdates(subscriptions, {
    showToasts: false,
    autoInvalidateQueries: true,
    ...options
  });
}

// Convenience hook for journal real-time updates
export function useJournalRealtimeUpdates(options?: UseRealtimeOptions) {
  const subscriptions: RealtimeSubscription[] = [
    {
      table: 'journal_entries',
      event: '*',
      callback: (payload) => {
        console.log('Journal entry updated:', payload);
      }
    }
  ];

  return useRealtimeUpdates(subscriptions, {
    showToasts: true,
    autoInvalidateQueries: true,
    ...options
  });
}

// Convenience hook for prayer real-time updates
export function usePrayerRealtimeUpdates(options?: UseRealtimeOptions) {
  const subscriptions: RealtimeSubscription[] = [
    {
      table: 'prayer_requests',
      event: '*',
      callback: (payload) => {
        console.log('Prayer request updated:', payload);
        
        // Special handling for answered prayers
        if (payload.eventType === 'UPDATE' && payload.new.status === 'answered') {
          console.log('Prayer answered! 🙏');
        }
      }
    }
  ];

  return useRealtimeUpdates(subscriptions, {
    showToasts: true,
    autoInvalidateQueries: true,
    ...options
  });
}

// Hook for connection status monitoring
export function useRealtimeConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR' | 'CONNECTING'>('CONNECTING');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleConnectionChange = useCallback((status: typeof connectionStatus) => {
    setConnectionStatus(status);
  }, []);

  // Use a dummy subscription just to monitor connection
  useRealtimeUpdates([], {
    enabled: true,
    onConnectionChange: handleConnectionChange
  });

  return {
    connectionStatus,
    isOnline,
    isConnected: connectionStatus === 'SUBSCRIBED' && isOnline
  };
} 