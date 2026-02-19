import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  @Input() task!: Task;

  @Output() toggle = new EventEmitter<number>();

  onToggle() {
    this.toggle.emit(this.task.id);
  }
}
