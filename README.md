# Bob Todo App

A simple, elegant Todo application built with vanilla HTML, CSS, and JavaScript featuring a dark theme design.

## Features

- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Delete todos
- ✅ Real-time statistics (total and completed count)
- ✅ Dark theme with smooth animations
- ✅ Responsive design
- ✅ Keyboard support (Enter to add)

## Project Structure

```
.
├── README.md
├── .gitignore
├── todo-app-plan.md          # Comprehensive planning document
└── todo-app/
    ├── index.html            # Main HTML structure
    ├── styles.css            # Dark theme styling
    ├── app.js                # TodoApp class with literate programming
    └── test.html             # Unit test suite (5 tests)
```

## Getting Started

### Running the App

Simply open `todo-app/index.html` in your web browser:

```bash
open todo-app/index.html
```

Or use a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server
```

Then navigate to `http://localhost:8000/todo-app/`

### Running Tests

Open `todo-app/test.html` in your browser to run the unit test suite:

```bash
open todo-app/test.html
```

All 5 tests should pass:
1. Add Todo
2. Toggle Todo Completion
3. Delete Todo
4. Unique ID Generation
5. Empty Input Validation

## Architecture

### TodoApp Class

The application uses a class-based architecture with:

- **State Management**: Single source of truth in `todos` array
- **Unidirectional Data Flow**: User Action → Method → State Update → Render
- **Reactive Rendering**: Full re-render on every state change

### Key Methods

- `init()` - Initialize app and setup event listeners
- `addTodo(text)` - Add new todo with unique ID
- `toggleComplete(id)` - Toggle completion status
- `deleteTodo(id)` - Remove todo by ID
- `render()` - Update UI to match current state

### Why Unique IDs?

The app uses unique IDs instead of array indices because:
- Array indices change when items are deleted
- IDs remain stable throughout the todo's lifecycle
- Enables reliable tracking across operations

### Why Full Re-render?

The app re-renders the entire list on every change because:
- Simpler code with one rendering path
- UI always matches state exactly
- Predictable and easy to debug
- Fast enough for small lists (<1000 items)

## Design

- **Color Scheme**: Dark theme with purple accents
- **Typography**: System fonts for native feel
- **Layout**: Centered card with max-width 600px
- **Interactions**: Smooth hover effects and transitions
- **Accessibility**: Semantic HTML and keyboard support

## Documentation

See `todo-app-plan.md` for comprehensive planning documentation including:
- File structure rationale
- HTML layout design
- State management strategy
- Method descriptions
- Implementation flow diagrams

See `todo-app/app.js` for literate programming documentation explaining:
- Why unique IDs are essential
- How data flow works
- Why full re-render is preferred
- Closure usage in event handlers

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - feel free to use this code for learning or projects!

## Author

Built with Bob - AI Software Engineer