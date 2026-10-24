/* ------------------------------------------------------------------
   Profanity list: English + Afrikaans
   Add or remove words here to tune the filter.
------------------------------------------------------------------ */
const PROFANITY_EN = [
  "fuck", "fucker", "fuckers", "fucking", "fucked", "fucks", "fuckoff", "fuckface", "fuckhead",
  "motherfucker", "motherfucking", "mofo", "shit", "shits", "shitty", "shithead", "shitface",
  "bullshit", "horseshit", "dipshit", "shitbag", "shitfaced", "piss", "pissed", "pissoff", "bitch",
  "bitches", "bitchy", "bastard", "bastards", "asshole", "assholes", "arsehole", "arse", "ass",
  "asses", "asshat", "asswipe", "jackass", "dumbass", "dick", "dicks", "dickhead", "dickface",
  "cock", "cocks", "cocksucker", "cocksucking", "prick", "pricks", "cunt", "cunts", "pussy",
  "pussies", "twat", "twats", "wanker", "wankers", "wank", "tosser", "bollocks", "bugger", "slut",
  "sluts", "slutty", "whore", "whores", "hoe", "skank", "titty", "titties", "dildo", "blowjob",
  "handjob", "rimjob", "cum", "cumshot", "jizz", "jerkoff", "wankstain", "anal", "porno", "boner",
  "douche", "douchebag", "douchebags", "scumbag", "dammit", "goddamn", "goddamned", "retard",
  "retarded", "retards", "spastic", "spaz", "nigger", "niggers", "nigga", "niggas", "coon",
  "darkie", "kaffir", "kike", "spic", "wetback", "chink", "gook", "jap", "paki", "raghead",
  "towelhead", "sandnigger", "beaner", "cracker", "honky", "faggot", "faggots", "fag", "fags",
  "dyke", "tranny", "shemale", "lesbo", "pedo", "pedophile", "rapist", "bukkake", "cuck", "milf",
  "thot", "twunt", "knobhead", "bellend", "minger", "slag", "plonker", "arsewipe", "pillock",
  "numpty", "wazzock", "feck", "feckin", "crap", "crappy", "damn", "damned", "tit", "tits", "boob",
  "boobs", "idiot", "moron", "imbecile", "cretin", "abbo", "abeed", "africoon", "ahole", "amcik",
  "andskota", "anilingus", "apeshit", "arabush", "arschloch", "arrse", "asscock", "assclown",
  "asscowboy", "asscracker", "assface", "assfuck", "assfucker", "assfukka", "assgoblin", "asshead",
  "asshopper", "asshore", "assjacker", "assjockey", "asskiss", "asskisser", "asslick", "asslicker",
  "asslover", "assman", "assmaster", "assmonkey", "assmunch", "assmuncher", "assnigger",
  "asspacker", "asspirate", "asspuppies", "assrammer", "assranger", "assshit", "assshole",
  "asssucker", "asswad", "asswhole", "asswhore", "asswipes", "assbag", "assbagger", "assbandit",
  "assbang", "assbanger", "assbite", "assblaster", "ayir", "azzhole", "bastardo", "bastardz",
  "bassterd", "basterds", "basterdz", "bampot", "beaney", "beaneys", "beatch", "beeyotch", "beotch",
  "biatch", "bitchass", "bitcher", "bitchers", "bitchez", "bitchin", "bitching", "bitchslap",
  "bitchtit", "bint", "blowjobs", "bollick", "bollock", "bollok", "bollox", "boche", "boches",
  "boffing", "bohunk", "boiolas", "boong", "boonga", "boongas", "boongs", "bootlip", "bootlips",
  "buceta", "buggered", "buggery", "bukake", "bullcrap", "bulldike", "bulldyke", "bullshits",
  "bullshitted", "bumblefuck", "bumfuck", "bunghole", "burrhead", "burrheads", "butchdike",
  "butchdyke", "buttfuck", "buttfucker", "buttfuckers", "butthole", "buttmunch", "buttmuncher",
  "buttpirate", "buttplug", "buttwipe", "byatch", "cabron", "caca", "cacker", "cawk", "cawks",
  "cazzo", "chinc", "chincs", "chinaman", "chinamen", "chinga", "chingchong", "chingchongs",
  "chinks", "chinky", "choad", "chode", "chodes", "chuj", "chunger", "cipa", "circlejerk", "clit",
  "clitface", "clitfuck", "clitoris", "clits", "clitty", "clogwog", "clusterfuck", "cnut",
  "cockbite", "cockblock", "cockburger", "cockface", "cockfucker", "cockhead", "cockholster",
  "cockjockey", "cockknob", "cockknocker", "cockknoker", "cocklicker", "cocklover", "cockmaster",
  "cockmongler", "cockmonkey", "cockmunch", "cockmuncher", "cocknob", "cocknose", "cocknugget",
  "cockqueen", "cockrider", "cockshit", "cocksman", "cocksmith", "cocksmoker", "cocksucer",
  "cocksuck", "cocksucked", "cocksucks", "cocksuka", "cocksukka", "cocktease", "cok", "cokmuncher",
  "coksucka", "coochie", "coochy", "coolie", "coolies", "cooly", "coonass", "coondog", "coons",
  "cooter", "cornhole", "corksucker", "crackwhore", "crapola", "crapper", "creampie",
  "crotchjockey", "crotchmonkey", "crotchrot", "cumbubble", "cumdumpster", "cumfest", "cumguzzler",
  "cumjockey", "cumlickr", "cumm", "cummer", "cummin", "cumming", "cumquat", "cumqueen", "cums",
  "cumshots", "cumslut", "cumstain", "cumsucker", "cumtart", "cuming", "cunilingus", "cunillingus",
  "cunnie", "cunnilingus", "cunny", "cunteyed", "cuntface", "cuntfuck", "cuntfucker", "cunthole",
  "cunthunter", "cuntlick", "cuntlicker", "cuntlicking", "cuntrag", "cuntslut", "cuntsucker",
  "cuntz", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking",
  "dago", "dagos", "daygo", "deggo", "dego", "degos", "diaperhead", "diaperheads", "dickbag",
  "dickbeater", "dickbeaters", "dickbrain", "dickfuck", "dickhole", "dickish", "dickjuice",
  "dickless", "dicklick", "dicklicker", "dickman", "dickmilk", "dickmonger", "dickpic",
  "dickripper", "dicksipper", "dickslap", "dicksucker", "dickwad", "dickweasel", "dickweed",
  "dickwhipper", "dickwod", "dickzipper", "dike", "dikes", "dildos", "dilf", "dipship", "dix",
  "dixiedike", "dixiedyke", "dlck", "doochbag", "doosh", "dothead", "dotheads", "douchewaffle",
  "douchey", "duche", "dumass", "dumbbitch", "dumbfuck", "dumbshit", "dumshit", "dumbasses", "dupa",
  "dykes", "dziwka", "easyslut", "enculer", "fanculo", "fagbag", "faget", "fagfucker", "fagg",
  "fagged", "fagging", "faggit", "faggitt", "faggotcock", "faggs", "fagit", "fagot", "fagots",
  "fagt", "fagtard", "fagz", "faig", "faigs", "faigt", "fannybandit", "fannyflaps", "fannyfucker",
  "fanyy", "fartknocker", "fastfuck", "fatfuck", "fatfucker", "fck", "fckd", "fcuk", "fcuker",
  "fcuking", "fecker", "felch", "felcher", "felching", "fellate", "fellatio", "feltch", "feltcher",
  "feltching", "ficken", "fingerbang", "fingerfuck", "fingerfucked", "fingerfucker",
  "fingerfuckers", "fingerfucking", "fingerfucks", "fister", "fisting", "fistfuck", "fistfucked",
  "fistfucker", "fistfuckers", "fistfucking", "fistfucks", "flogthelog", "fotze", "fook", "fooker",
  "footfuck", "footfucker", "freakfuck", "freakyfucker", "freefuck", "fucck", "fucka", "fuckable",
  "fuckass", "fuckbag", "fuckbitch", "fuckboy", "fuckbrain", "fuckbuddy", "fuckbutt", "fuckd",
  "fuckedup", "fuckersucker", "fuckfest", "fuckfreak", "fuckfriend", "fuckheads", "fuckher",
  "fuckhole", "fuckina", "fuckingbitch", "fuckings", "fuckit", "fuckknob", "fuckme", "fuckmeat",
  "fuckmehard", "fuckmonkey", "fuckn", "fucknugget", "fucknut", "fucknuts", "fucknutt", "fucknutz",
  "fuckpig", "fuckpuppet", "fuckr", "fuckstick", "fucktard", "fucktards", "fucktoy", "fucktrophy",
  "fuckup", "fuckwad", "fuckwhit", "fuckwhore", "fuckwit", "fuckwitt", "fuckyomama", "fuckyou",
  "fudgepacker", "fugly", "fuk", "fukah", "fuken", "fuker", "fukin", "fuking", "fukk", "fukkah",
  "fukken", "fukker", "fukkin", "fukking", "fuks", "fuktard", "fuktards", "fukwhit", "btch", "sht", "shyt", "fukwit",
  "funfuck", "camwhore", "camslut", "cameltoe", "carpetmuncher", "cherrypopper", "bluegums",
  "blumpkin", "buddhahead", "buddhaheads", "cameljockey", "sex", "sexy", "sexual", "sexting",
  "sexed", "seks", "naked", "nude", "nudes", "nudist", "stripper", "striptease", "hooker",
  "prostitute", "prostitutes", "prostitution", "brothel", "pimp", "pimps", "porn", "pornography",
  "penis", "penises", "vagina", "vaginas", "vulva", "genital", "genitals", "genitalia", "scrotum",
  "testicle", "testicles", "semen", "sperm", "ejaculate", "ejaculation", "masturbate",
  "masturbation", "masturbating", "orgasm", "orgasms", "orgy", "orgies", "gangbang", "threesome",
  "foursome", "incest", "erection", "erections", "erotic", "erotica", "fetish", "bondage",
  "dominatrix", "bdsm", "kinky", "kink", "horny", "horney", "aroused", "vibrator", "lube", "sextoy",
  "nipple", "nipples", "areola", "areole", "rectum", "anus", "penetration", "footjob", "titjob",
  "bigtits", "bigass", "deepthroat", "hentai", "ecchi", "condom", "condoms", "enema", "coitus",
  "coital", "copulate", "copulation", "defecate", "defecation", "excrement", "faeces", "feces", "fecal", "urine", "turd", "turds", "poop", "poo", "fart", "farts",
  "farting", "cocaine", "cocain", "heroin", "meth", "methamphetamine", "lsd", "mdma", "opium",
  "marijuana", "cannabis", "hashish", "dagga", "mandrax", "nyaope", "whoonga", "crackhead",
  "crackpipe", "junkie", "bong", "bongs", "boozer", "rape", "raped", "rapists", "molest",
  "molester", "molestation", "paedo", "paedophile", "pedophilia", "bestiality", "beastiality",
  "beastial", "zoophilia", "necrophilia", "abuse", "abused", "abuser", "suicide", "murder",
  "murderer", "terrorist", "terrorism", "genocide", "nazi", "nazis", "hitler", "kkk", "jigaboo",
  "jiggaboo", "sambo", "pickaninny", "golliwog", "wog", "wop", "heeb", "hymie", "pikey", "gyppo",
  "midget", "tard", "tards", "mongoloid", "cripple", "zipperhead"
];

