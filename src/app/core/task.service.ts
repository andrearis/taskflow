import { computed, effect, Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';

const STORAGE_KEY = 'taskflow_tasks';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Estado privado
  private readonly _tasks = signal<Task[]>(this.loadFromStorage());

  // Estado público (solo lectura)
  readonly tasks = this._tasks.asReadonly();

  readonly completedCount = computed(() => this._tasks().filter((task) => task.completed).length);

  readonly totalCount = computed(() => this._tasks().length);

  readonly completedTasks = computed(() => this._tasks().filter((task) => task.completed));

  constructor() {
    // Persistencia reactiva automática
    effect(() => {
      const tasks = this._tasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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

  toggleTask(id: number) {
    this._tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }

  private loadFromStorage(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private taskExists(title: string): boolean {
    const normalized = title.trim().toLowerCase();
    return this._tasks().some((task) => task.title.trim().toLowerCase() === normalized);
  }
}
