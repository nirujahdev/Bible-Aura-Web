-- Analytics Queries Examples
-- High-Value Data Insights Reports for Bible Aura

-- ========================================
-- 1. USER ENGAGEMENT REPORTS
-- ========================================

-- Daily Active Users
SELECT 
  DATE(message_timestamp) as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_messages,
  AVG(response_time_ms) as avg_response_time
FROM ai_message_logs
WHERE user_deleted = FALSE
  AND role = 'user'
GROUP BY DATE(message_timestamp)
ORDER BY date DESC
LIMIT 30;

-- User Retention Cohort Analysis
SELECT 
  DATE_TRUNC('month', p.created_at) as cohort_month,
  DATE_TRUNC('month', m.message_timestamp) as activity_month,
  COUNT(DISTINCT m.user_id) as active_users,
  EXTRACT(MONTH FROM AGE(m.message_timestamp, p.created_at)) as months_since_signup
FROM profiles p
JOIN ai_message_logs m ON p.user_id = m.user_id
WHERE m.user_deleted = FALSE
GROUP BY cohort_month, activity_month, months_since_signup
ORDER BY cohort_month DESC, months_since_signup;

-- Session Analytics
SELECT 
  DATE(session_start) as date,
  COUNT(*) as total_sessions,
  AVG(duration_seconds) as avg_duration_seconds,
  AVG(messages_count) as avg_messages_per_session,
  COUNT(*) FILTER (WHERE is_engaged = TRUE) * 100.0 / COUNT(*) as engagement_rate_percent
FROM user_sessions
WHERE session_end IS NOT NULL
GROUP BY DATE(session_start)
ORDER BY date DESC
LIMIT 30;

-- ========================================
-- 2. CONTENT & TOPIC REPORTS
-- ========================================

-- Most Asked Bible Questions
SELECT 
  content,
  COUNT(*) as frequency,
  mode,
  AVG(response_time_ms) as avg_response_time,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_message_logs
WHERE role = 'user' 
  AND user_deleted = FALSE
  AND LENGTH(content) > 10
GROUP BY content, mode
ORDER BY frequency DESC
LIMIT 100;

-- Popular Bible Verses Referenced
SELECT 
  bible_book_referenced as book,
  bible_chapter_referenced as chapter,
  bible_verse_referenced as verse,
  COUNT(*) as reference_count,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_message_logs
WHERE bible_book_referenced IS NOT NULL
  AND bible_chapter_referenced IS NOT NULL
  AND bible_verse_referenced IS NOT NULL
  AND user_deleted = FALSE
GROUP BY bible_book_referenced, bible_chapter_referenced, bible_verse_referenced
ORDER BY reference_count DESC
LIMIT 50;

-- Topic Analysis by Mode
SELECT 
  detected_topic as topic,
  mode,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(response_time_ms) as avg_response_time,
  AVG(
    CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END
  ) * 100 as positive_feedback_percent
FROM ai_message_logs
WHERE detected_topic IS NOT NULL
  AND user_deleted = FALSE
GROUP BY detected_topic, mode
ORDER BY usage_count DESC;

-- ========================================
-- 3. FEATURE USAGE REPORTS
-- ========================================

-- Chat Mode Popularity
SELECT 
  mode,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(message_length) as avg_message_length,
  AVG(response_time_ms) as avg_response_time
FROM ai_message_logs
WHERE role = 'user'
  AND user_deleted = FALSE
GROUP BY mode
ORDER BY usage_count DESC;

-- Feature Adoption Analysis
SELECT 
  feature_name,
  feature_category,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as sessions_used,
  AVG(CASE WHEN was_successful THEN 1 ELSE 0 END) * 100 as success_rate_percent
FROM feature_usage
GROUP BY feature_name, feature_category
ORDER BY usage_count DESC;

-- Feature Usage by Subscription Tier
SELECT 
  subscription_tier,
  feature_category,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM feature_usage
WHERE subscription_tier IS NOT NULL
GROUP BY subscription_tier, feature_category
ORDER BY subscription_tier, usage_count DESC;

-- ========================================
-- 4. QUALITY & PERFORMANCE REPORTS
-- ========================================

-- User Satisfaction Score
SELECT 
  DATE(feedback_timestamp) as date,
  feedback,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE(feedback_timestamp)) as percentage
