/**
 * Renders the product carousel imagery — six frames per product:
 *   1  pack front        4  key actives card
 *   2  pack, angled      5  benefits card
 *   3  label detail      6  how to take it
 *
 * Run:  node scripts/generate-product-images.mjs
 * Output: public/products/<slug>-1.jpg … -6.jpg  (1200 × 1500, white)
 *
 * When the real photography arrives, drop the files in with the same names
 * and nothing else has to change — the gallery column already points at them.
 */
import { chromium } from "playwright";
import { mkdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "products");
const SEED = path.join(__dirname, "..", "data", "products.json");

const LOOK = {
  "synvit-forte-tablets":      { shape: "box",    a: "#029C34", b: "#EC7D0A", tint: "#EAF7EE" },
  "probion-colostrum-probiotic":{ shape: "sachet", a: "#00A79D", b: "#E5007E", tint: "#E9F7F6" },
  "edo-well-syrup":            { shape: "bottle", a: "#D30F75", b: "#06A6D8", tint: "#FCEBF3" },
  "l-sharp-400-syrup":         { shape: "bottle", a: "#24A3AA", b: "#B61571", tint: "#E8F5F6" },
  "md3-nano-shot":             { shape: "vial",   a: "#004799", b: "#ED940D", tint: "#E8EFF8" },
  "perfect-liv-syrup":         { shape: "bottle", a: "#EE6B01", b: "#029C34", tint: "#FDF0E4" },
  "haemerange-syrup":          { shape: "bottle", a: "#F5970D", b: "#1B2A5E", tint: "#FEF3E3" },
  "calcin-k27-softgel":        { shape: "box",    a: "#8C393B", b: "#ED940D", tint: "#F7EDED" },
};

const GREEN = "#005C2D";
const ORANGE = "#ED940D";

const MARK = `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8">
<path d="M33.5 5.5S12.8 3.8 7.4 14.2c-5.4 10.4 1.3 19.5 1.3 19.5S26 34.9 31.4 24.5c4.6-8.8 2.1-19 2.1-19Z" stroke-linejoin="round"/>
<path d="M33.5 5.5 5 35" stroke-linecap="round"/>
<path d="M26.6 12.4c-4.2-1.5-8.1.4-9.4 4.3-1.3 3.9 1.3 7.6 5.3 8.6" stroke-linecap="round"/></svg>`;

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* --------------------------------------------------------------- shells */

function packLabel(p, look, compact = false) {
  return `
    <div class="lbl">
      <div class="lbl-top">
        <span class="brandmark">${MARK}<b>LEAF GENIX</b></span>
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
      </div>
      <div class="lbl-name">${esc(p.name)}</div>
      <div class="lbl-form">${esc(p.form)}${p.flavour ? ` · ${esc(p.flavour)}` : ""}</div>
      <div class="lbl-rule"></div>
      ${compact ? "" : `<div class="lbl-strap">${esc(p.tagline)}</div>`}
      <div class="lbl-foot">
        <span class="lbl-pack">${esc(p.pack_size)}</span>
        <span class="lbl-cert">WHO-GMP<br>NUTRACEUTICAL</span>
      </div>
    </div>`;
}

function pack(p, look, angled = false) {
  const cls = angled ? "pack angled" : "pack";
  if (look.shape === "sachet") {
    return `<div class="${cls} sachet"><div class="crimp"></div>${packLabel(p, look)}<div class="crimp bot"></div></div>`;
  }
  if (look.shape === "vial") {
    return `<div class="${cls} vial"><div class="cap"></div><div class="neck"></div>${packLabel(p, look, true)}</div>`;
  }
  if (look.shape === "bottle") {
    return `<div class="${cls} bottle"><div class="cap"></div><div class="shoulder"></div>${packLabel(p, look)}</div>`;
  }
  return `<div class="${cls} box"><div class="boxtop"></div>${packLabel(p, look)}</div>`;
}

/* ---------------------------------------------------------------- pages */

