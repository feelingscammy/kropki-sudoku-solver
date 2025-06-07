class KropkiSolver {
    constructor(size = 9) {  // Changed from 6 to 9
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(0));
        this.horizontalDots = Array(size).fill().map(() => Array(size - 1).fill('none'));
        this.verticalDots = Array(size - 1).fill().map(() => Array(size).fill('none'));
        // Pre-calculate box coordinates for better performance
        this.boxSize = Math.sqrt(size);
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
        let emptyCell = this.findEmptyCell();
        if (!emptyCell) return true; // puzzle is solved

        let [row, col] = emptyCell;
        
        // Try numbers in random order to avoid getting stuck in patterns
        let numbers = [...Array(this.size)].map((_, i) => i + 1);
        numbers = numbers.sort(() => Math.random() - 0.5);

        for (let num of numbers) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                if (this.solve()) return true;
                this.grid[row][col] = 0; // backtrack
            }
        }
        return false;
    }
}

// DOM manipulation and event handlers
document.addEventListener('DOMContentLoaded', () => {
    const size = 9;  // Changed from 6 to 9
    const grid = document.getElementById('grid');
    let selectedDotType = null;
    const solver = new KropkiSolver(size);

    // Create grid
    for (let r = 0; r < size; r++) {
        const row = document.createElement('tr');
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.maxLength = 1;
            input.type = 'number';
            input.min = '1';
            input.max = '9';
            
            // Add input validation
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 9)) {
                    e.target.dataset.valid = 'true';
                } else {
                    e.target.value = '';
                    e.target.dataset.valid = 'false';
                }
            });

            // Prevent non-numeric input
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    return;
                }
                if (!/[1-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });

            cell.appendChild(input);
            
            // Add horizontal dots (except for last column)
            if (c < size - 1) {
                const horizontalDot = document.createElement('div');
                horizontalDot.className = 'dot horizontal';
                cell.appendChild(horizontalDot);
            }
            
            // Add vertical dots (except for last row)
            if (r < size - 1) {
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
            // Get current grid state
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const input = grid.rows[r].cells[c].querySelector('input');
                    solver.grid[r][c] = input.value ? parseInt(input.value) : 0;
                    
                    if (c < size - 1) {
                        const hDot = grid.rows[r].cells[c].querySelector('.dot.horizontal');
                        solver.horizontalDots[r][c] = hDot.classList.contains('black-dot') ? 'black' :
                                                    hDot.classList.contains('white-dot') ? 'white' : 'none';
                    }
                    
                    if (r < size - 1) {
                        const vDot = grid.rows[r].cells[c].querySelector('.dot.vertical');
                        solver.verticalDots[r][c] = vDot.classList.contains('black-dot') ? 'black' :
                                                  vDot.classList.contains('white-dot') ? 'white' : 'none';
                    }
                }
            }

            // Solve and update UI
            if (solver.solve()) {
                for (let r = 0; r < size; r++) {
                    for (let c = 0; c < size; c++) {
                        grid.rows[r].cells[c].querySelector('input').value = solver.grid[r][c];
                    }
                }
            } else {
                alert('No solution exists for this puzzle configuration. Please check your inputs and dots.');
            }
        } catch (error) {
            alert('An error occurred while solving the puzzle. Please check your inputs and try again.');
            console.error(error);
        }
    });

    // Add this inside your DOMContentLoaded event listener
    document.getElementById('clearBtn').addEventListener('click', () => {
        // Clear all input values
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
        });

        // Remove all dots
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.remove('black-dot', 'white-dot');
        });
    });

    // Add this to your DOMContentLoaded event listener
    const instructionsBtn = document.getElementById('instructionsBtn');
    const instructions = document.querySelector('.instructions');
    const closeInstructions = document.querySelector('.close-instructions');

    instructionsBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        instructions.classList.toggle('open');
        instructionsBtn.classList.toggle('open');
    });

    closeInstructions.addEventListener('click', () => {
        instructions.classList.remove('open');
        instructionsBtn.classList.remove('open');
    });
});

function showSolver() {
    const landing = document.getElementById('landing');
    const solver = document.getElementById('solver');
    
    // Add hiding class to landing for fade out
    landing.classList.add('hiding');
    
    // Show solver after short delay
    setTimeout(() => {
        landing.style.display = 'none';
        solver.style.display = 'block';
        
        // Force a reflow before adding visible class
        void solver.offsetWidth;
        
        // Add visible class for fade in
        solver.classList.add('visible');
    }, 600);
}