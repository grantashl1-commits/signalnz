import { containsNuts, detectDiet } from './recipe-facets';
import type { PrepPreferences } from './weekly-planner';

type Food = { name: string; ingredients: string[] };
const terms = (value = '') => value.toLowerCase().split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
const diets = (p: PrepPreferences) => (p.dietTypes?.length ? p.dietTypes : [p.dietType ?? '']).map(s => s.toLowerCase().replace(/_/g, '-'));
const dairy = /\b(milk|cheese|butter|cream|yoghurt|yogurt|whey|casein|ghee|feta|parmesan|paneer|halloumi|ricotta|mozzarella|kefir|buttermilk)\b/i;
const plantDairy = /\b(coconut|oat|almond|soy|soya|rice|cashew|hemp|pea|plant(?:-based)?|dairy-free|vegan|peanut|seed|sunflower|cocoa)\s+(milk|cream|yoghurt|yogurt|cheese|butter)\b/gi;
const gluten = /\b(wheat|flour|pasta|bread|sourdough|tortilla|couscous|barley|rye|semolina|spelt|bulgur|soy sauce|seitan)\b/i;
const glutenFree = /\b(?:gluten-free|rice|corn|chickpea|almond|coconut|buckwheat|tapioca|potato)\s+(?:flour|pasta|bread|tortilla)\b/gi;

/** Conservative ingredient exclusions. Never relax these to fill a plan. */
export function mealMatchesPreferences(food: Food, preferences: PrepPreferences): boolean {
  const text = `${food.name} ${food.ingredients.join(' ')}`.toLowerCase();
  const ingredients = food.ingredients.join(' ').toLowerCase();
  for (const term of [...terms(preferences.allergies), ...terms(preferences.dislikes)]) {
    if (/^(nuts?|tree nuts?|peanuts? and tree nuts?)$/.test(term)) {
      if (containsNuts(food.ingredients, food.name)) return false;
    } else if (/^(dairy|milk)$/.test(term)) {
      if (dairy.test(ingredients.replace(plantDairy, ''))) return false;
    } else if (/^(gluten|wheat)$/.test(term)) {
      if (gluten.test(ingredients.replace(glutenFree, ''))) return false;
    } else if (/^(soy|soya)$/.test(term)) {
      if (/\b(soy|soya|tofu|tempeh|edamame|miso|tamari)\b/.test(text)) return false;
    } else {
      const singular = term.replace(/s$/, '');
      if (text.includes(term) || (singular.length > 2 && text.includes(singular))) return false;
    }
  }
  // Consider both sides of an offered alternative and optional garnishes.
  // A restricted plan must not instruct the member to use an excluded ingredient.
  const diet = detectDiet(food.ingredients.flatMap(s => s.replace(/optional/gi, '').split(/\s+or\s+/i)));
  for (const d of diets(preferences)) {
    if (d === 'vegan' && diet !== 'vegan') return false;
    if (d === 'vegetarian' && !['vegan', 'vegetarian'].includes(diet)) return false;
    if (d === 'pescatarian' && diet === 'omnivore') return false;
    if (d === 'dairy-free' && dairy.test(ingredients.replace(plantDairy, ''))) return false;
    if (d === 'gluten-free' && gluten.test(ingredients.replace(glutenFree, ''))) return false;
  }
  return true;
}

export function childPreferences(p: PrepPreferences): PrepPreferences {
  return { ...p, dietTypes: p.kidsDietTypes, dietType: p.kidsDietType, allergies: p.kidsAllergies, dislikes: '' };
}
