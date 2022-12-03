import collision from "./collisionData.js";
const collisionMap = [];
for (let i = 0; i < collision.length; i += 50) {
  const el = collision.slice(i, 50 + i);
  collisionMap.push(el);
}

import clueLocation from "./clueData.js";
const clueLocationMap = [];
for (let i = 0; i < clueLocation.length; i += 50) {
  const el = clueLocation.slice(i, 50 + i);
  clueLocationMap.push(el);
}

import questionSet from "./questionSet/questionSet.js";
let randomQuestionSet = {};
const randomIndex = Math.floor(Math.random() * questionSet.length);
randomQuestionSet = questionSet[randomIndex];

const baseMapImg = requestImage("./assets/BaseMap.png");
const playerImg = requestImage("./assets/player.png");

function requestImage(source) {
  const image = new Image();
  image.src = source;
  return image;
}

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 650;
canvas.height = 650;

const scrollOpenSound = new Audio("./sounds/scrollopen.mp3");

class Boundary {
  static width = 80;
  static height = 80;
  constructor({ position }) {
    this.position = position;
    this.width = 80;
    this.height = 80;
  }

  draw() {
    c.beginPath();
    c.arc(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.width / 2,
      0,
      2 * Math.PI,
      false
    );
    c.fillStyle = "red";
    c.fill();
    // c.fillStyle = "red";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
class Player {
  constructor({ position, image, frame = { max: 1 } }) {
    this.position = position;
    this.image = image;
    this.frame = { ...frame, val: 0, elapsed: 0 };

    this.image.onload = () => {
      this.width = this.image.width / this.frame.max;
      this.height = this.image.height / this.frame.max;
    };

    this.walking = false;
    this.direction = 0;
  }

  draw() {
    c.beginPath();
    c.arc(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.width / 2,
      0,
      2 * Math.PI,
      false
    );
    c.fillStyle = "red";
    c.fill();
    c.drawImage(
      this.image,
      this.frame.val * this.width,
      this.direction * this.height,
      this.image.width / this.frame.max,
      this.image.height / this.frame.max,
      this.position.x,
      this.position.y,
      this.image.width / this.frame.max,
      this.image.height / this.frame.max
    );

    if (!this.walking) return;

    if (this.frame.max > 1) {
      this.frame.elapsed++;
    }

    if (this.frame.elapsed % 10 == 0) {
      if (this.frame.val < this.frame.max - 1) this.frame.val++;
      else this.frame.val = 0;
    }
  }
}
class Scroll {
  constructor({ position, question, image }) {
    this.position = position;
    this.question = question;
    this.image = image;
    this.isVisible = false;
    this.width = Boundary.width;
    this.height = Boundary.height;
  }

  draw() {
    c.fillStyle = "pink";
    c.fillRect(this.position.x, this.position.y, 80, 80);
  }

  postQuestion() {
    if (this.isVisible) return;
    openScroll(this.question, this);
  }
}
class BaseMap {
  constructor({ position }) {
    this.position = position;
  }

  draw() {
    c.drawImage(baseMapImg, this.position.x, this.position.y);
  }
}

const offset = {
  x: -100,
  y: -600,
};

const baseMap = new BaseMap({ position: offset });

// Creation of boundaries
const boundaries = [];
collisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol == 889) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
    }
  });
});

const clueLocationList = [];
clueLocationMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol == 889) {
      clueLocationList.push({
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y,
      });
    }
  });
});

const scrollList = [];
const questionListArray = [...randomQuestionSet.questionList];
while (questionListArray.length > 0) {
  const randomIndex = getRandomIndex(questionListArray);
  const question = questionListArray.splice(randomIndex, 1);

  const randomLocationIndex = getRandomIndex(clueLocationList);
  const scrollLocationData = clueLocationList.splice(randomLocationIndex, 1);

  scrollList.push(
    new Scroll({
      position: {
        x: scrollLocationData[0].x,
        y: scrollLocationData[0].y,
      },
      question: question[0],
    })
  );
}

const player = new Player({
  position: {
    x: canvas.width / 2 - 64 / 2,
    y: canvas.height / 2 - 64 / 2,
  },
  image: playerImg,
  frame: { max: 4 },
});

const collisionDetection = ({ player, obstacle }) => {
  const pX = player.position.x + player.width / 2;
  const pY = player.position.y + player.height / 2;
  const pR = player.width / 2;

  const oX = obstacle.position.x + obstacle.width / 2;
  const oY = obstacle.position.y + obstacle.height / 2;
  const oR = obstacle.width / 2;

  const dx = oX - pX;
  const dY = oY - pY;

  const distance = Math.sqrt(dx * dx + dY * dY);
  const sumRadius = pR + oR;

  if (distance <= sumRadius) {
    console.log(distance, sumRadius);

    return true;
  }

  return false;

  // return (
  //   player.position.x + player.width >= obstacle.position.x &&
  //   player.position.x <= obstacle.position.x + obstacle.width &&
  //   player.position.y <= obstacle.position.y + obstacle.height &&
  //   player.position.y + player.height >= obstacle.position.y
  // );
};

