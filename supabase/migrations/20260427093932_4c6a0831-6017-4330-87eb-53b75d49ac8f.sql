-- Add image_url column to chores so each task can have a child-friendly visual
ALTER TABLE public.parenting_chores
  ADD COLUMN IF NOT EXISTS image_url text;

-- Optional comment for clarity
COMMENT ON COLUMN public.parenting_chores.image_url IS 'AI-generated illustration shown alongside chore name on the chore chart and printable.';