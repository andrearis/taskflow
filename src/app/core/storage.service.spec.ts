import { TestBed } from '@angular/core/testing';

import { Filter, StorageService } from './storage.service';
import { Task } from '../models/task.model';

describe('Storage', () => {
  //let service: StorageService;
  const taskMocked: Task = {
    id: 1,
    title: 'Task 1',
    completed: false,
  };

  const tasksMocked: Task[] = [taskMocked, { ...taskMocked, id: 2 }];

  beforeEach(() => {
    // Limpieza total antes de cada test
    vi.restoreAllMocks();

    localStorage.clear();

    // TestBed.configureTestingModule({
    //   providers: [StorageService],
    // });
    //Espiamos el prototipo de Storage para capturar llamadas de setItem/getItem
    // vi.spyOn(Storage.prototype, 'setItem');
    // vi.spyOn(Storage.prototype, 'getItem');
  });
  // const setupService = () => {
  //   service = TestBed.inject(StorageService);
  // };
  it('should be created', () => {
    const service = new StorageService();
    expect(service).toBeTruthy();
  });

  it('debe iniciar con tasks=[] si no hay datos en localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    const service = new StorageService();
    const result = service.loadTasksFromStorage();
    expect(result).toEqual([]);
  });
  it('debe iniciar con filters=all si no hay datos en localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    const service = new StorageService();
    const result = service.loadFilterFromStorage();
    expect(result).toEqual('all');
  });
  it('debe cargar tareas desde localStorage si hay datos', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'taskflow_tasks') return JSON.stringify(tasksMocked);
      return null;
    });
    const service = new StorageService();
    const result = service.loadTasksFromStorage();
    expect(result).toEqual(tasksMocked);
  });
  it('debe cargar filter desde localStorage si hay datos', () => {
    const filter: Filter = 'completed';
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'taskflow_filter') return filter;
      return null;
    });
    const service = new StorageService();
    const result = service.loadFilterFromStorage();
    expect(result).toEqual(filter);
  });

  it('debe manejar JSON corrupto en localStorage devolviendo un array vacío', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('esto-no-es-json');
    const service = new StorageService();

    const result = service.loadTasksFromStorage();
    expect(result).toEqual([]);
  });
  it('debe guardar tareas en localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const task: Task = {
      id: 1,
      title: 'Task 1',
      completed: false,
    };

    const service = new StorageService();
    service.saveTasks([task]);

    expect(setItemSpy).toHaveBeenCalledWith('taskflow_tasks', JSON.stringify([task]));
  });
  it('debe guardar filtro en localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const filter: Filter = 'completed';

    const service = new StorageService();
    service.saveFilter(filter);

    expect(setItemSpy).toHaveBeenCalledWith('taskflow_filter', filter);
  });
});
