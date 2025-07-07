import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private readonly CARRITO_KEY = 'carrito_productos';

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    console.time('🔧 Inicialización del Storage');
    const storage = await this.storage.create();
    this._storage = storage;
    console.timeEnd('🔧 Inicialización del Storage');
    console.log('✅ Storage inicializado correctamente');
  }

  // Métodos para el carrito
  async guardarCarrito(productos: Producto[]): Promise<void> {
    console.time(`💾 Guardar carrito (${productos.length} productos)`);
    await this._storage?.set(this.CARRITO_KEY, productos);
    console.timeEnd(`💾 Guardar carrito (${productos.length} productos)`);
  }

  async obtenerCarrito(): Promise<Producto[]> {
    console.time('📦 Obtener carrito');
    const carrito = await this._storage?.get(this.CARRITO_KEY);
    const resultado = carrito || [];
    console.timeEnd('📦 Obtener carrito');
    console.log(`📊 Productos en carrito: ${resultado.length}`);
    return resultado;
  }

  async limpiarCarrito(): Promise<void> {
    console.time('🗑️ Limpiar carrito');
    await this._storage?.remove(this.CARRITO_KEY);
    console.timeEnd('🗑️ Limpiar carrito');
  }

  // Métodos generales de storage
  async set(key: string, value: any): Promise<void> {
    console.time(`💾 Storage SET: "${key}"`);
    await this._storage?.set(key, value);
    console.timeEnd(`💾 Storage SET: "${key}"`);
  }

  async get(key: string): Promise<any> {
    console.time(`📦 Storage GET: "${key}"`);
    const resultado = await this._storage?.get(key);
    console.timeEnd(`📦 Storage GET: "${key}"`);
    return resultado;
  }

  async remove(key: string): Promise<void> {
    console.time(`🗑️ Storage REMOVE: "${key}"`);
    await this._storage?.remove(key);
    console.timeEnd(`🗑️ Storage REMOVE: "${key}"`);
  }

  async clear(): Promise<void> {
    console.time('🗑️ Storage CLEAR ALL');
    await this._storage?.clear();
    console.timeEnd('🗑️ Storage CLEAR ALL');
  }

  async keys(): Promise<string[]> {
    console.time('🔑 Storage KEYS');
    const keys = await this._storage?.keys() || [];
    console.timeEnd('🔑 Storage KEYS');
    console.log(`📊 Claves encontradas: ${keys.length}`);
    return keys;
  }

  async length(): Promise<number> {
    console.time('📏 Storage LENGTH');
    const length = await this._storage?.length() || 0;
    console.timeEnd('📏 Storage LENGTH');
    console.log(`📊 Elementos en storage: ${length}`);
    return length;
  }

  // Métodos específicos para productos favoritos
  async guardarFavoritos(productos: Producto[]): Promise<void> {
    console.time(`⭐ Guardar favoritos (${productos.length} productos)`);
    await this._storage?.set('productos_favoritos', productos);
    console.timeEnd(`⭐ Guardar favoritos (${productos.length} productos)`);
  }

  async obtenerFavoritos(): Promise<Producto[]> {
    console.time('⭐ Obtener favoritos');
    const favoritos = await this._storage?.get('productos_favoritos');
    const resultado = favoritos || [];
    console.timeEnd('⭐ Obtener favoritos');
    console.log(`📊 Favoritos encontrados: ${resultado.length}`);
    return resultado;
  }

  async agregarFavorito(producto: Producto): Promise<void> {
    console.time(`⭐ Agregar favorito: "${producto.nombre}"`);
    
    console.time('📦 Cargar favoritos existentes');
    const favoritos = await this.obtenerFavoritos();
    console.timeEnd('📦 Cargar favoritos existentes');
    
    const existe = favoritos.find(p => p.nombre === producto.nombre);
    
    if (!existe) {
      console.time('💾 Guardar favorito actualizado');
      favoritos.push({ ...producto, isFavorite: true });
      await this.guardarFavoritos(favoritos);
      console.timeEnd('💾 Guardar favorito actualizado');
      console.log(`✅ Producto "${producto.nombre}" agregado a favoritos`);
    } else {
      console.log(`ℹ️ Producto "${producto.nombre}" ya está en favoritos`);
    }
    
    console.timeEnd(`⭐ Agregar favorito: "${producto.nombre}"`);
  }

  async quitarFavorito(nombreProducto: string): Promise<void> {
    console.time(`❌ Quitar favorito: "${nombreProducto}"`);
    
    console.time('📦 Cargar favoritos existentes');
    const favoritos = await this.obtenerFavoritos();
    console.timeEnd('📦 Cargar favoritos existentes');
    
    const favoritosOriginales = favoritos.length;
    const filtrados = favoritos.filter(p => p.nombre !== nombreProducto);
    
    if (filtrados.length < favoritosOriginales) {
      console.time('💾 Guardar favoritos filtrados');
      await this.guardarFavoritos(filtrados);
      console.timeEnd('💾 Guardar favoritos filtrados');
      console.log(`✅ Producto "${nombreProducto}" eliminado de favoritos`);
    } else {
      console.log(`ℹ️ Producto "${nombreProducto}" no estaba en favoritos`);
    }
    
    console.timeEnd(`❌ Quitar favorito: "${nombreProducto}"`);
  }
}
