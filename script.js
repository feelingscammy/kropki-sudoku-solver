class KropkiSolver {
    constructor(size = 9) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(0));
        this.horizontalDots = Array(size).fill().map(() => Array(size - 1).fill('none'));
        this.verticalDots = Array(size - 1).fill().map(() => Array(size).fill('none'));
        this.boxSize = Math.sqrt(size);
        // Cache for possible values
        this.possibleValues = new Map();
    }

    // Cache possible values for each cell
    updatePossibleValues(row, col) {
        const key = `${row},${col}`;
        const values = new Set();
        for (let num = 1; num <= this.size; num++) {
            if (this.isValid(row, col, num)) {
                values.add(num);
            }
        }
        this.possibleValues.set(key, values);
        return values;
    }

    isValid(row, col, num) {
        // Check row
        for (let x = 0; x < this.size; x++) {
            if (this.grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < this.size; x++) {
            if (this.grid[x][col] === num) return false;
        }

        // Check 3x3 box
        let boxRow = Math.floor(row / this.boxSize) * this.boxSize;
        let boxCol = Math.floor(col / this.boxSize) * this.boxSize;
        for (let i = 0; i < this.boxSize; i++) {
            for (let j = 0; j < this.boxSize; j++) {
                if (this.grid[boxRow + i][boxCol + j] === num) return false;
            }
        }

        // Check dot constraints
        if (!this.checkDotsForPosition(row, col, num)) return false;

        return true;
    }

    checkDotsForPosition(row, col, num) {
        // Check horizontal dots
        if (col > 0 && this.grid[row][col - 1] !== 0) {
            if (!this.checkDotConstraint(this.grid[row][col - 1], num, this.horizontalDots[row][col - 1])) 
                return false;
        }
        if (col < this.size - 1 && this.grid[row][col + 1] !== 0) {
            if (!this.checkDotConstraint(num, this.grid[row][col + 1], this.horizontalDots[row][col])) 
                return false;
        }

        // Check vertical dots
        if (row > 0 && this.grid[row - 1][col] !== 0) {
            if (!this.checkDotConstraint(this.grid[row - 1][col], num, this.verticalDots[row - 1][col])) 
                return false;
        }
        if (row < this.size - 1 && this.grid[row + 1][col] !== 0) {
            if (!this.checkDotConstraint(num, this.grid[row + 1][col], this.verticalDots[row][col])) 
                return false;
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
        // Find cell with fewest possible values first
        let minPossibilities = this.size + 1;
        let bestCell = null;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    let count = this.countPossibleValues(i, j);
                    if (count < minPossibilities) {
                        minPossibilities = count;
                        bestCell = [i, j];
                        // Early exit if we find a cell with minimum possible values
                        if (minPossibilities === 1) return bestCell;
                    }
                }
            }
        }
        return bestCell;
    }

    countPossibleValues(row, col) {
        let count = 0;
        for (let num = 1; num <= this.size; num++) {
            if (this.isValid(row, col, num)) count++;
        }
        return count;
    }

    solve() {
        const emptyCell = this.findEmptyCell();
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        
        // Try numbers in ascending order for better solutions
        for (let num = 1; num <= this.size; num++) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                
                if (this.solve()) {
                    return true;
                }
                
                this.grid[row][col] = 0; // backtrack
            }
        }
        return false;
    }

    // Add validation before solving
    validateInitialGrid() {
        // Check existing numbers follow Sudoku rules
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const num = this.grid[r][c];
                if (num !== 0) {
                    // Temporarily remove number to check if it's valid
                    this.grid[r][c] = 0;
                    if (!this.isValid(r, c, num)) {
                        this.grid[r][c] = num;
                        return false;
                    }
                    this.grid[r][c] = num;
                }
            }
        }
        return true;
    }
}

class SudokuGenerator {
    constructor() {
        this.size = 9;
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
    }

