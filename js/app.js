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

function updateScore(newPoints) {
    score = score + newPoints < 0 ? 0 : score + newPoints;
    console.log(`Score: ${score}`);
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

function restartGame() {
    nextEnemyRow = 1;
    handlingCollision = false;
    handlingFinishingEvent = false;
    score = 0;

    player.reset();
    showHearts(true);

    for (let enemy of allEnemies) {
        enemy.resetPositionAndSpeed();
    }

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

    reset() {
        this.resetPosition();
        this.hearts = 3;
    }

    resetPosition() {
        this.x = 2 * 101;
        this.y = (5 * 83 - 30);
    }

    get row() {
        return (this.y + 30) / 83;
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

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
