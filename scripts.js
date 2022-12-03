import collision from "./collisionData.js";

const baseMapImg = requestImage("./assets/BaseMap.png");
const playerImg = requestImage("./assets/player.png");

function requestImage(source) {
  const image = new Image();
  image.src = source;
  return image;
}

const collisionMap = [];
for (let i = 0; i < collision.length; i += 50) {
  const el = collision.slice(i, 50 + i);
  collisionMap.push(el);
}

class Boundary {
  static width = 80;
  static height = 80;
  constructor({ position }) {
    this.position = position;
    this.width = 80;
    this.height = 80;
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

const offset = {
  x: -100,
  y: -600,
};

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

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 650;
canvas.height = 650;

class BaseMap {
  constructor({ position, velocity }) {
    this.position = position;
  }

  draw() {
    c.drawImage(baseMapImg, this.position.x, this.position.y);
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

const player = new Player({
  position: {
    x: canvas.width / 2 - 64 / 2,
    y: canvas.height / 2 - 64 / 2,
  },
  image: playerImg,
  frame: { max: 4 },
});

const baseMap = new BaseMap({ position: offset });

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

const collisionDetection = ({ player, obstacle }) => {
  return (
    player.position.x + player.width >= obstacle.position.x &&
    player.position.x <= obstacle.position.x + obstacle.width &&
    player.position.y <= obstacle.position.y + obstacle.height &&
    player.position.y + player.height >= obstacle.position.y
  );
};

const move = [baseMap, ...boundaries];

const walkAudio = new Audio("./sounds/footstep.mp3");

let isPlaying = false;
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
  player.draw();
  if (!isPlaying) return;
  let moving = true;
  player.walking = false;
  walkAudio.pause();
  // walkAudio.currentTime = 0;
  walkAudio.loop = true;
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
        moving = false;
        break;
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
        moving = false;
        break;
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
        moving = false;
        break;
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
        moving = false;
        break;
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
