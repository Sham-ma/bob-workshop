/**
 * ============================================================================
 * TodoApp Class - A Literate Programming Approach
 * ============================================================================
 * 
 * This Todo application demonstrates fundamental concepts in state management
 * and reactive UI patterns using vanilla JavaScript.
 * 
 * Core Concepts:
 * 1. Single Source of Truth: All todo data lives in the `todos` array
 * 2. Unidirectional Data Flow: User Action → State Update → Re-render
 * 3. Declarative Rendering: UI is always derived from current state
 */

class TodoApp {
    constructor() {
        /**
         * STATE MANAGEMENT
         * ============================================================================
         * 
         * The `todos` array is our single source of truth. Every todo is an object
         * with three properties:
         * 
         * {
         *   id: number,        // Unique identifier
         *   text: string,      // The todo's content
         *   completed: boolean // Completion status
         * }
         * 
         * WHY USE UNIQUE IDs INSTEAD OF ARRAY INDICES?
         * --------------------------------------------
         * Array indices are unstable and change when items are added/removed:
         * 
         * Example Problem with Indices:
         *   Initial: ["Buy milk", "Walk dog", "Read book"]
         *            [    0     ,     1     ,      2     ]
         * 
         *   After deleting "Walk dog":
         *            ["Buy milk", "Read book"]
         *            [    0     ,     1      ]
         * 
         * Notice "Read book" moved from index 2 to index 1! If we were tracking
         * which todo to toggle by index, we'd toggle the wrong item.
         * 
         * With unique IDs:
         *   Initial: [{id:1, text:"Buy milk"}, {id:2, text:"Walk dog"}, {id:3, text:"Read book"}]
         *   
         *   After deleting id:2:
         *            [{id:1, text:"Buy milk"}, {id:3, text:"Read book"}]
         * 
         * The IDs never change! We can always find the correct todo, regardless
         * of array position. This is crucial for:
         * - Deleting the correct item
         * - Toggling the correct item's completion status
         * - Maintaining data integrity during concurrent operations
         */
        this.todos = [];
        
        /**
         * The `nextId` counter ensures every todo gets a unique identifier.
         * It increments with each new todo, guaranteeing no ID collisions.
         * 
         * In a real application, IDs would come from a database. Here, we
         * simulate that with an auto-incrementing counter.
         */
        this.nextId = 1;
        
        /**
         * DOM ELEMENT REFERENCES
         * ============================================================================
         * 
         * We cache references to DOM elements for performance. Querying the DOM
         * is relatively expensive, so we do it once during initialization and
         * store the references.
         * 
         * Benefits:
         * - Faster access (no repeated DOM queries)
         * - Cleaner code (no document.getElementById everywhere)
         * - Type safety (we know these exist after init())
         */
        this.todoInput = null;
        this.addBtn = null;
        this.todoList = null;
        this.totalCount = null;
        this.completedCount = null;
    }

    /**
     * INITIALIZATION
     * ============================================================================
     * 
     * The init() method is called once when the page loads. It sets up
     * everything the app needs to function:
     * 
     * 1. Cache DOM element references
     * 2. Attach event listeners to static elements
     * 3. Render the initial (empty) state
     * 
     * This separation of initialization from construction follows the
     * "two-phase initialization" pattern, giving us more control over
     * when the app starts.
     */
    init() {
        // Phase 1: Cache DOM references
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');

        // Phase 2: Setup event listeners for user interactions
        this.setupEventListeners();

        // Phase 3: Render initial state (empty list with "No todos" message)
        this.render();
    }

