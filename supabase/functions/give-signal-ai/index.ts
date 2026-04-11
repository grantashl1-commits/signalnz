import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------------------------------------------------------------------------
// Fable library — from "The Dao in Action" by Dr. Yang Jwing-Ming (23 fables)
// ---------------------------------------------------------------------------
const FABLE_LIBRARY = [
  { title: "The Taller the Bamboo Grows, the Lower It Bows", story: "A bamboo shoot believed if it kept growing it would one day reach the sky. Ten years passed. Twenty years passed. The sky was still beyond reach. Finally the bamboo realised something and began to bow. The more it grew, the lower it bowed.", wisdom: "The more you have grown, the more naturally you move toward humility. The height is in the bowing.", themes: ["follicular", "ovulatory", "growth", "humility"] },
  { title: "Carry a Heavy Bucket", story: "A master asked his students which of ten buckets they would choose to carry. Most chose empty or half-full. Only a few chose the full one. The master said: those who carry the full bucket will have a chance to condition their body.", wisdom: "The weight you don't avoid is the weight that makes you strong.", themes: ["follicular", "luteal", "effort", "growth"] },
  { title: "The Engineer Serves Coffee", story: "A Chinese engineer with a PhD was told by his jealous boss to bring him coffee every morning. He agreed quietly and did it without argument for a year. He worked hard, earned the trust of everyone.", wisdom: "Non-contention is not weakness. Quiet dignity holds more power than any argument.", themes: ["luteal", "menstrual", "patience", "dignity"] },
  { title: "Two Monks and a Lady", story: "Two monks came to a flooded path. A woman stood crying. One monk lifted her and carried her across. Miles later, the second monk said in anger: 'You shouldn't have touched her.' The first replied: 'I set her down miles ago. Why are you still carrying her?'", wisdom: "What you set down, set down completely. The burden you're still carrying may have been released long ago.", themes: ["menstrual", "luteal", "release", "letting go"] },
  { title: "A Blessing in Disguise", story: "An old man's horse escaped. Neighbours grieved. The horse returned with a mare. His son rode, fell, was crippled. Two years later, every young man was drafted to war and most killed. His crippled son was spared.", wisdom: "Fortune hides inside what looks like disaster. The current moment is never the whole story.", themes: ["all", "trust", "cycles", "uncertainty"] },
  { title: "Two Tigers", story: "One tiger lived in the wild, one in a cage. Both believed their conditions were poor. They exchanged places. Both were happy at first. In the end, one died of hunger and the other died of depression.", wisdom: "Your nature is not your cage — it is your home.", themes: ["all", "self", "nature", "identity"] },
  { title: "A Bowl of Example", story: "A grandmother's shaking hands made her spill food. Her daughter-in-law had her eat alone from a chipped bowl. The grandson said: 'I was saving that bowl for my mother when she gets old.' The mother's face went pale. From that day, the family ate together again.", wisdom: "Every act you take is a bowl the next generation will eat from.", themes: ["ovulatory", "all", "lineage", "kindness"] },
  { title: "A Bowl of Noodle Soup", story: "Xiaoying stormed out after a fight with her mother. A street-stall owner gave her free noodle soup. She wept. He asked: 'Have you thought about how many bowls your mother has cooked for you since you were born?' Xiaoying ran home.", wisdom: "The one we overlook most is often the one who has never stopped feeding us.", themes: ["all", "gratitude", "love", "belonging"] },
  { title: "A Donkey, a Father, and a Son", story: "A father and son walked with a donkey. People criticised everything — not riding it, son riding, father riding, both riding. Finally they put the donkey down and ignored everyone.", wisdom: "You cannot arrange yourself to please every passing voice. At some point, you put the donkey down and keep walking your own path.", themes: ["all", "self-direction", "inner compass"] },
  { title: "A Fight of No Fight", story: "De-Yi was driven from his land by his violent brother. At a monastery he was given a task: hold a calf and jump over a willow tree, morning and evening. Three years passed. The calf became a cow. When he returned, his brother came running at him. De-Yi picked up the cow and walked toward him.", wisdom: "Strength built quietly over time doesn't need to announce itself.", themes: ["follicular", "luteal", "quiet strength", "patience"] },
  { title: "Carving a Buddha", story: "An orphan was told to carve a Buddha from a tree. The abbot kept saying: too big. Make it smaller. After disappointment, one morning he said: if this is the only path, I will do it with joy. The final Buddha was two inches and exquisitely radiant.", wisdom: "The work is the willingness to keep carving after disappointment.", themes: ["menstrual", "follicular", "perseverance", "surrender"] },
  { title: "The Mind of Wonders", story: "A student told his master he was falling behind. The master said: success is like plowing a field — bow your head and keep digging. Only someday when you take a break will you find everyone is far behind.", wisdom: "Your path is ploughed by looking at your own soil, not at your neighbour's.", themes: ["follicular", "luteal", "focus", "comparison"] },
  { title: "Boiling a Pot of Water", story: "A young man kept failing. A wise man told him to boil water for tea. He filled a huge pot, ran out of wood, returned to find the fire out. The old man said: 'What if you had filled the pot with less water?'", wisdom: "Not every worthy goal needs the largest pot. Sometimes reducing is what finally allows completion.", themes: ["luteal", "all", "focus", "overwhelm"] },
  { title: "Clench the Fist Tightly", story: "An old man told a boy: clench your fist. 'What do you feel?' 'Tired.' 'Clench tighter.' 'Suffocated.' 'Now loosen it.' 'Relaxed.' 'You must know when to loosen or you will collapse.'", wisdom: "The hand that cannot release will never be able to receive anything new.", themes: ["menstrual", "luteal", "rest", "release"] },
  { title: "Confucius Learns the Zither", story: "His teacher kept saying: move to a new piece. But Confucius practised deeper — mastering skill, then feeling, then the composer's heart, until he stood on high ground gazing far ahead.", wisdom: "There are four layers: skill, feeling, the composer's heart, and the view from high ground. Most stop at the first.", themes: ["follicular", "ovulatory", "depth", "mastery"] },
  { title: "Grind the Steel Rod into a Needle", story: "Li Bai found an old woman grinding a thick iron pestle on a stone. 'I want to grind this into a needle.' She said: 'As long as I have a strong will and keep at it, there is nothing that cannot be done.'", wisdom: "The needle is already in the pestle. Patient effort reveals it.", themes: ["follicular", "menstrual", "discipline", "persistence"] },
  { title: "Foolish Old Man Moves the Mountain", story: "A ninety-year-old decided to move two mountains. His sons, their sons, generation by generation. 'The mountains cannot grow. We can keep digging.'", wisdom: "What feels impossible in one lifetime is simply very long work.", themes: ["all", "long vision", "persistence", "legacy"] },
  { title: "Sharing Food in Heaven and Hell", story: "In hell, everyone starved — the spoons were too long to feed themselves. In heaven, same spoons. Everyone was full. They were feeding each other.", wisdom: "The same tools. The only difference is the direction you turn the spoon.", themes: ["ovulatory", "all", "community", "generosity"] },
  { title: "Different Paths", story: "Two rich friends learned they had three weeks to live. One withdrew in fear. The other gave his fortune to the poor and was so busy he forgot he was dying.", wisdom: "Generosity is not just virtue — it is the sound that drowns out what you fear.", themes: ["ovulatory", "all", "generosity", "fear"] },
  { title: "Good Retribution of a Kind Heart", story: "Mr. Yi found a bag of silver coins and waited all day for its owner, missing his boat. The grateful young man returned. The next day they met again. The boat had capsized overnight. Twenty-three passengers drowned.", wisdom: "The act of returning what is not yours can change the entire current of what comes next.", themes: ["all", "integrity", "kindness", "trust"] },
  { title: "Learn What to Pick Up", story: "Two friends climbed a mountain for precious stones. One filled her backpack. The other took only a few. On the descent, the full backpack was impossibly heavy.", wisdom: "You will carry what you choose and drop what you must. The question is whether you choose first, or the mountain decides for you.", themes: ["luteal", "menstrual", "discernment", "release"] },
  { title: "One Perfect Kick", story: "A student watched her master practise one hundred perfect kicks. 'How?' 'I did not do one hundred perfect kicks. I did one perfect kick — one hundred times.'", wisdom: "There is no such thing as a hundred achievements. There is only one act, done again and again.", themes: ["follicular", "all", "practice", "presence"] },
  { title: "Carry Thorns to Request Forgiveness", story: "A powerful general was jealous of a civilian promoted above him. The civilian avoided confrontation. When the general heard his reasoning, he tied a birch rod to his bare back and walked to the official's home.", wisdom: "The strongest person in the room is often the one who chose not to fight.", themes: ["all", "forgiveness", "humility", "reconciliation"] },
];

