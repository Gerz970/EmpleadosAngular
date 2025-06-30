import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Empleado } from '../models/empleado';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private empleados: Empleado[] = [];
  private readonly STORAGE_KEY = 'empleados_data';

  private empleadosSubject = new BehaviorSubject<Empleado[]>(this.empleados);
  private empleadoParaEditarSubject = new BehaviorSubject<Empleado | null>(null);

  constructor() {
    this.cargarEmpleadosDelStorage();
  }

  private cargarEmpleadosDelStorage(): void {
    try {
      const datosGuardados = localStorage.getItem(this.STORAGE_KEY);
      if (datosGuardados) {
        this.empleados = JSON.parse(datosGuardados).map((empleado: any) => ({
          ...empleado,
          fechaContratacion: new Date(empleado.fechaContratacion)
        }));
      } else {
        // Datos por defecto si no hay nada en localStorage
        this.empleados = [
          {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@empresa.com',
            telefono: '5550101',
            departamento: 'Desarrollo',
            salario: 45000,
            fechaContratacion: new Date('2023-01-15')
          },
          {
            id: 2,
            nombre: 'María',
            apellido: 'García',
            email: 'maria.garcia@empresa.com',
            telefono: '5550102',
            departamento: 'Recursos Humanos',
            salario: 38000,
            fechaContratacion: new Date('2023-03-20')
          }
        ];
        this.guardarEmpleadosEnStorage();
      }
      this.empleadosSubject.next([...this.empleados]);
    } catch (error) {
      console.error('Error al cargar empleados del localStorage:', error);
      // Si hay error, usar datos por defecto
      this.empleados = [];
      this.empleadosSubject.next([...this.empleados]);
    }
  }

  private guardarEmpleadosEnStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.empleados));
    } catch (error) {
      console.error('Error al guardar empleados en localStorage:', error);
    }
  }

  getEmpleados(): Observable<Empleado[]> {
    return this.empleadosSubject.asObservable();
  }

  getEmpleadoParaEditar(): Observable<Empleado | null> {
    return this.empleadoParaEditarSubject.asObservable();
  }

  agregarEmpleado(empleado: Empleado): void {
    empleado.id = this.empleados.length > 0 ? Math.max(...this.empleados.map(e => e.id!)) + 1 : 1;
    this.empleados.push(empleado);
    this.empleadosSubject.next([...this.empleados]);
    this.guardarEmpleadosEnStorage();
  }

  actualizarEmpleado(empleado: Empleado): void {
    const index = this.empleados.findIndex(e => e.id === empleado.id);
    if (index !== -1) {
      this.empleados[index] = empleado;
      this.empleadosSubject.next([...this.empleados]);
      this.guardarEmpleadosEnStorage();
    }
  }

  eliminarEmpleado(id: number): void {
    this.empleados = this.empleados.filter(e => e.id !== id);
    this.empleadosSubject.next([...this.empleados]);
    this.guardarEmpleadosEnStorage();
  }

  obtenerEmpleadoPorId(id: number): Empleado | undefined {
    return this.empleados.find(e => e.id === id);
  }

  setEmpleadoParaEditar(empleado: Empleado | null): void {
    this.empleadoParaEditarSubject.next(empleado);
  }

  limpiarEmpleadoParaEditar(): void {
    this.empleadoParaEditarSubject.next(null);
  }

  // Getter para compatibilidad
  get empleadoParaEditar(): Empleado | null {
    return this.empleadoParaEditarSubject.value;
  }

  // Setter para compatibilidad
  set empleadoParaEditar(empleado: Empleado | null) {
    this.setEmpleadoParaEditar(empleado);
  }

  // Método para limpiar todos los datos (útil para testing)
  limpiarTodosLosDatos(): void {
    this.empleados = [];
    this.empleadosSubject.next([...this.empleados]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
} 