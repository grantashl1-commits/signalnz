---
name: Community chat
description: Real-time, member-only chat for /community groups (Thriving tier) — text, polls, events, image + voice uploads, presence, moderation, reactions, replies, mentions, edits, unread badges
type: feature
---

The Community chat is real (not mocked):

- **Storage**: `community_messages` (group_id, user_id, message_type [text|poll|event|image|voice], content, media_path, metadata, is_removed). Realtime via `supabase_realtime` publication. RLS uses `is_group_member(uid, group_id)` security-definer helper.
- **Joining a group**: `join()` in `Community.tsx` writes to `community_memberships` and loads from DB.
- **Realtime**: `ChatRoom.tsx` subscribes to `postgres_changes` INSERT+UPDATE for the group.
- **Display names**: resolved via `profiles` table (display_name, avatar_url) joined client-side.
- **Polls**: options + votes + voters in `metadata` JSONB. Vote = optimistic + UPDATE row. Voters keyed by user_id.
- **Events**: title/date/location + going[] in metadata. RSVP toggles user_id in going[].
- **Image + voice uploads**: private `community-media` bucket (5MB limit, image/* + audio/*). Path layout `{group_id}/{user_id}/{ts}.{ext}` so storage RLS can verify membership and ownership. Files rendered in chat via short-lived signed URLs (1h). Voice notes capped at 60s; recorded with MediaRecorder, uploaded as webm/mp4.
- **Real online presence**: per-group Supabase Realtime presence channel (`community-presence-{group_id}`). Header shows live count, avatars get a green dot.
- **Moderation**:
  - All text sends call `community-moderate` Edge Function before insert.
  - Per-message menu: report (writes to `moderation_queue` with `message_id`) or author soft-delete (sets `is_removed`).
- **Challenges (`ChallengesPanel.tsx`)**:
  - `challenge_completions` table — group-shared completions (any member can see who completed what; unique on group_id+challenge_index+user_id; only the user can mark/unmark their own).
  - `challenge_answers` table — private answers per user (only author can read/write). Auto-saves on blur.
