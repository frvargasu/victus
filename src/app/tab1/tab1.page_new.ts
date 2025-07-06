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
  mostrarAPI: boolean = true;
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
    await this.cargarProductos();
    await this.cargarCategorias();
    this.productosLocales = this.productosService.productos;
  }

  async cargarProductos() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      if (this.mostrarAPI) {
        // Refactorizado a async/await
        const productos = await this.productosService.obtenerProductosAPI().toPromise();
        this.productos = await this.marcarFavoritos(productos || []);
        this.isLoading = false;
        await loading.dismiss();
      } else {
        this.productos = await this.marcarFavoritos(this.productosLocales);
        this.isLoading = false;
        await loading.dismiss();
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.isLoading = false;
      await loading.dismiss();
      await this.mostrarError('Error al cargar productos de la API');
    }
  }

  async cargarCategorias() {
    try {
      // Refactorizado a async/await
      const categorias = await this.productosService.obtenerCategorias().toPromise();
      this.categorias = categorias || [];
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  async cargarPorCategoria() {
    if (!this.categoriaSeleccionada || !this.mostrarAPI) return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Filtrando productos...'
    });
    await loading.present();

    try {
      // Refactorizado a async/await
      const productos = await this.productosService.obtenerProductosPorCategoria(this.categoriaSeleccionada).toPromise();
      this.productos = await this.marcarFavoritos(productos || []);
      this.isLoading = false;
      await loading.dismiss();
    } catch (error) {
      console.error('Error al filtrar productos:', error);
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
      }
      
      const mensaje = producto.isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos';
      await this.mostrarToast(mensaje);
    }
  }

  async toggleVista() {
    this.mostrarAPI = !this.mostrarAPI;
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
