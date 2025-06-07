class SudokuGenerator {
    constructor() {
        if (typeof KropkiSolver === 'undefined') {
            throw new Error('KropkiSolver class must be loaded first');
        }
        this.size = 9;
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
    }

    generate(difficulty, type) {
        try {
            this.grid = Array(9).fill().map(() => Array(9).fill(0));

            if (!this.generateCompleteSolution()) {
                throw new Error('Failed to generate complete solution');
            }

            const cellsToRemove = {
                easy: 35,
                medium: 45,
                hard: 52,
                expert: 58,
                master: 62
            }[difficulty] || 45;

            const solution = this.grid.map(row => [...row]);

            const positions = [];
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    positions.push([i, j]);
                }
            }

            positions.sort(() => Math.random() - 0.5);

            for (let i = 0; i < cellsToRemove; i++) {
                const [row, col] = positions[i];
                this.grid[row][col] = 0;
            }

            if (type === 'kropki') {
                return {
                    puzzle: this.grid,
                    solution: solution,
                    dots: this.generateKropkiDots(solution)
                };
            }

            return {
                puzzle: this.grid,
                solution: solution
            };
        } catch (error) {
            console.error('Generation failed:', error);
            throw error;
        }
    }

    generateCompleteSolution() {
        const solver = new KropkiSolver(9);
        solver.grid = this.grid.map(row => [...row]);
        if (solver.solve()) {
            this.grid = solver.grid.map(row => [...row]);
            return true;
        }
        return false;
    }

    generateKropkiDots(grid) {
        const horizontalDots = Array(9).fill().map(() => Array(8).fill('none'));
        const verticalDots = Array(8).fill().map(() => Array(9).fill('none'));

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 8; j++) {
                const n1 = grid[i][j];
                const n2 = grid[i][j + 1];
                if (n1 * 2 === n2 || n2 * 2 === n1) {
                    horizontalDots[i][j] = 'black';
                } else if (Math.abs(n1 - n2) === 1) {
                    horizontalDots[i][j] = 'white';
                }
            }
        }

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 9; j++) {
                const n1 = grid[i][j];
                const n2 = grid[i + 1][j];
                if (n1 * 2 === n2 || n2 * 2 === n1) {
                    verticalDots[i][j] = 'black';
                } else if (Math.abs(n1 - n2) === 1) {
                    verticalDots[i][j] = 'white';
                }
            }
        }

        return { horizontal: horizontalDots, vertical: verticalDots };
    }
}

window.SudokuGenerator = SudokuGenerator;
