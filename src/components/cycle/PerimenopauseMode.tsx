import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Moon, Brain, Heart, ArrowRight } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface EducationCard {
  text: string;
  detail: string;
  source: string;
}

const EDUCATION_CARDS: EducationCard[] = [
  {
    text: "Perimenopause can begin in your late 30s — not just your late 40s",
    detail: "Many women are told their symptoms are anxiety or stress. In reality, hormonal shifts can start a decade before menopause. If your cycle is changing and you're experiencing new symptoms, it may be perimenopause.",
    source: "Haver — The New Perimenopause",
  },
  {
    text: "Hot flushes are a cardiovascular event, not just discomfort",
    detail: "Hot flushes are caused by the brain's thermoregulatory centre responding to declining oestrogen. They involve real cardiovascular changes — increased heart rate, blood flow shifts, and skin temperature spikes. They're a physiological event, not 'just feeling warm'.",
    source: "Haver — The New Menopause",
  },
  {
    text: "Heavy resistance training is one of the most evidence-based interventions for perimenopause symptoms",
    detail: "As oestrogen declines, you lose its protective effect on muscle and bone. Heavy lifting directly stimulates the pathways oestrogen used to support. Sims argues this is the single most impactful lifestyle change for women in perimenopause.",
    source: "Sims — Next Level",
  },
  {
    text: "Oestrogen decline affects bone density, muscle mass, and cardiovascular health — movement is medicine",
    detail: "Oestrogen isn't just a reproductive hormone. It supports bone remodelling, muscle protein synthesis, and arterial flexibility. When it drops, these systems need direct stimulation through load-bearing exercise, protein intake, and stress management.",
    source: "Sims — Next Level; Haver — The New Menopause",
  },
  {
    text: "MHT (Menopausal Hormone Therapy) has been shown to be safe and effective for most women",
    detail: "The fear around HRT was driven by a 2002 study that has since been largely recontextualized. For women under 60 who are within 10 years of menopause, the benefits typically outweigh the risks. Always discuss with your doctor.",
    source: "Gunter — The Menopause Manifesto; Haver — The New Menopause",
  },
];

const PERI_SYMPTOMS = [
  { icon: Flame, label: "Hot flushes", desc: "frequency & intensity" },
  { icon: Moon, label: "Night sweats", desc: "severity tracking" },
  { icon: Brain, label: "Brain fog", desc: "memory & word retrieval" },
  { icon: Heart, label: "Mood shifts", desc: "rage, anxiety, low mood" },
];

interface Props {
  onNavigateToTraining?: () => void;
}

export default function PerimenopauseMode({ onNavigateToTraining }: Props) {
  const [activeCard, setActiveCard] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  // Auto-rotate education cards
  useEffect(() => {
    if (showDetail) return;
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % EDUCATION_CARDS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [showDetail]);

  const card = EDUCATION_CARDS[activeCard];

  return (
    <div className="space-y-6">
      {/* Irregular cycle message */}
      <div className="card-warm p-4">
        <p className="font-display text-base italic text-foreground mb-1">your cycle, your pace</p>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Perimenopause cycles can be unpredictable — Signal tracks your patterns without expecting you to be regular.
          Log when your period arrives and we'll adapt phase estimates based on your rolling averages.
        </p>
      </div>

      {/* Key symptom tracking highlights */}
      <div>
        <p className="font-hand text-sm font-bold text-primary mb-3">perimenopause-specific tracking</p>
        <div className="grid grid-cols-2 gap-2">
          {PERI_SYMPTOMS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card-warm p-3 flex items-start gap-2">
              <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-hand text-xs font-bold text-foreground">{label}</p>
                <p className="font-body text-[10px] text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education cards */}
      <div>
        <p className="font-hand text-sm font-bold text-primary mb-3">did you know?</p>
        <motion.div
          key={activeCard}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          className="card-warm p-4 border-l-2 border-primary"
        >
          <p className="font-display text-sm italic text-foreground leading-relaxed">
            "{card.text}"
          </p>
          
          {showDetail ? (
            <div className="mt-3 border-t border-border pt-3">
              <p className="font-body text-xs text-muted-foreground leading-relaxed">{card.detail}</p>
              <p className="font-hand text-[10px] text-muted-foreground mt-2">— {card.source}</p>
              <button onClick={() => setShowDetail(false)} className="font-hand text-xs text-primary mt-2">
                close
              </button>
            </div>
          ) : (
            <button
              onClick={() => { haptic("light"); setShowDetail(true); }}
              className="touch-btn font-hand text-xs text-primary mt-2 flex items-center gap-1"
            >
              learn more <ChevronRight className="h-3 w-3" />
            </button>
          )}

          <div className="flex justify-center gap-1 mt-3">
            {EDUCATION_CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveCard(i); setShowDetail(false); }}
                className={`h-1.5 rounded-full transition-all ${i === activeCard ? "w-4 bg-primary" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Training CTA */}
      {onNavigateToTraining && (
        <button
          onClick={() => { haptic("light"); onNavigateToTraining(); }}
          className="touch-btn w-full card-warm p-4 text-left flex items-center justify-between"
        >
          <div>
            <p className="font-hand text-sm font-bold text-primary">cycle sync training</p>
            <p className="font-body text-xs text-muted-foreground">
              heavy compound lifting adapted for perimenopause
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </button>
      )}
    </div>
  );
}
