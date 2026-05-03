-- New goal categories for movement/training programs
-- gc-001 through gc-011 were cleared in a prior migration; these are safe to insert fresh.

INSERT INTO public.goal_categories (id, slug, label, description, sort_order, intensity_min, intensity_max, hormonal_notes)
VALUES
  ('gc-001', 'strength_muscle', 'Strength & Muscle', 'Build functional strength and muscle with progressive resistance training.', 1, 2, 8, 'Heavier lifts suit follicular/ovulatory phases; moderate loads suit luteal; deload or active rest in menstrual.'),
  ('gc-002', 'hiit_circuit', 'HIIT & Circuit', 'High-intensity interval and circuit training for fitness, fat loss, and endurance.', 2, 4, 9, 'HIIT is best tolerated in follicular/ovulatory; keep intensity moderate in luteal/menstrual.'),
  ('gc-003', 'mobility_stretch', 'Mobility & Stretching', 'Improve flexibility, joint range of motion, and movement quality through dedicated stretch routines.', 3, 1, 4, 'Stretching and mobility work suits all cycle phases — especially restorative styles in menstrual/luteal.'),
  ('gc-004', 'womens_health', 'Women''s Health & Fitness', 'Programs designed with female physiology, hormonal health, and life stages in mind.', 4, 2, 7, 'These programs are hormone-aware and include modifications for each phase of the menstrual cycle and perimenopause.'),
  ('gc-005', 'martial_arts_movement', 'Martial Arts & Movement', 'Traditional and modern movement arts: Shaolin, calisthenics, and functional movement.', 5, 2, 7, 'Dynamic drills suit follicular/ovulatory; slower mindful practice suits luteal/menstrual.'),
  ('gc-006', 'mind_body_somatic', 'Mind-Body & Somatic', 'Nervous-system-focused practices including somatic exercise, breathwork, and body awareness.', 6, 1, 3, 'Recommended for menstrual/luteal phases; safe at all times and for all fitness levels.')
ON CONFLICT (id) DO NOTHING;
