/* =========================================
   NEON NIGHT
   HTML + CSS + JavaScript + Strudel
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");

const darkBtn = document.getElementById("darkBtn");
const neonBtn = document.getElementById("neonBtn");

const status = document.getElementById("status");
const currentTime = document.getElementById("currentTime");
const progressBar = document.getElementById("progressBar");
const visualizer = document.getElementById("visualizer");

const currentMood = document.getElementById("currentMood");
const moodButtons = document.querySelectorAll(".mood-btn");

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


/* =========================================
   STATE
========================================= */

let selectedMood = "happy";

let isPlaying = false;

let startTime = null;

let timer = null;

let mixerTimer = null;

let audioReady = false;


/* =========================================
   MOOD PATTERNS
========================================= */

const moodPatterns = {

    happy: {

        drums:
            "bd bd ~ bd, ~ sd ~ sd, hh*8",

        bass:
            "c3 e3 g3 e3 f3 a3 c4 a3",

        lead:
            "c5 e5 g5 e5 d5 f5 a5 f5",

        variation:
            "~ cp ~ cp, hh ~ hh ~"

    },


    dark: {

        drums:
            "bd ~ bd ~, ~ sd ~ sd, hh*8",

        bass:
            "a1 a1 c2 a1, f1 f1 e1 e1",

        lead:
            "a4 ~ c5 ~ e5 d5 c5 ~",

        variation:
            "~ ~ cp ~, ~ hh ~ ~"

    },


    chill: {

        drums:
            "bd ~ ~ bd, ~ sd ~ ~, hh*4",

        bass:
            "a2 ~ e2 ~ f2 ~ c2 ~",

        lead:
            "a4 c5 ~ e5, g4 ~ e4 ~",

        variation:
            "~ ~ cp ~, ~ ~ ~ hh"

    },


    energetic: {

        drums:
            "bd bd bd bd, sd ~ sd sd, hh*16",

        bass:
            "a2 a2 e3 e3 f2 f2 g2 g2",

        lead:
            "a4 c5 e5 g5 a5 g5 e5 c5",

        variation:
            "cp cp ~ cp, hh hh ~ hh"

    },


    mysterious: {

        drums:
            "bd ~ ~ bd, ~ sd ~ ~, hh*8",

        bass:
            "a1 ~ c2 ~ e2 ~ d2 ~",

        lead:
            "a4 ~ b4 c5 ~ e5 d5 ~",

        variation:
            "~ cp ~ ~, ~ hh ~ cp"

    }

};


/* =========================================
   STRUDEL INITIALIZATION
========================================= */

initStrudel();


/* =========================================
   AUDIO CONTEXT
========================================= */

async function prepareAudio() {
    try {
        const ctx = getAudioContext();

        console.log("Before resume:", ctx.state);

        if (ctx.state === "suspended") {
            await ctx.resume();
        }

        console.log("After resume:", ctx.state);

        return ctx.state === "running";

    } catch (error) {
        console.error(
            "Could not start Strudel audio:",
            error
        );

        return false;
    }
}


/* =========================================
   GET MIXER VALUES
========================================= */

function getVolumes() {

    return {

        drums:
            Number(drumVolume.value) / 100,

        bass:
            Number(bassVolume.value) / 100,

        lead:
            Number(leadVolume.value) / 100,

        variation:
            Number(
                variationVolume.value
            ) / 100

    };

}


/* =========================================
   CREATE STRUDEL SONG
========================================= */

function createSong() {

    const volume =
        getVolumes();


    const mood =
        moodPatterns[selectedMood];


    let leadSound =
        "triangle";


    if (
        selectedMood ===
        "mysterious"
    ) {

        leadSound =
            "sine";

    }


    let filter =
        900;


    if (
        selectedMood ===
        "dark"
    ) {

        filter =
            500;

    }


    if (
        selectedMood ===
        "chill"
    ) {

        filter =
            700;

    }


    return stack(

        /* DRUMS */

        s(mood.drums)
            .gain(
                volume.drums
            ),


        /* BASS */

        note(mood.bass)
            .s("sawtooth")
            .lpf(filter)
            .gain(
                volume.bass
            ),


        /* LEAD */

        note(mood.lead)
            .s(leadSound)
            .attack(0.02)
            .release(0.2)
            .gain(
                volume.lead
            ),


        /* VARIATION */

        s(mood.variation)
            .gain(
                volume.variation
            )

    );

}


