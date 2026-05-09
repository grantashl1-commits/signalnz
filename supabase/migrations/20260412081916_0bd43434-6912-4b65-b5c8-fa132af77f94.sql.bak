
-- Partner connections table
CREATE TABLE public.partner_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_user_id UUID NOT NULL,
  partner_name TEXT,
  partner_pin_hash TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  partner_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  shared_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_connections ENABLE ROW LEVEL SECURITY;

-- Members can view their own connections
CREATE POLICY "Members can view own connections"
  ON public.partner_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = member_user_id);

-- Members can create connections
CREATE POLICY "Members can create connections"
  ON public.partner_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_user_id);

-- Members can update their own connections
CREATE POLICY "Members can update own connections"
  ON public.partner_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = member_user_id);

-- Allow anonymous/public read by join_code (for partner PIN verification)
CREATE POLICY "Anyone can read by join code"
  ON public.partner_connections FOR SELECT
  TO anon
  USING (true);

-- Connect messages table (AI coaching chat)
CREATE TABLE public.connect_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.partner_connections(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL DEFAULT 'member',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connect_messages ENABLE ROW LEVEL SECURITY;

-- Members can read messages for their connections
CREATE POLICY "Members can read own connection messages"
  ON public.connect_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_connections
      WHERE id = connection_id AND member_user_id = auth.uid()
    )
  );

-- Members can insert messages for their connections
CREATE POLICY "Members can insert messages"
  ON public.connect_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partner_connections
      WHERE id = connection_id AND member_user_id = auth.uid()
    )
  );

-- Allow anon to read/write messages (for partner PIN sessions)
CREATE POLICY "Anon can read messages"
  ON public.connect_messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert messages"
  ON public.connect_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.connect_messages;

-- Timestamp trigger
CREATE TRIGGER update_partner_connections_updated_at
  BEFORE UPDATE ON public.partner_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