const PROFANITY_AF = [
  "fok", "fokken", "fokkin", "fokker", "fokkers", "fokkol", "fokof", "fokoff", "fokwit", "fokkop",
  "befok", "befokte", "gefok", "kak", "kakker", "kakkop", "kakbek", "kakstorie", "kakgoed",
  "kakpraatjies", "bekakt", "bekak", "poes", "poese", "poesgesig", "poeslekker", "poesgat",
  "poephol", "poepol", "poephole", "poephoof", "poep", "poepgat", "kont", "konte", "kontkop",
  "kontgesig", "kontlekker", "moer", "moerskont", "moerse", "moerasem", "moerkop", "moerhond",
  "naai", "naaier", "naaiers", "naaigat", "naaikop", "genaai", "piel", "piele", "pielkop",
  "pielgesig", "pielletjie", "hoer", "hoere", "hoerkind", "hoerjagter", "hoerery", "slet", "slette",
  "sletgesig", "sletterig", "bliksem", "bliksemse", "bliksems", "donder", "donderse", "dondersteen",
  "verdomp", "verdomde", "verdoem", "verdoemde", "doos", "doosgesig", "doosbek", "doosgat", "drol",
  "drolle", "stront", "strontkop", "strontvreet", "strontjie", "gatkruiper", "gatkop", "gatvol",
  "gatlekker", "gatgesig", "gatspoeg", "etter", "etters", "etterbak", "ettergesig", "ettergat",
  "etterkop", "fokgesig", "domkop", "domkrag", "idioot", "idiote", "bleddie", "bloudie", "hondekop",
  "bastaard", "bastaards", "teefgesig", "vuilbek", "vuilgat", "vuilkop", "varkgesig", "beesgesig",
  "eselkop", "eselgesig", "lummel", "mombakkies", "malkop", "mallemeule", "swaap", "swapie",
  "skobbejak", "skobbejakkie", "skelmpie", "koelie", "hotnot", "kaffer", "kaffir", "boesman",
  "boesmans", "moffie", "moffies", "flikker", "flikkers", "poefter", "poefters", "lesbo",
  "bangbroek", "lafaard", "papbroek", "papbroeke", "vetsak", "vetgat", "vetpoes", "vetkop",
  "vervlakste", "verflikkerde", "verfokte", "meidjie", "kaffertjie", "hotnotjie", "koeliekind",
  "rooinek", "rooineks", "soutpiel", "soutpiele", "souties", "spoegkop", "spoegbak", "spoegbek",
  "kakgesig", "donner", "donnerse", "draadtrekker", "foken", "fokkoff", "holnaaier", "kakhuis",
  "kakspul", "kotskop", "maaifoedie", "naipoes", "poesklap", "rioolboor", "voetsek", "nai", "naier",
  "seks", "kondoom", "penis", "vagina", "ejakuleer", "masturbeer", "masturbasie", "orgasme",
  "pornografie", "porno", "tiete", "tiet", "dagga", "mandrax", "nyaope", "whoonga", "heroien",
  "verkrag", "verkragter", "verkragting", "pedofiel", "prostituut", "hoerhuis"
];

