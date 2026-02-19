import { Component, computed, signal } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { Task } from './models/task.model';
import { TaskCard } from './features/task-card/task-card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskCard, FormsModule],
  template: `
    <h1>TaskFlow</h1>
    <section>
      <input
        type="text"
        placeholder="Nueva tarea..."
        [(ngModel)]="newTaskTitle"
        (keydown.enter)="createTask()"
      />
      <button (click)="createTask()" [disabled]="!newTaskTitle.trim()">Agregar</button>
    </section>

    <p>Tareas completadas: {{ completedCount() }} / {{ totalCount() }}</p>

    @for (task of tasks(); track task.id) {
      <app-task-card [task]="task" (toggle)="toggleTask($event)" />
    }
  `,
})
export class App {
  tasks = signal<Task[]>([
    { id: 1, title: 'Aprender Angular', completed: false },
    { id: 2, title: 'Entender Signals', completed: true },
  ]);
  toggleTask(id: number) {
    this.tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }
  completedCount = computed(() => this.tasks().filter((task) => task.completed).length);

  totalCount = computed(() => this.tasks().length);

  completedTasks = computed(() => this.tasks().filter((task) => task.completed));

  newTaskTitle = '';

  // checkDuplicates() {
  //   return this.tasks().some(
  //     (task) => task.title.trim().toLowerCase() === this.newTaskTitle.trim().toLowerCase(),
  //   );
  // }
  private taskExists(title: string): boolean {
    const normalized = title.trim().toLowerCase();
    return this.tasks().some((task) => task.title.trim().toLowerCase() === normalized);
  }

  createTask() {
    const title = this.newTaskTitle.trim();
    if (!title) return;
    if (this.taskExists(title)) return;
    // if (!this.newTaskTitle.trim()) return;
    // if (this.checkDuplicates()) return;
    const newTask: Task = {
      id: Date.now(),
      title: this.newTaskTitle,
      completed: false,
    };

    this.tasks.update((tasks) => [...tasks, newTask]);

    this.newTaskTitle = '';
  }

  // addTaskWhenEnter(event: KeyboardEvent) {
  //   if (event.key === 'Enter') {
  //     this.createTask();
  //   }
  // }
}
