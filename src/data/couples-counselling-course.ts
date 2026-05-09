// couples-counselling-course.ts
// Full 8-module course – gentle communication, four horsemen, conflict, intimacy, repair, shared meaning

export interface Activity {
  id: string;
  type: "carousel" | "fill_blanks" | "decision_point" | "open_response" | "conversation_challenge" | "true_false" | "reaction_slider" | "token_appreciation" | "comparison" | "image_upload" | "survey" | "sort" | "flip_card";
  title: string;
  instruction?: string;
  content: any;
  tip?: string;
  saveToVault?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  activities: Activity[];
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  estimatedMinutes: number;
  lessons: Lesson[];
  /** Path to the watercolour module header illustration, served from public/. */
  image?: string;
}

// ============================================================
// MODULE 1 – The Foundation: Why We Fight
// ============================================================
const module1: Module = {
  id: "m1",
  title: "The Foundation",
  subtitle: "Why We Fight (and How to Stop)",
  image: "/images/couplescourse/tree-roots-hearts.png",
  description: "Understand the purpose of conflict in relationships – and why 69% of problems are perpetual. Learn to distinguish solvable from perpetual issues so you stop exhausting yourselves on the wrong problems.",
  estimatedMinutes: 45,
  lessons: [
    {
      id: "m1l1",
      title: "Solvable vs Perpetual Problems",
      description: "Most couples waste energy trying to 'solve' problems that will never go away. Learn which battles you can win – and which you must learn to dialogue about.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m1l1a1",
          type: "carousel",
          title: "The 69% Rule",
          instruction: "Swipe to understand research on relationship conflict.",
          content: {
            cards: [
              { title: "Solvable Problems", body: "Situational, specific, can be resolved with a concrete action plan. Examples: who does the dishes, holiday plans, scheduling date nights." },
              { title: "Perpetual Problems", body: "Rooted in fundamental personality differences or value clashes. Will never fully disappear. Examples: one partner wants order, the other thrives in chaos; differences in need for alone time." },
              { title: "The Trap", body: "Treating perpetual problems as solvable leads to endless fights and feeling like failures. Instead, learn to accept and dialogue." }
            ]
          }
        },
        {
          id: "m1l1a2",
          type: "decision_point",
          title: "Which Problem Is This?",
          instruction: "Your partner leaves clothes on the floor. You've asked them to use the hamper for years. They still forget sometimes.",
          content: {
            scenario: "Partner leaves clothes on the floor occasionally.",
            options: [
              { label: "Solvable – we can create a system (a second hamper, a reminder)", outcome: "Yes – this is situational. Could be solved with a practical agreement.", isOptimal: true },
              { label: "Perpetual – they will never change", outcome: "Not necessarily – perpetual problems are deeper (character/personality). This is likely solvable with the right approach." }
            ]
          }
        },
        {
          id: "m1l1a3",
          type: "open_response",
          title: "Your Perpetual Loop",
          instruction: "Name one recurring conflict in your relationship. Is it solvable or perpetual? What's the usual pattern?",
          content: { prompt: "Our recurring conflict is... I think it's... because...", placeholder: "Write here...", minWords: 30 },
          saveToVault: true
        }
      ]
    },
    {
      id: "m1l2",
      title: "The Purpose of Conflict",
      description: "Conflict is not a sign of failure – it's a sign you're two different humans trying to share a life.",
      estimatedMinutes: 25,
      activities: [
        {
          id: "m1l2a1",
          type: "true_false",
          title: "Myth Check",
          instruction: "Healthy couples rarely argue.",
          content: { statement: "Healthy couples rarely argue.", answer: false, explanation: "All couples argue. The difference is how they argue and how they repair. In fact, avoiding conflict is often worse than having it." }
        },
        {
          id: "m1l2a2",
          type: "open_response",
          title: "What Conflict Teaches Us",
          instruction: "Think of a past conflict that actually improved your relationship. What did you learn about each other?",
          content: { prompt: "A conflict that helped us was... I learned that...", placeholder: "Write here...", minWords: 40 },
          saveToVault: true
        }
      ]
    }
  ]
};

