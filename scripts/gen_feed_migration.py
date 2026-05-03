import csv

src = 'C:/Users/grant/Downloads/May 2026 Feed your mind.csv'
dst = 'C:/Users/grant/OneDrive/Documents/GitHub/signalnz/supabase/migrations/20260503100000_feed_posts_may2026.sql'
EM_DASH = '—'

def esc(s):
    return s.replace("'", "''")

values = []
with open(src, encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader, start=1):
        title    = row['Post Title'].strip()
        desc     = row['Post Description'].strip()
        takeaway = row['Takeaway'].strip()
        book     = row['Book Title'].strip()
        author   = row['Book Author'].strip()
        tags_raw = row['Tags'].strip()

        if not title or not book:
            continue

        bta = f"{book} {EM_DASH} {author}" if author else book

        parts = [f"**{title}**", "", desc]
        if takeaway:
            parts += ["", f"**Takeaway:** {takeaway}"]
        content = "\n".join(parts)

        raw_tags = [t.strip() for t in tags_raw.split(',') if t.strip()][:3]
        tags_sql = "ARRAY[" + ",".join(f"'{esc(t)}'" for t in raw_tags) + "]"

        values.append(
            f"  ({i}, '{esc(content)}', '{esc(bta)}', {tags_sql}, true)"
        )

lines = [
    "-- Replace all feed posts with May 2026 content",
    "-- Format: **Post Title** heading, body, **Takeaway:** section; no quote; kebab-case theme tags",
    "",
    "DELETE FROM public.feed_posts;",
    "",
    "INSERT INTO public.feed_posts (post_number, post_title_description, book_title_author, themes, been_published)",
    "VALUES",
    ",\n".join(values) + ";",
]

with open(dst, 'w', encoding='utf-8') as out:
    out.write("\n".join(lines))

print(f"Written {len(values)} rows to {dst}")
