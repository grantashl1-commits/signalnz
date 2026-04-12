export interface HabitCarouselCard {
  id: string;
  title: string;
  lesson: string;
  detail: string;
  book: string;
  author: string;
  category: "mindset" | "science" | "strategy" | "motivation" | "self-care" | "foundations";
}

export const HABIT_CAROUSEL_CARDS: HabitCarouselCard[] = [
  {
    id: "card-1",
    title: "Start \"Stupid Small\"",
    lesson: "Begin with changes so tiny they feel silly and impossible to fail.",
    detail: "Consistency builds momentum and rewires your brain. Even on your worst days, you can do one push-up or drink one glass of water.",
    book: "Mini Habits for Fitness",
    author: "Stephen Guise",
    category: "strategy",
  },
  {
    id: "card-2",
    title: "Identity Over Goals",
    lesson: "Focus on who you want to become, not just what you want to achieve.",
    detail: "Instead of 'I want to run,' think 'I am a runner.' When your identity shifts, your actions naturally follow.",
    book: "Atomic Habits",
    author: "James Clear",
    category: "mindset",
  },
  {
    id: "card-3",
    title: "The Two-Minute Rule",
    lesson: "If a habit takes less than two minutes, do it now.",
    detail: "This rule reduces the friction of starting. Once you begin, you'll often continue for much longer than two minutes.",
    book: "Atomic Habits",
    author: "James Clear",
    category: "strategy",
  },
  {
    id: "card-4",
    title: "Embrace Discomfort",
    lesson: "Growth happens outside your comfort zone — seek it daily.",
    detail: "By embracing small discomforts daily, you build resilience and break free from old patterns that hold you back.",
    book: "Make Change That Lasts",
    author: "Dr Rangan Chatterjee",
    category: "mindset",
  },
  {
    id: "card-5",
    title: "Consistency Over Intensity",
    lesson: "Small, repeated actions create permanent neural change.",
    detail: "Your brain physically rewires through repetition. It's not the intensity of a single session — it's showing up every day.",
    book: "Rewire Your Brain",
    author: "Reed Wells",
    category: "science",
  },
  {
    id: "card-6",
    title: "Protect Your Peace",
    lesson: "Set clear boundaries to preserve your energy and well-being.",
    detail: "Learning to say no protects your mental and emotional space. Self-care starts with what you don't do.",
    book: "Tools for Life",
    author: "Kirren Schnack",
    category: "self-care",
  },
  {
    id: "card-7",
    title: "Find Your People",
    lesson: "An accountability partner boosts commitment by 65%.",
    detail: "Having someone who shares your goals provides external motivation and makes it harder to skip your habits.",
    book: "Change Your Habits, Change Your Life",
    author: "Amy Newmark",
    category: "motivation",
  },
  {
    id: "card-8",
    title: "Address the Root Cause",
    lesson: "Understand why you do what you do — not just what you do.",
    detail: "Unhealthy habits are often symptoms of deeper needs. Address the upstream problem for sustainable change.",
    book: "Make Change That Lasts",
    author: "Dr Rangan Chatterjee",
    category: "mindset",
  },
  {
    id: "card-9",
    title: "Connection is Medicine",
    lesson: "Strong social bonds are the #1 predictor of longevity.",
    detail: "The Harvard Study of Adult Development (75 years of data) found relationships matter more than diet, exercise, or genetics.",
    book: "Powerful Habits for Aging Well",
    author: "Fair Winds Press",
    category: "foundations",
  },
  {
    id: "card-10",
    title: "Real Self-Care",
    lesson: "Self-care is about values-aligned choices, not pampering.",
    detail: "Move beyond bubble baths and face masks. Real self-care involves setting boundaries, practicing compassion, and asserting your needs.",
    book: "Real Self-Care",
    author: "Pooja Lakshmin",
    category: "self-care",
  },
  {
    id: "card-11",
    title: "Be the Editor",
    lesson: "Deliberately subtract what doesn't serve you.",
    detail: "You are the editor of your life, not just the author. Ruthlessly eliminate distractions that don't align with your priorities.",
    book: "Unhinged Habits",
    author: "Jonathan Goodman",
    category: "strategy",
  },
  {
    id: "card-12",
    title: "Stack Your Habits",
    lesson: "Link a new habit to an existing one for effortless consistency.",
    detail: "After I pour my coffee → I write 3 gratitudes. Habit stacking uses existing neural pathways as anchors for new behaviours.",
    book: "Atomic Habits",
    author: "James Clear",
    category: "strategy",
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  mindset: "hsl(280, 60%, 50%)",
  science: "hsl(210, 70%, 50%)",
  strategy: "hsl(160, 60%, 40%)",
  motivation: "hsl(35, 80%, 50%)",
  "self-care": "hsl(330, 50%, 50%)",
  foundations: "hsl(260, 40%, 55%)",
};
