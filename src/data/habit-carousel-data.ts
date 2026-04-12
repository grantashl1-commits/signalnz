export interface HabitCarouselCard {
  id: string;
  title: string;
  wisdom: string;
  vision: string;
  book: string;
  author: string;
  category: "mindset" | "science" | "strategy" | "motivation" | "self-care" | "foundations";
  arcana: string;
  numeral: string;
  motif: "moon" | "sun" | "flower" | "leaf" | "star" | "crystal" | "wave" | "seed" | "feather" | "flame";
}

export const HABIT_CAROUSEL_CARDS: HabitCarouselCard[] = [
  {
    id: "card-1", arcana: "The Seed", numeral: "I", motif: "seed",
    title: "Start Stupid Small",
    wisdom: "If you begin with changes so tiny they feel impossible to fail…",
    vision: "…your life becomes a chain of small victories that compound into unstoppable momentum.",
    book: "Mini Habits for Fitness", author: "Stephen Guise", category: "strategy",
  },
  {
    id: "card-2", arcana: "The Mirror", numeral: "II", motif: "moon",
    title: "Identity Over Goals",
    wisdom: "If you focus on who you want to become instead of what you want to achieve…",
    vision: "…your actions naturally align with the woman you're becoming, effortlessly.",
    book: "Atomic Habits", author: "James Clear", category: "mindset",
  },
  {
    id: "card-3", arcana: "The Spark", numeral: "III", motif: "flame",
    title: "The Two-Minute Rule",
    wisdom: "If you commit to just two minutes when resistance is high…",
    vision: "…you'll break the friction of starting, and momentum will carry you forward.",
    book: "Atomic Habits", author: "James Clear", category: "strategy",
  },
  {
    id: "card-4", arcana: "The Flame", numeral: "IV", motif: "flame",
    title: "Embrace Discomfort",
    wisdom: "If you seek small discomforts daily instead of avoiding them…",
    vision: "…you'll build a resilience that makes old patterns dissolve like smoke.",
    book: "Make Change That Lasts", author: "Dr Rangan Chatterjee", category: "mindset",
  },
  {
    id: "card-5", arcana: "The Thread", numeral: "V", motif: "wave",
    title: "Consistency Over Intensity",
    wisdom: "If you show up every single day, even imperfectly…",
    vision: "…your brain will physically rewire, creating permanent neural pathways of change.",
    book: "Rewire Your Brain", author: "Reed Wells", category: "science",
  },
  {
    id: "card-6", arcana: "The Shield", numeral: "VI", motif: "crystal",
    title: "Protect Your Peace",
    wisdom: "If you set clear boundaries and learn to say no…",
    vision: "…your energy becomes sacred, and self-care starts with what you don't do.",
    book: "Tools for Life", author: "Kirren Schnack", category: "self-care",
  },
  {
    id: "card-7", arcana: "The Bond", numeral: "VII", motif: "flower",
    title: "Find Your People",
    wisdom: "If you find someone who shares your goals and holds you accountable…",
    vision: "…your commitment deepens by 65%, and the journey becomes shared joy.",
    book: "Change Your Habits, Change Your Life", author: "Amy Newmark", category: "motivation",
  },
  {
    id: "card-8", arcana: "The Root", numeral: "VIII", motif: "leaf",
    title: "Address the Root Cause",
    wisdom: "If you ask why you do what you do, not just what you do…",
    vision: "…you heal the upstream wound, and surface-level habits transform naturally.",
    book: "Make Change That Lasts", author: "Dr Rangan Chatterjee", category: "mindset",
  },
  {
    id: "card-9", arcana: "The Hearth", numeral: "IX", motif: "sun",
    title: "Connection is Medicine",
    wisdom: "If you nurture deep, genuine bonds with the people around you…",
    vision: "…you unlock the single greatest predictor of longevity — stronger than diet or exercise.",
    book: "Powerful Habits for Aging Well", author: "Fair Winds Press", category: "foundations",
  },
  {
    id: "card-10", arcana: "The Compass", numeral: "X", motif: "star",
    title: "Real Self-Care",
    wisdom: "If you move beyond pampering to values-aligned choices…",
    vision: "…your self-care becomes a practice of boundaries, compassion, and asserting your true needs.",
    book: "Real Self-Care", author: "Pooja Lakshmin", category: "self-care",
  },
  {
    id: "card-11", arcana: "The Blade", numeral: "XI", motif: "feather",
    title: "Be the Editor",
    wisdom: "If you ruthlessly subtract what doesn't serve you…",
    vision: "…your life becomes a curated masterpiece, not a cluttered draft.",
    book: "Unhinged Habits", author: "Jonathan Goodman", category: "strategy",
  },
  {
    id: "card-12", arcana: "The Chain", numeral: "XII", motif: "wave",
    title: "Stack Your Habits",
    wisdom: "If you link a new habit to one you already do without thinking…",
    vision: "…existing neural pathways become anchors, making new behaviours effortless.",
    book: "Atomic Habits", author: "James Clear", category: "strategy",
  },
  {
    id: "card-13", arcana: "The Well", numeral: "XIII", motif: "crystal",
    title: "Nourish Your Gut",
    wisdom: "If you feed your microbiome with 30 different plants each week…",
    vision: "…your mood, immunity, and energy will transform from the inside out.",
    book: "Fibre Fuelled", author: "Dr Will Bulsiewicz", category: "science",
  },
  {
    id: "card-14", arcana: "The Rhythm", numeral: "XIV", motif: "moon",
    title: "Honour Your Cycle",
    wisdom: "If you sync your habits to your hormonal phases instead of fighting them…",
    vision: "…you'll work with your body's wisdom and find flow where you once found friction.",
    book: "In the FLO", author: "Alisa Vitti", category: "foundations",
  },
  {
    id: "card-15", arcana: "The Dawn", numeral: "XV", motif: "sun",
    title: "Win the Morning",
    wisdom: "If you protect your first hour from screens and distractions…",
    vision: "…you set a tone of intentionality that ripples through your entire day.",
    book: "The Miracle Morning", author: "Hal Elrod", category: "strategy",
  },
  {
    id: "card-16", arcana: "The Anchor", numeral: "XVI", motif: "leaf",
    title: "Environment Shapes You",
    wisdom: "If you design your surroundings for the habits you want…",
    vision: "…willpower becomes unnecessary — your environment does the heavy lifting.",
    book: "Atomic Habits", author: "James Clear", category: "science",
  },
  {
    id: "card-17", arcana: "The River", numeral: "XVII", motif: "wave",
    title: "Let Go of Perfection",
    wisdom: "If you embrace 'good enough' and release the need to be perfect…",
    vision: "…you'll actually finish things, and progress will replace paralysis.",
    book: "The Gifts of Imperfection", author: "Brené Brown", category: "mindset",
  },
  {
    id: "card-18", arcana: "The Lantern", numeral: "XVIII", motif: "flame",
    title: "Track What Matters",
    wisdom: "If you measure the behaviours that lead to results, not just the results themselves…",
    vision: "…you stay motivated by evidence of your own commitment.",
    book: "Atomic Habits", author: "James Clear", category: "strategy",
  },
  {
    id: "card-19", arcana: "The Garden", numeral: "XIX", motif: "flower",
    title: "Rest is Productive",
    wisdom: "If you treat rest as a non-negotiable part of your growth…",
    vision: "…your energy regenerates and your next effort becomes twice as powerful.",
    book: "Sacred Rest", author: "Dr Saundra Dalton-Smith", category: "self-care",
  },
  {
    id: "card-20", arcana: "The Tide", numeral: "XX", motif: "wave",
    title: "Emotions Are Data",
    wisdom: "If you observe your emotions with curiosity instead of judgement…",
    vision: "…they become a compass guiding you toward what truly matters.",
    book: "Emotional Agility", author: "Susan David", category: "mindset",
  },
  {
    id: "card-21", arcana: "The Crown", numeral: "XXI", motif: "crystal",
    title: "Celebrate Every Win",
    wisdom: "If you mark every small victory with genuine acknowledgement…",
    vision: "…your brain learns to associate the habit with joy, making it self-reinforcing.",
    book: "Tiny Habits", author: "BJ Fogg", category: "motivation",
  },
  {
    id: "card-22", arcana: "The Nest", numeral: "XXII", motif: "feather",
    title: "Sleep is the Foundation",
    wisdom: "If you protect your sleep above all other health habits…",
    vision: "…every other habit becomes easier — willpower, mood, and focus all restore overnight.",
    book: "Why We Sleep", author: "Matthew Walker", category: "foundations",
  },
  {
    id: "card-23", arcana: "The Spring", numeral: "XXIII", motif: "leaf",
    title: "Move Your Body Daily",
    wisdom: "If you move for just 20 minutes every day, in any way that feels good…",
    vision: "…anxiety quiets, confidence rises, and your body remembers what it was built for.",
    book: "Spark", author: "John J. Ratey", category: "foundations",
  },
  {
    id: "card-24", arcana: "The Vessel", numeral: "XXIV", motif: "crystal",
    title: "Hydrate First",
    wisdom: "If you drink water before reaching for caffeine every morning…",
    vision: "…your cells wake up naturally and your energy lasts longer than any coffee can give.",
    book: "Quench", author: "Dr Dana Cohen", category: "foundations",
  },
  {
    id: "card-25", arcana: "The Whisper", numeral: "XXV", motif: "feather",
    title: "Listen to Your Body",
    wisdom: "If you pause to notice what your body is asking for each day…",
    vision: "…you'll discover an inner wisdom far more reliable than any external advice.",
    book: "The Body Keeps the Score", author: "Bessel van der Kolk", category: "self-care",
  },
  {
    id: "card-26", arcana: "The Weave", numeral: "XXVI", motif: "star",
    title: "Gratitude Rewires the Brain",
    wisdom: "If you write three things you're grateful for each night before sleep…",
    vision: "…your brain literally builds new neural pathways that default to positivity.",
    book: "Rewire Your Brain", author: "Reed Wells", category: "science",
  },
  {
    id: "card-27", arcana: "The Stone", numeral: "XXVII", motif: "crystal",
    title: "Ground Yourself Daily",
    wisdom: "If you spend five minutes each day with your feet on the earth…",
    vision: "…your nervous system recalibrates and stress dissolves at a cellular level.",
    book: "Earthing", author: "Clint Ober", category: "self-care",
  },
  {
    id: "card-28", arcana: "The Forge", numeral: "XXVIII", motif: "flame",
    title: "Discomfort is the Price",
    wisdom: "If you accept that growth requires temporary discomfort…",
    vision: "…you stop running from change and start walking toward the life you want.",
    book: "Can't Hurt Me", author: "David Goggins", category: "motivation",
  },
  {
    id: "card-29", arcana: "The Bloom", numeral: "XXIX", motif: "flower",
    title: "Comparison is Poison",
    wisdom: "If you stop measuring your chapter one against someone else's chapter twenty…",
    vision: "…your own path becomes clear, beautiful, and entirely your own.",
    book: "The Gifts of Imperfection", author: "Brené Brown", category: "mindset",
  },
  {
    id: "card-30", arcana: "The Breath", numeral: "XXX", motif: "sun",
    title: "Breathe Before You React",
    wisdom: "If you take three slow breaths before responding to stress…",
    vision: "…you shift from survival mode to wisdom, and your responses become choices.",
    book: "Breath", author: "James Nestor", category: "foundations",
  },
  {
    id: "card-31", arcana: "The Horizon", numeral: "XXXI", motif: "sun",
    title: "Your Future Self is Watching",
    wisdom: "If you make each choice as a gift to the woman you'll be in five years…",
    vision: "…every small act of discipline becomes an act of deep self-love.",
    book: "Your Future Self Will Thank You", author: "Drew Dyck", category: "motivation",
  },
  {
    id: "card-32", arcana: "The Stillness", numeral: "XXXII", motif: "moon",
    title: "Do Less, Be More",
    wisdom: "If you create pockets of true stillness in your busy day…",
    vision: "…clarity finds you, and the right action reveals itself without force.",
    book: "Stillness is the Key", author: "Ryan Holiday", category: "mindset",
  },
  {
    id: "card-33", arcana: "The Elixir", numeral: "XXXIII", motif: "leaf",
    title: "Food is Information",
    wisdom: "If you treat every meal as instructions you're sending to your cells…",
    vision: "…your body receives the blueprint for vitality instead of inflammation.",
    book: "Food Fix", author: "Dr Mark Hyman", category: "science",
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
