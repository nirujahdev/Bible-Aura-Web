# AI Usage Tracking System Improvements

## Overview
Improved the AI response limitation and conversation tracking system to fix several critical issues with usage tracking and conversation management.

## Problems Fixed

### 1. **Race Conditions**
- **Problem**: Usage was checked before API call, then incremented after. Multiple rapid requests could bypass limits.
- **Solution**: Implemented reservation system - usage is reserved (incremented) BEFORE API call, confirmed after success, or rolled back on failure.

### 2. **No Rollback on API Failure**
- **Problem**: If API call failed, usage was still incremented, wasting user's daily limit.
- **Solution**: Added `rollbackUsage()` function that decrements usage if API call fails.

### 3. **Conversation Linking Issues**
- **Problem**: `conversation_id` in message logs was often null or incorrect, making it hard to track conversations.
- **Solution**: Automatic conversation creation and linking during usage confirmation. All message logs now properly linked to conversations.

### 4. **Inconsistent Tracking**
- **Problem**: Multiple components tracked usage independently, leading to inconsistencies.
- **Solution**: Centralized tracking in `AIUsageTracker` class with atomic operations.

### 5. **Missing Database Function**
- **Problem**: No way to rollback usage increments.
- **Solution**: Added `decrement_ai_usage()` database function.

## New Architecture

### `AIUsageTracker` Class
A centralized service that handles:
- **Reservation**: Reserve usage before API call (atomic increment)
- **Confirmation**: Confirm usage after successful API call, create/link conversation, log messages
- **Rollback**: Decrement usage if API call fails
- **Conversation Management**: Automatic conversation creation and updates

### Workflow
```
1. User sends message
2. Check limit (read-only)
3. Reserve usage (increment in DB) → Get reservation_id
4. Call AI API
5a. If success → Confirm usage (link conversation, log messages)
5b. If failure → Rollback usage (decrement)
```

## Files Created/Modified

### New Files
1. **`src/lib/ai-usage-tracker.ts`**
   - New centralized usage tracking service
   - Handles reservation, confirmation, rollback
   - Manages conversation linking

2. **`database/AI_USAGE_TRACKING_IMPROVEMENTS.sql`**
   - Database migration
   - Adds `decrement_ai_usage()` function
   - Fixes bug in `check_and_increment_ai_usage()` (missing variable)
   - Adds indexes for better performance

### Modified Files
1. **`src/components/BibleAuraChat.tsx`**
   - Updated to use new `AIUsageTracker` system
   - Proper error handling with rollback
   - Automatic conversation linking

## Database Migration Required

**IMPORTANT**: Run the database migration before deploying:

```sql
-- Execute: database/AI_USAGE_TRACKING_IMPROVEMENTS.sql
```

This migration:
- Adds `decrement_ai_usage()` function for rollback
- Fixes bug in `check_and_increment_ai_usage()` function
- Adds performance indexes

## Benefits

1. **Accurate Usage Tracking**: No more lost usage on API failures
2. **Better Conversation Management**: All messages properly linked to conversations
3. **Race Condition Prevention**: Atomic operations prevent concurrent limit bypass
4. **Improved Analytics**: Better data for understanding user behavior
5. **Error Recovery**: Automatic rollback on failures

## Backward Compatibility

The old `ai-limits.ts` functions are still available for backward compatibility:
- `checkAndIncrementUsage()` → Now calls `AIUsageTracker.reserveUsage()`
- `getUsageInfo()` → Unchanged
- `isLimitReached()` → Unchanged

## Next Steps

1. **Apply Database Migration**: Run `database/AI_USAGE_TRACKING_IMPROVEMENTS.sql` in Supabase
2. **Update Other Components** (Optional): Other components using `ai-limits.ts` can be gradually migrated to use `AIUsageTracker` for better tracking
3. **Monitor**: Watch for any issues with the new system

## Testing Checklist

- [ ] User reaches daily limit - should block correctly
- [ ] API call fails - usage should be rolled back
- [ ] Multiple rapid requests - should not bypass limits
- [ ] Conversation linking - all messages should have conversation_id
- [ ] Conversation creation - new conversations created automatically
- [ ] Message logging - all message pairs logged correctly

