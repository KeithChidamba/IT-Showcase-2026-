/* ------------------------------------------------------------------

   rules.js - turns a piece of text into per-letter styling.
 
   styleText(text, salt) returns one entry per character:

       { c: "A", v: "bold", fill: "#ff0000" | null }

   v     = font variant: "thin" | "regular" | "bold" | "heavy"
           (plus the in-between steps in DYSLEXIA_VARIANTS, used only by "dyslexia")

           (script.js maps these onto the weight axis of the variable font)

   fill  = colour, or null for the default (white)
 
   Rules are applied in layers. A later layer overrides an earlier one on

   the letters it touches, so the order of the layers below IS the priority.

   Variant and colour are separate channels, so a letter can be both

   "heavy" (double letters) and "pink" (the word love) at the same time.

------------------------------------------------------------------ */
 
/* ---------- word lists (edit these to tune the rules) ---------- */
 
// Names of colours -> the colour used to draw the word.

export const COLOURS = {

  red:"#ff0000", orange:"#ffa500", yellow:"#ffff00", green:"#008000", blue:"#0000ff",

  purple:"#800080", pink:"#ffc0cb", brown:"#a52a2a", black:"#000000", white:"#ffffff",

  grey:"#808080", gray:"#808080", gold:"#ffd700", silver:"#c0c0c0", cyan:"#00ffff",

  magenta:"#ff00ff", fuchsia:"#ff00ff", violet:"#ee82ee", indigo:"#4b0082", teal:"#008080",

  navy:"#000080", maroon:"#800000", olive:"#808000", lime:"#00ff00", aqua:"#00ffff",

  coral:"#ff7f50", salmon:"#fa8072", crimson:"#dc143c", scarlet:"#ff2400", turquoise:"#40e0d0",

  lavender:"#e6e6fa", lilac:"#c8a2c8", mauve:"#e0b0ff", beige:"#f5f5dc", tan:"#d2b48c",

  khaki:"#f0e68c", plum:"#dda0dd", orchid:"#da70d6", ivory:"#fffff0", azure:"#007fff",

  bronze:"#cd7f32", peach:"#ffdab9", mint:"#98ff98", amber:"#ffbf00", burgundy:"#800020",

  charcoal:"#36454f", emerald:"#50c878", ruby:"#e0115f", sapphire:"#0f52ba", cream:"#fffdd0",

  rose:"#ff007f"

};
 
// Every weight step a letter can take. The four main rules use thin / regular / bold / heavy;
// the in-between steps exist so each letter of "dyslexia" can get its own variant.
export const DYSLEXIA_VARIANTS = ["thin", "extralight", "light", "regular", "medium", "semibold", "bold", "extrabold", "heavy"];

const LOVE_PINK = "#ff69b4";

const EDUVOS_BLUE = "#15305D";

const NAME_RED = "#ff0000";
 
const CONGRATS_WORDS = new Set(["congrats", "congratulations", "hooray", "hurray"]);

const CONGRATS_PHRASES = [["well", "done"], ["you", "did", "it"]];
 
// Personal, possessive, reflexive and question pronouns (contractions like "I'm" match on the part before the apostrophe).

const PRONOUNS = new Set((

  "i me my mine myself you your yours yourself yourselves he him his himself she her hers herself " +

  "it its itself we us our ours ourselves they them their theirs themselves who whom whose"

).split(" "));
 
const MONTHS = new Set((

  "january february march april may june july august september october november december " +

  "jan feb mar apr jun jul aug sep sept oct nov dec"

).split(" "));
 
// The people who built this project (first and last names).

const TEAM_NAMES = new Set(

  "keith chidamba tiaan mouton jack fourie taylor potgieter william robinson jodie chan".split(" ")

);
 
/* ---------- helpers ---------- */
 
function hash(s) {                       // FNV-1a: same text -> same "random" styling

  let h = 2166136261;

  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }

  return h >>> 0;

}

function rngFor(seed) {                  // mulberry32

  let a = seed >>> 0;

  return () => {

    a = (a + 0x6D2B79F5) >>> 0;

    let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;

  };

}

function shuffle(arr, rnd) {

  const a = arr.slice();

  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }

  return a;

}
 
// Dark colours disappear on the dark stage, so the renderer gives them a light outline.

