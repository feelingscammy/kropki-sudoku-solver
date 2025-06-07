# Kropki Sudoku Solver

An interactive web application for solving and generating both Normal and Kropki Sudoku puzzles.

## Features

- Solve your own Sudoku puzzles
- Generate new puzzles with different difficulty levels
- Support for both normal Sudoku and Kropki Sudoku
- Interactive dot placement system
- Solution checker
- Responsive design

## Project Structure

```
Kropki Sudoku Solver/
├── src/
│   ├── js/
│   │   ├── solver.js       (Solver logic)
│   │   ├── generator.js    (Puzzle generation)
│   │   ├── ui-utils.js     (UI utility functions)
│   │   ├── main.js        (Main initialization)
│   │   └── event-handlers.js (Event handling)
│   ├── css/
│   │   ├── main.css       (Core styles)
│   │   ├── grid.css       (Grid styles)
│   │   ├── controls.css   (Controls styles)
│   │   └── animations.css (Animations)
│   └── components/
│       └── instructions.html
├── index.html
└── README.md
```

## How to Use

1. Open `index.html` in a web browser or directly on GitHub Pages
2. Click "Start Solving" to begin
3. Use the controls to:
   - Generate new puzzles
   - Place black or white dots
   - Solve your own puzzle
   - Check your solution
   - Clear the grid

## Technical Details

- Pure HTML, CSS, and JavaScript implementation
- No external dependencies
- Modular code organization
- Responsive design with CSS Grid and Flexbox
