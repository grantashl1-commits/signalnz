
-- User insight profiles built from journal entries
CREATE TABLE IF NOT EXISTS public.user_insight_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL UNIQUE,
  emotional_patterns jsonb DEFAULT '[]'::jsonb,
  recurring_topics jsonb DEFAULT '[]'::jsonb,
  common_stressors jsonb DEFAULT '[]'::jsonb,
  growth_interests jsonb DEFAULT '[]'::jsonb,
  preferred_guidance_tone text DEFAULT 'warm',
  recommended_resources jsonb DEFAULT '[]'::jsonb,
  entry_count int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Signal memory — past signals stored for reference
CREATE TABLE IF NOT EXISTS public.signal_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  signal_text text NOT NULL,
  headline text,
  theme text,
  emotional_context text,
  prompt text,
  mode text,
  created_at timestamptz DEFAULT now()
);

-- AI usage tracking
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  function_name text NOT NULL,
  tokens_used int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- AI credits per user
CREATE TABLE IF NOT EXISTS public.ai_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL UNIQUE,
  credits_remaining int DEFAULT 20,
  tier text DEFAULT 'free',
  last_topup_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_insight_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on user_insight_profiles" ON public.user_insight_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on signal_memory" ON public.signal_memory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ai_usage" ON public.ai_usage FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ai_credits" ON public.ai_credits FOR ALL USING (true) WITH CHECK (true);