export function isDark(fill) {

  const m = /^#([0-9a-f]{6})$/i.exec(fill || "");

  if (!m) return false;

  const [r, g, b] = [0, 2, 4].map(i => {

    const c = parseInt(m[1].substr(i, 2), 16) / 255;

    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.12;

}
 
/* ---------- the rules ---------- */
 
export function styleText(text, salt = 0) {

  const n = text.length;

  const rnd = rngFor(hash(text) ^ (salt * 2654435761));

  const v = new Array(n).fill("regular");

  const fill = new Array(n).fill(null);

  const setV = (s, e, val) => { for (let i = s; i < e; i++) v[i] = val; };

  const setF = (s, e, val) => { for (let i = s; i < e; i++) fill[i] = val; };
 
  // Split into words. A word keeps inner apostrophes ("it's"), so "it's" is one word.

  const tokens = [];

  const re = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu;

  let m;

  while ((m = re.exec(text))) {

    tokens.push({ w: m[0].toLowerCase(), base: m[0].toLowerCase().split(/['’]/)[0], s: m.index, e: m.index + m[0].length });

  }
 
  // Which words open a sentence? The first word, and any word after . ! ? or a line break.

  let atStart = true, prevEnd = 0;

  for (const t of tokens) {

    if (/[.!?…\n]/.test(text.slice(prevEnd, t.s))) atStart = true;

    t.first = atStart;

    atStart = false;

    prevEnd = t.e;

  }
 
  const isMonth = t => !!t && MONTHS.has(t.base);

  const isDayNumber = t => !!t && /^\d{1,2}(st|nd|rd|th)?$/.test(t.w);
 
  /* --- variant channel: low priority first --- */
 
  // Pronouns = bold

  for (const t of tokens) if (PRONOUNS.has(t.base)) setV(t.s, t.e, "bold");
 
  // Month = regular

  for (const t of tokens) if (isMonth(t)) setV(t.s, t.e, "regular");
 
  // The date = bold: a day number next to a month ("26 October", "October 26th", "26th of October")

  tokens.forEach((t, i) => {

    if (!isDayNumber(t)) return;

    const prev = tokens[i - 1], next = tokens[i + 1], next2 = tokens[i + 2];

    if (isMonth(prev) || isMonth(next) || (next && next.w === "of" && isMonth(next2))) setV(t.s, t.e, "bold");

  });
 
  // First letter of a sentence = bold

  for (const t of tokens) {

    if (!t.first) continue;

    if (/\p{L}/u.test(text[t.s])) v[t.s] = "bold";

  }
 
  // Double letters (ll, oo, ss ...) = heavy

  for (const t of tokens) {

    for (let i = t.s; i < t.e - 1; i++) {

      const a = text[i], b = text[i + 1];

      if (/\p{L}/u.test(a) && a.toLowerCase() === b.toLowerCase()) { v[i] = "heavy"; v[i + 1] = "heavy"; }

    }

  }
 
  // Numeric dates (26/10/2026, 2026-10-26, 26.10.2026) = bold, as a whole

  const dateRe = /(?<![\d])\d{1,4}[\/.\-]\d{1,2}[\/.\-]\d{1,4}(?![\d])/g;

  while ((m = dateRe.exec(text))) setV(m.index, m.index + m[0].length, "bold");

  // The word "thin" and the number 2026 = thin.
  // Applied after the date rule: "2026" is the more specific rule, so it stays thin even inside a date.

  for (const t of tokens) if (t.w === "thin" || t.w === "2026") setV(t.s, t.e, "thin");

  // dyslexia: every letter a different variant. The word has 8 letters, so it draws 8 distinct
  // weights from the 9 steps in DYSLEXIA_VARIANTS (no two letters share a variant).

  for (const t of tokens) {

    if (t.w !== "dyslexia") continue;

    const seq = [];

    while (seq.length < t.e - t.s) seq.push(...shuffle(DYSLEXIA_VARIANTS, rnd));

    for (let i = t.s; i < t.e; i++) v[i] = seq[i - t.s];

  }
 
  // Names of the people who worked on the project = heavy

  for (const t of tokens) if (TEAM_NAMES.has(t.base)) setV(t.s, t.e, "heavy");
 
  /* --- colour channel: low priority first --- */
 
  // Name of a colour = that colour

  for (const t of tokens) if (COLOURS[t.w]) setF(t.s, t.e, COLOURS[t.w]);
 
  // love = pink

  for (const t of tokens) if (t.w === "love") setF(t.s, t.e, LOVE_PINK);
 
  // Eduvos = #15305D

  for (const t of tokens) if (t.w === "eduvos") setF(t.s, t.e, EDUVOS_BLUE);
 
  // Congrats! congratulations! Well Done! Hooray! You did it! = a different random colour on every letter

  const rainbow = new Array(tokens.length).fill(false);

  tokens.forEach((t, i) => { if (CONGRATS_WORDS.has(t.w)) rainbow[i] = true; });

  for (const phrase of CONGRATS_PHRASES) {

    for (let i = 0; i + phrase.length <= tokens.length; i++) {

      let hit = true;

      for (let k = 0; k < phrase.length && hit; k++) {

        hit = tokens[i + k].w === phrase[k] &&

              (k === 0 || !/[.!?…\n]/.test(text.slice(tokens[i + k - 1].e, tokens[i + k].s)));

      }

      if (hit) for (let k = 0; k < phrase.length; k++) rainbow[i + k] = true;

    }

  }

  const hue0 = rnd() * 360;

  let letterNo = 0;

  tokens.forEach((t, i) => {

    if (!rainbow[i]) return;

    for (let j = t.s; j < t.e; j++) {

      if (!/\p{L}/u.test(text[j])) continue;

      fill[j] = `hsl(${Math.round((hue0 + letterNo++ * 137.508) % 360)},95%,60%)`;   // golden angle: neighbours never match

    }

  });
 
  // Team names = red

  for (const t of tokens) if (TEAM_NAMES.has(t.base)) setF(t.s, t.e, NAME_RED);
 
  const out = [];

  for (let i = 0; i < n; i++) out.push({ c: text[i].toUpperCase(), v: v[i], fill: fill[i] });

  return out;

}