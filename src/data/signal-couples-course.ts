// signal-couples-course.ts
// Synthesized from 19 relationship science books
// Tone: Warm, direct, reflective, action-oriented
// All journaling activities save to user's memory vault

export interface CourseActivity {
  id: string;
  type:
    | "carousel"
    | "flip_card"
    | "reaction_slider"
    | "open_response"
    | "decision_point"
    | "conversation_challenge"
    | "true_false"
    | "sort"
    | "fill_blanks"
    | "short_answer"
    | "token_appreciation"
    | "survey"
    | "image_upload"
    | "video_upload"
    | "knowledge_check";
  title: string;
  instruction?: string;
  content: any;
  tip?: string;
  saveToVault?: boolean;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
  activities: CourseActivity[];
}

export interface CourseModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
  estimatedMinutes?: number;
  lessons: CourseLesson[];
}

export const SIGNAL_COUPLES_COURSE: CourseModule[] = [
  // ============================================================
  // MODULE 1: THE BLUEPRINT — Attachment & How You Love
  // ============================================================
  {
    id: "module-1",
    title: "The Blueprint",
    subtitle: "Attachment & How You Love",
    description:
      "Before you can change a pattern, you have to see it. This module helps you understand your attachment style, your partner's, and the dance you've created together — not to assign blame, but to build awareness.",
    icon: "lucide-heart",
    estimatedMinutes: 55,
    lessons: [
      {
        id: "m1-l1",
        title: "Your Relational Fingerprint",
        description:
          "Attachment styles aren't diagnoses — they're patterns. And patterns can be rewoven.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m1-l1-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Before we begin, take a breath and answer honestly.",
            content: {
              question:
                "When you're upset with your partner, what's your most common first move?",
              options: [
                { emoji: "🏃", label: "Pull away / go quiet" },
                { emoji: "📞", label: "Reach out / seek reassurance" },
                { emoji: "⚖️", label: "Talk it through calmly" },
                { emoji: "🎭", label: "Push and pull — I want closeness but also space" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m1-l1-a1",
            type: "carousel",
            title: "The Four Patterns",
            instruction:
              "Swipe through. See if you recognise yourself or your partner.",
            content: {
              cards: [
                {
                  title: "Secure",
                  body: "You trust easily. You're comfortable with closeness AND independence. When conflict comes, you don't panic or flee — you stay and work.",
                  icon: "lucide-shield",
                },
                {
                  title: "Anxious",
                  body: "You crave deep connection — but you're terrified of losing it. Small moments of distance feel enormous. You might seek reassurance more than you'd like to admit.",
                  icon: "lucide-bell",
                },
                {
                  title: "Avoidant",
                  body: "You value your freedom. Intimacy can feel like a trap. When someone gets too close, you find reasons to pull back — sometimes before you even notice you're doing it.",
                  icon: "lucide-footprints",
                },
                {
                  title: "Disorganised",
                  body: "You want love AND you're scared of it. This push-pull can be exhausting — for you and your partner. It often comes from early experiences where love and fear were tangled.",
                  icon: "lucide-shuffle",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m1-l1-a2",
            type: "open_response",
            title: "Your Earliest Love Lessons",
            instruction:
              "What did you learn about love before you were ten? How was anger handled in your house? Was it safe to cry? To need?",
            content: {
              prompt:
                "Think about your childhood home. What did you unconsciously decide about relationships?",
              placeholder:
                "I learned that love meant... When someone was upset, we would... What I never wanted to repeat was...",
              minWords: 40,
            },
            tip: "This isn't about blaming your parents. It's about seeing the water you've been swimming in.",
            saveToVault: true,
          },
          {
            id: "m1-l1-a3",
            type: "flip_card",
            title: "Key Attachment Concepts",
            instruction: "Tap each card — these ideas will come up again and again.",
            content: {
              cards: [
                {
                  front: "Secure Base",
                  back: "A partner who provides a secure base is someone you can leave from and return to. They don't punish you for independence — and they don't abandon you in need.",
                },
                {
                  front: "Protest Behavior",
                  back: "When an anxiously attached person feels distance, they may protest: texting repeatedly, picking fights, or escalating to get a response.",
                },
                {
                  front: "Deactivation",
                  back: "Avoidant partners deactivate by minimising feelings, focusing on flaws, or mentally checking out. 'It's not a big deal' is a classic line.",
                },
                {
                  front: "Earned Security",
                  back: "Here's the hope: attachment styles can change. Through therapy, a secure relationship, or intentional work, you can become more secure over time.",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m1-l1-a4",
            type: "open_response",
            title: "My Pattern in Action",
            instruction:
              "Describe a recent moment when your attachment pattern showed up. What triggered it? What did you do? What were you really needing underneath?",
            content: {
              prompt:
                "Be specific. The more concrete, the more useful this becomes.",
              placeholder:
                "Last week when they came home late and didn't text, I felt... I responded by... Underneath, I really needed...",
              minWords: 30,
            },
            tip: "The question isn't 'Is my attachment style good or bad?' It's 'What does it need?'",
            saveToVault: true,
          },
        ],
      },
      {
        id: "m1-l2",
        title: "The Dance Between You",
        description:
          "Attachment styles don't exist in isolation — they create patterns together. This is where the real insight lives.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m1-l2-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Before we explore your couple dance, reflect:",
            content: {
              question:
                "When you and your partner argue, do you tend to move toward each other or away?",
              options: [
                { emoji: "🏃‍♂️", label: "We both pull away" },
                { emoji: "🏃‍♀️➡️🏃", label: "One pursues, one withdraws" },
                { emoji: "🤜🤛", label: "We both lean in — sometimes too hard" },
                { emoji: "🌀", label: "It depends on the day" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m1-l2-a1",
            type: "carousel",
            title: "Classic Couple Dances",
            instruction:
              "See if any of these sound familiar. Most couples have a version of one.",
            content: {
              cards: [
                {
                  title: "Pursuer-Distancer",
                  body: "One of you wants to talk. The other wants space. The more one pursues, the more the other withdraws — and the more the pursuer escalates. No one is wrong. The pattern is the problem.",
                  icon: "lucide-arrow-big-right",
                },
                {
                  title: "Fight-Flight-Freeze",
                  body: "Conflict triggers a survival response. One attacks. One flees. One shuts down. You're not bad partners — you're two nervous systems doing what they learned.",
                  icon: "lucide-zap",
                },
                {
                  title: "The Critic-The Avoider",
                  body: "One voices complaints (often indirectly). The other nods and changes nothing. Resentment builds on both sides. Nothing gets resolved, but no one fights — and that's its own kind of dangerous.",
                  icon: "lucide-message-circle-x",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m1-l2-a2",
            type: "open_response",
            title: "Name Your Dance",
            instruction:
              "What's the pattern you and your partner fall into when things get hard? Give it a name. Describe the steps.",
            content: {
              prompt:
                "The more specific you are, the more power you have to change it.",
              placeholder:
                "Our dance is called 'The Spiral.' It starts when... I usually do... They usually do... The moment it tips is when...",
              minWords: 40,
            },
            tip: "Naming the pattern together is already beginning to escape it.",
            saveToVault: true,
          },
          {
            id: "m1-l2-a3",
            type: "token_appreciation",
            title: "Week 1 Practice: Three Small Turnings",
            instruction:
              "This week, every day, notice three small things your partner does that you appreciate. Tell them. Say it out loud. See what shifts.",
            content: {
              startingTokens: 21,
              promptWhat: "What did they do?",
              promptWhy: "What did it mean to you?",
              storageKey: "signal-couples-appreciation-week1",
            },
            tip: "Appreciation is not flattery. It's attention to what's already good.",
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 2: THE CURRENCY — Bids for Connection
  // ============================================================
  {
    id: "module-2",
    title: "The Currency",
    subtitle: "Bids for Connection",
    description:
      "Every relationship is built in small moments — a glance, a question, a sigh. This module teaches you to see these 'bids' and respond in ways that build trust instead of eroding it.",
    icon: "lucide-eye",
    estimatedMinutes: 50,
    lessons: [
      {
        id: "m2-l1",
        title: "What's a Bid?",
        description:
          "Most of what happens in a relationship isn't big conversations. It's tiny invitations.",
        estimatedMinutes: 15,
        activities: [
          {
            id: "m2-l1-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Before we define bids, reflect:",
            content: {
              question:
                "When your partner tries to get your attention — a comment, a touch, a question — how often do you really notice?",
              options: [
                { emoji: "🔇", label: "I miss most of them" },
                { emoji: "👀", label: "I catch some, miss a lot" },
                { emoji: "👌", label: "About half" },
                { emoji: "🎯", label: "Most of them" },
                { emoji: "🦻", label: "Almost all — I'm attuned" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m2-l1-a1",
            type: "carousel",
            title: "Bids Are Everywhere",
            instruction: "Swipe through. These are all bids.",
            content: {
              cards: [
                {
                  title: "A Question",
                  body: "'Did you see that?' 'How was your day?' 'What are you thinking?' — each is a reach toward connection.",
                  icon: "lucide-message-circle",
                },
                {
                  title: "A Sound",
                  body: "A sigh from the other room. A laugh at something on their phone. A throat clear. They're inviting you in.",
                  icon: "lucide-volume-2",
                },
                {
                  title: "A Touch",
                  body: "A hand on your back. A shoulder bump. A foot under the table. These are wordless bids.",
                  icon: "lucide-hand",
                },
                {
                  title: "A Face",
                  body: "A smile. A frown. Raised eyebrows. Your partner's face is always sending signals.",
                  icon: "lucide-smile",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m2-l1-a2",
            type: "fill_blanks",
            title: "The Three Responses",
            instruction: "Complete each sentence to understand the stakes.",
            content: {
              text: "When I turn ___ — by making eye contact, putting down my phone, or saying 'tell me more' — I make a deposit in our Emotional Bank Account. When I turn ___ — by missing the bid or giving a distracted response — I make a withdrawal. When I turn ___ — by snapping or dismissing — I do real damage.",
              blanks: ["toward", "away", "against"],
            },
            saveToVault: false,
          },
          {
            id: "m2-l1-a3",
            type: "open_response",
            title: "The Bids You Missed",
            instruction:
              "Think back over the last 24 hours. What bids did your partner make that you missed? What were they really asking for?",
            content: {
              prompt:
                "This isn't about guilt. It's about waking up to what's already happening.",
              placeholder:
                "Yesterday, they... I was doing... Their bid was really asking... Looking back, I wish I had...",
              minWords: 30,
            },
            tip: "Turning toward doesn't require a long conversation. A nod and 'tell me more' counts.",
            saveToVault: true,
          },
          {
            id: "m2-l1-a4",
            type: "knowledge_check",
            title: "Quick Check",
            instruction: "Make sure the core idea landed.",
            content: {
              intro: "Just to lock it in:",
              passMark: 2,
              questions: [
                {
                  question: "What percentage of bids do 'masters' of relationships turn toward?",
                  options: ["33%", "50%", "86%", "95%"],
                  correct: 2,
                  explanation:
                    "Gottman found that masters turn toward bids 86% of the time. Disasters: only 33%.",
                },
                {
                  question: "Which response is most damaging to a relationship?",
                  options: ["Turning toward", "Turning away", "Turning against", "All are equally damaging"],
                  correct: 2,
                  explanation:
                    "Turning against — snapping, dismissing, contempt — does active harm. It's worse than simply missing a bid.",
                },
              ],
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "m2-l2",
        title: "The Emotional Bank Account",
        description:
          "Every turning-toward is a deposit. Every turning-away is a withdrawal. This is how trust is built — or bankrupted.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m2-l2-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Before we go deeper:",
            content: {
              question:
                "Right now, is your Emotional Bank Account with your partner in credit or deficit?",
              options: [
                { emoji: "📉", label: "Deep in the red" },
                { emoji: "⚖️", label: "Barely breaking even" },
                { emoji: "📈", label: "In credit, but not thriving" },
                { emoji: "💚", label: "Solidly in credit" },
                { emoji: "🏦", label: "Rich — we have reserves" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m2-l2-a1",
            type: "decision_point",
            title: "Deposit or Withdrawal?",
            instruction: "Your partner says: 'Long day. I'm so tired.' Choose wisely.",
            content: {
              scenario: "They're slumped on the couch, eyes half-closed.",
              choices: [
                {
                  label: "You keep scrolling and say 'Yeah, me too.'",
                  outcome: "Turning away. Small withdrawal. Over time, these add up.",
                  isOptimal: false,
                },
                {
                  label: "You put down your phone, turn toward them, and say: 'Tell me about it.'",
                  outcome: "Turning toward. Deposit. This is how safety is built.",
                  isOptimal: true,
                },
                {
                  label: "You say: 'You're always tired. Maybe if you went to bed earlier.'",
                  outcome: "Turning against. This is a withdrawal with interest.",
                  isOptimal: false,
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m2-l2-a2",
            type: "open_response",
            title: "Your Account History",
            instruction:
              "Think of a recent conflict. Before the fight, was your account in credit or deficit? How did that affect what happened?",
            content: {
              prompt:
                "Couples with reserves can have a hard conversation without disaster. Couples in deficit — one spark ignites everything.",
              placeholder:
                "Before we fought about X, our account felt... I think that's why the fight went the way it did... If we'd been in credit, maybe...",
              minWords: 35,
            },
            tip: "This is why small daily deposits matter so much. They're not 'extra' — they're infrastructure.",
            saveToVault: true,
          },
          {
            id: "m2-l2-a3",
            type: "conversation_challenge",
            title: "Practice: 10 Minutes of Turning Toward",
            instruction:
              "This week, set aside 10 minutes. No phones. No agenda. Just ask each other open questions and listen — without fixing, without advice. Then reflect here.",
            content: {
              prompt:
                "What surprised you? What was hard? What did you learn about how it feels to be truly heard?",
              maxSeconds: 180,
            },
            tip: "The goal is not to solve anything. The goal is to be together.",
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 3: THE FLOOD — When Your Nervous System Takes Over
  // ============================================================
  {
    id: "module-3",
    title: "The Flood",
    subtitle: "When Your Nervous System Takes Over",
    description:
      "You can't listen when your body thinks it's under attack. This module teaches you to recognise flooding — and take a pause before damage is done.",
    icon: "lucible-waves",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "m3-l1",
        title: "The 100 BPM Problem",
        description:
          "When your heart rate exceeds 100 beats per minute, your brain literally cannot process complex information. You're not being stubborn — you're flooded.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m3-l1-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Be honest:",
            content: {
              question:
                "During a heated argument, how easy is it for you to stay calm and really listen?",
              options: [
                { emoji: "🌊", label: "Almost impossible — I get flooded fast" },
                { emoji: "😤", label: "Hard — I need breaks to stay regulated" },
                { emoji: "😐", label: "Hit or miss — depends on the topic" },
                { emoji: "🧘", label: "I can usually stay present" },
                { emoji: "🌟", label: "I'm naturally calm under fire" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m3-l1-a1",
            type: "carousel",
            title: "Signs You're Flooded",
            instruction: "Your body knows before your mind does.",
            content: {
              cards: [
                {
                  title: "Physical Signs",
                  body: "Racing heart. Shallow breathing. Tight jaw or clenched fists. Hot face. Tunnel vision. You feel like running or punching.",
                  icon: "lucide-heart",
                },
                {
                  title: "Emotional Signs",
                  body: "Overwhelming anger. Numbness. Feeling attacked — even if they're not attacking. Inability to remember anything good about your partner.",
                  icon: "lucide-cloud-lightning",
                },
                {
                  title: "Cognitive Signs",
                  body: "Can't find words. Repeating the same point. Hearing everything as criticism. Mentally rehearsing your counter-argument instead of listening.",
                  icon: "lucide-brain",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m3-l1-a2",
            type: "true_false",
            title: "Flooding Facts",
            instruction: "Test your knowledge.",
            content: {
              statement:
                "Once you're flooded, the best thing to do is push through and finish the conversation.",
              correct: false,
              explanation:
                "Pushing through flooded is like trying to drive with fogged windows. You can't see clearly. You need to pause — for at least 20 minutes.",
            },
            saveToVault: false,
          },
          {
            id: "m3-l1-a3",
            type: "open_response",
            title: "Your Flooding Signature",
            instruction:
              "How do you know when you're flooded? What's the first sign? What do you tend to do next?",
            content: {
              prompt:
                "The earlier you catch it, the easier it is to pause before damage.",
              placeholder:
                "The very first sign I'm flooding is... When that happens, I usually... If I could catch it earlier, I would...",
              minWords: 25,
            },
            saveToVault: true,
          },
        ],
      },
      {
        id: "m3-l2",
        title: "The Sacred Pause",
        description:
          "A pause is not abandonment. It's the most mature move two people can make.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "m3-l2-a0",
            type: "fill_blanks",
            title: "Your Time-Out Script",
            instruction: "Complete this sentence so you're ready next time.",
            content: {
              text: "I'm feeling ___. I need ___ minutes to calm down. I will come back at ___. This is not about leaving you. It's about protecting us.",
              blanks: ["flooded", "20-30", "a specific time"],
            },
            saveToVault: false,
          },
          {
            id: "m3-l2-a1",
            type: "decision_point",
            title: "Honoring the Pause",
            instruction:
              "Your partner says: 'I need 20 minutes. I'm flooded.' You're still hot. What do you do?",
            content: {
              scenario: "The argument is half-finished. You have more to say.",
              choices: [
                {
                  label: "Say 'Fine' but follow them, still arguing.",
                  outcome: "This isn't a pause. It's a chase. It will escalate.",
                  isOptimal: false,
                },
                {
                  label: "Say 'You always do this. You're running away.'",
                  outcome: "Turning against. Guarantees they won't come back calm.",
                  isOptimal: false,
                },
                {
                  label: "Say 'Okay. I'll see you in 20 minutes. I love you.'",
                  outcome:
                    "This is how trust is built. You honour the pause — even when it's hard.",
                  isOptimal: true,
                },
              ],
            },
            tip: "The pause only works if you both agree to return. Without that promise, it's just withdrawal.",
            saveToVault: false,
          },
          {
            id: "m3-l2-a2",
            type: "open_response",
            title: "What You Do in the Pause",
            instruction:
              "If you take a break, what will you actually DO to calm your nervous system? Ruminating on the argument doesn't count.",
            content: {
              prompt:
                "Walking? Breathing music? A shower? Petting the dog? Have a plan before you need it.",
              placeholder:
                "When I take a pause, I will... I will NOT ruminate by... I will return when...",
              minWords: 25,
            },
            tip: "It takes at least 20 minutes for stress hormones to leave your bloodstream. Don't shortchange the pause.",
            saveToVault: true,
          },
          {
            id: "m3-l2-a3",
            type: "conversation_challenge",
            title: "Agree on Your Signal",
            instruction:
              "Talk with your partner right now. What's your nonverbal signal for 'I need a pause'? A hand on the chest? A specific word? Write it here.",
            content: {
              prompt:
                "Also agree: whoever calls the pause, the other honours it immediately. No questions. No guilt.",
              maxSeconds: 90,
            },
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 4: THE FOUR HORSEMEN — Patterns That Destroy
  // ============================================================
  {
    id: "module-4",
    title: "The Four Horsemen",
    subtitle: "Patterns That Destroy — and Their Antidotes",
    description:
      "Gottman can predict divorce with 94% accuracy by watching for four patterns. This module helps you spot them in yourself — and replace them with something better.",
    icon: "lucide-skull",
    estimatedMinutes: 55,
    lessons: [
      {
        id: "m4-l1",
        title: "Meet the Horsemen",
        description:
          "Criticism. Contempt. Defensiveness. Stonewalling. None of them ride alone.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m4-l1-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Before we name them:",
            content: {
              question:
                "When you're in conflict, which of these do you reach for most?",
              options: [
                { emoji: "🗣️", label: "Criticism ('You always...')" },
                { emoji: "😒", label: "Contempt (eye-roll, sarcasm)" },
                { emoji: "🛡️", label: "Defensiveness ('Not my fault')" },
                { emoji: "🪨", label: "Stonewalling (shutting down)" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m4-l1-a1",
            type: "carousel",
            title: "The Four Horsemen",
            instruction: "Swipe through. Recognise any?",
            content: {
              cards: [
                {
                  title: "Criticism",
                  body: "Criticism attacks character: 'You always leave your crap everywhere.' Antidote: a gentle start-up — 'I feel frustrated when I see clothes on the floor. Can we talk about a system?'",
                  icon: "lucide-message-circle-x",
                },
                {
                  title: "Contempt",
                  body: "Contempt is the #1 predictor of divorce. Eye-rolling, sarcasm, mockery, name-calling. Antidote: building a culture of appreciation. What do you admire about your partner? Say it out loud.",
                  icon: "lucide-eye-off",
                },
                {
                  title: "Defensiveness",
                  body: "Defensiveness says 'Not me — you!' It escalates every conflict. Antidote: accepting even a small piece of responsibility. 'You're right, I could have handled that better.'",
                  icon: "lucide-shield",
                },
                {
                  title: "Stonewalling",
                  body: "Stonewalling is checking out — going silent, leaving the room, giving the cold shoulder. Antidote: naming your flooding and taking a timed pause. 'I need 20 minutes. I'll be back.'",
                  icon: "lucide-wall",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m4-l1-a2",
            type: "flip_card",
            title: "What Underlies Each Horseman",
            instruction: "Tap to see what's really happening underneath.",
            content: {
              cards: [
                {
                  front: "Under Criticism",
                  back: "Underneath criticism is usually a hidden need or an unexpressed hurt. 'You never listen' is really 'I need to feel heard.'",
                },
                {
                  front: "Under Contempt",
                  back: "Contempt masks deep pain or feeling unheard. It's a protection — but it destroys the relationship it's trying to protect.",
                },
                {
                  front: "Under Defensiveness",
                  back: "Defensiveness is fear of being blamed, shamed, or seen as 'bad.' It says: 'I can't handle one more thing being my fault.'",
                },
                {
                  front: "Under Stonewalling",
                  back: "Stonewalling is a flooded nervous system protecting itself. It's not indifference — it's overwhelm.",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m4-l1-a3",
            type: "open_response",
            title: "Your Usual Horseman",
            instruction:
              "Which horseman do you ride most often? Give a recent example. Then try the antidote — rewrite what you could have said.",
            content: {
              prompt: "Honesty here is gold. No one is free of these patterns.",
              placeholder:
                "My go-to horseman is... Last week when... happened, I... The antidote version would have been...",
              minWords: 35,
            },
            tip: "The goal isn't perfection. It's catching yourself earlier each time.",
            saveToVault: true,
          },
        ],
      },
      {
        id: "m4-l2",
        title: "The Antidotes in Action",
        description: "Knowing the horsemen isn't enough. You have to practise the replacement.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m4-l2-a0",
            type: "decision_point",
            title: "Criticism → Gentle Start-Up",
            instruction:
              "You're irritated that your partner left dishes in the sink. Again. You're about to say: 'You are so lazy. You never clean up.' Pause. What's the gentle version?",
            content: {
              scenario: "Dishes in the sink. This is the third time this week.",
              choices: [
                {
                  label: "'I'm so tired of cleaning up after you.'",
                  outcome: "Still criticism — just softer. 'After you' is still blaming.",
                  isOptimal: false,
                },
                {
                  label: "'I feel frustrated when I see dishes left. I'd love it if we could both rinse and load before bed.'",
                  outcome: "Gentle start-up. No blame. Specific request. This works.",
                  isOptimal: true,
                },
                {
                  label: "Do it yourself in silence, then seethe.",
                  outcome: "Stonewalling with extra resentment. Not an antidote.",
                  isOptimal: false,
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m4-l2-a1",
            type: "decision_point",
            title: "Defensiveness → Ownership",
            instruction:
              "Your partner says: 'I was hurt you didn't call to say you'd be late.' Your stomach clenches. What do you say?",
            content: {
              scenario: "You were late. You had reasons. But they're hurt.",
              choices: [
                {
                  label: "'I was busy! My boss kept me late. It's not my fault.'",
                  outcome: "Defensiveness. Escalates. They feel unheard.",
                  isOptimal: false,
                },
                {
                  label: "'You're right, I should have called. I'm sorry. Next time I will.'",
                  outcome: "Ownership. De-escalates. They feel heard.",
                  isOptimal: true,
                },
                {
                  label: "'You're so sensitive. It was 20 minutes.'",
                  outcome: "Contempt + criticism. Double horseman.",
                  isOptimal: false,
                },
              ],
            },
            tip: "Ownership doesn't mean taking all the blame. It means taking your piece. 'I could have done that better' is enough.",
            saveToVault: false,
          },
          {
            id: "m4-l2-a2",
            type: "open_response",
            title: "Build Your Antidote Library",
            instruction:
              "For each horseman, write one phrase you could actually say when you feel yourself reaching for it.",
            content: {
              prompt:
                "Make them real. Make them yours. Then practise saying them alone so they're ready when you need them.",
              placeholder:
                "Instead of criticism: 'I feel...' Instead of contempt: 'What I actually need is...' Instead of defensiveness: 'You might be right that...' Instead of stonewalling: 'I need 20 minutes. I'll be back at...'",
              minWords: 30,
            },
            saveToVault: true,
          },
          {
            id: "m4-l2-a3",
            type: "token_appreciation",
            title: "Week 2 Practice: The Appreciation Ratio",
            instruction:
              "This week, aim for 5 specific appreciations for every 1 frustration you express. Not 5:1 in your head — 5:1 out loud.",
            content: {
              startingTokens: 35,
              promptWhat: "What did they do? Be specific.",
              promptWhy: "What did it make you feel?",
              storageKey: "signal-couples-appreciation-week2",
            },
            tip: "The 5:1 ratio isn't a suggestion. It's the mathematical threshold for relationship health.",
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 5: THE REPAIR — Apology, Forgiveness & Healing
  // ============================================================
  {
    id: "module-5",
    title: "The Repair",
    subtitle: "Apology, Forgiveness & Healing",
    description:
      "The strength of a relationship isn't measured by how rarely you hurt each other. It's measured by how well you repair.",
    icon: "lucide-bandage",
    estimatedMinutes: 50,
    lessons: [
      {
        id: "m5-l1",
        title: "What Makes an Apology Land",
        description:
          "'I'm sorry' is a start. But a real apology has bones.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m5-l1-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Think about the last time you apologised — or needed to.",
            content: {
              question:
                "When you apologise, do you tend to...",
              options: [
                { emoji: "📝", label: "Explain why you did it (justifying)" },
                { emoji: "💔", label: "Say you're sorry but feel defensive inside" },
                { emoji: "🎯", label: "Name exactly what you did wrong" },
                { emoji: "🤷", label: "Apologise to end the argument" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m5-l1-a1",
            type: "carousel",
            title: "The Anatomy of a Real Apology",
            instruction: "A genuine repair has five parts. Swipe through.",
            content: {
              cards: [
                {
                  title: "1. Remorse",
                  body: "'I'm sorry.' Not 'I'm sorry you feel that way.' Not 'I'm sorry, but...' Just: I'm sorry.",
                  icon: "lucide-heart-crack",
                },
                {
                  title: "2. Responsibility",
                  body: "Name what you did. 'I raised my voice. I shouldn't have.' Specificity proves you understand.",
                  icon: "lucide-check-circle",
                },
                {
                  title: "3. Acknowledgment of Impact",
                  body: "'I can see that made you feel shut down and small. That was the opposite of what I intended — and it happened anyway.'",
                  icon: "lucide-eye",
                },
                {
                  title: "4. Understanding",
                  body: "Show you get why it hurt. 'You needed me to listen, and I went into problem-solving. I understand why that felt dismissive.'",
                  icon: "lucide-brain",
                },
                {
                  title: "5. Repair Plan",
                  body: "'Next time, I'll take a breath and ask what you need before I offer solutions.'",
                  icon: "lucide-wrench",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m5-l1-a2",
            type: "sort",
            title: "Build Your Own Apology",
            instruction: "Arrange these into the order of a real repair.",
            content: {
              items: [
                "Acknowledge the impact on your partner",
                "Say 'I'm sorry' without a 'but'",
                "Name what you did specifically",
                "Say what you'll do differently next time",
                "Show you understand why it hurt",
              ],
              correctOrder: [1, 2, 0, 4, 3],
              context: "Remorse first. Then responsibility. Then impact, understanding, plan.",
            },
            saveToVault: false,
          },
          {
            id: "m5-l1-a3",
            type: "open_response",
            title: "Rewrite an Old Apology",
            instruction:
              "Think of a recent time you apologised poorly — or didn't apologise at all. Write the full repair version using the five parts.",
            content: {
              prompt:
                "What happened? What did you actually say? What would a real apology sound like?",
              placeholder:
                "The situation was... What I said was... A real apology would be: 'I'm sorry that I... I can see it made you feel... I understand that... Next time I will...'",
              minWords: 40,
            },
            tip: "If it feels vulnerable to share this with your partner, write it for yourself first. Then decide.",
            saveToVault: true,
          },
        ],
      },
      {
        id: "m5-l2",
        title: "Forgiveness: Your Choice, Not Theirs",
        description:
          "Forgiveness is not forgetting. It's not excusing. It's releasing the weight you've been carrying — for you, not for them.",
        estimatedMinutes: 15,
        activities: [
          {
            id: "m5-l2-a0",
            type: "true_false",
            title: "What Forgiveness Is Not",
            instruction: "Check what you believe.",
            content: {
              statement:
                "Forgiveness means you're okay with what happened and you're ready to trust again immediately.",
              correct: false,
              explanation:
                "No. Forgiveness is an internal release of resentment. Trust is rebuilt separately — through consistent behaviour over time.",
            },
            saveToVault: false,
          },
          {
            id: "m5-l2-a1",
            type: "open_response",
            title: "What You're Still Carrying",
            instruction:
              "Is there something you haven't forgiven — in this relationship or a past one? What would it cost you to keep carrying it? What might be possible if you put it down?",
            content: {
              prompt:
                "Forgiveness is a gift you give yourself. The other person may never know. That's not the point.",
              placeholder:
                "I'm still holding onto... It happened... The weight of carrying it feels like... If I could release it, I would feel...",
              minWords: 35,
            },
            tip: "You can forgive someone and still decide the relationship isn't safe. Forgiveness and reconciliation are not the same thing.",
            saveToVault: true,
          },
        ],
      },
      {
        id: "m5-l3",
        title: "Repair Attempts: The Lifeline",
        description:
          "A repair attempt is anything that tries to stop a fight from spiralling. It can be a joke, a touch, an apology, a pause. Masters of relationships make and accept repair attempts constantly.",
        estimatedMinutes: 15,
        activities: [
          {
            id: "m5-l3-a0",
            type: "decision_point",
            title: "Catch the Repair Attempt",
            instruction:
              "You're mid-argument. Voices are rising. Your partner sighs and says: 'Look, I hate fighting with you. Can we just — can we pause for a second?' What do you do?",
            content: {
              scenario: "Things are getting hot. They're trying to de-escalate.",
              choices: [
                {
                  label: "Push on: 'No, I want to finish this.'",
                  outcome: "You rejected a repair attempt. The spiral continues.",
                  isOptimal: false,
                },
                {
                  label: "Take the pause. Breathe. Say 'Okay. I love you.'",
                  outcome: "You accepted the repair. This is how couples survive.",
                  isOptimal: true,
                },
                {
                  label: "Say 'Fine' but keep your body language closed.",
                  outcome: "Half-acceptance. They feel it. The repair doesn't land.",
                  isOptimal: false,
                },
              ],
            },
            tip: "Repair attempts often come when they're hardest to receive. That's when they matter most.",
            saveToVault: false,
          },
          {
            id: "m5-l3-a1",
            type: "open_response",
            title: "Your Repair Vocabulary",
            instruction:
              "Write down 3-5 phrases or gestures you could use as repair attempts. Then ask your partner what would actually land for them.",
            content: {
              prompt:
                "Examples: 'I'm on your side.' 'Can I try that again?' 'I love you — we're going to figure this out.' A hand on their arm. A deep breath together.",
              placeholder:
                "My repair attempts could be... My partner says these would land best for them...",
              minWords: 20,
            },
            saveToVault: true,
          },
          {
            id: "m5-l3-a2",
            type: "knowledge_check",
            title: "Quick Check",
            instruction: "Make sure the core ideas landed.",
            content: {
              intro: "Just to lock it in:",
              passMark: 2,
              questions: [
                {
                  question: "Which of these is NOT a component of a genuine apology?",
                  options: [
                    "I'm sorry you feel that way",
                    "Naming what you did",
                    "Acknowledging the impact",
                    "A plan for next time",
                  ],
                  correct: 0,
                  explanation:
                    "'I'm sorry you feel that way' places responsibility on their reaction. It's not an apology — it's avoidance.",
                },
                {
                  question: "What is a repair attempt?",
                  options: [
                    "A formal apology after a fight",
                    "Any action that tries to de-escalate a conflict spiral",
                    "Agreeing to go to therapy",
                    "Giving your partner space for a week",
                  ],
                  correct: 1,
                  explanation:
                    "Repair attempts can be tiny — a sigh, a joke, a touch. The best couples make and accept them constantly.",
                },
              ],
            },
            saveToVault: false,
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 6: THE FIRE — Intimacy & Desire
  // ============================================================
  {
    id: "module-6",
    title: "The Fire",
    subtitle: "Intimacy & Desire",
    description:
      "Desire doesn't just happen. It's cultivated — in safety, in play, in the spaces between obligation and expectation.",
    icon: "lucide-flame",
    estimatedMinutes: 50,
    lessons: [
      {
        id: "m6-l1",
        title: "Intimacy Is More Than Sex",
        description:
          "There are at least five forms of intimacy. Most couples let most of them atrophy — and then wonder why the physical connection fades.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m6-l1-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Before we go deeper:",
            content: {
              question:
                "Which form of intimacy feels strongest in your relationship right now?",
              options: [
                { emoji: "💬", label: "Emotional (sharing feelings)" },
                { emoji: "🤝", label: "Physical (touch, affection)" },
                { emoji: "🧠", label: "Intellectual (deep talks, ideas)" },
                { emoji: "🎲", label: "Experiential (shared activities)" },
                { emoji: "🕯️", label: "Spiritual (shared values, meaning)" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m6-l1-a1",
            type: "carousel",
            title: "The Five Forms of Intimacy",
            instruction: "Swipe through. Which have you neglected?",
            content: {
              cards: [
                {
                  title: "Emotional",
                  body: "Feeling truly known. Sharing fears, dreams, shame, grief — without having to manage the other person's reaction. This is the foundation.",
                  icon: "lucide-heart-handshake",
                },
                {
                  title: "Physical (Non-Sexual)",
                  body: "Touch that isn't a prelude to sex. Hugs. Hand-holding. A hand on the shoulder. These lower cortisol and build safety.",
                  icon: "lucide-hand",
                },
                {
                  title: "Intellectual",
                  body: "Debating ideas. Sharing what you're reading or thinking. Feeling curious about how your partner's mind works.",
                  icon: "lucide-brain",
                },
                {
                  title: "Experiential",
                  body: "Doing things together — cooking, hiking, building, travelling. Shared memories create shared identity.",
                  icon: "lucide-briefcase",
                },
                {
                  title: "Sexual",
                  body: "The form everyone focuses on — but it rarely thrives without the other four.",
                  icon: "lucide-droplet",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m6-l1-a2",
            type: "open_response",
            title: "Your Intimacy Audit",
            instruction:
              "Rate each form of intimacy in your relationship (1-10). Which one is strongest? Which is weakest? What's one small thing you could do this week to strengthen the weakest area?",
            content: {
              prompt:
                "Don't say 'everything is fine' unless it really is. Most relationships have atrophied areas.",
              placeholder:
                "Emotional: X/10 — because... Physical non-sexual: X/10 — because... Intellectual: X/10... Experiential: X/10... Sexual: X/10... The area I want to work on is... One small step I'll take is...",
              minWords: 40,
            },
            tip: "Small things done often beat grand gestures done rarely.",
            saveToVault: true,
          },
        ],
      },
      {
        id: "m6-l2",
        title: "Understanding Desire",
        description:
          "There's no one 'normal' way to experience desire. Understanding your own pattern changes everything.",
        estimatedMinutes: 15,
        activities: [
          {
            id: "m6-l2-a0",
            type: "flip_card",
            title: "Spontaneous vs. Responsive Desire",
            instruction: "Tap each card. Huge insight here.",
            content: {
              cards: [
                {
                  front: "Spontaneous Desire",
                  back: "Desire that appears 'out of nowhere' — before any stimulation. This is the cultural ideal, but it's not the only normal.",
                },
                {
                  front: "Responsive Desire",
                  back: "Desire that emerges in response to stimulation or context — after you start. This is extremely common, especially in long-term relationships and among women.",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m6-l2-a1",
            type: "open_response",
            title: "Your Desire Map",
            instruction:
              "What turns your desire ON (accelerators)? What turns it OFF (brakes)? Be specific. Physical, emotional, contextual.",
            content: {
              prompt:
                "Most desire problems are brake problems, not accelerator problems.",
              placeholder:
                "My accelerators include... My brakes include... If I could change one brake in our relationship, it would be...",
              minWords: 30,
            },
            tip: "Stress is the biggest brake. Address stress before you try to address desire.",
            saveToVault: true,
          },
          {
            id: "m6-l2-a2",
            type: "conversation_challenge",
            title: "The No-Pressure Conversation",
            instruction:
              "This week, talk about desire without any expectation of sex. Share your accelerators and brakes. Ask about theirs. No fixing. Just listening.",
            content: {
              prompt:
                "What was hard about this conversation? What surprised you?",
              maxSeconds: 120,
            },
            tip: "The goal is understanding, not action. When understanding comes first, the rest often follows.",
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 7: THE HORSEMEN — Conflict as Connection
  // ============================================================
  {
    id: "module-7",
    title: "The Bridge",
    subtitle: "Conflict as Connection",
    description:
      "Most couples think a 'good relationship' means rarely fighting. The research says the opposite: healthy couples fight — they just fight differently.",
    icon: "lucide-bridge",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "m7-l1",
        title: "The 69% Reality",
        description:
          "Most of your fights will never be fully solved. That's not a failure — it's a fact of being two different humans.",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m7-l1-a0",
            type: "true_false",
            title: "Myth Check",
            instruction: "Answer honestly:",
            content: {
              statement:
                "In truly happy relationships, couples rarely argue about the same issue twice.",
              correct: false,
              explanation:
                "False. Gottman found that 69% of relationship conflicts are perpetual — rooted in fundamental differences. They never fully resolve. The goal is dialogue, not solution.",
            },
            saveToVault: false,
          },
          {
            id: "m7-l1-a1",
            type: "carousel",
            title: "Solvable vs. Perpetual",
            instruction: "Knowing which is which saves enormous energy.",
            content: {
              cards: [
                {
                  title: "Solvable Problems",
                  body: "Situational. Specific. Can be resolved with a plan. Examples: who does the dishes this week, what to watch tonight, scheduling date night.",
                  icon: "lucide-check",
                },
                {
                  title: "Perpetual Problems",
                  body: "Rooted in personality, values, or deep needs. Will always return. Examples: one needs order, one thrives in chaos; different needs for alone time; different approaches to money.",
                  icon: "lucide-repeat",
                },
                {
                  title: "The Trap",
                  body: "Treating perpetual problems as solvable leads to endless fights, resentment, and feeling like failures. Learn to recognise the difference.",
                  icon: "lucide-alert-circle",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m7-l1-a2",
            type: "open_response",
            title: "Your Perpetual Loop",
            instruction:
              "Name a conflict you and your partner have had more than five times. Is it solvable or perpetual? What's underneath it?",
            content: {
              prompt:
                "If it's perpetual, the goal shifts from 'solving it' to 'understanding it better' and 'managing it with humour and acceptance.'",
              placeholder:
                "Our recurring fight about... is probably... because underneath it, I think I need... and I think they need... If we stopped trying to solve it and started just trying to understand, we might...",
              minWords: 35,
            },
            tip: "Perpetual problems don't disappear. But couples who learn to talk about them without contempt become very close.",
            saveToVault: true,
          },
        ],
      },
      {
        id: "m7-l2",
        title: "The Dream Under the Fight",
        description:
          "Under every perpetual problem is a hidden dream — a value, a need, a piece of identity. Find the dream and the fight changes.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "m7-l2-a0",
            type: "carousel",
            title: "Surface vs. Deep",
            instruction: "See how the same fight can have different roots.",
            content: {
              cards: [
                {
                  title: "Mess vs. Neat",
                  body: "Surface: 'Put your clothes away.' Deep: One partner dreams of peace and order (safety). The other dreams of freedom and living fully (autonomy). Neither is wrong.",
                  icon: "lucide-box",
                },
                {
                  title: "Spending vs. Saving",
                  body: "Surface: 'You spent too much.' Deep: One needs security (money in the bank = safety). The other needs aliveness (spending = freedom, generosity).",
                  icon: "lucide-wallet",
                },
                {
                  title: "Time Together vs. Apart",
                  body: "Surface: 'You're always working.' Deep: One needs connection (togetherness = love). The other needs autonomy (space = self).",
                  icon: "lucide-calendar",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m7-l2-a1",
            type: "open_response",
            title: "What's Your Dream?",
            instruction:
              "Pick one perpetual problem. What's the hidden dream underneath your position? What are you afraid will happen if you don't get what you want?",
            content: {
              prompt:
                "Don't try to solve it here. Just find the dream. That's enough for now.",
              placeholder:
                "The perpetual problem is... On the surface I want... But underneath, the dream is... If I don't get this, I'm afraid that...",
              minWords: 35,
            },
            saveToVault: true,
          },
          {
            id: "m7-l2-a2",
            type: "conversation_challenge",
            title: "Dream Interview",
            instruction:
              "Ask your partner: 'What's the dream underneath your position on this issue? What are you afraid would happen if you didn't get it?' Then listen. Don't argue, don't fix, don't solve. Just understand.",
            content: {
              prompt:
                "What did you learn about your partner's dream? Did anything surprise you?",
              maxSeconds: 120,
            },
            tip: "You don't have to agree with their dream. You just have to know it. That alone transforms the conversation.",
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 8: THE HORIZON — Shared Meaning & Rituals
  // ============================================================
  {
    id: "module-8",
    title: "The Horizon",
    subtitle: "Shared Meaning & Rituals",
    description:
      "The strongest relationships aren't just compatible — they build a shared culture: rituals, stories, values, and a sense of 'this is what we're for.'",
    icon: "lucide-sun",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "m8-l1",
        title: "Your Couple Culture",
        description:
          "Every couple has a culture — whether you built it intentionally or not. What are the rituals and stories that make you 'us'?",
        estimatedMinutes: 20,
        activities: [
          {
            id: "m8-l1-a0",
            type: "reaction_slider",
            title: "Check In",
            instruction: "Before we explore shared meaning:",
            content: {
              question:
                "Do you feel like you and your partner are building something together — or just managing logistics?",
              options: [
                { emoji: "📋", label: "Just managing logistics" },
                { emoji: "🔄", label: "Somewhere in between" },
                { emoji: "🏗️", label: "We're building something meaningful" },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m8-l1-a1",
            type: "carousel",
            title: "The Architecture of Shared Meaning",
            instruction: "These are the pillars of a lasting relationship.",
            content: {
              cards: [
                {
                  title: "Rituals of Connection",
                  body: "The small, predictable moments that say 'we are a priority' — morning coffee together, a weekly date, a goodbye kiss, a bedtime check-in.",
                  icon: "lucide-calendar-heart",
                },
                {
                  title: "Shared Stories",
                  body: "How you met. How you got through that hard year. Your inside jokes. The mythology of 'us.' Couples who tell their story warmly stay together.",
                  icon: "lucide-book-open",
                },
                {
                  title: "Shared Values",
                  body: "What matters to both of you? Family? Adventure? Security? Growth? When values are explicit, decisions become easier.",
                  icon: "lucide-diamond",
                },
                {
                  title: "Shared Dreams",
                  body: "What are you building toward? A home? A business? A certain kind of life? Having a shared destination makes daily sacrifices feel meaningful.",
                  icon: "lucide-target",
                },
              ],
            },
            saveToVault: false,
          },
          {
            id: "m8-l1-a2",
            type: "open_response",
            title: "Your Existing Rituals",
            instruction:
              "What rituals of connection do you already have — even small ones? Name them. Why do they matter?",
            content: {
              prompt:
                "Then ask: what's one new ritual you could add this month? Something small. Something consistent.",
              placeholder:
                "Our existing rituals include... They matter because... A new ritual we could try is...",
              minWords: 30,
            },
            tip: "The most powerful rituals are often the smallest: 2 minutes of focused attention before sleep. A Sunday morning walk.",
            saveToVault: true,
          },
        ],
      },
      {
        id: "m8-l2",
        title: "Building the Future Together",
        description:
          "You don't need to agree on everything. But you do need a shared sense of where you're going.",
        estimatedMinutes: 25,
        activities: [
          {
            id: "m8-l2-a0",
            type: "open_response",
            title: "Our Shared Future Narrative",
            instruction:
              "Together, write a short paragraph about your life five years from now. What does your relationship feel like? What are you doing? What have you built?",
            content: {
              prompt:
                "Don't overthink. Just dream. The exercise itself builds connection.",
              placeholder:
                "In five years, we are... Our relationship feels... We've achieved... The word that describes our life together is...",
              minWords: 60,
            },
            tip: "If you can't write this together yet, write your own version. Then share it.",
            saveToVault: true,
          },
          {
            id: "m8-l2-a1",
            type: "conversation_challenge",
            title: "The 10 Most Important Things",
            instruction:
              "Each of you write down your 5-10 most important life values (e.g., family, adventure, security, creativity, service, growth). Then compare. Where do you align? Where do you differ?",
            content: {
              prompt:
                "Differences aren't problems — they're information. Talk about how you can honour both sets of values, even if they look different.",
              maxSeconds: 180,
            },
            tip: "The goal isn't identical values. It's understanding why each value matters to the other person.",
            saveToVault: true,
          },
          {
            id: "m8-l2-a2",
            type: "token_appreciation",
            title: "Week 8 Practice: The Daily Turn",
            instruction:
              "This week, every day, make one small gesture that says 'I see you' — a text, a touch, a question, a thank you. Track it here.",
            content: {
              startingTokens: 7,
              promptWhat: "What did you do?",
              promptWhy: "How did your partner respond?",
              storageKey: "signal-couples-final-week",
            },
            tip: "This course is over. Your practice is just beginning. Small things, done often.",
            saveToVault: true,
          },
        ],
      },
    ],
  },
];