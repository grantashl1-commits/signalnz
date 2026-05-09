
CREATE TABLE IF NOT EXISTS public.attachment_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  attachment_style TEXT,
  style_scores JSONB DEFAULT '{}',
  self_esteem_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.attachment_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
ON public.attachment_quiz_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
ON public.attachment_quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz results"
ON public.attachment_quiz_results FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX idx_attachment_quiz_user ON public.attachment_quiz_results(user_id);