// ---------------------------------------------------------------------------
// Daodejing — all 81 chapters (key verses with cycle phase themes)
// ---------------------------------------------------------------------------
const DAO_VERSES = [
  { chapter: "Chapter 1", text: "A Way that can be followed is not a constant Way. A name that can be named is not a constant name. Nameless, it is the beginning of Heaven and Earth; Named, it is the mother of the myriad creatures.", themes: ["menstrual", "follicular", "ovulatory"] },
  { chapter: "Chapter 2", text: "Everyone in the world knows that when the beautiful strives to be beautiful, it is repulsive. To have and to lack generate each other. Difficult and easy give form to each other.", themes: ["follicular", "ovulatory"] },
  { chapter: "Chapter 4", text: "The Way is like an empty vessel; No use could ever fill it up. Vast and deep! It blunts their sharpness; Untangles their tangles; Softens their glare; Merges with their dust.", themes: ["menstrual", "follicular", "luteal"] },
  { chapter: "Chapter 6", text: "The spirit of the valley never dies; She is called the Enigmatic Female. The portal of the Enigmatic Female is called the root of Heaven and Earth.", themes: ["menstrual", "ovulatory"] },
  { chapter: "Chapter 8", text: "The highest good is like water. Water is good at benefiting the myriad creatures, while not contending with them. It resides in places that people find repellent, and so comes close to the Way.", themes: ["menstrual", "ovulatory"] },
  { chapter: "Chapter 9", text: "To hold the vessel upright in order to fill it is not as good as to stop in time. If you make your blade too keen it will not hold its edge.", themes: ["ovulatory", "luteal"] },
  { chapter: "Chapter 11", text: "Thirty spokes are joined in the hub of a wheel. But only by relying on what is not there, do we have the use of the carriage.", themes: ["all"] },
  { chapter: "Chapter 15", text: "In ancient times, the best scholars were subtle, mysterious, enigmatic, and far-reaching. Poised, like one who must ford a stream in winter.", themes: ["menstrual"] },
  { chapter: "Chapter 16", text: "Attain extreme tenuousness; Preserve quiet integrity. Each returns home to its root; returning to one's root is called stillness.", themes: ["menstrual", "luteal"] },
  { chapter: "Chapter 22", text: "Those who are crooked will be perfected. Those who are bent will be straight. Those who are empty will be full. Those who are worn will be renewed.", themes: ["menstrual", "follicular"] },
  { chapter: "Chapter 25", text: "There is a thing confused yet perfect, which arose before Heaven and Earth. Still and indistinct, it stands alone and unchanging. It goes everywhere and is never at a loss.", themes: ["all"] },
  { chapter: "Chapter 28", text: "Know the male but preserve the female, and be a canyon for all the world. Constant Virtue will never leave you, and you can return home to be a child.", themes: ["menstrual", "follicular"] },
  { chapter: "Chapter 29", text: "Those who would gain the world and do something with it, I see that they will fail. For the world is a spiritual vessel and one cannot put it to use.", themes: ["menstrual"] },
  { chapter: "Chapter 33", text: "Those who know others are knowledgeable; Those who know themselves are enlightened. Those who conquer others have power; Those who conquer themselves are strong.", themes: ["follicular", "ovulatory"] },
  { chapter: "Chapter 36", text: "What you intend to shrink, you first must stretch. What you intend to weaken, you first must strengthen. What you intend to cast off, you first must raise up.", themes: ["follicular", "luteal"] },
  { chapter: "Chapter 37", text: "The Way never does anything, yet nothing is left undone.", themes: ["menstrual", "luteal"] },
  { chapter: "Chapter 40", text: "Turning back is how the Way moves. Weakness is how the Way operates. The myriad creatures of the world arise from what is there. What is there arises from what is not there.", themes: ["menstrual", "luteal"] },
  { chapter: "Chapter 43", text: "The most supple things in the world ride roughshod over the most rigid. That which is not there can enter in, even where there is no space.", themes: ["follicular"] },
  { chapter: "Chapter 44", text: "Your name or your body: which is more dear? Your body or your goods: which is worth more? Gain or loss: which is the greater ailment?", themes: ["luteal"] },
  { chapter: "Chapter 46", text: "When the Way prevails in the world, swift horses are used to haul manure. When the Way does not prevail, war horses are bred at the borders. No crime is greater than having too many desires.", themes: ["menstrual", "luteal"] },
  { chapter: "Chapter 47", text: "Without going out the door, one can know the whole world. Without looking out the window, one can see the Way of Heaven.", themes: ["menstrual", "luteal"] },
  { chapter: "Chapter 48", text: "In the pursuit of learning, one does more each day. In the pursuit of the Way, one does less each day. One does nothing yet nothing is left undone.", themes: ["menstrual", "luteal"] },
  { chapter: "Chapter 52", text: "The world had a beginning, which can be considered the mother of the world. Having got the mother, in order to know her children; knowing her children, return and hold fast to the mother.", themes: ["menstrual", "follicular"] },
  { chapter: "Chapter 55", text: "Those who are steeped in Virtue are like newborn children. Their bones are weak and sinews yielding and yet their grip is firm.", themes: ["follicular"] },
  { chapter: "Chapter 56", text: "Those who know do not talk about it; Those who talk about it do not know. Block the openings; Shut the doors; Blunt the sharpness.", themes: ["menstrual"] },
  { chapter: "Chapter 58", text: "Good fortune rests upon disaster; Disaster lies hidden within good fortune. Who knows the limit? Sages are square but do not cut, shining but not dazzling.", themes: ["all"] },
  { chapter: "Chapter 63", text: "Act without acting. Work without working. Taste the tasteless. Regard the small as great, the few as many.", themes: ["menstrual", "luteal"] },
  { chapter: "Chapter 64", text: "A tree that fills a person's embrace grew from a tiny sprout. A terrace nine stories high arose from a small pile of earth. A journey of one thousand li began with a single step.", themes: ["follicular"] },
  { chapter: "Chapter 66", text: "Rivers and seas are able to reign over the hundred valley streams because they are good at lying below them.", themes: ["menstrual"] },
  { chapter: "Chapter 76", text: "When people are alive they are supple and soft. When they are dead, they are hard and stiff. The stiff and unbending is the disciple of death. The soft and yielding is the disciple of life.", themes: ["follicular", "menstrual"] },
  { chapter: "Chapter 78", text: "In all the world, nothing is more supple or weak than water; Yet nothing can surpass it for attacking what is stiff and strong.", themes: ["menstrual", "follicular"] },
  { chapter: "Chapter 81", text: "Words worthy of trust are not beautiful; Words that are beautiful are not worthy of trust. The good do not engage in disputation; Those who engage in disputation are not good.", themes: ["all"] },
];

