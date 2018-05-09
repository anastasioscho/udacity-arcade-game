var nextEnemyRow = 1;
var handlingCollision = false;
var handlingFinishingEvent = false;
var isGamePaused = true;
var score = 0;

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function updateScore(newPoints, addition = true) {
    if (addition) score = score + newPoints < 0 ? 0 : score + newPoints;
    else score = newPoints;

    const scoreElement = document.querySelector('#score-element');
    scoreElement.textContent = `Score:${score}`;
}

function showHearts() {
    const firstHeartElement = document.querySelector('#first-heart');
    const secondHeartElement = document.querySelector('#second-heart');
    const thirdHeartElement = document.querySelector('#third-heart');

    if (player.hearts === 3) {
        firstHeartElement.style.display = 'list-item';
        secondHeartElement.style.display = 'list-item';
        thirdHeartElement.style.display = 'list-item';
    } else if (player.hearts === 2) thirdHeartElement.style.display = 'none';
    else if (player.hearts === 1) secondHeartElement.style.display = 'none';
    else if (player.hearts === 0) firstHeartElement.style.display = 'none';
}

function avatarClicked(evt) {
    player.sprite = evt.target.dataset.sprite;
    toggleAvatarSelectionModal();
    isGamePaused = false;
}

function restartGame() {
    toggleAvatarSelectionModal();
    nextEnemyRow = 1;
    handlingCollision = false;
    handlingFinishingEvent = false;
    updateScore(0, false);

    player.reset();
    showHearts();

    for (let enemy of allEnemies) enemy.resetPositionAndSpeed();
    while (allEnemies.length > 3) allEnemies.pop();

    powerUp.reset();
}

function toggleGameOverModal() {
    const modal = document.querySelector('#game-over-modal');
    modal.classList.toggle('show-modal');
}

function toggleAvatarSelectionModal() {
    const modal = document.querySelector('#avatar-selection-modal');
    modal.classList.toggle('show-modal');
}

class Enemy {
    constructor() {
        this.resetPositionAndSpeed();

        const spriteColor = generateRandomNumber(0, 2);
        
        if (spriteColor === 0) this.sprite = 'images/enemy-bug.png';
        else if (spriteColor === 1) this.sprite = 'images/enemy-bug-green.png';
        else this.sprite = 'images/enemy-bug-purple.png';
    }

    resetPositionAndSpeed() {
        const possibleSpeeds = [100, 150, 200, 250, 300, 350, 400];
        this.speed = possibleSpeeds[generateRandomNumber(0, possibleSpeeds.length - 1)];
        this.x = -(generateRandomNumber(1, 3) * 101);
        this.y = (nextEnemyRow * 83) - 30;

        nextEnemyRow = nextEnemyRow === 3 ? nextEnemyRow = 1 : nextEnemyRow += 1;
    }

    isColliding() {
        return (!(this.x + 101 - 30 < player.x || this.x + 30 > player.x + 101) && this.y === player.y);
    }

    update(dt) {
        if (!handlingCollision && !isGamePaused) {
            this.x += this.speed * dt;
            if (this.x >= 505) this.resetPositionAndSpeed();

            if (this.isColliding()) {
                handlingCollision = true;
                setTimeout(() => {
                    handlingCollision = false;
                    player.looseHeart();
                    player.resetPosition();
                }, 800);
            }
        }
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class Player {
    constructor() {
        this.reset();
        this.sprite = 'images/char-boy.png';
    }

    reset() {
        this.resetPosition();
        this.wins = 0;
        this.hearts = 3;
    }

    resetPosition() {
        this.x = 2 * 101;
        this.y = (5 * 83) - 30;
    }

    looseHeart() {
        this.hearts -= 1;
        showHearts();

        if (this.hearts === 0) {
            isGamePaused = true;
            const scoreElement = document.querySelector('#score');
            scoreElement.textContent = `You got ${score} points though. Well done!`;
            toggleGameOverModal();
        }
    }

    increaseWins() {
        this.wins += 1;
        if (this.wins % 3 === 0 && allEnemies.length < 6) {
            allEnemies.push(new Enemy);
        }
    }

    handleInput(direction) {
        if (!handlingCollision && !handlingFinishingEvent && !isGamePaused) {
            if (direction === 'left' && this.x > 0) {
                this.x -= 101;
            } else if (direction === 'right' && this.x < 4 * 101) {
                this.x += 101;
            } else if (direction === 'up' && this.y > 0) {
                this.y -= 83;
                updateScore(10);
                if (this.row === 0) {
                    updateScore(50);
                    this.increaseWins();
                    handlingFinishingEvent = true;
                    setTimeout(() => {
                        handlingFinishingEvent = false;
                        player.resetPosition();
                    }, 400);
                }
            } else if (direction === 'down' && this.y < ((5 * 83) - 30)) {
                this.y += 83;
                updateScore(-10);
            }

            if (this.row === powerUp.row && this.col === powerUp.col) powerUp.pickUp();
        }
    }

    get row() {
        return (this.y + 30) / 83;
    }

    get col() {
        return this.x / 101;
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class PowerUp {
    constructor() {
        this.reset();
    }

    reset() {
        const possiblePoints = [10, 20, 30];
        this.points = possiblePoints[generateRandomNumber(0, possiblePoints.length - 1)];

        if (this.points === possiblePoints[0]) this.sprite = 'images/blue-gem.png';
        else if (this.points === possiblePoints[1]) this.sprite = 'images/green-gem.png';
        else this.sprite = 'images/orange-gem.png';

        const row = generateRandomNumber(1, 3);
        const col = generateRandomNumber(0, 4);

        this.x = (col * 101) + 25;
        this.y = (row * 83) + 35;
    }

    pickUp() {
        this.x = -500;
        updateScore(this.points);
        setTimeout(() => {
            if (!isGamePaused) this.reset();
        }, 2000);
    }

    get row() {
        return (this.y - 35) / 83;
    }

    get col() {
        return (this.x - 25) / 101;
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

const powerUp = new PowerUp;
const player = new Player;
const allEnemies = [new Enemy, new Enemy, new Enemy];

document.addEventListener('DOMContentLoaded', function () {
    restartGame();

    const avatars = document.querySelector('.avatars');
    avatars.addEventListener('click', avatarClicked);
});

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
