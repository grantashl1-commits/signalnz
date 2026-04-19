
-- ============================================================
-- 1. USER REPORTS
-- ============================================================
CREATE TABLE public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('profile', 'message', 'post', 'comment', 'nearby')),
  context_id uuid,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed_no_action', 'reviewed_warning', 'reviewed_suspended')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Same reporter can't report the same user for the same context twice
  UNIQUE (reporter_id, reported_user_id, context_type, context_id)
);

CREATE INDEX idx_user_reports_reported ON public.user_reports(reported_user_id, status);
CREATE INDEX idx_user_reports_status ON public.user_reports(status, created_at DESC);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports"
  ON public.user_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND auth.uid() <> reported_user_id);

CREATE POLICY "Users view own submitted reports"
  ON public.user_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins view all reports"
  ON public.user_reports FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage reports"
  ON public.user_reports FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 2. ACCOUNT SUSPENSIONS
-- ============================================================
CREATE TABLE public.account_suspensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suspended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  scope text NOT NULL DEFAULT 'community' CHECK (scope IN ('community', 'all')),
  expires_at timestamptz, -- NULL = permanent
  lifted_at timestamptz,
  lifted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_suspensions_user_active ON public.account_suspensions(user_id) WHERE lifted_at IS NULL;

ALTER TABLE public.account_suspensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own suspension"
  ON public.account_suspensions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage suspensions"
  ON public.account_suspensions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 3. SUSPENSION HELPER (security definer to avoid RLS recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_user_suspended(_user_id uuid, _scope text DEFAULT 'community')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_suspensions
    WHERE user_id = _user_id
      AND lifted_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
      AND (scope = 'all' OR scope = _scope)
  )
$$;

-- ============================================================
-- 4. APPLY SUSPENSION GATE TO COMMUNITY WRITES
-- ============================================================

-- community_messages: block INSERT if suspended
DROP POLICY IF EXISTS "Members can post in their groups" ON public.community_messages;
CREATE POLICY "Members can post in their groups"
  ON public.community_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_group_member(auth.uid(), group_id)
    AND NOT is_user_suspended(auth.uid())
  );

-- community_posts: block INSERT if suspended
DROP POLICY IF EXISTS "Authors insert own posts" ON public.community_posts;
CREATE POLICY "Authors insert own posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT is_user_suspended(auth.uid())
  );

-- community_comments: block INSERT if suspended
DROP POLICY IF EXISTS "Authors insert own comments" ON public.community_comments;
CREATE POLICY "Authors insert own comments"
  ON public.community_comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT is_user_suspended(auth.uid())
  );

