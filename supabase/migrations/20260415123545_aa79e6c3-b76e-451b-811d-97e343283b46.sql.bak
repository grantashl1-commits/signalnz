
-- Table to track each partner's course progress independently
CREATE TABLE public.connect_partner_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES public.partner_connections(id) ON DELETE CASCADE,
  partner_role text NOT NULL DEFAULT 'member',
  module_id text NOT NULL,
  lesson_id text NOT NULL,
  activity_id text NOT NULL,
  activity_type text NOT NULL DEFAULT 'unknown',
  response jsonb DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  shared_to_partner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connection_id, partner_role, activity_id)
);

ALTER TABLE public.connect_partner_progress ENABLE ROW LEVEL SECURITY;

-- Both connected parties can view progress for their connection
CREATE POLICY "Both parties can view course progress"
  ON public.connect_partner_progress FOR SELECT TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.partner_connections
    WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
  ));

-- Both parties can insert/update their own progress
CREATE POLICY "Partners can insert own progress"
  ON public.connect_partner_progress FOR INSERT TO authenticated
  WITH CHECK (connection_id IN (
    SELECT id FROM public.partner_connections
    WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
  ));

CREATE POLICY "Partners can update own progress"
  ON public.connect_partner_progress FOR UPDATE TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.partner_connections
    WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()
  ));

-- Allow anon access for partner B (no account)
CREATE POLICY "Anon can insert progress"
  ON public.connect_partner_progress FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can select progress"
  ON public.connect_partner_progress FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can update progress"
  ON public.connect_partner_progress FOR UPDATE TO anon
  USING (true);
