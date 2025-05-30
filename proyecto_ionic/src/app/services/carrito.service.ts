import { Injectable } from '@angular/core';

export interface Producto {
  nombre: string;
  imagen: string;
  precio: number;
  cantidad?: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private carrito: Producto[] = [];

  obtenerCarrito() {
    return this.carrito;
  }

  agregarAlCarrito(producto: Producto) {
    const encontrado = this.carrito.find(p => p.nombre === producto.nombre);
    if (encontrado) {
      encontrado.cantidad! += 1;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
  }

  quitarDelCarrito(nombre: string) {
    const idx = this.carrito.findIndex(p => p.nombre === nombre);
    if (idx > -1) {
      if (this.carrito[idx].cantidad! > 1) {
        this.carrito[idx].cantidad!--;
      } else {
        this.carrito.splice(idx, 1);
      }
    }
  }

  obtenerCantidadTotal(): number {
    return this.carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  }

  obtenerTotal(): number {
    return this.carrito.reduce((acc, p) => acc + (p.precio * (p.cantidad || 0)), 0);
  }
}