document.addEventListener('DOMContentLoaded', () => {
    const instructionsBtn = document.getElementById('instructionsBtn');
    const instructions = document.querySelector('.instructions') ||
                        document.getElementById('instructions-container');
    const closeInstructionsBtn = document.querySelector('.close-instructions');

    instructionsBtn?.addEventListener('click', () => {
        instructions?.classList.add('open');
    });

    closeInstructionsBtn?.addEventListener('click', () => {
        instructions?.classList.remove('open');
    });

    if (instructions) {
        document.addEventListener('click', (e) => {
            if (instructions.classList.contains('open') &&
                !instructions.contains(e.target) &&
                e.target !== instructionsBtn) {
                instructions.classList.remove('open');
            }
        });
    }

    document.getElementById('generateBtn')?.addEventListener('click', () => {
        try {
            const type = document.getElementById('sudokuType').value;
            const difficulty = document.getElementById('difficulty').value;
            const generator = new SudokuGenerator();

            document.getElementById('clearBtn').click();
            const result = generator.generate(difficulty, type);

            updateUIGrid(result.puzzle);

            if (type === 'kropki') {
                updateDots(result.dots);
            } else {
                clearDots();
            }

            window.currentSolution = result.solution;
        } catch (error) {
            console.error('Generation error:', error);
            console.error(error.stack);
            alert('An error occurred while generating the puzzle.');
        }
    });

    document.getElementById('solveBtn')?.addEventListener('click', () => {
        try {
            const solver = new KropkiSolver(9);
            const grid = document.getElementById('grid');
            updateSolverGrid(solver, grid);

            if (!solver.validateInitialGrid()) {
                alert('Invalid initial configuration.');
                return;
            }

            document.querySelectorAll('input').forEach(input => input.disabled = true);

            setTimeout(() => {
                if (solver.solve()) {
                    updateUIGrid(solver);
                } else {
                    alert('No solution exists.');
                }

                document.querySelectorAll('input').forEach(input => {
                    if (!input.value) input.disabled = false;
                });
            }, 100);
        } catch (error) {
            console.error('Solver error:', error);
            alert('An error occurred while solving.');        }
    });    // Check solution button handler
    document.getElementById('checkBtn')?.addEventListener('click', () => {
        if (!window.currentSolution) {
            alert('No puzzle has been generated yet!');
            return;
        }

        const currentGrid = getCurrentGridValues();
        console.log('Current Grid:', currentGrid);

        const solver = new KropkiSolver(9);
        solver.grid = currentGrid;

        const type = document.getElementById('sudokuType')?.value;
        if (type === 'normal') {
            let isValid = true;
            for (let i = 0; i < 9 && isValid; i++) {
                for (let j = 0; j < 9 && isValid; j++) {
                    const currentValue = currentGrid[i][j];
                    if (currentValue === 0) {
                        isValid = false;
                        break;
                    }
                    // Temporarily remove the number and check if it's valid
                    currentGrid[i][j] = 0;
                    isValid = solver.isValid(i, j, currentValue);
                    currentGrid[i][j] = currentValue;
                }
            }
            if (isValid) {
                alert('Correct solution!');
            } else {
                alert('Not correct yet. Make sure all numbers follow Sudoku rules!');
            }
            return;
        }

        const isCorrect = checkSolution(currentGrid, window.currentSolution);if (!isCorrect && differences.length > 0) {
            console.log('Differences found:', differences);
            alert('Not correct yet. Check the console for details.');
        } else if (isCorrect) {
            alert('Correct solution!');
        } else {
            alert('Not correct yet. Keep trying!');
        }
    });

    document.getElementById('clearBtn')?.addEventListener('click', () => {
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
            input.disabled = false;
        });
        clearDots();
        window.currentSolution = null;
    });

    document.querySelectorAll('#grid input').forEach(input => {
        input.type = 'number';
        input.min = 1;
        input.max = 9;
        input.maxLength = 1;

        input.addEventListener('input', function(e) {
            let value = this.value.slice(-1);
            if (!/^[1-9]$/.test(value)) {
                value = '';
            }

            this.value = value;
        });

        input.addEventListener('paste', e => e.preventDefault());
        input.addEventListener('drop', e => e.preventDefault());
        input.addEventListener('dragstart', e => e.preventDefault());
    });
});
