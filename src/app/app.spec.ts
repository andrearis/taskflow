import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from './core/task.service';
import { By } from '@angular/platform-browser';
import { TaskCard } from './features/task-card/task-card';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let mockTaskService: any;

  beforeEach(async () => {
    // 1. Creamos un Mock del servicio con Signals
    mockTaskService = {
      tasks: signal([]),
      filter: signal('all'),
      totalCount: signal(0),
      completedCount: signal(0),
      filteredTasks: signal([]),
      addTask: vi.fn(),
      removeTask: vi.fn(),
      toggleTask: vi.fn(),
      setFilter: vi.fn(),
      clearCompleted: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App, FormsModule],
      providers: [{ provide: TaskService, useValue: mockTaskService }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('TaskFlow');
  });
  describe('Interacciones de Tareas', () => {
    it('debe llamar a addTask y limpiar el input al crear una tarea', () => {
      // Setup
      component.newTaskTitle = 'Nueva Tarea';
      const button = fixture.debugElement.query(
        By.css('[data-testid="create-task-btn"]'),
      ).nativeElement;

      fixture.detectChanges();
      // Act
      button.click();

      // Assert
      expect(mockTaskService.addTask).toHaveBeenCalledWith('Nueva Tarea');
      expect(component.newTaskTitle).toBe('');
    });
    it('el botón agregar debe estar deshabilitado si el input está vacío', () => {
      component.newTaskTitle = '   ';
      fixture.detectChanges();

      const button = fixture.debugElement.query(
        By.css('[data-testid="create-task-btn"]'),
      ).nativeElement;
      expect(button.disabled).toBe(true);
    });
  });
  describe('Renderizado de Lista', () => {
    it('debe mostrar el contador de tareas correctamente', () => {
      // Simulamos que el servicio tiene datos usando los signals del mock
      mockTaskService.totalCount.set(5);
      mockTaskService.completedCount.set(2);
      fixture.detectChanges();

      const p = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(p.textContent).toContain('Tareas completadas: 2 / 5');
    });
    it('debe renderizar tantas <app-task-card> como tareas filtradas haya', () => {
      mockTaskService.filteredTasks.set([
        { id: 1, title: 'T1', completed: false },
        { id: 2, title: 'T2', completed: true },
      ]);
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('app-task-card'));
      expect(cards.length).toBe(2);
    });
  });
  describe('Filtros', () => {
    it('debe llamar a setFilter cuando se pulsan los botones de filtro', () => {
      const filterPendingBtn = fixture.debugElement.query(
        By.css('[data-testid="show-pending-task-btn"]'),
      ).nativeElement;

      filterPendingBtn.click();

      expect(mockTaskService.setFilter).toHaveBeenCalledWith('pending');
    });
    it('debe llamar a clearCompleted al pulsar el botón correspondiente', () => {
      // Habilitamos el botón simulando que hay completadas
      mockTaskService.completedCount.set(1);
      fixture.detectChanges();

      const clearBtn = fixture.debugElement.query(
        By.css('[data-testid="clear-completed-task-btn"]'),
      ).nativeElement;

      clearBtn.click();

      expect(mockTaskService.clearCompleted).toHaveBeenCalled();
    });
  });
  describe('Eventos desde app-task-card', () => {
    beforeEach(() => {
      mockTaskService.filteredTasks.set([
        { id: 1, title: 'T1', completed: false },
        { id: 2, title: 'T2', completed: true },
      ]);
      fixture.detectChanges();
    });

    it('toggle task', () => {
      const taskCards = fixture.debugElement.queryAll(By.directive(TaskCard));
      taskCards[0].componentInstance.toggle.emit(1);
      fixture.detectChanges();

      expect(mockTaskService.toggleTask).toHaveBeenCalledWith(1);
    });
    it('remove task', () => {
      const taskCards = fixture.debugElement.queryAll(By.directive(TaskCard));
      taskCards[0].componentInstance.remove.emit(1);
      fixture.detectChanges();

      expect(mockTaskService.removeTask).toHaveBeenCalledWith(1);
    });
  });
});