// ============================================================
// MODULE 2 – The Flood: Regulating Your Own Nervous System
// ============================================================
const module2: Module = {
  id: "m2",
  title: "The Flood",
  subtitle: "Regulating Your Own Nervous System",
  image: "/images/couplescourse/stone-ripples.png",
  description: "When your heart rate exceeds 100 bpm, you cannot listen, think, or respond calmly. This module teaches you to recognise flooding, take a deliberate pause, and return to the conversation with a regulated brain.",
  estimatedMinutes: 50,
  lessons: [
    {
      id: "m2l1",
      title: "Signs of Flooding",
      description: "Learn the physical and emotional cues that your nervous system has taken over.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m2l1a1",
          type: "carousel",
          title: "The Flood Warning",
          instruction: "Swipe to recognise when you're flooded.",
          content: {
            cards: [
              { title: "Physical Signs", body: "Heart pounding, shallow breathing, tight jaw, clenched fists, feeling hot, tunnel vision." },
              { title: "Emotional Signs", body: "Overwhelming anger or numbness, feeling attacked, unable to remember anything good about your partner." },
              { title: "The 20-Minute Rule", body: "It takes at least 20 minutes for your body to return to baseline. During that break, do not ruminate. Walk, breathe, listen to music." }
            ]
          }
        },
        {
          id: "m2l1a2",
          type: "reaction_slider",
          title: "Your Flood Frequency",
          instruction: "How often do you feel flooded during conflict?",
          content: { question: "I feel flooded during arguments...", options: [{ emoji: "😫", label: "Almost always" }, { emoji: "😐", label: "Sometimes" }, { emoji: "😊", label: "Rarely" }] }
        }
      ]
    },
    {
      id: "m2l2",
      title: "Taking the Pause",
      description: "How to step away without abandoning the conversation.",
      estimatedMinutes: 30,
      activities: [
        {
          id: "m2l2a1",
          type: "fill_blanks",
          title: "Your Time‑Out Script",
          instruction: "Complete the sentence so you can use it next time you feel flooded.",
          content: { text: "I'm feeling ___. I need ___ minutes to calm down. I will come back at ___.", blanks: ["emotion", "20", "time"] }
        },
        {
          id: "m2l2a2",
          type: "conversation_challenge",
          title: "Agree on a Signal",
          instruction: "With your partner, agree on a non‑verbal signal for taking a pause (e.g., hand on heart). Also agree that whoever calls the pause, the other will honour it immediately.",
          content: { prompt: "Our signal is... We'll take... minutes. I will calm down by...", maxSeconds: 120 },
          saveToVault: true
        }
      ]
    }
  ]
};

