import { computed, effect, Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';

const STORAGE_KEY_TASKS = 'taskflow_tasks';
const STORAGE_KEY_FILTER = 'taskflow_filter';
type Filter = 'all' | 'completed' | 'pending';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Estado privado
  private readonly _tasks = signal<Task[]>(this.loadTasksFromStorage());
  private _filter = signal<Filter>(this.loadFilterFromStorage());

  // Estado público (solo lectura) -> exponemos el valor
  readonly tasks = this._tasks.asReadonly();
  readonly filter = this._filter.asReadonly();

  readonly completedCount = computed(() => this._tasks().filter((task) => task.completed).length);

  readonly totalCount = computed(() => this._tasks().length);

  readonly filteredTasks = computed(() => {
    const filter = this._filter();
    const tasks = this._tasks();

    if (filter === 'all') return tasks;
    if (filter === 'completed') return tasks.filter((task) => task.completed);

    return tasks.filter((task) => !task.completed);
  });

  constructor() {
    // Persistencia reactiva automática
    effect(() => {
      const tasks = this._tasks();
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    });
    // Persistencia reactiva automática
    effect(() => {
      const filter = this._filter();
      localStorage.setItem(STORAGE_KEY_FILTER, filter);
    });
  }

  addTask(title: string) {
    const normalized = title.trim();
    if (!normalized) return;
    if (this.taskExists(normalized)) return;

    const newTask: Task = {
      id: Date.now(),
      title: normalized,
      completed: false,
    };

    this._tasks.update((tasks) => [...tasks, newTask]);
  }

  removeTask(id: number) {
    this._tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }

  toggleTask(id: number) {
    this._tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }

  setFilter(filter: Filter) {
    this._filter.update(() => filter);
  }
  clearCompleted() {
    this._tasks.update((tasks) => tasks.filter((task) => !task.completed));
  }

  private loadTasksFromStorage(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private loadFilterFromStorage(): Filter {
    try {
      const value = localStorage.getItem(STORAGE_KEY_FILTER);
      if (value === 'all' || value === 'completed' || value === 'pending') {
        return value;
      }
      return 'all';
    } catch {
      return 'all';
    }
  }

  private taskExists(title: string): boolean {
    const normalized = title.trim().toLowerCase();
    return this._tasks().some((task) => task.title.trim().toLowerCase() === normalized);
  }
}
