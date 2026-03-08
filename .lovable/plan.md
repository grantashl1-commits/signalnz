

## Important Limitation: Woolworths NZ Has No Public API

Woolworths New Zealand does not offer a public API for product search or cart management. Building a direct integration that logs into a user's Woolworths account and adds items to their cart would require:

1. **Reverse-engineering their private APIs** — which violates their Terms of Service
2. **Handling user credentials** — storing Woolworths login details is a serious security and liability risk
3. **Web scraping with authentication** — fragile, legally questionable, and would break with any site update

**This is not something I can build reliably or responsibly.**

---

## What I Can Build Instead

Here are two realistic alternatives:

### Option A: Smart Shopping List Generator
- Parse recipe ingredients into structured data (product name, quantity, unit)
- Generate a formatted shopping list grouped by supermarket aisle categories
- Add a "Copy List" button so users can paste it into the Woolworths app or any notes app
- Optionally use Firecrawl to scrape Woolworths product search pages to show estimated prices and product links (no login required)

### Option B: Woolworths Search Links
- Parse each ingredient and generate direct search URLs to `woolworths.co.nz/shop/search?search={ingredient}`
- Each ingredient in a recipe gets a "Find at Woolworths" button that opens the search in a new tab
- User can then add to cart themselves in one click per item

### Recommended: Option A + B Combined
- Build an ingredient parser that extracts product names from recipe strings like `"1 cup red lentils"` → `red lentils`
- Display a shopping list card on each recipe with quantity, item name, and a Woolworths search link
- "Copy All to Clipboard" button for the full list
- This gives users a near-seamless experience without any legal/security issues

### Technical approach
- Create a `parseIngredient()` utility that extracts quantity, unit, and product name from ingredient strings
- Build a `ShoppingList` component shown on recipe detail views
- Generate Woolworths search URLs: `https://www.woolworths.co.nz/shop/search?search=${encodeURIComponent(productName)}`
- Store shopping list state in localStorage so users can aggregate across multiple recipes

