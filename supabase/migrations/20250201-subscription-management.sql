-- Add subscription management tables
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    plan_id TEXT NOT NULL DEFAULT 'free',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'trialing', 'inactive')),
    CONSTRAINT subscriptions_plan_check CHECK (plan_id IN ('free', 'pro', 'supporter', 'partner'))
);

-- Add usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resource_type TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    reset_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT usage_tracking_resource_check CHECK (resource_type IN ('ai_chat', 'ai_analysis', 'journal_entries', 'audio_sermons')),
    UNIQUE(user_id, resource_type)
);

-- Add payment history table
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    amount INTEGER NOT NULL, -- amount in cents
    currency TEXT NOT NULL DEFAULT 'lkr',
    status TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT payment_history_status_check CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage tracking" ON public.usage_tracking
    FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view their payment history" ON public.payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert payments" ON public.payment_history
    FOR INSERT WITH CHECK (true);

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_id TEXT,
    status TEXT,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_id,
        s.status,
        s.current_period_end,
        s.cancel_at_period_end
    FROM public.subscriptions s
    WHERE s.user_id = user_uuid
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
    user_uuid UUID, 
    resource TEXT, 
    plan TEXT DEFAULT 'free'
)
RETURNS TABLE (
    can_use BOOLEAN,
    current_usage INTEGER,
    limit_amount INTEGER,
    reset_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    usage_record RECORD;
    monthly_limit INTEGER;
BEGIN
    -- Define limits per plan
    CASE 
        WHEN plan = 'free' THEN
            CASE resource
                WHEN 'ai_chat' THEN monthly_limit := 5;
                WHEN 'ai_analysis' THEN monthly_limit := 2;
                WHEN 'journal_entries' THEN monthly_limit := 5;
                WHEN 'audio_sermons' THEN monthly_limit := 5;
                ELSE monthly_limit := 0;
            END CASE;
        WHEN plan = 'pro' THEN
            CASE resource
                WHEN 'ai_chat' THEN monthly_limit := 50;
                WHEN 'ai_analysis' THEN monthly_limit := 20;
                WHEN 'journal_entries' THEN monthly_limit := 50;
                WHEN 'audio_sermons' THEN monthly_limit := 20;
                ELSE monthly_limit := 0;
            END CASE;
        WHEN plan = 'supporter' THEN
            CASE resource
                WHEN 'ai_chat' THEN monthly_limit := 100;
                WHEN 'ai_analysis' THEN monthly_limit := 50;
                WHEN 'journal_entries' THEN monthly_limit := 100;
                WHEN 'audio_sermons' THEN monthly_limit := 50;
                ELSE monthly_limit := 0;
            END CASE;
        WHEN plan = 'partner' THEN
            monthly_limit := -1; -- Unlimited
        ELSE
            monthly_limit := 0;
    END CASE;
    
    -- Get or create usage record
    SELECT * INTO usage_record
    FROM public.usage_tracking 
    WHERE user_id = user_uuid AND resource_type = resource;
    
    IF NOT FOUND THEN
        INSERT INTO public.usage_tracking (user_id, resource_type, usage_count, reset_date)
        VALUES (user_uuid, resource, 0, DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
        RETURNING * INTO usage_record;
    END IF;
    
    -- Check if we need to reset monthly usage
    IF usage_record.reset_date <= NOW() THEN
        UPDATE public.usage_tracking 
        SET usage_count = 0, 
            reset_date = DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
            updated_at = NOW()
        WHERE user_id = user_uuid AND resource_type = resource;
        
        usage_record.usage_count := 0;
        usage_record.reset_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
    END IF;
    
    -- Return usage check result
    RETURN QUERY SELECT 
        CASE 
            WHEN monthly_limit = -1 THEN TRUE -- Unlimited
            ELSE usage_record.usage_count < monthly_limit
        END,
        usage_record.usage_count,
        monthly_limit,
        usage_record.reset_date;
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
    user_uuid UUID, 
    resource TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.usage_tracking (user_id, resource_type, usage_count, reset_date)
    VALUES (user_uuid, resource, 1, DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
    ON CONFLICT (user_id, resource_type) 
    DO UPDATE SET 
        usage_count = usage_tracking.usage_count + 1,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$; 