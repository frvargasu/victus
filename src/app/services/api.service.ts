import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Producto, ProductoAPI } from '../models/producto';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = 'https://fakestoreapi.com';
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();
  
  private cargandoSubject = new BehaviorSubject<boolean>(false);
  public cargando$ = this.cargandoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) { }

  // Obtener todos los productos con async/await
  async obtenerProductos(): Promise<Producto[]> {
    try {
      this.cargandoSubject.next(true);
      console.log('Obteniendo productos de la API...');
      
      const response = await firstValueFrom(
        this.http.get<ProductoAPI[]>(`${this.BASE_URL}/products`)
      );
      
      const productos = response.map(this.convertirAPIAProducto);
      this.productosSubject.next(productos);
      
      console.log(`${productos.length} productos obtenidos exitosamente`);
      return productos;
      
    } catch (error) {
      console.error('Error al obtener productos:', error);
      await this.manejarError(error, 'Error al cargar productos');
      return [];
    } finally {
      this.cargandoSubject.next(false);
    }
  }

  // Obtener un producto por ID con async/await
  async obtenerProductoPorId(id: number): Promise<Producto | null> {
    try {
      this.cargandoSubject.next(true);
      console.log(`Obteniendo producto con ID: ${id}`);
      
      const response = await firstValueFrom(
        this.http.get<ProductoAPI>(`${this.BASE_URL}/products/${id}`)
      );
      
      const producto = this.convertirAPIAProducto(response);
      console.log(`Producto obtenido: ${producto.nombre}`);
      return producto;
      
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      await this.manejarError(error, `Error al cargar producto ${id}`);
      return null;
    } finally {
      this.cargandoSubject.next(false);
    }
  }

  // Obtener categorías con async/await
  async obtenerCategorias(): Promise<string[]> {
    try {
      this.cargandoSubject.next(true);
      console.log('Obteniendo categorías...');
      
      const response = await firstValueFrom(
        this.http.get<string[]>(`${this.BASE_URL}/products/categories`)
      );
      
      console.log(`${response.length} categorías obtenidas`);
      return response;
      
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      await this.manejarError(error, 'Error al cargar categorías');
      return [];
    } finally {
      this.cargandoSubject.next(false);
    }
  }

  // Obtener productos por categoría con async/await
  async obtenerProductosPorCategoria(categoria: string): Promise<Producto[]> {
    try {
      this.cargandoSubject.next(true);
      console.log(`Obteniendo productos de la categoría: ${categoria}`);
      
      const response = await firstValueFrom(
        this.http.get<ProductoAPI[]>(`${this.BASE_URL}/products/category/${categoria}`)
      );
      
      const productos = response.map(this.convertirAPIAProducto);
      this.productosSubject.next(productos);
      
      console.log(`${productos.length} productos obtenidos de la categoría ${categoria}`);
      return productos;
      
    } catch (error) {
      console.error(`Error al obtener productos de la categoría ${categoria}:`, error);
      await this.manejarError(error, `Error al cargar productos de ${categoria}`);
      return [];
    } finally {
      this.cargandoSubject.next(false);
    }
  }

  // Buscar productos por término con async/await
  async buscarProductos(termino: string): Promise<Producto[]> {
    try {
      console.log(`Buscando productos con término: ${termino}`);
      
      const productos = await this.obtenerProductos();
      const resultados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(termino.toLowerCase()) ||
        producto.categoria?.toLowerCase().includes(termino.toLowerCase())
      );
      
      console.log(`${resultados.length} productos encontrados`);
      return resultados;
      
    } catch (error) {
      console.error('Error al buscar productos:', error);
      await this.manejarError(error, 'Error en la búsqueda');
      return [];
    }
  }

  // Convertir producto de API a modelo interno
  private convertirAPIAProducto = (apiProducto: ProductoAPI): Producto => {
    // Convertir precio de USD a CLP (aproximadamente 1 USD = 900 CLP)
    const precioEnPesos = Math.round(apiProducto.price * 900);
    
    return {
      id: apiProducto.id,
      nombre: apiProducto.title,
      precio: precioEnPesos,
      imagen: apiProducto.image,
      descripcion: apiProducto.description,
      categoria: apiProducto.category,
      rating: apiProducto.rating?.rate || 0,
      cantidad: 0,
      isFavorite: false,
      disponible: true,
      fechaCreacion: new Date()
    };
  }

  // Manejo de errores mejorado con async/await
  private async manejarError(error: any, contexto: string): Promise<void> {
    let mensaje = 'Error desconocido';
    
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          mensaje = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
          break;
        case 404:
          mensaje = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          mensaje = 'Error interno del servidor. Intenta más tarde.';
          break;
        case 429:
          mensaje = 'Demasiadas solicitudes. Intenta más tarde.';
          break;
        default:
          mensaje = `Error del servidor: ${error.status} - ${error.message}`;
      }
    } else if (error.error instanceof ErrorEvent) {
      mensaje = `Error de red: ${error.error.message}`;
    } else {
      mensaje = error.message || 'Error desconocido';
    }
    
    console.error(`${contexto}: ${mensaje}`);
    
    // Mostrar toast de error al usuario
    await this.mostrarToastError(`${contexto}: ${mensaje}`);
  }

  // Mostrar toast de error
  private async mostrarToastError(mensaje: string): Promise<void> {
    try {
      const toast = await this.toastController.create({
        message: mensaje,
        duration: 4000,
        color: 'danger',
        position: 'bottom',
        buttons: [
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
    } catch (error) {
      console.error('Error al mostrar toast:', error);
    }
  }

  // Limpiar datos
  limpiarDatos(): void {
    this.productosSubject.next([]);
  }

  // Verificar estado de carga
  estaCargando(): boolean {
    return this.cargandoSubject.value;
  }

  // Obtener productos actuales
  obtenerProductosActuales(): Producto[] {
    return this.productosSubject.value;
  }
}
