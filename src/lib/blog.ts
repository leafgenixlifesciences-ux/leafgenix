/**
 * The journal. Four evergreen, educational pieces written in the same voice as
 * the rest of the site: specific, sourced, and free of disease claims. Each
 * post can point at one formulation in the range, but the article has to
 * stand on its own without it.
 *
 * Content lives here rather than in the database because it changes with a
 * deploy, is reviewed like code, and needs no admin UI.
 */

export type BlogBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "callout"; title?: string; text: string }
  | { kind: "table"; head: string[]; rows: string[][] };

export type BlogPost = {
  slug: string;
  title: string;
  /** One-line dek shown on cards and under the title. */
  excerpt: string;
  category: string;
  /** Hex used for the category chip and the card's tint. */
  accent: string;
  /** ISO date, Asia/Kolkata. */
  date: string;
  readMinutes: number;
  /** Product slug the piece naturally leads to, if any. */
  related?: string;
  takeaways: string[];
  blocks: BlogBlock[];
  sources: { label: string; url?: string }[];
};

export const posts: BlogPost[] = [
  {
    slug: "how-to-read-a-nutraceutical-label",
    title: "How to read a nutraceutical label in India",
    excerpt:
      "Sixty seconds with the back of the pack tells you more than the front ever will. Here is what each line means, and which ones to look for first.",
    category: "Label literacy",
    accent: "#005c2d",
    date: "2026-09-08",
    readMinutes: 6,
    related: "synvit-forte-tablets",
    takeaways: [
      "The composition table — ingredient, quantity per serving, % RDA — is the only part of the pack that cannot be dressed up.",
      "A 'proprietary blend' with one combined weight hides how little of each ingredient you are getting.",
      "Serving size and pack size are different numbers; work out how many days a pack actually lasts.",
      "The FSSAI licence number, the batch number and the manufacturer's name are what let you trace a product back to who made it.",
    ],
    blocks: [
      {
        kind: "p",
        text: "The front of a supplement pack is an advertisement. The back is a legal document. In India, a health supplement or nutraceutical is regulated as a food under the Food Safety and Standards Act, and the label has to carry a fixed set of declarations — which means the back of the pack is where two products that look identical from the shelf actually separate.",
      },
      { kind: "h2", text: "Start with the composition table" },
      {
        kind: "p",
        text: "Every nutraceutical has to list its ingredients with the quantity per serving, and for vitamins and minerals, the percentage of the Recommended Dietary Allowance that serving provides. The RDA used on Indian labels comes from ICMR-NIN's Nutrient Requirements for Indians, last revised in 2020. Two things to check: is a quantity printed beside every active, and is the serving size in the table the same serving you would actually take?",
      },
      {
        kind: "p",
        text: "A number like 66.66% RDA beside Vitamin D3 400 IU is doing real work — it tells you the 2020 adult allowance is 600 IU, and that one tablet covers two-thirds of it. Where the RDA has not been established for an ingredient, the label will say so with a dagger or a double asterisk. That is normal for things like spirulina, L-carnosine or probiotic strains; what it means is that you have to judge the dose against published research rather than against a government table.",
      },
      { kind: "h2", text: "The proprietary blend problem" },
      {
        kind: "p",
        text: "Some labels list a 'blend' or 'complex' — a group of ingredients followed by a single combined weight, say 500 mg. Regulations allow it. The trouble is that a 500 mg blend of six botanicals could be 480 mg of the cheapest one and a token sprinkle of the others, and there is no way to tell from the outside. When you see a blend, compare it with a product that prints each quantity separately. If a brand is confident in its doses, it has no reason to hide them.",
      },
      {
        kind: "callout",
        title: "The one-line test",
        text: "Can you find, for every active ingredient, a number with a unit beside it — mg, mcg, IU, CFU? If the answer is yes, the label is telling you the truth. If some ingredients only appear inside a blend, treat those quantities as unknown.",
      },
      { kind: "h2", text: "Serving size, pack size, and days of supply" },
      {
        kind: "p",
        text: "A pack of 10 tablets taken once a day is a 10-day supply. A syrup labelled 200 ml at 10 ml twice a day is also a 10-day supply, even though the bottle looks like it holds more. The price that matters is the price per day at the recommended dose — not the price per pack. Do the division before comparing two products.",
      },
      { kind: "h2", text: "What the regulatory lines mean" },
      {
        kind: "table",
        head: ["Line on the pack", "What it tells you"],
        rows: [
          ["FSSAI logo + 14-digit licence or registration number", "The business responsible for the product holds an FSSAI licence or registration; the number can be checked on the FSSAI website."],
          ["'Not for medicinal use'", "Mandatory on health supplements and nutraceuticals. The product is a food; it supports nutrition and is not a treatment."],
          ["'Not to exceed the recommended daily usage'", "The stated dose is the ceiling, not a suggestion. More is not better, especially for fat-soluble vitamins."],
          ["Manufactured by / Marketed by", "Who physically made the product and who sells it. In nutraceuticals these are often two different companies — both should be named with an address."],
          ["Batch number, Mfg. date, Expiry / Best before", "The batch number is what a company uses to trace a complaint back to a production run. Without it, nothing can be checked."],
          ["Veg / non-veg symbol", "Green symbol for vegetarian, brown for non-vegetarian. Fish-oil omega-3, bovine colostrum and some capsule shells are non-vegetarian."],
        ],
      },
      { kind: "h2", text: "Claims: what the pack is allowed to say" },
      {
        kind: "p",
        text: "Indian regulations allow nutrient-function claims — 'vitamin D contributes to the maintenance of normal bones', for instance — but not claims that a food prevents, treats or cures a disease. A pack, an advertisement or a website that promises to cure something is either breaking the rules or selling a drug, and in neither case should you buy it as a supplement. The safest brands make the smallest claims, and print the largest number of quantities.",
      },
      { kind: "h2", text: "A sixty-second checklist" },
      {
        kind: "numbered",
        items: [
          "Find the composition table. Is there a quantity and a unit beside every active?",
          "Is the serving size in the table the dose you will actually take?",
          "Work out days of supply per pack, then price per day.",
          "Check the FSSAI number, the manufacturer's name and address, and the batch number.",
          "Read the claims. Anything that promises to prevent or cure is a red flag.",
          "Look at the expiry date and the storage instruction — probiotics and omega-3 in particular are sensitive to heat.",
        ],
      },
      {
        kind: "p",
        text: "None of this takes longer than a minute once you know where to look. It is the minute that separates a supplement you understand from one you are hoping about.",
      },
    ],
    sources: [
      {
        label: "Food Safety and Standards (Health Supplements, Nutraceuticals, Food for Special Dietary Use, Food for Special Medical Purpose, and Prebiotic and Probiotic Food) Regulations, 2022 — FSSAI",
        url: "https://www.fssai.gov.in/",
      },
      {
        label: "Food Safety and Standards (Labelling and Display) Regulations, 2020 — FSSAI",
        url: "https://www.fssai.gov.in/",
      },
      {
        label: "Nutrient Requirements for Indians — Recommended Dietary Allowances and Estimated Average Requirements, ICMR-NIN, 2020",
        url: "https://www.nin.res.in/",
      },
    ],
  },

  {
    slug: "vitamin-d-in-india-what-the-number-means",
    title: "Vitamin D: why so many Indians test low, and what the number on the report means",
    excerpt:
      "A sun-rich country with widespread deficiency sounds like a contradiction. It is not — and the explanation changes how you should think about testing and dosing.",
    category: "Nutrients",
    accent: "#004799",
    date: "2026-09-01",
    readMinutes: 7,
    related: "md3-nano-shot",
    takeaways: [
      "Skin makes vitamin D from UVB, which is filtered by glass, clothing, pollution, early-morning and late-evening sun, and darker skin — so 'living in India' does not settle it.",
      "The blood test is 25-hydroxyvitamin D. Reference ranges differ between guidelines; know which one your lab is using.",
      "ICMR-NIN's 2020 allowance for adults is 600 IU a day. Correction courses of 60,000 IU a week are a different thing and belong with a doctor and a test result.",
      "Vitamin D is fat-soluble: take it with a meal, and do not stack products that each contain it without adding the totals.",
    ],
    blocks: [
      {
        kind: "p",
        text: "Indian studies have found low vitamin D levels in a majority of the people they tested, across cities, age groups and income levels. For a country with this much sun, that surprises people every time. The reason is that vitamin D is not made from sunlight in general. It is made from a narrow band of ultraviolet light — UVB — reaching bare skin, and most of the way modern Indians live keeps UVB away from skin.",
      },
      { kind: "h2", text: "Why the sun is not enough" },
      {
        kind: "bullets",
        items: [
          "UVB does not pass through window glass. Sun on your arm in a car, an office or a balcony behind glass produces no vitamin D.",
          "UVB is strongest around midday. Early-morning and late-evening sun, which is when most people are outdoors, carries little of it.",
          "Air pollution and haze absorb UVB before it reaches the ground, which is one reason urban levels tend to be lower than rural ones.",
          "Clothing that covers the arms and legs, and sunscreen, both block it — for good reasons of their own.",
          "Melanin, the pigment in darker skin, is a natural UVB filter. The same exposure produces less vitamin D in darker skin than in lighter skin.",
          "Very few Indian foods contain meaningful vitamin D. Fortified milk and oils help, but a typical vegetarian diet provides little.",
        ],
      },
      { kind: "h2", text: "What the blood test measures" },
      {
        kind: "p",
        text: "The test your doctor orders is 25-hydroxyvitamin D, written 25(OH)D, reported in ng/mL in most Indian labs (some use nmol/L; multiply ng/mL by 2.5 to convert). It reflects your stores over the previous few weeks. The complication is that there is no single agreed cut-off. Two widely used sets of ranges:",
      },
      {
        kind: "table",
        head: ["25(OH)D, ng/mL", "US Institute of Medicine (2011)", "Endocrine Society (2011)"],
        rows: [
          ["Below 12", "Deficient", "Deficient"],
          ["12 – 20", "Inadequate for some people", "Deficient"],
          ["20 – 30", "Sufficient for nearly everyone", "Insufficient"],
          ["30 and above", "Sufficient", "Sufficient"],
        ],
      },
      {
        kind: "p",
        text: "So a reading of 24 ng/mL is 'sufficient' by one guideline and 'insufficient' by the other. Your lab report will print one set of ranges; it is worth knowing which. What both agree on is that below 12 ng/mL is genuinely deficient, and that levels above about 100 ng/mL are too high — vitamin D can be overdone, which is the strongest argument for testing before taking large doses.",
      },
      { kind: "h2", text: "Maintenance dose versus correction dose" },
      {
        kind: "p",
        text: "ICMR-NIN's 2020 recommendation for adults is 600 IU of vitamin D a day, with the note that it assumes limited sun exposure. That is a maintenance figure: enough to hold a normal level steady. It is a very different thing from the 60,000 IU once-a-week course that doctors commonly prescribe for a few weeks to bring a low level up. Both are legitimate; they answer different questions. A daily 400–600 IU product is for keeping a level. A weekly 60,000 IU product is for correcting one, and it should follow a test, with a dose and duration set by the doctor.",
      },
      {
        kind: "callout",
        title: "Do not stack without adding up",
        text: "Multivitamins, calcium tablets, fortified milk and omega-3 syrups often each contain vitamin D. Individually the amounts are modest; together they can be more than you think. Read every label you are already taking before adding another.",
      },
      { kind: "h2", text: "D3 or D2, and why the meal matters" },
      {
        kind: "p",
        text: "Cholecalciferol (D3) is the form the skin makes and the one most supplements use; ergocalciferol (D2) comes from plant and fungal sources. At the same dose, D3 raises and holds blood levels somewhat better. Either way, vitamin D is fat-soluble: it is absorbed along with dietary fat, which is why the standard advice is to take it with a meal rather than on an empty stomach, and why the form of the product — an oil-based solution versus a dry granule dissolved in water — affects how much of the dose gets in.",
      },
      { kind: "h2", text: "Who should test" },
      {
        kind: "p",
        text: "Anyone who spends the working day indoors, anyone with persistent tiredness or muscle aches without another explanation, pregnant and breastfeeding women, older adults, and anyone about to start a high-dose course. The test is inexpensive and available at every diagnostic chain. Testing once, correcting if needed, and then maintaining is a far better plan than taking high doses indefinitely on the assumption that you must be low.",
      },
    ],
    sources: [
      {
        label: "Nutrient Requirements for Indians, ICMR-NIN, 2020 — vitamin D allowance of 600 IU/day for adults",
        url: "https://www.nin.res.in/",
      },
      {
        label: "Institute of Medicine. Dietary Reference Intakes for Calcium and Vitamin D. National Academies Press, 2011",
        url: "https://nap.nationalacademies.org/catalog/13050",
      },
      {
        label: "Holick MF et al. Evaluation, Treatment, and Prevention of Vitamin D Deficiency: an Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab, 2011",
        url: "https://doi.org/10.1210/jc.2011-0385",
      },
    ],
  },

  {
    slug: "omega-3-for-children-epa-dha-explained",
    title: "Omega-3 for children: EPA, DHA and what a teaspoon actually contains",
    excerpt:
      "'Fish oil 1000 mg' on the front and '180 mg EPA + 120 mg DHA' on the back are describing the same capsule. Learning to read the second number is the whole skill.",
    category: "Nutrients",
    accent: "#d30f75",
    date: "2026-08-25",
    readMinutes: 6,
    related: "edo-well-syrup",
    takeaways: [
      "There are three dietary omega-3s. ALA from flaxseed and walnuts converts to EPA and DHA very inefficiently; the marine forms are what the research is about.",
      "The number that matters is milligrams of EPA and DHA per dose — not milligrams of 'fish oil' or 'omega-3'.",
      "European regulators consider about 250 mg of EPA plus DHA a day an adequate intake for adults and apply the same figure to children over two.",
      "Omega-3 oxidises. Fishy taste or smell in a syrup is a sign the oil has gone off; store it cool and closed.",
    ],
    blocks: [
      {
        kind: "p",
        text: "Omega-3 is one of the few supplement categories where the label arithmetic is genuinely confusing, and where parents are most often sold a smaller dose than they think they are buying. This piece is the arithmetic.",
      },
      { kind: "h2", text: "Three omega-3s, not one" },
      {
        kind: "p",
        text: "Alpha-linolenic acid (ALA) is the plant omega-3, found in flaxseed, chia and walnuts. Eicosapentaenoic acid (EPA) and docosahexaenoic acid (DHA) are the marine omega-3s, found in oily fish and in algae. The body can convert ALA into EPA and DHA, but the conversion is poor — typically a few percent to EPA and well under one percent to DHA. That is why a diet rich in flaxseed does not reliably raise DHA, and why supplements are formulated with the marine forms directly.",
      },
      {
        kind: "p",
        text: "DHA is a structural fat: it is concentrated in the membranes of brain and retinal cells, and it is the omega-3 with the clearest role in children. Regulators in Europe have authorised the claim that DHA contributes to the maintenance of normal brain function and normal vision, at an intake of 250 mg a day, and that DHA contributes to the normal visual development of infants up to twelve months. These are carefully worded nutrient-function claims, not promises about intelligence or school performance — and any product that makes those is overreaching.",
      },
      { kind: "h2", text: "Reading the number that matters" },
      {
        kind: "p",
        text: "A capsule labelled 'Fish oil 1000 mg' typically contains about 300 mg of actual EPA and DHA combined; the rest is other fats. A syrup labelled 'Omega-3' may contain anything. The only figure to compare across products is EPA and DHA in milligrams per dose, and the dose has to be the one a child will actually take. A syrup that lists 400 mg EPA and 300 mg DHA per 5 ml delivers 700 mg of the marine omega-3s in a teaspoon; most children's omega-3 syrups deliver 50 to 100 mg of DHA per dose. Both can be perfectly good products, but they are not the same product, and the front label will not tell you which one you are holding.",
      },
      {
        kind: "table",
        head: ["Label says", "What to look for on the back"],
        rows: [
          ["Fish oil 1000 mg", "EPA + DHA per capsule, usually 300 mg or so"],
          ["Omega-3 syrup", "EPA and DHA per 5 ml or per 10 ml — and which one the dosing instruction uses"],
          ["Flaxseed oil / ALA", "Contains no EPA or DHA unless separately added"],
          ["Algal DHA (vegetarian)", "DHA per dose; EPA is usually low or absent"],
        ],
      },
      { kind: "h2", text: "How much is enough" },
      {
        kind: "p",
        text: "The European Food Safety Authority considers 250 mg of EPA plus DHA a day an adequate intake for adults, and applies the same figure to children from two to eighteen. Indian dietary guidance from ICMR-NIN sets omega-3 as a share of total fat intake rather than a milligram figure, and recognises that typical Indian diets are low in the marine forms. Neither is a maximum, and neither is a target for a child who eats oily fish twice a week — that child is likely already there. For a vegetarian child, or one who will not eat fish, a supplement is the practical route.",
      },
      {
        kind: "callout",
        title: "Syrup or capsule?",
        text: "Younger children cannot swallow a large capsule, and chewing one releases the taste of fish oil, which ends most families' omega-3 plans within a week. A flavoured syrup exists for that reason. The trade-off is that a syrup is measured, not pre-portioned, so use the measuring cap rather than a kitchen spoon.",
      },
      { kind: "h2", text: "Freshness, storage, and the fishy-burp test" },
      {
        kind: "p",
        text: "EPA and DHA are highly unsaturated, which means they oxidise readily when exposed to heat, light and air. Oxidised oil smells and tastes fishy and has lost some of its value. Keep syrups closed, out of sunlight and below 25°C, finish an opened bottle within the period stated on the label, and treat a strong fishy smell as a sign to discard it. A good syrup at the recommended dose should not cause fishy reflux; if it does, the oil, not the child, is the problem.",
      },
      {
        kind: "p",
        text: "Omega-3 works structurally, over months. It is not something you will notice in a fortnight. Choose a product by the EPA and DHA numbers, give it consistently, and let the paediatrician set the dose for a child's age and weight.",
      },
    ],
    sources: [
      {
        label: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific Opinion on Dietary Reference Values for fats, including omega-3 fatty acids. EFSA Journal, 2010",
        url: "https://doi.org/10.2903/j.efsa.2010.1461",
      },
      {
        label: "Commission Regulation (EU) No 432/2012 — authorised health claims for DHA (brain function, vision, infant visual development)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32012R0432",
      },
      {
        label: "Nutrient Requirements for Indians, ICMR-NIN, 2020 — fat and essential fatty acid recommendations",
        url: "https://www.nin.res.in/",
      },
    ],
  },

  {
    slug: "probiotics-cfu-strains-and-colostrum",
    title: "Probiotics: what CFU, strain names and 'with colostrum' actually mean",
    excerpt:
      "Two sachets can both say '5 billion' and be very different products. The genus, the species, the strain and the storage line tell you which is which.",
    category: "Gut health",
    accent: "#00a79d",
    date: "2026-08-12",
    readMinutes: 6,
    related: "probion-colostrum-probiotic",
    takeaways: [
      "A probiotic is defined by strain, not by the word 'probiotic'. Look for the full three-part name, e.g. Lactobacillus rhamnosus GG.",
      "CFU is a count of live organisms. The honest number is the count guaranteed at the end of shelf life, not at manufacture.",
      "More CFU is not automatically better; the studied dose for most strains is in the range of one to ten billion a day.",
      "Space a probiotic at least two hours away from an antibiotic dose so the bacteria are not killed on arrival.",
    ],
    blocks: [
      {
        kind: "p",
        text: "The World Health Organization and the FAO defined probiotics in 2001 as live microorganisms which, when administered in adequate amounts, confer a health benefit on the host. Every word in that sentence is doing something: live, adequate amount, and a benefit that has been shown for that organism. A product earns the name by meeting all three, not by printing it on a sachet.",
      },
      { kind: "h2", text: "Genus, species, strain" },
      {
        kind: "p",
        text: "Bacteria are named in three parts. Lactobacillus is a genus. Lactobacillus rhamnosus is a species. Lactobacillus rhamnosus GG is a strain — a specific, catalogued organism, and the level at which research is done and benefits are shown. Two strains of the same species can behave quite differently in the gut. A label that stops at the species ('Lactobacillus acidophilus') is telling you less than one that names the strain, and a label that just says 'probiotic blend' is telling you almost nothing.",
      },
      {
        kind: "p",
        text: "Some names you will see on Indian labels: Lactobacillus rhamnosus GG, one of the most studied strains in children; Saccharomyces boulardii, which is a yeast rather than a bacterium and is therefore unaffected by antibacterial antibiotics; Bifidobacterium longum, a common resident of the infant gut; and Bacillus coagulans (often labelled by its older name, Lactobacillus sporogenes), a spore-former that survives heat and stomach acid well.",
      },
      { kind: "h2", text: "What CFU means, and when it is counted" },
      {
        kind: "p",
        text: "CFU stands for colony-forming units: the number of live organisms in a dose, measured by how many colonies grow when a sample is cultured. Five billion CFU is written 5 × 10⁹. The number to ask about is when it was counted. Organisms die slowly in the pack, faster in heat, so a count 'at time of manufacture' can be far higher than what is left when you open it. A count guaranteed 'at end of shelf life' or 'until expiry' is the honest figure, and it is why the storage instruction on a probiotic pack is not decoration.",
      },
      {
        kind: "callout",
        title: "Is 50 billion better than 5 billion?",
        text: "Not automatically. Most of the published trials for the common strains used somewhere between one and ten billion CFU a day. A higher count from an unnamed strain is worth less than a studied dose of a named one. Match the product to the research, not to the biggest number on the shelf.",
      },
      { kind: "h2", text: "Prebiotic, probiotic, synbiotic" },
      {
        kind: "p",
        text: "A prebiotic is not an organism at all; it is a substrate — typically a fibre such as fructo-oligosaccharide or inulin — that the beneficial bacteria feed on. A probiotic is the organism. A product that combines the two is sometimes called a synbiotic, on the logic that arriving bacteria establish more readily when their food arrives with them. Bovine colostrum, the first milk a cow produces after calving, is used in some Indian formulations in this supporting role: it is rich in immunoglobulins and growth factors and is thought to help the introduced strains settle. It is a non-vegetarian ingredient, which the pack has to declare with the brown non-vegetarian symbol.",
      },
      { kind: "h2", text: "Taking it with antibiotics" },
      {
        kind: "p",
        text: "Probiotics are most often bought during or just after a course of antibiotics. The practical rule is spacing: take the probiotic at least two hours away from the antibiotic dose, so that the antibiotic has been absorbed before the bacteria arrive. Saccharomyces boulardii, being a yeast, is not affected by antibacterial antibiotics and can be taken alongside them. Continue the probiotic for a week or two after the antibiotic course finishes, which is when the gut is repopulating.",
      },
      { kind: "h2", text: "Who should ask first" },
      {
        kind: "p",
        text: "Probiotics are food-grade organisms and are well tolerated by most people, but they are live organisms. Anyone with a seriously weakened immune system, anyone with a central line or recent major surgery, premature infants, and infants under a year should not be given a probiotic without a doctor's say-so. For everyone else, the questions to settle are the same ones as for any supplement: which strains, how many CFU at expiry, and how to store it.",
      },
    ],
    sources: [
      {
        label: "FAO/WHO. Health and Nutritional Properties of Probiotics in Food including Powder Milk with Live Lactic Acid Bacteria. Expert consultation report, 2001",
        url: "https://www.fao.org/3/a0512e/a0512e.pdf",
      },
      {
        label: "Hill C et al. The International Scientific Association for Probiotics and Prebiotics consensus statement on the scope and appropriate use of the term probiotic. Nat Rev Gastroenterol Hepatol, 2014",
        url: "https://doi.org/10.1038/nrgastro.2014.66",
      },
      {
        label: "Food Safety and Standards (Health Supplements, Nutraceuticals, Food for Special Dietary Use, Food for Special Medical Purpose, and Prebiotic and Probiotic Food) Regulations, 2022 — FSSAI",
        url: "https://www.fssai.gov.in/",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function otherPosts(slug: string, limit = 3): BlogPost[] {
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}

/** Posts newest first — the order the index shows them in. */
export const postsByDate = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
