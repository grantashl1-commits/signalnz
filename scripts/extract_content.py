#!/usr/bin/env python3
"""Extract all AI-generated narrative/course content into a single markdown file."""
import os
from pathlib import Path

REPO = Path(r"C:\GitHub\signalnz")
OUT = REPO / "extracted_content.md"

# Content files: courses, scripts, recipes, workouts, habits, and other narrative data.
# Excludes pure type/utility files (e.g. baking-recipes is content; kids-alternatives is mappings — but include for completeness).
DATA_FILES = [
    "src/data/addiction-inner-work-scripts.ts",
    "src/data/baking-recipes.ts",
    "src/data/book-sourced-scripts.ts",
    "src/data/bowl-meal-recipes.ts",
    "src/data/community-data.ts",
    "src/data/connect-course.ts",
    "src/data/doctors-kitchen-recipes.ts",
    "src/data/embodiment-course.ts",
    "src/data/exercise-animations.ts",
    "src/data/extra-batch-recipes.ts",
    "src/data/fascia-release-exercises.ts",
    "src/data/generated-mindfulness-scripts.ts",
    "src/data/glucose-revolution-recipes.ts",
    "src/data/habit-carousel-data.ts",
    "src/data/habit-library.ts",
    "src/data/how-not-to-diet-recipes.ts",
    "src/data/image-style-guide.md",
    "src/data/kids-alternatives.ts",
    "src/data/kids-recipes.ts",
    "src/data/meal-plan-recipes.ts",
    "src/data/meal-plans.ts",
    "src/data/meditation-scripts.ts",
    "src/data/mindfulness-exercises.ts",
    "src/data/nutrition-insights.ts",
    "src/data/parenting-course.ts",
    "src/data/pdf-expanded-recipes.ts",
    "src/data/pdf-library-recipes.ts",
    "src/data/pdf-recipes.ts",
    "src/data/plant-powered-plus-recipes.ts",
    "src/data/plant-powered-recipes.ts",
    "src/data/practices.ts",
    "src/data/protein-15-recipes.ts",
    "src/data/self-care-rituals.ts",
    "src/data/snack-dessert-recipes.ts",
    "src/data/somatic-scripts.ts",
    "src/data/stacy-sims-workouts.ts",
    "src/data/stoic-question-patterns.ts",
    "src/data/storage-pdf-recipes.ts",
    "src/data/tcm-ayurveda-recipes.ts",
    "src/data/vegan-basics-recipes.ts",
    "src/data/workout-plans.ts",
    "src/data/workouts.ts",
    "Mindcast/mindcast-human-framework.md",
]

def main():
    parts = ["# Extracted AI-Generated Course Content\n",
             f"Source repo: `{REPO}`\n",
             f"Total files: {len(DATA_FILES)}\n\n"]
    total_bytes = 0
    missing = []
    for rel in DATA_FILES:
        p = REPO / rel
        if not p.exists():
            missing.append(rel)
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        total_bytes += len(text)
        ext = p.suffix.lstrip(".") or "text"
        fence_lang = {"ts": "ts", "md": "md", "json": "json"}.get(ext, "")
        parts.append(f"\n---\n\n## `{rel}`\n\n")
        parts.append(f"```{fence_lang}\n{text}\n```\n")
    if missing:
        parts.append("\n---\n\n## Missing files\n\n")
        for m in missing:
            parts.append(f"- {m}\n")
    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size:,} bytes from {total_bytes:,} bytes of source)")
    if missing:
        print(f"Missing: {missing}")

if __name__ == "__main__":
    main()
