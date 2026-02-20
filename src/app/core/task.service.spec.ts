import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';
import { Filter, StorageService } from './storage.service';
import { Mocked } from 'vitest';

const taskMocked: Task = {
  id: 1,
  title: 'Task 1',
  completed: false,
};

describe('TaskService', () => {
  let service: TaskService;
  let mockStorageService: Mocked<StorageService>;

  beforeEach(() => {
    // Limpieza total antes de cada test
    vi.restoreAllMocks();

    mockStorageService = {
      loadTasksFromStorage: vi.fn(),
      loadFilterFromStorage: vi.fn(),
      saveTasks: vi.fn(),
      saveFilter: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [TaskService, { provide: StorageService, useValue: mockStorageService }],
    });
  });

  // Función auxiliar para inicializar el servicio y los mocks
  const setup = ({
    tasks = [],
    filter = 'all',
  }: {
    tasks?: Task[];
    filter?: Filter;
  } = {}) => {
    mockStorageService.loadTasksFromStorage.mockReturnValue(tasks);
    mockStorageService.loadFilterFromStorage.mockReturnValue(filter);

    service = TestBed.inject(TaskService);
  };

  describe('addTask()', () => {
    beforeEach(() => {
      setup();
    });
    it('Añadir tarea ok', () => {
      const title = 'Nueva tarea';
      service.addTask(title);
      expect(service.tasks().length).toBe(1);
      expect(service.tasks()[0].title).toBe(title);
      expect(service.totalCount()).toBe(1);
    });
    it('No añade tarea si titulo vacio', () => {
      service.addTask('');
      expect(service.tasks().length).toBe(0);
      expect(service.totalCount()).toBe(0);
    });
    it('No añade tarea duplicada', () => {
      const title = 'Nueva tarea';
      service.addTask(title);
      service.addTask(title);
      expect(service.tasks().length).toBe(1);
    });
    it('debe persistir en localStorage automáticamente cuando se añade una tarea', () => {
      // 1. Configuramos el espía antes de crear el servicio
      setup();

      // 2. Ejecutamos la acción
      const nuevaTarea = 'Aprender Angular Signals';
      service.addTask(nuevaTarea);

      // 3. Forzamos la ejecución de efectos (necesario en tests de Angular 17+)
      TestBed.tick();

      // 4. Verificamos que se llama a la persistencia de datos
      expect(mockStorageService.saveTasks).toHaveBeenCalled();
    });
  });
  describe('toggleTask()', () => {
    beforeEach(() => {
      setup({ tasks: [taskMocked, { ...taskMocked, id: 2 }] });
    });
    it('cambia el estado', () => {
      service.toggleTask(1);
      expect(service.tasks()[0].completed).toBeTruthy();
      expect(service.completedCount()).toBe(1);
      service.toggleTask(1);
      expect(service.tasks()[0].completed).toBeFalsy();
      expect(service.completedCount()).toBe(0);
    });
  });
  describe('removeTask()', () => {
    beforeEach(() => {
      setup({ tasks: [taskMocked, { ...taskMocked, id: 2 }] });
    });
    it('Elimina tarea y actualiza total', () => {
      expect(service.totalCount()).toBe(2);
      service.removeTask(1);
      expect(service.totalCount()).toBe(1);
    });
  });

  describe('clearCompleted()', () => {
    beforeEach(() => {
      setup({ tasks: [taskMocked, { ...taskMocked, id: 2 }] });
    });
    it('Al estar todas en pending, no hace nada', () => {
      expect(service.totalCount()).toBe(2);
      service.clearCompleted();
      expect(service.totalCount()).toBe(2);
    });
    it('Elimina las completadas', () => {
      expect(service.totalCount()).toBe(2);
      service.toggleTask(1);
      service.clearCompleted();
      expect(service.totalCount()).toBe(1);
    });
  });

  describe('filteredTasks()', () => {
    beforeEach(() => {
      setup({ tasks: [taskMocked, { ...taskMocked, id: 2, completed: true }] });
    });
    it('Devuelve todas cuando filtro = all', () => {
      service.setFilter('all');
      expect(service.filteredTasks().length).toBe(2);
    });
    it('Devuelve todas cuando filtro = completed', () => {
      service.setFilter('completed');
      expect(service.filteredTasks().length).toBe(1);
    });
    it('Devuelve todas cuando filtro = pending', () => {
      service.setFilter('pending');
      expect(service.filteredTasks().length).toBe(1);
    });
  });
});
