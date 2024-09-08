const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

// Načtení obrázků
const balrogImage = new Image();
balrogImage.src = 'images/balrog.png';

const goblinImage = new Image();
goblinImage.src = 'images/goblin.png';

const trollImage = new Image();
trollImage.src = 'images/troll.png';

const backgroundImage = new Image();
backgroundImage.src = 'images/background.png';

const gandalfImage = new Image();
gandalfImage.src = 'images/gandalf.png';

const boomImage = new Image();
boomImage.src = 'images/boom.png'; // Cesta k obrázku "boom"

// Inicializace postav a proměnných
let balrog = {
    x: 50,
    y: canvas.height / 2 - 50,
    width: 300,
    height: 300,
    speed: 5
};

let gandalf = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 150,
    height: 150,
    speed: 2,
    isActive: false,
    hitCount: 0
};

let keys = {};
let score = 0;
let enemies = [];
let boomVisible = false;
let boomTimer = 0;
let boomPosition = { x: 0, y: 0 };

// Eventy pro klávesnici
document.addEventListener('keydown', function(e) {
    keys[e.code] = true;
});

document.addEventListener('keyup', function(e) {
    keys[e.code] = false;
});

function update() {
    // Pohyb Balroga
    if (keys['ArrowUp'] && balrog.y > 0) {
        balrog.y -= balrog.speed;
    }
    if (keys['ArrowDown'] && balrog.y + balrog.height < canvas.height) {
        balrog.y += balrog.speed;
    }
    if (keys['ArrowLeft'] && balrog.x > 0) {
        balrog.x -= balrog.speed;
    }
    if (keys['ArrowRight'] && balrog.x + balrog.width < canvas.width) {
        balrog.x += balrog.speed;
    }

    // Aktivace Gandalfa
    if (score >= 100 && !gandalf.isActive) {
        gandalf.isActive = true;
        gandalf.x = canvas.width / 2 - gandalf.width / 2;
        gandalf.y = canvas.height / 2 - gandalf.height / 2;
    }

    updateGandalf();
}

function updateGandalf() {
    if (gandalf.isActive) {
        // Pohyb Gandalfa směrem od Balroga
        if (balrog.x > gandalf.x) {
            gandalf.x -= gandalf.speed; // Utíkej vlevo
        } else if (balrog.x < gandalf.x) {
            gandalf.x += gandalf.speed; // Utíkej vpravo
        }

        if (balrog.y > gandalf.y) {
            gandalf.y -= gandalf.speed; // Utíkej nahoru
        } else if (balrog.y < gandalf.y) {
            gandalf.y += gandalf.speed; // Utíkej dolů
        }

        // Zajistit, že Gandalf zůstane na herním poli
        gandalf.x = Math.max(0, Math.min(canvas.width - gandalf.width, gandalf.x));
        gandalf.y = Math.max(0, Math.min(canvas.height - gandalf.height, gandalf.y));

        // Pokud Gandalf narazí na Balroga
        if (balrog.x < gandalf.x + gandalf.width &&
            balrog.x + balrog.width > gandalf.x &&
            balrog.y < gandalf.y + gandalf.height &&
            balrog.y + balrog.height > gandalf.y) {

            gandalf.hitCount++;
            if (gandalf.hitCount === 3) {
                alert("Gratulujeme, vyhrál jste hru a zmastil jste Gandalfa jako pravý Balrog! Pokud se Vám hra líbila, poděkujte osobně vývojáři Patriku Honovi, který tvorbou této hry strávil 4 hodiny z nedělního odpoledne :D LOTRUM ZDAR");
                return;
            }

            // Zobrazit boom
            boomVisible = true;
            boomTimer = 60; // 1 vteřina = 60 snímků při 60 FPS

            // Nastavit pozici boomu mezi Gandalfem a Balrogem
            boomPosition.x = (balrog.x + gandalf.x + balrog.width + gandalf.width) / 2 - boomImage.width / 2;
            boomPosition.y = (balrog.y + gandalf.y + balrog.height + gandalf.height) / 2 - boomImage.height / 2;

            // Umístění Gandalfa do náhodného rohu
            const corners = [
                { x: 0, y: 0 },
                { x: canvas.width - gandalf.width, y: 0 },
                { x: 0, y: canvas.height - gandalf.height },
                { x: canvas.width - gandalf.width, y: canvas.height - gandalf.height }
            ];
            const randomCorner = corners[Math.floor(Math.random() * corners.length)];
            gandalf.x = randomCorner.x;
            gandalf.y = randomCorner.y;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(balrogImage, balrog.x, balrog.y, balrog.width, balrog.height);
    drawEnemies();
    drawScore();
    drawGandalf();

    // Zobrazit boom, pokud je aktivní
    if (boomVisible) {
        ctx.drawImage(boomImage, boomPosition.x, boomPosition.y);
    }
}

function drawGandalf() {
    if (gandalf.isActive) {
        ctx.drawImage(gandalfImage, gandalf.x, gandalf.y, gandalf.width, gandalf.height);
    }
}

function drawScore() {
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 30);
}

function createEnemies() {
    let numberOfEnemies = Math.random() < 0.5 ? 2 : 3;

    for (let i = 0; i < numberOfEnemies; i++) {
        let isTroll = Math.random() < 0.2;
        let enemy = {
            x: canvas.width + i * 110,
            y: Math.random() * (canvas.height - 50),
            width: isTroll ? 150 : 100,
            height: isTroll ? 150 : 100,
            speed: isTroll ? 1.5 : 2 + Math.random() * 3,
            type: isTroll ? 'troll' : 'goblin'
        };
        enemies.push(enemy);
    }
}

function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].x -= enemies[i].speed;

        if (enemies[i].x + enemies[i].width < 0) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        if (enemy.type === 'troll') {
            ctx.drawImage(trollImage, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            ctx.drawImage(goblinImage, enemy.x, enemy.y, enemy.width, enemy.height);
        }
    }
}

function detectCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];

        if (balrog.x < enemy.x + enemy.width &&
            balrog.x + balrog.width > enemy.x &&
            balrog.y < enemy.y + enemy.height &&
            balrog.y + balrog.height > enemy.y) {
            if (enemy.type === 'troll') {
                score += 10;
            } else {
                score += 1;
            }

            enemies.splice(i, 1);
        }
    }
}

// Vytvářej skřety každé 2 sekundy
setInterval(createEnemies, 2000);

function gameLoop() {
    update();
    updateEnemies();
    detectCollisions();
    updateGandalf(); // Aktualizace Gandalfa
    draw();

    // Snížení timeru pro boom a jeho skrytí
    if (boomVisible) {
        boomTimer--;
        if (boomTimer <= 0) {
            boomVisible = false;
        }
    }

    requestAnimationFrame(gameLoop);
}

backgroundImage.onload = function() {
    gameLoop();
}
