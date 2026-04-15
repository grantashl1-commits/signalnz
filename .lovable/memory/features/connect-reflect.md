---
name: Connect Reflect Room flow
description: AI-mediated partner communication — raw write → validate → rewrite → permission → send → back-and-forth → resolved/space → IFS inner child insight
type: feature
---

## Reflect Room Flow

1. Partner A writes raw emotional text (private — only they see it)
2. AI validates their feelings, rewrites without attack language (NVC), shows what changed
3. Partner A reviews the rewrite, can edit, then approves sending
4. Partner B receives the rewritten version, writes their raw response
5. AI validates Partner B, rewrites their response, they approve
6. Back and forth until either partner clicks "We're good" (resolved) or "I need space"
7. On resolve/space: AI generates a PRIVATE personal insight for each partner individually

## Personal Insight Philosophy
- Draws from IFS (Internal Family Systems), Inner Child work, Attachment Theory
- Helps the individual understand WHY they react the way they do
- Never about fixing the other person — always about fixing yourself
- May surface self-worth issues, coping strategies, protector parts
- Goal: "tune in" to find the root, not change the other person

## Edge Function
`connect-reflect` with two modes: `rewrite` and `insight`

## Database
Uses `connect_reflections` table. Status markers stored in `cards.status` field.
