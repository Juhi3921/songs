const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");

const darkBtn = document.getElementById("darkBtn");
const neonBtn = document.getElementById("neonBtn");

const status = document.getElementById("status");
const currentTime = document.getElementById("currentTime");
const progressBar = document.getElementById("progressBar");
const visualizer = document.getElementById("visualizer");

const drumVolume = document.getElementById("drumVolume");
const bassVolume = document.getElementById("bassVolume");
const leadVolume = document.getElementById("leadVolume");
const variationVolume = document.getElementById("variationVolume");

const drumValue = document.getElementById("drumValue");
const bassValue = document.getElementById("bassValue");
const leadValue = document.getElementById("leadValue");
const variationValue = document.getElementById("variationValue");

const codeDisplay = document.getElementById("codeDisplay");

const copyButton = document.getElementById("copyButton");
const downloadButton = document.getElementById("downloadButton");
const shareButton = document.getElementById("shareButton");

const toolStatus = document.getElementById("toolStatus");

const pianoStatus = document.getElementById("pianoStatus");

const currentMood = document.getElementById("currentMood");
const moodButtons = document.querySelectorAll(".mood-btn");

const ratingSection = document.getElementById("ratingSection");
const stars = document.querySelectorAll(".star");
const ratingText = document.getElementById("ratingText");

let timer = null;
let startTime = null;
let currentSong = null;
let selectedMood = "happy";
let selectedRating = 0;
let mixerUpdateTimer = null;


/* =================================
   STRUDEL
================================= */

initStrudel({
    prebake: () =>
        samples("github:tidalcycles/dirt-samples")
});


/* =================================
   MOOD PATTERNS
================================= */

const moodPatterns = {

    happy: {

        drums: "bd bd ~ bd, ~ sd ~ sd, hh*8",

        bass: "c3 e3 g3 e3 f3 a3 c4 a3",

        lead: "c5 e5 g5 e5 d5 f5 a5 f5",

        variation: "~ cp ~ cp, oh ~ oh ~"

    },


    dark: {

        drums: "bd ~ bd ~, ~ sd ~ sd, hh*8",

        bass: "a1 a1 c2 a1, f1 f1 e1 e1",
        lead: "a4 ~ c5 ~ e5 d5 c5 ~",
        variation: "~ ~ cp ~, ~ oh ~ ~"
    },
    chill: {
        drums: "bd ~ ~ bd, ~ sd ~ ~, hh*4",
        bass: "a2 ~ e2 ~ f2 ~ c2 ~",
        lead: "a4 c5 ~ e5, g4 ~ e4 ~",
        variation: "~ ~ cp ~, ~ ~ ~ oh"
    },
    energetic: {
        drums: "bd bd bd bd, sd ~ sd sd, hh*16",
        bass: "a2 a2 e3 e3 f2 f2 g2 g2",
        lead: "a4 c5 e5 g5 a5 g5 e5 c5",
        variation: "cp cp ~ cp, oh oh ~ oh"
    },
    mysterious: {
        drums: "bd ~ ~ bd, ~ sd ~ ~, hh*8",
        bass: "a1 ~ c2 ~ e2 ~ d2 ~",
        lead: "a4 ~ b4 c5 ~ e5 d5 ~",
        variation: "~ cp ~ ~, ~ oh ~ cp"
    }
};
/* =================================
   VOLUME
================================= */

function getVolumes() {
    return {
        drums: Number(drumVolume.value) / 100,
        bass: Number(bassVolume.value) / 100,
        lead: Number(leadVolume.value) / 100,
        variation: Number(variationVolume.value) / 100
    };
}

/* =================================
   CREATE SONG
================================= */

