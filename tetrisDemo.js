const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);
// draw 설정
function draw() {
    context.fillStyle = '#FFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.position);
}

const color = [
    null,
    '#E74C3C',
    '#F5B041',
    '#8E44AD',
    '#2E86C1',
    '#D35400',
    '#A2D9CE',
    '#5D6D7E'
]

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (value !== 0) {
                    context.fillStyle = color[value];
                    context.strokeStyle = '#000';
                    context.lineWidth = 0.05;
                    context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            }
        });
    });
}

// 블록 설정
function createPiece(type){
    if (type === 'T'){
        return [
            [0 ,0 ,0],
            [1 ,1 ,1],
            [0 ,1 ,0],
        ];
    } else if (type ==='O'){
        return [
            [2,2],
            [2,2],
        ];
    }else if (type === 'L'){
        return[
            [0,3,0],
            [0,3,0],
            [0,3,3],
        ];
    }else if (type === 'J'){
        return[
            [0,4,0],
            [0,4,0],
            [4,4,0],
        ];
    }else if (type ==='I'){
        return[
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
        ];
    }else if (type === 'S'){
        return [
            [0,6,6],
            [6,6,0],
            [0,0,0],
        ];
    }else if (type === 'Z'){
        return [
            [7,7,0],
            [0,7,7],
            [0,0,0],
        ];
    }

}

// player 설정
const arena = createMatrix(12, 20);
const player = {
    position: {x: 0, y: 0},
    matrix: null,
    score: 0,
}

// 충돌 시
function collide(arena, player) {
    const [m, o] = [player.matrix, player.position]
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// 블록 배열 생성
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// merge
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.position.y][x + player.position.x] = value;
            }
        });
    });
}

// move, drop, rotate 로직 및 key 조작 설정
function playerMove(dir) {
    player.position.x += dir;
    if (collide(arena, player)) {
        player.position.x -= dir;
    }
}
function playerDrop() {
    player.position.y++;
    if (collide(arena, player)) {
        player.position.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}
function playerRotate(dir) {
    const position = player.position.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.position.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.position.x = position;
            return;
        }
    }
}
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ]
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.position.y = 0;
    player.position.x = (arena[0].length / 2 | 0) - (player.matrix[0] / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
    }
}
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1)
    } else if (event.keyCode === 39) {
        playerMove(1)
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate(1);
    }
});

// play 로직
function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += 100;
    }
}

// 자동 drop, update
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

playerReset();
update();

