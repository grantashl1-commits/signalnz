# Recipe illustrations still needed

These 125 recipes have no drawing of their own and no picture of the same kind of dish, so the
Recipes tab shows a quiet placeholder (a fork and knife) instead of a picture of something else.

To add one: draw it in the house style (soft watercolour and ink, three-quarter view, on a transparent
background), save it as `public/images/recipes/meals/<id>.png`, add `"<id>": "/images/recipes/meals/<id>.png"`
to `src/data/recipe-image-files.json`, then run `python scripts/make-recipe-images-transparent.py`.
The recipe picks it up by its id.

| id | Recipe | Collection | Main ingredients |
| --- | --- | --- | --- |
| `snack-apricot-coconut-balls` | Apricot & Coconut Balls | library | 60g dried apricots (no sugar), chopped, 30g desiccated coconut, 20g sunflower seeds |
| `snack-almond-date-balls` | Almond & Date Balls | library | 60g almonds, 60g dates, pitted, 1 tbsp cacao powder |
| `snack-coconut-lime-balls` | Coconut Lime Balls | library | 60g dates, pitted, 40g desiccated coconut, 1 tbsp lime juice, 1 tsp lime zest |
| `snack-seed-crackle-balls` | Seed & Date Crackle Balls | library | 60g dates, pitted, 20g pumpkin seeds, 20g sunflower seeds, 10g chia seeds |
| `snack-gingerbread-balls` | Gingerbread Spice Balls | library | 60g almonds, 60g dates, ½ tsp ginger, ½ tsp cinnamon, ¼ tsp cloves |
| `snack-berry-hazelnut-balls` | Berry & Hazelnut Balls | library | 60g hazelnuts, 60g dried cranberries (no sugar), 1 tbsp orange zest |
| `baking-date-walnut-slice` | Date & Walnut Slice | library | 200g dates, pitted, 150g walnuts, 100g rolled oats, 2 tbsp coconut oil, melted, 1 tsp cinnamon |
| `baking-apricot-coconut-slice` | Apricot & Coconut Slice | library | 200g dried apricots (no sugar), 150g desiccated coconut, 100g rolled oats, 2 tbsp coconut oil, melted |
| `baking-oat-seed-crackers` | Oat & Seed Crackers | library | 100g rolled oats, 50g sunflower seeds, 30g pumpkin seeds, 2 tbsp chia seeds, 2 tbsp olive oil |
| `snack-cheese-crackers` | Cheese Crackers | library | 100g wholemeal flour, 50g cold butter, 80g grated cheddar, 1–2 tbsp cold water |
| `snack-parmesan-crisps` | Parmesan Crisps | library | 40g grated Parmesan, Pinch black pepper |
| `snack-kale-chips` | Baked Kale Chips | library | 50g kale, torn into pieces, 1 tsp olive oil, Pinch salt, Pinch paprika |
| `snack-zucchini-chips` | Zucchini Chips | library | 1 zucchini (150g), thinly sliced, 1 tbsp olive oil, Pinch salt |
| `snack-roasted-chickpeas` | Crispy Roasted Chickpeas | library | 100g tinned chickpeas, drained and dried, 1 tsp olive oil, ½ tsp paprika, Pinch salt |
| `snack-frozen-yoghurt-bark` | Frozen Yoghurt Bark | library | 200g Greek yoghurt, 50g mixed berries, 1 tbsp chia seeds |
| `snack-hummus-cup` | Freezer Hummus Cup | library | 3 tbsp hummus (45g), Veggie sticks (carrot, cucumber) |
| `snack-oat-energy-slice` | No‑Bake Oat Energy Slice | library | 150g dates, pitted, 100g rolled oats, 50g sunflower seeds, 30g pumpkin seeds, 2 tbsp coconut oil |
| `baking-cheese-scone` | Cheese Scone (freezer batch) | library | 150g wholemeal flour, 50g cold butter, 80g grated cheddar, 1 tsp baking powder, 60ml milk |
| `baking-pumpkin-bread` | Pumpkin Bread | library | 150g pumpkin purée, 2 eggs, 100g wholemeal flour, 50g rolled oats, 30g coconut oil |
| `baking-buckwheat-bannock` | Buckwheat Bannock | library | 100g buckwheat flour, 1 tsp baking powder, Pinch salt, 80ml water, 1 tbsp olive oil |
| `snack-apple-leather` | Apple Fruit Leather | library | 3 apples (450g), peeled and chopped, 1 tsp cinnamon |
| `snack-berry-leather` | Berry Fruit Leather | library | 300g mixed berries (fresh or frozen), 1 tbsp chia seeds (optional) |
| `tcm-cucumber-mint-raita` | Pitta Calming Cucumber & Mint Raita | library | 100g plain Greek yoghurt (full‑fat), 50g cucumber, grated, 1 tbsp fresh mint, chopped, Pinch of roasted cumin powder, Pinch of salt |
| `tcm-sesame-ginger-greens` | Warming Sesame & Ginger Greens | library | 1 tbsp sesame seeds (10g), 200g mixed greens (kale, spinach, bok choy), chopped, 1 tsp sesame oil, 1 tsp fresh ginger, grated, 1 garlic clove, minced |
| `tcm-ayurveda-kitchari-luteal` | Vata‑Pacifying Kitchari with Root Vegetables | library | 60g split yellow mung beans, rinsed, 60g basmati rice, rinsed, 1 tbsp ghee or coconut oil, 1 tsp cumin seeds, ½ tsp ground turmeric |
| `tcm-turmeric-roasted-cauliflower` | Turmeric Roasted Cauliflower with Cumin | library | 200g cauliflower florets, 1 tbsp olive oil, ½ tsp ground turmeric, ½ tsp ground cumin, Pinch of black pepper |
| `kids-chicken-strips` | Crispy Chicken Strips | kids | 500g chicken breast, sliced into strips, 1 cup breadcrumbs, ½ cup flour, 1 egg, beaten, 1 tsp paprika |
| `kids-fish-fingers` | Homemade Fish Fingers | kids | 400g firm white fish, cut into strips, ½ cup breadcrumbs, ¼ cup flour, 1 egg, beaten, ½ tsp paprika |
| `kids-paleo-chicken-strips` | Crunchy Coconut Chicken Strips | kids | 500g chicken breast, sliced into strips, 1 cup unsweetened shredded coconut, ½ cup almond flour, 1 egg, beaten, ½ tsp paprika |
| `kids-paleo-tuna-nori-rolls` | Curried Tuna Nori Bites | kids | 1 can tuna, drained, ½ avocado, mashed, 1 tsp curry powder, 1 tbsp lime juice, 1 tsp raisins |
| `kids-paleo-meatloaf` | Hidden Veggie Meatloaf | kids | 500g beef mince, 250g pork mince, 1 carrot, grated, 1 zucchini, grated, 1 egg |
| `kids-paleo-eggplant-lasagna` | Eggplant Layered Bake | kids | 1 large eggplant, sliced lengthwise, 400g pork sausage meat, 2 cups spinach, 2 cups tomato passata, 1 cup cashew cream or coconut cream |
| `kids-ne-cornbread-bites` | Honey Cornbread Bites | kids | 1 cup cornmeal, 1 cup flour, ¼ cup honey, 1 egg, ¾ cup milk |
| `kids-ne-cranberry-chicken` | Cranberry Glazed Chicken Drumsticks | kids | 8 chicken drumsticks, ½ cup cranberry sauce, 2 tbsp soy sauce, 1 tbsp olive oil, 1 tsp garlic powder |
| `kids-hp-chicken-schnitzel` | Oven-Baked Chicken Schnitzel | kids | 4 chicken breast fillets, pounded thin, 1 cup panko breadcrumbs, ½ cup flour, 1 egg, beaten, 1 tsp paprika |
| `kids-paleo-zucchini-fries` | Crispy Zucchini Fries | kids | 2 zucchini, cut into sticks, 1 egg, ¼ cup almond flour, 1 tsp dried oregano, olive oil for frying |
| `kids-paleo-cauliflower-bites` | Popcorn Cauliflower Bites | kids | 1 head cauliflower, broken into small florets, 2 tbsp olive oil, 1 tsp garlic powder, ½ tsp paprika, ½ tsp salt |
| `kids-ak-chicken-katsu` | Chicken Katsu Bites | kids | 400g chicken breast, sliced thin, 1 cup panko breadcrumbs, ½ cup flour, 1 egg, beaten, 1 tsp curry powder |
| `kids-ak-veggie-sausage-rolls` | Hidden Veggie Sausage Rolls | kids | 400g pork sausage meat, 1 carrot, grated, 1 zucchini, grated and squeezed, ½ cup breadcrumbs, 1 sheet puff pastry |
| `kids-ak-pinwheel-wraps` | Ham & Cheese Pinwheels | kids | 2 flour tortillas, 4 slices ham, ½ cup grated cheese, 2 tbsp cream cheese, ½ cup shredded lettuce |
| `kids-ak-mini-meatloaf-cups` | Mini Meatloaf Cups | kids | 400g beef mince, 1 carrot, grated, ¼ cup breadcrumbs, 1 egg, 1 tbsp tomato paste |
| `kids-ak-sweet-potato-fingers` | Sweet Potato Fingers | kids | 2 sweet potatoes, cut into finger sticks, 1 tbsp olive oil, ½ tsp cinnamon, pinch salt |
| `kids-atk-sticky-drumsticks` | Sticky Honey Drumsticks | kids | 8 chicken drumsticks, 3 tbsp soy sauce, 2 tbsp honey, 1 tbsp olive oil, 1 tsp garlic powder |
| `kids-atk-cheese-bread` | Cheesy Pull-Apart Bread | kids | 1 round bread loaf, 1½ cups grated mozzarella, ½ cup butter, melted, 2 cloves garlic, minced, 1 tbsp parsley, chopped |
| `kids-aa-ants-on-a-log` | Ants on a Log | kids | 4 celery sticks, 4 tbsp peanut butter or cream cheese, 2 tbsp raisins |
| `kids-aa-chicken-popcorn` | Chicken Popcorn Bites | kids | 400g chicken breast, cubed small, ½ cup breadcrumbs, ¼ cup parmesan, grated, 1 egg, beaten, ½ tsp garlic powder |
| `kids-aa-cheese-stars` | Cheese & Herb Stars | kids | 1 sheet puff pastry, 1 cup grated cheddar, 1 tsp dried herbs, 1 egg for glaze |
| `kids-bt-fairy-bread-toast` | Fairy Bread French Toast | kids | 4 thick bread slices, 2 eggs, ¼ cup milk, 1 tsp vanilla, 1 tsp cinnamon |
| `kids-bo-chicken-lollipops` | Sticky Chicken Lollipop Drumettes | kids | 12 chicken drumettes, 2 tbsp honey, 2 tbsp soy sauce, 1 tbsp tomato sauce, 1 tsp garlic powder |
| `kids-ej-chicken-goujons` | Crunchy Chicken Goujons | kids | 400g chicken breast, sliced into strips, 1 cup cornflakes, crushed, ½ cup flour, 1 egg, beaten, ½ tsp paprika |
| `kids-ej-traffic-light-peppers` | Traffic Light Stuffed Peppers | kids | 1 red, 1 yellow, 1 green capsicum, 300g beef mince, 1 cup cooked rice, ½ cup passata, ½ cup grated cheese |
| `kids-sp-honey-soy-salmon` | 15-Minute Honey Soy Salmon | kids | 4 salmon fillets, 2 tbsp soy sauce, 1 tbsp honey, 1 tsp garlic, minced, 1 tsp sesame oil |
| `kids-sp-creamy-tuscan-chicken` | Creamy Tuscan Chicken | kids | 4 chicken breasts, butterflied, 1 cup sun-dried tomatoes, sliced, 2 cups baby spinach, 1 cup cream, ½ cup parmesan, grated |
| `kids-sp-sticky-chicken-drumsticks` | Sticky Chicken Drumsticks | kids | 8 chicken drumsticks, 3 tbsp soy sauce, 2 tbsp honey, 1 tbsp tomato sauce, 1 tsp garlic powder |
| `kids-sp-chicken-schnitzel` | Golden Chicken Schnitzel | kids | 4 chicken breasts, butterflied, 1 cup breadcrumbs, ½ cup flour, 2 eggs, beaten, ½ tsp garlic powder |
| `kids-sp-butter-chicken` | Easy Butter Chicken | kids | 400g chicken thigh, cubed, 1 onion, diced, 2 cloves garlic, minced, 1 cup passata, 1 cup cream |
| `kids-sp-chilli-con-carne` | Mild Chilli Con Carne | kids | 500g beef mince, 1 can kidney beans, drained, 1 can diced tomatoes, 1 capsicum, diced, 1 tsp cumin |
| `kids-sp-carbonara` | 15-Minute Carbonara | kids | 300g spaghetti, 150g bacon, diced, 3 eggs, ½ cup parmesan, grated, 1 clove garlic, minced |
| `kids-sp-honey-mustard-chicken` | Honey Mustard Chicken Thighs | kids | 8 chicken thighs, 2 tbsp honey, 2 tbsp wholegrain mustard, 1 tbsp olive oil, 1 tsp garlic powder |
| `kids-dk-pb-banana-bites` | PB Banana Roll-Ups | kids | 2 flour tortillas, 3 tbsp peanut butter, 2 bananas, 1 tbsp honey, pinch cinnamon |
| `kids-dk-dippable-chicken` | Dippable Chicken Tenders | kids | 400g chicken breast, sliced into tenders, 1 cup breadcrumbs, ½ cup flour, 1 egg, beaten, ½ tsp onion powder |
| `kids-km-ham-cheese-scrolls` | 4-Ingredient Ham & Cheese Scrolls | kids | 1 sheet puff pastry, 4 slices ham, 1 cup grated cheese, 1 tbsp tomato paste |
| `kids-km-choc-banana-pops` | Frozen Choc-Banana Pops | kids | 4 bananas, 200g dark chocolate, melted, sprinkles or crushed rice bubbles |
| `kids-sw-salmon-rice-balls` | Salmon & Rice Balls | kids | 1 can salmon, drained, 1½ cups cooked rice, 1 egg, ¼ cup breadcrumbs, 1 tbsp lemon juice |
| `kids-gf-chicken-tenders` | GF Crispy Chicken Tenders | kids | 400g chicken breast, sliced, 1 cup rice flour, 1 egg, beaten, 1 cup gluten-free breadcrumbs, ½ tsp garlic powder |
| `kids-keto-cheese-crisps` | Keto Cheese Crisps | kids | 2 cups shredded cheddar, ½ tsp garlic powder, ½ tsp paprika |
| `kids-keto-chicken-nuggets` | Keto Almond-Crusted Chicken Nuggets | kids | 400g chicken breast, cubed, 1 cup almond flour, ½ cup parmesan, grated, 1 egg, beaten, ½ tsp garlic powder |
| `kids-keto-ham-pinwheels` | Keto Ham & Cheese Pinwheels | kids | 8 slices ham, 200g cream cheese, softened, 1 cup shredded cheddar, ¼ cup diced pickles, 1 tbsp mustard |
| `kids-keto-avocado-fries` | Keto Avocado Fries | kids | 2 avocados, sliced into wedges, ½ cup almond flour, ½ cup parmesan, grated, 1 egg, beaten, ½ tsp garlic powder |
| `kids-keto-chicken-tenders` | Keto Parmesan Chicken Tenders | kids | 400g chicken breast, sliced, ¾ cup almond flour, ½ cup parmesan, grated, 1 egg, beaten, ½ tsp paprika |
| `kids-keto-sausage-balls` | Keto Sausage Cheese Balls | kids | 500g pork sausage meat, 1½ cups shredded cheddar, ¾ cup almond flour, 1 egg, ½ tsp garlic powder |
| `kids-keto-tuna-melts` | Keto Tuna Melt Capsicums | kids | 2 cans tuna, drained, ¼ cup mayo, 1 tbsp lemon juice, 4 mini capsicums, halved, 1 cup shredded cheddar |
| `kids-keto-butter-chicken` | Keto Mild Butter Chicken | kids | 400g chicken thigh, cubed, 1 cup cream, ½ cup passata, 2 tbsp butter, 1 tsp mild curry powder |
| `kids-df-chicken-tenders` | DF Coconut Chicken Tenders | kids | 400g chicken breast, sliced, 1 cup shredded coconut, ½ cup breadcrumbs, 1 egg, beaten, ½ tsp garlic powder |
| `kids-gf-fish-fingers` | GF Crunchy Fish Fingers | kids | 400g firm white fish, sliced into strips, 1 cup rice flour, 1 egg, beaten, 1 cup GF cornflake crumbs, ½ tsp garlic powder |
| `kids-gf-chicken-drumsticks` | GF Sticky Drumsticks | kids | 8 chicken drumsticks, 3 tbsp tamari, 2 tbsp honey, 1 tbsp olive oil, 1 tsp garlic powder |
| `kids-gf-nuggets` | GF Cornflake Chicken Nuggets | kids | 400g chicken breast, cubed, 1 cup GF cornflake crumbs, ½ cup rice flour, 1 egg, beaten, ½ tsp garlic powder |
| `kids-gf-sausage-rolls` | GF Sausage Rolls | kids | 400g pork sausage meat, 1 carrot, grated, 1 zucchini, grated, 1 sheet GF puff pastry, 1 egg, beaten for glaze |
| `kids-sb-scones` | Classic Fruit Scones | kids | 2 cups self-raising flour, ¼ cup sugar, 50g cold butter, cubed, ½ cup milk, 1 egg |
| `kids-sb-jam-tarts` | Jam Tarts | kids | 1 sheet ready-rolled shortcrust pastry, ½ cup assorted jams (strawberry, apricot, raspberry), 1 egg, beaten for glaze |
| `kids-sb-cheese-straws` | Cheesy Twisty Straws | kids | 1 sheet puff pastry, 1 cup finely grated cheddar, ½ tsp paprika, 1 egg, beaten |
| `kids-sb-rocky-road` | Rocky Road Bites | kids | 300g milk chocolate, 100g butter, 2 cups mini marshmallows, 1 cup crushed biscuits, ½ cup dried cranberries |
| `kids-sb-victoria-sponge` | Mini Victoria Sponges | kids | 200g butter, softened, 200g caster sugar, 4 eggs, 200g self-raising flour, 1 tsp vanilla |
| `kids-sb-meringues` | Mini Meringue Kisses | kids | 3 egg whites, ¾ cup caster sugar, 1 tsp vanilla, food colouring (optional), whipped cream and berries to serve |
| `kids-sb-bread-rolls` | Soft White Bread Rolls | kids | 3½ cups strong white flour, 1 sachet yeast, 1 tsp salt, 1 tsp sugar, 1 cup warm water |
| `kids-sb-sausage-rolls` | Puff Pastry Sausage Rolls | kids | 2 sheets puff pastry, 500g pork sausage meat, 1 carrot, grated, 1 onion, grated, 1 tsp mixed herbs |
| `toasted-cinnamon-and-pecan-crunch` | Toasted Cinnamon & Pecan Crunch | plant-based | 360 g rolled oats, 220 g pecans, roughly chopped, 92 g pumpkin seeds, 90 g sunflower seeds, ½ tsp fine salt |
| `buckwheat-and-rocket-brunch-galettes` | Buckwheat & Rocket Brunch Galettes | plant-based | 150 g buckwheat flour, ½ tsp baking powder, Pinch of salt, 400 mL unsweetened almond milk, 15 mL apple cider vinegar |
| `flaky-leek-potato-and-greens-parcels` | Flaky Leek, Potato & Greens Parcels | plant-based | 450 g potatoes (about 3 medium), cut into 2 cm cubes, 30 mL extra-virgin olive oil, divided, 1 medium leek, finely sliced and well washed, 100 g kale, stalks removed and finely sliced, Zest of ½ lemon |
| `garden-green-savoury-crêpes` | Garden Green Savoury Crêpes | plant-based | 250 g chickpea (besan) flour, 480 mL unsweetened almond milk or oat milk, 50 g spinach, 15 g fresh parsley leaves, 1 tsp apple cider vinegar |
| `crispy-herbed-tofu-bites` | Crispy Herbed Tofu Bites | plant-based | 400 g firm tofu, drained, 80 mL unsweetened plant-based milk, Juice of ½ lemon, plus wedges to serve, 60 g plain flour (gluten-free if needed), 110 g dried breadcrumbs (gluten-free if needed) |
| `ginger-tofu-and-rainbow-rice` | Ginger Tofu & Rainbow Rice | plant-based | 200 g brown rice, 60 mL extra-virgin olive oil (30 mL for the rice, 30 mL for the tofu), 400 g mixed vegetables, cut into small pieces (frozen peas, corn and diced carrot, with sliced red capsicum and spring onion), 105 mL reduced-salt soy sauce or tamari (90 mL for the sauce, 15 mL for the rice), 30 mL water |
| `spring-greens-and-potato-puff-tart` | Spring Greens & Potato Puff Tart | plant-based | 280 g chilled ready-rolled vegan puff pastry sheet (gluten-free if needed), 30 mL unsweetened plant-based milk, 1 tsp vegan Worcestershire sauce, 250 g small new potatoes, 200 g asparagus, woody ends snapped off |
| `roasted-pumpkin-satay-plate` | Roasted Pumpkin Satay Plate | plant-based | 1 medium butternut pumpkin (about 1 kg), peeled, deseeded and cut into 3 cm cubes, 45 mL extra-virgin olive oil (20 mL for the pumpkin, 25 mL for the vegetables), 1 tsp salt (½ tsp for the pumpkin, ½ tsp for the sauce), Freshly ground black pepper, 1 × 400 mL can coconut milk |
| `smoky-sausage-and-chickpea-pot` | Smoky Sausage & Chickpea Pot | plant-based | 15 mL extra-virgin olive oil, 1 medium onion (about 150 g), finely sliced, 1 leek, finely sliced, 2 carrots (about 200 g), roughly chopped, 8 vegan sausages, cut into 3 cm pieces |
| `golden-roast-vegetables-and-spiced-cauliflower` | Golden Roast Vegetables & Spiced Cauliflower | plant-based | 1 medium cauliflower (about 600 g), broken into 2.5 cm florets, 240 g unsweetened coconut yoghurt, 1 tsp (5 g) harissa paste or powder, Juice of 1 lime, 1 × 370 g can chickpeas, drained |
| `herby-sausage-and-roast-vegetable-bake` | Herby Sausage & Roast Vegetable Bake | plant-based | 8 vegan herb or Mediterranean-style sausages, 60 mL extra-virgin olive oil (15 mL for the sausages, 45 mL for the vegetables), 1 large red onion, sliced, 3 medium mixed capsicums, cut into large slices, 1 medium courgette, sliced into 1 cm half-moons |
| `sticky-aubergine-bao-buns` | Sticky Aubergine Bao Buns | plant-based | 225 g plain flour, plus extra for dusting, 3 g instant dried yeast (1 tsp), ¼ tsp salt, 15 g caster sugar, ½ tsp baking powder |
| `smoky-bbq-cauliflower-bites` | Smoky BBQ Cauliflower Bites | plant-based | 160 mL tomato ketchup, 1 garlic clove, grated, 90 g light brown sugar, 20 mL apple cider vinegar, 20 mL soy sauce or tamari |
| `summer-berry-vegan-meringue-nests` | Summer Berry Vegan Meringue Nests | plant-based | 180 mL aquafaba (the liquid from 1 × 400 g can chickpeas), chilled, ¼ tsp cream of tartar, 100 g caster sugar, 1½ tsp (7 mL) vanilla extract, 200 mL coconut cream, chilled and whipped, to serve (optional) |
| `chocolate-and-orange-dessert-pots` | Chocolate & Orange Dessert Pots | plant-based | 300 g silken tofu, 150 g dairy-free dark chocolate, 60 mL maple syrup, 1 orange, zest only, ½ tsp orange extract |
| `no-bake-chocolate-ginger-tart` | No-Bake Chocolate Ginger Tart | plant-based | 54 g coconut oil, plus extra for greasing the tin, 6 Medjool dates (about 120 g), pitted, 120 g ground almonds, 90 g desiccated coconut, 20 g stem ginger in syrup, finely chopped (half for the base, half for the filling) |
| `chocolate-chunk-banana-and-almond-loaf` | Chocolate Chunk Banana & Almond Loaf | plant-based | 70 mL unsweetened plant-based milk, 15 mL apple cider vinegar, 20 g ground flaxseed, 90 mL water, 150 g plain flour |
| `savoury-leek-pea-and-cheese-scones` | Savoury Leek, Pea & Cheese Scones | plant-based | 15 mL extra virgin olive oil, 1 medium leek, white and pale green parts, finely chopped, 90 g frozen peas, 180 mL unsweetened almond milk, 15 mL apple cider vinegar |
| `zesty-lemon-and-blueberry-cheesecake` | Zesty Lemon & Blueberry Cheesecake | plant-based | 65 g cashew nuts, 30 g coconut oil, plus extra for greasing the tin, 8 Medjool dates (about 150 g), pitted, 120 g ground almonds, 40 g cacao powder |
| `apple-maple-cinnamon-rolls` | Apple-Maple Cinnamon Rolls | matthew | 250 mL unsweetened almond milk, 7 g (1 sachet) active dry yeast, 310 g wholemeal flour, 125 mL pure maple syrup (80 mL for the dough, 30 mL for the filling, 15 mL to finish), 125 mL unsweetened apple sauce |
| `breakfast-hash` | Breakfast Hash | matthew | 15 mL extra-virgin olive oil, 900 g red-skinned potatoes, cut into bite-size pieces, 300 g plant-based breakfast sausages, sliced, Salt and black pepper, to season, 1 × 400 g can black beans (about 240 g drained), drained and rinsed |
| `roasted-cauliflower-and-sweet-potato` | Roasted Cauliflower and Sweet Potato | matthew | 1 × 400 g can chickpeas, no added salt, rinsed, 600 g cauliflower florets (about 2 cm pieces), 900 g sweet potatoes, peeled and cut into 2 cm cubes, 150 g onion, peeled and coarsely chopped, 1 tbsp mild curry powder |
| `smoky-mac-n-cheese` | Smoky Mac ‘n Cheese | matthew | 1 L water, for boiling the cashews, 150 g raw cashews, 8 g nutritional yeast, 2 tsp smoked paprika, 16 g tomato paste |
| `baked-tortilla-chips` | Baked Tortilla Chips | matthew | 4 corn tortillas, ¼ tsp sea salt, 10 mL freshly squeezed lime juice |
| `buffalo-cauliflower-bites` | Buffalo Cauliflower Bites | matthew | 80 g brown rice flour, 15 g ground almonds, 16 g tomato paste, 2 tsp garlic powder, 2 tsp onion powder |
| `carrot-and-white-bean-hummus` | Carrot and White Bean Hummus | matthew | 1 large carrot (about 150 g), peeled and cubed, 1 × 400 g can white beans (about 240 g drained), rinsed, 2 garlic cloves, minced, 30 mL lemon juice (about 1 large lemon), 45 mL tahini |
| `roasted-green-peas` | Roasted Green Peas | matthew | 300 g frozen green peas, thawed and blotted dry, 1 tsp olive oil, 1 tsp garlic salt |
| `zucchini-fries` | Zucchini Fries | matthew | 4 courgettes (about 700 g), ¼ tsp salt, 60 mL soy milk, 30 g nutritional yeast, 2 tbsp garlic powder |
| `zucchini-and-sweet-potato-tots` | Zucchini and Sweet Potato Tots | matthew | 250 g courgette, grated, 260 g sweet potato, peeled and grated, 1 tsp sea salt, 10 g ground flaxseed, 30 mL warm water |
| `cinnamon-raisin-peanut-butter-and-jelly` | Cinnamon Raisin Peanut Butter and Jelly | matthew | 16 g smooth peanut butter, 2 slices wholemeal bread, 5 g raspberry jam, 1 pinch ground cinnamon (about 0.3 g), 2 g chia seeds |
| `peanut-and-date-bites` | Peanut and Date Bites | matthew | 140 g unsalted roasted peanuts, 150 g pitted dates, ¼ tsp fine salt |
| `white-chocolate-and-cashew-skillet` | White Chocolate and Cashew Skillet | matthew | Vegan nonstick cooking spray, 145 g fine almond flour, ¼ tsp fine salt, 8 g cornflour, ¼ tsp baking powder |
| `mini-vegetable-sausage-rolls` | Mini Vegetable Sausage Rolls | nz-au | 15 mL olive oil, 1 small brown onion (about 100 g), finely diced, 1 carrot (about 100 g), grated, 1 courgette (about 150 g), grated and squeezed dry, 30 g tomato paste |
| `vegemite-dairy-free-cheese-pinwheels` | Vegemite & Dairy-Free Cheese Pinwheels | nz-au | 1 sheet vegan puff pastry (about 150 g), thawed, 10 g Vegemite, 100 g dairy-free grated cheese, 40 g baby spinach, finely chopped, 15 mL oat milk, for brushing |
| `carrot-orange-lunchbox-loaf` | Carrot & Orange Lunchbox Loaf | nz-au | 14 g ground flaxseed, 90 mL cold water, 280 g wholemeal flour, 2 tsp baking powder, 1 tsp bicarbonate of soda |
| `apple-cinnamon-oat-slice` | Apple & Cinnamon Oat Slice | nz-au | 3 medium apples (about 450 g), peeled, cored and diced, 40 mL water, 2 tsp ground cinnamon, 250 g rolled oats, 120 g wholemeal flour |
| `date-oat-seed-energy-slice` | Date, Oat & Seed Energy Slice | nz-au | 250 g pitted dates (about 12 medjool), 60 mL hot water, 150 g rolled oats, 60 g pumpkin seeds, 40 g sunflower seeds |
| `berry-coconut-yoghurt-cups` | Berry & Coconut Yoghurt Lunchbox Cups | nz-au | 200 g frozen or fresh mixed berries, 400 g unsweetened coconut yoghurt, 24 g chia seeds (2 tbsp), 30 mL pure maple syrup, 1 tsp vanilla extract |
| `lentil-mushroom-moussaka` | Lentil & Mushroom Moussaka | nz-au | 2 aubergines (about 700 g), cut into 1 cm slices, 60 mL olive oil, 700 g potatoes, peeled and cut into 5 mm slices, 1 brown onion (about 180 g), diced, 400 g button mushrooms, sliced |
