import {
  Sun, Utensils, Dumbbell, BookOpen, Compass, Moon, Leaf, Brain, Headphones,
  GraduationCap, Sparkles, Rss, Heart, Baby, Users, MessageCircle, User, Crown, MessageSquare,
  type LucideIcon,
} from "lucide-react";

/**
 * Signal information architecture.
 *
 * Four everyday pillars live in the primary nav. Everything else is kept,
 * but grouped by intent inside Explore so the daily surface stays quiet.
 */

export type Pillar = "today" | "eat" | "move" | "reflect" | "explore";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  pillar: Pillar;
  /** Extra paths that should light this tab up. */
  match?: string[];
}

export const PRIMARY_NAV: NavItem[] = [
  { path: "/", label: "Today", icon: Sun, pillar: "today" },
  { path: "/nutrition", label: "Eat", icon: Utensils, pillar: "eat" },
  { path: "/movement", label: "Move", icon: Dumbbell, pillar: "move" },
  { path: "/journal", label: "Reflect", icon: BookOpen, pillar: "reflect", match: ["/vision-board"] },
  { path: "/explore", label: "Explore", icon: Compass, pillar: "explore" },
];

/** CSS colour (hsl var) used for each pillar's accent. */
export const PILLAR_COLOR: Record<Pillar, string> = {
  today: "hsl(var(--primary))",
  eat: "hsl(var(--eat))",
  move: "hsl(var(--move))",
  reflect: "hsl(var(--reflect))",
  explore: "hsl(var(--goals))",
};

export interface ExploreItem {
  path: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
}

export interface ExploreGroup {
  id: string;
  title: string;
  intent: string;
  items: ExploreItem[];
}

export const EXPLORE_GROUPS: ExploreGroup[] = [
  {
    id: "rhythm",
    title: "Your rhythm",
    intent: "The quiet lens behind every recommendation.",
    items: [
      { path: "/cycle", label: "Cycle", blurb: "Log, predict and understand your phases.", icon: Moon },
      { path: "/my-practice", label: "Habits", blurb: "Small daily rituals that compound.", icon: Leaf },
    ],
  },
  {
    id: "calm",
    title: "Calm",
    intent: "Two minutes to come back to yourself.",
    items: [
      { path: "/mindfulness", label: "Mindfulness", blurb: "Breathwork, somatic resets and sleep.", icon: Brain },
      { path: "/scripts", label: "Audio studio", blurb: "Guided scripts, read to you.", icon: Headphones },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    intent: "Go deeper, at your own pace.",
    items: [
      { path: "/modules", label: "Modules", blurb: "Short courses on hormones, food and the body.", icon: GraduationCap },
      { path: "/embodiment/course", label: "Embodiment", blurb: "A guided practice to feel at home in your body.", icon: Sparkles },
      { path: "/feed", label: "Reading", blurb: "One idea a day from the books that matter.", icon: Rss },
    ],
  },
  {
    id: "relationships",
    title: "Love & family",
    intent: "Tools for the people you care about.",
    items: [
      { path: "/connect", label: "Connect", blurb: "Relationship rituals and couples course.", icon: Heart },
      { path: "/parenting", label: "Parenting", blurb: "Calm, practical guidance for the hard moments.", icon: Baby },
    ],
  },
  {
    id: "together",
    title: "Support",
    intent: "You don't have to do it alone.",
    items: [
      { path: "/coach", label: "Coach", blurb: "A personalised plan, built with you.", icon: MessageCircle },
      { path: "/community", label: "Village", blurb: "A kind corner of women doing the same.", icon: Users },
    ],
  },
  {
    id: "you",
    title: "You",
    intent: "",
    items: [
      { path: "/account", label: "Account", blurb: "Profile, goals and preferences.", icon: User },
      { path: "/membership", label: "Membership", blurb: "Your plan and what's included.", icon: Crown },
      { path: "/account?feedback=1", label: "Feedback", blurb: "Tell us what would help.", icon: MessageSquare },
    ],
  },
];

const EXPLORE_PATHS = EXPLORE_GROUPS.flatMap((g) => g.items.map((i) => i.path));

function matches(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

/** Which primary tab owns the current route. */
export function activePillar(pathname: string): Pillar {
  if (pathname === "/" || pathname === "/home") return "today";
  for (const item of PRIMARY_NAV) {
    if (item.path === "/") continue;
    if (matches(pathname, item.path) || item.match?.some((m) => matches(pathname, m))) return item.pillar;
  }
  if (EXPLORE_PATHS.some((p) => matches(pathname, p))) return "explore";
  return "explore";
}
