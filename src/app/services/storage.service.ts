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
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Métodos para el carrito
  async guardarCarrito(productos: Producto[]): Promise<void> {
    await this._storage?.set(this.CARRITO_KEY, productos);
  }

  async obtenerCarrito(): Promise<Producto[]> {
    const carrito = await this._storage?.get(this.CARRITO_KEY);
    return carrito || [];
  }

  async limpiarCarrito(): Promise<void> {
    await this._storage?.remove(this.CARRITO_KEY);
  }

  // Métodos generales de storage
  async set(key: string, value: any): Promise<void> {
    await this._storage?.set(key, value);
  }

  async get(key: string): Promise<any> {
    return await this._storage?.get(key);
  }

  async remove(key: string): Promise<void> {
    await this._storage?.remove(key);
  }

  async clear(): Promise<void> {
    await this._storage?.clear();
  }

  async keys(): Promise<string[]> {
    return await this._storage?.keys() || [];
  }

  async length(): Promise<number> {
    return await this._storage?.length() || 0;
  }

  // Métodos específicos para productos favoritos
  async guardarFavoritos(productos: Producto[]): Promise<void> {
    await this._storage?.set('productos_favoritos', productos);
  }

  async obtenerFavoritos(): Promise<Producto[]> {
    const favoritos = await this._storage?.get('productos_favoritos');
    return favoritos || [];
  }

  async agregarFavorito(producto: Producto): Promise<void> {
    const favoritos = await this.obtenerFavoritos();
    const existe = favoritos.find(p => p.nombre === producto.nombre);
    
    if (!existe) {
      favoritos.push({ ...producto, isFavorite: true });
      await this.guardarFavoritos(favoritos);
    }
  }

  async quitarFavorito(nombreProducto: string): Promise<void> {
    const favoritos = await this.obtenerFavoritos();
    const filtrados = favoritos.filter(p => p.nombre !== nombreProducto);
    await this.guardarFavoritos(filtrados);
  }
}
