const canvas = document.querySelector("canvas");
const playBtn = document.querySelector("#playBtn");

const quakeSound = new Audio("./sounds/quake.mp3");
const ambientSound = new Audio("./sounds/ambient.mp3");

const shakeObject = [
  {
    delay: 3000,
    message: "This cave is not stable, I need to get out quickly",
  },
  {
    delay: 3000,
    message: "Ouch!! Some rocks fell on my head",
  },
  {
    delay: 3000,
    message: "I hope this won't collapse until I get out",
  },
  {
    delay: 3000,
    message: "Oh ohh, careful now, don't lose your balance",
  },
  {
    delay: 3000,
    message: "Ugghhh, this is getting scary now",
  },
];

let isPlaying = false;
export let doneIntro = false;

// Play state function
playBtn.addEventListener("click", () => {
  isPlaying = true;
  const wrapper = document.querySelector(".titleDescription");
  const titleWrapper = document.querySelector(".titleWrapper");
  titleWrapper.style.opacity = 0;
  wrapper.style.opacity = 0;
  ambientSound.play();
  ambientSound.loop = true;
  playIntroMessage();

  setTimeout(() => {
    wrapper.remove();
    titleWrapper.remove();
  }, 1000);
});

// Earthquake Generator
setInterval(() => {
  if (!isPlaying || !doneIntro) return;
  const random = Math.random() * 100 + 1;
  if (random <= 10) {
    if (canvas.classList.contains("shake")) {
      canvas.classList.remove("shake");
    } else {
      canvas.classList.add("shake");
      quakeSound.play();
      sendRandomText();
    }
  }
}, 3000);

const textHolder = document.querySelector("#textPlaceHolder");

function playIntroMessage() {
  const introMessage = [
    "Max: Where am I?",
    "Max: What is this place?",
    "Max: I can see the exit but the gate is close",
    "Max: I need to find a way to unlock it",
    "Max: Maybe that console will give me a clue",
  ];
  sendText(2500, introMessage);
}

function sendText(delay, messages = []) {
  let count = 0;
  let max = messages.length;
  const timer = setInterval(() => {
    if (count >= max) {
      clearInterval(timer);
      doneIntro = true;

      textHolder.textContent = "Press W, A, S, D to move";
      setTimeout(() => {
        textHolder.style.opacity = 0;
      }, 5000);

      return;
    }
    const msg = messages[count];
    count++;

    textHolder.textContent = msg;
    textHolder.style.opacity = 1;
  }, delay);
}

function sendRandomText() {
  const randomIndex = Math.floor(Math.random() * shakeObject.length);
  const obs = shakeObject[randomIndex];

  textHolder.textContent = obs.message;
  textHolder.style.opacity = 1;
  setTimeout(() => {
    textHolder.style.opacity = 0;
  }, obs.delay);
}

let showing = true;
window.addEventListener("keydown", (e) => {
  if (!showing) return;
  switch (e.key) {
    case "w":
    case "a":
    case "s":
    case "d":
      textHolder.style.opacity = 0;
      showing = false;
      break;
  }
});
