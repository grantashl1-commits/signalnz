-- Lock down ai_credits: remove self-service writes so a signed-in member can
-- no longer set their own credits_remaining or tier. All legitimate writes go
-- through SECURITY DEFINER functions (deduct_ai_credits, sync_grant_credits,
-- grant_membership) or edge functions on the service-role key (stripe-webhook).
-- The client only ever SELECTs ai_credits (useAICredits.ts, Account.tsx).

DROP POLICY IF EXISTS "Users can insert own ai_credits" ON public.ai_credits;
DROP POLICY IF EXISTS "Users can update own ai_credits" ON public.ai_credits;

-- Belt-and-braces: strip table-level write grants from the authenticated role.
-- "Users can view own ai_credits" (SELECT) and "Service role manage ai_credits"
-- are left unchanged.
REVOKE INSERT, UPDATE ON public.ai_credits FROM authenticated;

-- deduct_ai_credits is SECURITY DEFINER and PUBLIC-executable by default, so a
-- signed-in member could invoke it against another user's id and drain them.
-- Every caller is an edge function running on the service-role key, so restrict
-- EXECUTE to service_role.
REVOKE EXECUTE ON FUNCTION public.deduct_ai_credits(text, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_ai_credits(text, integer, text) TO service_role;