// ---------------------------------------------------------------------------
// Astrology sign profiles (synthesised from multiple astrology texts)
// ---------------------------------------------------------------------------
const SIGN_PROFILES: Record<string, { element: string; quality: string; ruling_planet: string; shadow: string; gift: string; self_care: string; body_zone: string }> = {
  Aries: { element: "fire", quality: "Initiating force, the first breath of spring, courage that doesn't yet know fear", ruling_planet: "Mars", shadow: "Impatience, burnout from refusing to pause", gift: "The ability to begin again without hesitation", self_care: "Movement that releases anger — boxing, sprinting, dancing hard", body_zone: "Head and face" },
  Taurus: { element: "earth", quality: "Deep rooting, the patience of stone, sensual knowing through the body", ruling_planet: "Venus", shadow: "Stubbornness that resists necessary change", gift: "The ability to be fully present in physical experience", self_care: "Slow meals, warm baths, time in gardens, tactile pleasure", body_zone: "Throat and neck" },
  Gemini: { element: "air", quality: "Quicksilver mind, the crossroads, the gift of seeing two truths at once", ruling_planet: "Mercury", shadow: "Scattered attention, difficulty committing to one path", gift: "The ability to translate complexity into words", self_care: "Journaling, conversation, learning something new, variety", body_zone: "Hands and lungs" },
  Cancer: { element: "water", quality: "The shell and the ocean inside it, tidal feeling, ancestral memory", ruling_planet: "Moon", shadow: "Over-protecting to the point of isolation", gift: "The ability to create sanctuary wherever you are", self_care: "Home rituals, cooking, water immersion, nostalgic music", body_zone: "Chest and stomach" },
  Leo: { element: "fire", quality: "The solar heart, generous radiance, the courage to be fully seen", ruling_planet: "Sun", shadow: "Need for external validation, wounded pride", gift: "The ability to make others feel special by your presence", self_care: "Creative expression, sunlight, playfulness, performing", body_zone: "Heart and spine" },
  Virgo: { element: "earth", quality: "Devoted discernment, the harvest, wholeness through small careful acts", ruling_planet: "Mercury", shadow: "Perfectionism that delays self-compassion", gift: "The ability to see what needs tending before others notice", self_care: "Organising a space, herbal tea, nature walks, routine", body_zone: "Digestive system" },
  Libra: { element: "air", quality: "The scales in the wind, relational truth, beauty as a form of justice", ruling_planet: "Venus", shadow: "People-pleasing that erases your own needs", gift: "The ability to hold two perspectives without losing your own", self_care: "Aesthetic experiences, partnership conversations, art", body_zone: "Kidneys and lower back" },
  Scorpio: { element: "water", quality: "Depth without bottom, transformation through what is not spoken", ruling_planet: "Pluto", shadow: "Intensity that becomes control or obsession", gift: "The ability to see through surface into the real", self_care: "Deep journaling, shadow work, intimacy, solitude", body_zone: "Reproductive system" },
  Sagittarius: { element: "fire", quality: "The archer and the horizon, philosophy as lived experience, wild faith", ruling_planet: "Jupiter", shadow: "Restlessness that avoids depth by always moving", gift: "The ability to find meaning in what others call chaos", self_care: "Travel, philosophy, outdoor adventures, storytelling", body_zone: "Hips and thighs" },
  Capricorn: { element: "earth", quality: "The mountain's patience, long vision, authority earned through time", ruling_planet: "Saturn", shadow: "Self-denial disguised as discipline", gift: "The ability to build things that last", self_care: "Structure, planning, quality rest, recognising achievements", body_zone: "Bones and joints" },
  Aquarius: { element: "air", quality: "The lightning mind, kinship with the future, love of what could be", ruling_planet: "Uranus", shadow: "Emotional detachment in the name of independence", gift: "The ability to envision what doesn't exist yet", self_care: "Community, innovation, causes you believe in, freedom", body_zone: "Ankles and circulation" },
  Pisces: { element: "water", quality: "The dissolved edge, oceanic empathy, dreaming as navigation", ruling_planet: "Neptune", shadow: "Absorption of others' pain without boundaries", gift: "The ability to feel what cannot be said", self_care: "Music, water, sleep, creative imagination, solitude", body_zone: "Feet and lymphatic system" },
};

