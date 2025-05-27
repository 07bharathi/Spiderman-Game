const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");

let playerImage = new Image();
let enemyImage = new Image();

// Load images
playerImage.src = "hero.png"; // Ensure correct path
enemyImage.src = "villen.png"; // Ensure correct path

// Desired size for the images
const playerWidth = 80; // Set to your desired width
const playerHeight = 80; // Set to your desired height
const enemyWidth = 80; // Set to your desired width
const enemyHeight = 80; // Set to your desired height

// Player and enemy objects
const player = {
  x: 50,
  y: canvas.height - 100,
  speed: 5,
  dx: 0,
  dy: 0,
  health: 3,
  bullets: [],
  score: 0,
};

const enemy = {
  x: canvas.width - 100,
  y: canvas.height - 100,
  speed: 2,
  dx: 0,
  dy: 0,
  health: 3,
  bullets: [],
};

let gameInterval;
let enemyMoveInterval;
let timeElapsed = 0;
let gameOverFlag = false;

// Drawing functions
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, playerWidth, playerHeight);
}

function drawEnemy() {
  ctx.drawImage(enemyImage, enemy.x, enemy.y, enemyWidth, enemyHeight);
}

function drawBullet(bullet) {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update player and enemy positions
function newPos() {
  player.x += player.dx;
  player.y += player.dy;

  // Prevent player from going off the canvas
  if (player.x < 0) player.x = 0;
  if (player.x + playerWidth > canvas.width) player.x = canvas.width - playerWidth;
  if (player.y < 0) player.y = 0;
  if (player.y + playerHeight > canvas.height) player.y = canvas.height - playerHeight;

  // Enemy movement logic
  enemy.x += enemy.dx;
  enemy.y += enemy.dy;

  // Enemy boundary handling
  if (enemy.x < 0) {
    enemy.x = 0;
    enemy.dx = Math.random() * enemy.speed;
  } else if (enemy.x + enemyWidth > canvas.width) {
    enemy.x = canvas.width - enemyWidth;
    enemy.dx = -Math.random() * enemy.speed;
  }

  if (enemy.y < 0) {
    enemy.y = 0;
    enemy.dy = Math.random() * enemy.speed;
  } else if (enemy.y + enemyHeight > canvas.height) {
    enemy.y = canvas.height - enemyHeight;
    enemy.dy = -Math.random() * enemy.speed;
  }

  // Bullet logic for player and enemy
  player.bullets.forEach((bullet) => {
    bullet.x += bullet.dx;
  });
  player.bullets = player.bullets.filter((bullet) => bullet.x < canvas.width);

  player.bullets.forEach((bullet) => {
    if (
      bullet.x + bullet.width >= enemy.x &&
      bullet.x <= enemy.x + enemyWidth &&
      bullet.y + bullet.height >= enemy.y &&
      bullet.y <= enemy.y + enemyHeight
    ) {
      enemy.health -= 1;
      bullet.x = canvas.width + 1; // Remove the bullet
      player.score += 10;
      updateScore();
    }
  });

  enemy.bullets.forEach((bullet) => {
    bullet.x -= bullet.dx;
  });
  enemy.bullets = enemy.bullets.filter((bullet) => bullet.x > 0);

  enemy.bullets.forEach((bullet) => {
    if (
      bullet.x + bullet.width >= player.x &&
      bullet.x <= player.x + playerWidth &&
      bullet.y + bullet.height >= player.y &&
      bullet.y <= player.y + playerHeight
    ) {
      player.health -= 1;
      bullet.x = -1; // Remove the bullet
      if (player.health <= 0 && !gameOverFlag) {
        gameOverFlag = true;
        gameOver();
      }
    }
  });

  // Player and enemy collision
  if (
    player.x < enemy.x + enemyWidth &&
    player.x + playerWidth > enemy.x &&
    player.y < enemy.y + enemyHeight &&
    player.y + playerHeight > enemy.y &&
    !gameOverFlag
  ) {
    gameOverFlag = true;
    gameOver();
  }
}

function update() {
  clear();
  drawPlayer();
  drawEnemy();
  player.bullets.forEach(drawBullet);
  enemy.bullets.forEach(drawBullet);
  newPos();
  if (!gameOverFlag) {
    requestAnimationFrame(update);
  }
}

// Movement and shooting functions
function moveRight() {
  player.dx = player.speed;
}

function moveLeft() {
  player.dx = -player.speed;
}

function moveUp() {
  player.dy = -player.speed;
}

function moveDown() {
  player.dy = player.speed;
}

function shoot() {
  const bullet = {
    x: player.x + playerWidth,
    y: player.y + playerHeight / 2 - 5,
    width: 10,
    height: 5,
    dx: 7,
  };
  player.bullets.push(bullet);
}

function enemyShoot() {
  const bullet = {
    x: enemy.x,
    y: enemy.y + enemyHeight / 2 - 5,
    width: 10,
    height: 5,
    dx: 5,
  };
  enemy.bullets.push(bullet);
}

// Key press event handlers
function keyDown(e) {
  if (e.key === "ArrowRight") {
    moveRight();
  } else if (e.key === "ArrowLeft") {
    moveLeft();
  } else if (e.key === "ArrowUp") {
    moveUp();
  } else if (e.key === "ArrowDown") {
    moveDown();
  } else if (e.key === " ") {
    shoot();
  }
}

function keyUp(e) {
  if (
    e.key === "ArrowRight" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown"
  ) {
    player.dx = 0;
    player.dy = 0;
  }
}

// Updating the score and time
function updateScore() {
  scoreDisplay.textContent = `Score: ${player.score}`;
}

function updateTime() {
  timeElapsed++;
  timeDisplay.textContent = `Time: ${timeElapsed}`;
  if (timeElapsed % 10 === 0) {
    enemy.speed += 0.1; // Increase enemy speed every 10 seconds
  }
}

function randomizeEnemyDirection() {
  enemy.dx = (Math.random() - 0.5) * enemy.speed;
  enemy.dy = (Math.random() - 0.5) * enemy.speed;
}

// Game start and game over functions
function startGame() {
  player.health = 3;
  player.score = 0;
  enemy.health = 3;
  timeElapsed = 0;
  player.bullets = [];
  enemy.bullets = [];
  player.x = 50;
  player.y = canvas.height - 100;
  enemy.x = canvas.width - 100;
  enemy.y = canvas.height - 100;
  enemy.speed = 2; // Reset enemy speed

  updateScore();
  timeDisplay.textContent = `Time: 0`;

  startButton.style.display = "none";
  canvas.style.display = "block";
  gameOverFlag = false;

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  gameInterval = setInterval(() => {
    enemyShoot();
    updateTime();
  }, 1000);

  enemyMoveInterval = setInterval(randomizeEnemyDirection, 500);

  update();
}

function gameOver() {
  clearInterval(gameInterval);
  clearInterval(enemyMoveInterval);
  alert(`Game Over! Your score: ${player.score}, Time: ${timeElapsed}`);
  startButton.style.display = "block";
  canvas.style.display = "none";
}

// Event listener for starting the game
startButton.addEventListener("click", startGame);
