// Defaults grounded in: Gentle Discipline (Ockwell-Smith), Have a New Kid by Friday (Leman),
// How to Talk So Kids Will Listen (Faber/Mazlish), Raising Good Humans (Clarke-Fields).
// Tone: name the behaviour (not the child), short and concrete, privileges over toys.

export const DEFAULT_MUST_CHORES = [
  { name: "Made the bed", points: 1 },
  { name: "Brushed teeth (morning)", points: 1 },
  { name: "Brushed teeth (night)", points: 1 },
  { name: "Got dressed without prompting", points: 2 },
  { name: "Cleared the plate after dinner", points: 1 },
  { name: "Tidied bedroom", points: 2 },
  { name: "Packed school bag", points: 2 },
];

export const DEFAULT_BONUS_CHORES = [
  { name: "Helped a sibling without being asked", points: 5 },
  { name: "Did homework without reminders", points: 4 },
  { name: "Read for 20 minutes", points: 3 },
  { name: "Helped cook dinner", points: 4 },
  { name: "Took out the rubbish", points: 3 },
  { name: "Folded laundry", points: 4 },
];

export const DEFAULT_BEHAVIOURS = [
  { name: "Hit a sibling", penalty: 10, reset_to_zero: false },
  { name: "Yelling at a parent", penalty: 5, reset_to_zero: false },
  { name: "Refused a chore", penalty: 5, reset_to_zero: false },
  { name: "Lying", penalty: 8, reset_to_zero: false },
  { name: "Name-calling", penalty: 5, reset_to_zero: false },
  { name: "Big rule broken (full reset)", penalty: 0, reset_to_zero: true },
];

export const DEFAULT_REWARDS = [
  { name: "30 minutes extra screen time", target_points: 25 },
  { name: "Pick the family movie", target_points: 40 },
  { name: "Friend over for a playdate", target_points: 60 },
  { name: "Choose a weekend activity", target_points: 80 },
];
