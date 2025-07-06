import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { SqliteProductosService } from '../services/sqlite-productos.service';
import { CarritoService } from '../services/carrito.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  favoritos: Producto[] = [];
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private sqliteProductosService: SqliteProductosService,
    private carritoService: CarritoService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarFavoritos();
  }

  async ionViewWillEnter() {
    // Recargar favoritos cada vez que se entra a la página
    await this.cargarFavoritos();
  }

  async cargarFavoritos() {
    this.isLoading = true;
    try {
      this.favoritos = await this.sqliteProductosService.obtenerFavoritos();
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      await this.mostrarToast('Error al cargar favoritos');
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarFavorito(producto: Producto) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas eliminar "${producto.nombre}" de tus favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const resultado = await this.sqliteProductosService.eliminarFavorito(producto);
            if (resultado) {
              await this.cargarFavoritos();
              await this.mostrarToast('Producto eliminado de favoritos');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async limpiarTodosFavoritos() {
    if (this.favoritos.length === 0) return;

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Deseas eliminar todos los productos de tus favoritos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar Todo',
          handler: async () => {
            await this.sqliteProductosService.limpiarFavoritos();
            await this.cargarFavoritos();
            await this.mostrarToast('Todos los favoritos eliminados');
          }
        }
      ]
    });
    await alert.present();
  }

  async agregarAlCarrito(producto: Producto): Promise<void> {
    await this.carritoService.agregarAlCarrito({
      nombre: producto.nombre,
      imagen: producto.imagen || '',
      precio: producto.precio,
      cantidad: 1
    });
  }

  verDetalle(producto: Producto) {
    this.router.navigate(['/detalle-producto'], {
      state: { producto }
    });
  }

  trackByFn(index: number, producto: Producto): any {
    return producto.id || producto.nombre;
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