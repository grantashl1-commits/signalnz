# Recipe illustrations still needed

These 107 recipes have no drawing of their own and no picture of the same kind of dish, so the
Recipes tab shows a quiet placeholder (a fork and knife) instead of a picture of something else.

To add one: draw it in the house style (soft watercolour and ink, three-quarter view, on a transparent
background), save it as `public/images/recipes/meals/<id>.png`, add `"<id>": "/images/recipes/meals/<id>.png"`
to `src/data/recipe-image-files.json`, then run `python scripts/make-recipe-images-transparent.py`.
The recipe picks it up by its id.

| id | Recipe | Collection | Main ingredients |
| --- | --- | --- | --- |
| `dinner-ratatouille-beans` | Ratatouille with White Beans | library | tinned cannellini beans, eggplant, zucchini, red capsicum, brown onion |
| `dinner-eggplant-parmesan` | Eggplant Parmesan (Vegetarian) | library | eggplant, tinned crushed tomatoes, mozzarella cheese, Parmesan cheese, olive oil |
| `dinner-salmon-couscous` | Baked Salmon with Herbed Couscous | library | salmon fillet, couscous, boiling water, olive oil, lemon juice |
| `dinner-lamb-chops-mint` | Lamb Chops with Minted Peas & Quinoa | library | lamb chops, olive oil, quinoa, frozen peas, fresh mint |
| `kumara-capsicum-bake-with-eggs` | Smoky Kūmara and Capsicum Baked Eggs | library | kūmara, red capsicum, olive oil, smoked paprika, Pinch of salt |
| `green-beans-and-egg-with-lemon-tahini` | Green Beans and Egg with Lemon Tahini | library | green beans, spinach, large egg, tahini, lemon |
| `eggs-with-greens-and-peas` | Cloudy Eggs with Crushed Peas and Greens | library | olive oil, spring greens, frozen peas, passata, ground cumin |
| `kumara-spring-onion-and-pea-bake` | Kūmara, Spring Onion & Pea Bake | library | kūmara, stalk leek, spring onion, frozen peas, large eggs |
| `curried-rice-with-greens-and-salmon` | Curried Rice with Greens and Salmon | library | hot smoked salmon fillet, uncooked brown rice, olive oil, red onion, garlic |
| `mustard-greens-with-soft-egg-and-kūmara` | Roasted Kumara, Mustard Greens, Coddled Egg | library | baby kūmara, olive oil, fennel seeds, Pinch of sea salt, large silverbeet leaves |
| `creamy-butter-beans-with-rocket` | Creamy Butter Beans with Rocket and Toasted Seeds | library | butter beans, olive oil, garlic, cumin seeds, nigella seeds |
| `broad-bean-and-walnut-green-glow` | Broad Bean and Walnut Green Glow | library | frozen broad beans, baby spinach, small preserved lemon, walnuts, smoked paprika |
| `walnut-crusted-fish-with-red-cabbage` | Walnut-Crusted Fish with Braised Red Cabbage | library | firm white fish fillet, walnuts, wholemeal breadcrumbs, olive oil, red cabbage |
| `roasted-beetroot-and-rocket-with-crunchy-bread` | Crimson Roots, Leaf & Crisped Bread | library | large beetroot, ground cumin, olive oil, thick slice sourdough bread, pumpkin seeds |
| `sardine-lentil-brown-rice-bake` | Spiced Sardine & Lentil Brown Rice Bake | library | brown basmati rice, green lentils, tinned sardines in olive oil, frozen peas, fresh spinach |
| `lemon-herb-bean-tangle` | Lemon-Herb Bean Tangle | library | green beans, sugar snap peas, mixed beans, kalamata olives, fresh tarragon |
| `creamy-barley-with-mushrooms-and-swede` | Creamy Barley with Wild Mushrooms and Swede | library | dried wild mushrooms, olive oil, a small swede, garlic, dried thyme |
| `golden-rice-with-greens` | Golden Rice with Greens | library | brown rice, vegetable broth, frozen broad beans, frozen peas, fresh dill |
| `caribbean-black-eyed-peas-brown-rice` | Island-Spiced Black-Eyed Peas with Brown Rice | library | coconut oil, brown rice, black-eyed peas, green capsicum, spring onion |
| `creamy-green-rice-with-lemon-zest` | Creamy Green Rice with Lemon Zest | library | olive oil, a small leek, a stalk of celery, Arborio rice, dry white wine |
| `warming-spiced-tomato-rice` | Warming Spiced Tomato Rice | library | olive oil, cm piece fresh ginger, curry leaves, small carrot, brown basmati rice |
| `lentil-cauli-massaman-bake` | Lentil & Cauliflower Massaman Bake | library | small head cauliflower, olive oil, massaman curry paste, dried green lentils, vegetable broth or water |
| `roasted-chickpeas-green-beans-coconut` | Roasted Chickpeas with Crisp Green Beans and Toasted Coconut | library | 400g can chickpeas, green beans, olive oil, curry powder, Pinch of salt |
| `pan-fried-snapper-w-wilted-greens` | Pan-Fried Snapper with Wilted Greens | library | snapper fillet, olive oil, small handful  asparagus, cherry tomatoes, capers |
| `charred-corn-courgette-rocket-salad` | Charred Corn and Courgette with Rocket | library | black-eyed beans, cob sweetcorn, small red onion, courgette, olive oil |
| `baked-snapper-with-fennel-and-lentils` | Baked Snapper, Lemon Fennel Lentils | library | snapper fillet, olive oil, pinch of sea salt, pinch of black pepper, puy lentils |
| `cumin-roasted-kūmara-and-halloumi-stack` | Cumin-Roasted Kūmara and Halloumi Stack | library | small kūmara, red onion, brussels sprouts, halloumi, olive oil |
| `steamed-snapper-pak-choy` | Steamed Snapper with Pak Choy Ribbons | library | snapper fillet, small pak choy head, spring onion, 2cm piece fresh ginger, stalk lemongrass |
| `roasted-fennel-leek-white-beans-with-basil-notes` | Roasted Fennel & Leek with White Beans and Basil Notes | library | small fennel bulb, small leek, ½  can cannellini beans, olive oil, lemon |
| `creamy-kumara-peanut-pot` | Creamy Kūmara & Peanut Pot | library | kūmara, olive oil, ground turmeric, ground cardamom, Small pinch of ground cinnamon |
| `coconutty-black-bean-braise` | Coconutty Black Bean Braise | library | red capsicum, red onion, garlic, ground allspice, smoked paprika |
| `creamy-tempeh-and-greens-with-ginger-and-lime` | Creamy Tempeh and Greens with Ginger and Lime | library | tempeh, olive oil, small knob  fresh ginger, garlic, red curry paste |
| `persian-herbed-lentils-with-yoghurt` | Herbed Brown Lentils with Grounding Yoghurt | library | red onion, olive oil, ground cumin, smoked paprika, brown lentils |
| `saffron-prawn-and-fennel-warmth` | Saffron Prawns with Braised Fennel | library | olive oil, medium fennel bulb, small leek, tinned chopped tomatoes, smoked paprika |
| `braised-lentils-with-carrots-and-leek` | Braised Lentils with Carrots and Leek | library | puy lentils, carrot, leek, shallot, garlic |
| `celery-black-bean-braise` | Celery & Black Bean Braise | library | olive oil, spring onion, celery stalk, green capsicum, dried oregano |
| `creamy-mushroom-and-butter-bean-rice` | Creamy Mushroom and Butter Bean Rice | library | olive oil, garlic, mixed mushrooms, sprig fresh sage, brown rice |
| `walnut-white-bean-pot` | Walnut & White Bean Pot | library | spring onion, olive oil, pinch of dried thyme, ground juniper berries, walnuts |
| `cumin-spiced-fava-and-spinach` | Cumin-Spiced Fava and Spinach | library | cooked broad beans, olive oil, ground cumin, ground coriander seed, small clove garlic |
| `cinnamon-bean-orzo-bake` | Cinnamon Bean Orzo Bake | library | olive oil, medium stalk celery, ground cinnamon, dried oregano, can kidney beans |
| `ginger-tahini-cauliflower-and-sprouts` | Ginger-Tahini Cauliflower and Sprouts | library | cauliflower florets, olive oil, garlic, cm piece fresh ginger, tahini |
| `steamed-beans-seed-spice-embrace` | Steamed Greens, Seeds, and Black-Eyed Beans | library | green beans, olive oil, red onion, fennel seeds, coriander seeds |
| `black-bean-and-corn-soup-with-avocado` | Black Bean and Corn Quietude | library | canned black beans, canned chopped tomatoes, corn kernels, Pinch of ground cumin, Pinch of smoked paprika |
| `beetroot-chickpea-wild-rice-bowl` | Beetroot Wild Rice with Toasted Seeds | library | cooked wild rice blend, roasted beetroot, cooked chickpeas, rocket, walnuts |
| `braised-chickpeas-braising-greens` | Braised Chickpeas with Braising Greens | library | olive oil, red capsicum, ground cumin, smoked paprika, Pinch of chilli flakes |
| `kimchi-veggie-roll-with-tahini-drizzle` | Kimchi & Veggie Roll with Tahini Drizzle | library | large wholemeal wrap, hummus, kimchi, mixed salad greens, carrot |
| `one-pan-brown-rice-and-edamame-with-sesame` | One-Pan Brown Rice and Edamame with Sesame | library | cooked brown rice, frozen edamame beans, corn kernels, broccoli, carrot |
| `ginger-rocket-and-grape-whizz` | Ginger, Rocket & Grape Whizz | library | rocket, green grapes, 5cm knob fresh ginger, fresh lemon juice, cold water |
| `kiwi-mint-cool-down` | Kiwi Mint Cool Down | library | unsweetened almond milk, coconut water, kiwifruit, fresh mint leaves, lime |
| `lemon-herb-chickpea-quinoa` | Lemon-Herb Chickpeas with Quinoa | library | quinoa, cucumber, tomato, fresh flat-leaf parsley, spring onion |
| `herbaceous-lentil-potatoes` | Herbaceous Lentil Potatoes | library | red potatoes, fresh coriander, fresh mint, olive oil, plain unsweetened almond yoghurt |
| `creamy-edamame-and-avocado-dip` | Creamy Edamame and Avocado Dip | library | frozen shelled edamame, ripe avocado, loosely packed fresh coriander leaves, spring onions, lime |
| `morning-sun-sipper` | Morning Sun Sipper | library | medium tomato, red capsicum, cucumber, spring onion, fresh parsley leaves |
| `warm-miso-tofu-with-carrot-and-corn` | Warm Miso Tofu with Carrot and Corn | library | medium carrot, vegetable broth or water, white miso paste, frozen corn kernels, firm tofu |
| `toasted-sourdough-with-avocado-and-dukkah` | Toasted Sourdough with Avocado and Seed Dust | library | slices sourdough bread, ripe avocado, pecan halves, sesame seeds, fennel seeds |
| `warm-herbed-eggs` | Warm Herbed Eggs | library | large free-range eggs, sprig fresh parsley, flaky sea salt, grind black pepper |
| `lemon-herb-prawns-with-greens` | Lemon-Herb Prawns with Greens | library | olive oil, raw prawns, Pinch of sea salt, Pinch of black pepper, lemon |
| `spiced-bean-and-avocado-crisps` | Spiced Bean and Avocado Crisps | library | wholemeal wrap, nutritional yeast, tinned kidney beans, mild taco seasoning, small tomato |
| `herb-roasted-tempeh-and-kūmara` | Herb-Roasted Tempeh & Kūmara with Garden Greens | library | tempeh, red kūmara, carrot, olive oil, Pinch of sea salt |
| `leafy-greens-folded-eggs` | Leafy Greens Folded Eggs | library | large free-range eggs, milk, Pinch of sea salt, Crack of black pepper, extra virgin olive oil |
| `lemon-herb-chutney` | Lemon Herb Chutney | library | fresh coriander, fresh mint, green chilli, cm fresh ginger, lemon juice |
| `broccolini-ginger-sizzle` | Broccolini & Ginger Sizzle | library | broccolini, 1cm fresh ginger, garlic, red capsicum, mustard seeds |
| `golden-rice-chicken-greens` | Golden Rice with Chicken and Greens | library | cooked brown rice, cooked chicken breast, broccoli florets, red onion, olive oil |
| `lemon-herb-chickpea-greens` | Lemon-Herb Chickpea Greens | library | mixed leafy greens, cooked brown rice, cooked chickpeas, cherry tomatoes, cucumber |
| `earthen-lentil-top` | Earthen Lentil Top | library | drizzle olive oil, garlic, brown onion, medium carrot, stalk celery |
| `roasted-root-and-green-medley` | Roasted Root and Green Medley | library | –6 spears asparagus, broccoli, large kūmara, small red onion, olive oil |
| `sourdough-veggie-sausage-tomato-bake` | Sourdough, Veggie Sausage and Tomato Bake | library | veggie sausages, small leek, slices sourdough bread, cherry tomatoes, sprig fresh rosemary |
| `cumin-brown-rice-kidney-bean-tortilla` | Cumin Brown Rice Kidney Bean Tortilla | library | cooked brown rice, cooked kidney beans, sweetcorn kernels, ground cumin, water |
| `harissa-baked-cannellini-beans` | Harissa Baked Cannellini Beans | library | cannellini beans, capsicum, passata, harissa paste, spinach |
| `sriracha-kumara-hash` | Sriracha Kumara Hash with Cavolo Nero and Sweetcorn | library | kumara, red onion, cavolo nero, sweetcorn kernels, olive oil |
| `spicy-garlic-mushrooms-with-pomegranate-and-watercress` | Spicy Garlic Mushrooms with Pomegranate and Watercress | library | mixed mushrooms, red onion, garlic, ground cumin, smoked paprika |
| `baked-spiced-celeriac-hummus-pomelo` | Baked Spiced Celeriac with Chickpea, Pomelo and Rocket | library | celeriac, chickpeas, ground cumin, ground cardamom, olive oil |
| `masala-charred-greens-peanuts` | Masala Charred Greens with Peanuts | library | broccoli, olive oil, garam masala, cinnamon, roasted peanuts |
| `roasted-brassicas-sesame-miso-tofu` | Roasted Brassicas with Sesame Miso Tofu | library | Brussels sprouts, purple sprouting broccoli, firm tofu, olive oil, tamari |
| `marsala-beans-with-almond-picada` | Marsala Beans with Toasted Almonds and Courgette | library | medium courgette, heritage tomatoes, olive oil, smoked paprika, Pinch of sea salt |
| `creamy-luteal-chilli-lentils` | Creamy Luteal Chilli Lentils | library | olive oil, garlic, red chilli, fresh ginger, red lentils |
| `chicken-gumbo-aromatic` | Chicken Gumbo with Capsicum & Celery | library | boneless, olive oil, onion, stick celery, green capsicum |
| `fennel-orzo-with-broccoli` | Fennel and Orzo with Broccoli | library | a small fennel bulb, a small onion, olive oil, fennel seeds, white wine |
| `miso-butter-greens-with-sesame-brown-rice` | Miso-Butter Greens with Sesame Brown Rice | library | shiitake mushrooms, mangetout, asparagus spears, white miso paste, butter |
| `spicy-mushroom-tofu-shawarma-with-cucumber-yoghurt` | Spicy Mushroom and Tofu Shawarma with Cucumber Yoghurt | library | mixed mushrooms, firm tofu, red cabbage, pomegranate molasses, shawarma spices |
| `dark-chocolate-oat-bites` | Dark Chocolate Oat Bites | library | rolled oats, peanut butter, soft dates, dark chocolate chips, ground flaxseed |
| `asian-greens-black-bean-sauce` | Asian Greens with Black Bean Sauce and Vermicelli | library | sugar snap peas, pak choi, canned black beans, rice vermicelli, sliced celery hearts |
| `citrus-spiced-golden-milk` | Sunshine Citrus Turmeric Brew | library | almond milk, medium orange, ground turmeric, ground ginger, freshly ground black pepper to taste |
| `creamy-mango-ginger-sip` | Creamy Mango Ginger Sip | library | almond milk, almond milk yoghurt, frozen mango chunks, rinsed and drained brown lentils, ground ginger |
| `creamy-chocolate-lentil-pot` | Creamy Chocolate Lentil Pot with Peanuts and Cacao Nibs | library | frozen ripe banana, canned rinsed and drained lentils, almond milk, natural peanut butter, unsweetened cocoa powder |
| `raspberry-peanut-butter-bites` | Raspberry Peanut Butter Bites with Dark Chocolate | library | vegan butter, frozen raspberries, chia seeds, rice cake, natural peanut butter |
| `pan-fried-tofu-with-lime-and-oregano` | Pan-fried Tofu with Lime and Oregano | library | firm tofu, olive oil, pinch of salt, pinch of pepper, Marinade: 1 tbsp lime juice |
| `ginger-tofu-with-quinoa-and-greens` | Ginger Tofu with Quinoa and Greens | library | quinoa, olive oil, ginger, red chilli, firm tofu |
| `tahini-tofu-with-roasted-kūmara-and-brussels-sprouts` | Tahini Tofu with Roasted Kūmara and Brussels Sprouts | library | brown rice, firm tofu, medium kūmara, chickpeas, Brussels sprouts |
| `cashew-chicken-capsicum-bake-with-brown-rice` | Cashew Chicken & Capsicum Bake with Brown Rice | library | cooked brown rice, chicken breast, capsicum, head broccoli, spring onion |
| `kids-french-toast` | French Toast Fingers | kids | slices bread, eggs, milk, cinnamon, butter |
| `kids-sw-veggie-loaded-mince` | Veggie-Loaded Mince | kids | beef mince, carrot, zucchini, mushrooms, passata |
| `kids-vg-maple-tofu-bites` | Sticky Maple-Glazed Tofu Bites | kids | block firm tofu, maple syrup, coconut aminos or tamari, coconut oil |
| `kids-vg-chocolate-chickpea-spread` | Healthy Chocolate Chickpea Spread | kids | 400g tin chickpeas, date paste, cacao powder, Pinch of salt |
| `kids-vg-mango-fruit-leather` | Mango Chia Fruit Leather Rolls | kids | frozen mango, chia seeds |
| `kids-vg-spirulina-bites` | Green Dino Spirulina Bites | kids | large Medjool dates, hemp hearts, chia seeds, desiccated coconut, spirulina powder |
| `kids-fok-spiced-apple-couscous` | Spiced Apple Couscous | kids | whole wheat couscous, unsweetened apple juice, water, apple cored and diced, ground cinnamon |
| `kids-fok-herbed-popcorn` | Herbed Popcorn | kids | popcorn kernels, garlic powder, dried mixed herbs, onion powder, smoked paprika |
| `kids-fok-stuffed-potato-puffs` | Stuffed Potato Puffs | kids | lb Yukon Gold potatoes scrubbed, oz green beans minced, large carrot minced, fresh lime juice, garlic powder |
| `kids-fok-deviled-potatoes` | Deviled Potatoes | kids | small Yukon Gold potatoes scrubbed and halved lengthwise, unsweetened plant milk, prepared yellow mustard, pinch of ground turmeric, sea salt and white pepper |
| `kids-fok-quick-black-bean-tostadas` | Quick Black Bean Tostadas | kids | corn tortillas, recipe Black Bean Spread, small tomato finely chopped, scallions thinly sliced, shredded romaine lettuce |
| `kids-fok-buckwheat-sloppy-joes` | Buckwheat Sloppy Joes | kids | green or brown lentils rinsed, small onion diced, red bell pepper diced, garlic cloves minced, no-salt-added tomato paste |
| `kids-fok-white-bean-winter-cassoulet` | White Bean Winter Cassoulet | kids | white cannellini beans rinsed, small onion diced, carrots diced, celery stalks diced, garlic cloves minced |
| `kids-fok-polenta-and-lentil-loaf` | Polenta and Lentil Loaf | kids | green lentils rinsed, small onion diced, garlic cloves minced, dry polenta, red bell peppers finely chopped |
| `kids-fok-jambalaya` | Jambalaya | kids | small onion diced, green bell pepper diced, red bell pepper diced, celery stalks diced, garlic cloves minced |
| `kids-fok-tricolor-ice-creamcakes` | Tricolor Ice Creamcakes | kids | frozen mixed berries, medium bananas cut into pieces and frozen, frozen diced mango |
| `kids-fok-orange-n-berry-ice-pops` | Orange 'n Berry Ice Pops | kids | unsweetened pineapple juice, arrowroot powder, maple syrup, lemon juice, frozen or fresh berries pulsed |
