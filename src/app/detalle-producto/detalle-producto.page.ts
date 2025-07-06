import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../services/productos.service';
import { CarritoService } from '../services/carrito.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: false
})
export class DetalleProductoPage implements OnInit {
  producto: Producto | undefined;
  esFavorito: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    const nombreProducto = this.route.snapshot.paramMap.get('nombre');
    if (nombreProducto) {
      this.producto = this.productosService.obtenerProductoPorNombre(nombreProducto);
      if (!this.producto) {
        console.error(`No se encontró un producto con el nombre: ${nombreProducto}`);
      } else {
        await this.verificarSiEsFavorito();
      }
    } else {
      console.error('El parámetro "nombre" no está presente en la URL.');
    }
  }

  async verificarSiEsFavorito(): Promise<void> {
    if (this.producto) {
      const favoritos = await this.storageService.obtenerFavoritos();
      this.esFavorito = favoritos.some(f => f.nombre === this.producto?.nombre);
    }
  }

  cerrarDetalle() {
    this.router.navigate(['/']); 
  }

  async agregarProducto(producto: Producto | undefined): Promise<void> {
    if (producto) {
      await this.carritoService.agregarAlCarrito(producto);
      // El toast se muestra automáticamente desde CarritoService
    }
  }

  async toggleFavorito(): Promise<void> {
    if (this.producto) {
      if (this.esFavorito) {
        await this.storageService.quitarFavorito(this.producto.nombre);
        this.esFavorito = false;
        await this.toastService.mostrarToastFavorito(this.producto.nombre, false);
      } else {
        await this.storageService.agregarFavorito(this.producto);
        this.esFavorito = true;
        await this.toastService.mostrarToastFavorito(this.producto.nombre, true);
      }
    }
  }
}