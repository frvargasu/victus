export const environment = {
  production: true,
  
  // Configuración de API
  apiUrl: 'https://api.victus.app/v1',
  apiTimeout: 15000,
  
  // Configuración de logging
  enableLogging: false,
  logLevel: 'error',
  
  // Configuración multiplataforma
  platform: {
    name: 'production',
    web: {
      enablePWA: true,
      serviceWorker: true
    },
    android: {
      enableDebugging: false,
      allowMixedContent: false,
      enableHardwareAcceleration: true
    },
    ios: {
      enableDebugging: false,
      allowsLinkPreview: false,
      scrollEnabled: true
    }
  },
  
  // Configuración de características
  features: {
    geolocation: true,
    camera: true,
    notifications: true,
    biometric: true,
    analytics: true
  },
  
  // Configuración de base de datos
  database: {
    name: 'victus_prod',
    version: 1,
    enableSQLiteEncryption: true
  }
};
