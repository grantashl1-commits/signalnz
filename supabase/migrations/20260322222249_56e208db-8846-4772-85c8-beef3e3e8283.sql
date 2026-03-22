CREATE TABLE public.dream_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  board_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  active_board_id text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dream boards"
  ON public.dream_boards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dream boards"
  ON public.dream_boards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dream boards"
  ON public.dream_boards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE UNIQUE INDEX dream_boards_user_id_idx ON public.dream_boards (user_id);