// Client-side question mapping from Stoic themes to journaling questions
// Used by StoicSeedCard to generate a writing question without an edge function

const THEME_QUESTIONS: Record<string, string> = {
  control: "What are you trying to hold that isn't yours to control?",
  serenity: "What would it feel like to stop fighting what you cannot change?",
  impermanence: "What are you clinging to that's already moving on?",
  virtue: "Where are you choosing comfort over character today?",
  perception: "What story are you telling yourself — and is it true?",
  anger: "What expectation is your frustration protecting?",
  death: "If this was your last ordinary Tuesday, what would matter?",
  discipline: "Where is the gap between what you intend and what you do?",
  duty: "What is the thing only you can do today?",
  gratitude: "What have you stopped noticing because it's always there?",
  judgment: "What opinion are you holding that's costing you peace?",
  resilience: "What difficulty is shaping you into who you need to become?",
  simplicity: "What could you subtract from today to make space?",
  presence: "Where does your mind keep going when your body is here?",
  courage: "What are you avoiding that you know you need to face?",
  acceptance: "What are you resisting that's already true?",
  purpose: "What would you do today if no one was watching?",
  humility: "Where have you mistaken confidence for certainty?",
  change: "What ending might actually be a beginning?",
  wisdom: "What do you know now that you wish you'd known sooner?",
  kindness: "Who deserves your compassion today — including you?",
  patience: "What would happen if you gave this more time?",
  freedom: "What invisible chain are you still wearing by choice?",
  focus: "What one thing deserves your full attention today?",
  loss: "What have you lost that taught you something you couldn't learn any other way?",
  fear: "What would you attempt if you knew you couldn't fail?",
  time: "How are you spending the hours you'll never get back?",
  power: "Where are you giving away power you didn't need to surrender?",
  truth: "What truth are you dancing around instead of speaking?",
  nature: "What would it look like to move with your nature instead of against it?",
};

const KEYWORDS = Object.keys(THEME_QUESTIONS);

export function getJournalQuestion(title: string, quote: string): string {
  const combined = `${title} ${quote}`.toLowerCase();
  
  for (const keyword of KEYWORDS) {
    if (combined.includes(keyword)) {
      return THEME_QUESTIONS[keyword];
    }
  }
  
  return "What is this reading asking you to notice today?";
}

export default THEME_QUESTIONS;
