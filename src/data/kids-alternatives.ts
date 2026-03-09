/**
 * Kid-friendly dinner alternatives mapped by dinner name keywords.
 */
export const KIDS_DINNER_ALTERNATIVES: Record<string, string> = {
  "miso": "Plain soba noodles with tamari dipping sauce + steamed broccoli + edamame. Same noodles, simpler flavours.",
  "bolognese": "Pasta with a mild tomato and lentil sauce — blend the lentils smooth if texture is an issue. Add nutritional yeast for cheesy flavour.",
  "chickpea curry": "Mild coconut rice with chickpeas — reduce spices to just cumin and a pinch of turmeric. Serve with flatbread.",
  "chickpea & sweet potato curry": "Mild coconut rice with chickpeas — reduce spices to just cumin and a pinch of turmeric. Serve with flatbread.",
  "tempeh stir": "Plain rice + steamed vegetables + tamari. Swap tempeh for plain tofu if needed.",
  "thai green curry": "Coconut rice with mild sautéed veggies. Use only 1 tsp curry paste and extra coconut milk to reduce heat.",
  "thai": "Coconut rice with mild sautéed veggies. Use only 1 tsp curry paste and extra coconut milk to reduce heat.",
  "mushroom risotto": "Cheese-free creamy rice — use extra oat milk and nutritional yeast. Kids usually love this one as-is.",
  "shakshuka": "Scrambled silken tofu on toast with a very mild tomato sauce. Skip the spices.",
  "pad thai": "Plain rice noodles with peanut butter sauce (PB + tamari + lime). Most kids love peanut noodles.",
  "lentil dhal": "Plain rice with a very mild lentil sauce — blend smooth and skip the chilli. Add a squeeze of lemon.",
  "shepherd": "Mashed sweet potato on its own with a side of steamed veggies. Most kids love the mash.",
  "casserole": "Serve the root vegetables and lentils separated — kids do better when they can see each component.",
  "tikka masala": "Mild coconut rice with chickpeas — skip the tikka spice. Add a dollop of coconut yoghurt.",
  "chilli": "Mild bean and rice bowl — reduce chilli powder to a pinch. Top with avocado.",
  "lasagne": "Plain pasta with cashew cream sauce. Serve vegetables on the side.",
  "dhal": "Plain rice with a very mild lentil sauce — blend smooth and skip the chilli.",
  "stew": "Serve the protein and vegetables separated with crusty bread for dipping.",
  "pumpkin curry": "Roasted pumpkin pieces with plain rice and a drizzle of coconut cream.",
  "asparagus": "Plain quinoa with cucumber sticks and a tahini dipping sauce.",
  "stuffed capsicum": "Plain quinoa and black beans served separately with corn on the side.",
  "fritters": "Plain fritters served with cucumber sticks and hummus.",
};

const GENERIC_KID_TIP = "Serve the main protein and carb plain for kids, with the sauce on the side. Most children do better with simpler flavours and separated components.";

export function getKidAlternative(dinnerName: string): string {
  const lower = dinnerName.toLowerCase();
  for (const [key, alt] of Object.entries(KIDS_DINNER_ALTERNATIVES)) {
    if (lower.includes(key)) return alt;
  }
  return GENERIC_KID_TIP;
}
