import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../models/task.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-card',
  imports: [FormsModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  @Input({ required: true }) task!: Task;
  @Input() errorMessage: string | null = null;

  @Output() toggle = new EventEmitter<number>();

  onToggle() {
    this.toggle.emit(this.task.id);
  }

  @Output() remove = new EventEmitter<number>();

  onRemove() {
    this.remove.emit(this.task.id);
  }

  isEdditing = false;
  newTitle = '';

  startEditing() {
    this.isEdditing = true;
    this.newTitle = this.task.title;
  }

  @Output() update = new EventEmitter<{ id: number; title: string }>();

  onUpdate() {
    this.update.emit({ id: this.task.id, title: this.newTitle });
    this.isEdditing = false;
  }

  cancelUpdate() {
    this.isEdditing = false;
    this.newTitle = '';
  }
}
