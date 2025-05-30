import { Component } from '@angular/core';
import { CarritoService, Producto } from '../services/carrito.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule], // Importa Ionic y CommonModule aquí
})
export class CarritoPage {
  constructor(public carritoService: CarritoService) {}

  obtenerCarrito(): Producto[] {
    return this.carritoService.obtenerCarrito();
  }

  obtenerTotal(): number {
    return this.carritoService.obtenerTotal();
  }

  agregarProducto(producto: Producto) {
    this.carritoService.agregarAlCarrito(producto);
  }

  quitarProducto(nombre: string) {
    this.carritoService.quitarDelCarrito(nombre);
  }
}