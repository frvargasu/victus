import { Component } from '@angular/core';

interface Producto {
  nombre: string;
  imagen: string;
  precio: number;
}

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
    }
  ];

  constructor() {}
}