FROM ai_message_logs
WHERE feedback IS NOT NULL
  AND feedback_timestamp IS NOT NULL
GROUP BY DATE(feedback_timestamp), feedback
ORDER BY date DESC, feedback;

-- AI Performance Metrics by Mode
SELECT 
  ai_mode,
  COUNT(*) as total_responses,
  AVG(response_time_ms) as avg_response_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time_ms,
  AVG(has_sources::int) * 100 as sources_usage_percent,
  AVG(has_validated_verses::int) * 100 as verses_usage_percent,
  AVG(CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END) * 100 as positive_feedback_percent
FROM ai_message_logs
WHERE role = 'assistant'
  AND user_deleted = FALSE
  AND ai_mode IS NOT NULL
GROUP BY ai_mode
ORDER BY total_responses DESC;

-- Content Quality Issues Report
SELECT 
  report_category,
  COUNT(*) as report_count,
  COUNT(DISTINCT user_id) as affected_users,
  AVG(EXTRACT(EPOCH FROM (report_resolved_at - report_timestamp))/3600) as avg_resolution_hours,
  COUNT(*) FILTER (WHERE report_resolved = TRUE) as resolved_count,
  COUNT(*) FILTER (WHERE report_resolved = FALSE) as pending_count
FROM ai_message_logs
WHERE is_reported = TRUE
GROUP BY report_category
ORDER BY report_count DESC;

-- ========================================
-- 5. DEMOGRAPHIC & GEOGRAPHIC REPORTS
-- ========================================

-- Usage by Geographic Region
SELECT 
  p.country,
  COUNT(DISTINCT m.user_id) as unique_users,
  COUNT(*) as total_messages,
  AVG(m.response_time_ms) as avg_response_time,
  AVG(p.age) as avg_age
FROM ai_message_logs m
JOIN profiles p ON m.user_id = p.user_id
WHERE m.user_deleted = FALSE
  AND p.country IS NOT NULL
GROUP BY p.country
ORDER BY unique_users DESC;

-- Ministry Role Analysis
SELECT 
  p.ministry_role,
  COUNT(DISTINCT m.user_id) as unique_users,
  COUNT(*) as total_messages,
  AVG(m.message_length) as avg_message_length,
  AVG(CASE WHEN m.feedback = 'positive' THEN 1 ELSE 0 END) * 100 as satisfaction_percent
FROM ai_message_logs m
JOIN profiles p ON m.user_id = p.user_id
WHERE m.user_deleted = FALSE
  AND p.ministry_role IS NOT NULL
GROUP BY p.ministry_role
ORDER BY unique_users DESC;

-- Demographic Segmentation
SELECT 
  p.gender,
  p.education_level,
  p.ministry_role,
  COUNT(DISTINCT m.user_id) as unique_users,
  COUNT(*) as total_messages,
  AVG(p.age) as avg_age
FROM ai_message_logs m
JOIN profiles p ON m.user_id = p.user_id
WHERE m.user_deleted = FALSE
GROUP BY p.gender, p.education_level, p.ministry_role
ORDER BY unique_users DESC;

-- ========================================
-- 6. CONVERSION & MONETIZATION REPORTS
-- ========================================

-- Conversion Funnel Analysis
SELECT 
  j.event_category,
  COUNT(DISTINCT j.user_id) as users,
  COUNT(*) as event_count,
  COUNT(*) FILTER (WHERE j.is_conversion_event = TRUE) as conversion_count,
  SUM(j.conversion_value) as total_conversion_value
FROM user_journey_events j
GROUP BY j.event_category
ORDER BY 
  CASE j.event_category
    WHEN 'acquisition' THEN 1
    WHEN 'activation' THEN 2
    WHEN 'engagement' THEN 3
    WHEN 'conversion' THEN 4
    WHEN 'retention' THEN 5
    ELSE 6
  END;

-- Messages Leading to Premium Conversion
SELECT 
  m.detected_topic,
  m.mode,
  COUNT(*) as message_count,
  COUNT(*) FILTER (WHERE m.led_to_premium_signup = TRUE) as led_to_premium,
  AVG(m.response_time_ms) as avg_response_time
