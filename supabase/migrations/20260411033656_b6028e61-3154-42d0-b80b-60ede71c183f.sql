INSERT INTO public.goal_categories (id, slug, label, description, sort_order, intensity_min, intensity_max, hormonal_notes)
VALUES
  ('gc-012', 'yoga_flexibility', 'Yoga & Flexibility', 'Build flexibility, balance, and mindfulness through structured yoga sequences.', 12, 1, 4, 'Yin and restorative styles suit luteal/menstrual phases; dynamic vinyasa fits follicular/ovulatory.'),
  ('gc-013', 'pilates_core', 'Pilates & Core', 'Strengthen your core, improve posture, and build long lean muscle with Pilates.', 13, 2, 5, 'Mat and reformer Pilates can be adjusted for cycle phases by modifying tempo and resistance.'),
  ('gc-014', 'running_endurance', 'Running & Endurance', 'From your first 5K to marathon distance — structured progressive running plans.', 14, 2, 6, 'Tempo and speed work best during follicular/ovulatory; easy and recovery runs suit luteal/menstrual.')
ON CONFLICT (id) DO NOTHING;