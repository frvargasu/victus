import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Ubicacion {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface TiendaCercana {
  id: number;
  nombre: string;
  direccion: string;
  latitude: number;
  longitude: number;
  distancia?: number;
  telefono?: string;
  horario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocalizacionService {
  
  // Tiendas de ejemplo - en una app real vendrían de una API
  private tiendasMock: TiendaCercana[] = [
    {
      id: 1,
      nombre: 'TechStore Centro',
      direccion: 'Av. Principal 123, Santiago Centro',
      latitude: -33.4569,
      longitude: -70.6483,
      telefono: '+56 9 1234 5678',
      horario: '09:00 - 20:00'
    },
    {
      id: 2,
      nombre: 'TechStore Providencia',
      direccion: 'Av. Providencia 456, Providencia',
      latitude: -33.4372,
      longitude: -70.6506,
      telefono: '+56 9 8765 4321',
      horario: '10:00 - 21:00'
    },
    {
      id: 3,
      nombre: 'TechStore Las Condes',
      direccion: 'Av. Apoquindo 789, Las Condes',
      latitude: -33.4088,
      longitude: -70.5779,
      telefono: '+56 9 5555 1234',
      horario: '09:30 - 21:30'
    },
    {
      id: 4,
      nombre: 'TechStore Ñuñoa',
      direccion: 'Av. Irarrázaval 321, Ñuñoa',
      latitude: -33.4557,
      longitude: -70.5973,
      telefono: '+56 9 9876 5432',
      horario: '09:00 - 19:00'
    }
  ];

  constructor() {}

  async obtenerUbicacionActual(): Promise<Ubicacion> {
    try {
      const permiso = await Geolocation.requestPermissions();
      
      if (permiso.location !== 'granted') {
        throw new Error('Permisos de geolocalización denegados');
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      // Ubicación por defecto (Santiago, Chile)
      return {
        latitude: -33.4489,
        longitude: -70.6693,
        accuracy: 0,
        timestamp: Date.now()
      };
    }
  }

  async obtenerTiendasCercanas(ubicacionUsuario: Ubicacion, radioKm: number = 10): Promise<TiendaCercana[]> {
    const tiendasConDistancia = this.tiendasMock.map(tienda => {
      const distancia = this.calcularDistancia(
        ubicacionUsuario.latitude,
        ubicacionUsuario.longitude,
        tienda.latitude,
        tienda.longitude
      );
      
      return {
        ...tienda,
        distancia: distancia
      };
    });

    // Filtrar por radio y ordenar por distancia
    return tiendasConDistancia
      .filter(tienda => tienda.distancia! <= radioKm)
      .sort((a, b) => a.distancia! - b.distancia!);
  }

  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  async verificarPermisosUbicacion(): Promise<boolean> {
    try {
      const permiso = await Geolocation.checkPermissions();
      return permiso.location === 'granted';
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  async solicitarPermisosUbicacion(): Promise<boolean> {
    try {
      const permiso = await Geolocation.requestPermissions();
      return permiso.location === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  // Método para obtener dirección desde coordenadas (necesitaría una API de geocodificación)
  async obtenerDireccionDesdeCoordenadas(lat: number, lng: number): Promise<string> {
    // En una implementación real, usarías una API como Google Geocoding
    // Por ahora retornamos una dirección genérica
    return `Ubicación aproximada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  // Generar URL para Google Maps
  generarURLGoogleMaps(lat: number, lng: number, destino?: string): string {
    if (destino) {
      return `https://www.google.com/maps/dir/${lat},${lng}/${destino}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
}
