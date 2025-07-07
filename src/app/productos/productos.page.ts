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
    console.time('⏱️ Tiempo total inicialización de datos');
    try {
      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Cargando productos...',
        duration: 10000
      });
      await loading.present();

      // Cargar productos y categorías en paralelo
      console.time('⏱️ Carga paralela de productos y categorías');
      const [productos, categorias] = await Promise.all([
        this.apiService.obtenerProductos(),
        this.apiService.obtenerCategorias()
      ]);
      console.timeEnd('⏱️ Carga paralela de productos y categorías');

      console.time('⏱️ Asignación de datos a variables');
      this.productos = productos;
      this.productosFiltrados = productos;
      this.categorias = categorias;
      console.timeEnd('⏱️ Asignación de datos a variables');

      await loading.dismiss();
      
      if (productos.length === 0) {
        await this.mostrarAlerta('Sin productos', 'No se pudieron cargar los productos. Verifica tu conexión a internet.');
      }

      console.timeEnd('⏱️ Tiempo total inicialización de datos');
      console.log(`📊 Productos cargados: ${productos.length}, Categorías: ${categorias.length}`);

    } catch (error) {
      console.timeEnd('⏱️ Tiempo total inicialización de datos');
      console.error('Error al inicializar datos:', error);
      await this.toastService.mostrarToastError('Error al cargar datos iniciales');
    }
  }

  // Buscar productos
  async buscarProductos(event: any): Promise<void> {
    const termino = event.target.value || '';
    console.time(`🔍 Búsqueda de productos: "${termino}"`);
    
    try {
      this.terminoBusqueda = termino;
      
      if (this.terminoBusqueda.trim() === '') {
        console.time('📋 Restaurar lista completa');
        this.productosFiltrados = this.productos;
        console.timeEnd('📋 Restaurar lista completa');
      } else {
        console.time('🔍 Llamada API buscarProductos');
        this.productosFiltrados = await this.apiService.buscarProductos(this.terminoBusqueda);
        console.timeEnd('🔍 Llamada API buscarProductos');
      }
      
      console.timeEnd(`🔍 Búsqueda de productos: "${termino}"`);
      console.log(`📊 Resultados de búsqueda: ${this.productosFiltrados.length} productos`);
    } catch (error) {
      console.timeEnd(`🔍 Búsqueda de productos: "${termino}"`);
      console.error('Error al buscar productos:', error);
      await this.toastService.mostrarToastError('Error en la búsqueda');
    }
  }

  // Filtrar por categoría
  async filtrarPorCategoria(event: any): Promise<void> {
    const categoria = event.target.value;
    console.time(`📂 Filtrado por categoría: "${categoria}"`);
    
    try {
      this.categoriaSeleccionada = categoria;
      
      if (this.categoriaSeleccionada === '') {
        console.time('📋 Obtener todos los productos');
        this.productosFiltrados = await this.apiService.obtenerProductos();
        console.timeEnd('📋 Obtener todos los productos');
      } else {
        console.time('📂 Llamada API obtenerProductosPorCategoria');
        this.productosFiltrados = await this.apiService.obtenerProductosPorCategoria(this.categoriaSeleccionada);
        console.timeEnd('📂 Llamada API obtenerProductosPorCategoria');
      }
      
      console.timeEnd(`📂 Filtrado por categoría: "${categoria}"`);
      console.log(`📊 Productos filtrados por categoría: ${this.productosFiltrados.length} productos`);
    } catch (error) {
      console.timeEnd(`📂 Filtrado por categoría: "${categoria}"`);
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
    console.time(`⭐ Toggle favorito: "${producto.nombre}"`);
    
    try {
      console.time('📦 Obtener favoritos del storage');
      const favoritos = await this.storageService.obtenerFavoritos();
      console.timeEnd('📦 Obtener favoritos del storage');
      
      const esFavorito = favoritos.some(f => f.id === producto.id);

      if (esFavorito) {
        console.time('❌ Quitar favorito');
        await this.storageService.quitarFavorito(producto.nombre);
        console.timeEnd('❌ Quitar favorito');
        await this.toastService.mostrarToastFavorito(producto.nombre, false);
      } else {
        console.time('✅ Agregar favorito');
        await this.storageService.agregarFavorito(producto);
        console.timeEnd('✅ Agregar favorito');
        await this.toastService.mostrarToastFavorito(producto.nombre, true);
      }
      
      console.timeEnd(`⭐ Toggle favorito: "${producto.nombre}"`);
    } catch (error) {
      console.timeEnd(`⭐ Toggle favorito: "${producto.nombre}"`);
      console.error('Error al manejar favorito:', error);
      await this.toastService.mostrarToastError('Error al actualizar favoritos');
    }
  }

  // Verificar si es favorito
  async esFavorito(producto: Producto): Promise<boolean> {
    console.time(`🔍 Verificar si es favorito: "${producto.nombre}"`);
    
    try {
      const favoritos = await this.storageService.obtenerFavoritos();
      const resultado = favoritos.some(f => f.id === producto.id);
      
      console.timeEnd(`🔍 Verificar si es favorito: "${producto.nombre}"`);
      return resultado;
    } catch (error) {
      console.timeEnd(`🔍 Verificar si es favorito: "${producto.nombre}"`);
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
    console.time('🔄 Refrescar datos');
    
    try {
      await this.apiService.obtenerProductos();
      await this.toastService.mostrarToastExito('Productos actualizados');
      console.timeEnd('🔄 Refrescar datos');
    } catch (error) {
      console.timeEnd('🔄 Refrescar datos');
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
