import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private carrito: Producto[] = [];

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {
    this.cargarCarritoDesdeStorage();
  }

  private async cargarCarritoDesdeStorage(): Promise<void> {
    try {
      this.carrito = await this.storageService.obtenerCarrito();
    } catch (error) {
      console.error('Error al cargar carrito desde storage:', error);
      this.carrito = [];
    }
  }

  private async guardarCarritoEnStorage(): Promise<void> {
    try {
      await this.storageService.guardarCarrito(this.carrito);
    } catch (error) {
      console.error('Error al guardar carrito en storage:', error);
    }
  }

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  async agregarAlCarrito(producto: Producto): Promise<void> {
    const encontrado = this.carrito.find(p => p.nombre === producto.nombre);
    if (encontrado) {
      // Aseguramos que cantidad no sea undefined
      encontrado.cantidad = (encontrado.cantidad || 0) + 1;
      await this.toastService.mostrarToastCarrito(producto.nombre, encontrado.cantidad);
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
      await this.toastService.mostrarToastCarrito(producto.nombre, 1);
    }
    await this.guardarCarritoEnStorage();
  }

  async quitarDelCarrito(nombre: string): Promise<void> {
    const idx = this.carrito.findIndex(p => p.nombre === nombre);
    if (idx > -1) {
      const producto = this.carrito[idx];
      if ((producto.cantidad || 0) > 1) {
        producto.cantidad = (producto.cantidad || 0) - 1;
        await this.toastService.mostrarToastInfo(`${producto.nombre} - Cantidad reducida a ${producto.cantidad}`);
      } else {
        this.carrito.splice(idx, 1);
        await this.toastService.mostrarToastInfo(`${producto.nombre} removido del carrito`);
      }
      await this.guardarCarritoEnStorage();
    }
  }

  async eliminarProductoCompleto(nombre: string): Promise<void> {
    const idx = this.carrito.findIndex(p => p.nombre === nombre);
    if (idx > -1) {
      const producto = this.carrito[idx];
      this.carrito.splice(idx, 1);
      await this.guardarCarritoEnStorage();
      await this.toastService.mostrarToastInfo(`${producto.nombre} eliminado del carrito`);
    }
  }

  obtenerCantidadTotal(): number {
    return this.carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  }

  obtenerTotal(): number {
    return this.carrito.reduce((acc, p) => acc + p.precio * (p.cantidad || 0), 0);
  }

  async limpiarCarrito(): Promise<void> {
    const cantidadAnterior = this.obtenerCantidadTotal();
    this.carrito = [];
    await this.guardarCarritoEnStorage();
    
    if (cantidadAnterior > 0) {
      await this.toastService.mostrarToastExito('Carrito vaciado exitosamente');
    }
  }

  async actualizarCantidad(nombre: string, cantidad: number): Promise<void> {
    const producto = this.carrito.find(p => p.nombre === nombre);
    if (producto) {
      producto.cantidad = cantidad;
      if (cantidad <= 0) {
        const index = this.carrito.findIndex(p => p.nombre === nombre);
        this.carrito.splice(index, 1);
      }
      await this.guardarCarritoEnStorage();
    }
  }
}