function createSong() {
    const v = getVolumes();
    const mood = moodPatterns[selectedMood];
    const leadSynth =
        selectedMood === "mysterious"
            ? "sine"
            : "triangle";
    const filter =
        selectedMood === "dark"
            ? 500
            : 800;
    return stack(
        /* DRUMS */
        s(mood.drums)
            .gain(v.drums),
        /* BASS */
        note(mood.bass)
            .s("sawtooth")
            .lpf(filter)
            .gain(v.bass),
        /* LEAD */
        note(mood.lead)
            .s(leadSynth)
            .attack(0.02)
            .release(0.2)
            .gain(v.lead),
        /* VARIATION */
        s(mood.variation)
            .gain(v.variation)
    );
}
/* =================================
   LIVE STRUDEL CODE
================================= */

function createSongCode() {
    const v = getVolumes();
    const mood = moodPatterns[selectedMood];
    const leadSynth =
        selectedMood === "mysterious"
            ? "sine"
            : "triangle";

    const filter =
        selectedMood === "dark"
            ? 500
            : 800;
    return `
setcpm(120/4)
stack(
  // ${selectedMood.toUpperCase()} MOOD
  // DRUMS
  s("${mood.drums}")
    .gain(${v.drums.toFixed(2)}),

  // BASS
  note("${mood.bass}")
    .s("sawtooth")
    .lpf(${filter})
    .gain(${v.bass.toFixed(2)}),

  // LEAD
  note("${mood.lead}")
    .s("${leadSynth}")
    .gain(${v.lead.toFixed(2)}),

  // VARIATION
  s("${mood.variation}")
    .gain(${v.variation.toFixed(2)})
)
`.trim();
}
function updateCode() {
    if (codeDisplay) {
        codeDisplay.textContent = createSongCode();
    }
}
/* =================================
   STOP CURRENT STRUDEL SONG
================================= */
function stopCurrentSong() {
    try {
        if (currentSong) {
            currentSong.stop();
        }
    } catch (error) {
        console.log(
            "Pattern stop:",
            error
        );
    }
    try {
        hush();
    } catch (error) {
        console.log(
            "Hush:",
            error
        );
    }
    currentSong = null;
}
/* =================================
   PLAY SONG
================================= */

playButton.addEventListener(
    "click",
    () => {
        try {
            /* Stop previous song */
            stopCurrentSong();
            /* Create new song */
            currentSong = createSong();
            /* Play */
            currentSong.play();
            /* Timer */
            startTime = Date.now();
            clearInterval(timer);
            timer = setInterval(
                updateTime,
                100
            );
            /* UI */
            status.textContent =
                "Playing - " +
                selectedMood.toUpperCase();
            visualizer.classList.add(
                "playing"
            );
            ratingSection.classList.remove(
                "show"
            );
        }
        catch (error) {
            console.error(
                "Strudel error:",
                error
            );
            status.textContent =
                "Strudel audio error - check Console";
        }
    }
);
/* =================================
   TIMER
================================= */
function updateTime() {
    if (!startTime) {
        return;
    }
    const elapsed =
        Math.floor(
            (Date.now() - startTime) / 1000
        );
    if (elapsed >= 30) {
        stopSong();
        return;
    }
    currentTime.textContent =
        "00:" +
        String(elapsed).padStart(
            2,
            "0"
        );
    progressBar.style.width =
        (elapsed / 30) * 100 + "%";
}
/* =================================
   STOP BUTTON
================================= */
function stopSong() {
    stopCurrentSong();
    clearInterval(timer);
    clearTimeout(mixerUpdateTimer);
    timer = null;
    currentTime.textContent =
        "00:00";
    progressBar.style.width =
        "0%";
    visualizer.classList.remove(
        "playing"
    );
    status.textContent =
        "Stopped";
    ratingSection.classList.add(
        "show"
    );
}
/* STOP BUTTON */
stopButton.addEventListener(
    "click",
    stopSong
);
/* =================================
   DARK THEME
================================= */
darkBtn.addEventListener(
    "click",
    () => {
        document.body.classList.remove(
            "neon"
        );
    }
);
/* =================================
   NEON THEME
================================= */
neonBtn.addEventListener(
    "click",
    () => {
        document.body.classList.add(
            "neon"
        );
    }
);
/* =================================
   LIVE MIXER
================================= */

