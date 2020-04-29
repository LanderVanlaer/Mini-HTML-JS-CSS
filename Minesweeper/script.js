const
    drawField = () => {
        for (let i = 1; i < config.width; i++) {
            line(i * config.cellwidth, 0, i * config.cellwidth, canvas.height)
        }
        for (let i = 1; i < config.height; i++) {
            line(0, i * config.cellwidth, canvas.width, i * config.cellwidth)
        }
    },
    line = (x1, y1, x2, y2) => {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = '1';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    },
    makefield = () => {
        grid = [];
        minesGrid = [];
        for (let i = 0; i < totalMines; i++) {
            let found = false;
            while (!found) {
                const x = Math.floor(Math.random() * config.width);
                const y = Math.floor(Math.random() * config.height);
                if (!minesGrid.some(r => r[0] == x && r[1] == y)) {
                    minesGrid.push([x, y]);
                    found = true;
                }
            }
        }
        for (let y = 0; y < config.height; y++) {
            grid.push([])
            for (let x = 0; x < config.width; x++) {
                grid[y].push({
                    checked: false,
                    flag: false,
                    data: minesGrid.some(r => r[0] == x && r[1] == y) ? -1 : ""
                })
            }
        }
    },
    setNumbersOnField = () => {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x].data !== -1) {
                    let totalMinesNextToCell = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (!(i === 0 && j === 0)) {
                                const newY = y + i;
                                const newX = x + j;
                                if ((newY >= 0 && newY < grid.length) &&
                                    (newX >= 0 && newX < grid[y].length)) {
                                    if (grid[newY][newX].data === -1) totalMinesNextToCell++;
                                }
                            }
                        }
                    }
                    grid[y][x].data = totalMinesNextToCell;
                }
            }
        }
    },
    checkfield = (x, y) => {
        if (grid[y][x].data === 0) {
            if (!alreadyChecked.some(e => e.x === x && e.y === y)) {

                alreadyChecked.push({ x, y });

                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (!(i === 0 && j === 0)) {
                            const newY = y + i;
                            const newX = x + j;

                            if ((newY >= 0 && newY < grid.length) &&
                                (newX >= 0 && newX < grid[y].length)) {

                                if (grid[newY][newX].data === 0) {
                                    grid[newY][newX].checked = true;
                                    checkfield(newX, newY);
                                } else if (grid[newY][newX].data > 0) {
                                    alreadyChecked.push({
                                        x: newX,
                                        y: newY
                                    });
                                    grid[newY][newX].checked = true;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            alreadyChecked.push({ x, y });
            grid[y][x].checked = true;
        }
    },
    hitBomb = () => {
        gameOver = true;
        alert('BOOM');
        grid.forEach((line, y) => {
            line.forEach((cell, x) => {
                cell.checked = true;
                cell.flag = false;
            })
        })
        draw();
    },
    won = () => {
        if (gameOver) return;
        let won = 0;
        grid.forEach(line => {
            line.forEach(cell => {
                if (cell.data === -1) return;
                else if (!cell.checked) return won++;
            })
        })
        if (won === 0) alert('Congratulations! You have won!');
    },
    drawBomb = (x, y) => {
        ctx.drawImage(document.getElementById('bomb'),
            x * config.cellwidth + config.bombPadding,
            y * config.cellwidth + config.bombPadding,
            config.cellwidth - (config.bombPadding * 2),
            config.cellwidth - (config.bombPadding * 2));
    },
    drawEmptyCell = (x, y) => {
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x * config.cellwidth, y * config.cellwidth, config.cellwidth, config.cellwidth);
    },
    drawTextInCell = (x, y) => {
        const fontSize = config.cellwidth * .75;
        const halfCell = config.cellwidth / 2;
        ctx.font = fontSize + "px Arial";
        ctx.fillStyle = "blue";
        ctx.textAlign = "center";
        ctx.fillText(grid[y][x].data,
            (x * config.cellwidth) + halfCell,
            (y * config.cellwidth) + halfCell + fontSize * .40);
    },
    drawFlag = (x, y) => {
        ctx.drawImage(document.getElementById('flag'),
            x * config.cellwidth + config.flagPadding,
            y * config.cellwidth + config.flagPadding,
            config.cellwidth - (config.flagPadding * 2),
            config.cellwidth - (config.flagPadding * 2));
    },
    draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        grid.forEach((line, y) => {
            line.forEach((cell, x) => {
                if (cell.checked) {
                    drawEmptyCell(x, y);
                    if (cell.data === -1) {
                        drawBomb(x, y);
                    } else if (cell.data === 0) {} else {
                        drawTextInCell(x, y);
                    }
                } else if (cell.flag) {
                    drawFlag(x, y);
                }
            })
        });
        drawField();
    }

window.onload = () => {
    canvas.addEventListener('click', async e => {
        if (gameOver) return;
        const
            cursorX = e.layerX,
            cursorY = e.layerY,
            x = Math.floor(cursorX / config.cellwidth),
            y = Math.floor(cursorY / config.cellwidth);

        if (!grid[y][x].flag) {
            grid[y][x].checked = true;
            if (grid[y][x].data === 0) {
                alreadyChecked = [];
                checkfield(x, y);
            }
            if (grid[y][x].data === -1) {
                hitBomb();
            }
        }
        draw();
        won();
    })
    //contextmenu = right-click
    canvas.addEventListener('contextmenu', e => {
        if (gameOver) return;
        e.preventDefault();
        const cursorX = e.layerX;
        const cursorY = e.layerY;
        const x = Math.floor(cursorX / config.cellwidth);
        const y = Math.floor(cursorY / config.cellwidth);
        grid[y][x].flag = !grid[y][x].flag;
        draw();
    })

    makefield();
    setNumbersOnField();
    draw();
}

const
    config = {
        width: 10,
        height: 5,
        cellwidth: 50,
        bombPadding: 5,
        flagPadding: 5
    },
    totalMines = Math.round(config.width * config.height * 0.13),
    canvas = document.getElementById("can"),
    ctx = canvas.getContext('2d');
canvas.width = config.width * config.cellwidth;
canvas.height = config.height * config.cellwidth;

let
    grid = [],
    minesGrid = [],
    alreadyChecked = [],
    gameOver = false;

//HIHI FUNNNNN
console.error(`${i} Uncaught ReferenceError: Your Brain is undefined`);