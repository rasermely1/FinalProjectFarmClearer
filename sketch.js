const numberOfTrees = 200;
const treesMovement = 8;
const bulletMovement = 8;
const scoreIncrement = 100;
const assetsFolder = "./assets";
const soundsFolder = `${assetsFolder}/sounds`;
const imagesFolder = `${assetsFolder}/images`;
const fontsFolder = `${assetsFolder}/fonts`;

let globalDifficulty = "EASY";
let rocksToAdd = 1;
let numberOfInitialrocks = 2;
let initialLives = 5;
let scoreMultiplier = 1;
let gameOver = false;
let gameOverSfxPlayed = false;
let bulletsLimit = 5;
let serial;
let latestData = "waiting for data";


let heartImage, gameOverImage;
let shootEffect, explodeEffect, gameOverEffect;
let psFont;

let gui, easyButton, mediumButton, hardButton, buttons;

let tractor, trees, rocks;

function preload() {
  heartImage = loadImage(`${imagesFolder}/heart.png`);
  gameOverImage = loadImage(`${imagesFolder}/game_over.png`);
  shootEffect = loadSound(`${soundsFolder}/shoot_sound.mp3`);
  explodeEffect = loadSound(`${soundsFolder}/explosion_sound.mp3`);
  gameOverEffect = loadSound(`${soundsFolder}/game_over_sound.mp3`);
  psFont = loadFont(`${fontsFolder}/PressStart2P-Regular.ttf`);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  gui = createGui();
  easyButton = createButton("Restart Game [Easy]", (width / 2) - 375, (height / 2) + 100, 230, 40);
  easyButton.visible = false;
  easyButton.setStyle({
    strokeBg: color(255),
    fillBg: color(95, 220, 227),
    fillLabel: color(255),
    fillBgHover: color(140, 232, 237),
    fillLabelHover: color(255),
    strokeBgHover: color(255),
    rounding: 10,
    textSize: 16,
    textFont: 'Verdana'
  });

  mediumButton = createButton("Restart Game [Medium]", (width / 2) - 125, (height / 2) + 100, 250, 40);
  mediumButton.visible = false;
  mediumButton.setStyle({
    strokeBg: color(255),
    fillBg: color(245, 186, 91),
    fillLabel: color(255),
    fillBgHover: color(250, 201, 122),
    fillLabelHover: color(255),
    strokeBgHover: color(255),
    rounding: 10,
    textSize: 16,
    textFont: 'Verdana'
  });

  hardButton = createButton("Restart Game [Hard]", (width / 2) + 145, (height / 2) + 100, 230, 40);
  hardButton.visible = false;
  hardButton.setStyle({
    strokeBg: color(255),
    fillBg: color(255, 130, 84),
    fillLabel: color(255),
    fillBgHover: color(250, 156, 122),
    fillLabelHover: color(255),
    strokeBgHover: color(255),
    rounding: 10,
    textSize: 16,
    textFont: 'Verdana'
  });

  // serial = new p5.SerialPort();
  // serial.on('data', serialEvent);
  // serial.on('error', serialError);
  // serial.open("/dev/tty.usbmodem1411");

  buttons = [easyButton, mediumButton, hardButton];
  restartGame("EASY");
}

function mousePressed() {
  if (!gameOver) tractor.shoot();
}

function keyPressed() {
  if (!gameOver) {
    if (keyCode === 32) tractor.shoot();
    else if (keyCode === 27) gameOver = true;
  }
  return false;
}

