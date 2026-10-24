const articles = ["a", "an", "the"];

const nouns = [
  "cat", "dog", "bird", "horse", "cow", "pig",
  "sheep", "duck", "frog", "mouse", "rabbit", "goat",
  // Vowel-starting animals
  "elephant", "alligator", "eagle", "octopus",
  "orangutan", "owl", "iguana", "ostrich"
];

const verbs = [
  "tickles", "juggles", "bamboozles", "serenades", "high-fives", "boops",
  "tackles", "pranks", "hugs", "flings", "chases", "tangoes with"
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Removes and returns a random item so it can't be picked again.
function pickUnique(list) {
  const index = Math.floor(Math.random() * list.length);
  return list.splice(index, 1)[0];
}

function startsWithVowel(word) {
  return "aeiou".includes(word.charAt(0).toLowerCase());
}

// Picks an article that fits the noun that follows it:
// "an" is removed for consonants, "a" is removed for vowels.
// "the" always fits, and articles may repeat across the sentence.
function pickArticleFor(noun) {
  const unwanted = startsWithVowel(noun) ? "a" : "an";
  const validArticles = articles.filter(article => article !== unwanted);
  return pickRandom(validArticles);
}

export function generateSentence() {
  // Work on a copy so the original list stays intact between calls.
  const availableNouns = [...nouns];

  // Nouns are picked first (and must be unique within the sentence).
  const noun1 = pickUnique(availableNouns);
  const noun2 = pickUnique(availableNouns);

  // Articles are then chosen based on the noun they sit in front of.
  const article1 = pickArticleFor(noun1);
  const article2 = pickArticleFor(noun2);

  const verb = pickRandom(verbs);

  const sentence = `${article1} ${noun1} ${verb} ${article2} ${noun2}`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}
