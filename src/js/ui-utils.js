function updateUIGrid(source, gridElement = null) {
    const inputs = document.querySelectorAll('td input');
    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const value = source.grid ? source.grid[row][col] : source[row][col];
        input.value = value || '';
        input.disabled = value !== 0;
    });
}

function updateDots(dots) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.querySelector(`tr:nth-child(${i + 1}) td:nth-child(${j + 1})`);
            const dot = cell.querySelector('.dot.horizontal');
            updateDotClass(dot, dots.horizontal[i][j]);
        }
    }

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.querySelector(`tr:nth-child(${i + 1}) td:nth-child(${j + 1})`);
            const dot = cell.querySelector('.dot.vertical');
            updateDotClass(dot, dots.vertical[i][j]);
        }
    }
}

function updateDotClass(dot, type) {
    dot.classList.remove('black-dot', 'white-dot');
    if (type === 'black') {
        dot.classList.add('black-dot');
    } else if (type === 'white') {
        dot.classList.add('white-dot');
    }
}

function clearDots() {
    document.querySelectorAll('.dot').forEach(dot => {
        dot.classList.remove('black-dot', 'white-dot');
    });
}

function getDotType(dot) {
    return dot.classList.contains('black-dot') ? 'black' :
           dot.classList.contains('white-dot') ? 'white' : 'none';
}

function getCurrentGridValues() {
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    const inputs = document.querySelectorAll('td input');
    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        grid[row][col] = parseInt(input.value) || 0;
    });
    return grid;
}

function checkSolution(current, solution) {
    return current.every((row, i) =>
        row.every((val, j) => val === solution[i][j])
    );
}

function updateSolverGrid(solver, grid) {
    const size = solver.size;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const input = grid.rows[r].cells[c].querySelector('input');
            solver.grid[r][c] = input.value ? parseInt(input.value) : 0;

            if (c < size - 1) {
                const hDot = grid.rows[r].cells[c].querySelector('.dot.horizontal');
                solver.horizontalDots[r][c] = getDotType(hDot);
            }

            if (r < size - 1) {
                const vDot = grid.rows[r].cells[c].querySelector('.dot.vertical');
                solver.verticalDots[r][c] = getDotType(vDot);
            }
        }
    }
}

window.updateUIGrid = updateUIGrid;
window.updateDots = updateDots;
window.updateDotClass = updateDotClass;
window.clearDots = clearDots;
window.getDotType = getDotType;
window.getCurrentGridValues = getCurrentGridValues;
window.checkSolution = checkSolution;
window.updateSolverGrid = updateSolverGrid;