// ============================================================
// MODULE 3 – The Way We Speak: Gentle Communication
// ============================================================
const module3: Module = {
  id: "m3",
  title: "The Way We Speak",
  subtitle: "Gentle Communication",
  image: "/images/couplescourse/two-speech-bubbles-intertwined.png",
  description: "Words can be walls or windows. This module teaches you how to start difficult conversations so that your partner can actually hear you – not because you've softened the truth, but because you've wrapped it in respect.",
  estimatedMinutes: 75,
  lessons: [
    {
      id: "m3l1",
      title: "The Gentle Start‑Up",
      description: "How you begin a conversation predicts how it will end.",
      estimatedMinutes: 25,
      activities: [
        {
          id: "m3l1a1",
          type: "carousel",
          title: "Why the First Three Minutes Matter",
          instruction: "Swipe to learn the elements of a gentle start‑up.",
          content: {
            cards: [
              { title: "1. Start with ‘I’", body: "‘I feel lonely when we don’t talk after dinner’ lands differently than ‘You never talk to me anymore.’" },
              { title: "2. Describe, don’t judge", body: "Stick to what actually happened. Facts invite conversation; judgements invite war." },
              { title: "3. Express your feeling", body: "Name the emotion without drama. ‘I felt hurt.’ Not ‘You made me feel hurt.’" },
              { title: "4. State a positive need", body: "‘I’d love it if we could tidy the kitchen together before bed.’ Ask for what you want, not what you don’t want." }
            ]
          }
        },
        {
          id: "m3l1a2",
          type: "fill_blanks",
          title: "Build a Gentle Start‑Up",
          instruction: "Complete the template to turn a complaint into an invitation.",
          content: { text: "I feel ___ when ___ happens. I would love it if we could ___.", blanks: ["emotion", "situation", "positive request"] }
        },
        {
          id: "m3l1a3",
          type: "decision_point",
          title: "Rewrite the Blame",
          instruction: "Your partner has been working late every night. Which is the gentle start‑up?",
          content: {
            scenario: "You feel lonely and resentful.",
            options: [
              { label: "‘You’re never home. You don’t care.’", outcome: "Criticism. Will provoke defensiveness." },
              { label: "‘I’ve been feeling lonely in the evenings. Could we find fifteen minutes together before bed?’", outcome: "Perfect gentle start‑up.", isOptimal: true }
            ]
          }
        }
      ]
    },
    {
      id: "m3l2",
      title: "The Speaker‑Listener Technique",
      description: "A structured tool that ensures both partners feel heard.",
      estimatedMinutes: 25,
      activities: [
        {
          id: "m3l2a1",
          type: "carousel",
          title: "The Rules of the Floor",
          instruction: "This technique uses a simple object – a cushion, a pen, a stone – as ‘the floor.’ Swipe through the rules.",
          content: {
            cards: [
              { title: "Speaker: Speak for you.", body: "Use ‘I’ statements. Keep it brief. After a few sentences, pause and let the Listener paraphrase." },
              { title: "Listener: Reflect, don’t rebut.", body: "Your only job is to understand, not to agree or defend. Say back what you heard: ‘So what I’m hearing is that you felt dismissed when I…’ Then ask: ‘Did I get that right?’" },
              { title: "The Goal: Understanding.", body: "You are not trying to solve the problem right now. You are trying to make sure each person’s experience is fully received. Solutions come later. Connection comes first." }
            ]
          }
        },
        {
          id: "m3l2a2",
          type: "decision_point",
          title: "Practice Listening",
          instruction: "Your partner (the Speaker) says: ‘I’ve been feeling like I’m doing all the planning for our weekends, and I’m tired of it.’ You are the Listener. What do you say?",
          content: {
            scenario: "Your partner: ‘I’ve been feeling like I’m doing all the planning…’",
            options: [
              { label: "‘Well, you never tell me what you want me to do. Just ask!’", outcome: "Defence, not listening. Dismisses their feeling." },
              { label: "‘So you’re feeling exhausted and unappreciated because the planning has fallen mostly on you, and you need me to share that load. Did I get that right?’", outcome: "Perfect reflection.", isOptimal: true }
            ]
          }
        },
        {
          id: "m3l2a3",
          type: "conversation_challenge",
          title: "Your First Speaker‑Listener Practice",
          instruction: "Choose a low‑stakes topic (e.g., ‘how should we organise the pantry?’). Use a physical object as ‘the floor.’ Practise for 10 minutes. Then reflect here.",
          content: { prompt: "What was hard about it? What felt surprisingly good?", maxSeconds: 180 },
          saveToVault: true
        }
      ]
    }
  ]
};

