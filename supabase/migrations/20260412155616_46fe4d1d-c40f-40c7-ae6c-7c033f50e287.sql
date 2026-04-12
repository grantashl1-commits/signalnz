
-- Atomic credit deduction function — prevents race conditions
CREATE OR REPLACE FUNCTION public.deduct_ai_credits(
  p_user_identifier text,
  p_cost integer,
  p_function_name text DEFAULT 'unknown'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current integer;
  v_new integer;
BEGIN
  -- Lock the row and get current credits atomically
  SELECT credits_remaining INTO v_current
  FROM ai_credits
  WHERE user_identifier = p_user_identifier
  FOR UPDATE;

  -- If no row exists, create one with default free credits
  IF NOT FOUND THEN
    INSERT INTO ai_credits (user_identifier, credits_remaining, tier)
    VALUES (p_user_identifier, 5, 'free')
    ON CONFLICT DO NOTHING;
    
    -- Re-fetch with lock (handles race on insert)
    SELECT credits_remaining INTO v_current
    FROM ai_credits
    WHERE user_identifier = p_user_identifier
    FOR UPDATE;
  END IF;

  -- Check sufficient credits
  IF v_current IS NULL OR v_current < p_cost THEN
    RAISE EXCEPTION 'insufficient_credits' USING HINT = v_current::text;
  END IF;

  -- Deduct
  v_new := v_current - p_cost;
  UPDATE ai_credits
  SET credits_remaining = v_new, updated_at = now()
  WHERE user_identifier = p_user_identifier;

  -- Log usage
  INSERT INTO ai_usage (user_identifier, function_name, tokens_used)
  VALUES (p_user_identifier, p_function_name, p_cost);

  RETURN v_new;
END;
$$;
