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


/* =================================
   VOLUMES
================================= */

function getVolumes() {

    return {

        drums:
            Number(drumVolume.value) / 100,

        bass:
            Number(bassVolume.value) / 100,

        lead:
            Number(leadVolume.value) / 100,

        variation:
            Number(variationVolume.value) / 100

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

        s(mood.drums)
            .gain(v.drums),

        note(mood.bass)
            .s("sawtooth")
            .lpf(filter)
            .gain(v.bass),

        note(mood.lead)
            .s(leadSynth)
            .attack(0.02)
            .release(0.2)
            .gain(v.lead),

        s(mood.variation)
            .gain(v.variation)

    );

}


/* =================================
   STRUDEL CODE
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

        codeDisplay.textContent =
            createSongCode();

    }

}


/* =================================
   STOP STRUDEL
================================= */

function stopCurrentSong() {

    try {

        hush();

    } catch (error) {

        console.log(
            "Could not stop Strudel:",
            error
        );

    }


    currentSong = null;

}


/* =================================
   PLAY
================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        () => {

            try {

                stopCurrentSong();


                currentSong =
                    createSong();


                currentSong.play();


                startTime =
                    Date.now();


                clearInterval(timer);


                timer =
                    setInterval(
                        updateTime,
                        100
                    );


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


                if (ratingSection) {

                    ratingSection.classList.remove(
                        "show"
                    );

                }

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


    if (currentTime) {

        currentTime.textContent =
            "00:" +
            String(elapsed).padStart(
                2,
                "0"
            );

    }


    if (progressBar) {

        progressBar.style.width =
            (elapsed / 30) * 100 + "%";

    }

}


/* =================================
   STOP
================================= */

function stopSong() {

    stopCurrentSong();


    clearInterval(timer);

    clearTimeout(mixerUpdateTimer);


    timer = null;


    if (currentTime) {

        currentTime.textContent =
            "00:00";

    }


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    if (visualizer) {

        visualizer.classList.remove(
            "playing"
        );

    }


    if (status) {

        status.textContent =
            "Stopped";

    }


    if (ratingSection) {

        ratingSection.classList.add(
            "show"
        );

    }

}


if (stopButton) {

    stopButton.addEventListener(
        "click",
        stopSong
    );

}


/* =================================
   DARK
================================= */

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


/* =================================
   NEON
================================= */

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


/* =================================
   MIXER
================================= */

function updateLiveMixer() {

    updateLabels();

    updateCode();


    clearTimeout(
        mixerUpdateTimer
    );


    mixerUpdateTimer =
        setTimeout(
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
                    elapsed * 1000;

            },
            150
        );

}


if (drumVolume) {

    drumVolume.addEventListener(
        "input",
        updateLiveMixer
    );

}


if (bassVolume) {

    bassVolume.addEventListener(
        "input",
        updateLiveMixer
    );

}


if (leadVolume) {

    leadVolume.addEventListener(
        "input",
        updateLiveMixer
    );

}


if (variationVolume) {

    variationVolume.addEventListener(
        "input",
        updateLiveMixer
    );

}


/* =================================
   MIXER LABELS
================================= */

function updateLabels() {

    if (drumValue) {

        drumValue.textContent =
            drumVolume.value + "%";

    }


    if (bassValue) {

        bassValue.textContent =
            bassVolume.value + "%";

    }


    if (leadValue) {

        leadValue.textContent =
            leadVolume.value + "%";

    }


    if (variationValue) {

        variationValue.textContent =
            variationVolume.value + "%";

    }

}


/* =================================
   MOODS
================================= */

moodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectedMood =
                    button.dataset.mood;


                if (currentMood) {

                    currentMood.textContent =
                        selectedMood.toUpperCase();

                }


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
                        elapsed * 1000;

                }

            }
        );

    }
);


/* =================================
   COPY CODE
================================= */

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    createSongCode()
                );


                if (toolStatus) {

                    toolStatus.textContent =
                        "Strudel code copied.";

                }

            }

            catch (error) {

                console.error(error);

            }

        }
    );

}


/* =================================
   DOWNLOAD CODE
================================= */

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        () => {

            const blob =
                new Blob(
                    [createSongCode()],
                    {
                        type: "text/plain"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "neon-night.strudel";


            document.body.appendChild(link);

            link.click();

            link.remove();


            URL.revokeObjectURL(url);


            if (toolStatus) {

                toolStatus.textContent =
                    "neon-night.strudel downloaded.";

            }

        }
    );

}


/* =================================
   SHARE
================================= */

if (shareButton) {

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


                if (toolStatus) {

                    toolStatus.textContent =
                        "Share link copied.";

                }

            }

            catch (error) {

                if (toolStatus) {

                    toolStatus.textContent =
                        shareURL;

                }

            }

        }
    );

}


/* =================================
   RATING
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


                        item.classList.toggle(
                            "selected",
                            value <= selectedRating
                        );

                    }
                );


                const messages = {

                    1: "Not your vibe 😅",

                    2: "Could be better",

                    3: "Pretty good",

                    4: "Really nice!",

                    5: "You loved it! ★"

                };


                if (ratingText) {

                    ratingText.textContent =
                        messages[selectedRating];

                }

            }
        );

    }
);


/* =================================
   PIANO
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
        pianoAudio.currentTime + 0.02
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        pianoAudio.currentTime + 0.7
    );


    oscillator.connect(gain);

    gain.connect(
        pianoAudio.destination
    );


    oscillator.start();


    oscillator.stop(
        pianoAudio.currentTime + 0.7
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


                    playPianoNote(note);


                    key.classList.add(
                        "active"
                    );


                    if (pianoStatus) {

                        pianoStatus.textContent =
                            "Playing " + note;

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


        playPianoNote(note);


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
   INITIAL
================================= */
updateLabels();
updateCode();