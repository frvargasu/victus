import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class SqliteProductosService {
  private dbInstance: SQLiteObject | null = null;
  
  // Mock data para desarrollo en navegador
  private mockFavoritos: Producto[] = [];

  constructor(private sqlite: SQLite) {}

  async initDatabase(): Promise<void> {
    if (this.isBrowser()) {
      console.log('Usando almacenamiento local en el navegador.');
      this.loadMockData();
    } else {
      try {
        const db = await this.sqlite.create({
          name: 'productos.db',
          location: 'default',
        });
        this.dbInstance = db;
        await this.createTables();
        console.log('Base de datos de productos inicializada correctamente.');
      } catch (error) {
        console.error('Error al inicializar la base de datos de productos:', error);
      }
    }
  }

  private isBrowser(): boolean {
    return !document.URL.startsWith('file://');
  }

  private loadMockData(): void {
    const stored = localStorage.getItem('favoritos');
    if (stored) {
      this.mockFavoritos = JSON.parse(stored);
    }
  }

  private saveMockData(): void {
    localStorage.setItem('favoritos', JSON.stringify(this.mockFavoritos));
  }

  async createTables(): Promise<void> {
    if (!this.dbInstance) {
      console.error('La instancia de la base de datos no está inicializada.');
      return;
    }

    const query = `
      CREATE TABLE IF NOT EXISTS favoritos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        imagen TEXT,
        descripcion TEXT,
        categoria TEXT,
        rating REAL,
        cantidad INTEGER DEFAULT 0,
        fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await this.dbInstance.executeSql(query, []);
      console.log('Tabla favoritos creada correctamente.');
    } catch (error) {
      console.error('Error al crear la tabla favoritos:', error);
    }
  }

  async agregarFavorito(producto: Producto): Promise<boolean> {
    if (this.isBrowser()) {
      // Verificar si ya existe
      const existe = this.mockFavoritos.find(p => 
        p.id === producto.id || p.nombre === producto.nombre
      );
      
      if (!existe) {
        this.mockFavoritos.push({...producto, isFavorite: true});
        this.saveMockData();
        return true;
      }
      return false;
    } else {
      if (!this.dbInstance) {
        throw new Error('La instancia de la base de datos no está inicializada.');
      }

      const query = `
        INSERT INTO favoritos (producto_id, nombre, precio, imagen, descripcion, categoria, rating, cantidad)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      try {
        await this.dbInstance.executeSql(query, [
          producto.id || 0,
          producto.nombre,
          producto.precio,
          producto.imagen || '',
          producto.descripcion || '',
          producto.categoria || '',
          producto.rating || 0,
          producto.cantidad
        ]);
        console.log('Producto agregado a favoritos:', producto.nombre);
        return true;
      } catch (error) {
        console.error('Error al agregar producto a favoritos:', error);
        return false;
      }
    }
  }

  async eliminarFavorito(producto: Producto): Promise<boolean> {
    if (this.isBrowser()) {
      const index = this.mockFavoritos.findIndex(p => 
        p.id === producto.id || p.nombre === producto.nombre
      );
      
      if (index !== -1) {
        this.mockFavoritos.splice(index, 1);
        this.saveMockData();
        return true;
      }
      return false;
    } else {
      if (!this.dbInstance) {
        throw new Error('La instancia de la base de datos no está inicializada.');
      }

      const query = `DELETE FROM favoritos WHERE producto_id = ? OR nombre = ?`;

      try {
        await this.dbInstance.executeSql(query, [producto.id || 0, producto.nombre]);
        console.log('Producto eliminado de favoritos:', producto.nombre);
        return true;
      } catch (error) {
        console.error('Error al eliminar producto de favoritos:', error);
        return false;
      }
    }
  }

  async obtenerFavoritos(): Promise<Producto[]> {
    if (this.isBrowser()) {
      return [...this.mockFavoritos];
    } else {
      if (!this.dbInstance) {
        throw new Error('La instancia de la base de datos no está inicializada.');
      }

      const query = `SELECT * FROM favoritos ORDER BY fecha_agregado DESC`;

      try {
        const result = await this.dbInstance.executeSql(query, []);
        const favoritos: Producto[] = [];

        for (let i = 0; i < result.rows.length; i++) {
          const row = result.rows.item(i);
          favoritos.push({
            id: row.producto_id,
            nombre: row.nombre,
            precio: row.precio,
            imagen: row.imagen,
            descripcion: row.descripcion,
            categoria: row.categoria,
            rating: row.rating,
            cantidad: row.cantidad,
            isFavorite: true
          });
        }

        return favoritos;
      } catch (error) {
        console.error('Error al obtener favoritos:', error);
        return [];
      }
    }
  }

  async esFavorito(producto: Producto): Promise<boolean> {
    if (this.isBrowser()) {
      return this.mockFavoritos.some(p => 
        p.id === producto.id || p.nombre === producto.nombre
      );
    } else {
      if (!this.dbInstance) {
        return false;
      }

      const query = `SELECT COUNT(*) as count FROM favoritos WHERE producto_id = ? OR nombre = ?`;

      try {
        const result = await this.dbInstance.executeSql(query, [producto.id || 0, producto.nombre]);
        return result.rows.item(0).count > 0;
      } catch (error) {
        console.error('Error al verificar si es favorito:', error);
        return false;
      }
    }
  }

  async toggleFavorito(producto: Producto): Promise<boolean> {
    const esFav = await this.esFavorito(producto);
    
    if (esFav) {
      return await this.eliminarFavorito(producto);
    } else {
      return await this.agregarFavorito(producto);
    }
  }

  async limpiarFavoritos(): Promise<void> {
    if (this.isBrowser()) {
      this.mockFavoritos = [];
      this.saveMockData();
    } else {
      if (!this.dbInstance) {
        throw new Error('La instancia de la base de datos no está inicializada.');
      }

      const query = `DELETE FROM favoritos`;

      try {
        await this.dbInstance.executeSql(query, []);
        console.log('Favoritos limpiados correctamente.');
      } catch (error) {
        console.error('Error al limpiar favoritos:', error);
      }
    }
  }
}
