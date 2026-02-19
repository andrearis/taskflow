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
        [value]="newTaskTitle"
        (input)="onInput($event)"
      />
      <button (click)="addTask()">Agregar</button>
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

  addTask() {
    if (!this.newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: this.newTaskTitle,
      completed: false,
    };

    this.tasks.update((tasks) => [...tasks, newTask]);

    this.newTaskTitle = '';
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.newTaskTitle = input.value;
  }
}

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.css'
// })
// export class App {
//   protected readonly title = signal('taskflow');
// }
