// age-0-2-handbook.ts
// A parent’s reference handbook for the first two years.
// All reflections are optional – use what you need, leave what you don’t.
// Sleep schedules are imported from your existing BABY_SLEEP_SCHEDULES.

import type { CourseModule, CourseLesson, CourseActivity } from "@/data/connect-course";
import { BABY_SLEEP_SCHEDULES } from "./parenting-course"; // adjust path as needed

export const AGE_0_2_HANDBOOK: CourseModule[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 1: YOUR BABY’S BRAIN & YOUR HEART
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "handbook-0-2-m1",
    title: "Your Baby’s Brain & Your Heart",
    subtitle: "How everyday moments build a lifetime of security",
    description: "In the first two years, your baby’s brain makes 1 million new connections every second. You don’t need special toys – your face, your voice, and your loving presence are already the most powerful tools.",
    estimatedMinutes: 0, // handbook – no time pressure
    sources: ["Infant Neuroscience", "Attachment Theory"],
    lessons: [
      {
        id: "handbook-0-2-m1-l1",
        title: "Serve & return: the simplest superpower",
        description: "Why looking, babbling, and reaching back to you is the most important brain‑building activity",
        activities: [
          {
            id: "h02-m1-l1-ref1",
            type: "info_carousel",
            title: "What is serve and return?",
            content: {
              slides: [
                {
                  heading: "The science in plain words",
                  body: "Your baby 'serves' – a look, a coo, a reach. You 'return' – eye contact, a gentle word, a touch. That back‑and‑forth wires the brain for language, emotional regulation, and security. It doesn't need to be perfect; just consistent."
                },
                {
                  heading: "The 'still face' study",
                  body: "When a parent goes blank and unresponsive for just two minutes, babies first try harder to engage, then become distressed, then turn inward. When responsiveness returns, they recover quickly. You don't have to be 'on' all the time – but your presence is medicine."
                },
                {
                  heading: "Everyday moments count",
                  body: "Nappy changes, feeding, bath time – these are serve‑and‑return goldmines. Put the phone down. Look into their eyes. Hum. Describe what you're doing. You're building a human, one interaction at a time."
                }
              ]
            }
          },
          {
            id: "h02-m1-l1-ref2",
            type: "flip_card",
            title: "Brain‑building truths",
            instruction: "Flip each card to replace worry with wonder (no need to remember – just read when you need a reminder).",
            content: {
              cards: [
                { front: "The 'enrichment' myth", back: "Forget expensive flashcards and 'educational' videos. The best brain‑builder is your face, your voice, and your responsiveness. Real conversation (not baby‑talk shows) and safe exploration are what work.", emoji: "💡", tag: "Fact" },
                { front: "Neural pruning", back: "Babies are born with more connections than they’ll ever need. The brain strengthens pathways that are used and prunes unused ones. Your everyday interactions literally shape which brain circuits survive.", emoji: "✂️", tag: "Fact" },
                { front: "Co‑regulation", back: "When you stay calm during your baby’s distress, your nervous system helps theirs settle. This is how emotional regulation is first transmitted – and later internalised. Your calm presence is the tool.", emoji: "🌊", tag: "Fact" },
                { front: "Repair over perfection", back: "You won’t get it right every time. What matters is the pattern of repair. When you lose your temper and then reconnect, you teach resilience. Good enough is genuinely enough.", emoji: "🔧", tag: "Fact" }
              ]
            }
          },
          {
            id: "h02-m1-l1-prompt",
            type: "open_response",
            title: "Optional reflection",
            content: {
              prompt: "Think about one small moment today when you felt truly connected to your baby. What was happening? (No need to write much – just notice it.)",
              saveToVault: true
            }
          }
        ]
      },
      {
        id: "handbook-0-2-m1-l2",
        title: "Developmental leaps (Wonder Weeks)",
        description: "Why your baby suddenly becomes clingy, cranky, and wakes more often – and why it's a good thing",
        activities: [
          {
            id: "h02-m1-l2-ref1",
            type: "info_carousel",
            title: "Leaps, not regressions",
            content: {
              slides: [
                {
                  heading: "What is a leap?",
                  body: "Predictable 'stormy periods' when a baby's brain reorganises. During a leap, babies often: become clingy, cry more, wake frequently, feed constantly, and seem to 'forget' skills. This is NOT regression – it's advancement. A new ability appears after the storm."
                },
                {
                  heading: "The first 5 leaps (0‑6 months)",
                  body: "Leap 1 (~5 weeks): notices changing sensations. Leap 2 (~8 weeks): recognises patterns. Leap 3 (~12 weeks): smooth transitions. Leap 4 (~19 weeks): events and sequences. Leap 5 (~26 weeks): relationships, distance, depth. Knowing the timing doesn't prevent the fussiness, but it stops you from thinking you're doing something wrong."
                },
                {
                  heading: "What helps during a leap",
                  body: "More skin contact and holding (you cannot spoil a baby in a leap). Extra nursing/bottle – sucking is soothing. Simplify the environment; less stimulation, more comfort. Name what's happening: 'You're learning so much – this is hard work for your brain.' Trust that the storm passes, usually within days to a couple of weeks."
                }
              ]
            }
          },
          {
            id: "h02-m1-l2-ref2",
            type: "flip_card",
            title: "Leap survival kit",
            instruction: "Flip for quick reminders during the hard days.",
            content: {
              cards: [
                { front: "Clingy", back: "Your baby suddenly doesn't want to be put down. They need extra security during brain changes. Wear them, hold them, respond. It passes.", emoji: "🦥", tag: "Leap sign" },
                { front: "Cranky", back: "Fussier than usual, harder to console, more sensitive to noise and light. Lower your expectations. Simplify the day. Don't add new activities.", emoji: "😤", tag: "Leap sign" },
                { front: "Crying", back: "More frequent, harder to settle, often for no obvious reason. Check basic needs, then just be present. Sometimes nothing 'works' – and that's okay. You are still the safe place.", emoji: "😭", tag: "Leap sign" },
                { front: "You can't rush a leap", back: "You can't speed it up or skip it. You can only hold space. Remind yourself: 'This is not a problem to fix. This is development happening.'", emoji: "⏳", tag: "Mindset" }
              ]
            }
          }
        ]
      }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 2: SLEEP REFERENCE (WEEKLY SCHEDULES + SAFE SLEEP)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "handbook-0-2-m2",
    title: "Sleep Reference",
    subtitle: "Week‑by‑week schedules, safe sleep rules, and gentle settling options",
    description: "Newborn sleep is nothing like adult sleep – and that's normal. Use this section as a reference whenever you need a schedule or a safety reminder.",
    estimatedMinutes: 0,
    sources: ["Paediatric Sleep Science", "Safe Sleep Guidelines"],
    lessons: [
      {
        id: "handbook-0-2-m2-l1",
        title: "Weekly sleep & feed schedules (0‑6 months)",
        description: "Realistic routines from the BABY_SLEEP_SCHEDULES data – not a rigid timetable, but a helpful framework",
        activities: [
          {
            id: "h02-m2-l1-ref",
            type: "info_carousel", // or we could create a custom table component
            title: "Week‑by‑week at a glance",
            content: {
              slides: BABY_SLEEP_SCHEDULES.map(schedule => ({
                heading: schedule.weekLabel,
                body: `👶 ${schedule.ageRange}\n😴 Day sleep: ${schedule.totalDaySleep} • 🌙 Night sleep: ${schedule.totalNightSleep}\n📝 Key notes: ${schedule.keyNotes.join(" • ")}\n\nTap the "View detailed schedule" button below to see the full daily plan.`
              }))
            }
          },
          {
            id: "h02-m2-l1-details",
            type: "info_carousel", // placeholder – you could embed a schedule viewer
            title: "Detailed daily schedule",
            content: {
              slides: BABY_SLEEP_SCHEDULES.map(schedule => ({
                heading: `${schedule.weekLabel} – detailed`,
                body: schedule.schedule.map(row => `${row.time}: ${row.activity}${row.feedNote ? ` (${row.feedNote})` : ""}`).join("\n")
              }))
            }
          }
        ]
      },
      {
        id: "handbook-0-2-m2-l2",
        title: "Safe sleep checklist",
        description: "Print this or keep it on your phone – review whenever you need",
        activities: [
          {
            id: "h02-m2-l2-ref",
            type: "flip_card",
            title: "The ABCs of safe sleep",
            instruction: "Flip to check each rule – no answers required, just information.",
            content: {
              cards: [
                { front: "A – Alone", back: "Baby sleeps alone in their own cot or bassinet. No bed‑sharing (adult beds, sofas, armchairs are dangerous). Room‑sharing (baby's cot next to your bed) reduces SIDS risk by 50% and is recommended for the first 6‑12 months.", emoji: "🛌", tag: "Safe" },
                { front: "B – Back", back: "Always place baby on their BACK for every sleep – naps and nights. Once they can roll independently (around 5‑6 months), you can leave them in whatever position they move into. But always start on the back.", emoji: "⬆️", tag: "Safe" },
                { front: "C – Crib", back: "Use a firm, flat mattress with a fitted sheet only. No bumpers, pillows, loose blankets, stuffed toys, or positioners. Dress baby in a sleep sack or swaddle (stop swaddling when rolling begins).", emoji: "🛏️", tag: "Safe" },
                { front: "Temperature", back: "Room temperature 16‑20°C (61‑68°F). Overheating is a SIDS risk. Dress baby in one more layer than you'd wear. Check baby's chest (not hands/feet).", emoji: "🌡️", tag: "Safe" }
              ]
            }
          }
        ]
      },
      {
        id: "handbook-0-2-m2-l3",
        title: "Gentle settling methods (quick reference)",
        description: "Choose the approach that fits your baby's temperament and your comfort level",
        activities: [
          {
            id: "h02-m2-l3-ref",
            type: "flip_card",
            title: "Methods at a glance",
            instruction: "Flip to compare the three main gentle approaches.",
            content: {
              cards: [
                { front: "Gradual retreat (gentlest)", back: "Over 2‑3 weeks: pat/shush in cot → hand on chest → sit beside cot → near door → outside room. Best for sensitive babies or anxiety‑prone parents. Takes longer but very gentle.", emoji: "🐢", tag: "Method" },
                { front: "Pick up / put down (moderate)", back: "When baby cries, pick up and comfort until calm, then put back down awake. Repeat as many times as needed. Exhausting but effective within 3‑7 days. Best for babies 3‑6 months.", emoji: "🔄", tag: "Method" },
                { front: "Controlled settling (structured)", back: "Put baby down awake. Leave room. Return at increasing intervals (2 min, 4 min, 6 min) to briefly reassure (pat, shush) then leave again. Research shows NO harm to attachment when used at 6+ months.", emoji: "⏱️", tag: "Method" },
                { front: "Drowsy but awake", back: "Put baby down when they are sleepy but still conscious. This single principle underpins all methods and teaches self‑settling from the start of the sleep cycle.", emoji: "😴", tag: "Key principle" }
              ]
            }
          },
          {
            id: "h02-m2-l3-prompt",
            type: "open_response",
            title: "Optional reflection: your sleep philosophy",
            content: {
              prompt: "What matters most to you at bedtime – faster results, gentleness, or staying close to baby? There's no wrong answer. Write down what feels right for your family (or just think about it).",
              saveToVault: true
            }
          }
        ]
      }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 3: FEEDING REFERENCE – MILK & SOLIDS
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "handbook-0-2-m3",
    title: "Feeding Your Baby",
    subtitle: "Breast milk, formula, and solids – a guilt‑free reference",
    description: "Quick access to amounts, signs of readiness, and troubleshooting. No judgment, just evidence.",
    estimatedMinutes: 0,
    sources: ["Lactation Science", "Paediatric Nutrition", "Ellyn Satter"],
    lessons: [
      {
        id: "handbook-0-2-m3-l1",
        title: "Breastfeeding quick reference",
        description: "Latch checks, supply boosters, and normal patterns",
        activities: [
          {
            id: "h02-m3-l1-ref",
            type: "flip_card",
            title: "Breastfeeding at a glance",
            instruction: "Flip for common FAQs – keep this open when you need a reminder.",
            content: {
              cards: [
                { front: "Good latch signs", back: "Wide mouth covering areola (not just nipple), chin tucked into breast, nose clear, rhythmic swallowing. Pain beyond first 30 seconds = poor latch; break suction and try again.", emoji: "🤱", tag: "Latch" },
                { front: "Normal feeding frequency", back: "Newborns: 8‑12 times per 24 hours. As they grow, frequency often decreases but volume per feed increases. Feed on demand – don't watch the clock.", emoji: "⏰", tag: "Frequency" },
                { front: "Growth spurts", back: "Around 3 weeks, 6 weeks, 3 months – baby will want to feed constantly. This is NOT low supply. It's baby boosting your supply. Feed on demand, trust the process.", emoji: "📈", tag: "Normal" },
                { front: "One bottle a day (from week 2‑4)", back: "Introducing one bottle of expressed milk gives flexibility. To protect supply, express the same volume you give. Does NOT cause nipple confusion when done correctly.", emoji: "🍼", tag: "Flexibility" }
              ]
            }
          },
          {
            id: "h02-m3-l1-prompt",
            type: "open_response",
            title: "Optional: your feeding journey",
            content: {
              prompt: "What's going well with feeding right now? What's hard? (No need to solve anything – just noticing helps.)",
              saveToVault: true
            }
          }
        ]
      },
      {
        id: "handbook-0-2-m3-l2",
        title: "Bottle feeding (expressed milk or formula)",
        description: "Paced feeding amounts and techniques",
        activities: [
          {
            id: "h02-m3-l2-ref",
            type: "flip_card",
            title: "Bottle feeding basics",
            instruction: "Flip to review paced bottle feeding.",
            content: {
              cards: [
                { front: "Paced feeding position", back: "Hold baby semi‑upright (not lying flat). Hold bottle horizontal. Let baby draw the nipple in and control the pace. Never prop a bottle.", emoji: "🍼", tag: "Technique" },
                { front: "Pause and burp", back: "Pause every few minutes to burp. A full feed should take 15‑20 minutes – not 5 minutes of guzzling. Paced feeding prevents overfeeding and gas.", emoji: "💨", tag: "Technique" },
                { front: "Amount cheat sheet", back: "Guide: 150ml per kg of body weight per day, divided across feeds. Example: 4kg baby = 600ml/day ÷ 6 feeds = 100ml per feed. Adjust based on hunger/fullness cues.", emoji: "⚖️", tag: "Amounts" },
                { front: "Sterilising", back: "Sterilise bottles and teats until 12 months. After that, hot soapy water and thorough rinsing is sufficient if your water supply is clean.", emoji: "🧼", tag: "Hygiene" }
              ]
            }
          }
        ]
      },
      {
        id: "handbook-0-2-m3-l3",
        title: "Starting solids (around 6 months)",
        description: "Readiness signs, first foods, and the division of responsibility",
        activities: [
          {
            id: "h02-m3-l3-ref1",
            type: "info_carousel",
            title: "Is your baby ready?",
            content: {
              slides: [
                {
                  heading: "Three signs (all must be present)",
                  body: "1. Can sit with minimal support and hold head steady. 2. Tongue‑thrust reflex has faded (no longer automatically pushes food out). 3. Shows interest in food – reaches, watches intently. Most babies are ready around 6 months, not earlier."
                },
                {
                  heading: "First foods – iron priority",
                  body: "Iron stores deplete around 6 months. Offer iron‑rich foods twice daily: pureed red meat, legumes, iron‑fortified infant cereal. Then introduce single vegetables and fruits."
                },
                {
                  heading: "Allergens",
                  body: "Introduce common allergens early (around 6 months): peanut butter thinned with warm water, well‑cooked egg, dairy (yoghurt), wheat, fish. One at a time, 3‑5 days apart. If family history of severe allergy, discuss with paediatrician first."
                },
                {
                  heading: "Division of responsibility",
                  body: "YOUR job: decide WHAT, WHEN, WHERE. BABY'S job: decide WHETHER and HOW MUCH. Never force, bribe, or distract. Trust their appetite – babies are born with excellent self‑regulation."
                }
              ]
            }
          },
          {
            id: "h02-m3-l3-ref2",
            type: "flip_card",
            title: "Safety quick card",
            instruction: "Flip to review gagging vs choking and foods to avoid.",
            content: {
              cards: [
                { front: "Gagging vs choking", back: "Gagging: loud, red face, eyes watering – normal and protective. Let them work through it. Choking: silent, blue, ineffective breathing – learn infant first aid.", emoji: "🆘", tag: "Emergency" },
                { front: "Foods to avoid before 12 months", back: "Honey (botulism), whole cow's milk as main drink (ok in cooking), added salt, added sugar, whole nuts (choking risk), raw shellfish.", emoji: "🚫", tag: "Safety" },
                { front: "Textures by 9 months", back: "Research shows babies still on smooth purees at 9+ months are more likely to be picky eaters later. Introduce soft lumps and finger foods by 7‑9 months.", emoji: "🥑", tag: "Progression" },
                { front: "Milk remains primary", back: "Until 12 months, breast milk or formula is the PRIMARY nutrition source. Solids are for exploration and skill building. Offer solids about an hour after a milk feed initially.", emoji: "🍼", tag: "Balance" }
              ]
            }
          }
        ]
      }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 4: PARENT WELLBEING & PARTNERSHIP
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "handbook-0-2-m4",
    title: "Caring for Yourself",
    subtitle: "Postnatal depletion, baby blues, and the courage to ask for help",
    description: "You cannot pour from an empty cup. This section is permission to rest, ask for help, and recognise when you need more support.",
    estimatedMinutes: 0,
    sourceBooks: ["The Postnatal Depletion Cure – Dr Oscar Serrallach", "Daring Greatly – Brené Brown"],
    sources: ["Postnatal Psychology"],
    lessons: [
      {
        id: "handbook-0-2-m4-l1",
        title: "Your emotional thermometer",
        description: "Recognise your own stress levels before they boil over",
        activities: [
          {
            id: "h02-m4-l1-ref",
            type: "flip_card",
            title: "The four stages",
            instruction: "Flip to see the stages and what to do at each.",
            content: {
              cards: [
                { front: "Calm", body: "Feeling light, open, rolling with the chaos. Strategy: enjoy it, rest." },
                { front: "Frustrated", body: "Tension in arms/chest, impatient thoughts. Strategy: deep breath, sip water, ask for 5 minutes. Intervene here – before escalation.", emoji: "😤", tag: "Action" },
                { front: "Angry", body: "Breathing intensified, difficult to speak constructively. Strategy: stop talking, step away, splash cold water on wrists.", emoji: "😠", tag: "Action" },
                { front: "Explosive", body: "Heart pounding, physical urges, dizzying rage. Strategy: STOP. Put baby down safely (cot). Leave the room. Call a friend. This is emergency territory – you need support.", emoji: "💥", tag: "Emergency" }
              ]
            }
          },
          {
            id: "h02-m4-l1-prompt",
            type: "open_response",
            title: "Optional: your early warning signs",
            content: {
              prompt: "What does your body feel like when you're moving from Calm to Frustrated? (Clenched jaw? Fast breathing? Tense shoulders?) Naming your early signs helps you catch them sooner.",
              saveToVault: true
            }
          }
        ]
      },
      {
        id: "handbook-0-2-m4-l2",
        title: "Baby blues vs postnatal depression – when to seek help",
        description: "Know the difference and keep this list handy",
        activities: [
          {
            id: "h02-m4-l2-ref",
            type: "flip_card",
            title: "Quick comparison",
            instruction: "Flip to see when to call your doctor.",
            content: {
              cards: [
                { front: "Baby blues", back: "Up to 80% of new parents. Starts day 3‑5, resolves by day 10‑14. Symptoms: crying, mood swings, feeling overwhelmed. Normal hormone withdrawal. Support: rest, company, reassurance.", emoji: "😔", tag: "Normal" },
                { front: "Postnatal depression (PND)", back: "Persists beyond 2 weeks, or is severe. Symptoms: persistent low mood, inability to enjoy anything, intense anxiety, feeling like a bad parent, inability to bond, thoughts of harm. Seek help. PND is treatable.", emoji: "⚠️", tag: "Act" },
                { front: "Postnatal anxiety", back: "Constant worry, hypervigilance, inability to rest, catastrophising. Often missed because parent seems 'on it'. If you can't switch off, speak to your GP.", emoji: "😰", tag: "Act" },
                { front: "Intrusive thoughts", back: "Upsetting, unwanted thoughts about harm coming to baby. Up to 91% of new parents have them. They do NOT mean you will act. Speak to a professional – you won't be judged.", emoji: "💭", tag: "Common" }
              ]
            }
          }
        ]
      },
      {
        id: "handbook-0-2-m4-l3",
        title: "Protecting your relationship",
        description: "Small habits that keep you connected through sleep deprivation",
        activities: [
          {
            id: "h02-m4-l3-ref",
            type: "flip_card",
            title: "The daily six minutes",
            instruction: "Flip for Gottman's research‑backed ritual.",
            content: {
              cards: [
                { front: "2 min goodbye", back: "Before you separate for the day (even if one of you is just going to the shop), pause. Eye contact, a genuine 'have a good day', a brief touch." },
                { front: "2 min reunion", back: "When you come back together, put down your phone. Ask a real question: 'How was your afternoon?' Listen without fixing." },
                { front: "2 min affection", back: "Not sex – just non‑sexual physical affection: a hug, a hand on the shoulder, stroking their hair. This maintains the bond during the dry years of new parenthood." },
                { front: "The load talk", back: "Once a week, ask: 'Are we both feeling the workload is fair?' Not 50/50 – perceived fairness. Assumptions lead to resentment; agreements lead to teamwork.", emoji: "⚖️", tag: "Check‑in" }
              ]
            }
          },
          {
            id: "h02-m4-l3-prompt",
            type: "open_response",
            title: "Optional: one small ask",
            content: {
              prompt: "What's one thing your partner could do this week that would make you feel more supported? (Write it down, then show them – or just think about it for your own clarity.)",
              saveToVault: true
            }
          }
        ]
      }
    ]
  }
];