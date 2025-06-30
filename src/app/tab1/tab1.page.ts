import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { CarritoService } from '../services/carrito.service';
import { ProductosService } from '../services/productos.service';
import { SqliteProductosService } from '../services/sqlite-productos.service';
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
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
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
        this.productosService.obtenerProductosAPI().subscribe({
          next: async (productos) => {
            this.productos = await this.marcarFavoritos(productos);
            this.isLoading = false;
            await loading.dismiss();
          },
          error: async (error) => {
            console.error('Error al cargar productos:', error);
            this.isLoading = false;
            await loading.dismiss();
            await this.mostrarError('Error al cargar productos de la API');
          }
        });
      } else {
        console.log('Cargando productos locales:', this.productosLocales);
        this.productos = await this.marcarFavoritos(this.productosLocales);
        console.log('Productos finales mostrados:', this.productos);
        this.isLoading = false;
        await loading.dismiss();
      }
    } catch (error) {
      this.isLoading = false;
      await loading.dismiss();
      await this.mostrarError('Error inesperado');
    }
  }

  async cargarCategorias() {
    this.productosService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  async cargarPorCategoria() {
    if (!this.categoriaSeleccionada || this.mostrarAPI !== 'api') return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Filtrando productos...'
    });
    await loading.present();

    this.productosService.obtenerProductosPorCategoria(this.categoriaSeleccionada).subscribe({
      next: async (productos) => {
        this.productos = await this.marcarFavoritos(productos);
        this.isLoading = false;
        await loading.dismiss();
      },
      error: async (error) => {
        console.error('Error al filtrar productos:', error);
        this.isLoading = false;
        await loading.dismiss();
      }
    });
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
        
        // Mensaje basado en el nuevo estado
        const mensaje = this.productos[index].isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos';
        await this.mostrarToast(mensaje);
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

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarAlCarrito({
      nombre: producto.nombre,
      imagen: producto.imagen || '',
      precio: producto.precio
    });
  }

  obtenerCantidadCarrito(): number {
    return this.carritoService.obtenerCantidadTotal();
  }

  verDetalle(producto: Producto) {
    this.router.navigate(['/detalle-producto'], {
      state: { producto }
    });
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
