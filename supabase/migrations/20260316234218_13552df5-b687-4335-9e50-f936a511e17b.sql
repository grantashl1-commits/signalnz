
-- Allow authenticated users to update feedback status (for admin use on dashboard)
CREATE POLICY "Authenticated can update feedback"
ON public.feedback
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read all feedback (for dashboard)
CREATE POLICY "Authenticated can read all feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (true);
