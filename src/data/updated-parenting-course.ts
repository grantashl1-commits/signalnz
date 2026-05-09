// Parenting Course – The Gentle Anchor
// 8 modules, 60–90 minutes each

export interface Activity {
  id: string;
  type: "carousel" | "fill_blanks" | "decision_point" | "open_response" | "conversation_challenge" | "true_false" | "reaction_slider" | "token_appreciation";
  title: string;
  instruction: string;
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

export const PARENTING_COURSE: Module[] = [
  // ══════════════════════════════════════════════════════════
  // MODULE 1 – The Compass: Your Parenting Values
  // ══════════════════════════════════════════════════════════
  {
    id: "p1",
    title: "The Compass",
    subtitle: "Finding Your True North as a Parent",
    image: "/images/parenting/module1-compass.png",
    description: "Before we talk about what to do in the chaos, we must know what we stand for. This module helps you uncover your deepest parenting values – the compass that guides you back when storms hit.",
    estimatedMinutes: 60,
    lessons: [
      {
        id: "p1l1",
        title: "Your Parenting Anchor",
        description: "When you feel lost or reactive, what is the one thing you want your child to remember? This lesson helps you name your core intention.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p1l1a1",
            type: "carousel",
            title: "Values, Not Rules",
            instruction: "Swipe to explore the difference between rigid rules and living values.",
            content: {
              cards: [
                { title: "Rules Without Connection", body: "‘You must eat everything on your plate.’ This rule might be forgotten or resented. But the value underneath – ‘I want my child to have a healthy relationship with food’ – can guide many different choices." },
                { title: "Values as a Lighthouse", body: "Values don’t tell you exactly what to do, but they show you the direction. When you feel lost, ask: ‘Does this action move me toward or away from my value?’" },
                { title: "Your Top Three", body: "Most parents have 2-4 core values that matter most. Connection. Respect. Safety. Growth. Kindness. Autonomy. Which ones call to you?" }
              ]
            }
          },
          {
            id: "p1l1a2",
            type: "open_response",
            title: "My Parenting Compass",
            instruction: "What is the one sentence you want your child to say about their childhood? (e.g., ‘I felt seen,’ ‘I was allowed to make mistakes,’ ‘I knew I was loved without earning it.’)",
            content: { prompt: "My child will remember that I…", placeholder: "I want my child to remember that I…", minWords: 20 },
            saveToVault: true
          },
          {
            id: "p1l1a3",
            type: "decision_point",
            title: "Values in Action",
            instruction: "Your child refuses to put on shoes. You're already late. Which response aligns with the value of ‘respect for autonomy’?",
            content: {
              scenario: "Child: ‘No! I don't want shoes!’",
              options: [
                { label: "‘Fine, we're not going anywhere then.’", outcome: "This uses control, not autonomy. The child feels punished for having a preference." },
                { label: "‘I hear you don't want shoes. We need shoes to go to the park. Should we bring them in your bag and decide later, or put them on now?’", outcome: "You acknowledged their feeling, offered choice, and held the boundary. That's autonomy with connection.", isOptimal: true }
              ]
            }
          }
        ]
      },
      {
        id: "p1l2",
        title: "The Long View",
        description: "Parenting is not about winning today's battle. It's about raising a human who can thrive in the world.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "p1l2a1",
            type: "true_false",
            title: "Myth Check",
            instruction: "Good parents have well‑behaved children who rarely cry or argue.",
            content: { statement: "Good parents have well‑behaved children who rarely cry or argue.", answer: false, explanation: "Children cry and argue because they are developing brains, not because they are ‘bad.’ A ‘good’ parent is one who responds with connection, not one who produces a quiet child." }
          },
          {
            id: "p1l2a2",
            type: "open_response",
            title: "The Adult I'm Raising",
            instruction: "Imagine your child at age 25. What qualities do you hope they have? (Not achievements – qualities like resilience, kindness, curiosity.)",
            content: { prompt: "At 25, I hope my child is…", placeholder: "I hope they are…", minWords: 30 },
            saveToVault: true
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 2 – The Pause: Regulating Your Own Nervous System
  // ══════════════════════════════════════════════════════════
  {
    id: "p2",
    title: "The Pause",
    subtitle: "Regulating Yourself First",
    image: "/images/parenting/module2-pause.png",
    description: "You cannot pour from an empty cup. When you are flooded with anger, exhaustion, or frustration, you cannot respond gently. This module teaches you to recognise your own triggers and take a healing pause.",
    estimatedMinutes: 70,
    lessons: [
      {
        id: "p2l1",
        title: "Recognising Flooding",
        description: "Learn the physical signs that your nervous system has taken over – and how to interrupt the reaction.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p2l1a1",
            type: "carousel",
            title: "The Flood Warning",
            instruction: "Swipe to learn the signs of an overwhelmed nervous system.",
            content: {
              cards: [
                { title: "Body Signs", body: "Clenched jaw, tight fists, shallow breathing, racing heart, hot flush, tunnel vision." },
                { title: "Emotional Signs", body: "Sudden rage, numbness, desire to escape, feeling like you hate your child in that moment (this is the flood talking, not you)." },
                { title: "The 20‑Minute Rule", body: "Once flooded, it takes at least 20 minutes for your body to return to calm. During that time, you cannot parent effectively. The kindest thing you can do is step away." }
              ]
            }
          },
          {
            id: "p2l1a2",
            type: "fill_blanks",
            title: "My Flood Signature",
            instruction: "Complete the sentence to recognise your early warning signs.",
            content: { text: "When I'm about to lose my temper, my body feels ___ and I notice myself ___ . A good signal to pause is ___ .", blanks: ["sensation", "behaviour", "signal"] }
          }
        ]
      },
      {
        id: "p2l2",
        title: "Taking the Pause",
        description: "What to do when you feel the flood rising – without making your child feel abandoned.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p2l2a1",
            type: "decision_point",
            title: "Pause Script",
            instruction: "Your child is screaming because you said no to a second cookie. You feel your own anger rising. What do you say?",
            content: {
              scenario: "Child: ‘I WANT COOKIE!’ (screaming). You feel heat in your face.",
              options: [
                { label: "‘Stop screaming right now!’ (louder)", outcome: "This escalates both of you. Neither nervous system calms." },
                { label: "‘I need a moment. I'm going to step into the kitchen and breathe. I'll be right back. You are safe.’", outcome: "You model regulation, not abandonment. This is the pause.", isOptimal: true }
              ]
            }
          },
          {
            id: "p2l2a2",
            type: "open_response",
            title: "My Pause Plan",
            instruction: "Where can you go for 2–5 minutes when you feel flooded? What will you do there? (Breathe, splash water, listen to one song?)",
            content: { prompt: "My pause place is… I will…", placeholder: "My pause place is…", minWords: 20 },
            saveToVault: true
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 3 – The Bridge: Connection Before Correction
  // ══════════════════════════════════════════════════════════
  {
    id: "p3",
    title: "The Bridge",
    subtitle: "Connection Before Correction",
    image: "/images/parenting/module3-bridge.png",
    description: "Children cannot learn when they feel threatened or shamed. This module teaches you to build a bridge of connection first – then guide behaviour from a place of safety.",
    estimatedMinutes: 75,
    lessons: [
      {
        id: "p3l1",
        title: "Why Connection Works",
        description: "The neuroscience of safety and learning.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "p3l1a1",
            type: "carousel",
            title: "Upstairs vs Downstairs Brain",
            instruction: "Swipe to understand how your child's brain works under stress.",
            content: {
              cards: [
                { title: "Downstairs Brain", body: "Responsible for basic functions, emotions, and survival. When a child is upset, they are in their downstairs brain – they cannot reason, listen, or learn." },
                { title: "Upstairs Brain", body: "Responsible for logic, empathy, and self‑control. This doesn't fully develop until the mid‑20s. And it shuts down completely under threat." },
                { title: "Connection Opens the Staircase", body: "When a child feels safe (connected, heard, not judged), the staircase between downstairs and upstairs opens. Only then can they learn." }
              ]
            }
          },
          {
            id: "p3l1a2",
            type: "true_false",
            title: "Check Your Understanding",
            instruction: "A child who is screaming and throwing toys can learn a lesson right now if you explain it firmly.",
            content: { statement: "A child who is screaming and throwing toys can learn a lesson right now if you explain it firmly.", answer: false, explanation: "Their downstairs brain is in charge. They need co‑regulation (your calm presence) before any teaching can happen." }
          }
        ]
      },
      {
        id: "p3l2",
        title: "The Five‑Second Pivot",
        description: "How to shift from ‘what are you doing?’ to ‘I see you.’",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p3l2a1",
            type: "decision_point",
            title: "Connection Scripts",
            instruction: "Your child spilled milk all over the floor after you asked them to be careful. Which response builds connection?",
            content: {
              scenario: "Milk everywhere. Child looks scared.",
              options: [
                { label: "‘I told you to be careful! Look at this mess!’", outcome: "Shame floods the child's brain. They learn to hide mistakes, not repair them." },
                { label: "‘Oh honey, accidents happen. Let's clean it up together. Are you okay?’", outcome: "Safety first. Then repair. This builds resilience.", isOptimal: true }
              ]
            }
          },
          {
            id: "p3l2a2",
            type: "open_response",
            title: "Your Connection Phrase",
            instruction: "Write a short phrase you can say when you first see your child upset – before any correction. (e.g., ‘I'm here,’ ‘Let's breathe,’ ‘Tell me about it.’)",
            content: { prompt: "My connection phrase is…", placeholder: "When my child is upset, I will say…", minWords: 10 },
            saveToVault: true
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 4 – The Fence: Holding Boundaries With Kindness
  // ══════════════════════════════════════════════════════════
  {
    id: "p4",
    title: "The Fence",
    subtitle: "Holding Boundaries With Kindness",
    image: "/images/parenting/module4-fence.png",
    description: "Boundaries are not punishments. They are fences that keep children safe and give them freedom to play within clear limits. This module teaches you how to say no without yelling – and mean it.",
    estimatedMinutes: 65,
    lessons: [
      {
        id: "p4l1",
        title: "Boundaries as Love",
        description: "Why children need fences – and how to build them without breaking connection.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p4l1a1",
            type: "carousel",
            title: "The Playground Fence",
            instruction: "Imagine a playground with no fence. Children feel anxious, unsure where it's safe to run. A fence gives freedom because the edges are known.",
            content: {
              cards: [
                { title: "A Boundary Is Not a Wall", body: "A wall says ‘you cannot come near me.’ A fence says ‘here is where you can play safely, and I am right here watching.’" },
                { title: "The Three Parts", body: "1) Acknowledge the feeling. 2) State the limit. 3) Offer a choice or alternative." },
                { title: "Example", body: "‘I know you want to keep playing (feeling). It's time for bed (limit). Do you want to hop like a frog or fly like a bird to your room? (choice)’" }
              ]
            }
          },
          {
            id: "p4l1a2",
            type: "fill_blanks",
            title: "Build Your Boundary Script",
            instruction: "Complete the template for a common struggle (e.g., leaving the park, turning off TV).",
            content: { text: "I see you feel ___ about ___. The rule is ___. Would you like to ___ or ___ ?", blanks: ["feeling", "situation", "limit", "choice A", "choice B"] }
          }
        ]
      },
      {
        id: "p4l2",
        title: "When They Test the Fence",
        description: "What to do when your child pushes back (and they will – that's their job).",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p4l2a1",
            type: "decision_point",
            title: "Holding the Line",
            instruction: "You said ‘no more TV.’ Your child throws the remote. What now?",
            content: {
              scenario: "Child throws remote after you said no.",
              options: [
                { label: "‘That's it! No TV for a week!’", outcome: "Punishment escalates and doesn't teach repair." },
                { label: "‘I see you're really angry about the TV turning off. Throwing is not okay. The remote needs a time out. Let's pick it up together. Tomorrow we can try TV again.’", outcome: "You hold the boundary, acknowledge the feeling, and guide repair. This is the fence.", isOptimal: true }
              ]
            }
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 5 – The Repair: Apologising and Reconnecting
  // ══════════════════════════════════════════════════════════
  {
    id: "p5",
    title: "The Repair",
    subtitle: "Apologising and Reconnecting After Ruptures",
    image: "/images/parenting/module5-repair.png",
    description: "You will lose your temper. You will say things you regret. That does not make you a bad parent – it makes you human. The magic is in the repair.",
    estimatedMinutes: 60,
    lessons: [
      {
        id: "p5l1",
        title: "The Four Steps of Repair",
        description: "How to apologise to your child in a way that restores trust.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p5l1a1",
            type: "carousel",
            title: "Repair, Not Excuse",
            instruction: "Swipe to learn the four steps of a genuine apology to a child.",
            content: {
              cards: [
                { title: "1. Name What Happened", body: "‘I yelled at you earlier.’ Not ‘I'm sorry you made me yell.’" },
                { title: "2. Take Responsibility", body: "‘That was not your fault. I was overwhelmed, and I should have taken a pause.’" },
                { title: "3. Express Remorse", body: "‘I am truly sorry. I know that must have felt scary.’" },
                { title: "4. Make a Plan", body: "‘Next time I feel that angry, I will walk away and breathe. Can we practice a signal for when I need a pause?’" }
              ]
            }
          },
          {
            id: "p5l1a2",
            type: "open_response",
            title: "A Repair I Need to Make",
            instruction: "Think of a recent rupture. Write a repair script using the four steps.",
            content: { prompt: "Dear child, earlier when… I was wrong because… I am sorry. Next time I will…", placeholder: "Write your repair…", minWords: 40 },
            saveToVault: true
          }
        ]
      },
      {
        id: "p5l2",
        title: "Repairing With Yourself",
        description: "Letting go of parental guilt.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "p5l2a1",
            type: "open_response",
            title: "Forgiving Yourself",
            instruction: "Write a letter of forgiveness to yourself. Not excusing the behaviour, but releasing the shame.",
            content: { prompt: "I forgive myself for… because I am learning…", placeholder: "I forgive myself for…", minWords: 50 },
            saveToVault: true
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 6 – The Village: Co‑Parenting and Support
  // ══════════════════════════════════════════════════════════
  {
    id: "p6",
    title: "The Village",
    subtitle: "Co‑Parenting and Asking for Help",
    image: "/images/parenting/module6-village.png",
    description: "You were never meant to do this alone. This module helps you communicate with your co‑parent (partner, ex‑partner, or other caregivers) and build a network of support.",
    estimatedMinutes: 70,
    lessons: [
      {
        id: "p6l1",
        title: "Getting on the Same Page",
        description: "How to have gentle check‑ins with your co‑parent, even when you disagree.",
        estimatedMinutes: 30,
        activities: [
          {
            id: "p6l1a1",
            type: "conversation_challenge",
            title: "The Weekly Check‑In",
            instruction: "Schedule 10 minutes with your co‑parent. Take turns answering: ‘What went well this week? What was hard? What do you need from me?’ No fixing, just listening.",
            content: { prompt: "After your check‑in, write one thing you learned about your co‑parent's experience.", maxSeconds: 120 },
            saveToVault: true
          },
          {
            id: "p6l1a2",
            type: "fill_blanks",
            title: "A Gentle Request",
            instruction: "Complete this sentence to ask for help without blame.",
            content: { text: "I feel ___ when ___. I would love it if we could ___ .", blanks: ["feeling", "situation", "request"] }
          }
        ]
      },
      {
        id: "p6l2",
        title: "Asking for Help",
        description: "Building your village – without guilt.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p6l2a1",
            type: "open_response",
            title: "My Support Map",
            instruction: "List three people you could ask for help (practical or emotional). Next to each, write one specific thing you could ask for.",
            content: { prompt: "Person 1: … I can ask them for … Person 2: … Person 3: …", placeholder: "My support map…", minWords: 30 },
            saveToVault: true
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 7 – The Rhythm: Routines Without Rigidity
  // ══════════════════════════════════════════════════════════
  {
    id: "p7",
    title: "The Rhythm",
    subtitle: "Routines Without Rigidity",
    image: "/images/parenting/module7-rhythm.png",
    description: "Children thrive on predictability, but life is messy. This module helps you create flexible daily rhythms that reduce resistance and increase cooperation.",
    estimatedMinutes: 60,
    lessons: [
      {
        id: "p7l1",
        title: "Rhythm vs Schedule",
        description: "The difference between a clock‑based schedule and a flow‑based rhythm.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p7l1a1",
            type: "carousel",
            title: "Visual Rhythms",
            instruction: "Swipe to see examples of daily rhythms for young children.",
            content: {
              cards: [
                { title: "Morning Rhythm", body: "Wake → Snuggle → Pee/Potty → Eat → Get Dressed → Play → Out the door. (Times can flex, order stays.)" },
                { title: "Bedtime Rhythm", body: "Tidy toys → Bath → Pajamas → Brush teeth → Books → Cuddle → Lights out." },
                { title: "Why It Works", body: "Predictability lowers anxiety. The child knows what comes next, so they resist less." }
              ]
            }
          },
          {
            id: "p7l1a2",
            type: "open_response",
            title: "Our Family Rhythm",
            instruction: "Write down the sequence of your morning or bedtime routine. What works? What causes friction?",
            content: { prompt: "Our morning rhythm is… The tricky part is…", placeholder: "Our rhythm…", minWords: 40 },
            saveToVault: true
          }
        ]
      },
      {
        id: "p7l2",
        title: "Transitions Without Tears",
        description: "How to move from one activity to the next without battles.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "p7l2a1",
            type: "decision_point",
            title: "The Five‑Minute Warning",
            instruction: "Your child is deep in play. You need to leave for school. Which works better?",
            options: [
              { label: "‘We have to go NOW!’", outcome: "Shock transition. Child feels powerless, often results in meltdown." },
              { label: "‘In five minutes, we will put our shoes on. Do you want to play two more minutes or three?’", outcome: "Warning + small choice = smooth transition.", isOptimal: true }
            ]
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // MODULE 8 – The Garden: Growing Yourself as a Parent
  // ══════════════════════════════════════════════════════════
  {
    id: "p8",
    title: "The Garden",
    subtitle: "Growing Yourself as a Parent",
    image: "/images/parenting/module8-garden.png",
    description: "The most important gift you can give your child is your own ongoing growth. This final module helps you commit to self‑compassion, learning, and celebrating small wins.",
    estimatedMinutes: 60,
    lessons: [
      {
        id: "p8l1",
        title: "Parenting as Practice",
        description: "Every day is a new chance to try again.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "p8l1a1",
            type: "true_false",
            title: "Perfectionism Trap",
            instruction: "A good parent never loses their cool.",
            content: { statement: "A good parent never loses their cool.", answer: false, explanation: "A good parent repairs. A good parent learns. A good parent is human." }
          },
          {
            id: "p8l1a2",
            type: "open_response",
            title: "One Small Change",
            instruction: "What is one small, realistic change you want to make in your parenting this week? (Not ‘be more patient’ – something concrete like ‘take three deep breaths before responding’.)",
            content: { prompt: "This week I will…", placeholder: "This week I will…", minWords: 20 },
            saveToVault: true
          }
        ]
      },
      {
        id: "p8l2",
        title: "Celebrating the Wins",
        description: "You are doing better than you think.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "p8l2a1",
            type: "token_appreciation",
            title: "One Win Today",
            instruction: "Every evening, write down one thing you did today that aligned with your parenting values. (Even if the rest was hard.)",
            content: { promptWhat: "Today I did…", promptWhy: "That mattered because…" },
            saveToVault: true
          }
        ]
      }
    ]
  }
];

export default PARENTING_COURSE;