// ============================================================
// MODULE 4 – The Four Horsemen & Their Antidotes
// ============================================================
const module4: Module = {
  id: "m4",
  title: "The Weather Inside",
  subtitle: "The Four Horsemen & Their Antidotes",
  image: "/images/couplescourse/four-horses.png",
  description: "Every relationship has storms. But some patterns — criticism, contempt, defensiveness, stonewalling — are so reliably destructive that researchers call them the Four Horsemen. This module teaches you to recognise them in yourself and your partner, and to replace them with something softer and stronger.",
  estimatedMinutes: 75,
  lessons: [
    {
      id: "m4l1",
      title: "Meet the Horsemen",
      description: "Learn to identify the four communication patterns that predict relationship breakdown.",
      estimatedMinutes: 25,
      activities: [
        {
          id: "m4l1a1",
          type: "carousel",
          title: "The Four Horsemen",
          instruction: "Swipe to meet each one — and its antidote.",
          content: {
            cards: [
              { title: "Criticism → Gentle Start‑Up", body: "Criticism attacks character. Antidote: gentle start‑up (‘I feel lonely when…’)." },
              { title: "Contempt → Appreciation", body: "Contempt communicates disgust. Antidote: daily appreciation." },
              { title: "Defensiveness → Ownership", body: "Defensiveness escalates conflict. Antidote: accept a small piece of responsibility." },
              { title: "Stonewalling → Self‑Soothing", body: "Stonewalling is shutting down. Antidote: deliberate break with a promise to return." }
            ]
          }
        },
        {
          id: "m4l1a2",
          type: "decision_point",
          title: "Which Horseman Is This?",
          instruction: "Your partner rolls their eyes and sighs when you express a concern. Which horseman?",
          content: {
            scenario: "Eye‑rolling and sighing.",
            options: [{ label: "Contempt", isOptimal: true, outcome: "Eye‑rolling is contempt – the strongest predictor of relationship failure." }]
          }
        },
        {
          id: "m4l1a3",
          type: "open_response",
          title: "Your Default Horseman",
          instruction: "Which of the four do you reach for most often when you’re upset?",
          content: { prompt: "When… happened, I responded by… Underneath, I was really feeling…", minWords: 40 },
          saveToVault: true
        }
      ]
    },
    {
      id: "m4l2",
      title: "The Antidotes in Practice",
      description: "Learn to pause, recognise the horseman, and choose the antidote in real time.",
      estimatedMinutes: 25,
      activities: [
        {
          id: "m4l2a1",
          type: "decision_point",
          title: "From Defensiveness to Ownership",
          instruction: "Your partner says: ‘I’m upset you didn’t call to say you’d be late.’ Your instinct is to defend. What do you say instead?",
          content: {
            scenario: "Partner: ‘I’m upset you didn’t call.’",
            options: [
              { label: "‘You’re right. I should have called. I’m sorry.’", isOptimal: true, outcome: "Ownership de‑escalates." },
              { label: "‘My day was just as hard. Can we drop it?’", outcome: "Defensiveness makes it worse." }
            ]
          }
        },
        {
          id: "m4l2a2",
          type: "token_appreciation",
          title: "Build a Culture of Appreciation",
          instruction: "Write down one specific thing you appreciate about your partner today.",
          content: { promptWhat: "What did your partner do?", promptWhy: "Why did it matter to you?" },
          saveToVault: true
        }
      ]
    }
  ]
};

