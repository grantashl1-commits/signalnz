
-- Enable PostGIS for future radius queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- User locations table (stores suburb name + fuzzed coords only)
CREATE TABLE IF NOT EXISTS public.user_locations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suburb       TEXT NOT NULL,
  city         TEXT,
  fuzzed_lat   DOUBLE PRECISION NOT NULL,
  fuzzed_lng   DOUBLE PRECISION NOT NULL,
  is_visible   BOOLEAN DEFAULT true,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Row Level Security
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own location
CREATE POLICY "Users manage own location"
  ON public.user_locations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can see visible locations
CREATE POLICY "Authenticated users see visible locations"
  ON public.user_locations FOR SELECT
  TO authenticated
  USING (is_visible = true);

-- Add columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suburb TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_nearby_visible BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Enable realtime for user_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_locations;
