/* ------------------------------------------------------------------
   validate.js - decides whether a piece of text may be shown.

   validateInput(text) returns { ok: true } or { ok: false, reason: "..." }.
   script.js shows `reason` to the user when ok is false.
------------------------------------------------------------------ */
import { containsProfanity } from './profanityfilter.js';

export function validateInput(text) {
  const t = String(text || "").trim();
  if (!t) return { ok: false, reason: "Type a word or phrase first." };
  if (containsProfanity(t)) return { ok: false, reason: "That word can't be shown. Please try something else." };
  return { ok: true };
}
