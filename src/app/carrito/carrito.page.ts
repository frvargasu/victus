import { Component } from '@angular/core';
import { CarritoService, Producto } from '../services/carrito.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class CarritoPage {
  constructor(public carritoService: CarritoService, private router: Router) {}

  obtenerCarrito(): Producto[] {
    return this.carritoService.obtenerCarrito();
  }

  obtenerTotal(): number {
    return this.carritoService.obtenerTotal();
  }

  agregarProducto(producto: Producto) {
    this.carritoService.agregarAlCarrito(producto);
  }
  irAConfirmacion() {
  const total = this.obtenerTotal();
  const navigationExtras: NavigationExtras = {
    state: {
      total: total,
    },
  };
  this.router.navigate(['/confirmacion'], navigationExtras);
}

  quitarProducto(nombre: string) {
    this.carritoService.quitarDelCarrito(nombre);
  }
}