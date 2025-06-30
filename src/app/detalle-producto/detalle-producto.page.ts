import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../services/productos.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true, 
  imports: [IonicModule, CommonModule, FormsModule], 
})
export class DetalleProductoPage implements OnInit {
  producto: Producto | undefined;

  constructor(private route: ActivatedRoute, private router: Router, private productosService: ProductosService) {}

  ngOnInit() {
    const nombreProducto = this.route.snapshot.paramMap.get('nombre');
    if (nombreProducto) {
      this.producto = this.productosService.obtenerProductoPorNombre(nombreProducto);
      if (!this.producto) {
        console.error(`No se encontró un producto con el nombre: ${nombreProducto}`);
      }
    } else {
      console.error('El parámetro "nombre" no está presente en la URL.');
    }
  }

  cerrarDetalle() {
    this.router.navigate(['/']); 
  }

  agregarProducto(producto: Producto | undefined) {
    if (producto) {
      console.log('Producto añadido al carrito:', producto);
    }
  }
}