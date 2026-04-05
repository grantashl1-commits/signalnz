
DROP POLICY IF EXISTS "Authenticated can report" ON public.moderation_queue;
CREATE POLICY "Authenticated can report"
  ON public.moderation_queue FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);
