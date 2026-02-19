import { Component, computed, signal } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { Task } from './models/task.model';
import { FormsModule } from '@angular/forms';
import { TaskService } from './core/task.service';
import { TaskCard } from './features/task-card/task-card';

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
    <section>
      <button (click)="taskService.setFilter('all')" [disabled]="taskService.filter() === 'all'">
        All tasks
      </button>
      <button
        (click)="taskService.setFilter('pending')"
        [disabled]="taskService.filter() === 'pending'"
      >
        Pending tasks
      </button>
      <button
        (click)="taskService.setFilter('completed')"
        [disabled]="taskService.filter() === 'completed'"
      >
        Completed tasks
      </button>
    </section>
    <section>
      <button
        (click)="taskService.clearCompleted()"
        [disabled]="taskService.completedCount() === 0"
      >
        Clear completed tasks
      </button>
    </section>

    <p>Tareas completadas: {{ taskService.completedCount() }} / {{ taskService.totalCount() }}</p>

    @for (task of taskService.filteredTasks(); track task.id) {
      <app-task-card
        [task]="task"
        (toggle)="taskService.toggleTask($event)"
        (remove)="taskService.removeTask($event)"
      />
    }
  `,
})
export class App {
  newTaskTitle = '';

  constructor(public taskService: TaskService) {}

  createTask() {
    this.taskService.addTask(this.newTaskTitle);
    this.newTaskTitle = '';
  }
}