-- ============================================================
-- 5. DISPOSABLE EMAIL BLOCKLIST
-- ============================================================
CREATE TABLE public.disposable_email_domains (
  domain text PRIMARY KEY,
  added_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disposable_email_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read disposable domains"
  ON public.disposable_email_domains FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage disposable domains"
  ON public.disposable_email_domains FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed with the most common 200+ disposable email providers
INSERT INTO public.disposable_email_domains (domain) VALUES
  ('mailinator.com'), ('guerrillamail.com'), ('guerrillamail.net'), ('guerrillamail.org'),
  ('guerrillamail.biz'), ('guerrillamail.de'), ('grr.la'), ('sharklasers.com'),
  ('tempmail.com'), ('temp-mail.org'), ('temp-mail.io'), ('tempmail.net'), ('tempmail.email'),
  ('10minutemail.com'), ('10minutemail.net'), ('10minutemail.org'), ('20minutemail.com'),
  ('30minutemail.com'), ('60minutemail.com'),
  ('throwawaymail.com'), ('throwaway.email'), ('throwam.com'),
  ('yopmail.com'), ('yopmail.net'), ('yopmail.fr'), ('cool.fr.nf'), ('jetable.fr.nf'),
  ('nospam.ze.tc'), ('nomail.xl.cx'), ('mega.zik.dj'), ('speed.1s.fr'),
  ('mohmal.com'), ('emailondeck.com'), ('emailfake.com'), ('email-fake.com'),
  ('fakeinbox.com'), ('fakemail.net'), ('fakemailgenerator.com'), ('fake-mail.ml'),
  ('disposable.com'), ('dispostable.com'), ('disposablemail.com'),
  ('maildrop.cc'), ('maildrop.com'), ('mailcatch.com'), ('mailnesia.com'),
  ('mailtemp.info'), ('mailtothis.com'), ('mailfa.tk'), ('mailforspam.com'),
  ('inboxbear.com'), ('mintemail.com'), ('mytemp.email'), ('mytrashmail.com'),
  ('trashmail.com'), ('trashmail.net'), ('trashmail.de'), ('trashmail.io'),
  ('trash-mail.com'), ('trbvm.com'), ('trbvn.com'),
  ('moakt.com'), ('moakt.cc'), ('moakt.ws'), ('inboxkitten.com'),
  ('getairmail.com'), ('airmail.cc'), ('airmail.tk'), ('aapt.net.au'),
  ('mt2014.com'), ('mt2015.com'), ('thankyou2010.com'), ('trash2009.com'),
  ('mailcuk.com'), ('mailproxsy.com'), ('mailsac.com'), ('mailtothis.com'),
  ('spambox.us'), ('spam4.me'), ('spamgourmet.com'), ('spamgourmet.net'),
  ('spamfree24.com'), ('spamfree24.de'), ('spamfree24.eu'), ('spamfree24.org'),
  ('binkmail.com'), ('bobmail.info'), ('chammy.info'), ('devnullmail.com'),
  ('letthemeatspam.com'), ('mailshell.com'), ('mailzilla.com'), ('mbx.cc'),
  ('mierdamail.com'), ('mintemail.com'), ('mt2009.com'), ('mt2014.com'),
  ('myemailboxy.com'), ('no-spam.ws'), ('nobulk.com'), ('noclickemail.com'),
  ('nomail.pw'), ('nomorespamemails.com'), ('nospamfor.us'), ('nospamthanks.info'),
  ('notmailinator.com'), ('nowmymail.com'), ('objectmail.com'), ('obobbo.com'),
  ('odaymail.com'), ('onewaymail.com'), ('onlatedotcom.info'), ('online.ms'),
  ('oopi.org'), ('ourklips.com'), ('outlawspam.com'), ('ovpn.to'),
  ('owlpic.com'), ('pancakemail.com'), ('plexolan.de'), ('poofy.org'),
  ('pookmail.com'), ('privymail.de'), ('proxymail.eu'), ('prtnx.com'),
  ('punkass.com'), ('putthisinyourspamdatabase.com'), ('quickinbox.com'),
  ('rcpt.at'), ('reallymymail.com'), ('recode.me'), ('regbypass.com'),
  ('rhyta.com'), ('rmqkr.net'), ('royal.net'), ('rtrtr.com'),
  ('s0ny.net'), ('safe-mail.net'), ('safetymail.info'), ('safetypost.de'),
  ('sandelf.de'), ('saynotospams.com'), ('selfdestructingmail.com'), ('sendspamhere.com'),
  ('shieldedmail.com'), ('shitmail.me'), ('shitware.nl'), ('shmeriously.com'),
  ('shortmail.net'), ('sibmail.com'), ('skeefmail.com'), ('slaskpost.se'),
  ('smashmail.de'), ('smellfear.com'), ('snakemail.com'), ('sneakemail.com'),
  ('snkmail.com'), ('sofimail.com'), ('sofort-mail.de'), ('sogetthis.com'),
  ('soodonims.com'), ('spam.la'), ('spam.su'), ('spamavert.com'), ('spambob.com'),
  ('spambob.net'), ('spambob.org'), ('spambog.com'), ('spambog.de'), ('spambog.ru'),
  ('spambooger.com'), ('spambox.info'), ('spambox.irishspringrealty.com'), ('spambox.us'),
  ('spamcero.com'), ('spamcon.org'), ('spamcorptastic.com'), ('spamcowboy.com'),
  ('spamcowboy.net'), ('spamcowboy.org'), ('spamday.com'), ('spamex.com'),
  ('spamfree.eu'), ('spamhereplease.com'), ('spamhole.com'), ('spamify.com'),
  ('spaminator.de'), ('spamkill.info'), ('spaml.com'), ('spaml.de'),
  ('spammotel.com'), ('spamobox.com'), ('spamoff.de'), ('spamslicer.com'),
  ('spamspot.com'), ('spamthis.co.uk'), ('spamthisplease.com'), ('spamtrail.com'),
  ('speedgaus.net'), ('spoofmail.de'), ('squizzy.de'), ('startkeys.com'),
  ('stinkefinger.net'), ('stop-my-spam.com'), ('stuffmail.de'), ('supergreatmail.com'),
  ('supermailer.jp'), ('superrito.com'), ('superstachel.de'), ('suremail.info'),
  ('teewars.org'), ('teleworm.com'), ('teleworm.us'), ('temp-mail.de'),
  ('tempemail.biz'), ('tempemail.com'), ('tempinbox.co.uk'), ('tempinbox.com'),
  ('tempmaildemand.com'), ('tempmailer.com'), ('tempmailer.de'), ('tempomail.fr'),
  ('temporarily.de'), ('temporarioemail.com.br'), ('temporaryemail.net'),
  ('temporaryforwarding.com'), ('temporaryinbox.com'), ('temporarymailaddress.com'),
  ('tempthe.net'), ('thanksnospam.info'), ('thankyou2010.com'), ('thecloudindex.com'),
  ('thisisnotmyrealemail.com'), ('thismail.net'), ('throwawayemailaddress.com'),
  ('toiea.com'), ('tradermail.info'), ('trashemail.de'), ('trashymail.com'),
  ('trashymail.net'), ('trialmail.de'), ('trillianpro.com'), ('tyldd.com'),
  ('uggsrock.com'), ('upliftnow.com'), ('uplipht.com'), ('venompen.com'),
  ('veryrealemail.com'), ('viditag.com'), ('viralplays.com'), ('vpn.st'),
  ('vsimcard.com'), ('vubby.com'), ('wasteland.rfc822.org'), ('webemail.me'),
  ('weg-werf-email.de'), ('wegwerf-emails.de'), ('wegwerfemail.com'), ('wegwerfemail.de'),
  ('wegwerfemailadresse.com'), ('wegwerfmail.de'), ('wegwerfmail.info'), ('wegwerfmail.net'),
  ('wegwerfmail.org'), ('wh4f.org'), ('whatpaas.com'), ('whyspam.me'),
  ('willhackforfood.biz'), ('willselfdestruct.com'), ('winemaven.info'), ('wronghead.com'),
  ('wuzup.net'), ('wuzupmail.net'), ('xagloo.com'), ('xemaps.com'),
  ('xents.com'), ('xmaily.com'), ('xoxy.net'), ('yep.it'),
  ('yogamaven.com'), ('yopmail.fr'), ('yopmail.net'), ('youmailr.com'),
  ('yuurok.com'), ('zehnminutenmail.de'), ('zetmail.com'), ('zippymail.info'),
  ('zoaxe.com'), ('zoemail.org'), ('mvrht.net'), ('h8s.org'),
  ('hidzz.com'), ('emltmp.com'), ('mailtemp.uk'), ('discard.email'),
  ('discardmail.com'), ('discardmail.de'), ('mailto.plus'), ('fexpost.com'),
  ('inboxbear.com'), ('emlhub.com'), ('emltmp.com'), ('vomoto.com')
ON CONFLICT (domain) DO NOTHING;
