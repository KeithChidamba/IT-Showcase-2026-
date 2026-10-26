<div align="center">

# BEYOND THE FRAME

### IT Showcase 2026

**Type a word. Watch it become part of the picture.**
Words you add pack themselves inside the giant letters of *BEYOND THE FRAME*, while a marquee of silly sentences scrolls along the bottom.

<br>

### 🔗 [**Open the live site →**](https://keithchidamba.github.io/IT-Showcase-2026-/)  ·  [**View the code on GitHub →**](https://github.com/KeithChidamba/IT-Showcase-2026-)

<br>

![HTML5](https://img.shields.io/badge/HTML5-111111?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-111111?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-111111?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![No dependencies](https://img.shields.io/badge/dependencies-none-3b82f6?style=for-the-badge)

</div>

---

## ✨ What it does

| | |
|---|---|
| 🔤 **Word art** | Every word you add is fitted inside the letterforms of the headline, sized to fill the space. |
| 🎙️ **Voice input** | Say a word or phrase instead of typing it. Speech-to-text runs in the browser, with no library. |
| 🅰️ **Bring your own font** | Load any `.woff`, `.ttf` or `.otf`. Variable fonts get live sliders and OpenType feature toggles. |
| 🎠 **Sentence marquee** | Generate random sentences and add them to an endlessly looping ticker. |
| 🧼 **Profanity filter** | English and Afrikaans filtering on everything typed or spoken. |

---

## 🚀 Getting started

There is nothing to install and nothing to build. To just try it, open the **[live site](https://keithchidamba.github.io/IT-Showcase-2026-/)**. To run your own copy:

1. **Get the files** by cloning the repo (or downloading it as a ZIP from [GitHub](https://github.com/KeithChidamba/IT-Showcase-2026-)) and keeping them together in one folder:
   ```bash
   git clone https://github.com/KeithChidamba/IT-Showcase-2026-.git
   cd IT-Showcase-2026-
   ```
2. **Serve the folder** with any static web server. The page uses ES modules, so opening the file by double-clicking it (`file://`) won't work.
   - **VS Code:** right-click `index.html` and choose **Open with Live Server**.
   - **Python:** run `python -m http.server` in the folder, then visit `http://localhost:8000`.
   - **GitHub Pages:** the repo is published this way. The page is `index.html`, so it loads at the site's root address with no filename needed. To host your own copy, fork the repo and turn on Pages in its settings.
3. **Allow the microphone** if you want to use voice input (see [Voice input](#-voice-input)).

---

## 🕹️ How to use it

The controls live in the column on the left. The big display on the right updates as you go. The marquee runs along the bottom.

### ⌨️ Text input

| Control | What it does |
|---|---|
| **Text box** | Type a word or short phrase. Press **Enter** or click **OK** to add it. |
| **OK** | Adds the text to the display. It's shown in capitals. |
| **Fill sample** | Loads a set of example words so you can see the effect straight away. |
| **Clear stage** | Removes **every** word from the display. |
| **Clear input** | Empties **only the text box** and leaves the display alone. Handy after a voice recording. |

> If a phrase is too long to fit inside the letters, you'll get a message and it won't be added. Try something shorter.

### 🎙️ Voice input

1. Pick a language: **English (ZA)**, **Afrikaans**, **English (UK)** or **English (US)**.
2. Click **Speak** (the button turns red and pulses) and say your word or phrase.
3. Your words appear live in the text box. Pause and recording stops by itself after about **4 seconds of silence**, or click **Stop** to finish early.
4. Check the text, edit it if needed, then press **OK**.

Tick **Add automatically** and the phrase goes straight onto the display as soon as you stop speaking.

<details>
<summary><b>Voice input requirements and tips</b></summary>

<br>

- **Browser:** works in Chrome, Edge and Safari. Firefox doesn't support speech recognition, so the Speak button is disabled there.
- **Internet:** recognition is done by the browser's speech service, so you need to be online.
- **Secure page:** the microphone only works on `https://` pages or `localhost`. GitHub Pages and Live Server both qualify.
- **Permission:** the browser asks for microphone access the first time. If you blocked it, re-allow it in the site settings (the padlock in the address bar).
- **Pause length:** want more or less time to think between words? Open `script.js`, find `const SilenceMs=4000;` and change the number (it's in milliseconds).
- **Brave and some Chromium builds** block the speech service, so voice input may report a network error there.

</details>

### 🅰️ Font loading

1. Click **Load font** and pick a `.woff`, `.woff2`, `.ttf` or `.otf` file.
2. The whole display, and the marquee, switch to your font. The name is shown next to the buttons.
3. If it's a **variable font**, sliders appear for its axes (Weight, Width, Slant and so on). If it has **OpenType features**, toggles appear for those too.
4. Click **Use default font** to go back to Arial Black.

> `.woff2` files load and display fine, but their axes and features can't be inspected, so the sliders and toggles won't appear for them. Use `.woff`, `.ttf` or `.otf` if you want those controls.

### 🎠 Marquee additions

1. Click **Generate** for a random sentence, such as *"The sheep hugs the goat."*
2. Like it? Click **Add** and it joins the scrolling marquee at the bottom.
3. Not feeling it? Click **Generate** again for a new one.

The same sentence can't be added twice. If it's already in the marquee, **Add** is greyed out and a message tells you so. The marquee loops forever by itself and can't be clicked or scrolled.

---

## 🗂️ Project structure

```
IT-Showcase-2026-/
├── .github/workflows/      GitHub Actions workflows
├── index.html              The page and all the controls
├── stylesheet.css          Layout, theme (light and dark) and styling
├── script.js               Word packing, font loading, voice input, marquee
├── sentence.js             The random sentence generator
├── profanityfilter.js      English + Afrikaans word list and checker
└── README.md               You are here
```

---

## 🔧 Make it your own

| Want to change... | Edit this |
|---|---|
| How long a pause ends voice recording | `SilenceMs` in `script.js` |
| How fast the marquee scrolls | `MarqueeSpeed` in `script.js` (pixels per second) |
| The sample words | `SAMPLE` near the top of `script.js` |
| The headline text | `LogoLines` near the top of `script.js` |
| The animals and verbs in the sentences | `nouns` and `verbs` in `sentence.js` |
| Which words are blocked | The lists in `profanityfilter.js` |
| Colours and spacing | The variables at the top of `stylesheet.css` |

The page follows your system's light or dark setting automatically.

---

## 🌐 Browser support

The project is built and tested for a current **Chrome**. It uses standard browser features only (no libraries), so other modern browsers should run it too.

**Voice input** relies on the browser's built-in speech recognition. That's available in Chrome, Edge and Safari, but not in Firefox. On unsupported browsers the Speak button is switched off and everything else still works.

---

## 👥 Credits

<div align="center">

| | |
|---|---|
| **Devs** | Keith Chidamba · Tiaan Mouton · Jack Fourie · Taylor Potgieter |
| **Designers** | William Robinson · Jodie Chan |

<br>

*Made for IT Showcase 2026.*

[Live site](https://keithchidamba.github.io/IT-Showcase-2026-/) · [Source on GitHub](https://github.com/KeithChidamba/IT-Showcase-2026-)

</div>
