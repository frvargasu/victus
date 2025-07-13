import { Component } from '@angular/core';
import { CarritoService } from '../services/carrito.service';
import { StorageService } from '../services/storage.service';
import { Producto } from '../models/producto';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController, ActionSheetController, ModalController, ToastController } from '@ionic/angular';
import { CurrencyClpPipe } from '../pipes/currency-clp.pipe';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CurrencyClpPipe],
})
export class CarritoPage {
  tieneCodigoAplicado = false;
  codigoDescuentoAplicado = '';
  
  constructor(
    public carritoService: CarritoService, 
    private storageService: StorageService,
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  obtenerCarrito(): Producto[] {
    return this.carritoService.obtenerCarrito();
  }

  obtenerTotal(): number {
    return this.carritoService.obtenerTotal();
  }

  obtenerSubtotal(): number {
    return this.carritoService.obtenerTotal() + this.obtenerDescuento();
  }

  obtenerDescuento(): number {
    const subtotal = this.carritoService.obtenerTotal();
    let descuento = 0;
    
    // Descuento del 10% si el subtotal es mayor a $20,000
    if (subtotal > 20000) {
      descuento += Math.round(subtotal * 0.1);
    }
    
    // Descuento adicional por código
    if (this.tieneCodigoAplicado) {
      descuento += Math.round(subtotal * 0.05); // 5% adicional
    }
    
    return descuento;
  }

  obtenerCostoEnvio(): number {
    const subtotal = this.carritoService.obtenerTotal();
    // Envío gratis si es mayor a $25,000
    return subtotal > 25000 ? 0 : 3000;
  }

  obtenerImpuestos(): number {
    // IVA 19% sobre el subtotal con descuento
    const base = this.carritoService.obtenerTotal() - this.obtenerDescuento();
    return Math.round(base * 0.19);
  }

  obtenerAhorroTotal(): number {
    return this.obtenerDescuento() + (this.obtenerCostoEnvio() === 0 ? 3000 : 0);
  }

  obtenerCantidadTotal(): number {
    return this.carritoService.obtenerCantidadTotal();
  }

  async agregarProducto(producto: Producto): Promise<void> {
    await this.carritoService.agregarAlCarrito(producto);
  }

  async quitarProducto(nombre: string): Promise<void> {
    await this.carritoService.quitarDelCarrito(nombre);
  }

  async eliminarProducto(nombre: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este producto del carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.carritoService.eliminarProductoCompleto(nombre);
            await this.mostrarToast('Producto eliminado del carrito');
          }
        }
      ]
    });
    await alert.present();
  }

  async limpiarCarrito(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Vaciar carrito',
      message: '¿Estás seguro de que quieres vaciar todo el carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Vaciar',
          role: 'destructive',
          handler: async () => {
            await this.carritoService.limpiarCarrito();
            await this.mostrarToast('Carrito vaciado');
          }
        }
      ]
    });
    await alert.present();
  }

  async actualizarCantidad(nombre: string, cantidad: number): Promise<void> {
    await this.carritoService.actualizarCantidad(nombre, cantidad);
  }

  trackByProducto(index: number, producto: Producto): string {
    return producto.nombre;
  }

  continuarComprando(): void {
    this.router.navigate(['/']);
  }

  explorarProductos(): void {
    this.router.navigate(['/productos']);
  }

  async mostrarOpcionesPago(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Selecciona tu método de pago',
      subHeader: `Total a pagar: ${this.obtenerTotal().toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}`,
      cssClass: 'payment-options-action-sheet',
      buttons: [
        {
          text: 'Tarjeta de Crédito/Débito',
          icon: 'card',
          handler: () => {
            this.mostrarFormularioTarjeta();
          }
        },
        {
          text: 'PayPal',
          icon: 'logo-paypal',
          handler: () => {
            this.procesarPago('paypal');
          }
        },
        {
          text: 'Transferencia Bancaria',
          icon: 'card-outline',
          handler: () => {
            this.mostrarDatosTransferencia();
          }
        },
        {
          text: 'Pago en Efectivo (Contraentrega)',
          icon: 'cash',
          handler: () => {
            this.procesarPago('efectivo');
          }
        },
        {
          text: 'Pago con Criptomonedas',
          icon: 'logo-bitcoin',
          handler: () => {
            this.procesarPago('crypto');
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

  async mostrarFormularioTarjeta(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Datos de la tarjeta',
      message: 'Ingresa los datos de tu tarjeta de crédito o débito',
      inputs: [
        {
          name: 'numero',
          type: 'text',
          placeholder: '1234 5678 9012 3456',
          attributes: {
            maxlength: 19
          }
        },
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del titular'
        },
        {
          name: 'expiracion',
          type: 'text',
          placeholder: 'MM/YY',
          attributes: {
            maxlength: 5
          }
        },
        {
          name: 'cvv',
          type: 'password',
          placeholder: 'CVV',
          attributes: {
            maxlength: 4
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Procesar pago',
          handler: (data) => {
            if (this.validarDatosTarjeta(data)) {
              this.procesarPagoTarjeta(data);
              return true;
            } else {
              this.mostrarToast('Por favor completa todos los campos', 'danger');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarDatosTransferencia(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Datos para transferencia',
      message: `
        <div style="text-align: left; margin: 10px 0;">
          <strong>Banco:</strong> Banco de Chile<br>
          <strong>Cuenta:</strong> 12345678<br>
          <strong>RUT:</strong> 12.345.678-9<br>
          <strong>Nombre:</strong> Victus S.A.<br>
          <strong>Tipo:</strong> Cuenta Corriente<br>
          <strong>Monto:</strong> ${this.obtenerTotal().toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
        </div>
      `,
      buttons: [
        {
          text: 'Copiar datos',
          handler: () => {
            this.copiarDatosTransferencia();
          }
        },
        {
          text: 'Continuar',
          handler: () => {
            this.procesarPago('transferencia');
          }
        }
      ]
    });
    await alert.present();
  }

  validarDatosTarjeta(datos: any): boolean {
    return datos.numero && datos.nombre && datos.expiracion && datos.cvv;
  }

  async copiarDatosTransferencia(): Promise<void> {
    const datos = `
Banco: Banco de Chile
Cuenta: 12345678
RUT: 12.345.678-9
Nombre: Victus S.A.
Tipo: Cuenta Corriente
Monto: ${this.obtenerTotal().toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
    `;
    
    try {
      await navigator.clipboard.writeText(datos);
      await this.mostrarToast('Datos copiados al portapapeles', 'success');
    } catch (error) {
      await this.mostrarToast('No se pudieron copiar los datos', 'warning');
    }
  }

  async procesarPago(metodoPago: string): Promise<void> {
    const metodosInfo = {
      'tarjeta': {
        titulo: 'Pago con Tarjeta',
        mensaje: 'Serás redirigido a la pasarela de pago segura',
        icono: 'card'
      },
      'paypal': {
        titulo: 'Pago con PayPal',
        mensaje: 'Serás redirigido a PayPal para completar el pago',
        icono: 'logo-paypal'
      },
      'transferencia': {
        titulo: 'Transferencia Bancaria',
        mensaje: 'Confirma tu pedido y te enviaremos los datos bancarios',
        icono: 'card-outline'
      },
      'efectivo': {
        titulo: 'Pago en Efectivo',
        mensaje: 'Pagarás en efectivo al recibir tu pedido',
        icono: 'cash'
      },
      'crypto': {
        titulo: 'Pago con Criptomonedas',
        mensaje: 'Acepta Bitcoin, Ethereum y otras criptomonedas',
        icono: 'logo-bitcoin'
      }
    };

    const info = metodosInfo[metodoPago as keyof typeof metodosInfo];
    
    const alert = await this.alertController.create({
      header: info.titulo,
      message: info.mensaje,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Continuar',
          handler: () => {
            this.irAConfirmacion(metodoPago);
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarPagoTarjeta(datosTarjeta: any): Promise<void> {
    // Simular procesamiento de pago con tarjeta
    const alert = await this.alertController.create({
      header: 'Procesando pago...',
      message: 'Tu pago está siendo procesado de forma segura',
      buttons: [
        {
          text: 'Continuar',
          handler: () => {
            this.irAConfirmacion('tarjeta');
          }
        }
      ]
    });
    await alert.present();
  }

  irAConfirmacion(metodoPago?: string): void {
    const total = this.obtenerTotal();
    const productos = this.obtenerCarrito();
    const navigationExtras: NavigationExtras = {
      state: {
        total: total,
        productos: productos,
        metodoPago: metodoPago || 'tarjeta',
        descuento: this.obtenerDescuento(),
        costoEnvio: this.obtenerCostoEnvio(),
        subtotal: this.obtenerSubtotal()
      },
    };
    this.router.navigate(['/confirmacion'], navigationExtras);
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  // Métodos para detalles de productos
  tieneDescuento(producto: Producto): boolean {
    // Simular productos con descuento
    return producto.precio > 15000;
  }

  getDescuentoProducto(producto: Producto): number {
    return this.tieneDescuento(producto) ? 15 : 0;
  }

  getAhorroProducto(producto: Producto): number {
    return this.tieneDescuento(producto) ? Math.round(producto.precio * 0.15) : 0;
  }

  isLowStock(producto: Producto): boolean {
    // Simular stock bajo para algunos productos
    return (producto.cantidad || 0) > 3;
  }

  getStockMessage(producto: Producto): string {
    if (this.isLowStock(producto)) {
      return 'Solo quedan pocos';
    }
    return 'En stock';
  }

  isProductoNuevo(producto: Producto): boolean {
    // Simular productos nuevos
    return producto.nombre.toLowerCase().includes('nuevo') || Math.random() > 0.7;
  }

  isProductoPopular(producto: Producto): boolean {
    // Simular productos populares
    return producto.precio > 20000 || Math.random() > 0.8;
  }

  tieneEnvioGratis(producto: Producto): boolean {
    // Productos con envío gratis
    return producto.precio > 15000;
  }

  async mostrarCodigoDescuento(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Código de descuento',
      message: 'Ingresa tu código de descuento para obtener beneficios adicionales',
      inputs: [
        {
          name: 'codigo',
          type: 'text',
          placeholder: 'Ej: DESCUENTO10'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aplicar',
          handler: (data) => {
            this.aplicarCodigoDescuento(data.codigo);
          }
        }
      ]
    });
    await alert.present();
  }

  async aplicarCodigoDescuento(codigo: string): Promise<void> {
    if (!codigo || codigo.trim() === '') {
      await this.mostrarToast('Por favor ingresa un código válido', 'warning');
      return;
    }

    // Simular códigos válidos
    const codigosValidos = ['DESCUENTO10', 'BIENVENIDO', 'PROMO5', 'NUEVO'];
    
    if (codigosValidos.includes(codigo.toUpperCase())) {
      this.tieneCodigoAplicado = true;
      this.codigoDescuentoAplicado = codigo.toUpperCase();
      await this.mostrarToast(`¡Código ${codigo} aplicado correctamente!`, 'success');
    } else {
      await this.mostrarToast('Código de descuento inválido', 'danger');
    }
  }

  async guardarParaLuego(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Guardar carrito',
      message: '¿Deseas guardar estos productos para comprarlos más tarde?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.storageService.set('carrito_guardado', this.obtenerCarrito());
            await this.mostrarToast('Carrito guardado exitosamente', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  async compartirCarrito(): Promise<void> {
    const productos = this.obtenerCarrito();
    const total = this.obtenerTotal();
    
    const mensaje = `¡Mira lo que tengo en mi carrito! 
${productos.length} productos por ${total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi carrito de compras',
          text: mensaje,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      await this.mostrarToast('Función de compartir no disponible', 'warning');
    }
  }
}