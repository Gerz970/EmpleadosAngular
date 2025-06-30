import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Empleado } from '../models/empleado';
import { EmpleadoService } from '../services/empleado.service';

@Component({
  selector: 'app-tabla',
  standalone: false,
  templateUrl: './tabla.html',
  styleUrl: './tabla.css'
})
export class Tabla implements OnInit {
  empleados: Empleado[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'email', 'telefono', 'departamento', 'salario', 'fechaContratacion', 'acciones'];

  constructor(
    private empleadoService: EmpleadoService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe(empleados => {
      this.empleados = empleados;
    });
  }

  editarEmpleado(empleado: Empleado): void {
    // Establecer el empleado para editar en el servicio
    this.empleadoService.empleadoParaEditar = empleado;
  }

  eliminarEmpleado(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      this.empleadoService.eliminarEmpleado(id);
    }
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearSalario(salario: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(salario);
  }
} 