const shell = (look, body, kind = "") => `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:1500px;background:#fff;font-family:Archivo,sans-serif;color:#132a1e;
     position:relative;overflow:hidden;display:grid;place-items:center}
.stage{position:absolute;inset:0;display:grid;place-items:center}
.wash{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:900px;height:900px;border-radius:50%;
      background:radial-gradient(circle at 42% 34%, ${look.tint}, ${look.tint}00 66%)}
.floor{position:absolute;left:50%;bottom:196px;transform:translateX(-50%);width:620px;height:44px;border-radius:50%;
       background:radial-gradient(ellipse at center, rgba(19,42,30,.20), rgba(19,42,30,0) 70%)}
.hdr{position:absolute;top:64px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:11px;
     color:${GREEN};z-index:5}
.hdr svg{width:30px;height:30px}
.hdr b{font-size:27px;font-weight:700;letter-spacing:-.01em}
.hdr b i{font-style:normal;font-weight:400;opacity:.62}
.ftr{position:absolute;bottom:58px;left:0;right:0;text-align:center;font-size:15px;letter-spacing:.24em;
     text-transform:uppercase;color:#7b8b81;z-index:5}

/* ---- pack shells ---- */
.pack{position:relative;z-index:3;filter:drop-shadow(0 46px 46px rgba(19,42,30,.22))}
.pack.angled{transform:perspective(1900px) rotateY(-19deg) rotateX(4deg) rotate(-2.5deg)}
.bottle{width:404px;height:602px;border-radius:30px 30px 22px 22px;
  background:linear-gradient(96deg,#fff 0%,#fdfdfb 42%,#eceee9 78%,#dfe2dc 100%);
  border:1px solid #e2e6df;padding:96px 26px 26px;display:flex}
.bottle .cap{position:absolute;top:-84px;left:50%;transform:translateX(-50%);width:196px;height:88px;
  border-radius:12px 12px 5px 5px;background:linear-gradient(96deg,${look.a},${look.a}cc);
  box-shadow:inset 0 -13px 22px -12px rgba(0,0,0,.5)}
.bottle .shoulder{position:absolute;top:14px;left:26px;right:26px;height:58px;border-radius:16px;
  background:linear-gradient(180deg,${look.a}22,transparent)}
.box{width:432px;height:566px;border-radius:9px;
  background:linear-gradient(96deg,#fff 0%,#fcfcfa 46%,#eaece7 80%,#dcdfd9 100%);
  border:1px solid #e2e6df;padding:74px 26px 26px;display:flex}
.box .boxtop{position:absolute;top:0;left:0;right:0;height:56px;border-radius:9px 9px 0 0;
  background:linear-gradient(96deg,${look.a},${look.a}bb)}
.sachet{width:430px;height:552px;border-radius:6px;
  background:linear-gradient(96deg,#fff 0%,#fbfbf9 48%,#e9ebe6 82%,#dbded8 100%);
  border:1px solid #e2e6df;padding:60px 26px 60px;display:flex}
.sachet .crimp{position:absolute;top:0;left:0;right:0;height:46px;
  background:repeating-linear-gradient(90deg,${look.a} 0 9px,${look.a}99 9px 18px)}
.sachet .crimp.bot{top:auto;bottom:0}
.vial{width:262px;height:466px;border-radius:16px 16px 12px 12px;
  background:linear-gradient(96deg,#fff 0%,#fbfcfa 44%,#e8ebe6 80%,#daded7 100%);
  border:1px solid #e2e6df;padding:96px 18px 20px;display:flex}
.vial .cap{position:absolute;top:-70px;left:50%;transform:translateX(-50%);width:122px;height:74px;
  border-radius:9px 9px 4px 4px;background:linear-gradient(96deg,${look.b},${look.b}cc)}
.vial .neck{position:absolute;top:4px;left:50%;transform:translateX(-50%);width:150px;height:46px;
  border-radius:0 0 14px 14px;background:${look.a}18}

/* ---- the printed label ---- */
.lbl{flex:1;border-radius:16px;background:#fff;border:1px solid #e6e9e3;padding:26px 22px;
  display:flex;flex-direction:column;box-shadow:0 1px 0 rgba(0,0,0,.03)}
.lbl-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.brandmark{display:inline-flex;align-items:center;gap:6px;color:${GREEN}}
.brandmark svg{width:17px;height:17px}
.brandmark b{font-size:11.5px;letter-spacing:.11em;font-weight:700}
.badge{background:${look.b};color:#fff;border-radius:99px;padding:3px 10px;font-size:9.5px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;text-align:center;line-height:1.3;max-width:120px}
.lbl-name{margin-top:22px;font-size:47px;font-weight:800;line-height:.98;letter-spacing:-.032em;color:${look.a}}
.vial .lbl-name{font-size:34px}
.lbl-form{margin-top:11px;font-size:14.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#63736a}
.lbl-rule{height:2px;background:${look.b};margin:17px 0;width:72px;border-radius:2px}
.lbl-strap{font-size:15px;line-height:1.45;color:#41524a}
.lbl-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
.lbl-pack{font-size:20px;font-weight:700;color:#132a1e}
.lbl-cert{font-size:9.5px;letter-spacing:.11em;color:#8d9c93;text-align:right;line-height:1.5;font-weight:600}

/* ---- info cards (frames 3-6) ---- */
.card{position:relative;z-index:4;width:952px;background:#fff;border:1px solid #e5e9e3;border-radius:26px;
  padding:64px 62px;box-shadow:0 34px 70px -46px rgba(19,42,30,.32)}
.eyebrow{font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:${look.b};font-weight:700}
.card h2{margin-top:16px;font-size:52px;font-weight:800;letter-spacing:-.033em;line-height:1.02;color:${GREEN}}
.card .rule{height:3px;width:82px;border-radius:3px;background:${look.a};margin:26px 0 30px}
.rows{display:flex;flex-direction:column;gap:0}
.row{display:flex;justify-content:space-between;gap:26px;padding:17px 0;border-bottom:1px solid #edf0ea}
.row:last-child{border-bottom:0}
.row .k{font-size:18.5px;color:#63736a;flex:0 0 42%}
.row .v{font-size:18.5px;font-weight:600;text-align:right;flex:1;color:#132a1e}
.mono{font-family:"IBM Plex Mono",monospace;font-size:17px}
ul.ticks{list-style:none;display:flex;flex-direction:column;gap:19px}
ul.ticks li{display:flex;gap:16px;font-size:21px;line-height:1.42;color:#243a30}
ul.ticks li b{flex:0 0 26px;height:26px;border-radius:99px;background:${look.a};color:#fff;font-size:13px;
  display:grid;place-items:center;margin-top:3px;font-weight:700}
.comp{font-size:19.5px;line-height:1.68;color:#33463c}
.dose{display:flex;gap:20px;align-items:center;background:${look.tint};border-radius:16px;padding:24px 28px;margin-top:30px}
.dose .big{font-size:44px;font-weight:800;color:${look.a};letter-spacing:-.03em;line-height:1}
.dose .small{font-size:17px;color:#4a5c52;line-height:1.45}
.note{margin-top:28px;font-size:15px;color:#7b8b81;line-height:1.55}
</style></head><body>
<div class="stage"><div class="wash"></div>${kind === "pack" ? '<div class="floor"></div>' : ""}${body}</div>
<div class="hdr">${MARK}<b>Leaf<i>Genix</i></b></div>
<div class="ftr">${kind === "pack" ? "Leaf Genix Lifesciences" : "Lifting and Empowering All Families"}</div>
</body></html>`;

