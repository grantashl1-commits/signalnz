import triumph from "@/assets/parenting/character-triumph.png";
import glimmer from "@/assets/parenting/character-glimmer.png";
import pebble from "@/assets/parenting/character-pebble.png";
import drizzle from "@/assets/parenting/character-drizzle.png";
import sparky from "@/assets/parenting/character-sparky.png";

export type CharacterId = "triumph" | "glimmer" | "pebble" | "drizzle" | "sparky";

export const CHARACTERS: Record<CharacterId, { id: CharacterId; name: string; image: string; trait: string; defaultColor: string }> = {
  triumph: { id: "triumph", name: "Triumph", image: triumph, trait: "Celebrates wins big and small", defaultColor: "#7BB7E0" },
  glimmer: { id: "glimmer", name: "Glimmer", image: glimmer, trait: "Quietly proud of every effort", defaultColor: "#F2D67A" },
  pebble:  { id: "pebble",  name: "Pebble",  image: pebble,  trait: "Steady, patient, and persistent", defaultColor: "#B8B0A6" },
  drizzle: { id: "drizzle", name: "Drizzle", image: drizzle, trait: "Carries the umbrella through tough moments", defaultColor: "#8FCBD2" },
  sparky:  { id: "sparky",  name: "Sparky",  image: sparky,  trait: "Energetic — finishes what they start", defaultColor: "#E89274" },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export const ACCENT_COLORS = [
  "#7BB7E0", "#F2D67A", "#B8B0A6", "#8FCBD2", "#E89274",
  "#A4C9A0", "#D4A5C5", "#E8C39E", "#9FA8DA", "#FFB199",
];
