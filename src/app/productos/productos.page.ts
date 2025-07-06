import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { CarritoService } from '../services/carrito.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { Producto } from '../models/producto';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SharedModule]
})
export class ProductosPage implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];
  categoriaSeleccionada: string = '';
  terminoBusqueda: string = '';
  cargando: boolean = false;

  constructor(
    private apiService: ApiService,
    private carritoService: CarritoService,
    private storageService: StorageService,
    private toastService: ToastService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    await this.inicializarDatos();
  }

  private async inicializarDatos(): Promise<void> {
    try {
      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Cargando productos...',
        duration: 10000
      });
      await loading.present();

      // Cargar productos y categorías en paralelo
      const [productos, categorias] = await Promise.all([
        this.apiService.obtenerProductos(),
        this.apiService.obtenerCategorias()
      ]);

      this.productos = productos;
      this.productosFiltrados = productos;
      this.categorias = categorias;

      await loading.dismiss();
      
      if (productos.length === 0) {
        await this.mostrarAlerta('Sin productos', 'No se pudieron cargar los productos. Verifica tu conexión a internet.');
      }

    } catch (error) {
      console.error('Error al inicializar datos:', error);
      await this.toastService.mostrarToastError('Error al cargar datos iniciales');
    }
  }

  // Buscar productos
  async buscarProductos(event: any): Promise<void> {
    try {
      this.terminoBusqueda = event.target.value || '';
      
      if (this.terminoBusqueda.trim() === '') {
        this.productosFiltrados = this.productos;
      } else {
        this.productosFiltrados = await this.apiService.buscarProductos(this.terminoBusqueda);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      await this.toastService.mostrarToastError('Error en la búsqueda');
    }
  }

  // Filtrar por categoría
  async filtrarPorCategoria(event: any): Promise<void> {
    try {
      this.categoriaSeleccionada = event.target.value;
      
      if (this.categoriaSeleccionada === '') {
        this.productosFiltrados = await this.apiService.obtenerProductos();
      } else {
        this.productosFiltrados = await this.apiService.obtenerProductosPorCategoria(this.categoriaSeleccionada);
      }
    } catch (error) {
      console.error('Error al filtrar por categoría:', error);
      await this.toastService.mostrarToastError('Error al filtrar productos');
    }
  }

  // Aplicar filtros combinados
  private aplicarFiltros(): void {
    let productosTemp = [...this.productos];

    // Filtrar por categoría si está seleccionada
    if (this.categoriaSeleccionada) {
      productosTemp = productosTemp.filter(p => p.categoria === this.categoriaSeleccionada);
    }

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      productosTemp = productosTemp.filter(p => 
        p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      );
    }

    this.productosFiltrados = productosTemp;
  }

  // Agregar producto al carrito
  async agregarAlCarrito(producto: Producto): Promise<void> {
    try {
      await this.carritoService.agregarAlCarrito(producto);
      // El toast se muestra automáticamente desde CarritoService
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      await this.toastService.mostrarToastError('Error al agregar al carrito');
    }
  }

  // Toggle favorito
  async toggleFavorito(producto: Producto): Promise<void> {
    try {
      const favoritos = await this.storageService.obtenerFavoritos();
      const esFavorito = favoritos.some(f => f.id === producto.id);

      if (esFavorito) {
        await this.storageService.quitarFavorito(producto.nombre);
        await this.toastService.mostrarToastFavorito(producto.nombre, false);
      } else {
        await this.storageService.agregarFavorito(producto);
        await this.toastService.mostrarToastFavorito(producto.nombre, true);
      }
    } catch (error) {
      console.error('Error al manejar favorito:', error);
      await this.toastService.mostrarToastError('Error al actualizar favoritos');
    }
  }

  // Verificar si es favorito
  async esFavorito(producto: Producto): Promise<boolean> {
    try {
      const favoritos = await this.storageService.obtenerFavoritos();
      return favoritos.some(f => f.id === producto.id);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  }

  // Ver detalle del producto
  verDetalle(producto: Producto): void {
    this.router.navigate(['/detalle-producto', producto.nombre]);
  }

  // Refrescar datos
  async refrescarDatos(event: any): Promise<void> {
    try {
      await this.apiService.obtenerProductos();
      await this.toastService.mostrarToastExito('Productos actualizados');
    } catch (error) {
      console.error('Error al refrescar:', error);
      await this.toastService.mostrarToastError('Error al refrescar datos');
    } finally {
      event.target.complete();
    }
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = '';
    this.productosFiltrados = [...this.productos];
  }

  // Mostrar alerta
  private async mostrarAlerta(titulo: string, mensaje: string): Promise<void> {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Métodos auxiliares
  trackByProducto(index: number, producto: Producto): any {
    return producto.id || index;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/img/placeholder.jpg';
  }
}
