import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// Fable library — from "The Dao in Action" by Dr. Yang Jwing-Ming
// ---------------------------------------------------------------------------
const FABLE_LIBRARY = [
  {
    title: "The Taller the Bamboo Grows, the Lower It Bows",
    story: "A bamboo shoot believed if it kept growing it would one day reach the sky. Ten years passed. Twenty years passed. The sky was still beyond reach. Finally the bamboo realised something and began to bow. The more it grew, the lower it bowed.",
    wisdom: "The more you have grown, the more naturally you move toward humility. The height is in the bowing.",
    themes: ["follicular", "ovulatory", "growth", "humility", "becoming"],
  },
  {
    title: "Carry a Heavy Bucket",
    story: "A master asked his students which of ten buckets — empty, half-full, or full — they would choose to carry to the rice field. Most chose empty or half-full. Only a few chose the full one. The master said: those who carry the full bucket will have a chance to condition their body.",
    wisdom: "The weight you don't avoid is the weight that makes you strong. The heavy bucket is the gift.",
    themes: ["follicular", "luteal", "effort", "difficulty", "growth"],
  },
  {
    title: "The Engineer Serves Coffee",
    story: "A Chinese engineer with a PhD was told by his jealous boss to bring him coffee every morning. He agreed quietly and did it without argument for a year. He worked hard, earned the trust of everyone. The boss, feeling guilty, told him he no longer had to bring coffee. The engineer smiled. 'From tomorrow morning,' he said, 'no more spit.'",
    wisdom: "Non-contention is not weakness. Quiet dignity holds more power than any argument.",
    themes: ["luteal", "menstrual", "patience", "non-contention", "dignity"],
  },
  {
    title: "Two Monks and a Lady",
    story: "Two monks came to a flooded path. A woman stood crying — she couldn't cross without ruining her clothes. One monk lifted her and carried her across. Miles later, the second monk said in anger: 'You shouldn't have touched her.' The first replied: 'I set her down miles ago. Why are you still carrying her?'",
    wisdom: "What you set down, set down completely. The burden you're still carrying may have been released long ago.",
    themes: ["menstrual", "luteal", "release", "carrying", "letting go"],
  },
  {
    title: "A Blessing in Disguise",
    story: "An old man's horse escaped. Neighbours grieved. He was unmoved. The horse returned with a mare. His son rode the mare, fell, was crippled. Neighbours grieved again. Two years later, every young man was drafted to war and most killed. His son, crippled, was spared.",
    wisdom: "Fortune hides inside what looks like disaster. The current moment is never the whole story.",
    themes: ["menstrual", "luteal", "all", "trust", "cycles", "uncertainty"],
  },
  {
    title: "Two Tigers",
    story: "One tiger lived in the wild, one in a cage. Both believed their conditions were poor. They exchanged places. Both were happy at first. In the end, one died of hunger and the other died of depression.",
    wisdom: "Your nature is not your cage — it is your home.",
    themes: ["all", "self", "nature", "identity", "belonging"],
  },
  {
    title: "A Bowl of Example",
    story: "A grandmother's shaking hands made her spill food at every meal. Her daughter-in-law had her eat alone from a chipped bowl. The grandson said: 'I was saving that bowl for my mother to use when she gets old.' The mother's face went pale. From that day, the family ate together again.",
    wisdom: "Every act you take is a bowl the next generation will eat from.",
    themes: ["ovulatory", "all", "lineage", "example", "kindness"],
  },
  {
    title: "A Bowl of Noodle Soup",
    story: "Xiaoying stormed out after a fight with her mother. A street-stall owner gave her free noodle soup. She wept. He asked: 'Have you thought about how many bowls your mother has cooked for you since you were born?' Xiaoying ran home. Her mother was at the door, holding noodles.",
    wisdom: "The one we overlook most is often the one who has never stopped feeding us.",
    themes: ["all", "gratitude", "love", "mother", "belonging"],
  },
  {
    title: "A Donkey, a Father, and a Son",
    story: "A father and son walked with a donkey. People criticised everything — not riding it, son riding, father riding, both riding, carrying it. Finally they put the donkey down and ignored everyone for the rest of the journey.",
    wisdom: "You cannot arrange yourself to please every passing voice. At some point, you put the donkey down and keep walking your own path.",
    themes: ["all", "self-direction", "others-approval", "inner compass"],
  },
  {
    title: "A Fight of No Fight",
    story: "De-Yi was driven from his land by his violent brother. At a Shaolin monastery he was given a task: hold a calf and jump over a willow tree, morning and evening. Three years passed. The calf became a cow. When he returned, his brother came running at him. De-Yi picked up the cow and walked toward him. His brother turned and ran.",
    wisdom: "Strength built quietly over time doesn't need to announce itself.",
    themes: ["follicular", "luteal", "quiet strength", "patience", "endurance"],
  },
  {
    title: "Carving a Buddha",
    story: "An orphan was told to carve a Buddha from a tree. The abbot kept saying: too big. Make it smaller. After disappointment, one morning he said: if this is the only path, I will do it with joy. The final Buddha was two inches and exquisitely radiant.",
    wisdom: "The work is the willingness to keep carving after disappointment, without being crushed by it.",
    themes: ["menstrual", "follicular", "perseverance", "surrender", "patience"],
  },
  {
    title: "The Mind of Wonders",
    story: "A student told his master he was falling behind. The master said: why do you look sideways when learning? Success is like plowing a field — bow your head and keep digging. Only someday when you take a break will you find everyone is far behind.",
    wisdom: "Your path is ploughed by looking at your own soil, not at your neighbour's.",
    themes: ["follicular", "luteal", "focus", "comparison", "progress"],
  },
  {
    title: "Boiling a Pot of Water",
    story: "A young man kept failing in business. A wise man told him to boil water for tea. He filled a huge pot, ran out of wood, returned to find the fire out. The old man said: 'What if you had filled the pot with less water?'",
    wisdom: "Not every worthy goal needs the largest pot. Sometimes reducing is what finally allows completion.",
    themes: ["luteal", "all", "focus", "reduction", "overwhelm"],
  },
  {
    title: "Clench the Fist Tightly",
    story: "An old man told a boy: clench your fist. 'What do you feel?' 'Tired.' 'Clench tighter.' 'Suffocated.' 'Now loosen it.' 'Relaxed.' 'You must know when to loosen or you will collapse.'",
    wisdom: "The hand that cannot release will never be able to receive anything new.",
    themes: ["menstrual", "luteal", "rest", "release", "exhaustion"],
  },
  {
    title: "Confucius Learns the Zither",
    story: "His teacher kept saying: move to a new piece. But Confucius practised deeper — mastering skill, then feeling, then the composer's heart, until he stood on high ground gazing far ahead. 'Now I know who composed this.'",
    wisdom: "There are four layers: skill, feeling, the composer's heart, and the view from high ground. Most stop at the first.",
    themes: ["follicular", "ovulatory", "depth", "mastery", "patience"],
  },
  {
    title: "Grind the Steel Rod into a Needle",
    story: "Li Bai found an old woman grinding a thick iron pestle on a stone. 'I want to grind this into a needle.' 'But it will take forever.' She said: 'As long as I have a strong will and keep at it, there is nothing that cannot be done.'",
    wisdom: "The needle is already in the pestle. Patient effort reveals it.",
    themes: ["follicular", "menstrual", "discipline", "persistence", "beginning"],
  },
  {
    title: "Foolish Old Man Moves the Mountain",
    story: "A ninety-year-old decided to move two mountains. His sons, their sons, generation by generation. 'The mountains cannot grow. We can keep digging.'",
    wisdom: "What feels impossible in one lifetime is simply very long work.",
    themes: ["all", "long vision", "persistence", "legacy", "beginning"],
  },
  {
    title: "Sharing Food in Heaven and Hell",
    story: "In hell, everyone starved — the spoons were too long to feed themselves. In heaven, same spoons. Everyone was full. They were feeding each other.",
    wisdom: "The same circumstances, the same tools. The only difference is the direction you turn the spoon.",
    themes: ["ovulatory", "all", "community", "generosity", "perspective"],
  },
  {
    title: "Different Paths",
    story: "Two rich friends learned they had three weeks to live. One withdrew in fear. The other gave his fortune to the poor and was so busy he forgot he was dying. Death's gong could not be heard over the celebration. He lived many more years.",
    wisdom: "Generosity is not just virtue — it is the sound that drowns out what you fear.",
    themes: ["ovulatory", "all", "generosity", "presence", "fear"],
  },
  {
    title: "Good Retribution of a Kind Heart",
    story: "Mr. Yi found a bag of silver coins and waited all day for its owner, missing his boat. The grateful young man returned. The next day they met again. The boat had capsized overnight. Twenty-three passengers drowned.",
    wisdom: "The act of returning what is not yours can change the entire current of what comes next.",
    themes: ["all", "integrity", "kindness", "return", "trust"],
  },
  {
    title: "Learn What to Pick Up",
    story: "Two friends climbed a mountain for precious stones. One filled her backpack. The other took only a few. On the descent, the full backpack was impossibly heavy. By the bottom, she had only a few — the same as her friend.",
    wisdom: "You will carry what you choose and drop what you must. The question is whether you choose first, or the mountain decides for you.",
    themes: ["luteal", "menstrual", "discernment", "release", "simplicity"],
  },
  {
    title: "One Perfect Kick",
    story: "A student watched her master practise one hundred perfect kicks. 'How?' 'I did not do one hundred perfect kicks. I did one perfect kick — one hundred times.'",
    wisdom: "There is no such thing as a hundred achievements. There is only one act, done again and again.",
    themes: ["follicular", "all", "practice", "presence", "simplicity"],
  },
  {
    title: "Carry Thorns to Request Forgiveness",
    story: "A powerful general was jealous of a civilian promoted above him. The civilian avoided confrontation — 'If the two pillars of this state fight, our enemy will invade.' When the general heard this, he tied a birch rod to his bare back and walked to the official's home. The official lifted him up and held his hands.",
    wisdom: "The strongest person in the room is often the one who chose not to fight.",
    themes: ["all", "forgiveness", "humility", "reconciliation", "pride"],
  },
];

