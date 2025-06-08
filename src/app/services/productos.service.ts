import { Injectable } from '@angular/core';

// Aca se define y exporta la interfaz producto
export interface Producto {
  nombre: string;
  imagen: string;
  precio: number;
  descripcion: string; 
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  productos: Producto[] = [
    {
      nombre: 'Polera Angular',
      imagen: 'assets/img/Angular-png.png',
      precio: 15000,
      descripcion: 'Polera cómoda y moderna con el logo de Angular.',
    },
    {
      nombre: 'Polera Github',
      imagen: 'assets/img/Github.png',
      precio: 14000,
      descripcion: 'Polera negra con el logo de Github, ideal para desarrolladores.',
    },
    {
      nombre: 'Polera Java',
      imagen: 'assets/img/Java-gris.png',
      precio: 16000,
      descripcion: 'Polera gris con el logo de Java, perfecta para los amantes del café y el código.',
    },
    {
      nombre: 'Polera JavaScript',
      imagen: 'assets/img/JavaScript.jpg',
      precio: 15500,
      descripcion: 'Polera con el logo de JavaScript, para los apasionados del desarrollo web.',
    },
    {
      nombre: 'Polera Node',
      imagen: 'assets/img/camiseta-node.jpg',
      precio: 17000,
      descripcion: 'Polera verde con el logo de Node.js, ideal para los que aman el desarrollo del lado del servidor.',
    },
    {
      nombre: 'Taza JavaScript',
      imagen: 'assets/img/Taza_javaScript.jpg',
      precio: 8000,
      descripcion: 'Taza blanca con el logo de JavaScript, perfecta para tu café o té.',
    },
    {
      nombre: 'Polera Flutter',
      imagen: 'assets/img/flutter.png',
      precio: 17500,
      descripcion: 'Polera con el logo de Flutter, para los entusiastas del desarrollo móvil.',
    },
    {
      nombre: 'Taza Coffe Code',
      imagen: 'assets/img/Taza-Bg-Sh.jpg',
      precio: 8000,
      descripcion: 'Taza con diseño de código y café, ideal para programadores.',
    },
    {
      nombre: 'Soporte notebook',
      imagen: 'assets/img/soporte.jpg',
      precio: 9990,
      descripcion: 'Soporte ajustable para notebook, mejora tu postura al trabajar.',
    },
  ];

  constructor() {}

  obtenerProductoPorNombre(nombre: string): Producto | undefined {
    return this.productos.find((producto) => producto.nombre === nombre);
  }
}