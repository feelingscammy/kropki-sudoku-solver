function initializeGrid() {
    const grid = document.getElementById('grid');
    if (!grid) return;

    grid.innerHTML = '';

    for (let r = 0; r < 9; r++) {
        const row = document.createElement('tr');
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '9';
            input.maxLength = 1;
            input.pattern = '[1-9]';

            cell.appendChild(input);

            if (c < 8) {
                const horizontalDot = document.createElement('div');
                horizontalDot.className = 'dot horizontal';
                cell.appendChild(horizontalDot);
            }

            if (r < 8) {
                const verticalDot = document.createElement('div');
                verticalDot.className = 'dot vertical';
                cell.appendChild(verticalDot);
            }

            row.appendChild(cell);
        }
        grid.appendChild(row);
    }

    initializeDotHandlers();
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.parentElement.style.backgroundColor = '#e7f1ff';
        });

        input.addEventListener('blur', (e) => {
            e.target.parentElement.style.backgroundColor = '';
        });
    });
}

function initializeDotHandlers() {
    let selectedDotType = null;

    document.querySelectorAll('.dot-selector').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.dot-selector').forEach(b =>
                b.classList.remove('selected'));
            button.classList.add('selected');
            selectedDotType = button.id;
        });
    });

    document.querySelectorAll('#grid .dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!selectedDotType) return;

            // Remove existing dot classes
            dot.classList.remove('black-dot', 'white-dot');

            // Add new dot class if not removing
            if (selectedDotType !== 'noDot') {
                dot.classList.add(selectedDotType === 'blackDot' ? 'black-dot' : 'white-dot');
            }
        });
    });
}

function showSolver() {
    console.log('Showing solver...');
    const landing = document.getElementById('landing');
    const solver = document.getElementById('solver');

    if (landing && solver) {
        landing.classList.add('hiding');
        setTimeout(() => {
            landing.style.display = 'none';
            solver.style.display = 'block';
            void solver.offsetWidth;
            solver.classList.add('visible');
            initializeGrid(); // Initialize grid after showing solver
        }, 600);
    } else {
        console.error('Landing or solver elements not found');
    }
}
window.showSolver = showSolver;
window.initializeGrid = initializeGrid;

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth * 100;
        const y = e.clientY / window.innerHeight * 100;
        document.documentElement.style.setProperty('--mouse-x', x + '%');
        document.documentElement.style.setProperty('--mouse-y', y + '%');
    });

    const solver = document.getElementById('solver');
    if (solver) {
        solver.style.display = 'none';
    }
});

const instructionsBtn = document.getElementById('instructionsBtn');
instructionsBtn?.addEventListener('click', () => {
    const instructions = document.querySelector('.instructions');
    if (instructions) {
        instructions.classList.add('open');
    }
});

fetch('src/components/instructions.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('instructions-container').innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading instructions:', error);
    });

document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for close button (since instructions are loaded dynamically)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-instructions')) {
            const instructions = document.querySelector('.instructions');
            instructions?.classList.remove('open');
        }
    });
});