FROM ai_message_logs m
WHERE m.led_to_premium_signup = TRUE
  OR m.user_subscription_tier_at_message = 'premium'
GROUP BY m.detected_topic, m.mode
ORDER BY led_to_premium DESC;

-- Customer Lifetime Value by Segment
SELECT 
  p.subscription_tier,
  p.ministry_role,
  COUNT(DISTINCT p.user_id) as user_count,
  AVG(p.lifetime_value) as avg_lifetime_value,
  SUM(p.lifetime_value) as total_revenue,
  AVG(EXTRACT(EPOCH FROM (NOW() - p.created_at))/86400) as avg_days_active
FROM profiles p
WHERE p.lifetime_value > 0
GROUP BY p.subscription_tier, p.ministry_role
ORDER BY avg_lifetime_value DESC;

-- ========================================
-- 7. ACQUISITION & RETENTION REPORTS
-- ========================================

-- Acquisition Source Analysis
SELECT 
  p.referral_source,
  p.utm_source,
  p.utm_medium,
  p.utm_campaign,
  COUNT(DISTINCT p.user_id) as signups,
  COUNT(DISTINCT m.user_id) as active_users,
  COUNT(*) as total_messages,
  AVG(p.lifetime_value) as avg_lifetime_value
FROM profiles p
LEFT JOIN ai_message_logs m ON p.user_id = m.user_id AND m.user_deleted = FALSE
WHERE p.referral_source IS NOT NULL
GROUP BY p.referral_source, p.utm_source, p.utm_medium, p.utm_campaign
ORDER BY signups DESC;

-- Device & Platform Analysis
SELECT 
  p.device_type,
  p.os_type,
  p.browser_type,
  COUNT(DISTINCT p.user_id) as unique_users,
  COUNT(*) as total_messages,
  AVG(s.duration_seconds) as avg_session_duration
FROM profiles p
JOIN ai_message_logs m ON p.user_id = m.user_id
LEFT JOIN user_sessions s ON m.session_id = s.id
WHERE m.user_deleted = FALSE
GROUP BY p.device_type, p.os_type, p.browser_type
ORDER BY unique_users DESC;

-- Retention Predictors
SELECT 
  p.subscription_tier,
  COUNT(DISTINCT p.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN m.message_timestamp >= NOW() - INTERVAL '30 days' THEN p.user_id END) as active_30d,
  COUNT(DISTINCT CASE WHEN m.message_timestamp >= NOW() - INTERVAL '7 days' THEN p.user_id END) as active_7d,
  AVG(f.usage_count) as avg_feature_usage
FROM profiles p
LEFT JOIN ai_message_logs m ON p.user_id = m.user_id AND m.user_deleted = FALSE
LEFT JOIN (
  SELECT user_id, COUNT(*) as usage_count
  FROM feature_usage
  GROUP BY user_id
) f ON p.user_id = f.user_id
GROUP BY p.subscription_tier
ORDER BY 
  CASE p.subscription_tier
    WHEN 'enterprise' THEN 1
    WHEN 'premium' THEN 2
    WHEN 'basic' THEN 3
    WHEN 'free' THEN 4
  END;

-- ========================================
-- 8. ADVANCED ANALYTICS REPORTS
-- ========================================

-- Peak Usage Hours Analysis
SELECT 
  EXTRACT(HOUR FROM message_timestamp) as hour_of_day,
  EXTRACT(DOW FROM message_timestamp) as day_of_week,
  COUNT(*) as message_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(response_time_ms) as avg_response_time
FROM ai_message_logs
WHERE user_deleted = FALSE
  AND role = 'user'
GROUP BY EXTRACT(HOUR FROM message_timestamp), EXTRACT(DOW FROM message_timestamp)
ORDER BY day_of_week, hour_of_day;

-- Content Engagement Analysis (Messages leading to actions)
SELECT 
  m.detected_topic,
  COUNT(*) as message_count,
  COUNT(*) FILTER (WHERE m.led_to_bookmark = TRUE) as led_to_bookmark,
  COUNT(*) FILTER (WHERE m.led_to_favorite = TRUE) as led_to_favorite,
  COUNT(*) FILTER (WHERE m.led_to_share = TRUE) as led_to_share,
  COUNT(*) FILTER (WHERE m.led_to_premium_signup = TRUE) as led_to_premium,
  AVG(m.response_time_ms) as avg_response_time
