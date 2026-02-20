import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

const STORAGE_KEY_TASKS = 'taskflow_tasks';
const STORAGE_KEY_FILTER = 'taskflow_filter';
export type Filter = 'all' | 'completed' | 'pending';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  loadTasksFromStorage(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  loadFilterFromStorage(): Filter {
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
  saveTasks(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }
  saveFilter(filter: Filter) {
    localStorage.setItem(STORAGE_KEY_FILTER, filter);
  }
}
