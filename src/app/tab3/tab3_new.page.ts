import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { DBTaskService } from '../services/DBTask.service';
import { GeolocalizacionService, Ubicacion, TiendaCercana } from '../services/geolocalizacion.service';
import { SqliteProductosService } from '../services/sqlite-productos.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  // Propiedades para autenticación
  showRegister = false;
  isLoggedIn = false;
  loginData = { email: '', password: '' };
  registerData = { email: '', password: '' };

  // Propiedades para geolocalización
  ubicacionActual: Ubicacion | null = null;
  tiendasCercanas: TiendaCercana[] = [];
  favoritosCount = 0;
  isLoadingLocation = false;
  isLoadingStores = false;
  
  // Pestañas del perfil
  selectedTab = 'perfil';

  constructor(
    private dbTaskService: DBTaskService,
    private geolocalizacionService: GeolocalizacionService,
    private sqliteProductosService: SqliteProductosService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    try {
      await this.dbTaskService.setDatabase();
      await this.dbTaskService.createTables();
      await this.cargarContadorFavoritos();
    } catch (error) {
      console.error('Error durante la inicializacion:', error);
    }
  }

  async ionViewWillEnter() {
    await this.cargarContadorFavoritos();
  }

  async cargarContadorFavoritos() {
    try {
      const favoritos = await this.sqliteProductosService.obtenerFavoritos();
      this.favoritosCount = favoritos.length;
    } catch (error) {
      console.error('Error al cargar contador de favoritos:', error);
    }
  }

  // Métodos de autenticación
  async login() {
    try {
      const isValid = await this.dbTaskService.validateUser(
        this.loginData.email, 
        this.loginData.password
      );
      
      if (isValid) {
        this.isLoggedIn = true;
        await this.mostrarToast('Inicio de sesión exitoso');
        
        // Get the user ID for session registration
        const userId = await this.dbTaskService.getUserId(this.loginData.email);
        if (userId) {
          await this.dbTaskService.registerSession(userId);
        }
      } else {
        await this.mostrarError('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      await this.mostrarError('Error al iniciar sesión');
    }
  }

  async register() {
    if (!this.registerData.email || !this.registerData.password) {
      await this.mostrarError('Por favor completa todos los campos');
      return;
    }

    try {
      // Create the user using the email as username
      const userId = await this.dbTaskService.createUser(
        this.registerData.email,
        this.registerData.password
      );
      
      await this.mostrarToast('Registro exitoso. Por favor inicia sesión.');
      this.toggleRegister();
    } catch (error) {
      console.error('Error durante el registro:', error);
      if (error instanceof Error && error.message === 'El usuario ya existe') {
        await this.mostrarError('El usuario ya existe. Por favor inicia sesión.');
      } else {
        await this.mostrarError('Error al registrar usuario');
      }
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.loginData = { email: '', password: '' };
    this.selectedTab = 'perfil';
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
    this.registerData = { email: '', password: '' };
    this.loginData = { email: '', password: '' };
  }

  // Métodos de geolocalización
  async obtenerUbicacion() {
    this.isLoadingLocation = true;
    
    const loading = await this.loadingController.create({
      message: 'Obteniendo ubicación...'
    });
    await loading.present();

    try {
      const tienePermisos = await this.geolocalizacionService.verificarPermisosUbicacion();
      
      if (!tienePermisos) {
        const permisoConcedido = await this.geolocalizacionService.solicitarPermisosUbicacion();
        if (!permisoConcedido) {
          await this.mostrarError('Se necesitan permisos de ubicación para esta función');
          this.isLoadingLocation = false;
          await loading.dismiss();
          return;
        }
      }

      this.ubicacionActual = await this.geolocalizacionService.obtenerUbicacionActual();
      await this.buscarTiendasCercanas();
      await this.mostrarToast('Ubicación obtenida correctamente');
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      await this.mostrarError('No se pudo obtener la ubicación');
    } finally {
      this.isLoadingLocation = false;
      await loading.dismiss();
    }
  }

  async buscarTiendasCercanas() {
    if (!this.ubicacionActual) {
      await this.mostrarError('Primero debes obtener tu ubicación');
      return;
    }

    this.isLoadingStores = true;
    
    try {
      this.tiendasCercanas = await this.geolocalizacionService.obtenerTiendasCercanas(
        this.ubicacionActual, 
        15 // 15 km de radio
      );
    } catch (error) {
      console.error('Error al buscar tiendas:', error);
      await this.mostrarError('Error al buscar tiendas cercanas');
    } finally {
      this.isLoadingStores = false;
    }
  }

  abrirEnGoogleMaps(tienda: TiendaCercana) {
    if (!this.ubicacionActual) return;
    
    const url = this.geolocalizacionService.generarURLGoogleMaps(
      this.ubicacionActual.latitude,
      this.ubicacionActual.longitude,
      `${tienda.latitude},${tienda.longitude}`
    );
    
    window.open(url, '_system');
  }

  async llamarTienda(tienda: TiendaCercana) {
    if (!tienda.telefono) return;
    
    window.open(`tel:${tienda.telefono}`, '_system');
  }

  // Métodos auxiliares
  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
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
