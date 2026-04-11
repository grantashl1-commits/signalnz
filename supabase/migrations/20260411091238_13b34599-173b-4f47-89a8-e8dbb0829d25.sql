
CREATE TABLE public.feed_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_number integer NOT NULL,
  post_title_description text NOT NULL,
  book_title_author text NOT NULL,
  themes text[] NOT NULL DEFAULT '{}',
  been_published boolean NOT NULL DEFAULT false,
  publish_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feed posts"
  ON public.feed_posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage feed posts"
  ON public.feed_posts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_feed_posts_publish_date ON public.feed_posts (publish_date);
CREATE INDEX idx_feed_posts_post_number ON public.feed_posts (post_number);
