import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { CarritoService } from '../services/carrito.service';
import { ProductosService } from '../services/productos.service';
import { SqliteProductosService } from '../services/sqlite-productos.service';
import { ToastService } from '../services/toast.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  productos: Producto[] = [];
  productosLocales: Producto[] = [];
  categorias: string[] = [];
  categoriaSeleccionada: string = '';
  mostrarAPI: string = 'api';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private carritoService: CarritoService,
    private productosService: ProductosService,
    private sqliteProductosService: SqliteProductosService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.sqliteProductosService.initDatabase();
    this.productosLocales = this.productosService.productos;
    console.log('Productos locales cargados:', this.productosLocales);
    await this.cargarProductos();
    await this.cargarCategorias();
  }

  async cargarProductos() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      if (this.mostrarAPI === 'api') {
        // Usar async/await en lugar de subscribe
        const productos = await this.productosService.obtenerProductosAPIAsync();
        this.productos = await this.marcarFavoritos(productos);
      } else {
        console.log('Cargando productos locales:', this.productosLocales);
        this.productos = await this.marcarFavoritos(this.productosLocales);
        console.log('Productos finales mostrados:', this.productos);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      await this.mostrarError('Error al cargar productos');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async cargarCategorias() {
    try {
      // Usar async/await en lugar de subscribe
      this.categorias = await this.productosService.obtenerCategoriasAsync();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      await this.mostrarError('Error al cargar categorías');
    }
  }

  async cargarPorCategoria() {
    if (!this.categoriaSeleccionada || this.mostrarAPI !== 'api') return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Filtrando productos...'
    });
    await loading.present();

    try {
      // Usar async/await en lugar de subscribe
      const productos = await this.productosService.obtenerProductosPorCategoriaAsync(this.categoriaSeleccionada);
      this.productos = await this.marcarFavoritos(productos);
    } catch (error) {
      console.error('Error al filtrar productos:', error);
      await this.mostrarError('Error al filtrar productos');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async marcarFavoritos(productos: Producto[]): Promise<Producto[]> {
    const productosConFavoritos = [];
    for (const producto of productos) {
      const esFavorito = await this.sqliteProductosService.esFavorito(producto);
      productosConFavoritos.push({...producto, isFavorite: esFavorito});
    }
    return productosConFavoritos;
  }

  async toggleFavorito(producto: Producto) {
    const resultado = await this.sqliteProductosService.toggleFavorito(producto);
    
    if (resultado) {
      // Actualizar el estado local
      const index = this.productos.findIndex(p => p.id === producto.id || p.nombre === producto.nombre);
      if (index !== -1) {
        this.productos[index].isFavorite = !this.productos[index].isFavorite;
        
        // Mostrar toast usando el nuevo servicio
        await this.toastService.mostrarToastFavorito(producto.nombre, this.productos[index].isFavorite);
      }
    }
  }

  async toggleVista() {
    // El ion-segment ya cambia mostrarAPI automáticamente
    this.categoriaSeleccionada = '';
    await this.cargarProductos();
  }

  async limpiarFiltros() {
    this.categoriaSeleccionada = '';
    await this.cargarProductos();
  }

  async agregarAlCarrito(producto: Producto): Promise<void> {
    await this.carritoService.agregarAlCarrito({
      nombre: producto.nombre,
      imagen: producto.imagen || '',
      precio: producto.precio,
      cantidad: 1
    });
  }

  obtenerCantidadCarrito(): number {
    return this.carritoService.obtenerCantidadTotal();
  }

  verDetalle(producto: Producto) {
    console.log('Navegando a detalle del producto:', producto.nombre);
    this.router.navigate(['/detalle-producto', encodeURIComponent(producto.nombre)]);
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
