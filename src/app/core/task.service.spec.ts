import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

const taskMocked: Task = {
  id: 1,
  title: 'Task 1',
  completed: false,
};

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    // Limpieza total antes de cada test
    vi.restoreAllMocks();
    localStorage.clear();

    // Configuramos el módulo (solo una vez por test)
    TestBed.configureTestingModule({
      providers: [TaskService],
    });

    // Espiamos el prototipo de Storage para capturar llamadas de setItem/getItem
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
  });

  // Función auxiliar para inicializar el servicio después de configurar los mocks de localStorage
  const setupService = () => {
    service = TestBed.inject(TaskService);
  };

  it('debe iniciar con array vacío si no hay datos en localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setupService();
    expect(service.tasks()).toEqual([]);
  });

  it('debe cargar tareas desde localStorage al instanciarse', () => {
    // IMPORTANTE: El mock debe estar ANTES de inyectar el servicio
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'taskflow_tasks') return JSON.stringify([taskMocked, { ...taskMocked, id: 2 }]);
      return null;
    });

    setupService();
    expect(service.tasks().length).toBe(2);
    expect(service.tasks()[0].title).toBe('Task 1');
  });

  it('debe manejar JSON corrupto en localStorage devolviendo un array vacío', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('esto-no-es-json');
    setupService();

    expect(service.tasks()).toEqual([]);
  });

  describe('addTask()', () => {
    beforeEach(() => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      setupService();
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
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setupService();

      // 2. Ejecutamos la acción
      const nuevaTarea = 'Aprender Angular Signals';
      service.addTask(nuevaTarea);

      // 3. Forzamos la ejecución de efectos (necesario en tests de Angular 17+)
      TestBed.tick();

      // 4. Verificamos que localStorage.setItem fue llamado con los datos correctos
      expect(setItemSpy).toHaveBeenCalledWith(
        'taskflow_tasks',
        expect.stringContaining(nuevaTarea),
      );
    });
  });
  describe('toggleTask()', () => {
    beforeEach(() => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'taskflow_tasks') return JSON.stringify([taskMocked, { ...taskMocked, id: 2 }]);
        return null;
      });
      setupService();
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
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'taskflow_tasks') return JSON.stringify([taskMocked, { ...taskMocked, id: 2 }]);
        return null;
      });
      setupService();
    });
    it('Elimina tarea y actualiza total', () => {
      expect(service.totalCount()).toBe(2);
      service.removeTask(1);
      expect(service.totalCount()).toBe(1);
    });
  });

  describe('clearCompleted()', () => {
    beforeEach(() => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'taskflow_tasks') return JSON.stringify([taskMocked, { ...taskMocked, id: 2 }]);
        return null;
      });
      setupService();
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
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'taskflow_tasks')
          return JSON.stringify([taskMocked, { ...taskMocked, id: 2, completed: true }]);
        return null;
      });
      setupService();
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
