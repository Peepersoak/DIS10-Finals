const canvas = document.querySelector("canvas");
const playBtn = document.querySelector("#playBtn");

const quakeSound = new Audio("./sounds/quake.mp3");
const ambientSound = new Audio("./sounds/ambient.mp3");

let isPlaying = false;

// Play state function
playBtn.addEventListener("click", () => {
  isPlaying = true;
  const wrapper = document.querySelector(".titleDescription");
  wrapper.style.opacity = 0;
  ambientSound.play();
  ambientSound.loop = true;
  setTimeout(() => {
    wrapper.remove();
    playIntroMessage();
  }, 1000);
});

// Earthquake Generator
setInterval(() => {
  if (!isPlaying) return;
  const random = Math.random() * 100 + 1;
  if (random <= 10) {
    if (canvas.classList.contains("shake")) {
      canvas.classList.remove("shake");
    } else {
      canvas.classList.add("shake");
      quakeSound.play();
    }
  }
}, 3000);

const textHolder = document.querySelector("#textPlaceHolder");

function playIntroMessage() {
  const introMessage = [
    "Max: Where am I? What is this place...",
    "Max: The bridge was broken.",
    "Max: I need to find a way to fix it",
  ];
  sendText(2500, introMessage);
}

function sendText(delay, messages = []) {
  let count = 0;
  let max = messages.length;
  const timer = setInterval(() => {
    if (count >= max) {
      clearInterval(timer);
      textHolder.style.opacity = 0;
      return;
    }
    const msg = messages[count];
    count++;

    textHolder.textContent = msg;
    textHolder.style.opacity = 1;
  }, delay);
}
