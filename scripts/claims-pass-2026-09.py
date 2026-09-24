"""Sept 2026 claims pass — the 12-point content review.

Applies the copy changes to data/products.json (the seed copy) and prints
the matching SQL for the live `products` table so both stay identical.
"""
import json, sys

SEED = "data/products.json"
products = json.load(open(SEED, encoding="utf-8"))
by = {p["slug"]: p for p in products}
changed = {}


def edit(slug, field, fn):
    p = by[slug]
    before = json.dumps(p[field], ensure_ascii=False)
    p[field] = fn(p[field])
    if json.dumps(p[field], ensure_ascii=False) != before:
        changed.setdefault(slug, set()).add(field)


def sub(old, new):
    def f(v):
        assert old in v, f"missing: {old!r}"
        return v.replace(old, new)
    return f


def sub_list(pairs):
    def f(items):
        out = []
        for it in items:
            for old, new in pairs:
                if it == old:
                    it = new
            out.append(it)
        return out
    return f


# ---------------------------------------------------------------- Synvit-Forte
S = "synvit-forte-tablets"
edit(S, "badge", lambda v: "New-generation antioxidant")
edit(S, "uses", sub_list([
    ("Antioxidant cover against free-radical damage",
     "Antioxidant support from spirulina and the vitamin blend"),
]))
edit(S, "key_benefits", sub_list([
    ("Aids production of thymic hormones necessary for the defence system",
     "Supports normal immune function"),
    ("Counters the effects of physical and mental stress",
     "Nutritional support during physical and mental stress"),
    ("Prevents free-radical damage to cells — supports protection against heart disease and premature ageing",
     "Antioxidant support — helps protect cells from oxidative stress"),
    ("Delivers vitamins and minerals necessary even for healthy individuals to prevent degenerative disease",
     "Fills everyday vitamin and mineral gaps, even in an otherwise healthy diet"),
]))
def synvit_faqs(faqs):
    for f in faqs:
        if f["q"] == "Will it help if my diet is already good?":
            f["a"] = ("Even a good diet can fall short on a few nutrients — vitamin D and marine "
                      "omega-3 are the usual gaps in Indian diets. If your diet is genuinely varied "
                      "you may need less; Synvit-Forte is there to cover the gaps.")
    return faqs
edit(S, "faqs", synvit_faqs)
def synvit_diff(items):
    for d in items:
        if d["title"] == "One tablet, three supplements":
            d["body"] = ("Spirulina, marine omega-3 and a full 21-nutrient multivitamin are usually "
                         "three separate purchases. Synvit-Forte combines all three at stated "
                         "strength in a single daily tablet.")
    return items
edit(S, "differentiators", synvit_diff)

# --------------------------------------------------------------------- Probion
P = "probion-colostrum-probiotic"
edit(P, "badge", lambda v: "Pre + probiotic with colostrum")
edit(P, "short_description", sub("One sachet a day, for all ages, in a strawberry flavour children will actually take.",
                                 "One sachet a day, for children and adults, in a strawberry flavour children will actually take."))
edit(P, "description", sub("a single strawberry-flavoured sachet a day, suitable for all ages, covering gut health and immune support together.",
                           "a single strawberry-flavoured sachet a day, for children and adults alike, covering gut health and immune support together."))
edit(P, "key_benefits", sub_list([
    ("One sachet a day, suitable for all ages", "One sachet a day, for children and adults"),
]))
def probion_specs(specs):
    for s in specs:
        if s["label"] == "Suitable for":
            s["value"] = "Children and adults — ask a paediatrician for infants"
    return specs
edit(P, "specifications", probion_specs)
def probion_faqs(faqs):
    for f in faqs:
        if f["q"] == "Can children take Probion?":
            f["a"] = ("Yes — the strawberry flavour is designed with children in mind. For infants "
                      "under one year, check with your paediatrician first.")
    return faqs
edit(P, "faqs", probion_faqs)

