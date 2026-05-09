
-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals as referrer"
  ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Users can view own referrals as referred"
  ON public.referrals FOR SELECT TO authenticated
  USING (referred_user_id = auth.uid());

CREATE POLICY "Authenticated can insert referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (referred_user_id = auth.uid());

CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to generate referral code on profile creation
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  name_part TEXT;
BEGIN
  -- Use first 3 chars of display_name or 'SIG'
  name_part := UPPER(COALESCE(LEFT(REGEXP_REPLACE(NEW.display_name, '[^a-zA-Z]', '', 'g'), 3), 'SIG'));
  IF LENGTH(name_part) < 3 THEN
    name_part := 'SIG';
  END IF;
  -- Append random digits
  code := name_part || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) LOOP
    code := name_part || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;
  NEW.referral_code := code;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_referral_code();

-- Backfill existing profiles that lack a referral code
UPDATE public.profiles
SET referral_code = 'SIG' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE referral_code IS NULL;