/* =========================================
   CREATE LIVE STRUDEL CODE
========================================= */

function createSongCode() {

    const volume =
        getVolumes();


    const mood =
        moodPatterns[selectedMood];


    const leadSound =
        selectedMood === "mysterious"
            ? "sine"
            : "triangle";


    let filter =
        900;


    if (
        selectedMood ===
        "dark"
    ) {

        filter =
            500;

    }


    if (
        selectedMood ===
        "chill"
    ) {

        filter =
            700;

    }


    return `setcpm(120/4)

stack(

  // ${selectedMood.toUpperCase()} MOOD

  // DRUMS
  s("${mood.drums}")
    .gain(${volume.drums.toFixed(2)}),

  // BASS
  note("${mood.bass}")
    .s("sawtooth")
    .lpf(${filter})
    .gain(${volume.bass.toFixed(2)}),

  // LEAD
  note("${mood.lead}")
    .s("${leadSound}")
    .gain(${volume.lead.toFixed(2)}),

  // VARIATION
  s("${mood.variation}")
    .gain(${volume.variation.toFixed(2)})

)`;

}


/* =========================================
   UPDATE CODE DISPLAY
========================================= */

function updateCode() {

    if (!codeDisplay) {

        return;

    }


    codeDisplay.textContent =
        createSongCode();

}


/* =========================================
   STOP STRUDEL
========================================= */

function stopMusic() {

    try {

        /*
         * Strudel's official
         * stop function.
         */

        hush();

    }

    catch (error) {

        console.log(
            "Strudel stop:",
            error
        );

    }


    isPlaying = false;

    clearInterval(timer);

    timer = null;

    clearTimeout(
        mixerTimer
    );


    if (visualizer) {

        visualizer.classList.remove(
            "playing"
        );

    }


    if (status) {

        status.textContent =
            "Stopped";

    }

}


/* =========================================
   PLAY SONG
========================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        async () => {

            try {

                // Start/resume browser audio
                const audioStarted =
                    await prepareAudio();

                if (!audioStarted) {

                    if (status) {
                        status.textContent =
                            "Audio could not start";
                    }

                    console.error(
                        "Strudel AudioContext did not start."
                    );

                    return;
                }


                // Stop anything already playing
                try {
                    hush();
                } catch (error) {
                    console.log(
                        "Nothing to stop:",
                        error
                    );
                }


                // Create the current song
                const song =
                    createSong();


                // Play Strudel
                song.play();


                // Update state
                isPlaying = true;

                startTime =
                    Date.now();


                // Start timer
                clearInterval(timer);

                timer =
                    setInterval(
                        updateTime,
                        100
                    );


                // Update UI
                if (status) {

                    status.textContent =
                        "Playing - " +
                        selectedMood.toUpperCase();

                }


                if (visualizer) {

                    visualizer.classList.add(
                        "playing"
                    );

                }


                console.log(
                    "NEON NIGHT is playing"
                );

            }

            catch (error) {

                console.error(
                    "Strudel error:",
                    error
                );


                if (status) {

                    status.textContent =
                        "Audio error - check Console";

                }

            }

        }
    );

}

/* =========================================
   STOP BUTTON
========================================= */

if (stopButton) {

    stopButton.addEventListener(
        "click",
        () => {

            stopMusic();


            if (currentTime) {

                currentTime.textContent =
                    "00:00";

            }


            if (progressBar) {

                progressBar.style.width =
                    "0%";

            }

        }
    );

}


/* =========================================
   30 SECOND TIMER
========================================= */

function updateTime() {

    if (
        !isPlaying ||
        !startTime
    ) {

        return;

    }


    const elapsed =
        Math.floor(
            (
                Date.now() -
                startTime
            ) / 1000
        );


    /*
     * Stop after 30 seconds.
     */

    if (
        elapsed >= 30
    ) {

        stopMusic();


        if (currentTime) {

            currentTime.textContent =
                "00:30";

        }


        if (progressBar) {

            progressBar.style.width =
                "100%";

        }


        if (status) {

            status.textContent =
                "Song finished";

        }


        return;

    }


    /*
     * Update clock.
     */

    if (currentTime) {

        currentTime.textContent =
            "00:" +
            String(
                elapsed
            ).padStart(
                2,
                "0"
            );

    }


    /*
     * Update progress.
     */

    if (progressBar) {

        progressBar.style.width =
            (
                elapsed / 30
            ) * 100 +
            "%";

    }

}


