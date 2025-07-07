import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { DBTaskService } from '../services/DBTask.service';
import { GeolocalizacionService, Ubicacion, TiendaCercana } from '../services/geolocalizacion.service';
import { SqliteProductosService } from '../services/sqlite-productos.service';
import { Producto } from '../models/producto';
import L from 'leaflet';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  // Propiedades del mapa
  private mapa: any = null;
  private marcadorUsuario: any = null;
  private marcadoresTiendas: any[] = [];
  
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

  ngAfterViewInit() {
    // Configurar iconos por defecto de Leaflet
    const iconDefault = L.icon({
      iconUrl: 'assets/leaflet/marker-icon.png',
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
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
        await this.dbTaskService.registerSession(1);
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
      const userCreated = await this.dbTaskService.createUser(
        this.registerData.email, 
        this.registerData.password
      );
      
      if (userCreated) {
        await this.mostrarToast('Registro exitoso. Por favor inicia sesión.');
        this.toggleRegister();
      } else {
        await this.mostrarError('El usuario ya existe');
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      await this.mostrarError('Error al registrar usuario');
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
      await this.inicializarMapa();
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

  // Métodos del mapa
  private async inicializarMapa() {
    if (!this.ubicacionActual || !this.mapContainer) return;

    // Esperar un poco para asegurar que el DOM esté listo
    setTimeout(() => {
      if (this.mapa) {
        this.mapa.remove();
      }

      // Crear el mapa
      this.mapa = L.map(this.mapContainer.nativeElement).setView(
        [this.ubicacionActual!.latitude, this.ubicacionActual!.longitude], 
        13
      );

      // Agregar capa de mapa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.mapa);

      // Agregar marcador del usuario
      this.agregarMarcadorUsuario();
      
      // Agregar marcadores de tiendas
      this.agregarMarcadoresTiendas();
    }, 100);
  }

  private agregarMarcadorUsuario() {
    if (!this.mapa || !this.ubicacionActual) return;

    // Icono personalizado para el usuario
    const iconoUsuario = L.divIcon({
      html: '<div style="background-color: #3880ff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
      iconSize: [20, 20],
      className: 'custom-div-icon'
    });

    this.marcadorUsuario = L.marker(
      [this.ubicacionActual.latitude, this.ubicacionActual.longitude],
      { icon: iconoUsuario }
    ).addTo(this.mapa);

    this.marcadorUsuario.bindPopup('Tu ubicación actual').openPopup();
  }

  private agregarMarcadoresTiendas() {
    if (!this.mapa) return;

    // Limpiar marcadores existentes
    this.marcadoresTiendas.forEach(marcador => {
      this.mapa!.removeLayer(marcador);
    });
    this.marcadoresTiendas = [];

    // Agregar marcadores de tiendas
    this.tiendasCercanas.forEach(tienda => {
      const iconoTienda = L.divIcon({
        html: '<div style="background-color: #10dc60; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>',
        iconSize: [16, 16],
        className: 'custom-div-icon'
      });

      const marcador = L.marker(
        [tienda.latitude, tienda.longitude],
        { icon: iconoTienda }
      ).addTo(this.mapa!);

      marcador.bindPopup(`
        <strong>${tienda.nombre}</strong><br>
        ${tienda.direccion}<br>
        <small>${tienda.distancia?.toFixed(1)} km de distancia</small>
      `);

      this.marcadoresTiendas.push(marcador);
    });
  }

  // Método para cuando se cambia de pestaña
  onTabChange() {
    if (this.selectedTab === 'ubicacion' && this.ubicacionActual && !this.mapa) {
      setTimeout(() => {
        this.inicializarMapa();
      }, 200);
    }
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
