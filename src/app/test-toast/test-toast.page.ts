import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ToastService } from '../services/toast.service';
import { CarritoService } from '../services/carrito.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-test-toast',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Test Toasts</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <h2>Probar Toasts de Capacitor</h2>
      
      <ion-button expand="block" (click)="testToastCarrito()" color="primary">
        🛒 Test Toast Carrito
      </ion-button>
      
      <ion-button expand="block" (click)="testToastFavorito()" color="danger">
        ❤️ Test Toast Favorito
      </ion-button>
      
      <ion-button expand="block" (click)="testToastExito()" color="success">
        ✅ Test Toast Éxito
      </ion-button>
      
      <ion-button expand="block" (click)="testToastError()" color="warning">
        ❌ Test Toast Error
      </ion-button>
      
      <ion-button expand="block" (click)="testToastInfo()" color="medium">
        ℹ️ Test Toast Info
      </ion-button>
      
      <ion-button expand="block" (click)="testAgregarProducto()" color="tertiary">
        🛍️ Test Agregar Producto Real
      </ion-button>
      
      <div class="info-section">
        <h3>Información:</h3>
        <p>• En navegador: Ve toasts personalizados</p>
        <p>• En Android: Ve toasts nativos del sistema</p>
        <p>• Duración: 2-3 segundos</p>
        <p>• Posición: Parte inferior</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .info-section {
      margin-top: 30px;
      padding: 16px;
      background: var(--ion-color-light);
      border-radius: 8px;
      border-left: 4px solid var(--ion-color-primary);
    }
    .info-section h3 {
      color: var(--ion-color-primary);
      margin-bottom: 10px;
    }
    ion-button {
      margin: 8px 0;
    }
  `],
  standalone: true,
  imports: [IonicModule]
})
export class TestToastPage {

  constructor(
    private toastService: ToastService,
    private carritoService: CarritoService
  ) {}

  async testToastCarrito() {
    await this.toastService.mostrarToastCarrito('iPhone 13 Pro', 1);
  }

  async testToastFavorito() {
    await this.toastService.mostrarToastFavorito('MacBook Air', true);
  }

  async testToastExito() {
    await this.toastService.mostrarToastExito('Operación completada');
  }

  async testToastError() {
    await this.toastService.mostrarToastError('Algo salió mal');
  }

  async testToastInfo() {
    await this.toastService.mostrarToastInfo('Información importante');
  }

  async testAgregarProducto() {
    const productoTest: Producto = {
      nombre: 'Producto de Prueba',
      precio: 29990,
      descripcion: 'Un producto para probar el toast',
      imagen: 'assets/img/placeholder.jpg',
      categoria: 'Test'
    };
    
    await this.carritoService.agregarAlCarrito(productoTest);
  }
}
