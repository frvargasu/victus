import { Component } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.page.html',
  styleUrls: ['./mi-cuenta.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule
  ]
})
export class MiCuentaPage {
  fechaCumpleanos: Date | null = null;
  nombre: string = '';
  apellido: string = '';
  nivelEducacional: string = '';
  datosGuardados: any = null;

  constructor() {}

  guardarDatos() {
    // Asignar los valores ingresados a la variable datosGuardados
    this.datosGuardados = {
      fechaCumpleanos: this.fechaCumpleanos,
      nombre: this.nombre,
      apellido: this.apellido,
      nivelEducacional: this.nivelEducacional,
    };
    console.log('Datos guardados:', this.datosGuardados);
    alert('Datos guardados correctamente');
  }

  mostrarDatos() {
    // Verificar si hay datos guardados
    if (this.datosGuardados) {
      console.log('Mostrando datos:', this.datosGuardados);
      alert(
        `Datos guardados:\nFecha de Cumpleaños: ${this.datosGuardados.fechaCumpleanos}\nNombre: ${this.datosGuardados.nombre}\nApellido: ${this.datosGuardados.apellido}\nNivel Educacional: ${this.datosGuardados.nivelEducacional}`
      );
    } else {
      alert('No hay datos guardados.');
    }
  }
}