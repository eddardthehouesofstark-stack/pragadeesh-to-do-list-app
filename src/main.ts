/**
 * Vanilla JavaScript / TypeScript State-Driven To-Do List Application
 * Features:
 * - Unidirectional state management (state -> save -> render)
 * - Single source of truth in memory (tasks array + currentFilter)
 * - Automatic localStorage persistence & hydration
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Event delegation on parent container
 * - Dynamic DOM rendering, filtering, search, inline editing
 */

// ==========================================
// 1. DATA TYPES & INTERFACES
// ==========================================
export type FilterType = 'all' | 'active' | 'completed';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// ==========================================
// 2. CONSTANTS & INITIAL STATE
// ==========================================
const TASKS_STORAGE_KEY = 'todo_app_tasks_v1';
const FILTER_STORAGE_KEY = 'todo_app_filter_v1';

const DEFAULT_SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-1',
    text: 'Master JavaScript DOM manipulation & event delegation',
    completed: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sample-2',
    text: 'Implement localStorage automatic data persistence',
    completed: true,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'sample-3',
    text: 'Double-click or click ✏️ to edit task inline',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// Single in-memory source of truth
let tasks: Task[] = loadTasksFromStorage();
let currentFilter: FilterType = loadFilterFromStorage();
let editingTaskId: string | null = null;
let searchQuery: string = '';

// ==========================================
// 3. STORAGE PERSISTENCE LAYER
// ==========================================
function loadTasksFromStorage(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load tasks from localStorage:', err);
  }
  return DEFAULT_SAMPLE_TASKS;
}

function loadFilterFromStorage(): FilterType {
  try {
    const filter = localStorage.getItem(FILTER_STORAGE_KEY);
    if (filter === 'all' || filter === 'active' || filter === 'completed') {
      return filter;
    }
  } catch (err) {
    console.error('Failed to load filter from localStorage:', err);
  }
  return 'all';
}

function saveToStorage(): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(FILTER_STORAGE_KEY, currentFilter);
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// ==========================================
// 4. DOM ELEMENT REFERENCES
// ==========================================
const todoForm = document.getElementById('todo-form') as HTMLFormElement;
const todoInput = document.getElementById('todo-input') as HTMLInputElement;
const todoList = document.getElementById('todo-list') as HTMLUListElement;
const filterTabs = document.getElementById('filter-tabs') as HTMLElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

const emptyState = document.getElementById('empty-state') as HTMLDivElement;
const emptyStateTitle = document.getElementById('empty-state-title') as HTMLParagraphElement;
const emptyStateDesc = document.getElementById('empty-state-desc') as HTMLParagraphElement;

const itemsLeft = document.getElementById('items-left') as HTMLSpanElement;
const toggleAllBtn = document.getElementById('toggle-all-btn') as HTMLButtonElement;
const clearCompletedBtn = document.getElementById('clear-completed-btn') as HTMLButtonElement;
const clearCompletedLabel = document.getElementById('clear-completed-label') as HTMLSpanElement;

const countAll = document.getElementById('count-all') as HTMLSpanElement;
const countActive = document.getElementById('count-active') as HTMLSpanElement;
const countCompleted = document.getElementById('count-completed') as HTMLSpanElement;

const progressContainer = document.getElementById('progress-container') as HTMLDivElement;
const progressFill = document.getElementById('progress-fill') as HTMLDivElement;
const progressText = document.getElementById('progress-text') as HTMLSpanElement;

// ==========================================
// 5. HELPER UTILITIES
// ==========================================
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'task-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

// ==========================================
// 6. STATE MUTATIONS (CRUD OPERATIONS)
// Architecture: State Mutation -> saveToStorage() -> render()
// ==========================================

