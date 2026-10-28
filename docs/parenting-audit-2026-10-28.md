# Parenting course audit — 28 October 2026

## Implementation update — 28 October 2026

The findings and appendix below describe the original audit baseline, not the updated implementation. Fixes are now applied locally:

- Adapted all 19 single-choice and nine survey payloads; all 19 true/false activities now grade their authored answer and allow retry. Ordering exercises check the authored order; script exercises show suggested wording.
- Course writes are durable locally before completion is awarded, with a pending cloud queue, reconnect/reopen retry, paginated answer restoration and account-scope guards. Tests cover failed uploads, account switching, edits during restore/upload, legacy progress and storage failure. Authentication also starts a non-blocking queue flush.
- Reflections retain local drafts, restore saved answers, support editing and a dated latest practice check-in, and appear in a personal reflection viewer. Removed the false couple's-vault message. Drafts remain device-local; submitted responses sync through course progress.
- Corrected the six misplaced activities, placed the coming-out scenario in the identity lesson, and added a written play plan to Sensory Milestones & Tummy Time. Current library: 45 modules, 114 lessons, 445 activities, including 48 written reflections.
- Corrected flagged prescriptive feeding/sleep wording, fixed-calendar developmental claims and the self-harm response wording. These edits draw on [Plunket newborn sleep guidance](https://www.plunket.org.nz/child-development/sleep/newborn-sleep/newborn-to-3-months/), [Plunket bottle-feeding guidance](https://www.plunket.org.nz/caring-for-your-child/feeding/bottle-feeding/) and [KidsHealth NZ self-harm guidance](https://www.kidshealth.org.nz/self-harm). This does not constitute clinical review of the entire course.
- Added last-lesson resume, first-unfinished activity restore after loading, course-scoped counts/XP, a fallback duration estimate, direct toolkit lesson links and the toddler schedule end-state fix. Toolkit labels now describe available lesson activities rather than nonexistent posters/downloads.

Changed knowledge checks and replaced activities use new `-v2` IDs so old completion ticks cannot certify a corrected activity. Existing historical rows are retained; members will need to redo these checks. Unchanged activities retain their IDs. The unused Gentle Anchor data remains separate and is not presented as the live course.

Validation: the full suite passed 345 tests before the final three page-level tests were added; the three additional page-level tests also pass (348 total across runs). All 445 current activity payloads render in jsdom. TypeScript passes. The production build succeeds, with existing bundle-size warnings. Regression tests replace the old defect-confirmation probes; the original JSON evidence remains unchanged. `audit-parenting.mjs` now writes a separate current inventory, and `audit-parenting-render.mjs` runs the current rendering regressions.

Live follow-up: the owner supplied an authorised member login. The Thriving membership successfully opened the course. In the deployed first newborn lesson, duration renders as `~ min`; opening activity 4 (the single-choice activity) crashes into the application error boundary before an answer is submitted. This confirms the render defect in the live member journey. Screenshot: [live activity error](parenting-live-choice-error-2026-10-28.png). No answers, reflections or completion records were submitted. Credentials are not stored in project files. Local fixes are not deployed by this work.

Still required before claiming production readiness: live save/restore, offline/reconnect and cross-device verification after deployment; a qualified NZ health/development content review. The membership gate was accessed through normal authorised login. Practice check-ins are self-reported and do not establish skill mastery.

## Verdict

There is a substantial course library, but it is **not yet reliable as a complete learning journey**. Every lesson contains authored activities; that does not mean every activity works, every exercise matches its lesson, or saved work can be recovered. Do not mark this course ready on the strength of completion percentages alone.

## Scope and evidence

- Live URL: https://signal.mindcast.co.nz/parenting. The audit browser displays **“Thriving plan required”**. No paywall bypass, subscription change, real member answers, or production progress writes were performed.
- Inspected the routed ParentingCoursePage, all 114 lessons' activity inventory, all 13 used activity renderers, LessonPlayer, local/cloud course-progress code, and the table migration. Checked lesson/activity topic alignment and selected substantive claims; **this is not a clinical validation of every statement or every cited book**.
- Executed initial React server-render probes for all 443 activities using their real authored payloads and the same carousel conversion as ActivityRenderer. These reproduce component failures; they are not 443 live-browser interaction tests.
- Four isolated UI/mocked-cloud probes reproduce false true/false feedback, missing answers on reopening, missing cloud retry, and late cross-account cache writes. Their passing assertions confirm defects, not readiness.
- Source was checked against origin/main for the parenting/player/progress files: no differences. The shared checkout advanced during work; final observed HEAD was e1447153. No product code was changed for this audit.
- Reproduce: `node scripts/audit-parenting.mjs`; `node scripts/audit-parenting-render.mjs`; `node node_modules/vitest/vitest.mjs run --config scripts/audit-parenting.vitest.config.ts`.
- Detailed evidence: `parenting-audit-inventory-2026-10-28.json` and `parenting-audit-render-2026-10-28.json` in this directory. The appendix lists every lesson's structural result.

## What exists and works in the inspected implementation

| Course | Modules | Lessons | Activities |
| --- | ---: | ---: | ---: |
| Babies | 7 | 17 | 59 |
| Toddlers | 14 | 28 | 112 |
| Kids & Teens | 24 | 69 | 272 |
| Total | 45 | 114 | 443 |

- No empty lessons and no duplicate module, lesson or activity IDs within the routed parenting courses.
- All 13 authored activity types have renderer branches; no missing-type “coming soon” branch is needed for the current parenting data.
- 115 teaching carousels, 70 flip-card activities, 70 multi-question knowledge checks, 46 written reflections, and scenario/matching/order/script activities are present. The knowledge-check answer indices are valid; its player requires the passing score before its completion callback.
- Module and course percentages derive from completed activity IDs. All activities are required before the lesson's Finish button appears. Lesson completion can be reconstructed from activity completion on loading.
- The lesson player can start at the first incomplete activity when the saved completion set is available at mount.
- Normal signed-in activity saves write a local record and attempt a member-scoped cloud upsert. The migration defines unique member/activity records and owner-based RLS. This does not establish that the migration is deployed or that live cross-device restoration succeeds.

## Findings, in priority order

### 1. P1 — Wrong safety answers receive positive feedback (reproduced)

All **19 true/false activities** provide `isTrue`; TrueFalse reads `correctAnswer`. When that property is absent, the renderer treats either answer as correct. The probe selects **True** for the statement claiming tummy sleeping has no increased risk on a firm mattress and receives “That's right!” The explanatory text contradicts this positive feedback.

Evidence: `src/components/connect/activities/TrueFalse.tsx:22`, `src/data/parenting-course.ts:1327`. Fix the shared activity contract and test both answer paths, especially safety questions.

### 2. P1 — 28 activities crash when rendered (reproduced across the full inventory)

- **19 single-choice activities** pass objects `{label, isCorrect}` where SingleChoice renders strings and expects a separate `correctIndex`. React rejects the object as a child.
- **9 surveys** pass `{question, options}` where SurveyActivity reads `questions.length` and expects an array of rating questions.
- These affect **28 separate lessons**, including the first baby lesson, the ACE method, growth mindset, picky eating, solids, and sleep methods. The affected activity cannot complete through the current renderer, so the corresponding lesson cannot be completed normally.

Evidence: `SingleChoice.tsx:55`, `SurveyActivity.tsx:15`, complete failure list in the render evidence. Fix or adapt the data schema centrally; validate all course payloads against it. Broad `as any` casts currently hide these mismatches.

### 3. P1 — Delayed course restore can contaminate the next account's active cache (mocked race reproduced)

`loadCourseProgress` snapshots the shared local map, awaits a remote response, then writes that map back without a captured account/device guard. Signing out or switching accounts during the request can restore A's course data into B's active cache after the general Auth cache switch has correctly cleared it. The isolated test demonstrates this exact sequence. Because the initial local snapshot includes responses, existing written reflections can also be part of the stale map; the current test uses synthetic activity IDs only.

Evidence: `src/lib/course-progress.ts:43–55`. Use the same device-scope protection as other private caches, plus cancellation on unmount/account change. The general sign-out fix does not cover this asynchronous write.

### 4. P1 — Saved reflections cannot be reviewed through the lesson, and the vault promise is false

All **46 written reflections** store the vault flag inside `content.saveToVault`; LessonPlayer checks top-level `activity.saveToVault`. Parenting's save handler ignores the vault argument in any case. It writes course progress, not a vault entry. Nevertheless OpenResponse says “Saved to your couple's vault”.

OpenResponse starts with blank state each time; neither the parent nor ActivityRenderer supplies saved answers. Cloud restore does not select the `response` column. Navigating away before submitting discards the draft; reopening after submission shows an empty box despite the completion tick. Resubmitting replaces the progress response. Local/remote rows may still contain the earlier submitted text, but there is no parenting answer-review journey.

Evidence: `OpenResponse.tsx:13–16,50`, `LessonPlayer.tsx` handleActivityComplete, `ParentingCoursePage.tsx:125`, `course-progress.ts:48`. Reopening blank is reproduced in the UI probe. Add draft persistence, answer hydration and review/edit, and use accurate personal-course save wording and destination.

### 5. P1 — Offline/cloud failures are silent and have no retry queue

The cloud upsert result's `error` is ignored, and thrown failures are swallowed. Loading only downloads; it never retries unsynced local completions. A lesson can appear complete on one device and remain absent on another indefinitely. The probe simulates a failed cloud save, loads progress again, and confirms no second upload occurs. Storage-quota failures are swallowed too, while the UI still says saved/completed.

A related race: load snapshots local progress before awaiting the server. An activity saved while that load is in flight can be removed from the active local map by the later write of the older snapshot.

Evidence: `course-progress.ts:33–37,43–55,65–74`. Add explicit pending sync state, retries and surfaced storage errors; merge against current local state after the fetch. Verify reload, reconnect and two-device behaviour with a test account.

### 6. P2 — Some exercises are attached to the wrong lesson

Clear examples from the authored content:

| Lesson | Attached exercise | Correction needed |
| --- | --- | --- |
| Early Childhood Anxiety (Ages 2–7), `kt-m22-l1` | “Identity Moment”: a frightened 14-year-old coming out | Move to the teen identity lesson; supply an age-appropriate anxiety scenario here |
| Conversations About Bodies, Sex & Consent, `kt-m20-l2` | “Your Legacy Lists”: what to keep/change from one's own parents | Use a consent/body-boundaries conversation exercise; put legacy work with generational patterns |
| Romantic Relationships & Heartbreak, `kt-m9-l5` | “The Party Pickup”: teenager texts the agreed collection code | Move to party/peer-pressure safety; add a heartbreak/support scenario |
| Sharing & Turn-Taking, `toddler-m11-l2` | Supermarket meltdown over being refused a toy | Replace with an actual turn-taking conflict |

Other exercises are broadly relevant but weaker matches: the drunk-driving lesson asks for a generic party-permission script; the party-safety lesson asks for a generic “you don't understand” response. These need editorial review, not just code repair.

### 7. P1 editorial review — Do not certify all health/development content as correct

The source describes itself as AI-generated educational synthesis. Some modules list reference books, but there is no claim-level reference trail or recorded professional review. Several statements are overly prescriptive:

- The first newborn schedule prescribes minutes per breast and a clock-based routine from weeks 1–2. The course elsewhere teaches 8–12 feeds and responsive feeding. These need consistent cue-led framing and appropriate individual clinical guidance.
- The first sleep lesson frames self-settling as necessary to link cycles, and presents long sleep stretches as a typical expectation by 3–4 months. This needs softer, developmentally variable framing rather than suggesting normal feeding/settling support is a failure.
- The “Wonder Weeks” lesson presents fixed-age leaps as fact. Book-derived frameworks and specific developmental predictions should be labelled and reviewed rather than presented as settled science.

The NZ benchmark checked was [Plunket's newborn sleep guidance](https://www.plunket.org.nz/child-development/sleep/newborn-sleep/newborn-to-3-months/): it emphasises variation, feeding on demand, flexible routines and the normality of helping babies settle, including feeding/rocking to sleep. This supports reviewing the course's prescriptive framing; it does not establish that every numerical statement is false.

Much core safe-sleep text is sound in principle (back sleeping, firm flat separate sleep surface, stop swaddling at signs of rolling), but the incorrect quiz feedback in finding 1 directly undermines it. Feeding, choking/allergy, sleep and mental-health/crisis material require a focused NZ professional review before paid release. No clinical endorsement is implied by this audit.

### 8. P2 — Activities exist, but follow-through is shallow

65 of 114 lessons include a written response, scenario, matching, ordering or fill-in-script activity. The other 49 rely on teaching, cards, checks, ratings, surveys or comparison acknowledgements. One lesson, “Sensory Milestones & Tummy Time”, contains teaching carousels only.

That is not inherently wrong for a short explanatory lesson. However, prompts such as “try this week”, make a plan, practise a script, or build a kit have no later check-in, practice log or saved plan viewer. The app records tapping/submission, not doing the real-world parenting practice. Three ordering activities declare `correctOrder`, but SortActivity never checks it. Five fill-in-script activities accept any nonempty words without model-answer feedback. Label these as reflection exercises or add useful feedback; do not imply mastery from a green tick alone.

### 9. P2 — Resume and reporting are incomplete

- The first-unfinished-activity resume logic reads saved progress only during mount. If the initial cloud load finishes after a lesson has opened, its updated completion set does not hydrate that already-open player.
- There is no persisted last course tab/module/lesson or “continue where I left off” route. Refresh returns to the default Babies module view.
- The progress banner's activity count and XP use the size of the entire shared course-progress set, including other parenting tabs and other courses, while the percentage is scoped to the selected parenting tab. Counts and percentages can therefore disagree.
- Every one of the 114 lessons lacks `estimatedMinutes`, although LessonPlayer renders it as `~{lesson.estimatedMinutes} min`. Members get a duration label without a number.

Evidence: `LessonPlayer.tsx:20–28,81`, `ParentingCoursePage.tsx:54–59,408–413`.

### 10. P2/P3 — Navigation promises and extra content need reconciliation

The Kids & Teens Quick Toolkit takes members to whole modules rather than directly to the promised resource. “Friendship Audit” points at `kt-m11` (girl confidence/friendships); the actual activity titled Friendship Audit is in `kt-m15-l1`. “Calm-Down Kit” points at the anxiety module rather than the toddler kit-building activities. “Family Media Agreement” leads to prose/reflection, not a structured downloadable/editable contract template.

There is also a separate `src/data/updated-parenting-course.ts` containing the eight-module “Gentle Anchor” course. It is not imported by the routed parenting page or elsewhere in src. Its content/artwork should not be mistaken for the course members currently see.

The sleep schedules are reference cards, not sleep/feed tracking. The Behaviour tab is a separate child/chores/rewards system; it does not record lesson practice. Its authenticated CRUD and live permissions were not tested. A smaller source issue in BabySleepSchedule: the Next button's disabled condition uses the baby schedule count even when displaying the shorter toddler schedule, so it stays enabled at the toddler end (the click itself is clamped).

## Recommended implementation sequence

1. Fix schema validation/rendering and false quiz feedback; include every authored activity in regression coverage.
2. Fix account-scoped progress, reliable local saving, cloud retry and answer restoration together. Verify an actual member reload, offline/reconnect and account-switch journey.
3. Correct the misplaced exercises and commission the focused NZ health/development review. Preserve existing activity IDs where content identity remains the same; explicitly migrate moved/replaced activities.
4. Add saved personal plans/reflections, practice check-ins, accurate progress counts, duration metadata and direct toolkit links.

## Lesson-by-lesson structural appendix

“Initial render OK” means the payload renders initially; it does **not** certify factual accuracy, answer evaluation, interactions, cloud saves or readiness. Every lesson is affected by the shared persistence limitations and missing duration metadata. Explicit topic mismatches are flagged separately above.

| Course / lesson ID | Lesson | Activities | Structural result |
| --- | --- | ---: | --- |
| baby-m1-l1 | How Baby Sleep Works | 5 | Render failure |
| baby-m1-l2 | Safe Sleep Essentials | 5 | Wrong true/false feedback |
| baby-m1-l3 | Week-by-Week Sleep & Feed Guide | 2 | Initial render OK |
| baby-m2-l1 | Breastfeeding Success | 5 | Initial render OK |
| baby-m2-l2 | Bottle-Feeding With Confidence | 2 | Initial render OK |
| baby-m4-l1 | How Your Baby's Brain Grows | 5 | Wrong true/false feedback |
| baby-m4-l2 | Sensory Milestones & Tummy Time | 2 | Initial render OK |
| baby-m4-l3 | Wonder Weeks — Developmental Leaps | 2 | Initial render OK |
| baby-m5-l1 | When & How to Start | 5 | Render failure |
| baby-m5-l2 | Baby-Led Weaning vs Purees | 2 | Initial render OK |
| baby-m5-l3 | Allergens, Gagging & Food Safety | 2 | Wrong true/false feedback |
| baby-m6-l1 | The Vulnerability of New Parenthood | 5 | Initial render OK |
| baby-m6-l2 | Baby Blues, PND & When to Get Help | 2 | Wrong true/false feedback |
| baby-m6-l3 | The Relationship After Baby | 2 | Initial render OK |
| baby-m7-l1 | Attachment Theory for Real Life | 5 | Wrong true/false feedback |
| baby-m7-l2 | Co-Regulation & Emotional Safety | 2 | Initial render OK |
| baby-m3-l1 | The Spectrum of Sleep Methods | 6 | Render failure |
| toddler-m1-l1 | The Upstairs & Downstairs Brain | 6 | Render failure |
| toddler-m1-l2 | Attachment & Emotional Safety | 2 | Wrong true/false feedback |
| toddler-m2-l1 | Meltdown vs. Manipulation | 6 | Render failure |
| toddler-m2-l2 | The ACE Method | 2 | Render failure |
| toddler-m2-l3 | Practical Calm-Down Strategies | 2 | Initial render OK |
| toddler-m3-l1 | Why Boundaries Feel Like Love | 5 | Wrong true/false feedback |
| toddler-m3-l2 | Natural & Logical Consequences | 2 | Render failure |
| toddler-m4-l1 | The Bedtime Routine Blueprint | 5 | Initial render OK |
| toddler-m4-l2 | Night Wakings & Fears | 2 | Render failure |
| toddler-m4-l3 | Transitioning to a Big Bed | 2 | Wrong true/false feedback |
| toddler-m5-l1 | The Division of Responsibility | 5 | Initial render OK |
| toddler-m5-l2 | Managing Picky Eating | 2 | Render failure |
| toddler-m6-l1 | Prepare, Preview, Empower | 5 | Initial render OK |
| toddler-m6-l2 | PREP in Action | 2 | Render failure |
| toddler-m7-l1 | Notice, Name, Guide, Follow Through | 5 | Initial render OK |
| toddler-m8-l1 | Breathing & Physical Release | 5 | Render failure |
| toddler-m8-l2 | Creative, Sensory & Verbal Coping | 2 | Initial render OK |
| toddler-m9-l1 | Your Emotion Thermometer | 5 | Initial render OK |
| toddler-m9-l2 | The Lost-It Roadmap | 2 | Wrong true/false feedback |
| toddler-m10-l1 | Building a Flexible Routine | 5 | Initial render OK |
| toddler-m10-l2 | When to Drop the Nap | 5 | Wrong true/false feedback |
| toddler-m10-l3 | Kindergarten Readiness | 5 | Initial render OK |
| toddler-m11-l1 | Hitting, Biting & Aggression | 5 | Initial render OK |
| toddler-m11-l2 | Sharing & Turn-Taking | 5 | Initial render OK |
| toddler-m12-l1 | The Seven Steps of BREATHE | 5 | Initial render OK |
| toddler-m13-l1 | Realistic Expectations by Age | 5 | Wrong true/false feedback |
| toddler-m13-l2 | Developmental Milestones | 5 | Initial render OK |
| toddler-m14-l1 | Consistency at Home is Enough | 5 | Initial render OK |
| kt-m1-l1 | The Resilience Framework | 5 | Initial render OK |
| kt-m1-l2 | Growth Mindset in Practice | 2 | Render failure |
| kt-m2-l1 | Recognising the Signs | 5 | Initial render OK |
| kt-m2-l2 | Response Strategies | 2 | Render failure |
| kt-m3-l1 | The Anxious Brain Explained | 5 | Wrong true/false feedback |
| kt-m3-l2 | Practical Anxiety Tools | 2 | Initial render OK |
| kt-m3-l3 | Raising Worry-Free Girls | 2 | Render failure |
| kt-m4-l1 | Setting Smart Screen Boundaries | 5 | Initial render OK |
| kt-m5-l1 | The Teenage Brain Explained | 5 | Render failure |
| kt-m5-l2 | Keeping the Door Open | 2 | Initial render OK |
| kt-m5-l3 | The Vulnerable Teenage Brain | 2 | Wrong true/false feedback |
| kt-m6-l1 | Building a Strong Identity | 5 | Initial render OK |
| kt-m7-l1 | A Friend Says They Don’t Want to Play | 5 | Render failure |
| kt-m7-l2 | Being Left Out at Lunchtime | 2 | Initial render OK |
| kt-m7-l3 | Someone Is Being Mean to Them | 2 | Initial render OK |
| kt-m7-l4 | First Day Nerves & New Situations | 2 | Initial render OK |
| kt-m7-l5 | Lying & Getting Caught | 2 | Initial render OK |
| kt-m7-l6 | Sibling Conflict | 2 | Render failure |
| kt-m7-l7 | Big Questions They Ask | 2 | Initial render OK |
| kt-m8-l1 | Social Exclusion & Friendship Drama | 5 | Initial render OK |
| kt-m8-l2 | Body Image & Comparison | 2 | Initial render OK |
| kt-m8-l3 | Academic Pressure & Homework Battles | 2 | Render failure |
| kt-m8-l4 | When a Friend Is Being a Bad Influence | 2 | Initial render OK |
| kt-m8-l5 | Online Stranger Danger & Digital Safety | 2 | Wrong true/false feedback |
| kt-m8-l6 | Boredom & Independent Play | 2 | Render failure |
| kt-m9-l1 | Peer Pressure to Try Drugs or Alcohol | 5 | Wrong true/false feedback |
| kt-m9-l2 | A Friend Pressures Them to Drive Drunk (or Get in a Car) | 2 | Initial render OK |
| kt-m9-l3 | Sexting & Nude Image Pressure | 2 | Initial render OK |
| kt-m9-l4 | Depression, Self-Harm & Suicidal Thoughts | 2 | Initial render OK |
| kt-m9-l5 | Romantic Relationships & Heartbreak | 2 | Initial render OK |
| kt-m9-l6 | School Refusal & Motivation Loss | 2 | Wrong true/false feedback |
| kt-m9-l7 | Identity, Sexuality & Coming Out | 2 | Initial render OK |
| kt-m9-l8 | Parties, Alcohol & Staying Safe | 2 | Initial render OK |
| kt-m10-l1 | Divorce & Separation | 3 | Initial render OK |
| kt-m10-l2 | Grief & Loss | 5 | Initial render OK |
| kt-m11-l1 | The Power Perspective | 5 | Initial render OK |
| kt-m11-l2 | Navigating Girl Friendships | 5 | Initial render OK |
| kt-m12-l1 | Let Him Feel | 6 | Initial render OK |
| kt-m13-l1 | The Power of Metaphor | 5 | Initial render OK |
| kt-m14-l1 | Motivation vs Pressure | 5 | Render failure |
| kt-m14-l2 | Finding Their Voice | 5 | Initial render OK |
| kt-m15-l1 | The Friendship Filter | 5 | Initial render OK |
| kt-m15-l2 | Handling Gossip, Bullying & Betrayal | 5 | Initial render OK |
| kt-m15-l3 | Being a Good Friend | 5 | Render failure |
| kt-m16-l1 | Three Hard Truths About Addiction | 5 | Wrong true/false feedback |
| kt-m16-l2 | Screen & Social Media Dependency | 5 | Initial render OK |
| kt-m16-l3 | Striking at the Root | 5 | Initial render OK |
| kt-m17-l1 | The Two Mirrors | 5 | Initial render OK |
| kt-m17-l2 | Conquering Their Personal Challenge | 5 | Render failure |
| kt-m18-l1 | Your Triggers Aren't About Your Child | 5 | Initial render OK |
| kt-m18-l2 | Breaking Generational Patterns | 5 | Render failure |
| kt-m18-l3 | Responding vs Reacting | 5 | Initial render OK |
| kt-m19-l1 | Why Punishment Doesn't Work | 5 | Render failure |
| kt-m19-l2 | Age-Appropriate Expectations | 5 | Initial render OK |
| kt-m19-l3 | The Gentle Discipline Toolkit | 5 | Initial render OK |
| kt-m20-l1 | The Art of Listening | 5 | Render failure |
| kt-m20-l2 | Conversations About Bodies, Sex & Consent | 5 | Initial render OK |
| kt-m20-l3 | Race, Privilege & Difference | 5 | Initial render OK |
| kt-m21-l1 | Why Teens Disengage | 5 | Render failure |
| kt-m21-l2 | Rebuilding Connection & Purpose | 5 | Initial render OK |
| kt-shame-l1 | What Shame Actually Is | 5 | Render failure |
| kt-shame-l2 | Building Shame Resilience | 5 | Initial render OK |
| kt-shame-l3 | Vulnerability as a Parenting Practice | 5 | Render failure |
| kt-belong-l1 | The Difference That Changes Everything | 5 | Wrong true/false feedback |
| kt-belong-l2 | Raising Socially Brave Kids | 5 | Initial render OK |
| kt-belong-l3 | The Loneliness Epidemic | 5 | Initial render OK |
| kt-m22-l1 | Early Childhood Anxiety (Ages 2–7) | 5 | Initial render OK |
| kt-m22-l2 | Tween Anxiety (Ages 8–12) | 5 | Wrong true/false feedback |
| kt-m22-l3 | Teenage Anxiety (Ages 13–17) | 5 | Initial render OK |