// ---------------------------------------------------------------------------
// Daodejing — 15 key verses
// ---------------------------------------------------------------------------
const DAO_VERSES = [
  { chapter: "Chapter 8", text: "The highest good is like water. Water benefits the myriad creatures while not contending with them.", themes: ["menstrual", "rest", "surrender", "quiet"] },
  { chapter: "Chapter 16", text: "Attain extreme tenuousness; Preserve quiet integrity. Each returns home to its root; returning to one's root is called stillness.", themes: ["menstrual", "luteal", "returning", "rest", "grounding"] },
  { chapter: "Chapter 22", text: "Those who are crooked will be perfected. Those who are empty will be full. Those who are worn will be renewed.", themes: ["luteal", "menstrual", "hardship", "renewal", "hope"] },
  { chapter: "Chapter 33", text: "Those who know others are knowledgeable; Those who know themselves are enlightened. Those who conquer themselves are strong.", themes: ["follicular", "ovulatory", "clarity", "strength", "insight"] },
  { chapter: "Chapter 40", text: "Turning back is how the Way moves. Weakness is how the Way operates. What is there arises from what is not there.", themes: ["menstrual", "luteal", "cycles", "paradox", "emptiness"] },
  { chapter: "Chapter 43", text: "The most supple things in the world ride roughshod over the most rigid. That which is not there can enter in, even where there is no space.", themes: ["follicular", "gentleness", "flexibility", "flow"] },
  { chapter: "Chapter 6", text: "The spirit of the valley never dies; She is called the Enigmatic Female. The portal of the Enigmatic Female is called the root of Heaven and Earth.", themes: ["menstrual", "follicular", "feminine", "mystery", "depth"] },
  { chapter: "Chapter 11", text: "Thirty spokes are joined in the hub of a wheel. But only by relying on what is not there, do we have the use of the carriage.", themes: ["all", "emptiness", "space", "potential"] },
  { chapter: "Chapter 15", text: "Who can, through stillness, gradually make muddied water clear? Those who preserve this Way do not desire fullness.", themes: ["luteal", "menstrual", "patience", "clarity", "process"] },
  { chapter: "Chapter 47", text: "Without going out the door, one can know the whole world. Sages know without going abroad, perfect through nonaction.", themes: ["menstrual", "luteal", "inner knowing", "intuition", "stillness"] },
  { chapter: "Chapter 58", text: "Good fortune rests upon disaster; Disaster lies hidden within good fortune. Sages are square but do not cut, shining but not dazzling.", themes: ["all", "paradox", "change", "uncertainty", "trust"] },
  { chapter: "Chapter 55", text: "Those who are steeped in Virtue are like newborn children. Their bones are weak and sinews yielding and yet their grip is firm.", themes: ["follicular", "vitality", "balance", "new beginnings"] },
  { chapter: "Chapter 28", text: "Know the male but preserve the female, and be a canyon for all the world. Constant Virtue will never leave you.", themes: ["menstrual", "feminine", "receptivity", "stillness"] },
  { chapter: "Chapter 48", text: "In the pursuit of the Way, one does less each day; One does nothing yet nothing is left undone.", themes: ["menstrual", "luteal", "letting go", "trust", "rest"] },
  { chapter: "Chapter 2", text: "They produce without possessing. They act with no expectation of reward. When their work is done, they do not linger.", themes: ["ovulatory", "giving", "action", "release", "generosity"] },
];