FROM ai_message_logs m
WHERE m.detected_topic IS NOT NULL
  AND m.user_deleted = FALSE
GROUP BY m.detected_topic
HAVING COUNT(*) > 10
ORDER BY 
  (COUNT(*) FILTER (WHERE m.led_to_bookmark = TRUE) +
   COUNT(*) FILTER (WHERE m.led_to_favorite = TRUE) +
   COUNT(*) FILTER (WHERE m.led_to_share = TRUE) +
   COUNT(*) FILTER (WHERE m.led_to_premium_signup = TRUE) * 10) DESC;

-- Session Quality Analysis
SELECT 
  s.device_type,
  s.country,
  COUNT(*) as session_count,
  AVG(s.duration_seconds) as avg_duration,
  AVG(s.messages_count) as avg_messages,
  AVG(s.engagement_score) as avg_engagement_score,
  COUNT(*) FILTER (WHERE s.is_engaged = TRUE) * 100.0 / COUNT(*) as engagement_rate_percent,
  COUNT(*) FILTER (WHERE s.is_bounce = TRUE) * 100.0 / COUNT(*) as bounce_rate_percent
FROM user_sessions s
WHERE s.session_end IS NOT NULL
  AND s.duration_seconds IS NOT NULL
GROUP BY s.device_type, s.country
ORDER BY session_count DESC;

-- User Journey Funnel (Signup to Premium)
SELECT 
  j.event_type,
  j.event_category,
  COUNT(DISTINCT j.user_id) as users_reached,
  COUNT(*) as event_count,
  AVG(j.days_since_signup) as avg_days_since_signup
FROM user_journey_events j
WHERE j.event_category IN ('acquisition', 'activation', 'engagement', 'conversion')
GROUP BY j.event_type, j.event_category
ORDER BY 
  CASE j.event_category
    WHEN 'acquisition' THEN 1
    WHEN 'activation' THEN 2
    WHEN 'engagement' THEN 3
    WHEN 'conversion' THEN 4
  END,
  users_reached DESC;

-- ========================================
-- 9. BUSINESS INTELLIGENCE REPORTS
-- ========================================

-- Revenue by User Segment
SELECT 
  p.subscription_tier,
  p.country,
  p.ministry_role,
  COUNT(DISTINCT p.user_id) as user_count,
  SUM(p.lifetime_value) as total_revenue,
  AVG(p.lifetime_value) as avg_revenue_per_user,
  COUNT(*) FILTER (WHERE p.subscription_tier != 'free') * 100.0 / COUNT(*) as conversion_rate
FROM profiles p
GROUP BY p.subscription_tier, p.country, p.ministry_role
HAVING COUNT(DISTINCT p.user_id) > 5
ORDER BY total_revenue DESC;

-- Feature ROI Analysis
SELECT 
  f.feature_name,
  f.feature_category,
  COUNT(DISTINCT f.user_id) as users_used,
  COUNT(*) as total_usage,
  COUNT(DISTINCT CASE WHEN p.subscription_tier != 'free' THEN f.user_id END) as premium_users_used,
  AVG(CASE WHEN p.subscription_tier != 'free' THEN 1 ELSE 0 END) * 100 as premium_usage_percent
FROM feature_usage f
LEFT JOIN profiles p ON f.user_id = p.user_id
GROUP BY f.feature_name, f.feature_category
ORDER BY users_used DESC;

-- Top Performing Content (Highest Satisfaction)
SELECT 
  m.detected_topic,
  m.mode,
  COUNT(*) as message_count,
  AVG(CASE WHEN m.feedback = 'positive' THEN 1.0 ELSE 0.0 END) * 100 as satisfaction_percent,
  AVG(m.response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE m.led_to_premium_signup = TRUE) as premium_conversions
FROM ai_message_logs m
WHERE m.detected_topic IS NOT NULL
  AND m.user_deleted = FALSE
  AND m.role = 'assistant'
GROUP BY m.detected_topic, m.mode
HAVING COUNT(*) > 20
ORDER BY satisfaction_percent DESC, premium_conversions DESC
LIMIT 20;

