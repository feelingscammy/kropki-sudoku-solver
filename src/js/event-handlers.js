document.addEventListener('DOMContentLoaded', () => {
    const instructionsBtn = document.getElementById('instructionsBtn');
    const instructions = document.querySelector('.instructions') ||
                        document.getElementById('instructions-container');
    const closeInstructionsBtn = document.querySelector('.close-instructions');

    const body = document.body;
    const overlay = document.createElement('div');

    overlay.className = 'instructions-overlay';
    body.appendChild(overlay);

    instructionsBtn?.addEventListener('click', () => {
        instructions?.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        instructions?.classList.remove('open');
        overlay.classList.remove('active');
    });

    closeInstructionsBtn?.addEventListener('click', () => {
        instructions?.classList.remove('open');
        overlay.classList.remove('active');
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
    });
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

    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');

    if (menuToggle && sideMenu) {
        if (window.innerWidth <= 1024) {
            sideMenu.classList.remove('active');
        }

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sideMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 &&
                sideMenu.classList.contains('active') &&
                !sideMenu.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sideMenu.classList.remove('active');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                sideMenu.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.dot-selector').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.dot-selector').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
        });
    });
});
