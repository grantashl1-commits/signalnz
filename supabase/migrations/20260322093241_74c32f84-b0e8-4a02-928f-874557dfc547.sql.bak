
-- Community groups table with approval workflow
CREATE TABLE public.community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  suburb text NOT NULL,
  city text,
  country text DEFAULT 'NZ',
  group_type text NOT NULL DEFAULT 'suburb' CHECK (group_type IN ('suburb', 'interest')),
  parent_group_id uuid REFERENCES public.community_groups(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  description text,
  members_count integer DEFAULT 0,
  challenges jsonb DEFAULT '[]'::jsonb,
  questions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view approved groups
CREATE POLICY "Anyone can view approved groups"
ON public.community_groups FOR SELECT TO authenticated
USING (status = 'approved');

-- Users can view their own pending/rejected groups
CREATE POLICY "Users can view own group requests"
ON public.community_groups FOR SELECT TO authenticated
USING (created_by = auth.uid());

-- Authenticated users can submit group requests
CREATE POLICY "Users can create group requests"
ON public.community_groups FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Group memberships table
CREATE TABLE public.community_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memberships"
ON public.community_memberships FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can join groups"
ON public.community_memberships FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups"
ON public.community_memberships FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Seed existing mock groups as approved
INSERT INTO public.community_groups (id, name, suburb, city, country, group_type, status, description, challenges, questions, members_count)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Ponsonby', 'Ponsonby', 'Auckland', 'NZ', 'suburb', 'approved',
   'A warm corner of Ponsonby — sharing skills, walks, coffee dates and whatever the neighbourhood needs.',
   '["☕ Arrange a coffee date at a local café this week", "🚶 Organise a walk + talk in Western Park", "🌱 Share one skill you could teach someone nearby"]'::jsonb,
   '["What are you looking to get out of this community?", "In what ways could our neighbourhood come together?", "What services or skills can you offer?"]'::jsonb, 34),
  ('00000000-0000-0000-0000-000000000002', 'Grey Lynn', 'Grey Lynn', 'Auckland', 'NZ', 'suburb', 'approved',
   'Grey Lynn neighbours connecting, trading skills and looking out for each other.',
   '["☕ Find a coffee date in Grey Lynn", "🔧 Offer one skill swap this fortnight", "🌿 Organise a shared garden session"]'::jsonb,
   '["What drew you to Grey Lynn?", "What do you wish existed in our suburb?", "What''s something you could teach or offer?"]'::jsonb, 21),
  ('00000000-0000-0000-0000-000000000003', 'Newmarket', 'Newmarket', 'Auckland', 'NZ', 'suburb', 'approved',
   'Newmarket locals — busy suburb, but community is the thread that holds it together.',
   '["🛒 Do a favour for a neighbour this week", "🎨 Share a creative skill or project", "🏃 Organise a morning run group"]'::jsonb,
   '["What would make Newmarket feel more like a village?", "What professional skill could you share freely?", "How could we support each other through change?"]'::jsonb, 47);
