import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Producto, ProductoAPI } from '../models/producto';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = 'https://fakestoreapi.com/products';
  
  productos: Producto[] = [
    {
      nombre: 'Polera Angular',
      imagen: 'assets/img/Angular-png.png',
      precio: 15000,
      descripcion: 'Polera cómoda y moderna con el logo de Angular.',
      cantidad: 0,
    },
    {
      nombre: 'Polera Github',
      imagen: 'assets/img/Github.png',
      precio: 14000,
      descripcion: 'Polera negra con el logo de Github, ideal para desarrolladores.',
      cantidad: 0,
    },
    {
      nombre: 'Polera Java',
      imagen: 'assets/img/Java-gris.png',
      precio: 16000,
      descripcion: 'Polera gris con el logo de Java, perfecta para los amantes del café y el código.',
      cantidad: 0,
    },
    {
      nombre: 'Polera JavaScript',
      imagen: 'assets/img/JavaScript.jpg',
      precio: 15500,
      descripcion: 'Polera con el logo de JavaScript, para los apasionados del desarrollo web.',
      cantidad: 0,
    },
    {
      nombre: 'Polera Node',
      imagen: 'assets/img/camiseta-node.jpg',
      precio: 17000,
      descripcion: 'Polera verde con el logo de Node.js, ideal para los que aman el desarrollo del lado del servidor.',
      cantidad: 0,
    },
    {
      nombre: 'Taza JavaScript',
      imagen: 'assets/img/Taza_javaScript.jpg',
      precio: 8000,
      descripcion: 'Taza blanca con el logo de JavaScript, perfecta para tu café o té.',
      cantidad: 0,
    },
    {
      nombre: 'Polera Flutter',
      imagen: 'assets/img/flutter.png',
      precio: 17500,
      descripcion: 'Polera con el logo de Flutter, para los entusiastas del desarrollo móvil.',
      cantidad: 0,
    },
    {
      nombre: 'Taza Coffe Code',
      imagen: 'assets/img/Taza-Bg-Sh.jpg',
      precio: 8000,
      descripcion: 'Taza con diseño de código y café, ideal para programadores.',
      cantidad: 0,
    },
    {
      nombre: 'Soporte notebook',
      imagen: 'assets/img/soporte.jpg',
      precio: 9990,
      descripcion: 'Soporte ajustable para notebook, mejora tu postura al trabajar.',
      cantidad: 0,
    },
  ];

  constructor(private http: HttpClient) {}

  // Métodos para productos locales
  obtenerProductoPorNombre(nombre: string): Producto | undefined {
    return this.productos.find((producto) => producto.nombre === nombre);
  }

  // Métodos para API externa
  obtenerProductosAPI(): Observable<Producto[]> {
    return this.http.get<ProductoAPI[]>(this.apiUrl).pipe(
      map(apiProductos => apiProductos.map(this.convertirAPIAProducto)),
      catchError(error => {
        console.error('Error al obtener productos de la API:', error);
        return of([]);
      })
    );
  }

  obtenerProductoPorIdAPI(id: number): Observable<Producto | null> {
    return this.http.get<ProductoAPI>(`${this.apiUrl}/${id}`).pipe(
      map(apiProducto => this.convertirAPIAProducto(apiProducto)),
      catchError(error => {
        console.error('Error al obtener producto de la API:', error);
        return of(null);
      })
    );
  }

  obtenerCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        return of([]);
      })
    );
  }

  obtenerProductosPorCategoria(categoria: string): Observable<Producto[]> {
    return this.http.get<ProductoAPI[]>(`${this.apiUrl}/category/${categoria}`).pipe(
      map(apiProductos => apiProductos.map(this.convertirAPIAProducto)),
      catchError(error => {
        console.error('Error al obtener productos por categoría:', error);
        return of([]);
      })
    );
  }

  // Métodos mejorados con async/await
  async obtenerProductosAPIAsync(): Promise<Producto[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ProductoAPI[]>(this.apiUrl)
      );
      return response.map(this.convertirAPIAProducto);
    } catch (error) {
      console.error('Error al obtener productos de la API:', error);
      return [];
    }
  }

  async obtenerProductoPorIdAPIAsync(id: number): Promise<Producto | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ProductoAPI>(`${this.apiUrl}/${id}`)
      );
      return this.convertirAPIAProducto(response);
    } catch (error) {
      console.error('Error al obtener producto de la API:', error);
      return null;
    }
  }

  async obtenerCategoriasAsync(): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<string[]>(`${this.apiUrl}/categories`)
      );
      return response;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  async obtenerProductosPorCategoriaAsync(categoria: string): Promise<Producto[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ProductoAPI[]>(`${this.apiUrl}/category/${categoria}`)
      );
      return response.map(this.convertirAPIAProducto);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      return [];
    }
  }

  private convertirAPIAProducto(apiProducto: ProductoAPI): Producto {
    // Convertir precio de USD a CLP (aproximadamente 1 USD = 900 CLP)
    const precioEnPesos = Math.round(apiProducto.price * 900);
    
    return {
      id: apiProducto.id,
      nombre: apiProducto.title,
      precio: precioEnPesos,
      imagen: apiProducto.image,
      descripcion: apiProducto.description,
      categoria: apiProducto.category,
      rating: apiProducto.rating.rate,
      cantidad: 0,
      isFavorite: false
    };
  }
}