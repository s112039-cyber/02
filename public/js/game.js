const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let currentLevelIndex = 0;
let enemiesRemaining = 0;
let gameState = 'playing'; // playing, gameOver, win

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: '#967969', // Cat color
    speed: 5,
    health: 100,
    maxHealth: 100
};

const enemies = [];
const bullets = [];
const powerUps = [];

const levels = [
    { name: "Level 1", enemyCount: 3, enemySpeed: 1.2 },
    { name: "Level 2", enemyCount: 5, enemySpeed: 1.5 },
    { name: "Level 3", enemyCount: 8, enemySpeed: 1.8 },
    { name: "Boss Fight!", enemyCount: 1, enemySpeed: 1, boss: true, hp: 10 }
];

let restartButton = {
    x: canvas.width / 2 - 100,
    y: canvas.height / 2 + 50,
    width: 200,
    height: 50
};

function resetGame() {
    score = 0;
    currentLevelIndex = 0;
    player.health = player.maxHealth;
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height / 2 - 25;
    gameState = 'playing';
    startLevel();
}

function startLevel() {
    const level = levels[currentLevelIndex];
    enemiesRemaining = level.enemyCount;
    enemies.length = 0;
    bullets.length = 0;
    powerUps.length = 0;

    for (let i = 0; i < level.enemyCount; i++) {
        spawnEnemy(level);
    }
}

function spawnEnemy(level) {
    const isBoss = level.boss;
    const size = isBoss ? 80 : Math.random() * 20 + 20;
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - size : canvas.width + size;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - size : canvas.height + size;
    }
    const speed = level.enemySpeed;
    const color = isBoss ? '#404040' : '#808080';
    const hp = isBoss ? level.hp : 1;
    enemies.push({ x, y, width: size, height: size, color: color, speed: speed, isBoss: isBoss, hp: hp });
}

const keys = { w: false, a: false, s: false, d: false };
const mouse = { x: 0, y: 0 };
let canShoot = true;

window.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
    if (e.key === ' ' && canShoot) {
        shoot();
        canShoot = false;
        setTimeout(() => { canShoot = true; }, 200);
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

canvas.addEventListener('click', (event) => {
    if (gameState === 'gameOver' || gameState === 'win') {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        if (clickX > restartButton.x && clickX < restartButton.x + restartButton.width &&
            clickY > restartButton.y && clickY < restartButton.y + restartButton.height) {
            resetGame();
        }
    }
});

function shoot() {
    const dx = mouse.x - (player.x + player.width / 2);
    const dy = mouse.y - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocityX = (dx / distance) * 7;
    const velocityY = (dy / distance) * 7;
    bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y + player.height / 2 - 2.5, width: 5, height: 5, color: 'yellow', velocityX, velocityY });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

function drawUI() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'start';
    ctx.fillText('Score: ' + score, 20, 40);
    
    ctx.textAlign = 'center';
    ctx.fillText(levels[currentLevelIndex].name, canvas.width / 2, 40);
    ctx.textAlign = 'start';

    const healthBarWidth = 200;
    const healthBarHeight = 20;
    ctx.fillStyle = '#555';
    ctx.fillRect(20, 60, healthBarWidth, healthBarHeight);
    const currentHealthWidth = (player.health / player.maxHealth) * healthBarWidth;
    ctx.fillStyle = 'lime';
    ctx.fillRect(20, 60, currentHealthWidth > 0 ? currentHealthWidth : 0, healthBarHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(20, 60, healthBarWidth, healthBarHeight);
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#7c6151';
    const earRadius = player.width * 0.2;
    ctx.beginPath();
    ctx.arc(player.x + player.width * 0.25, player.y, earRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + player.width * 0.75, player.y, earRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = enemy.isBoss ? '#202020' : '#606060';
    const earRadius = enemy.width * 0.25;
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width * 0.25, enemy.y, earRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width * 0.75, enemy.y, earRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawEndScreen() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    if (gameState === 'win') {
        ctx.font = '50px Arial';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2);
        restartButton.y = canvas.height / 2 + 50;
    } else { // 'gameOver'
        ctx.font = '60px Arial';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 60);
        ctx.font = '30px Arial';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2);
        restartButton.y = canvas.height / 2 + 50;
    }

    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Restart', canvas.width / 2, restartButton.y + 35);
    ctx.textAlign = 'start';
}

function update() {
    if (gameState !== 'playing') {
        drawEndScreen();
        requestAnimationFrame(update);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        if (checkCollision(p, player)) {
            if (p.type === 'heal') {
                player.health = Math.min(player.maxHealth, player.health + 30);
            }
            powerUps.splice(i, 1);
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;

        if (checkCollision(enemy, player)) {
            player.health -= 20;
            enemies.splice(i, 1);
            enemiesRemaining--;
            if (player.health <= 0) {
                gameState = 'gameOver';
            }
            continue;
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[j], enemy)) {
                bullets.splice(j, 1);
                enemy.hp--;

                if (enemy.hp <= 0) {
                    if (enemy.isBoss) {
                        score += 100;
                        gameState = 'win';
                        requestAnimationFrame(update); // Keep the loop going for the end screen
                        return; // Exit playing state logic
                    }
                    
                    const enemyX = enemy.x;
                    const enemyY = enemy.y;
                    enemies.splice(i, 1);
                    score += 10;
                    enemiesRemaining--;

                    if (Math.random() < 0.1) {
                        powerUps.push({ x: enemyX, y: enemyY, width: 15, height: 15, color: 'lime', type: 'heal' });
                    }
                }
                break;
            }
        }
        if (enemies[i]) {
            drawEnemy(enemies[i]);
        }
    }

    if (enemiesRemaining <= 0 && gameState === 'playing') {
        currentLevelIndex++;
        if (currentLevelIndex < levels.length) {
            startLevel();
        } else {
            // This case should not be reached if boss logic is correct
            gameState = 'win';
        }
    }

    drawPlayer();
    drawUI();
    
    requestAnimationFrame(update);
}

startLevel();
update();