const CYCLE_QUALITIES: Record<string, string> = {
  menstrual: "inner winter — the body drawing inward like a river to its source, visions arise in stillness",
  follicular: "inner spring — energy rising, the ground warming before shoots appear",
  ovulatory: "inner summer — full brightness, the gift ready to be given, the voice carrying further",
  luteal: "inner autumn — gathering what matters, releasing what doesn't, the wisdom of decreasing",
};

const MOON_QUALITIES: Record<string, string> = {
  "new moon": "the sky completely dark, seeds resting below the surface",
  "waxing crescent": "a thin blade of light appearing at the edge, already in motion",
  "first quarter": "half-lit, the moment of decision and momentum",
  "waxing gibbous": "almost full, energy building, the last stretch before completion",
  "full moon": "complete brightness, illumination without shadow, everything visible",
  "waning gibbous": "the fullness beginning to release, a slow generous giving-back",
  "last quarter": "half of the light returned, clearing, making space",
  "waning crescent": "the thinnest sliver, the breath before the next beginning",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSunSign(dob: string): string {
  const date = new Date(dob);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function getMoonPhase(date: Date): string {
  const referenceNewMoon = new Date("2024-01-11T00:00:00Z");
  const synodicPeriod = 29.53059;
  const daysSinceRef = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceRef % synodicPeriod) + synodicPeriod) % synodicPeriod;
  if (phase < 1.85) return "new moon";
  if (phase < 7.38) return "waxing crescent";
  if (phase < 9.22) return "first quarter";
  if (phase < 14.77) return "waxing gibbous";
  if (phase < 16.61) return "full moon";
  if (phase < 22.15) return "waning gibbous";
  if (phase < 23.99) return "last quarter";
  return "waning crescent";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickFable(cyclePhase: string) {
  const relevant = FABLE_LIBRARY.filter((f) => f.themes.includes(cyclePhase) || f.themes.includes("all"));
  return pickRandom(relevant.length > 0 ? relevant : FABLE_LIBRARY);
}

function pickVerse(cyclePhase: string) {
  const relevant = DAO_VERSES.filter((v) => v.themes.includes(cyclePhase) || v.themes.includes("all"));
  return pickRandom(relevant.length > 0 ? relevant : DAO_VERSES);
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dob, cyclePhase, cycleDay, userId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // --- Gather user context in parallel ---
    const sunSign = dob ? getSunSign(dob) : null;
    const moonPhase = getMoonPhase(new Date());
    const signProfile = sunSign ? SIGN_PROFILES[sunSign] : null;
    const cycleQuality = CYCLE_QUALITIES[cyclePhase] || "a moment of natural transition";
    const moonQuality = MOON_QUALITIES[moonPhase] || "";
    const fable = pickFable(cyclePhase);
    const verse = pickVerse(cyclePhase);

    // Fetch user's recent journal entries, recent moods, recent meals (if user is authenticated)
    let journalContext = "";
    let recentMoods = "";
    let recentHabits = "";

    if (userId) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

      const [journalResult, cycleResult, habitResult] = await Promise.all([
        supabase
          .from("journal_entries")
          .select("content, mood, emotional_tone, entry_type, date")
          .eq("user_id", userId)
          .gte("date", sevenDaysAgo)
          .order("date", { ascending: false })
          .limit(5),
        supabase
          .from("cycle_logs")
          .select("mood, symptoms, energy, notes")
          .eq("user_id", userId)
          .gte("log_date", sevenDaysAgo)
          .order("log_date", { ascending: false })
          .limit(5),
        supabase
          .from("habit_logs")
          .select("completion_pct, log_date")
          .eq("user_id", userId)
          .gte("log_date", sevenDaysAgo)
          .order("log_date", { ascending: false })
          .limit(3),
      ]);

      if (journalResult.data?.length) {
        const entries = journalResult.data
          .filter((e: any) => e.content)
          .map((e: any) => {
            const snippet = (e.content || "").slice(0, 200);
            return `[${e.date}${e.mood ? `, mood: ${e.mood}` : ""}${e.emotional_tone ? `, tone: ${e.emotional_tone}` : ""}] ${snippet}`;
          });
        if (entries.length > 0) {
          journalContext = `Recent journal entries:\n${entries.join("\n")}`;
        }
      }

      if (cycleResult.data?.length) {
        const moods = cycleResult.data
          .filter((c: any) => c.mood || c.symptoms?.length || c.notes)
          .map((c: any) => {
            const parts = [];
            if (c.mood) parts.push(`mood: ${c.mood}`);
            if (c.symptoms?.length) parts.push(`symptoms: ${c.symptoms.join(", ")}`);
            if (c.energy) parts.push(`energy: ${c.energy}/5`);
            if (c.notes) parts.push(`notes: ${c.notes.slice(0, 100)}`);
            return parts.join(", ");
          });
        if (moods.length > 0) {
          recentMoods = `Recent cycle tracking:\n${moods.join("\n")}`;
        }
      }

      if (habitResult.data?.length) {
        const avg = habitResult.data.reduce((s: number, h: any) => s + (h.completion_pct || 0), 0) / habitResult.data.length;
        recentHabits = `Habit completion this week: ~${Math.round(avg)}%`;
      }
    }

    // --- Build the prompt ---
    const astrologySection = sunSign && signProfile
      ? `Her nature: ${sunSign} (${signProfile.element} sign) — ${signProfile.quality}
Ruling planet: ${signProfile.ruling_planet}
Her gift: ${signProfile.gift}
Her shadow: ${signProfile.shadow}
Self-care affinity: ${signProfile.self_care}
Body zone: ${signProfile.body_zone}`
      : "Her birth sign is not known.";

    const personalContext = [journalContext, recentMoods, recentHabits].filter(Boolean).join("\n\n");

    const systemPrompt = `You are the voice of Signal — a quiet, unhurried wisdom that speaks through the tradition of Daoist fables, the Daodejing, and astrological awareness.

You have been given:
1. A specific fable from "The Dao in Action" — the full story moment and its living wisdom
2. A verse from the Daodejing (Laozi)
3. Details about this woman: her cycle phase, her astrological sun sign and profile, the current moon phase
4. Personal context from her recent journal entries, cycle tracking, and habits — this is the most important layer

Your task: Write a message of 60–100 words that takes the shape and wisdom of the given fable and refracts it through this woman's EXACT moment right now. If you have her journal entries, weave specific echoes of what she wrote into your words — not by quoting her, but by showing that you have truly heard her. If you have her astrological profile, let the qualities of her sign subtly inform the imagery and advice, without turning it into a horoscope.

Rules:
- 60–100 words, no more
- Do not name the fable or the Daodejing chapter
- Do not address her as "you" in the opening line — begin with an image or a moment
- Do not use: "you should", "it's time to", "remember", "just", "simply", "embrace", "journey", "trust the process"
- Do not write a horoscope or an affirmation
- Concrete image first. Wisdom second. One quiet question or statement at the end.
- If personal context is available, make the message feel uncannily specific to her life right now
- Return ONLY the message text. No title. No explanation.`;

    const userPrompt = `Write a Signal for this woman.

${astrologySection}
Her cycle: ${cycleQuality}${cycleDay ? ` (day ${cycleDay})` : ""}
The moon tonight: ${moonPhase} — ${moonQuality}

${personalContext ? `PERSONAL CONTEXT (from her journal, cycle tracking, and habits this week):\n${personalContext}\n` : ""}
Fable to draw from — "${fable.title}":
The story: ${fable.story}
The wisdom: ${fable.wisdom}

Daodejing verse to weave into the tone (do not quote directly):
${verse.text} — ${verse.chapter}

Write 60–100 words. Begin with a concrete image. Let the fable's shape move through your words. If you have personal context, make this feel like it was written specifically for her. End with something that opens rather than closes.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.85,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices?.[0]?.message?.content?.trim() || "The river knows where it goes. Follow the water.";

    // Save to signal_messages
    if (userId) {
      await supabase.from("signal_messages").insert({
        user_id: userId,
        message,
        fable_title: fable.title,
        dao_verse: verse.text,
        dao_chapter: verse.chapter,
        sun_sign: sunSign,
        moon_phase: moonPhase,
        cycle_phase: cyclePhase,
      });
    }

    return new Response(
      JSON.stringify({
        message,
        sunSign,
        moonPhase,
        cyclePhase,
        fableTitle: fable.title,
        daoChapter: verse.chapter,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("give-signal-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
