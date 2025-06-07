class KropkiSolver {
    constructor(size = 9) {  // Changed from 6 to 9
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(0));
        this.horizontalDots = Array(size).fill().map(() => Array(size - 1).fill('none'));
        this.verticalDots = Array(size - 1).fill().map(() => Array(size).fill('none'));
    }

    isValid(row, col, num) {
        // Check row and column
        for (let i = 0; i < this.size; i++) {
            if (this.grid[row][i] === num || this.grid[i][col] === num) {
                return false;
            }
        }

        // Check dot constraints
        if (col > 0) { // Check left dot
            const leftNum = this.grid[row][col - 1];
            if (leftNum !== 0) {
                const dot = this.horizontalDots[row][col - 1];
                if (!this.checkDotConstraint(leftNum, num, dot)) {
                    return false;
                }
            }
        }
        if (col < this.size - 1) { // Check right dot
            const rightNum = this.grid[row][col + 1];
            if (rightNum !== 0) {
                const dot = this.horizontalDots[row][col];
                if (!this.checkDotConstraint(num, rightNum, dot)) {
                    return false;
                }
            }
        }
        if (row > 0) { // Check upper dot
            const upperNum = this.grid[row - 1][col];
            if (upperNum !== 0) {
                const dot = this.verticalDots[row - 1][col];
                if (!this.checkDotConstraint(upperNum, num, dot)) {
                    return false;
                }
            }
        }
        if (row < this.size - 1) { // Check lower dot
            const lowerNum = this.grid[row + 1][col];
            if (lowerNum !== 0) {
                const dot = this.verticalDots[row][col];
                if (!this.checkDotConstraint(num, lowerNum, dot)) {
                    return false;
                }
            }
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

    solve(row = 0, col = 0) {
        if (col === this.size) {
            row++;
            col = 0;
        }
        if (row === this.size) {
            return true;
        }

        if (this.grid[row][col] !== 0) {
            return this.solve(row, col + 1);
        }

        for (let num = 1; num <= this.size; num++) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                if (this.solve(row, col + 1)) {
                    return true;
                }
                this.grid[row][col] = 0;
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