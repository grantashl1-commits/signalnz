
-- Add columns for background generation
ALTER TABLE public.plan_generations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS result_json jsonb,
  ADD COLUMN IF NOT EXISTS input_json jsonb,
  ADD COLUMN IF NOT EXISTS plan_category text NOT NULL DEFAULT 'movement';

-- Allow users to update own rows (to poll/receive results)
CREATE POLICY "Users can update own plan generations"
  ON public.plan_generations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role needs full access for edge functions to write results
CREATE POLICY "Service role manage plan_generations"
  ON public.plan_generations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
