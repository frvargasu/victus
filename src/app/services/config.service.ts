import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

export interface PlatformConfig {
  name: string;
  isNative: boolean;
  isWeb: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  version: string;
  features: {
    geolocation: boolean;
    camera: boolean;
    notifications: boolean;
    biometric: boolean;
    analytics: boolean;
  };
  database: {
    name: string;
    version: number;
    enableSQLiteEncryption: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config!: PlatformConfig;

  constructor(private platform: Platform) {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    const platformName = this.getCurrentPlatform();
    
    this.config = {
      name: platformName,
      isNative: Capacitor.isNativePlatform(),
      isWeb: Capacitor.getPlatform() === 'web',
      isAndroid: Capacitor.getPlatform() === 'android',
      isIOS: Capacitor.getPlatform() === 'ios',
      version: this.getAppVersion(),
      features: environment.features,
      database: environment.database
    };
  }

  private getCurrentPlatform(): string {
    if (Capacitor.getPlatform() === 'android') {
      return 'android';
    } else if (Capacitor.getPlatform() === 'ios') {
      return 'ios';
    } else {
      return 'web';
    }
  }

  private getAppVersion(): string {
    // En producción, esto vendría del package.json o build
    return '1.0.0';
  }

  // Getters para acceder a la configuración
  get platformConfig(): PlatformConfig {
    return this.config;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  get apiTimeout(): number {
    return environment.apiTimeout;
  }

  get enableLogging(): boolean {
    return environment.enableLogging;
  }

  get logLevel(): string {
    return environment.logLevel;
  }

  get isProduction(): boolean {
    return environment.production;
  }

  get isDevelopment(): boolean {
    return !environment.production;
  }

  // Métodos para verificar plataforma
  isAndroid(): boolean {
    return this.config.isAndroid;
  }

  isIOS(): boolean {
    return this.config.isIOS;
  }

  isWeb(): boolean {
    return this.config.isWeb;
  }

  isNative(): boolean {
    return this.config.isNative;
  }

  // Métodos para verificar características
  hasFeature(feature: keyof PlatformConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Configuración específica por plataforma
  getPlatformSpecificConfig(): any {
    const platformName = this.getCurrentPlatform();
    return environment.platform[platformName as keyof typeof environment.platform] || {};
  }

  // Configuración de base de datos
  getDatabaseConfig(): PlatformConfig['database'] {
    return this.config.database;
  }

  // Logging condicional
  log(message: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.enableLogging) return;
    
    const logLevels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = logLevels.indexOf(this.logLevel);
    const messageLevelIndex = logLevels.indexOf(level);
    
    if (messageLevelIndex >= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      const platformInfo = `[${this.config.name.toUpperCase()}]`;
      
      switch (level) {
        case 'debug':
          console.debug(`${timestamp} ${platformInfo} DEBUG:`, message);
          break;
        case 'info':
          console.info(`${timestamp} ${platformInfo} INFO:`, message);
          break;
        case 'warn':
          console.warn(`${timestamp} ${platformInfo} WARN:`, message);
          break;
        case 'error':
          console.error(`${timestamp} ${platformInfo} ERROR:`, message);
          break;
      }
    }
  }

  // Obtener información del entorno
  getEnvironmentInfo(): any {
    return {
      platform: this.config.name,
      version: this.config.version,
      isProduction: this.isProduction,
      features: this.config.features,
      apiUrl: this.apiUrl,
      timestamp: new Date().toISOString()
    };
  }
}