/* =========================================
   THEME - DARK
========================================= */

if (darkBtn) {

    darkBtn.addEventListener(
        "click",
        () => {

            document.body.classList.remove(
                "neon"
            );

        }
    );

}


/* =========================================
   THEME - NEON
========================================= */

if (neonBtn) {

    neonBtn.addEventListener(
        "click",
        () => {

            document.body.classList.add(
                "neon"
            );

        }
    );

}


/* =========================================
   UPDATE MIXER LABELS
========================================= */

function updateMixerLabels() {

    if (drumValue) {

        drumValue.textContent =
            drumVolume.value +
            "%";

    }


    if (bassValue) {

        bassValue.textContent =
            bassVolume.value +
            "%";

    }


    if (leadValue) {

        leadValue.textContent =
            leadVolume.value +
            "%";

    }


    if (variationValue) {

        variationValue.textContent =
            variationVolume.value +
            "%";

    }

}


/* =========================================
   LIVE MIXER UPDATE
========================================= */

function updateMixer() {

    updateMixerLabels();

    updateCode();


    /*
     * If song isn't playing,
     * just update the UI.
     */

    if (!isPlaying) {

        return;

    }


    clearTimeout(
        mixerTimer
    );


    mixerTimer =
        setTimeout(
            () => {

                /*
                 * Remember current position.
                 */

                const elapsed =
                    (
                        Date.now() -
                        startTime
                    ) / 1000;


                /*
                 * Stop current pattern.
                 */

                try {

                    hush();

                }

                catch (error) {

                    console.log(error);

                }


                /*
                 * Start pattern
                 * with new volume.
                 */

                createSong().play();


                /*
                 * Keep the timer
                 * at the same position.
                 */

                startTime =
                    Date.now() -
                    (
                        elapsed *
                        1000
                    );

            },
            120
        );

}


/* =========================================
   MIXER EVENTS
========================================= */

if (drumVolume) {

    drumVolume.addEventListener(
        "input",
        updateMixer
    );

}


if (bassVolume) {

    bassVolume.addEventListener(
        "input",
        updateMixer
    );

}


if (leadVolume) {

    leadVolume.addEventListener(
        "input",
        updateMixer
    );

}


if (variationVolume) {

    variationVolume.addEventListener(
        "input",
        updateMixer
    );

}


/* =========================================
   MOOD BUTTONS
========================================= */

moodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectedMood =
                    button.dataset.mood;


                /*
                 * Update text.
                 */

                if (currentMood) {

                    currentMood.textContent =
                        selectedMood.toUpperCase();

                }


                /*
                 * Active button.
                 */

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
                 * Change music
                 * immediately.
                 */

                if (isPlaying) {

                    const elapsed =
                        (
                            Date.now() -
                            startTime
                        ) / 1000;


                    try {

                        hush();

                    }

                    catch (error) {

                        console.log(error);

                    }


                    createSong().play();


                    startTime =
                        Date.now() -
                        (
                            elapsed *
                            1000
                        );

                }

            }
        );

    }
);


/* =========================================
   COPY STRUDEL CODE
========================================= */

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            try {

                const code =
                    createSongCode();


                await navigator.clipboard.writeText(
                    code
                );


                if (toolStatus) {

                    toolStatus.textContent =
                        "Strudel code copied!";

                }

            }

            catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );


                if (toolStatus) {

                    toolStatus.textContent =
                        "Could not copy code.";

                }

            }

        }
    );

}


/* =========================================
   DOWNLOAD STRUDEL FILE
========================================= */

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        () => {

            const code =
                createSongCode();


            const file =
                new Blob(
                    [code],
                    {
                        type:
                            "text/plain"
                    }
                );


            const url =
                URL.createObjectURL(
                    file
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


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


            if (toolStatus) {

                toolStatus.textContent =
                    "neon-night.strudel downloaded.";

            }

        }
    );

}


/* =========================================
   SHARE COMPOSITION
========================================= */