const move = [baseMap, ...boundaries, ...scrollList];

const walkAudio = new Audio("./sounds/footstep.mp3");
walkAudio.loop = true;

let isPlaying = false;
let isPause = false;
const playBtn = document.querySelector("#playBtn");
playBtn.addEventListener("click", () => {
  isPlaying = true;
});

function animate() {
  requestAnimationFrame(animate);
  baseMap.draw();
  // boundaries.forEach((boundary) => {
  //   boundary.draw();
  // });
  scrollList.forEach((scroll) => {
    scroll.draw();
  });
  player.draw();
  walkAudio.pause();

  if (!isPlaying || isPause) return;
  let moving = true;
  player.walking = false;

  if (keys.w.pressed && lastKey == "w") {
    player.direction = 1;
    player.walking = true;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          player,
          obstacle: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y + 3 },
          },
        })
      ) {
        boundary.draw();
        moving = false;
        break;
      }
    }

    for (let i = 0; i < scrollList.length; i++) {
      const scroll = scrollList[i];
      if (collisionDetection({ player, obstacle: scroll })) {
        scroll.postQuestion();
      }
    }

    if (moving) {
      walkAudio.play();
      move.forEach((m) => {
        m.position.y += 3;
      });
    }
  }
  if (keys.s.pressed && lastKey == "s") {
    player.direction = 0;
    player.walking = true;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          player,
          obstacle: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y - 3 },
          },
        })
      ) {
        boundary.draw();
        moving = false;
        break;
      }
    }

    for (let i = 0; i < scrollList.length; i++) {
      const scroll = scrollList[i];
      if (collisionDetection({ player, obstacle: scroll })) {
        scroll.postQuestion();
      }
    }

    if (moving) {
      walkAudio.play();
      move.forEach((m) => {
        m.position.y -= 3;
      });
    }
  }
  if (keys.a.pressed && lastKey == "a") {
    player.direction = 2;
    player.walking = true;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          player,
          obstacle: {
            ...boundary,
            position: { x: boundary.position.x + 3, y: boundary.position.y },
          },
        })
      ) {
        boundary.draw();
        moving = false;
        break;
      }
    }

    for (let i = 0; i < scrollList.length; i++) {
      const scroll = scrollList[i];
      if (collisionDetection({ player, obstacle: scroll })) {
        scroll.postQuestion();
      }
    }

    if (moving) {
      walkAudio.play();
      move.forEach((m) => {
        m.position.x += 3;
      });
    }
  }
  if (keys.d.pressed && lastKey == "d") {
    player.direction = 3;
    player.walking = true;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          player,
          obstacle: {
            ...boundary,
            position: { x: boundary.position.x - 3, y: boundary.position.y },
          },
        })
      ) {
        boundary.draw();
        moving = false;
        break;
      }
    }

    for (let i = 0; i < scrollList.length; i++) {
      const scroll = scrollList[i];
      if (collisionDetection({ player, obstacle: scroll })) {
        scroll.postQuestion();
      }
    }

    if (moving) {
      walkAudio.play();
      move.forEach((m) => {
        m.position.x -= 3;
      });
    }
  }
}
animate();

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastOpen = 0;
function openScroll(question, questionObject) {
  if (lastOpen > Date.now()) return;
  scrollOpenSound.play();
  isPause = true;
  const container = document.querySelector("#questionContainer");
  container.style.padding = "30px";
  container.style.backgroundImage = "url('./assets/clue.jpg')";
  container.style.backgroundPosition = "center";
  container.style.backgroundRepeat = "no-repeat";
  container.style.backgroundSize = "cover";
  // container.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  container.style.borderRadius = "10px";

  const strsplt = question.split("|");

  const questionNumber = document.createElement("h3");
  questionNumber.textContent = `${strsplt[0].trim()}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = strsplt[1].trim();

  const button = document.createElement("button");
  button.textContent = "close";

  button.addEventListener("click", () => {
    paragraph.remove();
    button.remove();
    questionNumber.remove();
    container.style.padding = "0";
    questionObject.isVisible = false;
    isPause = false;
    lastOpen = Date.now() + 1000;
  });

  container.append(questionNumber);
  container.append(paragraph);
  container.append(button);

  questionObject.isVisible = true;
}
let lastKey = "";
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
function getRandomIndex(array) {
  return Math.floor(Math.random() * array.length);
}
