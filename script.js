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


