import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private platform: Platform) {}

  async mostrarToast(mensaje: string, duracion: 'short' | 'long' = 'short', posicion: 'top' | 'center' | 'bottom' = 'bottom') {
    try {
      await Toast.show({
        text: mensaje,
        duration: duracion,
        position: posicion
      });
    } catch (error) {
      console.error('Error al mostrar toast:', error);
      // Fallback para navegador web si hay algún problema
      this.mostrarToastFallback(mensaje);
    }
  }

  async mostrarToastExito(mensaje: string) {
    await this.mostrarToast(`✅ ${mensaje}`, 'short', 'bottom');
  }

  async mostrarToastError(mensaje: string) {
    await this.mostrarToast(`❌ ${mensaje}`, 'long', 'bottom');
  }

  async mostrarToastInfo(mensaje: string) {
    await this.mostrarToast(`ℹ️ ${mensaje}`, 'short', 'bottom');
  }

  async mostrarToastCarrito(nombreProducto: string, cantidad: number = 1) {
    const mensaje = cantidad === 1 
      ? `${nombreProducto} agregado al carrito` 
      : `${cantidad} unidades de ${nombreProducto} agregadas al carrito`;
    
    await this.mostrarToast(`🛒 ${mensaje}`, 'short', 'bottom');
  }

  async mostrarToastFavorito(nombreProducto: string, esFavorito: boolean) {
    const mensaje = esFavorito 
      ? `${nombreProducto} agregado a favoritos` 
      : `${nombreProducto} removido de favoritos`;
    
    const icono = esFavorito ? '❤️' : '🤍';
    await this.mostrarToast(`${icono} ${mensaje}`, 'short', 'bottom');
  }

  private mostrarToastFallback(mensaje: string) {
    // Fallback simple para navegador web
    console.log('Toast:', mensaje);
    
    // Crear un toast visual simple para navegador
    const toastElement = document.createElement('div');
    toastElement.textContent = mensaje;
    toastElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--ion-color-dark, #333);
      color: var(--ion-color-dark-contrast, #fff);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      max-width: 80%;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease-out;
    `;

    // Agregar animación CSS
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(styleSheet);

    document.body.appendChild(toastElement);

    // Remover después de 3 segundos
    setTimeout(() => {
      if (toastElement && toastElement.parentNode) {
        toastElement.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => {
          toastElement.remove();
          styleSheet.remove();
        }, 300);
      }
    }, 3000);
  }
}