/* ------------------------------------------------------------------
   Normalisation helpers
------------------------------------------------------------------ */
const LEET = { "@":"a","4":"a","3":"e","1":"i","0":"o","$":"s","5":"s","7":"t","+":"t","8":"b","(":"c" };

function stripAccents(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalise(s) {
  let out = stripAccents(String(s).toLowerCase());
  out = out.replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, ""); 
  out = out.replace(/\*/g, "");
  out = out.replace(/[@4310$57+8(]/g, ch => LEET[ch] || ch);
  return out;
}

function collapse(s) {
  return s.replace(/(.)\1+/g, "$1");
}

/* ------------------------------------------------------------------
   Build lookup structures once
------------------------------------------------------------------ */
const BLOCKLIST = (() => {
  const words = new Set();
  const add = w => {
    const n = normalise(w).replace(/[^a-z]/g, "");
    if (n) words.add(n);
  };
  PROFANITY_EN.forEach(add);
  PROFANITY_AF.forEach(add);
  return words;
})();

const COLLAPSED_BLOCKLIST = new Set([...BLOCKLIST].map(collapse));

function isBlocked(word) {
  if (BLOCKLIST.has(word)) return true;
  if (COLLAPSED_BLOCKLIST.has(collapse(word))) return true;
  return false;
}

/* ------------------------------------------------------------------
   Exported function required by script.js
------------------------------------------------------------------ */
export function containsProfanity(text) {
  const normalisedText = normalise(text);
  const words = normalisedText.split(/\s+/);
  for (const w of words) {
    const cleanedWord = w.replace(/[^a-z]/g, "");
    if (isBlocked(cleanedWord)) return true;
  }
  return false;
}