

# Signal App — Comprehensive Update Plan

This is a large set of changes spanning navigation, emoji replacement, proofreading, community workflow, journal improvements, and various fixes. Given the scope, I recommend implementing in **3 batches**.

---

## Batch 1: Navigation, Emoji Removal, and Proofreading

### 1.1 Desktop Navigation (`Layout.tsx`)
- Reorder `navItems` to: Daily Habits | Nutrition | Movement | Cycle | Mindfulness | Journal | Community
- Rename "Practice" → "Daily Habits", "Breathe" → "Mindfulness"
- Remove "Picks", "Modules", "Membership" from nav (keep routes accessible)
- Add `gap-2` or `ml-auto` to push nav away from logo to prevent overlap
- Logo already links to Home (confirmed in code)

### 1.2 Mobile Navigation (`Layout.tsx`)
- Expand `mobileNavItems` to show all 7 tabs using a horizontally scrollable bar instead of fixed 5-icon bottom nav
- Use a compact scrollable pill bar with text labels (like the Nutrition tab bar pattern already in the app)
- Keep touch targets generous, use `overflow-x-auto` and `scroll-snap-x`

### 1.3 Emoji → Hand-drawn SVG Replacement (Global)
Create new SVG icon components in `BotanicalElements.tsx`:
- `HandDrawnBook` — for Journal header
- `HandDrawnLock` — for Community profile privacy indicator
- `HandDrawnVillage` — for Community header (replacing 🏘️)
- `HandDrawnLeaf` — for empty states (replacing 🌿)
- `HandDrawnCamera` — for profile photo placeholder (replacing 📷)
- `HandDrawnChart` — for poll label (replacing 📊)
- `HandDrawnCalendar` — for event label (replacing 📅)
- `HandDrawnPin` — for location opt-in (replacing 📍)
- `HandDrawnSend` — for chat send button (replacing ➤)
- `HandDrawnSparkle` — for analyse button (replacing ✨)
- `HandDrawnEye` — for visibility "on profile" (replacing 👁)

Replace all emoji across: `Community.tsx`, `CommunityDiscover.tsx`, `CommunityProfile.tsx`, `NearbyView.tsx`, `ChatRoom.tsx`, `ChallengesPanel.tsx`, `LocationOptIn.tsx`, `Journal.tsx`, `Index.tsx`, `MovementCalendar.tsx`

### 1.4 Proofreading
- Capitalise first letter of all sentences across all page copy
- Community page: replace `?` bullet markers with `·` (bullet point) in `CommunityDiscover.tsx` line 70
- Review all button text, descriptions, headings for sentence case

**Files:** `Layout.tsx`, `BotanicalElements.tsx`, `Community.tsx`, `CommunityDiscover.tsx`, `CommunityProfile.tsx`, `NearbyView.tsx`, `ChatRoom.tsx`, `ChallengesPanel.tsx`, `LocationOptIn.tsx`, `Journal.tsx`, `Index.tsx`

---

## Batch 2: Journal Improvements

### 2.1 Remove Water and Sleep Trackers
- Remove `sleep` and `water` entries from `TRACKING` array in `Journal.tsx` (keep mood and energy only)
- Replace emoji labels (`🌿`, `⚡`) with hand-drawn SVG icons
- Update entries list display to not show sleep/water

### 2.2 Replace Emojis in Analysis View
- Replace `🔮` (IFS heading), `💚` (unspoken desires), `📚`/`🎧`/`🌿` (recommendation types), `✨` (affirmation) with hand-drawn SVGs
- Replace `📖` empty state with `HandDrawnBook`

### 2.3 Entry Search
- Add a search input at the top of `EntriesList` that filters entries by prompt text, date, or tags

### 2.4 Milestone Analysis System
- Enhance the AI analysis to support milestone reflections at 7, 14, 21 entries (weekly stages), then monthly (30), 3-month (90), 6-month (180), yearly (365)
- Add a milestone banner/card at the top of entries list when a milestone is reached
- When triggered, the AI call sends ALL entries within the milestone window for longitudinal analysis
- Update the edge function `journal-ai` to accept a `milestoneType` parameter and adjust the prompt to provide growth tracking, pattern evolution, and personalised recommendations (readings, podcasts, exercises)
- Store milestone analyses separately in localStorage keyed by milestone type + count

**Files:** `Journal.tsx`, `supabase/functions/journal-ai/index.ts`, `BotanicalElements.tsx`

---

## Batch 3: Community Workflow, Fixes, and Misc

### 3.1 Community Location Validation
- When user taps "join" on a suburb group, check if location is enabled; if not, trigger the location opt-in modal first
- Once location is enabled, validate that user's suburb matches the group's suburb before joining
- Allow joining multiple suburb communities (no restriction)
- Add "Create Your Community" flow: a form to request a custom community (name, type, description), which creates an interest-based group (e.g., "Mums and Bubs", "Dog Lovers")
- Add member management: community creator can approve/remove members
- Add complaint/report form accessible from chat or profile

### 3.2 Nearby Tab "Turn Off" Button
- Wire the existing "turn off" button in `NearbyView.tsx` line 132 to actually call `onToggleLocation` (currently it's a dead button with no `onClick`)

### 3.3 Community Profile Save
- Currently save button just shows "saved ✓" for 3 seconds with no persistence
- Save profile data to localStorage (for now) so it persists across sessions
- Load saved data on mount

### 3.4 Seed Cycling Banner Fix
- Investigate the sticky/following seed cycling banner on Nutrition page — likely needs `position: relative` instead of `sticky` or proper containment

### 3.5 Shopping List / Woolworths Updates
- Change Woolworths link to go to `https://www.woolworths.co.nz` homepage instead of search page
- Move "My Week" to third tab position in Nutrition tabs
- Remove individual ingredient Woolworths links (future workflow will handle this)

### 3.6 Movement Calendar
- Replace emoji in `MovementCalendar.tsx` (the ✨ sparkle) with hand-drawn indicator
- Show phase indicators on each calendar day based on movement logged

### 3.7 Home Page — Dynamic Username
- Change "you." heading to show user's name when logged in, keep "you." for unauthenticated/free users
- This is a future auth-dependent feature; for now keep "you." but structure the code to accept a name prop

**Files:** `Community.tsx`, `CommunityDiscover.tsx`, `NearbyView.tsx`, `CommunityProfile.tsx`, `Nutrition.tsx`, `MovementCalendar.tsx`, `Index.tsx`, `ShoppingList.tsx`

---

## Implementation Order

Given the scope, I recommend starting with **Batch 1** (navigation + emoji removal + proofreading) as it's the most visible and impactful. Batches 2 and 3 can follow in subsequent messages.

Shall I proceed with Batch 1?