    generate(difficulty, type) {
        try {
            // Reset the grid before generating
            this.grid = Array(9).fill().map(() => Array(9).fill(0));
            
            // Generate complete solution
            if (!this.generateCompleteSolution()) {
                throw new Error('Failed to generate complete solution');
            }
            
            // Updated difficulty levels
            const cellsToRemove = {
                easy: 35,      // 46 numbers given
                medium: 45,    // 36 numbers given
                hard: 52,      // 29 numbers given
                expert: 58,    // 23 numbers given
                master: 62     // 19 numbers given
            }[difficulty] || 45;

            // Store solution before removing numbers
            const solution = this.grid.map(row => [...row]);
            
            // Remove numbers randomly
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
        this.fillDiagonal();
        return this.solveSudoku();
    }
    
    fillDiagonal() {
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
    }

    fillBox(row, col) {
        let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        nums = nums.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.grid[row + i][col + j] = nums[i * 3 + j];
            }
        }
    }

    solveSudoku() {
        const solver = new KropkiSolver(9);
        solver.grid = this.grid.map(row => [...row]);
        if (solver.solve()) {
            this.grid = solver.grid.map(row => [...row]);
            return true;
        }
        return false;
    }

    removeNumbers(count, type) {
        const solution = this.grid.map(row => [...row]);
        const positions = [];
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }

        positions.sort(() => Math.random() - 0.5);

        for (let i = 0; i < count; i++) {
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
    }

    generateKropkiDots(grid) {
        const horizontalDots = Array(9).fill().map(() => Array(8).fill('none'));
        const verticalDots = Array(8).fill().map(() => Array(9).fill('none'));

        // Generate horizontal dots
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

        // Generate vertical dots
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

// DOM manipulation and event handlers
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const grid = document.getElementById('grid');
    const solver = new KropkiSolver(9);
    
    // Create grid
    for (let r = 0; r < 9; r++) {
        const row = document.createElement('tr');
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.maxLength = 1;
            input.type = 'number';
            input.min = '1';
            input.max = '9';
            
            cell.appendChild(input);
            
            // Add horizontal dots (except for last column)
            if (c < 8) {
                const horizontalDot = document.createElement('div');
                horizontalDot.className = 'dot horizontal';
                cell.appendChild(horizontalDot);
            }
            
            // Add vertical dots (except for last row)
            if (r < 8) {
                const verticalDot = document.createElement('div');
                verticalDot.className = 'dot vertical';
                cell.appendChild(verticalDot);
            }
            
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }

    // Dot controls event listeners
    document.querySelectorAll('.dot-selector').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.dot-selector').forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            selectedDotType = button.id;
        });
    });

    // Update the dot event listener
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (!selectedDotType) {
                alert('Please select a dot type first (Black Dot, White Dot, or Remove Dot)');
                return;
            }
            
            // Check if the clicked dot already has the selected type
            if (selectedDotType === 'blackDot' && dot.classList.contains('black-dot') ||
                selectedDotType === 'whiteDot' && dot.classList.contains('white-dot')) {
                // If yes, remove the dot
                dot.classList.remove('black-dot', 'white-dot');
            } else {
                // If no, remove any existing dot and add the selected type
                dot.classList.remove('black-dot', 'white-dot');
                if (selectedDotType === 'blackDot') {
                    dot.classList.add('black-dot');
                } else if (selectedDotType === 'whiteDot') {
                    dot.classList.add('white-dot');
                }
            }
        });
    });

    // Add visual feedback for selected cells
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.parentElement.style.backgroundColor = '#e7f1ff';
        });
        
        input.addEventListener('blur', (e) => {
            e.target.parentElement.style.backgroundColor = '';
        });
    });

    // Add error handling for the solver
    document.getElementById('solveBtn').addEventListener('click', () => {
        try {
            const solver = new KropkiSolver(9);
            const grid = document.getElementById('grid');
            updateSolverGrid(solver, grid);

            // Validate initial grid
            if (!solver.validateInitialGrid()) {
                alert('The initial configuration is invalid. Please check your inputs.');
                return;
            }

            // Disable inputs during solving
            document.querySelectorAll('input').forEach(input => input.disabled = true);
            
            // Use setTimeout to prevent UI freeze
            setTimeout(() => {
                if (solver.solve()) {
                    updateUIGrid(solver); // Pass solver object directly
                } else {
                    alert('No solution exists for this puzzle configuration.');
                }
                
                // Re-enable empty cells
                document.querySelectorAll('input').forEach(input => {
                    if (!input.value) input.disabled = false;
                });
            }, 100);

        } catch (error) {
            console.error('Solver error:', error);
            alert('An error occurred while solving the puzzle.');
        }
    });

    // Clear button functionality
    document.getElementById('clearBtn')?.addEventListener('click', () => {
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
            input.disabled = false;
        });
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.remove('black-dot', 'white-dot');
        });
    });

    // Fix dot selector
    let selectedDotType = null; // Add this at the top level
    const dotControls = document.querySelector('.controls');
    dotControls.addEventListener('click', (e) => {
        if (e.target.classList.contains('dot-selector')) {
            document.querySelectorAll('.dot-selector').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedDotType = e.target.id;
        }
    });

    const instructionsBtn = document.getElementById('instructionsBtn');
    const instructions = document.querySelector('.instructions');
    const closeInstructionsBtn = document.querySelector('.close-instructions');

    instructionsBtn?.addEventListener('click', () => {
        instructions.classList.add('open');
    });

    closeInstructionsBtn?.addEventListener('click', () => {
        instructions.classList.remove('open');
    });

    // Close instructions when clicking outside
    document.addEventListener('click', (e) => {
        if (instructions.classList.contains('open') && 
            !instructions.contains(e.target) && 
            e.target !== instructionsBtn) {
            instructions.classList.remove('open');
        }
    });

    // Generate button functionality
    document.getElementById('generateBtn')?.addEventListener('click', () => {
        try {
            const type = document.getElementById('sudokuType').value;
            const difficulty = document.getElementById('difficulty').value;
            const generator = new SudokuGenerator();
            
            // Clear previous puzzle first
            document.getElementById('clearBtn').click();
            
            // Generate new puzzle
            const result = generator.generate(difficulty, type);
            
            // Update grid with puzzle
            updateUIGrid(result.puzzle);
            
            // Update dots if it's a kropki puzzle
            if (type === 'kropki') {
                updateDots(result.dots);
            } else {
                clearDots();
            }
            
            // Store solution for checking later
            window.currentSolution = result.solution;
        } catch (error) {
            console.error('Generation error:', error);
            console.error(error.stack); // Add stack trace for debugging
            alert('An error occurred while generating the puzzle. Please try again.');
        }
    });

    // Check solution button functionality
    document.getElementById('checkBtn')?.addEventListener('click', () => {
        if (!window.currentSolution) {
            alert('No puzzle has been generated yet!');
            return;
        }

        const currentGrid = getCurrentGridValues();
        const isCorrect = checkSolution(currentGrid, window.currentSolution);
        
        if (isCorrect) {
            alert('Congratulations! The solution is correct!');
        } else {
            alert('The solution is not correct. Keep trying!');
        }
    });
});

