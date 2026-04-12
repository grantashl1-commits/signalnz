-- Rate limiting table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  function_name text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_identifier, function_name, window_start)
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (user_identifier, function_name, window_start);

-- Auto-cleanup: delete windows older than 24 hours
CREATE INDEX idx_rate_limits_cleanup ON public.rate_limits (window_start);

-- RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate_limits"
  ON public.rate_limits FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own rate limits"
  ON public.rate_limits FOR SELECT
  TO authenticated
  USING (user_identifier = (auth.uid())::text);

-- Atomic rate limit check function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id text,
  _function_name text,
  _max_per_minute integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window timestamptz;
  _count integer;
  _allowed boolean;
BEGIN
  -- Round to current minute
  _window := date_trunc('minute', now());

  -- Upsert: increment or insert
  INSERT INTO public.rate_limits (user_identifier, function_name, window_start, request_count)
  VALUES (_user_id, _function_name, _window, 1)
  ON CONFLICT (user_identifier, function_name, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO _count;

  _allowed := _count <= _max_per_minute;

  -- Clean up old windows (older than 1 hour) opportunistically
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 hour';

  RETURN jsonb_build_object(
    'allowed', _allowed,
    'current_count', _count,
    'limit', _max_per_minute,
    'window_start', _window
  );
END;
$$;