function updateLiveMixer() {
    updateLabels();
    updateCode();
    clearTimeout(
        mixerUpdateTimer
    );
    mixerUpdateTimer = setTimeout(
        () => {
            if (!currentSong) {
                return;
            }
            const elapsed =
                (Date.now() - startTime) /
                1000;
            stopCurrentSong();
            currentSong =
                createSong();
            currentSong.play();
            startTime =
                Date.now() -
                (elapsed * 1000);
        },
        100
    );
}
drumVolume.addEventListener(
    "input",
    updateLiveMixer
);
bassVolume.addEventListener(
    "input",
    updateLiveMixer
);
leadVolume.addEventListener(
    "input",
    updateLiveMixer
);
variationVolume.addEventListener(
    "input",
    updateLiveMixer
);
/* =================================
   UPDATE MIXER LABELS
================================= */
function updateLabels() {
    drumValue.textContent =
        drumVolume.value + "%";
    bassValue.textContent =
        bassVolume.value + "%";
    leadValue.textContent =
        leadVolume.value + "%";
    variationValue.textContent =
        variationVolume.value + "%";
}
/* =================================
   MOOD SELECTOR
================================= */

moodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectedMood =
                    button.dataset.mood;
                currentMood.textContent =
                    selectedMood.toUpperCase();
                moodButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );
                button.classList.add(
                    "active"
                );
                updateCode();
                /*
                 * Change music immediately
                 */

                if (currentSong) {
                    const elapsed =
                        (Date.now() - startTime) /
                        1000;
                    stopCurrentSong();
                    currentSong =
                        createSong();
                    currentSong.play();
                    startTime =
                        Date.now() -
                        (elapsed * 1000);
                }
            }
        );
    }
);
/* =================================
   COPY STRUDEL CODE
================================= */

copyButton.addEventListener(
    "click",
    async () => {

        try {
            await navigator.clipboard.writeText(
                createSongCode()
            );
            toolStatus.textContent =
                "Strudel code copied to clipboard.";
        }
        catch (error) {
            console.error(error);
            toolStatus.textContent =
                "Could not copy code.";

        }
    }
);
/* =================================
   DOWNLOAD CODE
================================= */

downloadButton.addEventListener(
    "click",
    () => {
        const code =
            createSongCode();
        const file =
            new Blob(
                [code],
                {
                    type: "text/plain"
                }
            );
        const url =
            URL.createObjectURL(file);
        const link =
            document.createElement("a");
        link.href = url;
        link.download =
            "neon-night.strudel";
        document.body.appendChild(
            link
        );
        link.click();
        link.remove();
        URL.revokeObjectURL(
            url
        );
        toolStatus.textContent =
            "neon-night.strudel downloaded.";
    }
);
/* =================================
   SHARE COMPOSITION
================================= */

shareButton.addEventListener(
    "click",
    async () => {

        const params =
            new URLSearchParams({

                drums:
                    drumVolume.value,

                bass:
                    bassVolume.value,

                lead:
                    leadVolume.value,

                variation:
                    variationVolume.value,

                mood:
                    selectedMood,

                theme:
                    document.body.classList.contains(
                        "neon"
                    )
                        ? "neon"
                        : "dark"
            });
        const shareURL =
            window.location.origin +
            window.location.pathname +
            "?" +
            params.toString();
        try {
            await navigator.clipboard.writeText(
                shareURL
            );
            toolStatus.textContent =
                "Share link copied to clipboard.";
        }
        catch (error) {
            toolStatus.textContent =
                shareURL;
        }
    }
);
/* =================================
   LOAD SHARED COMPOSITION
================================= */

