
-- Reflection cards (private journal → AI organised → optional sharing)
CREATE TABLE public.connect_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES public.partner_connections(id) ON DELETE CASCADE,
  partner_role text NOT NULL DEFAULT 'member',
  raw_entry text NOT NULL,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  shared_keys text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connect_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both parties view reflections" ON public.connect_reflections FOR SELECT TO authenticated
  USING (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Partners insert own reflections" ON public.connect_reflections FOR INSERT TO authenticated
  WITH CHECK (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Partners update own reflections" ON public.connect_reflections FOR UPDATE TO authenticated
  USING (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

-- Anon policies for partner B
CREATE POLICY "Anon insert reflections" ON public.connect_reflections FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select reflections" ON public.connect_reflections FOR SELECT TO anon USING (true);
CREATE POLICY "Anon update reflections" ON public.connect_reflections FOR UPDATE TO anon USING (true);

-- Shared room responses (guided conversation)
CREATE TABLE public.connect_shared_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES public.partner_connections(id) ON DELETE CASCADE,
  reflection_id uuid REFERENCES public.connect_reflections(id) ON DELETE CASCADE,
  category text NOT NULL,
  partner_role text NOT NULL,
  acknowledgement text,
  response_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connection_id, reflection_id, category, partner_role)
);

ALTER TABLE public.connect_shared_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both parties view responses" ON public.connect_shared_responses FOR SELECT TO authenticated
  USING (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Partners insert responses" ON public.connect_shared_responses FOR INSERT TO authenticated
  WITH CHECK (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Anon insert responses" ON public.connect_shared_responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select responses" ON public.connect_shared_responses FOR SELECT TO anon USING (true);

-- Commitments (AI-generated next steps)
CREATE TABLE public.connect_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES public.partner_connections(id) ON DELETE CASCADE,
  next_step text NOT NULL,
  timeframe text NOT NULL,
  why text,
  committed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connect_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both parties view commitments" ON public.connect_commitments FOR SELECT TO authenticated
  USING (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Partners insert commitments" ON public.connect_commitments FOR INSERT TO authenticated
  WITH CHECK (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Anon insert commitments" ON public.connect_commitments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select commitments" ON public.connect_commitments FOR SELECT TO anon USING (true);

-- Weekly check-ins
CREATE TABLE public.connect_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES public.partner_connections(id) ON DELETE CASCADE,
  partner_role text NOT NULL DEFAULT 'member',
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  appreciation text,
  week_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connection_id, partner_role, week_key)
);

ALTER TABLE public.connect_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both parties view checkins" ON public.connect_checkins FOR SELECT TO authenticated
  USING (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Partners insert checkins" ON public.connect_checkins FOR INSERT TO authenticated
  WITH CHECK (connection_id IN (SELECT id FROM public.partner_connections WHERE member_user_id = auth.uid() OR partner_user_id = auth.uid()));

CREATE POLICY "Anon insert checkins" ON public.connect_checkins FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select checkins" ON public.connect_checkins FOR SELECT TO anon USING (true);
