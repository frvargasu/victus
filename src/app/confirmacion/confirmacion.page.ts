import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Producto } from '../models/producto';
import { CarritoService } from '../services/carrito.service';
import { CurrencyClpPipe } from '../pipes/currency-clp.pipe';

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.page.html',
  styleUrls: ['./confirmacion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CurrencyClpPipe],
})
export class ConfirmacionPage implements OnInit {
  total: number = 0;
  subtotal: number = 0;
  descuento: number = 0;
  costoEnvio: number = 0;
  productos: Producto[] = [];
  metodoPago: string = 'tarjeta';
  
  // Datos de entrega (simula datos del usuario)
  nombreCompleto: string = 'Juan Pérez';
  direccion: string = 'Av. Providencia 1234, Providencia, Santiago';
  telefono: string = '+56 9 1234 5678';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private carritoService: CarritoService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.total = navigation.extras.state['total'] || 0;
      this.productos = navigation.extras.state['productos'] || [];
      this.metodoPago = navigation.extras.state['metodoPago'] || 'tarjeta';
      this.subtotal = navigation.extras.state['subtotal'] || 0;
      this.descuento = navigation.extras.state['descuento'] || 0;
      this.costoEnvio = navigation.extras.state['costoEnvio'] || 0;
    }
  }

  ngOnInit(): void {
    // Si no hay productos, redirigir al carrito
    if (!this.productos || this.productos.length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  getPaymentIcon(): string {
    const icons: { [key: string]: string } = {
      'tarjeta': 'card',
      'paypal': 'logo-paypal',
      'transferencia': 'card-outline',
      'efectivo': 'cash'
    };
    return icons[this.metodoPago] || 'card';
  }

  getPaymentTitle(): string {
    const titles: { [key: string]: string } = {
      'tarjeta': 'Tarjeta de Crédito/Débito',
      'paypal': 'PayPal',
      'transferencia': 'Transferencia Bancaria',
      'efectivo': 'Pago en Efectivo'
    };
    return titles[this.metodoPago] || 'Tarjeta de Crédito/Débito';
  }

  getPaymentDescription(): string {
    const descriptions: { [key: string]: string } = {
      'tarjeta': 'Pago seguro con tarjeta de crédito o débito',
      'paypal': 'Pago rápido y seguro con PayPal',
      'transferencia': 'Transferencia bancaria directa',
      'efectivo': 'Pago al momento de la entrega'
    };
    return descriptions[this.metodoPago] || 'Pago seguro procesado';
  }

  getTiempoEntrega(): string {
    if (this.metodoPago === 'efectivo') {
      return '2-3 días hábiles';
    } else if (this.costoEnvio === 0) {
      return '1-2 días hábiles (Envío gratis)';
    } else {
      return '2-4 días hábiles';
    }
  }

  puedeConfirmar(): boolean {
    return this.productos.length > 0 && this.total > 0;
  }

  async cambiarMetodoPago(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar Método de Pago',
      buttons: [
        {
          text: 'Tarjeta de Crédito/Débito',
          icon: 'card',
          handler: () => {
            this.metodoPago = 'tarjeta';
          }
        },
        {
          text: 'PayPal',
          icon: 'logo-paypal',
          handler: () => {
            this.metodoPago = 'paypal';
          }
        },
        {
          text: 'Transferencia Bancaria',
          icon: 'card-outline',
          handler: () => {
            this.metodoPago = 'transferencia';
          }
        },
        {
          text: 'Pago en Efectivo',
          icon: 'cash',
          handler: () => {
            this.metodoPago = 'efectivo';
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async editarDatosEntrega(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Editar Datos de Entrega',
      message: 'Esta funcionalidad estará disponible próximamente',
      buttons: ['OK']
    });
    await alert.present();
  }

  volverAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  async confirmarPedido(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Procesando pedido...',
      duration: 2000
    });
    await loading.present();

    // Simular procesamiento
    setTimeout(async () => {
      await loading.dismiss();
      
      // Limpiar carrito
      await this.carritoService.limpiarCarrito();
      
      // Mostrar confirmación
      const alert = await this.alertController.create({
        header: '¡Pedido Confirmado!',
        message: `Tu pedido por ${this.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} ha sido procesado exitosamente.`,
        buttons: [
          {
            text: 'Ver Pedidos',
            handler: () => {
              this.router.navigate(['/']);
            }
          },
          {
            text: 'Continuar Comprando',
            handler: () => {
              this.router.navigate(['/']);
            }
          }
        ]
      });
      await alert.present();
      
      // Toast de éxito
      const toast = await this.toastController.create({
        message: '¡Gracias por tu compra! Recibirás un email de confirmación.',
        duration: 4000,
        position: 'top',
        color: 'success',
        buttons: [
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
      
    }, 2000);
  }
}