function loadFromURL() {
    const params =
        new URLSearchParams(
            window.location.search
        );
    if (
        !params.has("drums") &&
        !params.has("mood")
    ) {
        return;
    }
    if (params.has("drums")) {
        drumVolume.value =
            params.get("drums");
    }
    if (params.has("bass")) {
        bassVolume.value =
            params.get("bass");
    }
    if (params.has("lead")) {
        leadVolume.value =
            params.get("lead");
    }
    if (params.has("variation")) {
        variationVolume.value =
            params.get("variation");
    }
    if (params.has("mood")) {
        const mood =
            params.get("mood");
        if (moodPatterns[mood]) {
            selectedMood =
                mood;
            currentMood.textContent =
                mood.toUpperCase();
            moodButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.mood ===
                        mood
                    );
                }
            );
        }
    }
    if (
        params.get("theme") ===
        "neon"
    ) {
        document.body.classList.add(
            "neon"
        );
    }
    updateLabels();
    updateCode();
    toolStatus.textContent =
        "Composition loaded from shared link.";
}
/* =================================
   SONG RATING
================================= */

stars.forEach(
    star => {
        star.addEventListener(
            "click",
            () => {
                selectedRating =
                    Number(
                        star.dataset.rating
                    );
                stars.forEach(
                    item => {
                        const value =
                            Number(
                                item.dataset.rating
                            );
                        if (
                            value <=
                            selectedRating
                        ) {
                            item.classList.add(
                                "selected"
                            );
                        }
                        else {
                            item.classList.remove(
                                "selected"
                            );
                        }
                    }
                );
                const messages = {
                    1:
                        "Not your vibe ",
                    2:
                        "Could be better",
                    3:
                        "Pretty good",
                    4:
                        "Really nice!",
                    5:
                        "You loved it! ★"
                };
                ratingText.textContent =
                    messages[selectedRating];
            }
        );
    }
);

/* =================================
   MINI PIANO
================================= */

const noteFrequencies = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25
};
let pianoAudio = null;
/* =================================
   PLAY PIANO NOTE
================================= */

function playPianoNote(note) {
    if (!pianoAudio) {
        pianoAudio =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }
    if (
        pianoAudio.state ===
        "suspended"
    ) {

        pianoAudio.resume();
    }
    const oscillator =
        pianoAudio.createOscillator();
    const gain =
        pianoAudio.createGain();
    oscillator.type =
        "triangle";
    oscillator.frequency.value =
        noteFrequencies[note];
    gain.gain.setValueAtTime(
        0,
        pianoAudio.currentTime
    );
    gain.gain.linearRampToValueAtTime(
        0.3,
        pianoAudio.currentTime +
        0.02
    );
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        pianoAudio.currentTime +
        0.7
    );


    oscillator.connect(gain);

    gain.connect(
        pianoAudio.destination
    );
    oscillator.start();
    oscillator.stop(
        pianoAudio.currentTime +
        0.7
    );
}
/* =================================
   PIANO BUTTONS
================================= */

document
    .querySelectorAll(".key")
    .forEach(
        key => {
            key.addEventListener(
                "click",
                () => {
                    const note =
                        key.dataset.note;
                    playPianoNote(
                        note
                    );
                    key.classList.add(
                        "active"
                    );
                    pianoStatus.textContent =
                        "Playing " +
                        note;
                    setTimeout(
                        () => {

                            key.classList.remove(
                                "active"
                            );

                        },
                        150
                    );
                }
            );
        }
    );
/* =================================
   KEYBOARD PIANO
================================= */

const keyboardNotes = {
    a: "C4",
    s: "D4",
    d: "E4",
    f: "F4",
    g: "G4",
    h: "A4",
    j: "B4",
    k: "C5"
};
document.addEventListener(
    "keydown",
    event => {
        const note =
            keyboardNotes[
                event.key.toLowerCase()
            ];
        if (!note) {
            return;
        }
        playPianoNote(
            note
        );
        const key =
            document.querySelector(
                `[data-note="${note}"]`
            );
        if (key) {
            key.classList.add(
                "active"
            );
            setTimeout(
                () => {
                    key.classList.remove(
                        "active"
                    );
                },
                150
            );
        }
    }
);
/* =================================
   INITIALIZE
================================= */
updateLabels();
updateCode();
loadFromURL();