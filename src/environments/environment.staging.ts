export const environment = {
  production: false,
  
  // Configuración de API
  apiUrl: 'https://staging-api.victus.app/v1',
  apiTimeout: 12000,
  
  // Configuración de logging
  enableLogging: true,
  logLevel: 'info',
  
  // Configuración multiplataforma
  platform: {
    name: 'staging',
    web: {
      enablePWA: true,
      serviceWorker: true
    },
    android: {
      enableDebugging: true,
      allowMixedContent: false,
      enableHardwareAcceleration: true
    },
    ios: {
      enableDebugging: true,
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
    name: 'victus_staging',
    version: 1,
    enableSQLiteEncryption: true
  }
};
