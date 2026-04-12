
-- 1. Fix workout_sessions: scope to own data only
DROP POLICY IF EXISTS "Authenticated can view all sessions for community" ON public.workout_sessions;

CREATE POLICY "Users can view own workout sessions"
ON public.workout_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix community_memberships: scope to own memberships or shared groups
DROP POLICY IF EXISTS "Users can view memberships" ON public.community_memberships;

CREATE POLICY "Users can view relevant memberships"
ON public.community_memberships FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR group_id IN (
    SELECT cm.group_id FROM public.community_memberships cm WHERE cm.user_id = auth.uid()
  )
);

-- 3. Fix challenge_participants: scope to own or shared challenges
DROP POLICY IF EXISTS "Authenticated read participants" ON public.challenge_participants;

CREATE POLICY "Users can view relevant challenge participants"
ON public.challenge_participants FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR challenge_id IN (
    SELECT cp.challenge_id FROM public.challenge_participants cp WHERE cp.user_id = auth.uid()
  )
);
