import { parseIngredient } from "@/lib/ingredient-parser";
import { groupKey } from "@/lib/smart-shopping-core";

/**
 * Put each ingredient's amount into the method the first time a step names
 * it without one: "Sauté onion, garlic and carrot" →
 * "Sauté onion (1), garlic (2 cloves) and carrot (80 g)". Steps that already
 * give the amount ("Simmer 50g oats in 250ml milk") are left alone, so the
 * cook never has to flick back to the ingredient list.
 */

// An amount (number or word) and unit, then up to four describing words: "50g", "1/2 can of
// rinsed and drained", "one large free-range". Verbs and prepositions in between ("30g salad
// dressed in") mean the amount belongs to something else.
const AMOUNT_BEFORE = /(?:[\d½⅓⅔¼¾⅛][\d\s/.½⅓⅔¼¾⅛–-]*?\s*(?:g|kg|ml|l|cm|mm|cups?|tbsps?|tsps?|tablespoons?|teaspoons?|cloves?|slices?|pinch(?:es)?|handfuls?|cans?|tins?|x)?|\b(?:one|two|three|four|half))\s+((?:[a-zāēīōū'‑-]+\s+){0,4})$/i;
const NOT_DESCRIBING = /\b(in|into|on|onto|over|with|to|for|at|from|then|dressed|add|serve|top|toss|mix|stir|cook|bake|until|when)\b/i;
const hasOwnAmount = (before: string) => {
  const m = AMOUNT_BEFORE.exec(before);
  return !!m && !NOT_DESCRIBING.test(m[1] ?? "");
};
const FRACTION_GLYPH: Record<string, string> = { "1/2": "½", "1/3": "⅓", "2/3": "⅔", "1/4": "¼", "3/4": "¾", "1/8": "⅛" };

function amountLabel(quantity: string, unit: string): string {
  const q = quantity.replace(/^(\d+)\s+(\d\/\d)$/, (_m, w: string, f: string) => `${w}${FRACTION_GLYPH[f] ?? ` ${f}`}`).replace(/^\d\/\d$/, f => FRACTION_GLYPH[f] ?? f);
  if (!unit) return q;
  // "50" + "g" → "50 g"; spoons and counts read naturally with a space too.
  return `${q} ${unit}`;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Singular and plural spellings of a word: berry → berry|berries, tomato → tomato|tomatoes. */
function wordForms(word: string): string[] {
  const w = groupKey(word);
  const forms = new Set([w, `${w}s`, `${w}es`]);
  if (w.endsWith("y")) forms.add(`${w.slice(0, -1)}ies`);
  return [...forms].map(escape);
}

const NOT_A_NOUN = /^(red|green|brown|white|black|yellow|ground|sea|sweet|spring|whole|dark|light|low|plant|sesame|olive|coconut|apple|cider|maple|soy|fish|chilli|vegetable|piece|pieces|knob|slice|can|tin|jar|punnet|bunch|handful|cup|small|large|medium|fresh|free-range|cooked|tinned|canned|dried|frozen)$/i;

export function withMethodAmounts(ingredients: string[], method: string[]): string[] {
  const steps = [...method];
  // Water, salt and pepper turn up in too many steps to place an amount safely.
  const parsed = ingredients.map(parseIngredient).filter(p => p.quantity && !/^(water|salt|pepper|ice)$/i.test(p.searchTerm.trim()));
  const wordsOf = parsed.map(p => p.searchTerm.toLowerCase().replace(/[^a-zāēīōū\s-]/g, " ").split(/\s+/).filter(w => w.length > 2));
  const count = (w: string) => wordsOf.filter(ws => ws.some(x => groupKey(x) === groupKey(w))).length;

  parsed.forEach((p, i) => {
    const words = wordsOf[i];
    if (!words.length) return;
    const last = words[words.length - 1];
    const first = words[0];
    // Try the full phrase, then the head noun, then a distinctive first word ("chicken" in "chicken breast").
    const patterns: RegExp[] = [];
    if (words.length > 1) patterns.push(new RegExp(`\\b${words.slice(0, -1).map(escape).join("\\s+")}\\s+(?:${wordForms(last).join("|")})\\b`, "i"));
    if (count(last) === 1) patterns.push(new RegExp(`\\b(?:${wordForms(last).join("|")})\\b`, "i"));
    // Then any other distinctive word, first word first ("chicken" in "boneless chicken thigh").
    for (const w of [first, ...words.slice(1, -1)]) {
      if (words.length > 1 && w.length > 3 && !NOT_A_NOUN.test(w) && count(w) === 1) patterns.push(new RegExp(`\\b(?:${wordForms(w).join("|")})\\b`, "i"));
    }
    if (!patterns.length) return;

    for (let s = 0; s < steps.length; s++) {
      const hits = patterns.map(re => re.exec(steps[s])).filter((m): m is RegExpExecArray => !!m);
      if (!hits.length) continue;
      const m = hits.reduce((a, b) => (b.index < a.index ? b : a));
      // An amount counts as this ingredient's only when it sits right before it
      // ("50g oats", "2 slices rye bread"), not "30g salad dressed in oil".
      const clause = steps[s].slice(Math.max(0, m.index - 48), m.index).replace(/\([^)]*\)/g, "");
      const before = clause.split(/[,.;:]|\bthen\b/i).pop() ?? "";
      const after = steps[s].slice(m.index + m[0].length);
      if (hasOwnAmount(before) || /^\s*\(/.test(after)) return;
      const end = m.index + m[0].length;
      steps[s] = `${steps[s].slice(0, end)} (${amountLabel(p.quantity, p.unit)})${steps[s].slice(end)}`;
      return;
    }
  });

  return steps;
}
