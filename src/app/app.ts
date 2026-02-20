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
      <button
        data-testid="create-task-btn"
        (click)="createTask()"
        [disabled]="!newTaskTitle.trim()"
      >
        Agregar
      </button>
    </section>
    <section>
      <button
        data-testid="show-all-task-btn"
        (click)="taskService.setFilter('all')"
        [disabled]="taskService.filter() === 'all'"
      >
        All tasks
      </button>
      <button
        data-testid="show-pending-task-btn"
        (click)="taskService.setFilter('pending')"
        [disabled]="taskService.filter() === 'pending'"
      >
        Pending tasks
      </button>
      <button
        data-testid="show-completed-task-btn"
        (click)="taskService.setFilter('completed')"
        [disabled]="taskService.filter() === 'completed'"
      >
        Completed tasks
      </button>
    </section>
    <section>
      <button
        data-testid="clear-completed-task-btn"
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
        (update)="updateTask($event)"
        [errorMessage]="editErrors[task.id] ?? null"
      />
    }
  `,
})
export class App {
  newTaskTitle = '';
  editErrors: Record<number, string | null> = {};

  constructor(public taskService: TaskService) {}

  createTask() {
    this.taskService.addTask(this.newTaskTitle);
    this.newTaskTitle = '';
  }
  updateTask(event: { id: number; title: string }) {
    const result = this.taskService.updateTaskTitle(event.id, event.title);
    if (!result.success) {
      this.editErrors[event.id] = result.error ?? 'Error';
    } else {
      this.editErrors[event.id] = null;
    }
  }
}
