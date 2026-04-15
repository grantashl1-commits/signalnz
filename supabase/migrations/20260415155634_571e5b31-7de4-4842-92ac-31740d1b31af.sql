-- Create gift codes table
CREATE TABLE public.gift_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  purchaser_email TEXT NOT NULL,
  recipient_email TEXT,
  tier TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 3,
  stripe_session_id TEXT,
  stripe_product_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can look up gift codes for redemption"
  ON public.gift_codes FOR SELECT
  USING (true);

-- Delete test user and all related data
DELETE FROM public.profiles WHERE user_id = '657fd3b4-4605-4888-9765-8ab74faf9f02';
DELETE FROM public.habit_completions WHERE user_id = '657fd3b4-4605-4888-9765-8ab74faf9f02';
DELETE FROM public.cycle_logs WHERE user_id = '657fd3b4-4605-4888-9765-8ab74faf9f02';
DELETE FROM public.journal_entries WHERE user_id = '657fd3b4-4605-4888-9765-8ab74faf9f02';
DELETE FROM public.ai_credits WHERE user_identifier = '657fd3b4-4605-4888-9765-8ab74faf9f02';
DELETE FROM public.mindfulness_logs WHERE user_id = '657fd3b4-4605-4888-9765-8ab74faf9f02';
DELETE FROM public.nps_responses WHERE user_id = '657fd3b4-4605-4888-9765-8ab74faf9f02';
DELETE FROM auth.users WHERE id = '657fd3b4-4605-4888-9765-8ab74faf9f02';