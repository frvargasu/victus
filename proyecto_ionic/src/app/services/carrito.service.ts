import { Injectable } from '@angular/core';

export interface Producto {
  nombre: string;
  imagen: string;
  precio: number;
  cantidad?: number; // Cantidad opcional
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private carrito: Producto[] = [];

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  agregarAlCarrito(producto: Producto): void {
    const encontrado = this.carrito.find(p => p.nombre === producto.nombre);
    if (encontrado) {
      // Aseguramos que cantidad no sea undefined
      encontrado.cantidad = (encontrado.cantidad || 0) + 1;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
  }

  quitarDelCarrito(nombre: string): void {
    const idx = this.carrito.findIndex(p => p.nombre === nombre);
    if (idx > -1) {
      const producto = this.carrito[idx];
      if ((producto.cantidad || 0) > 1) {
        producto.cantidad = (producto.cantidad || 0) - 1;
      } else {
        this.carrito.splice(idx, 1);
      }
    }
  }

  obtenerCantidadTotal(): number {
    return this.carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  }

  obtenerTotal(): number {
    return this.carrito.reduce((acc, p) => acc + p.precio * (p.cantidad || 0), 0);
  }
}