function showSolver() {
    const landing = document.getElementById('landing');
    const solver = document.getElementById('solver');
    
    landing.classList.add('hiding');
    
    // Show solver page after short delay
    setTimeout(() => {
        landing.style.display = 'none';
        solver.style.display = 'block';
        
        void solver.offsetWidth;
        
        solver.classList.add('visible');
    }, 600);
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

function updateUIGrid(source, gridElement = null) {
    const inputs = document.querySelectorAll('td input');
    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        // Handle both solver object and direct grid array
        const value = source.grid ? source.grid[row][col] : source[row][col];
        input.value = value || '';
        input.disabled = value !== 0;
    });
}

function updateDots(dots) {
    // Update horizontal dots
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.querySelector(`tr:nth-child(${i + 1}) td:nth-child(${j + 1})`);
            const dot = cell.querySelector('.dot.horizontal');
            updateDotClass(dot, dots.horizontal[i][j]);
        }
    }

    // Update vertical dots
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

// Update the generate button event listener
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Generate button functionality
    document.getElementById('generateBtn')?.addEventListener('click', () => {
        try {
            const type = document.getElementById('sudokuType').value;
            const difficulty = document.getElementById('difficulty').value;
            const generator = new SudokuGenerator();
            
            // Clear previous puzzle first
            document.getElementById('clearBtn').click();
            
            // Generate new puzzle
            const result = generator.generate(difficulty, type);
            
            // Update grid with puzzle
            updateUIGrid(result.puzzle);
            
            // Update dots if it's a kropki puzzle
            if (type === 'kropki') {
                updateDots(result.dots);
            } else {
                clearDots();
            }
            
            // Store solution for checking later
            window.currentSolution = result.solution;
        } catch (error) {
            console.error('Generation error:', error);
            console.error(error.stack); // Add stack trace for debugging
            alert('An error occurred while generating the puzzle. Please try again.');
        }
    });

    // Check solution button functionality
    document.getElementById('checkBtn')?.addEventListener('click', () => {
        if (!window.currentSolution) {
            alert('No puzzle has been generated yet!');
            return;
        }

        const currentGrid = getCurrentGridValues();
        const isCorrect = checkSolution(currentGrid, window.currentSolution);
        
        if (isCorrect) {
            alert('Congratulations! The solution is correct!');
        } else {
            alert('The solution is not correct. Keep trying!');
        }
    });

    // ...rest of the existing DOMContentLoaded code...
});

function getDotType(dot) {
    return dot.classList.contains('black-dot') ? 'black' :
           dot.classList.contains('white-dot') ? 'white' : 'none';
}

// Add event listeners
document.getElementById('generateBtn').addEventListener('click', () => {
    const type = document.getElementById('sudokuType').value;
    const difficulty = document.getElementById('difficulty').value;
    const generator = new SudokuGenerator();
    const result = generator.generate(difficulty, type);
    
    // Update grid with puzzle
    updateUIGrid(result.puzzle);
    
    // If kropki, update dots
    if (type === 'kropki') {
        updateDots(result.dots);
    } else {
        clearDots();
    }
    
    // Store solution for checking later
    window.currentSolution = result.solution;
});

document.getElementById('checkBtn').addEventListener('click', () => {
    if (!window.currentSolution) {
        alert('No puzzle has been generated yet!');
        return;
    }

    const currentGrid = getCurrentGridValues();
    const isCorrect = checkSolution(currentGrid, window.currentSolution);
    
    if (isCorrect) {
        alert('Congratulations! The solution is correct!');
    } else {
        alert('The solution is not correct. Keep trying!');
    }
});

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