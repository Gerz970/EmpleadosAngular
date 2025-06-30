import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Empleado } from '../models/empleado';
import { EmpleadoService } from '../services/empleado.service';

@Component({
  selector: 'app-formulario',
  standalone: false,
  templateUrl: './formulario.html',
  styleUrl: './formulario.css'
})
export class Formulario implements OnInit, OnDestroy {
  empleadoForm: FormGroup;
  isEditing = false;
  private subscription: Subscription = new Subscription();

  departamentos = [
    'Desarrollo',
    'Recursos Humanos',
    'Marketing',
    'Ventas',
    'Finanzas',
    'Operaciones',
    'Soporte Técnico'
  ];

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService
  ) {
    this.empleadoForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      departamento: ['', Validators.required],
      salario: ['', [Validators.required, Validators.min(0)]],
      fechaContratacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Observar cambios en el empleado para editar
    this.subscription.add(
      this.empleadoService.getEmpleadoParaEditar().subscribe(empleado => {
        if (empleado) {
          this.cargarEmpleadoParaEditar(empleado);
        } else {
          this.resetForm();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cargarEmpleadoParaEditar(empleado: Empleado): void {
    this.isEditing = true;
    this.empleadoForm.patchValue({
      id: empleado.id,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      telefono: empleado.telefono,
      departamento: empleado.departamento,
      salario: empleado.salario,
      fechaContratacion: this.formatearFechaParaInput(empleado.fechaContratacion)
    });
  }

  onSubmit(): void {
    if (this.empleadoForm.valid) {
      const empleadoData = this.empleadoForm.value;
      
      // Convertir la fecha de string a Date
      empleadoData.fechaContratacion = new Date(empleadoData.fechaContratacion);

      if (this.isEditing) {
        this.empleadoService.actualizarEmpleado(empleadoData);
        this.isEditing = false;
      } else {
        this.empleadoService.agregarEmpleado(empleadoData);
      }

      this.resetForm();
      this.empleadoService.limpiarEmpleadoParaEditar();
    }
  }

  resetForm(): void {
    this.empleadoForm.reset();
    this.isEditing = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
    this.empleadoService.limpiarEmpleadoParaEditar();
  }

  formatearFechaParaInput(fecha: Date): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  getErrorMessage(controlName: string): string {
    const control = this.empleadoForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Ingrese un email válido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return 'Solo se permiten números';
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    return '';
  }
}