/* --------------------------------------------------------------- frames */

const frames = [
  (p, l) => shell(l, pack(p, l, false), "pack"),
  (p, l) => shell(l, pack(p, l, true), "pack"),
  (p, l) => shell(l, `<div class="card">
      <p class="eyebrow">Composition</p><h2>What's inside</h2><div class="rule"></div>
      <p class="comp">${esc(p.composition)}</p>
      ${p.flavour ? `<div class="dose"><div class="big">${esc(p.flavour)}</div><div class="small">Flavour<br>Formulated for compliance, not decoration</div></div>` : ""}
      <p class="note">Full quantitative composition is printed on every pack. Batch certificates available on request.</p>
    </div>`),
  (p, l) => shell(l, `<div class="card">
      <p class="eyebrow">Key actives</p><h2>Every number, stated</h2><div class="rule"></div>
      <div class="rows">${p.specifications.slice(0, 7).map((s) =>
        `<div class="row"><span class="k">${esc(s.label)}</span><span class="v mono">${esc(s.value)}</span></div>`).join("")}</div>
    </div>`),
  (p, l) => shell(l, `<div class="card">
      <p class="eyebrow">What it does</p><h2>Key benefits</h2><div class="rule"></div>
      <ul class="ticks">${p.key_benefits.slice(0, 5).map((b, i) =>
        `<li><b>${i + 1}</b><span>${esc(b)}</span></li>`).join("")}</ul>
    </div>`),
  (p, l) => shell(l, `<div class="card">
      <p class="eyebrow">How to take it</p><h2>Directions</h2><div class="rule"></div>
      <p class="comp">${esc(p.directions)}</p>
      <div class="dose"><div class="big">${esc(p.pack_size)}</div>
        <div class="small">${esc(p.form)}${p.flavour ? ` · ${esc(p.flavour)}` : ""}<br>Marketed by Leaf Genix Lifesciences, Jaipur</div></div>
      <p class="note">Always read the label before use. Not intended to diagnose, treat, cure or prevent any disease.</p>
    </div>`),
];

/* ----------------------------------------------------------------- main */

const products = JSON.parse(await readFile(SEED, "utf8"));
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const page = await browser.newPage({ viewport: { width: 1200, height: 1500 } });

for (const p of products) {
  const look = LOOK[p.slug];
  if (!look) {
    console.warn("! no look defined for", p.slug);
    continue;
  }
  for (let i = 0; i < frames.length; i++) {
    const out = path.join(OUT, `${p.slug}-${i + 1}.jpg`);
    if (!process.env.FORCE_REGEN) {
      try { await access(out); continue; } catch { /* not there yet — render it */ }
    }
    await page.setContent(frames[i](p, look), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out, type: "jpeg", quality: 90 });
  }
  console.log("✓", p.slug, "— 6 frames");
}

await browser.close();
console.log(`\nWrote ${products.length * frames.length} images to public/products/`);