    /**
     * EVENT LISTENER SETUP
     * ============================================================================
     * 
     * We attach event listeners to static elements (elements that exist in
     * the HTML and never get removed). For dynamic elements (todo items),
     * we attach listeners during render().
     * 
     * Why separate static and dynamic listeners?
     * - Static listeners are set once and never need updating
     * - Dynamic listeners must be recreated each render to work with new elements
     */
    setupEventListeners() {
        // Listen for clicks on the Add button
        this.addBtn.addEventListener('click', () => {
            this.handleAddTodo();
        });

        // Listen for Enter key in the input field
        // This provides better UX - users can add todos without clicking
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTodo();
            }
        });
    }

    /**
     * HANDLE ADD TODO
     * ============================================================================
     * 
     * This method processes the user's intent to add a todo. It:
     * 1. Extracts and validates the input
     * 2. Calls addTodo() if valid
     * 3. Clears the input field
     * 4. Refocuses the input for better UX
     * 
     * Validation: We trim whitespace and check for empty strings to prevent
     * adding meaningless todos.
     */
    handleAddTodo() {
        const text = this.todoInput.value.trim();
        
        // Only add if there's actual content
        if (text) {
            this.addTodo(text);
            this.todoInput.value = '';
            this.todoInput.focus(); // Keep focus for rapid todo entry
        }
    }

    /**
     * ADD TODO
     * ============================================================================
     * 
     * DATA FLOW DEMONSTRATION:
     * 
     * User Action: User types "Buy milk" and clicks Add
     *      ↓
     * Method Call: handleAddTodo() → addTodo("Buy milk")
     *      ↓
     * State Update: New todo object added to this.todos array
     *      ↓
     * Re-render: render() called to update UI
     *      ↓
     * UI Update: New todo appears in the list
     * 
     * This unidirectional flow makes the app predictable and debuggable.
     * We always know: if the state changed, the UI will update.
     */
    addTodo(text) {
        // Create a new todo object with a unique ID
        const todo = {
            id: this.nextId++,  // Use current ID, then increment for next todo
            text: text,
            completed: false    // New todos start incomplete
        };

        // Update state: Add to our todos array
        this.todos.push(todo);
        
        // Sync UI with new state
        this.render();
    }

    /**
     * TOGGLE TODO COMPLETION
     * ============================================================================
     * 
     * DATA FLOW FOR TOGGLING:
     * 
     * User Action: User clicks checkbox for todo with id:3
     *      ↓
     * Event Handler: Checkbox change event fires
     *      ↓
     * Method Call: toggleComplete(3)
     *      ↓
     * State Update: Find todo with id:3, flip its completed boolean
     *      ↓
     * Re-render: render() called to update UI
     *      ↓
     * UI Update: Todo gets strikethrough styling, checkbox updates
     * 
     * Note: We find the todo by ID, not by array position. This is why
     * unique IDs are essential - they remain stable even as the array changes.
     */
    toggleComplete(id) {
        // Find the todo with matching ID
        // Array.find() returns the first element that matches, or undefined
        const todo = this.todos.find(t => t.id === id);
        
        if (todo) {
            // Toggle the completed status
            todo.completed = !todo.completed;
            
            // Sync UI with updated state
            this.render();
        }
    }

    /**
     * DELETE TODO
     * ============================================================================
     * 
     * DATA FLOW FOR DELETION:
     * 
     * User Action: User clicks Delete button for todo with id:2
     *      ↓
     * Event Handler: Button click event fires
     *      ↓
     * Method Call: deleteTodo(2)
     *      ↓
     * State Update: Filter out todo with id:2 from array
     *      ↓
     * Re-render: render() called to update UI
     *      ↓
     * UI Update: Todo disappears from list, stats update
     * 
     * Array.filter() creates a new array containing only todos that don't
     * match the ID. This is an immutable operation - we replace the old
     * array rather than mutating it.
     */
    deleteTodo(id) {
        // Create new array without the deleted todo
        // Keep all todos where t.id !== id (i.e., filter out the matching ID)
        this.todos = this.todos.filter(t => t.id !== id);
        
        // Sync UI with updated state
        this.render();
    }

    /**
     * CREATE TODO ELEMENT
     * ============================================================================
     * 
     * This helper method creates the DOM structure for a single todo item.
     * It's called by render() for each todo in the state.
     * 
     * Structure created:
     * <li class="todo-item [completed]" data-id="1">
     *   <input type="checkbox" class="todo-checkbox" [checked]>
     *   <span class="todo-text">Todo text here</span>
     *   <button class="delete-btn">Delete</button>
     * </li>
     * 
     * Event listeners are attached here because these are dynamic elements
     * that get recreated on every render.
     */
    createTodoElement(todo) {
        // Create the list item container
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        // Store the todo's ID as a data attribute for debugging
        // (though we don't actually use it - we use closures instead)
        li.dataset.id = todo.id;
        
        // Add 'completed' class if todo is done (for CSS styling)
        if (todo.completed) {
            li.classList.add('completed');
        }

        // Create checkbox for toggling completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        
        /**
         * CLOSURE MAGIC: Event Listener with Captured ID
         * 
         * This event listener "closes over" the todo.id variable from the
         * outer scope. Even after createTodoElement() returns, this function
         * remembers the specific ID it needs.
         * 
         * This is why we don't need to read data-id attributes - the closure
         * already knows which todo this checkbox belongs to!
         */
        checkbox.addEventListener('change', () => {
            this.toggleComplete(todo.id);
        });

        // Create text span to display the todo content
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        
        // Another closure capturing the todo's ID
        deleteBtn.addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });

        // Assemble the complete todo item
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);

        return li;
    }

    /**
     * UPDATE STATISTICS
     * ============================================================================
     * 
     * Calculate and display todo statistics. This is called by render()
     * after the list is updated.
     * 
     * We derive these numbers from the state rather than tracking them
     * separately. This prevents bugs where counts get out of sync with
     * the actual data.
     */
    updateStats() {
        const total = this.todos.length;
        
        // Count completed todos using Array.filter()
        const completed = this.todos.filter(t => t.completed).length;

        // Update the DOM text content
        this.totalCount.textContent = `Total: ${total}`;
        this.completedCount.textContent = `Completed: ${completed}`;
    }

    /**
     * RENDER
     * ============================================================================
     * 
     * This is the heart of our reactive UI pattern. Every time the state
     * changes, we call render() to update the entire UI.
     * 
     * WHY RE-RENDER THE WHOLE LIST INSTEAD OF PATCHING INDIVIDUAL ITEMS?
     * -------------------------------------------------------------------
     * 
     * Approach 1: Surgical Updates (What we DON'T do)
     * - When adding: Create and append one new element
     * - When deleting: Find and remove one specific element
     * - When toggling: Find and update one specific element
     * 
     * Problems with surgical updates:
     * 1. Complex Logic: Need different code paths for each operation
     * 2. State Sync Issues: Easy for UI to drift from state
     * 3. Bug-Prone: Must manually track which elements correspond to which data
     * 4. Order Problems: Insertions/deletions can mess up element order
     * 
     * Approach 2: Full Re-render (What we DO)
     * - Clear everything
     * - Rebuild from current state
     * 
     * Benefits of full re-render:
     * 1. Simple: One code path handles all cases
     * 2. Reliable: UI always matches state exactly
     * 3. Predictable: Same state always produces same UI
     * 4. Debuggable: Easy to reason about what's displayed
     * 
     * Performance Consideration:
     * For small lists (< 1000 items), re-rendering is fast enough that users
     * won't notice. Modern browsers are highly optimized for DOM operations.
     * 
     * For larger lists, we'd use techniques like:
     * - Virtual scrolling (only render visible items)
     * - Virtual DOM diffing (like React does)
     * - Incremental rendering
     * 
     * But for a simple todo app, full re-render is the right choice because
     * it's simple, correct, and fast enough.
     * 
     * THE RENDER CYCLE:
     * 
     * 1. Clear existing DOM elements
     *    └─ Removes all todo items from the list
     * 
     * 2. Loop through state (this.todos array)
     *    └─ For each todo object...
     * 
     * 3. Create DOM element
     *    └─ Call createTodoElement(todo)
     *    └─ Returns a complete <li> with all children and event listeners
     * 
     * 4. Append to DOM
     *    └─ Add the <li> to the <ul>
     * 
     * 5. Update statistics
     *    └─ Recalculate and display total/completed counts
     * 
     * Result: UI perfectly reflects current state
     */
    render() {
        // Step 1: Clear the existing list
        // innerHTML = '' removes all child elements efficiently
        this.todoList.innerHTML = '';

        // Step 2-4: Create and append elements for each todo
        this.todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todoList.appendChild(todoElement);
        });

        // Step 5: Update the statistics display
        this.updateStats();
        
        /**
         * At this point, the UI is guaranteed to match the state.
         * If this.todos has 3 items, the DOM has 3 <li> elements.
         * If a todo is completed in state, it has the 'completed' class in DOM.
         * 
         * This guarantee makes debugging easy: if something looks wrong,
         * check the state. The render logic is simple enough that it's
         * unlikely to be the source of bugs.
         */
    }
}

/**
 * APPLICATION BOOTSTRAP
 * ============================================================================
 * 
 * Wait for the DOM to be fully loaded before initializing the app.
 * This ensures all HTML elements exist before we try to reference them.
 * 
 * The DOMContentLoaded event fires when the HTML is parsed and the DOM
 * tree is built, but before images and stylesheets finish loading.
 * This is the right time to initialize JavaScript apps.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create a new instance of our TodoApp
    const app = new TodoApp();
    
    // Initialize it (cache DOM refs, setup listeners, render)
    app.init();
    
    /**
     * At this point, the app is fully initialized and ready for user interaction.
     * The event loop will now handle user actions:
     * 
     * User clicks Add → handleAddTodo() → addTodo() → render() → UI updates
     * User clicks checkbox → toggleComplete() → render() → UI updates
     * User clicks Delete → deleteTodo() → render() → UI updates
     * 
     * This simple, predictable flow makes the app easy to understand,
     * maintain, and extend.
     */
});

// Made with Bob
