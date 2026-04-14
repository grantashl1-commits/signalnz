// Auto-generated Signal Couples Connect Course
// 10 modules, 30 lessons, 92 activities from 19 relationship science books

export interface CourseActivity {
  id: string; type: string; title: string; instruction?: string;
  content: any; tip?: string; saveToVault?: boolean;
}

export interface CourseLesson {
  id: string; title: string; description: string;
  estimatedMinutes?: number; activities: CourseActivity[];
}

export interface CourseModule {
  id: string; title: string; subtitle: string; description: string;
  icon: string; estimatedMinutes: number; sources: string[];
  lessons: CourseLesson[];
}

export const CONNECT_COURSE: CourseModule[] = [
  {
    "id": "module-1",
    "title": "Module 1: Attachment & Connection Foundations",
    "subtitle": "Understanding your relational blueprint and building secure bonds.",
    "description": "Explore the roots of your relational patterns and discover how to cultivate a secure and deeply connected partnership. This module sets the stage for a resilient and thriving relationship.",
    "icon": "lucide-heart",
    "estimatedMinutes": 60,
    "sources": [
      "Attached",
      "Love Sense",
      "The Relationship Cure",
      "Receiving Love Workbook"
    ],
    "lessons": [
      {
        "id": "module-1-lesson-1",
        "title": "Unpacking Your Attachment Style",
        "description": "Identify your primary attachment style and its impact on your relationships.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m1-l1-a1",
            "type": "carousel",
            "title": "Decoding Attachment Styles",
            "instruction": "Swipe through the cards to learn about the main attachment styles.",
            "content": {
              "cards": [
                {
                  "title": "Secure Attachment",
                  "body": "Comfortable with intimacy and independence. Trusts partner and feels safe.",
                  "icon": "lucide-hands-clapping"
                },
                {
                  "title": "Anxious Attachment",
                  "body": "Craves intimacy, often worries about partner's love or commitment. Can be 'clingy'.",
                  "icon": "lucide-bell"
                },
                {
                  "title": "Avoidant Attachment",
                  "body": "Values independence, often uncomfortable with too much closeness. Can seem distant.",
                  "icon": "lucide-footprints"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m1-l1-a2",
            "type": "single_choice",
            "title": "My Relational Blueprint",
            "instruction": "Which attachment style resonates most with you in your most intimate relationships?",
            "content": {
              "question": "Which of these best describes your general approach to intimacy and relationships?",
              "options": [
                "I feel comfortable with intimacy and interdependence; I don't worry about being abandoned or getting too close.",
                "I want to be completely intimate with others, but I often find that others are reluctant to get as close as I would like. I often worry my partner doesn't love me.",
                "I am uncomfortable being close to others. I find it difficult to trust them completely, or to depend on them. I like my independence."
              ],
              "correctIndex": null,
              "explanation": "There are no 'right' or 'wrong' answers here, only deeper understanding. Most people have a blend, but one usually feels more dominant."
            },
            "tip": "Understanding your dominant style is the first step towards growth.",
            "saveToVault": false
          },
          {
            "id": "m1-l1-a3",
            "type": "open_response",
            "title": "Reflecting on My Attachment",
            "instruction": "In what ways do you see your identified attachment style play out in your current relationship? Provide specific examples.",
            "content": {
              "prompt": "How does your attachment style influence your behavior, thoughts, and feelings when you're with your partner, or when you're apart?",
              "placeholder": "For example, if I'm anxious, I might notice myself seeking reassurance frequently...",
              "minWords": 50
            },
            "tip": "Be honest and non-judgmental with yourself. This is about self-discovery.",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-1-lesson-2",
        "title": "The Dance of You and I",
        "description": "Discover how your attachment styles interact and impact your relationship dynamics.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m1-l2-a1",
            "type": "find_the_pair",
            "title": "Common Attachment Pairings",
            "instruction": "Match the attachment style on the left with a common dynamic it creates with another style on the right.",
            "content": {
              "pairs": [
                {
                  "left": "Secure",
                  "right": "Creates a stable, supportive base for any partner."
                },
                {
                  "left": "Anxious",
                  "right": "Often seeks reassurance and closeness, fearing abandonment."
                },
                {
                  "left": "Avoidant",
                  "right": "Tends to pull back when closeness increases, valuing independence."
                },
                {
                  "left": "Anxious-Avoidant",
                  "right": "A common 'pursuer-distancer' dynamic."
                }
              ]
            },
            "tip": "These dynamics are not set in stone; awareness allows for change.",
            "saveToVault": false
          },
          {
            "id": "m1-l2-a2",
            "type": "comparison",
            "title": "My Style & My Partner's Style",
            "instruction": "Think about your own attachment style and what you perceive to be your partner's. Compare how these styles might meet or clash.",
            "content": {
              "itemA": {
                "title": "My Attachment Style",
                "points": [
                  "How I typically react to stress in the relationship.",
                  "My needs for closeness and independence.",
                  "How I handle conflict."
                ]
              },
              "itemB": {
                "title": "Partner's Attachment Style (Perceived)",
                "points": [
                  "How I observe my partner reacting to stress.",
                  "My partner's needs for closeness and independence.",
                  "How my partner handles conflict (as I see it)."
                ]
              },
              "reflection": "How do these styles interact to create your unique relationship dynamic? Where do you find harmony, and where are the challenges?"
            },
            "saveToVault": true
          },
          {
            "id": "m1-l2-a3",
            "type": "video_upload",
            "title": "Message to My Partner: Understanding Us",
            "instruction": "Record a short video message for your partner sharing one insight you've gained today about how your attachment styles interact, and one way you hope to better support them given this new understanding.",
            "content": {
              "prompt": "Share a gentle observation and a hopeful intention.",
              "maxSeconds": 90
            },
            "tip": "Focus on 'I' statements and express curiosity, not blame.",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-1-lesson-3",
        "title": "Building a Secure Foundation",
        "description": "Learn practical steps to move towards greater security and connection in your relationship.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m1-l3-a1",
            "type": "sort",
            "title": "Steps to Secure Attachment",
            "instruction": "Put these actions in order of how you think they contribute to building a more secure bond.",
            "content": {
              "items": [
                "Recognize and soothe your own anxieties.",
                "Communicate your needs directly and kindly.",
                "Be responsive and available to your partner's bids for connection.",
                "Offer reassurance when your partner is distressed.",
                "Encourage partner's independence and growth."
              ],
              "correctOrder": [
                0,
                1,
                3,
                2,
                4
              ],
              "context": "There isn't one perfect order, but typically self-awareness comes first, then communication, then responsiveness."
            },
            "saveToVault": false
          },
          {
            "id": "m1-l3-a2",
            "type": "decision_point",
            "title": "Responding to Insecurity",
            "instruction": "Your partner mentions they feel a bit distant from you lately. How do you respond?",
            "content": {
              "scenario": "Your partner says, 'I've been feeling a little disconnected from you lately.'",
              "choices": [
                {
                  "label": "You: 'Oh, really? I've been so busy with work. I guess I haven't noticed. Let's talk about it later.'",
                  "outcome": "While acknowledging, this defers the conversation, which might leave your partner feeling dismissed or unheard.",
                  "isOptimal": false
                },
                {
                  "label": "You: 'Oh no, I'm so sorry! What did I do? Tell me everything. I need to fix this right away!'",
                  "outcome": "While well-intentioned, this response can stem from anxiety and put pressure on your partner to 'fix' your feelings, not just share theirs.",
                  "isOptimal": false
                },
                {
                  "label": "You: 'I'm sorry to hear that. I want to understand. Can you tell me a bit more about what you're feeling, and what you might need from me?'",
                  "outcome": "This shows empathy, validates their feelings, and invites open communication, fostering a secure connection.",
                  "isOptimal": true
                },
                {
                  "label": "You: 'I know, I've been feeling it too. It happens. We'll get over it.'",
                  "outcome": "This can minimize your partner's specific feelings and miss an opportunity for deeper connection.",
                  "isOptimal": false
                }
              ]
            },
            "tip": "A secure response acknowledges, validates, and shows a desire to understand.",
            "saveToVault": false
          },
          {
            "id": "m1-l3-a3",
            "type": "short_answer",
            "title": "One Step Forward",
            "instruction": "Identify one specific, small action you will take in the next 24 hours to reinforce a more secure connection with your partner, based on what you've learned.",
            "content": {
              "prompt": "What's one tangible thing you can do?",
              "placeholder": "e.g., 'I will initiate a 10-minute check-in conversation about our day tonight.'",
              "minWords": 10
            },
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-2",
    "title": "Module 2: Emotional Bids & Turning Toward",
    "subtitle": "Learning to see, hear, and respond to calls for connection.",
    "description": "Discover the hidden language of 'bids for connection' and master the art of 'turning toward' your partner. This module helps you create a rich emotional bank account with frequent, meaningful interactions.",
    "icon": "lucide-eye",
    "estimatedMinutes": 60,
    "sources": [
      "The Relationship Cure",
      "Eight Dates",
      "The Love Prescription"
    ],
    "lessons": [
      {
        "id": "module-2-lesson-1",
        "title": "What's a Bid for Connection?",
        "description": "Understand the different forms emotional bids can take and why they're crucial.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m2-l1-a1",
            "type": "fill_blanks",
            "title": "The Essence of a Bid",
            "instruction": "Fill in the blanks to complete the definition of an emotional bid.",
            "content": {
              "text": "An emotional bid for connection is any attempt from one partner to another for ___, attention, ___, or any other form of positive ___. It's an invitation to ___, often subtle.",
              "blanks": [
                "affection",
                "support",
                "response",
                "engage"
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m2-l1-a2",
            "type": "multiple_choice",
            "title": "Spot the Bid!",
            "instruction": "Which of the following are examples of bids for connection? (Select all that apply)",
            "content": {
              "question": "Which of these are likely bids for connection?",
              "options": [
                "Your partner sighs heavily while looking at a pile of dishes.",
                "Your partner asks, 'Did you see that funny dog video online?'",
                "Your partner says, 'My boss was really tough on me today.'",
                "Your partner walks into the room and gently touches your arm.",
                "Your partner silently flips through their phone while you're talking."
              ],
              "correctIndex": [
                0,
                1,
                2,
                3
              ],
              "explanation": "Even a sigh can be a bid for acknowledgment or help. The silent phone interaction is likely a 'turning away'."
            },
            "saveToVault": false
          },
          {
            "id": "m2-l1-a3",
            "type": "open_response",
            "title": "My Partner's Secret Language",
            "instruction": "Reflect on your partner's subtle (or not-so-subtle) ways of bidding for your attention or connection. Describe 2-3 specific examples you've noticed this week.",
            "content": {
              "prompt": "What are some of their unique 'bids'? How do they signal a desire for connection?",
              "placeholder": "My partner often hums or clears their throat when they want to tell me something, waiting for me to ask, 'What's up?'",
              "minWords": 40
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-2-lesson-2",
        "title": "The Three Responses: Turn Toward, Turn Away, Turn Against",
        "description": "Understand the profound impact your response to bids has on your relationship's health.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m2-l2-a1",
            "type": "true_false",
            "title": "Bid Response Basics",
            "instruction": "Determine if the following statements about responding to bids are true or false.",
            "content": {
              "statement": "Ignoring a bid is always 'turning away,' even if unintentional.",
              "correct": true,
              "explanation": "While intent matters for blame, the *impact* on the bid-maker is that their bid was not met, which registers as 'turning away'."
            },
            "saveToVault": false
          },
          {
            "id": "m2-l2-a2",
            "type": "decision_point",
            "title": "Responding in the Moment",
            "instruction": "Your partner comes home looking visibly stressed and says, 'Ugh, another terrible day at work.' How do you respond?",
            "content": {
              "scenario": "Your partner comes home, drops their bag, and says with a sigh, 'Ugh, another terrible day at work.'",
              "choices": [
                {
                  "label": "You: 'Oh, honey, I'm sorry to hear that. What happened?'",
                  "outcome": "This is 'turning toward' \u2013 you're acknowledging their distress and inviting them to share, showing you care.",
                  "isOptimal": true
                },
                {
                  "label": "You: 'Yeah, mine was awful too. You wouldn't believe what X did.'",
                  "outcome": "This is 'turning away' (or 'turning into self-focus') \u2013 you're redirecting the conversation to yourself, missing their bid for support.",
                  "isOptimal": false
                },
                {
                  "label": "You: 'What did you expect? You always complain about your job.'",
                  "outcome": "This is 'turning against' \u2013 you're responding with criticism or defensiveness, escalating negativity.",
                  "isOptimal": false
                },
                {
                  "label": "You nod vaguely from the couch, continuing to scroll on your phone.",
                  "outcome": "This is 'turning away' \u2013 you're ignoring their bid, making them feel unheard or unimportant.",
                  "isOptimal": false
                }
              ]
            },
            "tip": "Even brief, attentive responses count as turning toward.",
            "saveToVault": false
          },
          {
            "id": "m2-l2-a3",
            "type": "image_upload",
            "title": "A Visual Bid",
            "instruction": "Take a photo that represents a 'bid for connection' you recently made to your partner, or one your partner recently made to you. Add a caption explaining the context.",
            "content": {
              "prompt": "Capture a moment of connection or an attempt at one.",
              "exampleDescription": "A photo of my partner's favorite snack on the counter - a small 'I'm thinking of you' bid."
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-2-lesson-3",
        "title": "Building Your Emotional Bank Account",
        "description": "Practice consistent 'turning toward' to build trust, intimacy, and a resilient relationship.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m2-l3-a1",
            "type": "sort",
            "title": "Putting Bids into Practice",
            "instruction": "Arrange these steps to effectively respond to a bid from your partner.",
            "content": {
              "items": [
                "Acknowledge the bid verbally or non-verbally.",
                "Stop what you're doing (if possible) and give your attention.",
                "Ask clarifying questions if needed.",
                "Validate their feeling or intention.",
                "Offer support or engage in the topic."
              ],
              "correctOrder": [
                1,
                0,
                2,
                3,
                4
              ],
              "context": "Giving attention first is key to showing you're truly 'turning toward'."
            },
            "saveToVault": false
          },
          {
            "id": "m2-l3-a2",
            "type": "survey",
            "title": "Our Bid Responsiveness Scale",
            "instruction": "Rate your and your partner's general responsiveness to each other's bids for connection over the past week.",
            "content": {
              "question": "On a scale of 1-10, how frequently do you feel you and your partner 'turn toward' each other's bids?",
              "scale": {
                "min": 1,
                "max": 10,
                "minLabel": "Rarely / Often miss them",
                "maxLabel": "Almost always / Consistently present"
              }
            },
            "saveToVault": false
          },
          {
            "id": "m2-l3-a3",
            "type": "video_upload",
            "title": "Turning Toward: A Pledge",
            "instruction": "Record a short video to your partner (or to yourself, if solo) outlining one specific way you plan to 'turn toward' bids more intentionally this week.",
            "content": {
              "prompt": "Share a concrete plan, such as 'I will put my phone down and make eye contact every time you speak to me about your day.'",
              "maxSeconds": 60
            },
            "tip": "Specificity helps with follow-through!",
            "saveToVault": true
          },
          {
            "id": "m2-l3-a4",
            "type": "open_response",
            "title": "Our Daily Connection Goal",
            "instruction": "Discuss with your partner (or reflect individually) what a realistic daily goal for 'turning toward' bids could be for your relationship. How will you track it?",
            "content": {
              "prompt": "For example, 'We aim for at least 5 positive responses to bids during the evening hours.'",
              "placeholder": "Our goal is to...",
              "minWords": 30
            },
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-3",
    "title": "Module 3: Communication Without Fighting",
    "subtitle": "Mastering dialogue, active listening, and gentle starts.",
    "description": "Learn techniques to express yourselves clearly and listen deeply, transforming disagreements into opportunities for understanding instead of escalating into conflict. Focus on gentle communication.",
    "icon": "lucide-message-circle",
    "estimatedMinutes": 60,
    "sources": [
      "Communication in Marriage",
      "The Relationship Cure",
      "Fight Right",
      "10 Lessons to Transform Your Marriage"
    ],
    "lessons": [
      {
        "id": "module-3-lesson-1",
        "title": "The Art of Active Listening",
        "description": "Move beyond just hearing words to truly understanding your partner's message and emotion.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m3-l1-a1",
            "type": "fill_blanks",
            "title": "Active Listening Core Skills",
            "instruction": "Complete the sentence describing a key active listening technique.",
            "content": {
              "text": "Active listening involves not just hearing, but also ___ feelings, ___ what you heard in your own words, and asking open-ended ___ to encourage deeper sharing.",
              "blanks": [
                "validating",
                "reflecting",
                "questions"
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m3-l1-a2",
            "type": "true_false",
            "title": "Common Listening Mistakes",
            "instruction": "Identify if the following statement is true or false regarding active listening.",
            "content": {
              "statement": "Planning your rebuttal while your partner is speaking is a key part of active listening.",
              "correct": false,
              "explanation": "No, this is a common barrier to active listening. It prevents you from truly hearing and understanding your partner's perspective."
            },
            "saveToVault": false
          },
          {
            "id": "m3-l1-a3",
            "type": "open_response",
            "title": "Deep Listening Practice",
            "instruction": "Find a time for a 5-minute conversation with your partner. One person shares about their day or a feeling, the other practices active listening by _not_ offering solutions, but only reflecting, validating, and asking clarifying questions. Then swap roles. Reflect on the experience here.",
            "content": {
              "prompt": "What did it feel like to be truly heard? What did you notice about your partner's experience or perspective?",
              "placeholder": "I noticed that when I focused only on listening, my partner shared more deeply...",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-3-lesson-2",
        "title": "The Gentle Start-Up",
        "description": "Learn to initiate difficult conversations in a way that invites cooperation, not defensiveness.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m3-l2-a1",
            "type": "sort",
            "title": "Crafting a Gentle Start-Up",
            "instruction": "Arrange these components into the most effective order for a 'gentle start-up'.",
            "content": {
              "items": [
                "State your positive need.",
                "Start with 'I' instead of 'You'.",
                "Describe your feeling about a specific situation.",
                "Express appreciation or validate their perspective (if appropriate)."
              ],
              "correctOrder": [
                1,
                2,
                3,
                0
              ],
              "context": "Starting with an 'I' statement and feeling, then softening with appreciation, followed by a positive need, sets the stage well."
            },
            "saveToVault": false
          },
          {
            "id": "m3-l2-a2",
            "type": "single_choice",
            "title": "Good Start vs. Bad Start",
            "instruction": "Which of the following is an example of a 'gentle start-up'?",
            "content": {
              "question": "You need to talk to your partner about feeling overwhelmed by household chores. Which is a gentle start-up?",
              "options": [
                "You never help out around here! I'm doing everything!",
                "I'm so exhausted when I get home. I feel overwhelmed with all the chores, and I was hoping we could talk about how to share the load more evenly.",
                "Can you explain why you always leave your mess everywhere?",
                "We need to talk. You're not pulling your weight with chores."
              ],
              "correctIndex": 1,
              "explanation": "The second option uses 'I' statements, expresses a feeling, and states a positive need without blame."
            },
            "saveToVault": false
          },
          {
            "id": "m3-l2-a3",
            "type": "short_answer",
            "title": "My Gentle Conversation Starter",
            "instruction": "Think of one topic you've been wanting to discuss with your partner. Practice crafting a 'gentle start-up' for that conversation.",
            "content": {
              "prompt": "Write out your gentle start-up phrase.",
              "placeholder": "e.g., 'Honey, I've been feeling a bit disconnected lately, and I value our time together. I'd love to find a few minutes to just chat and reconnect this evening.'",
              "minWords": 20
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-3-lesson-3",
        "title": "The Speaker-Listener Technique",
        "description": "Learn a structured communication tool to ensure both partners feel heard and understood.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m3-l3-a1",
            "type": "carousel",
            "title": "Rules of the Speaker-Listener",
            "instruction": "Swipe through these cards to remember the key rules for both the Speaker and the Listener roles.",
            "content": {
              "cards": [
                {
                  "title": "Rule for Speaker",
                  "body": "Speak for yourself, use 'I' statements, keep statements brief, stop and let the Listener paraphrase.",
                  "icon": "lucide-mic"
                },
                {
                  "title": "Rule for Listener",
                  "body": "Paraphrase what you hear without judging or rebutting, focus on truly understanding their message.",
                  "icon": "lucide-headphones"
                },
                {
                  "title": "Rule for Both",
                  "body": "The goal is understanding, not agreement. Don't problem-solve during this exchange.",
                  "icon": "lucide-users"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m3-l3-a2",
            "type": "decision_point",
            "title": "Speaker-Listener in Action",
            "instruction": "You are the Listener. Your partner says: 'I'm tired of feeling like I have to guess what you want for dinner every night. It makes me feel unappreciated.' How do you respond using the Listener rules?",
            "content": {
              "scenario": "Your partner (Speaker) says: 'I'm tired of feeling like I have to guess what you want for dinner every night. It makes me feel unappreciated.'",
              "choices": [
                {
                  "label": "You: 'Oh, so you're feeling frustrated and unappreciated when you have to figure out dinner, and you'd like me to be clearer about my preferences?'",
                  "outcome": "Excellent! You've paraphrased their core message and feelings clearly, demonstrating understanding.",
                  "isOptimal": true
                },
                {
                  "label": "You: 'Well, you never ask me! It's not my fault.'",
                  "outcome": "This is 'turning against' and violates the Listener rule of not rebutting. It will escalate conflict.",
                  "isOptimal": false
                },
                {
                  "label": "You: 'Okay, I get it. I'll just pick dinner every night then.'",
                  "outcome": "This is jumping to problem-solving, which isn't the goal of the Listener role. It also might not be what your partner wants.",
                  "isOptimal": false
                },
                {
                  "label": "You: 'Don't be so dramatic. It's just dinner.'",
                  "outcome": "This invalidates their feelings and is 'turning against', definitely not a good Listener response.",
                  "isOptimal": false
                }
              ]
            },
            "tip": "The Listener's job is to reflect, not to agree or solve.",
            "saveToVault": false
          },
          {
            "id": "m3-l3-a3",
            "type": "conversation_challenge",
            "title": "Our Speaker-Listener Session",
            "instruction": "With your partner, choose a low-stakes issue (e.g., 'What show should we watch tonight?', 'How should we organize the pantry?'). Practice the Speaker-Listener technique for 10 minutes. Record a voice note or type a summary of your experience.",
            "content": {
              "prompt": "What was challenging? What felt effective? Did it help you understand each other better?",
              "maxSeconds": 180
            },
            "tip": "Start with easy topics to build confidence before tackling harder ones.",
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-4",
    "title": "Module 4: The Four Horsemen & Antidotes",
    "subtitle": "Identifying destructive patterns and building healthy alternatives.",
    "description": "Learn to recognize the four communication patterns that predict divorce (criticism, contempt, defensiveness, stonewalling) and discover powerful antidotes to transform your interactions.",
    "icon": "lucide-swords",
    "estimatedMinutes": 60,
    "sources": [
      "The Seven Principles for Making Marriage Work",
      "Fight Right",
      "The New Marriage Clinic"
    ],
    "lessons": [
      {
        "id": "module-4-lesson-1",
        "title": "Meet the Four Horsemen",
        "description": "Understand the definitions and impact of criticism, contempt, defensiveness, and stonewalling.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m4-l1-a1",
            "type": "fill_blanks",
            "title": "Identifying the Horsemen",
            "instruction": "Fill in the blank with the correct 'Horseman'.",
            "content": {
              "text": "Attacking your partner's character is ___. Seeing yourself as the victim and making excuses is ___. Withdrawing emotionally or physically from interaction is ___. And the worst predictor of divorce, expressing disgust or superiority, is ___.",
              "blanks": [
                "criticism",
                "defensiveness",
                "stonewalling",
                "contempt"
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m4-l1-a2",
            "type": "multiple_choice",
            "title": "Which Horseman is This?",
            "instruction": "Identify the Horseman being displayed in each scenario. (Select all that apply for each)",
            "content": {
              "question": "Which Horseman(en) describes this scenario? Your partner rolls their eyes and sighs loudly when you express a concern.",
              "options": [
                "Criticism",
                "Contempt",
                "Defensiveness",
                "Stonewalling"
              ],
              "correctIndex": [
                1
              ],
              "explanation": "Eye-rolling and sighing are classic non-verbal signs of contempt \u2013 a feeling of superiority or disgust."
            },
            "saveToVault": false
          },
          {
            "id": "m4-l1-a3",
            "type": "open_response",
            "title": "Horsemen in Our Relationship",
            "instruction": "Reflect on a recent disagreement. Did any of the Four Horsemen show up? Describe the interaction and which Horseman you noticed (in yourself or your partner).",
            "content": {
              "prompt": "Be specific about the words or actions you observed.",
              "placeholder": "I noticed myself getting defensive when my partner brought up the budget, immediately listing reasons why I wasn't at fault.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-4-lesson-2",
        "title": "Antidote to Criticism & Contempt",
        "description": "Learn to replace blame with gentle start-ups and appreciation.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m4-l2-a1",
            "type": "carousel",
            "title": "Antidotes at a Glance",
            "instruction": "Swipe through to review the antidotes for Criticism and Contempt.",
            "content": {
              "cards": [
                {
                  "title": "Antidote to Criticism",
                  "body": "Use a Gentle Start-Up: 'I feel [emotion] about [specific situation] and I need [positive need].'",
                  "icon": "lucide-flower"
                },
                {
                  "title": "Antidote to Contempt",
                  "body": "Build a Culture of Appreciation and Respect. Look for what your partner is doing right and express it often.",
                  "icon": "lucide-award"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m4-l2-a2",
            "type": "short_answer",
            "title": "Transforming Criticism",
            "instruction": "Rewrite the following critical statement into a 'gentle start-up': 'You always leave your dirty clothes on the floor! You're so inconsiderate!'",
            "content": {
              "prompt": "Focus on 'I' statements, your feelings, and a positive need.",
              "placeholder": "I feel frustrated when I see clothes on the floor because I like our space tidy. Would you be willing to put them in the hamper?",
              "minWords": 25
            },
            "saveToVault": true
          },
          {
            "id": "m4-l2-a3",
            "type": "image_upload",
            "title": "Appreciation Snapshot",
            "instruction": "Take a photo of something your partner did recently that you appreciate (even a small gesture). Upload it with a caption explaining why you're grateful.",
            "content": {
              "prompt": "Capture a moment or effort you want to acknowledge.",
              "exampleDescription": "A photo of my partner's neatly made side of the bed, showing their effort to keep things tidy."
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-4-lesson-3",
        "title": "Antidote to Defensiveness & Stonewalling",
        "description": "Learn to take responsibility and self-soothe to stay engaged.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m4-l3-a1",
            "type": "true_false",
            "title": "Understanding Antidotes",
            "instruction": "Is the following statement true or false?",
            "content": {
              "statement": "The antidote to defensiveness is taking responsibility for at least some part of the problem.",
              "correct": true,
              "explanation": "Yes, even if you don't agree with everything, finding common ground or your own contribution can de-escalate."
            },
            "saveToVault": false
          },
          {
            "id": "m4-l3-a2",
            "type": "decision_point",
            "title": "Responding to Defensiveness",
            "instruction": "Your partner says, 'I'm upset you didn't call to say you'd be late.' You're tempted to say, 'I was busy at work! It's not my fault!' What's a better response?",
            "content": {
              "scenario": "Your partner: 'I'm upset you didn't call to say you'd be late.' You're busy and stressed. You want to say, 'I was busy at work! It's not my fault!'",
              "choices": [
                {
                  "label": "You: 'You're right, I should have called. I got caught up, but that's no excuse. I'm sorry.'",
                  "outcome": "Excellent! You're taking responsibility, which is the antidote to defensiveness. This helps lower tension.",
                  "isOptimal": true
                },
                {
                  "label": "You: 'My day was just as bad, if not worse, than yours. Can we just drop it?'",
                  "outcome": "This is still defensive and dismissive, turning away from their bid for connection and understanding.",
                  "isOptimal": false
                },
                {
                  "label": "You: (Silence, avoiding eye contact) 'Okay.'",
                  "outcome": "This is stonewalling, which will make your partner feel ignored and unvalued, escalating frustration.",
                  "isOptimal": false
                }
              ]
            },
            "tip": "Taking responsibility doesn't mean taking on all the blame, just your piece.",
            "saveToVault": false
          },
          {
            "id": "m4-l3-a3",
            "type": "open_response",
            "title": "My De-escalation Strategy",
            "instruction": "If you tend to stonewall or get overly defensive, what's one specific self-soothing or de-escalation technique you can commit to practicing during conflict?",
            "content": {
              "prompt": "Examples: 'I will take a 20-minute break if I feel overwhelmed,' or 'I will breathe deeply and consciously try to hear my partner before responding.'",
              "placeholder": "My strategy will be to...",
              "minWords": 30
            },
            "saveToVault": true
          },
          {
            "id": "m4-l3-a4",
            "type": "video_upload",
            "title": "A Pledge for Connection",
            "instruction": "Individually, record a short video to your partner affirming your commitment to recognize and address the Four Horsemen in your interactions, and to practice their antidotes. Share one specific antidote you will focus on this week.",
            "content": {
              "prompt": "Focus on positive intent and mutual growth.",
              "maxSeconds": 90
            },
            "tip": "This isn't about perfection, but about consistent effort.",
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-5",
    "title": "Module 5: Conflict as Connection",
    "subtitle": "Transforming disagreements into opportunities for growth and intimacy.",
    "description": "Shift your perspective on conflict from something to avoid to a powerful pathway for deeper understanding and connection. Learn how to navigate disagreements constructively.",
    "icon": "lucide-sparkles",
    "estimatedMinutes": 60,
    "sources": [
      "Fight Right",
      "The New Marriage Clinic",
      "10 Lessons to Transform Your Marriage",
      "Us"
    ],
    "lessons": [
      {
        "id": "module-5-lesson-1",
        "title": "The Purpose of Conflict",
        "description": "Understand why conflict is normal, even healthy, and its potential benefits for relationships.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m5-l1-a1",
            "type": "true_false",
            "title": "Conflict Myths",
            "instruction": "Is the following statement about healthy relationships true or false?",
            "content": {
              "statement": "Truly loving couples never fight.",
              "correct": false,
              "explanation": "False! All couples experience conflict. The difference lies in *how* they fight and repair, not *if* they fight."
            },
            "saveToVault": false
          },
          {
            "id": "m5-l1-a2",
            "type": "carousel",
            "title": "Benefits of Healthy Conflict",
            "instruction": "Swipe through to see how constructively handled conflict can actually strengthen your bond.",
            "content": {
              "cards": [
                {
                  "title": "Increased Understanding",
                  "body": "Conflict can reveal hidden needs, dreams, and perspectives, deepening empathy.",
                  "icon": "lucide-lightbulb"
                },
                {
                  "title": "Stronger Trust",
                  "body": "Successfully navigating conflict builds confidence in your partner's commitment and ability to repair.",
                  "icon": "lucide-handshake"
                },
                {
                  "title": "Promotes Growth",
                  "body": "Addressing issues helps individuals and the relationship evolve, preventing stagnation.",
                  "icon": "lucide-leaf"
                },
                {
                  "title": "Ventilation & Release",
                  "body": "Constructive conflict allows for healthy expression of frustrations, preventing resentment buildup.",
                  "icon": "lucide-wind"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m5-l1-a3",
            "type": "open_response",
            "title": "My Conflict Mindset",
            "instruction": "How do you typically view conflict in your relationship? Do you see it as a threat, an opportunity, or something else? How might changing this perception impact your interactions?",
            "content": {
              "prompt": "Share your current mindset and an ideal future mindset.",
              "placeholder": "I usually dread conflict and try to avoid it, seeing it as dangerous. I want to start seeing it as a chance to understand my partner better...",
              "minWords": 40
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-5-lesson-2",
        "title": "The Power of Compromise & Humor",
        "description": "Discover tools to de-escalate tension and find common ground during disagreements.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m5-l2-a1",
            "type": "sort",
            "title": "Elements of Effective Compromise",
            "instruction": "Order these steps for reaching a fair and satisfying compromise.",
            "content": {
              "items": [
                "Brainstorm solutions together.",
                "Identify each person's core needs and non-negotiables.",
                "Listen to fully understand each other's perspectives.",
                "Agree on a solution that meets most needs and respects boundaries.",
                "Revisit the compromise later if it's not working."
              ],
              "correctOrder": [
                2,
                1,
                0,
                3,
                4
              ],
              "context": "Understanding before solving is key for compromise."
            },
            "saveToVault": false
          },
          {
            "id": "m5-l2-a2",
            "type": "decision_point",
            "title": "Humor as a De-escalator",
            "instruction": "During a heated discussion about finances, you notice both of you are getting tense. What's a healthy use of humor here?",
            "content": {
              "scenario": "You and your partner are discussing money. The tension is rising, voices are getting louder, and you both look stressed.",
              "choices": [
                {
                  "label": "You: 'Honestly, this is so stressful, I feel like we should just buy a lottery ticket and hope for the best!' (with a genuine smile)",
                  "outcome": "Optimal. This lightens the mood, acknowledges the stress without dismissing the issue, and can provide a brief, healthy break.",
                  "isOptimal": true
                },
                {
                  "label": "You: (Sarcastic tone) 'Oh, I'm sure your plan to live off ramen noodles will be just perfectly fine.'",
                  "outcome": "This is contempt. Sarcasm in conflict is often hurtful and escalates tension, rather than de-escalating.",
                  "isOptimal": false
                },
                {
                  "label": "You: (Trying to be funny but it lands flat) 'Are we fighting or are we just aggressively planning our retirement?'",
                  "outcome": "While the intention might be good, if it doesn't land well, it can still be perceived as dismissive or inappropriate, especially if your partner isn't ready.",
                  "isOptimal": false
                }
              ]
            },
            "tip": "Humor should be used with warmth and in a way that doesn't minimize feelings.",
            "saveToVault": false
          },
          {
            "id": "m5-l2-a3",
            "type": "short_answer",
            "title": "Our Compromise Area",
            "instruction": "Identify one area in your relationship where you frequently have disagreements. How could you apply the principles of compromise to find a win-win solution?",
            "content": {
              "prompt": "What's the issue, and what's one possible compromise approach?",
              "placeholder": "Issue: Dividing household chores. Compromise: Each of us picks 2-3 chores that we genuinely don't mind doing, then we split the rest.",
              "minWords": 30
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-5-lesson-3",
        "title": "Physiological Self-Soothing and Time-Outs",
        "description": "Learn to manage physiological flooding during conflict to prevent destructive patterns.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m5-l3-a1",
            "type": "true_false",
            "title": "Flooding Facts",
            "instruction": "Is the following statement true or false?",
            "content": {
              "statement": "When your heart rate goes over 100 bpm during conflict, it's harder to think rationally and calmly.",
              "correct": true,
              "explanation": "This is known as 'physiological flooding.' When flooded, our bodies go into fight-or-flight, making it difficult to process information or respond constructively."
            },
            "saveToVault": false
          },
          {
            "id": "m5-l3-a2",
            "type": "carousel",
            "title": "Signs of Flooding",
            "instruction": "Swipe through physical and emotional signs that you or your partner might be 'flooded' during an argument.",
            "content": {
              "cards": [
                {
                  "title": "Physical Signs",
                  "body": "Increased heart rate, rapid breathing, muscle tension, sweating, feeling light-headed.",
                  "icon": "lucide-thermometer"
                },
                {
                  "title": "Emotional Signs",
                  "body": "Feeling overwhelmed, intense anger, feeling numb, inability to think clearly, tunnel vision.",
                  "icon": "lucide-cloud-rain"
                },
                {
                  "title": "Behavioral Signs",
                  "body": "Desire to flee, aggression, stonewalling, inability to listen.",
                  "icon": "lucide-zap"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m5-l3-a3",
            "type": "short_answer",
            "title": "Our Time-Out Plan",
            "instruction": "Discuss with your partner a clear, mutually agreed-upon plan for taking a 'time-out' during conflict. What's your signal? How long will it be? What will you do during it? When will you reconnect?",
            "content": {
              "prompt": "Outline your agreed-upon time-out strategy.",
              "placeholder": "Our signal is 'I need a break.' We'll take 20 minutes to do separate calming activities and reconvene to talk when we are both ready.",
              "minWords": 40
            },
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-6",
    "title": "Module 6: Trust & Commitment",
    "subtitle": "Building unshakeable reliability and shared future-making.",
    "description": "Explore the layers of trust and commitment, from basic reliability to deep dedication. Learn how to foster these foundational elements that allow your relationship to thrive.",
    "icon": "lucide-key-round",
    "estimatedMinutes": 60,
    "sources": [
      "The State of Affairs",
      "The Relationship Cure",
      "Couples Therapy Workbook for Healing"
    ],
    "lessons": [
      {
        "id": "module-6-lesson-1",
        "title": "The Anatomy of Trust",
        "description": "Deconstruct what trust means in a relationship and how it's built and eroded.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m6-l1-a1",
            "type": "true_false",
            "title": "Trust Fundamentals",
            "instruction": "Is the following statement true or false?",
            "content": {
              "statement": "Trust is primarily about whether your partner tells the truth, and little else.",
              "correct": false,
              "explanation": "False! While honesty is crucial, trust also encompasses reliability, fidelity, emotional safety, shared loyalty, and benevolence."
            },
            "saveToVault": false
          },
          {
            "id": "m6-l1-a2",
            "type": "sort",
            "title": "Building Blocks of Trust",
            "instruction": "Order these elements by how foundational you believe they are to building trust, from most to least foundational.",
            "content": {
              "items": [
                "Following through on promises.",
                "Being emotionally vulnerable with each other.",
                "Consistently showing up during difficult times.",
                "Sharing your deepest dreams and fears.",
                "Protecting each other's reputation in public."
              ],
              "correctOrder": [
                0,
                2,
                1,
                4,
                3
              ],
              "context": "Reliability and showing up are often the first pillars, leading to deeper emotional trust."
            },
            "saveToVault": false
          },
          {
            "id": "m6-l1-a3",
            "type": "open_response",
            "title": "Trust in Our Relationship",
            "instruction": "What aspect of trust (e.g., reliability, emotional safety, honesty, fidelity) feels strongest in your relationship, and which area could benefit from more focus?",
            "content": {
              "prompt": "Provide examples for both the strong area and the area for growth.",
              "placeholder": "Our reliability on daily tasks is strong, but sometimes I feel we could improve emotional safety, particularly when discussing sensitive topics.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-6-lesson-2",
        "title": "Commitment: More Than Just a Promise",
        "description": "Understand the two types of commitment and how to nurture a deep dedication to your relationship.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m6-l2-a1",
            "type": "comparison",
            "title": "Constraint vs. Dedication Commitment",
            "instruction": "Compare and contrast two types of commitment.",
            "content": {
              "itemA": {
                "title": "Constraint Commitment",
                "points": [
                  "Staying due to external factors (e.g., finances, kids, social pressure).",
                  "High costs of leaving the relationship.",
                  "Can foster resentment if not balanced by dedication."
                ]
              },
              "itemB": {
                "title": "Dedication Commitment",
                "points": [
                  "Staying due to attraction to the partner, relationship satisfaction, and shared vision.",
                  "Active desire to be in the relationship.",
                  "Fosters mutual growth and happiness."
                ]
              },
              "reflection": "Which type of commitment feels more dominant in your relationship, and in what ways does it manifest?"
            },
            "saveToVault": false
          },
          {
            "id": "m6-l2-a2",
            "type": "multiple_choice",
            "title": "Signs of Strong Dedication",
            "instruction": "Which of the following behaviors indicate strong dedication commitment? (Select all that apply)",
            "content": {
              "question": "Which of these are signs of strong dedication commitment?",
              "options": [
                "Prioritizing your partner's well-being.",
                "Regularly planning for your shared future.",
                "Speaking positively about your partner to others.",
                "Avoiding difficult conversations to maintain peace.",
                "Actively working through challenges when they arise."
              ],
              "correctIndex": [
                0,
                1,
                2,
                4
              ],
              "explanation": "Avoiding difficult conversations often signals a lack of dedication to growth, not strong commitment."
            },
            "saveToVault": false
          },
          {
            "id": "m6-l2-a3",
            "type": "short_answer",
            "title": "Our Collective Future",
            "instruction": "Describe one shared dream or goal you and your partner have for your future together. How does working towards this goal reinforce your commitment?",
            "content": {
              "prompt": "What future vision excites both of you?",
              "placeholder": "Our dream is to save enough to buy a small cabin in the mountains. Every time we discuss our savings or look at cabins online, it strengthens our bond and dedication to our shared life.",
              "minWords": 30
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-6-lesson-3",
        "title": "Nurturing Trust and Deepening Commitment",
        "description": "Practical strategies to continuously build and reaffirm trust and dedication in your relationship.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m6-l3-a1",
            "type": "sort",
            "title": "Practices for Trust & Commitment",
            "instruction": "Order these practices from most effective to least effective for building trust and commitment.",
            "content": {
              "items": [
                "Keeping promises, big and small.",
                "Sharing vulnerable thoughts and feelings.",
                "Making time for regular quality interactions.",
                "Defending your partner when they are not present.",
                "Being transparent about finances and communication with others."
              ],
              "correctOrder": [
                0,
                4,
                2,
                1,
                3
              ],
              "context": "Consistency and transparency are high impact. Protecting reputation and vulnerability, while important, often build on these first."
            },
            "saveToVault": false
          },
          {
            "id": "m6-l3-a2",
            "type": "video_upload",
            "title": "Commitment Affirmation",
            "instruction": "Record a short video message for your partner expressing one specific way they've earned your trust or reinforced your commitment to them, and one way you commit to reciprocating this week.",
            "content": {
              "prompt": "Share a heartfelt appreciation and a forward-looking promise.",
              "maxSeconds": 90
            },
            "tip": "Focus on genuine feelings and specific actions.",
            "saveToVault": true
          },
          {
            "id": "m6-l3-a3",
            "type": "survey",
            "title": "Our Trust & Commitment Check-in",
            "instruction": "Rate the current state of trust and commitment in your relationship.",
            "content": {
              "question": "On a scale of 1-10, how strong do you feel the overall trust and commitment are in your relationship today?",
              "scale": {
                "min": 1,
                "max": 10,
                "minLabel": "Very low / Shaky",
                "maxLabel": "Very high / Unshakeable"
              }
            },
            "saveToVault": false
          }
        ]
      }
    ]
  },
  {
    "id": "module-7",
    "title": "Module 7: Intimacy & Desire",
    "subtitle": "Rekindling passion, physical connection, and emotional closeness.",
    "description": "Explore the multifaceted aspects of intimacy and sexual desire. Learn to communicate your needs, overcome obstacles, and cultivate a vibrant, fulfilling physical and emotional connection.",
    "icon": "lucide-droplet",
    "estimatedMinutes": 60,
    "sources": [
      "Come As You Are",
      "Mating in Captivity",
      "Eight Dates",
      "Love Sense"
    ],
    "lessons": [
      {
        "id": "module-7-lesson-1",
        "title": "Redefining Intimacy",
        "description": "Beyond sex: explore the various forms of intimacy that nourish a relationship.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m7-l1-a1",
            "type": "multiple_choice",
            "title": "Forms of Intimacy",
            "instruction": "Which of these are examples of different forms of intimacy in a relationship? (Select all that apply)",
            "content": {
              "question": "Intimacy can take many forms. Which of these are true?",
              "options": [
                "Emotional intimacy (sharing feelings).",
                "Physical intimacy (touch, affection, sex).",
                "Intellectual intimacy (deep conversations, shared ideas).",
                "Experiential intimacy (shared activities, adventures).",
                "Spiritual intimacy (shared values, beliefs, meaning)."
              ],
              "correctIndex": [
                0,
                1,
                2,
                3,
                4
              ],
              "explanation": "Intimacy is a broad concept, encompassing many ways we connect deeply with another person."
            },
            "saveToVault": false
          },
          {
            "id": "m7-l1-a2",
            "type": "carousel",
            "title": "The Intimacy Wheel",
            "instruction": "Swipe to explore various aspects of intimacy.",
            "content": {
              "cards": [
                {
                  "title": "Emotional Intimacy",
                  "body": "Feeling understood and accepting each other's vulnerabilities.",
                  "icon": "lucide-hand-heart"
                },
                {
                  "title": "Physical Intimacy",
                  "body": "Non-sexual touch, affection, and sexual connection.",
                  "icon": "lucide-heart-crack"
                },
                {
                  "title": "Affectionate Intimacy",
                  "body": "Hugs, kisses, holding hands \u2013 small gestures of love.",
                  "icon": "lucide-gem"
                },
                {
                  "title": "Recreational Intimacy",
                  "body": "Shared hobbies, playtime, having fun together.",
                  "icon": "lucide-gamepad"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m7-l1-a3",
            "type": "open_response",
            "title": "Our Intimacy Landscape",
            "instruction": "In which forms of intimacy do you and your partner excel? Which forms feel less developed or could use more attention? What's one small step you could take to enhance a less developed area?",
            "content": {
              "prompt": "Reflect on specific examples for each part of the question.",
              "placeholder": "We're strong in recreational intimacy, always having fun on hikes. Emotional intimacy is sometimes a struggle for me to initiate, so I'll try to share one vulnerable feeling daily.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-7-lesson-2",
        "title": "Understanding Desire & Eros",
        "description": "Explore the nuances of sexual desire and how to keep it alive in long-term relationships.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m7-l2-a1",
            "type": "true_false",
            "title": "Desire Debunked",
            "instruction": "Is the following statement true or false?",
            "content": {
              "statement": "There is only one 'normal' way for sexual desire to manifest (e.g., spontaneous desire).",
              "correct": false,
              "explanation": "False! Many people experience 'responsive desire,' where arousal precedes desire, often stemming from connection or initiation. There's no single 'normal'."
            },
            "saveToVault": false
          },
          {
            "id": "m7-l2-a2",
            "type": "comparison",
            "title": "Spontaneous vs. Responsive Desire",
            "instruction": "Compare these two common forms of sexual desire.",
            "content": {
              "itemA": {
                "title": "Spontaneous Desire",
                "points": [
                  "Desire arises 'out of the blue' before any sexual activity.",
                  "Often driven by hormones, novelty, or anticipation.",
                  "Commonly portrayed in media; seen as 'ideal' but not universal."
                ]
              },
              "itemB": {
                "title": "Responsive Desire",
                "points": [
                  "Desire emerges in response to sexual stimuli or connection.",
                  "Often driven by intimacy, playful touch, or a sense of safety.",
                  "Very common, especially in long-term relationships and for women."
                ]
              },
              "reflection": "Which type of desire do you (and your partner) experience more often? How might understanding this impact your approach to intimacy?"
            },
            "saveToVault": false
          },
          {
            "id": "m7-l2-a3",
            "type": "open_response",
            "title": "My Map of Desire",
            "instruction": "What are some of the 'on-ramps' (things that increase desire) and 'off-ramps' (things that decrease desire) for *you*? Share 2-3 of each, being honest and specific.",
            "content": {
              "prompt": "Think broadly: physical, emotional, environmental factors.",
              "placeholder": "On-ramps: feeling rested, deep conversation, quiet time together. Off-ramps: stress from work, feeling criticized, overtiredness.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-7-lesson-3",
        "title": "Cultivating Passion & Playfulness",
        "description": "Learn to communicate sexual needs and desires, and integrate playful curiosity into your intimate life.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m7-l3-a1",
            "type": "sort",
            "title": "Elements of Sexual Communication",
            "instruction": "Arrange these aspects of sexual communication from most important to least important for a fulfilling sex life.",
            "content": {
              "items": [
                "Expressing desires and preferences clearly.",
                "Listening non-judgmentally to your partner's wants.",
                "Feeling safe to be vulnerable about your body and fantasies.",
                "Giving and receiving honest feedback (gently).",
                "Initiating intimacy in ways that are inviting, not demanding."
              ],
              "correctOrder": [
                2,
                1,
                0,
                4,
                3
              ],
              "context": "Safety and non-judgmental listening are foundational, allowing for open expression."
            },
            "saveToVault": false
          },
          {
            "id": "m7-l3-a2",
            "type": "short_answer",
            "title": "Our Intimacy 'Wish List'",
            "instruction": "What's one new thing (could be big or small, non-sexual or sexual) you'd like to try or incorporate into your intimate connection with your partner? How will you gently propose it?",
            "content": {
              "prompt": "Focus on a positive addition or exploration.",
              "placeholder": "I'd like to try having a dedicated 'date night' just for intimate conversation weekly. I'll propose it by saying, 'I've been missing our deep talks, would you be open to a weekly 'connection corner' date?'",
              "minWords": 30
            },
            "saveToVault": true
          },
          {
            "id": "m7-l3-a3",
            "type": "video_upload",
            "title": "Invitation to Play",
            "instruction": "Record a short video message for your partner, inviting them to engage in one small, playful, or intimate act this week. It could be a simple touch, a shared laugh, or a suggestion for a date.",
            "content": {
              "prompt": "Make it light-hearted and invitational.",
              "maxSeconds": 60
            },
            "tip": "Keep it low-pressure and fun!",
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-8",
    "title": "Module 8: Dreams Within Conflict",
    "subtitle": "Uncovering the deeper meanings behind your perpetual problems.",
    "description": "Dive beneath the surface of 'unresolvable' conflicts to discover the hidden dreams, values, and aspirations at their core. Transform gridlocked issues by understanding what truly matters to each of you.",
    "icon": "lucide-moon",
    "estimatedMinutes": 60,
    "sources": [
      "The New Marriage Clinic",
      "10 Lessons to Transform Your Marriage",
      "Fight Right"
    ],
    "lessons": [
      {
        "id": "module-8-lesson-1",
        "title": "Perpetual vs. Solvable Problems",
        "description": "Distinguish between conflicts that can be solved and those tied to deeper, ongoing differences.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m8-l1-a1",
            "type": "true_false",
            "title": "Conflict Categories",
            "instruction": "Is the following statement about relationship problems true or false?",
            "content": {
              "statement": "Most relationship conflicts (around 69%) are perpetual, meaning they will likely never be fully resolved.",
              "correct": true,
              "explanation": "Yes, Gottman research indicates that perpetual problems are common and stem from fundamental personality differences, values, or needs."
            },
            "saveToVault": false
          },
          {
            "id": "m8-l1-a2",
            "type": "single_choice",
            "title": "Spot the Perpetual Problem",
            "instruction": "Which of these scenarios is most likely a 'perpetual problem'?",
            "content": {
              "question": "Which scenario is most likely a 'perpetual problem'?",
              "options": [
                "Deciding where to go for dinner tonight.",
                "One partner is a neat freak, the other is messy, leading to ongoing tension about household tidiness.",
                "Forgetting to pick up milk from the store.",
                "A disagreement about how to spend the upcoming Saturday afternoon."
              ],
              "correctIndex": 1,
              "explanation": "Different preferences for tidiness often stem from deep-seated personality traits and values, making it a perpetual area of difference."
            },
            "saveToVault": false
          },
          {
            "id": "m8-l1-a3",
            "type": "open_response",
            "title": "Our Perpetual Loop",
            "instruction": "Identify one 'perpetual problem' in your relationship \u2013 an issue you tend to argue about repeatedly without full resolution. Describe the problem and how it typically plays out.",
            "content": {
              "prompt": "What's the recurring conflict, and what's the usual dance around it?",
              "placeholder": "We constantly argue about punctuality. I'm always early/on time, and my partner is always late. It leads to frustration and resentment on my side, and my partner feeling nagged.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-8-lesson-2",
        "title": "Uncovering Underlying Dreams",
        "description": "Learn to dig deeper into conflict to discover the core values and dreams at play.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m8-l2-a1",
            "type": "fill_blanks",
            "title": "The Core of Perpetual Problems",
            "instruction": "Fill in the blanks: Behind every perpetual conflict lies an ___ dream, value, or unmet ___.",
            "content": {
              "text": "Behind every perpetual conflict lies an ___ dream, value, or unmet ___.",
              "blanks": [
                "unspoken",
                "need"
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m8-l2-a2",
            "type": "carousel",
            "title": "Common Dreams Behind Conflicts",
            "instruction": "Swipe through to see common deeper meanings behind everyday arguments.",
            "content": {
              "cards": [
                {
                  "title": "Mess vs. Neatness",
                  "body": "Dream of peace, order, self-expression, freedom, or respect.",
                  "icon": "lucide-boxes"
                },
                {
                  "title": "Money & Spending",
                  "body": "Dream of security, freedom, generosity, power, belonging, or pleasure.",
                  "icon": "lucide-wallet"
                },
                {
                  "title": "Sex & Affection",
                  "body": "Dream of acceptance, security, control, adventure, comfort, or desire.",
                  "icon": "lucide-heart-handshake"
                },
                {
                  "title": "Time Together/Apart",
                  "body": "Dream of connection, independence, adventure, safety, or rest.",
                  "icon": "lucide-calendar"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m8-l2-a3",
            "type": "open_response",
            "title": "My Hidden Dream",
            "instruction": "Consider the 'perpetual problem' you identified. What deeper value, dream, or unmet need might be fueling *your* side of the conflict?",
            "content": {
              "prompt": "Connect your feelings and actions in the conflict to a core desire.",
              "placeholder": "Regarding punctuality, my need to be early is tied to a dream of feeling respected and being responsible, and a fear of being seen as unreliable.",
              "minWords": 40
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-8-lesson-3",
        "title": "Making Peace with Perpetual Problems",
        "description": "Learn to dialogue about perpetual problems with respect and humor, even if they never fully disappear.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m8-l3-a1",
            "type": "sort",
            "title": "Steps to Dialogue about Dreams",
            "instruction": "Order these steps for effectively discussing the dreams within a conflict.",
            "content": {
              "items": [
                "Validate your partner's dream and experience, even if you don't agree.",
                "State your own dream/need related to the issue.",
                "Identify the perpetual problem you'll discuss.",
                "Brainstorm ways to honor both dreams, even small ones.",
                "Explain the personal history or meaning behind your dream."
              ],
              "correctOrder": [
                2,
                1,
                4,
                0,
                3
              ],
              "context": "Starting with the problem, then each partner expressing their dream (and why it matters), then validating, then brainstorming is a good flow."
            },
            "saveToVault": false
          },
          {
            "id": "m8-l3-a2",
            "type": "decision_point",
            "title": "Honoring a Dream",
            "instruction": "Your partner's dream (behind their desire for a pristine garden) is to create a beautiful, nurturing home sanctuary. You have limited time. How do you honor their dream?",
            "content": {
              "scenario": "Your partner wants a perfect garden, driven by a dream of creating a beautiful, peaceful home sanctuary. You have very little time for gardening.",
              "choices": [
                {
                  "label": "You: 'That's a beautiful dream, and I can see how important that sanctuary feeling is to you. What's one small thing I could do each week to contribute to that, even if it's not gardening?'",
                  "outcome": "Optimal. You're validating their dream, acknowledging their ideal, and offering a realistic contribution that respects your time constraints.",
                  "isOptimal": true
                },
                {
                  "label": "You: 'Honestly, I just don't have time for gardening. You'll have to do it yourself or hire someone.'",
                  "outcome": "This dismisses their dream, which can feel invalidating and lead to resentment, even if the practical solution is needed.",
                  "isOptimal": false
                },
                {
                  "label": "You: (Sighs) 'Fine, I'll pull weeds for an hour, but I'm not happy about it.'",
                  "outcome": "While you're doing the task, your attitude communicates a lack of understanding or respect for their deeper dream, potentially poisoning the gesture.",
                  "isOptimal": false
                }
              ]
            },
            "tip": "Honor the *dream* first, then discuss the practicalities.",
            "saveToVault": false
          },
          {
            "id": "m8-l3-a3",
            "type": "video_upload",
            "title": "Dialogue About a Dream",
            "instruction": "With your partner, choose one well-established 'perpetual problem.' Engage in a 10-15 minute discussion where you *both* aim to uncover and understand the deeper dreams/values behind each other's stance. Record a voice note or simple video recap of your insights.",
            "content": {
              "prompt": "What did you learn about your partner's deeper dream? What did they learn about yours? How did it feel?",
              "maxSeconds": 180
            },
            "tip": "Remember Rule #1: Understanding, not solving, is the goal here.",
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-9",
    "title": "Module 9: Repair & Recovery",
    "subtitle": "Mending hurts, rebuilding trust, and moving forward after conflict.",
    "description": "Learn the essential skills of relationship repair - how to apologize effectively, accept apologies, and find pathways to forgiveness, ensuring conflicts strengthen your bond instead of weakening it.",
    "icon": "lucide-scissors",
    "estimatedMinutes": 60,
    "sources": [
      "The Relationship Cure",
      "Couples Therapy Workbook",
      "Helping Couples on the Brink",
      "On Grief and Grieving"
    ],
    "lessons": [
      {
        "id": "module-9-lesson-1",
        "title": "The Power of Repair Attempts",
        "description": "Recognize efforts to de-escalate and reconnect during or after conflict.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m9-l1-a1",
            "type": "true_false",
            "title": "Repair Basics",
            "instruction": "Is the following statement about repair attempts true or false?",
            "content": {
              "statement": "Only the person who caused the hurt can initiate a repair attempt.",
              "correct": false,
              "explanation": "False! Anyone can initiate a repair attempt. Often, simply interrupting negativity with a positive gesture can make a huge difference, regardless of who 'started it'."
            },
            "saveToVault": false
          },
          {
            "id": "m9-l1-a2",
            "type": "multiple_choice",
            "title": "Spot the Repair Attempt!",
            "instruction": "Which of these are examples of effective repair attempts? (Select all that apply)",
            "content": {
              "question": "Which of these might be a repair attempt during or after a heated discussion?",
              "options": [
                "Saying 'I'm sorry, I worded that badly. Can I try again?'",
                "Offering a gentle touch or hug amidst tension.",
                "Making a silly face or joke (if appropriate for your couple).",
                "Suggesting, 'Let's take a break and talk about this later.'",
                "Sarcastically saying, 'Are we done with your lecture yet?'"
              ],
              "correctIndex": [
                0,
                1,
                2,
                3
              ],
              "explanation": "Sarcasm usually escalates, not repairs. The others are attempts to de-escalate, apologize, or take a constructive pause."
            },
            "saveToVault": false
          },
          {
            "id": "m9-l1-a3",
            "type": "open_response",
            "title": "Our Repair Moves",
            "instruction": "What are some successful repair attempts (verbal or non-verbal) you or your partner have made in the past that helped de-escalate or reconnect? What made them effective?",
            "content": {
              "prompt": "Share specific examples and analyze their impact.",
              "placeholder": "My partner often puts their hand on my arm during an argument, which immediately reminds me that they still care. It helps me calm down and listen.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-9-lesson-2",
        "title": "The Art of Apology and Forgiveness",
        "description": "Learn the components of a truly effective apology and the process of genuine forgiveness.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m9-l2-a1",
            "type": "sort",
            "title": "Components of a True Apology",
            "instruction": "Order these elements to craft a comprehensive and sincere apology.",
            "content": {
              "items": [
                "Expressing remorse ('I'm sorry').",
                "Acknowledging the hurt your actions caused.",
                "Stating your understanding of their perspective.",
                "Taking responsibility for your part.",
                "Making a plan to prevent recurrence (if possible)."
              ],
              "correctOrder": [
                0,
                3,
                1,
                2,
                4
              ],
              "context": "Apologizing, taking responsibility, acknowledging impact, showing understanding, and future intent create a full apology."
            },
            "saveToVault": false
          },
          {
            "id": "m9-l2-a2",
            "type": "single_choice",
            "title": "Forgiveness Misconceptions",
            "instruction": "Which of these statements about forgiveness is true?",
            "content": {
              "question": "Which statement best describes true forgiveness?",
              "options": [
                "Forgiveness means forgetting what happened.",
                "Forgiveness means excusing the hurtful behavior.",
                "Forgiveness is a process of letting go of resentment and choosing peace, not necessarily reconciliation.",
                "Forgiveness is always a one-time event that immediately heals everything."
              ],
              "correctIndex": 2,
              "explanation": "Forgiveness is a choice for personal healing; it doesn't erase memory, condone behavior, or always lead to renewed trust instantly."
            },
            "saveToVault": false
          },
          {
            "id": "m9-l2-a3",
            "type": "open_response",
            "title": "My Practice Apology",
            "instruction": "Think of a time you want to apologize to your partner (or recently did). Write out a truly comprehensive apology using the elements you just learned.",
            "content": {
              "prompt": "Practice crafting an apology that covers remorse, responsibility, understanding, and future action.",
              "placeholder": "Honey, I'm really sorry for snapping at you earlier. I was stressed, but that's no excuse for how I spoke. I know it made you feel dismissed and hurt, and I regret making you feel that way. I'll work on pausing before reacting next time.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-9-lesson-3",
        "title": "Grieving, Healing, and Moving Forward",
        "description": "Address betrayals and deep hurts by understanding the stages of grief and pathways to healing.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m9-l3-a1",
            "type": "carousel",
            "title": "Stages of Grieving a Hurt",
            "instruction": "Swipe through the adapted stages of grief (Kubler-Ross) as they might apply to processing deep relational hurts or betrayals.",
            "content": {
              "cards": [
                {
                  "title": "Denial/Shock",
                  "body": "Difficulty believing what happened, feeling numb.",
                  "icon": "lucide-skull"
                },
                {
                  "title": "Anger",
                  "body": "Outrage, blame, frustration about the injury.",
                  "icon": "lucide-angry"
                },
                {
                  "title": "Bargaining",
                  "body": "Seeking explanations, 'if only' thoughts, trying to undo damage.",
                  "icon": "lucide-scale"
                },
                {
                  "title": "Depression/Sadness",
                  "body": "Profound sadness, isolation, lethargy.",
                  "icon": "lucide-cloud-rain"
                },
                {
                  "title": "Acceptance/Reconstruction",
                  "body": "Coming to terms with reality and beginning to rebuild, either individually or relationally.",
                  "icon": "lucide-sparkles"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m9-l3-a2",
            "type": "short_answer",
            "title": "Rebuilding Trust Action",
            "instruction": "If trust has been broken, what's one concrete action you can take (or commit to continuing) to actively rebuild trust with your partner?",
            "content": {
              "prompt": "Focus on consistency, transparency, or specific behaviors.",
              "placeholder": "I will consistently follow through on commitments, no matter how small, to demonstrate reliability.",
              "minWords": 20
            },
            "saveToVault": true
          },
          {
            "id": "m9-l3-a3",
            "type": "video_upload",
            "title": "A Pledge for Healing",
            "instruction": "Record a brief video message for your partner acknowledging the importance of repair and committing to a 'no stonewalling' zone during conflicts, and a commitment to actively seeking understanding and apology.",
            "content": {
              "prompt": "Focus on the positive intention for healing.",
              "maxSeconds": 90
            },
            "tip": "Even small steps toward repair build significant goodwill.",
            "saveToVault": true
          }
        ]
      }
    ]
  },
  {
    "id": "module-10",
    "title": "Module 10: Building Your Shared Meaning",
    "subtitle": "Creating a rich, meaningful, and deeply connected life together.",
    "description": "Discover the profound ways couples create shared meaning through rituals, roles, goals, and values. This module helps you craft a unique, resilient, and deeply satisfying partnership.",
    "icon": "lucide-tree-pine",
    "estimatedMinutes": 60,
    "sources": [
      "The New Marriage Clinic",
      "The Relationship Cure",
      "Eight Dates",
      "Us"
    ],
    "lessons": [
      {
        "id": "module-10-lesson-1",
        "title": "The Architecture of Shared Meaning",
        "description": "Explore how couples build a unique internal world through shared values, rituals, and symbols.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m10-l1-a1",
            "type": "multiple_choice",
            "title": "Elements of Shared Meaning",
            "instruction": "Which of these contribute to a couple's system of shared meaning? (Select all that apply)",
            "content": {
              "question": "Shared meaning is built through...",
              "options": [
                "Creating personal rituals of connection.",
                "Agreeing on fundamental life values and goals.",
                "Making inside jokes and special terms of endearment.",
                "Discussing your life philosophies and beliefs.",
                "Sharing distinct roles within the household or family."
              ],
              "correctIndex": [
                0,
                1,
                2,
                3,
                4
              ],
              "explanation": "All these elements contribute to a couple's unique culture and sense of shared purpose."
            },
            "saveToVault": false
          },
          {
            "id": "m10-l1-a2",
            "type": "carousel",
            "title": "Manifestations of Shared Meaning",
            "instruction": "Swipe through examples of how shared meaning shows up in daily life.",
            "content": {
              "cards": [
                {
                  "title": "Rituals of Connection",
                  "body": "Daily morning coffee together, weekly date night, birthday traditions.",
                  "icon": "lucide-campfire"
                },
                {
                  "title": "Shared Goals",
                  "body": "Saving for a home, raising kids a certain way, traveling the world.",
                  "icon": "lucide-target"
                },
                {
                  "title": "Shared Values",
                  "body": "Emphasis on family, community, personal growth, adventure, security.",
                  "icon": "lucide-diamond"
                },
                {
                  "title": "Roles & Narratives",
                  "body": "Our story of how we met, who takes which responsibilities, how we overcome challenges.",
                  "icon": "lucide-scroll"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m10-l1-a3",
            "type": "open_response",
            "title": "Our Unique Couple Culture",
            "instruction": "What are some existing rituals, inside jokes, or shared values that already define your unique 'couple culture'? How do these contribute to your sense of belonging together?",
            "content": {
              "prompt": "Share specific examples.",
              "placeholder": "Our Sunday morning pancake ritual is sacred \u2013 it feels like 'us.' Our shared value for adventure means we're always planning next trips, strengthening our bond.",
              "minWords": 50
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-10-lesson-2",
        "title": "Crafting Your Shared Future",
        "description": "Align individual dreams and aspirations to build a compelling joint vision for your life together.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m10-l2-a1",
            "type": "sort",
            "title": "Steps to Shared Vision",
            "instruction": "Order these steps for collaboratively creating a shared future vision.",
            "content": {
              "items": [
                "Identify individual dreams and aspirations.",
                "Discuss overlapping and converging dreams.",
                "Find ways to support unique individual dreams.",
                "Create a compelling narrative of your shared future.",
                "Brainstorm concrete steps to move towards the shared vision."
              ],
              "correctOrder": [
                0,
                2,
                1,
                4,
                3
              ],
              "context": "Understanding individual dreams first, then finding overlaps and support, then making a plan, and finally narrating the vision."
            },
            "saveToVault": false
          },
          {
            "id": "m10-l2-a2",
            "type": "image_upload",
            "title": "Our Vision Board Element",
            "instruction": "Find or create an image that represents a shared dream or aspiration you have for your future together (e.g., travel, home, family, adventure). Upload it and describe its significance.",
            "content": {
              "prompt": "Visualize your shared future.",
              "exampleDescription": "A photo of a cozy fireplace to represent our dream of a warm, inviting home together."
            },
            "saveToVault": true
          },
          {
            "id": "m10-l2-a3",
            "type": "open_response",
            "title": "Our Future Narrative",
            "instruction": "As a couple, imagine yourselves 5, 10, or even 20 years from now. Write a short narrative together describing your ideal life: what you're doing, what your relationship feels like, what you've achieved.",
            "content": {
              "prompt": "Collaboratively paint a picture of your ideal shared future.",
              "placeholder": "In 10 years, we are living in a house by the lake, enjoying quiet mornings with coffee, still laughing at each other's jokes. We've supported each other's passions and raised happy, independent kids. Our love feels even deeper and more resilient...",
              "minWords": 100
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-10-lesson-3",
        "title": "Rituals of Connection for Life",
        "description": "Establish sustainable rituals that continually reinforce your shared meaning and emotional connection.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m10-l3-a1",
            "type": "true_false",
            "title": "Ritual Reinforcement",
            "instruction": "Is the following statement about rituals true or false?",
            "content": {
              "statement": "Rituals must be grand and elaborate to be effective in building shared meaning.",
              "correct": false,
              "explanation": "False! Simple, consistent rituals (like a daily check-in or shared meal) are often the most powerful because they are sustainable and create predictable pockets of connection."
            },
            "saveToVault": false
          },
          {
            "id": "m10-l3-a2",
            "type": "short_answer",
            "title": "New Ritual Brainstorm",
            "instruction": "What's one *new* small ritual you and your partner could create or enhance this week to reinforce your shared meaning or connection?",
            "content": {
              "prompt": "Think about daily, weekly, or special occasion rituals.",
              "placeholder": "We'll start a 'gratitude ritual' before bed, sharing one thing we're grateful for about each other or our day.",
              "minWords": 20
            },
            "saveToVault": true
          },
          {
            "id": "m10-l3-a3",
            "type": "video_upload",
            "title": "Our Signal Connect Course Conclusion",
            "instruction": "Record a final video together, sharing your biggest takeaway from the 'Signal Couples Connect Course' and one actionable commitment you'll both make to continue building your shared meaning and connection.",
            "content": {
              "prompt": "What's the one thing you'll carry forward? What's your shared commitment?",
              "maxSeconds": 180
            },
            "tip": "Celebrate your journey and look forward to your continuing growth!",
            "saveToVault": true
          }
        ]
      }
    ]
  }
  ,
  {
    "id": "module-11",
    "title": "Module 11: The Dance of Anger — Boundaries, People-Pleasing & Saying No",
    "subtitle": "Reclaiming your voice, setting limits, and transforming anger into clarity.",
    "description": "Based on Harriet Lerner's groundbreaking work, this module helps women who struggle with people-pleasing, difficulty saying no, and porous boundaries. You'll learn to recognise your anger patterns, communicate with clarity instead of reactivity, and set boundaries that protect your wellbeing without destroying your relationships.",
    "icon": "lucide-flame",
    "estimatedMinutes": 75,
    "sources": ["The Dance of Anger — Harriet Lerner, Ph.D."],
    "lessons": [
      {
        "id": "module-11-lesson-1",
        "title": "Anger Is a Signal, Not a Problem",
        "description": "Understand why anger deserves your respect and attention — and why suppressing it keeps you stuck.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m11-l1-a1",
            "type": "carousel",
            "title": "The Two Sides of the Coin",
            "instruction": "Swipe through to understand the two common patterns women fall into when dealing with anger.",
            "content": {
              "cards": [
                {
                  "title": "The 'Nice Lady'",
                  "body": "Stays silent to avoid conflict. Puts others' comfort first. Feels guilty for having needs. Accumulates resentment beneath the surface until she either shuts down or explodes.",
                  "icon": "lucide-smile"
                },
                {
                  "title": "The 'Bitchy' Woman",
                  "body": "Expresses anger freely but ineffectively — through complaining, blaming, or fighting that never resolves the real issues. Others dismiss her, confirming her powerlessness.",
                  "icon": "lucide-zap"
                },
                {
                  "title": "The Truth",
                  "body": "Both patterns are two sides of the same coin. Neither leads to real change. Both leave you feeling helpless and powerless. The goal is a third way: clarity, calm assertion, and self-definition.",
                  "icon": "lucide-lightbulb"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l1-a2",
            "type": "single_choice",
            "title": "Which Pattern Do You Recognise?",
            "instruction": "Be honest with yourself — there's no wrong answer. Most women move between both patterns depending on the relationship.",
            "content": {
              "question": "When something bothers you in a close relationship, what do you tend to do?",
              "options": [
                "I stay quiet, swallow my feelings, and try to keep the peace — even when I'm seething inside.",
                "I speak up, but it often comes out as complaining, nagging, or fighting that goes nowhere.",
                "It depends on who I'm with — I'm a 'nice lady' with some people and more reactive with others.",
                "I tend to shut down completely, withdrawing emotionally rather than addressing the issue."
              ],
              "correctIndex": null,
              "explanation": "Recognising your default pattern is the first step. As Lerner writes: 'Anger is a signal, and one worth listening to.' The goal isn't to eliminate anger but to use it as information."
            },
            "saveToVault": false
          },
          {
            "id": "m11-l1-a3",
            "type": "open_response",
            "title": "Your Anger Autobiography",
            "instruction": "Reflect on your relationship with anger. What messages did you receive growing up about women and anger? How has that shaped how you express (or suppress) anger today?",
            "content": {
              "prompt": "Think about: What happened when your mother got angry? What were you told about 'nice girls'? When was the last time you felt truly angry but said nothing?",
              "placeholder": "Growing up, I learned that...",
              "minWords": 30
            },
            "tip": "Lerner: 'The taboos against women feeling and expressing anger are so powerful that even knowing when we are angry is not a simple matter.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-11-lesson-2",
        "title": "The People-Pleasing Trap",
        "description": "Explore how 'de-selfing' — sacrificing your needs to maintain harmony — erodes your identity and fuels resentment.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m11-l2-a1",
            "type": "carousel",
            "title": "The Cost of De-Selfing",
            "instruction": "Swipe through to understand what happens when you chronically put others first.",
            "content": {
              "cards": [
                {
                  "title": "Loss of Self",
                  "body": "When you constantly 'read' other people's reactions and adjust yourself accordingly, you lose touch with your own thoughts, feelings, and desires. You become an expert on others but a stranger to yourself.",
                  "icon": "lucide-ghost"
                },
                {
                  "title": "The Guilt Trap",
                  "body": "Guilt and anger are incompatible. If you feel guilty for not giving enough, you'll never feel entitled to be angry about not receiving enough. Society cultivates guilt in women so effectively that many still feel guilty for being anything less than an emotional service station.",
                  "icon": "lucide-heart-crack"
                },
                {
                  "title": "The Explosion Cycle",
                  "body": "The more you give in and go along, the more anger builds. The more you repress, the more you fear an eruption. When you finally blow, it 'confirms' your anger is irrational — and the cycle starts again.",
                  "icon": "lucide-bomb"
                },
                {
                  "title": "Breaking Free",
                  "body": "Real change means learning to tolerate the discomfort of others' disapproval. It means staying connected to people while also staying connected to yourself. This is the hardest — and most rewarding — work.",
                  "icon": "lucide-key"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l2-a2",
            "type": "true_false",
            "title": "People-Pleasing Reality Check",
            "instruction": "Answer honestly for each statement.",
            "content": {
              "statements": [
                { "text": "I often say 'yes' when I want to say 'no' because I'm afraid of disappointing someone.", "answer": null },
                { "text": "I frequently apologise for things that aren't my fault.", "answer": null },
                { "text": "I feel responsible for other people's emotions and reactions.", "answer": null },
                { "text": "I avoid sharing my real opinion if I think it might create tension.", "answer": null },
                { "text": "I often feel resentful but can't pinpoint exactly why.", "answer": null },
                { "text": "I put more energy into reading others than understanding myself.", "answer": null }
              ],
              "explanation": "Each 'true' highlights an area where you may be sacrificing your authentic self to maintain peace. Awareness is the first step toward change."
            },
            "saveToVault": false
          },
          {
            "id": "m11-l2-a3",
            "type": "open_response",
            "title": "Where Do You De-Self?",
            "instruction": "Identify one relationship where you consistently silence yourself, go along, or take on responsibility that isn't yours. What would change if you stopped?",
            "content": {
              "prompt": "Name the relationship and describe what you typically do to keep the peace. What are you afraid would happen if you stopped?",
              "placeholder": "With my [person], I tend to...",
              "minWords": 30
            },
            "tip": "Lerner: 'We behave as if having a relationship is more important than having a self.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-11-lesson-3",
        "title": "The Art of Saying No with Clarity",
        "description": "Learn to communicate your position without attacking, defending, or over-explaining — using 'I' statements and clear boundaries.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m11-l3-a1",
            "type": "carousel",
            "title": "From Reactivity to Clarity",
            "instruction": "Learn the key principles of clear communication from The Dance of Anger.",
            "content": {
              "cards": [
                {
                  "title": "Use 'I' Language",
                  "body": "Say 'I think…', 'I feel…', 'I want…' instead of 'You always…' or 'You never…'. The goal is to share your experience, not diagnose the other person's problem.",
                  "icon": "lucide-user"
                },
                {
                  "title": "Don't Prescribe",
                  "body": "State your position without telling the other person what they should feel, think, or do. You can only change your own steps in the dance — not your partner's.",
                  "icon": "lucide-ban"
                },
                {
                  "title": "Expect Countermoves",
                  "body": "When you change your pattern, others will push back. They'll test whether you really mean it. This is normal. The key is to hold your position calmly, without escalating or backing down.",
                  "icon": "lucide-shield"
                },
                {
                  "title": "Short & Clear",
                  "body": "Over-explaining is a form of anxiety. A clear 'no' doesn't need a paragraph of justification. 'I'm not comfortable with that' is a complete sentence.",
                  "icon": "lucide-check"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l3-a2",
            "type": "comparison",
            "title": "Reactive vs. Clear Communication",
            "instruction": "Compare these two approaches to the same situation. Notice the difference in clarity and emotional tone.",
            "content": {
              "pairs": [
                {
                  "left": { "label": "Reactive", "text": "'You never help around the house! You're so lazy and selfish!'" },
                  "right": { "label": "Clear", "text": "'I feel overwhelmed managing the household alone. I need us to divide chores more evenly. Here's what I'm proposing…'" }
                },
                {
                  "left": { "label": "Reactive", "text": "'Fine, I'll just do it myself like I always do.'" },
                  "right": { "label": "Clear", "text": "'I'm not willing to take this on alone. I need to know if you can commit to handling [specific task] by [specific time].'" }
                },
                {
                  "left": { "label": "Reactive", "text": "'You don't even care about my feelings!'" },
                  "right": { "label": "Clear", "text": "'When I share something important and get a distracted response, I feel dismissed. I need to know you're really listening.'" }
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l3-a3",
            "type": "open_response",
            "title": "Rewrite Your Script",
            "instruction": "Think of a recent situation where you either stayed silent or reacted poorly. Rewrite what you wish you had said — using 'I' language, clarity, and calm assertion.",
            "content": {
              "prompt": "Describe the situation briefly, then write your 'clear' version of what you want to communicate.",
              "placeholder": "The situation was… What I wish I'd said is…",
              "minWords": 25
            },
            "tip": "Remember: You don't need to convince the other person. You only need to clearly state your position.",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-11-lesson-4",
        "title": "Countermoves & Standing Your Ground",
        "description": "Understand why people resist your changes — and how to hold your new position without caving or escalating.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m11-l4-a1",
            "type": "carousel",
            "title": "The Countermove Pattern",
            "instruction": "When you change your steps in a relationship dance, the other person will always push back. Here's what to expect.",
            "content": {
              "cards": [
                {
                  "title": "What Is a Countermove?",
                  "body": "When you set a boundary or change a pattern, the other person will try to restore the old dynamic. They may guilt-trip, withdraw, get angry, or tell you you've changed. This is a countermove.",
                  "icon": "lucide-refresh-cw"
                },
                {
                  "title": "Why It Happens",
                  "body": "Change creates anxiety in a relationship system. The other person isn't necessarily trying to hurt you — they're trying to restore the familiar equilibrium, even if it was unhealthy.",
                  "icon": "lucide-brain"
                },
                {
                  "title": "The Critical Moment",
                  "body": "This is where most people cave. The discomfort of the countermove feels worse than the original problem. But if you go back to your old pattern, you confirm that boundaries don't stick.",
                  "icon": "lucide-alert-triangle"
                },
                {
                  "title": "Hold Your Position",
                  "body": "Stay calm. Don't attack, defend, or over-explain. Simply restate your position: 'I understand this is hard. And this is what I need.' Then give the relationship time to adjust.",
                  "icon": "lucide-anchor"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l4-a2",
            "type": "sort",
            "title": "Countermove or Genuine Concern?",
            "instruction": "Drag each response into the correct category. Is it a countermove designed to restore the old pattern, or genuine concern?",
            "content": {
              "categories": ["Countermove", "Genuine Concern"],
              "items": [
                { "text": "'You've changed. I don't even recognise you anymore.'", "correctCategory": "Countermove" },
                { "text": "'I'm worried this new distance between us means something is wrong.'", "correctCategory": "Genuine Concern" },
                { "text": "'Fine. Do whatever you want. I don't care anymore.'", "correctCategory": "Countermove" },
                { "text": "'I want to understand your needs. Can we talk about this more?'", "correctCategory": "Genuine Concern" },
                { "text": "'You're being selfish. You only think about yourself now.'", "correctCategory": "Countermove" },
                { "text": "'I feel hurt and I'd like to work through this together.'", "correctCategory": "Genuine Concern" }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l4-a3",
            "type": "open_response",
            "title": "Your Countermove Plan",
            "instruction": "Think about a boundary you want to set (or have recently set). What countermove do you expect? How will you respond without caving or attacking?",
            "content": {
              "prompt": "Describe the boundary, the likely countermove, and your calm response.",
              "placeholder": "The boundary I want to set is… I expect they'll respond by… My plan is to…",
              "minWords": 30
            },
            "tip": "Lerner: 'Countermoves are the other person's unconscious attempt to reinstate the status quo. They are not evidence that you are wrong.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-11-lesson-5",
        "title": "Who's Responsible for What?",
        "description": "Untangle over-responsibility from under-responsibility — and learn to stay in your own lane.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m11-l5-a1",
            "type": "carousel",
            "title": "The Responsibility Tangle",
            "instruction": "Understand how women often take on too much emotional responsibility — and how this blocks real change.",
            "content": {
              "cards": [
                {
                  "title": "Over-Functioning",
                  "body": "You do too much: managing, reminding, worrying, fixing. You carry the emotional load for the relationship. The more you do, the less the other person has to — creating a cycle of resentment.",
                  "icon": "lucide-loader"
                },
                {
                  "title": "Under-Functioning",
                  "body": "The counterpart to over-functioning. The more one person takes over, the more the other pulls back. Neither person is showing their full self — both are stuck in a polarised pattern.",
                  "icon": "lucide-moon"
                },
                {
                  "title": "Staying in Your Lane",
                  "body": "You are responsible for your own thoughts, feelings, and behaviour. You are NOT responsible for another adult's feelings, reactions, or choices. This distinction is the foundation of healthy boundaries.",
                  "icon": "lucide-milestone"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l5-a2",
            "type": "sort",
            "title": "My Responsibility or Theirs?",
            "instruction": "Drag each item into the correct lane.",
            "content": {
              "categories": ["My Responsibility", "Not My Responsibility"],
              "items": [
                { "text": "How I communicate my needs", "correctCategory": "My Responsibility" },
                { "text": "Whether they feel hurt by my boundary", "correctCategory": "Not My Responsibility" },
                { "text": "Following through on my commitments", "correctCategory": "My Responsibility" },
                { "text": "Managing their emotional reaction", "correctCategory": "Not My Responsibility" },
                { "text": "Being honest about what I feel", "correctCategory": "My Responsibility" },
                { "text": "Making them happy", "correctCategory": "Not My Responsibility" },
                { "text": "Choosing how I respond to conflict", "correctCategory": "My Responsibility" },
                { "text": "Fixing their problems for them", "correctCategory": "Not My Responsibility" }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m11-l5-a3",
            "type": "open_response",
            "title": "Your Over-Functioning Audit",
            "instruction": "Identify one area where you chronically over-function. What would it look like to step back — not in anger, but with clarity and compassion?",
            "content": {
              "prompt": "Where do you over-function? What are you afraid would happen if you stopped? What would 'staying in your lane' look like here?",
              "placeholder": "I tend to over-function when it comes to…",
              "minWords": 30
            },
            "tip": "Lerner: 'We cannot make another person change his or her steps to an old dance, but if we change our own steps, the dance no longer can continue in the same predictable pattern.'",
            "saveToVault": true
          }
        ]
      }
    ]
  }
  ,
  {
    "id": "module-12",
    "title": "Module 12: The Man's Guide — Understanding & Loving Her Better",
    "subtitle": "Science-backed secrets from the Love Lab for becoming the partner she needs.",
    "description": "Based on John Gottman's 40 years of relationship research, this module is designed specifically for men who want to understand what women truly want, master the skill of emotional attunement, fight smarter, and build lasting trust. Straight-talking, research-backed, and immediately actionable.",
    "icon": "lucide-shield",
    "estimatedMinutes": 75,
    "sources": ["The Man's Guide to Women — John Gottman, PhD, Julie Schwartz Gottman, PhD, Douglas Abrams & Rachel Carlton Abrams, MD"],
    "lessons": [
      {
        "id": "module-12-lesson-1",
        "title": "What Women Really Want: Trustworthiness",
        "description": "The #1 thing every woman is looking for — and it's not what most men think.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m12-l1-a1",
            "type": "carousel",
            "title": "The Hero vs. The Zero",
            "instruction": "Swipe through to understand the core research findings from 40 years of studying 3,000+ couples in Gottman's Love Lab.",
            "content": {
              "cards": [
                {
                  "title": "Trustworthiness Is #1",
                  "body": "The number one thing women look for in a man isn't abs, money, or looks. It's trustworthiness: being who you say you are and doing what you say you'll do. Reliability. Accountability. Showing up as yourself.",
                  "icon": "lucide-shield-check"
                },
                {
                  "title": "Her Two Complaints",
                  "body": "Women's top two complaints: 'He is never there for me' and 'There isn't enough intimacy and connection.' These women feel alone even when in a relationship.",
                  "icon": "lucide-heart-crack"
                },
                {
                  "title": "His Two Complaints",
                  "body": "Men's top two complaints: 'There's too much fighting' and 'There's not enough sex.' Here's the breakthrough — these are causally related to hers. Fix hers and yours get fixed automatically.",
                  "icon": "lucide-zap"
                },
                {
                  "title": "The Key Variable: You",
                  "body": "Research shows that what men do in a relationship is, by a large margin, the crucial factor that separates a great relationship from a failed one. You have the power to make or break it.",
                  "icon": "lucide-key"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m12-l1-a2",
            "type": "single_choice",
            "title": "Hero or Zero Self-Check",
            "instruction": "Be honest — which pattern sounds most like you right now?",
            "content": {
              "question": "When your partner is upset about something, what's your default response?",
              "options": [
                "I try to fix the problem immediately — offer solutions, suggest she look at it differently, or minimise it.",
                "I get defensive — I feel like she's attacking me so I counter-attack or shut down.",
                "I try to listen and understand what she's feeling before jumping to solutions.",
                "I check out — go on my phone, change the subject, or leave the room."
              ],
              "correctIndex": 2,
              "explanation": "Option 3 is the attunement response. The other three — fixing, defending, and withdrawing — are the most common patterns Gottman found in men whose relationships failed. The good news: attunement is a learnable skill."
            },
            "saveToVault": false
          },
          {
            "id": "m12-l1-a3",
            "type": "open_response",
            "title": "Your Trustworthiness Audit",
            "instruction": "Reflect honestly: In what ways are you showing up as trustworthy — and where are the gaps? Think about reliability, emotional availability, and consistency.",
            "content": {
              "prompt": "Consider: Do you follow through on what you say? Are you emotionally available when she needs you? Do you show up as your authentic self?",
              "placeholder": "The areas where I'm strong are… The areas where I could improve are…",
              "minWords": 25
            },
            "tip": "Gottman: 'Trustworthiness isn't just about fidelity. It's about being who you say you are and doing what you say you'll do.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-12-lesson-2",
        "title": "A-TT-U-N-E: The Skill That Changes Everything",
        "description": "Learn the five-step attunement framework that Gottman's research proved leads to less fighting and more intimacy.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m12-l2-a1",
            "type": "carousel",
            "title": "The A-TT-U-N-E Framework",
            "instruction": "Master this five-step process. It's the single most important relationship skill from 40 years of research.",
            "content": {
              "cards": [
                {
                  "title": "A — Attend",
                  "body": "Give undivided attention. Turn off the game, put away the phone. Show through your actions that you care about what she's saying. Even if it seems trivial to you, it's important to her — and it's a bid for connection. Attention equals affection.",
                  "icon": "lucide-eye"
                },
                {
                  "title": "TT — Turn Toward",
                  "body": "Physically turn toward her. Women equate intimacy with face-to-face, eye-to-eye conversation. Men feel connected side-by-side — but unless you're about to take down a buffalo together, turn toward her while you talk.",
                  "icon": "lucide-rotate-ccw"
                },
                {
                  "title": "U — Understand",
                  "body": "Ask questions. Don't offer solutions, don't distract, don't minimise, don't joke. Seek to understand WHY this matters to her. It's not about saying 'I understand' — it's about showing genuine interest.",
                  "icon": "lucide-search"
                },
                {
                  "title": "N — Nondefensively Listen",
                  "body": "Don't react, don't counter-attack, don't justify. Any feeling is fact to the person feeling it. You have two ears and one mouth — use them in that ratio. Men who could calm themselves down had the great relationships.",
                  "icon": "lucide-ear"
                },
                {
                  "title": "E — Empathise",
                  "body": "Understanding is intellectual. Empathy is emotional. Try to FEEL how she feels. Let her know her feelings make sense. The emotional brain calms down when it feels connected and not alone. Show compassion — it's not about being right.",
                  "icon": "lucide-heart-handshake"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m12-l2-a2",
            "type": "comparison",
            "title": "Zero vs. Hero Responses",
            "instruction": "Compare these two approaches. Notice how the Hero response uses ATTUNE while the Zero response shuts down connection.",
            "content": {
              "pairs": [
                {
                  "left": { "label": "Zero", "text": "'You're overreacting. It's not that big a deal. Just let it go.'" },
                  "right": { "label": "Hero", "text": "'That sounds really frustrating. Tell me more about what happened. I want to understand why this is upsetting you.'" }
                },
                {
                  "left": { "label": "Zero", "text": "'Well maybe if you hadn't done X, Y wouldn't have happened. Here's what you should do…'" },
                  "right": { "label": "Hero", "text": "'I can see you're really hurt by this. What do you need from me right now? I'm here.'" }
                },
                {
                  "left": { "label": "Zero", "text": "*Keeps eyes on phone* 'Uh-huh. Yeah. That sucks.'" },
                  "right": { "label": "Hero", "text": "*Puts phone down, turns toward her, makes eye contact* 'Hey — I can see something's bothering you. Talk to me.'" }
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m12-l2-a3",
            "type": "open_response",
            "title": "Your ATTUNE Practice",
            "instruction": "Think of a recent moment where your partner was upset and you didn't attune well. Rewrite how you could have responded using A-TT-U-N-E.",
            "content": {
              "prompt": "Describe the situation, what you actually did, and what an ATTUNE response would have looked like.",
              "placeholder": "The situation was… What I did was… Using ATTUNE, I could have…",
              "minWords": 30
            },
            "tip": "Gottman: 'Listening is sexier than talking. Asking questions is sexier than broadcasting. Being genuinely interested IN HER is much more important than trying to be interesting TO HER.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-12-lesson-3",
        "title": "Understanding Her Brain & Her Emotions",
        "description": "Why she experiences emotions differently — and why that's an opportunity, not a problem.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m12-l3-a1",
            "type": "carousel",
            "title": "The Hopscotch Lesson",
            "instruction": "This story from the book perfectly illustrates the fundamental difference between how men and women relate to emotions.",
            "content": {
              "cards": [
                {
                  "title": "The Boys' Game",
                  "body": "When 8-year-old Brian cries because he never gets the ball, Gabe stops the game, gives Brian the ball, and play resumes. Problem solved. Emotions dispensed with. For boys, emotions are an interruption to the fun — like an unwelcome leech.",
                  "icon": "lucide-trophy"
                },
                {
                  "title": "The Girls' Game",
                  "body": "When Kathy cries during hopscotch, Lisa asks why. They talk about their friendship, plan a sleepover, decide to marry brothers. The game is forgotten — because the game was never the point. Emotions ARE the intimacy.",
                  "icon": "lucide-heart"
                },
                {
                  "title": "The Insight for Men",
                  "body": "When you ask 'What is she trying to accomplish by being emotional?' — that's a hopelessly male question. For women, there is no POINT to emotions. They just are. They're opportunities for connection. Stop trying to fix them.",
                  "icon": "lucide-lightbulb"
                },
                {
                  "title": "Fear Is Different Too",
                  "body": "When startled, men feel anger. Women feel fear. And women are more easily fear-conditioned — one bad experience creates future fear. Your touch (when she's happy with you) can shut down her brain's fear response entirely. Hold her hand.",
                  "icon": "lucide-hand-metal"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m12-l3-a2",
            "type": "true_false",
            "title": "Myths vs. Research",
            "instruction": "Test your assumptions against what Gottman's Love Lab actually found.",
            "content": {
              "statements": [
                { "text": "Talking about negative emotions makes them worse.", "answer": false },
                { "text": "For women, there are no truly 'negative' emotions — all emotions are natural.", "answer": true },
                { "text": "The best thing to do when she's upset is give her space and let her calm down.", "answer": false },
                { "text": "Holding her hand when she's afraid can literally shut down the fear response in her brain.", "answer": true },
                { "text": "Men and women have the same startle response but different emotional reactions to it.", "answer": true },
                { "text": "Trying to fix her problem is the fastest way to help her feel better.", "answer": false }
              ],
              "explanation": "The research is clear: emotions are opportunities for intimacy, not problems to solve. When you attune instead of fix, she feels safe — and that changes everything."
            },
            "saveToVault": false
          },
          {
            "id": "m12-l3-a3",
            "type": "open_response",
            "title": "Reframing Emotions",
            "instruction": "Think about a time her emotions made you uncomfortable or frustrated. How could you see that moment as an opportunity for connection instead of a problem to solve?",
            "content": {
              "prompt": "Describe the moment, what you felt, and how you could reframe it using the hopscotch insight.",
              "placeholder": "She was emotional about… I felt… If I saw it as an opportunity for connection, I would have…",
              "minWords": 25
            },
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-12-lesson-4",
        "title": "Learn to Fight Like a Hero",
        "description": "The Four Horsemen that destroy relationships — and their research-proven antidotes.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m12-l4-a1",
            "type": "carousel",
            "title": "The Four Horsemen of the Apocalypse",
            "instruction": "Gottman can predict divorce with 94% accuracy by looking for these four toxic patterns. Learn them — and their antidotes.",
            "content": {
              "cards": [
                {
                  "title": "1. Criticism → Gentle Start-Up",
                  "body": "Criticism attacks her character: 'You ALWAYS…' 'You NEVER…' The antidote is a gentle start-up: Talk about YOUR feelings and YOUR needs. 'I feel X when Y happens. I need Z.'",
                  "icon": "lucide-message-circle"
                },
                {
                  "title": "2. Contempt → Appreciation",
                  "body": "Contempt is the #1 predictor of divorce: eye-rolling, sarcasm, mocking, name-calling. It communicates disgust. The antidote is building a culture of appreciation — expressing what you admire and respect about her, daily.",
                  "icon": "lucide-sparkles"
                },
                {
                  "title": "3. Defensiveness → Ownership",
                  "body": "Defensiveness says 'the problem isn't me, it's you.' It escalates every conflict. The antidote is accepting responsibility for even a small part of the problem: 'You're right, I could have handled that better.'",
                  "icon": "lucide-shield"
                },
                {
                  "title": "4. Stonewalling → Self-Soothing",
                  "body": "Stonewalling is shutting down, checking out, going silent. It happens when you're physiologically flooded. The antidote: say 'I need 20 minutes to calm down, and then I'll come back to this conversation.' Then actually come back.",
                  "icon": "lucide-pause"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m12-l4-a2",
            "type": "sort",
            "title": "Horseman or Antidote?",
            "instruction": "Drag each statement into the correct category.",
            "content": {
              "categories": ["Horseman (Toxic)", "Antidote (Healthy)"],
              "items": [
                { "text": "'You never listen to me. You're so selfish.'", "correctCategory": "Horseman (Toxic)" },
                { "text": "'I feel unheard when I'm talking and you're on your phone. Can we put devices away during dinner?'", "correctCategory": "Antidote (Healthy)" },
                { "text": "*Rolls eyes* 'Oh yeah, GREAT idea.'", "correctCategory": "Horseman (Toxic)" },
                { "text": "'I really appreciate how hard you work. I noticed you did the dishes — thank you.'", "correctCategory": "Antidote (Healthy)" },
                { "text": "'That's not MY fault. YOU'RE the one who forgot.'", "correctCategory": "Horseman (Toxic)" },
                { "text": "'You're right, I dropped the ball on that. I'm sorry.'", "correctCategory": "Antidote (Healthy)" },
                { "text": "*Goes silent, walks out of room, refuses to engage*", "correctCategory": "Horseman (Toxic)" },
                { "text": "'I'm getting flooded. I need 20 minutes to cool down, then let's talk.'", "correctCategory": "Antidote (Healthy)" }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m12-l4-a3",
            "type": "open_response",
            "title": "Your Horseman Confession",
            "instruction": "Which of the Four Horsemen do you use most? Describe a recent example and write the antidote version of what you could have said instead.",
            "content": {
              "prompt": "Be honest: Which horseman is your go-to? Describe a recent situation and rewrite your response using the antidote.",
              "placeholder": "My default horseman is… A recent example was… The antidote response would be…",
              "minWords": 30
            },
            "tip": "Gottman: 'The masters of relationships scan for what's right and express appreciation. The disasters scan for what's wrong and express criticism.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-12-lesson-5",
        "title": "Being Her Hero for a Lifetime",
        "description": "The daily habits and mindset shifts that separate men in thriving relationships from those who end up alone.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m12-l5-a1",
            "type": "carousel",
            "title": "The 5:1 Magic Ratio",
            "instruction": "Learn the daily habits that Gottman's research found in every happy, lasting relationship.",
            "content": {
              "cards": [
                {
                  "title": "5 to 1",
                  "body": "Happy couples have 5 positive interactions for every 1 negative interaction. Unhappy couples are closer to 1:1. Every day, you're making deposits or withdrawals from the emotional bank account. Make sure you're net positive.",
                  "icon": "lucide-scale"
                },
                {
                  "title": "Turn Toward, Not Away",
                  "body": "Throughout the day, she makes small bids for connection: 'Look at this,' 'How was your day?', a touch on the arm. Masters turn toward these bids 86% of the time. Disasters turn toward only 33%. These micro-moments build or erode trust.",
                  "icon": "lucide-hand-helping"
                },
                {
                  "title": "Know Her World",
                  "body": "Masters know their partner's inner world: her dreams, her worries, her favourite things, her stressors. They update this knowledge constantly. Ask about her day — and actually remember the details.",
                  "icon": "lucide-globe"
                },
                {
                  "title": "Admiration Is Daily",
                  "body": "Men in great relationships express admiration, fondness, and appreciation every single day. Not grand gestures — small, specific, genuine ones. 'I love how you handled that.' 'You looked beautiful today.' 'I'm proud of you.'",
                  "icon": "lucide-star"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m12-l5-a2",
            "type": "true_false",
            "title": "Relationship Myths vs. Reality",
            "instruction": "Test what you think you know against what the research actually shows.",
            "content": {
              "statements": [
                { "text": "Happy couples never fight.", "answer": false },
                { "text": "Married men have more and better sex than single men.", "answer": true },
                { "text": "Grand romantic gestures matter more than daily small ones.", "answer": false },
                { "text": "Men in happy relationships live longer and earn more money.", "answer": true },
                { "text": "If you have to 'work at' a relationship, it means it's not right.", "answer": false },
                { "text": "The way a conflict STARTS predicts how it will END 96% of the time.", "answer": true }
              ],
              "explanation": "The research is unequivocal: relationships require consistent, daily investment. The payoff — in health, wealth, sex, and happiness — is enormous."
            },
            "saveToVault": false
          },
          {
            "id": "m12-l5-a3",
            "type": "open_response",
            "title": "Your Hero Action Plan",
            "instruction": "Based on everything in this module, identify 3 specific, actionable things you commit to doing differently starting this week.",
            "content": {
              "prompt": "Think about: attunement, the Four Horsemen, the 5:1 ratio, turning toward bids, and daily appreciation. What will you change?",
              "placeholder": "1. I will… 2. I will… 3. I will…",
              "minWords": 30
            },
            "tip": "Gottman: 'Men, you have the power to make or break a relationship. The bar stools of the world are filled with lonely men sitting in the rubble of their failed one-liners. We don't want that fate for you.'",
            "saveToVault": true
          }
        ]
      }
    ]
  }
  ,
  {
    "id": "module-13",
    "title": "Module 13: This Is How Your Marriage Ends — A Wake-Up Call",
    "subtitle": "The everyday behaviours silently destroying your relationship — and how to stop them before it's too late.",
    "description": "Based on Matthew Fray's brutally honest account of how his marriage ended, this module is a wake-up call for couples who think everything is 'fine.' You'll learn how good people accidentally become bad partners, discover the Invalidation Triple Threat that kills relationships, and build the awareness to stop the slow bleed of 10,000 paper cuts before it's too late.",
    "icon": "lucide-alert-triangle",
    "estimatedMinutes": 75,
    "sources": ["This Is How Your Marriage Ends — Matthew Fray"],
    "lessons": [
      {
        "id": "module-13-lesson-1",
        "title": "Death by a Thousand Paper Cuts",
        "description": "How marriages don't end with a bang — they bleed out slowly from everyday moments you think don't matter.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m13-l1-a1",
            "type": "carousel",
            "title": "The Uncomfortable Truth",
            "instruction": "Swipe through to understand why marriages really end — and why most people never see it coming.",
            "content": {
              "cards": [
                {
                  "title": "The Statistics",
                  "body": "In the US alone, there are ~6,200 marriages per day and ~3,000 divorces per day. Divorce is the #2 most stressful life event — ahead of prison, death of a parent, or losing a limb. Second marriages fail 67% of the time. We're not learning from our mistakes.",
                  "icon": "lucide-trending-down"
                },
                {
                  "title": "Not With a Bang",
                  "body": "Love doesn't die in a loud, dramatic way. It bleeds out from 10,000 paper cuts. Quietly. Slowly. She knew something was wrong. He insisted everything was fine. This is how your marriage ends.",
                  "icon": "lucide-scissors"
                },
                {
                  "title": "The Fish Sandwich",
                  "body": "A man eats a fish sandwich despite agreeing to be vegan with his wife. He thinks she's 'overreacting about a sandwich.' But it was never about the sandwich — it was about broken promises, eroded trust, and feeling like she doesn't matter enough to keep a commitment.",
                  "icon": "lucide-fish"
                },
                {
                  "title": "It's Never About the Thing",
                  "body": "The glass left by the sink. The forgotten anniversary. The fish sandwich. These aren't petty complaints — they're symbols of whether your partner considers you in their daily decisions. Each 'small' thing is a vote for or against the relationship.",
                  "icon": "lucide-glass-water"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m13-l1-a2",
            "type": "single_choice",
            "title": "The Wake-Up Check",
            "instruction": "Be honest with yourself about where your relationship stands right now.",
            "content": {
              "question": "When your partner raises a concern about something you did (or didn't do), what's your most common internal reaction?",
              "options": [
                "'Here we go again — they're overreacting about nothing.'",
                "'I'm a good person. I don't deserve to be criticised like this.'",
                "'I didn't mean to hurt them, so they shouldn't be hurt.'",
                "'Something I'm doing is causing them pain. I need to understand what and why.'"
              ],
              "correctIndex": 3,
              "explanation": "The first three responses are exactly the thought patterns Matthew Fray describes having throughout his marriage — the ones that ended it. Only the fourth response creates the possibility of change. Most of us default to the first three without realising it."
            },
            "saveToVault": false
          },
          {
            "id": "m13-l1-a3",
            "type": "open_response",
            "title": "Your Paper Cuts",
            "instruction": "Think about the 'small things' your partner has raised with you that you dismissed as unimportant. List at least three. Then ask yourself: What was your partner really trying to tell you?",
            "content": {
              "prompt": "What are the 'fish sandwiches' in your relationship — the things your partner complains about that you think don't matter? What might they actually be about?",
              "placeholder": "The things my partner raises that I tend to dismiss are… What they might really be saying is…",
              "minWords": 30
            },
            "tip": "Fray: 'Hundreds, maybe thousands of times, my wife tried to communicate that something was wrong. That something hurt. But that doesn't make sense, I thought. I'm not trying to hurt her; therefore, she shouldn't feel hurt.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-13-lesson-2",
        "title": "Good People Can Be Bad Partners",
        "description": "Why being a 'good person' doesn't automatically make you a good spouse — and why this distinction destroys marriages.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m13-l2-a1",
            "type": "carousel",
            "title": "The Good Person Trap",
            "instruction": "This is the mindset that ends most marriages — and the people trapped in it have no idea.",
            "content": {
              "cards": [
                {
                  "title": "The Fatal Logic",
                  "body": "'Because I'm a good person who loves my wife, who would never harm her intentionally, I must be a good husband!' This logic is as absurd as saying your grandmother should pilot a race car because she's the sweetest person alive.",
                  "icon": "lucide-brain"
                },
                {
                  "title": "Skill vs. Character",
                  "body": "Being a good partner requires SKILL — study and practice — just like any other craft. Yet we never think of relationships as something to develop mastery in. We just wing it and hope love carries us through.",
                  "icon": "lucide-wrench"
                },
                {
                  "title": "The Shitty Omelette",
                  "body": "Imagine making a terrible omelette in cooking school and defending it by saying you're a nice person who supports charities. That's what it sounds like when you tell your partner you can't be hurting them because you're 'a good guy.'",
                  "icon": "lucide-egg"
                },
                {
                  "title": "Intent ≠ Impact",
                  "body": "You didn't MEAN to hurt them. That's probably true. But they're still hurt. And insisting that they shouldn't be — because you didn't intend it — is like stepping on someone's foot and arguing they shouldn't feel pain because you didn't do it on purpose.",
                  "icon": "lucide-footprints"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m13-l2-a2",
            "type": "true_false",
            "title": "Intent vs. Impact",
            "instruction": "Answer honestly based on YOUR actual behaviour in your relationship.",
            "content": {
              "statements": [
                { "text": "I've told my partner they 'shouldn't feel that way' about something I did.", "answer": null },
                { "text": "I've defended my actions by pointing out that I'm 'not as bad as' other people's partners.", "answer": null },
                { "text": "I've compared my partner's reaction to how I would react in the same situation and concluded they're overreacting.", "answer": null },
                { "text": "I've dismissed a complaint because I believe my intentions were good.", "answer": null },
                { "text": "I've told my partner I 'didn't mean it that way' as if that should end the conversation.", "answer": null },
                { "text": "I've felt that my partner should be more grateful for the things I DO right instead of focusing on what I get wrong.", "answer": null }
              ],
              "explanation": "Each 'true' represents an instance where you may have invalidated your partner's experience. Fray did all of these — constantly — and each one was a paper cut that slowly bled his marriage to death. Awareness is the first step."
            },
            "saveToVault": false
          },
          {
            "id": "m13-l2-a3",
            "type": "open_response",
            "title": "Your Honest Self-Assessment",
            "instruction": "Fray writes: 'I got most of it wrong. Relationship stuff. Marriage. I was terrible but had no idea I was terrible as life was happening.' Can you relate? Where might you be getting it wrong without realising it?",
            "content": {
              "prompt": "Write honestly about the gap between the partner you think you are and the partner your spouse might say you are. What would they say if they could speak freely without you getting defensive?",
              "placeholder": "I think I'm a good partner because… But if my partner could speak freely, they might say…",
              "minWords": 30
            },
            "tip": "Fray: 'I never felt more unappreciated or more unfairly treated than the times my wife would communicate some new way in which I had disappointed her. It always seemed as if the punishment didn't fit the crime.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-13-lesson-3",
        "title": "The Invalidation Triple Threat",
        "description": "The #1 marriage killer hiding in your everyday conversations — and you probably do it multiple times per week.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m13-l3-a1",
            "type": "carousel",
            "title": "The Three Ways You Invalidate Your Partner",
            "instruction": "Fray calls this the world's leading cause of relationship failure. Learn to recognise all three forms.",
            "content": {
              "cards": [
                {
                  "title": "#1: Their Thoughts Are Wrong",
                  "body": "Your partner tells you something hurt them. Your response: 'That doesn't make sense. You're wrong to think that.' You correct their interpretation of reality instead of acknowledging their experience. You become the judge of whether their pain is legitimate.",
                  "icon": "lucide-x-circle"
                },
                {
                  "title": "#2: Their Feelings Are Wrong",
                  "body": "Your partner expresses pain. Your response: 'You shouldn't feel that way. I didn't mean it, so you shouldn't be hurt.' You tell them their emotional response is incorrect — as if feelings need your approval to exist.",
                  "icon": "lucide-heart-off"
                },
                {
                  "title": "#3: Their Character Is Wrong",
                  "body": "Your partner persists because they still feel unheard. Your response: 'You're too sensitive. You're always overreacting. You're crazy.' Now you've attacked WHO THEY ARE as a person — the most damaging invalidation of all.",
                  "icon": "lucide-user-x"
                },
                {
                  "title": "The Result: Death Spiral",
                  "body": "Each round of invalidation erodes trust. Your partner stops bringing things up. The silence isn't peace — it's surrender. They've concluded you'll never hear them. They start planning their exit. By the time you notice, it's usually too late.",
                  "icon": "lucide-spiral"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m13-l3-a2",
            "type": "sort",
            "title": "Invalidation or Validation?",
            "instruction": "Drag each response into the correct category.",
            "content": {
              "categories": ["Invalidation (Toxic)", "Validation (Healthy)"],
              "items": [
                { "text": "'You're making a big deal out of nothing.'", "correctCategory": "Invalidation (Toxic)" },
                { "text": "'I can see this really upset you. Help me understand.'", "correctCategory": "Validation (Healthy)" },
                { "text": "'I didn't mean it that way, so you shouldn't be hurt.'", "correctCategory": "Invalidation (Toxic)" },
                { "text": "'I hear you. Even though I didn't intend to hurt you, I can see that I did.'", "correctCategory": "Validation (Healthy)" },
                { "text": "'You're always so sensitive about everything.'", "correctCategory": "Invalidation (Toxic)" },
                { "text": "'Your feelings matter to me, even when I don't fully understand them.'", "correctCategory": "Validation (Healthy)" },
                { "text": "'That's not what happened. You're remembering it wrong.'", "correctCategory": "Invalidation (Toxic)" },
                { "text": "'We might see this differently, but I want to understand your experience of it.'", "correctCategory": "Validation (Healthy)" }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m13-l3-a3",
            "type": "open_response",
            "title": "Your Invalidation Patterns",
            "instruction": "Think about your last few disagreements. Which of the three invalidation responses do you default to? Give a specific example and rewrite it as a validating response.",
            "content": {
              "prompt": "Which invalidation type is your go-to: dismissing their thoughts, their feelings, or their character? Describe a recent example and rewrite your response.",
              "placeholder": "My default invalidation is… A recent example was when… A validating response would be…",
              "minWords": 30
            },
            "tip": "Fray: 'The Invalidation Triple Threat erodes trust every time it occurs. It disguises itself as harmless disagreement that's nothing to worry about. So it continues unabated, sneakily eroding trust one paper cut at a time until no trust is left.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-13-lesson-4",
        "title": "She Feels Like Your Mum (And She Doesn't Want To)",
        "description": "How the mental load and emotional labour imbalance turns your partner into a parent — and kills desire.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m13-l4-a1",
            "type": "carousel",
            "title": "The Partnership Imbalance",
            "instruction": "Understand how one partner often becomes the household manager by default — and why it destroys intimacy.",
            "content": {
              "cards": [
                {
                  "title": "The Mental Load",
                  "body": "One partner (usually her) carries the invisible burden of remembering, planning, organising, and managing everything: doctor's appointments, school events, grocery lists, birthday presents, holiday plans. The other partner 'helps' when asked — but never initiates.",
                  "icon": "lucide-brain"
                },
                {
                  "title": "'Just Ask Me!'",
                  "body": "Saying 'just tell me what to do and I'll do it' sounds helpful but IS the problem. It means she has to manage YOU on top of everything else. She doesn't want an employee — she wants a partner who sees what needs doing and does it.",
                  "icon": "lucide-hand-helping"
                },
                {
                  "title": "The Desire Killer",
                  "body": "Nobody wants to have sex with someone they have to parent. When she's managing your calendar, reminding you about your mum's birthday, and picking up after you — she doesn't feel like your lover. She feels like your mother. And that kills desire dead.",
                  "icon": "lucide-heart-crack"
                },
                {
                  "title": "The Fix",
                  "body": "Notice what needs to be done — and do it. Don't wait to be asked. Take full ownership of household domains (not just 'helping'). Show her you're a competent adult who can manage life alongside her, not someone she has to supervise.",
                  "icon": "lucide-check-check"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m13-l4-a2",
            "type": "true_false",
            "title": "Mental Load Audit",
            "instruction": "Answer honestly for your relationship.",
            "content": {
              "statements": [
                { "text": "I know when the next doctor/dentist appointment is for everyone in the household.", "answer": null },
                { "text": "I wait for my partner to tell me what needs to be done around the house.", "answer": null },
                { "text": "I know what's running low in the fridge/pantry without being told.", "answer": null },
                { "text": "My partner manages the social calendar (family events, kids' activities, etc.).", "answer": null },
                { "text": "I've said 'just tell me what you need help with' in the last month.", "answer": null },
                { "text": "I take full ownership of at least one household domain (meals, laundry, finances, etc.) without reminders.", "answer": null }
              ],
              "explanation": "If your partner manages most of the invisible household work, they're carrying the mental load. And every time you say 'just ask me,' you're adding to it — because now they also have to manage you."
            },
            "saveToVault": false
          },
          {
            "id": "m13-l4-a3",
            "type": "open_response",
            "title": "Becoming a True Partner",
            "instruction": "Identify three areas where your partner carries the mental load that you could take full ownership of — not 'help with' but OWN completely.",
            "content": {
              "prompt": "What invisible work does your partner do that you've never even noticed? What can you fully own starting this week?",
              "placeholder": "Three things my partner manages that I could take ownership of are…",
              "minWords": 25
            },
            "tip": "Fray: 'She doesn't want you to 'help.' She wants you to be an equal partner who sees what needs doing and does it without being managed.'",
            "saveToVault": true
          }
        ]
      },
      {
        "id": "module-13-lesson-5",
        "title": "The Art of Getting to Tomorrow",
        "description": "Moving from awareness to action — committing to do the daily work that keeps your relationship alive.",
        "estimatedMinutes": 15,
        "activities": [
          {
            "id": "m13-l5-a1",
            "type": "carousel",
            "title": "What Matters vs. What Doesn't",
            "instruction": "Strip away the noise and focus on the core behaviours that determine whether your relationship survives.",
            "content": {
              "cards": [
                {
                  "title": "Trust Is Everything",
                  "body": "Trust isn't just about fidelity. It's built or destroyed in every small moment: Do you consider her in your decisions? Do you follow through? Do you show up emotionally? Every day is a vote for or against your relationship.",
                  "icon": "lucide-shield-check"
                },
                {
                  "title": "Validate, Don't Fix",
                  "body": "When your partner is hurting, they don't need your solution. They need to know you HEAR them, you BELIEVE them, and their pain MATTERS to you. Validation isn't agreement — it's acknowledgment that their experience is real.",
                  "icon": "lucide-ear"
                },
                {
                  "title": "Choose Discomfort Over Disconnection",
                  "body": "The uncomfortable conversation you're avoiding right now is the one that could save your relationship. Silence feels peaceful but it's actually the sound of your partner giving up on being heard.",
                  "icon": "lucide-message-square-warning"
                },
                {
                  "title": "It's Not Too Late (Yet)",
                  "body": "If you're reading this and recognising yourself in these patterns, that's the wake-up call Fray wishes he'd had. Awareness is the first step. But awareness without action is just guilt with extra steps. Choose to do something different — today.",
                  "icon": "lucide-sunrise"
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m13-l5-a2",
            "type": "comparison",
            "title": "The Marriage That Ends vs. The Marriage That Lasts",
            "instruction": "Compare the daily reality of relationships heading toward failure versus those that thrive.",
            "content": {
              "pairs": [
                {
                  "left": { "label": "Ending", "text": "'Everything is fine' (while she cries in the bathroom)" },
                  "right": { "label": "Lasting", "text": "'Something seems off. Can we talk about it?'" }
                },
                {
                  "left": { "label": "Ending", "text": "'I didn't mean to hurt you, so you shouldn't be hurt'" },
                  "right": { "label": "Lasting", "text": "'I hear that I hurt you. I'm sorry. How can I do better?'" }
                },
                {
                  "left": { "label": "Ending", "text": "'She's always overreacting about little things'" },
                  "right": { "label": "Lasting", "text": "'She keeps raising this — maybe it's more important than I think'" }
                },
                {
                  "left": { "label": "Ending", "text": "'I'm a good person, so I must be a good partner'" },
                  "right": { "label": "Lasting", "text": "'Being a good partner is a skill I need to keep developing'" }
                }
              ]
            },
            "saveToVault": false
          },
          {
            "id": "m13-l5-a3",
            "type": "open_response",
            "title": "Your Letter to Your Partner",
            "instruction": "Write a letter to your partner (you can share it or keep it private) acknowledging what you've learned in this module. What patterns do you recognise? What do you commit to changing?",
            "content": {
              "prompt": "Be vulnerable. Be specific. Name the patterns you see in yourself. Acknowledge the pain you may have caused without intending to. State what you commit to doing differently.",
              "placeholder": "Dear [partner], after going through this module I realise that…",
              "minWords": 50
            },
            "tip": "Fray: 'We bled out from 10,000 paper cuts. Quietly. Slowly. She knew something was wrong. I insisted everything was fine. This is how your marriage ends. But it doesn't have to be.'",
            "saveToVault": true
          }
        ]
      }
    ]
  }
];