// ============================================================
// MODULE 5 – The Bridge: Conflict as Connection
// ============================================================
const module5: Module = {
  id: "m5",
  title: "The Bridge",
  subtitle: "Conflict as Connection",
  image: "/images/couplescourse/two-figures-bridge.png",
  description: "Conflict is not a sign that your relationship is broken. It’s a sign that two different humans are trying to share a life. This module reframes disagreement as an opportunity.",
  estimatedMinutes: 60,
  lessons: [
    {
      id: "m5l1",
      title: "Why We Fight",
      description: "Understanding the purpose of conflict — and why some problems will never fully resolve.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m5l1a1",
          type: "true_false",
          title: "Conflict Myth",
          instruction: "Truly loving couples rarely fight.",
          content: { statement: "Truly loving couples rarely fight.", answer: false, explanation: "All couples experience conflict. The difference lies in how they fight and repair." }
        },
        {
          id: "m5l1a2",
          type: "carousel",
          title: "Perpetual vs. Solvable Problems",
          instruction: "69% of relationship conflicts are perpetual – they will never fully disappear.",
          content: { cards: [
            { title: "Perpetual Problems", body: "Rooted in fundamental differences. The goal is dialogue, not resolution." },
            { title: "Solvable Problems", body: "Situational, can be resolved with an agreement." }
          ] }
        }
      ]
    },
    {
      id: "m5l2",
      title: "Physiological Soothing",
      description: "When your heart rate goes over 100 bpm, you can’t listen, think, or respond calmly.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m5l2a1",
          type: "carousel",
          title: "Signs of Flooding",
          content: { cards: [
            { title: "Physical Signs", body: "Heart pounding, shallow breathing, tight jaw." },
            { title: "Emotional Signs", body: "Overwhelming anger, tunnel vision." },
            { title: "The 20-Minute Reset", body: "It takes at least 20 minutes to return to baseline." }
          ] }
        },
        {
          id: "m5l2a2",
          type: "conversation_challenge",
          title: "Agree on a Time‑Out Signal",
          instruction: "Discuss with your partner a signal for taking a break during conflict.",
          content: { prompt: "Our signal is… We’ll take… minutes.", maxSeconds: 120 },
          saveToVault: true
        }
      ]
    }
  ]
};

// ============================================================
// MODULE 6 – The Fire: Intimacy & Desire
// ============================================================
const module6: Module = {
  id: "m6",
  title: "The Fire",
  subtitle: "Intimacy & Desire",
  image: "/images/couplescourse/candle-and-moon.png",
  description: "Desire doesn’t just happen — it’s cultivated. This module explores spontaneous vs responsive desire and the forms of intimacy that fuel connection.",
  estimatedMinutes: 60,
  lessons: [
    {
      id: "m6l1",
      title: "The Many Forms of Intimacy",
      description: "Intimacy is more than sex. Explore emotional, physical, intellectual, experiential, and spiritual intimacy.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m6l1a1",
          type: "carousel",
          title: "The Intimacy Wheel",
          content: { cards: [
            { title: "Emotional Intimacy", body: "Feeling truly known." },
            { title: "Physical Intimacy", body: "Non‑sexual touch, comfort." },
            { title: "Intellectual Intimacy", body: "Deep conversations." },
            { title: "Experiential Intimacy", body: "Shared experiences." },
            { title: "Spiritual Intimacy", body: "Sharing what gives life meaning." }
          ] }
        }
      ]
    },
    {
      id: "m6l2",
      title: "Understanding Desire",
      description: "Learn about spontaneous vs responsive desire.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m6l2a1",
          type: "flip_card",
          title: "Two Types of Desire",
          content: { cards: [
            { front: "Spontaneous Desire", back: "Desire that appears ‘out of nowhere’. Not the only normal way." },
            { front: "Responsive Desire", back: "Desire that emerges *in response* to connection, touch, or context." }
          ] }
        }
      ]
    }
  ]
};

// ============================================================
// MODULE 7 – The Mend: Apology, Forgiveness & Healing
// ============================================================
const module7: Module = {
  id: "m7",
  title: "The Mend",
  subtitle: "Apology, Forgiveness & Healing",
  image: "/images/couplescourse/heart-with-bandage.png",
  description: "The quality of your connection is not determined by whether you tear — it’s determined by how you repair.",
  estimatedMinutes: 60,
  lessons: [
    {
      id: "m7l1",
      title: "The Anatomy of a Real Apology",
      description: "Learn the five elements of a genuine repair.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m7l1a1",
          type: "sort",
          title: "Build a Genuine Apology",
          content: { items: ["Acknowledge impact", "Express remorse", "Take responsibility", "Make a plan", "Ask what they need"], correctOrder: [1,2,0,3,4] }
        },
        {
          id: "m7l1a2",
          type: "decision_point",
          title: "Apology or Non‑Apology?",
          content: { scenario: "Your partner is hurt because you snapped at them.", options: [
            { label: "‘I’m sorry you felt embarrassed.’", outcome: "Non‑apology." },
            { label: "‘I was out of line. I’m sorry. Next time I’ll step outside.’", outcome: "Real apology.", isOptimal: true }
          ] }
        }
      ]
    },
    {
      id: "m7l2",
      title: "Forgiveness as a Gift to Yourself",
      description: "Forgiveness means choosing to stop carrying the weight.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m7l2a1",
          type: "true_false",
          title: "Forgiveness Myths",
          content: { statement: "Forgiveness means forgetting what happened.", answer: false, explanation: "Forgiveness is releasing resentment for your own sake." }
        },
        {
          id: "m7l2a2",
          type: "open_response",
          title: "What You’re Still Carrying",
          content: { prompt: "I’ve been holding onto… since…", minWords: 40 },
          saveToVault: true
        }
      ]
    }
  ]
};

