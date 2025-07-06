import { Component } from '@angular/core';
import { CarritoService } from '../services/carrito.service';
import { StorageService } from '../services/storage.service';
import { Producto } from '../models/producto';
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
  constructor(
    public carritoService: CarritoService, 
    private storageService: StorageService,
    private router: Router
  ) {}

  obtenerCarrito(): Producto[] {
    return this.carritoService.obtenerCarrito();
  }

  obtenerTotal(): number {
    return this.carritoService.obtenerTotal();
  }

  async agregarProducto(producto: Producto): Promise<void> {
    await this.carritoService.agregarAlCarrito(producto);
  }

  async quitarProducto(nombre: string): Promise<void> {
    await this.carritoService.quitarDelCarrito(nombre);
  }

  async limpiarCarrito(): Promise<void> {
    await this.carritoService.limpiarCarrito();
  }

  async actualizarCantidad(nombre: string, cantidad: number): Promise<void> {
    await this.carritoService.actualizarCantidad(nombre, cantidad);
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

}