/**
 * One accent colour per catalogue category, sampled from each product's own
 * pack artwork (see BRAND-REFERENCE.md §4). Used as a CSS custom property
 * (`--spot`) so tints, chips and spotlight grounds all derive from one value.
 */
const ACCENTS: Record<string, string> = {
  "Immunity & Vitality": "#039c34",
  "Gut & Immunity": "#00a79d",
  "Brain & Development": "#d30f75",
  "Neuro Nutrition": "#24a3aa",
  "Women's Health": "#d63384",
  "Bone & Vitamin D": "#004799",
  "Liver Care": "#ee6b01",
  "Blood & Iron": "#f5970d",
  "Bone & Calcium": "#8c393b",
};

export function categoryAccent(category: string | null | undefined): string {
  return (category && ACCENTS[category]) || "#005c2d";
}