/** CREATE: Add new task */
function addTask(text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask: Task = {
    id: generateId(),
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  saveAndRender();
}

/** UPDATE: Toggle task completion */
function toggleTask(id: string): void {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveAndRender();
}

/** UPDATE: Inline edit task text */
function updateTaskText(id: string, newText: string): void {
  const trimmed = newText.trim();
  if (!trimmed) {
    // If the text was cleared during inline edit, remove the task
    deleteTask(id);
    return;
  }

  tasks = tasks.map((t) =>
    t.id === id ? { ...t, text: trimmed } : t
  );
  editingTaskId = null;
  saveAndRender();
}

/** Set inline editing state */
function startEditing(id: string): void {
  editingTaskId = id;
  render();
}

/** Cancel inline editing state */
function cancelEditing(): void {
  editingTaskId = null;
  render();
}

/** DELETE: Remove a task */
function deleteTask(id: string): void {
  tasks = tasks.filter((t) => t.id !== id);
  if (editingTaskId === id) {
    editingTaskId = null;
  }
  saveAndRender();
}

/** UPDATE: Clear all completed tasks */
function clearCompleted(): void {
  tasks = tasks.filter((t) => !t.completed);
  saveAndRender();
}

/** UPDATE: Toggle all tasks completion status */
function toggleAll(): void {
  const hasActive = tasks.some((t) => !t.completed);
  tasks = tasks.map((t) => ({ ...t, completed: hasActive }));
  saveAndRender();
}

/** FILTER: Update active filter */
function setFilter(filter: FilterType): void {
  currentFilter = filter;
  saveToStorage();
  render();
}

/** SEARCH: Update search query */
function setSearch(query: string): void {
  searchQuery = query;
  render();
}

/** Helper cycle: save state then render UI */
function saveAndRender(): void {
  saveToStorage();
  render();
}

// ==========================================
// 7. RENDERING ENGINE
// ==========================================
function getFilteredTasks(): Task[] {
  return tasks.filter((task) => {
    // Status filter
    const matchesFilter =
      currentFilter === 'all'
        ? true
        : currentFilter === 'active'
        ? !task.completed
        : task.completed;

    // Search filter
    const matchesSearch = searchQuery
      ? task.text.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : true;

    return matchesFilter && matchesSearch;
  });
}

function render(): void {
  const filteredTasks = getFilteredTasks();
  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // 1. Update Filter Tab Active States & Counts
  if (countAll) countAll.textContent = String(totalCount);
  if (countActive) countActive.textContent = String(activeCount);
  if (countCompleted) countCompleted.textContent = String(completedCount);

  document.querySelectorAll<HTMLButtonElement>('.filter-tab').forEach((tab) => {
    const tabFilter = tab.getAttribute('data-filter') as FilterType;
    const isActive = tabFilter === currentFilter;
    if (isActive) {
      tab.className =
        'filter-tab flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold bg-slate-800 text-slate-100 shadow-sm cursor-pointer';
      const badge = tab.querySelector('span:last-child');
      if (badge) {
        badge.className = 'text-[11px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-200';
      }
    } else {
      tab.className =
        'filter-tab flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 cursor-pointer';
      const badge = tab.querySelector('span:last-child');
      if (badge) {
        badge.className = 'text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400';
      }
    }
  });

  // 2. Update Counter and Batch Action Buttons
  if (itemsLeft) {
    itemsLeft.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
  }

  if (toggleAllBtn) {
    if (totalCount > 0) {
      toggleAllBtn.classList.remove('hidden');
      toggleAllBtn.textContent = activeCount === 0 ? 'Uncheck all' : 'Check all';
    } else {
      toggleAllBtn.classList.add('hidden');
    }
  }

  if (clearCompletedBtn) {
    if (completedCount > 0) {
      clearCompletedBtn.classList.remove('hidden');
      if (clearCompletedLabel) {
        clearCompletedLabel.textContent = `Clear completed (${completedCount})`;
      }
    } else {
      clearCompletedBtn.classList.add('hidden');
    }
  }

  // 3. Update Progress Bar
  if (progressContainer && progressFill && progressText) {
    if (totalCount > 0) {
      progressContainer.classList.remove('hidden');
      progressContainer.classList.add('flex');
      const pct = Math.round((completedCount / totalCount) * 100);
      progressFill.style.width = `${pct}%`;
      progressText.textContent = `${pct}%`;
    } else {
      progressContainer.classList.add('hidden');
      progressContainer.classList.remove('flex');
    }
  }

  // 4. Render Task List or Empty State
  if (filteredTasks.length === 0) {
    todoList.innerHTML = '';
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');

    if (searchQuery) {
      emptyStateTitle.textContent = 'No matching tasks';
      emptyStateDesc.textContent = `No tasks matching "${searchQuery}". Try a different keyword.`;
    } else if (currentFilter === 'active') {
      emptyStateTitle.textContent = 'No active tasks';
      emptyStateDesc.textContent = 'All your tasks are completed! Enjoy your day.';
    } else if (currentFilter === 'completed') {
      emptyStateTitle.textContent = 'No completed tasks';
      emptyStateDesc.textContent = 'Check off tasks as you finish them to see them here.';
    } else {
      emptyStateTitle.textContent = 'Your task list is empty';
      emptyStateDesc.textContent = 'Type a task in the box above and press Enter to get started.';
    }
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');

  // Build task <li> elements dynamically
  todoList.innerHTML = filteredTasks
    .map((task) => {
      const isEditing = editingTaskId === task.id;

      return `
      <li
        id="todo-item-${task.id}"
        data-id="${task.id}"
        class="group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all ${
          task.completed
            ? 'bg-slate-900/40 border-slate-800/50 text-slate-500'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200 shadow-sm'
        }"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- Toggle Checkbox Button -->
          <button
            type="button"
            data-action="toggle"
            aria-label="${task.completed ? 'Mark active' : 'Mark completed'}"
            class="flex items-center justify-center w-5 h-5 rounded-md border transition-all cursor-pointer flex-shrink-0 ${
              task.completed
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'border-slate-700 hover:border-indigo-500 bg-slate-800/60'
            }"
          >
            ${
              task.completed
                ? `<svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                : ''
            }
          </button>

          <!-- Text content or Inline Edit Input -->
          ${
            isEditing
              ? `
            <div class="flex-1 flex items-center gap-1.5 min-w-0">
              <input
                type="text"
                data-action="edit-input"
                class="edit-input w-full bg-slate-950 text-slate-100 text-sm md:text-base px-2.5 py-1 rounded border border-indigo-500 outline-none shadow-sm"
                value="${escapeHTML(task.text)}"
              />
              <button
                type="button"
                data-action="save-edit"
                class="p-1.5 rounded text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300 transition-colors cursor-pointer"
                title="Save (Enter)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <button
                type="button"
                data-action="cancel-edit"
                class="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Cancel (Esc)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            `
              : `
            <span
              data-action="start-edit"
              class="todo-text flex-1 text-sm md:text-base break-words cursor-pointer select-none transition-all ${
                task.completed ? 'line-through text-slate-500' : 'text-slate-200'
              }"
              title="Double-click to edit"
            >
              ${escapeHTML(task.text)}
            </span>
            `
          }
        </div>

        <!-- Action Buttons (Edit / Delete) -->
        ${
          !isEditing
            ? `
        <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            data-action="start-edit"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit task"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button
            type="button"
            data-action="delete"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Delete task"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        `
            : ''
        }
      </li>
    `;
    })
    .join('');

  // Auto-focus and place caret at end if in editing mode
  if (editingTaskId) {
    const editInput = todoList.querySelector<HTMLInputElement>('input.edit-input');
    if (editInput) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }
}

// ==========================================
// 8. EVENT LISTENERS (EVENT DELEGATION ARCHITECTURE)
// ==========================================

// Form Submission: Create new task
todoForm.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
});

// Delegated Clicks on Todo List Container
todoList.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const actionElement = target.closest<HTMLElement>('[data-action]');
  const todoItem = target.closest<HTMLLIElement>('li[data-id]');
  if (!todoItem) return;

  const id = todoItem.getAttribute('data-id');
  if (!id) return;

  const action = actionElement ? actionElement.getAttribute('data-action') : null;

  if (action === 'toggle') {
    toggleTask(id);
  } else if (action === 'delete') {
    deleteTask(id);
  } else if (action === 'start-edit') {
    startEditing(id);
  } else if (action === 'save-edit') {
    const editField = todoItem.querySelector<HTMLInputElement>('input.edit-input');
    if (editField) {
      updateTaskText(id, editField.value);
    }
  } else if (action === 'cancel-edit') {
    cancelEditing();
  }
});

// Double click to trigger inline editing
todoList.addEventListener('dblclick', (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const todoText = target.closest('.todo-text');
  if (todoText) {
    const todoItem = target.closest<HTMLLIElement>('li[data-id]');
    if (todoItem) {
      const id = todoItem.getAttribute('data-id');
      if (id) startEditing(id);
    }
  }
});

// Keyboard handling on inline edit inputs (Enter to save, Escape to cancel)
todoList.addEventListener('keydown', (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target || !target.classList.contains('edit-input')) return;

  const todoItem = target.closest<HTMLLIElement>('li[data-id]');
  if (!todoItem) return;

  const id = todoItem.getAttribute('data-id');
  if (!id) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    const input = target as HTMLInputElement;
    updateTaskText(id, input.value);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelEditing();
  }
});

// Delegated Filter Button Clicks
filterTabs.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const tab = target.closest<HTMLButtonElement>('.filter-tab');
  if (tab) {
    const filter = tab.getAttribute('data-filter') as FilterType | null;
    if (filter) {
      setFilter(filter);
    }
  }
});

// Search input handling
searchInput.addEventListener('input', (e: Event) => {
  const target = e.target as HTMLInputElement;
  setSearch(target.value);
});

// Clear completed button click
clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

// Toggle all button click
toggleAllBtn.addEventListener('click', () => {
  toggleAll();
});

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e: KeyboardEvent) => {
  // Press '/' to focus task input (when not already in an input)
  if (
    e.key === '/' &&
    document.activeElement?.tagName !== 'INPUT' &&
    document.activeElement?.tagName !== 'TEXTAREA'
  ) {
    e.preventDefault();
    todoInput.focus();
  } else if (e.key === 'Escape') {
    // If editing, cancel editing; else if searching, clear search
    if (editingTaskId) {
      cancelEditing();
    } else if (document.activeElement === searchInput && searchInput.value) {
      searchInput.value = '';
      setSearch('');
    }
  }
});

// ==========================================
// 9. INITIALIZATION
// ==========================================
render();
