class KropkiSolver {
    constructor(size = 9) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(0));
        this.horizontalDots = Array(size).fill().map(() => Array(size - 1).fill('none'));
        this.verticalDots = Array(size - 1).fill().map(() => Array(size).fill('none'));
        this.boxSize = Math.sqrt(size);
    }

    solve() {
        const emptyCell = this.findEmptyCell();
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                if (this.solve()) return true;
                this.grid[row][col] = 0;
            }
        }
        return false;
    }

    isValid(row, col, num) {
        // Check row
        for (let x = 0; x < this.size; x++) {
            if (x !== col && this.grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < this.size; x++) {
            if (x !== row && this.grid[x][col] === num) return false;
        }

        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (boxRow + i !== row && boxCol + j !== col &&
                    this.grid[boxRow + i][boxCol + j] === num) return false;
            }
        }

        // Check Kropki dots
        // Horizontal dots
        if (col > 0 && this.grid[row][col-1] !== 0) {
            const dot = this.horizontalDots[row][col-1];
            if (!this.checkDotConstraint(this.grid[row][col-1], num, dot)) return false;
        }
        if (col < 8 && this.grid[row][col+1] !== 0) {
            const dot = this.horizontalDots[row][col];
            if (!this.checkDotConstraint(num, this.grid[row][col+1], dot)) return false;
        }

        // Vertical dots
        if (row > 0 && this.grid[row-1][col] !== 0) {
            const dot = this.verticalDots[row-1][col];
            if (!this.checkDotConstraint(this.grid[row-1][col], num, dot)) return false;
        }
        if (row < 8 && this.grid[row+1][col] !== 0) {
            const dot = this.verticalDots[row][col];
            if (!this.checkDotConstraint(num, this.grid[row+1][col], dot)) return false;
        }

        return true;
    }

    checkDotConstraint(num1, num2, dot) {
        if (dot === 'black') {
            return num1 * 2 === num2 || num2 * 2 === num1;
        } else if (dot === 'white') {
            return Math.abs(num1 - num2) === 1;
        }
        return true;
    }

    findEmptyCell() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    validateInitialGrid() {
        // Check each cell in the grid
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const num = this.grid[r][c];
                if (num !== 0) {
                    // Temporarily remove the number to check if it's valid
                    this.grid[r][c] = 0;
                    if (!this.isValid(r, c, num)) {
                        // Restore the number and return false
                        this.grid[r][c] = num;
                        return false;
                    }
                    // Restore the number
                    this.grid[r][c] = num;
                }
            }
        }

        // Also validate dot constraints
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size - 1; c++) {
                const dot = this.horizontalDots[r][c];
                if (dot !== 'none' && this.grid[r][c] !== 0 && this.grid[r][c + 1] !== 0) {
                    if (!this.checkDotConstraint(this.grid[r][c], this.grid[r][c + 1], dot)) {
                        return false;
                    }
                }
            }
        }

        for (let r = 0; r < this.size - 1; r++) {
            for (let c = 0; c < this.size; c++) {
                const dot = this.verticalDots[r][c];
                if (dot !== 'none' && this.grid[r][c] !== 0 && this.grid[r + 1][c] !== 0) {
                    if (!this.checkDotConstraint(this.grid[r][c], this.grid[r + 1][c], dot)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}

// Make it globally available
window.KropkiSolver = KropkiSolver;
