
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let score = 0;

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: 'blue',
    speed: 5,
    health: 100,
    maxHealth: 100
};

const enemies = [];
const bullets = [];
const powerUps = [];

function spawnEnemy() {
    const size = Math.random() * 20 + 20;
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - size : canvas.width + size;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - size : canvas.height + size;
    }
    const speed = 1.5 + (score / 500);
    enemies.push({ x, y, width: size, height: size, color: 'red', speed: speed });
}

const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const dx = mouseX - (player.x + player.width / 2);
    const dy = mouseY - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocityX = (dx / distance) * 7;
    const velocityY = (dy / distance) * 7;
    bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y + player.height / 2 - 2.5, width: 5, height: 5, color: 'yellow', velocityX, velocityY });
});

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 20, 40);
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    ctx.fillStyle = '#555';
    ctx.fillRect(20, 60, healthBarWidth, healthBarHeight);
    const currentHealthWidth = (player.health / player.maxHealth) * healthBarWidth;
    ctx.fillStyle = 'lime';
    ctx.fillRect(20, 60, currentHealthWidth > 0 ? currentHealthWidth : 0, healthBarHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(20, 60, healthBarWidth, healthBarHeight);
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function update() {
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
            if (player.health <= 0) {
                alert('Game Over! Final Score: ' + score);
                location.reload();
                return;
            }
            continue;
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[j], enemy)) {
                const enemyX = enemy.x;
                const enemyY = enemy.y;
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                if (Math.random() < 0.1) { // 10% chance to drop a power-up
                    powerUps.push({ x: enemyX, y: enemyY, width: 15, height: 15, color: 'lime', type: 'heal' });
                }
                break;
            }
        }
        if (enemies[i]) { // Check if enemy still exists
            ctx.fillStyle = enemies[i].color;
            ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
        }
    }

    drawPlayer();
    drawUI();
    requestAnimationFrame(update);
}

function spawnLoop() {
    spawnEnemy();
    const spawnInterval = Math.max(100, 1000 - score);
    setTimeout(spawnLoop, spawnInterval);
}

spawnLoop();
update();