// ============================================================
// MODULE 8 – The Horizon: Shared Meaning & Deepening
// ============================================================
const module8: Module = {
  id: "m8",
  title: "The Horizon",
  subtitle: "Shared Meaning & Deepening",
  image: "/images/couplescourse/two-silhouettes-sunrise.png",
  description: "The deepest relationships are built on shared meaning — the rituals, stories, and values that make your partnership uniquely yours.",
  estimatedMinutes: 60,
  lessons: [
    {
      id: "m8l1",
      title: "Your Couple Culture",
      description: "Every couple creates a culture – inside jokes, small rituals, shared narratives.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m8l1a1",
          type: "carousel",
          title: "The Architecture of Shared Meaning",
          content: { cards: [
            { title: "Rituals of Connection", body: "Morning coffee, weekly date, goodbye kiss." },
            { title: "Shared Stories", body: "How you met, what you’ve overcome." },
            { title: "Shared Values", body: "Principles you both hold sacred." },
            { title: "Shared Dreams", body: "The future you’re building together." }
          ] }
        }
      ]
    },
    {
      id: "m8l2",
      title: "Creating a Shared Future",
      description: "Dream together. What do you want your life to look like in five years?",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m8l2a1",
          type: "comparison",
          title: "Your Dreams & Theirs",
          content: { columnA: { label: "My Dreams" }, columnB: { label: "My Partner’s Dreams" }, reflection: "Where do they overlap?" },
          saveToVault: true
        },
        {
          id: "m8l2a2",
          type: "open_response",
          title: "Our Shared Future Narrative",
          content: { prompt: "In five years, we are…", minWords: 60 },
          saveToVault: true
        }
      ]
    },
    {
      id: "m8l3",
      title: "The Daily Return",
      description: "How to keep coming back to each other, every day, in the small moments.",
      estimatedMinutes: 20,
      activities: [
        {
          id: "m8l3a1",
          type: "carousel",
          title: "The Small Practices That Hold Us",
          content: { cards: [
            { title: "The Morning Check‑In", body: "Two minutes before you scatter." },
            { title: "The Evening Debrief", body: "‘What was the best part of your day? The hardest?’" },
            { title: "Weekly Appreciation", body: "One specific thing they did." },
            { title: "The Repair Habit", body: "‘I’m sorry for my part. I love you.’" }
          ] }
        },
        {
          id: "m8l3a2",
          type: "survey",
          title: "Your Daily Commitment",
          content: { question: "This week, I commit to:", options: ["The Morning Check‑In", "The Evening Debrief", "Weekly Appreciation", "The Repair Habit"], allowMultiple: false }
        },
        {
          id: "m8l3a3",
          type: "open_response",
          title: "A Letter to Your Partner",
          instruction: "Write a letter to your partner about what you’ve learned, what you appreciate, and what you hope for.",
          content: { prompt: "Dear… This course has shown me…", minWords: 80 },
          saveToVault: true
        }
      ]
    }
  ]
};

// ============================================================
// FINAL EXPORT – all 8 modules
// ============================================================
export const COUPLES_COUNSELLING_COURSE: Module[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8
];