---
name: Community chat
description: Real-time, member-only chat for /community groups (Thriving tier)
type: feature
---

The Community chat is real (not mocked):

- **Storage**: `community_messages` table (group_id, user_id, message_type, content, media_path, metadata, is_removed). Realtime is enabled via `supabase_realtime` publication.
- **Access control**: RLS uses `is_group_member(uid, group_id)` security-definer helper. Only members of `community_memberships` for that group can SELECT/INSERT. Authors can update/delete own. Admins can moderate.
- **Joining a group**: `join()` in `Community.tsx` writes a row to `community_memberships`, then loads memberships from DB (no longer localStorage).
- **Realtime**: `ChatRoom.tsx` subscribes to `postgres_changes` on INSERT and UPDATE for the group. Works because all community users are authenticated (Thriving members).
- **Display names**: resolved via `profiles` table (display_name, avatar_url) joined client-side as messages arrive.
- **Polls**: options + votes + voters live in `metadata` JSONB. Vote = optimistic local update + UPDATE row. Voters keyed by user_id prevent double-voting.
- **Events**: title/date/location + going[] in metadata. RSVP toggles user_id in going[].
- **Moderation**: every text send still calls `community-moderate` Edge Function before insert.
- **Images/voice**: stubbed with alert until Phase 3 wires up secure storage bucket.
