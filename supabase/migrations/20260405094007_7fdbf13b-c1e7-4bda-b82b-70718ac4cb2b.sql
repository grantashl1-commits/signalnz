
-- Add date_of_birth to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Create signal_messages table
CREATE TABLE IF NOT EXISTS public.signal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  fable_title text,
  dao_verse text,
  dao_chapter text,
  sun_sign text,
  moon_phase text,
  cycle_phase text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.signal_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own messages" ON public.signal_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Members insert own messages" ON public.signal_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX signal_messages_user_id_idx ON public.signal_messages(user_id);
CREATE INDEX signal_messages_created_at_idx ON public.signal_messages(created_at DESC);