if (shareButton) {

    shareButton.addEventListener(
        "click",
        async () => {

            const params =
                new URLSearchParams();


            params.set(
                "mood",
                selectedMood
            );


            params.set(
                "drums",
                drumVolume.value
            );


            params.set(
                "bass",
                bassVolume.value
            );


            params.set(
                "lead",
                leadVolume.value
            );


            params.set(
                "variation",
                variationVolume.value
            );


            const shareURL =
                window.location.origin +
                window.location.pathname +
                "?" +
                params.toString();


            try {

                await navigator.clipboard.writeText(
                    shareURL
                );


                if (toolStatus) {

                    toolStatus.textContent =
                        "Share link copied!";

                }

            }

            catch (error) {

                console.error(
                    "Share failed:",
                    error
                );


                if (toolStatus) {

                    toolStatus.textContent =
                        shareURL;

                }

            }

        }
    );

}


/* =========================================
   LOAD SHARED SETTINGS
========================================= */

function loadSharedSettings() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const mood =
        params.get("mood");


    if (
        mood &&
        moodPatterns[mood]
    ) {

        selectedMood =
            mood;


        moodButtons.forEach(
            button => {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.mood ===
                    mood
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


        if (currentMood) {

            currentMood.textContent =
                mood.toUpperCase();

        }

    }


    const settings = [

        [
            "drums",
            drumVolume
        ],

        [
            "bass",
            bassVolume
        ],

        [
            "lead",
            leadVolume
        ],

        [
            "variation",
            variationVolume
        ]

    ];


    settings.forEach(
        ([name, input]) => {

            const value =
                params.get(name);


            if (
                value !== null &&
                input
            ) {

                const number =
                    Number(value);


                if (
                    number >= 0 &&
                    number <= 100
                ) {

                    input.value =
                        number;

                }

            }

        }
    );

}


/* =========================================
   MINI PIANO
========================================= */

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


/* =========================================
   PIANO AUDIO
========================================= */

function getPianoAudio() {

    if (!pianoAudio) {

        pianoAudio =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    return pianoAudio;

}


async function playPianoNote(note) {

    try {

        const audio =
            getPianoAudio();


        if (
            audio.state ===
            "suspended"
        ) {

            await audio.resume();

        }


        const oscillator =
            audio.createOscillator();


        const gain =
            audio.createGain();


        oscillator.type =
            "triangle";


        oscillator.frequency.value =
            noteFrequencies[note];


        gain.gain.setValueAtTime(
            0.001,
            audio.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.25,
            audio.currentTime +
            0.02
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime +
            0.7
        );


        oscillator.connect(
            gain
        );


        gain.connect(
            audio.destination
        );


        oscillator.start();


        oscillator.stop(
            audio.currentTime +
            0.7
        );

    }

    catch (error) {

        console.error(
            "Piano audio error:",
            error
        );

    }

}


/* =========================================
   PIANO BUTTONS
========================================= */

document
    .querySelectorAll(".key")
    .forEach(
        key => {

            key.addEventListener(
                "click",
                async () => {

                    const note =
                        key.dataset.note;


                    await playPianoNote(
                        note
                    );


                    key.classList.add(
                        "active"
                    );


                    if (pianoStatus) {

                        pianoStatus.textContent =
                            "Playing " +
                            note;

                    }


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


/* =========================================
   COMPUTER KEYBOARD PIANO
========================================= */

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
    async event => {

        /*
         * Don't trigger piano
         * while typing in inputs.
         */

        if (
            event.target.tagName ===
            "INPUT"
        ) {

            return;

        }


        const key =
            event.key.toLowerCase();


        const note =
            keyboardNotes[key];


        if (!note) {

            return;

        }


        await playPianoNote(
            note
        );


        const pianoKey =
            document.querySelector(
                `[data-note="${note}"]`
            );


        if (pianoKey) {

            pianoKey.classList.add(
                "active"
            );


            setTimeout(
                () => {

                    pianoKey.classList.remove(
                        "active"
                    );

                },
                150
            );

        }

    }
);


/* =========================================
   INITIALIZE UI
========================================= */

loadSharedSettings();

updateMixerLabels();

updateCode();


if (currentMood) {

    currentMood.textContent =
        selectedMood.toUpperCase();

}


/* =========================================
   CONSOLE MESSAGE
========================================= */

console.log(
    "NEON NIGHT loaded successfully."
);

console.log(
    "Strudel custom UI ready."
);