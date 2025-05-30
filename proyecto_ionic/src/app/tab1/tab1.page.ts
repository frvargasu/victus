import { Component } from '@angular/core';
import { CarritoService, Producto } from '../services/carrito.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  productos: Producto[] = [
    {
      nombre: 'Polera Angular',
      imagen: 'assets/img/Angular-png.png',
      precio: 15000
    },
    {
      nombre: 'Polera Github',
      imagen: 'assets/img/Github.png',
      precio: 14000
    },
    {
      nombre: 'Polera Java',
      imagen: 'assets/img/Java-gris.png',
      precio: 16000
    },
    {
      nombre: 'Polera JavaScript',
      imagen: 'assets/img/JavaScript.jpg',
      precio: 15500
    },
    {
      nombre: 'Polera Node',
      imagen: 'assets/img/camiseta-node.jpg',
      precio: 17000
    },
    {
      nombre: 'Taza JavaScript',
      imagen: 'assets/img/Taza_javaScript.jpg',
      precio: 8000
    },
    {
      nombre: 'Polera Flutter',
      imagen: 'assets/img/flutter.png',
      precio: 17500
    },
    {
      nombre: 'Taza Coffe Code',
      imagen: 'assets/img/Taza-Bg-Sh.jpg',
      precio: 8000
    },
    {
      nombre: 'Soporte notebook',
      imagen: 'assets/img/soporte.jpg',
      precio: 9990
    }
  ];

  constructor(public carritoService: CarritoService) {}

  agregarProducto(producto: Producto) {
    this.carritoService.agregarAlCarrito(producto);
  }

  obtenerCantidadCarrito(): number {
    return this.carritoService.obtenerCantidadTotal();
  }
}