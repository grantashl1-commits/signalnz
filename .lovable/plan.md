

# Signal App — Multi-Fix & Enhancement Plan

This plan addresses 15+ issues raised across Community, Movement, Nutrition, Journal, and Coach pages.

---

## 1. Remove Coach Tile from Homepage

**File:** `src/pages/Index.tsx`

Remove the "My Coach" tile from the "Your day at a glance" section (the tile linking to `/coach` with "AI Training & Nutrition" text around lines 329-335).

---

## 2. Enrich AI Prompts in generate-plan Edge Function

**File:** `supabase/functions/generate-plan/index.ts`

Update the training and nutrition prompts sent to Gemini to include richer context:
- Add body measurements data to the prompt
- Include recent journal reflections (query from localStorage-synced entries or a new journal_entries table)
- Add cycle phase guidance and phase-specific nutrition rules (from existing `PHASE_GUIDANCE` and `GOAL_GUIDANCE`)
- Make meal suggestions generic (not specific like "roasted tofu tray") — update prompt rules to say "use common, everyday ingredients accessible in NZ supermarkets"
- Add a "stay on this page" caption in the Coach UI while generating

---

## 3. Fix Location Services on Mobile

**File:** `src/components/community/NearbyView.tsx`

The location flow uses Google Geocode API but `VITE_GOOGLE_MAPS_API_KEY` may not be set, causing "Couldn't determine your suburb" error. Fix:
- Add fallback using browser's built-in reverse geocoding or a free Nominatim API when Google key is missing
- Ensure only suburb-level data is stored (already fuzzed by ~500m, which is good)
- Show a better error message if geolocation permission is denied on mobile

---

## 4. Make "I'm Going" Clickable on Events in Chat

**File:** `src/components/community/ChatRoom.tsx`

The event "I'm going" button (line 134) has no click handler. Add:
- onClick handler that increments the `going` count
- Toggle state so user can un-RSVP
- Visual feedback showing the user has RSVP'd

---

## 5. Image & Voice Buttons in Chat

**File:** `src/components/community/ChatRoom.tsx`

Lines 227-228 show image and voice buttons with empty `action: () => {}`. Implement:
- **Image:** Open file picker, display selected image as a message with type "image"
- **Voice:** Use MediaRecorder API for short voice clips, display as playable audio message
- Add new message types to the ChatMessage interface

---

## 6. Moderation Explanation

The moderation system (in `supabase/functions/community-moderate/index.ts`) uses AI to evaluate messages. It:
- **Flags:** personal attacks, contempt, shaming, belittling
- **Allows:** frustration, directness, disagreement, mild profanity, strong opinions
- Example: "That's a shit idea, I'm not coming" would likely be flagged as contemptuous/dismissive. The AI returns a reflection question and suggested rewrite.

No code changes needed here — this is informational. The system is working as shown in the screenshot.

---

## 7. Challenges Tab — Show Content for Joined Groups

**File:** `src/components/community/ChallengesPanel.tsx`

The tab shows empty because `joined` state uses localStorage group IDs that may not match database UUIDs. Fix:
- Also query groups where the user has a `community_memberships` record
- Add default challenges for groups that have empty challenges arrays

---

## 8. Community Profile — Save to Database

**File:** `src/components/community/CommunityProfile.tsx`

Currently saves to localStorage only. Wire up to Supabase:
- Create a `community_profiles` table (or extend `profiles`) to store career, skills, offer, etc.
- Save button writes to database
- Other users can view profiles when clicking on members

---

## 9. View Community Members' Profiles

**Files:** `src/components/community/NearbyView.tsx`, `src/components/community/ChatRoom.tsx`

Add clickable member cards that open a profile sheet showing their public fields (skills, offer, community vision).

---

## 10. Memory Vault — Show Saved Activity Entries

**File:** `src/components/journal/MemoryVault.tsx`

Journal entries saved via "Save to Vault" should appear. The vault uses `loadVault()` from `journal-store.ts`. Verify the save flow in JournalEntries properly calls `saveVault()` and entries appear in the correct categories. If activities (like "Letter to Future Self") are saved as entries but not explicitly vaulted, add an option to auto-vault completed activities.

---

## 11. Movement Today — Remove Duplicate Phase Phrases

**File:** `src/pages/Movement.tsx`

Lines 241-262 show three overlapping elements:
1. Phase banner with "Drop intensity 20%..." (line 250)
2. Training week label with phase note (line 255-257)
3. Phase guidance block (line 260-262)

Remove the standalone phase guidance block (item 3) since it duplicates the banner text.

---

## 12. My Log — Fix Stats & Remove Duplicate Week Blocks

**File:** `src/pages/Movement.tsx`

- The "This Week" mini calendar + stats block (lines 526-548) duplicates the monthly calendar. Remove the weekly mini-calendar, the 3-stat row below it, and the training week label block (lines 564-568).
- Fix stat calculations: derive workouts/minutes from actual `getLoggedWorkouts()` data for the visible week, not hardcoded zeros.

---

## 13. Heart Rate Monitor — Persist Across Navigation

**Files:** `src/pages/Movement.tsx`, `src/components/movement/LiveHRView.tsx`

- Move HR connection state to a context/global store so it persists when switching tabs
- Add an "X" close button to the HR modal that hides the UI but keeps the Bluetooth connection active
- Show a small floating indicator when HR is connected but modal is closed

---

## 14. 3D Body Visualizer

**File:** `src/components/BodyVisualisationCard.tsx` or new component

The current card collects measurements but doesn't render a 3D body. Building a full 3D body visualizer like bodyvisualizer.com requires Three.js with a parametric human mesh. This is a significant feature:
- Use Three.js + a simple parametric body mesh
- Map saved measurements to body proportions
- Render in the Body tab of Movement

This is a large standalone task and may need to be phased.

---

## 15. AI Recipes — Fridge Ingredient Input

**File:** `src/components/nutrition/AIRecipesTab.tsx`

Transform from static recipe filtering to AI-powered generation:
- Add a "What's in your fridge?" text input
- Call an edge function that sends fridge contents + user dietary preferences to Gemini
- Generate custom recipes with those ingredients
- Keep existing recipe browsing as a fallback tab

---

## 16. Coach Page — Stay-on-Page Caption

**File:** `src/pages/Coach.tsx`

Add a caption under the generate button: "Please stay on this page while your plan is being created" visible during loading state.

---

## Execution Priority

1. Quick fixes: Remove coach tile from homepage, remove duplicate movement phrases, remove duplicate log blocks, fix "I'm going" button, add stay-on-page caption
2. Medium fixes: Fix location services, fix challenges tab, wire profile save, fix vault entries, fix log stats, image/voice chat buttons
3. Larger features: Enrich AI prompts, AI fridge recipes, HR persistence, member profile viewing
4. Major feature (separate phase): 3D body visualizer

---

## Database Changes Required

- New migration for `community_profiles` table (or add columns to `profiles`) for career/skills/offer fields
- RLS policies for community profile data (public read for visible fields, owner write)