# -------------------------------------------------------------------- Edo Well
E = "edo-well-syrup"
edit(E, "short_description", sub("Complete brain development support across every age group, in a mango-flavoured syrup.",
                                 "Nutritional support for brain function, from children to the elderly, in a mango-flavoured syrup."))
edit(E, "uses", sub_list([
    ("Brain development support in children", "Omega-3 (DHA) nutritional support for children's brain development"),
]))
edit(E, "key_benefits", sub_list([
    ("Complete brain development support across all age groups",
     "Omega-3 DHA and EPA to support normal brain function, for children and adults"),
]))
def edo_faqs(faqs):
    for f in faqs:
        if f["q"] == "Can my child take it?":
            f["a"] = ("Yes — the syrup format is designed with children in mind. Ask your "
                      "paediatrician for the right dose by age and weight.")
    return faqs
edit(E, "faqs", edo_faqs)
def edo_diff(items):
    for d in items:
        if d["title"] == "One product for the whole age range":
            d["title"] = "One syrup, children to elderly"
            d["body"] = ("The same syrup suits children's omega-3 needs and adults or elderly users "
                         "who want a capsule-free format. Very few products in this category cover "
                         "both ends properly.")
    return items
edit(E, "differentiators", edo_diff)

# --------------------------------------------------------------------- L-Sharp
L = "l-sharp-400-syrup"
edit(L, "badge", lambda v: "L-Carnosine 400 mg / 5 ml")
edit(L, "tagline", lambda v: "L-Carnosine neuro nutrition, backed by cited research")
def lsharp_specs(specs):
    for x in specs:
        if x["label"] == "Classification":
            x["value"] = "Nutraceutical — supportive nutrition alongside standard care"
    return specs
edit(L, "specifications", lsharp_specs)
edit(L, "short_description", sub("A universal neuroprotective studied as a supportive adjuvant in neurodevelopmental, psychiatric and neurodegenerative disorders.",
                                 "A dipeptide studied as supportive nutrition alongside standard care in neurodevelopmental, psychiatric and neurodegenerative conditions."))

# ------------------------------------------------------------------------- MD3
M = "md3-nano-shot"
edit(M, "tagline", lambda v: "For a rapid rise in Vitamin D3 levels")

# ----------------------------------------------------------------- Perfect Liv
V = "perfect-liv-syrup"
edit(V, "tagline", lambda v: "An Ayurvedic hepatoprotective syrup")
edit(V, "key_benefits", sub_list([
    ("Protects the biggest organ in the best way", "Everyday support for the liver, in a classical Ayurvedic form"),
]))

# ------------------------------------------------------------------- write out
json.dump(products, open(SEED, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(SEED, "a", encoding="utf-8").write("\n")

TEXT = {"badge", "tagline", "short_description", "description"}
ARR = {"uses", "key_benefits"}
JSONB = {"faqs", "specifications", "differentiators"}


def lit(v):
    return "$q$" + v + "$q$"


sql = ["begin;"]
for slug, fields in changed.items():
    p = by[slug]
    sets = []
    for f in sorted(fields):
        v = p[f]
        if f in TEXT:
            sets.append(f"{f} = {lit(v)}")
        elif f in ARR:
            arr = "array[" + ", ".join(lit(x) for x in v) + "]::text[]"
            sets.append(f"{f} = {arr}")
        elif f in JSONB:
            sets.append(f"{f} = {lit(json.dumps(v, ensure_ascii=False))}::jsonb")
    sql.append(f"update public.products set {', '.join(sets)}, updated_at = now() where slug = '{slug}';")
sql.append("commit;")
open("/tmp/claude-0/claims.sql", "w", encoding="utf-8").write("\n".join(sql) + "\n")
print("changed:", {k: sorted(v) for k, v in changed.items()})

# 10 Sept: "Pack size" spec row synced to products.pack_size (Synvit said 30 Tablets,
# Probion said 10 Sachets) — applied directly in SQL and in the seed.
