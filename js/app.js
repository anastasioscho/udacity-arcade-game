const powerUpsPoints = [10, 20, 30];

var nextEnemyRow = 1;
var handlingCollision = false;
var handlingFinishingEvent = false;
var isGameOver = false;
var score = 0;

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateRandomSpeed() {
    const speeds = [100, 150, 200, 250, 300, 350, 400];
    return speeds[generateRandomNumber(0, speeds.length - 1)];
}

function generateRandomPowerUpPoints() {
    return powerUpsPoints[generateRandomNumber(0, powerUpsPoints.length - 1)];
}

function updateScore(newPoints) {
    score = score + newPoints < 0 ? 0 : score + newPoints;
    showScore();
}

function toggleModal() {
    const modal = document.querySelector(".modal");
    modal.classList.toggle("show-modal");
}

function showHearts() {
    const firstHeartElement = document.querySelector("#first-heart");
    const secondHeartElement = document.querySelector("#second-heart");
    const thirdHeartElement = document.querySelector("#third-heart");

    if (player.hearts === 3) {
        firstHeartElement.style.display = "list-item";
        secondHeartElement.style.display = "list-item";
        thirdHeartElement.style.display = "list-item";
    } else if (player.hearts === 2) thirdHeartElement.style.display = "none";
    else if (player.hearts === 1) secondHeartElement.style.display = "none";
    else if (player.hearts === 0) firstHeartElement.style.display = "none";
}

function showScore() {
    const scoreElement = document.querySelector("#score-element");
    scoreElement.textContent = `${score} points`;
}

function restartGame() {
    nextEnemyRow = 1;
    handlingCollision = false;
    handlingFinishingEvent = false;
    score = 0;
    showScore();

    player.reset();
    showHearts(true);

    for (let enemy of allEnemies) {
        enemy.resetPositionAndSpeed();
    }

    while (allEnemies.length > 3) {
        allEnemies.pop();
    }

    powerUp.reset();

    isGameOver = false;
}

// Enemies our player must avoid
class Enemy {
    constructor() {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.resetPositionAndSpeed();
        this.sprite = 'images/enemy-bug.png';
    }

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        if (!handlingCollision && !isGameOver) {
            this.x += this.speed * dt;
            if (this.x >= 505) this.resetPositionAndSpeed();

            if (this.isColliding()) {
                handlingCollision = true;
                setTimeout(function() {
                    handlingCollision = false;
                    player.looseHeart();
                    player.resetPosition();
                }, 800);
            }
        }
    }

    resetPositionAndSpeed() {
        this.speed = generateRandomSpeed();
        this.x = -(generateRandomNumber(1, 3) * 101);
        this.y = (nextEnemyRow * 83) - 30;

        nextEnemyRow = nextEnemyRow === 3 ? nextEnemyRow = 1 : nextEnemyRow += 1;
    }

    // Draw the enemy on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    isColliding() {
        return (!(this.x + 101 - 30 < player.x || this.x + 30 > player.x + 101) && this.y === player.y);
    }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

class Player {
    constructor() {
        this.reset();
        this.sprite = 'images/char-boy.png';
    }

    update() {
        // TODO: Implement it
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    handleInput(direction) {
        if (!handlingCollision && !handlingFinishingEvent && !isGameOver) {
            if (direction === 'left' && this.x > 0) {
                this.x -= 101;
            } else if (direction === 'right' && this.x < 4 * 101) {
                this.x += 101;
            } else if (direction === 'up' && this.y > 0) {
                updateScore(10);
                this.y -= 83;
                if (this.row === 0) {
                    updateScore(50);
                    this.increaseWins();
                    handlingFinishingEvent = true;
                    setTimeout(function() {
                        handlingFinishingEvent = false;
                        player.resetPosition();
                    }, 400);
                }
            } else if (direction === 'down' && this.y < 5 * 83 - 30) {
                updateScore(-10);
                this.y += 83;
            }

            if (this.row === powerUp.row && this.col === powerUp.col) {
                updateScore(powerUp.points);
                powerUp.hide();
                setTimeout(() => {
                    if (!isGameOver) powerUp.reset();
                }, 2000);
            }
        }
    }

    looseHeart() {
        this.hearts -= 1;
        showHearts();

        if (this.hearts === 0) {
            isGameOver = true;
            const scoreElement = document.querySelector("#score");
            scoreElement.textContent = `You got ${score} points though. Well done!`;
            toggleModal();
        }
    }

    increaseWins() {
        this.wins += 1;
        if (this.wins % 3 === 0 && allEnemies.length < 7) {
            allEnemies.push(new Enemy);
        }
    }

    reset() {
        this.resetPosition();
        this.wins = 0;
        this.hearts = 3;
    }

    resetPosition() {
        this.x = 2 * 101;
        this.y = (5 * 83 - 30);
    }

    get row() {
        return (this.y + 30) / 83;
    }

    get col() {
        return this.x / 101;
    }
}

class PowerUp {
    constructor() {
        this.reset();
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    reset() {
        this.points = generateRandomPowerUpPoints();

        if (this.points === powerUpsPoints[0]) this.sprite = 'images/blue-gem.png';
        else if (this.points === powerUpsPoints[1]) this.sprite = 'images/green-gem.png';
        else this.sprite = 'images/orange-gem.png';

        const row = generateRandomNumber(1, 3);
        const col = generateRandomNumber(0, 4);

        this.x = (col * 101) + 25;
        this.y = (row * 83) + 35;
    }

    get row() {
        return (this.y - 35) / 83;
    }

    get col() {
        return (this.x - 25) / 101;
    }

    hide() {
        this.x = -500
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

const powerUp = new PowerUp;
const player = new Player;
const allEnemies = [new Enemy, new Enemy, new Enemy];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
