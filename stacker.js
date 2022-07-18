const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const squareCountX = 7;
const squareCountY = 12;
const squareSize = canvas.width / squareCountX;
const header = document.getElementById("header");

let gameSpeed;
let gameOver;
let score;
let squaresRemaining;
let gameInterval;
let drawInterval;
let rigged = false;

// the map is a 2d array where a 0 means a square is empty and a 1 means a square is filled
let map;

// 0 = left, 1 = right
let squareDirection;

let gameLoop = () => {
  gameInterval = setTimeout(() => {
    update();
    draw();
    gameLoop();
  }, 1000 / gameSpeed);
};

let getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};

let getRandomPosition = () => {
  return getRandomInt(-squaresRemaining + 1, squareCountX - 1);
};

let moveLeft = () => {
  const currentY = score;
  let leftX = map[currentY].indexOf(1);

  if (leftX < squaresRemaining) {
    leftX = map[currentY].lastIndexOf(1) - squaresRemaining + 1;
  }

  let rightX = leftX + squaresRemaining - 1;

  if (rightX === 0) {
    squareDirection = 1;
    moveRight();
    return;
  }
  map[currentY][leftX - 1] = 1;
  map[currentY][rightX] = 0;
};

let moveRight = () => {
  const currentY = score;
  let leftX = map[currentY].indexOf(1);

  if (leftX < squaresRemaining) {
    leftX = map[currentY].lastIndexOf(1) - squaresRemaining + 1;
  }

  let rightX = leftX + squaresRemaining - 1;

  if (leftX === squareCountX - 1) {
    squareDirection = 0;
    moveLeft();
    return;
  }

  map[currentY][rightX + 1] = 1;
  map[currentY][leftX] = 0;
};

let advanceRow = () => {
  score++;

  if (score === 12) {
    gameOver = 2;
    return;
  }

  switch (score) {
    case 3:
      squaresRemaining = Math.min(squaresRemaining, 2);
      break;
    case 6:
      squaresRemaining = Math.min(squaresRemaining, 1);
      break;
    case 7:
      gameSpeed = 15;
      break;
    case 11:
      gameSpeed = 20;
      break;
  }

  // set a random position above the current row
  const randomX = getRandomPosition();
  for (let i = randomX; i < randomX + squaresRemaining; i++) {
    map[score][i] = 1;
  }

  // set a random direction
  squareDirection = Math.floor(Math.random() * 2);
};

let dropSquares = () => {
  const currentY = score;

  squaresRemaining = 0;
  const leftX = Math.max(0, map[currentY].indexOf(1));
  const rightX = Math.min(squareCountX - 1, map[currentY].lastIndexOf(1));

  if (score === 0) {
    squaresRemaining = rightX - leftX + 1;
    advanceRow();
    return;
  }

  for (let i = leftX; i <= rightX; i++) {
    const below = map[currentY - 1][i];
    if (below === 1) {
      map[currentY][i] = 1;
      squaresRemaining++;
    } else {
      map[currentY][i] = 0;
    }
  }

  if (squaresRemaining > 0) {
    advanceRow();
  }
};

let update = () => {
  if (gameOver) return;
  if (squareDirection === 0) {
    moveLeft();
  } else {
    moveRight();
  }
  if (squaresRemaining === 0) {
    gameOver = 1;
  }
};

let drawRect = (x, y, width, height, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
};

let drawRectOutline = (x, y, width, height, color, stroke) => {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke;
  ctx.rect(x, y, width, height);
  ctx.stroke();
};

let drawBackground = () => {
  drawRect(0, 0, canvas.width, canvas.height, "black");
};

let convertPointY = y => {
  return canvas.height - y;
};

let drawSquares = () => {
  for (let i = 0; i < squareCountY; i++) {
    for (let j = 0; j < squareCountX; j++) {
      if (map[i][j] === 1) {
        drawRect(j * squareSize, convertPointY(i * squareSize), squareSize, -squareSize, "red");
      }
    }
  }
};

let drawText = (text, x, y, color) => {
  ctx.font = "80px Impact";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
};

let drawGameOver = () => {
  drawText("Game Over", canvas.width / 2, canvas.height / 2, "white");
};

let drawWin = () => {
  drawText("You Win!", canvas.width / 2, canvas.height / 2, "white");
  confetti.start();
};

let drawGrid = () => {
  for (let i = 0; i < squareCountY; i++) {
    for (let j = 0; j < squareCountX; j++) {
      drawRectOutline(j * squareSize, convertPointY(i * squareSize), squareSize, -squareSize, "#3d3d3d", 2);
    }
  }
};

let draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawSquares();
  drawGrid();
  if (gameOver === 1) {
    drawGameOver();
  } else if (gameOver === 2) {
    drawWin();
  }
};

let resetGame = () => {
  confetti.stop();
  header.innerText = "Stacker";
  gameOver = 0;
  gameSpeed = 11;
  squaresRemaining = 3;
  score = 0;
  map = [];
  for (let i = 0; i < squareCountY; i++) {
    map[i] = [];
    for (let j = 0; j < squareCountX; j++) {
      map[i][j] = 0;
    }
  }

  // set a random position above the current row
  const randomX = getRandomPosition();
  for (let i = randomX; i < randomX + squaresRemaining; i++) {
    map[score][i] = 1;
  }

  // set a random direction
  squareDirection = Math.floor(Math.random() * 2);
};

window.addEventListener("keydown", event => {
  // listen for the spacebar
  if (event.code === "Space") {
    if (gameOver) {
      resetGame();
    } else {
      dropSquares();
    }
  }
});

resetGame();
gameLoop();