// ---------------------------------------------------------------------------
// Sun sign from date of birth
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

// ---------------------------------------------------------------------------
// Moon phase (synodic period 29.53059 days)
// ---------------------------------------------------------------------------
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

function pickFable(cyclePhase: string) {
  const relevant = FABLE_LIBRARY.filter(f => f.themes.includes(cyclePhase) || f.themes.includes("all"));
  const pool = relevant.length > 0 ? relevant : FABLE_LIBRARY;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickVerse(cyclePhase: string) {
  const relevant = DAO_VERSES.filter(v => v.themes.includes(cyclePhase) || v.themes.includes("all"));
  const pool = relevant.length > 0 ? relevant : DAO_VERSES;
  return pool[Math.floor(Math.random() * pool.length)];
}

const SIGN_QUALITIES: Record<string, string> = {
  Aries: "fire sign — initiating force, the first breath of spring, courage that doesn't yet know fear",
  Taurus: "earth sign — deep rooting, the patience of stone, sensual knowing through the body",
  Gemini: "air sign — quicksilver mind, the crossroads, the gift of seeing two truths at once",
  Cancer: "water sign — the shell and the ocean inside it, tidal feeling, ancestral memory",
  Leo: "fire sign — the solar heart, generous radiance, the courage to be fully seen",
  Virgo: "earth sign — devoted discernment, the harvest, wholeness through small careful acts",
  Libra: "air sign — the scales in the wind, relational truth, beauty as a form of justice",
  Scorpio: "water sign — depth without bottom, transformation through what is not spoken",
  Sagittarius: "fire sign — the archer and the horizon, philosophy as lived experience, wild faith",
  Capricorn: "earth sign — the mountain's patience, long vision, authority earned through time",
  Aquarius: "air sign — the lightning mind, kinship with the future, love of what could be",
  Pisces: "water sign — the dissolved edge, oceanic empathy, dreaming as navigation",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dob, cyclePhase, userId } = await req.json();

    const sunSign = dob ? getSunSign(dob) : null;
    const moonPhase = getMoonPhase(new Date());
    const signQuality = sunSign ? (SIGN_QUALITIES[sunSign] || "") : null;
    const cycleQuality = CYCLE_QUALITIES[cyclePhase] || "a moment of natural transition";
    const moonQuality = MOON_QUALITIES[moonPhase] || "";
    const fable = pickFable(cyclePhase);
    const verse = pickVerse(cyclePhase);

    const astrologyLine = sunSign
      ? `Her nature: ${sunSign} — ${signQuality}`
      : "Her birth sign is not known";

    const systemPrompt = `You are the voice of Signal — a quiet, unhurried wisdom that speaks through the tradition of Daoist fables.

You have been given:
1. A specific fable from "The Dao in Action" by Dr. Yang Jwing-Ming — the full story moment and its living wisdom
2. A verse from the Daodejing (Laozi)
3. Details about this woman: her cycle phase, her astrological sun sign, the current moon phase

Your task: Write a message of 60–100 words that takes the shape and wisdom of the given fable and refracts it through this woman's exact moment right now. Do not retell the fable. Let its structure and essence move through your words the way light moves through water — changed in form but recognisable in quality.

Rules:
- 60–100 words, no more
- Do not name the fable or the Daodejing chapter
- Do not address her as "you" in the opening line — begin with an image or a moment
- Do not use: "you should", "it's time to", "remember", "just", "simply", "embrace", "journey", "trust the process"
- Do not write a horoscope or an affirmation
- Concrete image first. Wisdom second. One quiet question or statement at the end.
- Return ONLY the message text. No title. No explanation.`;

    const userPrompt = `Write a Signal for this woman.

${astrologyLine}
Her cycle: ${cycleQuality}
The moon tonight: ${moonPhase} — ${moonQuality}

Fable to draw from — "${fable.title}":
The story: ${fable.story}
The wisdom: ${fable.wisdom}

Daodejing verse to weave into the tone (do not quote directly):
${verse.text} — ${verse.chapter}

Write 60–100 words. Begin with a concrete image. Let the fable's shape move through your words. End with something that opens rather than closes.`;

    // Use Lovable AI (Gemini 2.5 Flash)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
      const errText = await aiResponse.text();
      throw new Error(`AI request failed: ${aiResponse.status} ${errText}`);
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices?.[0]?.message?.content?.trim() || "The river knows where it goes. Follow the water.";

    // Save to signal_messages
    if (userId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
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
      JSON.stringify({ message, sunSign, moonPhase, cyclePhase, fableTitle: fable.title, daoChapter: verse.chapter }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