function serialEvent() {
  let data = serial.readLine();  // Read the data from the serial port
  trim(data);  // Trim whitespace
  if (data.length > 0) {
      latestData = data;  // Update the latestData with the current stream
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function draw() {
  // let latest = port.readUntil("\n");
  // if(latest != ""){
  //   button = Number(latest);
  //   if(button == 0){
  //     shoot = true;
  //   }
  // }
  background(144, 238, 144);
  drawGui();
  drawTrees();
  drawrocks();
  drawDifficulty();
  drawBonusText();
  tractor.draw(mouseX);
  if (!tractor.hasAnyHeartsLeft() || gameOver) {
    rocks = [];
    if (!gameOver) gameOver = true;
    image(gameOverImage, (width / 2) - 155, (height / 2) - 150, 310, 170, 0, 0);
    if (!gameOverSfxPlayed) {
      gameOverSfxPlayed = true;
      gameOverEffect.setVolume(0.05);
      gameOverEffect.play();
    }
    buttons.forEach(button => button.visible = true);
    if (easyButton.isPressed) restartGame("EASY");
    else if (mediumButton.isPressed) restartGame("MEDIUM");
    else if (hardButton.isPressed) restartGame("HARD");
  }
}

function adjustParameters(difficulty) {
  globalDifficulty = difficulty;
  if (difficulty === "EASY") {
    rocksToAdd = 2;
    numberOfInitialrocks = 2;
    initialLives = 13;
    scoreMultiplier = 1;
    bulletsLimit = 15;
  } else if (difficulty === "MEDIUM") {
    rocksToAdd = 3;
    numberOfInitialrocks = 3;
    initialLives = 10;
    scoreMultiplier = 1.2;
    bulletsLimit = 13;
  } else if (difficulty === "HARD") {
    rocksToAdd = 4;
    numberOfInitialrocks = 5;
    initialLives = 8;
    scoreMultiplier = 1.5;
    bulletsLimit = 9;
  }
}

function restartGame(difficulty) {
  adjustParameters(difficulty);
  gameOver = false;
  gameOverSfxPlayed = false;
  tractor = new Tractor(parseInt(width / 2), height - 20, bulletMovement, initialLives, bulletsLimit);
  tractor.setShootSoundEffect(shootEffect);
  tractor.setHeartImage(heartImage);
  tractor.setScoreFont(psFont);
  tractor.setAdditionalShots();
  trees = new MovableObjects(0, treesMovement, numberOfTrees);
  buttons.forEach(button => button.visible = false);
  rocks = Array(numberOfInitialrocks)
    .fill(0)
    .map(_ => {
      return new Rock(random(50, width - 50), random(10, 20));
    });
}

function drawTrees() {
  trees.move((x, y) => y > height, true);
  trees.draw((x, y) => {
    translate(x, y);
    fill(139, 69, 19);
    rect(-2, 0, 4, 10);

    fill(34, 139, 34);
    triangle(-6, 0, 6, 0, 0, -10);
  });
}


function drawrocks() {
  if (!gameOver) {
    if (frameCount % 50 === 0) {
      for (let i = 0; i < rocksToAdd; i++) {
        const rock = new Rock(random(50, width - 50), random(10, 20));
        if (random() < 0.15 && !tractor.hasMultShooter()) {
          rock.setIsBonus(true);
        }
        rocks.push(rock);
      }
    }

    for (let i = 0; i < rocks.length; i++) {
      const rock = rocks[i];
      const idxBullet = rock.isHitBy(tractor.getBullets());
      if (!rock.hasExploded() && rock.isOffsetY()) tractor.decrementHearts();
      if (rock.isOffset()) {
        rocks.splice(i, 1);
        continue;
      }

      if (!rock.hasExploded() && idxBullet >= 0) {
        tractor.incrementScore(scoreIncrement * scoreMultiplier);
        rock.explode(explodeEffect);
        tractor.deleteBullet(idxBullet);
        if (rock.isBonus && !tractor.hasMultShooter()) tractor.enableMultShooter();
      }

      rock.move();
      rock.draw();
    }
  }
}

function drawDifficulty() {
  if (!gameOver) {
    push();
    textFont(psFont);
    textSize(12);
    if (globalDifficulty === "EASY") fill(68, 161, 160);
    else if (globalDifficulty === "MEDIUM") fill(238, 184, 104);
    else if (globalDifficulty === "HARD") fill(250, 0, 63);
    text(`Difficulty [${globalDifficulty}]`, 20, 130);
    pop();
  }
}

function drawBonusText() {
  if (tractor.hasMultShooter() && !gameOver) {
    push();
    fill(150, 0, 100);
    textFont(psFont);
    textSize(10);
    text("Bonus [ACTIVE]", 20, 160);
    pop();
  }
}